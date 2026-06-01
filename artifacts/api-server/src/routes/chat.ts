import { Router, type Response } from "express";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { db, buildHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getEnhancedSystemPrompt, EDIT_SYSTEM_PROMPT } from "../lib/systemPrompt";

const router = Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const PROJECTS_DIR = process.env.PROJECTS_DIR ?? join(process.cwd(), "data/projects");
const MAX_LOOPS = 10;

// ── Model ──────────────────────────────────────────────────────────────────────
// GPT only (131k context). Override via MODEL_AGENT env var.

const GPT_MODEL = process.env.MODEL_AGENT ?? "openai/gpt-oss-120b";

const MODEL_CHAIN: string[] = [GPT_MODEL];

// HTTP status codes that count as hard failures (no retry).
const TRANSIENT_STATUSES = new Set([429, 502, 503, 504, 529]);

// ── SSE helpers ───────────────────────────────────────────────────────────────

function sseSetup(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

export function sseSend(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sseError(res: Response, message: string) {
  sseSend(res, "error", { message });
  res.end();
}

// ── Disk helpers ──────────────────────────────────────────────────────────────

export function projectDir(projectId: string): string {
  return join(PROJECTS_DIR, projectId);
}

export function writeFileToDisk(projectId: string, filePath: string, content: string): void {
  const relative = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  const fullPath = join(projectDir(projectId), relative);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
}

export function readFileFromDisk(projectId: string, filePath: string): string | null {
  const relative = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  const fullPath = join(projectDir(projectId), relative);
  if (!existsSync(fullPath)) return null;
  try { return readFileSync(fullPath, "utf-8"); } catch { return null; }
}

// ── Tool definitions ──────────────────────────────────────────────────────────

export const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "write_file",
      description:
        "Write or overwrite a file in the React project. Call this for EVERY file you create or modify. Never output code as text — always call this tool.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Absolute path: /index.html, /src/main.jsx, /src/App.jsx, /src/index.css, /src/components/Navbar.jsx …",
          },
          content: {
            type: "string",
            description: "Complete, final file content. Never truncate — write the entire file every time.",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read an existing file from the project before editing it.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
        },
        required: ["path"],
      },
    },
  },
];

// ── System prompts ────────────────────────────────────────────────────────────

export { EDIT_SYSTEM_PROMPT };
export const BUILD_SYSTEM_PROMPT = getEnhancedSystemPrompt();

// ── Streaming agent call ──────────────────────────────────────────────────────

interface ToolCallAccum {
  id: string;
  name: string;
  arguments: string;
}

interface AgentStreamResult {
  content: string;
  reasoning: string;
  toolCalls: ToolCallAccum[];
  finishReason: string;
  modelUsed: string;
}

