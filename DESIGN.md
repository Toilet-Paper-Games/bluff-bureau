---
name: Bluff Bureau
description: A room-sized lie-processing machine for unbelievable facts.
colors:
  night: "oklch(0.105 0.028 255)"
  screen: "oklch(0.145 0.03 247)"
  screen-raised: "oklch(0.19 0.035 246)"
  steel: "oklch(0.44 0.025 246)"
  steel-light: "oklch(0.68 0.03 245)"
  evidence-cream: "oklch(0.94 0.055 91)"
  cream-shadow: "oklch(0.79 0.065 82)"
  chassis-orange: "oklch(0.68 0.205 39)"
  pressed-orange: "oklch(0.47 0.175 35)"
  signal-yellow: "oklch(0.9 0.185 98)"
  truth-phosphor: "oklch(0.9 0.2 133)"
  phosphor-shadow: "oklch(0.63 0.16 139)"
  instrument-cyan: "oklch(0.78 0.145 211)"
  bureau-magenta: "oklch(0.68 0.24 350)"
  alert-red: "oklch(0.62 0.22 27)"
  focus-lime: "oklch(0.96 0.2 111)"
  ink: "oklch(0.16 0.03 252)"
typography:
  display:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 8rem)"
    fontWeight: 850
    lineHeight: 0.86
    letterSpacing: "-0.025em"
  controller-headline:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.4rem, 11vw, 4.1rem)"
    fontWeight: 850
    lineHeight: 0.88
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  instrument-label:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 780
    lineHeight: 1.2
    letterSpacing: "0.11em"
rounded:
  control: "0.55rem"
  screen: "clamp(1.2rem, 2.5vw, 2.2rem)"
  terminal: "clamp(1.6rem, 6vw, 2.4rem)"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
components:
  arcade-action:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "999px"
    padding: "0.8rem 1rem"
    height: "3.5rem"
    width: "100%"
  answer-key:
    backgroundColor: "{colors.evidence-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "3.75rem"
  crt-screen:
    backgroundColor: "{colors.screen}"
    textColor: "{colors.truth-phosphor}"
    rounded: "{rounded.screen}"
  field-terminal:
    backgroundColor: "{colors.chassis-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.terminal}"
    width: "min(100%, 34rem)"
---

# Design System: Bluff Bureau

## Overview

**The Lie-Processing Machine**

Grounded direction 6, concept seed `90460392`.

Bluff Bureau is a saturated late-1970s microfilm evidence theater: a single orange machine that scans strange facts, feeds candidate answers through a CRT, and certifies one ridiculous truth in phosphor green. It should be remembered as a game-show prop, never as a website with a themed background.

The shared display is one passive physical apparatus. Its identity rail, persistent film drive, CRT glass, evidence field, result feed, lamps, and knobs remain in place while the game state changes inside the machine. A phone becomes a chunky Bureau field terminal with an antenna, inset display well, arcade answer bank, confidence controls, and one large lock button.

**Key Characteristics:**

- A committed orange chassis owns the screen, with a subtle authored enamel texture rather than a flat app background.
- Near-black CRT glass contains public game state. Scanlines, graticule-like rings, glow, and mechanical seams suggest an operating instrument.
- Cream evidence stock carries answer text; acid phosphor green is exclusive to truth and confirmed state.
- Signal yellow identifies attention and primary action. Cyan labels measurement. Magenta marks Bureau identity and choice lamps.
- Steel screws, reels, film paths, bezels, and knobs make depth structural. They are machine parts, not generic decoration.

## Colors

The saturated palette separates physical machine parts from operational signals. Chassis orange owns the hardware; night, screen, and steel neutrals construct the CRT and mechanisms; evidence cream carries answer text; phosphor green certifies truth; yellow signals attention and action; cyan labels measurement; magenta identifies the Bureau; alert red marks errors; and focus lime is reserved for visible keyboard focus.

### Named Rules

**Truth Owns Phosphor.** Acid green certifies truth, success, and confirmed state. Yellow means act or attend, cyan means measurement, and magenta identifies the Bureau.

## Typography

Archivo Narrow Variable is the machine voice: titles, prompts, counters, answer paddles, score drums, and instrument labels. Source Sans 3 Variable is the human voice: explanations, helper text, errors, and controller detail.

Public declarations are condensed, heavy, and built for across-room reading. Controller inputs remain at least 16 px. Dynamic numbers use tabular figures. Headings balance; helper copy wraps naturally.

## Layout

### Host Topology

The host keeps three permanent layers:

