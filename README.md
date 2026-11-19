# PokeEarth — Johto atlas / phase 1

PokeEarth is an interactive Pokémon world explorer with regional maps, cinematic transitions, and procedural 3D locations—starting with Johto’s National Park.

A React + TypeScript regional explorer with a fully local, illustrated Johto map. Select National Park, Ecruteak City, or New Bark Town to animate into a location preview. This delivery intentionally stops before the first-person engine, as requested.

## Run

Use Node.js 22.18+ (Node 24 recommended), then run from this folder:

```sh
npm install
npm run dev
```

Open the localhost URL Vite prints. Production commands:

```sh
npm test
npm run build
npm run preview
```

`npm test` uses Node's built-in TypeScript stripping and needs no installed packages. The dev server and production build require `npm install`. No API keys, external images, external fonts, models, or audio downloads are needed. `index.html` is a Vite entry point; run the dev server rather than double-clicking that file.

## Included behavior

- Responsive sidebar, searchable location list, and illustrated preview cards.
- Three keyboard-accessible pins. Hover/focus updates the illustrated sidebar preview.
- Click a pin or location card to fly to that location over 1.15 seconds.
- Drag to pan, plus/minus buttons to zoom, and a reset-view button.
- Return button and Escape restore the regional overview.
- Reduced-motion preference skips camera animation.
- Stale transition IDs are rejected; animation frames are cancelled on state changes and unmount.
- Status announcements and focus restoration support keyboard navigation.
- Explicit phase-two notice in every location preview. No button pretends a 3D scene is already available.

## Files

```text
pokeearth/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  README.md
  ARCHITECTURE.md
  public/assets/
    audio/README.md
    models/README.md
  src/
    main.tsx
    App.tsx
    styles.css
    data/regions.ts
    state/explorer.ts
    state/explorer.test.ts
    components/
      RegionMap.tsx
      MapArtwork.tsx
      LocationArtwork.tsx
```

Read `ARCHITECTURE.md` for the state flow, scene architecture, coordinate systems, and expansion plan. `src/data/regions.ts` is the complete typed data structure; `src/components/RegionMap.tsx` is the interactive map implementation.

## Scope and fidelity

The atlas is a schematic illustration of Johto's relative geography, not a pixel-accurate recreation of an official map. Map units are unrelated to scene metres. Scene features and dimensions are proposed initial layouts; the National Park fountain, circular paths, grass areas, and trees are configured for the requested next phase. Exact layout fidelity requires selecting a game version and comparing its location map during scene construction. Camera, lighting, and weather values are configuration only until phase two consumes them.

All audio sources are explicitly `null`. They are valid optional hooks, not broken URLs. No music is fetched or played in this phase. The map and cards are original vector illustrations made from SVG shapes.

## Validation performed

Four automated tests pass on Node 24.22.3:

1. A stale arrival cannot replace a newer destination.
2. Cancelling a flight rejects stale arrival and return callbacks.
3. A completed preview can return and select another destination.
4. Location IDs, pin coordinates, spawn bounds, eye height, fog distances, music hooks, and volume ranges meet their data contracts.

The environment returned HTTP 403 from the npm registry during dependency installation. Therefore the React/TypeScript build and browser behavior have **not** been executed here. No package lock is included because installation did not complete. Run `npm install`, `npm test`, and `npm run build` on your machine before deployment; preserve the generated `package-lock.json` for reproducible subsequent installs.

## Manual acceptance checks

- At desktop and mobile widths, select all three destinations and return.
- Hover a pin to update the sidebar card; use Tab and Enter/Space to activate it.
- Pan the map, then immediately click a pin; verify activation still works.
- Press Escape mid-flight and confirm the map returns cleanly.
- Search for a location, select it, return, then clear the search.
- Enable reduced motion in your OS/browser and repeat a transition.
- Check browser console and network for errors; there should be no model, image, or audio requests.

PokeEarth is an unofficial fan project. Pokémon names identify the destinations; no official game artwork or audio files are bundled.
