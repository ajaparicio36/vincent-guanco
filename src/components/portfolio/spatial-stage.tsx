"use client";

import { useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import type { MotionValue } from "framer-motion";
import type { PortfolioWork } from "@/data/portfolio";
import type { PlaybackStatus, SpatialController } from "@/lib/spatial-gallery";

interface SpatialStageProps {
  readonly works: readonly PortfolioWork[];
  readonly progress: MotionValue<number>;
  readonly instantSelection: RefObject<boolean>;
  readonly reducedMotion: boolean;
  readonly inspecting: boolean;
  readonly motionPaused: boolean;
  readonly instantPresentation: boolean;
  readonly paused: boolean;
  readonly playbackRef: RefObject<Pick<SpatialController, "setPaused"> | null>;
  readonly ready: boolean;
  readonly onFocus: (index: number) => void;
  readonly onNavigate: (index: number) => void;
  readonly onInspect: () => void;
  readonly onPlayback: (status: PlaybackStatus) => void;
  readonly onReady: () => void;
  readonly onError: () => void;
}
export function SpatialStage(props: SpatialStageProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SpatialController | null>(null);
  const callbacksRef = useRef(props);
  useImperativeHandle(props.playbackRef, () => ({
    setPaused: (paused: boolean, retry = false): void => controllerRef.current?.setPaused(paused, retry),
  }), []);
  useEffect(() => { callbacksRef.current = props; }, [props]);
  useEffect(() => {
    return props.progress.on("change", value => controllerRef.current?.setProgress(value, props.instantSelection.current));
  }, [props.progress, props.instantSelection]);
  useEffect(() => {
    controllerRef.current?.setPresentation(props.inspecting, props.motionPaused, props.instantPresentation);
  }, [props.inspecting, props.motionPaused, props.instantPresentation]);
  useEffect(() => {
    controllerRef.current?.setReducedMotion(props.reducedMotion);
  }, [props.reducedMotion]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    import("@/lib/spatial-gallery").then(({ createSpatialGallery }) => {
      if (cancelled) return;
      controllerRef.current = createSpatialGallery({
        canvas, works: props.works,
        initialProgress: callbacksRef.current.progress.get(),
        reducedMotion: callbacksRef.current.reducedMotion,
        paused: callbacksRef.current.paused,
        inspecting: callbacksRef.current.inspecting,
        motionPaused: callbacksRef.current.motionPaused,
        onFocus: index => callbacksRef.current.onFocus(index),
        onNavigate: index => callbacksRef.current.onNavigate(index),
        onInspect: () => callbacksRef.current.onInspect(),
        onPlayback: status => callbacksRef.current.onPlayback(status),
        onReady: () => callbacksRef.current.onReady(),
        onError: () => callbacksRef.current.onError(),
      });
    }).catch(() => { if (!cancelled) callbacksRef.current.onError(); });
    return () => {
      cancelled = true;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [props.works]);
  return <canvas ref={canvasRef} className="spatial-canvas" data-ready={props.ready} aria-hidden="true" />;
}
