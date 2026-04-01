'use client';

import { motion } from 'framer-motion';

export function Hero(): React.ReactElement {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Hero image — TODO: swap with real fashion editorial portrait (4:5 or wider, grayscale-[0.2]) */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(160deg, #d4d3c7 0%, #c8c7bb 40%, #b8b7ab 100%)',
            filter: 'contrast(1.02)',
          }}
        />
        {/* Tonal overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fffcf7]/20 via-transparent to-[#fffcf7]/70 pointer-events-none" />
      </div>

      {/* Bottom-left editorial text */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-3 pointer-events-auto"
        >
          <div className="w-12 h-px bg-[#0e0e0c]/20" />
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#0e0e0c]/80 flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            Paris — April 2026
          </p>
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-[#0e0e0c] mt-4 opacity-90 max-w-2xl leading-tight tracking-tight">
            The Silent Curator
          </h1>
        </motion.div>

        {/* Scroll indicator — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-6 pointer-events-auto"
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
