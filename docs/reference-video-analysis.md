# Reference video analysis

Source: `docs/sample/Video Project 27.mp4` (VIDEO-01). Inspected on 2026-10-27. The original has not been changed.

The visual target is a compact floating deck of overlapping image cards on black. It slowly rotates, contracts into a single card, holds, then expands through a rapid side-on turn. It is not an open horizontal corridor or an image wall. The new portfolio uses this deck as its primary gallery while retaining Vincent's existing 18 photographs and 11 films.

## Complete frame evidence

The clip is 1080 × 1080, 30 fps, 215 decoded frames, 7.166667 seconds. Frame numbers below are **one-based**; their presentation time is `(frame - 1) / 30`. F215 begins at 7.133333 seconds and displays until the end. F001 is black.

Every frame was extracted losslessly with FFmpeg, timestamp-indexed with FFprobe, and visually inspected in consecutive labeled sheets. No frame sampling was used. Large keyframe inspection covered F002, F049, F091, F108, F113, F130, F136 and F142.

- [Frame index, all 215 timestamps](sample/analysis-2026-10-27/frame-index.csv)
- [FFprobe timestamps](sample/analysis-2026-10-27/frame-timestamps.json)
- Full-size frames: `docs/sample/analysis-2026-10-27/frames/frame-0001.png` through `frame-0215.png`.

The full-resolution decoded frames are a reproducible local cache and are ignored by Git. The source MP4, nine contact sheets and timestamp indexes remain versionable. From the repository root, recreate all 215 PNGs without frame sampling in PowerShell with FFmpeg on PATH:

```powershell
New-Item -ItemType Directory -Force -Path 'docs/sample/analysis-2026-10-27/frames' | Out-Null
ffmpeg -i "docs/sample/Video Project 27.mp4" -map 0:v:0 -fps_mode passthrough -start_number 1 "docs/sample/analysis-2026-10-27/frames/frame-%04d.png"
```

Local QA captures and recordings under `.impeccable/review/` are also ignored. These exclusions leave the implementation, `.impeccable/design.json`, durable reports, source reference and delivered portfolio media versionable; no generated file was deleted.

| Contact sheet | Frames | Start/end presentation times | Inspection observation |
| --- | --- | --- | --- |
| [01](sample/analysis-2026-10-27/sheets/sheet-01.jpg) | F001–024 | 0.000–0.767s | Black first frame; deck appears immediately. Bust on front-left, robot on front-right. Architecture, red/yellow and patterned cards behind. Slow common turn reveals lower/left cards. |
| [02](sample/analysis-2026-10-27/sheets/sheet-02.jpg) | F025–048 | 0.800–1.567s | Deck broadens. Bust shifts toward center; pale shoe becomes more exposed on left; white architecture extends above the cluster. Orange rectangle is revealed below. |
| [03](sample/analysis-2026-10-27/sheets/sheet-03.jpg) | F049–072 | 1.600–2.367s | Broadest frontal composition, followed by gentle yaw. Bust and robot still dominate. Foreground changes continuously; no cut or new page. |
| [04](sample/analysis-2026-10-27/sheets/sheet-04.jpg) | F073–096 | 2.400–3.167s | Rotation becomes more apparent. Bust slides right; shoe advances into central space. Robot leaves the front. White architecture crosses ahead of bust at F092. |
| [05](sample/analysis-2026-10-27/sheets/sheet-05.jpg) | F097–120 | 3.200–3.967s | Larger change in yaw and spatial compression. Shoe, type and orange cards move through the front. Thin side view around F108–110. By F113 only the small gray product card is visible. |
| [06](sample/analysis-2026-10-27/sheets/sheet-06.jpg) | F121–144 | 4.000–4.767s | Contracted gray card holds, then others emerge from F130–131. Stack spreads in depth, passes near edge-on F136, and opens toward a new frontal order by F142. |
| [07](sample/analysis-2026-10-27/sheets/sheet-07.jpg) | F145–168 | 4.800–5.567s | Expanded assembly returns toward the opening arrangement. Robot and bust move back to front; side cards progressively occlude the gray product card. |
| [08](sample/analysis-2026-10-27/sheets/sheet-08.jpg) | F169–192 | 5.600–6.367s | Slow frontal drift. Bust settles near center, shoe peeks at left, robot at right. Architecture remains above and orange below. |
| [09](sample/analysis-2026-10-27/sheets/sheet-09.jpg) | F193–215 | 6.400–7.133s | Continued restrained yaw with the same expanded composition. No ending title, fade, or final collapse. Last frame does not equal the first. |

