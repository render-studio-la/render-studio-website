# Project memory

## Product intent & audience

- Website featuring a cinematic intro-to-hero video sequence as the landing experience.
- Additional sections are planned below the hero (content not yet defined).

## Brand personality & voice

- Not yet inferred from available context.

## Visual design & UX direction

- Hero/intro video fills the initial viewport at `100vh`; intro animation and video playback timing are established and must remain unchanged.
- Animated topographic/contour background layer exists as a continuous, fixed background behind content.
- Existing colors, typography, and overall design are finalized and treated as immutable unless explicitly requested.

## Decisions, constraints & rationale

- **Scroll fix:** Root/document had `overflow: hidden` and hero wrapper was fixed to viewport, blocking vertical scroll. Removed those scroll locks and converted hero to a normal in-flow `100vh` section so document height grows and page scrolls.
- **Background layer:** Contour/topographic background moved outside the hero viewport wrapper and kept `fixed` so it remains continuous as future sections are added below.
- **Do-not-touch constraints:** Intro animation, video playback, timing, colors, typography, and existing design must not be modified. No new sections to be created during scroll fixes.
- A reported contour-layer import error was stale (from a different running path); the layer exists and imports correctly in the active path.
- Production build passes successfully after changes.

## Open questions & assumptions

- Content and layout of future sections below the hero are unknown; page structure must remain extensible.
- No explicit `.bolt/prompt` authored yet; constraints above are inferred from this turn only.