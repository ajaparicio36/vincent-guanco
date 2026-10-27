"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { PortfolioWork } from "@/data/portfolio";
import type { PlaybackStatus } from "@/lib/spatial-gallery";

interface InlineFilmProps {
  readonly work: Extract<PortfolioWork, { kind: "video" }>;
}
export function InlineFilm({ work }: InlineFilmProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const [status, setStatus] = useState<PlaybackStatus>("paused");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let disposed = false;
    const release = (): void => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    const sync = (): void => {
      if (!visibleRef.current || document.hidden) { release(); return; }
      if (!video.hasAttribute("src")) { video.src = work.src; setStatus(pausedRef.current ? "paused" : "loading"); }
      if (!pausedRef.current) void video.play().catch(() => {
        if (!disposed && visibleRef.current && !document.hidden) setStatus(video.error ? "error" : "blocked");
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.12;
      sync();
    }, { threshold: [0, 0.12] });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      release();
    };
  }, [work.src, attempt]);

  function toggle(): void {
    const video = videoRef.current;
    if (!video) return;
    if (status === "error") { pausedRef.current = false; setAttempt(attempt + 1); return; }
    if (status === "playing") {
      pausedRef.current = true;
      video.pause();
      setStatus("paused");
    } else {
      pausedRef.current = false;
      if (!video.hasAttribute("src")) video.src = work.src;
      void video.play().catch(() => setStatus(video.error ? "error" : "blocked"));
    }
  }
  return (
    <div className="inline-film" data-playback={status}>
      <video ref={videoRef} poster={work.thumbnail} muted loop playsInline preload="none" crossOrigin="anonymous"
        width={work.width} height={work.height} aria-label={work.title}
        onPlaying={() => setStatus("playing")} onPause={event => setStatus(event.currentTarget.error ? "error" : "paused")}
        onError={() => setStatus("error")} />
      <button className="inline-playback" type="button" onClick={toggle}
        aria-label={(status === "playing" ? "Pause " : status === "error" ? "Retry " : "Play ") + work.title}>
        {status === "playing" ? <Pause size={13} /> : status === "error" ? <RotateCcw size={13} /> : <Play size={13} />}
        <span>{status === "playing" ? "Pause" : status === "error" ? "Retry film" : status === "blocked" ? "Play film" : "Play"}</span>
      </button>
      {status === "error" && <p className="inline-media-notice" role="status">Film unavailable. Try again.</p>}
    </div>
  );
}
