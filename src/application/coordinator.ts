import type {
  BluffBureauState,
  BluffSubmission,
  PlayerIntentEnvelope,
  PlayerIntentState,
  PlayerSummary,
  VoteSubmission
} from "../domain/model";
import {
  applyPlayerIntent,
  closeVoting,
  createInitialState,
  finishResults,
  openVoting,
  showInstructions,
  startRound,
  syncRoster
} from "../domain/transition";
import { SeededRandom, hashSeed, silentSound } from "./defaults";
import type {
  ClockPort,
  IdGeneratorPort,
  MutationResult,
  PromptContentPort,
  RandomPort,
  RuntimeContextValue,
  RuntimeParticipantValue,
  RuntimePort,
  SoundPort
} from "./ports";

export const PHASE_DURATIONS = {
  instructions: 16_000,
  writing: 70_000,
  voting: 45_000,
  results: 18_000,
  roundBreak: 6_000
} as const;

export interface CoordinatorSnapshot {
  state: BluffBureauState | undefined;
  sharedRevision: number;
  participants: RuntimeParticipantValue[];
  context: RuntimeContextValue;
  lifecycle: string;
  ownPlayerState: PlayerIntentState | undefined;
  ownPlayerRevision: number;
  playerStates: Record<string, PlayerIntentState>;
  playerWritePending: boolean;
  lastError: string | null;
}

export interface CoordinatorDependencies {
  runtime: RuntimePort;
  clock: ClockPort;
  random: RandomPort;
  ids: IdGeneratorPort;
  prompts: PromptContentPort;
  sound?: SoundPort;
}

export type CoordinatorActionResult =
  | MutationResult
  | { status: "rejected"; reason: "not-controller" | "not-ready" | "not-authority" | "invalid-phase" | "too-few-players"; message: string };

type SnapshotListener = (snapshot: CoordinatorSnapshot) => void;

function controllerRoster(participants: RuntimeParticipantValue[]): PlayerSummary[] {
  return participants
    .filter((participant) => participant.role === "controller")
    .slice(0, 8)
    .map(({ connected, id, name }) => ({ connected, id, name }));
}

function rosterForState(state: BluffBureauState, participants: RuntimeParticipantValue[]): PlayerSummary[] {
  const live = controllerRoster(participants);
  if (state.phase === "lobby" || state.phase === "instructions") return live;
  return state.roster.map((player) => ({
    ...player,
    connected: live.find((candidate) => candidate.id === player.id)?.connected ?? false
  }));
}

