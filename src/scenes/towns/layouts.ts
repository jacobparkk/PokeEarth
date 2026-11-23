import type { SceneKey } from "@/types/world";
import type { TownLayout } from "./types";

/*
 * Town layouts (scene metres, −z = north). Building positions for houses,
 * labs, gates and towers come from each location's `scene.models` in the
 * region data; these layouts add streets, water, greenery and props.
 */

const pallet: TownLayout = {
  groundHalf: 44,
  palette: { grass: "#74983f", grassDark: "#5b7d33", grassLight: "#8fae52", dirt: "#cdb68a", stone: "#c9c2b0", gravel: "#c8b893", sand: "#ead9a8" },
  paths: [
    { points: [[0, -46], [0, -14], [0, 0], [0, 24]], width: 3, surface: "dirt" },
    { points: [[-18, -1], [18, -1]], width: 2.6, surface: "dirt" },
    { points: [[-8, -4.6], [-8, -1]], width: 1.8, surface: "dirt" },
    { points: [[8, -4.6], [8, -1]], width: 1.8, surface: "dirt" },
    { points: [[8.5, 4.4], [8.5, -1]], width: 2.2, surface: "dirt" },
  ],
  plazas: [{ x: 0, z: -1, r: 3.4, surface: "dirt" }],
  sea: { shoreZ: 31 },
  tallGrass: [[[-8, -27], [8, -27], [9, -44], [-9, -44]]],
  flowerBeds: [
    { x: -14, z: 8.5, r: 1.6 },
    { x: -9, z: 8.5, r: 1.6 },
    { x: -14, z: 13, r: 1.6 },
    { x: -9, z: 13, r: 1.6 },
  ],
  fences: [[[-11.5, 5.5], [-17, 5.5], [-17, 16], [-6, 16], [-6, 8.5]]],
  slotStyles: {
    "player-house": { roof: "#c0443a", wall: "#f4ead2" },
    "rival-house": { roof: "#3b6ea8", wall: "#efe6d2" },
    "oak-lab": { roof: "#5f7d9a" },
  },
  extraBuildings: [],
  props: {
    signposts: [{ x: 2.6, z: -14 }, { x: -3.2, z: 3.2, rot: 0 }],
    mailboxes: [{ x: -5.6, z: -3.6 }, { x: 10.4, z: -3.6 }],
  },
  trees: {
    kind: "broadleaf",
    canopy: ["#4a7f35", "#7fa44a"],
    trunk: "#5a4030",
    belt: { inner: 29, outer: 58, spacing: 4.4 },
    gaps: [{ minX: -9, maxX: 9, minZ: -60, maxZ: -24 }],
    interior: 7,
    height: [6, 11],
  },
  lawnTufts: 20000,
  shadowExtent: 48,
};

