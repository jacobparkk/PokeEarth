"""Render every audio file PokeEarth's data references, as .ogg + .mp3."""
import os
import subprocess
import sys
import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(__file__))
from ambience import AMBIENCE, SR  # noqa: E402
from music import TRACKS, render  # noqa: E402

OUT = sys.argv[1]
TMP = "/tmp/pe-audio"
os.makedirs(TMP, exist_ok=True)

# region → ambience files its locations reference
AMB_BY_REGION = {
    "johto": ["fountain", "grass-rustle", "birds-evening", "wind-soft", "temple-bell", "leaves-rustle", "wind-chimes", "crickets", "waves-gentle", "wind-gusts", "seagulls", "birds-morning"],
    "kanto": ["birds-morning", "waves-gentle", "wind-soft", "leaves-rustle", "grass-rustle", "forest-insects"],
    "hoenn": ["summer-insects", "birds-morning", "wind-soft", "lava-bubbling", "volcanic-rumble", "wind-gusts"],
    "sinnoh": ["birds-morning", "wind-soft", "lake-lapping", "high-wind", "mystic-hum"],
}


def encode(wav, dest_base, stereo):
    os.makedirs(os.path.dirname(dest_base), exist_ok=True)
    ch = "2" if stereo else "1"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", ch, "-c:a", "libvorbis", "-q:a", "4" if stereo else "3", dest_base + ".ogg"], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", ch, "-c:a", "libmp3lame", "-b:a", "128k" if stereo else "80k", dest_base + ".mp3"], check=True)


def to_wav(x, path):
    data = np.clip(x, -1, 1)
    data = (data.T if data.ndim == 2 else data) * 32767
    wavfile.write(path, SR, data.astype(np.int16))


# Optional filter: `python build.py OUT name1 name2 ...` renders only matching keys.
ONLY = set(sys.argv[2:])
want = lambda key: not ONLY or key in ONLY

rendered_amb = {}
for region, names in AMB_BY_REGION.items():
    for name in names:
        if not want(name):
            continue
        if name not in rendered_amb:
            wav = f"{TMP}/amb-{name}.wav"
            to_wav(AMBIENCE[name](), wav)
            rendered_amb[name] = wav
            print("ambience", name, flush=True)
        encode(rendered_amb[name], f"{OUT}/{region}/ambience/{name}", stereo=False)

for key, track in TRACKS.items():
    if not want(key):
        continue
    region, file = key.split("/")
    wav = f"{TMP}/music-{region}-{file}.wav"
    audio = render(track)
    to_wav(audio, wav)
    print("music", key, f"{audio.shape[1] / SR:.1f}s", flush=True)
    encode(wav, f"{OUT}/{region}/music/{file}", stereo=True)
