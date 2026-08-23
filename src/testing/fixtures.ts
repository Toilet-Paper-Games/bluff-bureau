import type { CoordinatorSnapshot } from "../application/coordinator";
import type { BluffBureauState, GamePhase, PlayerIntentState, PlayerSummary } from "../domain/model";
import { closeVoting, createInitialState, finishResults, openVoting, showInstructions, startRound } from "../domain/transition";

const now = Date.now();

export const typicalRoster: PlayerSummary[] = [
  { id: "p1", name: "Mira", connected: true },
  { id: "p2", name: "Jules", connected: true },
  { id: "p3", name: "Dev", connected: true },
  { id: "p4", name: "Nico", connected: true },
  { id: "p5", name: "Sol", connected: true }
];

export const maxRoster: PlayerSummary[] = [
  ...typicalRoster,
  { id: "p6", name: "Avery", connected: true },
  { id: "p7", name: "Rin", connected: true },
  { id: "p8", name: "Bo", connected: true }
];

const caseFile = {
  id: "wombat-cubes",
  category: "Animal files",
  prompt: "Wombats are the only known animals whose droppings are shaped like ____.",
  truth: "cubes",
  explanation: "Their unusually elastic intestines form the droppings into distinct cubes.",
  decoys: ["tiny stars", "spirals", "flat coins"],
  sourceLabel: "Smithsonian Magazine",
  sourceUrl: "https://www.smithsonianmag.com/smart-news/how-do-wombats-make-cube-shaped-poop-180970928/"
};

function baseWriting(roundNumber = 2): BluffBureauState {
  const lobby = createInitialState("gallery-session", typicalRoster);
  const state = startRound(lobby, { roundId: `round-${roundNumber}`, caseFile, deadlineAt: now + 48_000 }).state;
  return {
    ...state,
    roundNumber,
    scores: {
      p1: { score: 2500, truthsFound: 1, playersFooled: 1 },
      p2: { score: 2000, truthsFound: 2, playersFooled: 0 },
      p3: { score: 1500, truthsFound: 1, playersFooled: 1 },
      p4: { score: 1000, truthsFound: 1, playersFooled: 0 },
      p5: { score: 500, truthsFound: 0, playersFooled: 1 }
    }
  };
}

const submissions = [
  { id: "submit-bluff-p1", authorId: "p1", text: "tiny bricks", submittedAt: now - 15_000 },
  { id: "submit-bluff-p2", authorId: "p2", text: "hexagons", submittedAt: now - 14_000 },
  { id: "submit-bluff-p3", authorId: "p3", text: "flat coins", submittedAt: now - 13_000 },
  { id: "submit-bluff-p4", authorId: "p4", text: "perfect spheres", submittedAt: now - 12_000 },
  { id: "submit-bluff-p5", authorId: "p5", text: "question marks", submittedAt: now - 11_000 }
];

function writing(): BluffBureauState {
  const state = baseWriting();
  return {
    ...state,
    submittedPlayerIds: ["p1", "p2", "p3"],
    receipts: Object.fromEntries(submissions.slice(0, 3).map((item) => [item.authorId, { intentId: item.id, status: "accepted" as const, confirmedAt: item.submittedAt }]))
  };
}

function voting(): BluffBureauState {
  const opened = openVoting(baseWriting(), submissions, { next: () => 0.42 }, now + 31_000).state;
  return {
    ...opened,
    submittedPlayerIds: typicalRoster.map((player) => player.id),
    votedPlayerIds: ["p1", "p3"],
    receipts: {
      p1: { intentId: "submit-vote-p1", status: "accepted", confirmedAt: now - 2_000 },
      p3: { intentId: "submit-vote-p3", status: "accepted", confirmedAt: now - 1_000 }
    }
  };
}

function results(): BluffBureauState {
  const state = voting();
  const truthId = state.choices.find((choice) => choice.kind === "truth")!.id;
  const bluffId = state.choices.find((choice) => choice.authorId === "p1")!.id;
  return closeVoting(
    state,
    [
      { id: "submit-vote-p1", voterId: "p1", choiceId: truthId, confidence: "certain", submittedAt: now - 1_000 },
      { id: "submit-vote-p2", voterId: "p2", choiceId: bluffId, confidence: "sure", submittedAt: now - 900 },
      { id: "submit-vote-p3", voterId: "p3", choiceId: truthId, confidence: "sure", submittedAt: now - 800 },
      { id: "submit-vote-p4", voterId: "p4", choiceId: bluffId, confidence: "certain", submittedAt: now - 700 },
      { id: "submit-vote-p5", voterId: "p5", choiceId: truthId, confidence: "sure", submittedAt: now - 600 }
    ],
    now + 15_000
  ).state;
}

