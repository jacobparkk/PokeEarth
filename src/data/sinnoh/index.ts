import type { RegionDefinition } from "@/types/world";
import { sinnohGeography } from "./geography";
import { sinnohLocations } from "./locations";

export const sinnoh: RegionDefinition = {
  id: "sinnoh",
  status: "available",
  name: "Sinnoh",
  generation: 4,
  tagline: "A northern land of snowy peaks, ancient myths and the great Mt. Coronet.",
  theme: {
    accent: "#7f8fd6",
    seaDeep: "#1b3a57",
    seaShallow: "#5a93b3",
    land: "#aec58a",
    landShade: "#849f63",
    sand: "#e6d9ad",
    forest: "#3e7444",
    forestShade: "#26502d",
    rock: "#8e8a86",
    rockShade: "#5e5a58",
    route: "#f1e6c6",
    routeEdge: "#97805e",
  },
  geography: sinnohGeography,
  initialView: { center: [500, 320], zoom: 1 },
  audio: {
    mapTheme: {
      id: "sinnoh-region-map",
      title: "Sinnoh Region Map Theme",
      src: ["/audio/sinnoh/music/region-map.ogg", "/audio/sinnoh/music/region-map.mp3"],
      volume: 0.5,
      loop: true,
      fadeInMs: 1500,
      fadeOutMs: 1200,
    },
  },
  locations: sinnohLocations,
};
