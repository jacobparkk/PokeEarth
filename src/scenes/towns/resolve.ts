import { box, circle, type Collider } from "@/engine/collision";
import type { GrassBlade } from "@/engine/foliage/GrassField";
import type { TreeSpec } from "@/engine/foliage/TreeField";
import { createRng, pointInPolygon } from "@/lib/geometry";
import type { ExplorableLocation, Vec2 } from "@/types/world";
import type { BuildingKind, BuildingStyle, Rect, TownLayout } from "./types";

/** Local-space footprint (AABB) of each building kind, origin as the component authors it. */
export const FOOTPRINTS: Record<BuildingKind, Rect> = {
  "gable-house": { minX: -4, maxX: 4, minZ: -3.25, maxZ: 3.25 },
  machiya: { minX: -3.5, maxX: 3.5, minZ: -3, maxZ: 3 },
  "lab-building": { minX: -6, maxX: 6, minZ: -4, maxZ: 4 },
  gatehouse: { minX: -5.15, maxX: 5.15, minZ: -0.15, maxZ: 6.15 },
  "nine-tier-pagoda": { minX: -8.5, maxX: 8.5, minZ: -8.5, maxZ: 8.5 },
  "ruined-pagoda": { minX: -8, maxX: 8, minZ: -8, maxZ: 8 },
  "wooden-hall": { minX: -8, maxX: 8, minZ: -6.5, maxZ: 6.5 },
};

/** Map a model slot's `proceduralFallback` key to a building kind. */
export function buildingKindFor(fallback: string): BuildingKind | null {
  const key = fallback.replace("procedural:", "");
  return key in FOOTPRINTS ? (key as BuildingKind) : null;
}

export interface PlacedBuilding {
  id: string;
  kind: BuildingKind;
  x: number;
  z: number;
  rotDeg: number;
  style?: BuildingStyle;
  /** Present when this building is a data model slot (so a .glb can replace it). */
  slot?: ExplorableLocation["scene"]["models"][number];
  bounds: Rect;
}

/** Rotate a local point by `deg` around Y (three.js convention). */
export function rotateY(x: number, z: number, deg: number): Vec2 {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
}

export function worldBounds(kind: BuildingKind, x: number, z: number, rotDeg: number): Rect {
  return worldBoundsRect(FOOTPRINTS[kind], x, z, rotDeg);
}

const inRect = (x: number, z: number, r: Rect, pad = 0) =>
  x >= r.minX - pad && x <= r.maxX + pad && z >= r.minZ - pad && z <= r.maxZ + pad;

function segDist(x: number, z: number, a: Vec2, b: Vec2) {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const len2 = abx * abx + abz * abz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * abx + (z - a[1]) * abz) / len2));
  return Math.hypot(x - (a[0] + abx * t), z - (a[1] + abz * t));
}

/** Signed distance to the nearest walkway/plaza edge (≤ 0 = on a path). */
export function distanceToPaths(layout: TownLayout, x: number, z: number): number {
  let d = Infinity;
  for (const p of layout.paths) {
    for (let i = 0; i < p.points.length - 1; i++) {
      d = Math.min(d, segDist(x, z, p.points[i] as Vec2, p.points[i + 1] as Vec2) - p.width / 2);
    }
  }
  for (const pl of layout.plazas) d = Math.min(d, Math.hypot(x - pl.x, z - pl.z) - pl.r);
  return d;
}

export function placeBuildings(layout: TownLayout, location: ExplorableLocation): PlacedBuilding[] {
  const out: PlacedBuilding[] = [];
  for (const slot of location.scene.models) {
    const kind = buildingKindFor(slot.proceduralFallback);
    if (!kind) continue;
    const [x, , z] = slot.position;
    const rot = slot.rotationDeg[1];
    out.push({ id: slot.slot, kind, x, z, rotDeg: rot, style: layout.slotStyles[slot.slot], slot, bounds: worldBounds(kind, x, z, rot) });
  }
  layout.extraBuildings.forEach((b, i) =>
    out.push({ id: `extra-${i}`, kind: b.kind, x: b.x, z: b.z, rotDeg: b.rot, style: b.style, bounds: worldBounds(b.kind, b.x, b.z, b.rot) }),
  );
  return out;
}

export interface ResolvedTown {
  buildings: PlacedBuilding[];
  broadleaf: TreeSpec[];
  conifers: TreeSpec[];
  tallGrass: GrassBlade[];
  lawn: GrassBlade[];
  colliders: Collider[];
}

