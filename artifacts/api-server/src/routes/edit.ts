import { Router, type Response } from "express";
import { mkdirSync } from "fs";
import {
  projectDir,
  writeFileToDisk,
  runAgentLoop,
  sseSend as chatSseSend,
} from "./chat";
import { db, buildHistoryTable } from "@workspace/db";

async function saveEditBuild(projectId: string, userPrompt: string, filesWritten: string[]) {
  try {
    await db.insert(buildHistoryTable).values({
      projectId,
      userPrompt,
      filesWritten,
      fileCount: filesWritten.length,
      isEdit: 1,
    });
  } catch (err) {
    console.warn("[build-history] failed to save edit:", err);
  }
}

const router = Router();

function sseSetup(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

function sseSend(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sseError(res: Response, message: string) {
  sseSend(res, "error", { message });
  res.end();
}

const EDIT_SYSTEM_PROMPT = `You are CloudeArc, an expert React engineer making precise, surgical edits to an existing app.

Use read_file to inspect current file content before editing, then write_file to apply your changes.
Only modify files that actually need to change — do not rewrite unrelated files.
Always write the COMPLETE updated file — never partial content or diffs.

Quality standards:
- Preserve all existing functionality unless told otherwise
- Keep the same design language, spacing, and color scheme unless asked to change it
- Tailwind CSS for all styling, React 18 functional components`;

router.post("/", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) { res.status(500).json({ error: "OPENROUTER_API_KEY not configured" }); return; }

  const {
    prompt,
    files,
    projectId: reqProjectId,
  } = req.body as {
    prompt: string;
    files?: Record<string, string>;
    projectId?: string;
    styleProfile?: unknown;
  };

  if (!prompt?.trim()) { res.status(400).json({ error: "prompt is required" }); return; }

  const projectId = reqProjectId ?? `proj-${Date.now()}`;

  try {
    mkdirSync(projectDir(projectId), { recursive: true });
  } catch (e: any) {
    res.status(500).json({ error: `Cannot create project dir: ${e.message}` });
    return;
  }

  sseSetup(res);

  const accumulated: Record<string, string> = { ...(files ?? {}) };

  if (files) {
    for (const [path, content] of Object.entries(files)) {
      writeFileToDisk(projectId, path, content);
    }
  }

  const fileList = Object.keys(accumulated)
    .map((p) => `  - ${p}`)
    .join("\n");

  const messages: any[] = [
    { role: "system", content: EDIT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Current project files:\n${fileList || "  (none)"}\n\nEdit request: ${prompt}`,
    },
  ];

  sseSend(res, "stage", { message: "Reviewing your request…" });

  try {
    const filesWritten = await runAgentLoop(
      res,
      messages,
      apiKey,
      projectId,
      accumulated,
      true,
    );

    if (filesWritten > 0) {
      const writtenPaths = Object.keys(accumulated).filter((p) => !(files ?? {})[p] || accumulated[p] !== (files ?? {})[p]);
      await saveEditBuild(projectId, prompt, writtenPaths.length ? writtenPaths : Object.keys(accumulated));
    }

    sseSend(res, "done", { templateType: "edit", fileCount: filesWritten });
    res.end();
  } catch (err: any) {
    const msg =
      err?.name === "AbortError" ? "Request timed out" : err?.message ?? String(err);
    sseError(res, msg);
  }
});

export default router;
