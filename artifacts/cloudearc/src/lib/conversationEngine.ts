// ── Unified Conversational Intelligence ──────────────────────────────────────
// Single source of truth for intent classification, execution gating,
// conversation memory, momentum tracking, execution confidence, and rerun protection.

import { relationshipPhaseEngine, type RelationshipPhase } from "./relationshipPhaseEngine";
export type { RelationshipPhase };

// ── Intent types ──────────────────────────────────────────────────────────────

export type Intent =
  | "casual"        // greetings, acknowledgements, social
  | "brainstorm"    // exploring ideas, what-ifs, "I have an idea"
  | "advisory"      // asking for recommendations or opinions
  | "review"        // reacting to design/UX feelings
  | "reflection"    // project recap, where are we
  | "clarification" // factual or technical questions
  | "planning"      // "I want a marketplace" — idea not yet ready to build
  | "execution"     // explicit build intent, no existing app
  | "modify"        // change/improve existing app
  | "debug";        // fix broken behavior

// ── Simple string hash ────────────────────────────────────────────────────────

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

// ── PromptExecutionRegistry ───────────────────────────────────────────────────

const RERUN_COOLDOWN_MS = 8_000;

class PromptExecutionRegistry {
  private executed = new Map<string, number>();

  wouldRerun(prompt: string): boolean {
    const h = hashStr(prompt.trim().toLowerCase());
    const ts = this.executed.get(h);
    return ts !== undefined && Date.now() - ts < RERUN_COOLDOWN_MS;
  }

  register(prompt: string): void {
    const h = hashStr(prompt.trim().toLowerCase());
    this.executed.set(h, Date.now());
    if (this.executed.size > 200) {
      const cutoff = Date.now() - 60_000;
      for (const [k, v] of this.executed) if (v < cutoff) this.executed.delete(k);
    }
  }

  clear(): void { this.executed.clear(); }
}

// ── WorkspaceRelationshipMemory ───────────────────────────────────────────────

type UserStyle = "exploratory" | "decisive" | "uncertain" | "mixed";
type AmbitionLevel = "low" | "medium" | "high";

interface MemoryEntry {
  topic: string;
  type: "preference" | "direction" | "feature" | "frustration" | "decision";
  intent: Intent;
  timestamp: number;
}

class WorkspaceRelationshipMemory {
  private entries: MemoryEntry[] = [];
  private projectDirection: string | null = null;
  private recentIntents: Intent[] = [];
  private sessionStartedAt: number = Date.now();
  private userStyle: UserStyle = "mixed";
  private ambitionLevel: AmbitionLevel = "medium";
  private frustrationSignals: number = 0;

  record(intent: Intent, userPrompt: string): void {
    this.recentIntents = [intent, ...this.recentIntents].slice(0, 12);

    const p = userPrompt.toLowerCase();

    if (/\b(darker|lighter|cinematic|minimal|premium|luxury|bold|clean|editorial|modern|elegant|vibrant|muted|airy|dense|warm|cool|high.contrast|futuristic|raw|brutalist)\b/.test(p)) {
      this.entries.push({ topic: userPrompt.slice(0, 100), type: "preference", intent, timestamp: Date.now() });
    }
    if (/\b(feature|section|page|flow|component|dashboard|navbar|hero|pricing|auth|onboarding|checkout|profile|feed)\b/.test(p)) {
      this.entries.push({ topic: userPrompt.slice(0, 100), type: "feature", intent, timestamp: Date.now() });
    }
    if (/\b(still|again|keep|already|doesn't work|not working|wrong|off|broken|flat|bland|terrible|hate|ugh)\b/.test(p)) {
      this.frustrationSignals = Math.min(this.frustrationSignals + 1, 5);
      this.entries.push({ topic: userPrompt.slice(0, 80), type: "frustration", intent, timestamp: Date.now() });
    } else {
      this.frustrationSignals = Math.max(0, this.frustrationSignals - 0.5);
    }
    if (intent === "planning" || intent === "execution") {
      this.projectDirection = userPrompt.slice(0, 150);
    }

    const recent = this.recentIntents.slice(0, 6);
    const decisiveCount = recent.filter(i => i === "execution" || i === "modify").length;
    const exploratoryCount = recent.filter(i => i === "brainstorm" || i === "planning" || i === "advisory").length;
    if (decisiveCount >= 3) this.userStyle = "decisive";
    else if (exploratoryCount >= 3) this.userStyle = "exploratory";
    else if (recent.filter(i => i === "casual" || i === "review").length >= 2) this.userStyle = "uncertain";
    else this.userStyle = "mixed";

    if (/\b(enterprise|platform|marketplace|ecosystem|scalable|multi.tenant|saas|real.time|ai.powered|ml|complex|comprehensive)\b/.test(p)) {
      this.ambitionLevel = "high";
    } else if (/\b(simple|basic|quick|small|landing|one.page|portfolio|personal)\b/.test(p)) {
      this.ambitionLevel = "low";
    }

    this.entries = this.entries.slice(-40);
  }

