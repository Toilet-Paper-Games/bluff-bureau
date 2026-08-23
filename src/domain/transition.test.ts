import { expect, test } from "vitest";

import { scoreRound } from "./scoring";
import {
  applyPlayerIntent,
  createInitialState,
  openVoting,
  startRound
} from "./transition";
import type { BluffSubmission, PlayerIntentEnvelope, VoteSubmission } from "./model";

const players = ["Mira", "Jules", "Dev"].map((name, index) => ({
  id: `p${index + 1}`,
  name,
  connected: true
}));

function bluffIntent(state: ReturnType<typeof writingState>, id: string, text: string): PlayerIntentEnvelope {
  return {
    id,
    expectedPhase: "writing",
    expectedSequence: state.sequence,
    issuedAt: 2_000,
    roundId: state.roundId,
    payload: { kind: "submit-bluff", text }
  };
}

function writingState() {
  const initial = createInitialState("session-1", players);
  return startRound(initial, {
    roundId: "round-1",
    caseFile: {
      id: "flamingos",
      category: "Animal files",
      prompt: "A group of flamingos is called a ____.",
      truth: "flamboyance",
      explanation: "The collective noun is a flamboyance of flamingos.",
      decoys: ["parliament", "flare"],
      sourceLabel: "Smithsonian's National Zoo",
      sourceUrl: "https://nationalzoo.si.edu/animals/news/why-are-flamingos-pink-and-other-flamingo-facts"
    },
    deadlineAt: 62_000
  }).state;
}

test("writing accepts one normalized bluff and rejects truth matches, duplicates, and repeat submissions", () => {
  let state = writingState();
  const first = applyPlayerIntent(state, { actorId: "p1", actorRole: "controller", now: 2_000 }, bluffIntent(state, "i1", "  A parade  "));
  expect(first.status).toBe("applied");
  if (first.status !== "applied" || !first.submission) throw new Error("Expected an accepted bluff.");
  state = first.state;
  expect(state.submittedPlayerIds).toEqual(["p1"]);
  expect(state.receipts.p1).toMatchObject({ intentId: "i1", status: "accepted" });

  const duplicate = applyPlayerIntent(state, { actorId: "p2", actorRole: "controller", now: 2_100, submissions: [first.submission!] }, bluffIntent(state, "i2", "a   PARADE"));
  expect(duplicate).toMatchObject({ status: "rejected", reason: "duplicate-bluff" });

  const truth = applyPlayerIntent(state, { actorId: "p2", actorRole: "controller", now: 2_200 }, bluffIntent(state, "i3", "Flamboyance"));
  expect(truth).toMatchObject({ status: "rejected", reason: "matches-truth" });

  const repeated = applyPlayerIntent(state, { actorId: "p1", actorRole: "controller", now: 2_300 }, bluffIntent(state, "i4", "a committee"));
  expect(repeated).toMatchObject({ status: "rejected", reason: "already-submitted" });
});

test("voting rejects self-votes and scoring doubles both brave truth wins and brave bluff rewards in the finale", () => {
  let state = { ...writingState(), roundNumber: 4 };
  const submissions: BluffSubmission[] = [
    { id: "b1", authorId: "p1", text: "a parade", submittedAt: 2_000 },
    { id: "b2", authorId: "p2", text: "a flare", submittedAt: 2_001 },
    { id: "b3", authorId: "p3", text: "a committee", submittedAt: 2_002 }
  ];
  state = openVoting(state, submissions, { next: () => 0.5 }, 42_000).state;
  const selfChoice = state.choices.find((choice) => choice.authorId === "p1")!;
  const truthChoice = state.choices.find((choice) => choice.kind === "truth")!;
  const wrongChoice = state.choices.find((choice) => choice.authorId === "p2")!;

  const selfVote = applyPlayerIntent(
    state,
    { actorId: "p1", actorRole: "controller", now: 3_000 },
    {
      id: "v-self",
      expectedPhase: "voting",
      expectedSequence: state.sequence,
      issuedAt: 3_000,
      roundId: state.roundId,
      payload: { kind: "submit-vote", choiceId: selfChoice.id, confidence: "sure" }
    }
  );
  expect(selfVote).toMatchObject({ status: "rejected", reason: "self-vote" });

  const votes: VoteSubmission[] = [
    { id: "v1", voterId: "p1", choiceId: truthChoice.id, confidence: "certain", submittedAt: 3_100 },
    { id: "v2", voterId: "p2", choiceId: truthChoice.id, confidence: "sure", submittedAt: 3_101 },
    { id: "v3", voterId: "p3", choiceId: wrongChoice.id, confidence: "certain", submittedAt: 3_102 }
  ];
  const scored = scoreRound(state, votes);
  expect(scored.results.multiplier).toBe(2);
  expect(scored.results.roundPoints).toEqual({ p1: 4000, p2: 4000, p3: 0 });
  expect(scored.scores.p1.truthsFound).toBe(1);
  expect(scored.scores.p2.playersFooled).toBe(1);
});
