export const GAME_SCHEMA_VERSION = 1 as const;
export const TOTAL_ROUNDS = 4;

export type GamePhase =
  | "lobby"
  | "instructions"
  | "writing"
  | "voting"
  | "results"
  | "round-break"
  | "game-over";

export type DomainParticipantRole = "controller" | "host-display" | "spectator" | "logic";
export type Confidence = "sure" | "certain";

export interface PlayerSummary {
  id: string;
  name: string;
  connected: boolean;
}

export interface CaseFile {
  id: string;
  category: string;
  prompt: string;
  truth: string;
  explanation: string;
  decoys: string[];
  sourceLabel: string;
  sourceUrl: string;
}

export interface BluffSubmission {
  id: string;
  authorId: string;
  text: string;
  submittedAt: number;
}

export interface Choice {
  id: string;
  text: string;
  kind: "truth" | "bluff" | "bureau-decoy";
  authorId?: string;
}

export interface VoteSubmission {
  id: string;
  voterId: string;
  choiceId: string;
  confidence: Confidence;
  submittedAt: number;
}

export type IntentRejectionReason =
  | "already-submitted"
  | "already-voted"
  | "bluff-too-short"
  | "bluff-too-long"
  | "duplicate-bluff"
  | "matches-truth"
  | "future-sequence"
  | "invalid-choice"
  | "not-a-controller"
  | "not-in-round"
  | "phase-closed"
  | "self-vote"
  | "stale-round";

export interface IntentReceipt {
  intentId: string;
  status: "accepted" | "rejected";
  reason?: IntentRejectionReason;
  confirmedAt: number;
}

export interface PlayerScore {
  score: number;
  truthsFound: number;
  playersFooled: number;
}

export interface ChoiceResult extends Choice {
  voterIds: string[];
  pointsByVoter: Record<string, number>;
  pointsForAuthor: number;
}

export interface RoundResults {
  roundNumber: number;
  multiplier: number;
  caseFile: CaseFile;
  choices: ChoiceResult[];
  roundPoints: Record<string, number>;
}

export interface BluffBureauState {
  schemaVersion: typeof GAME_SCHEMA_VERSION;
  sessionId: string;
  sequence: number;
  phase: GamePhase;
  deadlineAt: number | null;
  totalRounds: number;
  roundNumber: number;
  roundId: string | null;
  roster: PlayerSummary[];
  caseFile: CaseFile | null;
  choices: Choice[];
  submittedPlayerIds: string[];
  votedPlayerIds: string[];
  receipts: Record<string, IntentReceipt>;
  scores: Record<string, PlayerScore>;
  lastRoundResults: RoundResults | null;
}

export interface PlayerIntentState {
  pendingIntent?: PlayerIntentEnvelope;
}

export interface PlayerIntentEnvelope {
  id: string;
  expectedPhase: GamePhase;
  expectedSequence: number;
  issuedAt: number;
  roundId: string | null;
  payload:
    | { kind: "submit-bluff"; text: string }
    | { kind: "submit-vote"; choiceId: string; confidence: Confidence };
}

export function emptyScore(): PlayerScore {
  return { score: 0, truthsFound: 0, playersFooled: 0 };
}
