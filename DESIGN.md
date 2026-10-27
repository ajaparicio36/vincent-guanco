---
name: "Vincent Guanco"
description: "A rounded floating media deck with quiet neutral controls."
colors:
  background: "#080808"
  foreground: "#ededeb"
  secondary: "#a6a6a2"
  border: "#2c2c2b"
  surface-container: "#171717"
typography:
  display:
    fontFamily: "DIN Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(52px, 6vw, 92px)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "DIN Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(56px, 6.4vw, 96px)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "DIN Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "DIN Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  label:
    fontFamily: "DIN Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  control: "6px"
  media: "8px"
spacing:
  small: "8px"
  caption: "12px"
  medium: "16px"
  large: "24px"
  section-inset: "32px"
  section-start: "40px"
  gutter: "clamp(24px, 3.2vw, 64px)"
components:
  arrow-button:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0"
    height: "44px"
    width: "44px"
  gallery-control-hover:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.foreground}"
  inspect-button:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  playback-button:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  view-button:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "44px"
  view-button-selected:
    textColor: "{colors.foreground}"
  motion-button:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "44px"
  motion-button-paused:
    textColor: "{colors.foreground}"
  inline-film-control:
    backgroundColor: "rgb(8 8 8 / .88)"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  inline-film-control-hover:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
  navigation:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    height: "calc(76px + env(safe-area-inset-top, 0px))"
  flat-media:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.media}"
---

# Design System: Vincent Guanco

## Overview

**Creative North Star: "Floating Media Deck"**

Real photographs and films form a dense, balanced, rounded deck on a neutral black field. Overlap, shallow shared rotation and gentle assembly movement give the work depth; quiet upright DIN Pro keeps navigation and captions secondary to the media.

The accepted composition prioritizes phone portrait and portrait iPad. Peripheral cards may extend beyond the stage edges, while the selected work stays centered and fitted and the individual view reveals its complete natural aspect ratio. The same neutral surfaces, small corners and restrained controls continue through Flat view, statistics, biography and contact.

**Key Characteristics:**

- Real media supplies the color; the surrounding interface stays neutral.
- Rounded overlapping planes create depth without a floor or ornamental frame.
- Large media and compact controls lead on phone and portrait iPad.
- Native scrolling, an isolated work view and a complete Flat archive remain available.

This descriptive record reflects the accepted implementation, not a new brand proposal. Visual authority comes from [PRODUCT.md](PRODUCT.md), the [accepted direction](docs/spatial-archive-direction.md) and the [final centering review](docs/reference-gallery-centering-review.md). The frontmatter is the normative token layer; [.impeccable/design.json](.impeccable/design.json) maps it to source and carries responsive, motion, focus and component details.

The final [centering evidence](docs/reference-gallery-centering.md) and fresh review accept the enlarged, balanced ensemble with complete centered selected and focused work. This record maps the corrected implementation. The review covers static captures and sampled source; behavioral results are attributed to the verification packet, with exact in-app viewport and physical-device limits retained there.

## Colors

Off-white content and subdued gray labels sit on a continuous neutral near-black field. Interface color does not compete with the photographs and films.

### Primary

- **Off-white foreground** carries main text, active controls, the selected-view dot and visible focus. The source's primary, accent and ring aliases resolve to this same foreground; there is no separate decorative accent in the accepted UI.

### Neutral

- **Neutral black** unifies the document, sticky header and Three.js clear color.
- **Secondary gray** supports metadata, instructions and inactive controls.
- **Fine neutral border** separates statistics, biography, contact and footer content.
- **Dark container** supports loading/unavailable media and fine-pointer control hover.

**The Media Color Rule.** Keep interface selection, navigation and focus neutral so the supplied photographs and films remain the source of expressive color.

## Typography

DIN Pro is hosted locally in upright light, regular, medium, bold and black weights. The implementation binds it through the Next.js font variable, with UI sans-serif and system fallbacks. The frontmatter's display role belongs to statistics, headline to the biography name, title to the selected work, body to the biography role, and label to common controls and metadata. There is no large gallery display headline.

