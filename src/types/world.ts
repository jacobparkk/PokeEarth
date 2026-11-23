/**
 * PokeEarth world schema.
 *
 * Everything the app renders — map geography, pins, camera presets, lighting,
 * weather, audio and 3D asset slots — is described by these types. Adding a new
 * region (Kanto, Hoenn, Sinnoh…) means writing a new data module that satisfies
 * `RegionDefinition`; no component code needs to change.
 *
 * Coordinate systems
 * ------------------
 * - Map space (`Vec2`): 2D units inside the region's `geography.size` box.
 *   Origin top-left, +x east, +y south. Johto uses a 1000 × 640 canvas.
 * - Scene space (`Vec3`): 3D metres inside a location's first-person scene.
 *   Three.js convention: +y up, the camera looks down −z at yaw 0.
 */

export type Vec2 = readonly [x: number, y: number];
export type Vec3 = readonly [x: number, y: number, z: number];
export type Polygon = readonly Vec2[];
export type HexColor = `#${string}`;

/* -------------------------------------------------------------------------- */
/*  Identifiers                                                               */
/* -------------------------------------------------------------------------- */

export type RegionId = "johto" | "kanto" | "hoenn" | "sinnoh";

/**
 * Keys of first-person scenes. Each key resolves to a React component in
 * `src/scenes/registry.ts`. Add a key here when you build a new scene.
 */
export type SceneKey =
  | "national-park"
  | "ecruteak-city"
  | "new-bark-town"
  | "pallet-town"
  | "littleroot-town"
  | "twinleaf-town"
  | "viridian-forest"
  | "mt-chimney"
  | "spear-pillar";

export type LocationKind = "town" | "city" | "landmark" | "dungeon" | "water";

/* -------------------------------------------------------------------------- */
/*  Map placement & preview                                                    */
/* -------------------------------------------------------------------------- */

export interface MapPlacement {
  /** Pin position in map space. */
  position: Vec2;
  /** Which side of the pin the label sits on. */
  labelSide: "top" | "bottom" | "left" | "right";
  /**
   * 1 = always labelled, 2 = labelled from medium zoom, 3 = labelled when close.
   * Keeps the overview uncluttered as more pins are added.
   */
  importance: 1 | 2 | 3;
  /** Map zoom used for the fly-in before dropping to street level. */
  focusZoom: number;
}

export interface LocationPreview {
  /** One-line hook shown in the hover card. */
  tagline: string;
  /** Three colours used to paint the hover card's procedural header art. */
  palette: readonly [HexColor, HexColor, HexColor];
  /** Short bullet points of what you'll see. */
  highlights: readonly string[];
}

/* -------------------------------------------------------------------------- */
/*  Camera                                                                     */
/* -------------------------------------------------------------------------- */

export interface CameraPose {
  position: Vec3;
  lookAt: Vec3;
  fov: number;
}

export interface GroundCameraConfig {
  /** Feet position; the camera sits `eyeHeight` above it. */
  spawn: Vec3;
  /** 0 = facing −z (north in our scenes). Positive turns left (counter-clockwise from above). */
  yawDeg: number;
  /** Negative looks down. Clamped to ±85° at runtime. */
  pitchDeg: number;
  eyeHeight: number;
  fov: number;
  /** Metres per second. */
  walkSpeed: number;
  sprintMultiplier: number;
  /** Walkable XZ rectangle; the player is clamped inside it. */
  bounds: { min: Vec2; max: Vec2 };
}

export interface CameraPresets {
  /** Where the 3D camera starts when the scene mounts (mirrors the map dive). */
  aerial: CameraPose;
  /** First-person controller configuration once landed. */
  ground: GroundCameraConfig;
  /** Duration of the aerial → ground descent inside the 3D scene. */
  descentDurationMs: number;
}

/* -------------------------------------------------------------------------- */
/*  Environment: lighting, sky, fog, weather, post-processing                  */
/* -------------------------------------------------------------------------- */

export type TimeOfDay = "dawn" | "morning" | "midday" | "golden-hour" | "dusk" | "night";
export type WeatherType = "clear" | "partly-cloudy" | "overcast" | "rain" | "snow" | "mist";
export type ParticleEffect = "none" | "pollen" | "falling-leaves" | "fireflies" | "sea-spray" | "ash" | "snow";

export interface EnvironmentConfig {
  timeOfDay: TimeOfDay;
  sun: {
    /** Degrees above the horizon. */
    elevationDeg: number;
    /** Compass degrees; 0 = north (−z), 90 = east (+x). */
    azimuthDeg: number;
    color: HexColor;
    intensity: number;
    castShadows: boolean;
    shadowMapSize: 1024 | 2048 | 4096;
  };
  hemisphere: { skyColor: HexColor; groundColor: HexColor; intensity: number };
  /** Parameters for drei's physically-based <Sky /> shader. */
  sky: { turbidity: number; rayleigh: number; mieCoefficient: number; mieDirectionalG: number };
  fog: { color: HexColor; near: number; far: number };
  weather: {
    type: WeatherType;
    /** 0–1 */
    cloudCover: number;
    /** 0–1, drives grass/foliage sway and ambient wind volume. */
    windStrength: number;
    /** 0–1, only meaningful for rain/snow. */
    precipitation: number;
    particles: ParticleEffect;
  };
  postFx: { bloom: number; vignette: number; saturation: number; exposure: number };
}

