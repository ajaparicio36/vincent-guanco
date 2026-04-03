"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lazy-loads MediaPipe Face Detector, samples a single frame from each video,
 * and returns a Map of videoUrl → CSS `object-position` string that centers
 * on detected faces. Falls back to the provided default when no face is found.
 *
 * - Model + WASM loaded from jsDelivr CDN (zero hosting cost)
 * - ~1.2 MB model, cached by browser after first load
 * - One-time detection per video — negligible CPU
 */

interface FaceCenterMap {
  readonly positions: ReadonlyMap<string, string>;
  readonly ready: boolean;
}

const DEFAULT_POSITION = "center 30%";

/** Clamp a percentage so object-position never reveals black bars. */
function clampPercent(value: number, min = 5, max = 95): number {
  return Math.min(max, Math.max(min, value));
}

export function useFaceCenter(
  videoUrls: readonly string[],
  fallback: string = DEFAULT_POSITION,
): FaceCenterMap {
  const [positions, setPositions] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [ready, setReady] = useState(false);
  const processedRef = useRef<Set<string>>(new Set());

  const detectFace = useCallback(
    async (videoUrl: string): Promise<string> => {
      try {
        const { FaceDetector, FilesetResolver } =
          await import("@mediapipe/tasks-vision");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm",
        );

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.5,
        });

        // Create a temporary video element to capture a frame
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = videoUrl;

        const position = await new Promise<string>((resolve) => {
          const timeout = setTimeout(() => {
            video.remove();
            resolve(fallback);
          }, 8000);

          video.addEventListener(
            "loadeddata",
            () => {
              // Seek slightly in to avoid potential black lead-in frames
              video.currentTime = Math.min(0.5, video.duration * 0.1);
            },
            { once: true },
          );

          video.addEventListener(
            "seeked",
            () => {
              clearTimeout(timeout);

              try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  video.remove();
                  resolve(fallback);
                  return;
                }
                ctx.drawImage(video, 0, 0);

                const imageData = ctx.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height,
                );

                // Check if the frame is mostly black (bad frame)
                let totalBrightness = 0;
                const sampleStep = 100; // sample every 100th pixel for speed
                let sampleCount = 0;
                for (
                  let i = 0;
                  i < imageData.data.length;
                  i += 4 * sampleStep
                ) {
                  totalBrightness +=
                    imageData.data[i]! +
                    imageData.data[i + 1]! +
                    imageData.data[i + 2]!;
                  sampleCount++;
                }
                const avgBrightness = totalBrightness / (sampleCount * 3);

                if (avgBrightness < 10) {
                  // Frame too dark, try a later time
                  video.currentTime = Math.min(2, video.duration * 0.25);
                  video.addEventListener(
                    "seeked",
                    () => {
                      ctx.drawImage(video, 0, 0);
                      const result = detectFromCanvas(
                        detector,
                        canvas,
                        video.videoWidth,
                        video.videoHeight,
                        fallback,
                      );
                      detector.close();
                      video.remove();
                      resolve(result);
                    },
                    { once: true },
                  );
                  return;
                }

                const result = detectFromCanvas(
                  detector,
                  canvas,
                  video.videoWidth,
                  video.videoHeight,
                  fallback,
                );
                detector.close();
                video.remove();
                resolve(result);
              } catch {
                video.remove();
                resolve(fallback);
              }
            },
            { once: true },
          );

          video.load();
        });

        return position;
      } catch {
        return fallback;
      }
    },
    [fallback],
  );

  useEffect(() => {
    if (videoUrls.length === 0) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const run = async (): Promise<void> => {
      const newPositions = new Map<string, string>();

      // Process sequentially to avoid loading multiple detector instances
      for (const url of videoUrls) {
        if (cancelled) return;
        if (processedRef.current.has(url)) continue;

        const position = await detectFace(url);
        if (cancelled) return;

        processedRef.current.add(url);
        newPositions.set(url, position);
      }

      if (!cancelled && newPositions.size > 0) {
        setPositions((prev) => {
          const merged = new Map(prev);
          for (const [k, v] of newPositions) {
            merged.set(k, v);
          }
          return merged;
        });
      }

      if (!cancelled) {
        setReady(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [videoUrls, detectFace]);

  return { positions, ready };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface FaceDetectorLike {
  detect(image: HTMLCanvasElement): {
    detections: ReadonlyArray<{
      boundingBox?: {
        originX: number;
        originY: number;
        width: number;
        height: number;
      };
    }>;
  };
}

function detectFromCanvas(
  detector: FaceDetectorLike,
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  fallback: string,
): string {
  const { detections } = detector.detect(canvas);

  if (detections.length === 0) return fallback;

  // Compute the average center of all detected faces (weighted equally)
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (const det of detections) {
    const box = det.boundingBox;
    if (!box) continue;
    sumX += box.originX + box.width / 2;
    sumY += box.originY + box.height / 2;
    count++;
  }

  if (count === 0) return fallback;

  const centerXPercent = clampPercent((sumX / count / videoWidth) * 100);
  const centerYPercent = clampPercent((sumY / count / videoHeight) * 100);

  return `${centerXPercent.toFixed(1)}% ${centerYPercent.toFixed(1)}%`;
}
