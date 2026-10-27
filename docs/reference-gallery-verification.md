# Reference gallery verification — 2026-10-27

The corrected gallery has passed the full **32-test suite**, received a fresh final finish-review disposition of **ship**, and completed sequential design-documentation reconciliation. The enlarged ensemble is balanced around complete centered active and focused work. Current evidence: [centering report](reference-gallery-centering.md), [final review](reference-gallery-centering-review.md) and [corrected production captures](../.impeccable/review/reference-deck-centering/after/). This packet records verification before the user's requested commit on main; it does not mark Git integration or deployment complete.

## Reference and scope

- **VIDEO-01:** `D:/projects/vincent-guanco/docs/sample/Video Project 27.mp4`, the user-selected primary target. 1080×1080, 30fps, 215 frames, 7.166667s. All frames were extracted and reviewed in nine contact sheets; transition boundaries were inspected at full size. Analysis: `D:/projects/vincent-guanco/docs/reference-video-analysis.md`. Frame index, PNGs and sheets: `D:/projects/vincent-guanco/docs/sample/analysis-2026-10-27/`.
- **INCUMBENT-01:** starting working tree on `redesign/spatial-archive`, forked from `main` at `b71cfd6884ffaa8f4ee976b1ba0b4917c7642244`. Recoverable baseline: `D:/projects/vincent-guanco-baseline-20261027-astra`.
- Latest user corrections: subtle continuous up/down and back/forth floating; prioritize phone portrait and portrait iPad; enlarge the deck meaningfully and permit peripheral cards to bleed past screen edges; retain normal document scrolling; balance the entire visible ensemble around complete centered active/inspected media. The shared deck moves; the camera does not bob. The direction contract is `D:/projects/vincent-guanco/docs/spatial-archive-direction.md`.

## Implementation

- `src/lib/spatial-gallery.ts`: dense rounded parallel image planes, shared yaw/drift, scroll gather/turn and isolated focus; bounded previews, active VideoTexture and lifecycle cleanup. The final base framing is 20% closer, producing roughly 25–30% larger projection. Rotation pivots around the front plane, with conservative active-media fitting through idle yaw, pitch and float extrema. `compositionOffset` and `centerComposition` balance projected peripheral bounds around the floating front anchor with continuous relative-distance weights. The settled active plane receives no correction; normal placement resets each render and the correction fades during focus. Camera distance and media size are unchanged by centering. Peripheral clipping is intentional; focus framing remains complete.
- `src/components/portfolio/archive.tsx`: MotionValue scroll bridge, native document navigation, Stack/Flat, View work/Back to stack, keyboard and independent motion/film pause.
- `src/components/portfolio/spatial-stage.tsx`: lazy renderer, direct imperative manual-play bridge and in-place live reduced-motion updates.
- `src/app/globals.css`: quiet neutral black presentation, responsive portrait layout, 44px controls, dynamic viewport and safe-area handling.
- `src/components/sections/about.tsx`: removed the unrelated decorative arrow; original facts and portrait behavior retained.
- `tests/media-loading.spec.ts`: updated view labels/resource bound and added focus/motion, gesture-stack and portrait touch coverage.
- `tests/spatial-framing.spec.ts`: five projection tests covering all 29 catalog aspect ratios at 390, 820, 768, 320 and 1440px widths, through idle extrema and focus. Every active corner remains inside 90% of the normalized viewport bounds.
- `tests/spatial-centering.spec.ts`: six rendered-silhouette cases cover those sizes plus the measured 440×956 Chrome-panel surrogate, positive yaw, fractional scroll progress, reduced motion, several selected works and complete focused centering.
- `PRODUCT.md`, `docs/portfolio-media.md`, direction and reference analysis describe the accepted video and later corrections. `DESIGN.md` and `.impeccable/design.json` now record the corrected implementation with both centering-helper snippets and current source mappings, alongside the unchanged palette, type, radii, component controls, motion, focus and responsive behavior.

## Checks

| Check | Result |
| --- | --- |
| Full ESLint | Passed |
| TypeScript `--noEmit` | Passed |
| Full Playwright suite | **32 passed**, 1.6 minutes |
| Next.js 16.2.2 production build | Passed; `/`, `/_not-found`, `/api/media` generated successfully |
| `git diff --check` | Passed; only existing Windows LF/CRLF notices |
| Impeccable detector | Run exactly once; 50 advisories, no non-advisory findings |
| Catalog/provenance hashes | Match baseline |
| All delivered media | 58/58 sizes and SHA-256 hashes match provenance |

