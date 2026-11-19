"""Original, procedurally composed background loops for PokeEarth.

Every track is composed from scratch by a seeded generator (chord progression +
rule-based melody + accompaniment patterns) and rendered with simple additive
synths, so nothing here derives from any existing soundtrack.
"""
from dataclasses import dataclass, field
import numpy as np
from scipy import signal

SR = 44100

SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "insen": [0, 1, 5, 7, 10],  # Japanese in-sen
}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def adsr(n, a, d, s, r, sustain_samples):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    env = np.zeros(n)
    hold = max(sustain_samples, a + d)
    seg = np.concatenate([
        np.linspace(0, 1, max(a, 1), endpoint=False),
        np.linspace(1, s, max(d, 1), endpoint=False),
        np.full(max(hold - a - d, 0), s),
    ])[:n]
    env[: len(seg)] = seg
    rel_start = len(seg)
    rel = s * np.exp(-np.arange(max(n - rel_start, 0)) / max(r, 1) * 4)
    env[rel_start:] = rel
    return env


# --------------------------------------------------------------------------- instruments


def inst_lead(f, dur, vel):
    """Soft square lead with delayed vibrato."""
    n = int((dur + 0.4) * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.18) * 4, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = sum(np.sin(k * ph) / k**1.35 for k in (1, 3, 5, 7, 9))
    return s * adsr(n, 0.015, 0.12, 0.7, 0.25, int(dur * SR)) * vel * 0.55


def inst_flute(f, dur, vel, rng):
    n = int((dur + 0.35) * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.008 * np.sin(2 * np.pi * 4.8 * t) * np.clip((t - 0.2) * 3, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = signal.sosfilt(signal.butter(2, [f * 0.8, min(f * 3, 16000)], btype="band", fs=SR, output="sos"), rng.standard_normal(n)) * 0.05
    return (s + breath) * adsr(n, 0.06, 0.1, 0.8, 0.22, int(dur * SR)) * vel * 0.6


def inst_pluck(f, dur, vel, bright=1.0):
    """Guitar/harp-like pluck: harmonics decaying faster with height."""
    n = int((dur + 1.4) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, 9):
        if f * k > 15000:
            break
        s += np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.6 / bright)) / k**1.1
    return s * (1 - np.exp(-t * 900)) * vel * 0.55


def inst_koto(f, dur, vel):
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    bend = 1 + 0.012 * np.exp(-t * 25)
    ph = 2 * np.pi * f * np.cumsum(bend) / SR
    s = sum(np.sin(k * ph) * np.exp(-t * (1.8 + k * 1.3)) / k**0.9 for k in range(1, 8))
    return s * (1 - np.exp(-t * 1500)) * vel * 0.5


def inst_marimba(f, dur, vel):
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 14) + 0.08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 30)
    return s * (1 - np.exp(-t * 2000)) * vel * 0.6


def inst_musicbox(f, dur, vel):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.4 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t * 6) + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 11)
    return s * (1 - np.exp(-t * 3000)) * vel * 0.5


def inst_pad(f, dur, vel):
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.006, 0.0, 0.007):
        for k in range(1, 7):
            s += np.sin(2 * np.pi * f * (1 + det) * k * t + k) / k**1.6
    return s * adsr(n, 0.45, 0.4, 0.8, 0.9, int(dur * SR)) * vel * 0.16


def inst_bass(f, dur, vel):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t) / k**2 * (1 if k % 2 else 0.3) for k in range(1, 6))
    return s * adsr(n, 0.008, 0.25, 0.55, 0.12, int(dur * SR)) * vel * 0.8


def drum_kick(vel):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * vel


def drum_snare(vel, rng):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = signal.sosfilt(signal.butter(2, [1200, 7000], btype="band", fs=SR, output="sos"), rng.standard_normal(n))
    return (noise * 0.7 + 0.3 * np.sin(2 * np.pi * 190 * t)) * np.exp(-t * 22) * vel * 0.6


def drum_shaker(vel, rng):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    noise = signal.sosfilt(signal.butter(2, 6000, btype="high", fs=SR, output="sos"), rng.standard_normal(n))
    return noise * np.exp(-t * 60) * vel * 0.35


def drum_woodblock(vel):
    n = int(0.15 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 820 * t) + 0.5 * np.sin(2 * np.pi * 1640 * t)) * np.exp(-t * 45) * vel * 0.5


# --------------------------------------------------------------------------- composition


