/** Map coordinates: SVG design units, origin top-left, +x east, +y south.
 * Scene coordinates: metres, right-handed, +Y up; camera looks along -Z at yaw 0.
 * The illustrated atlas is schematic, not an official game tile map. */
export type Vec3 = readonly [number, number, number];
export type SceneId = 'national-park' | 'ecruteak-city' | 'new-bark-town';
export type RegionId = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola' | 'galar' | 'paldea';
export interface CameraPreset { position: Vec3; target: Vec3; fov: number; near: number; far: number }
export interface Environment {
  timeOfDay: 'golden-hour' | 'sunset' | 'morning';
  sky: { top: string; horizon: string };
  sun: { position: Vec3; color: string; intensity: number; shadows: boolean };
  ambient: { skyColor: string; groundColor: string; intensity: number };
  fog: { color: string; near: number; far: number };
  weather: { kind: 'clear' | 'haze' | 'rain'; cloudCover: number; precipitation: number; wind: { direction: Vec3; speed: number; gustStrength: number } };
  exposure: number;
}
/** Null means no track supplied: never fetch a guessed file path.
 * Set src to a bundled track you may use, such as `${import.meta.env.BASE_URL}assets/audio/park.ogg`.
 * Audio is deliberately not initialized in the phase-one map. */