The detector's 42 type-ramp and eight radius advisories compare against the superseded DESIGN.md. The reference intentionally requires rounded images and quieter typography. Result file: `D:/projects/vincent-guanco/.impeccable/review/reference-deck-detector.json`. The sequential documenter recorded the actual implementation tokens; the detector was not rerun and its historical advisories are not a new assessment of the refreshed documents.

The suite verifies all 29 works and stable per-load shuffle; at most one selected film source; actual changing video pixels on the canvas; custom pause and recovery; source disposal; blocked autoplay; WebGL/preview fallback; complete portrait/contact streaming; 320px overflow; and shared keyboard, button, scroll and drag selection.

The manual-play regression rejects spatial `play()` calls outside active click/keydown listener stacks. **Play, Space and Retry pass** through Archive's event handler → imperative ref → controller → video element. This is a browser-policy simulation in Chrome, not a physical iOS/Instagram result.

The motion regression confirms changing idle photograph pixels, stable paused/focused photograph pixels, and stable pixels after changing reduced motion live. The live-preference change originally recreated WebGL and incorrectly fell back; the fix updates the existing controller and the regression now passes.

## Primary portrait and interactive QA

Headless Chrome contexts at **390×844**, **820×1180** and **768×1024** use `isMobile: true`, `hasTouch: true`, DPR2. All three pass actual touch-event horizontal dragging, native vertical scrolling past the final work, About/Contact navigation, focus controls and offscreen film pause. Measured gallery/navigation hit targets are at least 44×44px. Canvas DPR is capped at 1.5. Document widths match the viewport at 390, 820, 768, 1440 and 320px.

Phone/tablet preview capacity is nine textures through 1024px; wide desktop capacity is thirteen. Only one selected film decoder is active. Browser/device emulation does not establish physical iPad Safari or Instagram-browser performance.

Shared Chrome was explicitly authorized by the user. Interactive work stayed in browser **3**, tab **1347455437**, session **🎞️ Vincent deck QA**, local portfolio URLs only. Exercised keyboard arrows/Home, Space pause/resume, Enter focus/Escape return, horizontal dragging, Flat archive and immediate Contact exit. The final live page uses `http://localhost:3101/`.

**Material preview limitation:** that interactive Chrome profile reports `prefers-reduced-motion: reduce = true`. It therefore correctly displays a still deck and hides the Motion toggle. Its browser/system preference was not modified. Normal-motion evidence uses explicit no-preference headless contexts and the recording below.

## Final production evidence

The latest centering correction has **24 current PNGs**, all inspected by the builder and final reviewer, in [the corrected capture directory](../.impeccable/review/reference-deck-centering/after/). Six viewport sizes each have landscape reduced-motion, landscape idle-yaw, portrait reduced-motion and focused portrait states. The current recording is `after/mobile-motion.webm`, 9.76 seconds and 1,118,690 bytes. [Centering evidence](reference-gallery-centering.md) records before/after measurements and six new rendered-silhouette regressions; the [fresh final review](reference-gallery-centering-review.md) returned **ship**, with no material fixes.

At 390px, the normal-yaw visible-area centroid improved from **40.77% to 49.68%** of canvas width while coverage increased from 51.96% to 56.29%; the gallery was not shrunk. The added 440×956 dedicated Chrome viewport is a responsive surrogate. The user's exact in-app viewport was unavailable, so these results do not establish exact in-app-browser framing. The dedicated Chrome profile retained reduced motion. The final review inspected all 24 corrected states and four retained Flat/Contact states, but did not play the source MP4 or corrected motion WebM; temporal fidelity and physical-device performance remain outside that static review.

The earlier two batched visual rounds and explicit scale-correction pass remain historical evidence. All 18 earlier PNGs were viewed; Flat and Contact remain applicable because centering changed only the Three.js composition. Earlier root:

`D:/projects/vincent-guanco/.impeccable/review/reference-deck-final-large/`