  buildContext(): string {
    const parts: string[] = [];
    const prefs = this.entries.filter(e => e.type === "preference").slice(-3).map(e => e.topic);
    if (prefs.length) parts.push(`Visual direction: ${prefs.join("; ")}.`);
    if (this.projectDirection) parts.push(`Project direction: ${this.projectDirection}.`);
    if (this.frustrationSignals >= 2) parts.push(`The user has shown some frustration — be especially direct and acknowledge their reaction.`);
    const ageMs = Date.now() - this.sessionStartedAt;
    if (ageMs > 10 * 60 * 1000) parts.push(`Longer session — reference earlier decisions naturally when relevant.`);
    if (this.userStyle === "exploratory") parts.push(`The user has been exploring ideas broadly — match that energy.`);
    if (this.userStyle === "decisive") parts.push(`The user has been moving quickly and decisively — be efficient and direct.`);
    return parts.join(" ");
  }

  getSessionAge(): "early" | "mid" | "deep" {
    const ageMs = Date.now() - this.sessionStartedAt;
    if (ageMs < 3 * 60 * 1000) return "early";
    if (ageMs < 12 * 60 * 1000) return "mid";
    return "deep";
  }

  getRecentIntents(): Intent[] { return [...this.recentIntents]; }
  getUserStyle(): UserStyle { return this.userStyle; }
  getAmbitionLevel(): AmbitionLevel { return this.ambitionLevel; }
  getFrustrationLevel(): number { return this.frustrationSignals; }

  hadRecentExecution(): boolean {
    return this.recentIntents.slice(0, 4).some(i => i === "execution" || i === "modify" || i === "debug");
  }

  reset(): void {
    this.entries = [];
    this.projectDirection = null;
    this.recentIntents = [];
    this.sessionStartedAt = Date.now();
    this.userStyle = "mixed";
    this.ambitionLevel = "medium";
    this.frustrationSignals = 0;
  }
}

// ── ConversationMomentumEngine ────────────────────────────────────────────────

type MomentumState = "opening" | "exploring" | "converging" | "building" | "refining";

class ConversationMomentumEngine {
  private state: MomentumState = "opening";
  private messageCount: number = 0;

  advance(intent: Intent, _userPrompt: string): void {
    this.messageCount++;
    if (this.messageCount <= 2) {
      this.state = "opening";
    } else if (["brainstorm", "advisory", "planning"].includes(intent) && this.messageCount <= 6) {
      this.state = "exploring";
    } else if (intent === "planning" && this.messageCount > 4) {
      this.state = "converging";
    } else if (intent === "execution") {
      this.state = "building";
    } else if (["modify", "debug", "review"].includes(intent)) {
      this.state = "refining";
    }
  }

  getState(): MomentumState { return this.state; }
  getMessageCount(): number { return this.messageCount; }

  buildMomentumContext(): string {
    if (this.messageCount <= 1) return "";
    if (this.state === "converging") return "The conversation has been building toward something concrete.";
    if (this.state === "exploring") return "The user has been actively exploring — match their energy and curiosity.";
    if (this.state === "refining") return "The user is in refinement mode — be precise and targeted.";
    return "";
  }

  reset(): void {
    this.state = "opening";
    this.messageCount = 0;
  }
}

// ── ExecutionConfidenceModel ──────────────────────────────────────────────────
// Scores conversational clarity before allowing execution.
// Execution should feel like the natural consequence of alignment —
// not a pattern match on a verb.

export interface ConfidenceScore {
  score: number;            // 0–10
  ready: boolean;           // true if score meets threshold or explicit signal present
  reason: string;           // human-readable explanation
  missingDimensions: string[];
}

class ExecutionConfidenceModel {
  private directionScore: number = 0;       // Is the product direction clear?
  private scopeScore: number = 0;           // Is the scope coherent (not just vague)?
  private commitScore: number = 0;          // Has the user committed, not just explored?
  private exchangeCount: number = 0;        // How many back-and-forths?
  private hasExplicitSignal: boolean = false;

