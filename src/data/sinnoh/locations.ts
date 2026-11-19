import type { LocationDefinition } from "@/types/world";
import { comingSoon } from "../helpers";

const MUSIC = "/audio/sinnoh/music";
const AMB = "/audio/sinnoh/ambience";
const soon = comingSoon("sinnoh");

export const sinnohLocations: readonly LocationDefinition[] = [
  {
    id: "twinleaf-town",
    regionId: "sinnoh",
    name: "Twinleaf Town",
    kind: "town",
    status: "explorable",
    summary:
      "A quiet town of fresh air and cool breezes in Sinnoh's south-west, a short walk from the misty shores of Lake Verity.",
    map: { position: [230, 526], labelSide: "right", importance: 1, focusZoom: 7.5 },
    preview: {
      tagline: "A crisp northern morning by the lakefront path.",
      palette: ["#cfe3f2", "#6f9a63", "#f2efe6"],
      highlights: ["Your home and your rival's", "Path to Lake Verity", "Cool pine air", "Route 201 gate"],
    },
    camera: {
      aerial: { position: [0, 50, 55], lookAt: [0, 0, 0], fov: 50 },
      ground: {
        spawn: [0, 0, 12],
        yawDeg: 0,
        pitchDeg: 0,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.0,
        sprintMultiplier: 1.9,
        bounds: { min: [-26, -26], max: [26, 26] },
      },
      descentDurationMs: 2000,
    },
    environment: {
      timeOfDay: "morning",
      sun: { elevationDeg: 18, azimuthDeg: 95, color: "#ffe6c4", intensity: 2.6, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#c6dcf0", groundColor: "#5d7a4a", intensity: 0.65 },
      sky: { turbidity: 3, rayleigh: 1.6, mieCoefficient: 0.004, mieDirectionalG: 0.8 },
      fog: { color: "#d6e4ee", near: 50, far: 200 },
      weather: { type: "partly-cloudy", cloudCover: 0.35, windStrength: 0.4, precipitation: 0, particles: "none" },
      postFx: { bloom: 0.3, vignette: 0.3, saturation: 1.0, exposure: 1.05 },
    },
    audio: {
      music: {
        id: "sinnoh-twinleaf-town",
        title: "Twinleaf Town",
        src: [`${MUSIC}/twinleaf-town.ogg`, `${MUSIC}/twinleaf-town.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2000,
        fadeOutMs: 1500,
      },
      ambience: [
        { id: "tw-birds", label: "Morning birds", src: [`${AMB}/birds-morning.ogg`, `${AMB}/birds-morning.mp3`], volume: 0.3 },
        { id: "tw-wind", label: "Cool breeze", src: [`${AMB}/wind-soft.ogg`, `${AMB}/wind-soft.mp3`], volume: 0.35, windDriven: true },
        {
          id: "tw-lake",
          label: "Lake shore",
          src: [`${AMB}/lake-lapping.ogg`, `${AMB}/lake-lapping.mp3`],
          volume: 0.35,
          spatial: { position: [-30, 0, 24], refDistance: 10, rolloffFactor: 1 },
        },
      ],
    },
    scene: {
      sceneKey: "twinleaf-town",
      assetMode: "procedural",
      seed: 2006,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:town-ground-and-paths", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "player-house", url: null, proceduralFallback: "procedural:gable-house", position: [-8, 0, -6], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "rival-house", url: null, proceduralFallback: "procedural:gable-house", position: [8, 0, -6], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "route-gate", url: null, proceduralFallback: "procedural:gatehouse", position: [0, 0, -24], rotationDeg: [0, 180, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  soon({ id: "lake-verity", name: "Lake Verity", kind: "water", at: [192, 552], label: "left", tier: 3, summary: "A tranquil lake by Twinleaf Town, said to be home to the being of emotion.", tagline: "Mist over still water.", palette: ["#a7cfe0", "#4f7f99", "#eaf2f6"], highlights: ["Lakefront path", "Hidden cavern"], focusZoom: 8 }),
  soon({ id: "sandgem-town", name: "Sandgem Town", kind: "town", at: [262, 500], label: "right", tier: 2, summary: "A sandy seaside town that hosts Professor Rowan's research lab.", tagline: "Salt air and a research lab.", palette: ["#f1e2b8", "#8fbcd4", "#5f7f5a"], highlights: ["Professor Rowan's lab", "Beach on Route 219"] }),
  soon({ id: "jubilife-city", name: "Jubilife City", kind: "city", at: [260, 420], label: "right", tier: 1, summary: "Sinnoh's most modern city, home of a TV station and the Trainers' School.", tagline: "Plazas, screens and a TV tower.", palette: ["#9fc6e8", "#e8e8e8", "#3c5470"], highlights: ["Jubilife TV", "Trainers' School"] }),
  soon({ id: "canalave-city", name: "Canalave City", kind: "city", at: [122, 410], label: "bottom", tier: 1, summary: "A port city split by a canal and a drawbridge, with a great library.", tagline: "Drawbridge over the canal.", palette: ["#7fa8c4", "#c9a982", "#2d3c4a"], highlights: ["Canal drawbridge", "Canalave Library", "Steel-type gym"] }),
  soon({ id: "iron-island", name: "Iron Island", kind: "dungeon", at: [60, 322], label: "bottom", tier: 3, summary: "A rugged mining island west of Canalave, rich with iron ore and Steel-types.", tagline: "Abandoned mines across the sea.", palette: ["#7d7a78", "#b8a07a", "#2f2d2c"], highlights: ["Mine tunnels"], focusZoom: 8 }),
  soon({ id: "oreburgh-city", name: "Oreburgh City", kind: "city", at: [360, 400], label: "bottom", tier: 1, summary: "A mining city that powers Sinnoh with coal from its giant open-pit mine.", tagline: "Coal pits and conveyor belts.", palette: ["#5a4a3e", "#c97d4a", "#2a2420"], highlights: ["Oreburgh Mine", "Mining museum", "Rock-type gym"] }),
  soon({ id: "floaroma-town", name: "Floaroma Town", kind: "town", at: [220, 320], label: "left", tier: 2, summary: "A town buried in flowers, famous for its sweet honey and meadows.", tagline: "Flower fields as far as you can see.", palette: ["#f6a8c8", "#f6e08a", "#6fae5a"], highlights: ["Floaroma Meadow", "Flower shop"] }),
  soon({ id: "valley-windworks", name: "Valley Windworks", kind: "landmark", at: [292, 304], label: "bottom", tier: 3, summary: "A power plant of tall wind turbines turning over the valley river.", tagline: "Turbines in the valley wind.", palette: ["#e9eef2", "#8fb3c7", "#5f8a5a"], highlights: ["Wind turbines", "River valley"], focusZoom: 8 }),
  soon({ id: "eterna-forest", name: "Eterna Forest", kind: "landmark", at: [300, 248], label: "top", tier: 2, summary: "A dense, ancient forest hiding an old abandoned chateau.", tagline: "Old trees and an empty chateau.", palette: ["#2f5a3a", "#7fae6a", "#141f17"], highlights: ["Old Chateau", "Dense canopy"], focusZoom: 8 }),
  soon({ id: "eterna-city", name: "Eterna City", kind: "city", at: [390, 220], label: "top", tier: 1, summary: "An ancient city that preserves Sinnoh's history, with a famous statue and a Grass-type gym.", tagline: "Old statues and a cycle shop.", palette: ["#9fc58a", "#a68a6a", "#3b4a32"], highlights: ["Ancient statue", "Grass-type gym", "Cycle shop"] }),
  soon({ id: "mt-coronet", name: "Mt. Coronet", kind: "dungeon", at: [494, 268], label: "right", tier: 1, summary: "The towering mountain range that divides Sinnoh in two.", tagline: "The spine of Sinnoh.", palette: ["#c9d4e0", "#6c7684", "#2b3038"], highlights: ["Mountain caves", "Snowy summit"] }),
  soon({ id: "spear-pillar", name: "Spear Pillar", kind: "landmark", at: [488, 176], label: "right", tier: 2, summary: "Ancient ruined pillars at the summit of Mt. Coronet, tied to the creation of time and space.", tagline: "Ruins at the top of the world.", palette: ["#d9dce8", "#8a90b0", "#2a2d45"], highlights: ["Summit ruins", "Ancient columns"], focusZoom: 8 }),
  soon({ id: "snowpoint-city", name: "Snowpoint City", kind: "city", at: [440, 68], label: "right", tier: 1, summary: "A snowbound northern city near an ancient temple and an Ice-type gym.", tagline: "Snowdrifts at the top of Sinnoh.", palette: ["#eef4f8", "#9cb8cc", "#3a4c5c"], highlights: ["Snowpoint Temple", "Ice-type gym", "Harbor"] }),
  soon({ id: "lake-acuity", name: "Lake Acuity", kind: "water", at: [366, 62], label: "left", tier: 3, summary: "A frozen northern lake, said to be home to the being of knowledge.", tagline: "An icy lake in the snowfields.", palette: ["#d6eaf4", "#6f9fbf", "#ffffff"], highlights: ["Frozen shore", "Hidden cavern"], focusZoom: 8 }),
  soon({ id: "celestic-town", name: "Celestic Town", kind: "town", at: [556, 232], label: "right", tier: 2, summary: "A tiny, ancient town in the mountains that guards a shrine and old legends.", tagline: "Ancient legends in a mountain village.", palette: ["#c9b9a0", "#7a8a6a", "#3a3428"], highlights: ["Celestic ruins", "Elder's house"] }),
  soon({ id: "solaceon-town", name: "Solaceon Town", kind: "town", at: [650, 300], label: "right", tier: 2, summary: "A peaceful pastoral town with a day care and mysterious ruins below.", tagline: "Fields, day care and hidden ruins.", palette: ["#d8e8a8", "#9ab86a", "#f6efd6"], highlights: ["Pokémon Day Care", "Solaceon Ruins"] }),
  soon({ id: "veilstone-city", name: "Veilstone City", kind: "city", at: [740, 250], label: "right", tier: 1, summary: "A city carved from rocky cliffs, with Sinnoh's biggest department store.", tagline: "Stone cliffs and meteorite gardens.", palette: ["#a39a8e", "#d9a066", "#3a3634"], highlights: ["Department store", "Meteorites", "Fighting-type gym"] }),
  soon({ id: "hearthome-city", name: "Hearthome City", kind: "city", at: [580, 380], label: "left", tier: 1, summary: "A friendly city of contests and a great amity square for strolling with Pokémon.", tagline: "Contest halls and Amity Square.", palette: ["#f2a0a8", "#f6d6a8", "#6a4a5a"], highlights: ["Contest Hall", "Amity Square", "Ghost-type gym"] }),
  soon({ id: "lake-valor", name: "Lake Valor", kind: "water", at: [764, 386], label: "left", tier: 2, summary: "A wide lake in the east, said to be home to the being of willpower.", tagline: "A luxurious lakeside resort.", palette: ["#8cc4dc", "#3f7a99", "#f2e8d0"], highlights: ["Hotel Grand Lake", "Valor Lakefront"], focusZoom: 8 }),
  soon({ id: "pastoria-city", name: "Pastoria City", kind: "city", at: [726, 470], label: "right", tier: 1, summary: "A marshland city of canals and croaking Pokémon, next to the Great Marsh.", tagline: "Boardwalks over the marsh.", palette: ["#6f9a6a", "#c9b07a", "#2f4a3a"], highlights: ["Great Marsh", "Water-type gym"] }),
  soon({ id: "great-marsh", name: "Great Marsh", kind: "landmark", at: [672, 478], label: "left", tier: 3, summary: "A safari-style wetland where rare Pokémon hide in deep mud.", tagline: "Deep mud and rare Pokémon.", palette: ["#5f7d55", "#a89a6a", "#2a3626"], highlights: ["Observatory", "Mud trails"], focusZoom: 8 }),
  soon({ id: "sunyshore-city", name: "Sunyshore City", kind: "city", at: [852, 504], label: "left", tier: 1, summary: "A solar-powered seaside city of raised walkways and a lighthouse.", tagline: "Solar panels and sea glitter.", palette: ["#f6d36b", "#4fa6c9", "#2a3a52"], highlights: ["Vista Lighthouse", "Solar walkways", "Electric-type gym"] }),
  soon({ id: "pokemon-league-sinnoh", name: "Pokémon League", kind: "landmark", at: [948, 360], label: "left", tier: 1, summary: "Sinnoh's League, on an island north-east of Sunyshore past Victory Road.", tagline: "The final test of Sinnoh.", palette: ["#5a6a9a", "#d9c48a", "#1e2440"], highlights: ["Elite Four", "Victory Road"] }),
  soon({ id: "battle-zone", name: "Battle Zone", kind: "landmark", at: [932, 92], label: "left", tier: 2, summary: "Islands in the far north-east devoted to battle facilities and tough trainers.", tagline: "Islands built for battle.", palette: ["#c95a4a", "#e8c48a", "#2a2a3a"], highlights: ["Fight Area", "Battle facilities"] }),
];
