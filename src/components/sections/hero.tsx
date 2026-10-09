"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useMediaViewport } from "@/hooks/use-media-viewport";

export interface HeroVideo {
  readonly url: string;
  readonly displayName: string;
  readonly posterUrl?: string;
}

interface HeroProps {
  readonly desktopVideos: readonly HeroVideo[];
  readonly mobileVideos: readonly HeroVideo[];
}

export function Hero({
  desktopVideos,
  mobileVideos,
}: HeroProps): React.ReactElement {
  const { ref: heroRef, isVisible: heroVisible } = useMediaViewport<HTMLElement>();
  const [sourceKind, setSourceKind] = useState<"mobile" | "desktop" | null>(null);
  const videos = useMemo(
    () =>
      sourceKind === "mobile"
        ? mobileVideos
        : sourceKind === "desktop"
          ? desktopVideos
          : [],
    [desktopVideos, mobileVideos, sourceKind],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [warmedIndex, setWarmedIndex] = useState<number | null>(null);
  const [playRejected, setPlayRejected] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateSourceKind = (): void => {
      activeIndexRef.current = null;
      setActiveIndex(null);
      setWarmedIndex(null);
      setPlayRejected(false);
      setSourceKind(mediaQuery.matches ? "mobile" : "desktop");
    };
    updateSourceKind();
    mediaQuery.addEventListener("change", updateSourceKind);
    return () => mediaQuery.removeEventListener("change", updateSourceKind);
  }, []);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 6000, playOnInit: false }),
    [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [autoplayPlugin],
  );

  const onSelect = useCallback((): void => {
    if (!emblaApi) return;
    emblaApi.plugins().autoplay.stop();
    const index = emblaApi.selectedScrollSnap();
    activeIndexRef.current = index;
    setActiveIndex(index);
    setCurrentName(videos[index]?.displayName ?? "");
    setPlayRejected(false);
  }, [emblaApi, videos]);

  useEffect(() => {
    if (!emblaApi || videos.length === 0) return;

    emblaApi.reInit();
    // Random start position so each load feels fresh.
    const randomIndex = Math.floor(Math.random() * videos.length);
    emblaApi.scrollTo(randomIndex, true);
    activeIndexRef.current = randomIndex;
    setActiveIndex(randomIndex);
    setCurrentName(videos[randomIndex]?.displayName ?? "");

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, videos, onSelect]);

  useEffect(() => {
    if (activeIndex === null || videos.length === 0) return;
    const activeVideo = activeVideoRef.current;
    if (!activeVideo) return;
    if (!heroVisible) {
      activeVideo.pause();
      emblaApi?.plugins().autoplay.stop();
      return;
    }
    activeVideo.muted = true;

    let cancelled = false;
    void activeVideo.play().then(
      () => {
        if (!cancelled) {
          setPlayRejected(false);
          const autoplay = emblaApi?.plugins().autoplay;
          if (autoplay && !autoplay.isPlaying()) autoplay.play();
        }
      },
      () => {
        if (!cancelled) {
          emblaApi?.plugins().autoplay.stop();
          setPlayRejected(true);
        }
      },
    );

    return () => {
      cancelled = true;
      activeVideo.pause();
    };
  }, [activeIndex, emblaApi, videos, heroVisible]);

  const handlePlaying = useCallback(
    (index: number, video: HTMLVideoElement): void => {
      if (
        index !== activeIndex ||
        activeIndexRef.current !== index ||
        activeVideoRef.current !== video ||
        !heroVisible ||
        playRejected
      ) {
        return;
      }
      if (videos.length <= 1) return;
      const autoplay = emblaApi?.plugins().autoplay;
      if (autoplay && !autoplay.isPlaying()) autoplay.play();
      setWarmedIndex((index + 1) % videos.length);
    },
    [activeIndex, emblaApi, playRejected, videos.length, heroVisible],
  );

  const handlePlayClick = useCallback((): void => {
    const activeVideo = activeVideoRef.current;
    const requestedIndex = activeIndex;
    if (!activeVideo || requestedIndex === null) return;
    emblaApi?.plugins().autoplay.stop();
    if (activeVideo.error) activeVideo.load();
    activeVideo.muted = true;

    const isStillActive = (): boolean =>
      activeVideoRef.current === activeVideo &&
      activeIndexRef.current === requestedIndex;

    void activeVideo.play().then(
      () => {
        if (isStillActive()) {
          setPlayRejected(false);
          const autoplay = emblaApi?.plugins().autoplay;
          if (autoplay && !autoplay.isPlaying()) autoplay.play();
        }
      },
      () => {
        if (isStillActive()) {
          emblaApi?.plugins().autoplay.stop();
          setPlayRejected(true);
        }
      },
    );
  }, [activeIndex, emblaApi]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden"
    >
      {/* Video carousel or fallback */}
      {videos.length > 0 ? (
        <div className="absolute inset-0 z-0 bg-[#d4d3c7]" ref={emblaRef}>
          <div className="flex h-full">
            {videos.map((video, index) => {
              const isActive = index === activeIndex;
              const isWarmed = index === warmedIndex && !isActive;
              const hasSource = isActive || isWarmed;
              return (
                <div
                  key={video.url}
                  className="relative min-w-0 shrink-0 grow-0 basis-full h-full bg-[#d4d3c7]"
                >
                  {hasSource ? (
                    <video
                      ref={isActive ? activeVideoRef : undefined}
                      src={video.url}
                      poster={video.posterUrl}
                      autoPlay={isActive && heroVisible}
                      muted
                      loop
                      playsInline
                      preload={isActive ? "auto" : "metadata"}
                      onPlaying={(event) =>
                        handlePlaying(index, event.currentTarget)
                      }
                      onError={() => { if (isActive) setPlayRejected(true); }}
                      className="relative z-10 w-full h-full object-cover"
                      style={{ objectPosition: "center center" }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          {playRejected && activeIndex !== null ? (
            <button
              type="button"
              onClick={handlePlayClick}
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-black/40 px-6 py-3 font-sans text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-sm"
            >
              Tap to play
            </button>
          ) : null}
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(160deg, #d4d3c7 0%, #c8c7bb 40%, #b8b7ab 100%)",
              filter: "contrast(1.02)",
            }}
          />
        </div>
      )}

      {/* Tonal overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fffcf7]/20 via-transparent to-[#fffcf7]/70 pointer-events-none z-[1]" />

      {/* Bottom-left editorial text */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 pointer-events-none">
        {currentName ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-3 pointer-events-auto"
          >
            <div className="w-12 h-px bg-[#0e0e0c]/20" />
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#0e0e0c]/80">
              {currentName}
            </p>
          </motion.div>
        ) : null}

        {/* Scroll indicator — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex items-center gap-4 md:gap-6 pointer-events-auto"
        >
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-secondary">
            Scroll to Explore
          </p>
          <div className="hidden md:block w-12 h-px bg-[#0e0e0c]/20" />
        </motion.div>
      </div>
    </section>
  );
}
