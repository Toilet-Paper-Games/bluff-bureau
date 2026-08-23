# Production verification

## 2026-08-23 — Bluff Bureau 0.2.2 no-scroll arcade controls

- Registry asset base: `https://tpg-registry.tp-games.workers.dev/published-assets/bluff-bureau/0.2.2`
- Publication check: registry publication returned `ok: true` with manifest version `0.2.2`, entry base `0.2.2`, and launch color `#f4511e`.
- Asset check: `host.html`, `controller.html`, `spectator.html`, the production stylesheet, and card artwork each returned HTTP 200.
- Integrity check: SHA-256 hashes for the published host, controller, spectator, and stylesheet matched the files from the locally validated `0.2.2` archive exactly.
- Controller check: the maximum eight selectable answers render as a fixed 2×4 arcade pad at 375×812. Page overflow and answer-pad overflow both measured 0 px; all eight keys, confidence controls, and Lock vote remained visible in the first viewport.
- Interaction check: answer selection remained native and keyboard-focusable; an empty Lock vote focuses the first answer and displays literal recovery copy; making a valid selection clears that message.
- Host check: maximum voting at 1280×720 showed all nine public choices and all eight score rows inside the CRT with 0 px page overflow. The ninth answer ended 34 px above the screen edge, the last score row ended 28 px above it, and the host contained zero interactive elements.
- Visual check: the controller is a molded orange handheld with four-color physical answer keys and a circular red Lock vote control. The host is an orange game-show cabinet with marquee bulbs, round lamps, color-mapped answer hardware, a truth board, and mechanical score tokens.
- Console and performance check: no browser console errors were observed. FCP and LCP were 1.07 s, CLS was 0.04, and the worst long-animation-frame blocking duration was 55 ms.
- Visual references: [`controller-gamepad-voting.png`](evidence/controller-gamepad-voting.png), [`host-arcade-voting.png`](evidence/host-arcade-voting.png), and [`host-arcade-results.png`](evidence/host-arcade-results.png).

Release gates run immediately before publication:

```text
npm run typecheck
npm run test
npm run test:e2e
npm run validate
npm run publish:dry-run
npm run publish:game
```

Observed results: 8 unit tests passed, all 3 Playwright journeys passed (including the complete four-round game, reconnect/authority coverage, and the maximum-choice no-scroll regression), the strict `0.2.2` archive validated, and registry publication returned `ok: true`.

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
