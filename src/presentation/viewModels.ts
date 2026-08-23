import type { CoordinatorSnapshot } from "../application/coordinator";
import type {
  BluffBureauState,
  Choice,
  GamePhase,
  IntentReceipt,
  PlayerSummary,
  RoundResults
} from "../domain/model";

export interface ScoreRow {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export interface PublicViewModel {
  phase: GamePhase | "loading";
  roundNumber: number;
  totalRounds: number;
  deadlineAt: number | null;
  roster: PlayerSummary[];
  scoreboard: ScoreRow[];
  prompt: string;
  category: string;
  choices: Choice[];
  submittedCount: number;
  votedCount: number;
  results: RoundResults | null;
  isSpectator: boolean;
}

export interface ControllerViewModel extends PublicViewModel {
  playerId: string;
  playerName: string;
  isAuthority: boolean;
  isConnected: boolean;
  receipt?: IntentReceipt;
  playerScore: number;
  ownChoiceId?: string;
  writePending: boolean;
  error: string | null;
}

function scoreRows(state: BluffBureauState | undefined): ScoreRow[] {
  if (!state) return [];
  return state.roster
    .map((player) => ({
      id: player.id,
      name: player.name,
      connected: player.connected,
      score: state.scores[player.id]?.score ?? 0
    }))
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

export function publicView(snapshot: CoordinatorSnapshot, isSpectator = false): PublicViewModel {
  const state = snapshot.state;
  return {
    phase: state?.phase ?? "loading",
    roundNumber: state?.roundNumber ?? 0,
    totalRounds: state?.totalRounds ?? 4,
    deadlineAt: state?.deadlineAt ?? null,
    roster: state?.roster ?? [],
    scoreboard: scoreRows(state),
    prompt: state?.caseFile?.prompt ?? "",
    category: state?.caseFile?.category ?? "",
    choices: state?.choices ?? [],
    submittedCount: state?.submittedPlayerIds.length ?? 0,
    votedCount: state?.votedPlayerIds.length ?? 0,
    results: state?.lastRoundResults ?? null,
    isSpectator
  };
}

export function controllerView(snapshot: CoordinatorSnapshot): ControllerViewModel {
  const base = publicView(snapshot);
  const playerId = snapshot.context.participantId ?? "";
  const player = base.roster.find((candidate) => candidate.id === playerId);
  return {
    ...base,
    playerId,
    playerName: player?.name ?? "Player",
    isAuthority: snapshot.context.isAuthority,
    isConnected: player?.connected ?? !snapshot.lifecycle.includes("loading"),
    receipt: snapshot.state?.receipts[playerId],
    playerScore: snapshot.state?.scores[playerId]?.score ?? 0,
    ownChoiceId: snapshot.state?.choices.find((choice) => choice.authorId === playerId)?.id,
    writePending: snapshot.playerWritePending,
    error: snapshot.lastError
  };
}
