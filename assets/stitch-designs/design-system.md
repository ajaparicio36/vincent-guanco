# Design System: Parisian Editorial Minimalism

## 1. Overview & Creative North Star
**Creative North Star: The Silent Curator**
This design system rejects the "template" aesthetic of modern portfolio builders in favor of high-end, print-inspired editorial design. It mimics the experience of a luxury fashion monograph: expansive, intentional, and quiet. 

We move beyond standard grids by embracing **Intentional Asymmetry**. This system is built on the tension between massive, full-bleed imagery and delicate, microscopic typography. It uses a "brutalist-refined" approach—sharp 0px corners and hairline-thin dividers—to create a digital space that feels like physical stationery.

## 2. Colors & Surface Logic
The palette is rooted in organic, muted tones that evoke the feel of unbleached paper and 35mm film stock.

### Palette Strategy
- **Background (`#fffcf7`):** This is your canvas. It is not pure white, but a warm, "bone" white that reduces eye strain and feels premium.
- **On-Surface / Text (`#0e0e0c`):** A near-black charcoal. Never use #000000; this softer black maintains the film-grain aesthetic.
- **Secondary / Stone (`#6f6349`):** Used for subtle accents, interactive states, or metadata. It represents the "warm stone" of Parisian architecture.

### The "No-Line" & Surface Hierarchy Rule
To maintain "Quiet Luxury," we avoid heavy structural borders.
- **Tonal Sectioning:** Divide major content areas using background shifts. A section in `surface-container-low` should sit adjacent to the main `surface` to create a boundary without a line.
- **Nesting:** Treat the UI as layers of paper. A project description (Card) should be `surface-container-lowest` placed upon a `surface-container` section. This creates "lift" through color value rather than drop shadows.
- **The Hairline Exception:** While the system avoids heavy lines, a single `px` width divider using `outline-variant` (at 20% opacity) is permitted only for separating editorial columns, mimicking a newspaper layout.

## 3. Typography
The typography is the voice of the system. It relies on the juxtaposition of high-contrast Serif headers and wide-tracked, technical Sans-Serif labels.

- **Display & Headlines (Newsreader/Serif):** 
  - Use `display-lg` for hero statements. 
  - *Styling Note:* Use "Optical Sizing" if available. Headlines should have slightly tighter letter-spacing (-2%) to feel cohesive.
- **Body & Labels (Inter/Sans-Serif):**
  - All labels (`label-md`, `label-sm`) must be **Uppercase** with a letter-spacing of `0.1em` to `0.15em`.
  - Body text (`body-md`) should remain clean and legible, acting as the "functional" counter-balance to the expressive headers.

## 4. Elevation & Depth
**Shadows are strictly forbidden.** In this system, depth is a matter of layering and transparency, not simulated light sources.

- **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
- **Glassmorphism for Overlays:** For mobile navigation or floating filters, use a semi-transparent `surface` color with a `20px` backdrop-blur. This allows the grain of the photography underneath to bleed through, maintaining a tactile, "frosted glass" feel.
- **The "Ghost Border":** For interactive elements like input fields, use `outline-variant` at 15% opacity. It should be just barely visible—a "suggestion" of a container.

## 5. Components

### Buttons
- **Primary:** Rectangle (0px radius), `on-surface` background, `surface` text. Minimalist and heavy.
- **Secondary:** Transparent background, `px` hairline border using `outline`.
- **Tertiary:** Text only, `label-md` styling with a 1px underline that expands on hover.

### Cards & Lists
- **The Editorial Card:** No borders, no shadows. Use a `surface-container-low` background. Images within cards must be top-aligned with 0px margins to the container edges.
- **Lists:** No horizontal dividers between items. Use `spacing-8` (2.75rem) to create separation. The white space *is* the divider.

### Inputs & Interaction
- **Input Fields:** A single bottom border (`outline-variant`, 20% opacity). No box. Label floats above in `label-sm` (Uppercase, Wide-track).
- **Navigation:** Asymmetric placement. The logo/brand marks should be significantly larger or smaller than standard UX patterns to create visual interest.

### Signature Components
- **The Film Grain Overlay:** A global, low-opacity (3%) noise texture should be fixed to the viewport to give digital images the "soul" of analog film.
- **The Full-Bleed Scroller:** A component that forces images to 100vw and 100vh, with typography overlaid using the "Glassmorphism" rules for legibility.

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetric margins. For example, a 2-column layout where the left column is 35% width and the right is 65%.
- **Do** use "Extreme Whitespace." If you think there is enough room between sections, double it using `spacing-24`.
- **Do** ensure all corners are `0px`. This is non-negotiable for the "Editorial" look.

### Don't:
- **Don't** use drop shadows or blurs for depth (except for the Glassmorphism backdrop-blur).
- **Don't** use centered text for long-form copy. Editorial design is traditionally left-aligned or justified.
- **Don't** use "saturated" colors. Every color must feel like it was mixed with a drop of grey or brown.
- **Don't** use icons unless absolutely necessary. Prefer text labels (`MENU`, `BACK`, `CLOSE`) in wide-tracked sans-serif.

## 7. Color Tokens (Full Palette)

| Token | Hex |
|-------|-----|
| background | #fffcf7 |
| surface | #fffcf7 |
| surface-bright | #fffcf7 |
| surface-dim | #e4e3d7 |
| surface-container-lowest | #ffffff |
| surface-container-low | #fcf9f3 |
| surface-container | #f6f4ec |
| surface-container-high | #f0eee5 |
| surface-container-highest | #eae8de |
| surface-variant | #eae8de |
| on-surface | #383831 |
| on-surface-variant | #65655c |
| on-background | #383831 |
| primary | #5f5e5e |
| on-primary | #faf7f6 |
| secondary | #6f6349 |
| on-secondary | #ffffff |
| outline | #818178 |
| outline-variant | #babab0 |
| inverse-surface | #0e0e0c |
| inverse-on-surface | #9e9d98 |
| inverse-primary | #ffffff |
