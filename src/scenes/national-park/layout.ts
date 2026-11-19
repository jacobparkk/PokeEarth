import { createRng, pointInPolygon } from "@/lib/geometry";
import { circle, type Collider } from "@/engine/collision";
import type { GrassBlade } from "@/engine/foliage/GrassField";
import type { TreeSpec } from "@/engine/foliage/TreeField";
import type { Polygon, Vec2 } from "@/types/world";

/**
 * National Park layout in scene metres (origin = fountain, −z = north).
 *
 *            north wall
 *   ┌──────────────────────────────┐
 *   │ tall grass         tall grass│
 *   │      ╭── outer ring ──╮      │
 *   │      │  ╭─ inner ─╮   │      │
 *   │──────┼──┤ fountain├───┼──────┼── east gate (Route 36)
 *   │      │  ╰─────────╯   │      │
 *   │ tall ╰───────┬────────╯      │
 *   │ grass        │               │
 *   └──────────────┴───────────────┘
 *              south gate (Route 35)
 */
export const PARK = {
  wallHalf: 46.4,
  plazaRadius: 8.5,
  fountainRadius: 5.6,
  innerRing: { radius: 17, width: 3.2 },
  outerRing: { radius: 31, width: 3.4 },
  spokeWidth: 3.2,
  gateHalfWidth: 3,
  /** Ground texture / plane half-size. */
  groundHalf: 60,
} as const;

type Segment = readonly [Vec2, Vec2];

/** Straight path segments (x, z): two gate spokes run past the wall to the gatehouses. */
const SPOKES: readonly Segment[] = [
  [[0, PARK.plazaRadius], [0, PARK.groundHalf]], // south → Route 35 gate
  [[PARK.plazaRadius, 0], [PARK.groundHalf, 0]], // east → Route 36 gate
  [[0, -PARK.plazaRadius], [0, -PARK.outerRing.radius]], // north link
  [[-PARK.plazaRadius, 0], [-PARK.outerRing.radius, 0]], // west link
];

function segmentDistance(x: number, z: number, [a, b]: Segment): number {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * abx + (z - a[1]) * abz) / (abx * abx + abz * abz)));
  return Math.hypot(x - (a[0] + abx * t), z - (a[1] + abz * t));
}

/** Signed distance to the nearest walkway edge (≤ 0 means standing on a path or the plaza). */
export function distanceToPath(x: number, z: number): number {
  const r = Math.hypot(x, z);
  let d = r - PARK.plazaRadius;
  d = Math.min(d, Math.abs(r - PARK.innerRing.radius) - PARK.innerRing.width / 2);
  d = Math.min(d, Math.abs(r - PARK.outerRing.radius) - PARK.outerRing.width / 2);
  for (const s of SPOKES) d = Math.min(d, segmentDistance(x, z, s) - PARK.spokeWidth / 2);
  return d;
}

export const PATH_SPOKES = SPOKES;

/* -------------------------------------------------------------------------- */
/*  Tall grass (the Bug-Catching Contest fields) and lawn                      */
/* -------------------------------------------------------------------------- */

export const TALL_GRASS_PATCHES: readonly Polygon[] = [
  [[-44, -44], [-13, -44], [-13, -38], [-25, -31], [-35, -21], [-44, -13]], // NW field
  [[13, -44], [44, -44], [44, -13], [35, -21], [25, -31], [13, -38]], // NE field
  [[-44, 13], [-35, 21], [-27, 30], [-18, 39], [-13, 44], [-44, 44]], // SW strip
  [[9, 21], [21, 10], [26, 15], [14, 27]], // SE pocket between the rings
];

export const inTallGrass = (x: number, z: number) => TALL_GRASS_PATCHES.some((p) => pointInPolygon([x, z], p));

/* -------------------------------------------------------------------------- */
/*  Furniture                                                                  */
/* -------------------------------------------------------------------------- */

export interface Placement {
  x: number;
  z: number;
  /** Y rotation in radians; local +z faces the direction the object "looks". */
  rot: number;
}

const polar = (radius: number, angle: number, facingCenter = true): Placement => ({
  x: radius * Math.sin(angle),
  z: radius * Math.cos(angle),
  rot: facingCenter ? angle + Math.PI : angle,
});
const deg = (d: number) => (d * Math.PI) / 180;

export const FLOWERBEDS: readonly { x: number; z: number; r: number }[] = [45, 135, 225, 315].map((a) => {
  const p = polar(12.7, deg(a));
  return { x: p.x, z: p.z, r: 2.2 };
});

export const BENCHES: readonly Placement[] = [
  ...[45, 135, 225, 315].map((a) => polar(PARK.plazaRadius - 1.05, deg(a))),
  ...Array.from({ length: 8 }, (_, i) => polar(PARK.innerRing.radius + PARK.innerRing.width / 2 + 0.9, deg(22.5 + i * 45))),
  ...Array.from({ length: 8 }, (_, i) => polar(PARK.outerRing.radius + PARK.outerRing.width / 2 + 0.9, deg(22.5 + i * 45))),
];

export const LAMPS: readonly Placement[] = [0, 90, 180, 270].flatMap((a) =>
  [-9, 9].flatMap((o) => [
    polar(PARK.innerRing.radius + PARK.innerRing.width / 2 + 0.5, deg(a + o)),
    polar(PARK.outerRing.radius - PARK.outerRing.width / 2 - 0.5, deg(a + o * 0.6)),
  ]),
);