const newBark: TownLayout = {
  groundHalf: 50,
  palette: { grass: "#78993f", grassDark: "#5c7c33", grassLight: "#94b055", dirt: "#c9b083", stone: "#c4bcaa", gravel: "#c8b893", sand: "#e8d6a2" },
  paths: [
    { points: [[-52, 2], [24, 2]], width: 3.2, surface: "dirt" },
    { points: [[-12, -1.9], [-12, 2]], width: 2.2, surface: "dirt" },
    { points: [[12, -4.6], [12, 2]], width: 1.8, surface: "dirt" },
    { points: [[10, 8.6], [10, 2]], width: 1.8, surface: "dirt" },
    { points: [[0, 2], [0, 31]], width: 2.6, surface: "dirt" },
    { points: [[0, 2], [0, -20], [3, -27]], width: 2, surface: "dirt" },
  ],
  plazas: [{ x: 0, z: 2, r: 4, surface: "dirt" }],
  sea: { shoreZ: 38 },
  tallGrass: [[[-34, -8], [-50, -8], [-50, 12], [-34, 12]]],
  flowerBeds: [
    { x: 4.5, z: -5.5, r: 1.4 },
    { x: -4.5, z: -5.5, r: 1.4 },
    { x: -5.5, z: 10, r: 1.6 },
  ],
  fences: [
    [[7, -13], [17, -13]],
    [[5, 17], [15, 17]],
  ],
  slotStyles: {
    "player-house": { roof: "#a8483a" },
    "neighbor-house": { roof: "#4f7a5a", wall: "#efe7d6" },
    "elm-lab": { roof: "#6b8aa3" },
  },
  extraBuildings: [],
  props: {
    windmills: [{ x: -20, z: -24, rot: 15 }, { x: 20, z: -26, rot: -10 }, { x: 5, z: -30, rot: 5 }],
    signposts: [{ x: -30, z: 5.2, rot: 90 }, { x: 3.2, z: 5.6 }],
    mailboxes: [{ x: 14.6, z: -3.6 }, { x: 7.6, z: 7.6, rot: 180 }],
  },
  trees: {
    kind: "broadleaf",
    canopy: ["#4f8538", "#87a84e"],
    trunk: "#5a4030",
    belt: { inner: 35, outer: 64, spacing: 4.6 },
    gaps: [{ minX: -72, maxX: -30, minZ: -9, maxZ: 13 }],
    interior: 6,
    height: [6, 11],
  },
  lawnTufts: 24000,
  shadowExtent: 56,
};

const littleroot: TownLayout = {
  groundHalf: 44,
  palette: { grass: "#6f9c3a", grassDark: "#557f2c", grassLight: "#8fb84e", dirt: "#d0b583", stone: "#cbc4b2", gravel: "#cbb98f", sand: "#ecdba8" },
  paths: [
    { points: [[0, -7.9], [0, 18]], width: 2.6, surface: "dirt" },
    { points: [[-9, 5.4], [-9, 9], [9, 9], [9, 5.4]], width: 2, surface: "dirt" },
    { points: [[0, -4], [15, -4], [15, -46]], width: 2.4, surface: "dirt" },
  ],
  plazas: [{ x: 0, z: 9, r: 3, surface: "dirt" }],
  tallGrass: [[[8.5, -20], [22, -20], [22, -44], [8.5, -44]]],
  flowerBeds: [
    { x: -5, z: 13, r: 1.3 },
    { x: 5, z: 13, r: 1.3 },
    { x: -17, z: 9, r: 1.8 },
    { x: 17, z: 9, r: 1.8 },
    { x: -7, z: -4, r: 1.2 },
  ],
  fences: [[[12, 14.5], [20, 14.5]]],
  slotStyles: {
    "player-house": { roof: "#d0613f", wall: "#f6ecd6" },
    "neighbor-house": { roof: "#4f86b8", wall: "#f3ead8" },
    "birch-lab": { roof: "#6f8f5a" },
  },
  extraBuildings: [],
  props: {
    signposts: [{ x: 3, z: 16.5 }, { x: 17.2, z: -7, rot: -90 }],
    mailboxes: [{ x: -6, z: 7 }, { x: 12, z: 7 }],
    trucks: [{ x: -17.5, z: 1.5, rot: 0 }],
  },
  trees: {
    kind: "broadleaf",
    canopy: ["#3e8a35", "#86b84a"],
    trunk: "#5c4330",
    belt: { inner: 29, outer: 58, spacing: 4.2 },
    gaps: [{ minX: 8, maxX: 22, minZ: -60, maxZ: -24 }],
    interior: 9,
    height: [6, 11],
  },
  lawnTufts: 22000,
  shadowExtent: 48,
};

