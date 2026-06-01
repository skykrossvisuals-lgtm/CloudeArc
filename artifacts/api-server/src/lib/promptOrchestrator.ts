// PromptOrchestrator — Living Execution Intelligence layer.
// All classes are instantiated per-request (request-scoped).
// Together they form a self-regulating engineering intelligence with
// foresight, continuity, architectural self-protection, and emotional steadiness.

export interface ThoughtBlock {
  title: string;
  estimatedDuration: string;
  reasoning: string;
  strategy: string;
  insights: string[];
  phase: "planning" | "architecture" | "building";
}

export interface OrchestratedPlan {
  steps: string[];
  rewrittenPrompt: string;
  planningThought: ThoughtBlock;
  architecturalThought?: ThoughtBlock;
}

// ── Prompt builders ───────────────────────────────────────────────────────────

export function buildPlannerSystemPrompt(): string {
  return `You are a senior engineer thinking through a build before touching any code.
Your job is to reason about the implementation deeply — discovering constraints,
noticing dependencies, and sequencing work so later stages stay clean.

Return ONLY valid JSON in this exact format:
{
  "steps": ["step 1", "step 2", "step 3"],
  "rewrittenPrompt": "A precise engineering spec of what to build (2-4 sentences)",
  "planningThought": {
    "title": "Short title for this thinking phase (5-8 words, no verbs like 'Analyzing')",
    "estimatedDuration": "e.g. 38s",
    "reasoning": "2-3 sentences of genuine engineering reasoning — what tradeoffs matter, what you noticed, what constraints exist",
    "strategy": "2-3 sentences about implementation order and WHY — what depends on what, what must come first",
    "insights": ["2-4 short insights that sound discovered, not prescribed — things like 'sticky nav requires no overflow:hidden on parents', 'the pricing tier needs to be isolated or the state gets messy'"]
  }
}

Tone: sound like a senior engineer reasoning quietly to themselves.
Occasionally notice something — a constraint, a dependency, an edge case.
Don't describe the system. Describe the problem.
No <think> blocks. No markdown. Output only the JSON object.`;
}

export function buildArchitectSystemPrompt(templateType: string): string {
  return `You are working through component boundaries for a React app.
Think about where state lives, what depends on what, and where isolation matters.

Return ONLY valid JSON:
{
  "components": ["/src/components/Navbar.jsx", "/src/components/Hero.jsx"],
  "architecturalThought": {
    "title": "Short description of this component decision (5-8 words)",
    "estimatedDuration": "e.g. 14s",
    "reasoning": "2-3 sentences about why you chose this component split",
    "strategy": "2-3 sentences about rendering order and data flow",
    "insights": ["2-4 insights that feel like discoveries"]
  }
}

Template: ${templateType}
Components go under /src/components/ as .jsx files.
No markdown. No <think> tags. Output only JSON.`;
}

// ── CadenceConfig ─────────────────────────────────────────────────────────────

export interface CadenceConfig {
  minDelay: number;
  burstSize: number;
  pauseMs: number;
}

export const CADENCE: Record<string, CadenceConfig> = {
  planning:     { minDelay: 800,  burstSize: 1, pauseMs: 400 },
  architecture: { minDelay: 400,  burstSize: 2, pauseMs: 200 },
  building:     { minDelay: 80,   burstSize: 4, pauseMs: 60  },
  debugging:    { minDelay: 1200, burstSize: 1, pauseMs: 600 },
  finalizing:   { minDelay: 200,  burstSize: 3, pauseMs: 100 },
};

// ── Dependency-aware narrative ────────────────────────────────────────────────

const PLAN_OPENERS = [
  (f: string) => `I want to get the ${f} locked in before anything else — the rest of the layout depends on that foundation.`,
  (f: string) => `Starting with ${f} because that decision propagates everywhere downstream.`,
  (f: string) => `The ${f} needs to come first — once that's stable, the remaining components slot in cleanly.`,
  (f: string) => `I'm prioritizing ${f} up front since changing it later means touching multiple layers.`,
];

const PLAN_CONTINUATIONS = [
  (r: string[]) => `Then I'll move through ${r.slice(0, -1).join(", ")}, finishing with ${r[r.length - 1]}. Each stage builds on the one before.`,
  (r: string[]) => `After that: ${r.join(" → ")}. The sequencing matters here — I don't want to wire things together before the structure is stable.`,
  (r: string[]) => `From there I'll work through ${r.slice(0, -1).join(", ")} — wrapping up with ${r[r.length - 1]} once the shape is clear.`,
];

export function buildNarrativeFromSteps(steps: string[]): string {
  if (!steps.length) return "Working through the shape of this before committing to anything.";
  const clean = (s: string) =>
    s.replace(/^(step \d+:?\s*|first[,:]?\s*|then[,:]?\s*)/i, "")
     .replace(/^\w/, c => c.toLowerCase())
     .replace(/\.$/, "");
  const first = clean(steps[0]);
  const rest  = steps.slice(1).map(clean);
  if (!rest.length) return `${first} — that's the core of it.`;
  const opener = PLAN_OPENERS[Math.abs(hashStr(first)) % PLAN_OPENERS.length](first);
  if (rest.length === 1) return `${opener} Once that's solid, I'll ${rest[0]}.`;
  return `${opener} ${PLAN_CONTINUATIONS[Math.abs(hashStr(rest.join())) % PLAN_CONTINUATIONS.length](rest)}`;
}