/* -------------------------------------------------------------------------- */
/*  Audio                                                                      */
/* -------------------------------------------------------------------------- */

export interface AudioTrackRef {
  id: string;
  /** Display name shown in the HUD / preview card. */
  title: string;
  /** Ordered fallbacks; Howler picks the first format the browser supports. */
  src: readonly string[];
  /** 0–1, before the user's master volume is applied. */
  volume: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

export interface AmbientLayer {
  id: string;
  label: string;
  src: readonly string[];
  volume: number;
  /** When set, the layer is positioned in 3D and attenuates with distance. */
  spatial?: { position: Vec3; refDistance: number; rolloffFactor: number };
  /** Scale this layer's volume by `environment.weather.windStrength`. */
  windDriven?: boolean;
}

export interface LocationAudio {
  music: AudioTrackRef;
  ambience: readonly AmbientLayer[];
}

/* -------------------------------------------------------------------------- */
/*  3D assets                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A named spot in a scene that can be filled by a custom .glb model.
 * While `url` is null the scene renders its procedural stand-in, identified
 * by `proceduralFallback`. Drop a file in /public/models and set `url` to swap.
 */
export interface ModelSlot {
  slot: string;
  url: string | null;
  proceduralFallback: string;
  position: Vec3;
  rotationDeg: Vec3;
  scale: number;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface SceneConfig {
  sceneKey: SceneKey;
  /**
   * procedural – everything generated in code (prototype default)
   * hybrid     – procedural world, some slots filled by .glb models
   * gltf       – a full environment model drives the scene
   */
  assetMode: "procedural" | "hybrid" | "gltf";
  /** Seed for deterministic foliage / scatter generation. */
  seed: number;
  models: readonly ModelSlot[];
}

/* -------------------------------------------------------------------------- */
/*  Locations                                                                  */
/* -------------------------------------------------------------------------- */

interface LocationBase {
  id: string;
  regionId: RegionId;
  name: string;
  kind: LocationKind;
  summary: string;
  map: MapPlacement;
  preview: LocationPreview;
}

/** A location with a playable first-person scene. */
export interface ExplorableLocation extends LocationBase {
  status: "explorable";
  camera: CameraPresets;
  environment: EnvironmentConfig;
  audio: LocationAudio;
  scene: SceneConfig;
}

/** A location shown on the map whose scene hasn't been built yet. */
export interface PreviewLocation extends LocationBase {
  status: "coming-soon";
}

export type LocationDefinition = ExplorableLocation | PreviewLocation;

export const isExplorable = (l: LocationDefinition): l is ExplorableLocation =>
  l.status === "explorable";

/* -------------------------------------------------------------------------- */
/*  Region geography (drives the procedural map renderer)                      */
/* -------------------------------------------------------------------------- */

export interface RouteDefinition {
  id: string;
  label: string;
  /** Polyline in map space; rendered as a smoothed path. */
  points: Polygon;
  kind: "land" | "water" | "cave";
}

export interface TerrainArea {
  id: string;
  name?: string;
  /** Closed polygon footprint in map space. */
  points: Polygon;
  /** Features per 1 000 square map units (trees for forests, peaks for ranges). */
  density: number;
}

export interface MountainRange extends TerrainArea {
  snowCapped: boolean;
}

export interface WaterBody {
  id: string;
  name?: string;
  points: Polygon;
}

/** Ground-cover tint painted over land (snowfields, deserts, volcanic ash, marshes, beaches). */
export interface Biome {
  id: string;
  kind: "snow" | "desert" | "ash" | "marsh" | "beach" | "meadow";
  points: Polygon;
}

export interface MapLabel {
  text: string;
  position: Vec2;
  size: "sm" | "md" | "lg";
  style: "land" | "water";
}

export interface RegionGeography {
  size: { width: number; height: number };
  landmasses: readonly Polygon[];
  waterBodies: readonly WaterBody[];
  biomes: readonly Biome[];
  forests: readonly TerrainArea[];
  mountains: readonly MountainRange[];
  routes: readonly RouteDefinition[];
  labels: readonly MapLabel[];
}

export interface RegionTheme {
  accent: HexColor;
  seaDeep: HexColor;
  seaShallow: HexColor;
  land: HexColor;
  landShade: HexColor;
  sand: HexColor;
  forest: HexColor;
  forestShade: HexColor;
  rock: HexColor;
  rockShade: HexColor;
  route: HexColor;
  routeEdge: HexColor;
}

/* -------------------------------------------------------------------------- */
/*  Regions                                                                    */
/* -------------------------------------------------------------------------- */

export interface RegionDefinition {
  id: RegionId;
  status: "available";
  name: string;
  generation: number;
  tagline: string;
  theme: RegionTheme;
  geography: RegionGeography;
  /** Map camera when the region first opens. zoom 1 = whole region fits. */
  initialView: { center: Vec2; zoom: number };
  audio: { mapTheme: AudioTrackRef | null };
  locations: readonly LocationDefinition[];
}

/** A region listed in the selector but not yet built. */
export interface LockedRegion {
  id: RegionId;
  status: "locked";
  name: string;
  generation: number;
  tagline: string;
}

export type RegionEntry = RegionDefinition | LockedRegion;