function sameRoster(left: PlayerSummary[], right: PlayerSummary[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export class GameCoordinator {
  private readonly runtime: RuntimePort;
  private readonly clock: ClockPort;
  private readonly random: RandomPort;
  private readonly ids: IdGeneratorPort;
  private readonly prompts: PromptContentPort;
  private readonly sound: SoundPort;
  private readonly listeners = new Set<SnapshotListener>();
  private readonly unsubscribers: Array<() => void> = [];
  private snapshotValue: CoordinatorSnapshot;
  private timer: unknown;
  private disposed = false;
  private commitInFlight = false;
  private driveQueued = false;
  private readyReported = false;

  constructor(dependencies: CoordinatorDependencies) {
    this.runtime = dependencies.runtime;
    this.clock = dependencies.clock;
    this.random = dependencies.random;
    this.ids = dependencies.ids;
    this.prompts = dependencies.prompts;
    this.sound = dependencies.sound ?? silentSound;
    const shared = this.runtime.sharedState();
    const own = this.runtime.ownPlayerState();
    this.snapshotValue = {
      state: shared.value,
      sharedRevision: shared.revision,
      participants: this.runtime.participants(),
      context: this.runtime.context(),
      lifecycle: "boot",
      ownPlayerState: own.value,
      ownPlayerRevision: own.revision,
      playerStates: {},
      playerWritePending: false,
      lastError: null
    };
  }

  start(): void {
    this.unsubscribers.push(
      this.runtime.subscribeSharedState((shared) => {
        this.commitInFlight = false;
        this.patch({ state: shared.value, sharedRevision: shared.revision, lastError: null });
        this.requestDrive();
      }),
      this.runtime.subscribePlayerState((participantId, playerState) => {
        const playerStates = { ...this.snapshotValue.playerStates };
        if (playerState.value) playerStates[participantId] = playerState.value;
        else delete playerStates[participantId];
        const isOwn = participantId === this.snapshotValue.context.participantId;
        this.patch({
          playerStates,
          ...(isOwn
            ? { ownPlayerState: playerState.value, ownPlayerRevision: playerState.revision, playerWritePending: false }
            : {})
        });
        this.requestDrive();
      }),
      this.runtime.subscribeParticipants((participants) => {
        this.patch({ participants });
        this.requestDrive();
      }),
      this.runtime.subscribeContext((context) => {
        this.patch({ context });
        this.requestDrive();
      }),
      this.runtime.subscribeLifecycle((lifecycle) => this.patch({ lifecycle }))
    );
    if (!this.readyReported) {
      this.readyReported = true;
      void this.runtime.reportReady();
    }
    this.requestDrive();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearPhaseTimer();
    for (const unsubscribe of this.unsubscribers.splice(0)) unsubscribe();
    this.listeners.clear();
  }

  snapshot(): CoordinatorSnapshot {
    return this.snapshotValue;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshotValue);
    return () => this.listeners.delete(listener);
  }

  submitBluff(text: string): Promise<CoordinatorActionResult> {
    return this.submitIntent({ kind: "submit-bluff", text });
  }

  submitVote(choiceId: string, confidence: "sure" | "certain"): Promise<CoordinatorActionResult> {
    return this.submitIntent({ kind: "submit-vote", choiceId, confidence });
  }

  async advance(): Promise<CoordinatorActionResult> {
    const { context, state } = this.snapshotValue;
    if (context.surfaceKind !== "controller" || !context.isAuthority) {
      return { status: "rejected", reason: "not-authority", message: "Only the room director can advance the file." };
    }
    if (!state) return { status: "rejected", reason: "not-ready", message: "The room is still preparing." };
    if (state.phase === "lobby") {
      if (state.roster.filter((player) => player.connected).length < 3) {
        return { status: "rejected", reason: "too-few-players", message: "Bluff Bureau needs at least 3 players." };
      }
      return (await this.commitApplied(showInstructions(state, this.clock.now() + PHASE_DURATIONS.instructions)))!;
    }
    if (state.phase === "instructions" || state.phase === "round-break") {
      return (await this.beginRound())!;
    }
    if (state.phase === "results") {
      return (await this.commitApplied(finishResults(state, this.clock.now() + PHASE_DURATIONS.roundBreak)))!;
    }
    return { status: "rejected", reason: "invalid-phase", message: "This file advances automatically." };
  }

  openSettings(): Promise<void> {
    return this.isAuthorityController() ? this.runtime.openSettings() : Promise.resolve();
  }

  returnToLobby(): Promise<void> {
    return this.isAuthorityController() ? this.runtime.returnToLobby() : Promise.resolve();
  }

  private isAuthorityController(): boolean {
    return this.snapshotValue.context.surfaceKind === "controller" && this.snapshotValue.context.isAuthority;
  }

  private async submitIntent(payload: PlayerIntentEnvelope["payload"]): Promise<CoordinatorActionResult> {
    const { context, state } = this.snapshotValue;
    if (context.surfaceKind !== "controller" || !context.participantId) {
      return { status: "rejected", reason: "not-controller", message: "Only a controller can file a response." };
    }
    if (!state) return { status: "rejected", reason: "not-ready", message: "The room is still preparing." };
    const value: PlayerIntentState = {
      pendingIntent: {
        id: this.ids.next(payload.kind),
        expectedPhase: state.phase,
        expectedSequence: state.sequence,
        issuedAt: this.clock.now(),
        roundId: state.roundId,
        payload
      }
    };
    this.patch({ playerWritePending: true, lastError: null });
    const result = await this.runtime.writeOwnPlayerState(value, this.snapshotValue.ownPlayerRevision);
    if (result.status === "rejected") this.patch({ playerWritePending: false, lastError: result.message });
    return result;
  }

  private patch(updates: Partial<CoordinatorSnapshot>) {
    this.snapshotValue = { ...this.snapshotValue, ...updates };
    for (const listener of this.listeners) listener(this.snapshotValue);
  }

  private requestDrive() {
    if (this.driveQueued || this.disposed) return;
    this.driveQueued = true;
    queueMicrotask(() => {
      this.driveQueued = false;
      void this.drive();
    });
  }

  private acceptedSubmissions(state: BluffBureauState): BluffSubmission[] {
    return state.submittedPlayerIds.flatMap((playerId) => {
      const intent = this.snapshotValue.playerStates[playerId]?.pendingIntent;
      const receipt = state.receipts[playerId];
      if (!intent || intent.payload.kind !== "submit-bluff" || receipt?.status !== "accepted" || receipt.intentId !== intent.id) return [];
      return [{ id: intent.id, authorId: playerId, text: intent.payload.text.trim().replace(/\s+/g, " "), submittedAt: intent.issuedAt }];
    });
  }

  private acceptedVotes(state: BluffBureauState): VoteSubmission[] {
    return state.votedPlayerIds.flatMap((playerId) => {
      const intent = this.snapshotValue.playerStates[playerId]?.pendingIntent;
      const receipt = state.receipts[playerId];
      if (!intent || intent.payload.kind !== "submit-vote" || receipt?.status !== "accepted" || receipt.intentId !== intent.id) return [];
      return [{ id: intent.id, voterId: playerId, choiceId: intent.payload.choiceId, confidence: intent.payload.confidence, submittedAt: intent.issuedAt }];
    });
  }

  private async drive() {
    if (this.disposed) return;
    this.clearPhaseTimer();
    if (!this.snapshotValue.context.isAuthority || this.commitInFlight) return;
    const state = this.snapshotValue.state;
    if (!state) {
      await this.commit(createInitialState(this.ids.next("session"), controllerRoster(this.snapshotValue.participants)));
      return;
    }

    const nextRoster = rosterForState(state, this.snapshotValue.participants);
    if (!sameRoster(state.roster, nextRoster)) {
      await this.commit(syncRoster(state, nextRoster));
      return;
    }

    for (const [participantId, playerState] of Object.entries(this.snapshotValue.playerStates)) {
      const intent = playerState.pendingIntent;
      if (!intent || intent.expectedPhase !== state.phase || state.receipts[participantId]?.intentId === intent.id) continue;
      const participant = this.snapshotValue.participants.find((candidate) => candidate.id === participantId);
      const transition = applyPlayerIntent(
        state,
        {
          actorId: participantId,
          actorRole: participant?.role ?? "spectator",
          now: this.clock.now(),
          submissions: this.acceptedSubmissions(state),
          votes: this.acceptedVotes(state)
        },
        intent
      );
      if (transition.status !== "duplicate") {
        await this.commit(transition.state);
        return;
      }
    }

    const now = this.clock.now();
    const deadlineReached = state.deadlineAt !== null && now >= state.deadlineAt;
    const connectedIds = state.roster.filter((player) => player.connected).map((player) => player.id);

    if (state.phase === "instructions" && deadlineReached) {
      await this.beginRound();
      return;
    }
    if (
      state.phase === "writing" &&
      (deadlineReached || (connectedIds.length >= 3 && connectedIds.every((id) => state.submittedPlayerIds.includes(id))))
    ) {
      this.sound.play("voting-open");
      await this.commitApplied(openVoting(state, this.acceptedSubmissions(state), this.random, now + PHASE_DURATIONS.voting));
      return;
    }
    if (
      state.phase === "voting" &&
      (deadlineReached || connectedIds.every((id) => state.votedPlayerIds.includes(id)))
    ) {
      this.sound.play("truth-reveal");
      await this.commitApplied(closeVoting(state, this.acceptedVotes(state), now + PHASE_DURATIONS.results));
      await this.runtime.reportAnalytics({
        type: "round.completed",
        name: "bluff-bureau-round-completed",
        dimensions: { round: state.roundNumber, finale: state.roundNumber === state.totalRounds },
        metrics: { submissions: state.submittedPlayerIds.length, votes: state.votedPlayerIds.length }
      });
      return;
    }
    if (state.phase === "results" && deadlineReached) {
      await this.commitApplied(finishResults(state, now + PHASE_DURATIONS.roundBreak));
      return;
    }
    if (state.phase === "round-break" && deadlineReached) {
      await this.beginRound();
      return;
    }
    this.schedulePhaseTimer(state.deadlineAt);
  }

  private async beginRound(): Promise<MutationResult | undefined> {
    const state = this.snapshotValue.state;
    if (!state) return undefined;
    const roundNumber = state.roundNumber + 1;
    const caseFile = this.prompts.forRound(roundNumber, state.sessionId, this.random);
    if (roundNumber === state.totalRounds) this.sound.play("finale");
    else this.sound.play("writing-open");
    return this.commitApplied(
      startRound(state, {
        roundId: this.ids.next("round"),
        caseFile,
        deadlineAt: this.clock.now() + PHASE_DURATIONS.writing + (state.roster.length >= 7 ? 10_000 : 0)
      })
    );
  }

  private async commitApplied(transition: import("../domain/transition").InternalTransitionResult): Promise<MutationResult | undefined> {
    if (transition.status === "rejected") {
      this.patch({ lastError: transition.reason });
      return undefined;
    }
    return this.commit(transition.state);
  }

  private async commit(nextState: BluffBureauState): Promise<MutationResult> {
    this.commitInFlight = true;
    const result = await this.runtime.writeSharedState(nextState, this.snapshotValue.sharedRevision);
    if (result.status === "rejected") {
      this.commitInFlight = false;
      if (result.reason !== "stale-revision") this.patch({ lastError: result.message });
      this.requestDrive();
    }
    return result;
  }

  private schedulePhaseTimer(deadlineAt: number | null) {
    if (deadlineAt === null || !this.snapshotValue.context.isAuthority) return;
    this.timer = this.clock.setTimer(() => this.requestDrive(), Math.max(0, deadlineAt - this.clock.now()));
  }

  private clearPhaseTimer() {
    if (this.timer === undefined) return;
    this.clock.clearTimer(this.timer);
    this.timer = undefined;
  }
}

export function createCoordinatorRandom(sessionId: string): RandomPort {
  return new SeededRandom(hashSeed(sessionId));
}