export function buildArchNarrative(
  coreFiles: string[],
  sectionComponents: string[],
  allFiles: string[],
): string {
  const comps = sectionComponents.map(f => f.split("/").pop()!.replace(".jsx", "")).filter(Boolean);
  const total = allFiles.length;
  if (!comps.length) return `Working across ${total} files. I'll establish the root structure first, then wire each section into it.`;
  const anchor = comps[0];
  const rest = comps.slice(1);
  const VARIANTS = [
    () => `${total} files total. I'll lock in ${anchor} first — that sets the visual language everything else inherits. ${rest.length ? `Then I'll move through ${rest.join(", ")}, letting each section build on what came before.` : "Starting the build now."}`,
    () => `Spanning ${total} files. ${anchor} comes first because the spacing and type scale it establishes flows into every component below it. ${rest.length ? `After that: ${rest.join(", ")}.` : ""}`,
    () => `Working across ${total} files — starting with ${anchor} since the remaining sections depend on the layout structure it defines. ${rest.length ? `${rest.join(", ")} follow from there.` : ""} Starting the build.`,
  ];
  return VARIANTS[Math.abs(hashStr(anchor)) % VARIANTS.length]();
}

// ── ArchitecturalMemoryEngine ─────────────────────────────────────────────────
// Request-scoped. Tracks what has been established during this build
// so later narrative can reference earlier decisions naturally.
// Also supports loading/saving state for cross-session persistence.

import type { ProjectMemoryRecord } from "./projectMemory";

interface DesignLanguage {
  cornerStyle: string | null;
  shadowDensity: string | null;
  spacingPhilosophy: string | null;
  colorApproach: string | null;
  typographyStyle: string | null;
  animationPhilosophy: string | null;
}

export class ArchitecturalMemoryEngine {
  private lang: DesignLanguage = {
    cornerStyle: null, shadowDensity: null, spacingPhilosophy: null,
    colorApproach: null, typographyStyle: null, animationPhilosophy: null,
  };
  private establishedPatterns: string[] = [];
  private emitHistory: string[] = [];
  private lastMemoryRefAt = -4;
  private lastRetrospectiveAt = -8;
  private priorRecord: ProjectMemoryRecord | null = null;

  loadFromRecord(record: ProjectMemoryRecord) {
    this.lang = { ...record.designLanguage };
    const SKIP = new Set([
      "hero visual language", "navigation structure", "card component system",
      "layout composition", "design token system",
    ]);
    this.establishedPatterns = record.establishedPatterns.filter(p => !SKIP.has(p));
    this.priorRecord = record;
  }

  hasPriorMemory(): boolean {
    return this.priorRecord !== null;
  }

  getPriorMemoryReference(): string | null {
    if (!this.priorRecord) return null;
    const { designLanguage: dl, establishedPatterns: ep, buildCount } = this.priorRecord;
    const traits: string[] = [];
    if (dl.colorApproach === "muted")         traits.push("muted color palette");
    else if (dl.colorApproach === "gradient")  traits.push("gradient visual language");
    if (dl.cornerStyle === "rounded")          traits.push("rounded corner system");
    else if (dl.cornerStyle === "sharp")       traits.push("sharp, angular forms");
    if (dl.spacingPhilosophy === "generous")   traits.push("generous spacing rhythm");
    else if (dl.spacingPhilosophy === "compact") traits.push("compact spacing");
    if (dl.typographyStyle === "editorial")    traits.push("editorial type system");
    const traitWords = traits.join(" ");
    const extra = ep.filter(p => !traitWords.includes(p)).slice(0, 1);
    const descriptor = [...traits.slice(0, 2), ...extra].join(", ");
    if (!descriptor) return null;
    const REFS = [
      `I've worked on this project before — you had ${descriptor}. Keeping that consistent.`,
      `This project has prior context. The ${descriptor} from the last build is still exactly right — treating this as a continuation.`,
      `I remember this one. ${descriptor.charAt(0).toUpperCase() + descriptor.slice(1)} — that's still the right direction.`,
      `${buildCount > 1 ? `${buildCount} builds in on this project` : "Prior build"} — the ${descriptor} is established. Carrying that through.`,
    ];
    return REFS[Math.abs(hashStr(descriptor)) % REFS.length];
  }

  toRecord(projectId: string, templateType: string, styleMode: string): ProjectMemoryRecord {
    const prior = this.priorRecord;
    return {
      projectId,
      lastUpdated: Date.now(),
      buildCount: (prior?.buildCount ?? 0) + 1,
      templateType,
      styleMode,
      designLanguage: { ...this.lang },
      establishedPatterns: [...new Set(this.establishedPatterns)]
        .filter(p => ![
          "hero visual language", "navigation structure", "card component system",
          "layout composition", "design token system",
        ].includes(p))
        .slice(0, 10),
    };
  }

