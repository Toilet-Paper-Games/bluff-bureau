# Design artifacts

## Surface brief

| Surface | Job | Primary states | Interaction contract |
| --- | --- | --- | --- |
| Host | Unite the room around one prompt, tally, and reveal | lobby, instructions, writing, voting, results, break, game-over | Passive; zero buttons, inputs, links, or focusable elements |
| Controller | Give one player a private, explicit next action | lobby, writing, waiting, voting, personal results, reconnecting | All game input; organizer actions only for the elected authority |
| Spectator | Follow the public game without joining it | every host phase | Passive, labeled spectator feed, no private state |
| Gallery | Make each meaningful state directly reviewable | all phases, reconnect, min/max roster | Development-only deterministic harness; excluded from the bundle |

## Direction

The chosen concept seed was `2416510a`, grounded direction candidate 3. The world is a late-20th-century mechanical truth-routing bureau: midnight-cobalt enamel, warm ivory split-flap cells, vivid orange signals, mint truth stamps, and restrained magenta seals. Controllers adapt that same system into private paper dockets.

The first viewport carries one decisive task. Secondary progress and standings sit on narrow rails. The host is a show surface, never a dashboard. The controller uses visible labels, minimum 44px targets, 16px inputs, strong focus treatment, reflow, reduced-motion handling, and redundant text/status cues.

## North-star state comps

- [Writing](../.impeccable/mocks/host-writing.png)
- [Voting](../.impeccable/mocks/host-voting.png)
- [Results](../.impeccable/mocks/host-results.png)

Generation intent is embedded in each PNG and preserved separately under `.impeccable/prompts/`. The implemented UI follows the comps’ information hierarchy and material language while using live HTML/CSS for accessibility and responsiveness.

## Production artwork

- [Hero](../assets/artwork/hero.png)
- [Card](../assets/artwork/card.png)
- [Thumbnail](../assets/artwork/thumbnail.png)

The source image prompt is embedded in every derivative. All artwork is original to this game and contains no third-party brand assets.

## Review evidence

- [Full four-file playthrough](evidence/full-game-playthrough.webm)
- [Final standings capture](evidence/final-standings.png)
- [Mid-round reconnect and authority transfer](evidence/reconnect-authority.webm)
- Scenario gallery: run `npm run dev`, then open `/gallery.html?surface=host&scenario=results`.
