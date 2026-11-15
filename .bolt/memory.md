# Project memory

## Product intent & audience

- Website featuring a cinematic intro-to-hero video sequence as the landing experience.
- An **About** section exists below the hero; additional sections may follow.

## Brand personality & voice

- Bold, confident visual presence (extra-bold typography in About section).

## Visual design & UX direction

- Hero/intro video fills the initial viewport at `100vh`; intro animation and video playback timing are established and must remain unchanged.
- Animated topographic/contour background layer exists as a continuous, fixed background behind content.
- **Typography:** Manrope font family. About section text set to weight **800** (extra bold).
- Existing colors, spacing, highlights, and layout are treated as immutable unless explicitly requested.

## Decisions, constraints & rationale

- **Scroll fix:** Removed root `overflow: hidden` and hero fixed-viewport wrapper; converted hero to a normal in-flow `100vh` section so the document scrolls.
- **Background layer:** Contour/topographic background moved outside the hero wrapper and kept `fixed` for continuity across sections.
- **Boldness increase:** About section text bumped to Manrope 800 (extra bold) at user request; size, color, spacing, highlights, and layout preserved.
- **Do-not-touch constraints:** Intro animation, video playback, and timing must not be modified.
- A previously reported contour-layer import error was stale; the layer imports correctly in the active path.
- Production build passes successfully after changes.

## Open questions & assumptions

- Content and layout of any future sections beyond About are unknown; page structure must remain extensible.
- No explicit `.bolt/prompt` authored yet; constraints are inferred from session history.