const twinleaf: TownLayout = {
  groundHalf: 46,
  palette: { grass: "#6a8a45", grassDark: "#516e36", grassLight: "#869f58", dirt: "#c2ac86", stone: "#c2bdb2", gravel: "#bfb197", sand: "#ddcfa6" },
  paths: [
    { points: [[0, -23.9], [0, 18]], width: 2.6, surface: "dirt" },
    { points: [[-14, 0], [14, 0]], width: 2.4, surface: "dirt" },
    { points: [[-8, -2.6], [-8, 0]], width: 1.8, surface: "dirt" },
    { points: [[8, -2.6], [8, 0]], width: 1.8, surface: "dirt" },
    { points: [[0, 10], [-12, 16], [-19, 19]], width: 2, surface: "dirt" },
  ],
  plazas: [{ x: 0, z: 0, r: 3, surface: "dirt" }],
  lake: { x: -30, z: 24, r: 10 },
  tallGrass: [[[-24, 4], [-14, 4], [-14, 10], [-24, 10]]],
  flowerBeds: [
    { x: 4, z: 6, r: 1.2 },
    { x: -4, z: 6, r: 1.2 },
  ],
  fences: [
    [[-13, -11], [-3, -11]],
    [[3, -11], [13, -11]],
  ],
  slotStyles: {
    "player-house": { roof: "#a54a3c", wall: "#efe6d3" },
    "rival-house": { roof: "#46657f", wall: "#ece4d4" },
  },
  extraBuildings: [],
  props: {
    signposts: [{ x: 3.2, z: -20 }],
    mailboxes: [{ x: -4.6, z: -1.6 }, { x: 11.6, z: -1.6 }],
  },
  trees: {
    kind: "mixed",
    canopy: ["#2f5e3a", "#4f7d45"],
    trunk: "#4a3628",
    belt: { inner: 29, outer: 58, spacing: 4.2 },
    gaps: [{ minX: -7, maxX: 7, minZ: -60, maxZ: -22 }],
    interior: 8,
    height: [7, 13],
  },
  lawnTufts: 20000,
  shadowExtent: 48,
};

/* Ecruteak: townhouses line the stone streets; the Bell Tower rises in the north-east. */
const machiyaRow = (x: number, rot: number, zs: number[]) => zs.map((z) => ({ kind: "machiya" as const, x, z, rot }));

const ecruteak: TownLayout = {
  groundHalf: 90,
  palette: { grass: "#7d8a45", grassDark: "#5f6b33", grassLight: "#9a9a52", dirt: "#b89f78", stone: "#bdb3a1", gravel: "#b5a688", sand: "#d8c79c", leaves: "#c96a2b" },
  paths: [
    { points: [[0, 62], [0, -40]], width: 4.5, surface: "stone" },
    { points: [[-24, -10], [50, -10]], width: 4, surface: "stone" },
    { points: [[0, -40], [14, -52], [38, -59]], width: 3.5, surface: "stone" },
    { points: [[0, 5], [18, 5]], width: 3, surface: "stone" },
  ],
  plazas: [{ x: 0, z: -10, r: 6, surface: "stone" }],
  tallGrass: [[[-60, 20], [-46, 20], [-46, 40], [-60, 40]]],
  flowerBeds: [
    { x: 14, z: 14.5, r: 1.4 },
    { x: 14, z: -4.5, r: 1.4 },
  ],
  fences: [],
  slotStyles: {},
  extraBuildings: [
    ...machiyaRow(-9, 90, [44, 32, 20, 8, -24, -36]),
    ...machiyaRow(9, -90, [44, 32, 20, -24, -36]),
    { kind: "machiya", x: 12, z: -17, rot: 0 },
    { kind: "machiya", x: 22, z: -17, rot: 0 },
    { kind: "machiya", x: 40, z: -3, rot: 180 },
    { kind: "machiya", x: -13, z: -3, rot: 180 },
    { kind: "machiya", x: -21, z: -3, rot: 180, style: { wall: "#5a4130" } },
  ],
  props: {
    lanterns: [50, 38, 26, 14, -22, -34].flatMap((z) => [{ x: -3.3, z }, { x: 3.3, z }]).concat([
      { x: 16, z: 2.2 },
      { x: 16, z: 7.8 },
      { x: -22, z: -13.6 },
      { x: -22, z: -6.4 },
      { x: 34, z: -55 },
      { x: 30, z: -61.5 },
    ]),
    torii: [{ x: 14, z: -52, rot: 131 }, { x: 0, z: -38, rot: 0 }],
  },
  trees: {
    kind: "broadleaf",
    canopy: ["#c8461f", "#e8a23a"],
    trunk: "#4a3328",
    belt: { inner: 64, outer: 96, spacing: 5 },
    gaps: [{ minX: -9, maxX: 9, minZ: 58, maxZ: 100 }],
    interior: 26,
    height: [6, 10],
  },
  lawnTufts: 30000,
  shadowExtent: 92,
};

