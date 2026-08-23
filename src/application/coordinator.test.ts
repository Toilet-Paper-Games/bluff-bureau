import { expect, test } from "vitest";

import { bureauContent } from "./content";
import { GameCoordinator } from "./coordinator";
import { createInitialState, startRound } from "../domain/transition";
import { FakeClock, RuntimeMock } from "../testing/runtimeMock";

const participants = ["Mira", "Jules", "Dev"].map((name, index) => ({
  id: `p${index + 1}`,
  name,
  connected: true,
  role: "controller" as const
}));

const ids = { count: 0, next(prefix: string) { this.count += 1; return `${prefix}-${this.count}`; } };
const random = { next: () => 0.25 };
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function authorityRuntime(shared = createInitialState("session", participants)) {
  return new RuntimeMock(
    { surfaceKind: "controller", participantId: "p1", authorityParticipantId: "p1", isAuthority: true, roomId: "room" },
    participants,
    shared
  );
}

test("only an authority controller can start and it advances lobby through the briefing", async () => {
  const runtime = authorityRuntime();
  const coordinator = new GameCoordinator({ runtime, clock: new FakeClock(), random, ids, prompts: bureauContent });
  coordinator.start();
  await tick();
  const result = await coordinator.advance();
  expect(result.status).toBe("applied");
  expect(runtime.sharedValue?.phase).toBe("instructions");
  expect(runtime.readyCount).toBe(1);
  coordinator.dispose();
  expect(runtime.teardownCount).toBe(runtime.subscriptionCount);

  const guest = new RuntimeMock(
    { surfaceKind: "controller", participantId: "p2", authorityParticipantId: "p1", isAuthority: false, roomId: "room" },
    participants,
    createInitialState("session", participants)
  );
  const guestCoordinator = new GameCoordinator({ runtime: guest, clock: new FakeClock(), random, ids, prompts: bureauContent });
  guestCoordinator.start();
  expect(await guestCoordinator.advance()).toMatchObject({ status: "rejected", reason: "not-authority" });
  expect(guest.sharedWrites).toHaveLength(0);
});

test("a private bluff is accepted once, echoed publicly, and survives a duplicate delivery", async () => {
  const clock = new FakeClock();
  const initial = createInitialState("session", participants);
  const caseFile = bureauContent.forRound(1, "session", random);
  const writing = startRound(initial, { roundId: "round-1", caseFile, deadlineAt: 60_000 }).state;
  const runtime = authorityRuntime(writing);
  const coordinator = new GameCoordinator({ runtime, clock, random, ids, prompts: bureauContent });
  coordinator.start();

  await coordinator.submitBluff("a small committee");
  await tick();
  await tick();
  expect(runtime.sharedValue?.submittedPlayerIds).toEqual(["p1"]);
  expect(runtime.sharedValue?.receipts.p1).toMatchObject({ status: "accepted" });
  const writesAfterReceipt = runtime.sharedWrites.length;
  runtime.writePlayerStateFor("p1", runtime.playerValues.p1!.value!);
  await tick();
  expect(runtime.sharedWrites).toHaveLength(writesAfterReceipt);
  expect(coordinator.snapshot().ownPlayerState?.pendingIntent?.payload).toEqual({ kind: "submit-bluff", text: "a small committee" });
});

test("authority retries after a stale shared revision and preserves the newer snapshot", async () => {
  const runtime = authorityRuntime();
  runtime.rejectNextShared({ status: "rejected", reason: "stale-revision", revision: 1, message: "Revision changed." });
  const coordinator = new GameCoordinator({ runtime, clock: new FakeClock(), random, ids, prompts: bureauContent });
  coordinator.start();
  const result = await coordinator.advance();
  expect(result).toMatchObject({ status: "rejected", reason: "stale-revision" });
  expect(runtime.rejections).toHaveLength(1);
  expect(coordinator.snapshot().lastError).toBeNull();
});
