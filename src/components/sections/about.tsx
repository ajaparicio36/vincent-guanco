"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

export interface AboutPhoto {
  readonly url: string;
  readonly key: string;
}

interface AboutProps {
  readonly photos: readonly AboutPhoto[];
}

const WHATSAPP_NUMBER = "33651299359"; // +33 651 29 93 59, no + or spaces for wa.me
const WHATSAPP_DISPLAY = "+33 651 29 93 59";
const INSTAGRAM_URL = "https://www.instagram.com/vincentguanco/";
const EMAIL = "vincentguancostaes@gmail.com";

function PhotoCarousel({
  photos,
}: {
  readonly photos: readonly AboutPhoto[];
}): React.ReactElement {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

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
    <div className="relative w-full h-full">
      {photos.map((photo, i) => (
        <div
          key={photo.url}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={photo.url}
            alt="Vincent Guanco"
            fill
            unoptimized
            priority={i === 0}
            className="object-cover"
            style={{ filter: "contrast(1.05)" }}
          />
        </div>
      ))}
    </div>
  );
}

export function About({ photos }: AboutProps): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
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
        <PhotoCarousel photos={photos} />
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
