import type { Polygon, Vec2 } from "@/types/world";

/* -------------------------------------------------------------------------- */
/*  Deterministic randomness                                                   */
/* -------------------------------------------------------------------------- */

/** Mulberry32 — tiny, fast, seedable PRNG returning floats in [0, 1). */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash, used to derive per-feature seeds from ids. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* -------------------------------------------------------------------------- */
/*  Smoothed SVG paths (Catmull-Rom → cubic Bézier)                            */
/* -------------------------------------------------------------------------- */

const fmt = (n: number) => Math.round(n * 100) / 100;

function catmullRomSegment(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, tension: number): string {
  const t = tension / 6;
  const c1x = p1[0] + (p2[0] - p0[0]) * t;
  const c1y = p1[1] + (p2[1] - p0[1]) * t;
  const c2x = p2[0] - (p3[0] - p1[0]) * t;
  const c2y = p2[1] - (p3[1] - p1[1]) * t;
  return `C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
}

/** Smooth closed outline through every control point. */
export function smoothClosedPath(points: Polygon, tension = 1): string {
  const n = points.length;
  if (n < 3) return "";
  const at = (i: number) => points[((i % n) + n) % n] as Vec2;
  const first = at(0);
  let d = `M${fmt(first[0])},${fmt(first[1])}`;
  for (let i = 0; i < n; i++) {
    d += catmullRomSegment(at(i - 1), at(i), at(i + 1), at(i + 2), tension);
  }
  return `${d}Z`;
}

/** Smooth open polyline through every control point (endpoints are clamped). */
export function smoothOpenPath(points: Polygon, tension = 1): string {
  const n = points.length;
  if (n < 2) return "";
  const at = (i: number) => points[Math.max(0, Math.min(n - 1, i))] as Vec2;
  const first = at(0);
  let d = `M${fmt(first[0])},${fmt(first[1])}`;
  for (let i = 0; i < n - 1; i++) {
    d += catmullRomSegment(at(i - 1), at(i), at(i + 1), at(i + 2), tension);
  }
  return d;
}

/* -------------------------------------------------------------------------- */
/*  Polygon helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Even-odd ray cast. */
export function pointInPolygon(p: Vec2, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Vec2;
    const b = poly[j] as Vec2;
    const crosses = a[1] > p[1] !== b[1] > p[1];
    if (crosses && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

export function polygonArea(poly: Polygon): number {
  let sum = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Vec2;
    const b = poly[j] as Vec2;
    sum += (b[0] + a[0]) * (b[1] - a[1]);
  }
  return Math.abs(sum) / 2;
}

export function polygonBounds(poly: Polygon): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/** Shortest distance from a point to a polyline. */
export function distanceToPolyline(p: Vec2, line: Polygon): number {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i] as Vec2;
    const b = line[i + 1] as Vec2;
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / len2));
    const dx = p[0] - (a[0] + abx * t);
    const dy = p[1] - (a[1] + aby * t);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) best = d;
  }
  return best;
}

export interface ScatterOptions {
  /** Points per 1 000 square units. */
  density: number;
  /** Minimum spacing between accepted points. */
  minSpacing: number;
  /** Extra rejection test; return false to discard a candidate. */
  accept?: (p: Vec2) => boolean;
  maxAttemptsFactor?: number;
}

/** Rejection-sampled scatter inside a polygon with a minimum spacing (blue-noise-ish). */
export function scatterInPolygon(poly: Polygon, rng: () => number, opts: ScatterOptions): Vec2[] {
  const { minX, minY, maxX, maxY } = polygonBounds(poly);
  const target = Math.round((polygonArea(poly) / 1000) * opts.density);
  const maxAttempts = target * (opts.maxAttemptsFactor ?? 30);
  const out: Vec2[] = [];
  const spacing2 = opts.minSpacing * opts.minSpacing;
  for (let attempt = 0; attempt < maxAttempts && out.length < target; attempt++) {
    const p: Vec2 = [minX + rng() * (maxX - minX), minY + rng() * (maxY - minY)];
    if (!pointInPolygon(p, poly)) continue;
    if (opts.accept && !opts.accept(p)) continue;
    let tooClose = false;
    for (const q of out) {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      if (dx * dx + dy * dy < spacing2) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) out.push(p);
  }
  return out;
}
