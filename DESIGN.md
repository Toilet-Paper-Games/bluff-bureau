---
name: Bluff Bureau
description: A mechanical truth-routing system for believable lies and ridiculous facts.
colors:
  midnight-void: "oklch(0.105 0.025 252)"
  cobalt-enamel: "oklch(0.19 0.047 251)"
  raised-enamel: "oklch(0.235 0.051 249)"
  dormant-flap: "oklch(0.14 0.025 252)"
  flap-edge: "oklch(0.275 0.025 252)"
  docket-paper: "oklch(0.9 0.045 82)"
  docket-shadow: "oklch(0.79 0.055 77)"
  flap-ivory: "oklch(0.95 0.026 86)"
  muted-slate: "oklch(0.76 0.035 246)"
  signal-orange: "oklch(0.75 0.19 52)"
  pressed-orange: "oklch(0.58 0.19 43)"
  truth-mint: "oklch(0.82 0.105 157)"
  bureau-magenta: "oklch(0.62 0.22 356)"
  alert-red: "oklch(0.68 0.2 25)"
  docket-ink: "oklch(0.16 0.032 250)"
typography:
  display:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.7rem, 7vw, 7rem)"
    fontWeight: 790
    lineHeight: 0.94
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.3rem, 11vw, 4rem)"
    fontWeight: 780
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.35rem, 6vw, 2rem)"
    fontWeight: 720
    lineHeight: 1.18
    letterSpacing: "normal"
  body:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, sans-serif"
    fontSize: "0.83rem"
    fontWeight: 720
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "0.5rem"
  md: "0.875rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.docket-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.8rem 1rem"
    height: "3.25rem"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.docket-ink}"
    textColor: "{colors.docket-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.8rem 1rem"
    height: "3.25rem"
  input-text:
    backgroundColor: "oklch(0.97 0.018 85)"
    textColor: "{colors.docket-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.85rem"
  controller-card:
    backgroundColor: "{colors.docket-paper}"
    textColor: "{colors.docket-ink}"
    rounded: "0"
    padding: "clamp(1rem, 5vw, 1.75rem)"
    width: "min(100%, 34rem)"
  split-flap:
    backgroundColor: "{colors.dormant-flap}"
    textColor: "{colors.flap-ivory}"
    typography: "{typography.display}"
    rounded: "0"
    padding: "0 0.08em"
---

# Design System: Bluff Bureau

## Overview

**Creative North Star: "The Truth Routing Board"**

Bluff Bureau feels like a late-twentieth-century records office whose fixed mechanical information board has been repurposed for improbable facts. Midnight-cobalt enamel, split-flap typography, signal lamps, and stamped paper slips make each phase feel processed by one coherent apparatus rather than arranged as a dashboard of interchangeable cards.

The shared display is monumental, public, and passive; a single prompt, tally, or reveal owns the room at a time. Player controllers translate the same world into tactile paper dockets with one dominant private task. Motion is sparse and mechanical: lamps pulse in steps and truth cells settle into place, while reduced-motion users receive the same hierarchy without animation.

**Key Characteristics:**

- Fixed information-board topology with one decisive state.
- Dark enamel public surfaces paired with warm paper controllers.
- Condensed, uppercase display typography with readable humanist body copy.
- Orange communicates action, mint certifies truth, and magenta marks Bureau identity.
- Mechanical depth from hard offsets, inset seams, and restrained ambient lift.

## Colors

The palette combines nocturnal institutional enamel with warm paper, bright operational signals, and one unmistakable truth color.

### Primary

- **Signal Orange:** The dominant action and live-status color for controller commitments, timers, vote keys, score emphasis, and active file lamps.
- **Pressed Orange:** The physical underside of orange controls and a darker reconnect or pressed-state signal.

### Secondary

- **Truth Mint:** Reserved for verified truth, successful confirmation, score value, focus visibility, and the winning result.
- **Bureau Magenta:** A sparse identity seal used for the B mark, player seals, and rank accents.

### Tertiary

