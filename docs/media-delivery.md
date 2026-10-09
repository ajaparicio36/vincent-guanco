# Media delivery

Video selections, their order, collection layout keys, and hero framing are unchanged. Desktop hero clips still come from `THUMBNAILS`; mobile hero clips remain `HERO_MOBILE/2026-09-28/{1,2,4,5,6}.mp4` with their existing posters.

## Video versions

`src/data/video-assets.json` maps original R2 keys to verified, versioned derivatives under `WEB_VIDEO/2026-10-09-v1/`. Original objects are retained.

- Desktop: stream-copy MP4 remux with faststart. Encoded picture and sound quality are preserved.
- Mobile: H.264 Main Level 3.1, 8-bit YUV420, at most 30 fps, AAC-LC, and faststart. Landscape fits within 1280×720; portrait fits within 720×1280 without upscaling or cropping. CRF 23 and a 2.5 Mbps video ceiling reduce transfer size.
- Gallery/metric posters: JPEG first frames, loaded only when the video approaches the screen.

The preparation script lists currently configured collections and hero/metric folders, downloads originals with ETag preconditions, verifies both MP4 indexes, fully decodes mobile outputs, uploads under content-derived keys, and checks public partial-content responses before recording each manifest entry. It can resume an interrupted run. Existing derivative keys are not overwritten; changing source ETags generates new keys.

```powershell
# Requires Node 24, FFmpeg/ffprobe, and the existing R2 values in .env.local.
pnpm media:prepare
```

Rerun preparation before deploying newly uploaded videos. Videos without a manifest entry fall back to their original URL. Removing a manifest entry (or reverting the delivery commit) restores original delivery without deleting any media.

## Scroll loading and playback

Category listings, individual collection photos/videos, the About carousel, and metric videos load when they approach within 300 pixels of the viewport. Fixed aspect ratios reserve space; photos fade in after loading. The About carousel runs only while visible. Video elements are created on approach and keep their source afterward; scrolling away pauses playback instead of resetting the source. Hidden browser tabs also pause playback.

Hero loading remains eager for the active clip and warms only the next clip. Its playback and carousel pause offscreen. Device selection happens before attaching sources, so the wrong device's video set is not downloaded. Embedded browsers that reject autoplay get a direct tap-to-play action; conversion cannot override a host app's playback policy.

## Media API example

```powershell
curl.exe "http://localhost:3100/api/media?type=video&category=fashion-week&v=2026-10-09"
```

Each video item returns its original layout `key`, a full-quality faststart `url`, a smaller `mobileUrl`, and a `posterUrl`. Photo items retain `key` and `url`. Listings use a short revalidation window; versioned asset files remain immutable for one year. The listing version parameter avoids previously cached one-year responses after deployment.

## Verification

```powershell
pnpm lint
pnpm exec tsc --noEmit
pnpm test:media
pnpm build
```

The Playwright checks use installed Chrome and cover media API validation, device-specific hero source selection, deferred images, offscreen pause/source retention, and recovery when autoplay requires a gesture. The affected iPhone's Instagram browser still needs a post-deployment check.