Light large type and tighter tracking distinguish statistics and biography; work titles and controls stay regular. Tabular figures stabilize counts and statistics. The compact identity uses medium weight (500), with a smaller secondary role line. Body kerning and ligatures are enabled; italics are normalized to upright.

Below the phone breakpoint (767px), statistics use `clamp(36px, 9vw, 64px)`, the biography name uses `clamp(64px, 16vw, 96px)`, and the biography role is (15px). Selected-work titles retain their desktop role. Navigation and view labels reduce to (11–12px), with secondary identity/footer details reaching (10px). These are observed responsive exceptions, not a new type scale.

## Layout

Phone portrait and portrait iPad lead the gallery composition. The stage spans the viewport; its toolbar and caption align to page gutters. The header stays sticky, incorporates the top safe area, and retains Work, About and Contact at every tested width. Navigation targets have a minimum size of (44px). On phones, the header's base height is (80px), gutters are (22px), and the identity role may wrap; below (360px), gutters reduce to (16px).

The sticky stage uses the available dynamic viewport height with a minimum of (480px). Its canvas flexes between a compact toolbar and the selected-work caption; bottom caption padding includes the safe-area inset. Wide captions have three columns. At (1200px) and below, the instruction text remains available to assistive technology but is visually hidden, leaving caption and actions in two columns. At (767px) and below, the caption becomes two rows with navigation arrows at the trailing edge. The mobile toolbar removes secondary summary text and decorative view icons; the Motion control keeps its accessible name when its label is hidden.

Native document scrolling advances one mixed collection through the sticky stage. The scroll distance per work is `clamp(220px, 32svh, 320px)`, fixed to (220px) on phones. The accepted camera fitting enlarges the deck while reserving the selected plane's silhouette through idle rotation and float. Projected ensemble bounds are balanced around the floating front anchor without reducing image size or moving the settled selected plane; outer cards can be clipped by the canvas. The page itself clips horizontal overflow.

Flat view uses three masonry columns, two at (767px) and below, and one at (440px) and below. Statistics remain in three columns. Biography uses two columns above the phone breakpoint and stacks below it; contact's secondary links keep their two-column arrangement. Spacing comes from the compact shared scale in frontmatter, with larger section margins documented in the source map.

**The Portrait Framing Rule.** Balance the surrounding cards around the selected front plane without shrinking the gallery. Allow peripheral cards to clip at the stage edge; keep the selected work fitted, the inspected work complete, and captions and controls within the usable viewport.

## Elevation & Depth

The interface uses tonal surfaces and fine dividers, with no decorative box shadows. Depth belongs to the gallery's parallel image planes: staggered placement, overlap, shallow yaw and perspective create a compact volume. There is no floor, horizon, shadow receiver, artificial card thickness or focus bracket.

The camera is steady during idle floating. Its fitted distance may change with viewport, active aspect ratio and transition into the individual work view; that framing adjustment is distinct from camera bob. Rotation pivots around the front selected plane. A horizontal composition correction projects the ensemble and adjusts surrounding planes around that anchor. Continuous relative-distance weights avoid selection jumps; the settled active plane receives no correction. Each render resets normal placement before applying the balance, so offsets do not accumulate. During inspection, the correction fades, surrounding cards gather and fade, the selected card faces forward, and the idle float ends.

**The Assembly Motion Rule.** Move the deck as one assembly around its selected front plane; keep the camera steady during idle motion and stop idle movement when paused, inspecting, interacting, hidden, offscreen or under reduced motion.

## Shapes

Small curved controls and slightly rounder two-dimensional media use the two frontmatter radii. Flat images, inline films and biography portraits share the media radius. Three.js corners instead scale with the shorter edge of each plane (3.5%), preserving a consistent silhouette across portrait and landscape work. The selected-view marker is a small circular dot (3px). Dividers are thin straight lines; gallery controls are borderless at rest.

