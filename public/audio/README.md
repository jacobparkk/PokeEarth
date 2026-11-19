# Audio

Each region has `music/` and `ambience/` folders containing **original, procedurally generated** loops
(see `tools/audiogen`). The file names each location expects are in `src/data/<region>/locations.ts`
(`audio.music.src`, `audio.ambience[].src`) plus `music/region-map.ogg|mp3` for each region map theme.

Replace any file with your own (same name, `.ogg` and/or `.mp3`) to change it. Missing files are skipped silently.
Only use audio you have the rights to use.
