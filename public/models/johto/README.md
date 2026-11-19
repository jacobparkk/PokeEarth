# Johto 3D models (optional)

Every explorable location lists **model slots** in `src/data/johto/locations.ts` (`scene.models`).
While a slot's `url` is `null`, the scene renders a procedural stand-in. To use your own asset:

1. Export a glTF binary (`.glb`) with +Y up, 1 unit = 1 metre, origin at the object's base centre.
2. Save it as `public/models/johto/<location-id>/<slot>.glb`, e.g. `national-park/fountain.glb`.
3. Set the slot's `url` to `/models/johto/national-park/fountain.glb` and, if you like, `assetMode: "hybrid"`.

Tip: compress with `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`.