The sheets are the frame-by-frame visual ledger: read left to right, then top to bottom. Each cell carries its exact frame ID and time. Adjacent frames within the long slow phases share a composition but show incremental movement; the table does not invent a separate event for each interpolated frame.

## Timing and transition boundaries

| Frames | Time | Observed change | Implementation interpretation |
| --- | --- | --- | --- |
| F001 | 0.000s | Black frame. | Encoding/edit lead-in, not an intentional loading experience to copy. |
| F002–072 | 0.033–2.367s | Expanded deck turns slowly and grows/repositions slightly in projection. | Common parent transform with shallow yaw and stable camera framing. |
| F073–100 | 2.400–3.300s | Faster turn; card order becomes clear through occlusion. | Turn through depth while keeping planes parallel in their local assembly. |
| F101–112 | 3.333–3.700s | Acceleration into a narrow side view and contraction. | Roughly 0.4s gather/turn; move spread toward zero and align cards. |
| F113–129 | 3.733–4.267s | One centered, nearly static card. | Roughly 0.57s isolated hold, with the rest occluded. |
| F130–142 | 4.300–4.700s | Back cards emerge, rapid common yaw through a side view, expansion. | Roughly 0.43s release; coordinated position and parent rotation. |
| F143–215 | 4.733–7.133s | Expanded deck gradually returns to a frontal cluster. | Decelerating settle and subtle ongoing turn. |

**Observed:** the motion is continuous, without a visible hard scene cut after the black opening. The fast changes occupy a small fraction of the clip; the expanded collection is the dominant state. **Inferred:** eased keyframes or a spring-like interpolation drive it. The source does not expose keyframe curves, object transforms, scroll input, or implementation. A precise named easing curve cannot be recovered from this recording alone.

## Geometry, framing and image behavior

- All visible items are thin rectangular image planes, mostly portrait, with small rounded corners. No card border, drop shadow, caption plate or physical thickness is discernible. Depth comes from overlap, translation, foreshortening and occlusion.
- In [F002](sample/analysis-2026-10-27/frames/frame-0002.png), the image cluster is approximately x153–886 and y194–858: about 68% of the square's width and 61% of its height. The two front cards are larger than several rear cards.
- In [F049](sample/analysis-2026-10-27/frames/frame-0049.png), the cluster extends approximately x78–1000 and y110–906: about 85% × 74%. The bust itself is approximately x356–724, y260–810. These are manual bounds, not exact source geometry.
- In [F091](sample/analysis-2026-10-27/frames/frame-0091.png), the shoe occupies central space while bust and architecture sit to the right. Sloped top edges and changes in visible order establish a true depth turn, rather than independent 2D slide transitions.
- [F108](sample/analysis-2026-10-27/frames/frame-0108.png) exposes the planes' narrow sides. [F136](sample/analysis-2026-10-27/frames/frame-0136.png) shows the reverse expansion with separated depth layers. These are the strongest evidence for using a 3D parent group.
- In [F113](sample/analysis-2026-10-27/frames/frame-0113.png), the isolated gray card is about 280 × 445 pixels near the exact center, leaving wide negative space. [F130](sample/analysis-2026-10-27/frames/frame-0130.png) shows the first white sliver returning behind it.
- There is no floor, horizon, environment, lighting rig, shadow receiver or camera bob. The background is black throughout. The corner marks and overlay remain fixed while the media transforms.
- Source media is predominantly gray/white with isolated orange, yellow and red content. These colors belong to the images, not an interface theme. Vincent's work retains its supplied color; no forced monochrome conversion or substitute imagery is appropriate.

**Camera versus object motion:** projected scale and yaw can be produced by a moving camera, a rotating assembly, or both. The fixed overlay alone cannot distinguish them. The economical web reconstruction keeps a camera fixed and animates one parent group plus each card's spread. This reproduces the observed relative motion without a free camera or a 3D navigation system.