- **Alert Red:** Communicates recoverable validation errors without taking over the screen.

### Neutral

- **Midnight Void:** The deepest page ground, board rails, and mechanical seams.
- **Cobalt Enamel:** The shared-display chassis and controller surround.
- **Raised Enamel:** Public content panels lifted from the chassis.
- **Dormant Flap:** Individual split-flap cells, answer rows, and dark display modules.
- **Flap Edge:** Inset seams and unlit mechanical indicators.
- **Docket Paper:** Controller sheets, labels, and light badges.
- **Docket Shadow:** Hard offset under paper tabs.
- **Flap Ivory:** High-contrast split-flap lettering and public primary text.
- **Muted Slate:** Secondary public text, dividers, and subdued role labels.
- **Docket Ink:** Controller text and the reversed surface used for selected options.

### Named Rules

**The Signal Has Meaning Rule.** Orange means act or attend, mint means verified or successful, and magenta means Bureau identity; do not use these accents as interchangeable decoration.

**The One Enamel Chassis Rule.** Public screens stay within the midnight-cobalt family so the changing state reads as one machine, not a new page.

## Typography

**Display Font:** Archivo Narrow Variable (with ui-sans-serif fallback)

**Body Font:** Source Sans 3 Variable (with ui-sans-serif and system-ui fallbacks)

**Label Font:** Archivo Narrow Variable (with ui-sans-serif fallback)

**Character:** Archivo Narrow gives prompts, counters, and labels the compressed certainty of mechanical records. Source Sans 3 keeps explanations and controller instructions calm, legible, and conversational.

### Hierarchy

- **Display:** Monumental shared-display prompts and game titles; uppercase split-flap treatment may divide every character into its own cell.
- **Headline:** Controller phase titles and decisive end-state names; compact line-height keeps the task above the fold.
- **Title:** Private prompts, truth slips, and mid-scale information that must read quickly on a phone.
- **Body:** Instructions, explanations, helper copy, and form content; keep descriptive text near 38–55 characters per line where the layout permits.
- **Label:** Uppercase file names, rail labels, stamps, and status tags with deliberate tracking.

### Named Rules

**The Machine Speaks Narrow Rule.** Use Archivo Narrow for anything the Bureau declares; use Source Sans 3 for anything that explains what a person should do.

## Layout

The shared display uses a fixed three-row frame: a top identity rail, one dominant middle state, and a bottom signal strip. Its central state uses asymmetric two- or three-column layouts so prompts and truth reveals remain dominant while progress, rosters, and standings stay visibly subordinate. Public padding scales fluidly from 1rem to 2.5rem, with a compact-height mode below 48rem.

At 64rem, dense result and instruction layouts shed secondary columns; at 46rem, public layouts become a single flowing column and the frame may scroll. Controllers use one centered paper docket up to 34rem wide, or 42rem for the voting surface, with safe-area-aware outer spacing. At 23.5rem, controller padding and gaps tighten and confidence choices stack without reducing tap size.

Spacing follows a quarter-rem base with deliberate steps at 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, and 2rem. Use close gaps for machine parts and result rows; use the larger rhythm between controller tasks.

## Elevation & Depth

Depth is structural rather than atmospheric. Public panels use a restrained dark ambient shadow plus an inset enamel seam; paper controls use hard offset shadows that read as stacked physical slips. Selected answers reverse tonally and gain an inset orange boundary instead of floating upward.

### Shadow Vocabulary

- **Raised Enamel** (`0 0.75rem 1.75rem oklch(0.05 0.015 252 / 0.38), 0 0.125rem 0.25rem oklch(0.03 0.01 252 / 0.55)`): Ambient lift for large public panels and controller dockets.
- **Paper Offset** (`0.25rem 0.3rem 0 var(--paper-dark)`): A crisp physical underlayer beneath paper tabs and stamps.
- **Controller Offset** (`0.65rem 0.75rem 0 var(--orange-dark)`): A strong orange edge that separates the private paper controller from its enamel surround.
- **Flap Seam** (`inset 0 0 0 0.05em oklch(0.39 0.025 250 / 0.48)`): Internal construction line for individual split-flap cells.