Gallery and Flat work retain their full natural aspect ratio. The biography portrait is a separate established pattern: a (3:4) frame with cover fitting. Do not transfer that portrait crop to portfolio works.

## Components

### Buttons

Compose reusable gallery controls from the existing ShadCN Button. Arrow, inspection and playback variants use the frontmatter dimensions and assignments. A fine pointer reveals a dark-container hover surface; pressing an enabled archive button scales it to (0.97). Disabled arrows fade to (25%) opacity.

Visible keyboard focus uses a foreground outline (1px). Its default offset is (5px), archive buttons use (3px), and the spatial keyboard region places it inside the stage (-10px). Color/background transitions last (160ms), press transforms (120ms). Reduced motion shortens CSS animations and transitions to (.01ms).

### Navigation

The compact identity and role stay on the left, with three destinations on the right. Contact is neutral like the other links and has a small diagonal SVG arrow on larger screens; the arrow is hidden on phones. Fine-pointer navigation/contact hover changes text to secondary gray. A keyboard skip link becomes visible on focus. Biography and contact content remain usable when the optional portrait is loading or unavailable.

### View and motion controls

Stack and Flat view are actual pressed-state buttons. The active view uses foreground text plus a dot. Both share the same once-per-load mixed order. Motion pause is a separate pressed-state action, present only in Stack when reduced motion is not requested; it does not pause a film.

### Floating media deck

Native vertical scrolling, horizontal drag, Previous/Next and keyboard arrows/Home/End share selection. Vertical touch keeps native scrolling. Clicking the current card or using View work enters inspection; Enter toggles it and Escape returns to the stack. Selected-work information is announced politely outside the canvas.

The ready canvas fades in over (240ms). A shared idle yaw and restrained x/y/z float move the assembly; selection briefly gathers and turns it. The motion formulas, front-plane pivot, projected-bound centering helpers, camera fit and stop conditions are mapped in the sidecar. Reduced motion removes idle movement, yaw/gather transitions and easing; preference changes update the existing controller in place. Keyboard selection and inspection are immediate.

The renderer retains at most nine previews through (1024px) and thirteen above it, with one selected film decoder and a device-pixel-ratio cap of (1.5). Its nominal rendering cadence is (30fps), with immediate dirty/event updates; hidden or offscreen scenes suspend rendering and playback. Old textures, media sources and listeners are disposed. A failed renderer, lost WebGL context or failed preview exposes the complete Flat archive.

### Film playback

The selected spatial film and visible Flat films autoplay muted, loop and play inline. Playback remains independently pausable under reduced motion. Custom controls expose playing, loading, blocked and error states; poster frames remain the visual fallback.

Spatial Play, Space and Retry reach the media element synchronously through the imperative bridge. Flat Play calls its element directly, while Flat error retry reinitializes its source lifecycle. Do not conflate these paths or claim physical-device policy verification from the Chrome regression. Flat playback uses a translucent dark control over the media and releases its source when hidden or offscreen. Neither view uses a media dialog or native control bar.

### Flat media and supporting content

Flat cards place concise titles and media metadata below rounded, uncropped imagery. Statistics, biography and contact reuse the same neutral text, dividers and DIN Pro; they remain ordinary document content after the gallery. No new claims, credits or analytics values belong in this design record.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied work's color and natural aspect ratio in the gallery and Flat archive.
- **Do** retain centered, complete selected and inspected media while allowing peripheral deck bleed.
- **Do** keep phone and portrait iPad controls, selected-work information and contact navigation usable.
- **Do** retain separate motion and film controls, live reduced-motion support and the complete Flat fallback.

### Don't:

- **Don't** restore the superseded orange accents, sharp focus brackets, floor grid or oversized archive headline.
- **Don't** crop the selected gallery work or let peripheral bleed create horizontal document scrolling.
- **Don't** add idle camera bob or automatic selection changes that interrupt inspection.
- **Don't** put captions or decorative interface frames on the Three.js image planes.
