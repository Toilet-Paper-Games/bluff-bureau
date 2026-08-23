import {
  GAME_SCHEMA_VERSION,
  TOTAL_ROUNDS,
  emptyScore,
  type BluffBureauState,
  type BluffSubmission,
  type CaseFile,
  type Choice,
  type DomainParticipantRole,
  type IntentReceipt,
  type IntentRejectionReason,
  type PlayerIntentEnvelope,
  type PlayerSummary,
  type VoteSubmission
} from "./model";
import { scoreRound } from "./scoring";

export interface RandomSource {
  next(): number;
}

export interface PlayerIntentContext {
  actorId: string;
  actorRole: DomainParticipantRole;
  now: number;
  submissions?: BluffSubmission[];
  votes?: VoteSubmission[];
}

export type PlayerTransitionResult =
  | { status: "applied"; state: BluffBureauState; submission?: BluffSubmission; vote?: VoteSubmission }
  | { status: "duplicate"; state: BluffBureauState }
  | { status: "rejected"; state: BluffBureauState; reason: IntentRejectionReason };

export type InternalTransitionResult =
  | { status: "applied"; state: BluffBureauState }
  | { status: "rejected"; state: BluffBureauState; reason: string };

export function createInitialState(
  sessionId: string,
  roster: PlayerSummary[]
): BluffBureauState {
  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    sessionId,
    sequence: 0,
    phase: "lobby",
    deadlineAt: null,
    totalRounds: TOTAL_ROUNDS,
    roundNumber: 0,
    roundId: null,
    roster: roster.map((player) => ({ ...player })),
    caseFile: null,
    choices: [],
    submittedPlayerIds: [],
    votedPlayerIds: [],
    receipts: {},
    scores: Object.fromEntries(roster.map((player) => [player.id, emptyScore()])),
    lastRoundResults: null
  };
}

function normalizeVisibleText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeComparableText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function withReceipt(
  state: BluffBureauState,
  actorId: string,
  receipt: IntentReceipt
): BluffBureauState {
  return {
    ...state,
    sequence: state.sequence + 1,
    receipts: { ...state.receipts, [actorId]: receipt }
  };
}

function reject(
  state: BluffBureauState,
  context: PlayerIntentContext,
  intent: PlayerIntentEnvelope,
  reason: IntentRejectionReason
): PlayerTransitionResult {
  return {
    status: "rejected",
    reason,
    state: withReceipt(state, context.actorId, {
      intentId: intent.id,
      status: "rejected",
      reason,
      confirmedAt: context.now
    })
  };
}

function validateEnvelope(
  state: BluffBureauState,
  context: PlayerIntentContext,
  intent: PlayerIntentEnvelope
): PlayerTransitionResult | undefined {
  if (state.receipts[context.actorId]?.intentId === intent.id) {
    return { status: "duplicate", state };
  }
  if (context.actorRole !== "controller") return reject(state, context, intent, "not-a-controller");
  if (!state.roster.some((player) => player.id === context.actorId)) {
    return reject(state, context, intent, "not-in-round");
  }
  if (intent.expectedSequence > state.sequence) return reject(state, context, intent, "future-sequence");
  if (intent.expectedPhase !== state.phase) return reject(state, context, intent, "phase-closed");
  if (intent.roundId !== state.roundId) return reject(state, context, intent, "stale-round");
  return undefined;
}

export function applyPlayerIntent(
  state: BluffBureauState,
  context: PlayerIntentContext,
  intent: PlayerIntentEnvelope
): PlayerTransitionResult {
  const envelopeFailure = validateEnvelope(state, context, intent);
  if (envelopeFailure) return envelopeFailure;

  if (intent.payload.kind === "submit-bluff") {
    if (state.phase !== "writing" || !state.caseFile) return reject(state, context, intent, "phase-closed");
    if (state.submittedPlayerIds.includes(context.actorId)) {
      return reject(state, context, intent, "already-submitted");
    }
    const text = normalizeVisibleText(intent.payload.text);
    const length = Array.from(text).length;
    if (length < 2) return reject(state, context, intent, "bluff-too-short");
    if (length > 36) return reject(state, context, intent, "bluff-too-long");
    const comparable = normalizeComparableText(text);
    if (comparable === normalizeComparableText(state.caseFile.truth)) {
      return reject(state, context, intent, "matches-truth");
    }
    if ((context.submissions ?? []).some((submission) => normalizeComparableText(submission.text) === comparable)) {
      return reject(state, context, intent, "duplicate-bluff");
    }
    const submission: BluffSubmission = {
      id: intent.id,
      authorId: context.actorId,
      text,
      submittedAt: context.now
    };
    return {
      status: "applied",
      submission,
      state: {
        ...withReceipt(state, context.actorId, {
          intentId: intent.id,
          status: "accepted",
          confirmedAt: context.now
        }),
        submittedPlayerIds: [...state.submittedPlayerIds, context.actorId]
      }
    };
  }

  if (intent.payload.kind !== "submit-vote") {
    return reject(state, context, intent, "phase-closed");
  }
  const votePayload = intent.payload;
  if (state.phase !== "voting") return reject(state, context, intent, "phase-closed");
  if (state.votedPlayerIds.includes(context.actorId)) return reject(state, context, intent, "already-voted");
  const choice = state.choices.find((candidate) => candidate.id === votePayload.choiceId);
  if (!choice) return reject(state, context, intent, "invalid-choice");
  if (choice.authorId === context.actorId) return reject(state, context, intent, "self-vote");
  const vote: VoteSubmission = {
    id: intent.id,
    voterId: context.actorId,
    choiceId: choice.id,
    confidence: votePayload.confidence,
    submittedAt: context.now
  };
  return {
    status: "applied",
    vote,
    state: {
      ...withReceipt(state, context.actorId, {
        intentId: intent.id,
        status: "accepted",
        confirmedAt: context.now
      }),
      votedPlayerIds: [...state.votedPlayerIds, context.actorId]
    }
  };
}