export interface AudioLayer { id: string; src: string | null; volume: number; loop: boolean }
export interface Location {
  id: SceneId; name: string; category: string; tagline: string; description: string;
  map: { x: number; y: number; focusScale: number; labelOffset: readonly [number, number] };
  palette: { accent: string; ground: string; foliage: string; sky: string };
  landmarks: readonly string[];
  camera: { overview: CameraPreset; arrival: CameraPreset; player: { position: Vec3; yaw: number; pitch: number; eyeHeight: number; walkSpeed: number } };
  environment: Environment;
  audio: { music: AudioLayer & { theme: string }; ambience: readonly AudioLayer[]; crossfadeMs: number };
  scene: { id: SceneId; availability: 'planned'; seed: number; bounds: { min: Vec3; max: Vec3 }; asset: { mode: 'procedural'; modelUrl: null } | { mode: 'gltf'; modelUrl: string }; features: readonly { kind: 'fountain' | 'path-ring' | 'grass' | 'trees' | 'building' | 'water'; position: Vec3; size: Vec3 }[] };
}
export interface Region {
  id: RegionId; name: string; subtitle: string; description: string;
  map: { width: number; height: number; camera: { x: number; y: number; scale: number }; artwork: 'johto' };
  locations: readonly Location[];
  towns: readonly { name: string; x: number; y: number }[];
  routes: readonly { id: string; points: readonly (readonly [number, number])[] }[];
}
const goldenHour: Environment = {
  timeOfDay: 'golden-hour', sky: { top: '#8fb9bf', horizon: '#ffe0a3' },
  sun: { position: [-35, 28, 20], color: '#ffd89a', intensity: 2.4, shadows: true },
  ambient: { skyColor: '#c7dfed', groundColor: '#647348', intensity: 1.1 },
  fog: { color: '#d9d5ab', near: 65, far: 185 },
  weather: { kind: 'clear', cloudCover: 0.15, precipitation: 0, wind: { direction: [1, 0, 0.3], speed: 0.8, gustStrength: 0.25 } }, exposure: 1.1,
};
const lens = { fov: 55, near: 0.1, far: 400 };
export const johto = {
  id: 'johto', name: 'Johto', subtitle: 'A world of quiet wonders.',
  description: 'Follow familiar paths. Find a different perspective. Rediscover the places that started your adventure.',
  map: { width: 1200, height: 860, camera: { x: 600, y: 430, scale: 1 }, artwork: 'johto' },
  locations: [
    {
      id: 'national-park', name: 'National Park', category: 'Nature reserve', tagline: 'Take the scenic route.',
      description: 'Sunlight through the trees. Tall grass moving in the breeze. A quiet fountain at the heart of Johto’s beloved park.',
      map: { x: 548, y: 388, focusScale: 2.4, labelOffset: [25, -9] },
      palette: { accent: '#e7bd6b', ground: '#b4bd7c', foliage: '#4c7154', sky: '#f3ddb0' },
      landmarks: ['Central fountain', 'Circular paths', 'Tall grass gardens'],
      camera: {
        overview: { ...lens, position: [0, 74, 52], target: [0, 0, 0] },
        arrival: { ...lens, position: [0, 12, 30], target: [0, 2, 0] },
        player: { position: [0, 1.7, 26], yaw: 0, pitch: 0, eyeHeight: 1.7, walkSpeed: 4.2 },
      },
      environment: goldenHour,
      audio: { music: { id: 'national-park-theme', theme: 'National Park', src: null, volume: 0.48, loop: true }, ambience: [
        { id: 'wind-leaves', src: null, volume: 0.2, loop: true }, { id: 'fountain-water', src: null, volume: 0.32, loop: true },
      ], crossfadeMs: 1800 },
      scene: { id: 'national-park', availability: 'planned', seed: 235, bounds: { min: [-45, 0, -45], max: [45, 30, 45] }, asset: { mode: 'procedural', modelUrl: null }, features: [
        { kind: 'fountain', position: [0, 0, 0], size: [8, 3, 8] },
        { kind: 'path-ring', position: [0, 0.03, 0], size: [36, 0.1, 36] },
        { kind: 'grass', position: [-12, 0, -14], size: [12, 0.6, 10] },
        { kind: 'grass', position: [12, 0, -14], size: [12, 0.6, 10] },
        { kind: 'trees', position: [0, 0, 0], size: [82, 12, 82] },
      ] },
    },
    {
      id: 'ecruteak-city', name: 'Ecruteak City', category: 'Historic city', tagline: 'Where legends linger.',
      description: 'Ancient towers rise above russet treetops. Wander the city of tradition, quiet courtyards, and stories carried on the wind.',
      map: { x: 588, y: 278, focusScale: 2.4, labelOffset: [25, -9] },
      palette: { accent: '#dca17c', ground: '#baa37a', foliage: '#92664d', sky: '#f0cab1' },
      landmarks: ['Bell Tower', 'Burned Tower', 'Dance Theater'],
      camera: {
        overview: { ...lens, position: [0, 95, 65], target: [0, 0, -8] },
        arrival: { ...lens, position: [0, 14, 34], target: [0, 3, -10] },
        player: { position: [0, 1.7, 28], yaw: 0, pitch: 0, eyeHeight: 1.7, walkSpeed: 4.2 },
      },
      environment: { ...goldenHour, timeOfDay: 'sunset', sky: { top: '#9b9cb5', horizon: '#f3bf94' }, sun: { ...goldenHour.sun, position: [-48, 18, 25], color: '#ffba85', intensity: 2 }, fog: { color: '#d4b9a6', near: 70, far: 210 }, weather: { ...goldenHour.weather, kind: 'haze', cloudCover: 0.25 } },
      audio: { music: { id: 'ecruteak-theme', theme: 'Ecruteak City', src: null, volume: 0.45, loop: true }, ambience: [{ id: 'courtyard-wind', src: null, volume: 0.18, loop: true }], crossfadeMs: 2200 },
      scene: { id: 'ecruteak-city', availability: 'planned', seed: 37, bounds: { min: [-60, 0, -65], max: [60, 65, 50] }, asset: { mode: 'procedural', modelUrl: null }, features: [
        { kind: 'building', position: [28, 0, -38], size: [12, 45, 12] },
        { kind: 'building', position: [-28, 0, -30], size: [16, 12, 16] },
        { kind: 'building', position: [10, 0, 5], size: [20, 10, 12] },
        { kind: 'trees', position: [0, 0, -48], size: [110, 12, 18] },
      ] },
    },
    {
      id: 'new-bark-town', name: 'New Bark Town', category: 'Hometown', tagline: 'Every journey starts somewhere.',
      description: 'A handful of homes, a familiar research lab, and a breeze rolling in from the water. Welcome back to the beginning.',
      map: { x: 930, y: 590, focusScale: 2.4, labelOffset: [-25, -9] },
      palette: { accent: '#a8cbbc', ground: '#bbcc8d', foliage: '#52846d', sky: '#c8e5dd' },
      landmarks: ['Professor Elm’s lab', 'Player’s home', 'Eastern waterfront'],
      camera: {
        overview: { ...lens, position: [0, 60, 45], target: [0, 0, 0] },
        arrival: { ...lens, position: [-12, 10, 26], target: [0, 2, -8] },
        player: { position: [0, 1.7, 20], yaw: 0, pitch: 0, eyeHeight: 1.7, walkSpeed: 4.2 },
      },
      environment: { ...goldenHour, timeOfDay: 'morning', sky: { top: '#8ec7da', horizon: '#e4efcc' }, sun: { ...goldenHour.sun, position: [38, 35, -15], color: '#fff1cf', intensity: 2.1 }, fog: { color: '#c7dfd2', near: 60, far: 180 }, weather: { ...goldenHour.weather, wind: { direction: [-1, 0, 0.2], speed: 1.2, gustStrength: 0.3 } } },
      audio: { music: { id: 'new-bark-theme', theme: 'New Bark Town', src: null, volume: 0.45, loop: true }, ambience: [{ id: 'coastal-breeze', src: null, volume: 0.22, loop: true }, { id: 'shore-water', src: null, volume: 0.15, loop: true }], crossfadeMs: 1800 },
      scene: { id: 'new-bark-town', availability: 'planned', seed: 29, bounds: { min: [-35, 0, -35], max: [35, 25, 35] }, asset: { mode: 'procedural', modelUrl: null }, features: [
        { kind: 'building', position: [-13, 0, -15], size: [15, 7, 10] },
        { kind: 'building', position: [9, 0, -4], size: [10, 6, 10] },
        { kind: 'water', position: [30, -0.2, 0], size: [12, 0.3, 70] },
        { kind: 'trees', position: [-30, 0, 0], size: [10, 9, 65] },
      ] },
    },
  ],
  towns: [ { name: 'Goldenrod City', x: 520, y: 508 }, { name: 'Violet City', x: 747, y: 390 }, { name: 'Azalea Town', x: 655, y: 653 }, { name: 'Cherrygrove City', x: 808, y: 590 }, { name: 'Olivine City', x: 340, y: 408 }, { name: 'Cianwood City', x: 187, y: 627 }, { name: 'Mahogany Town', x: 825, y: 278 }, { name: 'Blackthorn City', x: 1007, y: 278 }, { name: 'Lake of Rage', x: 825, y: 148 } ],
  routes: [
    { id: 'west', points: [[187,627],[245,580],[300,505],[340,408],[366,326],[490,278],[588,278]] },
    { id: 'north', points: [[588,278],[825,278],[1007,278],[1020,450],[930,590],[808,590],[747,510],[747,390],[692,350],[588,278]] },
    { id: 'park', points: [[588,278],[548,388],[520,508],[540,600],[655,653],[747,590],[747,390],[650,388],[548,388]] },
    { id: 'lake', points: [[825,278],[825,148]] },
  ],
} as const satisfies Region;
export const regions: Readonly<Partial<Record<RegionId, Region>>> = { johto };
export function getLocation(region: Region, id: string): Location | undefined { return region.locations.find(location => location.id === id); }
