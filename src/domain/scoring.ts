import type {
  BluffBureauState,
  ChoiceResult,
  PlayerScore,
  RoundResults,
  VoteSubmission
} from "./model";

function confidenceMultiplier(confidence: VoteSubmission["confidence"]): number {
  return confidence === "certain" ? 2 : 1;
}

export function scoreRound(
  state: BluffBureauState,
  votes: VoteSubmission[]
): { results: RoundResults; scores: Record<string, PlayerScore> } {
  if (!state.caseFile || state.phase !== "voting") {
    throw new Error("Scoring requires an active voting phase.");
  }

  const multiplier = state.roundNumber === state.totalRounds ? 2 : 1;
  const roundPoints = Object.fromEntries(state.roster.map((player) => [player.id, 0]));
  const scores = Object.fromEntries(
    state.roster.map((player) => [
      player.id,
      { ...(state.scores[player.id] ?? { score: 0, truthsFound: 0, playersFooled: 0 }) }
    ])
  );

  const choices: ChoiceResult[] = state.choices.map((choice) => {
    const choiceVotes = votes.filter((vote) => vote.choiceId === choice.id);
    const pointsByVoter: Record<string, number> = {};
    let pointsForAuthor = 0;

    for (const vote of choiceVotes) {
      const stake = confidenceMultiplier(vote.confidence);
      if (choice.kind === "truth") {
        const points = 1_000 * stake * multiplier;
        roundPoints[vote.voterId] = (roundPoints[vote.voterId] ?? 0) + points;
        pointsByVoter[vote.voterId] = points;
        scores[vote.voterId]!.truthsFound += 1;
      } else if (choice.kind === "bluff" && choice.authorId) {
        const points = 500 * stake * multiplier;
        roundPoints[choice.authorId] = (roundPoints[choice.authorId] ?? 0) + points;
        pointsForAuthor += points;
        scores[choice.authorId]!.playersFooled += 1;
      }
    }

    return {
      ...choice,
      voterIds: choiceVotes.map((vote) => vote.voterId),
      pointsByVoter,
      pointsForAuthor
    };
  });

  for (const [playerId, points] of Object.entries(roundPoints)) {
    scores[playerId]!.score += points;
  }

  return {
    scores,
    results: {
      roundNumber: state.roundNumber,
      multiplier,
      caseFile: state.caseFile,
      choices,
      roundPoints
    }
  };
}
