# Portfolio media

The homepage uses the complete final collection from `D:\new-vids-vincent\final-list`: 7 photographs and 12 full films. The typed catalog is `src/data/portfolio.ts`; the browser shuffles this mixed collection once after hydration and keeps that order across view switches. Titles follow the supplied filenames, and descriptions identify visible material without adding client or credit claims. The original files were read only.

## Delivery and provenance

The new versioned delivery is `public/portfolio/2026-11-final/`. `portfolio-media-sources-2026-11-final.json` records the original filenames, source SHA-256 hashes, title/description and selected new poster times. `portfolio-media-provenance.json` records source and output hashes, sizes, dimensions, colour, audio, duration, poster selections and validation results. The 2026-10 delivery remains at `public/portfolio/2026-10/`, and its original provenance is preserved in `portfolio-media-provenance-2026-10.json` for rollback.

| Output | Count | Bytes |
| --- | ---: | ---: |
| Photo details | 7 | 1,331,132 |
| Photo thumbnails | 7 | 505,892 |
| Film posters | 12 | 659,980 |
| Full films | 12 | 86,816,843 |
| Total | 38 | 89,313,847 |

The 19 source files total 2,570,938,346 bytes; the delivered files are 96.53% smaller. All thumbnails and posters together total 1,165,872 bytes. Films are loaded on demand.

Seven photos and eight films matched earlier originals by SHA-256. Their 30 previously verified derivatives were copied byte-for-byte after their hashes were checked against the archived provenance; filename or size matches alone were never used for reuse. The other four films and four posters were freshly generated.

Photographs use WebP with an auto-oriented, sRGB 1600px maximum detail edge at quality 84 and a 900px maximum thumbnail edge at quality 82, both with effort 5. The MIUMIU source has EXIF orientation 8 and is normalized in both outputs. Posters use WebP at a 1200px maximum edge and quality 84. Films preserve their complete duration and aspect ratio within 1280×720 landscape or 720×1280 portrait bounds, using H.264 High 3.1, yuv420p, the medium preset, CRF 22, a 4M maximum rate, an 8M buffer, no more than 30fps, AAC audio at 96k and faststart. All 12 sources and outputs are SDR BT.709; all 12 retain an audio track with the original channel count and sample rate. The largest source-to-output container duration difference is 0.045 seconds and the largest video-stream difference is 0.020 seconds.

All 38 delivered files were probed and fully decoded, including reused derivatives. Every film's audio, frame rate, dimensions, orientation, colour tags and faststart atom order were checked. Source hashes, byte sizes and modification times remained unchanged through preparation. A contact sheet of all delivered photos and posters was visually checked for orientation and black frames, and each film's poster was compared visually with the source and encoded frame at its selected time. The local review sheets from this run are in `%TEMP%\vg-final-media-2026\delivery-contact-sheet.png` and `%TEMP%\vg-final-media-2026\poster-source-encoded.png`.

## Reproduce the derivatives

Run from the repository root with Node, FFmpeg/FFprobe on PATH, the installed Sharp 0.34.5 package, the final-list originals, the earlier `NEW PORTFOLIO` originals, and the retained 2026-10 delivery available:

```powershell
$staging = Join-Path $env:TEMP 'vincent-final-preparation'
node scripts/prepare-final-portfolio.mjs --manifest docs/portfolio-media-sources-2026-11-final.json --output $staging --sharp (Join-Path $PWD 'node_modules/.pnpm/sharp@0.34.5/node_modules/sharp')
```

The script verifies every final original against the source manifest and checks earlier originals and derivatives by hash before reuse. New posters and films are encoded from the final originals. It writes only inside the staging directory, fully decodes every output, rechecks the originals and writes `derived-manifest.json` with the validation results. Review the staged outputs and record their hashes before copying them to a new versioned delivery directory. Fresh video encodes can differ between runs even with the same tool versions, which are recorded in the provenance; the currently delivered files and their recorded hashes remain the verified release.

## Runtime resource policy

- Stack is the default, including reduced motion. The Three.js engine is dynamically imported, holds at most nine preview textures through 1024px and thirteen on wider screens, and disposes textures leaving that window.
- Exactly one focused film may own a VideoTexture and video source. Leaving that film pauses it, removes its source and element, and disposes the texture. Hidden or offscreen Spatial pauses playback and rendering.
- Flat films attach their source and autoplay at 12% visibility. Hidden or offscreen films pause and clear their source. User pause survives visibility changes.
- Films autoplay muted, loop and play inline, with custom pause/play/retry. Manual playback reaches `video.play()` synchronously in the click or keyboard gesture.
- Normal document scrolling drives the sticky stage. Keyboard, buttons and drag use the same progress. View work isolates the selected piece; Back to stack restores the deck. Reduced motion disables deck drift, yaw and transition easing while retaining film controls.
- The complete deck floats gently with a fixed camera; motion pause is independent of film pause. Rendering is bounded to 30fps and DPR 1.5. WebGL or preview failure exposes the complete Flat archive.

## Local verification

The Playwright suite exercises the stable mixed order, gallery navigation, playback, cleanup, reduced motion, failure handling, responsive touch contexts and existing media API compatibility. Local checks can be run with:

```powershell
node node_modules/eslint/bin/eslint.js
node node_modules/typescript/bin/tsc --noEmit
node node_modules/@playwright/test/cli.js test
node node_modules/next/dist/bin/next build
```

Local success does not establish deployed CDN or physical-device behavior.

## Deferred remote migration and rollback

The old local versioned assets and their provenance remain available. A future authorized migration should upload the new derivatives under an immutable prefix, verify hashes, content types, range responses, CORS, posters and video playback, then switch references and verify the live site. Roll back by restoring the prior catalog and release; preserve earlier keys and the original files until rollback is no longer needed. Remote deployment and any obsolete-media cleanup are outside this local preparation.

The user previously conditionally authorized obsolete-media cleanup when the site is deployed. During an authorized, verified deployment, use a concrete reviewed obsolete-key allowlist that excludes ABOUT_ME, currently referenced API/live keys, rollback dependencies and source originals; do not infer obsolete keys from filenames or directory age.
