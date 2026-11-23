import { boundary, circle, type Collider } from "@/engine/collision";
import { fbm, smoothstep } from "@/lib/noise";
import { createRng } from "@/lib/geometry";
import type { Vec3 } from "@/types/world";

/**
 * Mt. Chimney summit (scene metres, origin = crater centre, −z = north).
 * A lava lake sits inside a crater whose rim you can walk around; outside the
 * rim is an ash-covered plateau that falls away steeply into the haze.
 */
export const VOLCANO = {
  lavaRadius: 13,
  lavaY: -7,
  rimRadius: 24,
  rimHeight: 1.6,
  plateauRadius: 48,
  walkRadius: 46,
  terrainSize: 360,
  station: { x: -30, z: -26, rotDeg: 49 },
} as const;

export function volcanoHeight(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const n = fbm(x * 0.05, z * 0.05);
  const { lavaRadius, lavaY, rimRadius, rimHeight, plateauRadius } = VOLCANO;
  if (r < rimRadius) {
    // Crater bowl: steep inner wall rising from the lava to the rim.
    const t = smoothstep(lavaRadius - 1, rimRadius, r);
    return lavaY - 0.6 + Math.pow(t, 1.35) * (rimHeight - lavaY + 0.6) + n * 0.8 * t;
  }
  // Rim crest eases down to the plateau, which carries gentle ash dunes.
  const crest = rimHeight * (1 - smoothstep(rimRadius, rimRadius + 6, r));
  const plateau = n * 0.55 + fbm(x * 0.17, z * 0.17, 2) * 0.15;
  if (r < plateauRadius) return crest + plateau;
  // Beyond the plateau the mountain drops away, rougher the farther you look.
  const d = r - plateauRadius;
  return plateau - Math.pow(d, 1.5) * 0.36 + fbm(x * 0.02, z * 0.02) * d * 0.25;
}

/** Linear-space vertex colours: pale ash on the plateau, dark basalt in the crater, ember-red near the lava. */
export function volcanoColor(x: number, z: number, h: number, slope: number): [number, number, number] {
  const r = Math.hypot(x, z);
  const n = fbm(x * 0.11 + 3.3, z * 0.11 - 1.7);
  const ash: [number, number, number] = [0.32 + n * 0.06, 0.29 + n * 0.05, 0.27 + n * 0.05];
  const basalt: [number, number, number] = [0.09, 0.075, 0.07];
  const ember: [number, number, number] = [0.42, 0.09, 0.03];
  const sulfur: [number, number, number] = [0.55, 0.48, 0.16];
  const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + ((b[i] as number) - v) * t) as [number, number, number];
  let c = mix(ash, basalt, Math.max(smoothstep(0.35, 0.75, slope), 1 - smoothstep(VOLCANO.rimRadius - 3, VOLCANO.rimRadius + 2, r)));
  c = mix(c, ember, 1 - smoothstep(VOLCANO.lavaRadius, VOLCANO.lavaRadius + 4.5, r));
  if (r > VOLCANO.rimRadius && r < VOLCANO.plateauRadius) c = mix(c, sulfur, smoothstep(0.42, 0.55, n) * 0.5);
  if (h < -30) c = mix(c, basalt, 0.4);
  return c;
}

export interface Boulder {
  x: number;
  y: number;
  z: number;
  s: number;
  rot: number;
}

export function buildVolcano(seed: number) {
  const rng = createRng(seed);
  const st = VOLCANO.station;
  const stationBox = { minX: st.x - 6.5, maxX: st.x + 6.5, minZ: st.z - 6.5, maxZ: st.z + 6.5 };
  const nearStation = (x: number, z: number) => x > stationBox.minX - 2 && x < stationBox.maxX + 2 && z > stationBox.minZ - 2 && z < stationBox.maxZ + 2;

  const boulders: Boulder[] = [];
  for (let i = 0; i < 4000 && boulders.length < 170; i++) {
    const a = rng() * Math.PI * 2;
    const r = VOLCANO.rimRadius + 2 + rng() * 110;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (nearStation(x, z) || Math.hypot(x, z - 38) < 6) continue;
    if (boulders.some((b) => Math.hypot(b.x - x, b.z - z) < 3.2)) continue;
    const s = r < VOLCANO.plateauRadius ? 0.4 + rng() * 1.6 : 1 + rng() * 4;
    boulders.push({ x, z, y: volcanoHeight(x, z), s, rot: rng() * Math.PI * 2 });
  }

  const vents: Vec3[] = [
    [16, 0, -15],
    [-19, 0, 9],
    [10, 0, 28],
    [-6, 0, -36],
    [31, 0, 12],
    // Fumaroles inside the crater wall
    [0, 0, -18],
    [15, 0, 8],
    [-14, 0, -8],
  ].map(([x, , z]) => [x!, volcanoHeight(x!, z!) + 0.1, z!] as Vec3);

  const colliders: Collider[] = [
    boundary(0, 0, VOLCANO.walkRadius),
    circle(0, 0, VOLCANO.rimRadius + 0.5),
    // The station is rotated, so approximate its footprint with circles along its long axis.
    ...[-3.6, 0, 3.6].map((lx) => {
      const a = (st.rotDeg * Math.PI) / 180;
      return circle(st.x + lx * Math.cos(a), st.z - lx * Math.sin(a), 3.9);
    }),
    ...boulders.filter((b) => Math.hypot(b.x, b.z) < VOLCANO.walkRadius && b.s > 0.7).map((b) => circle(b.x, b.z, b.s * 0.8)),
    ...vents.filter(([x, , z]) => Math.hypot(x, z) > VOLCANO.rimRadius + 1).map(([x, , z]) => circle(x, z, 0.9)),
  ];
  return { boulders, vents, colliders };
}
