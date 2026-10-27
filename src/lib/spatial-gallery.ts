import * as THREE from "three";
import type { PortfolioWork } from "@/data/portfolio";

export type PlaybackStatus = "none" | "loading" | "playing" | "paused" | "blocked" | "error";
interface SceneOptions {
  readonly canvas: HTMLCanvasElement;
  readonly works: readonly PortfolioWork[];
  readonly initialProgress: number;
  readonly reducedMotion: boolean;
  readonly paused: boolean;
  readonly inspecting: boolean;
  readonly motionPaused: boolean;
  readonly onFocus: (index: number) => void;
  readonly onNavigate: (index: number) => void;
  readonly onInspect: () => void;
  readonly onPlayback: (status: PlaybackStatus) => void;
  readonly onReady: () => void;
  readonly onError: () => void;
}
export interface SpatialController {
  setProgress: (progress: number, instant?: boolean) => void;
  setPaused: (paused: boolean, retry?: boolean) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setPresentation: (inspecting: boolean, motionPaused: boolean, instant?: boolean) => void;
  dispose: () => void;
}
interface PlaneSlot {
  readonly mesh: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  texture: THREE.Texture | null;
}
interface ActiveVideo {
  readonly index: number;
  readonly element: HTMLVideoElement;
  readonly texture: THREE.VideoTexture;
  readonly events: AbortController;
}
interface ProjectedCorner {
  readonly x: number;
  readonly depth: number;
  readonly weight: number;
}
const BACKGROUND = 0x080808;
const FRAME_INTERVAL = 1000 / 30;
// Parallel planes form a compact volume; a common yaw exposes the depth.
const PLACEMENTS = [
  [0, 0, 2.2], [1.65, 0.48, 1.35], [-1.68, 0.8, 0.95],
  [0.18, 1.55, 0.25], [-0.9, -1.4, -0.15], [2.25, -0.8, -0.55],
  [-2.25, -0.55, -0.85], [-1.55, 1.5, -1.15], [0.95, -1.6, -1.4],
  [1.8, 1.35, -1.7], [-1.85, -1.15, -1.95], [0.35, 1.9, -2.25], [0.9, -1.7, -2.5],
] as const;

export function galleryCameraDistances(aspect: number, width: number, height: number, fieldOfView: number): { expanded: number; focused: number } {
  const tangent = Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));
  // Fit the active plane, allowing peripheral cards to bleed beyond the stage.
  // Reserve its full silhouette through idle yaw/pitch and floating extrema.
  const activeFit = Math.max(
    (width / 2 + 0.13) / (tangent * aspect * 0.9),
    (height / 2 + 0.16) / (tangent * 0.9),
  ) + width / 2 * Math.sin(0.44) + height / 2 * Math.sin(0.025) + 2.2 + 0.38;
  return {
    expanded: Math.max(16.4, 7.44 / (2 * tangent * aspect), activeFit),
    focused: Math.max(height * 1.22 / (2 * tangent), width * 1.2 / (2 * tangent * aspect)) + 2.2,
  };
}

function compositionOffset(corners: readonly ProjectedCorner[], target: number): number {
  const midpoint = (offset: number): number => {
    let left = Infinity;
    let right = -Infinity;
    for (const corner of corners) {
      const x = (corner.x + offset * corner.weight) / corner.depth;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
    return (left + right) / 2;
  };
  if (Math.abs(midpoint(0) - target) < 0.00001) return 0;
  let left = -8;
  let right = 8;
  // The stationary active plane can own both edges during focus.
  if (midpoint(left) > target || midpoint(right) < target) return 0;
  for (let step = 0; step < 18; step += 1) {
    const middle = (left + right) / 2;
    if (midpoint(middle) < target) left = middle;
    else right = middle;
  }
  return (left + right) / 2;
}

function roundedPlane(width: number, height: number): THREE.ShapeGeometry {
  const x = -width / 2;
  const y = -height / 2;
  const radius = Math.min(width, height) * 0.035;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < positions.count; index += 1) {
    uv.setXY(index, positions.getX(index) / width + 0.5, positions.getY(index) / height + 0.5);
  }
  return geometry;
}
function placement(relative: number): readonly [number, number, number] {
  const distance = Math.min(6, Math.abs(relative));
  const lower = Math.floor(distance);
  const upper = Math.min(6, lower + 1);
  const slot = (value: number): number => value === 0 ? 0 : value * 2 - (relative > 0 ? 1 : 0);
  const from = PLACEMENTS[slot(lower)];
  const to = PLACEMENTS[slot(upper)];
  const blend = distance - lower;
  return [THREE.MathUtils.lerp(from[0], to[0], blend), THREE.MathUtils.lerp(from[1], to[1], blend), THREE.MathUtils.lerp(from[2], to[2], blend)];
}

