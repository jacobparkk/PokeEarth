import type { HexColor, LocationKind, MapPlacement, PreviewLocation, RegionId, Vec2 } from "@/types/world";

interface ComingSoonInput {
  id: string;
  name: string;
  kind: LocationKind;
  at: Vec2;
  label: MapPlacement["labelSide"];
  tier: MapPlacement["importance"];
  summary: string;
  tagline: string;
  palette: readonly [HexColor, HexColor, HexColor];
  highlights: readonly string[];
  focusZoom?: number;
}

/**
 * Compact builder for map pins whose 3D scene isn't built yet.
 * To make one explorable later, replace it with a full `ExplorableLocation` object.
 */
export const comingSoon =
  (regionId: RegionId) =>
  (i: ComingSoonInput): PreviewLocation => ({
    id: i.id,
    regionId,
    name: i.name,
    kind: i.kind,
    status: "coming-soon",
    summary: i.summary,
    map: { position: i.at, labelSide: i.label, importance: i.tier, focusZoom: i.focusZoom ?? 7 },
    preview: { tagline: i.tagline, palette: i.palette, highlights: i.highlights },
  });