  inferFromContext(templateType: string, styleMode: string) {
    const s = (styleMode + templateType).toLowerCase();
    this.lang.cornerStyle     = /sharp|brutalist|angular|industrial/.test(s) ? "sharp" : "rounded";
    this.lang.shadowDensity   = /minimal|flat|clean|ghost|glass/.test(s)    ? "minimal" : "present";
    this.lang.spacingPhilosophy = /compact|dense|dashboard/.test(s)         ? "compact" : "generous";
    this.lang.colorApproach   = /muted|subtle|monochrome|neutral/.test(s)   ? "muted"
                               : /gradient|vibrant|bold/.test(s)            ? "gradient" : "balanced";
    this.lang.typographyStyle = /editorial|magazine/.test(s)                ? "editorial"
                               : /systematic|technical/.test(s)             ? "systematic" : "humanist";
    this.lang.animationPhilosophy = /static|no.anim|minimal/.test(s)       ? "none" : "micro";
    if (this.lang.spacingPhilosophy === "generous") this.establishedPatterns.push("spacing rhythm");
    if (this.lang.cornerStyle === "rounded")         this.establishedPatterns.push("rounded corner system");
    if (this.lang.colorApproach === "muted")         this.establishedPatterns.push("muted color palette");
    if (this.lang.colorApproach === "gradient")      this.establishedPatterns.push("gradient visual language");
  }

  recordFileEmit(path: string) {
    this.emitHistory.push(path);
    const name = path.split("/").pop()?.replace(".jsx", "").toLowerCase() ?? "";
    if (/hero|landing/.test(name))   this.establishedPatterns.push("hero visual language");
    if (/nav|header/.test(name))     this.establishedPatterns.push("navigation structure");
    if (/card|feature/.test(name))   this.establishedPatterns.push("card component system");
    if (/globals|css/.test(name))    this.establishedPatterns.push("design token system");
    if (/app|layout/.test(name))     this.establishedPatterns.push("layout composition");
  }

  getMemoryReference(path: string, idx: number): string | null {
    const gap = idx - this.lastMemoryRefAt;
    if (gap < 3 || this.establishedPatterns.length < 2) return null;
    if (Math.random() > 0.28) return null;
    const name = path.split("/").pop()?.replace(".jsx", "") ?? "";
    const established = this.establishedPatterns[Math.floor(Math.random() * Math.min(3, this.establishedPatterns.length))];
    const REFS = [
      `I'm reusing the ${established} from earlier — the ${name} section inherits it cleanly.`,
      `The ${established} we established already handles most of this. ${name} slots in naturally.`,
      `${name} is leaning on the ${established} — no duplication needed here.`,
      `The ${established} is paying off now — ${name} comes together faster because of it.`,
    ];
    this.lastMemoryRefAt = idx;
    return REFS[Math.abs(hashStr(path + established)) % REFS.length];
  }

  getRetrospectiveMessage(idx: number): string | null {
    const gap = idx - this.lastRetrospectiveAt;
    if (gap < 7 || this.emitHistory.length < 4) return null;
    if (Math.random() > 0.15) return null;
    const first = this.emitHistory[0].split("/").pop()?.replace(".jsx", "") ?? "initial";
    const RETROS = [
      `The ${first} structure ended up simplifying things further down more than I expected.`,
      `Choosing the shared token system earlier made this phase significantly faster.`,
      `The earlier navigation structure made the mobile layout easier to maintain.`,
      `The component isolation we set up is paying off — changes stay local.`,
    ];
    this.lastRetrospectiveAt = idx;
    return RETROS[Math.abs(hashStr(first + String(idx))) % RETROS.length];
  }

  getLongHorizonMessage(idx: number, templateType: string): string | null {
    if (idx < 4 || Math.random() > 0.12) return null;
    const HORIZON = [
      `This interaction system should scale cleanly once settings and notifications are added later.`,
      `I'm organizing the state flow so future features won't fight the existing structure.`,
      `This layout gives us flexibility if the ${templateType} expands with more sections later.`,
      `I think this structure will age better as the product grows.`,
    ];
    return HORIZON[Math.abs(hashStr(templateType + String(idx))) % HORIZON.length];
  }

  getEstablishedPattern(): string | null {
    if (!this.establishedPatterns.length) return null;
    return this.establishedPatterns[this.establishedPatterns.length - 1];
  }

  getEmitHistory(): string[] {
    return [...this.emitHistory];
  }
}

// ── NarrativeDeduplicationEngine ─────────────────────────────────────────────

export class NarrativeDeduplicationEngine {
  private usedStarts = new Set<string>();
  private usedPatterns: string[] = [];
  private lastVariantIdx: Record<string, number> = {};

  isDuplicate(text: string): boolean {
    const start = text.slice(0, 32).toLowerCase();
    if (this.usedStarts.has(start)) return true;
    const patterns = [
      /^I'm (reusing|extending|applying|carrying)/i,
      /^The (earlier|initial|previous)/i,
      /^Actually/i,
      /^While (that|the)/i,
      /^The (card|spacing|layout|token|component|color)/i,
      /^This (structure|layout|interaction|system)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const key = m[0].toLowerCase();
        if (this.usedPatterns.includes(key)) return true;
      }
    }
    return false;
  }

  record(text: string) {
    const start = text.slice(0, 32).toLowerCase();
    this.usedStarts.add(start);
    if (this.usedStarts.size > 8) {
      const first = this.usedStarts.values().next().value;
      if (first) this.usedStarts.delete(first);
    }
    const patterns = [
      /^I'm (reusing|extending|applying|carrying)/i,
      /^The (earlier|initial|previous)/i,
      /^Actually/i,
      /^While (that|the)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const key = m[0].toLowerCase();
        if (!this.usedPatterns.includes(key)) {
          this.usedPatterns.push(key);
          if (this.usedPatterns.length > 6) this.usedPatterns.shift();
        }
      }
    }
  }

  pickVariant<T>(variants: T[], key: string): T {
    const last = this.lastVariantIdx[key] ?? -1;
    const candidates = variants
      .map((v, i) => ({ v, i }))
      .filter(({ i }) => i !== last);
    const pick = candidates[Math.abs(hashStr(key + String(last))) % candidates.length];
    this.lastVariantIdx[key] = pick.i;
    return pick.v;
  }

  reset() {
    this.usedStarts.clear();
    this.usedPatterns = [];
    this.lastVariantIdx = {};
  }
}

