# PokeEarth — System Architecture

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| App framework | **Next.js 15 (App Router) + React 19** | File routing for future `/[region]/[location]` deep links, code-splitting per scene, easy static hosting. |
| 3D | **three.js + @react-three/fiber 9 + drei 10** | Declarative scene graph, `<Sky>`, `<PointerLockControls>`, instancing helpers, `useGLTF` for later assets. |
| Post-processing | **@react-three/postprocessing** | Bloom / vignette / saturation from `environment.postFx`. |
| Audio | **Howler.js** | Cross-browser decoding, format fallbacks, fades, mobile unlock, 3D panning for spatial ambience. |
| State | **Zustand** | One tiny store shared by the DOM UI *and* the R3F render loop (readable outside React via `getState()`, no re-render cost in `useFrame`). |
| UI animation | **motion** (Framer Motion) | Hover cards and the transition curtain. |
| Styling | **Tailwind CSS v4** | Design tokens in `globals.css` (`ink`, `gold`, `parchment`). |

## 2. File tree

```
pokeearth/
├─ ARCHITECTURE.md
├─ package.json · tsconfig.json · next.config.ts · postcss.config.mjs
├─ public/
│  ├─ audio/johto/{music,ambience}/   ← your .ogg/.mp3 files (paths come from locations.ts)
│  └─ models/johto/<location>/        ← optional .glb files that fill scene "model slots"
└─ src/
   ├─ app/
   │  ├─ layout.tsx                   fonts, metadata
   │  ├─ page.tsx                     renders <ExplorerShell/>
   │  └─ globals.css                  Tailwind v4 theme tokens, pin pulse, map grain
   ├─ types/
   │  └─ world.ts                     ★ the whole data schema (regions, locations, camera, env, audio, assets)
   ├─ data/
   │  ├─ regions.ts                   ★ region registry + lookup helpers (getRegion, getLocation…)
   │  ├─ helpers.ts                   comingSoon() builder for map-only pins
   │  ├─ kanto/  johto/  hoenn/  sinnoh/
   │  │  ├─ index.ts                  RegionDefinition: theme, initial view, map theme audio
   │  │  ├─ geography.ts              coastlines, islands, lakes, biomes, forests, mountains, routes, labels
   │  │  └─ locations.ts              82 pins in total; 6 with full presets (one starter town per region + 2 Johto)
   ├─ config/
   │  └─ transitions.ts               every timing of the map ⇄ street hand-off
   ├─ lib/
   │  ├─ geometry.ts                  seeded RNG, spline paths, point-in-polygon, scatter
   │  ├─ mapCamera.ts                 pure 2D camera math (project, clamp, zoom-around, fly interpolation)
   │  └─ terrain.ts                   geography → deterministic trees/peaks/meadows/biomes/paths
   ├─ store/
   │  └─ useExplorerStore.ts          view state machine + persisted audio prefs
   ├─ audio/
   │  ├─ AudioManager.ts              Howler singleton: music crossfade, diffed ambience, 3D listener
   │  └─ useSoundtrack.ts             maps explorer mode → map theme / location music + ambience
   ├─ engine/                         reusable first-person engine (any location)
   │  ├─ FirstPersonController.tsx    aerial→ground descent, WASD, pointer-lock + drag/touch look, collisions, head bob
   │  ├─ SceneEnvironment.tsx         sun/hemisphere/shadows, physical sky, fog, bloom/saturation/tone map/vignette
   │  ├─ ModelSlot.tsx                .glb plug-in point with procedural fallback + error boundary
   │  ├─ AudioListenerSync.tsx        camera → Web Audio listener
   │  ├─ runtime.ts                   scene runtime store + mutable player input
   │  ├─ collision.ts · sun.ts
   │  ├─ foliage/GrassField.tsx       instanced grass, GPU wind, blades part around the player
   │  ├─ foliage/TreeField.tsx        instanced lumpy-canopy trees with wind sway
   │  ├─ particles/AmbientParticles.tsx  pollen / falling leaves / fireflies / sea spray
   │  └─ materials/water.ts           ripple + fresnel + glint water, falling-sheet shader
   ├─ components/
   │  ├─ ExplorerShell.tsx            mounts Map OR Street, plus header/sidebar/curtain/soundtrack
   │  ├─ map/                         RegionMap, RegionTerrain, MapPin, PinPreviewCard, RegionSidebar, useMapCamera
   │  ├─ transition/TransitionCurtain.tsx
   │  ├─ street/StreetViewGateway.tsx resolves the scene via registry (fallback arrival screen)
   │  ├─ hud/StreetHud.tsx            return button, location card, now playing + volume, look prompt, crosshair
   │  ├─ hud/TouchJoystick.tsx        mobile movement stick + run toggle
   │  └─ ui/AppHeader.tsx             brand, breadcrumb, mute + master volume
   └─ scenes/
      ├─ registry.ts                  SceneKey → lazy(() => import(scene))
      └─ national-park/
         ├─ NationalParkScene.tsx     Canvas + world + controller + HUD
         ├─ layout.ts                 paths SDF, grass fields, benches, lamps, hedges, trees, colliders
         ├─ groundTexture.ts          2048² canvas-painted lawn / gravel / paving
         ├─ Fountain.tsx · Gatehouse.tsx · ParkProps.tsx
```

## 3. Map ⇄ First-Person state machine

