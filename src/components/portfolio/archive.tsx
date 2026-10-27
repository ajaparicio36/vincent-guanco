"use client";

import { startTransition, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { scroll, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Grid2X2, Layers, Maximize2, Minimize2, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_WORK, type PortfolioWork } from "@/data/portfolio";
import type { PlaybackStatus, SpatialController } from "@/lib/spatial-gallery";
import { SpatialStage } from "./spatial-stage";
import { InlineFilm } from "./inline-film";

type GalleryMode = "spatial" | "flat";
function subscribeToMotion(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function motionPreference(): boolean { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function shuffleWorks(): readonly PortfolioWork[] {
  const works: PortfolioWork[] = [...PORTFOLIO_WORK];
  for (let index = works.length - 1; index > 0; index -= 1) {
    const destination = Math.floor(Math.random() * (index + 1));
    [works[index], works[destination]] = [works[destination], works[index]];
  }
  return works;
}
function WorkImage({ work, eager = false, detail = false }: { readonly work: PortfolioWork; readonly eager?: boolean; readonly detail?: boolean }): React.ReactElement {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="thumbnail-error">Image unavailable.</span> : (
    <Image src={detail ? work.src : work.thumbnail} alt={work.description} width={work.width} height={work.height}
      unoptimized loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
  );
}

export function Archive(): React.ReactElement {
  const reducedMotion = useSyncExternalStore(subscribeToMotion, motionPreference, () => false);
  const [works, setWorks] = useState<readonly PortfolioWork[]>(PORTFOLIO_WORK);
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState<GalleryMode>("spatial");
  const progress = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [instantPresentation, setInstantPresentation] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [playback, setPlayback] = useState<PlaybackStatus>("none");
  const [paused, setPaused] = useState<boolean | null>(null);
  const playbackRef = useRef<Pick<SpatialController, "setPaused"> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const instantSelection = useRef(false);
  const shuffledRef = useRef(false);
  const programmaticScrollRef = useRef<number | null>(null);
  const pendingNavigationRef = useRef<number | null>(null);
  const current = works[activeIndex];

  useEffect(() => {
    if (shuffledRef.current) return;
    shuffledRef.current = true;
    startTransition(() => { setWorks(shuffleWorks()); setInitialized(true); });
  }, []);

  const navigateTo = useCallback((index: number, instant = false): void => {
    const next = Math.max(0, Math.min(works.length - 1, index));
    instantSelection.current = instant;
    progress.set(next);
    setActiveIndex(next);
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return;
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
    const start = track.getBoundingClientRect().top + window.scrollY - headerHeight;
    const distance = track.offsetHeight - pin.offsetHeight;
    const top = start + next / Math.max(1, works.length - 1) * distance;
    programmaticScrollRef.current = top;
    window.scrollTo({ top, behavior: "instant" });
  }, [works.length, progress]);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (mode !== "spatial" || !initialized || !track || !pin) return;
    let start = 0;
    let distance = 1;
    const measure = (): void => {
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      start = track.getBoundingClientRect().top + window.scrollY - headerHeight;
      distance = Math.max(1, track.offsetHeight - pin.offsetHeight);
    };
    measure();
    // Motion owns the passive, frame-batched scroll subscription. Continuous progress
    // goes directly to Three.js; React only receives a change of selected work.
    const stop = scroll((_value, info) => {
      const next = Math.max(0, Math.min(1, (info.y.current - start) / distance)) * (works.length - 1);
      if (programmaticScrollRef.current === null || Math.abs(info.y.current - programmaticScrollRef.current) > 2) instantSelection.current = false;
      progress.set(next);
      setActiveIndex(previous => previous === Math.round(next) ? previous : Math.round(next));
    });
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    observer.observe(track);
    let frame = 0;
    if (pendingNavigationRef.current !== null) {
      const next = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      frame = requestAnimationFrame(() => navigateTo(next, true));
    }
    return () => { stop(); observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [mode, initialized, works.length, navigateTo, progress]);

  function chooseMode(next: GalleryMode): void {
    if (next === mode) return;
    if (next === "spatial") pendingNavigationRef.current = activeIndex;
    else document.getElementById("work")?.scrollIntoView({ behavior: "instant", block: "start" });
    setMode(next);
    setStageReady(false);
    setNotice(null);
  }
  function fallback(): void {
    setMode("flat");
    setNotice("The spatial view is unavailable. Explore the complete archive below.");
    document.getElementById("work")?.scrollIntoView({ behavior: "instant", block: "start" });
  }
  function togglePlayback(): void {
    const nextPaused = playback === "playing";
    // Keep play() inside the click/keydown stack for mobile autoplay policies.
    playbackRef.current?.setPaused(nextPaused, !nextPaused);
    setPaused(nextPaused);
  }
  function inspectWork(instant = false): void {
    setInstantPresentation(instant);
    setInspecting(value => !value);
  }
  const toolbar = (
    <div className="archive-toolbar">
      <h1 id="archive-heading" className="archive-summary">Selected work <span>Photography &amp; films</span></h1>
      <div className="gallery-options">
        {mode === "spatial" && !reducedMotion && <Button variant="ghost" className="motion-control" aria-label={motionPaused ? "Resume motion" : "Pause motion"}
          aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play size={12} /> : <Pause size={12} />}<span>Motion</span></Button>}
        <div className="view-switch" role="group" aria-label="Gallery view">
          <Button variant="ghost" aria-pressed={mode === "spatial"} onClick={() => chooseMode("spatial")}><Layers size={14} strokeWidth={1.5} />Stack</Button>
          <Button variant="ghost" aria-pressed={mode === "flat"} onClick={() => chooseMode("flat")}><Grid2X2 size={14} strokeWidth={1.5} />Flat view</Button>
        </div>
      </div>
    </div>
  );
  if (!current) return <section id="work" className="archive-empty"><h1>Selected work</h1><p>The portfolio is being updated. Please visit again soon.</p><a href="#contact">Contact Vincent</a></section>;
  return (
    <section id="work" className="archive" aria-labelledby="archive-heading">
      <span id="collections" className="anchor-marker" />
      {notice && <p className="archive-notice" role="status">{notice}</p>}
      {mode === "spatial" ? (
        <div ref={trackRef} className="spatial-scroll-track" style={{ "--work-count": works.length } as CSSProperties}>
          <div ref={pinRef} className="gallery-pin">
            {toolbar}
            <div className="spatial-viewport" data-inspecting={inspecting} role="region" aria-label="Spatial archive" aria-describedby="gallery-instructions" tabIndex={0}
              onKeyDown={event => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigateTo(activeIndex + (event.key === "ArrowLeft" ? -1 : 1), true); }
                if (event.key === "Home") { event.preventDefault(); navigateTo(0, true); }
                if (event.key === "End") { event.preventDefault(); navigateTo(works.length - 1, true); }
                if (event.key === "Enter") { event.preventDefault(); inspectWork(true); }
                if (event.key === "Escape") { setInstantPresentation(true); setInspecting(false); }
                if (event.key === " " && current.kind === "video") { event.preventDefault(); togglePlayback(); }
              }}>
              {!stageReady && <div className="spatial-placeholder"><div className="placeholder-image"><WorkImage key={current.id} work={current} eager /></div><span className="spatial-loading" role="status">Preparing gallery</span></div>}
              {initialized && <SpatialStage works={works} progress={progress} instantSelection={instantSelection} reducedMotion={reducedMotion}
                inspecting={inspecting} instantPresentation={instantPresentation} motionPaused={motionPaused}
                paused={paused ?? false} playbackRef={playbackRef} ready={stageReady} onFocus={index => { setActiveIndex(index); setPaused(null); }}
                onNavigate={index => navigateTo(index)} onInspect={() => inspectWork()} onPlayback={setPlayback} onReady={() => setStageReady(true)} onError={fallback} />}
            </div>
            <div className="archive-caption">
              <div className="current-work" aria-live="polite" aria-atomic="true">
                <span className="work-number">{String(activeIndex + 1).padStart(2, "0")} / {works.length}</span>
                <div><h2>{current.title}</h2><p>{current.kind === "video" ? "Film / " + current.duration : "Photography"}</p></div>
              </div>
              <p id="gallery-instructions" className="gallery-instructions">Scroll or drag to browse<span>Enter to view. Escape to return.</span></p>
              <div className="archive-actions">
                <Button variant="ghost" className="inspect-control" aria-pressed={inspecting} onClick={event => inspectWork(event.detail === 0)}>
                  {inspecting ? <Minimize2 size={14} /> : <Maximize2 size={14} />}<span>{inspecting ? "Back to stack" : "View work"}</span>
                </Button>
                {current.kind === "video" && <Button variant="ghost" className="playback-control" onClick={togglePlayback}
                  aria-label={playback === "playing" ? "Pause film" : playback === "error" ? "Retry film" : "Play film"}>
                  {playback === "playing" ? <Pause size={14} /> : playback === "error" ? <RotateCcw size={14} /> : <Play size={14} />}
                  <span>{playback === "playing" ? "Pause" : playback === "loading" ? "Loading film" : playback === "error" ? "Retry film" : "Play film"}</span>
                </Button>}
                <div className="work-navigation">
                  <Button variant="ghost" className="square-control" aria-label="Previous work" disabled={activeIndex === 0} onClick={event => navigateTo(activeIndex - 1, event.detail === 0)}><ArrowLeft size={18} strokeWidth={1.5} /></Button>
                  <Button variant="ghost" className="square-control" aria-label="Next work" disabled={activeIndex === works.length - 1} onClick={event => navigateTo(activeIndex + 1, event.detail === 0)}><ArrowRight size={18} strokeWidth={1.5} /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : <>{toolbar}<div className="flat-archive" role="list" aria-label="Complete archive">
        {works.map(work => <article key={work.id} className="flat-work" role="listitem" data-work-id={work.id}>
          {work.kind === "video" ? <InlineFilm work={work} /> : <div className="flat-image"><WorkImage work={work} detail /></div>}
          <div className="flat-caption"><h2>{work.title}</h2><span>{work.kind === "video" ? "Film / " + work.duration : "Photography"}</span></div>
        </article>)}
      </div></>}
    </section>
  );
}
