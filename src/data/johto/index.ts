import type { RegionDefinition } from "@/types/world";
import { johtoGeography } from "./geography";
import { johtoLocations } from "./locations";

export const johto: RegionDefinition = {
  id: "johto",
  status: "available",
  name: "Johto",
  generation: 2,
  tagline: "Old traditions, legendary towers and a land shaped by the seasons.",
  theme: {
    accent: "#f2c14e",
    seaDeep: "#16425b",
    seaShallow: "#4f9db5",
    land: "#b7cf8a",
    landShade: "#8fb067",
    sand: "#ecdcaa",
    forest: "#4f8a3c",
    forestShade: "#2f5f2a",
    rock: "#9a8771",
    rockShade: "#6c5b4b",
    route: "#f3e3b5",
    routeEdge: "#a3835a",
  },
  geography: johtoGeography,
  initialView: { center: [505, 318], zoom: 1 },
  audio: {
    mapTheme: {
      id: "johto-region-map",
      title: "Region Map Theme",
      src: ["/audio/johto/music/region-map.ogg", "/audio/johto/music/region-map.mp3"],
      volume: 0.5,
      loop: true,
      fadeInMs: 1500,
      fadeOutMs: 1200,
    },
  },
  locations: johtoLocations,
};
