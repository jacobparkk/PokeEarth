import {
  isExplorable,
  type ExplorableLocation,
  type LocationDefinition,
  type RegionDefinition,
  type RegionEntry,
  type RegionId,
} from "@/types/world";
import { hoenn } from "./hoenn";
import { johto } from "./johto";
import { kanto } from "./kanto";
import { sinnoh } from "./sinnoh";

/**
 * Region registry — the single entry point the UI reads from.
 *
 * To add a region (e.g. Unova): add its id to `RegionId`, create
 * `src/data/<region>/{geography,locations,index}.ts` exporting a `RegionDefinition`,
 * and append it here. A `LockedRegion` stub shows a tab before the data exists.
 */
export const REGIONS: readonly RegionEntry[] = [kanto, johto, hoenn, sinnoh];

export const DEFAULT_REGION_ID: RegionId = "johto";

export function getRegion(id: RegionId): RegionDefinition | null {
  const entry = REGIONS.find((r) => r.id === id);
  return entry && entry.status === "available" ? entry : null;
}

export function getLocation(regionId: RegionId, locationId: string): LocationDefinition | null {
  return getRegion(regionId)?.locations.find((l) => l.id === locationId) ?? null;
}

export function getExplorableLocation(regionId: RegionId, locationId: string): ExplorableLocation | null {
  const loc = getLocation(regionId, locationId);
  return loc && isExplorable(loc) ? loc : null;
}

/** Explorable first, then by map importance, then alphabetical. */
export function sortLocationsForList(locations: readonly LocationDefinition[]): LocationDefinition[] {
  return [...locations].sort((a, b) => {
    if (a.status !== b.status) return a.status === "explorable" ? -1 : 1;
    if (a.map.importance !== b.map.importance) return a.map.importance - b.map.importance;
    return a.name.localeCompare(b.name);
  });
}
