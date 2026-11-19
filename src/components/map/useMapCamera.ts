"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  clampCamera,
  easeInOutCubic,
  interpolateCamera,
  mapToScreen,
  pixelScale,
  zoomAround,
  type MapCamera,
  type MapSize,
  type Viewport,
} from "@/lib/mapCamera";
import type { Vec2 } from "@/types/world";

export interface FlyToOptions {
  durationMs: number;
  ease?: (t: number) => number;
  /** Clamp the destination to the map edges. Disable for dives so the pin lands dead-centre. */
  clamp?: boolean;
  /** Eased progress 0→1 every frame (used for the dive tilt). */
  onProgress?: (u: number) => void;
  onComplete?: () => void;
}

interface UseMapCameraOptions {
  mapSize: MapSize;
  initial: MapCamera;
  /** When false, drag / wheel / pinch input is ignored (e.g. during transitions). */
  interactive: boolean;
}

const WHEEL_SENSITIVITY = 0.0015;
const PINCH_WHEEL_SENSITIVITY = 0.01;
const INERTIA_FRICTION = 0.92;
const INERTIA_MIN_SPEED = 0.02; // px per ms

export function useMapCamera({ mapSize, initial, interactive }: UseMapCameraOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [camera, setCamera] = useState<MapCamera>(initial);
  const [isAnimating, setIsAnimating] = useState(false);

  const camRef = useRef<MapCamera>(initial);
  const vpRef = useRef<Viewport>(viewport);
  const animFrame = useRef<number | null>(null);
  const inertiaFrame = useRef<number | null>(null);
  const interactiveRef = useRef(interactive);
  useLayoutEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  const { width: mapW, height: mapH } = mapSize;

  const commit = useCallback(
    (next: MapCamera, clamp = true) => {
      const c = clamp ? clampCamera(next, vpRef.current, { width: mapW, height: mapH }) : next;
      camRef.current = c;
      setCamera(c);
    },
    [mapW, mapH],
  );

  const stopInertia = useCallback(() => {
    if (inertiaFrame.current !== null) cancelAnimationFrame(inertiaFrame.current);
    inertiaFrame.current = null;
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animFrame.current !== null) cancelAnimationFrame(animFrame.current);
    animFrame.current = null;
    setIsAnimating(false);
  }, []);

  /* ------------------------------ viewport -------------------------------- */

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      // Layout size (ignores CSS transforms), so a tilted parent never skews the math.
      const vp = { width: el.clientWidth, height: el.clientHeight };
      vpRef.current = vp;
      setViewport(vp);
      if (animFrame.current === null) commit(camRef.current);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [commit]);

  /* ------------------------------ animation ------------------------------- */

  const flyTo = useCallback(
    (target: MapCamera, opts: FlyToOptions) => {
      stopInertia();
      cancelAnimation();
      const from = camRef.current;
      const to = opts.clamp === false ? target : clampCamera(target, vpRef.current, { width: mapW, height: mapH });
      const ease = opts.ease ?? easeInOutCubic;
      const start = performance.now();
      setIsAnimating(true);

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / Math.max(1, opts.durationMs));
        const u = ease(t);
        commit(interpolateCamera(from, to, u), false);
        opts.onProgress?.(u);
        if (t < 1) {
          animFrame.current = requestAnimationFrame(step);
        } else {
          animFrame.current = null;
          setIsAnimating(false);
          opts.onComplete?.();
        }
      };
      animFrame.current = requestAnimationFrame(step);
    },
    [cancelAnimation, commit, mapW, mapH, stopInertia],
  );

  const jumpTo = useCallback(
    (target: MapCamera, clamp = true) => {
      stopInertia();
      cancelAnimation();
      commit(target, clamp);
    },
    [cancelAnimation, commit, stopInertia],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const s = pixelScale(camRef.current, vpRef.current, { width: mapW, height: mapH });
      commit({ ...camRef.current, cx: camRef.current.cx - dx / s, cy: camRef.current.cy - dy / s });
    },
    [commit, mapW, mapH],
  );

  const zoomBy = useCallback(
    (factor: number, anchor?: Vec2, animated = false) => {
      const vp = vpRef.current;
      const a: Vec2 = anchor ?? [vp.width / 2, vp.height / 2];
      const target = zoomAround(camRef.current, factor, a, vp, { width: mapW, height: mapH });
      if (animated) flyTo(target, { durationMs: 320, ease: easeInOutCubic });
      else commit(target);
    },
    [commit, flyTo, mapW, mapH],
  );

  /* ------------------------------ input ----------------------------------- */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pointers = new Map<number, Vec2>();
    let lastPinch: { dist: number; mid: Vec2 } | null = null;
    let lastMove: { x: number; y: number; t: number } | null = null;
    let velocity: Vec2 = [0, 0];

    const local = (e: PointerEvent | WheelEvent | MouseEvent): Vec2 => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const pinchState = (): { dist: number; mid: Vec2 } | null => {
      const pts = [...pointers.values()];
      if (pts.length < 2) return null;
      const a = pts[0] as Vec2;
      const b = pts[1] as Vec2;
      return { dist: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
    };

    const onWheel = (e: WheelEvent) => {
      if (!interactiveRef.current) return;
      e.preventDefault();
      stopInertia();
      cancelAnimation();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vpRef.current.height : 1;
      const sensitivity = e.ctrlKey ? PINCH_WHEEL_SENSITIVITY : WHEEL_SENSITIVITY;
      zoomBy(Math.exp(-e.deltaY * unit * sensitivity), local(e));
    };

    /** Pins, cards and controls opt out of panning with `data-map-ui`. */
    const isUiTarget = (e: Event) => e.target instanceof Element && e.target.closest("[data-map-ui]") !== null;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactiveRef.current || isUiTarget(e) || (e.pointerType === "mouse" && e.button !== 0)) return;
      stopInertia();
      cancelAnimation();
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, local(e));
      lastPinch = pinchState();
      lastMove = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocity = [0, 0];
      el.dataset.dragging = "true";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId) as Vec2;
      const next = local(e);
      pointers.set(e.pointerId, next);

      if (pointers.size >= 2) {
        const pinch = pinchState();
        if (pinch && lastPinch && lastPinch.dist > 0) {
          zoomBy(pinch.dist / lastPinch.dist, pinch.mid);
          panBy(pinch.mid[0] - lastPinch.mid[0], pinch.mid[1] - lastPinch.mid[1]);
        }
        lastPinch = pinch;
        velocity = [0, 0];
        return;
      }

      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      panBy(dx, dy);

      const now = performance.now();
      if (lastMove) {
        const dt = Math.max(1, now - lastMove.t);
        // Low-pass the velocity so a single jittery event doesn't fling the map.
        velocity = [velocity[0] * 0.6 + (dx / dt) * 0.4, velocity[1] * 0.6 + (dy / dt) * 0.4];
      }
      lastMove = { x: e.clientX, y: e.clientY, t: now };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      lastPinch = pinchState();
      if (pointers.size > 0) return;
      delete el.dataset.dragging;

      const idleMs = lastMove ? performance.now() - lastMove.t : Infinity;
      if (idleMs > 80 || Math.hypot(velocity[0], velocity[1]) < INERTIA_MIN_SPEED) return;

      let [vx, vy] = velocity;
      let last = performance.now();
      const glide = (now: number) => {
        const dt = now - last;
        last = now;
        panBy(vx * dt, vy * dt);
        const decay = Math.pow(INERTIA_FRICTION, dt / 16.67);
        vx *= decay;
        vy *= decay;
        inertiaFrame.current = Math.hypot(vx, vy) > INERTIA_MIN_SPEED ? requestAnimationFrame(glide) : null;
      };
      inertiaFrame.current = requestAnimationFrame(glide);
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (!interactiveRef.current || isUiTarget(e)) return;
      zoomBy(e.shiftKey ? 0.5 : 2, local(e), true);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("dblclick", onDoubleClick);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("dblclick", onDoubleClick);
    };
  }, [cancelAnimation, panBy, stopInertia, zoomBy]);

  useEffect(
    () => () => {
      if (animFrame.current !== null) cancelAnimationFrame(animFrame.current);
      if (inertiaFrame.current !== null) cancelAnimationFrame(inertiaFrame.current);
    },
    [],
  );

  const toScreen = useCallback(
    (p: Vec2) => mapToScreen(p, camera, viewport, { width: mapW, height: mapH }),
    [camera, viewport, mapW, mapH],
  );

  return {
    containerRef,
    camera,
    viewport,
    scale: pixelScale(camera, viewport, { width: mapW, height: mapH }),
    isAnimating,
    toScreen,
    flyTo,
    jumpTo,
    panBy,
    zoomBy,
    cancelAnimation,
  };
}
