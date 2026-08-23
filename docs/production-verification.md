# Production verification

## 2026-08-23 — Bluff Bureau 0.2.1 game-machine redesign

- Registry asset base: `https://tpg-registry.tp-games.workers.dev/published-assets/bluff-bureau/0.2.1`
- Fresh production room: `CTJ9G0`
- Catalog check: the production controller catalog returned Bluff Bureau as playable and loaded the `0.2.1` card artwork.
- Runtime check: the host and controller iframes both loaded from the exact `0.2.1` published asset base.
- Live phase check: lobby → instructions → writing → voting → results rendered successfully with the redesigned orange game-machine host and field-terminal controllers.
- Host authority check: the published host iframe contained zero buttons, links, inputs, selects, textareas, or focusable elements.
- Asset check: `host.html`, `controller.html`, the production stylesheet, and card artwork each returned HTTP 200. The live registry manifest reported version `0.2.1`, entry base `0.2.1`, and launch color `#f4511e`.
- Browser check: no page overflow at 1280×720 host or 375×812 controller; confidence and Lock vote remain in the phone viewport; no console errors were observed.
- Visual references: [`host-game-machine-results.png`](evidence/host-game-machine-results.png) and [`controller-field-terminal-voting.png`](evidence/controller-field-terminal-voting.png).

Release gates run immediately before publication:

```text
npm run typecheck
npm run test
npm run test:e2e
npm run validate
npm run publish:dry-run
npm run publish:game
```

Observed results: 8 unit tests passed, both Playwright journeys passed (including the complete four-round three-controller game and reconnect/authority coverage), the strict `0.2.1` archive validated, and registry publication returned `ok: true`.

## 2026-08-23 — Bluff Bureau 0.1.6

- Registry asset base: `https://tpg-registry.tp-games.workers.dev/published-assets/bluff-bureau/0.1.6`
- Fresh production room: `OTKMW0`
- Surfaces: one passive host display and three controller participants
- Completed journey: lobby → instructions → writing → voting → results
- Case file: “An octopus has ____ hearts.”
- Filed bluffs: “seven,” “five,” and “nine”
- Truth: “three”
- Votes: all three controllers found the truth; one used Certain confidence and received 2,000 points while the Sure votes received 1,000 points each
- Host authority check: the display presented state and never exposed game controls
- Console check: no runtime errors or warnings during the successful round
- Visual reference for the verified results layout: deterministic local [`host-max-results.png`](evidence/host-max-results.png)

Release gates run immediately before publication:

```text
npm run typecheck
npm test
npm run test:e2e
npm run validate
npm run publish:game
```

Observed results: 8 unit tests passed, both Playwright journeys passed, the strict `0.1.6` archive validated, and registry publication returned `ok: true`.
