# Developer experience journal

## 2026-08-23 — author contract recovery and scaffold

- Attempted: reviewed the current TPG author guide, React tutorial, SDK lifecycle guide, capability matrix, testing principles, and public package versions; scaffolded with `npm create @tpgames/game@latest`.
- Worked well: the public scaffold created a standalone project with current package pins, validation scripts, GitHub Actions, agent guidance, and no private registry dependency.
- Confusing or failure-prone: the monorepo requires a `better-interface` design skill, but that skill is not present in the available repo-scoped skill catalog.
- Workaround: use Penpot, Impeccable, accessibility, colors, layout, typography, UI, and writing skills as the remaining design stack, then perform an integrated manual review.
- Ownership: platform repository.
- Suggested fix: add the referenced `better-interface` skill to `.agents/skills` or remove it from `AGENTS.md`.
- Acceptance criteria: a fresh agent can resolve every mandatory design skill named by `AGENTS.md` without a missing-skill exception.

## 2026-08-23 — Penpot design bridge

- Attempted: started the repository Penpot MCP bridge and requested a read-only canvas overview before creating the UI direction.
- Worked well: the skill documentation clearly separated editable canvas exploration from repository design snapshots.
- Confusing or failure-prone: the MCP server was available, but no Penpot plugin instance was connected, so even the read-only overview failed with `No Penpot plugin instances are currently connected.`
- Workaround: generated three explicit north-star state comps through the Impeccable image workflow, embedded their prompts, and recorded the design contract in repository artifacts.
- Ownership: local design-tool connection/setup, not the game runtime.
- Suggested fix: have the desktop app expose Penpot connection status before a repository mandates its design bridge.
- Acceptance criteria: the agent can detect the missing plugin instance before starting the bridge and receives a direct connection action.

## 2026-08-23 — synchronized workbench playthrough

- Attempted: automated a full game with one host and three controller iframes, then automated disconnect/reconnect and authority transfer.
- Worked well: the workbench exposed lifecycle, participant authority, network profile, shared state, player state, and frame-level surfaces in one page. It found a simultaneous-form race in the test itself and made the host-passivity invariant directly assertable.
- Confusing or failure-prone: a disconnected controller intentionally stops receiving state, so its last rendered game UI cannot itself announce the shell’s reconnecting status; that status is visible in the shell/workbench participant model until transport returns.
- Workaround: the bundled controller has an explicit reconnecting renderer for contexts that can report that lifecycle. The end-to-end check disconnects after a confirmed bluff, asserts the shell reconnect state, verifies the confirmation returns, and transfers authority while the writing deadline remains active.
- Ownership: documented runtime behavior; no platform issue filed because the shell provides the authoritative reconnect feedback and the behavior is internally consistent.

## 2026-08-23 — public package and validator drift

- Attempted: bundled the exact archive, ran the scaffolded validation command, then ran production-registration dry-run.
- Worked well: registration dry-run performs the real package-level schema preflight before authentication or upload.
- Confusing or failure-prone: the public scaffold contains the newly merged `displayInteraction: passive` field, while the latest public manifest/registration packages reject it. The installed `tpg` validator bin also exits silently through its npm symlink because its entrypoint guard compares an unresolved symlink path with the resolved module URL.
- Workaround: use the manifest package API directly for strict local validation; declare controller-only playable topology plus a passive-host presentation tag until the public schema release is available.
- Ownership: platform public-package delivery and manifest CLI.
- Issues: [#930](https://github.com/Toilet-Paper-Games/Toilet-Paper-Games/issues/930) and [#931](https://github.com/Toilet-Paper-Games/Toilet-Paper-Games/issues/931).
- Acceptance criteria: a clean public scaffold validates and dry-runs the same passive manifest, and the real installed `tpg` bin prints results and returns a truthful exit code.