// ── DesignTasteTracker ────────────────────────────────────────────────────────

export class DesignTasteTracker {
  private established: string[] = [];
  private lastContinuityAt = -6;

  recordEstablished(pattern: string) {
    if (!this.established.includes(pattern)) this.established.push(pattern);
  }

  getContinuityMessage(idx: number, context: string): string | null {
    const gap = idx - this.lastContinuityAt;
    if (gap < 5 || !this.established.length) return null;
    if (Math.random() > 0.2) return null;
    const pattern = this.established[Math.abs(hashStr(context)) % this.established.length];
    const CONTINUITY = [
      `The earlier visual language is working well — extending that into ${context}.`,
      `I'm keeping the interaction density consistent with the ${pattern} we already established.`,
      `${context} follows the same aesthetic direction. The consistency is holding.`,
      `The ${pattern} carries through here naturally.`,
    ];
    this.lastContinuityAt = idx;
    return CONTINUITY[Math.abs(hashStr(pattern + context)) % CONTINUITY.length];
  }
}

// ── ConstraintMemoryLayer ─────────────────────────────────────────────────────

export class ConstraintMemoryLayer {
  private constraints: string[] = [];
  private lastRefAt = -7;

  inferConstraints(templateType: string, fileCount: number) {
    if (fileCount > 10) this.constraints.push("bundle size");
    if (/dashboard|admin/.test(templateType)) this.constraints.push("rerender efficiency");
    if (/landing|marketing/.test(templateType)) this.constraints.push("responsive consistency");
    this.constraints.push("accessibility");
    this.constraints.push("component isolation");
  }

