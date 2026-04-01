'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CollectionItem {
  readonly label: string;
  readonly stripCount: number;
}

interface CollectionCategory {
  readonly id: string;
  readonly title: string;
  readonly items: readonly CollectionItem[];
}

const COLLECTIONS: readonly CollectionCategory[] = [
  {
    id: 'photos',
    title: 'PHOTOS',
    items: [
      { label: 'Editorial', stripCount: 4 },
      { label: 'Brands', stripCount: 3 },
      { label: 'Portrait', stripCount: 2 },
      { label: 'Campaign', stripCount: 2 },
      { label: 'Personal', stripCount: 2 },
    ],
  },
  {
    id: 'videos',
    title: 'VIDEOS',
    items: [
      { label: 'Motion', stripCount: 2 },
      { label: 'Commercial', stripCount: 1 },
      { label: 'Documentary', stripCount: 2 },
    ],
  },
] as const;

function FilmStrip({ count }: { readonly count: number }): React.ReactElement {
  return (
    <div className="flex-grow flex justify-center gap-2 overflow-hidden px-8 opacity-0 translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-[60px] h-[45px] bg-surface-container-high shrink-0"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function CollectionRow({
  item,
  index,
}: {
  readonly item: CollectionItem;
  readonly index: number;
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex items-center h-[72px] border-b border-[#babab0]/10 pl-12 cursor-pointer hover:bg-surface-container-low transition-colors duration-300"
    >
      <span className="font-serif text-[22px] italic text-on-surface min-w-[140px]">
        {item.label}
      </span>
      <FilmStrip count={item.stripCount} />
      <span className="text-secondary ml-auto text-sm select-none shrink-0">→</span>
    </motion.div>
  );
}

export function Collections(): React.ReactElement {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: '-80px' });

  return (
    <section id="collections" className="min-h-screen pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Archive header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 32 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-24 flex flex-col md:flex-row justify-between items-baseline gap-4"
      >
        <h2 className="font-serif text-7xl md:text-8xl tracking-tighter leading-none italic opacity-90">
          Archive
        </h2>
        <p
          className="font-sans text-[10px] uppercase text-secondary max-w-xs leading-relaxed"
          style={{ letterSpacing: '0.4em' }}
        >
          A curation of editorial narratives and motion studies captured
          between Paris and Cannes.
        </p>
      </motion.div>

      {/* Collection categories */}
      <div className="flex flex-col gap-12">
        {COLLECTIONS.map((category) => (
          <div key={category.id}>
            {/* Category header row */}
            <div className="w-full flex justify-between items-center h-[80px] border-b border-[#babab0]/30">
              <span
                className="font-sans text-[11px] uppercase font-medium text-on-surface"
                style={{ letterSpacing: '0.4em' }}
              >
                {category.title}
              </span>
              <div className="flex items-center gap-6 font-mono text-[11px] text-secondary">
                <span>({String(category.items.length).padStart(2, '0')})</span>
                <span className="text-lg leading-none">+</span>
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-col">
              {category.items.map((item, i) => (
                <CollectionRow key={item.label} item={item} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Editorial quote */}
      <motion.div
        ref={quoteRef}
        initial={{ opacity: 0, y: 24 }}
        animate={quoteInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-48 grid grid-cols-1 md:grid-cols-12"
      >
        <blockquote className="md:col-start-7 md:col-span-6">
          <p className="font-serif text-3xl italic leading-tight text-on-surface-variant mb-6">
            &ldquo;Photography is not about what is seen, but about the space
            between the light and the silence.&rdquo;
          </p>
          <div className="w-20 h-px bg-[#babab0] mb-4" />
          <cite
            className="font-sans text-[10px] text-secondary not-italic"
            style={{ letterSpacing: '0.4em' }}
          >
            PARIS / 2024
          </cite>
        </blockquote>
      </motion.div>
    </section>
  );
}
