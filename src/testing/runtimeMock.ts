import type { BluffBureauState, PlayerIntentState } from "../domain/model";
import type { ClockPort, MutationResult, RuntimeContextValue, RuntimeParticipantValue, RuntimePort } from "../application/ports";

type SharedListener = Parameters<RuntimePort["subscribeSharedState"]>[0];
type PlayerListener = Parameters<RuntimePort["subscribePlayerState"]>[0];
type ParticipantListener = Parameters<RuntimePort["subscribeParticipants"]>[0];
type ContextListener = Parameters<RuntimePort["subscribeContext"]>[0];
type LifecycleListener = Parameters<RuntimePort["subscribeLifecycle"]>[0];

export class RuntimeMock implements RuntimePort {
  sharedValue: BluffBureauState | undefined;
  sharedRevision = 0;
  playerValues: Record<string, { value: PlayerIntentState | undefined; revision: number }> = {};
  sharedWrites: Array<{ value: BluffBureauState; expectedRevision: number }> = [];
  playerWrites: Array<{ participantId: string; value: PlayerIntentState; expectedRevision: number }> = [];
  messages: unknown[] = [];
  analytics: Array<Parameters<RuntimePort["reportAnalytics"]>[0]> = [];
  rejections: Array<{ target: "shared" | "player"; result: MutationResult }> = [];
  subscriptionCount = 0;
  teardownCount = 0;
  readyCount = 0;
  settingsCount = 0;
  lobbyCount = 0;

  private sharedListeners = new Set<SharedListener>();
  private playerListeners = new Set<PlayerListener>();
  private participantListeners = new Set<ParticipantListener>();
  private contextListeners = new Set<ContextListener>();
  private lifecycleListeners = new Set<LifecycleListener>();
  private nextSharedRejection?: MutationResult;

  constructor(
    public contextValue: RuntimeContextValue,
    public participantValues: RuntimeParticipantValue[],
    shared?: BluffBureauState
  ) {
    this.sharedValue = shared;
  }

  context() { return this.contextValue; }
  participants() { return this.participantValues; }
  sharedState() { return { value: this.sharedValue, revision: this.sharedRevision }; }
  ownPlayerState() {
    const id = this.contextValue.participantId ?? "";
    return this.playerValues[id] ?? { value: undefined, revision: 0 };
  }

  rejectNextShared(result: MutationResult) { this.nextSharedRejection = result; }

  async writeSharedState(value: BluffBureauState, expectedRevision: number): Promise<MutationResult> {
    this.sharedWrites.push({ value: structuredClone(value), expectedRevision });
    if (this.nextSharedRejection) {
      const result = this.nextSharedRejection;
      this.nextSharedRejection = undefined;
      this.rejections.push({ target: "shared", result });
      return result;
    }
    if (expectedRevision !== this.sharedRevision) {
      const result: MutationResult = { status: "rejected", reason: "stale-revision", revision: this.sharedRevision, message: "Revision changed." };
      this.rejections.push({ target: "shared", result });
      return result;
    }
    this.sharedValue = structuredClone(value);
    this.sharedRevision += 1;
    const snapshot = this.sharedState();
    for (const listener of this.sharedListeners) listener(snapshot);
    return { status: "applied", revision: this.sharedRevision };
  }

  async writeOwnPlayerState(value: PlayerIntentState, expectedRevision: number): Promise<MutationResult> {
    const participantId = this.contextValue.participantId;
    if (!participantId) return { status: "rejected", reason: "not-owner", revision: 0, message: "No player owns this surface." };
    const current = this.playerValues[participantId] ?? { value: undefined, revision: 0 };
    this.playerWrites.push({ participantId, value: structuredClone(value), expectedRevision });
    if (expectedRevision !== current.revision) {
      const result: MutationResult = { status: "rejected", reason: "stale-revision", revision: current.revision, message: "Player revision changed." };
      this.rejections.push({ target: "player", result });
      return result;
    }
    this.playerValues[participantId] = { value: structuredClone(value), revision: current.revision + 1 };
    for (const listener of this.playerListeners) listener(participantId, this.playerValues[participantId]!);
    return { status: "applied", revision: current.revision + 1 };
  }

  writePlayerStateFor(participantId: string, value: PlayerIntentState): void {
    const current = this.playerValues[participantId] ?? { value: undefined, revision: 0 };
    const snapshot = { value: structuredClone(value), revision: current.revision + 1 };
    this.playerValues[participantId] = snapshot;
    for (const listener of this.playerListeners) listener(participantId, snapshot);
  }

  setParticipants(participants: RuntimeParticipantValue[]) {
    this.participantValues = participants;
    for (const listener of this.participantListeners) listener(participants);
  }

  setContext(context: RuntimeContextValue) {
    this.contextValue = context;
    for (const listener of this.contextListeners) listener(context);
  }

  emitLifecycle(lifecycle: string) { for (const listener of this.lifecycleListeners) listener(lifecycle); }

  subscribeSharedState(listener: SharedListener) { return this.track(this.sharedListeners, listener); }
  subscribePlayerState(listener: PlayerListener) {
    for (const [id, snapshot] of Object.entries(this.playerValues)) listener(id, snapshot);
    return this.track(this.playerListeners, listener);
  }
  subscribeParticipants(listener: ParticipantListener) { return this.track(this.participantListeners, listener); }
  subscribeContext(listener: ContextListener) { return this.track(this.contextListeners, listener); }
  subscribeLifecycle(listener: LifecycleListener) { return this.track(this.lifecycleListeners, listener); }

  async reportReady() { this.readyCount += 1; }
  async openSettings() { this.settingsCount += 1; }
  async returnToLobby() { this.lobbyCount += 1; }
  async reportAnalytics(event: Parameters<RuntimePort["reportAnalytics"]>[0]) { this.analytics.push(event); }

  private track<T>(set: Set<T>, listener: T): () => void {
    set.add(listener);
    this.subscriptionCount += 1;
    return () => {
      if (set.delete(listener)) this.teardownCount += 1;
    };
  }
}

export class FakeClock implements ClockPort {
  private timers = new Map<number, { at: number; callback: () => void }>();
  private nextId = 1;
  constructor(private current = 1_000) {}
  now() { return this.current; }
  setTimer(callback: () => void, delayMs: number) {
    const id = this.nextId++;
    this.timers.set(id, { at: this.current + delayMs, callback });
    return id;
  }
  clearTimer(timer: unknown) { this.timers.delete(Number(timer)); }
  advanceBy(milliseconds: number) {
    this.current += milliseconds;
    const ready = [...this.timers.entries()].filter(([, timer]) => timer.at <= this.current);
    for (const [id, timer] of ready) {
      this.timers.delete(id);
      timer.callback();
    }
  }
}
