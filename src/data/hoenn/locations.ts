import type { LocationDefinition } from "@/types/world";
import { comingSoon } from "../helpers";

const MUSIC = "/audio/hoenn/music";
const AMB = "/audio/hoenn/ambience";
const soon = comingSoon("hoenn");

export const hoennLocations: readonly LocationDefinition[] = [
  {
    id: "littleroot-town",
    regionId: "hoenn",
    name: "Littleroot Town",
    kind: "town",
    status: "explorable",
    summary:
      "A small town where the scent of fresh grass hangs in the air: a pair of homes, Professor Birch's lab and the route north into the wild.",
    map: { position: [300, 470], labelSide: "bottom", importance: 1, focusZoom: 7.5 },
    preview: {
      tagline: "A warm summer morning in a brand-new home.",
      palette: ["#bdeaf7", "#86c25b", "#fff3d6"],
      highlights: ["Professor Birch's lab", "Your new home", "Lush summer greenery", "Route 101 trailhead"],
    },
    camera: {
      aerial: { position: [0, 50, 55], lookAt: [0, 0, 0], fov: 50 },
      ground: {
        spawn: [0, 0, 14],
        yawDeg: 0,
        pitchDeg: 0,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.0,
        sprintMultiplier: 1.9,
        bounds: { min: [-26, -28], max: [26, 26] },
      },
      descentDurationMs: 2000,
    },
    environment: {
      timeOfDay: "morning",
      sun: { elevationDeg: 35, azimuthDeg: 120, color: "#fff4dc", intensity: 3.2, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#bfe9ff", groundColor: "#79a650", intensity: 0.75 },
      sky: { turbidity: 5, rayleigh: 1.5, mieCoefficient: 0.005, mieDirectionalG: 0.8 },
      fog: { color: "#e4f2f2", near: 70, far: 250 },
      weather: { type: "clear", cloudCover: 0.25, windStrength: 0.2, precipitation: 0, particles: "pollen" },
      postFx: { bloom: 0.35, vignette: 0.25, saturation: 1.15, exposure: 1.08 },
    },
    audio: {
      music: {
        id: "hoenn-littleroot-town",
        title: "Littleroot Town",
        src: [`${MUSIC}/littleroot-town.ogg`, `${MUSIC}/littleroot-town.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2000,
        fadeOutMs: 1500,
      },
      ambience: [
        { id: "lr-cicadas", label: "Summer insects", src: [`${AMB}/summer-insects.ogg`, `${AMB}/summer-insects.mp3`], volume: 0.3 },
        { id: "lr-birds", label: "Morning birds", src: [`${AMB}/birds-morning.ogg`, `${AMB}/birds-morning.mp3`], volume: 0.3 },
        { id: "lr-wind", label: "Warm breeze", src: [`${AMB}/wind-soft.ogg`, `${AMB}/wind-soft.mp3`], volume: 0.25, windDriven: true },
      ],
    },
    scene: {
      sceneKey: "littleroot-town",
      assetMode: "procedural",
      seed: 2002,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:town-ground-and-paths", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "birch-lab", url: null, proceduralFallback: "procedural:lab-building", position: [0, 0, -12], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "player-house", url: null, proceduralFallback: "procedural:gable-house", position: [-9, 0, 2], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "neighbor-house", url: null, proceduralFallback: "procedural:gable-house", position: [9, 0, 2], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  soon({ id: "oldale-town", name: "Oldale Town", kind: "town", at: [300, 410], label: "right", tier: 2, summary: "A small crossroads town just north of Littleroot with a Poké Mart and a friendly welcome.", tagline: "The first stop on every adventure.", palette: ["#c9e9a8", "#78b05a", "#f3e6c4"], highlights: ["Crossroads of three routes"] }),
  soon({ id: "petalburg-city", name: "Petalburg City", kind: "city", at: [210, 420], label: "bottom", tier: 1, summary: "A lakeside city of balance and harmony, home of a Normal-type gym.", tagline: "Ponds, flowers and a family gym.", palette: ["#a9d8b8", "#5d9c6f", "#f6efd9"], highlights: ["Normal-type gym", "Lakeside paths"] }),
  soon({ id: "petalburg-woods", name: "Petalburg Woods", kind: "landmark", at: [168, 330], label: "right", tier: 3, summary: "A dim forest on Route 104 full of mushrooms and Bug-types.", tagline: "Mossy trails under a thick canopy.", palette: ["#2e5e38", "#9ccc6a", "#18261a"], highlights: ["Mushroom groves", "Winding trails"], focusZoom: 8 }),
  soon({ id: "rustboro-city", name: "Rustboro City", kind: "city", at: [180, 240], label: "left", tier: 1, summary: "A city of stone and industry, home of the Devon Corporation and a Rock-type gym.", tagline: "Stone streets and corporate towers.", palette: ["#c7b9a3", "#6d7a8a", "#2f3540"], highlights: ["Devon Corporation", "Trainer's School"] }),
  soon({ id: "meteor-falls", name: "Meteor Falls", kind: "dungeon", at: [196, 112], label: "left", tier: 3, summary: "A cavern of waterfalls said to have been carved by falling meteors.", tagline: "Waterfalls in a meteor-carved cave.", palette: ["#3b5a7a", "#9fc5e0", "#1a2633"], highlights: ["Underground waterfalls", "Dragon lair"], focusZoom: 8 }),
  soon({ id: "dewford-town", name: "Dewford Town", kind: "town", at: [180, 562], label: "right", tier: 2, summary: "A tiny island fishing village with a cave-like Fighting-type gym.", tagline: "Fishing nets and sea breezes.", palette: ["#9ad8e8", "#f2deb0", "#3f7d8f"], highlights: ["Granite Cave", "Fishing pier"] }),
  soon({ id: "slateport-city", name: "Slateport City", kind: "city", at: [468, 468], label: "right", tier: 1, summary: "A lively port city of markets, shipyards and a museum of the sea.", tagline: "Market stalls by the shipyard.", palette: ["#5cc3d9", "#f6c27a", "#2c4a63"], highlights: ["Oceanic Museum", "Seaside market", "Shipyard"] }),
  soon({ id: "mauville-city", name: "Mauville City", kind: "city", at: [450, 300], label: "right", tier: 1, summary: "Hoenn's bright, electrified hub city at the centre of every route.", tagline: "The city of electricity and game corners.", palette: ["#f4e04d", "#5a7fa8", "#2a2f45"], highlights: ["Electric-type gym", "Cycling road", "Game corner"] }),
  soon({ id: "verdanturf-town", name: "Verdanturf Town", kind: "town", at: [370, 260], label: "bottom", tier: 2, summary: "A windswept town of clean air protected from volcanic ash by the mountains.", tagline: "Fresh air and a contest hall.", palette: ["#b9e0a0", "#6aa36d", "#efe6cf"], highlights: ["Contest hall", "Rusturf Tunnel"] }),
  soon({ id: "fallarbor-town", name: "Fallarbor Town", kind: "town", at: [300, 80], label: "bottom", tier: 2, summary: "A farming town dusted in volcanic ash from nearby Mt. Chimney.", tagline: "Ash-dusted fields and a contest hall.", palette: ["#c9c2b4", "#8d8676", "#f2e6c8"], highlights: ["Ash-covered fields", "Professor Cozmo's house"] }),
  soon({ id: "lavaridge-town", name: "Lavaridge Town", kind: "town", at: [340, 200], label: "bottom", tier: 2, summary: "A hot-spring town at the foot of the volcano, with a Fire-type gym.", tagline: "Hot springs at the volcano's foot.", palette: ["#f29e6d", "#c94f3d", "#f6e7d0"], highlights: ["Hot springs", "Fire-type gym"] }),
  soon({ id: "mt-chimney", name: "Mt. Chimney", kind: "dungeon", at: [374, 136], label: "right", tier: 1, summary: "Hoenn's active volcano, reached by cable car, with a smoking crater at its summit.", tagline: "Lava, ash and a cable car.", palette: ["#d8532f", "#5a4038", "#f2a654"], highlights: ["Volcanic crater", "Cable car", "Jagged Pass"] }),
  soon({ id: "fortree-city", name: "Fortree City", kind: "city", at: [620, 112], label: "right", tier: 1, summary: "A city of tree houses linked by rope bridges, deep in the rainforest.", tagline: "Treehouses above the canopy.", palette: ["#6fae5a", "#a8784a", "#e8f2d8"], highlights: ["Rope bridges", "Flying-type gym"] }),
  soon({ id: "lilycove-city", name: "Lilycove City", kind: "city", at: [780, 150], label: "right", tier: 1, summary: "A seaside city where the land ends: department store, art museum and contest hall.", tagline: "Where land meets the open sea.", palette: ["#86d1e0", "#f6d6b8", "#3a6c8a"], highlights: ["Department store", "Art museum", "Contest hall"] }),
  soon({ id: "mt-pyre", name: "Mt. Pyre", kind: "dungeon", at: [858, 236], label: "bottom", tier: 2, summary: "A misty mountain island honouring departed Pokémon, guarding two ancient orbs.", tagline: "Mist and memorials.", palette: ["#9a9fb3", "#5d6273", "#e6e8ef"], highlights: ["Memorial tower", "Summit shrine"], focusZoom: 8 }),
  soon({ id: "mossdeep-city", name: "Mossdeep City", kind: "city", at: [904, 160], label: "bottom", tier: 1, summary: "An island city with a space center that launches rockets into the sky.", tagline: "Rocket launches over the sea.", palette: ["#7dc4e6", "#f2f2f2", "#2e5c7a"], highlights: ["Space Center", "Psychic-type gym"] }),
  soon({ id: "sootopolis-city", name: "Sootopolis City", kind: "city", at: [822, 336], label: "top", tier: 1, summary: "A city built inside a sunken crater, reachable only from below the sea or the sky.", tagline: "A city inside a crater lake.", palette: ["#3fa7c9", "#e8e1d0", "#1f4f6b"], highlights: ["Crater lake", "Cave of Origin", "Water-type gym"] }),
  soon({ id: "ever-grande-city", name: "Ever Grande City", kind: "city", at: [938, 410], label: "left", tier: 1, summary: "A paradise of flowers and sea at the far east, home of the Pokémon League.", tagline: "The League by the waterfall.", palette: ["#f2a0b8", "#5bb3c9", "#2a3a5c"], highlights: ["Pokémon League", "Victory Road"] }),
  soon({ id: "pacifidlog-town", name: "Pacifidlog Town", kind: "town", at: [654, 518], label: "bottom", tier: 2, summary: "A floating village built on log rafts tethered over a coral reef.", tagline: "Log rafts over a coral reef.", palette: ["#59c9d6", "#c8a070", "#eaf7f8"], highlights: ["Floating log houses", "Coral reef"] }),
  soon({ id: "sky-pillar", name: "Sky Pillar", kind: "dungeon", at: [757, 464], label: "right", tier: 2, summary: "An ancient tower on a remote islet, said to reach the realm of the sky dragon.", tagline: "A tower that touches the sky.", palette: ["#7a8fb3", "#c9d6ea", "#2a3550"], highlights: ["Crumbling floors", "Summit altar"], focusZoom: 8 }),
];