async function callAgentStreaming(
  messages: any[],
  apiKey: string,
  forceTools: boolean,
  onText: (chunk: string) => void,
  onReasoning: (chunk: string) => void = () => {},
  modelOverride?: string,
): Promise<AgentStreamResult & { modelUsed: string }> {
  const chain = modelOverride ? [modelOverride] : MODEL_CHAIN;
  let lastErr: Error = new Error("No models available");

  for (const model of chain) {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://cloudearc.replit.app",
        "X-Title": "CloudeArc",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: AGENT_TOOLS,
        tool_choice: forceTools ? "required" : "auto",
        parallel_tool_calls: true,
        max_tokens: 32000,
        temperature: 0.2,
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const err = new Error(`OpenRouter API ${response.status} (${model}): ${body.slice(0, 300)}`);
      // Transient / model-unavailable — try the next model in the chain
      if (TRANSIENT_STATUSES.has(response.status) || response.status === 404) {
        console.warn(`[agent] model ${model} unavailable (${response.status}), trying next fallback`);
        lastErr = err;
        continue;
      }
      // Hard error (bad key, bad request, etc.) — rethrow immediately
      throw err;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    let content = "";
    let reasoning = "";
    const toolMap: Record<number, ToolCallAccum> = {};
    let finishReason = "stop";
    // Persists across ALL streaming chunks — NVIDIA sends name only on the first
    // tool call chunk (index 0); subsequent parallel tool calls omit it.
    let inheritedToolName = "";

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break outer;

        let chunk: any;
        try { chunk = JSON.parse(raw); } catch { continue; }

        const choice = chunk.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta;
        if (!delta) continue;

        // Reasoning (thinking) — stream each chunk immediately
        if (delta.reasoning) {
          reasoning += delta.reasoning;
          onReasoning(delta.reasoning);
        }

        // Text content — stream directly to caller
        if (delta.content) {
          content += delta.content;
          onText(delta.content);
        }

        // Tool call deltas — accumulate by proper index.
        // deepseek-v4-pro sends each parallel tool call with its own index (0,1,2…).
        // stepfun sent everything as a single concatenated blob into index 0.
        // Using the actual index handles both cases correctly.
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = typeof tc.index === "number" ? tc.index : 0;
            const tcName = tc.function?.name || "";
            if (tcName) inheritedToolName = tcName;

            if (!toolMap[idx]) {
              toolMap[idx] = { id: tc.id ?? `auto_${idx}`, name: tcName || inheritedToolName, arguments: "" };
            }
            if (tc.id && !toolMap[idx].id) toolMap[idx].id = tc.id;
            if (tcName && !toolMap[idx].name) toolMap[idx].name = tcName;
            if (tc.function?.arguments) toolMap[idx].arguments += tc.function.arguments;
          }
        }
      }
    }

    const toolCalls = Object.values(toolMap);
    console.log(`[agent] model=${model} finishReason=${finishReason} content=${content.length}chars reasoning=${reasoning.length}chars toolCalls=${toolCalls.length}`);
    if (toolCalls.length > 0 && toolCalls[0].arguments.length > 0) {
      const arg = toolCalls[0].arguments;
      console.log(`[agent] combined args totalLen=${arg.length}`);
    }
    return {
      content,
      reasoning,
      toolCalls,
      finishReason,
      modelUsed: model,
    };
  }

  // All models in the chain failed
  throw lastErr;
}

// ── JSON object splitter ──────────────────────────────────────────────────────
// stepfun-ai/step-3.7-flash emits all parallel tool call arguments as one
// continuous concatenated blob. Separators like `name": "write_file",
// "parameters": ` between objects confuse a naïve depth tracker.
//
// Strategy:
// 1. Use regex /\{\s*"path"\s*:/ and /\{\s*"content"\s*:/ to find every {
//    that starts a potential write_file args object — this covers {"path",
//    { "path", {\n  "path" and content-first ordering, without being tripped
//    up by separator junk.
// 2. Depth-track from each candidate { to find its matching }.
// 3. JSON.parse the slice; keep only objects with .path and .content.
// 4. Mark inner candidates that fall inside a successfully-parsed object as
//    consumed, so nested { characters inside string values are skipped.
function extractWriteFileArgs(combined: string): any[] {
  const results: any[] = [];
  const candidates = new Set<number>();

  // Find candidate start positions via regex — robust to whitespace variants
  for (const re of [/\{\s*"path"\s*:/g, /\{\s*"content"\s*:/g]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(combined)) !== null) candidates.add(m.index);
  }

  if (candidates.size === 0) {
    // No candidates — log a sample so future debugging is easier
    console.log(`[agent] extractWriteFileArgs: no anchors found in ${combined.length} chars`);
    console.log(`[agent] combined[:300]: ${combined.slice(0, 300)}`);
    return results;
  }

  const sortedStarts = [...candidates].sort((a, b) => a - b);
  const consumed = new Set<number>();

  for (const idx of sortedStarts) {
    if (consumed.has(idx)) continue;

    // Track JSON depth from this anchor to find the matching closing brace.
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let i = idx; i < combined.length; i++) {
      const ch = combined[i];
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end !== -1) {
      const piece = combined.slice(idx, end + 1);
      try {
        const parsed = JSON.parse(piece);
        if (parsed.path && parsed.content !== undefined) {
          results.push(parsed);
          // Mark all candidate positions inside this parsed object as consumed
          // so inner {"path":...} or {"content":...} hits from nested code are skipped
          for (const s of sortedStarts) {
            if (s > idx && s <= end) consumed.add(s);
          }
        }
      } catch { /* malformed — skip */ }
    }
  }
  console.log(`[agent] extractWriteFileArgs: ${candidates.size} candidates → ${results.length} files`);
  return results;
}

