import type { Polygon, Vec2 } from "@/types/world";

/**
 * Per-town scene layout. Buildings that are model slots (houses, labs, gates,
 * towers) come from the location data; everything else is described here.
 * Scene metres, origin at the town centre, −z = north.
 */

export type BuildingKind =
  | "gable-house"
  | "machiya"
  | "lab-building"
  | "gatehouse"
  | "nine-tier-pagoda"
  | "ruined-pagoda"
  | "wooden-hall";

export interface BuildingStyle {
  wall?: string;
  roof?: string;
  trim?: string;
}

export interface Circle {
  x: number;
  z: number;
  r: number;
}

export interface TownPath {
  points: readonly Vec2[];
  width: number;
  surface: "dirt" | "stone" | "gravel";
}

export interface PropPlacement {
  x: number;
  z: number;
  /** Degrees around Y; 0 = facing +z (south). */
  rot?: number;
}

export interface ExtraBuilding {
  kind: BuildingKind;
  x: number;
  z: number;
  rot: number;
  style?: BuildingStyle;
}

/** Axis-aligned rectangle in XZ, used to keep tree belts out of exits and views. */
export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface TownLayout {
  /** Half-size of the painted ground texture in metres. */
  groundHalf: number;
  palette: {
    grass: string;
    grassDark: string;
    grassLight: string;
    dirt: string;
    stone: string;
    gravel: string;
    sand: string;
    /** Fallen-leaf speckle colour (autumn towns). */
    leaves?: string;
  };
  paths: readonly TownPath[];
  plazas: readonly (Circle & { surface: TownPath["surface"] })[];
  /** Open sea for z > shoreZ (beach above it). */
  sea?: { shoreZ: number };
  lake?: Circle;
  tallGrass: readonly Polygon[];
  flowerBeds: readonly Circle[];
  /** Picket fences: axis-aligned polylines. */
  fences: readonly (readonly Vec2[])[];
  /** Style overrides for data model slots, keyed by slot name. */
  slotStyles: Readonly<Record<string, BuildingStyle>>;
  /** Buildings that aren't model slots (e.g. Ecruteak's townhouses). */
  extraBuildings: readonly ExtraBuilding[];
  props: {
    signposts?: readonly PropPlacement[];
    mailboxes?: readonly PropPlacement[];
    lanterns?: readonly PropPlacement[];
    torii?: readonly PropPlacement[];
    windmills?: readonly PropPlacement[];
    trucks?: readonly PropPlacement[];
    /** Fallen, mossy logs (forests). */
    logs?: readonly PropPlacement[];
    /** Centres of small mushroom clusters. */
    mushrooms?: readonly PropPlacement[];
    /** Shafts of sunlight slanting through the canopy, aimed at the sun. */
    sunbeams?: readonly PropPlacement[];
  };
  trees: {
    kind: "broadleaf" | "conifer" | "mixed";
    canopy: readonly [string, string];
    trunk: string;
    /** Trees fill the square band between these half-sizes. */
    belt: { inner: number; outer: number; spacing: number };
    /** Openings in the belt (route exits, sea views). */
    gaps: readonly Rect[];
    /** Extra shade trees scattered inside the town. */
    interior: number;
    /** Minimum spacing between interior trees (default 6 m; forests go much denser). */
    interiorSpacing?: number;
    /** How far interior trees keep from walkway edges (default 2.4 m). */
    pathClearance?: number;
    height: readonly [number, number];
  };
  lawnTufts: number;
  shadowExtent: number;
}
