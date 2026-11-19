import type { Biome, RegionDefinition, Vec2 } from "@/types/world";
import {
  createRng,
  distanceToPolyline,
  hashString,
  pointInPolygon,
  scatterInPolygon,
  smoothClosedPath,
  smoothOpenPath,
} from "./geometry";

export interface TreeFeature {
  x: number;
  y: number;
  r: number;
  /** 0–1, picks the canopy shade. */
  tone: number;
  /** Inside a snow biome — rendered as a frosted conifer. */
  snowy: boolean;
}

export interface PeakFeature {
  x: number;
  y: number;
  /** Height and half-width of the peak triangle in map units. */
  h: number;
  w: number;
  /** Horizontal offset of the summit, gives each peak a unique silhouette. */
  lean: number;
  snow: boolean;
}

export interface MeadowPatch {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  opacity: number;
}

export interface TerrainFeatures {
  landPaths: string[];
  waterPaths: { id: string; d: string }[];
  biomePaths: { id: string; d: string; kind: Biome["kind"] }[];
  routePaths: { id: string; d: string; kind: "land" | "water" | "cave" }[];
  meadows: MeadowPatch[];
  trees: TreeFeature[];
  peaks: PeakFeature[];
}

const PIN_CLEARANCE = 13;
const ROUTE_CLEARANCE_TREES = 4.5;
const ROUTE_CLEARANCE_PEAKS = 7;

/**
 * Turns a region's coarse geography into render-ready, deterministic features.
 * Same region data → identical map on every mount, server or client.
 */
export function buildTerrain(region: RegionDefinition): TerrainFeatures {
  const g = region.geography;
  const pins = region.locations.map((l) => l.map.position);
  const routeLines = g.routes.map((r) => r.points);

  const onLand = (p: Vec2) => g.landmasses.some((poly) => pointInPolygon(p, poly));
  const inWater = (p: Vec2) => g.waterBodies.some((w) => pointInPolygon(p, w.points));
  const inSnow = (p: Vec2) => g.biomes.some((b) => b.kind === "snow" && pointInPolygon(p, b.points));
  const inHotBiome = (p: Vec2) =>
    g.biomes.some((b) => (b.kind === "ash" || b.kind === "desert") && pointInPolygon(p, b.points));
  const nearPin = (p: Vec2, clearance: number) =>
    pins.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < clearance);
  const nearRoute = (p: Vec2, clearance: number) => routeLines.some((line) => distanceToPolyline(p, line) < clearance);

  /* Meadow tint patches give the flat land some variation. */
  const meadowRng = createRng(hashString(`${region.id}:meadows`));
  const meadows: MeadowPatch[] = [];
  for (const poly of g.landmasses) {
    const pts = scatterInPolygon(poly, meadowRng, { density: 0.12, minSpacing: 40, accept: (p) => !inWater(p) });
    for (const [x, y] of pts) {
      meadows.push({
        x,
        y,
        rx: 24 + meadowRng() * 40,
        ry: 14 + meadowRng() * 22,
        rotation: meadowRng() * 180,
        opacity: 0.12 + meadowRng() * 0.18,
      });
    }
  }

  /* Trees */
  const trees: TreeFeature[] = [];
  for (const forest of g.forests) {
    const rng = createRng(hashString(`${region.id}:${forest.id}`));
    const pts = scatterInPolygon(forest.points, rng, {
      density: forest.density,
      minSpacing: 4.2,
      accept: (p) =>
        onLand(p) && !inWater(p) && !nearPin(p, PIN_CLEARANCE) && !nearRoute(p, ROUTE_CLEARANCE_TREES),
    });
    for (const [x, y] of pts) trees.push({ x, y, r: 2.4 + rng() * 1.7, tone: rng(), snowy: inSnow([x, y]) });
  }
  trees.sort((a, b) => a.y - b.y);

  /* Mountain peaks */
  const peaks: PeakFeature[] = [];
  for (const range of g.mountains) {
    const rng = createRng(hashString(`${region.id}:${range.id}`));
    const pts = scatterInPolygon(range.points, rng, {
      density: range.density,
      minSpacing: 10,
      accept: (p) => onLand(p) && !nearPin(p, PIN_CLEARANCE + 4) && !nearRoute(p, ROUTE_CLEARANCE_PEAKS),
    });
    for (const [x, y] of pts) {
      const h = 11 + rng() * 13;
      const peak: PeakFeature = { x, y, h, w: h * (0.75 + rng() * 0.35), lean: (rng() - 0.5) * h * 0.35, snow: range.snowCapped || (h > 21 && !inHotBiome([x, y])) };
      // The triangle rises above its base point, so also keep its upper body clear of routes and pins.
      const body: Vec2 = [x + peak.lean * 0.5, y - h * 0.55];
      if (nearRoute(body, ROUTE_CLEARANCE_PEAKS) || nearPin(body, PIN_CLEARANCE + 4)) continue;
      peaks.push(peak);
    }
  }
  peaks.sort((a, b) => a.y - b.y);

  return {
    landPaths: g.landmasses.map((poly) => smoothClosedPath(poly)),
    waterPaths: g.waterBodies.map((w) => ({ id: w.id, d: smoothClosedPath(w.points) })),
    biomePaths: g.biomes.map((b) => ({ id: b.id, d: smoothClosedPath(b.points), kind: b.kind })),
    routePaths: g.routes.map((r) => ({ id: r.id, d: smoothOpenPath(r.points), kind: r.kind })),
    meadows,
    trees,
    peaks,
  };
}
