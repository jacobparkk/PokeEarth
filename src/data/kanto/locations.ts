import type { LocationDefinition } from "@/types/world";
import { comingSoon } from "../helpers";

const MUSIC = "/audio/kanto/music";
const AMB = "/audio/kanto/ambience";
const soon = comingSoon("kanto");

export const kantoLocations: readonly LocationDefinition[] = [
  {
    id: "pallet-town",
    regionId: "kanto",
    name: "Pallet Town",
    kind: "town",
    status: "explorable",
    summary:
      "A tiny, peaceful town on Kanto's southern coast: two family homes, Professor Oak's research lab and a quiet path north to Route 1.",
    map: { position: [200, 470], labelSide: "left", importance: 1, focusZoom: 7.5 },
    preview: {
      tagline: "A calm coastal morning where the first journey began.",
      palette: ["#bfe4f2", "#7fbf6a", "#f4efe0"],
      highlights: ["Professor Oak's lab", "Your home and your rival's", "Fenced flower garden", "Shoreline to the south"],
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
        bounds: { min: [-26, -26], max: [26, 28] },
      },
      descentDurationMs: 2000,
    },
    environment: {
      timeOfDay: "morning",
      sun: { elevationDeg: 24, azimuthDeg: 100, color: "#fff0d0", intensity: 3.0, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#c8e6ff", groundColor: "#6c8f45", intensity: 0.7 },
      sky: { turbidity: 3.5, rayleigh: 1.2, mieCoefficient: 0.004, mieDirectionalG: 0.8 },
      fog: { color: "#dcecf5", near: 60, far: 220 },
      weather: { type: "clear", cloudCover: 0.2, windStrength: 0.3, precipitation: 0, particles: "pollen" },
      postFx: { bloom: 0.3, vignette: 0.25, saturation: 1.06, exposure: 1.1 },
    },
    audio: {
      music: {
        id: "kanto-pallet-town",
        title: "Pallet Town",
        src: [`${MUSIC}/pallet-town.ogg`, `${MUSIC}/pallet-town.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2000,
        fadeOutMs: 1500,
      },
      ambience: [
        { id: "pt-birds", label: "Morning birds", src: [`${AMB}/birds-morning.ogg`, `${AMB}/birds-morning.mp3`], volume: 0.35 },
        {
          id: "pt-waves",
          label: "Gentle waves",
          src: [`${AMB}/waves-gentle.ogg`, `${AMB}/waves-gentle.mp3`],
          volume: 0.45,
          spatial: { position: [0, 0, 40], refDistance: 12, rolloffFactor: 0.9 },
        },
        { id: "pt-wind", label: "Soft wind", src: [`${AMB}/wind-soft.ogg`, `${AMB}/wind-soft.mp3`], volume: 0.3, windDriven: true },
      ],
    },
    scene: {
      sceneKey: "pallet-town",
      assetMode: "procedural",
      seed: 1996,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:coastal-ground", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "player-house", url: null, proceduralFallback: "procedural:gable-house", position: [-8, 0, -8], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "rival-house", url: null, proceduralFallback: "procedural:gable-house", position: [8, 0, -8], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "oak-lab", url: null, proceduralFallback: "procedural:lab-building", position: [8.5, 0, 8.5], rotationDeg: [0, 180, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  soon({ id: "viridian-city", name: "Viridian City", kind: "city", at: [200, 360], label: "right", tier: 1, summary: "A green crossroads city whose gym stays mysteriously locked, gateway to Route 22 and the League.", tagline: "Evergreen streets at the crossroads.", palette: ["#9fd39a", "#4f8f5a", "#e9e2c9"], highlights: ["Locked gym", "Route 22 gate"] }),
  {
    id: "viridian-forest",
    regionId: "kanto",
    name: "Viridian Forest",
    kind: "landmark",
    status: "explorable",
    summary:
      "A natural maze of tall trees between Viridian City and Pewter City. A single winding trail threads through sunlit clearings of tall grass where Bug-types hide.",
    map: { position: [200, 255], labelSide: "left", importance: 2, focusZoom: 8 },
    preview: {
      tagline: "Sun-dappled paths through a leafy maze.",
      palette: ["#2f6b3a", "#8fc36a", "#1c2e20"],
      highlights: ["Winding forest trail", "Tall-grass clearings", "Shafts of sunlight", "Gatehouses at both ends"],
    },
    camera: {
      aerial: { position: [0, 60, 85], lookAt: [0, 0, 20], fov: 50 },
      ground: {
        spawn: [0, 0, 40],
        yawDeg: 0,
        pitchDeg: 2,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.0,
        sprintMultiplier: 1.9,
        bounds: { min: [-44, -44], max: [44, 44] },
      },
      descentDurationMs: 2400,
    },
    environment: {
      timeOfDay: "midday",
      sun: { elevationDeg: 58, azimuthDeg: 160, color: "#fff4dc", intensity: 3.0, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#cfe8c9", groundColor: "#3a4a26", intensity: 0.55 },
      sky: { turbidity: 4, rayleigh: 1.3, mieCoefficient: 0.005, mieDirectionalG: 0.8 },
      fog: { color: "#8fae7c", near: 18, far: 110 },
      weather: { type: "clear", cloudCover: 0.2, windStrength: 0.25, precipitation: 0, particles: "pollen" },
      postFx: { bloom: 0.55, vignette: 0.45, saturation: 1.1, exposure: 1.05 },
    },
    audio: {
      music: {
        id: "kanto-viridian-forest",
        title: "Viridian Forest",
        src: [`${MUSIC}/viridian-forest.ogg`, `${MUSIC}/viridian-forest.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2200,
        fadeOutMs: 1500,
      },
      ambience: [
        { id: "vf-birds", label: "Forest birds", src: [`${AMB}/birds-morning.ogg`, `${AMB}/birds-morning.mp3`], volume: 0.35 },
        { id: "vf-leaves", label: "Rustling canopy", src: [`${AMB}/leaves-rustle.ogg`, `${AMB}/leaves-rustle.mp3`], volume: 0.35, windDriven: true },
        { id: "vf-insects", label: "Buzzing insects", src: [`${AMB}/forest-insects.ogg`, `${AMB}/forest-insects.mp3`], volume: 0.22 },
        { id: "vf-grass", label: "Tall grass", src: [`${AMB}/grass-rustle.ogg`, `${AMB}/grass-rustle.mp3`], volume: 0.25, windDriven: true },
      ],
    },
    scene: {
      sceneKey: "viridian-forest",
      assetMode: "procedural",
      seed: 1997,
      models: [
        { slot: "gate-south", url: null, proceduralFallback: "procedural:gatehouse", position: [0, 0, 46], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "gate-north", url: null, proceduralFallback: "procedural:gatehouse", position: [0, 0, -46], rotationDeg: [0, 180, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },
  soon({ id: "pewter-city", name: "Pewter City", kind: "city", at: [200, 160], label: "left", tier: 1, summary: "A stone-grey city between rugged mountains, home to a museum of science and a Rock-type gym.", tagline: "Grey stone and museum fossils.", palette: ["#b8b0a2", "#7a8a7c", "#3e3a36"], highlights: ["Museum of Science", "Rock-type gym"] }),
  soon({ id: "mt-moon", name: "Mt. Moon", kind: "dungeon", at: [360, 128], label: "top", tier: 2, summary: "A craggy mountain where meteorites are said to have fallen and Clefairy gather under the full moon.", tagline: "Moonstone caverns and meteor craters.", palette: ["#5a5470", "#a9a3c9", "#1d1b2a"], highlights: ["Meteor crater", "Fossil dig"] }),
  soon({ id: "cerulean-city", name: "Cerulean City", kind: "city", at: [520, 140], label: "right", tier: 1, summary: "A refreshing, water-themed city to the north, where the river meets the famous Nugget Bridge.", tagline: "Cool water and the Nugget Bridge.", palette: ["#7fc8e8", "#2f7fb3", "#eef6f8"], highlights: ["Water-type gym", "Nugget Bridge"] }),
  soon({ id: "cerulean-cave", name: "Cerulean Cave", kind: "dungeon", at: [470, 100], label: "left", tier: 3, summary: "A sealed cave north-west of Cerulean, home to the strongest wild Pokémon in Kanto.", tagline: "Deep, dark and dangerous.", palette: ["#2b3a4f", "#6f8faf", "#0f141c"], highlights: ["Underground lake", "Restricted entry"], focusZoom: 8 }),
  soon({ id: "bills-sea-cottage", name: "Sea Cottage", kind: "landmark", at: [660, 60], label: "right", tier: 3, summary: "A lonely cottage on the northern cape at the end of Route 25, owned by a famous Pokémon researcher.", tagline: "A cottage on the windy cape.", palette: ["#a8d8ea", "#f3e3c3", "#5d8aa8"], highlights: ["Cape lookout", "Researcher's lab"], focusZoom: 8 }),
  soon({ id: "rock-tunnel", name: "Rock Tunnel", kind: "dungeon", at: [722, 168], label: "left", tier: 3, summary: "A pitch-black tunnel through the mountains between Route 9 and Lavender Town.", tagline: "Bring a light.", palette: ["#4a4038", "#9a8a78", "#141210"], highlights: ["Pitch-black passages", "Hikers"], focusZoom: 8 }),
  soon({ id: "power-plant", name: "Power Plant", kind: "landmark", at: [792, 200], label: "right", tier: 3, summary: "An abandoned power station by the river, crackling with Electric-type Pokémon.", tagline: "Abandoned, humming, electric.", palette: ["#f2d64b", "#5b6470", "#20242a"], highlights: ["Rusting generators", "River access"], focusZoom: 8 }),
  soon({ id: "lavender-town", name: "Lavender Town", kind: "town", at: [720, 300], label: "right", tier: 1, summary: "A small, noble town in the east whose tall tower honours departed Pokémon.", tagline: "Quiet streets and a solemn tower.", palette: ["#b49ad1", "#6d5a8a", "#2b2238"], highlights: ["Pokémon Tower", "Name Rater"] }),
  soon({ id: "celadon-city", name: "Celadon City", kind: "city", at: [380, 300], label: "top", tier: 1, summary: "A rainbow-coloured metropolis of shopping and leisure: department store, game corner and mansion.", tagline: "Rooftop gardens and neon lights.", palette: ["#f2a7c3", "#7cc29a", "#3b3f63"], highlights: ["Department store", "Grass-type gym", "Game corner"] }),
  soon({ id: "saffron-city", name: "Saffron City", kind: "city", at: [520, 300], label: "right", tier: 1, summary: "Kanto's golden commercial heart, surrounded by guard gates and dominated by Silph Co.'s tower.", tagline: "Skyscrapers at the centre of Kanto.", palette: ["#f2c46b", "#a68b5b", "#2e2f3a"], highlights: ["Silph Co. tower", "Magnet Train station", "Psychic-type gym"] }),
  soon({ id: "vermilion-city", name: "Vermilion City", kind: "city", at: [540, 420], label: "left", tier: 1, summary: "A port city of sunsets and sea breezes where a luxury liner docks.", tagline: "Harbor sunsets and ship horns.", palette: ["#f08a5d", "#3d84a8", "#f9ed69"], highlights: ["S.S. Anne harbor", "Electric-type gym"] }),
  soon({ id: "safari-zone", name: "Safari Zone", kind: "landmark", at: [470, 490], label: "left", tier: 2, summary: "A fenced wildlife reserve north of Fuchsia where rare Pokémon roam freely.", tagline: "Rare Pokémon in the wild reserve.", palette: ["#6fa85a", "#d9c58c", "#2e4a2a"], highlights: ["Jungle areas", "Rest houses"] }),
  soon({ id: "fuchsia-city", name: "Fuchsia City", kind: "city", at: [470, 545], label: "right", tier: 1, summary: "A southern city of ninja traditions with a gym full of invisible walls.", tagline: "Hidden walls and pink sunsets.", palette: ["#e58fb5", "#6b4f7a", "#f6dcc0"], highlights: ["Poison-type gym", "Safari gate"] }),
  soon({ id: "seafoam-islands", name: "Seafoam Islands", kind: "water", at: [340, 596], label: "top", tier: 3, summary: "Twin icy islands whose caves are said to shelter a legendary bird of ice.", tagline: "Ice caves in the southern sea.", palette: ["#c9ecf7", "#5ea4c9", "#ffffff"], highlights: ["Ice caverns", "Strong currents"], focusZoom: 8 }),
  soon({ id: "cinnabar-island", name: "Cinnabar Island", kind: "town", at: [200, 592], label: "right", tier: 2, summary: "A volcanic island town with a burned-out mansion and a fossil revival lab.", tagline: "Volcano, lab and a ruined mansion.", palette: ["#e35d3b", "#8a5a44", "#f2c14e"], highlights: ["Pokémon Mansion", "Fossil lab"] }),
  soon({ id: "victory-road", name: "Victory Road", kind: "dungeon", at: [96, 244], label: "right", tier: 3, summary: "A boulder-strewn cave that tests trainers on their way to the League.", tagline: "The final test.", palette: ["#8a7a62", "#4a3e30", "#d8c8a8"], highlights: ["Boulder puzzles", "Elite trainers"], focusZoom: 8 }),
  soon({ id: "indigo-plateau", name: "Indigo Plateau", kind: "landmark", at: [80, 152], label: "right", tier: 1, summary: "The mountain-top home of the Pokémon League and the Elite Four.", tagline: "The summit of every journey.", palette: ["#4b5d9a", "#c9b26b", "#1e2340"], highlights: ["Elite Four", "League hall"] }),
];
