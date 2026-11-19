# Audio generator

Every music and ambience file in `public/audio` was **synthesized from scratch** by these scripts:
- no samples, recordings or existing soundtracks are used
- the music is original, composed by a seeded rule-based generator

Each loop is seamless (tails wrap into the start), so Howler can loop it without gaps.

```bash
pip install numpy scipy        # plus ffmpeg on your PATH
python3 tools/audiogen/build.py public/audio
```

- `ambience.py` – wind, rustling grass/leaves, fountain, waves, lake, birds, seagulls, crickets, cicadas, temple bell, wind chimes
- `music.py` – tiny synth (lead, flute, pluck, koto, marimba, music box, pad, bass, drums) + composer; edit `TRACKS` to change key, tempo, chords, instruments or seed
- `build.py` – renders everything the location data references to `.ogg` + `.mp3`

To use your own music instead, drop files with the same names into `public/audio/<region>/music/` (or change the `src` paths in `src/data/<region>/locations.ts`).
