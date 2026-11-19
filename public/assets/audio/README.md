# Audio sources

The default park score, wind, and fountain loops are synthesized locally. The score is original, not the recorded National Park theme.

To provide a track, add it to this directory and set its layer's `src` in `src/data/regions.ts` to `import.meta.env.BASE_URL + 'assets/audio/your-track.ogg'`. A non-null source overrides that layer's procedural fallback. Keep missing files null so they are never fetched.

For `import.meta.env` typing, add `/// <reference types="vite/client" />` to a source declaration file. AudioEngine handles decoding, loading errors, fades, volume/mute, and cleanup. No network audio is requested by the default configuration.
