'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function About(): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen flex flex-col md:flex-row bg-[#F5F2ED]"
    >
      {/* Left: Portrait image */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 h-[480px] md:h-screen md:sticky md:top-0 overflow-hidden"
      >
        {/* TODO: swap with photographer portrait — 4:5 aspect, natural soft lighting, warm analog aesthetic */}
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(170deg, #cac9bd 0%, #b8b7ab 50%, #aca9a0 100%)',
            filter: 'contrast(1.05)',
          }}
        />
      </motion.div>

      {/* Right: Content */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 min-h-screen px-8 md:px-24 pt-16 md:pt-[180px] pb-24 flex flex-col"
      >
        <div className="max-w-xl">
          {/* Label with hairline */}
          <div className="mb-12">
            <span className="font-sans uppercase tracking-[0.3em] text-[10px] text-secondary font-semibold">
              ABOUT
            </span>
            <div className="mt-2 w-full h-px bg-[#babab0] opacity-20" />
          </div>

          {/* Headline */}
          <h2 className="font-serif italic text-5xl md:text-7xl text-on-surface leading-tight tracking-tight mb-16">
            Vincent Guanco
          </h2>

          {/* Bio */}
          <div className="space-y-10">
            <p className="font-sans text-lg md:text-xl text-on-surface-variant font-light leading-relaxed">
              Based in Paris, Vincent Guanco specializes in high-fashion
              portraiture and editorial narratives. His work frequently traverses
              the distance between the historic arrondissements of the capital
              and the luminous shores of Cannes, documenting the quiet elegance
              of modern luxury through an analog lens.
            </p>
            <p className="font-sans text-lg md:text-xl text-on-surface-variant font-light leading-relaxed">
              His approach is rooted in technical precision and intimate energy.
              By favoring film over digital, he captures an organic warmth and
              grain that digital sensors cannot replicate — creating images that
              feel less like captures and more like lived experiences.
            </p>
          </div>

          {/* Action links */}
          <div className="mt-24 flex gap-12">
            <a
              href="#"
              className="font-sans uppercase tracking-[0.2em] text-[10px] text-on-surface font-semibold hover:underline underline-offset-8 transition-all duration-300"
            >
              Instagram ↗
            </a>
            <a
              href="#contact"
              className="font-sans uppercase tracking-[0.2em] text-[10px] text-on-surface font-semibold hover:underline underline-offset-8 transition-all duration-300"
            >
              Contact ↗
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
