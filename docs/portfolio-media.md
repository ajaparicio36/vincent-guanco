# Portfolio media

The homepage uses all 29 supplied portfolio items: 18 photographs and 11 full films. The user-selected gallery video and earlier inspiration images are references only. Original media under `D:\new-vids-vincent\NEW PORTFOLIO` remains untouched. Existing R2 objects, API contracts and ABOUT_ME portraits remain in place.

The typed catalog is `src/data/portfolio.ts`. IDs are stable; the browser shuffles the mixed catalog once after hydration and preserves that order across view switches. Titles describe visible material or supplied filenames and do not assert new client relationships, dates or unnamed identities.

## Delivery package and provenance

`public/portfolio/2026-10/` contains 58 delivery files. `portfolio-media-provenance.json` maps each output to its source, dimensions, bytes and SHA-256 hash. Film records include the selected poster timestamp and selection rationale. Provenance is kept alongside the media so the verified encoded bytes remain unchanged.

| Output | Count | Bytes |
| --- | ---: | ---: |
| Photo details | 18 | 3,302,532 |
| Photo thumbnails | 18 | 1,139,136 |
| Film posters | 11 | 540,366 |
| Full films | 11 | 63,422,916 |
| Total | 58 | 68,404,950 |

The original portfolio payload totals 2,195,119,126 bytes. Delivery reduces it by 96.88%. All thumbnails and posters together total 1,679,502 bytes; the browser does not fetch the complete film payload on entry.

Photographs use WebP at a maximum 1600px detail edge and 900px thumbnail edge, with EXIF orientation normalized and sRGB output. PHOTO-01 and PHOTO-12 required EXIF rotation. Posters use a maximum 1200px edge. Films preserve full duration and aspect ratio using H.264 High/yuv420p, AAC audio, 30fps maximum and 720p bounds, with faststart metadata. FILM-01 and FILM-10 are silent in their originals. Maximum video-stream duration difference is 0.020 seconds; container timing differs by at most 0.045 seconds.

## Reproduce the derivatives

The external preparation package and its original reference manifest are retained at:

`C:\Users\ajapa\.codex\visualizations\2026\10\21\01a15c79-03d6-7870-bba7-62a4061b4d8f\portfolio-reinvention\derived-media`

From that directory, run:

```powershell
node .\derive-media.cjs --manifest ..\reference-manifest.json --output . --sharp 'D:\projects\vincent-guanco\node_modules\.pnpm\sharp@0.34.5\node_modules\sharp'
```

The package includes `derive-media.cjs`, `derived-manifest.json`, `README.md`, `assets/` and `verification/REVIEW.md`. FFmpeg/FFprobe and the pinned Sharp dependency are required. Exact conversion settings are also preserved in the repository provenance JSON. The script checks source signatures and output hashes before reuse; its verified rerun produced zero new files. Copying reviewed outputs into the repository is a separate integration step.

The preparation review inspected and fully decoded all 58 outputs, reviewed all 18 photos and all 11 source-poster/encoded-frame pairs, checked orientation/dimensions/audio/duration/faststart and confirmed unchanged source sizes and modification times. The evidence files remain in the package's `verification/` directory.

## Runtime resource policy

- Stack is the default, including reduced motion. The Three.js engine is dynamically imported, holds at most nine preview textures through 1024px and thirteen on wider screens, and disposes textures leaving that window.
- Exactly one focused film may own a VideoTexture and video source. Leaving that film pauses it, removes its source and element, and disposes the texture. Hidden/offscreen Spatial pauses playback and rendering.
- Flat films attach their source and autoplay at 12% visibility. Hidden/offscreen films pause and clear their source. User pause survives visibility changes.
- Films autoplay muted, loop and play inline, with custom pause/play/retry. Manual playback reaches `video.play()` synchronously in the click/keyboard gesture. There are no native controls or media dialogs.
- Normal document scrolling drives the sticky stage. Keyboard, buttons and drag use the same progress. View work isolates the selected piece; Back to stack restores the cloud. Reduced motion disables deck drift/yaw and transition easing while keeping the requested film behavior. Live motion preference changes update the existing scene.
- The complete deck floats gently with a fixed camera; motion pause is independent of film pause. Useful rendering is bounded to 30fps and DPR1.5. Dynamic viewport height, safe-area insets and 44px controls support primary phone/portrait iPad use.
- WebGL/preview failure exposes the complete Flat archive. Statistics and contact render independently; optional remote ABOUT_ME portraits stream with a complete fallback.

## Local verification

The revised Playwright suite covers the 29-item stable shuffle, native scrolling and shared navigation, actual changing video pixels on the Three.js canvas, synchronous-gesture Play/Space/Retry, visibility cleanup, blocked playback, failures, focus and paused/reduced-motion pixels, live preference changes, and existing media API compatibility. Real touch contexts at 390×844, 820×1180 and 768×1024 verify 44px controls, horizontal dragging, native vertical exit and About/Contact access; a 320px check verifies overflow. `tests/portrait-streaming.spec.ts` injects pending and rejected portrait listings into the real server-rendered homepage to verify that exact statistics and full contact details still stream.

```powershell
node node_modules/eslint/bin/eslint.js
node node_modules/typescript/bin/tsc --noEmit
node node_modules/@playwright/test/cli.js test
node node_modules/next/dist/bin/next build
```

Tests use headless Chrome on port 3100. Interactive confirmation uses the separately authorized shared Chrome session. Local success does not establish deployed CDN behavior.

## Deferred remote migration and rollback

No upload, deployment, object overwrite, deletion or purge is part of this local implementation. The local preview uses local delivery URLs. A future authorized migration should:

1. Snapshot the live catalog/configuration and preserve the previous release and all referenced keys.
2. Upload derivatives under a new immutable, versioned prefix without replacing existing objects. Keep ABOUT_ME and all current API/rollback dependencies intact.
3. Verify every uploaded hash/size, content type, range response, poster, film decode and cache policy before changing references. Both video paths request anonymous CORS; the CDN must return a compatible Access-Control-Allow-Origin header for the site origin (including range responses) so cross-origin Three.js VideoTextures remain usable. Verify real on-plane playback after the switch.
4. Switch the catalog to the new prefix and deploy, then verify the live homepage, inline playback, mobile behavior, biography/contact and existing API.
5. Roll back by restoring the prior catalog/release if verification fails. The old keys remain available.

The user already conditionally authorized obsolete-media cleanup when the site is actually deployed. During an authorized, verified deployment, that cleanup may proceed using a concrete reviewed obsolete-key allowlist. It must exclude ABOUT_ME, currently referenced API/live keys, rollback dependencies and source originals. Do not infer obsolete keys from filenames or directory age. Deployment and cleanup remain deferred from this local task.
