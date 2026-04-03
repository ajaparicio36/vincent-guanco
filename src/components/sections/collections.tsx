"use client";

import {
  useRef,
  useEffect,
  useState,
  startTransition,
  useCallback,
} from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  VIDEO_CATEGORIES,
  PHOTO_CATEGORIES,
  type MediaCategory,
} from "@/data/media-map";
import { useCategoryMedia } from "@/hooks/use-category-media";
import { useNavigation } from "@/contexts/navigation-context";

const PAGE_SIZE_PHOTO = 4;
const PAGE_SIZE_VIDEO = 2;

function isWideVideo(key: string): boolean {
  const withoutExt = key.replace(/\.[^.]+$/, "");
  return withoutExt.endsWith("_16_9");
}

interface MediaItemProps {
  readonly item: { readonly key: string; readonly url: string };
  readonly isWide: boolean;
  readonly type: "photo" | "video";
  readonly displayName: string;
}

function MediaItem({
  item,
  isWide,
  type,
  displayName,
}: MediaItemProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-surface-container-high ${
        isWide ? "md:col-span-2 aspect-video" : "aspect-[4/5]"
      }`}
    >
      {!loaded && type === "photo" && (
        <div className="absolute inset-0 animate-pulse bg-surface-container-high" />
      )}
      {type === "photo" ? (
        <Image
          src={item.url}
          alt={displayName}
          fill
          unoptimized
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      ) : (
        <video
          src={item.url}
          muted
          playsInline
          loop
          autoPlay
          className="w-full h-full object-cover"
          style={{ objectPosition: isWide ? "center center" : "center 25%" }}
        />
      )}
    </div>
  );
}

function CategoryMediaGrid({
  category,
  isOpen,
}: {
  readonly category: MediaCategory;
  readonly isOpen: boolean;
}): React.ReactElement {
  const { items, loading, error } = useCategoryMedia(
    category.type,
    category.slug,
    isOpen,
  );
  const [visibleCount, setVisibleCount] = useState(
    category.type === "video" ? PAGE_SIZE_VIDEO : PAGE_SIZE_PHOTO,
  );

  // Reset visible count when accordion closes/reopens
  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setVisibleCount(
          category.type === "video" ? PAGE_SIZE_VIDEO : PAGE_SIZE_PHOTO,
        );
      });
    }
  }, [isOpen, category.type]);

  if (!isOpen) return <></>;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-surface-container-high animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="py-6 font-sans text-sm text-secondary">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="py-6 font-sans text-sm text-secondary">
        No media available.
      </p>
    );
  }

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const pageSize =
    category.type === "video" ? PAGE_SIZE_VIDEO : PAGE_SIZE_PHOTO;

  const isSingleItem = visible.length === 1;

  return (
    <div className="py-6">
      <div
        className={`grid gap-4 ${
          isSingleItem
            ? "grid-cols-1 max-w-md mx-auto"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {visible.map((item) => {
          const isWide = category.type === "video" && isWideVideo(item.key);

          return (
            <MediaItem
              key={item.key}
              item={item}
              isWide={isWide}
              type={category.type}
              displayName={category.displayName}
            />
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + pageSize)}
          className="mt-8 w-full flex items-center justify-center gap-3 py-4 border-t border-[#babab0]/20 font-sans text-[10px] uppercase tracking-[0.3em] text-secondary hover:text-on-surface transition-colors duration-300 cursor-pointer"
        >
          Show More
          <span className="font-mono text-[11px]">
            ({visible.length}/{items.length})
          </span>
        </button>
      )}
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
  openSlugs,
  onValueChange,
}: {
  readonly title: string;
  readonly categories: readonly MediaCategory[];
  readonly openSlugs: Set<string>;
  readonly onValueChange: (value: string[]) => void;
}): React.ReactElement {
  const handleValueChange = useCallback(
    (newValue: string[]) => {
      // Find newly opened items to scroll into view
      const newlyOpened = newValue.filter((v) => !openSlugs.has(v));
      onValueChange(newValue);

      if (newlyOpened.length > 0) {
        // Scroll the newly opened accordion item into view
        requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-accordion-key="${newlyOpened[0]}"]`,
          );
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    },
    [openSlugs, onValueChange],
  );

  return (
    <div>
      {/* Category group header */}
      <div className="w-full flex justify-between items-center h-[80px] border-b border-[#babab0]/30">
        <span
          className="font-sans text-[11px] uppercase font-medium text-on-surface"
          style={{ letterSpacing: "0.4em" }}
        >
          {title}
        </span>
        <span className="font-mono text-[11px] text-secondary">
          ({String(categories.length).padStart(2, "0")})
        </span>
      </div>

      <Accordion
        value={Array.from(openSlugs)}
        onValueChange={handleValueChange}
        multiple
      >
        {categories.map((cat) => {
          const key = `${cat.type}-${cat.slug}`;
          const isOpen = openSlugs.has(key);
          return (
            <AccordionItem key={key} value={key} data-accordion-key={key}>
              <AccordionTrigger className="h-[72px] pl-6 md:pl-12 border-b border-[#babab0]/10 hover:bg-surface-container-low transition-colors duration-300 hover:no-underline">
                <span className="font-serif text-[22px] text-on-surface">
                  {cat.displayName}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 md:px-12">
                <CategoryMediaGrid category={cat} isOpen={isOpen} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export function Collections(): React.ReactElement {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-80px" });

  const { activeCategory, setActiveCategory } = useNavigation();
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set());

  const handleValueChange = useCallback((newValue: string[]) => {
    setOpenSlugs(new Set(newValue));
  }, []);

  // Handle navigation context target
  useEffect(() => {
    if (!activeCategory) return;

    startTransition(() => {
      setOpenSlugs((prev) => {
        const next = new Set(prev);
        next.add(activeCategory);
        return next;
      });
    });

    // Clear the active category after opening
    const timer = setTimeout(() => setActiveCategory(null), 100);
    return () => clearTimeout(timer);
  }, [activeCategory, setActiveCategory]);

  return (
    <section
      id="collections"
      className="min-h-screen pt-24 md:pt-32 pb-24 md:pb-40 px-4 md:px-12 max-w-7xl mx-auto"
    >
      {/* Archive header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 32 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-24 flex flex-col md:flex-row justify-between items-baseline gap-4"
      >
        <h2 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-tighter leading-none opacity-90">
          Archive
        </h2>
        <p
          className="font-sans text-[10px] uppercase text-secondary max-w-xs leading-relaxed"
          style={{ letterSpacing: "0.4em" }}
        >
          A curation of editorial narratives and motion studies captured between
          Paris and Cannes.
        </p>
      </motion.div>

      {/* Collection categories */}
      <div className="flex flex-col gap-12">
        <CategoryGroup
          title="PHOTOS"
          categories={PHOTO_CATEGORIES}
          openSlugs={openSlugs}
          onValueChange={handleValueChange}
        />
        <CategoryGroup
          title="VIDEOS"
          categories={VIDEO_CATEGORIES}
          openSlugs={openSlugs}
          onValueChange={handleValueChange}
        />
      </div>

      {/* Editorial quote */}
      {/* <motion.div
        ref={quoteRef}
        initial={{ opacity: 0, y: 24 }}
        animate={quoteInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-48 grid grid-cols-1 md:grid-cols-12"
      >
        <blockquote className="md:col-start-7 md:col-span-6">
          <p className="font-serif text-3xl leading-tight text-on-surface-variant mb-6">
            &ldquo;Photography is not about what is seen, but about the space
            between the light and the silence.&rdquo;
          </p>
          <div className="w-20 h-px bg-[#babab0] mb-4" />
          <cite
            className="font-sans text-[10px] text-secondary not-italic"
            style={{ letterSpacing: "0.4em" }}
          >
            PARIS / 2024
          </cite>
        </blockquote>
      </motion.div> */}
    </section>
  );
}