```
           enterLocation(id)                 completeEnter()
   ┌─────┐ ───────────────▶ ┌──────────┐ ────────────────▶ ┌────────┐
   │ map │                  │ entering │                   │ street │
   └─────┘ ◀─────────────── └──────────┘                   └────────┘
      ▲      (no direct back)                                   │ exitToMap()
      │                completeExit()       ┌─────────┐         │
      └──────────────────────────────────── │ exiting │ ◀───────┘
                                            └─────────┘
```

One store field, `mode`, decides what is mounted. **Only one world exists at a time**: the SVG map is unmounted while the WebGL scene runs, and vice versa, so neither competes for the GPU.

### Enter timeline (`config/transitions.ts`)

```
t=0ms      click pin → mode = "entering"
           RegionMap: camera flies to pin (log-space zoom 1×→7×) while the map plane
           tilts up to 38° with CSS perspective and a horizon haze fades in (Google-Earth dive)
t=850ms    curtain starts fading in (550ms) — location title card appears on it
t=1400ms   dive done → completeEnter() → mode = "street"
           RegionMap unmounts, StreetViewGateway mounts the lazy 3D scene under the curtain
t=1650ms   curtain fades out (900ms) revealing the scene, whose camera starts at
           camera.aerial (matching the dive) and descends to camera.ground over
           descentDurationMs; useSoundtrack fades in audio.music + ambience
```

### Exit timeline

```
"Return to Region Map" / Esc → mode = "exiting"
curtain fades in (500ms), audio fades out (music.fadeOutMs), pointer lock released
curtain onAnimationComplete → completeExit() → mode = "map", returnFromLocationId = id
RegionMap remounts zoomed 7× + tilted on that pin, curtain fades out,
camera flies back out to 1.8× around the pin while un-tilting (1300ms) → consumeReturn()
```

The 3D camera's `aerial` pose is deliberately "the view from the bottom of the map dive", so the cut hidden by the curtain reads as one continuous descent.

## 4. Data-driven design

Everything comes from `RegionDefinition` → `LocationDefinition` (see `types/world.ts`):

- **Map**: `geography` (polygons + routes) is rendered procedurally; `location.map` places the pin, sets its label tier and dive zoom.
- **Preview**: `location.preview` (tagline, 3-colour palette for generated art, highlights).
- **Camera**: `camera.aerial` (descent start), `camera.ground` (spawn, yaw/pitch, eye height, speed, walkable bounds).
- **Environment**: sun angle/colour/shadows, hemisphere light, physical sky params, fog, weather (cloud, wind, particles), post-FX.
- **Audio**: one music track (fades) + N ambience layers, optionally spatial (positioned in metres) or wind-driven.
- **Scene**: `sceneKey` → registry, `seed` for deterministic foliage, `models[]` slots.

`ExplorableLocation` vs `PreviewLocation` is a discriminated union, so the compiler guarantees a location can't be entered without camera/env/audio/scene data.

### Adding things

| To add… | Do this |
|---|---|
| A region | `src/data/<region>/{geography,locations,index}.ts`, import it in `data/regions.ts` replacing its locked stub. No component changes. |
| A pin | Append to `locations.ts` with `status: "coming-soon"`. |
| A playable location | Flip to `"explorable"`, add `camera/environment/audio/scene`, add its key to `SceneKey`, register the scene component in `scenes/registry.ts`. |
| Music / ambience | Drop files in `public/audio/<region>/…`; paths are already in the data. Missing files fail silently. |
| A custom 3D model | Put `.glb` in `public/models/<region>/<location>/`, set the slot's `url`. The scene renders the file instead of `proceduralFallback`. `assetMode: "gltf"` + a `terrain` slot swaps the whole environment. |
| Painted map art | Replace `<g id="terrain-art">` in `RegionTerrain.tsx` with an `<image>` at the same 1000×640 scale; pins and routes still line up. |

## 5. Performance notes

- Terrain SVG is built once (seeded, memoised); panning only rewrites one `transform` attribute.
- Paper grain is a static screen-space overlay — no SVG filters inside the transformed group.
- Routes use `vector-effect: non-scaling-stroke` so they stay crisp and thin at 9× zoom.
- Each 3D scene is a separate lazy chunk; three.js isn't downloaded until the first drop-in.
- Zustand lets the R3F loop read prefs via `getState()` without React re-renders.

## 6. First-person engine (Phase 4)

**Audio flow.** `useSoundtrack()` (mounted once in the shell) watches the state machine:
`map` → region map theme · `entering` → fade out over the dive · `street` → location music (fadeInMs) + ambience layers ·
`exiting` → fade out (music.fadeOutMs). `AudioManager` crossfades music, diffs ambience layers by id, positions spatial layers
with HRTF panning, and `AudioListenerSync` moves the listener with the camera. Master volume/mute go through `Howler.volume/mute`.

**Controls.** Click the scene to capture the mouse (pointer lock); drag to look without capturing; touch-drag to look and use the on-screen
stick to move. WASD/arrows to walk, Shift to run. Esc frees the mouse; Esc again (or the HUD button) returns to the map.

**Making another location playable** (e.g. Ecruteak City): create `src/scenes/ecruteak-city/` with a layout + scene component that
reuses `SceneEnvironment`, `FirstPersonController`, `TreeField`, `GrassField`, `AmbientParticles` and `ModelSlot`, then add one line to
`scenes/registry.ts`. Camera, lighting, weather, audio and asset slots are already in the data.
