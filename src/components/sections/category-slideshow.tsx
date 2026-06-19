"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { HeroVideo } from "@/components/sections/hero";

interface CategorySlideshowProps {
  readonly photos: readonly HeroVideo[];
}

export function CategorySlideshow({
  photos,
}: CategorySlideshowProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState(
    photos[0]?.displayName ?? "",
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40, slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setCurrentIndex(index);
    setCurrentName(photos[index]?.displayName ?? "");
  }, [emblaApi, photos]);

  useEffect(() => {
    if (!emblaApi || photos.length === 0) return;

    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
    setCurrentName(photos[0]?.displayName ?? "");

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, photos, onSelect]);

  const slides = useMemo(() => {
    const result: HeroVideo[][] = [];
    for (let i = 0; i < photos.length; i += 4) {
      result.push(photos.slice(i, i + 4));
    }
    return result;
  }, [photos]);

  if (photos.length === 0) return <></>;

  return (
    <section className="relative w-full bg-background py-16 md:py-24">
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, slideIndex) => (
            <div
              key={
                slide
                  .map((p) => p.url)
                  .join(",")
                  .slice(0, 64) + slideIndex
              }
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <div className="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-12">
                {slide.map((photo) => (
                  <div
                    key={photo.url}
                    className="relative overflow-hidden bg-surface-container-high aspect-[4/5]"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.displayName}
                      fill
                      unoptimized
                      loading="lazy"
                      className="object-cover"
                      style={{ filter: "contrast(1.02)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom-left editorial label */}
      {currentName ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-6 left-4 md:bottom-12 md:left-12 flex flex-col space-y-3"
        >
          <div className="w-12 h-px bg-[#0e0e0c]/20" />
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#0e0e0c]/80">
            {currentName}
          </p>
        </motion.div>
      ) : null}

      {/* Slide counter — bottom-right */}
      <div className="absolute bottom-6 right-4 md:bottom-12 md:right-12 flex items-center gap-4 md:gap-6">
        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-secondary">
          {String(currentIndex + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </p>
        <div className="hidden md:block w-12 h-px bg-[#0e0e0c]/20" />
      </div>
    </section>
  );
}
