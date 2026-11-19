# PokeEarth

PokeEarth is an interactive Pokémon world explorer with regional maps, cinematic transitions, and procedural 3D locations—starting with Johto’s National Park.

## Phase 2: National Park

Select National Park on the Johto atlas to descend into a golden-hour 3D park. Walk its circular paths, explore tall grass, and relax by an animated central fountain. Every mesh, grass blade, illustration, and default sound is generated locally; no external models or soundtrack downloads are required.

- React 19, TypeScript, Vite, Three.js, and React Three Fiber 9.
- Lazy-loaded scene, smooth camera descent, responsive HUD, and return-to-map transitions.
- WASD/arrow-key movement, drag-to-look, optional pointer lock, and mobile direction controls.
- Fountain, bench, gate, tree, and boundary collision handling.
- Seeded instanced trees and grass, animated grass shader, rippling water, fountain particles, shadows, and fog.
- Original procedural music plus wind/water ambience, crossfades, volume, and mute. This is **not the official National Park soundtrack**; add a supplied track using the audio configuration.
- Reduced-motion support, scene-error recovery, WebGL context-loss handling, and input cleanup.
- Ecruteak City and New Bark Town retain their illustrated map previews; their first-person scenes are not implemented.

The atlas and park are stylized interpretations, not tile-for-tile reconstructions of a specific game version.

## Run locally

Use Node.js 22.18+ (Node 24 recommended):

```sh
npm ci
npm run dev
```

Open Vite’s printed localhost URL. Do not open `index.html` directly.

```sh
npm test
npm run build
npm run preview
```

For automated browser checks:

```sh
npx playwright install chromium
npm run test:e2e
```

The browser script starts the production preview server, tests desktop and mobile behavior, and writes screenshots to `browser-results/`. GitHub Actions uses the runner’s preinstalled Chrome and runs unit tests, type checking, the production build, and browser checks on feature-branch pushes. Its `pokeearth-review` artifact contains the built site, screenshots, and the generated dependency lockfile.

## Controls

| Action | Control |
| --- | --- |
| Walk | WASD or arrow keys |
| Look | Hold and drag on the scene |
| Free mouse look | Capture mouse button |
| Touch movement | Hold a direction button; drag with another finger to look |
| Return | Return to region map or Escape |
| Sound | Speaker button and volume slider |

Some browsers consume the first Escape to release pointer lock; press Escape again to return. Audio starts only after a user gesture. If autoplay remains blocked, tap the sound control.

## Source map

- `src/data/regions.ts`: region/location schema, camera/environment presets, procedural features, audio sources.
- `src/state/explorer.ts`: map, loading, descent, exploration, error, and return states.
- `src/components/RegionMap.tsx`: interactive SVG atlas and pin transitions.
- `src/components/SceneLoader.tsx`: lazy scene boundary and retry behavior.
- `src/components/ExplorationHUD.tsx`: navigation, sound, controls help, and touch buttons.
- `src/scenes/SceneHost.tsx`: Canvas, lighting, scene readiness, and lifecycle.
- `src/scenes/national-park/`: geometry, fountain/water, instanced foliage, and collision layout.
- `src/scenes/shared/`: environment rig, first-person camera, deterministic generation, and collision math.
- `src/audio/`: original score/noise synthesis, persistent audio bus, and React hook.

Read `ARCHITECTURE.md` for coordinates, transitions, extension points, and limitations. No external backend or API keys are required.

## Review workflow

`main` preserves the approved Phase 1 atlas. Phase 2 is on `feature/national-park-phase-2` for review. No pull request has been opened; one will be created after review is requested.

PokeEarth is an unofficial fan project. No official game artwork or recorded Pokémon music is bundled.
