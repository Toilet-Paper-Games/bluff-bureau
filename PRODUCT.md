# Bluff Bureau

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TP Games standalone browser game using TypeScript, Vite, and the public `@tpgames/game-kit` authoring boundary. The implementation stack is delegated by the autonomous delivery brief; React may be added for independently renderable stateful surfaces.

## Users

Groups of 3–8 friends, families, or coworkers playing together in one room. Players look at a shared display and use their own phones as private controllers. They should be able to begin without a spoken tutorial.

## Product Purpose

Bluff Bureau is a fast social word game about inventing believable lies, spotting the real strange fact, and deciding how confidently to stake a vote. A successful session produces surprising reveals, table talk, and comeback moments across a complete multi-round game in roughly 15 minutes.

## Positioning

The familiar write-a-lie and find-the-truth loop gains a confidence stake: a confident correct vote earns more, while a confident wrong vote pays the bluff writer more. This makes every answer choice both a deduction and a visible risk decision.

## Operating Context

- The shared host display is watched from across a room and is entirely passive.
- Every input and room-director action occurs on controllers.
- The shell-designated authority controller alone receives organizer actions.
- Controllers may be narrow phones; host and spectator surfaces may be large, landscape screens.
- Sessions are live, host-authoritative, and reconnectable within the TP Games room model.

## Capabilities and Constraints

- 3–8 players, with 5 recommended.
- Complete phases: lobby, how-to-play, writing, waiting, voting, results, between-round, reconnecting, and finale.
- Controllers own private submissions and votes; canonical phase, prompt, choices, results, and scores are authority-owned shared state.
- Deterministic clocks, random sources, IDs, content, fixtures, and runtime mocks must support direct entry into every meaningful state.
- The host bundle must contain no interactive or keyboard-focusable element and must pass strict passive-display validation.
- No credentials, generated archives, dependencies, or environment files are committed.
- Publication and a fresh production-room playthrough are part of delivery.

## Brand Commitments

- Name: Bluff Bureau.
- Voice: dry official certainty colliding with ridiculous facts; concise enough for a party room. Errors and recovery text remain calm and literal.
- The visual identity is inferred under the autonomous brief and may be refined through the mandated design workflow before implementation.

## Evidence on Hand

- The supplied delivery brief is the product source of truth.
- Current TP Games author guide, SDK lifecycle contract, capability matrix, React example, and public package versions were reviewed on 2026-08-23.
- No external brand assets, commercial claims, testimonials, or licensed media were supplied; none may be fabricated.

## Product Principles

1. Explain by playing: each controller always says what to do now and what happens next.
2. Make risk legible: confidence choices show their scoring consequence before commitment.
3. Keep the room together: the host emphasizes the shared reveal while private choices stay on phones.
4. Reward both wit and discernment: writing a convincing bluff and finding the truth are equally viable paths.
5. Recover clearly: reconnecting and waiting states preserve the player’s place without optimistic phantom progress.

## Accessibility & Inclusion

Controller flows must work with keyboard and screen readers, keep touch targets at least 44×44 CSS pixels, use visible labels and focus, avoid color-only status, respect reduced motion, support 200% zoom, and reflow without horizontal scrolling at 320 CSS pixels. Timed phases must provide clear remaining-time text and preserve submitted state on reconnect.