/** @deprecated Use extractWriteFileArgs instead — kept for reference */
function splitJSONObjects(str: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (inString) {
      if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; }
    else if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        results.push(str.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return results;
}

// ── Multi-step plan helpers ────────────────────────────────────────────────────

export function buildPhasesFromPrompt(prompt: string): Array<{ id: number; label: string }> {
  const s = prompt.toLowerCase();
  const wordCount = prompt.trim().split(/\s+/).length;
  const isComplex =
    wordCount > 8 ||
    /\b(and|with|also|including|plus|featuring|complete|full|entire|multiple|several)\b/.test(s);
  if (!isComplex) return [];

  if (/dashboard|analytics|chart|graph|metric|stat|kpi/.test(s)) {
    return [
      { id: 1, label: "Build layout foundation" },
      { id: 2, label: "Wire data & charts" },
      { id: 3, label: "Add interactions" },
    ];
  }
  if (/shop|store|product|cart|ecommerce|commerce|marketplace/.test(s)) {
    return [
      { id: 1, label: "Build structure & nav" },
      { id: 2, label: "Build product sections" },
      { id: 3, label: "Wire cart & checkout" },
    ];
  }
  if (/landing|marketing|saas|startup|company|agency/.test(s)) {
    return [
      { id: 1, label: "Build layout & structure" },
      { id: 2, label: "Fill sections & copy" },
      { id: 3, label: "Style & polish" },
    ];
  }
  if (/app|tool|calculator|tracker|manager|builder|generator/.test(s)) {
    return [
      { id: 1, label: "Scaffold app shell" },
      { id: 2, label: "Build core features" },
      { id: 3, label: "Wire state & logic" },
    ];
  }
  if (/portfolio|resume|personal|profile|showcase/.test(s)) {
    return [
      { id: 1, label: "Build layout & hero" },
      { id: 2, label: "Add sections & content" },
      { id: 3, label: "Polish & finalize" },
    ];
  }
  return [
    { id: 1, label: "Set up structure" },
    { id: 2, label: "Build components" },
    { id: 3, label: "Finalize & polish" },
  ];
}

// ── Agentic loop ──────────────────────────────────────────────────────────────

export async function runAgentLoop(
  res: Response,
  messages: any[],
  apiKey: string,
  projectId: string,
  accumulated: Record<string, string>,
  isEdit: boolean,
  phases?: Array<{ id: number; label: string }>,
): Promise<number> {
  let loop = 0;
  let filesWritten = 0;
  let thoughtEmitted = false;
  let narrativeBuffer = "";
  let narrativeTimer: ReturnType<typeof setTimeout> | null = null;
  let activeModel = MODEL_CHAIN[0];
  // Track which paths have already had a narrative chunk emitted so the same
  // file never produces a duplicate description across multiple agent loops.
  const narratedPaths = new Set<string>();

  // Flush buffered narrative text as a single SSE event
  const flushNarrative = () => {
    if (narrativeBuffer.trim()) {
      sseSend(res, "narrative", {
        text: narrativeBuffer.trim(),
        stage: filesWritten > 0 ? "building" : "planning",
      });
      narrativeBuffer = "";
    }
    if (narrativeTimer) { clearTimeout(narrativeTimer); narrativeTimer = null; }
  };

  while (loop < MAX_LOOPS) {
    loop++;

    let result: AgentStreamResult;
    try {
      result = await callAgentStreaming(
        messages,
        apiKey,
        loop > 1,    // Force tools only on continuation loops — loop 1 must plan first
        (textChunk) => {
          // Stream planning/narration text live — emit each chunk immediately so the
          // user sees the AI thinking token-by-token rather than in batched bursts.
          narrativeBuffer += textChunk;
          sseSend(res, "narrative_chunk", { text: textChunk, stage: filesWritten > 0 ? "building" : "planning" });
          if (narrativeTimer) clearTimeout(narrativeTimer);
          narrativeTimer = setTimeout(flushNarrative, 30);
        },
        (reasoningChunk) => {
          // Extended reasoning / thinking tokens — do NOT add to narrativeBuffer.
          // The thinking is shown in a collapsed ThoughtBlock via the post-loop
          // `thought` event, which uses result.reasoning. Mixing it into the
          // narrative buffer would display raw chain-of-thought to the user.
          void reasoningChunk;
        },
      );

      // Track model switches — notify the frontend when a fallback kicked in
      if (result.modelUsed !== activeModel) {
        activeModel = result.modelUsed;
        sseSend(res, "model_switch", { model: activeModel });
        console.log(`[agent] switched to fallback model: ${activeModel}`);
      } else if (loop === 1) {
        sseSend(res, "model_info", { model: activeModel });
      }
    } catch (err: any) {
      flushNarrative();
      // If files were already written in a previous loop, exit gracefully.
      // Some models (e.g. stepfun) don't support multi-turn tool continuations
      // and return 400 on the follow-up request — that's fine if work is done.
      if (filesWritten > 0) break;
      throw err;
    }

    flushNarrative();

    // Emit reasoning as thought block once
    if (!thoughtEmitted && result.reasoning) {
      thoughtEmitted = true;
      sseSend(res, "thought", {
        title: isEdit ? "Reviewing changes" : "Planning",
        phase: "planning",
        reasoning: result.reasoning.slice(0, 1000),
        strategy: "",
        insights: [],
        estimatedDuration: "—",
      });
    }

    // No tool calls returned.
    // If we already have files written, the model is done — exit cleanly.
    // If this is the first loop (narrative-only pass) and no files written yet,
    // push the narrative into history and continue — loop 2 will have forceTools=true,
    // which tells the model it MUST now use write_file rather than talking more.
    // This handles GLM-style models that always produce a text plan before tools.
    if (!result.toolCalls.length) {
      if (filesWritten > 0 || loop >= MAX_LOOPS) break;
      // If the model returned completely empty (no content, no reasoning, no tools)
      // break immediately — continuing will just repeat the same empty response.
      if (!result.content && !result.reasoning) break;
      // Narrative-only first pass — add to history and continue
      if (result.content) {
        messages.push({ role: "assistant", content: result.content });
      }
      continue;
    }

    // Normalize IDs — must be non-empty strings for tool result matching
    const normalizedCalls = result.toolCalls.map((tc, i) => ({
      ...tc,
      id: tc.id || `call_${loop}_${i}`,
    }));

    const toolResults: any[] = [];
    let hadReadFile = false;

    // ── Generate a conversational description of a file being written ─────────
    // Produces a human-readable sentence about what the file does so the
    // narrative area stays alive during the silent tool-call loops.
    const describeFileWrite = (path: string, content: string): string => {
      const name = path.split("/").pop()?.replace(/\.[jt]sx?$/, "") ?? path;
      const componentMatch = content.match(
        /export\s+(?:default\s+)?(?:function|class)\s+([A-Z][a-zA-Z]+)|const\s+([A-Z][a-zA-Z]+)\s*=/
      );
      const cName = componentMatch?.[1] ?? componentMatch?.[2];

      if (/index\.html?$/.test(path))    return "setting up the HTML shell and root mount point";
      if (/main\.[jt]sx?$/.test(path))   return "wiring up React and mounting the app into the DOM";
      if (/App\.[jt]sx?$/.test(path))    return cName ? `building ${cName}, the top-level layout` : "composing the top-level app layout";
      if (/index\.css$/.test(path))      return "writing global styles, resets, and CSS variables";
      if (/tailwind\.config/.test(path)) return "configuring the Tailwind theme — colors, fonts, and design tokens";
      if (path.includes("/components/")) return cName ? `building the ${cName} component` : `writing the ${name} component`;
      if (path.includes("/pages/"))      return cName ? `building the ${cName} page` : `writing the ${name} page`;
      if (path.includes("/hooks/"))      return `writing the ${name} custom hook`;
      if (path.includes("/utils/") || path.includes("/lib/")) return `writing ${name} utility functions`;
      if (path.includes("/store") || path.includes("/context")) return `setting up ${name} state management`;
      if (path.includes("/types") || path.endsWith(".ts")) return `defining ${name} types and interfaces`;
      return cName ? `building ${cName}` : `writing ${name}`;
    };

    // Files the model must never overwrite — they're provided by the bundler
    const PROTECTED_PATHS = new Set([
      "/package.json", "package.json",
      "/vite.config.js", "vite.config.js",
      "/vite.config.ts", "vite.config.ts",
      "/tailwind.config.js", "tailwind.config.js",
      "/tailwind.config.cjs", "tailwind.config.cjs",
      "/tailwind.config.ts", "tailwind.config.ts",
    ]);

    // Helper: emit a single parsed tool-call args object
    const processArgs = (tcName: string, tcId: string, args: any) => {
      if (tcName === "write_file") {
        const { path, content } = args as { path: string; content: string };
        if (!path || content === undefined) return;

        // Hard guard — silently skip bundler-owned config files.
        // These are pre-configured and writing them breaks the preview.
        if (PROTECTED_PATHS.has(path)) {
          console.warn(`[agent] blocked write to protected path: ${path}`);
          toolResults.push({ role: "tool", tool_call_id: tcId, content: `Skipped: ${path} is managed by the bundler.` });
          return;
        }

        const shortName = path.split("/").pop() ?? path;

        // Only emit one narrative chunk per unique file path across all loops.
        // Without this guard, if the model rewrites the same file in a later
        // loop (e.g. index.html), the same description appears repeatedly.
        if (!narratedPaths.has(path)) {
          narratedPaths.add(path);
          sseSend(res, "narrative_chunk", {
            text: `\nNow ${describeFileWrite(path, content)} (\`${shortName}\`)`,
            stage: "building",
          });
        }

        const oldContent = accumulated[path];
        accumulated[path] = content;
        writeFileToDisk(projectId, path, content);
        filesWritten++;

        // Advance multi-step plan at file count milestones
        if (phases && phases.length > 1) {
          // For 2-phase: advance at file 5; for 3-phase: advance at files 4 and 8
          const milestones = phases.length === 2 ? [5] : phases.length >= 3 ? [4, 8] : [];
          for (let mi = 0; mi < milestones.length; mi++) {
            if (filesWritten === milestones[mi] && phases[mi + 1]) {
              sseSend(res, "phase_change", { phaseId: phases[mi + 1].id });
              break;
            }
          }
        }

        sseSend(res, "stage", { message: `Writing ${shortName}…`, kind: "plan" });
        sseSend(res, "file", {
          path,
          content,
          ...(isEdit && oldContent !== undefined ? { oldContent } : {}),
        });
        toolResults.push({ role: "tool", tool_call_id: tcId, content: `Written: ${path}` });

      } else if (tcName === "read_file") {
        hadReadFile = true;
        const { path } = args as { path: string };
        const content = accumulated[path] ?? readFileFromDisk(projectId, path) ?? "File not found";
        sseSend(res, "stage", { message: `Reading ${path.split("/").pop()}…` });
        toolResults.push({ role: "tool", tool_call_id: tcId, content });
      }
    };

    for (const tc of normalizedCalls) {
      let args: any;
      let parsedOk = false;

      // Try standard single-object parse first
      try {
        args = JSON.parse(tc.arguments);
        parsedOk = true;
      } catch {
        // Fallback: stepfun streams all tool calls as one concatenated blob.
        // Use extractWriteFileArgs which anchors on {"path" to skip the
        // separator junk between objects (e.g. `name": "write_file", "parameters": `).
        const fileArgs = extractWriteFileArgs(tc.arguments);
        if (fileArgs.length > 0) {
          for (const fa of fileArgs) {
            processArgs(tc.name, tc.id, fa);
          }
          parsedOk = true; // handled via split path
        }
      }

      if (parsedOk && args !== undefined) {
        processArgs(tc.name, tc.id, args);
      }
    }

    // Always push history so the model knows what it wrote
    messages.push({
      role: "assistant",
      content: result.content || "",
      tool_calls: normalizedCalls.map((tc) => {
        let summarizedArgs = tc.arguments;
        if (tc.name === "write_file") {
          try {
            const parsed = JSON.parse(tc.arguments) as { path: string; content: string };
            summarizedArgs = JSON.stringify({ path: parsed.path, content: "[written]" });
          } catch { /* keep original on parse error */ }
        }
        return { id: tc.id, type: "function", function: { name: tc.name, arguments: summarizedArgs } };
      }),
    });
    messages.push(...toolResults);

    // Break when the model is finished:
    // - No read_file calls AND finishReason is "stop" AND we have enough files, OR
    // - No read_file calls AND finishReason is NOT "tool_calls" AND we have enough files
    //
    // For new builds require at least 4 files (index.html + main.jsx + App.jsx + CSS minimum).
    // If fewer files written and model says "stop", inject a continuation nudge so it keeps going.
    const minRequired = isEdit ? 1 : 4;
    const hasEnough = filesWritten >= minRequired;

    if (!hadReadFile && result.finishReason !== "tool_calls") {
      if (hasEnough) break;
      // Not enough files yet — nudge the model to continue
      messages.push({
        role: "user",
        content: `You have only written ${filesWritten} file(s) so far. You MUST continue and write ALL remaining required files: /src/main.jsx, /src/App.jsx, /src/index.css, and at least 2-3 component files. Do NOT stop until you have written at least 6 files total. Continue now.`,
      });
    }
  }

  return filesWritten;
}

// ── Build history helpers ──────────────────────────────────────────────────────

async function getRecentBuilds(projectId: string, limit = 5) {
  try {
    return await db
      .select()
      .from(buildHistoryTable)
      .where(eq(buildHistoryTable.projectId, projectId))
      .orderBy(desc(buildHistoryTable.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

async function saveBuild(projectId: string, userPrompt: string, filesWritten: string[], isEdit: boolean) {
  try {
    await db.insert(buildHistoryTable).values({
      projectId,
      userPrompt,
      filesWritten,
      fileCount: filesWritten.length,
      isEdit: isEdit ? 1 : 0,
    });
  } catch (err) {
    console.warn("[build-history] failed to save:", err);
  }
}

function detectUserStyle(prompt: string): "exploratory" | "decisive" | "uncertain" {
  if (/\b(maybe|perhaps|not sure|what if|try|explore|options|variations|ideas|something like)\b/i.test(prompt)) return "exploratory";
  if (/\b(quick|simple|just|fast|basic|small|easy)\b/i.test(prompt)) return "uncertain";
  return "decisive";
}

function buildSystemPromptFromHistory(
  history: Awaited<ReturnType<typeof getRecentBuilds>>,
  prompt: string,
): string {
  if (!history.length) return getEnhancedSystemPrompt();
  const last = history[0];
  return getEnhancedSystemPrompt({
    filesWritten: (last.filesWritten as string[]) ?? [],
    buildCount: history.filter((h) => !h.isEdit).length,
    editCount: history.filter((h) => h.isEdit).length,
    lastFeedback: history.find((h) => h.isEdit)?.userPrompt,
    userStyle: detectUserStyle(prompt),
  });
}

// ── POST / (mounted at /api/chat) ─────────────────────────────────────────────

router.post("/", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) { res.status(500).json({ error: "OPENROUTER_API_KEY not configured" }); return; }

  const { prompt, context, history } = req.body as {
    prompt: string;
    context?: { projectId?: string; files?: string[] };
    history?: { role: "user" | "assistant"; content: string }[];
  };

  if (!prompt?.trim()) { res.status(400).json({ error: "prompt is required" }); return; }

  const projectId = context?.projectId ?? `proj-${Date.now()}`;

  try {
    mkdirSync(projectDir(projectId), { recursive: true });
  } catch (e: any) {
    res.status(500).json({ error: `Cannot create project dir: ${e.message}` });
    return;
  }

  sseSetup(res);

  // ── Conversational bypass ───────────────────────────────────────────────────
  // Short prompts with no build intent get a quick text reply instead of the
  // full build agent loop. This prevents "Hi" / "Which model are you?" from
  // failing with "No files were generated."
  const isBuildIntent = /\b(build|create|make|write|add|design|implement|generate|show me|give me|i want|i need|page|app|site|component|feature|fix|update|change|landing|dashboard|portfolio|shop|store|form|onboarding|saas|startup|tool|calculator|tracker|manager|wizard|modal|card|button|section|layout|nav|header|footer|hero|pricing|checkout|auth|login|signup)\b/i.test(prompt);
  const isConversational = prompt.trim().split(/\s+/).length <= 10 && !isBuildIntent;

  if (isConversational) {
    try {
      const chatRes = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://cloudearc.replit.app",
          "X-Title": "CloudeArc",
        },
        body: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            { role: "system", content: "You are CloudeArc, an AI-powered app builder. Answer questions about yourself briefly and directly. You are powered by GPT. When users ask you to build something, say so and they can type a build request." },
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.7,
          stream: false,
        }),
      });
      if (chatRes.ok) {
        const json = await chatRes.json() as any;
        const reply = json.choices?.[0]?.message?.content ?? "Ask me to build something!";
        sseSend(res, "narrative", { text: reply, stage: "planning" });
        sseSend(res, "done", { templateType: "chat", fileCount: 0, projectId });
        res.end();
        return;
      }
    } catch { /* fall through to build loop on error */ }
  }

  const accumulated: Record<string, string> = {};

  // Load persistent build history from DB and build a context-aware system prompt
  const priorBuilds = await getRecentBuilds(projectId);
  const systemPrompt = buildSystemPromptFromHistory(priorBuilds, prompt);

  // Include recent conversation history so the build model has project context.
  // Cap at 8 entries to avoid bloating the context window.
  const historyMessages = (history ?? []).slice(-8);
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: prompt },
  ];

  // Generate multi-step plan for complex builds
  const phases = buildPhasesFromPrompt(prompt);
  if (phases.length > 0) {
    sseSend(res, "phases", { phases });
  }

  sseSend(res, "stage", { message: "Planning your app…" });

  try {
    const filesWritten = await runAgentLoop(res, messages, apiKey, projectId, accumulated, false, phases.length > 0 ? phases : undefined);

    // Persist this build to DB so future requests have context
    if (filesWritten > 0) {
      const writtenPaths = Object.keys(accumulated);
      await saveBuild(projectId, prompt, writtenPaths, false);
    }

    sseSend(res, "done", { templateType: "app", fileCount: filesWritten, projectId });
    res.end();
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    sseError(res, msg);
  }
});

export default router;
