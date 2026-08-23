# Bluff Bureau game design

## Hook

The Bureau has recovered a file containing one unbelievable-but-true fact. Everyone submits a plausible false answer, then tries to identify the truth. Before voting, each player chooses a confidence stake: **Sure** for normal points or **Certain** for double points—and double the reward for the bluff writer when the vote is wrong.

## Player loop

1. Read a strange fill-in-the-blank fact.
2. Write one convincing false answer on your controller.
3. Review the shuffled truth and bluffs on the shared display.
4. Choose an answer on your controller; you cannot choose your own bluff.
5. Choose **Sure** or **Certain**, then lock the vote.
6. Watch the reveal, authorship, and scoring on the shared display.

## Rounds and scoring

- Three case-file rounds followed by one finale.
- Correct truth vote: 1,000 points × confidence multiplier.
- Each fooled voter: bluff author earns 500 points × that voter’s confidence multiplier.
- The finale uses a 2× round multiplier, making a comeback possible without erasing earlier play.
- Bluffs are 2–36 characters. Empty, truth-matching, or duplicate answers receive the same generic retry message so validation cannot be used as a truth oracle. The authority never exposes a player’s own bluff as a valid vote.

## Phases

- `lobby`: player roster and authority-only start action.
- `instructions`: one-screen rules and authority-only begin action.
- `writing`: private bluff input with timer and confirmed submission echo.
- `waiting`: submitted/reconnecting players see progress without other answers.
- `voting`: shuffled choices, private selection, confidence stake, confirmed vote echo.
- `results`: truth, bluff authors, fooled voters, points, and scoreboard.
- `round-break`: next-file framing and authority-only continuation.
- `finale`: final prompt and explicit 2× stakes.
- `game-over`: podium, personal result, and authority-only return/rematch controls.

## Content policy

Prompts use concise, sourced-in-repository trivia written as self-contained facts. Answers avoid sensitive personal content, punching down, explicit material, or claims about present-day people. Content is static and deterministic for a published version.