  // Explicit signals that ALWAYS allow execution regardless of score
  private static EXPLICIT_SIGNALS = [
    /^(go ahead|do it|let'?s (go|do it|build|start|begin))\b/i,
    /\b(build it|make it|do it now|build this now)\b/i,
    /^yes,?\s*(build|make|create|implement|do|go|add|fix)/i,
  ];

  private static DIRECTION_SIGNALS = [
    /\b(i want (a|an|to)|i('d| would) like|let'?s build|we should build|i('m| am) thinking (we could|of building))\b/i,
    /\b(for (a|an) (app|product|platform|tool|site|dashboard|marketplace|saas))\b/i,
    /\b(it (should|would|will|needs to) (be|have|include|show|allow|support))\b/i,
  ];

  private static SCOPE_SIGNALS = [
    /\b(feature|page|section|dashboard|navbar|hero|auth|checkout|profile|feed|onboarding|pricing)\b/i,
    /\b(users? (can|should|will)|allow (users?|people)|support (multiple|teams?|organizations?))\b/i,
    /\b(dark|light|minimal|premium|clean|modern|bold|cinematic|editorial)\b/i,
    /\b(real.?time|live|streaming|collaborative|ai.?powered|multi.?tenant)\b/i,
  ];

  advance(intent: Intent, userPrompt: string): void {
    this.exchangeCount++;

    // Check for explicit execution signal first
    for (const pat of ExecutionConfidenceModel.EXPLICIT_SIGNALS) {
      if (pat.test(userPrompt)) {
        this.hasExplicitSignal = true;
        this.commitScore = 10;
      }
    }

    // Direction clarity
    for (const pat of ExecutionConfidenceModel.DIRECTION_SIGNALS) {
      if (pat.test(userPrompt)) this.directionScore = Math.min(10, this.directionScore + 2);
    }

    // Scope coherence
    let scopeHits = 0;
    for (const pat of ExecutionConfidenceModel.SCOPE_SIGNALS) {
      if (pat.test(userPrompt)) scopeHits++;
    }
    if (scopeHits > 0) this.scopeScore = Math.min(10, this.scopeScore + scopeHits);

    // Commit signals from intent progression
    if (intent === "execution") this.commitScore = Math.min(10, this.commitScore + 5);
    if (intent === "planning") this.commitScore = Math.min(10, this.commitScore + 1);

    // Natural conversation depth rewards
    if (this.exchangeCount >= 3 && intent === "planning") this.directionScore = Math.min(10, this.directionScore + 1);
    if (this.exchangeCount >= 5) this.scopeScore = Math.min(10, this.scopeScore + 1);

    // Update relationship phase after all scores settle
    relationshipPhaseEngine.update({
      directionScore: this.directionScore,
      scopeScore: this.scopeScore,
      commitmentScore: this.commitScore,
      ambiguityScore: Math.max(0, 10 - this.directionScore),
      messageCount: momentumEngine.getMessageCount(),
    });
  }

  evaluate(): ConfidenceScore {
    // Explicit signal bypasses all scoring
    if (this.hasExplicitSignal) {
      return { score: 10, ready: true, reason: "Explicit execution signal received.", missingDimensions: [] };
    }

    const missing: string[] = [];
    if (this.directionScore < 3) missing.push("clearer product direction");
    if (this.scopeScore < 2) missing.push("specific scope or features");
    if (this.commitScore < 2) missing.push("commitment to build");

    // Composite score (0–10)
    const score = Math.min(10, Math.round(
      (this.directionScore * 0.4) + (this.scopeScore * 0.35) + (this.commitScore * 0.25)
    ));

    // Threshold: 5/10 minimum to allow execution without explicit signal
    const ready = score >= 5 && missing.length === 0;

    return {
      score,
      ready,
      reason: ready
        ? "Direction, scope, and commitment are sufficiently clear."
        : `Waiting for: ${missing.join(", ")}.`,
      missingDimensions: missing,
    };
  }

  isReadyToExecute(intent: Intent, prompt: string): boolean {
    // Always block conversational intents
    const CONVERSATIONAL: Intent[] = ["casual", "brainstorm", "advisory", "review", "reflection", "clarification"];
    if (CONVERSATIONAL.includes(intent)) return false;

    this.advance(intent, prompt);
    return this.evaluate().ready;
  }

  getScore(): number { return this.evaluate().score; }
  getDirectionScore(): number { return this.directionScore; }
  getScopeScore(): number { return this.scopeScore; }
  getCommitScore(): number { return this.commitScore; }

  reset(): void {
    this.directionScore = 0;
    this.scopeScore = 0;
    this.commitScore = 0;
    this.exchangeCount = 0;
    this.hasExplicitSignal = false;
  }
}

// ── Patterns ──────────────────────────────────────────────────────────────────

const NEVER_EXECUTE_PATTERNS: RegExp[] = [
  /^(hi|hey|hello|good morning|good afternoon|good evening|howdy|hiya|yo)\b/i,
  /^i (have|got|found) (a |an )?(brand name|idea|concept|thought|notion|vision|name)/i,
  /^i('m| am) thinking (about|of)/i,
  /^(what if|what about) (we|i|it|this|that)\b/i,
  /^should (we|i|it)\b/i,
  /^(could|would) (we|you|it) (try|consider|maybe|possibly|potentially)\b/i,
];

const EXPLICIT_EXECUTE_PATTERNS: RegExp[] = [
  /^(build|create|generate|make|start|write|implement|develop|scaffold|code)\s+(a|an|me|my|new|the|\w)/i,
  /^(go ahead|do it|let'?s (go|do it|build|start|begin))\b/i,
  /\b(build it|make it|do it now|build this now|implement (it|this|that) now|create (it|this|that) now)\b/i,
  /^yes,?\s*(build|make|create|implement|do|go|add|fix)/i,
];

// ── classifyIntent ────────────────────────────────────────────────────────────

export function classifyIntent(
  prompt: string,
  hasFiles: boolean,
  recentIntents: Intent[] = [],
): Intent {
  const p     = prompt.toLowerCase().trim();
  const words = p.split(/\s+/).length;

  for (const pat of NEVER_EXECUTE_PATTERNS) {
    if (pat.test(prompt)) {
      if (/^i (have|got|found) /i.test(prompt)) return "brainstorm";
      if (/^(what if|what about|should|could|would)/i.test(p)) return "advisory";
      if (/^i('m| am) thinking/i.test(prompt)) return "brainstorm";
      return "casual";
    }
  }

  if (words <= 2) return "casual";
  if (/^(hi|hey|hello|good morning|good afternoon|good evening)\b/.test(p)) return "casual";
  if (/^(thanks|thank you|thx|ty|cheers|ok|okay|got it|great|cool|nice|perfect|sounds good|awesome|sure|alright)\b/.test(p)) return "casual";

  if (/\b(how('?s| is) (it|this|the project|the app) (going|looking|coming along)|where are we|what (have we|did we) (built|done|created|made)|recap|summarize (what|the)|how far (have we|are we))\b/.test(p)) return "reflection";

  // ── When an app exists, design feedback and feature requests always modify ──
  // This mirrors how real builders work: you react to what you see → it changes.
  const MODIFY_KEYWORDS = [
    "make", "change", "update", "add", "remove", "fix", "improve", "adjust",
    "move", "increase", "decrease", "darker", "lighter", "bigger", "smaller",
    "more", "less", "better", "premium", "rounded", "gradient", "spacing",
    "color", "font", "background", "padding", "margin", "size", "style",
    "layout", "animation", "transition", "hover", "mobile", "responsive",
    "glowing", "navbar", "hero", "footer", "button", "section", "header",
    "pricing", "text", "heading", "typography", "redesign", "tweak", "shift",
    "taller", "shorter", "wider", "narrower", "bolder", "thinner", "clean",
    "minimal", "modern", "elegant", "vibrant", "muted", "dark", "light",
    "sticky", "fixed", "animated", "centered", "aligned", "spaced", "styled",
  ];
  const hasModifyKeyword = MODIFY_KEYWORDS.some(kw => p.includes(kw));

  // Design feedback with an existing app = a modify request, not a chat
  if (/\b(feels?|looks?|seems?)\s+(too|very|a bit|kinda|kind of|really|a little|slightly|quite|off|wrong|flat|bland|heavy|cluttered|busy|weird|broken)\b/.test(p)) return hasFiles ? "modify" : "review";
  if (/\b(something (is|feels|looks|seems) off|not (sure|happy|convinced|feeling) (about|with)|i don'?t (like|love)|too (cluttered|heavy|busy|dark|light|bright|big|small|bold|thin))\b/.test(p)) return hasFiles ? "modify" : "review";
  if (/\b(the (design|spacing|colors?|typography|layout|vibe|aesthetic|feel) (feels?|looks?|seems?|is|needs?))\b/.test(p)) return hasFiles ? "modify" : "review";

  // Advisory phrasing with files + modify keyword = the user wants it changed, not discussed
  if (/^(should (i|we|it)|would (it|this|that|you)|could (we|you|it)|which (is|would|approach|option)|is it better|what do you think|do you think)\b/.test(p)) return (hasFiles && hasModifyKeyword) ? "modify" : "advisory";
  if (/\b(what (would|do) you (recommend|suggest|think|prefer)|your (thoughts?|opinion|take|recommendation) on|better (to|approach|option)|best (way|approach|practice) to\b)/.test(p)) return (hasFiles && hasModifyKeyword) ? "modify" : "advisory";

  if (/^(what (else|other|if|could|might)|give me (some|a few|ideas?)|any (ideas?|suggestions?|thoughts?)|how (could|might) (we|i)|what (ideas?|features?|improvements?|sections?) (could|should|would|might))\b/.test(p)) return "brainstorm";
  if (/\b(brainstorm|ideate|explore (options?|ideas?|possibilities?)|what are (some|the|a few) (ways?|options?|ideas?|approaches?))\b/.test(p)) return "brainstorm";
  if (/^i (have|got) (a |an )?(brand name|idea|concept|thought|vision)/i.test(p)) return "brainstorm";

  if (/^(how does|how do|how can|how would|how should|how is)\b/.test(p)) return "clarification";
  if (/^(what is|what are|what does|what's|what was|what will)\b/.test(p)) return "clarification";
  if (/^(why (does|is|isn'?t|would|should|can'?t|won'?t))\b/.test(p)) return "clarification";
  if (/^(can you explain|explain |tell me (about|how|what|why)|help me understand)\b/.test(p)) return "clarification";
  if (/^(is (it|there|this|that)|are (there|these|those)|does (it|this))\b/.test(p)) return "clarification";
  // A question with an existing app and modification keywords = a modify request ("Should the hero be taller?")
  if (/\?$/.test(p)) {
    if (hasFiles && hasModifyKeyword) return "modify";
    if (!/^(can you|could you|would you|please)\s+(build|create|make|add|implement|generate|write)/i.test(p)) return "clarification";
  }

  if (/\b(debug|broken|there'?s (a|an) (bug|error|issue)|crashing|crash)\b/.test(p)) return "debug";
  if (/\b(fix (this|the|a |my )(error|bug|issue|problem|crash)|not working|console error|throws?|exception)\b/.test(p)) return "debug";
  if (/\b(why (is it|is this|isn'?t|doesn'?t|won'?t|can'?t)|what'?s wrong with)\b/.test(p)) return "debug";

  for (const pat of EXPLICIT_EXECUTE_PATTERNS) {
    if (pat.test(prompt)) return hasFiles ? "modify" : "execution";
  }

  // "I want to add X" / "I'd like a pricing section" — with files this is a feature request, build it
  if (/^(i want|i('d| would) like|let'?s (make|create|build)|we (could|should) (make|create|build)|i('m| am) thinking (we could|of building)|i'?ve been thinking)/i.test(p)) return hasFiles ? "modify" : "execution";
  if (/^(i('d| would) love (to|a)|imagine (a|an|if)|picture (a|an)|envision)/i.test(p)) return hasFiles ? "modify" : "execution";

  if (hasFiles && hasModifyKeyword) return "modify";

  // No pattern matched — with no existing app treat any description as a build request.
  // With an existing app, fall back to modify so the agent always tries to help.
  return hasFiles ? "modify" : "execution";
}

// ── Execution Gatekeeper ──────────────────────────────────────────────────────

export interface ExecutionGate {
  pass: boolean;
  confidence: number;
  blockReason?: string;
}

export function gateExecution(intent: Intent, prompt: string): ExecutionGate {
  const CONVERSATIONAL: Intent[] = ["casual", "brainstorm", "advisory", "review", "reflection", "clarification", "planning"];
  if (CONVERSATIONAL.includes(intent)) {
    return { pass: false, confidence: 0, blockReason: intent };
  }
  for (const pat of NEVER_EXECUTE_PATTERNS) {
    if (pat.test(prompt)) return { pass: false, confidence: 0, blockReason: "never_execute_pattern" };
  }
  return { pass: true, confidence: 1 };
}

// ── Singletons ────────────────────────────────────────────────────────────────

export const promptRegistry      = new PromptExecutionRegistry();
export const conversationMemory  = new WorkspaceRelationshipMemory();
export const momentumEngine      = new ConversationMomentumEngine();
export const confidenceModel     = new ExecutionConfidenceModel();

// ── Relationship Phase — public accessor ──────────────────────────────────────

export function getPhase(): RelationshipPhase {
  return relationshipPhaseEngine.getPhase();
}