### Named Rules

**The Mechanical Depth Rule.** Elevation must describe a part, seam, layer, or press state; never add a soft decorative glow merely to make a surface feel premium.

## Shapes

The form language is rectilinear and engineered. Shared-display rails, boards, flap cells, answer rows, stamps, score rows, and paper cards keep square corners. Small rounded corners are reserved for touch controls and text fields, where they improve affordance without softening the information-board identity. Squares and short rectangles repeat as status lamps, player seals, numbered steps, rank plates, and answer keys.

## Components

### Buttons

Buttons feel physical, direct, and unambiguous.

- **Shape:** Gently rounded touch surface using the small radius and a minimum 3.25rem height.
- **Primary:** Signal orange with docket ink, full width for the main controller commitment, and a hard pressed-orange lower edge.
- **Hover / Focus:** Maintain the physical edge on hover; use the mint outline for keyboard focus; compress to 96% scale on activation.
- **Secondary:** Docket ink with paper text and a deeper dark lower edge.
- **Text:** Transparent, underlined, and visually subordinate for settings or other low-emphasis actions.

### Chips

Status badges and tabs feel stamped or clipped into the record.

- **Style:** Paper tabs use docket paper, docket ink, uppercase condensed text, and a hard paper offset; role badges reverse to docket ink on controller paper.
- **State:** Mint stamps are reserved for confirmed truth; spectator and director labels remain literal and text-backed rather than color-only.

### Cards / Containers

Containers feel like machine panels or paper sheets, never generic rounded cards.

- **Corner Style:** Square for panels and paper controller dockets.
- **Background:** Raised enamel for public modules; docket paper for private controller surfaces.
- **Shadow Strategy:** Use structural shadow vocabulary from Elevation & Depth.
- **Border:** Inset flap-edge seams define public panel construction.
- **Internal Padding:** Fluid public padding and a 1rem-to-1.75rem controller range.

### Inputs / Fields

Inputs resemble fields printed onto a docket.

- **Style:** Warm near-white paper, a two-pixel docket-ink stroke, the small radius, and a full 1rem text size that avoids mobile zoom.
- **Focus:** A three-pixel truth-mint outline with a three-pixel offset.
- **Error / Disabled:** Error copy is explicit alert red; disabled commitments remain visible, lose their hard shadow, and communicate pending work in their label.

### Split-Flap Board

Every declared character sits in a dark rectangular cell with an ivory face, an inset construction seam, and a horizontal hinge through its midpoint. Cell groups wrap at natural spaces and scale fluidly to preserve one dominant statement. Only a truth reveal settles the cells with a brief perspective rotation, and that motion is omitted when reduced motion is requested.

### Answer Options

Controller options are full-width docket rows with a square letter plate. Selection reverses the row to docket ink, inverts the letter plate to signal orange, and adds an inset orange boundary; voting state is always visible without relying on color alone because the checked control remains semantically connected to its label.

## Do's and Don'ts

### Do:

- **Do** give each surface one dominant prompt, task, tally, or reveal.
- **Do** preserve the fixed public rail/content/signal-strip topology across every game phase.
- **Do** use paper material for private controller work and enamel material for public room state.
- **Do** keep controller touch targets at least 44 CSS pixels and preserve the mint keyboard-focus treatment.
- **Do** keep state language literal alongside lamps, colors, stamps, and animation.

### Don't:

- **Don't** turn the public display into a dashboard of equal cards or add host controls to the passive surface.
- **Don't** scatter orange, mint, or magenta as decoration; each accent has a durable semantic job.
- **Don't** round public panels, split-flap cells, stamps, score rows, or answer rows into soft app cards.
- **Don't** use body copy in the condensed display face or long explanations in all caps.
- **Don't** add gradients, glass effects, ornamental glow, or continuous motion that weakens the mechanical apparatus.
