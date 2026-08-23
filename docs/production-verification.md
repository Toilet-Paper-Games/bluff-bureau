# Production verification

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