**Media motion:** most visible change is movement/occlusion of whole cards. The recording is insufficient to prove the motion technique of every source artwork. Vincent's actual films remain live video textures only when selected; surrounding films use their verified poster frames.

## Typography and incidental video treatment

The source has tiny light monospaced/test lettering: “ALL PURPOSE” top-left and “ASPECT TEST” bottom-right. Corner brackets, side-center registration marks, a play outline and a segmented meter remain fixed. There is no demonstrated navigation, title hierarchy, pointer gesture, playback control, or scroll behavior.

Those marks and words are not Vincent's identity, and the clip does not establish that they were website controls. They are treated as presentation/test treatment and omitted. The portfolio retains the local upright DIN Pro and uses quiet functional navigation, selected-work information and real controls. The gallery, rather than a large headline, owns the first viewport.

## Web implementation mapping

| Reference feature | Portfolio behavior |
| --- | --- |
| Dense layered cloud | One Three.js group containing a bounded neighborhood of rounded image planes. Selected work stays at the front; adjacent works overlap behind in staggered x/y/z positions. |
| Common slow yaw and apparent repositioning | Very shallow parent yaw while idle; pointer movement adds a small reversible change. The user's subsequent request explicitly adds gentle shared up/down and back/forth floating. This is an authored interpretation, not a claim that the recording reveals exact source transforms. Motion pause stops it. |
| Gather, edge-on turn, release | Continuous scroll progress turns and gathers the deck between selections. “View work” deliberately gathers the other cards behind the selected work; “Back to stack” restores the spread. |
| Contracted single-card pause | Focus state holds until the visitor exits. It is enlarged enough to inspect the complete photograph or film. This is an intentional usability adaptation of the small reference hold. |
| Quiet black field | Neutral near-black background across gallery, biography, statistics and contact. No floor grid, brackets, ornamental meter or huge archive headline. |
| Image-only cards | Real supplied media with natural aspect ratios and rounded edges. No overlay labels on the actual planes. Caption and controls sit outside. |
| Compact square recording | Responsive stage uses available width and height. The user's final scale correction deliberately enlarges the deck and permits peripheral cards to bleed past the viewport, especially on phones. The selected front plane is centered and fitted through float/yaw extremes; the individual inspected work remains complete. |

Native document scrolling selects among all 29 works through a sticky stage. Horizontal drag and Previous/Next share the same selection; Home/End and arrow keys work immediately. Vertical touch retains native scroll. The header's About and Contact links leave the gallery immediately. An optional Flat view exposes the complete catalog with normal page scrolling.

The user's later priority is phone portrait and portrait iPad, which are the primary composition and touch QA surfaces: 390×844, 820×1180 and 768×1024. Desktop 1440×900 and narrow 320px remain verification surfaces. The scene uses a nine-preview budget through 1024px, DPR1.5 cap and one selected film source. Dynamic viewport height, safe-area insets and 44px controls keep the active caption and controls usable.

The final user correction requests a meaningfully larger gallery, allowing outer cards to extend beyond the phone edges as long as the selected media remains fully visible or centered. The implementation brings base camera framing 20% closer, producing roughly 25–30% larger projection, and rotates around the front plane, with a conservative active-media fit. Peripheral clipping is intentional; horizontal page overflow is not. This request supersedes the earlier whole-cluster safe-area interpretation and is an explicit adaptation of VIDEO-01.

These controls are designed for the portfolio; they are not claimed to be interactions demonstrated by the source clip. The reference's repeated seven-second choreography is not an automatic slideshow that prevents visitors from inspecting a work.

The later centering correction addresses the visible ensemble as well as its active plane. Positive yaw around the front pivot had displaced the rear cards left. Projected horizontal bounds now balance the surrounding cards around the floating front anchor, with continuous weights through selection and no active-plane correction at rest. Camera distance and media scale are unchanged. Actual 390px idle-yaw visible-area centroid improves from 40.77% to 49.68% of viewport width. Complete measurements and current evidence: `docs/reference-gallery-centering.md`.

## Content, accessibility and runtime constraints