1. The top instrument rail identifies the game, exposes the persistent reel-to-reel film drive, shows machine activity, and names the file.
2. The CRT owns all changing game state. One prompt, answer bank, truth reveal, or podium dominates at a time.
3. The lower control deck carries three signal lamps, a plain-language status annunciator, and two physical knobs.

The host must contain no buttons, links, or focusable controls. At 1280×720 it never scrolls. Below 46 rem, the machine reflows to one column and may scroll rather than clip content.

### Controller Topology

The controller is a handheld object, not a paper form. Orange molded casing, cream edge piping, screws, antenna, identity display, and the terminal maker plate persist across states. Private tasks sit in one dark inset screen well.

At phone width, voting uses a fixed two-column by four-row answer pad. All eight possible choices, confidence, and the circular Lock vote control fit together at 375×812 without horizontal or page scrolling. Every answer tile and action preserves a 44 px minimum hit area; radio inputs stay native and cover their visible labels.

### Named Rules

**One Machine, Many States.** Never frame phases as separate pages or equal dashboard cards. The chassis stays; its active instrument changes.

**The Phone Is a Controller.** Keep the full decision architecture visible or unmistakably reachable. Prefer key banks, dials, and action controls over long form stacks.

## Elevation & Depth

Steel screws, reels, film paths, bezels, and knobs make depth structural. Hard evidence offsets, inset screen wells, and the layered machine-chassis shadow explain how each part is assembled. Hardware details are machine parts, not generic decoration.

### Shadow Vocabulary

- **Machine Chassis:** Ambient weight plus a bright molded top edge and a dark orange underside.
- **Evidence Offset:** A hard pressed-orange underlayer beneath evidence strips and status plates.
- **CRT Inset:** Steel bezel construction and deep inner glass falloff.

### Named Rules

**Hardware Must Do a Job.** Reels route evidence, lamps show status, knobs terminate the control deck, and paddles carry choices. Do not add generic chrome without a machine role.

## Shapes

The physical vocabulary combines large rounded enclosures with precise machine parts. CRT glass and the field terminal use generous rounded shells; reels, bulbs, seals, knobs, and screws are circular; answer evidence and status plates remain rectangular; primary controller actions use an arcade-scale pill.

## Components

### Arcade Actions

The signal-yellow primary action is the dominant controller commitment. General actions use chunky rectangular hardware; voting ends with a circular red Lock vote button. Both preserve hard mechanical depth, visible focus-lime outlines, and exact 96% press compression. Secondary actions reverse to the night-and-cream palette.

### Answer Keys

Four color-mapped native-radio keys form a fixed two-column arcade pad. Letter tokens, labels, and selection pips map directly to the shared display, so status never depends on color alone. The full eight-choice pad remains visible on phone widths without internal scrolling.

### CRT Screen

All shared state lives inside one rounded dark screen with scanlines, subtle optical reflection, instrument glow, and a steel inset bezel. The host remains passive.

### Field Terminal

Orange molded casing, cream edge piping, screws, antenna, identity display, inset screen well, and maker plate persist across every private controller state.

### Film Drive

The reel-to-reel evidence mechanism remains visible in the host instrument rail across phases.

### Motion

Motion behaves like machinery and is enabled only under `prefers-reduced-motion: no-preference`.

- Film reels rotate continuously at a slow mechanical cadence.
- The scanner line traverses the prompt field while responses are being filed.
- Results arrive in three beats: truth burst and flap settle, evidence strips feed after 1.05 s, then score drums engage after 2.25 s.
- Signal lamps pulse in steps. Buttons compress to exactly 96% on press.

Reduced-motion users receive the same complete state with no dependency on animation.

## Do's and Don'ts

### Accessibility and Stress Rules

- Native interactive elements, explicit labels, visible focus rings, and literal error recovery remain mandatory.
- Status never depends on color alone; text, state, and shape reinforce every important signal.
- All optional motion is suppressed for reduced-motion users.
- Public copy favors across-room scale. Dense attribution remains secondary but must not clip.
- Controller layout has no horizontal page or answer-pad overflow at 320 px; all possible voting choices remain visible in the fixed key matrix.
- Forced-colors mode restores structural borders around controls, signals, and the CRT.

### Do:

- **Do** make the host read as a game-show prop from one glance.
- **Do** keep the film drive and chassis visible across every phase.
- **Do** stage reveals in legible beats.
- **Do** retain the saturated palette and hard physical offsets.

### Don't:

- **Don't** return to navy dashboard panels, paper document cards, or website hero patterns.
- **Don't** hide controller confidence or the lock action below an unbounded answer list.
- **Don't** use animation as the only representation of state.
- **Don't** add host interactions or move authority outside the controller.
