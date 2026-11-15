# Project memory

## Product intent & audience

- Website featuring a cinematic intro-to-hero video sequence as the landing experience.
- Additional sections are planned below the hero (content not yet defined).
- Project/visual identity referred to as "Render Studio."

## Brand personality & voice

- Not yet inferred from available context.

## Visual design & UX direction

- Hero/intro video fills the initial viewport at `100vh`; intro animation and video playback timing are established and must remain unchanged.
- Animated topographic/contour background layer exists as a continuous, fixed background behind content (WebGL-based, not a video/image asset).
- Existing colors, typography, and overall design are finalized and treated as immutable unless explicitly requested.
- Contour background styling is fixed: background color, line color, opacity, line thickness/sharpness, line density (~25% above the original working version), animation speed, and cursor interaction must be preserved.
- No blur, glow, or feathering on contour lines.
- Contour reference: organic, irregular, rounded bubble-like shapes with multiple nested contour lines, distributed across the full screen, moving independently with subtle expand/contract/deform behavior (not global drift).
- Avoid ribbon-like, parallel-wave, narrow-spike, or tangled patterns.

## Decisions, constraints & rationale

- **Scroll fix:** Root/document had `overflow: hidden` and hero wrapper was fixed to viewport, blocking vertical scroll. Removed those scroll locks and converted hero to a normal in-flow `100vh` section so document height grows and page scrolls.
- **Background layer:** Contour/topographic background moved outside the hero viewport wrapper and kept `fixed` so it remains continuous as future sections are added below.
- **Do-not-touch constraints:** Intro animation, video playback, timing, colors, typography, existing layout, hero video, and all existing sections must not be modified.
- **Contour deterioration fix:** After extended runtime, contour lines were stretching/bunching into dense horizontal bands. Root cause was unbounded time-based displacement inside noise coordinates (not feedback textures — the WebGL path has no render targets or frame accumulation). Fix: replaced unbounded drift with bounded, time-varying distortion and simplified the noise field to two smooth low-frequency layers favoring large rounded nested contour basins.
- A reported contour-layer import error was stale (from a different running path); the layer exists and imports correctly in the active path.
- Production build passes successfully after changes; interactive 60-second visual verification not confirmed in-session.

## Open questions & assumptions

- Content and layout of future sections below the hero are unknown; page structure must remain extensible.
- No explicit `.bolt/prompt` authored yet; constraints above are inferred from conversation only.
- Long-term visual stability (60s+) of the revised contour animation assumed from bounded-motion design, not visually verified in-session.