/** A bounded image deck; only the selected film owns a decoder. */
export function createSpatialGallery(options: SceneOptions): SpatialController {
  const { canvas, works, onFocus, onNavigate, onInspect, onPlayback, onReady, onError } = options;
  let reducedMotion = options.reducedMotion;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BACKGROUND, 1);
  const scene = new THREE.Scene();
  const deck = new THREE.Group();
  const frontAnchor = new THREE.Vector3(0, 0, 2.2);
  const rotatedAnchor = new THREE.Vector3();
  const projectedCorner = new THREE.Vector3();
  const compositionAnchor = new THREE.Vector3();
  const compositionCorrection = new THREE.Vector3();
  const inverseRotation = new THREE.Quaternion();
  scene.add(deck);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const dimensions = works.map(work => {
    const aspect = work.width / work.height;
    const height = Math.min(4.7, 4.8 / aspect);
    return { width: height * aspect, height };
  });
  const slots = new Map<number, PlaneSlot>();
  const loader = new THREE.TextureLoader();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let progress = options.initialProgress;
  let displayedProgress = progress;
  let activeIndex = Math.round(progress);
  let inspecting = options.inspecting;
  let focusAmount = inspecting ? 1 : 0;
  let motionPaused = options.motionPaused;
  let orbitTime = 0;
  let pointerX = 0;
  let currentPointerX = 0;
  let frameId = 0;
  let lastFrame = 0;
  let dirty = true;
  let disposed = false;
  let visible = true;
  let ready = false;
  let userPaused = options.paused;
  let video: ActiveVideo | null = null;
  let down: { x: number; y: number; origin: number; pointerId: number; dragging: boolean } | null = null;
  const clamp = (value: number): number => Math.max(0, Math.min(works.length - 1, value));
  const wrap = (value: number): number => (value + works.length) % works.length;
  const relativeTo = (index: number, value: number): number => (index - value + works.length * 1.5) % works.length - works.length / 2;

  function fitDistance(): number {
    const { width, height } = dimensions[activeIndex];
    const { expanded, focused } = galleryCameraDistances(camera.aspect, width, height, camera.fov);
    return THREE.MathUtils.lerp(expanded, focused, focusAmount);
  }
  function requestRender(markDirty = true): void {
    dirty ||= markDirty;
    if (!frameId && !disposed && visible && !document.hidden) frameId = requestAnimationFrame(render);
  }
  function centerComposition(): void {
    if (focusAmount > 0.999) return;
    deck.updateMatrixWorld(true);
    const corners: ProjectedCorner[] = [];
    for (const [index, slot] of slots) {
      const { width, height } = dimensions[index];
      const weight = Math.min(Math.abs(relativeTo(index, displayedProgress)), 1);
      for (const x of [-width / 2, width / 2]) for (const y of [-height / 2, height / 2]) {
        projectedCorner.set(x, y, 0).applyMatrix4(slot.mesh.matrixWorld);
        corners.push({ x: projectedCorner.x, depth: camera.position.z - projectedCorner.z, weight });
      }
    }
    compositionAnchor.copy(frontAnchor).applyMatrix4(deck.matrixWorld);
    const target = compositionAnchor.x / (camera.position.z - compositionAnchor.z);
    const offset = compositionOffset(corners, target) * (1 - focusAmount);
    inverseRotation.copy(deck.quaternion).invert();
    compositionCorrection.set(offset, 0, 0).applyQuaternion(inverseRotation);
    // Balance the projected ensemble without moving or shrinking the active work.
    // Continuous distance weights keep this correction smooth between selections.
    for (const [index, slot] of slots) {
      const weight = Math.min(Math.abs(relativeTo(index, displayedProgress)), 1);
      slot.mesh.position.addScaledVector(compositionCorrection, weight);
    }
  }
  function render(time: number): void {
    frameId = 0;
    if (disposed || !visible || document.hidden) return;
    if (dirty || time - lastFrame >= FRAME_INTERVAL) {
      const elapsed = lastFrame ? Math.min(0.08, (time - lastFrame) / 1000) : 1 / 30;
      lastFrame = time;
      dirty = false;
      const blend = reducedMotion ? 1 : 1 - Math.exp(-13 * elapsed);
      displayedProgress = THREE.MathUtils.lerp(displayedProgress, progress, blend);
      focusAmount = THREE.MathUtils.lerp(focusAmount, inspecting ? 1 : 0, blend);
      currentPointerX = THREE.MathUtils.lerp(currentPointerX, pointerX, blend);
      if (!reducedMotion && !motionPaused && !inspecting && !down) orbitTime += elapsed;
      const fraction = displayedProgress - Math.floor(displayedProgress);
      const turn = reducedMotion ? 0 : Math.sin(fraction * Math.PI) ** 2;
      const spread = (1 - focusAmount) * (1 - turn * 0.74);
      deck.rotation.y = reducedMotion ? 0 : (0.16 + Math.sin(orbitTime * 0.32) * 0.23 + currentPointerX * 0.1 + turn * 1.05) * (1 - focusAmount);
      deck.rotation.x = reducedMotion ? 0 : -0.025 * (1 - focusAmount);
      // The user's floating interpretation moves the assembly, never the camera.
      const floatAmount = reducedMotion ? 0 : 1 - focusAmount;
      // Rotate around the selected front plane so scale never pushes it aside.
      rotatedAnchor.copy(frontAnchor).applyEuler(deck.rotation);
      deck.position.copy(frontAnchor).sub(rotatedAnchor);
      deck.position.x += Math.sin(orbitTime * 0.37) * 0.13 * floatAmount;
      deck.position.y += Math.sin(orbitTime * 0.65) * 0.16 * floatAmount;
      deck.position.z += Math.sin(orbitTime * 0.45) * 0.38 * floatAmount;
      for (const [index, slot] of slots) {
        const relative = relativeTo(index, displayedProgress);
        const [x, y, z] = placement(relative);
        const selected = index === activeIndex;
        slot.mesh.position.set(x * spread, y * spread, THREE.MathUtils.lerp(z, selected ? 2.2 : -Math.abs(relative) * 0.2, focusAmount));
        slot.mesh.scale.setScalar(THREE.MathUtils.lerp(1 - Math.min(Math.abs(relative), 6) * 0.025, selected ? 1 : 0.65, focusAmount));
        slot.mesh.material.opacity = selected ? 1 : 1 - focusAmount;
        slot.mesh.visible = slot.mesh.material.opacity > 0.005;
      }
      camera.position.set(0, 0, fitDistance());
      camera.lookAt(0, 0, 0);
      centerComposition();
      renderer.render(scene, camera);
    }
    const moving = Math.abs(displayedProgress - progress) > 0.001 || Math.abs(focusAmount - (inspecting ? 1 : 0)) > 0.001 || Math.abs(currentPointerX - pointerX) > 0.001;
    if ((!reducedMotion && !motionPaused && !inspecting && !down) || moving || (video && !video.element.paused)) requestRender(false);
  }
  function releaseVideo(): void {
    const previous = video;
    if (!previous) return;
    video = null;
    previous.events.abort();
    previous.element.pause();
    previous.element.removeAttribute("src");
    previous.element.load();
    previous.element.remove();
    previous.texture.dispose();
    const slot = slots.get(previous.index);
    if (slot) { slot.mesh.material.map = slot.texture; slot.mesh.material.needsUpdate = true; }
  }
  function playVideo(): void {
    const current = video;
    if (!current || disposed || !visible || document.hidden || userPaused) return;
    void current.element.play().catch(() => {
      if (video === current && !disposed && !userPaused && visible && !document.hidden) onPlayback(current.element.error ? "error" : "blocked");
    });
  }
  function attachVideo(): void {
    releaseVideo();
    const work = works[activeIndex];
    if (work.kind !== "video") { onPlayback("none"); return; }
    const element = document.createElement("video");
    element.className = "spatial-video-source";
    element.setAttribute("aria-hidden", "true");
    element.tabIndex = -1;
    element.muted = true;
    element.defaultMuted = true;
    element.loop = true;
    element.playsInline = true;
    element.preload = "metadata";
    element.crossOrigin = "anonymous";
    element.src = work.src;
    element.poster = work.thumbnail;
    canvas.parentElement?.appendChild(element);
    const texture = new THREE.VideoTexture(element);
    texture.colorSpace = THREE.SRGBColorSpace;
    const events = new AbortController();
    const current: ActiveVideo = { index: activeIndex, element, texture, events };
    video = current;
    onPlayback(userPaused ? "paused" : "loading");
    element.addEventListener("loadeddata", () => {
      if (video !== current || disposed) return;
      const slot = slots.get(current.index);
      if (slot) { slot.mesh.material.map = texture; slot.mesh.material.color.setHex(0xffffff); slot.mesh.material.needsUpdate = true; }
      requestRender();
    }, { signal: events.signal });
    element.addEventListener("playing", () => {
      if (video !== current || disposed) return;
      onPlayback("playing"); requestRender();
    }, { signal: events.signal });
    element.addEventListener("pause", () => {
      if (video === current && !disposed) onPlayback(element.error ? "error" : "paused");
    }, { signal: events.signal });
    element.addEventListener("error", () => {
      if (video === current && !disposed) onPlayback("error");
    }, { signal: events.signal });
    playVideo();
  }
  function release(slot: PlaneSlot): void {
    deck.remove(slot.mesh);
    slot.texture?.dispose();
    slot.mesh.geometry.dispose();
    slot.mesh.material.dispose();
  }
  function updateWindow(): void {
    const radius = canvas.clientWidth <= 1024 ? 4 : 6;
    const wanted = new Set(Array.from({ length: Math.min(works.length, radius * 2 + 1) }, (_, offset) => wrap(activeIndex + offset - radius)));
    for (const [index, slot] of slots) if (!wanted.has(index)) { release(slot); slots.delete(index); }
    for (const index of wanted) {
      if (slots.has(index)) continue;
      const work = works[index];
      const { width, height } = dimensions[index];
      const material = new THREE.MeshBasicMaterial({ color: 0x171717, side: THREE.DoubleSide, transparent: true });
      const mesh = new THREE.Mesh(roundedPlane(width, height), material);
      mesh.userData.index = index;
      deck.add(mesh);
      const slot: PlaneSlot = { mesh, texture: null };
      slots.set(index, slot);
      loader.load(work.thumbnail, texture => {
        if (disposed || slots.get(index) !== slot) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        slot.texture = texture;
        if (video?.index !== index || video.element.readyState < 2) material.map = texture;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
        if (!ready && index === activeIndex) { ready = true; onReady(); }
        requestRender();
      }, undefined, () => { if (!disposed && slots.get(index) === slot) onError(); });
    }
    if (!ready && slots.get(activeIndex)?.texture) { ready = true; onReady(); }
  }
  function moveTo(next: number, instant = false): void {
    progress = clamp(next);
    const nearest = Math.round(progress);
    const changed = nearest !== activeIndex;
    activeIndex = nearest;
    if (instant || reducedMotion || Math.abs(displayedProgress - progress) > 2) displayedProgress = progress;
    updateWindow();
    if (changed) { userPaused = false; onFocus(activeIndex); attachVideo(); }
    requestRender();
  }
  function hitTest(event: PointerEvent): number | null {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(Array.from(slots.values(), slot => slot.mesh).filter(mesh => mesh.visible))[0];
    const index: unknown = hit?.object.userData.index;
    return typeof index === "number" ? index : null;
  }
  function pointerDown(event: PointerEvent): void {
    if (down || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    down = { x: event.clientX, y: event.clientY, origin: progress, pointerId: event.pointerId, dragging: false };
  }
  function pointerMove(event: PointerEvent): void {
    if (down && event.pointerId === down.pointerId) {
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (!down.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { down.dragging = true; canvas.setPointerCapture(event.pointerId); }
      if (down.dragging) { canvas.style.cursor = "grabbing"; moveTo(down.origin - dx / Math.max(120, canvas.clientWidth * 0.28)); return; }
    }
    if (event.pointerType === "mouse" && !reducedMotion && !motionPaused) {
      pointerX = (event.clientX - canvas.getBoundingClientRect().left) / canvas.clientWidth - 0.5;
      requestRender();
    }
    canvas.style.cursor = hitTest(event) === null ? "grab" : "pointer";
  }
  function pointerUp(event: PointerEvent): void {
    if (!down || event.pointerId !== down.pointerId) return;
    const wasDragging = down.dragging;
    down = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = "grab";
    const index = wasDragging ? Math.round(progress) : hitTest(event);
    if (index !== null) {
      if (!wasDragging && index === activeIndex) onInspect();
      else { moveTo(index); onNavigate(index); }
    }
    requestRender();
  }
  function cancelPointer(event: PointerEvent): void {
    if (!down || event.pointerId !== down.pointerId) return;
    const { origin, pointerId } = down;
    down = null;
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    moveTo(origin, true);
    canvas.style.cursor = "grab";
  }
  function pointerLeave(): void { pointerX = 0; requestRender(); }
  function resize(): void {
    if (!canvas.clientWidth || !canvas.clientHeight) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    updateWindow();
    requestRender();
  }
  function contextLost(event: Event): void { event.preventDefault(); onError(); }
  function syncVisibility(): void {
    if (!visible || document.hidden) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      video?.element.pause();
    } else { lastFrame = 0; playVideo(); requestRender(); }
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncVisibility(); });
  intersectionObserver.observe(canvas);
  const events = new AbortController();
  canvas.addEventListener("pointerdown", pointerDown, { signal: events.signal });
  canvas.addEventListener("pointermove", pointerMove, { signal: events.signal });
  canvas.addEventListener("pointerup", pointerUp, { signal: events.signal });
  canvas.addEventListener("pointercancel", cancelPointer, { signal: events.signal });
  canvas.addEventListener("pointerleave", pointerLeave, { signal: events.signal });
  canvas.addEventListener("webglcontextlost", contextLost, { signal: events.signal });
  document.addEventListener("visibilitychange", syncVisibility, { signal: events.signal });
  resize();
  moveTo(progress, true);
  attachVideo();
  return {
    setProgress(next: number, instant = false): void { if (!down?.dragging) moveTo(next, instant); },
    setReducedMotion(next: boolean): void {
      reducedMotion = next;
      if (next) {
        displayedProgress = progress;
        focusAmount = inspecting ? 1 : 0;
        pointerX = 0;
        currentPointerX = 0;
      }
      requestRender();
    },
    setPaused(paused: boolean, retry = false): void {
      userPaused = paused;
      if (retry && video?.element.error) attachVideo();
      if (paused) { video?.element.pause(); if (video) onPlayback("paused"); }
      else playVideo();
    },
    setPresentation(nextInspecting: boolean, nextMotionPaused: boolean, instant = false): void {
      inspecting = nextInspecting;
      motionPaused = nextMotionPaused;
      if (motionPaused) pointerX = 0;
      if (instant || reducedMotion) focusAmount = inspecting ? 1 : 0;
      requestRender();
    },
    dispose(): void {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      releaseVideo();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      events.abort();
      for (const slot of slots.values()) release(slot);
      slots.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