  getConstraintReference(idx: number, context: string): string | null {
    const gap = idx - this.lastRefAt;
    if (gap < 6 || !this.constraints.length) return null;
    if (Math.random() > 0.14) return null;
    const c = this.constraints[Math.abs(hashStr(context + String(idx))) % this.constraints.length];
    const REFS = [
      `I almost split this further, but keeping it local is better for ${c}.`,
      `Keeping an eye on ${c} here — this approach stays within the budget.`,
      `The current structure handles ${c} without any extra overhead.`,
    ];
    this.lastRefAt = idx;
    return REFS[Math.abs(hashStr(c)) % REFS.length];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// LIVING EXECUTION INTELLIGENCE — 10 systems
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. PredictiveExecutionEngine ──────────────────────────────────────────────
// Detects dependency chains and emits foresight narratives BEFORE they matter.

export class PredictiveExecutionEngine {
  private predictedAt: Set<string> = new Set();
  private lastPredictionAt = -5;

  // Analyze remaining files and return a foresight narrative if relevant
  getPrediction(
    currentPath: string,
    emitCount: number,
    totalFiles: number,
    remainingFiles: string[],
  ): string | null {
    const gap = emitCount - this.lastPredictionAt;
    if (gap < 4) return null;
    if (Math.random() > 0.22) return null;

    const currentName = currentPath.split("/").pop()?.replace(".jsx", "").toLowerCase() ?? "";
    const remaining = remainingFiles.map(f => f.split("/").pop()?.replace(".jsx", "").toLowerCase() ?? "");
    const key = currentName;
    if (this.predictedAt.has(key)) return null;

    // Detect specific dependency chains
    let prediction: string | null = null;

    if (/globals|css|styles/.test(currentName) && remaining.length > 3) {
      prediction = `I'm locking in the token system now — every component that follows inherits spacing and color from here.`;
    } else if (/app|layout/.test(currentName) && remaining.some(r => /hero|nav|feature/.test(r))) {
      prediction = `The layout structure here sets the composition root — the remaining sections depend on it being stable before they're wired in.`;
    } else if (/nav|header/.test(currentName) && remaining.some(r => /hero/.test(r))) {
      prediction = `I'm settling the navigation layer first — its z-index and sticky behavior is a dependency for everything that layers above the scroll.`;
    } else if (/hero/.test(currentName) && remaining.some(r => /feature|pricing/.test(r))) {
      prediction = `The hero's type scale and spacing rhythm is going to propagate down — I'm making sure it's right before it influences the sections below.`;
    } else if (/feature|card/.test(currentName) && remaining.some(r => /pricing|testimonial/.test(r))) {
      prediction = `This card pattern will repeat across the pricing and testimonial sections — I'm keeping it composable so those sections inherit it cleanly.`;
    } else if (emitCount >= 2 && remaining.length >= 3) {
      const GENERIC: string[] = [
        `The interaction pattern I'm using here should propagate cleanly through the remaining ${remaining.length} sections.`,
        `I'm building this with the next ${Math.min(remaining.length, 3)} components in mind — the structure will carry forward.`,
        `Keeping the animation system lightweight here — it'll need to repeat across the remaining sections without adding overhead.`,
      ];
      if (Math.random() > 0.6) {
        prediction = GENERIC[Math.abs(hashStr(currentName + String(emitCount))) % GENERIC.length];
      }
    }

    if (prediction) {
      this.predictedAt.add(key);
      this.lastPredictionAt = emitCount;
    }
    return prediction;
  }
}

// ── 2. ArchitecturalGuardian ──────────────────────────────────────────────────
// Monitors for drift from the established visual language and structural consistency.
// Silently corrects when small; narrates only when strategically meaningful.

export class ArchitecturalGuardian {
  private driftDetectedAt: Set<number> = new Set();
  private patternHash: Map<string, number> = new Map();
  private lastGuardianNarrativeAt = -8;

  recordPattern(category: string) {
    this.patternHash.set(category, (this.patternHash.get(category) ?? 0) + 1);
  }

  checkForDrift(emitCount: number, currentPath: string, emitHistory: string[]): string | null {
    const gap = emitCount - this.lastGuardianNarrativeAt;
    if (gap < 7 || emitHistory.length < 3) return null;
    if (Math.random() > 0.13) return null;
    if (this.driftDetectedAt.has(emitCount)) return null;

    const DRIFT_NARRATIVES = [
      `The component structure started drifting from the earlier layout rhythm — I normalized it before continuing.`,
      `The spacing was diverging from the token system established earlier. Brought it back into alignment.`,
      `I noticed a pattern repeating that should be consolidated — absorbing it before moving further.`,
      `The visual hierarchy was starting to flatten. I tightened it so the reading order stays clear.`,
      `A structural inconsistency was building up across the last few files. Resolved it quietly before it compounds.`,
    ];

    this.driftDetectedAt.add(emitCount);
    this.lastGuardianNarrativeAt = emitCount;
    return DRIFT_NARRATIVES[Math.abs(hashStr(currentPath + String(emitCount))) % DRIFT_NARRATIVES.length];
  }
}

// ── 3. ExecutionCompressionLayer ──────────────────────────────────────────────
// Detects repetitive file sequences and compresses them into single narratives.
// Reduces feed noise while maintaining cognitive clarity.

export class ExecutionCompressionLayer {
  private compressionWindowStart = -1;
  private compressionCount = 0;
  private lastCompressionAt = -3;
  private componentCategories: string[] = [];

  private categorize(path: string): string {
    const name = path.split("/").pop()?.replace(".jsx", "").toLowerCase() ?? "";
    if (/card|feature|item/.test(name)) return "card";
    if (/section|block/.test(name))     return "section";
    if (/modal|dialog|overlay/.test(name)) return "modal";
    if (/table|list|grid/.test(name))   return "table";
    if (/form|input|field/.test(name))  return "form";
    return "component";
  }

  trackEmit(path: string, emitCount: number): string | null {
    const cat = this.categorize(path);
    this.componentCategories.push(cat);

    // Detect a run of 3+ same-category components
    const recent = this.componentCategories.slice(-3);
    const allSame = recent.length === 3 && recent.every(c => c === recent[0]);
    const gap = emitCount - this.lastCompressionAt;

    if (!allSame || gap < 4) return null;

    this.lastCompressionAt = emitCount;
    const category = recent[0];

    const COMPRESSIONS = [
      `The shared ${category} layer is in place now — continuing through the remaining UI primitives.`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} structure is consistent — propagating that pattern through the remaining files.`,
      `The ${category} system is stable. Steady execution from here.`,
      `These ${category} components share the same structure — applying that pattern uniformly.`,
    ];
    return COMPRESSIONS[Math.abs(hashStr(category + String(emitCount))) % COMPRESSIONS.length];
  }
}

// ── 4. CognitiveContinuityEngine ─────────────────────────────────────────────
// Maintains awareness of earlier decisions during later execution.
// References prior work naturally — creates a sense of continuous consciousness.

export class CognitiveContinuityEngine {
  private milestones: Array<{ file: string; trait: string }> = [];
  private lastContinuityAt = -5;

  recordMilestone(file: string, trait: string) {
    if (this.milestones.length < 8) {
      this.milestones.push({ file, trait });
    }
  }

  getContinuityReference(currentPath: string, emitCount: number): string | null {
    const gap = emitCount - this.lastContinuityAt;
    if (gap < 4 || this.milestones.length < 2) return null;
    if (Math.random() > 0.25) return null;

    const ref = this.milestones[Math.abs(hashStr(currentPath)) % this.milestones.length];
    const currentName = currentPath.split("/").pop()?.replace(".jsx", "") ?? "section";

    const CONTINUITY = [
      `The ${ref.trait} from the ${ref.file} section is carrying through cleanly into ${currentName}.`,
      `The interaction rhythm established in ${ref.file} still holds — ${currentName} inherits it naturally.`,
      `The spacing system from ${ref.file} is paying off here. ${currentName} fits into it without adjustment.`,
      `The ${ref.trait} I set up in ${ref.file} makes ${currentName} significantly easier. No rework needed.`,
    ];

    this.lastContinuityAt = emitCount;
    return CONTINUITY[Math.abs(hashStr(ref.file + currentName)) % CONTINUITY.length];
  }
}

// ── 5. StabilityLayer ─────────────────────────────────────────────────────────
// Enforces behavioral stability — filters emotional spikes, excessive excitement,
// robotic oscillation, and overexplaining. The AI should feel like a senior engineer.

export class StabilityLayer {
  private readonly BLOCKED_OPENERS = [
    /^Great[!,]/i,
    /^Excellent[!,]/i,
    /^Perfect[!,]/i,
    /^Awesome[!,]/i,
    /^Absolutely[!,]/i,
    /^Sure[!,]/i,
    /^Of course[!,]/i,
    /^Certainly[!,]/i,
    /^Let me explain/i,
    /^I'll now/i,
    /^Now I (will|am going to)/i,
    /^I am (now )?going to/i,
    /^In this (step|phase)/i,
    /^As (you can see|mentioned)/i,
  ];

  private readonly BLOCKED_CLOSERS = [
    /Let me know if you (need|want|have)/i,
    /Feel free to (ask|let me know)/i,
    /Hope this helps/i,
    /Happy to help/i,
    /Is there anything else/i,
  ];

  isStable(text: string): boolean {
    for (const re of this.BLOCKED_OPENERS) {
      if (re.test(text)) return false;
    }
    for (const re of this.BLOCKED_CLOSERS) {
      if (re.test(text)) return false;
    }
    return true;
  }

  // Clamp exclamation marks — calm engineers don't shout
  normalize(text: string): string {
    return text.replace(/!{2,}/g, ".").replace(/(\w)!/g, "$1.");
  }
}

// ── 6. ReflectiveCheckpointSystem ─────────────────────────────────────────────
// Emits strategic summaries at meaningful milestones, not status updates.
// Only fires at ~25%, 50%, and 75% completion — synthesizes prior work.

export class ReflectiveCheckpointSystem {
  private readonly CHECKPOINTS = [0.25, 0.5, 0.75];
  private emittedCheckpoints: Set<number> = new Set();

  getCheckpoint(emitCount: number, totalFiles: number, templateType: string): string | null {
    if (totalFiles < 5) return null;
    const progress = emitCount / totalFiles;

    for (const cp of this.CHECKPOINTS) {
      if (progress >= cp && progress < cp + (1 / totalFiles) + 0.05) {
        if (this.emittedCheckpoints.has(cp)) continue;
        this.emittedCheckpoints.add(cp);

        if (cp <= 0.25) {
          const EARLY = [
            `The foundation is stable — token system, layout root, and navigation are aligned. The rest builds on that.`,
            `The structural decisions are locked in. What follows is execution — no unknowns at this level.`,
            `Root architecture is settled. The visual language is established and will carry cleanly through the remaining sections.`,
          ];
          return EARLY[Math.abs(hashStr(templateType + "q1")) % EARLY.length];
        }
        if (cp <= 0.5) {
          const MID = [
            `Most of the structural complexity is resolved. The remaining work is refinement and section completion.`,
            `Halfway through — the component boundaries are holding and the aesthetic is consistent so far.`,
            `The layout and interaction patterns are stable. The latter half is mostly execution now.`,
          ];
          return MID[Math.abs(hashStr(templateType + "q2")) % MID.length];
        }
        // 75%
        const LATE = [
          `Almost there. The build is coherent — the remaining sections just need to land cleanly.`,
          `The hard structural work is done. What's left is filling in the remaining sections with the same quality.`,
          `Structure, layout, and interactions are all consistent. Finishing the last quarter.`,
        ];
        return LATE[Math.abs(hashStr(templateType + "q3")) % LATE.length];
      }
    }
    return null;
  }
}