@dataclass
class Track:
    name: str
    root: int  # MIDI note of the tonic (bass octave, e.g. 50 = D3)
    scale: str
    bpm: float
    beats: int  # beats per bar
    prog_a: list
    prog_b: list
    lead: str
    accomp: str  # "arp", "waltz", "pad", "march", "koto"
    accomp_inst: str
    perc: str  # "none", "light", "march", "shaker", "woodblock"
    pad: bool = True
    seed: int = 1
    lead_octave: int = 2
    swing: float = 0.0
    chord_mode: str = "triad"
    form: str = "AABA"
    notes: list = field(default_factory=list)


RHYTHMS = {
    4: [[1, 1, 1, 1], [2, 1, 1], [1.5, 0.5, 1, 1], [1, 0.5, 0.5, 2], [3, 1], [0.5, 0.5, 1, 2], [1, 1, 2], [1, 1, 0.5, 0.5, 1]],
    3: [[1, 1, 1], [2, 1], [1.5, 0.5, 1], [1, 2], [0.5, 0.5, 1, 1], [1, 0.5, 0.5, 1]],
}
CADENCE = {4: [[2, 2], [3, 1], [4]], 3: [[3], [2, 1]]}


def chord_tones(track: Track, degree: int):
    sc = SCALES[track.scale]
    L = len(sc)

    def deg_to_semi(d):
        return sc[d % L] + 12 * (d // L)

    if track.chord_mode == "power":
        r = deg_to_semi(degree)
        return [r, r + 7, r + 12]
    return [deg_to_semi(degree), deg_to_semi(degree + 2), deg_to_semi(degree + 4)]


def compose(track: Track):
    rng = np.random.default_rng(track.seed)
    sc = SCALES[track.scale]
    L = len(sc)
    bar_beats = track.beats
    events = []  # (inst, start_beat, dur_beats, midi, vel, pan)

    def deg_to_midi(d, octave_base):
        return octave_base + sc[d % L] + 12 * (d // L)

    lead_base = track.root + 12 * track.lead_octave

    def make_phrase(progression, bar0, cadence_on_root):
        """Two-bar-phrase melody over len(progression) bars using a repeated rhythm motif."""
        motif = [RHYTHMS[bar_beats][int(rng.integers(0, len(RHYTHMS[bar_beats])))] for _ in range(2)]
        notes = []
        cur = L + int(rng.integers(0, 3))  # scale index around the octave above lead_base
        nbars = len(progression)
        for b in range(nbars):
            cell = motif[b % 2]
            last_bar = b == nbars - 1
            if last_bar or (b % 2 == 1 and rng.uniform() < 0.5):
                cell = CADENCE[bar_beats][int(rng.integers(0, len(CADENCE[bar_beats])))]
            chord_degs = [(progression[b] + k) for k in ((0, 2, 4) if track.chord_mode == "triad" else (0, 3))]
            pos = 0.0
            for i, d in enumerate(cell):
                strong = pos == 0 or (bar_beats == 4 and pos == 2)
                if strong:
                    cands = [c + L * o for c in chord_degs for o in (0, 1, 2)]
                    cur = min(cands, key=lambda c: abs(c - cur) + rng.uniform(0, 1.6))
                else:
                    step = int(rng.choice([-1, 1, -1, 1, -2, 2, 0]))
                    cur += step
                cur = int(np.clip(cur, L - 2, 2 * L + 4))
                is_final = last_bar and i == len(cell) - 1
                if is_final and cadence_on_root:
                    cur = min([progression[b] + L * o for o in (1, 2)], key=lambda c: abs(c - cur))
                rest = (not strong) and rng.uniform() < 0.1 and not is_final
                if not rest:
                    notes.append((bar0 + b, pos, d, deg_to_midi(cur, lead_base - 12)))
                pos += d
        return notes

    sections = {}
    for sec in set(track.form):
        prog = track.prog_a if sec == "A" else track.prog_b
        sections[sec] = make_phrase(prog, 0, cadence_on_root=True)
    # A-section variation for repeats: same rhythm, re-pick a few pitches.
    bar = 0
    for idx, sec in enumerate(track.form):
        prog = track.prog_a if sec == "A" else track.prog_b
        phrase = sections[sec]
        for (b, pos, d, m) in phrase:
            vary = sec == "A" and idx > 0 and rng.uniform() < 0.2 and pos > 0
            if vary:
                m += int(rng.choice([-2, -1, 1, 2]))
                m = min([deg_to_midi(k, lead_base - 12) for k in range(L * 4)], key=lambda x: abs(x - m))
            events.append(("lead", (bar + b) * bar_beats + pos, d * 0.95, m, 0.8, 0.0))
        for b, deg in enumerate(prog):
            start = (bar + b) * bar_beats
            tones = chord_tones(track, deg)
            accompany(track, events, start, tones, rng)
        bar += len(prog)
    return events, bar


def accompany(track, events, start, tones, rng):
    B = track.beats
    r = track.root
    root_m = r + tones[0] % 12 if tones[0] % 12 >= 0 else r
    bass_note = r - 12 + tones[0]
    while bass_note > r + 4:
        bass_note -= 12
    # Bass
    if track.accomp == "waltz":
        events.append(("bass", start, 1.0, bass_note, 0.9, 0))
    elif track.accomp == "march":
        events += [("bass", start, 0.9, bass_note, 0.9, 0), ("bass", start + 1, 0.4, bass_note + 7, 0.6, 0), ("bass", start + 2, 0.9, bass_note, 0.85, 0), ("bass", start + 3, 0.4, bass_note + 7, 0.6, 0)]
    elif track.accomp == "koto":
        events.append(("bass", start, B * 0.9, bass_note, 0.6, 0))
    else:
        events.append(("bass", start, 1.8 if B == 4 else 1.4, bass_note, 0.85, 0))
        if B == 4:
            events.append(("bass", start + 2, 1.2, bass_note + (7 if rng.uniform() < 0.5 else 12), 0.7, 0))
    # Chords
    chord = [r + 12 + t for t in tones]
    if track.pad:
        for i, m in enumerate(chord):
            events.append(("pad", start, B * 0.98, m, 0.6, (-0.4, 0, 0.4)[i % 3]))
    if track.accomp == "arp":
        pattern = [0, 1, 2, 3, 2, 1, 0, 1] if B == 4 else [0, 1, 2, 3, 2, 1]
        arp = chord + [chord[0] + 12]
        for i, p in enumerate(pattern):
            events.append((track.accomp_inst, start + i * 0.5, 0.45, arp[p] + 12, 0.45, 0.35))
    elif track.accomp == "waltz":
        for beat in (1, 2):
            for i, m in enumerate(chord):
                events.append((track.accomp_inst, start + beat, 0.8, m + 12, 0.33, (-0.3, 0, 0.3)[i]))
    elif track.accomp == "march":
        for beat in (1, 3):
            for i, m in enumerate(chord):
                events.append((track.accomp_inst, start + beat, 0.4, m + 12, 0.3, 0.25))
    elif track.accomp == "koto":
        for i, off in enumerate([0, 1.5, 2.5]):
            events.append((track.accomp_inst, start + off, 1.0, chord[i % len(chord)] + 12, 0.45, -0.35))
    # Percussion
    if track.perc == "light":
        events += [("kick", start, 0, 0, 0.6, 0), ("snare", start + B - 1, 0, 0, 0.35, 0.1)]
        events += [("shaker", start + i * 0.5, 0, 0, 0.5 if i % 2 else 0.8, 0.3) for i in range(B * 2)]
    elif track.perc == "march":
        events += [("kick", start + k, 0, 0, 0.75, 0) for k in (0, 2)]
        events += [("snare", start + k, 0, 0, 0.5, 0.1) for k in (1, 3)]
        events += [("snare", start + 3.5, 0, 0, 0.25, 0.1)]
    elif track.perc == "shaker":
        events += [("shaker", start + i * 0.5, 0, 0, 0.45 if i % 2 else 0.7, 0.3) for i in range(B * 2)]
    elif track.perc == "woodblock":
        events += [("woodblock", start, 0, 0, 0.6, -0.2), ("woodblock", start + 2.5, 0, 0, 0.4, -0.2)]


# --------------------------------------------------------------------------- render

MIX = {"lead": 0.42, "pad": 0.55, "bass": 0.42, "pluck": 0.45, "marimba": 0.5, "musicbox": 0.5, "koto": 0.55, "flute": 0.45, "kick": 0.6, "snare": 0.4, "shaker": 0.25, "woodblock": 0.4}


def render(track: Track):
    events, bars = compose(track)
    spb = 60.0 / track.bpm
    total_beats = bars * track.beats
    n = int(round(total_beats * spb * SR))
    out = np.zeros((2, n))
    rng = np.random.default_rng(track.seed + 99)

    for inst, beat, dur_b, m, vel, pan in events:
        if track.swing and (beat * 2) % 2 == 1:
            beat += track.swing * 0.5
        start = int(beat * spb * SR)
        dur = dur_b * spb
        f = mtof(m) if m else 0
        if inst == "lead":
            which = track.lead
            if which == "flute":
                s = inst_flute(f, dur, vel, rng)
            elif which == "koto":
                s = inst_koto(f, dur, vel)
            elif which == "musicbox":
                s = inst_musicbox(f, dur, vel)
            elif which == "marimba":
                s = inst_marimba(f, dur, vel)
            else:
                s = inst_lead(f, dur, vel)
            gain = MIX.get(which, MIX["lead"])
        elif inst == "pad":
            s, gain = inst_pad(f, dur, vel), MIX["pad"]
        elif inst == "bass":
            s, gain = inst_bass(f, dur, vel), MIX["bass"]
        elif inst == "pluck":
            s, gain = inst_pluck(f, dur, vel), MIX["pluck"]
        elif inst == "marimba":
            s, gain = inst_marimba(f, dur, vel), MIX["marimba"]
        elif inst == "musicbox":
            s, gain = inst_musicbox(f, dur, vel), MIX["musicbox"]
        elif inst == "koto":
            s, gain = inst_koto(f, dur, vel), MIX["koto"]
        elif inst == "kick":
            s, gain = drum_kick(vel), MIX["kick"]
        elif inst == "snare":
            s, gain = drum_snare(vel, rng), MIX["snare"]
        elif inst == "shaker":
            s, gain = drum_shaker(vel, rng), MIX["shaker"]
        elif inst == "woodblock":
            s, gain = drum_woodblock(vel), MIX["woodblock"]
        else:
            continue
        # Light humanisation.
        start += int(rng.normal(0, 0.004) * SR) if inst not in ("pad", "bass") else 0
        lg = np.cos((pan + 1) * np.pi / 4)
        rg = np.sin((pan + 1) * np.pi / 4)
        idx = (start + np.arange(len(s))) % n  # tails wrap into the loop start
        np.add.at(out[0], idx, s * gain * lg)
        np.add.at(out[1], idx, s * gain * rg)

    out = reverb(out, rng)
    # Gentle glue: soft clip and normalise.
    out = np.tanh(out / np.max(np.abs(out)) * 1.4)
    out *= 0.89 / np.max(np.abs(out))
    return out


def reverb(x, rng, seconds=1.8, wet=0.22):
    n = x.shape[1]
    L = int(seconds * SR)
    t = np.arange(L) / SR
    y = np.empty_like(x)
    for ch in range(2):
        ir = rng.standard_normal(L) * np.exp(-t * 3.2)
        ir = signal.sosfilt(signal.butter(1, 5000, btype="low", fs=SR, output="sos"), ir)
        ir /= np.sqrt(np.sum(ir**2))
        conv = signal.fftconvolve(x[ch], ir)
        wetsig = conv[:n].copy()
        tail = conv[n:]
        wetsig[: len(tail)] += tail  # circular wrap keeps the loop seamless
        y[ch] = x[ch] * (1 - wet) + wetsig * wet * 1.4
    return y


# --------------------------------------------------------------------------- tracks

TRACKS = {
    "johto/region-map": Track("Johto map", 50, "major", 104, 4, [0, 4, 5, 3], [1, 4, 0, 5], "lead", "arp", "pluck", "light", seed=11),
    "johto/national-park": Track("National Park", 53, "major", 90, 3, [0, 5, 3, 4], [3, 2, 1, 4], "flute", "waltz", "pluck", "none", seed=22, lead_octave=2),
    "johto/ecruteak-city": Track("Ecruteak City", 45, "insen", 76, 4, [0, 2, 0, 3], [2, 3, 1, 0], "koto", "koto", "koto", "woodblock", seed=33, chord_mode="power", lead_octave=2),
    "johto/new-bark-town": Track("New Bark Town", 55, "major", 98, 4, [0, 3, 0, 4], [5, 3, 0, 4], "flute", "arp", "pluck", "shaker", seed=44, swing=0.25),
    "kanto/region-map": Track("Kanto map", 48, "major", 116, 4, [0, 3, 4, 0], [5, 1, 4, 0], "lead", "march", "pluck", "march", seed=55),
    "kanto/pallet-town": Track("Pallet Town", 48, "major", 84, 4, [0, 2, 3, 4], [3, 4, 2, 5], "musicbox", "arp", "pluck", "none", seed=66),
    "hoenn/region-map": Track("Hoenn map", 52, "major", 108, 4, [0, 4, 5, 3], [3, 4, 2, 5], "lead", "arp", "marimba", "light", seed=77),
    "hoenn/littleroot-town": Track("Littleroot Town", 46, "major", 94, 4, [0, 5, 1, 4], [3, 0, 1, 4], "flute", "arp", "marimba", "shaker", seed=88),
    "sinnoh/region-map": Track("Sinnoh map", 50, "minor", 98, 4, [0, 5, 2, 6], [3, 0, 5, 4], "lead", "arp", "pluck", "light", seed=99, lead_octave=2),
    "sinnoh/twinleaf-town": Track("Twinleaf Town", 51, "major", 80, 3, [0, 3, 5, 4], [3, 4, 0, 4], "musicbox", "waltz", "pluck", "none", seed=111),
}
