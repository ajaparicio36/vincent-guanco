import manifest from "@/data/video-assets.json";

interface VideoAsset {
  readonly desktopKey: string;
  readonly mobileKey: string;
  readonly posterKey: string;
}

const assets: Readonly<Record<string, VideoAsset>> = manifest;

export interface MediaSources {
  readonly url: string;
  readonly mobileUrl?: string;
  readonly posterUrl?: string;
}

export function getMediaSources(key: string, publicUrl: string): MediaSources {
  const base = publicUrl.replace(/\/$/, "");
  const urlFor = (assetKey: string): string => `${base}/${encodeURI(assetKey)}`;
  const asset = Object.hasOwn(assets, key) ? assets[key] : undefined;
  // Unprocessed/new uploads and photos retain their original source URL.
  if (!asset) return { url: urlFor(key) };
  return {
    url: urlFor(asset.desktopKey),
    mobileUrl: urlFor(asset.mobileKey),
    posterUrl: urlFor(asset.posterKey),
  };
}
