"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useFaceCenter } from "@/hooks/use-face-center";

export interface HeroVideo {
  readonly url: string;
  readonly displayName: string;
}

interface HeroProps {
  readonly videos: readonly HeroVideo[];
}

export function Hero({ videos }: HeroProps): React.ReactElement {
  const [currentName, setCurrentName] = useState(videos[0]?.displayName ?? "");

  // Extract video URLs for face detection
  const videoUrls = useMemo(() => videos.map((v) => v.url), [videos]);
  const { positions: facePositions } = useFaceCenter(videoUrls);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setCurrentName(videos[index]?.displayName ?? "");
  }, [emblaApi, videos]);

  useEffect(() => {
    if (!emblaApi || videos.length === 0) return;

    // Random start position
    const randomIndex = Math.floor(Math.random() * videos.length);
    emblaApi.scrollTo(randomIndex, true);
    setCurrentName(videos[randomIndex]?.displayName ?? "");

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, videos, onSelect]);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Video carousel or fallback */}
      {videos.length > 0 ? (
        <div className="absolute inset-0 z-0" ref={emblaRef}>
          <div className="flex h-full">
            {videos.map((video) => (
              <div
                key={video.url}
                className="min-w-0 shrink-0 grow-0 basis-full h-full"
              >
                <video
                  src={video.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition:
                      facePositions.get(video.url) ?? "center 30%",
                  }}
                />
              </div>
            ))}
          </div>
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
