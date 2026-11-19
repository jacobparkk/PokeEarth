import type { RegionDefinition } from "@/types/world";
import { hoennGeography } from "./geography";
import { hoennLocations } from "./locations";

export const hoenn: RegionDefinition = {
  id: "hoenn",
  status: "available",
  name: "Hoenn",
  generation: 3,
  tagline: "A land of volcanoes, rainforest and endless sea routes.",
  theme: {
    accent: "#2fb7a8",
    seaDeep: "#0f4c63",
    seaShallow: "#3fb2c4",
    land: "#a7d17e",
    landShade: "#78ad5a",
    sand: "#f1e1a6",
    forest: "#3f8f3f",
    forestShade: "#24602c",
    rock: "#8f7c69",
    rockShade: "#5f4e40",
    route: "#f6e8c0",
    routeEdge: "#9f7f55",
  },
  geography: hoennGeography,
  initialView: { center: [520, 320], zoom: 1 },
  audio: {
    mapTheme: {
      id: "hoenn-region-map",
      title: "Hoenn Region Map Theme",
      src: ["/audio/hoenn/music/region-map.ogg", "/audio/hoenn/music/region-map.mp3"],
      volume: 0.5,
      loop: true,
      fadeInMs: 1500,
      fadeOutMs: 1200,
    },
  },
  locations: hoennLocations,
};
