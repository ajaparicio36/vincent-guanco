"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useMediaViewport } from "@/hooks/use-media-viewport";

export interface AboutPhoto {
  readonly url: string;
  readonly key: string;
}

interface AboutProps {
  readonly photos: readonly AboutPhoto[];
}

const WHATSAPP_NUMBER = "33614984173"; // +33 614 98 41 73, no + or spaces for wa.me
const WHATSAPP_DISPLAY = "+33 614 98 41 73";
const INSTAGRAM_URL = "https://www.instagram.com/vincentguanco/";
const EMAIL = "vincentguancostaes@gmail.com";

function PhotoCarousel({
  photos,
  active,
}: {
  readonly photos: readonly AboutPhoto[];
  readonly active: boolean;
}): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const currentIndexRef = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const loadedUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!active || photos.length <= 1) return;
    const timer = window.setInterval(() => {
      const currentIndex = currentIndexRef.current;
      const nextIndex = (currentIndex + 1) % photos.length;
      const nextPhoto = photos[nextIndex];
      if (!nextPhoto || !loadedUrlsRef.current.has(nextPhoto.url)) return;

      setOutgoingIndex(currentIndex);
      currentIndexRef.current = nextIndex;
      setIndex(nextIndex);

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        setOutgoingIndex(null);
        transitionTimerRef.current = null;
      }, 1600);
    }, 5000);
    return () => {
      window.clearInterval(timer);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [photos, active]);

  if (photos.length === 0) {
    return (
      <div
        className="w-full h-full"
        style={{
          background:
            "linear-gradient(170deg, #cac9bd 0%, #b8b7ab 50%, #aca9a0 100%)",
          filter: "contrast(1.05)",
        }}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-[#cac9bd]">
      {photos.map((photo, i) => {
        const nextIndex = (index + 1) % photos.length;
        const shouldRender =
          outgoingIndex === null
            ? i === index || i === nextIndex
            : i === outgoingIndex || i === index;
        if (!shouldRender) return null;

        return (
          <div
            key={photo.url}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
            style={{
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 1 : 0,
            }}
          >
            <Image
              src={photo.url}
              alt="Vincent Guanco"
              fill
              quality={60}
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
              style={{ filter: "contrast(1.05)" }}
              onLoad={() => {
                loadedUrlsRef.current.add(photo.url);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function About({ photos }: AboutProps): React.ReactElement {
  const { ref, hasApproached, isVisible } = useMediaViewport<HTMLElement>();
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen flex flex-col md:flex-row bg-[#F5F2ED] overflow-x-hidden"
    >
      {/* Left: Portrait carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 h-[480px] md:h-screen md:sticky md:top-0 overflow-hidden"
      >
        {hasApproached ? <PhotoCarousel photos={photos} active={isVisible} /> : null}
      </motion.div>

      {/* Right: Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 min-h-screen px-6 md:px-24 pt-16 md:pt-[180px] pb-24 flex flex-col"
      >
        <div className="max-w-xl">
          {/* Label with hairline */}
          <div className="mb-12">
            <span className="font-sans uppercase tracking-[0.3em] text-[10px] text-secondary font-semibold">
              ABOUT ME
            </span>
            <div className="mt-2 w-full h-px bg-[#babab0] opacity-20" />
          </div>

          {/* Headline */}
          <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl text-on-surface leading-tight tracking-tight mb-6 font-light">
            Vincent Guanco
          </h2>
          <p className="font-sans text-lg md:text-xl text-on-surface-variant font-light leading-relaxed mb-3">
            Photographer &nbsp;|&nbsp; Videographer
          </p>
          <p className="font-sans uppercase tracking-[0.3em] text-[10px] text-secondary font-semibold mb-16">
            Based in Paris
          </p>

          {/* Contact block */}
          <div
            id="contact"
            className="pt-10 border-t border-[#babab0]/30 space-y-10"
          >
            <div className="space-y-2">
              <span className="font-sans uppercase tracking-[0.3em] text-[10px] text-secondary font-semibold">
                Contact
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <span className="font-sans uppercase tracking-[0.25em] text-[9px] text-secondary">
                  Email
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="font-sans text-base md:text-lg text-on-surface hover:underline underline-offset-4 transition-all duration-300 break-all"
                >
                  {EMAIL}
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-sans uppercase tracking-[0.25em] text-[9px] text-secondary">
                  WhatsApp
                </span>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-base md:text-lg text-on-surface hover:underline underline-offset-4 transition-all duration-300"
                >
                  {WHATSAPP_DISPLAY}
                </a>
                <span className="font-sans text-[10px] text-on-surface-variant/80 font-light">
                  Discuss your project on WhatsApp
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-sans uppercase tracking-[0.25em] text-[9px] text-secondary">
                  Instagram
                </span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-base md:text-lg text-on-surface hover:underline underline-offset-4 transition-all duration-300 inline-flex items-center gap-2"
                >
                  @vincentguanco
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <div className="pt-12 mt-8 border-t border-[#babab0]/30">
              <p className="font-sans uppercase tracking-[0.25em] text-[9px] text-secondary font-light">
                Copyright &nbsp;|&nbsp; All rights reserved
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
