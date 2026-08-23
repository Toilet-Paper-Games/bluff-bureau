import { expect, test } from "vitest";

import { bureauContent } from "./content";

test("each four-file session receives four deterministic, non-repeating prompts", () => {
  const unusedRandom = { next: () => 0.5 };
  for (let session = 0; session < 1_000; session += 1) {
    const first = [1, 2, 3, 4].map((round) => bureauContent.forRound(round, `room-${session}`, unusedRandom).id);
    const replay = [1, 2, 3, 4].map((round) => bureauContent.forRound(round, `room-${session}`, unusedRandom).id);
    expect(new Set(first).size).toBe(4);
    expect(replay).toEqual(first);
  }
});
