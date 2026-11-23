import { boundary, circle, type Collider } from "@/engine/collision";
import { fbm, smoothstep } from "@/lib/noise";
import { createRng } from "@/lib/geometry";

/**
 * Spear Pillar (scene metres, origin = platform centre, −z = north).
 * A ruined marble platform sits on a snowy summit plateau ringed by jagged
 * crags, high above a sea of clouds. Steps on the south side lead up onto the
 * platform; a stepped round dais near the north end holds the altar.
 */
export const RUINS = {
  platform: { halfX: 15, halfZ: 26, height: 0.5 },
  steps: { halfX: 6, from: 26, depth: 2.4, count: 3 },
  dais: { x: 0, z: -12, tiers: [7, 5.4, 3.8], rise: 0.45 },
  colonnade: { x: 11, zs: [-21, -15, -9, -3, 3, 9, 15, 21] },
  plateauRadius: 52,
  walkRadius: 46,
  terrainSize: 420,
  cloudY: -48,
} as const;

/** Natural ground: snowy plateau, crag ring at the edge, then cliffs down into the clouds. */
export function summitTerrain(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const drift = fbm(x * 0.06, z * 0.06) * 0.45;
  const P = RUINS.plateauRadius;
  // Keep the ground under the ruins perfectly flat.
  const ruinsMask = smoothstep(4, 0, Math.max(Math.abs(x) - RUINS.platform.halfX, Math.abs(z) - RUINS.platform.halfZ - RUINS.steps.depth));
  let h = drift * (1 - ruinsMask);
  const crag = smoothstep(P - 8, P, r) * (1 - smoothstep(P + 4, P + 14, r));
  h += crag * (2.5 + Math.max(0, fbm(x * 0.08 + 9, z * 0.08 - 3)) * 16);
  if (r > P + 4) h -= Math.pow(r - P - 4, 1.55) * 0.55 + fbm(x * 0.025, z * 0.025) * (r - P) * 0.3;
  return h;
}

/** Walkable height: terrain plus the platform, steps and dais tiers (the player climbs them). */
export function summitHeight(x: number, z: number): number {
  const { platform, steps, dais } = RUINS;
  let h = summitTerrain(x, z);
  if (Math.abs(x) <= platform.halfX && Math.abs(z) <= platform.halfZ) h = platform.height;
  else if (Math.abs(x) <= steps.halfX && z > steps.from && z <= steps.from + steps.depth) {
    const k = Math.ceil(((steps.from + steps.depth - z) / steps.depth) * steps.count);
    h = (platform.height / steps.count) * k;
  }
  const r = Math.hypot(x - dais.x, z - dais.z);
  dais.tiers.forEach((tr, i) => {
    if (r <= tr) h = platform.height + dais.rise * (i + 1);
  });
  return h;
}

export function summitColor(x: number, z: number, h: number, slope: number): [number, number, number] {
  const n = fbm(x * 0.09 + 2.1, z * 0.09 - 4.7);
  const snow: [number, number, number] = [0.78 + n * 0.05, 0.81 + n * 0.05, 0.9 + n * 0.04];
  const rock: [number, number, number] = [0.13 + n * 0.03, 0.13 + n * 0.03, 0.16 + n * 0.03];
  const t = smoothstep(0.32, 0.6, slope + n * 0.15);
  const c = snow.map((v, i) => v + ((rock[i] as number) - v) * t) as [number, number, number];
  // Shadowed blue tint low down where snow lingers on ledges.
  if (h < -10) c[2] = Math.min(1, c[2] * 1.05);
  return c;
}

export interface Column {
  x: number;
  z: number;
  /** Standing height of the shaft (full = 9). */
  height: number;
  /** Fallen columns lie on the ground; `angle` is their direction. */
  fallen: boolean;
  angle: number;
}

export function buildRuins(seed: number) {
  const rng = createRng(seed);
  const columns: Column[] = [];
  for (const side of [-1, 1]) {
    for (const z of RUINS.colonnade.zs) {
      const roll = rng();
      const fallen = roll < 0.14;
      const height = fallen ? 1.2 : roll < 0.55 ? 9 : 2.5 + rng() * 5;
      // Toppled columns fall outward, off the platform edge.
      const outward = side === 1 ? 0 : Math.PI;
      columns.push({ x: side * RUINS.colonnade.x, z, height, fallen, angle: outward + (rng() - 0.5) * 0.8 });
    }
  }
  // Marble floor tiles; ~12% are missing, the rest are slightly heaved.
  const tiles: { x: number; z: number; dy: number; rx: number; rz: number; shade: number }[] = [];
  const T = 2.5;
  const { halfX, halfZ } = RUINS.platform;
  for (let x = -halfX + T / 2; x < halfX; x += T) {
    for (let z = -halfZ + T / 2; z < halfZ; z += T) {
      if (rng() < 0.12) continue;
      tiles.push({ x, z, dy: (rng() - 0.5) * 0.06, rx: (rng() - 0.5) * 0.03, rz: (rng() - 0.5) * 0.03, shade: rng() });
    }
  }
  const crags: { x: number; z: number; s: number; rot: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const a = rng() * Math.PI * 2;
    const r = RUINS.walkRadius + 2 + rng() * 14;
    crags.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 1.5 + rng() * 3.5, rot: rng() * Math.PI });
  }
  const colliders: Collider[] = [
    boundary(0, 0, RUINS.walkRadius),
    // The altar block on top of the dais.
    circle(RUINS.dais.x, RUINS.dais.z, 1.6),
    ...columns.flatMap((c) => {
      if (!c.fallen) return [circle(c.x, c.z, 1.05)];
      // Base stump plus a chain of circles along the toppled shaft.
      const along = Array.from({ length: 7 }, (_, i) => 1.6 + i * 1.15);
      return [circle(c.x, c.z, 1.05), ...along.map((d) => circle(c.x + Math.cos(c.angle) * d, c.z + Math.sin(c.angle) * d, 0.75))];
    }),
  ];
  return { columns, tiles, crags, colliders };
}
