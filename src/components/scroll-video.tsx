"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useMediaViewport } from "@/hooks/use-media-viewport";
import type { MediaSources } from "@/lib/video-assets";

type ScrollVideoProps = MediaSources &
  Omit<ComponentProps<"video">, "src" | "poster" | "autoPlay" | "muted" | "preload" | "controls"> & {
    readonly active?: boolean;
    readonly label: string;
  };

export function ScrollVideo({ url, mobileUrl, posterUrl, active = true, label, onPlaying, onError, ...props }: ScrollVideoProps): React.ReactElement {
  const { ref, hasApproached, isVisible } = useMediaViewport<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [playBlocked, setPlayBlocked] = useState(false);
  const shouldPlay = active && isVisible;
  const source = isMobile === null ? undefined : isMobile && mobileUrl ? mobileUrl : url;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = (): void => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasApproached || !source) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    // Set the DOM property before play(), including in embedded iOS browsers.
    video.muted = true;
    let cancelled = false;
    void video.play().then(
      () => { if (!cancelled) setPlayBlocked(false); },
      () => { if (!cancelled) setPlayBlocked(true); },
    );
    return () => { cancelled = true; video.pause(); };
  }, [hasApproached, shouldPlay, source]);

  const handlePlay = (): void => {
    const video = videoRef.current;
    if (!video) return;
    if (video.error) video.load();
    video.muted = true;
    // Keep play() directly inside the gesture; loading callbacks lose iOS authorization.
    void video.play().then(() => setPlayBlocked(false), () => setPlayBlocked(true));
  };

  return (
    <div ref={ref} className="relative w-full h-full">
      {hasApproached && source ? <video
        {...props}
        ref={videoRef}
        src={source}
        poster={posterUrl}
        muted
        playsInline
        preload="metadata"
        controls={playBlocked}
        aria-label={label}
        onPlaying={(event) => { setPlayBlocked(false); onPlaying?.(event); }}
        onError={(event) => { setPlayBlocked(true); onError?.(event); }}
      /> : null}
      {playBlocked && isVisible ? (
        <button type="button" onClick={handlePlay} aria-label={`Play ${label}`} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/60 bg-black/60 px-5 py-3 font-sans text-xs text-white">
          Tap to play
        </button>
      ) : null}
    </div>
  );
}
