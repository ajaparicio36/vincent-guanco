# Gallery centering correction — 2026-10-27

The user's reported leftward bias was reproduced in production pixels. The selected front plane was centered, but positive shared yaw displaced the surrounding planes left around that pivot. Reduced motion showed a smaller imbalance from the neighboring works' different dimensions.

## Correction

`src/lib/spatial-gallery.ts` now projects plane corners and balances horizontal outer bounds around the floating front anchor. Peripheral planes receive the correction in camera-horizontal space; the settled active plane receives none. Continuous relative-distance weights avoid a jump when the selected index changes. The correction fades during focus.

Camera distance, media dimensions, scale, shared orientation, depth, vertical/depth float, preview capacity and film lifecycle are unchanged. The enlarged deck and permitted peripheral clipping remain. Focus presents a complete centered work.

## Production comparison

Before and after use the same seeded order and approximately 4.8 seconds of normal idle before pausing. Values are percentages of canvas width; 50% is center. The visible-pixel mask excludes the near-black background with a channel-difference threshold of eight. Its centroid is supporting evidence because image brightness also affects the mask.

| Viewport | Bounds center before → after | Visible-area centroid before → after |
| --- | --- | --- |
| Phone 390×844 | 43.85 → 50.64% | 40.77 → 49.68% |
| Portrait iPad 820×1180 | 44.02 → 50.49% | 40.74 → 49.53% |
| Portrait iPad 768×1024 | 42.71 → 51.82% | 39.89 → 50.55% |
| Narrow phone 320×740 | 43.91 → 50.62% | 40.73 → 49.66% |
| Desktop 1440×900 | 44.48 → 50.80% | 43.84 → 50.10% |
| Dedicated Chrome panel 440×956 | 43.86 → 50.68% | 40.77 → 49.74% |

The small normal-motion deviation retains the lateral float. At reduced motion, landscape bounds center is 49.84–49.97% across all six sizes; the half-pixel measurement convention accounts for that remainder. The 390px visible-area centroid improves from 48.10% to 49.26% at reduced motion. Focused portrait bounds center is also 49.84–49.97%. At 390px, normal-motion visible coverage increases from 51.96% to 56.29%; no camera retreat or size reduction conceals the correction.

## Verification

- **Full Playwright: 32 passed, 1.6 minutes.** Full ESLint, TypeScript `--noEmit`, production build and `git diff --check` passed.
- Six new `tests/spatial-centering.spec.ts` cases inspect actual rendered silhouettes with neutral test textures, isolating geometry from image brightness. Coverage includes all six viewports, positive idle yaw, native-scroll fractional selections 1.25/13.5/27.75, reduced motion, selections 2/8/15/29, focused centering and complete focus width.
- Existing framing cases still verify all 29 catalog ratios through idle extrema and focus. Playback, gesture, touch, native-scroll exit, resource, streaming and fallback regressions remain green.
- All **24 current production PNGs** were viewed. No media file, catalog, provenance or reference asset changed in this correction.

## Current evidence

Root: `D:/projects/vincent-guanco/.impeccable/review/reference-deck-centering/`.

- `before/` contains the reproduction captures and metrics.
- `after/` contains current captures and metrics. Each of `mobile`, `ipad-820`, `ipad-768`, `narrow`, `desktop` and `chrome-panel` has four PNGs: `-landscape-reduced`, `-landscape-yaw`, `-portrait-reduced` and `-focused`.
- `after/mobile-motion.webm`: 390×844, 9.76 seconds, 1,118,690 bytes; normal idle float, portrait selection/focus and further selections.
- Capture script: `D:/projects/vincent-guanco-baseline-20261027-astra/capture-centering.cjs`.
- Unchanged Flat/Contact evidence remains in `reference-deck-final-large/`.

Only Chrome was exposed by the computer-use inventory. The user's in-app preview could not be safely identified or measured and was not controlled. Replacement dedicated Chrome: browser 3, tab 1347455497, session “🎞️ Vincent deck QA”. Its measured 440×956 viewport was added to tests and captures. That profile retains reduced motion. The refreshed deck and a changed film selection were visibly confirmed; further input acknowledgments timed out at the browser-control layer. Focus interaction is verified by headless tests and captures.

Implementation is frozen for the new fresh finish review and documentation reconciliation. Production remains at `http://localhost:3101/`, exec session 28483; development remains on port 3100, session 57646. The coordinating agent owns the user's requested main-branch commit and integration. This worker performed no commit, push, merge or deployment.