/** Hedge bushes just inside the wall, leaving the two gate openings clear. */
export const HEDGE_BUSHES: readonly { x: number; z: number; s: number }[] = (() => {
  const rng = createRng(77);
  const out: { x: number; z: number; s: number }[] = [];
  const inset = PARK.wallHalf - 1.4;
  for (let t = -inset; t <= inset; t += 1.35) {
    const sides: Vec2[] = [
      [t, -inset], // north
      [-inset, t], // west
      [t, inset], // south
      [inset, t], // east
    ];
    sides.forEach(([x, z], side) => {
      if (side === 2 && Math.abs(x) < PARK.gateHalfWidth + 0.8) return;
      if (side === 3 && Math.abs(z) < PARK.gateHalfWidth + 0.8) return;
      out.push({ x: x + (rng() - 0.5) * 0.3, z: z + (rng() - 0.5) * 0.3, s: 0.85 + rng() * 0.45 });
    });
  }
  return out;
})();

/* -------------------------------------------------------------------------- */
/*  Trees                                                                      */
/* -------------------------------------------------------------------------- */

export function buildTrees(seed: number): TreeSpec[] {
  const rng = createRng(seed);
  const trees: TreeSpec[] = [];
  const tooClose = (x: number, z: number, min: number) => trees.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < min * min);
  const add = (x: number, z: number, h: number) =>
    trees.push({ x, z, height: h, tint: rng(), seed: Math.floor(rng() * 1e9) });

  // Dense forest belt outside the wall (keeps the "walled park" feel and hides the edge of the world).
  for (let i = 0; i < 2600 && trees.length < 230; i++) {
    const x = (rng() * 2 - 1) * 72;
    const z = (rng() * 2 - 1) * 72;
    const outside = Math.max(Math.abs(x), Math.abs(z)) > PARK.wallHalf + 3.2;
    const gateCorridor = (Math.abs(x) < 9 && z > 40) || (Math.abs(z) < 9 && x > 40);
    if (!outside || gateCorridor || tooClose(x, z, 4.2)) continue;
    add(x, z, 7 + rng() * 6);
  }
  const outerCount = trees.length;

  // Shade trees on the lawns inside the park.
  for (let i = 0; i < 3000 && trees.length < outerCount + 46; i++) {
    const x = (rng() * 2 - 1) * (PARK.wallHalf - 4);
    const z = (rng() * 2 - 1) * (PARK.wallHalf - 4);
    const r = Math.hypot(x, z);
    if (r < PARK.innerRing.radius + 3.5) continue; // keep the centre open around the fountain
    if (distanceToPath(x, z) < 2.2 || inTallGrass(x, z) || tooClose(x, z, 6.5)) continue;
    if (BENCHES.some((b) => (b.x - x) ** 2 + (b.z - z) ** 2 < 9)) continue;
    add(x, z, 6 + rng() * 4);
  }
  return trees;
}

/* -------------------------------------------------------------------------- */
/*  Grass blades                                                               */
/* -------------------------------------------------------------------------- */

export function buildTallGrass(seed: number): GrassBlade[] {
  const rng = createRng(seed);
  const blades: GrassBlade[] = [];
  for (const patch of TALL_GRASS_PATCHES) {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const [x, z] of patch) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    const area = (maxX - minX) * (maxZ - minZ);
    const target = Math.floor(area * 13);
    for (let i = 0; i < target; i++) {
      const x = minX + rng() * (maxX - minX);
      const z = minZ + rng() * (maxZ - minZ);
      if (!pointInPolygon([x, z], patch) || distanceToPath(x, z) < 0.5) continue;
      blades.push({ x, z, rot: rng() * Math.PI * 2, height: 0.85 + rng() * 0.55, width: 0.09 + rng() * 0.06, tint: rng() });
    }
  }
  return blades;
}

export function buildLawnGrass(seed: number, count: number): GrassBlade[] {
  const rng = createRng(seed);
  const blades: GrassBlade[] = [];
  const half = PARK.wallHalf - 1.8;
  for (let i = 0; i < count * 3 && blades.length < count; i++) {
    const x = (rng() * 2 - 1) * half;
    const z = (rng() * 2 - 1) * half;
    if (distanceToPath(x, z) < 0.25 || inTallGrass(x, z)) continue;
    if (Math.hypot(x, z) < PARK.plazaRadius + 0.4) continue;
    if (FLOWERBEDS.some((f) => Math.hypot(f.x - x, f.z - z) < f.r + 0.2)) continue;
    blades.push({ x, z, rot: rng() * Math.PI * 2, height: 0.16 + rng() * 0.2, width: 0.06 + rng() * 0.04, tint: rng() });
  }
  return blades;
}

/* -------------------------------------------------------------------------- */
/*  Collisions                                                                 */
/* -------------------------------------------------------------------------- */

export function buildColliders(trees: readonly TreeSpec[]): Collider[] {
  return [
    circle(0, 0, PARK.fountainRadius),
    ...FLOWERBEDS.map((f) => circle(f.x, f.z, f.r + 0.15)),
    ...BENCHES.map((b) => circle(b.x, b.z, 0.85)),
    ...LAMPS.map((l) => circle(l.x, l.z, 0.22)),
    ...trees.filter((t) => Math.max(Math.abs(t.x), Math.abs(t.z)) < PARK.wallHalf).map((t) => circle(t.x, t.z, 0.45)),
  ];
}