| Target | Expanded | Focused | Additional |
| --- | --- | --- | --- |
| Phone 390×844 | `mobile.png` | `mobile-focused.png` | `mobile-portrait-work.png`, `mobile-portrait-work-focused.png`, `mobile-flat.png`, `mobile-contact.png` |
| Portrait iPad 820×1180 | `ipad-portrait.png` | `ipad-portrait-focused.png` | `ipad-portrait-work.png`, `ipad-portrait-work-focused.png` |
| Portrait iPad 768×1024 | `ipad-portrait-768.png` | `ipad-portrait-768-focused.png` | — |
| Desktop 1440×900 | `desktop.png` | `desktop-focused.png` | `desktop-flat.png`, `desktop-contact.png` |
| Narrow phone 320×740 | `mobile-320.png` | `mobile-320-focused.png` | — |

`layout-metrics.json` records widths, canvas dimensions/DPR and each visible control's dimensions. `mobile-motion.webm` is a 16.76s, 390×844, 25fps VP9 recording (1,856,726 bytes), including ten seconds of normal-motion idle deck, focus, portrait selection/focus and the Flat/contact transition. This records the implemented application; it is not a rendered concept.

Contact captures target the Contact anchor, so the top of the About heading/portrait can be above the viewport. The remote portrait is loaded in both final Contact captures; biography and contact content remain present. No full-page screenshot of the long sticky scroll spacer is used as appearance evidence.

Capture script: `D:/projects/vincent-guanco-baseline-20261027-astra/capture-reference-deck.cjs`. Earlier evidence remains at `.impeccable/review/reference-deck-round1/` and `.impeccable/review/reference-deck-final/`, superseded by the larger final production set.

## Preserved evidence

- Catalog SHA-256: `DE093D122DD756911043DF6517B5047BF83CCB470CEF5105AE79DE4D6DF43051`.
- Provenance SHA-256: `A1B7196726E4829BFBFDBCE3DC29A96148E4E6FED64312820546722CEBBDF965`.
- Reference MP4 SHA-256: `C85F816093AA18A248B0BBB446F7E8E028441303F4CE3F4841247D48436CE22A`.
- Delivery files: **58**, **68,404,950 bytes**, no hash or size mismatches.
- Vincent Guanco; Photographer | Videographer; Paris; 28M+ Total Views, 33K+ Followers, 1M+ Likes; existing email/WhatsApp/Instagram unchanged.

## Review and documentation status

- [x] Fresh finish review of the earlier enlarged-deck snapshot: [reference-gallery-finish-review.md](reference-gallery-finish-review.md), disposition **ship**. The reviewer opened four reference frames and all 18 production captures. This was a static capture/source review; the MP4 and normal-motion WebM were not played, and behavioral results were attributed to this packet.
- [x] Sequential documentation snapshot: [DESIGN.md](../DESIGN.md) and [.impeccable/design.json](../.impeccable/design.json) refreshed from CSS, local font setup, gallery/navigation/film/biography source and eight representative capture PNGs. Tokens, eight self-contained component snippets, motion, focus, breakpoints and source mappings replace the old orange/sharp system. The nominal 30fps cadence permits immediate dirty/event updates.
- [x] Correct and verify the reported left-shifted gallery: projected ensemble balance, 32 passing tests and 24 inspected current captures. See [centering evidence](reference-gallery-centering.md).
- [x] Fresh finish review of the corrected framing: [reference-gallery-centering-review.md](reference-gallery-centering-review.md), disposition **ship**, no material fixes. Four source frames, all 24 corrected captures and four unchanged Flat/Contact captures were inspected; behavior is attributed to the completed verification packet.
- [x] Final documentation reconciliation: `DESIGN.md` and `.impeccable/design.json` describe the balanced enlarged ensemble and current centering helpers; source locations and snippets are reconciled. Palette, type, radii and media scale are unchanged. Review and documentation gates are complete before integration.

The 32 passing browser tests, ESLint, TypeScript and production build above are the builder's completed checks for the centering correction; the documenter did not rerun them. The shared interactive Chrome profile's reduced-motion setting remains unchanged, and physical iOS, iPad Safari and Instagram-browser performance remain unverified. Application code, tests, assets, media and runtime behavior were not edited by the documenter.

The user selected committing all work on main. The checkout is now on main with the working files preserved; the coordinating agent owns the upcoming commit. The user will perform the Vercel deployment. This documentation pass does not perform or claim completion of Git integration or deployment.

Local processes left available for review: dev port 3100 (exec session 57646), production port 3101 (exec session 28483). No new worktree was created; this is the existing primary checkout.