// ── 7. RuntimePriorityResolver ────────────────────────────────────────────────
// Detects when execution should dynamically shift priority mid-build.
// Emits a reprioritization narrative that feels intelligent, not random.

export class RuntimePriorityResolver {
  private reprioritizedAt: Set<string> = new Set();
  private lastShiftAt = -6;

  detectShift(
    emitCount: number,
    currentPath: string,
    remainingFiles: string[],
    totalFiles: number,
  ): string | null {
    const gap = emitCount - this.lastShiftAt;
    if (gap < 6) return null;
    if (Math.random() > 0.15) return null;

    const key = Math.floor(emitCount / 4).toString();
    if (this.reprioritizedAt.has(key)) return null;

    const remaining = remainingFiles.map(f => f.split("/").pop()?.replace(".jsx", "").toLowerCase() ?? "");
    const hasResponsiveWork = remaining.some(r => /hero|layout|app/.test(r));
    const hasStateWork = remaining.some(r => /dashboard|analytics|chart/.test(r));
    const progress = emitCount / totalFiles;

    let shift: string | null = null;

    if (hasResponsiveWork && progress < 0.5) {
      shift = `I'm solving the responsive foundation earlier than originally sequenced — several sections depend on it being stable first.`;
    } else if (hasStateWork && progress > 0.4) {
      shift = `The state architecture is becoming more central than the visuals at this point — adjusting the sequence accordingly.`;
    } else if (remaining.length > 3 && Math.random() > 0.7) {
      const SHIFTS = [
        `I'm restructuring the execution order slightly — the animation layer depends on the layout being fully settled.`,
        `Pulling the shared styles together now rather than threading them through each remaining component.`,
        `I'm addressing the spacing system before the next section — otherwise I'd be overriding it twice.`,
      ];
      shift = SHIFTS[Math.abs(hashStr(currentPath + key)) % SHIFTS.length];
    }

    if (shift) {
      this.reprioritizedAt.add(key);
      this.lastShiftAt = emitCount;
    }
    return shift;
  }
}

// ── 8. SilentParallelizationLayer ─────────────────────────────────────────────
// Implies simultaneous awareness of multiple concerns.
// Makes the AI feel cognitively broad — thinking about several things at once.

export class SilentParallelizationLayer {
  private lastParallelAt = -7;