- Preserve `src/data/portfolio.ts`, the 58 delivery files and their provenance/encoded bytes. Maintain the once-per-load mixed shuffle across views.
- Keep previews bounded (13 wide-screen, 9 phone/portrait-tablet through 1024px) and only one selected film decoder. Dispose displaced textures, old VideoTextures, listeners, observers and RAF work. Suspend rendering/playback when hidden or offscreen.
- Reduced motion removes idle movement, gathering/yaw transitions and easing; selection/focus changes are immediate. Live preference changes update the existing scene rather than recreating WebGL. Film playback remains muted, inline and independently pausable. Manual Play/Space/Retry reaches the media element inside the user gesture.
- Use visible focus, actual buttons with pressed state, named keyboard region, stable selected-work announcements, honest loading/error states and a complete WebGL-unavailable fallback.
- Existing biography/ABOUT_ME streaming, exact statistics, contact destinations and media API behavior remain intact.

## Verification and rollout

- [x] Extract, index and inspect all 215 frames; view transition boundaries large.
- [x] Preserve incumbent working tree outside the checkout at `D:/projects/vincent-guanco-baseline-20261027-astra` (tracked binary patch and editable untracked source/design copies).
- [x] Inspect desktop, mobile, portrait iPad, 320px and measured 440px Chrome-panel layouts; expanded/focused deck, portrait and landscape active works, keyboard, drag, native scrolling and Flat view. All 24 current centering captures were viewed in `.impeccable/review/reference-deck-centering/after/`; prior unchanged Flat/Contact evidence remains in `reference-deck-final-large/`.
- [x] Verify actual film pixels, synchronous-gesture Play/Space/Retry, reduced motion and live preference changes, offscreen cleanup and WebGL failure.
- [x] Full lint, TypeScript and production build passed; Playwright **32/32 passed**, including rendered ensemble centering at six viewport sizes and conservative active-plane projection checks across all 29 catalog aspect ratios. Detailed evidence: `docs/reference-gallery-verification.md`.
- [x] Catalog/provenance hashes unchanged; all 58 media sizes/hashes match provenance, total68,404,950 bytes.
- [x] Fresh static visual review of the enlarged-deck snapshot: [finish review](reference-gallery-finish-review.md), disposition **ship**. Four reference frames and all 18 final captures were inspected; behavioral results remain attributed to the verification packet, and the reviewer did not play the source MP4 or motion recording.
- [x] Design-documentation snapshot refreshed in [DESIGN.md](../DESIGN.md) and [.impeccable/design.json](../.impeccable/design.json) from implementation source and eight representative PNGs. The documenter changed no application code, tests, assets or runtime behavior and did not rerun the detector or test suite.
- [x] Correct and verify the user's report of left-shifted live framing; see [centering evidence](reference-gallery-centering.md).
- [x] Fresh final review of the corrected gallery: [centering review](reference-gallery-centering-review.md), disposition **ship**, no material fixes. All 24 corrected states and four unchanged Flat/Contact states were inspected alongside four source frames; behavior is attributed to the verification packet. The source MP4 and corrected motion WebM were not played by that reviewer.
- [x] Final design reconciliation: [DESIGN.md](../DESIGN.md) and [.impeccable/design.json](../.impeccable/design.json) now map the current projected-bound centering helpers and describe the balanced enlarged ensemble with complete centered active/focused work. Normative palette, type, radii and media scale remain unchanged.

The current packet records 32 passing browser tests plus passing lint, TypeScript and production build for the centering correction. [Current production captures](../.impeccable/review/reference-deck-centering/after/) cover six sizes, including the measured 440×956 Chrome surrogate. At 390px, the yaw-state visible-area centroid improved from 40.77% to 49.68% without shrinking the gallery. The exact in-app viewport was unavailable. The interactive Chrome profile has reduced motion enabled and was not changed; explicit no-preference contexts supply normal-motion evidence. Physical iOS, iPad Safari and Instagram-browser performance remain unverified.

Implementation verification, final review and design documentation are complete before integration. The user selected committing all work on main; the checkout is on main and the coordinating agent owns the upcoming commit. The user will run Vercel deployment. This documentation pass does not perform or claim completion of the commit or deployment.
