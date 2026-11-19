# PokeEarth

An interactive, Google Earth-style explorer for the Pokémon world. Start on a bird's-eye region map, click a landmark, and dive down into a first-person, street-level 3D scene.

> Fan project. Not affiliated with Nintendo, Game Freak, Creatures Inc. or The Pokémon Company. Ship only audio and art you have the rights to use.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
```

Requires Node 20+.

## Status

- ✅ Regions: Kanto, Johto, Hoenn and Sinnoh — 82 pinned locations, 6 with full camera/lighting/audio presets.
- ✅ Interactive region maps with pins, hover previews, pan/zoom/pinch/keyboard and the dive/return transition.
- ✅ First-person engine with six walkable scenes: **National Park**, **Ecruteak City**, **New Bark Town**, **Pallet Town**, **Littleroot Town** and **Twinleaf Town**.
- ✅ Original soundtrack: 10 procedurally composed music loops + 14 ambience loops (`tools/audiogen` regenerates them).
- The other 76 pins are map-only for now; adding a town is mostly a new layout in `src/scenes/towns/layouts.ts`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the file tree, state machine and how to add regions, scenes, audio and models.

## Controls (street view)

| Input | Action |
|---|---|
| Click | Capture mouse for look (Esc releases) |
| Drag | Look around without capturing |
| W A S D / arrows | Walk · hold Shift to run |
| Touch | Drag to look, on-screen stick to move, Run toggle |
| Esc / "Return to Region Map" | Back to the map |

## Controls (map)

| Input | Action |
|---|---|
| Drag / one-finger drag | Pan (with inertia) |
| Scroll / pinch / double-click | Zoom (Shift + double-click zooms out) |
| Arrow keys, `+` / `-`, `0` | Pan, zoom, reset (map focused) |
| Hover or Tab to a pin | Preview card |
| Click a gold pin (tap twice on touch) | Drop in to street view |
| Esc (in street view) | Return to the region map |
