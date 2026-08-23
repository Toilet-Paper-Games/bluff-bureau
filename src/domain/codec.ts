import { GAME_SCHEMA_VERSION, type BluffBureauState, type PlayerIntentState } from "./model";

export function decodeBluffBureauState(value: unknown): BluffBureauState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const state = value as Partial<BluffBureauState>;
  if (
    state.schemaVersion !== GAME_SCHEMA_VERSION ||
    typeof state.sessionId !== "string" ||
    typeof state.sequence !== "number" ||
    typeof state.phase !== "string" ||
    !Array.isArray(state.roster) ||
    !Array.isArray(state.choices) ||
    typeof state.scores !== "object" ||
    state.scores === null
  ) {
    throw new Error("Received an invalid Bluff Bureau shared-state snapshot.");
  }
  return state as BluffBureauState;
}

export function decodePlayerIntentState(value: unknown): PlayerIntentState | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") throw new Error("Received an invalid player-state snapshot.");
  const state = value as PlayerIntentState;
  if (!state.pendingIntent) return {};
  if (
    typeof state.pendingIntent.id !== "string" ||
    typeof state.pendingIntent.issuedAt !== "number" ||
    typeof state.pendingIntent.expectedSequence !== "number" ||
    typeof state.pendingIntent.payload?.kind !== "string"
  ) {
    throw new Error("Received an invalid player intent.");
  }
  return state;
}