function nextState(
  state: BluffBureauState,
  phase: BluffBureauState["phase"],
  updates: Partial<BluffBureauState>
): BluffBureauState {
  return { ...state, ...updates, phase, sequence: state.sequence + 1 };
}

export function showInstructions(state: BluffBureauState, deadlineAt: number): InternalTransitionResult {
  if (state.phase !== "lobby") return { status: "rejected", state, reason: "Instructions require the lobby." };
  return { status: "applied", state: nextState(state, "instructions", { deadlineAt }) };
}

export function startRound(
  state: BluffBureauState,
  input: { roundId: string; caseFile: CaseFile; deadlineAt: number }
): InternalTransitionResult {
  if (state.phase !== "lobby" && state.phase !== "instructions" && state.phase !== "round-break") {
    return { status: "rejected", state, reason: "A round cannot start from this phase." };
  }
  return {
    status: "applied",
    state: nextState(state, "writing", {
      roundId: input.roundId,
      roundNumber: state.roundNumber + 1,
      caseFile: input.caseFile,
      choices: [],
      submittedPlayerIds: [],
      votedPlayerIds: [],
      receipts: {},
      deadlineAt: input.deadlineAt,
      lastRoundResults: null
    })
  };
}

function shuffled<T>(items: T[], random: RandomSource): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random.next() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

export function openVoting(
  state: BluffBureauState,
  submissions: BluffSubmission[],
  random: RandomSource,
  deadlineAt: number
): InternalTransitionResult {
  if (state.phase !== "writing" || !state.caseFile) {
    return { status: "rejected", state, reason: "Voting requires an active writing phase." };
  }
  const choices: Choice[] = [
    { id: `truth-${state.caseFile.id}`, text: state.caseFile.truth, kind: "truth" },
    ...submissions.map((submission) => ({
      id: submission.id,
      text: submission.text,
      kind: "bluff" as const,
      authorId: submission.authorId
    }))
  ];
  const neededDecoys = Math.max(0, 4 - choices.length);
  for (const [index, text] of state.caseFile.decoys.slice(0, neededDecoys).entries()) {
    choices.push({ id: `decoy-${state.caseFile.id}-${index + 1}`, text, kind: "bureau-decoy" });
  }
  return {
    status: "applied",
    state: nextState(state, "voting", {
      choices: shuffled(choices, random),
      votedPlayerIds: [],
      receipts: {},
      deadlineAt
    })
  };
}

export function closeVoting(
  state: BluffBureauState,
  votes: VoteSubmission[],
  deadlineAt: number
): InternalTransitionResult {
  if (state.phase !== "voting") return { status: "rejected", state, reason: "Results require voting." };
  const { results, scores } = scoreRound(state, votes);
  return {
    status: "applied",
    state: nextState(state, "results", { lastRoundResults: results, scores, deadlineAt })
  };
}

export function finishResults(state: BluffBureauState, deadlineAt: number): InternalTransitionResult {
  if (state.phase !== "results") return { status: "rejected", state, reason: "Only results can advance." };
  if (state.roundNumber >= state.totalRounds) {
    return { status: "applied", state: nextState(state, "game-over", { deadlineAt: null }) };
  }
  return { status: "applied", state: nextState(state, "round-break", { deadlineAt }) };
}

export function syncRoster(state: BluffBureauState, roster: PlayerSummary[]): BluffBureauState {
  const scores = { ...state.scores };
  for (const player of roster) scores[player.id] ??= emptyScore();
  return nextState(state, state.phase, { roster, scores });
}
