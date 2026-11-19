# Local audio

No track files are required for phase one. Every audio `src` in `src/data/regions.ts` is intentionally null and no audio manager is mounted.

For phase two, put music/ambient files you may use in this folder. Set the relevant `src` to a Vite base-aware URL, for example `import.meta.env.BASE_URL + 'assets/audio/national-park.ogg'`. When that expression is introduced, add `/// <reference types="vite/client" />` to a source declaration file. Keep missing tracks null. Do not rename an absent file into a URL.

Theme identifiers and crossfade timing already live in the schema. Global volume/mute and autoplay unlocking belong to the future persistent audio provider, not individual meshes.