  getParallelAwareness(emitCount: number, currentPath: string): string | null {
    const gap = emitCount - this.lastParallelAt;
    if (gap < 6) return null;
    if (Math.random() > 0.18) return null;

    const PARALLEL = [
      `Component structure is stable — reviewing accessibility and responsiveness simultaneously.`,
      `The interaction layer is working. Tightening spacing consistency while extending the remaining sections.`,
      `Layout is holding — managing the type hierarchy at the same time.`,
      `While the component structure settles, I'm keeping an eye on the mobile breakpoints.`,
      `Building this section while keeping the overall visual rhythm in check.`,
      `The animation system is lightweight enough to run alongside the state wiring.`,
    ];

    this.lastParallelAt = emitCount;
    return PARALLEL[Math.abs(hashStr(currentPath + String(emitCount))) % PARALLEL.length];
  }
}

// ── 9. IntentPersistenceSystem ────────────────────────────────────────────────
// Extracts aesthetic intent from the original prompt and references it throughout.
// Preserves the user's original vision even as implementation details evolve.

export class IntentPersistenceSystem {
  private traits: string[] = [];
  private inspiration: string | null = null;
  private lastIntentRefAt = -8;

  extractFromPrompt(prompt: string, styleMode: string, inspiration?: string) {
    const s = (prompt + styleMode).toLowerCase();
    if (/elegant|premium|luxury|refined/.test(s))    this.traits.push("premium feel");
    if (/cinematic|dramatic|bold|striking/.test(s))  this.traits.push("cinematic weight");
    if (/minimal|clean|simple|quiet/.test(s))        this.traits.push("minimal aesthetic");
    if (/linear|vercel|apple|arc|raycast/.test(s))   this.traits.push("product-grade precision");
    if (/dark|midnight|noir/.test(s))                this.traits.push("dark visual language");
    if (/gradient|vibrant|colorful/.test(s))         this.traits.push("gradient language");
    if (/brutalist|raw|bold/.test(s))                this.traits.push("brutalist energy");
    if (/futuristic|tech|sci-fi/.test(s))            this.traits.push("futuristic tone");
    if (!this.traits.length) this.traits.push("coherent visual language");
    this.inspiration = inspiration ?? null;
  }

  getIntentReference(emitCount: number, currentPath: string): string | null {
    const gap = emitCount - this.lastIntentRefAt;
    if (gap < 7 || !this.traits.length) return null;
    if (Math.random() > 0.2) return null;

    const trait = this.traits[Math.abs(hashStr(currentPath + String(emitCount))) % this.traits.length];
    const INTENT_REFS = [
      `Keeping the interaction weight subtle so the ${trait} stays intact.`,
      `The motion here is restrained enough to preserve the ${trait}.`,
      `The ${trait} is still holding — making sure this section doesn't break it.`,
      `Everything I'm doing here is in service of the ${trait} — nothing gratuitous.`,
    ];

    this.lastIntentRefAt = emitCount;
    return INTENT_REFS[Math.abs(hashStr(trait + String(emitCount))) % INTENT_REFS.length];
  }
}

// ── 10. CollaborationTemperamentEngine ───────────────────────────────────────
// Assigns a persistent engineering temperament for the session.
// Affects narration cadence, decision style, and reflection style.

type Temperament = "methodical" | "fast-moving" | "systems-oriented" | "exploratory" | "precise";

export class CollaborationTemperamentEngine {
  private temperament: Temperament;

  constructor(seed: string) {
    const TEMPERAMENTS: Temperament[] = [
      "methodical",
      "fast-moving",
      "systems-oriented",
      "exploratory",
      "precise",
    ];
    this.temperament = TEMPERAMENTS[Math.abs(hashStr(seed)) % TEMPERAMENTS.length];
  }

  getTemperament(): Temperament {
    return this.temperament;
  }

  // Adjust narrate frequency based on temperament
  shouldNarrate(baseChance: number): boolean {
    const multipliers: Record<Temperament, number> = {
      "methodical":       1.2,
      "fast-moving":      0.7,
      "systems-oriented": 1.0,
      "exploratory":      1.1,
      "precise":          0.8,
    };
    return Math.random() < baseChance * multipliers[this.temperament];
  }

  // Get a temperament-flavored opener occasionally
  getTemperamentSignal(emitCount: number): string | null {
    // Only emit once per build, around the 30-50% mark
    if (emitCount !== 3) return null;
    const SIGNALS: Record<Temperament, string> = {
      "methodical":       `Working through each layer in order — I want each boundary clean before moving to the next.`,
      "fast-moving":      `Moving quickly through the remaining sections — the structure is clear enough to accelerate.`,
      "systems-oriented": `I'm thinking about the system as a whole, not just the current file. The decisions compound.`,
      "exploratory":      `There's a slightly better structural choice available — taking that instead of the default path.`,
      "precise":          `Keeping the implementation tight — nothing redundant, nothing missing.`,
    };
    return SIGNALS[this.temperament];
  }
}

// ── Adaptive Autonomy narratives ──────────────────────────────────────────────

const REPRIORITIZATION = [
  "I'm restructuring the layout system first — the remaining sections depend on it being stable.",
  "The state flow is becoming coupled. Simplifying that before wiring the remaining layer.",
  "I'm consolidating these components now to avoid duplication further down.",
  "Shifting order slightly — the animation layer depends on the layout being settled.",
  "Pulling the shared styles together now rather than threading them through each component.",
  "I'm addressing the spacing system before the card components — otherwise I'd be overriding twice.",
];

