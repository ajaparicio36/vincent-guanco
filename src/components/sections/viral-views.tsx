"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion, useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ViralVideo {
  readonly url: string;
  readonly key: string;
}

interface ViralViewsProps {
  readonly videos: readonly ViralVideo[];
}

type SlotPosition = "top" | "middle" | "bottom";

interface TileProps {
  readonly video: ViralVideo;
  readonly position: SlotPosition;
  readonly isActive: boolean;
  readonly videoRef: RefObject<HTMLVideoElement | null>;
  readonly onEnded: () => void;
}

const POSITION_OFFSETS: Record<SlotPosition, string> = {
  top: "md:translate-x-[22%]",
  middle: "md:translate-x-[28%] md:scale-[1.12] md:-translate-y-[50%] z-100",
  bottom: "md:translate-x-[22%] md:-translate-y-[100%]",
};

function Tile({
  video,
  position,
  isActive,
  videoRef,
  onEnded,
}: TileProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.currentTime = 0;
      void el.play().catch(() => {
        /* autoplay blocked — first frame will still show */
      });
    } else {
      el.pause();
    }
  }, [isActive, videoRef]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`flex-1 md:flex-initial md:w-full flex ${position === "middle" ? "md:justify-start justify-center" : "justify-center"} ${isMobile ? "" : POSITION_OFFSETS[position]}`}
    >
      <div
        ref={containerRef}
        className="relative aspect-[9/16] bg-surface-container-high overflow-hidden w-full md:w-auto md:h-[32vh] md:max-h-[420px]"
      >
        <video
          ref={videoRef}
          src={video.url}
          muted
          playsInline
          preload="metadata"
          onEnded={onEnded}
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}

export function ViralViews({ videos }: ViralViewsProps): React.ReactElement {
  // Play order is fixed: video[0] first (middle), then video[1] (top),
  // then video[2] (bottom). Each freezes on last frame (no loop).
  const middleRef = useRef<HTMLVideoElement | null>(null);
  const topRef = useRef<HTMLVideoElement | null>(null);
  const bottomRef = useRef<HTMLVideoElement | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, {
    once: true,
    margin: "-30% 0px -30% 0px",
  });

  // Derive the currently-playing index from "how many have finished" + whether
  // the section is on-screen. Keeps state minimal and avoids effect-triggered
  // state updates.
  const [finishedCount, setFinishedCount] = useState(0);
  const playIndex = sectionInView ? finishedCount : -1;

  const handleEnded = useCallback((finished: number) => {
    setFinishedCount((prev) => (prev === finished ? finished + 1 : prev));
  }, []);

  if (videos.length === 0) return <></>;

  // Slot assignment: videos[0] → middle (plays first), [1] → top, [2] → bottom.
  const middle = videos[0];
  const top = videos[1];
  const bottom = videos[2];

  const stats = (
    <div className="grid grid-cols-3 md:grid-cols-1 gap-6 md:gap-10">
      <div className="flex flex-col gap-1 md:gap-2">
        <span className="font-sans uppercase tracking-[0.25em] text-[8px] md:text-[9px] text-secondary">
          Total Views
        </span>
        <span className="font-sans text-2xl md:text-5xl text-on-surface font-light tracking-tight">
          28M+
        </span>
      </div>
      <div className="flex flex-col gap-1 md:gap-2">
        <span className="font-sans uppercase tracking-[0.25em] text-[8px] md:text-[9px] text-secondary">
          Followers
        </span>
        <span className="font-sans text-2xl md:text-5xl text-on-surface font-light tracking-tight">
          33K+
        </span>
      </div>
      <div className="flex flex-col gap-1 md:gap-2">
        <span className="font-sans uppercase tracking-[0.25em] text-[8px] md:text-[9px] text-secondary">
          Likes
        </span>
        <span className="font-sans text-2xl md:text-5xl text-on-surface font-light tracking-tight">
          1M+
        </span>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-16 px-6 md:px-12 bg-background overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-12 md:items-start md:justify-center">
        {/* Mobile: stats on top */}
        <div className="md:hidden w-full border-t border-b border-[#babab0]/30 py-6">
          <span className="font-sans uppercase tracking-[0.3em] text-[9px] text-secondary mb-4 block">
            Signature Metrics
          </span>
          {stats}
        </div>

        {/* Video row on mobile, asymmetric stack on desktop. */}
        <div className="w-full md:w-[440px] md:flex-none flex flex-row md:flex-col items-start md:items-center gap-2 md:gap-6 min-w-0">
          {top ? (
            <Tile
              video={top}
              position="top"
              isActive={playIndex === 1}
              videoRef={topRef}
              onEnded={() => handleEnded(1)}
            />
          ) : null}
          {middle ? (
            <Tile
              video={middle}
              position="middle"
              isActive={playIndex === 0}
              videoRef={middleRef}
              onEnded={() => handleEnded(0)}
            />
          ) : null}
          {bottom ? (
            <Tile
              video={bottom}
              position="bottom"
              isActive={playIndex === 2}
              videoRef={bottomRef}
              onEnded={() => handleEnded(2)}
            />
          ) : null}
        </div>

        {/* Desktop: stats on right, sticky aligned */}
        <aside className="hidden md:block md:w-[220px] md:flex-none md:sticky md:top-32 md:self-start md:pl-8 md:border-l md:border-[#babab0]/30">
          <span className="font-sans uppercase tracking-[0.3em] text-[9px] text-secondary mb-8 block">
            Signature Metrics
          </span>
          {stats}
        </aside>
      </div>
    </section>
  );
}
