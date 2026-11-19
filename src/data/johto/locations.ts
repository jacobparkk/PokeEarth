import type { LocationDefinition } from "@/types/world";

const MUSIC = "/audio/johto/music";
const AMB = "/audio/johto/ambience";

/**
 * Johto locations. Three are fully explorable (National Park, Ecruteak City,
 * New Bark Town); the rest are pinned on the map as "coming soon" and only need
 * their `status` flipped plus camera/environment/audio/scene blocks to go live.
 *
 * Scene-space conventions for explorable locations:
 *   - metres, +y up, the scene's "north" is −z
 *   - the landmark everything is arranged around sits at the origin
 *
 * Custom models: put a .glb in /public/models/johto/<location>/ and set the
 * matching slot's `url`, e.g. url: "/models/johto/national-park/fountain.glb".
 */
export const johtoLocations: readonly LocationDefinition[] = [
  /* ------------------------------------------------------------------------ */
  /*  National Park — MVP scene                                                */
  /* ------------------------------------------------------------------------ */
  {
    id: "national-park",
    regionId: "johto",
    name: "National Park",
    kind: "landmark",
    status: "explorable",
    summary:
      "A walled public park north of Goldenrod City: a stone fountain at its heart, looping gravel paths, benches, flowerbeds and wide patches of tall grass where Bug-type contests are held.",
    map: { position: [398, 262], labelSide: "left", importance: 1, focusZoom: 7 },
    preview: {
      tagline: "Golden-hour strolls around the great fountain.",
      palette: ["#f6c56b", "#e58f4f", "#5b8a3a"],
      highlights: ["Central fountain plaza", "Circular walking paths", "Tall-grass contest fields", "Tree-lined park walls"],
    },
    camera: {
      aerial: { position: [0, 70, 85], lookAt: [0, 0, 0], fov: 50 },
      ground: {
        spawn: [0, 0, 40],
        yawDeg: 0,
        pitchDeg: -2,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.2,
        sprintMultiplier: 1.9,
        bounds: { min: [-44, -44], max: [44, 44] },
      },
      descentDurationMs: 2200,
    },
    environment: {
      timeOfDay: "golden-hour",
      sun: { elevationDeg: 12, azimuthDeg: 250, color: "#ffc98a", intensity: 2.6, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#ffd9a8", groundColor: "#5b6b3a", intensity: 0.55 },
      sky: { turbidity: 8, rayleigh: 2.2, mieCoefficient: 0.006, mieDirectionalG: 0.86 },
      fog: { color: "#f3c48f", near: 40, far: 160 },
      weather: { type: "clear", cloudCover: 0.15, windStrength: 0.25, precipitation: 0, particles: "pollen" },
      postFx: { bloom: 0.6, vignette: 0.35, saturation: 1.12, exposure: 1.05 },
    },
    audio: {
      music: {
        id: "johto-national-park",
        title: "National Park",
        src: [`${MUSIC}/national-park.ogg`, `${MUSIC}/national-park.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2500,
        fadeOutMs: 1500,
      },
      ambience: [
        {
          id: "np-fountain",
          label: "Fountain water",
          src: [`${AMB}/fountain.ogg`, `${AMB}/fountain.mp3`],
          volume: 0.55,
          spatial: { position: [0, 1, 0], refDistance: 4, rolloffFactor: 1.4 },
        },
        { id: "np-grass", label: "Rustling grass", src: [`${AMB}/grass-rustle.ogg`, `${AMB}/grass-rustle.mp3`], volume: 0.35, windDriven: true },
        { id: "np-birds", label: "Evening birdsong", src: [`${AMB}/birds-evening.ogg`, `${AMB}/birds-evening.mp3`], volume: 0.3 },
        { id: "np-wind", label: "Soft wind", src: [`${AMB}/wind-soft.ogg`, `${AMB}/wind-soft.mp3`], volume: 0.25, windDriven: true },
      ],
    },
    scene: {
      sceneKey: "national-park",
      assetMode: "procedural",
      seed: 2001,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:park-ground-and-paths", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "fountain", url: null, proceduralFallback: "procedural:tiered-fountain", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "gate-south", url: null, proceduralFallback: "procedural:gatehouse", position: [0, 0, 47], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "gate-east", url: null, proceduralFallback: "procedural:gatehouse", position: [47, 0, 0], rotationDeg: [0, 90, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "benches", url: null, proceduralFallback: "procedural:bench-ring", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  /* ------------------------------------------------------------------------ */
  /*  Ecruteak City                                                            */
  /* ------------------------------------------------------------------------ */
  {
    id: "ecruteak-city",
    regionId: "johto",
    name: "Ecruteak City",
    kind: "city",
    status: "explorable",
    summary:
      "Johto's old capital of tradition: wooden houses, a dance theater, the charred Burned Tower and the soaring Bell Tower rising above autumn maples to the north-east.",
    map: { position: [420, 150], labelSide: "top", importance: 1, focusZoom: 7 },
    preview: {
      tagline: "Autumn dusk beneath two legendary towers.",
      palette: ["#f08a4b", "#b23a2a", "#3b2a3f"],
      highlights: ["Bell Tower skyline", "The Burned Tower ruins", "Kimono dance theater", "Falling maple leaves"],
    },
    camera: {
      aerial: { position: [10, 90, 110], lookAt: [0, 0, -10], fov: 50 },
      ground: {
        spawn: [0, 0, 55],
        yawDeg: 0,
        pitchDeg: 4,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.2,
        sprintMultiplier: 1.9,
        bounds: { min: [-60, -80], max: [60, 60] },
      },
      descentDurationMs: 2400,
    },
    environment: {
      timeOfDay: "dusk",
      sun: { elevationDeg: 6, azimuthDeg: 265, color: "#ff9e6b", intensity: 2.0, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#ffb48a", groundColor: "#6a4a32", intensity: 0.5 },
      sky: { turbidity: 10, rayleigh: 2.8, mieCoefficient: 0.008, mieDirectionalG: 0.88 },
      fog: { color: "#e8a07a", near: 50, far: 220 },
      weather: { type: "clear", cloudCover: 0.3, windStrength: 0.35, precipitation: 0, particles: "falling-leaves" },
      postFx: { bloom: 0.7, vignette: 0.4, saturation: 1.15, exposure: 1.0 },
    },
    audio: {
      music: {
        id: "johto-ecruteak-city",
        title: "Ecruteak City",
        src: [`${MUSIC}/ecruteak-city.ogg`, `${MUSIC}/ecruteak-city.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2500,
        fadeOutMs: 1500,
      },
      ambience: [
        {
          id: "ec-temple-bell",
          label: "Distant temple bell",
          src: [`${AMB}/temple-bell.ogg`, `${AMB}/temple-bell.mp3`],
          volume: 0.4,
          spatial: { position: [40, 30, -70], refDistance: 25, rolloffFactor: 0.8 },
        },
        { id: "ec-leaves", label: "Maple leaves", src: [`${AMB}/leaves-rustle.ogg`, `${AMB}/leaves-rustle.mp3`], volume: 0.35, windDriven: true },
        {
          id: "ec-chimes",
          label: "Wind chimes",
          src: [`${AMB}/wind-chimes.ogg`, `${AMB}/wind-chimes.mp3`],
          volume: 0.3,
          spatial: { position: [25, 3, 5], refDistance: 5, rolloffFactor: 1.2 },
          windDriven: true,
        },
        { id: "ec-crickets", label: "Evening crickets", src: [`${AMB}/crickets.ogg`, `${AMB}/crickets.mp3`], volume: 0.25 },
      ],
    },
    scene: {
      sceneKey: "ecruteak-city",
      assetMode: "procedural",
      seed: 1998,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:town-ground-and-paths", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "bell-tower", url: null, proceduralFallback: "procedural:nine-tier-pagoda", position: [40, 0, -70], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "burned-tower", url: null, proceduralFallback: "procedural:ruined-pagoda", position: [-35, 0, -10], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "dance-theater", url: null, proceduralFallback: "procedural:wooden-hall", position: [25, 0, 5], rotationDeg: [0, -90, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  /* ------------------------------------------------------------------------ */
  /*  New Bark Town                                                            */
  /* ------------------------------------------------------------------------ */
  {
    id: "new-bark-town",
    regionId: "johto",
    name: "New Bark Town",
    kind: "town",
    status: "explorable",
    summary:
      "A small coastal town at Johto's eastern edge where every journey starts: a handful of homes, Professor Elm's research lab and a steady sea breeze.",
    map: { position: [840, 480], labelSide: "bottom", importance: 1, focusZoom: 7.5 },
    preview: {
      tagline: "A breezy seaside morning where it all begins.",
      palette: ["#a8dcf0", "#6fb06a", "#f6f0d8"],
      highlights: ["Professor Elm's lab", "Your family home", "Shoreline to the south", "Constant ocean breeze"],
    },
    camera: {
      aerial: { position: [0, 55, 60], lookAt: [0, 0, 0], fov: 50 },
      ground: {
        spawn: [0, 0, 18],
        yawDeg: 0,
        pitchDeg: 0,
        eyeHeight: 1.65,
        fov: 70,
        walkSpeed: 4.0,
        sprintMultiplier: 1.9,
        bounds: { min: [-32, -32], max: [32, 34] },
      },
      descentDurationMs: 2000,
    },
    environment: {
      timeOfDay: "morning",
      sun: { elevationDeg: 28, azimuthDeg: 110, color: "#fff1d6", intensity: 3.0, castShadows: true, shadowMapSize: 2048 },
      hemisphere: { skyColor: "#bfe3ff", groundColor: "#6f8f4a", intensity: 0.7 },
      sky: { turbidity: 4, rayleigh: 1.4, mieCoefficient: 0.004, mieDirectionalG: 0.8 },
      fog: { color: "#d8ecf7", near: 60, far: 240 },
      weather: { type: "partly-cloudy", cloudCover: 0.4, windStrength: 0.65, precipitation: 0, particles: "pollen" },
      postFx: { bloom: 0.35, vignette: 0.25, saturation: 1.08, exposure: 1.1 },
    },
    audio: {
      music: {
        id: "johto-new-bark-town",
        title: "New Bark Town",
        src: [`${MUSIC}/new-bark-town.ogg`, `${MUSIC}/new-bark-town.mp3`],
        volume: 0.7,
        loop: true,
        fadeInMs: 2000,
        fadeOutMs: 1500,
      },
      ambience: [
        {
          id: "nb-waves",
          label: "Shoreline waves",
          src: [`${AMB}/waves-gentle.ogg`, `${AMB}/waves-gentle.mp3`],
          volume: 0.5,
          spatial: { position: [0, 0, 45], refDistance: 12, rolloffFactor: 0.9 },
        },
        { id: "nb-wind", label: "Sea breeze", src: [`${AMB}/wind-gusts.ogg`, `${AMB}/wind-gusts.mp3`], volume: 0.45, windDriven: true },
        { id: "nb-gulls", label: "Seagulls", src: [`${AMB}/seagulls.ogg`, `${AMB}/seagulls.mp3`], volume: 0.25 },
        { id: "nb-birds", label: "Morning birds", src: [`${AMB}/birds-morning.ogg`, `${AMB}/birds-morning.mp3`], volume: 0.3 },
      ],
    },
    scene: {
      sceneKey: "new-bark-town",
      assetMode: "procedural",
      seed: 1999,
      models: [
        { slot: "terrain", url: null, proceduralFallback: "procedural:coastal-ground", position: [0, 0, 0], rotationDeg: [0, 0, 0], scale: 1, castShadow: false, receiveShadow: true },
        { slot: "elm-lab", url: null, proceduralFallback: "procedural:lab-building", position: [-12, 0, -6], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "player-house", url: null, proceduralFallback: "procedural:gable-house", position: [12, 0, -8], rotationDeg: [0, 0, 0], scale: 1, castShadow: true, receiveShadow: true },
        { slot: "neighbor-house", url: null, proceduralFallback: "procedural:gable-house", position: [10, 0, 12], rotationDeg: [0, 180, 0], scale: 1, castShadow: true, receiveShadow: true },
      ],
    },
  },

  /* ------------------------------------------------------------------------ */
  /*  Coming soon                                                              */
  /* ------------------------------------------------------------------------ */
  {
    id: "goldenrod-city",
    regionId: "johto",
    name: "Goldenrod City",
    kind: "city",
    status: "coming-soon",
    summary: "Johto's sprawling metropolis: the department store, radio tower, Magnet Train station and a busy harbor.",
    map: { position: [385, 385], labelSide: "left", importance: 1, focusZoom: 7 },
    preview: {
      tagline: "Neon, commerce and the Radio Tower skyline.",
      palette: ["#f4d35e", "#ee964b", "#2d3047"],
      highlights: ["Radio Tower", "Department store", "Magnet Train station"],
    },
  },
  {
    id: "cherrygrove-city",
    regionId: "johto",
    name: "Cherrygrove City",
    kind: "city",
    status: "coming-soon",
    summary: "A quiet coastal city of flowers and seaside cliffs, one route west of New Bark Town.",
    map: { position: [690, 505], labelSide: "bottom", importance: 2, focusZoom: 7 },
    preview: { tagline: "Blossoms and sea cliffs.", palette: ["#f7a9c4", "#7cc6d6", "#4f7a3a"], highlights: ["Flower-lined lanes", "Seaside overlook"] },
  },
  {
    id: "violet-city",
    regionId: "johto",
    name: "Violet City",
    kind: "city",
    status: "coming-soon",
    summary: "A city steeped in history, home to the swaying Sprout Tower and an earthbound flying-type gym.",
    map: { position: [620, 320], labelSide: "right", importance: 1, focusZoom: 7 },
    preview: { tagline: "Sprout Tower and old wooden streets.", palette: ["#9b8ec4", "#5c946e", "#e6d3a3"], highlights: ["Sprout Tower", "Pond-side walk", "Trainer school"] },
  },
  {
    id: "azalea-town",
    regionId: "johto",
    name: "Azalea Town",
    kind: "town",
    status: "coming-soon",
    summary: "A sleepy town of Slowpoke and apricorn trees on the edge of Ilex Forest.",
    map: { position: [472, 526], labelSide: "bottom", importance: 2, focusZoom: 7 },
    preview: { tagline: "Apricorns and the Slowpoke Well.", palette: ["#f1a66a", "#d8e2a5", "#3f6b4a"], highlights: ["Slowpoke Well", "Kurt's workshop"] },
  },
  {
    id: "ilex-forest",
    regionId: "johto",
    name: "Ilex Forest",
    kind: "landmark",
    status: "coming-soon",
    summary: "A dense, perpetually shaded forest guarding a small wooden shrine.",
    map: { position: [378, 486], labelSide: "left", importance: 3, focusZoom: 8 },
    preview: { tagline: "Shafts of light through ancient trees.", palette: ["#2f5d3a", "#8fbf6a", "#1b2a1f"], highlights: ["Forest shrine", "Mossy undergrowth"] },
  },
  {
    id: "ruins-of-alph",
    regionId: "johto",
    name: "Ruins of Alph",
    kind: "landmark",
    status: "coming-soon",
    summary: "Ancient stone chambers covered in mysterious glyphs, west of Route 32.",
    map: { position: [548, 392], labelSide: "left", importance: 3, focusZoom: 8 },
    preview: { tagline: "Stone chambers and riddles in the walls.", palette: ["#c9b38a", "#7a6a55", "#3c4f5c"], highlights: ["Puzzle chambers", "Research center"] },
  },
  {
    id: "olivine-city",
    regionId: "johto",
    name: "Olivine City",
    kind: "city",
    status: "coming-soon",
    summary: "A port city crowned by a tall lighthouse looking out over the Western Sea.",
    map: { position: [234, 228], labelSide: "left", importance: 1, focusZoom: 7 },
    preview: { tagline: "Lighthouse beams over the harbor.", palette: ["#5fa8d3", "#f2efe4", "#1b4965"], highlights: ["Glitter Lighthouse", "Harbor & ferry"] },
  },
  {
    id: "cianwood-city",
    regionId: "johto",
    name: "Cianwood City",
    kind: "city",
    status: "coming-soon",
    summary: "A rugged island town across the sea, known for its fighters and its pharmacy.",
    map: { position: [84, 330], labelSide: "bottom", importance: 2, focusZoom: 7 },
    preview: { tagline: "Wave-battered cliffs and sandy shores.", palette: ["#e8d6a8", "#4a90a4", "#6b4f3a"], highlights: ["Seaside cliffs", "Island pharmacy"] },
  },
  {
    id: "whirl-islands",
    regionId: "johto",
    name: "Whirl Islands",
    kind: "water",
    status: "coming-soon",
    summary: "Four rocky islets ringed by whirlpools, said to hide a guardian of the sea.",
    map: { position: [198, 478], labelSide: "right", importance: 3, focusZoom: 8 },
    preview: { tagline: "Swirling currents and sea caves.", palette: ["#1d5c7a", "#a7d8e8", "#e9f4f7"], highlights: ["Whirlpools", "Sea caves"] },
  },
  {
    id: "mahogany-town",
    regionId: "johto",
    name: "Mahogany Town",
    kind: "town",
    status: "coming-soon",
    summary: "A ninja-themed mountain town on the road between Mt. Mortar and the Ice Path.",
    map: { position: [630, 162], labelSide: "bottom", importance: 2, focusZoom: 7 },
    preview: { tagline: "Mountain air and hidden passages.", palette: ["#8c5a3c", "#d9cbb0", "#3c4a3a"], highlights: ["Souvenir shop", "Ice-type gym"] },
  },
  {
    id: "lake-of-rage",
    regionId: "johto",
    name: "Lake of Rage",
    kind: "water",
    status: "coming-soon",
    summary: "A wide northern lake once a crater, ringed by forest and famous for a crimson Gyarados.",
    map: { position: [642, 78], labelSide: "right", importance: 2, focusZoom: 7.5 },
    preview: { tagline: "Mist over a wide northern lake.", palette: ["#3d6e8f", "#9cc5a1", "#c94c4c"], highlights: ["Misty shoreline", "Forest ring"] },
  },
  {
    id: "blackthorn-city",
    regionId: "johto",
    name: "Blackthorn City",
    kind: "city",
    status: "coming-soon",
    summary: "A stone city tucked between cliffs, home to the dragon masters and their sacred den.",
    map: { position: [812, 178], labelSide: "right", importance: 1, focusZoom: 7 },
    preview: { tagline: "Cliffs, dragons and the hidden den.", palette: ["#3a4a5c", "#6c8ea3", "#c0b9a8"], highlights: ["Dragon's Den", "Cliffside streets"] },
  },
  {
    id: "mt-silver",
    regionId: "johto",
    name: "Mt. Silver",
    kind: "dungeon",
    status: "coming-soon",
    summary: "A towering, snow-capped peak on the Kanto border where only the strongest trainers climb.",
    map: { position: [944, 205], labelSide: "left", importance: 2, focusZoom: 7 },
    preview: { tagline: "Snow and silence at the summit.", palette: ["#e8eef2", "#8a9aa8", "#3a4652"], highlights: ["Summit plateau", "Snowfields"] },
  },
];