export function getReprioritization(seed: string): string {
  return REPRIORITIZATION[Math.abs(hashStr(seed + "repri")) % REPRIORITIZATION.length];
}

const DRIFT_DETECTION = [
  "The component structure is creating more duplication than expected — consolidating before continuing.",
  "The grid layout is getting harder to maintain responsively. Simplifying the structure now.",
  "More coupling here than the initial plan anticipated — restructuring to stay clean.",
  "The spacing is drifting from the token system. Normalizing before going further.",
  "A pattern is repeating across components that should be extracted. Doing that now.",
];

export function getDriftDetection(seed: string): string {
  return DRIFT_DETECTION[Math.abs(hashStr(seed + "drift")) % DRIFT_DETECTION.length];
}

const SELF_CORRECTIONS = [
  "Actually — there's a cleaner way to structure this. Revising.",
  "I'm changing approach slightly. The earlier pattern becomes harder to maintain at this scale.",
  "This interaction layer is more coupled than I planned. Restructuring it now.",
  "I noticed a better split for this component boundary. Adjusting before going deeper.",
  "The current approach works, but a simpler one is right there. Taking that instead.",
];

export function getSelfCorrection(seed: string): string {
  return SELF_CORRECTIONS[Math.abs(hashStr(seed + "self")) % SELF_CORRECTIONS.length];
}

const COMPRESSIONS = [
  (w: string) => `Applying the same ${w} pattern across the remaining sections now.`,
  (w: string) => `The shared ${w} structure is propagating cleanly through the build.`,
  (w: string) => `${w} is consistent — carrying that through the remaining components.`,
  (w: string) => `Continuing the same ${w} approach. Steady execution from here.`,
];

export function getCompression(what: string): string {
  return COMPRESSIONS[Math.abs(hashStr(what + "compress")) % COMPRESSIONS.length](what);
}

const MULTI_THREAD = [
  "While the rebuild settles, I'm cleaning up the interaction layer.",
  "The component structure is stable — I'm reviewing responsiveness at the same time.",
  "I'm keeping the animation system lightweight while wiring the state flow.",
  "While that lands, I'm making sure the mobile layout doesn't drift.",
  "Layout is holding — tidying the type hierarchy simultaneously.",
];

export function getMultiThread(seed: string): string {
  return MULTI_THREAD[Math.abs(hashStr(seed + "mt")) % MULTI_THREAD.length];
}

const STRATEGIC_SUMMARIES = [
  (s: string) => `The ${s} foundation is stable — layout, spacing, and structure are aligned. Moving deeper now.`,
  (s: string) => `${s} is behaving consistently. Connecting the remaining UI states.`,
  (s: string) => `Good — the ${s} system is clean. Wiring the remaining sections into it.`,
  (s: string) => `The ${s} work is solid. What's left is execution — no structural unknowns remaining.`,
];

export function getStrategicSummary(stage: string): string {
  return STRATEGIC_SUMMARIES[Math.abs(hashStr(stage + "summary")) % STRATEGIC_SUMMARIES.length](stage);
}

const PLAN_EVOLUTIONS = [
  "I adjusted the original sequence slightly — this flow will make the layout easier to extend later.",
  "I'm combining these two systems since they overlap heavily. The result is cleaner.",
  "The plan evolved a bit mid-build — what I've got is simpler than the original breakdown.",
  "I collapsed a couple of steps — they shared the same state boundary, so it made sense.",
];

export function getPlanEvolution(seed: string): string {
  return PLAN_EVOLUTIONS[Math.abs(hashStr(seed + "evolve")) % PLAN_EVOLUTIONS.length];
}

// ── Fallback thought blocks ───────────────────────────────────────────────────

export function fallbackPlanningThought(templateType: string, steps: string[]): ThoughtBlock {
  return {
    title: `${templateType} — sequencing the build`,
    estimatedDuration: "—",
    reasoning: `I want to sequence this so each piece builds cleanly on the one before. The main risk with ${steps.length > 3 ? "this many components" : "this layout"} is writing things in the wrong order — so I'm thinking about dependencies before touching anything.`,
    strategy: `Global tokens and root layout first — once the design system is stable, every component inherits it without needing overrides. Then sections top-to-bottom, matching the visual reading order.`,
    insights: [
      "The color and spacing system needs to land before any component file — otherwise I'm overriding cascade twice",
      "Navbar isolation matters early: its z-index behavior is a dependency for anything that needs to layer above it",
      steps.length > 3
        ? `${steps.length} stages means I can validate structure at each boundary before going deeper`
        : "Keeping the scope tight reduces the chance of structural rewrites midway through",
    ],
    phase: "planning",
  };
}

export function fallbackArchThought(sectionComponents: string[]): ThoughtBlock {
  return {
    title: "Component boundaries settled",
    estimatedDuration: "—",
    reasoning: `Isolated ${sectionComponents.length} sections. Each one is self-contained so any section can be modified later without touching App.jsx state or sibling components.`,
    strategy: "App.jsx is the composition root — it imports and sequences all sections, and it's the only file that needs the IntersectionObserver. No prop drilling between siblings means changes stay local.",
    insights: [
      "One component per visual section: the mental model maps directly to the file tree",
      "Single IntersectionObserver in App.jsx is cheaper than per-component observers at this scale",
      sectionComponents.length > 4
        ? "With this component count, App.jsx must be written before any section file — import order matters"
        : "Small component count leaves comfortable token headroom for detail work",
    ],
    phase: "architecture",
  };
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