/* Viridian Forest: a winding trail through dense woods between two gatehouses, with tall-grass clearings. */
const viridianForest: TownLayout = {
  groundHalf: 56,
  palette: { grass: "#4f6e2e", grassDark: "#3a5524", grassLight: "#6b8a3a", dirt: "#9c845f", stone: "#a9a394", gravel: "#a38f6c", sand: "#cdbb90", leaves: "#6e5a32" },
  paths: [
    {
      points: [[0, 47], [0, 30], [-20, 30], [-20, 12], [10, 12], [10, -6], [-16, -6], [-16, -24], [16, -24], [16, -38], [0, -38], [0, -47]],
      width: 2.6,
      surface: "dirt",
    },
    { points: [[10, 12], [30, 12], [30, 26]], width: 2.2, surface: "dirt" },
    { points: [[-16, -6], [-34, -6], [-34, 4]], width: 2.2, surface: "dirt" },
  ],
  plazas: [],
  tallGrass: [
    [[-26, 24], [-14, 24], [-14, 36], [-26, 36]],
    [[-4, 5], [16, 5], [16, 18], [-4, 18]],
    [[-22, -30], [-10, -30], [-10, -12], [-22, -12]],
    [[8, -44], [22, -44], [22, -30], [8, -30]],
    [[24, 17], [36, 17], [36, 30], [24, 30]],
    [[-40, -2], [-28, -2], [-28, 8], [-40, 8]],
  ],
  flowerBeds: [],
  fences: [],
  slotStyles: {},
  extraBuildings: [],
  props: {
    signposts: [{ x: 3.2, z: 40 }, { x: -23.4, z: 27, rot: 90 }, { x: 3.2, z: -42 }],
    logs: [{ x: -8, z: 24, rot: 20 }, { x: 22, z: 2, rot: -40 }, { x: -28, z: -16, rot: 75 }, { x: 6, z: -31, rot: 100 }, { x: 34, z: -10, rot: 10 }],
    mushrooms: [{ x: -6, z: 20 }, { x: 14, z: -12 }, { x: -25, z: 5 }, { x: 25, z: -33 }, { x: -9, z: -34 }, { x: 6, z: 36 }],
    sunbeams: [{ x: -20, z: 30 }, { x: 6, z: 11 }, { x: -16, z: -20 }, { x: 15, z: -36 }, { x: 30, z: 23 }, { x: -34, z: 2 }],
  },
  trees: {
    kind: "broadleaf",
    canopy: ["#2f5e2a", "#5f8f3a"],
    trunk: "#4a3526",
    belt: { inner: 46, outer: 70, spacing: 4.2 },
    gaps: [{ minX: -8, maxX: 8, minZ: 44, maxZ: 80 }, { minX: -8, maxX: 8, minZ: -80, maxZ: -44 }],
    interior: 520,
    interiorSpacing: 3.8,
    pathClearance: 2.6,
    height: [9, 15],
  },
  lawnTufts: 18000,
  shadowExtent: 62,
};

export const TOWN_LAYOUTS: Partial<Record<SceneKey, TownLayout>> = {
  "pallet-town": pallet,
  "new-bark-town": newBark,
  "littleroot-town": littleroot,
  "twinleaf-town": twinleaf,
  "ecruteak-city": ecruteak,
  "viridian-forest": viridianForest,
};