function maxVoting(): BluffBureauState {
  const lobby = createInitialState("gallery-max-session", maxRoster);
  const state = startRound(lobby, { roundId: "max-round", caseFile, deadlineAt: now + 31_000 }).state;
  const maxSubmissions = maxRoster.map((player, index) => ({
    id: `submit-bluff-${player.id}`,
    authorId: player.id,
    text: ["polished river stones", "tiny square parcels", "stacked sugar cubes", "miniature dice", "compressed chalk blocks", "little ice bricks", "neat clay tiles", "small wooden blocks"][index]!,
    submittedAt: now - index * 100
  }));
  return {
    ...openVoting(state, maxSubmissions, { next: () => 0.42 }, now + 31_000).state,
    submittedPlayerIds: maxRoster.map((player) => player.id)
  };
}

function maxResults(): BluffBureauState {
  const state = maxVoting();
  const truthId = state.choices.find((choice) => choice.kind === "truth")!.id;
  return closeVoting(state, maxRoster.map((player, index) => ({
    id: `submit-vote-${player.id}`,
    voterId: player.id,
    choiceId: index % 2 === 0 ? truthId : state.choices.find((choice) => choice.authorId && choice.authorId !== player.id)!.id,
    confidence: index % 3 === 0 ? "certain" as const : "sure" as const,
    submittedAt: now - index * 50
  })), now + 15_000).state;
}

function phaseState(phase: GamePhase): BluffBureauState {
  if (phase === "lobby") return createInitialState("gallery-session", typicalRoster);
  if (phase === "instructions") return showInstructions(createInitialState("gallery-session", typicalRoster), now + 12_000).state;
  if (phase === "writing") return writing();
  if (phase === "voting") return voting();
  if (phase === "results") return results();
  if (phase === "round-break") return finishResults(results(), now + 5_000).state;
  const finale = results();
  return { ...finale, phase: "game-over", roundNumber: finale.totalRounds, deadlineAt: null };
}

function playerStateFor(state: BluffBureauState, playerId: string): PlayerIntentState | undefined {
  if (state.phase === "writing" && state.submittedPlayerIds.includes(playerId)) {
    const item = submissions.find((submission) => submission.authorId === playerId)!;
    return { pendingIntent: { id: item.id, expectedPhase: "writing", expectedSequence: state.sequence, issuedAt: item.submittedAt, roundId: state.roundId, payload: { kind: "submit-bluff", text: item.text } } };
  }
  if (state.phase === "voting" && state.votedPlayerIds.includes(playerId)) {
    const choice = state.choices.find((item) => item.kind === "truth")!;
    return { pendingIntent: { id: `submit-vote-${playerId}`, expectedPhase: "voting", expectedSequence: state.sequence, issuedAt: now - 1_000, roundId: state.roundId, payload: { kind: "submit-vote", choiceId: choice.id, confidence: "sure" } } };
  }
  return undefined;
}

export type GalleryScenario = GamePhase | "loading" | "reconnecting" | "min-lobby" | "max-lobby" | "max-voting" | "max-results";

export function fixtureSnapshot(scenario: GalleryScenario, surface: "host" | "controller" | "spectator", playerId = "p1"): CoordinatorSnapshot {
  let state: BluffBureauState | undefined;
  let lifecycle = "started";
  if (scenario === "loading") state = undefined;
  else if (scenario === "reconnecting") {
    state = { ...phaseState("voting"), roster: typicalRoster.map((player) => player.id === playerId ? { ...player, connected: false } : player) };
    lifecycle = "reconnecting";
  } else if (scenario === "min-lobby") state = createInitialState("gallery-session", typicalRoster.slice(0, 3));
  else if (scenario === "max-lobby") state = createInitialState("gallery-session", maxRoster);
  else if (scenario === "max-voting") state = maxVoting();
  else if (scenario === "max-results") state = maxResults();
  else state = phaseState(scenario);
  const role = surface === "host" ? "host-display" : surface;
  const ownPlayerState = surface === "controller" && state ? playerStateFor(state, playerId) : undefined;
  return {
    state,
    sharedRevision: state?.sequence ?? 0,
    participants: (state?.roster ?? typicalRoster).map((player) => ({ ...player, role: "controller" })),
    context: { surfaceKind: role, participantId: surface === "controller" ? playerId : undefined, authorityParticipantId: "p1", isAuthority: surface === "controller" && playerId === "p1", roomId: "gallery-room" },
    lifecycle,
    ownPlayerState,
    ownPlayerRevision: ownPlayerState ? 1 : 0,
    playerStates: ownPlayerState ? { [playerId]: ownPlayerState } : {},
    playerWritePending: false,
    lastError: null
  };
}
