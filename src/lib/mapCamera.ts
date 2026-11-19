import type { Vec2 } from "@/types/world";

/**
 * Pure math for the 2D region-map camera. Kept framework-free so it can be
 * unit-tested and reused by a future 3D globe view.
 *
 * The camera is described by the map point at the centre of the viewport
 * (`cx`, `cy`) and a zoom `k` where k = 1 fits the whole region on screen.
 */
export interface MapCamera {
  cx: number;
  cy: number;
  k: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface MapSize {
  width: number;
  height: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 9;

/** Fraction of the viewport the region fills at zoom 1. */
const FIT_PADDING = 0.94;

export function baseScale(vp: Viewport, map: MapSize): number {
  if (vp.width === 0 || vp.height === 0) return 1;
  return Math.min(vp.width / map.width, vp.height / map.height) * FIT_PADDING;
}

export function pixelScale(cam: MapCamera, vp: Viewport, map: MapSize): number {
  return baseScale(vp, map) * cam.k;
}

export function mapToScreen(p: Vec2, cam: MapCamera, vp: Viewport, map: MapSize): Vec2 {
  const s = pixelScale(cam, vp, map);
  return [vp.width / 2 + (p[0] - cam.cx) * s, vp.height / 2 + (p[1] - cam.cy) * s];
}

export function screenToMap(p: Vec2, cam: MapCamera, vp: Viewport, map: MapSize): Vec2 {
  const s = pixelScale(cam, vp, map);
  return [cam.cx + (p[0] - vp.width / 2) / s, cam.cy + (p[1] - vp.height / 2) / s];
}

/** Keeps the map from being dragged off-screen. */
export function clampCamera(cam: MapCamera, vp: Viewport, map: MapSize): MapCamera {
  const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cam.k));
  const s = baseScale(vp, map) * k;
  const halfW = vp.width / (2 * s);
  const halfH = vp.height / (2 * s);
  const clampAxis = (c: number, half: number, size: number) =>
    half >= size / 2 ? size / 2 : Math.min(size - half, Math.max(half, c));
  return { k, cx: clampAxis(cam.cx, halfW, map.width), cy: clampAxis(cam.cy, halfH, map.height) };
}

/** Zoom by `factor` keeping the map point under `anchor` (screen px) fixed. */
export function zoomAround(cam: MapCamera, factor: number, anchor: Vec2, vp: Viewport, map: MapSize): MapCamera {
  const before = screenToMap(anchor, cam, vp, map);
  const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cam.k * factor));
  const s = baseScale(vp, map) * k;
  return clampCamera(
    { k, cx: before[0] - (anchor[0] - vp.width / 2) / s, cy: before[1] - (anchor[1] - vp.height / 2) / s },
    vp,
    map,
  );
}

/**
 * Interpolate between two cameras at eased progress `u`.
 * Zoom is interpolated in log-space (constant perceived speed) and the centre
 * is weighted by 1/k so the destination glides smoothly into the middle of the
 * screen rather than racing ahead of the zoom.
 */
export function interpolateCamera(from: MapCamera, to: MapCamera, u: number): MapCamera {
  const k = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * u);
  const denom = 1 / from.k - 1 / to.k;
  const w = Math.abs(denom) < 1e-6 ? u : (1 / from.k - 1 / k) / denom;
  return { k, cx: from.cx + (to.cx - from.cx) * w, cy: from.cy + (to.cy - from.cy) * w };
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInQuad = (t: number) => t * t;
