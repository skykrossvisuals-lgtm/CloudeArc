// ── relationshipPhaseEngine.ts — Relationship Phase Awareness System ──────────
// Tracks conversation evolution state and outputs a relationship phase
// that drives how the AI behaves over time.

export type RelationshipPhase =
  | "discovering"
  | "exploring"
  | "converging"
  | "deciding"
  | "building"
  | "refining"
  | "shipping";

export interface PhaseInput {
  directionScore: number;
  scopeScore: number;
  commitmentScore: number;
  ambiguityScore: number;
  messageCount: number;
}

function computePhase(input: PhaseInput): RelationshipPhase {
  const { directionScore, scopeScore, commitmentScore, ambiguityScore, messageCount } = input;

  if (messageCount < 3) return "discovering";

  // Checked highest specificity first (most advanced states)
  if (directionScore >= 8 && commitmentScore >= 9) return "shipping";
  if (scopeScore >= 7 && commitmentScore >= 7 && ambiguityScore < 4) return "refining";
  if (commitmentScore >= 8 && scopeScore >= 6) return "building";
  if (directionScore >= 7 && commitmentScore >= 6) return "deciding";
  if (directionScore >= 6 && scopeScore >= 5) return "converging";
  if (ambiguityScore >= 6 && directionScore < 4) return "exploring";

  return "exploring";
}

class RelationshipPhaseEngine {
  private currentPhase: RelationshipPhase = "discovering";

  update(input: PhaseInput): void {
    this.currentPhase = computePhase(input);
  }

  getPhase(): RelationshipPhase {
    return this.currentPhase;
  }

  reset(): void {
    this.currentPhase = "discovering";
  }
}

export const relationshipPhaseEngine = new RelationshipPhaseEngine();
