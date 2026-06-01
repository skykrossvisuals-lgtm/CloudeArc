import Editor, { DiffEditor } from "@monaco-editor/react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { AgentLivenessIndicator, type ExecutionStage } from "../components/AgentLivenessIndicator";
import { ThoughtBlock, type ThoughtBlockData } from "../components/ThoughtBlock";
import { DiffPreview } from "../components/DiffPreview";
import { DependencyMap } from "../components/DependencyMap";
import { orchestrator, dedup, tasteTracker } from "../lib/orchestrator";
import {
  promptRegistry,
  conversationMemory,
  momentumEngine,
  confidenceModel,
  type Intent,
} from "../lib/conversationEngine";
import { unifiedDecisionKernel } from "../lib/unifiedDecisionKernel";
import debounce from "lodash/debounce";
import { zipSync, strToU8 } from "fflate";
import {
  connectCollab,
  disconnectCollab,
  emitFileWrite,
  emitFileDelete,
  emitChatMessage,
  emitBuildStarted,
  getMyUser,
  type CollabUser,
} from "../lib/collab";

// ─── helpers ────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => ++_id;

function describePrompt(p: string): string {
  const s = p.toLowerCase();
  if (s.includes("landing")) return "landing page";
  if (s.includes("dashboard")) return "dashboard";
  if (s.includes("portfolio")) return "portfolio";
  if (s.includes("blog")) return "blog";
  if (s.includes("login") || s.includes("auth")) return "auth flow";
  if (s.includes("form")) return "form";
  if (s.includes("calculator")) return "calculator";
  if (s.includes("todo") || s.includes("to-do") || s.includes("task")) return "task manager";
  if (s.includes("chat")) return "chat UI";
  if (s.includes("weather")) return "weather app";
  if (s.includes("shop") || s.includes("store") || s.includes("product")) return "storefront";
  if (s.includes("game")) return "game";
  return "app";
}

function fileLabel(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "component";
  if (path.endsWith(".ts") || path.endsWith(".js")) return "script";
  if (path.endsWith(".css")) return "stylesheet";
  if (path.endsWith(".html")) return "page";
  if (path.endsWith(".json")) return "config";
  return "file";
}

