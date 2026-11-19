import type { RegionDefinition } from "@/types/world";
import { kantoGeography } from "./geography";
import { kantoLocations } from "./locations";

export const kanto: RegionDefinition = {
  id: "kanto",
  status: "available",
  name: "Kanto",
  generation: 1,
  tagline: "Where it all started: bustling cities, a bike road by the sea and the Indigo Plateau.",
  theme: {
    accent: "#e8584a",
    seaDeep: "#173f5f",
    seaShallow: "#4a95b8",
    land: "#bcd08c",
    landShade: "#93ae66",
    sand: "#ecdcaa",
    forest: "#4a8540",
    forestShade: "#2c5a2a",
    rock: "#9b8a76",
    rockShade: "#6b5b4c",
    route: "#f5e6bd",
    routeEdge: "#a3835a",
  },
  geography: kantoGeography,
  initialView: { center: [450, 325], zoom: 1 },
  audio: {
    mapTheme: {
      id: "kanto-region-map",
      title: "Kanto Region Map Theme",
      src: ["/audio/kanto/music/region-map.ogg", "/audio/kanto/music/region-map.mp3"],
      volume: 0.5,
      loop: true,
      fadeInMs: 1500,
      fadeOutMs: 1200,
    },
  },
  locations: kantoLocations,
};