/** Derive everything procedural (trees, grass, colliders) from a layout + its location data. Deterministic per seed. */
export function resolveTown(layout: TownLayout, location: ExplorableLocation): ResolvedTown {
  const seed = location.scene.seed;
  const rng = createRng(seed);
  const buildings = placeBuildings(layout, location);
  const spawn = location.camera.ground.spawn;

  const inWater = (x: number, z: number, pad = 0) =>
    (layout.sea ? z > layout.sea.shoreZ - 6 - pad : false) ||
    (layout.lake ? Math.hypot(x - layout.lake.x, z - layout.lake.z) < layout.lake.r + 2.5 + pad : false);
  const onBuilding = (x: number, z: number, pad: number) => buildings.some((b) => inRect(x, z, b.bounds, pad));
  const inTallGrass = (x: number, z: number) => layout.tallGrass.some((p) => pointInPolygon([x, z], p));
  const inBed = (x: number, z: number, pad: number) => layout.flowerBeds.some((f) => Math.hypot(x - f.x, z - f.z) < f.r + pad);
  const nearProp = (x: number, z: number, pad: number) =>
    Object.values(layout.props).some((list) => (list ?? []).some((p) => Math.hypot(p.x - x, p.z - z) < pad));
  const nearFence = (x: number, z: number, pad: number) =>
    layout.fences.some((f) => f.some((pt, i) => i > 0 && segDist(x, z, f[i - 1] as Vec2, pt) < pad));

  /* Trees */
  const t = layout.trees;
  const trees: TreeSpec[] = [];
  const tooClose = (x: number, z: number, min: number) => trees.some((tr) => (tr.x - x) ** 2 + (tr.z - z) ** 2 < min * min);
  const height = () => t.height[0] + rng() * (t.height[1] - t.height[0]);
  const beltTarget = Math.round(((2 * t.belt.outer) ** 2 - (2 * t.belt.inner) ** 2) / (t.belt.spacing * t.belt.spacing * 1.15));
  for (let i = 0; i < beltTarget * 12 && trees.length < beltTarget; i++) {
    const x = (rng() * 2 - 1) * t.belt.outer;
    const z = (rng() * 2 - 1) * t.belt.outer;
    if (Math.max(Math.abs(x), Math.abs(z)) < t.belt.inner) continue;
    if (t.gaps.some((g) => inRect(x, z, g)) || inWater(x, z) || onBuilding(x, z, 2) || tooClose(x, z, t.belt.spacing)) continue;
    trees.push({ x, z, height: height(), tint: rng(), seed: Math.floor(rng() * 1e9) });
  }
  const inner = t.belt.inner - 1.5;
  const spacing = t.interiorSpacing ?? 6;
  const clearance = t.pathClearance ?? 2.4;
  for (let i = 0, placed = 0; i < t.interior * 80 && placed < t.interior; i++) {
    const x = (rng() * 2 - 1) * inner;
    const z = (rng() * 2 - 1) * inner;
    if (distanceToPaths(layout, x, z) < clearance || onBuilding(x, z, 2.5) || inWater(x, z, 1) || inTallGrass(x, z)) continue;
    if (inBed(x, z, 1.5) || nearProp(x, z, 2.5) || nearFence(x, z, 1.2) || tooClose(x, z, spacing)) continue;
    if (Math.hypot(x - spawn[0], z - spawn[2]) < 5) continue;
    trees.push({ x, z, height: height() * 0.85, tint: rng(), seed: Math.floor(rng() * 1e9) });
    placed++;
  }
  const isConifer = (tr: TreeSpec) => t.kind === "conifer" || (t.kind === "mixed" && tr.seed % 3 !== 0);
  const conifers = trees.filter(isConifer);
  const broadleaf = trees.filter((tr) => !isConifer(tr));

  /* Grass */
  const tallGrass: GrassBlade[] = [];
  for (const patch of layout.tallGrass) {
    const xs = patch.map((p) => p[0]);
    const zs = patch.map((p) => p[1]);
    const [minX, maxX, minZ, maxZ] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const target = Math.floor((maxX - minX) * (maxZ - minZ) * 13);
    for (let i = 0; i < target; i++) {
      const x = minX + rng() * (maxX - minX);
      const z = minZ + rng() * (maxZ - minZ);
      if (!pointInPolygon([x, z], patch) || distanceToPaths(layout, x, z) < 0.4 || onBuilding(x, z, 0.5)) continue;
      tallGrass.push({ x, z, rot: rng() * Math.PI * 2, height: 0.85 + rng() * 0.55, width: 0.09 + rng() * 0.06, tint: rng() });
    }
  }
  const lawn: GrassBlade[] = [];
  const half = layout.groundHalf - 2;
  for (let i = 0; i < layout.lawnTufts * 3 && lawn.length < layout.lawnTufts; i++) {
    const x = (rng() * 2 - 1) * half;
    const z = (rng() * 2 - 1) * half;
    if (distanceToPaths(layout, x, z) < 0.25 || onBuilding(x, z, 0.3) || inWater(x, z, -2) || inTallGrass(x, z) || inBed(x, z, 0.2)) continue;
    lawn.push({ x, z, rot: rng() * Math.PI * 2, height: 0.15 + rng() * 0.2, width: 0.06 + rng() * 0.04, tint: rng() });
  }

  /* Colliders */
  const b = location.camera.ground.bounds;
  const insideBounds = (x: number, z: number) => x > b.min[0] - 2 && x < b.max[0] + 2 && z > b.min[1] - 2 && z < b.max[1] + 2;
  const colliders: Collider[] = [
    ...buildings.map((bd) => box(bd.bounds.minX, bd.bounds.minZ, bd.bounds.maxX, bd.bounds.maxZ)),
    ...trees.filter((tr) => insideBounds(tr.x, tr.z)).map((tr) => circle(tr.x, tr.z, isConifer(tr) ? 0.55 : 0.45)),
    ...layout.flowerBeds.map((f) => circle(f.x, f.z, f.r + 0.15)),
    ...(layout.props.signposts ?? []).map((p) => circle(p.x, p.z, 0.3)),
    ...(layout.props.mailboxes ?? []).map((p) => circle(p.x, p.z, 0.3)),
    ...(layout.props.lanterns ?? []).map((p) => circle(p.x, p.z, 0.55)),
    ...(layout.props.windmills ?? []).map((p) => circle(p.x, p.z, 1.3)),
    ...(layout.props.trucks ?? []).map((p) => {
      const r = worldBoundsRect({ minX: -1.3, maxX: 1.3, minZ: -3.2, maxZ: 3.2 }, p.x, p.z, p.rot ?? 0);
      return box(r.minX, r.minZ, r.maxX, r.maxZ);
    }),
    ...(layout.props.logs ?? []).map((p) => {
      const r = worldBoundsRect({ minX: -0.55, maxX: 0.55, minZ: -3, maxZ: 3 }, p.x, p.z, p.rot ?? 0);
      return box(r.minX, r.minZ, r.maxX, r.maxZ);
    }),
    ...(layout.props.torii ?? []).flatMap((p) => {
      const l = rotateY(-2.6, 0, p.rot ?? 0);
      const r = rotateY(2.6, 0, p.rot ?? 0);
      return [circle(p.x + l[0], p.z + l[1], 0.4), circle(p.x + r[0], p.z + r[1], 0.4)];
    }),
    ...layout.fences.flatMap((f) =>
      f.slice(1).map((pt, i) => {
        const a = f[i] as Vec2;
        return box(Math.min(a[0], pt[0]) - 0.12, Math.min(a[1], pt[1]) - 0.12, Math.max(a[0], pt[0]) + 0.12, Math.max(a[1], pt[1]) + 0.12);
      }),
    ),
  ];
  if (layout.lake) colliders.push(circle(layout.lake.x, layout.lake.z, layout.lake.r - 0.3));

  return { buildings, broadleaf, conifers, tallGrass, lawn, colliders };
}

export function worldBoundsRect(f: Rect, x: number, z: number, rotDeg: number): Rect {
  const c = [rotateY(f.minX, f.minZ, rotDeg), rotateY(f.maxX, f.minZ, rotDeg), rotateY(f.minX, f.maxZ, rotDeg), rotateY(f.maxX, f.maxZ, rotDeg)];
  return {
    minX: x + Math.min(...c.map((p) => p[0])),
    maxX: x + Math.max(...c.map((p) => p[0])),
    minZ: z + Math.min(...c.map((p) => p[1])),
    maxZ: z + Math.max(...c.map((p) => p[1])),
  };
}
