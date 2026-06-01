// ── unifiedDecisionKernel.ts — Unified Decision Kernel (UDK) ─────────────────
// A single coordination layer that takes all context signals and outputs ONE
// decision object used by ALL systems. Does not replace existing engines —
// it orchestrates them into a single pass.

import {
  classifyIntent,
  conversationMemory,
  momentumEngine,
  confidenceModel,
  type Intent,
  type ConfidenceScore,
} from "./conversationEngine";

import { relationshipPhaseEngine, type RelationshipPhase } from "./relationshipPhaseEngine";

// ── Output types ──────────────────────────────────────────────────────────────

export type ResponseMode = "short" | "medium" | "deep";
export type Tone = "cofounder" | "neutral" | "directive" | "exploratory";

export interface Decision {
  intent: Intent;
  phase: RelationshipPhase;
  confidenceScore: number;
  executionAllowed: boolean;
  responseMode: ResponseMode;
  questionCount: 0 | 1;
  tone: Tone;
  memoryRelevance: number;
  reasoningSignal: string;
}

// ── Input ─────────────────────────────────────────────────────────────────────

export interface UDKInput {
  userMessage: string;
  hasFiles: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CONVERSATIONAL_INTENTS: Intent[] = [
  "casual", "brainstorm", "advisory", "review", "reflection", "clarification", "planning",
];

// ── Kernel ────────────────────────────────────────────────────────────────────

class UnifiedDecisionKernel {
  process(input: UDKInput): Decision {
    // ── 1. Intent — use existing classification engine ────────────────────────
    const intent = classifyIntent(
      input.userMessage,
      input.hasFiles,
      conversationMemory.getRecentIntents(),
    );

    // ── 2. Advance all tracking engines with current message ─────────────────
    // Must happen BEFORE evaluating confidence so the current message is scored.
    conversationMemory.record(intent, input.userMessage);
    momentumEngine.advance(intent, input.userMessage);
    confidenceModel.advance(intent, input.userMessage);

    // ── 3. Phase — from relationship phase engine ─────────────────────────────
    const phase = relationshipPhaseEngine.getPhase();

    // ── 4. Confidence — evaluated AFTER advance so current message is counted ─
    const confidence: ConfidenceScore = confidenceModel.evaluate();
    const confidenceScore = confidence.score;

    // ── 5. Execution gating — deterministic rules ────────────────────────────
    // Conversational intents never execute.
    let executionAllowed = !CONVERSATIONAL_INTENTS.includes(intent);

    // execution, modify, and debug always bypass — the intent classifier
    // already requires explicit build verbs to reach these states, so
    // a second confidence gate here only creates false negatives.
    if (intent === "execution" || intent === "modify" || intent === "debug") {
      executionAllowed = true;
    }

    // ── 5. Tone — derived from phase and momentum ─────────────────────────────
    const tone = this.deriveTone(phase);

    // ── 6. Response mode — intent × confidence ────────────────────────────────
    const responseMode = this.deriveResponseMode(intent, confidenceScore);

    // ── 7. Question count — max 1, only when genuinely needed ────────────────
    const questionCount: 0 | 1 = intent === "brainstorm" ? 1 : 0;

    // ── 8. Memory relevance — how much session context is loaded ─────────────
    const recentCount = conversationMemory.getRecentIntents().length;
    const memoryRelevance = Math.min(1, recentCount / 8);

    // ── 9. Reasoning signal — diagnostic trace ───────────────────────────────
    const momentumState = momentumEngine.getState();
    const reasoningSignal = [
      `intent=${intent}`,
      `phase=${phase}`,
      `confidence=${confidenceScore}/10`,
      `momentum=${momentumState}`,
      `execAllowed=${executionAllowed}`,
      `tone=${tone}`,
      `responseMode=${responseMode}`,
    ].join(" ");

    return {
      intent,
      phase,
      confidenceScore,
      executionAllowed,
      responseMode,
      questionCount,
      tone,
      memoryRelevance,
      reasoningSignal,
    };
  }

  private deriveTone(phase: RelationshipPhase): Tone {
    switch (phase) {
      case "discovering":
      case "exploring":
        return "exploratory";
      case "converging":
      case "deciding":
        return "cofounder";
      case "building":
      case "shipping":
        return "directive";
      case "refining":
        return "neutral";
      default:
        return "cofounder";
    }
  }

  private deriveResponseMode(intent: Intent, confidenceScore: number): ResponseMode {
    switch (intent) {
      case "casual":
        return "short";
      case "advisory":
      case "reflection":
      case "clarification":
      case "planning":
      case "modify":
        return "medium";
      case "brainstorm":
        return "deep";
      case "debug":
        return "medium";
      case "execution":
        return confidenceScore >= 7 ? "deep" : "medium";
      default:
        return "short";
    }
  }
}

export const unifiedDecisionKernel = new UnifiedDecisionKernel();