function shortPath(path: string): string {
  return path.replace(/^\//, "").split("/").slice(-2).join("/");
}

function fileStepMessage(path: string): string {
  const name = (path.split("/").pop() ?? "").toLowerCase();
  if (name === "design.css") return "Establishing design token system";
  if (name === "theme.css") return "Applying color palette and typography scale";
  if (name.includes("main.")) return "Bootstrapping React render tree";
  if (name.includes("app.")) return "Composing top-level component layout";
  if (/navbar|nav\.|header/.test(name)) return "Wiring sticky navigation with mobile toggle";
  if (/hero/.test(name)) return "Composing hero with gradient headline and CTA";
  if (/feature/.test(name)) return "Building feature grid with hover cards";
  if (/pricing|plan/.test(name)) return "Generating pricing tiers with comparison table";
  if (/testimonial|review/.test(name)) return "Populating social proof section";
  if (/cta|callto/.test(name)) return "Constructing conversion-focused CTA block";
  if (/footer/.test(name)) return "Assembling footer with link columns";
  if (/sidebar/.test(name)) return "Building collapsible sidebar navigation";
  if (/dashboard/.test(name)) return "Laying out analytics dashboard grid";
  if (/metric|stat/.test(name)) return "Rendering KPI metrics with live data";
  if (/chart|graph/.test(name)) return "Drawing chart components with data bindings";
  if (/modal|dialog/.test(name)) return "Creating modal overlay with focus trap";
  if (/table|list/.test(name)) return "Generating sortable data table";
  if (/about/.test(name)) return "Crafting about section with team grid";
  if (/contact/.test(name)) return "Building contact form with validation";
  if (path.endsWith(".css")) return "Applying responsive utility styles";
  if (path.endsWith(".html")) return "Scaffolding HTML shell with meta tags";
  return `Writing ${fileLabel(path)}`;
}

function fileTypeColor(path: string): string {
  if (path.endsWith(".jsx") || path.endsWith(".tsx")) return "#a78bfa";
  if (path.endsWith(".css")) return "#38bdf8";
  if (path.endsWith(".html")) return "#fb923c";
  if (path.endsWith(".ts") || path.endsWith(".js")) return "#facc15";
  if (path.endsWith(".json")) return "#4ade80";
  return "#94a3b8";
}

function editStepMessage(path: string): string {
  const name = (path.split("/").pop() ?? "").toLowerCase();
  if (/navbar|nav\.|header/.test(name)) return "Refactoring navigation layout";
  if (/hero/.test(name)) return "Patching hero section";
  if (/feature/.test(name)) return "Adjusting feature grid markup";
  if (/pricing|plan/.test(name)) return "Updating pricing tier configuration";
  if (/testimonial|review/.test(name)) return "Refreshing testimonial content";
  if (/cta|callto/.test(name)) return "Tuning CTA copy and styling";
  if (/footer/.test(name)) return "Revising footer structure";
  if (/sidebar/.test(name)) return "Updating sidebar state logic";
  if (/dashboard/.test(name)) return "Patching dashboard layout";
  if (/metric|stat/.test(name)) return "Updating metric bindings";
  if (/about/.test(name)) return "Revising about section content";
  if (/contact/.test(name)) return "Patching contact form logic";
  if (name === "design.css") return "Revising design token values";
  if (name === "theme.css") return "Updating color and spacing scale";
  if (name.includes("app.")) return "Adjusting root component structure";
  if (path.endsWith(".css")) return "Patching utility class overrides";
  return `Refactoring ${fileLabel(path)}`;
}

function describeEditPrompt(p: string): string {
  const s = p.toLowerCase();
  if (/navbar|nav\b|navigation/.test(s)) return "navbar";
  if (/hero/.test(s)) return "hero section";
  if (/footer/.test(s)) return "footer";
  if (/pricing/.test(s)) return "pricing";
  if (/button/.test(s)) return "buttons";
  if (/color|dark|light|theme/.test(s)) return "colors";
  if (/spacing|padding|margin/.test(s)) return "spacing";
  if (/font|text|typography/.test(s)) return "typography";
  if (/mobile|responsive/.test(s)) return "mobile layout";
  if (/animation|transition/.test(s)) return "animations";
  if (/gradient/.test(s)) return "gradients";
  if (/background|bg/.test(s)) return "background";
  return "design";
}

// ─── intent classification — delegated to conversationEngine ─────────────────
// MessageIntent is now an alias for the engine's Intent type.
type MessageIntent = Intent;

// ─── feed types ─────────────────────────────────────────────────────────────

type StepState = "running" | "done" | "error";
type StepKind = "plan" | "write" | "bundle";

type Step = {
  id: number;
  text: string;
  path?: string;
  state: StepState;
  enteredAt: number;
  completedAt?: number;
  internal?: boolean;
  diff?: { oldContent?: string; newContent: string };
  phaseId?: number;
  kind?: StepKind;
};

type BuildPhase = {
  id: number;
  label: string;
  state: "pending" | "running" | "done";
};

type TaskCard = {
  kind: "task";
  id: number;
  label: string;
  steps: Step[];
  state: "thinking" | "running" | "done" | "error";
  summary: string;
  collapsed: boolean;
  fileCount: number;
  executionStage: ExecutionStage;
  phases?: BuildPhase[];
  currentPhaseId?: number;
};

type UserBubble = {
  kind: "user";
  id: number;
  content: string;
};

type NarrativeMessage = {
  kind: "narrative";
  id: number;
  text: string;
  stage: "understanding" | "planning" | "building" | "done";
  streaming?: boolean;
};

type ConverseBubble = {
  kind: "converse";
  id: number;
  text: string;
  intent: "clarification" | "question" | "debug";
  loading: boolean;
};

type CollaborateBubble = {
  kind: "collaborate";
  id: number;
  text: string;
  intent: "casual" | "advisory" | "brainstorm" | "review" | "reflect" | "reflection" | "planning" | "clarification";
  loading: boolean;
};

type ThoughtBlockItem = {
  kind: "thought";
  id: number;
  data: ThoughtBlockData;
};

type FeedItem = UserBubble | TaskCard | NarrativeMessage | ConverseBubble | CollaborateBubble | ThoughtBlockItem;

// ─── checkpoint types ─────────────────────────────────────────────────────────

type Checkpoint = {
  id: string;
  timestamp: number;
  label: string;
  fileCount: number;
  files: Record<string, string>;
};

function loadCheckpoints(projectId: string): Checkpoint[] {
  try {
    return JSON.parse(localStorage.getItem(`ca-checkpoints-${projectId}`) ?? "[]");
  } catch { return []; }
}

function persistCheckpoints(projectId: string, cps: Checkpoint[]) {
  try {
    localStorage.setItem(`ca-checkpoints-${projectId}`, JSON.stringify(cps.slice(-20)));
  } catch {}
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── inline styles injected once ────────────────────────────────────────────

const GLOBAL_STYLES = `
@keyframes ca-slide-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ca-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes ca-blink {
  0%, 80%, 100% { opacity: 0.2; }
  40%            { opacity: 1; }
}
@keyframes ca-cursor {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes ca-writing-pulse {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 0 0 rgba(139,92,246,0); }
  50%       { opacity: 1;   box-shadow: 0 0 0 4px rgba(139,92,246,0.18); }
}
@keyframes ca-spin-ring {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ca-progress-glow {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}
.ca-step-row { animation: ca-slide-in 200ms ease-out both; }
.ca-shimmer-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(139,92,246,0.22), transparent);
  animation: ca-shimmer 1.8s ease-in-out infinite;
}
.ca-dot { animation: ca-blink 1.4s ease-in-out infinite; }
.ca-dot:nth-child(2) { animation-delay: 0.2s; }
.ca-dot:nth-child(3) { animation-delay: 0.4s; }
.ca-cursor { animation: ca-cursor 600ms steps(1) infinite; }
.ca-writing-dot { animation: ca-writing-pulse 1.4s ease-in-out infinite; }
.ca-spin-ring { animation: ca-spin-ring 900ms linear infinite; }
.ca-progress-glow { animation: ca-progress-glow 2s ease-in-out infinite; }

`;

// ─── execution phase + operation metadata ────────────────────────────────────

const PHASE_META: Record<ExecutionStage, { label: string; color: string; dot: string }> = {
  thinking:   { label: "UNDERSTANDING", color: "#a78bfa", dot: "#a78bfa" },
  planning:   { label: "PLANNING",      color: "#38bdf8", dot: "#38bdf8" },
  building:   { label: "BUILDING",      color: "#34d399", dot: "#34d399" },
  debugging:  { label: "INVESTIGATING", color: "#fb923c", dot: "#fb923c" },
  finalizing: { label: "FINALIZING",    color: "#f472b6", dot: "#f472b6" },
  idle:       { label: "READY",         color: "#52525b", dot: "#52525b" },
};

type OpType = "create" | "update" | "analyze" | "style" | "validate" | "fix";

const OP_META: Record<OpType, { label: string; color: string }> = {
  create:   { label: "create",   color: "#34d399" },
  update:   { label: "update",   color: "#60a5fa" },
  analyze:  { label: "scan",     color: "#fb923c" },
  style:    { label: "style",    color: "#f472b6" },
  validate: { label: "run",      color: "#a78bfa" },
  fix:      { label: "fix",      color: "#fb923c" },
};

function inferOpType(text: string, path?: string): OpType {
  const t = text.toLowerCase();
  if (/analyz|scanning|inspect|review|identify|interpret|understand/.test(t)) return "analyze";
  if (/bundl|preview|validat|compil/.test(t)) return "validate";
  if (/fixing|correcting|resolv|debug/.test(t)) return "fix";
  if (/updating|adjusting|changing|modif/.test(t)) return "update";
  if (/styling|color|theme|palette/.test(t) || path?.endsWith(".css")) return "style";
  return "create";
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Spinner({ size = 14, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 rounded-full border-[1.5px] animate-spin
        ${dim ? "border-zinc-700 border-t-zinc-500" : "border-zinc-600 border-t-zinc-200"}`}
    />
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="ca-dot w-[3px] h-[3px] rounded-full bg-zinc-400 inline-block"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

function StepRow({ step }: { step: Step }) {
  const [expanded, setExpanded] = useState(false);
  const color = step.path ? fileTypeColor(step.path) : "#94a3b8";
  const hasDiff = step.state === "done" && !!step.diff;
  return (
    <div className="ca-step-row" style={{ animationDelay: "0ms" }}>
      <div
        className={`flex items-start gap-2 text-xs py-[3px] ${hasDiff ? "cursor-pointer select-none" : ""}`}
        onClick={() => hasDiff && setExpanded((e) => !e)}
      >
        <span className="mt-[1px] shrink-0 w-3.5 flex justify-center">
          {step.state === "running" && <Spinner size={10} dim />}
          {step.state === "done" && <span className="text-zinc-600 text-[10px] leading-none">✓</span>}
          {step.state === "error" && <span className="text-red-500 text-[10px] leading-none">✗</span>}
        </span>

        <span className={`flex-1 leading-relaxed ${
          step.state === "running" ? "text-zinc-300" :
          step.state === "done"    ? "text-zinc-600" :
          "text-red-400"
        }`}>
          {step.text}
          {step.path && (
            <span
              className="ml-1.5 font-mono text-[10px] opacity-60"
              style={{ color }}
            >
              {shortPath(step.path)}
            </span>
          )}
        </span>

        {hasDiff && (
          <span className="shrink-0 text-[9px] text-zinc-700 mt-[2px]">
            {expanded ? "▴" : "▾"}
          </span>
        )}
      </div>

      {expanded && step.diff && step.path && (
        <div className="ml-3.5 mb-1 mt-0.5">
          <DiffPreview
            path={step.path}
            oldContent={step.diff.oldContent}
            newContent={step.diff.newContent}
            maxLines={14}
          />
        </div>
      )}
    </div>
  );
}

// ─── Multi-step plan strip ────────────────────────────────────────────────────

function MultiStepStrip({
  phases,
  currentPhaseId,
  taskState,
}: {
  phases: BuildPhase[];
  currentPhaseId?: number;
  taskState: TaskCard["state"];
}) {
  const taskDone = taskState === "done";

  return (
    <div
      className="mx-2.5 mb-2 mt-0.5 rounded-lg overflow-hidden"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {phases.map((phase, i) => {
        const isRunning = !taskDone && (phase.state === "running" || (phase.state === "pending" && phase.id === currentPhaseId));
        const isDone = taskDone || phase.state === "done";
        const isPending = !isRunning && !isDone;
        const isLast = i === phases.length - 1;

        return (
          <div
            key={phase.id}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 ${!isLast ? "border-b border-white/[0.04]" : ""}`}
            style={{
              background: isRunning ? "rgba(139,92,246,0.07)" : "transparent",
              transition: "background 300ms",
            }}
          >
            {/* State icon */}
            <span className="shrink-0 w-3.5 flex items-center justify-center">
              {isDone && (
                <span className="text-[9px] text-zinc-600">✓</span>
              )}
              {isRunning && (
                <span
                  className="ca-writing-dot inline-block rounded-full"
                  style={{ width: 5, height: 5, background: "rgba(139,92,246,0.85)" }}
                />
              )}
              {isPending && (
                <span
                  className="inline-block rounded-full"
                  style={{ width: 4, height: 4, background: "rgba(82,82,91,0.6)" }}
                />
              )}
            </span>

            {/* Step number + label */}
            <span className={`flex-1 text-[11px] leading-snug ${
              isRunning ? "text-zinc-300" : isDone ? "text-zinc-600" : "text-zinc-700"
            }`}>
              <span
                className="font-mono mr-1.5"
                style={{ fontSize: 9, opacity: 0.5 }}
              >
                {i + 1}/{phases.length}
              </span>
              {phase.label}
            </span>

            {/* "active" label for running step */}
            {isRunning && (
              <span
                className="shrink-0 text-[9px] font-medium tracking-wide"
                style={{ color: "rgba(139,92,246,0.7)" }}
              >
                in progress
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskCardView({
  task,
  onToggle,
}: {
  task: TaskCard;
  onToggle: (id: number) => void;
}) {
  const canCollapse = task.state === "done" || task.state === "error";
  const showSteps = !task.collapsed && task.steps.length > 0;
  const isActive = task.state === "thinking" || task.state === "running";
  const hasPhases = (task.phases ?? []).length > 0;

  // Find the active phase label for the header subtitle
  const activePhase = hasPhases
    ? (task.phases ?? []).find((p) => p.state === "running" || p.id === task.currentPhaseId)
    : null;

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        borderRadius: "10px",
        border: isActive
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(255,255,255,0.035)",
        background: isActive ? "rgba(255,255,255,0.022)" : "transparent",
        boxShadow: isActive ? "0 4px 20px rgba(0,0,0,0.25)" : "none",
      }}
    >
      {/* Subtle progress shimmer — only active, no hard "done" bar */}
      {isActive && (
        <div className="h-[1.5px] w-full bg-white/[0.04] relative overflow-hidden ca-shimmer-bar" />
      )}

      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left"
        onClick={() => canCollapse && onToggle(task.id)}
      >
        <span className="shrink-0">
          {(task.state === "thinking" || task.state === "running") && <Spinner size={12} />}
          {task.state === "done" && (
            <span className="text-[9px] text-zinc-600">✓</span>
          )}
          {task.state === "error" && (
            <span className="text-[9px] text-red-500">✗</span>
          )}
        </span>

        <span className={`flex-1 min-w-0 ${task.state === "done" ? "text-zinc-600" : "text-zinc-300"}`}>
          <span className="block text-[12.5px] font-medium leading-snug">
            {task.label}
            {task.state === "thinking" && <ThinkingDots />}
          </span>
          {/* Active step subtitle — only shown when multi-step plan exists and running */}
          {hasPhases && isActive && activePhase && (
            <span className="block text-[10.5px] leading-snug mt-[1px]" style={{ color: "rgba(139,92,246,0.65)" }}>
              Step {(task.phases ?? []).findIndex((p) => p.id === activePhase.id) + 1} of {(task.phases ?? []).length}: {activePhase.label}
            </span>
          )}
        </span>

        {task.fileCount > 0 && (
          <span className="shrink-0 text-[9px] text-zinc-700 tabular-nums font-mono">
            {task.fileCount}f
          </span>
        )}

        {canCollapse && (
          <span className="text-zinc-700 text-[9px] shrink-0 ml-0.5">
            {task.collapsed ? "▸" : "▾"}
          </span>
        )}
      </button>

      {/* Multi-step plan strip */}
      {hasPhases && !task.collapsed && (
        <MultiStepStrip
          phases={task.phases ?? []}
          currentPhaseId={task.currentPhaseId}
          taskState={task.state}
        />
      )}

      {/* Steps — no hard border, just indented flow */}
      {showSteps && (
        <div className="px-2.5 pb-2 pt-0.5 space-y-0">
          {task.steps.map((s) => <StepRow key={s.id} step={s} />)}
        </div>
      )}

      {/* Summary — quiet, unboxed */}
      {task.summary && !task.collapsed && (
        <div className={`px-2.5 pb-2.5 text-[11px] leading-relaxed ${
          task.state === "error" ? "text-red-400/70" : "text-zinc-600"
        }`}>
          {task.summary}
        </div>
      )}
    </div>
  );
}

// ─── Shared agent avatar ──────────────────────────────────────────────────────

function AgentAvatar() {
  return (
    <div className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-600/40 border border-indigo-400/25 flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(167,139,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="rgba(167,139,250,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="rgba(167,139,250,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── AI narrative — primary conversational voice ──────────────────────────────

function AgentBubble({ msg }: { msg: NarrativeMessage }) {
  // When streaming=true, text is already arriving token-by-token from the server.
  // Display it directly — no typewriter simulation needed. Show a live cursor while
  // the stream is open, hide it once the message is finalized (streaming=false).
  const isStreaming = msg.streaming !== false;

  return (
    <div className="ca-step-row pl-1 py-0.5">
      <p
        className="text-[12.5px] leading-[1.75] whitespace-pre-line"
        style={{ color: "rgba(212,212,216,0.82)" }}
      >
        {msg.text}
        {isStreaming && msg.text.length > 0 && (
          <span
            className="ca-cursor inline-block w-[1.5px] h-[12px] ml-[1px] rounded-sm bg-zinc-500"
            style={{ verticalAlign: "text-bottom" }}
          />
        )}
      </p>
    </div>
  );
}

// ─── conversational answer bubble ─────────────────────────────────────────────

function ConverseAnswer({ msg }: { msg: ConverseBubble }) {
  const isDebug = msg.intent === "debug";

  return (
    <div className="ca-step-row pl-1 py-0.5">
      {msg.loading ? (
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-[12px] text-zinc-500">{isDebug ? "Let me look into this…" : "Thinking…"}</span>
          <ThinkingDots />
        </div>
      ) : (
        <p className="text-[12.5px] leading-[1.75] whitespace-pre-line" style={{ color: "rgba(212,212,216,0.9)" }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}


// ─── collaborate bubble — workspace partner voice ────────────────────────────

const COLLAB_INTENT_META: Record<CollaborateBubble["intent"], { icon: React.ReactElement; color: string; label: string; loadingMsg: string }> = {
  casual:      { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, color: "#34d399", label: "here",        loadingMsg: "One sec…"             },
  advisory:    { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4M12 16h.01"/></svg>, color: "#60a5fa", label: "advising",    loadingMsg: "Thinking it through…"  },
  brainstorm:  { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a7 7 0 0 1 7 7c0 3.5-2 5.5-4 7v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1c-2-1.5-4-3.5-4-7a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>, color: "#f472b6", label: "ideating",    loadingMsg: "Generating ideas…"    },
  review:      { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, color: "#fb923c", label: "reviewing",   loadingMsg: "Reading the design…"   },
  reflect:     { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>, color: "#a78bfa", label: "reflecting",  loadingMsg: "Looking back…"         },
  reflection:  { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>, color: "#a78bfa", label: "reflecting",  loadingMsg: "Looking back…"         },
  planning:    { icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>, color: "#fbbf24", label: "planning",   loadingMsg: "Mapping it out…"      },
  clarification:{ icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4M12 16h.01"/></svg>, color: "#94a3b8", label: "answering",  loadingMsg: "On it…"               },
};

function CollaborateView({ msg }: { msg: CollaborateBubble }) {
  const meta = COLLAB_INTENT_META[msg.intent] ?? COLLAB_INTENT_META.casual;

  return (
    <div className="ca-step-row pl-1 py-0.5">
      {msg.loading ? (
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-[12px] text-zinc-500">{meta.loadingMsg}</span>
          <ThinkingDots />
        </div>
      ) : (
        <p className="text-[12.5px] leading-[1.75] whitespace-pre-line" style={{ color: "rgba(212,212,216,0.9)" }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ─── operation trace row ─────────────────────────────────────────────────────

function OperationRow({ step, active }: { step: Step; active: boolean }) {
  const op = inferOpType(step.text, step.path ?? undefined);
  const { label: opLabel, color: opColor } = OP_META[op];
  const isDone   = step.state === "done";
  const isRun    = step.state === "running";
  const filename = step.path ? step.path.split("/").pop()! : null;
  const fileColor = step.path ? fileTypeColor(step.path) : "#71717a";

  return (
    <div
      className="flex items-center gap-2 py-[2px] transition-opacity duration-300"
      style={{ opacity: isDone ? 0.45 : 1 }}
    >
      {/* State glyph */}
      {isDone ? (
        <span className="shrink-0 text-[8px]" style={{ color: "#34d399" }}>✓</span>
      ) : isRun ? (
        <span className="shrink-0 text-[8px] animate-pulse" style={{ color: opColor }}>▶</span>
      ) : (
        <span className="shrink-0 text-[8px] text-zinc-700">○</span>
      )}
      {/* op type label */}
      <span
        className="shrink-0 font-mono text-[9px] w-[42px] text-right"
        style={{ color: opColor }}
      >
        {opLabel}
      </span>
      {/* step text */}
      <span className="flex-1 min-w-0 text-[10px] truncate text-zinc-400">
        {step.text}
      </span>
      {/* filename chip */}
      {filename && (
        <span
          className="shrink-0 font-mono text-[9px] truncate"
          style={{ color: fileColor, maxWidth: 80 }}
        >
          {filename}
        </span>
      )}
    </div>
  );
}

// ─── action step icons ────────────────────────────────────────────────────────

function StepIcon({ step, active }: { step: Step; active?: boolean }) {
  const color = active ? "#a1a1aa" : step.state === "done" ? "#71717a" : step.state === "error" ? "#f87171" : "#52525b";

  const kind = step.kind ?? (step.path ? "write" : "default");

  // Brain / sparkle — planning step
  if (kind === "plan") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  );

  // Pen — writing/file step
  if (kind === "write") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );

  // Terminal — bundling/build step
  if (kind === "bundle" || step.text.toLowerCase().includes("bundl") || step.text.toLowerCase().includes("preview") || step.text.toLowerCase().includes("build")) return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  );

  // Clock — generic / connecting step
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function stepDuration(s: Step): string | null {
  if (!s.completedAt) return null;
  const ms = s.completedAt - s.enteredAt;
  if (ms < 1000) return null;
  const sec = Math.round(ms / 1000);
  return `${sec} second${sec !== 1 ? "s" : ""}`;
}

function stepLabel(s: Step): string {
  if (s.kind === "write" && s.path) return `Wrote ${s.path.split("/").pop()}`;
  if (s.kind === "write") return s.text;
  if (s.path) return `Wrote ${s.path.split("/").pop()}`;
  return s.text;
}

// ─── phase group — collapsible step group per build phase ────────────────────

function PhaseGroup({ label, steps, defaultOpen }: {
  label: string;
  steps: Step[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors select-none group w-full"
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="flex-1 text-left">{label}</span>
        <span className="text-zinc-700">{steps.length} action{steps.length !== 1 ? "s" : ""}</span>
      </button>
      {open && (
        <div className="mt-1 ml-3.5 space-y-[3px]">
          {steps.map((s) => {
            const dur = stepDuration(s);
            return (
              <div key={s.id} className="flex items-center gap-2 py-[2px]">
                <StepIcon step={s} />
                <span className="text-[11px] text-zinc-500 truncate flex-1">{stepLabel(s)}</span>
                {dur && <span className="shrink-0 text-[10px] text-zinc-700">({dur})</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── task status — Replit-style file-per-step view ────────────────────────────

function fileSizeStr(content: string): string {
  const bytes = new TextEncoder().encode(content).length;
  if (bytes < 1024) return `${bytes}b`;
  return `${(bytes / 1024).toFixed(1)}kb`;
}

function fileTypeLabel(path: string): string {
  if (path.endsWith(".jsx") || path.endsWith(".tsx")) return "JSX";
  if (path.endsWith(".ts"))  return "TS";
  if (path.endsWith(".js"))  return "JS";
  if (path.endsWith(".css")) return "CSS";
  if (path.endsWith(".html")) return "HTML";
  if (path.endsWith(".json")) return "JSON";
  return "FILE";
}

function BuildStatusLine({ task, files }: { task: TaskCard; files: Record<string, string> }) {
  const isActive = task.state === "thinking" || task.state === "running";
  const isDone   = task.state === "done";
  const isError  = task.state === "error";
  const phase    = PHASE_META[task.executionStage] ?? PHASE_META.thinking;

  const writeSteps = task.steps.filter((s) => !s.internal && s.path);
  const doneWrites = writeSteps.filter((s) => s.state === "done");
  const runningNow = task.steps.find((s) => s.state === "running");

  // ── Done — PROJECT FILES card ────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="py-0.5 space-y-2">
        {/* Summary line */}
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-[12.5px] text-zinc-300 leading-snug">{task.summary || task.label}</span>
        </div>

        {/* PROJECT FILES card */}
        {doneWrites.length > 0 && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
          >
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Project Files</span>
              <span className="text-[10px] text-zinc-600 tabular-nums">{doneWrites.length} file{doneWrites.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="py-1">
              {doneWrites.map((s) => {
                const color = s.path ? fileTypeColor(s.path) : "#94a3b8";
                const label = s.path ? fileTypeLabel(s.path) : "FILE";
                const content = s.path ? files[s.path] : undefined;
                const size = content ? fileSizeStr(content) : "";
                return (
                  <div key={s.id} className="flex items-center gap-2.5 px-3 py-[5px] hover:bg-white/[0.025] transition-colors">
                    <span
                      className="shrink-0 text-[8.5px] font-bold font-mono px-[4px] py-[1px] rounded"
                      style={{ color, background: `${color}18` }}
                    >
                      {label}
                    </span>
                    <span className="flex-1 text-[11px] text-zinc-400 font-mono truncate min-w-0">
                      {s.path ? shortPath(s.path) : s.text}
                    </span>
                    {size && (
                      <span className="shrink-0 text-[10px] text-zinc-600 tabular-nums">{size}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="py-0.5 flex items-center gap-1.5">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span className="text-[12.5px] text-red-400">{task.summary || task.label}</span>
      </div>
    );
  }

  // ── Active — live file-by-file feed ──────────────────────────────────────
  return (
    <div className="py-0.5 space-y-1.5">
      {/* Header: current operation with liveness dot */}
      <div className="flex items-center gap-2">
        <AgentLivenessIndicator active={true} size={12} stage={task.executionStage} />
        <span className="text-[11.5px] text-zinc-400 leading-snug">
          {runningNow?.path
            ? <>Writing <span className="font-mono" style={{ color: fileTypeColor(runningNow.path) }}>{runningNow.path.split("/").pop()}</span>…</>
            : runningNow
              ? runningNow.kind === "plan" ? "Planning…" : runningNow.text
              : phase.label.charAt(0) + phase.label.slice(1).toLowerCase() + "…"}
        </span>
      </div>

      {/* Files written so far — grow as they land */}
      {doneWrites.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)" }}
        >
          {doneWrites.slice(-12).map((s) => {
            const color = s.path ? fileTypeColor(s.path) : "#94a3b8";
            const label = s.path ? fileTypeLabel(s.path) : "FILE";
            const content = s.path ? files[s.path] : undefined;
            const size = content ? fileSizeStr(content) : "";
            return (
              <div key={s.id} className="flex items-center gap-2.5 px-3 py-[5px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span
                  className="shrink-0 text-[8.5px] font-bold font-mono px-[4px] py-[1px] rounded"
                  style={{ color, background: `${color}18` }}
                >
                  {label}
                </span>
                <span className="flex-1 text-[11px] text-zinc-500 font-mono truncate min-w-0">
                  {s.path ? shortPath(s.path) : s.text}
                </span>
                {size && (
                  <span className="shrink-0 text-[10px] text-zinc-600 tabular-nums">{size}</span>
                )}
              </div>
            );
          })}
          {/* Currently writing row */}
          {runningNow?.path && (
            <div
              className="flex items-center gap-2.5 px-3 py-[5px]"
              style={{ background: "rgba(139,92,246,0.06)", borderTop: doneWrites.length > 0 ? "1px solid rgba(139,92,246,0.12)" : undefined }}
            >
              <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 11 11" className="ca-spin-ring" style={{ display: "block" }}>
                  <circle cx="5.5" cy="5.5" r="4" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="1.4" />
                  <path d="M5.5 1.5 A4 4 0 0 1 9.5 5.5" fill="none" stroke="#8b5cf6" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="flex-1 text-[11px] font-mono truncate min-w-0" style={{ color: "#c4b5fd" }}>
                {shortPath(runningNow.path)}
              </span>
              <span className="shrink-0 text-[9px] tracking-wide" style={{ color: "#7c3aed" }}>writing</span>
            </div>
          )}
        </div>
      )}
      {/* No files yet — show a single "thinking" indicator */}
      {doneWrites.length === 0 && !runningNow?.path && (
        <div className="flex items-center gap-2 py-[2px] pl-1">
          <ThinkingDots />
        </div>
      )}
    </div>
  );
}

// ─── preview flash overlay ───────────────────────────────────────────────────

function PreviewFlash({ active }: { active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
      style={{
        background: "rgba(255,255,255,0.06)",
        opacity: active ? 1 : 0,
      }}
    />
  );
}

// ─── premium preview skeleton ─────────────────────────────────────────────────

function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`preview-shimmer rounded-lg ${className}`}
      style={style}
    />
  );
}

function PreviewSkeleton() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0A0A] overflow-hidden relative">
      {/* Ambient glow */}
      <div
        className="preview-glow-pulse absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "360px",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.055) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.04] shrink-0 relative">
        <div className="flex items-center gap-6">
          <Bone className="h-5 w-24" />
          <div className="flex items-center gap-4">
            <Bone className="h-3 w-14" />
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-12" />
            <Bone className="h-3 w-18" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Bone className="h-3 w-16" />
          <Bone className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-10 px-8 relative shrink-0">
        <Bone className="h-3 w-20 rounded-full mb-5" />
        <Bone className="h-9 w-[480px] max-w-full mb-3" />
        <Bone className="h-9 w-[360px] max-w-full mb-6" />
        <div className="flex flex-col items-center gap-2 mb-8 w-full">
          <Bone className="h-3 w-[400px] max-w-full" />
          <Bone className="h-3 w-[340px] max-w-full" />
          <Bone className="h-3 w-[280px] max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-36 rounded-full" />
          <Bone className="h-10 w-28 rounded-full" />
        </div>
      </div>

      {/* Card grid */}
      <div className="px-8 pb-8 flex-1 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Bone className="h-px flex-1" style={{ borderRadius: 0 }} />
          <Bone className="h-2.5 w-28" />
          <Bone className="h-px flex-1" style={{ borderRadius: 0 }} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.05] overflow-hidden"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <Bone className="h-36 w-full rounded-none rounded-t-xl" />
              <div className="p-4 space-y-2.5">
                <Bone className="h-3.5 w-3/4" />
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-5/6" />
                <div className="flex items-center gap-2 pt-1">
                  <Bone className="h-2.5 w-16" />
                  <Bone className="h-2.5 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status label */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
        <div
          className="w-1.5 h-1.5 rounded-full bg-white/30"
          style={{ animation: "preview-shimmer 1.5s ease-in-out infinite", backgroundSize: "200% 100%" }}
        />
        <span className="text-[11px] text-white/25 tracking-wide font-medium">
          Bundling preview…
        </span>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceMode, { w: string; h: string; label: string }> = {
  desktop: { w: "100%",   h: "100%",   label: "Desktop" },
  tablet:  { w: "768px",  h: "1024px", label: "Tablet"  },
  mobile:  { w: "390px",  h: "844px",  label: "Mobile"  },
};


export default function WorkspacePage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [, navigate] = useLocation();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [copied, setCopied] = useState(false);

  const [files, setFiles] = useState<Record<string, string>>({
    "/index.html": `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Ready</h1>\n  </body>\n</html>`,
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewBuilding, setPreviewBuilding] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const filesRef = useRef<Record<string, string>>({});
  const previewErrorRef = useRef<string | null>(null);
  const currentPhaseIdRef = useRef<number | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [tab, setTab] = useState<"preview" | "code" | "logs" | "map" | "split">("preview");
  const splitIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeFile, setActiveFile] = useState("/index.html");
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [collabUsers, setCollabUsers] = useState<CollabUser[]>([]);
  const [previewFlash, setPreviewFlash] = useState(false);
  const [newFiles, setNewFiles] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [newFileName, setNewFileName] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);
  const myUser = useRef<CollabUser>(getMyUser());
  const [momentum, setMomentum] = useState<{ currentTask: string | null; subtask: string | null }>({
    currentTask: null,
    subtask: null,
  });
  const [styleProfile, setStyleProfile] = useState<{
    mode: string;
    label: string;
    templateType: string;
    inspiration: string | null;
    brief: string;
  } | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(() => loadCheckpoints(projectId));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [fileDiffs, setFileDiffs] = useState<Record<string, { original: string; modified: string }>>({});
  const [showDiff, setShowDiff] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const [projectName, setProjectName] = useState<string>(() => {
    try {
      const recent = JSON.parse(localStorage.getItem("cloudearc-recent") ?? "[]");
      const entry = recent.find((p: { id: string; name?: string; prompt: string }) => p.id === projectId);
      if (entry?.name) return entry.name;
      const raw = localStorage.getItem("cloudearc-project-" + projectId) ?? "";
      return raw.length > 60 ? raw.slice(0, 60) + "…" : raw || "Untitled project";
    } catch {
      return "Untitled project";
    }
  });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const startEditName = () => {
    setNameInput(projectName === "Untitled project" ? "" : projectName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const commitName = () => {
    const trimmed = nameInput.trim();
    const next = trimmed || "Untitled project";
    setProjectName(next);
    setEditingName(false);
    try {
      const recent: { id: string; name?: string; prompt: string }[] =
        JSON.parse(localStorage.getItem("cloudearc-recent") ?? "[]");
      const idx = recent.findIndex((p) => p.id === projectId);
      if (idx !== -1) {
        recent[idx] = { ...recent[idx], name: next };
        localStorage.setItem("cloudearc-recent", JSON.stringify(recent));
      }
    } catch {}
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const genRef = useRef(0);
  const autoFixRef = useRef(0);       // attempts per generation (capped at 1)
  const runAutoFixFnRef = useRef<(msg: string) => void>(() => {});
  const [consoleErrors, setConsoleErrors] = useState<{ level: string; message: string }[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);

  // Inject global keyframe styles once
  useEffect(() => {
    if (document.getElementById("ca-styles")) return;
    const el = document.createElement("style");
    el.id = "ca-styles";
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed]);

  // ── collab ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = connectCollab(projectId);

    socket.on("room-state", ({ users }: { users: CollabUser[] }) => {
      setCollabUsers(users.filter((u) => u.id !== myUser.current.id));
    });
    socket.on("user-joined", ({ user }: { user: CollabUser }) => {
      if (user.id === myUser.current.id) return;
      setCollabUsers((prev) => prev.find((u) => u.id === user.id) ? prev : [...prev, user]);
    });
    socket.on("user-left", ({ userId }: { userId: string }) => {
      setCollabUsers((prev) => prev.filter((u) => u.id !== userId));
    });
    socket.on("file-write", ({ path, content }: { path: string; content: string }) => {
      setFiles((prev) => ({ ...prev, [path]: content }));
    });
    socket.on("file-delete", ({ path }: { path: string }) => {
      setFiles((prev) => { const c = { ...prev }; delete c[path]; return c; });
    });
    socket.on("chat-message", (msg: { kind: string; content: string; id: number }) => {
      if (msg.kind === "user")
        setFeed((prev) => [...prev, { kind: "user", id: uid(), content: msg.content } as UserBubble]);
    });
    socket.on("build-started", ({ label, user }: { label: string; user: CollabUser }) => {
      setFeed((prev) => [...prev, { kind: "user", id: uid(), content: `${user.name} is building: ${label}` } as UserBubble]);
    });

    return () => { disconnectCollab(); };
  }, [projectId]);

  // Keep filesRef in sync so callbacks always see latest files
  useEffect(() => { filesRef.current = files; }, [files]);

  // Auto-switch to split view when a preview first becomes available
  const prevPreviewHtmlRef = useRef<string | null>(null);
  useEffect(() => {
    if (previewHtml && prevPreviewHtmlRef.current === null) {
      // On first preview, switch to preview tab if not already on preview or split
      setTab((t) => (t === "code" || t === "logs" || t === "map") ? "preview" : t);
    }
    prevPreviewHtmlRef.current = previewHtml;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewHtml]);

  const flashPreview = useCallback(() => {
    setPreviewFlash(true);
    setTimeout(() => setPreviewFlash(false), 500);
  }, []);

  const buildPreview = useCallback(async (currentFiles: Record<string, string>): Promise<boolean> => {
    setPreviewBuilding(true);
    setPreviewError(null);
    previewErrorRef.current = null;
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: currentFiles }),
      });

      let data: { html?: string; error?: string; stubbed?: string[] } = {};
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        const msg = data.error ?? `Server error ${res.status}`;
        console.error("[preview] server error:", msg);
        setPreviewError(msg);
        previewErrorRef.current = msg;
        return false;
      }

      if (data.error || !data.html) {
        const msg = data.error ?? "Build returned empty output";
        console.error("[preview] build error:", msg);
        setPreviewError(msg);
        previewErrorRef.current = msg;
        return false;
      }

      // Always set the preview HTML so the user sees something
      setPreviewHtml(data.html);
      flashPreview();

      // If files were stubbed (LLM truncated JSX), show partial preview but
      // signal a build error so the auto-fix loop kicks in to repair them.
      if (data.stubbed && data.stubbed.length > 0) {
        const msg = `Syntax error in generated file(s): ${data.stubbed.join(", ")} — auto-fixing.`;
        console.warn("[preview] stubbed files:", data.stubbed);
        setPreviewError(msg);
        previewErrorRef.current = msg;
        return false;
      }

      return true;
    } catch (err: any) {
      const msg = err.message ?? "Network error";
      console.error("[preview] build failed:", msg);
      setPreviewError(msg);
      previewErrorRef.current = msg;
      return false;
    } finally {
      setPreviewBuilding(false);
    }
  }, [flashPreview]);

  const reloadPreview = useCallback(() => {
    buildPreview(filesRef.current);
  }, [buildPreview]);

  const openPreviewInNewTab = useCallback(() => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // Revoke the object URL after the tab has had time to load it
    if (win) setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [previewHtml]);

  // ── Auto-fix: called when preview iframe posts a runtime error ────────────
  const runAutoFix = useCallback(async (errorMsg: string) => {
    const snippet = errorMsg.slice(0, 200);
    setFeed((prev) => [
      ...prev,
      {
        kind: "narrative",
        id: uid(),
        text: `Runtime error detected — auto-fixing: \`${snippet}\``,
        stage: "building",
      } as NarrativeMessage,
    ]);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Fix this runtime JavaScript error that appeared in the preview: ${errorMsg}`,
          files: filesRef.current,
          styleProfile: null,
        }),
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const patchedFiles: Record<string, string> = { ...filesRef.current };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          let evType = "message";
          let rawData = "";
          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) evType = line.slice(7).trim();
            if (line.startsWith("data: ")) rawData = line.slice(6).trim();
          }
          if (!rawData) continue;
          let payload: any;
          try { payload = JSON.parse(rawData); } catch { continue; }

          if (evType === "file") {
            const { path, content } = payload as { path: string; content: string };
            patchedFiles[path] = content;
            filesRef.current = { ...filesRef.current, [path]: content };
            setFiles((prev) => ({ ...prev, [path]: content }));
          }
          if (evType === "done") break;
        }
      }

      const ok = await buildPreview(patchedFiles);
      setFeed((prev) => [
        ...prev,
        {
          kind: "narrative",
          id: uid(),
          text: ok
            ? "Auto-fix applied — preview updated."
            : "Auto-fix applied but preview still has issues. Try describing the problem in chat.",
          stage: "done",
        } as NarrativeMessage,
      ]);
    } catch {
      /* silently skip — auto-fix is best-effort */
    }
  }, [buildPreview]);

  // Keep the fn ref in sync so the stable message listener always calls latest
  useEffect(() => { runAutoFixFnRef.current = runAutoFix; }, [runAutoFix]);

  // Listen for runtime errors and console messages posted from the preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;

      // Hard runtime error → auto-fix immediately (capped at 1 per generation)
      if (e.data.type === "preview-error") {
        if (autoFixRef.current >= 1) return;
        autoFixRef.current += 1;
        runAutoFixFnRef.current(e.data.message ?? "Unknown runtime error");
        return;
      }

      // Console errors/warnings → collect for manual debug trigger
      if (e.data.type === "console-error") {
        const msg: string = e.data.message ?? "";
        // Filter out noisy React DevTools / HMR messages
        if (!msg || msg.includes("Download the React DevTools") || msg.includes("[HMR]")) return;
        setConsoleErrors((prev) => {
          if (prev.some((x) => x.message === msg)) return prev; // dedupe
          return [...prev.slice(-19), { level: e.data.level ?? "error", message: msg }];
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── feed mutations ───────────────────────────────────────────────────────

  const updateTask = useCallback(
    (taskId: number, updater: (t: TaskCard) => TaskCard) => {
      setFeed((prev) =>
        prev.map((item) =>
          item.kind === "task" && item.id === taskId ? updater(item) : item
        )
      );
    },
    []
  );

  const addStep = useCallback(
    (taskId: number, text: string, state: StepState = "running", path?: string, kind?: StepKind): number => {
      const stepId = uid();
      const phaseId = currentPhaseIdRef.current;
      updateTask(taskId, (t) => ({
        ...t,
        steps: [...t.steps, { id: stepId, text, state, path, kind, enteredAt: Date.now(), phaseId }],
      }));
      return stepId;
    },
    [updateTask]
  );

  const resolveStep = useCallback(
    (taskId: number, stepId: number, state: StepState, newText?: string, diff?: Step["diff"]) => {
      updateTask(taskId, (t) => {
        const step = t.steps.find((s) => s.id === stepId);
        if (diff && step?.path) {
          setFileDiffs((prev) => ({
            ...prev,
            [step.path!]: {
              original: diff.oldContent ?? "",
              modified: diff.newContent,
            },
          }));
        }
        return {
          ...t,
          steps: t.steps.map((s) =>
            s.id === stepId
              ? { ...s, state, text: newText ?? s.text, completedAt: Date.now(), ...(diff ? { diff } : {}) }
              : s
          ),
        };
      });
    },
    [updateTask]
  );

  const finishTask = useCallback(
    (taskId: number, state: "done" | "error", summary: string) => {
      updateTask(taskId, (t) => ({ ...t, state, summary, collapsed: state === "done" }));
    },
    [updateTask]
  );

  // ── (timer functions removed — UI is now driven by real SSE events) ────────


  // ── sandbox ──────────────────────────────────────────────────────────────

  const autoSentRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("cloudearc-project-" + projectId);
    setPrompt(stored);
  }, [projectId]);

  // Auto-send the initial prompt exactly once when navigating from the home page.
  // Uses sessionStorage so a page refresh does NOT re-trigger generation.
  useEffect(() => {
    if (!prompt || autoSentRef.current) return;
    const sessionKey = `ca-autosent-${projectId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    autoSentRef.current = true;
    sessionStorage.setItem(sessionKey, "1");
    sendMessage(prompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const debouncedWriteRef = useRef(debounce((_path: string, _content: string) => {}, 600));
  const debouncedWrite = debouncedWriteRef.current;

  useEffect(() => {
    return () => { debouncedWriteRef.current.cancel(); };
  }, []);

  // ── file delete ──────────────────────────────────────────────────────────

  const handleFileDelete = useCallback(async (path: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
    setActiveFile((cur) => {
      if (cur !== path) return cur;
      const remaining = Object.keys(files).filter((f) => f !== path);
      return remaining[0] ?? "/index.html";
    });
    emitFileDelete(path);
  }, [files]);

  // ── download project ─────────────────────────────────────────────────────

  const handleDownload = useCallback(async () => {
    if (Object.keys(files).length === 0) return;
    setDownloading(true);
    try {
      const zipEntries: Record<string, Uint8Array> = {};
      for (const [path, content] of Object.entries(files)) {
        const normalised = path.replace(/^\//, "");
        zipEntries[normalised] = strToU8(content);
      }
      const zipped = zipSync(zipEntries, { level: 6 });
      const blob = new Blob([zipped], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const slug = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "cloudearc-project";
      link.download = `${slug}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloading(false);
    }
  }, [files, projectName]);

  // ── send ─────────────────────────────────────────────────────────────────

  const sendMessage = async (overrideText?: string) => {
    const userPrompt = overrideText ?? input.trim();
    if (!userPrompt || sending) return;

    const hasFiles    = Object.keys(files).length > 1;
    const decision    = unifiedDecisionKernel.process({ userMessage: userPrompt, hasFiles });

    // Safety-net: when no app exists yet, any non-casual/greeting intent should build.
    // This mirrors how Replit works — the blank canvas is always a "build" context.
    const ALWAYS_BUILD_ON_BLANK: Intent[] = ["planning", "clarification", "advisory", "brainstorm", "review", "reflection"];
    const intent: Intent = (!hasFiles && ALWAYS_BUILD_ON_BLANK.includes(decision.intent))
      ? "execution"
      : decision.intent;
    const useEditMode = intent === "modify" || intent === "debug";

    // ── Rerun protection — block duplicate execution within cooldown ──────────
    if ((intent === "execution" || intent === "modify" || intent === "debug") && promptRegistry.wouldRerun(userPrompt)) {
      return;
    }

    setInput("");
    setSending(true);
    debouncedWrite.cancel();

    // Reset session-scoped deduplication + taste tracker on each new build.
    if (intent === "execution" || intent === "modify" || intent === "debug") {
      dedup.reset();
      tasteTracker.reset();
    }

    const userBubble: UserBubble = { kind: "user", id: uid(), content: userPrompt };
    emitChatMessage({ kind: "user", content: userPrompt, id: userBubble.id });

    // Combine relationship memory + momentum into a single context string for collaborate calls
    const memoryCtx    = conversationMemory.buildContext();
    const momentumCtx  = momentumEngine.buildMomentumContext();
    const memoryContext = [memoryCtx, momentumCtx].filter(Boolean).join(" ");

    // Build shared conversation history from the feed so both models have context.
    // Maps each completed feed item to a {role, content} pair; last 12 entries sent.
    const recentHistory = (() => {
      const hist: { role: "user" | "assistant"; content: string }[] = [];
      for (const item of feed) {
        if (item.kind === "user") {
          hist.push({ role: "user", content: item.content });
        } else if (item.kind === "collaborate" && !item.loading && item.text) {
          hist.push({ role: "assistant", content: item.text });
        } else if (item.kind === "converse" && !item.loading && item.text) {
          hist.push({ role: "assistant", content: item.text });
        } else if (item.kind === "narrative" && item.text) {
          hist.push({ role: "assistant", content: item.text });
        } else if (item.kind === "task" && item.state === "done") {
          const summary = item.summary || item.label;
          hist.push({ role: "assistant", content: `Built: ${item.label}. ${summary}` });
        }
      }
      return hist.slice(-12);
    })();

    // ── Helper: route to collaborative discussion ─────────────────────────────
    // Helper: consume a token-streaming SSE response and call onToken for each chunk.
    // Returns the full accumulated text. Errors are surfaced as thrown strings.
    const readTokenStream = async (
      r: Response,
      onToken: (accumulated: string) => void,
    ): Promise<string> => {
      if (!r.body) throw new Error("No response body");
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let partial = "";
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partial += decoder.decode(value, { stream: true });
        const lines = partial.split("\n");
        partial = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") break outer;
          try {
            const token = JSON.parse(payload);
            if (typeof token === "string") {
              accumulated += token;
              onToken(accumulated);
            } else if (token && typeof token.error === "string") {
              throw token.error;
            }
          } catch (e) {
            if (typeof e === "string") throw e;
          }
        }
      }
      return accumulated;
    };

    const routeToCollaborate = async (collabIntent: CollaborateBubble["intent"]) => {
      const collabId = uid();
      const bubble: CollaborateBubble = {
        kind: "collaborate",
        id: collabId,
        text: "",
        intent: collabIntent,
        loading: true,
      };
      setFeed((prev) => [...prev, userBubble, bubble]);
      try {
        const r = await fetch("/api/collaborate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userPrompt,
            intent: collabIntent,
            fileList: Object.keys(files).filter((f) => f !== "/index.html"),
            styleProfile: styleProfile ? `${styleProfile.mode} (${styleProfile.label})` : null,
            conversationContext: memoryContext,
            history: recentHistory,
            phase: decision.phase,
            tone: decision.tone,
            responseMode: decision.responseMode,
          }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        let firstToken = true;
        await readTokenStream(r, (accumulated) => {
          setFeed((prev) =>
            prev.map((item) =>
              item.kind === "collaborate" && item.id === collabId
                ? { ...item, text: accumulated, loading: firstToken ? false : item.loading }
                : item
            )
          );
          firstToken = false;
        });
        // Finalize — ensure loading is false even if stream was empty
        setFeed((prev) =>
          prev.map((item) =>
            item.kind === "collaborate" && item.id === collabId
              ? { ...item, loading: false }
              : item
          )
        );
      } catch {
        setFeed((prev) =>
          prev.map((item) =>
            item.kind === "collaborate" && item.id === collabId
              ? { ...item, text: "Something went wrong — try again.", loading: false }
              : item
          )
        );
      } finally {
        setSending(false);
      }
    };

    // ── CONVERSATIONAL INTENTS — never trigger execution ─────────────────────
    if (
      intent === "casual" ||
      intent === "advisory" ||
      intent === "brainstorm" ||
      intent === "review" ||
      intent === "reflection"
    ) {
      // Map engine intent names to collaborate route intent names
      const collabIntent =
        intent === "reflection" ? "reflection" :
        intent as CollaborateBubble["intent"];
      await routeToCollaborate(collabIntent);
      return;
    }

    // ── CLARIFICATION / QUESTION ─────────────────────────────────────────────
    if (intent === "clarification" || (intent === "debug" && !hasFiles)) {
      const converseId = uid();
      const bubble: ConverseBubble = {
        kind: "converse",
        id: converseId,
        text: "",
        intent: intent === "debug" ? "debug" : "clarification",
        loading: true,
      };
      setFeed((prev) => [...prev, userBubble, bubble]);
      try {
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userPrompt,
            fileList: Object.keys(files).filter((f) => f !== "/index.html"),
            intent: intent === "debug" ? "debug" : "question",
            history: recentHistory,
            phase: decision.phase,
            tone: decision.tone,
            responseMode: decision.responseMode,
          }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        let firstToken = true;
        await readTokenStream(r, (accumulated) => {
          setFeed((prev) =>
            prev.map((item) =>
              item.kind === "converse" && item.id === converseId
                ? { ...item, text: accumulated, loading: firstToken ? false : item.loading }
                : item
            )
          );
          firstToken = false;
        });
        setFeed((prev) =>
          prev.map((item) =>
            item.kind === "converse" && item.id === converseId
              ? { ...item, loading: false }
              : item
          )
        );
      } catch {
        setFeed((prev) =>
          prev.map((item) =>
            item.kind === "converse" && item.id === converseId
              ? { ...item, text: "Something went wrong — try again.", loading: false }
              : item
          )
        );
      } finally {
        setSending(false);
      }
      return;
    }

    // ── EXECUTION — register to prevent reruns ────────────────────────────────
    promptRegistry.register(userPrompt);

    // ── BUILD / MODIFY / DEBUG ───────────────────────────────────────────────
    const myGen = ++genRef.current;
    autoFixRef.current = 0; // reset auto-fix counter for this generation
    setConsoleErrors([]);   // clear accumulated console errors
    setNewFiles(new Set());
    if (intent === "execution") setStyleProfile(null);

    const localFiles: Record<string, string> = { ...files };

    const initStage: ExecutionStage =
      intent === "debug" ? "debugging" : "thinking";

    const taskLabel =
      intent === "debug"   ? `Investigating ${describeEditPrompt(userPrompt)}` :
      intent === "modify"  ? `Editing your ${describeEditPrompt(userPrompt)}` :
                             `Building your ${describePrompt(userPrompt)}`;

    const taskCard: TaskCard = {
      kind: "task",
      id: uid(),
      label: taskLabel,
      steps: [],
      state: "thinking",
      summary: "",
      collapsed: false,
      fileCount: 0,
      executionStage: initStage,
    };
    emitBuildStarted(useEditMode ? describeEditPrompt(userPrompt) : describePrompt(userPrompt));

    setFeed((prev) => [...prev, userBubble, taskCard]);
    const taskId = taskCard.id;

    // Wire orchestrator — single source of truth for all AI activity
    orchestrator.startTask(taskLabel, initStage);
    setMomentum({ currentTask: taskLabel, subtask: null });

    // Single connecting step — resolved when first real SSE event arrives
    const planTimerStepId = addStep(taskId, "Connecting to agent…", "running");

    try {
      const controller = new AbortController();
      const hardTimeout = setTimeout(() => controller.abort(), 120_000);

      let res: Response;
      try {
        res = await fetch(useEditMode ? "/api/edit" : "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            useEditMode
              ? { prompt: userPrompt, files, styleProfile, history: recentHistory }
              : { prompt: userPrompt, context: { projectId, files: Object.keys(files) }, history: recentHistory }
          ),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(hardTimeout);
      }

      if (!res.ok || !res.body) {
        let msg = "Request failed.";
        try {
          const errText = await res.text();
          msg = JSON.parse(errText)?.message ?? msg;
        } catch { /* ignore */ }
        updateTask(taskId, (t) => ({
          ...t,
          steps: t.steps.map((s) => s.state === "running" ? { ...s, state: "error" } : s),
        }));
        finishTask(taskId, "error", msg);
        return;
      }

      // ── SSE stream ────────────────────────────────────────────────────
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let written = 0;
      const failed: string[] = [];
      let realEventsStarted = false;
      // Tracks the feed ID of the currently-streaming narrative so chunks
      // can be appended to it in-place rather than creating a new item per chunk.
      let liveNarrativeId: number | null = null;

      const activateRealMode = () => {
        if (!realEventsStarted) {
          realEventsStarted = true;
          currentPhaseIdRef.current = undefined;
          setTab((t) => t === "split" ? "split" : "preview");
          setPreviewError(null);
          if (!previewHtml) setPreviewBuilding(true);
          const now = Date.now();
          updateTask(taskId, (t) => ({
            ...t,
            state: "running",
            executionStage: intent === "debug" ? "debugging" : "planning",
            steps: t.steps.map((s) =>
              s.state === "running" ? { ...s, state: "done", completedAt: now } : s
            ),
          }));
        }
      };

      // ── Incremental preview — debounced rebuild as files arrive ──────────────
      // Fires 900ms after the last file write, but only once the React entry
      // point exists so the bundler has something to compile.
      let incrementalTimer: ReturnType<typeof setTimeout> | null = null;
      let incrementalBuilding = false;

      const scheduleIncrementalPreview = (snapshot: Record<string, string>) => {
        if (incrementalTimer) clearTimeout(incrementalTimer);
        const hasEntry =
          "/src/main.jsx" in snapshot || "src/main.jsx" in snapshot ||
          "/src/main.tsx" in snapshot || "src/main.tsx" in snapshot;
        if (!hasEntry) return; // can't bundle yet — wait for entry point
        incrementalTimer = setTimeout(async () => {
          if (genRef.current !== myGen) return; // stale generation
          if (incrementalBuilding) return;       // previous build still in flight
          incrementalBuilding = true;
          try {
            // Silent build — don't update task state, just refresh the preview
            await buildPreview({ ...snapshot });
          } finally {
            incrementalBuilding = false;
          }
        }, 400);
      };

      outer: while (true) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try { chunk = await reader.read(); } catch { break; }
        if (chunk.done) break;

        sseBuffer += decoder.decode(chunk.value, { stream: true });
        const parts = sseBuffer.split("\n\n");
        sseBuffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventType = "message";
          let rawData = "";
          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) rawData = line.slice(6).trim();
          }
          if (!rawData) continue;
          if (genRef.current !== myGen) { reader.cancel(); return; }

          let payload: any;
          try { payload = JSON.parse(rawData); } catch { continue; }

          // ── phases plan ──────────────────────────────────────────
          if (eventType === "phases") {
            const phases: BuildPhase[] = (payload.phases ?? []).map((p: any, i: number) => ({
              id: p.id,
              label: p.label,
              state: i === 0 ? "running" as const : "pending" as const,
            }));
            if (phases.length > 0) {
              currentPhaseIdRef.current = phases[0].id;
              updateTask(taskId, (t) => ({
                ...t,
                phases,
                currentPhaseId: phases[0].id,
              }));
            }
          }

          // ── phase change ─────────────────────────────────────────
          if (eventType === "phase_change") {
            const newPhaseId = payload.phaseId as number;
            currentPhaseIdRef.current = newPhaseId;
            updateTask(taskId, (t) => ({
              ...t,
              currentPhaseId: newPhaseId,
              phases: (t.phases ?? []).map((p) =>
                p.id < newPhaseId ? { ...p, state: "done" as const }
                : p.id === newPhaseId ? { ...p, state: "running" as const }
                : p
              ),
            }));
          }

          // ── thought block ────────────────────────────────────────
          if (eventType === "thought") {
            activateRealMode();
            const thoughtItem: ThoughtBlockItem = {
              kind: "thought",
              id: uid(),
              data: {
                title:             payload.title             ?? "Planning",
                estimatedDuration: payload.estimatedDuration ?? "—",
                reasoning:         payload.reasoning         ?? "",
                strategy:          payload.strategy          ?? "",
                insights:          Array.isArray(payload.insights) ? payload.insights as string[] : [],
                phase:             (payload.phase as ThoughtBlockData["phase"]) ?? "planning",
              },
            };
            setFeed((prev) => [...prev, thoughtItem]);
            orchestrator.recordThought(thoughtItem.data);
          }

          // ── momentum ─────────────────────────────────────────────
          if (eventType === "momentum") {
            const ct = payload.currentTask as string | null ?? null;
            const st = payload.subtask as string | null ?? null;
            setMomentum({ currentTask: ct, subtask: st });
            orchestrator.setSubtask(st ?? "");
          }

          // ── narrative_chunk — live token-by-token streaming ──────────────
          if (eventType === "narrative_chunk") {
            activateRealMode();
            const chunk = payload.text ?? "";
            const stage: NarrativeMessage["stage"] = payload.stage ?? "planning";
            if (!chunk) continue;
            if (liveNarrativeId === null) {
              // First chunk — create a new live narrative message in the feed
              const newId = uid();
              liveNarrativeId = newId;
              const narrativeMsg: NarrativeMessage = {
                kind: "narrative",
                id: newId,
                text: chunk,
                stage,
                streaming: true,
              };
              setFeed((prev) => [...prev, narrativeMsg]);
            } else {
              // Subsequent chunks — append to the existing live message in-place
              const liveId = liveNarrativeId;
              setFeed((prev) =>
                prev.map((item) =>
                  item.kind === "narrative" && item.id === liveId
                    ? { ...item, text: item.text + chunk, stage }
                    : item
                )
              );
            }
          }

          // ── narrative — buffered flush from server (keep stream open) ──────────
          if (eventType === "narrative") {
            activateRealMode();
            const text = payload.text ?? "";
            const stage: NarrativeMessage["stage"] = payload.stage ?? "understanding";
            if (liveNarrativeId !== null) {
              // Update text in-place but keep liveNarrativeId alive — more
              // narrative_chunk events may follow. The cursor stays until "done".
              const liveId = liveNarrativeId;
              setFeed((prev) =>
                prev.map((item) =>
                  item.kind === "narrative" && item.id === liveId
                    ? { ...item, text, stage }
                    : item
                )
              );
            } else {
              // No live message (e.g. edit route) — create a new finalized one
              const narrativeMsg: NarrativeMessage = {
                kind: "narrative",
                id: uid(),
                text,
                stage,
                streaming: false,
              };
              setFeed((prev) => [...prev, narrativeMsg]);
            }
            orchestrator.recordNarrative(text, stage);
          }

          // ── stage ────────────────────────────────────────────────────
          if (eventType === "stage") {
            activateRealMode();
            // Do NOT close liveNarrativeId here — narrative_chunk events for
            // each file write should keep accumulating into the same live
            // narrative item so the user sees a continuous stream while
            // building. The narrative is only finalized by the 'narrative'
            // flush event at the end of a loop, or when the stream ends.
            const stageText = (payload.message ?? "").toLowerCase();
            const stageKind: StepKind | undefined = payload.kind === "plan" ? "plan" : undefined;

            let inferredStage: ExecutionStage | null = null;
            if (/plan|architect|design|structur|analyz/.test(stageText) && intent !== "debug") inferredStage = "planning";
            else if (/cod|generat|writing|creat|component|implement/.test(stageText)) inferredStage = "building";
            else if (/analyz|inspect|triage|review|debug/.test(stageText) && intent === "debug") inferredStage = "debugging";

            // Close any running step as done, then create a fresh step for this stage
            const now = Date.now();
            updateTask(taskId, (t) => ({
              ...t,
              ...(inferredStage ? { executionStage: inferredStage } : {}),
              steps: t.steps.map((s) =>
                s.state === "running" ? { ...s, state: "done" as StepState, completedAt: now } : s
              ),
            }));
            addStep(taskId, payload.message, "running", undefined, stageKind);
          }

          // ── file ─────────────────────────────────────────────────────
          if (eventType === "file") {
            activateRealMode();
            const { path, content } = payload as { path: string; content: string };

            // Capture old content before we overwrite — used for diff preview
            const oldContent = localFiles[path] ?? filesRef.current[path];

            // Close the planning step as done, transition to building
            const fileNow = Date.now();
            updateTask(taskId, (t) => ({
              ...t,
              executionStage: "building",
              steps: t.steps.map((s) =>
                s.state === "running" ? { ...s, state: "done", completedAt: fileNow } : s
              ),
            }));

            // Writing step with pen icon
            const label = useEditMode ? editStepMessage(path) : fileStepMessage(path);
            const sid = addStep(taskId, label, "running", path, "write");

            emitFileWrite(path, content);
            localFiles[path] = content;
            setFiles((prev) => ({ ...prev, [path]: content }));
            setActiveFile(path);
            setNewFiles((prev) => new Set([...prev, path]));
            setTimeout(() => {
              setNewFiles((prev) => {
                const n = new Set(prev);
                n.delete(path);
                return n;
              });
            }, 2000);

            resolveStep(taskId, sid, "done", undefined, { oldContent, newContent: content });
            orchestrator.fileWritten(path, content);
            written++;
            const finalWritten = written;
            updateTask(taskId, (t) => ({ ...t, fileCount: finalWritten }));

            // Schedule a live incremental preview rebuild
            scheduleIncrementalPreview({ ...localFiles });
          }

          // ── model info / fallback switch ─────────────────────────────
          if (eventType === "model_info" || eventType === "model_switch") {
            const modelName: string = payload.model ?? "";
            if (modelName) {
              setActiveModel(modelName);
              // On fallback, surface a quiet note in the feed
              if (eventType === "model_switch") {
                const shortName = modelName.split("/").pop() ?? modelName;
                setFeed((prev) => [...prev, {
                  kind: "narrative",
                  id: uid(),
                  text: `Primary model unavailable — continuing with ${shortName}.`,
                  stage: "building",
                  streaming: false,
                } as NarrativeMessage]);
              }
            }
          }

          // ── done ─────────────────────────────────────────────────────
          if (eventType === "done") {
            // Finalize any still-open live narrative — remove cursor
            if (liveNarrativeId !== null) {
              const liveId = liveNarrativeId;
              liveNarrativeId = null;
              setFeed((prev) =>
                prev.map((item) =>
                  item.kind === "narrative" && item.id === liveId
                    ? { ...item, streaming: false }
                    : item
                )
              );
            }
            // Cancel any pending incremental build — the final build below takes over
            if (incrementalTimer) { clearTimeout(incrementalTimer); incrementalTimer = null; }
            if (payload.styleProfile && intent === "execution") {
              setStyleProfile(payload.styleProfile);
            }
            updateTask(taskId, (t) => ({
              ...t,
              executionStage: "finalizing",
              steps: t.steps.map((s) =>
                s.state === "running" ? { ...s, state: "done" } : s
              ),
              // Mark all multi-step phases as done
              phases: (t.phases ?? []).map((p) => ({ ...p, state: "done" as const })),
            }));

            const previewSid = addStep(taskId, "Bundling preview", "running");
            const previewOk = await buildPreview(localFiles);
            const failNote = failed.length
              ? ` (${failed.length} file${failed.length !== 1 ? "s" : ""} failed)`
              : "";

            if (previewOk) {
              resolveStep(taskId, previewSid, "done");
              const doneMsg =
                intent === "debug"  ? `Fix applied — preview updated.${failNote}` :
                intent === "modify" ? `Edits applied — preview updated.${failNote}` :
                `Your ${describePrompt(userPrompt)} is live in the preview.${failNote}`;
              finishTask(taskId, "done", doneMsg);
              orchestrator.finishTask(doneMsg);
              const cpLabel =
                intent === "debug"  ? `Fix: ${userPrompt.slice(0, 60)}` :
                intent === "modify" ? `Edit: ${userPrompt.slice(0, 60)}` :
                userPrompt.slice(0, 70);
              saveCheckpoint(cpLabel, localFiles, written);
            } else {
              // ── Agentic verification loop: auto-fix build errors ──────────
              const buildError = previewErrorRef.current;
              const canAutoFix = !!buildError && Object.keys(localFiles).length > 0
                && !buildError.startsWith("Server error") && !buildError.startsWith("Network");

              if (canAutoFix) {
                resolveStep(taskId, previewSid, "error", "Build error detected");
                // Surface the exact error in the feed so the user can see what failed
                setFeed((prev) => [...prev, {
                  kind: "narrative",
                  id: uid(),
                  text: `Build error: ${buildError!.slice(0, 280)}${buildError!.length > 280 ? "…" : ""}\n\nAttempting an automatic fix.`,
                  stage: "building",
                } as NarrativeMessage]);

                // ── Helper: call /api/edit with an error and stream fixed files ──
                const runFixPass = async (
                  errorMsg: string,
                  currentFiles: Record<string, string>,
                ): Promise<{ applied: boolean; fixedFiles: Record<string, string> }> => {
                  const result: Record<string, string> = { ...currentFiles };
                  try {
                    const fixRes = await fetch("/api/edit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt: `The React app failed to bundle with this error:\n${errorMsg}\n\nFix the code so it compiles without errors. Only change what's needed — do not rewrite files that are already correct.`,
                        files: currentFiles,
                        styleProfile: null,
                      }),
                    });
                    if (!fixRes.ok || !fixRes.body) return { applied: false, fixedFiles: result };
                    const reader = fixRes.body.getReader();
                    const decoder = new TextDecoder();
                    let buf = "";
                    while (true) {
                      const { done: rd, value } = await reader.read();
                      if (rd) break;
                      buf += decoder.decode(value, { stream: true });
                      const parts = buf.split("\n\n");
                      buf = parts.pop() ?? "";
                      for (const part of parts) {
                        let evType = "", rawData = "";
                        for (const line of part.split("\n")) {
                          if (line.startsWith("event: ")) evType = line.slice(7).trim();
                          if (line.startsWith("data: ")) rawData = line.slice(6).trim();
                        }
                        if (!rawData || !evType) continue;
                        try {
                          const pl = JSON.parse(rawData);
                          if (evType === "file" && pl.path && pl.content) {
                            result[pl.path] = pl.content;
                            setFiles((prev) => ({ ...prev, [pl.path]: pl.content }));
                            emitFileWrite(pl.path, pl.content);
                          }
                        } catch { /* */ }
                      }
                    }
                    return { applied: true, fixedFiles: result };
                  } catch (err) {
                    console.warn("[autofix] fix request failed:", err);
                    return { applied: false, fixedFiles: result };
                  }
                };

                // ── Up to 2 fix attempts ────────────────────────────────────────
                const MAX_FIX_ATTEMPTS = 2;
                let currentError = buildError!;
                let currentFiles = { ...localFiles };
                let resolved = false;

                for (let attempt = 1; attempt <= MAX_FIX_ATTEMPTS; attempt++) {
                  const attemptLabel = attempt === 1
                    ? "Build error found — fixing it now"
                    : "Still failing — trying a deeper fix";
                  const fixSid = addStep(taskId, attemptLabel, "running");

                  const { applied, fixedFiles } = await runFixPass(currentError, currentFiles);

                  if (!applied) {
                    resolveStep(taskId, fixSid, "error", "Auto-fix request failed");
                    break;
                  }

                  resolveStep(taskId, fixSid, "done", "Fix applied — rebuilding preview");
                  Object.assign(localFiles, fixedFiles);
                  currentFiles = fixedFiles;

                  const rebuildLabel = attempt === 1 ? "Rebuilding preview" : `Rebuilding preview (attempt ${attempt})`;
                  const rebuildSid = addStep(taskId, rebuildLabel, "running");
                  const rebuildOk = await buildPreview(fixedFiles);
                  resolveStep(taskId, rebuildSid, rebuildOk ? "done" : "error");

                  if (rebuildOk) {
                    const doneMsg =
                      intent === "debug"  ? `Fix applied — auto-corrected ${attempt > 1 ? "errors" : "a build error"}.${failNote}` :
                      intent === "modify" ? `Edits applied — auto-corrected ${attempt > 1 ? "errors" : "a build error"}.${failNote}` :
                      `Your ${describePrompt(userPrompt)} is live — auto-corrected ${attempt > 1 ? "errors" : "a build error"}.${failNote}`;
                    finishTask(taskId, "done", doneMsg);
                    orchestrator.finishTask(doneMsg);
                    saveCheckpoint(userPrompt.slice(0, 70), fixedFiles, written);
                    resolved = true;
                    break;
                  }

                  // Pass the new error into the next attempt
                  currentError = previewErrorRef.current ?? currentError;
                }

                if (!resolved) {
                  finishTask(taskId, "done", `Generation complete${failNote}. Preview still has errors after auto-fix — check the Code tab.`);
                  orchestrator.finishTask("Preview had errors that couldn't be fully resolved.");
                }
              } else {
                resolveStep(taskId, previewSid, "error");
                const noPreviewMsg = `Generation complete${failNote}. Preview failed to bundle — check the Logs tab.`;
                finishTask(taskId, "done", noPreviewMsg);
                orchestrator.finishTask(noPreviewMsg);
              }
            }
            setMomentum({ currentTask: null, subtask: null });
            break outer;
          }

          // ── error ─────────────────────────────────────────────────────
          if (eventType === "error") {
            updateTask(taskId, (t) => ({
              ...t,
              steps: t.steps.map((s) =>
                s.state === "running" ? { ...s, state: "error" } : s
              ),
            }));
            const errMsg = payload.message ?? "Generation failed.";
            finishTask(taskId, "error", errMsg);
            orchestrator.finishTask(errMsg);
            setMomentum({ currentTask: null, subtask: null });
            break outer;
          }
        }
      }

      if (written === 0 && !failed.length && genRef.current === myGen) {
        finishTask(taskId, "error", "No files were generated. Try rephrasing your prompt.");
      }

    } catch (err: any) {
      const isTimeout = err.name === "AbortError";
      updateTask(taskId, (t) => ({
        ...t,
        steps: t.steps.map((s) => s.state === "running" ? { ...s, state: "error" } : s),
      }));
      finishTask(
        taskId,
        "error",
        isTimeout ? "Request timed out. Try a simpler prompt." : err.message ?? "Something went wrong."
      );
    } finally {
      setSending(false);
    }
  };

  const toggleCollapse = (taskId: number) => {
    updateTask(taskId, (t) => ({ ...t, collapsed: !t.collapsed }));
  };

  // ─── checkpoint helpers ───────────────────────────────────────────────────

  const saveCheckpoint = useCallback((label: string, snapFiles: Record<string, string>, fileCount: number) => {
    const cp: Checkpoint = {
      id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      label,
      fileCount,
      files: { ...snapFiles },
    };
    setCheckpoints((prev) => {
      const next = [...prev, cp];
      persistCheckpoints(projectId, next);
      return next;
    });
  }, [projectId]);

  const restoreCheckpoint = useCallback(async (cp: Checkpoint) => {
    setRestoringId(cp.id);
    setFiles(cp.files);
    filesRef.current = cp.files;
    const ok = await buildPreview(cp.files);
    if (ok) {
      setFeed((prev) => [
        ...prev,
        {
          kind: "narrative" as const,
          id: uid(),
          text: `Restored to checkpoint: "${cp.label}" (${relativeTime(cp.timestamp)}).`,
          stage: "done" as const,
        },
      ]);
    }
    setRestoringId(null);
  }, [buildPreview]);

  // ─────────────────────────────────────────────────────────────────────────
  const activeExecStage = useMemo(() => {
    const active = [...feed].reverse().find(
      (i): i is TaskCard => i.kind === "task" && (i.state === "thinking" || i.state === "running")
    );
    return (active?.executionStage ?? "idle") as "thinking" | "planning" | "building" | "debugging" | "finalizing" | "idle";
  }, [feed]);

  // ─────────────────────────────────────────────────────────────────────────
  // render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex bg-[#0A0A0A] text-white overflow-hidden">

      {/* ICON SIDEBAR */}
      <aside className="w-14 bg-[#0C0C0C] flex flex-col items-center py-3 shrink-0 border-r border-white/[0.04]">
        <img src="/logo-icon.png" className="w-8 h-8 rounded-xl select-none object-cover" alt="CloudeArc" />
        <div className="mt-6 flex flex-col gap-2 text-zinc-500">
          <button
            onClick={() => navigate("/app")}
            className="w-9 h-9 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition"
            title="Home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <button
            onClick={() => setTab("code")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${tab === "code" ? "bg-white/10 text-white" : "hover:bg-white/[0.06] text-zinc-500 hover:text-white"}`}
            title="Code editor"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
          <button
            onClick={() => setTab("split")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${tab === "split" ? "bg-white/10 text-white" : "hover:bg-white/[0.06] text-zinc-500 hover:text-white"}`}
            title="Split view (code + preview)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${tab === "logs" ? "bg-white/10 text-white" : "hover:bg-white/[0.06] text-zinc-500 hover:text-white"}`}
            title="Activity logs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </button>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition ${historyOpen ? "bg-white/10 text-white" : "hover:bg-white/[0.06] text-zinc-500 hover:text-white"}`}
            title="Checkpoints"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {checkpoints.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        </div>
        <div className="mt-auto">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: "#6366f1" }}
          >
            {myUser.current.name[0]}
          </div>
        </div>
      </aside>

      {/* AI PANEL */}
      <aside className="w-[360px] bg-[#111111] flex flex-col border-r border-white/[0.04] shrink-0">
        {/* Header */}
        <div className="h-12 px-4 border-b border-white/[0.04] flex items-center gap-3 shrink-0">
          <AgentAvatar />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-white/80">CloudeArc</span>
            {(() => {
              const activeTask = [...feed].reverse().find(
                (i): i is TaskCard => i.kind === "task" && (i.state === "thinking" || i.state === "running")
              );
              if (activeTask) {
                const phase = PHASE_META[activeTask.executionStage] ?? PHASE_META.thinking;
                return (
                  <div className="flex items-center gap-1.5 mt-px">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: phase.dot }} />
                    <span className="text-[10px] truncate" style={{ color: phase.color }}>
                      {phase.label.charAt(0) + phase.label.slice(1).toLowerCase()}
                      {activeTask.fileCount > 0 ? ` · ${activeTask.fileCount} file${activeTask.fileCount !== 1 ? "s" : ""}` : "…"}
                    </span>
                  </div>
                );
              }
              return <div className="text-[10px] text-zinc-600 mt-px">Ready to build</div>;
            })()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 flex flex-col gap-0">
          {feed.length === 0 && (
            <div className="pl-1 py-1 mt-1">
              <p className="text-[12.5px] leading-[1.8] text-zinc-400">
                {prompt
                  ? <>I'm ready to build <span className="text-zinc-200 font-medium">"{prompt.length > 50 ? prompt.slice(0, 50) + "…" : prompt}"</span>. Hit send to start, or describe something different below.</>
                  : <>Hi! I'm CloudeArc. Describe what you'd like to build and I'll write the full code and show you a live preview.</>}
              </p>
            </div>
          )}

          {feed.map((item, idx) => {
            const prev = feed[idx - 1];
            // Add a separator gap before user messages and after task cards
            const needsGap = item.kind === "user" || (prev && (prev.kind === "user" || prev.kind === "task"));
            return item.kind === "user" ? (
              <div key={item.id} className={`flex flex-col items-end gap-0.5 py-1.5 ${needsGap ? "mt-3" : "mt-1"}`}>
                <span className="text-[9px] text-zinc-600 mr-1 select-none">You</span>
                <div className="max-w-[88%] bg-zinc-800 border border-white/[0.1] rounded-2xl rounded-tr-md px-3 py-2 text-[12.5px] text-zinc-200 leading-relaxed">
                  {item.content}
                </div>
              </div>
            ) : item.kind === "narrative" ? (
              <div key={item.id} className="mt-0.5">
                <AgentBubble msg={item} />
              </div>
            ) : item.kind === "thought" ? (
              <div key={item.id} className="pl-1 py-0.5 mt-0.5">
                <ThoughtBlock data={item.data} defaultCollapsed={true} />
              </div>
            ) : item.kind === "task" ? (
              <div key={item.id} className={needsGap ? "mt-2" : "mt-1"}>
                <BuildStatusLine task={item} files={files} />
              </div>
            ) : item.kind === "converse" ? (
              <div key={item.id} className="mt-1">
                <ConverseAnswer msg={item} />
              </div>
            ) : (
              <div key={item.id} className="mt-1">
                <CollaborateView msg={item} />
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* input */}
        <div className="p-3 border-t border-white/[0.04]">
          <div className={`bg-white/[0.04] rounded-xl p-3 transition-all ${sending ? "opacity-75" : ""}`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sending ? "Building your app..." : "Ask CloudeArc to build or change..."}
              disabled={sending}
              rows={2}
              className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-zinc-600 disabled:opacity-40 leading-5"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-zinc-700">↵ to send · ⇧↵ for newline</span>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                  ${input.trim() && !sending
                    ? "bg-white text-black hover:scale-105 active:scale-95"
                    : "bg-white/10 text-zinc-600 cursor-not-allowed"
                  }`}
              >
                {sending ? <Spinner size={13} /> : <span className="text-sm">↑</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col bg-[#0B0B0B] relative overflow-hidden">

        {/* TOP BAR */}
        <div className="h-14 border-b border-white/[0.04] flex items-center px-4 shrink-0 gap-3">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition shrink-0 group"
            title="Back to home"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600 group-hover:text-zinc-400 transition -mr-0.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            CloudeArc
          </button>

          {/* Divider + project name (click to rename) */}
          <span className="text-zinc-700 shrink-0">/</span>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitName(); }
                if (e.key === "Escape") { setEditingName(false); }
              }}
              placeholder="Project name"
              className="text-sm text-white bg-transparent border-b border-indigo-500 outline-none max-w-[240px] min-w-[80px] px-0.5 pb-px placeholder:text-zinc-600"
              style={{ width: Math.max(80, nameInput.length * 8) + "px" }}
              autoFocus
            />
          ) : (
            <button
              onClick={startEditName}
              title="Click to rename"
              className="group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition max-w-[260px] truncate"
            >
              <span className="truncate">{projectName}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-0 group-hover:opacity-60 transition">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          {/* Style mode badge */}
          {styleProfile && (
            <span
              title={styleProfile.inspiration ? `Style: ${styleProfile.label} · Inspired by ${styleProfile.inspiration.split(" — ")[0]}` : `Style: ${styleProfile.label}`}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide border border-white/[0.08] bg-white/[0.04] text-zinc-400 select-none cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 shrink-0" />
              {styleProfile.label}
            </span>
          )}

          {/* Status bar */}
          <div className="flex-1 flex justify-center">
            {(() => {
              const activeTask = [...feed].reverse().find(
                (i): i is TaskCard => i.kind === "task" && (i.state === "thinking" || i.state === "running")
              );
              const activeStep = activeTask?.steps.find((s) => s.state === "running")?.text;
              const statusText =
                sending && activeStep    ? activeStep :
                sending                  ? "Starting…" :
                previewBuilding          ? "Bundling preview…" :
                previewHtml              ? "Preview ready" :
                                           "Generate an app to see a preview";
              const isWorking = sending || previewBuilding;
              return (
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg w-full max-w-[480px]">
                  {isWorking ? (
                    <AgentLivenessIndicator
                      active={true}
                      size={14}
                      stage={activeTask?.executionStage ?? "building"}
                      className="shrink-0"
                    />
                  ) : (
                    <span className="text-white/30 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 truncate flex-1">{statusText}</span>
                  {activeModel && (
                    <span
                      className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/[0.08] text-zinc-600 truncate max-w-[110px]"
                      title={activeModel}
                    >
                      {activeModel.split("/").pop()}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Presence + actions + tabs */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Debug button — triggers auto-fix using collected console errors */}
            {consoleErrors.length > 0 && !sending && !isDebugging && (
              <button
                onClick={async () => {
                  setIsDebugging(true);
                  setConsoleErrors([]);
                  const errorSummary = consoleErrors
                    .slice(0, 5)
                    .map((e) => `[${e.level}] ${e.message}`)
                    .join("\n");
                  await runAutoFix(`Console errors detected in the preview:\n${errorSummary}`);
                  setIsDebugging(false);
                }}
                title={`Fix ${consoleErrors.length} console error${consoleErrors.length !== 1 ? "s" : ""}`}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[8px] font-bold text-black flex items-center justify-center">
                  {consoleErrors.length > 9 ? "9+" : consoleErrors.length}
                </span>
              </button>
            )}
            {isDebugging && (
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M12 3V7M12 17V21M3 12H7M17 12H21" />
                </svg>
              </div>
            )}
            {/* Refresh preview */}
            <button
              onClick={reloadPreview}
              disabled={Object.keys(files).length <= 1 || (tab !== "preview" && tab !== "split") || previewBuilding}
              title="Refresh preview"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>

            {/* Download project */}
            <button
              onClick={handleDownload}
              disabled={Object.keys(files).length === 0 || downloading}
              title="Download project as zip"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M12 3V7M12 17V21M3 12H7M17 12H21" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Presence + tabs */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center mr-1">
              <div
                title={`You (${myUser.current.name})`}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-[#0B0B0B]"
                style={{ backgroundColor: myUser.current.color }}
              >
                {myUser.current.name[0]}
              </div>
              {collabUsers.map((u, i) => (
                <div
                  key={u.id}
                  title={u.name}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-[#0B0B0B] -ml-1.5"
                  style={{ backgroundColor: u.color, zIndex: 9 - i }}
                >
                  {u.name[0]}
                </div>
              ))}
            </div>

            {(["preview", "split", "code", "logs", "map"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                title={t === "split" ? "Split view (code + preview)" : undefined}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition capitalize flex items-center gap-1.5 ${
                  tab === t
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "split" ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <line x1="12" y1="3" x2="12" y2="21" />
                    </svg>
                    split
                  </>
                ) : t}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden relative">

          {/* PREVIEW TAB */}
          {tab === "preview" && (
            <div className="w-full h-full flex flex-col relative bg-[#0A0A0A]">
              <PreviewFlash active={previewFlash} />

              {previewHtml ? (
                /* fall through to iframe below */
                null
              ) : previewBuilding ? (
                <div className="flex-1 overflow-hidden">
                  <PreviewSkeleton />
                </div>
              ) : previewError ? (
                /* Bundling failed — show the error so user can diagnose */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                  <div className="w-12 h-12 rounded-2xl border border-red-500/20 bg-red-500/[0.06] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400/70">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  </div>
                  <div className="text-center max-w-sm">
                    <div className="text-sm text-white/60 font-medium mb-1">Preview failed to build</div>
                    <div className="text-xs text-white/30 font-mono break-all leading-relaxed">{previewError.slice(0, 200)}</div>
                  </div>
                  <button
                    onClick={reloadPreview}
                    className="text-xs text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Retry bundle
                  </button>
                </div>
              ) : (
                /* No app generated yet */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-white/50">No preview yet</div>
                    <div className="text-xs text-white/25 mt-1">Generate an app to see the live preview here</div>
                  </div>
                </div>
              )}
              {previewHtml && (
                /* Server-built preview in iframe */
                <>
                  {/* Device mode toolbar */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] shrink-0">
                    <div className="flex items-center gap-1">
                    {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => {
                      const icons: Record<DeviceMode, React.ReactElement> = {
                        desktop: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                          </svg>
                        ),
                        tablet: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" />
                            <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        ),
                        mobile: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" />
                            <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        ),
                      };
                      return (
                        <button
                          key={mode}
                          onClick={() => setDeviceMode(mode)}
                          title={DEVICE_SIZES[mode].label}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition ${
                            deviceMode === mode
                              ? "bg-white/10 text-white"
                              : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]"
                          }`}
                        >
                          {icons[mode]}
                          <span>{DEVICE_SIZES[mode].label}</span>
                        </button>
                      );
                    })}
                    </div>
                    <button
                      onClick={openPreviewInNewTab}
                      title="Open in new tab"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>Open</span>
                    </button>
                  </div>

                  {/* Preview iframe */}
                  <div className="flex-1 flex items-center justify-center overflow-auto">
                    <div
                      className="transition-all duration-300 ease-in-out overflow-hidden shadow-2xl"
                      style={{
                        width: DEVICE_SIZES[deviceMode].w,
                        height: DEVICE_SIZES[deviceMode].h,
                        maxWidth: "100%",
                        maxHeight: "100%",
                        borderRadius: deviceMode !== "desktop" ? "16px" : "0",
                        border: deviceMode !== "desktop" ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        srcDoc={previewHtml ?? ""}
                        className="w-full h-full border-0"
                        title="App Preview"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ borderRadius: deviceMode !== "desktop" ? "15px" : "0" }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CODE TAB */}
          {tab === "code" && (
            <div className="flex h-full bg-[#0F0F0F]">
              {/* File tree */}
              <div className="w-56 border-r border-white/[0.04] bg-[#111111] overflow-y-auto shrink-0 flex flex-col">
                <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-600 font-semibold">Files</span>
                  <button
                    onClick={() => {
                      setNewFileName("");
                      setTimeout(() => newFileInputRef.current?.focus(), 50);
                    }}
                    title="New file"
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-zinc-600 hover:text-zinc-300 transition"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
                {newFileName !== null && (
                  <div className="px-2 pt-2">
                    <input
                      ref={newFileInputRef}
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="/newfile.js"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/20"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const name = newFileName.trim();
                          if (name) {
                            const path = name.startsWith("/") ? name : `/${name}`;
                            setFiles((prev) => ({ ...prev, [path]: "" }));
                            setActiveFile(path);
                            setNewFiles((prev) => new Set([...prev, path]));
                          }
                          setNewFileName(null);
                        } else if (e.key === "Escape") {
                          setNewFileName(null);
                        }
                      }}
                      onBlur={() => setNewFileName(null)}
                    />
                    <div className="text-[10px] text-zinc-700 mt-1 px-0.5">↵ confirm · Esc cancel</div>
                  </div>
                )}
                <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
                  {Object.keys(files).sort().map((file) => {
                    const isNew = newFiles.has(file);
                    const color = fileTypeColor(file);
                    return (
                      <div key={file} className="group relative flex items-center">
                        <button
                          onClick={() => setActiveFile(file)}
                          className={`flex-1 min-w-0 text-left px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${
                            activeFile === file
                              ? "bg-white/10 text-white"
                              : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                          } ${isNew ? "ring-1" : ""}`}
                          style={isNew ? { outline: `1px solid ${color}50` } : {}}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate font-mono">
                            {file.split("/").pop()}
                          </span>
                          {isNew && (
                            <span
                              className="ml-auto text-[8px] font-semibold uppercase tracking-wide shrink-0"
                              style={{ color }}
                            >
                              new
                            </span>
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFileDelete(file); }}
                          title={`Delete ${file}`}
                          className="absolute right-1 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all text-[11px] shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Editor toolbar */}
                <div className="h-8 px-3 border-b border-white/[0.04] flex items-center gap-2 shrink-0 bg-[#111111]">
                  <span className="text-[11px] font-mono text-zinc-500 truncate flex-1">
                    {activeFile}
                  </span>
                  {fileDiffs[activeFile] && (
                    <button
                      onClick={() => setShowDiff((v) => !v)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                        showDiff
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                      title={showDiff ? "Back to editor" : "Show what changed"}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      {showDiff ? "Editor" : "Diff"}
                    </button>
                  )}
                </div>

                {showDiff && fileDiffs[activeFile] ? (
                  <DiffEditor
                    height="100%"
                    theme="vs-dark"
                    original={fileDiffs[activeFile].original}
                    modified={fileDiffs[activeFile].modified}
                    language={
                      activeFile.endsWith(".ts") || activeFile.endsWith(".tsx") ? "typescript" :
                      activeFile.endsWith(".css") ? "css" :
                      activeFile.endsWith(".json") ? "json" :
                      activeFile.endsWith(".html") ? "html" : "javascript"
                    }
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      readOnly: true,
                      renderSideBySide: true,
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      padding: { top: 12 },
                    }}
                  />
                ) : (
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    path={activeFile}
                    defaultLanguage="javascript"
                    value={files[activeFile] || ""}
                    onChange={(value) => {
                      const updated = value || "";
                      setFiles((prev) => ({ ...prev, [activeFile]: updated }));
                      debouncedWrite(activeFile, updated);
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      smoothScrolling: true,
                      automaticLayout: true,
                      padding: { top: 16 },
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      lineNumbers: "on",
                      renderLineHighlight: "line",
                      overviewRulerLanes: 0,
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {tab === "logs" && (
            <div className="h-full overflow-y-auto bg-[#0A0A0A]">
              <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Activity Log</span>
                <span className="text-[11px] text-zinc-700">
                  {feed.flatMap((i) => i.kind === "task" ? i.steps : []).length} events
                </span>
              </div>
              <div className="p-4 space-y-px font-mono">
                {feed.flatMap((item, taskIdx) =>
                  item.kind === "task"
                    ? [
                        <div key={`task-${item.id}`} className="flex items-center gap-2 py-1.5 mt-2 first:mt-0">
                          <span className="text-[10px] text-zinc-700 uppercase tracking-widest shrink-0">Task {taskIdx + 1}</span>
                          <div className="flex-1 h-px bg-white/[0.04]" />
                          <span className={`text-[10px] shrink-0 ${
                            item.state === "done" ? "text-emerald-600" :
                            item.state === "error" ? "text-red-500" :
                            "text-zinc-600"
                          }`}>
                            {item.state === "done" ? "completed" : item.state === "error" ? "failed" : "running"}
                          </span>
                        </div>,
                        ...item.steps.map((s) => (
                          <div
                            key={s.id}
                            className={`flex items-start gap-3 text-xs py-[3px] pl-3 rounded ${
                              s.state === "running" ? "bg-white/[0.02]" : ""
                            }`}
                          >
                            <span className={`shrink-0 w-3 text-center mt-px ${
                              s.state === "done"    ? "text-emerald-700" :
                              s.state === "error"   ? "text-red-500" :
                              "text-zinc-600"
                            }`}>
                              {s.state === "done" ? "✓" : s.state === "error" ? "✗" : "›"}
                            </span>
                            <span className={
                              s.state === "running" ? "text-zinc-300" :
                              s.state === "done"    ? "text-zinc-600" :
                              "text-red-400"
                            }>
                              {s.text}
                              {s.path && (
                                <span className="ml-2 opacity-50" style={{ color: fileTypeColor(s.path) }}>
                                  {s.path}
                                </span>
                              )}
                              {s.state === "running" && (
                                <span className="ml-1.5 inline-flex gap-[2px]">
                                  <span className="ca-dot w-1 h-1 rounded-full bg-zinc-500 inline-block" />
                                  <span className="ca-dot w-1 h-1 rounded-full bg-zinc-500 inline-block" style={{ animationDelay: "0.2s" }} />
                                  <span className="ca-dot w-1 h-1 rounded-full bg-zinc-500 inline-block" style={{ animationDelay: "0.4s" }} />
                                </span>
                              )}
                            </span>
                          </div>
                        )),
                      ]
                    : []
                )}
                {feed.flatMap((i) => i.kind === "task" ? i.steps : []).length === 0 && (
                  <div className="text-zinc-700 text-xs py-4 text-center">No activity yet. Send a message to get started.</div>
                )}
              </div>
            </div>
          )}

          {/* MAP TAB */}
          {tab === "map" && (
            <div className="h-full overflow-hidden">
              <DependencyMap
                files={files}
                activeFile={activeFile}
                building={feed.some((i) => i.kind === "task" && (i.state === "thinking" || i.state === "running"))}
              />
            </div>
          )}

          {/* SPLIT TAB */}
          {tab === "split" && (
            <div className="flex h-full bg-[#0F0F0F]">
              {/* Left: code editor with file tree */}
              <div className="flex h-full" style={{ width: "55%" }}>
                {/* File tree */}
                <div className="w-44 border-r border-white/[0.04] bg-[#111111] overflow-y-auto shrink-0 flex flex-col">
                  <div className="px-3 py-2.5 border-b border-white/[0.04]">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-600 font-semibold">Files</span>
                  </div>
                  <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
                    {Object.keys(files).sort().map((file) => (
                      <button
                        key={file}
                        onClick={() => setActiveFile(file)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-mono truncate transition-colors ${
                          activeFile === file
                            ? "bg-white/[0.08] text-white"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block" style={{ backgroundColor: fileTypeColor(file) }} />
                        {file.split("/").pop()}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    path={activeFile}
                    defaultLanguage="javascript"
                    value={files[activeFile] || ""}
                    onChange={(value) => {
                      const updated = value || "";
                      setFiles((prev) => ({ ...prev, [activeFile]: updated }));
                      debouncedWrite(activeFile, updated);
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      smoothScrolling: true,
                      automaticLayout: true,
                      padding: { top: 12 },
                      scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                      lineNumbers: "on",
                      renderLineHighlight: "line",
                      overviewRulerLanes: 0,
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-white/[0.04] shrink-0" />

              {/* Right: live preview */}
              <div className="flex flex-col bg-[#0A0A0A]" style={{ width: "45%" }}>
                {/* Preview toolbar */}
                <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.04] shrink-0 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: previewHtml ? "#34d399" : previewBuilding ? "#f472b6" : sending ? "#a78bfa" : "#52525b" }} />
                    <span className="text-[10px] text-zinc-500 truncate">
                      {previewBuilding ? "Bundling…" : previewHtml ? "Live preview" : sending ? "Waiting for code…" : "No preview yet"}
                    </span>
                    {(sending || previewBuilding) && (
                      <span className="px-1 py-px rounded text-[8px] font-bold tracking-widest ca-dot" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => {
                      const modeIcons: Record<DeviceMode, React.ReactElement> = {
                        desktop: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
                        tablet: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" /></svg>,
                        mobile: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" /></svg>,
                      };
                      return (
                        <button
                          key={mode}
                          onClick={() => setDeviceMode(mode)}
                          title={DEVICE_SIZES[mode].label}
                          className={`w-6 h-6 flex items-center justify-center rounded transition ${deviceMode === mode ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                        >
                          {modeIcons[mode]}
                        </button>
                      );
                    })}
                    {previewHtml && (
                      <>
                        <div className="w-px h-3.5 bg-white/[0.06] mx-1" />
                        <button
                          onClick={openPreviewInNewTab}
                          title="Open in new tab"
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview content */}
                <div className="flex-1 flex items-center justify-center overflow-auto relative">
                  <PreviewFlash active={previewFlash} />
                  {previewBuilding ? (
                    <PreviewSkeleton />
                  ) : previewError ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6">
                      <div className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/[0.06] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400/70">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                      </div>
                      <div className="text-center max-w-xs">
                        <div className="text-xs text-white/50 font-medium mb-1">Preview failed</div>
                        <div className="text-[10px] text-white/25 font-mono break-all leading-relaxed">{previewError.slice(0, 160)}</div>
                      </div>
                      <button onClick={reloadPreview} className="text-[10px] text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-3 py-1 rounded-lg transition-colors">
                        Retry
                      </button>
                    </div>
                  ) : previewHtml ? (
                    <div
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        width: deviceMode === "desktop" ? "100%" : DEVICE_SIZES[deviceMode].w,
                        height: deviceMode === "desktop" ? "100%" : DEVICE_SIZES[deviceMode].h,
                        maxWidth: "100%",
                        maxHeight: "100%",
                        borderRadius: deviceMode !== "desktop" ? "12px" : "0",
                        border: deviceMode !== "desktop" ? "1px solid rgba(255,255,255,0.08)" : "none",
                        boxShadow: deviceMode !== "desktop" ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
                      }}
                    >
                      <iframe
                        ref={splitIframeRef}
                        srcDoc={previewHtml}
                        className="w-full h-full border-0"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ borderRadius: deviceMode !== "desktop" ? "11px" : "0" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 px-6">
                      {sending ? (
                        <>
                          <div className="w-10 h-10 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] flex items-center justify-center">
                            <span className="inline-block w-4 h-4 rounded-full border-[1.5px] border-violet-600 border-t-violet-300 animate-spin" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-white/40">Watching for code…</div>
                            <div className="text-[10px] text-white/20 mt-0.5">Preview appears after first bundle</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/25">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M3 9h18M9 21V9" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-white/35">No preview yet</div>
                            <div className="text-[10px] text-white/20 mt-0.5">Build an app to see it here</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FILE PANEL OVERLAY */}
          {filePanelOpen && (
            <div className="absolute top-0 right-0 h-full w-64 bg-[#0D0D0D] border-l border-white/[0.06] z-50 flex flex-col">
              <div className="h-12 flex items-center justify-between px-3 border-b border-white/[0.04]">
                <span className="text-xs text-white/50 uppercase tracking-wide font-semibold">Explorer</span>
                <button
                  onClick={() => setFilePanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 text-xs text-white/50 space-y-0.5 overflow-y-auto flex-1">
                {Object.keys(files).sort().map((file) => (
                  <div
                    key={file}
                    className="group relative flex items-center"
                  >
                    <div
                      onClick={() => { setActiveFile(file); setTab("code"); setFilePanelOpen(false); }}
                      className={`flex-1 min-w-0 cursor-pointer hover:text-white hover:bg-white/[0.04] px-2 py-1.5 rounded font-mono truncate transition ${activeFile === file ? "text-white" : ""}`}
                    >
                      {file}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFileDelete(file); }}
                      title={`Delete ${file}`}
                      className="absolute right-1 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all text-[11px] shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILE PANEL BUTTON */}
          <button
            onClick={() => setFilePanelOpen((v) => !v)}
            className="absolute top-4 right-4 group z-10"
            title="File explorer"
          >
            <div className="relative w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md overflow-hidden transition-all hover:bg-white/[0.06] hover:border-white/[0.16]">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white/60 group-hover:text-white transition">
                  <path d="M4 6.5C4 5.67 4.67 5 5.5 5H9L10.5 7H18.5C19.33 7 20 7.67 20 8.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 11H16M8 14H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </button>
        </div>

      </main>

      {/* HISTORY / CHECKPOINTS PANEL */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setHistoryOpen(false)}>
          <div
            className="absolute left-14 top-0 bottom-0 w-72 bg-[#161616] border-r border-white/[0.06] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04] shrink-0">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-medium text-white/80">Checkpoints</span>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Checkpoint list */}
            <div className="flex-1 overflow-y-auto py-2">
              {checkpoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Checkpoints are saved automatically after each successful build. None yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-px px-2">
                  {[...checkpoints].reverse().map((cp, idx) => {
                    const isRestoring = restoringId === cp.id;
                    const isLatest = idx === 0;
                    return (
                      <div
                        key={cp.id}
                        className="group relative rounded-lg p-3 hover:bg-white/[0.04] transition"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Timeline dot */}
                          <div className="mt-1 shrink-0 flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${isLatest ? "bg-indigo-400" : "bg-zinc-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-zinc-200 leading-snug line-clamp-2 font-medium">{cp.label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-zinc-500">{relativeTime(cp.timestamp)}</span>
                              <span className="text-[11px] text-zinc-600">·</span>
                              <span className="text-[11px] text-zinc-500">{cp.fileCount} file{cp.fileCount !== 1 ? "s" : ""}</span>
                              {isLatest && (
                                <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">latest</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Restore button */}
                        <button
                          disabled={isRestoring || restoringId !== null}
                          onClick={() => restoreCheckpoint(cp)}
                          className="mt-2 ml-4 flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {isRestoring ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </svg>
                              Restoring…
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                              </svg>
                              Restore
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-white/[0.04] shrink-0">
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Up to 20 checkpoints are kept per project. Restoring replaces the current preview.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
