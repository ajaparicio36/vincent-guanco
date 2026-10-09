"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface MediaViewport<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly hasApproached: boolean;
  readonly isVisible: boolean;
}

/** Load once just ahead of scrolling; visibility controls playback, never source removal. */
export function useMediaViewport<T extends HTMLElement>(enabled = true): MediaViewport<T> {
  const ref = useRef<T>(null);
  const [hasApproached, setHasApproached] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;
    const update = (): void => {
      const bounds = element.getBoundingClientRect();
      const visible = document.visibilityState !== "hidden" && bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
      setIsVisible(visible);
      if (bounds.bottom > -300 && bounds.top < window.innerHeight + 300) {
        setHasApproached(true);
      }
    };
    const frame = window.requestAnimationFrame(update);
    document.addEventListener("visibilitychange", update);
    if (typeof IntersectionObserver === "undefined") {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update, { passive: true });
      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        document.removeEventListener("visibilitychange", update);
      };
    }
    const nearObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setHasApproached(true);
        nearObserver.disconnect();
      }
    }, { rootMargin: "300px" });
    const visibleObserver = new IntersectionObserver(([entry]) => {
      setIsVisible(document.visibilityState !== "hidden" && Boolean(entry?.isIntersecting));
    });
    nearObserver.observe(element);
    visibleObserver.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      nearObserver.disconnect();
      visibleObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled]);

  return { ref, hasApproached, isVisible: enabled && isVisible };
}
