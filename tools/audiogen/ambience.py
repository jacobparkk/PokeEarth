"""Procedural, original ambience loops for PokeEarth. All sounds are synthesized from noise and oscillators."""
import numpy as np
from scipy import signal

SR = 44100


def rng_for(name: str) -> np.random.Generator:
    return np.random.default_rng(sum(map(ord, name)) * 7919)


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def highpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def pink(n, rng):
    """Voss-like pink noise via FFT shaping."""
    w = rng.standard_normal(n)
    f = np.fft.rfft(w)
    k = np.arange(len(f))
    k[0] = 1
    f /= np.sqrt(k)
    p = np.fft.irfft(f, n)
    return p / np.max(np.abs(p))


def brown(n, rng):
    b = np.cumsum(rng.standard_normal(n))
    b = highpass(b, 15)
    return b / np.max(np.abs(b))


def slow_env(n, rng, rates=(0.05, 0.11, 0.23), depth=0.5, base=0.6):
    t = np.arange(n) / SR
    e = np.zeros(n)
    for r in rates:
        e += np.sin(2 * np.pi * r * t + rng.uniform(0, 2 * np.pi))
    e /= len(rates)
    return np.clip(base + depth * e, 0.05, None)


def loopify(x, fade_s=2.0):
    """Make a seamless loop: crossfade the extra tail into the head."""
    f = int(fade_s * SR)
    body = x[:-f].copy()
    tail = x[-f:]
    ramp = np.linspace(0, 1, f)
    body[:f] = body[:f] * ramp + tail * (1 - ramp)
    return body


def wrap_add(buf, sig, start):
    """Add `sig` into circular buffer `buf` starting at `start` (tails wrap around for seamless loops)."""
    n = len(buf)
    idx = (start + np.arange(len(sig))) % n
    np.add.at(buf, idx, sig)


FADE = int(2.0 * SR)


def bed(n, rng, fn):
    """Continuous noise bed of exactly n samples that loops seamlessly."""
    return loopify(fn(n + FADE, rng))


def normalize(x, peak=0.8):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 0 else x


# --------------------------------------------------------------------------- beds


def wind(dur, name, gusty=False):
    rng = rng_for(name)
    n = int((dur + 2) * SR)
    base = brown(n, rng) * 0.7 + pink(n, rng) * 0.3
    low = bandpass(base, 120, 900)
    high = bandpass(pink(n, rng), 900, 3200) * 0.25
    env = slow_env(n, rng, rates=(0.04, 0.09, 0.17) if not gusty else (0.06, 0.13, 0.31), depth=0.7 if gusty else 0.45)
    if gusty:
        env = env**2.2
    whistle = bandpass(pink(n, rng), 600, 680, order=4) * 0.6 * slow_env(n, rng, rates=(0.07, 0.19), depth=0.8, base=0.2)
    x = (low + high * env) * env + whistle * env
    return normalize(loopify(x), 0.7)


def rustle(dur, name, density=14, bright=2600):
    rng = rng_for(name)
    n = int((dur + 2) * SR)
    noise = highpass(pink(n, rng), bright)
    env = np.zeros(n)
    # Bursts of overlapping grains, clustered in gusts.
    gust = slow_env(n, rng, rates=(0.05, 0.12), depth=0.8, base=0.4)
    count = int(density * dur)
    for _ in range(count):
        c = int(rng.uniform(0, n - SR))
        if rng.uniform() > gust[c]:
            continue
        L = int(rng.uniform(0.04, 0.35) * SR)
        g = np.hanning(L) * rng.uniform(0.3, 1.0)
        env[c : c + L] += g
    bed = bandpass(pink(n, rng), 1500, 6000) * 0.12 * gust
    x = noise * env * 0.6 + bed
    return normalize(loopify(x), 0.6)


def fountain(dur, name):
    rng = rng_for(name)
    n = int((dur + 2) * SR)
    body = bandpass(pink(n, rng), 350, 7000) * 0.7
    low = bandpass(brown(n, rng), 60, 300) * 0.35
    shimmer = slow_env(n, rng, rates=(0.3, 0.7, 1.3), depth=0.15, base=0.9)
    drops = np.zeros(n)
    for _ in range(int(60 * dur)):
        c = int(rng.uniform(0, n - 4000))
        L = int(rng.uniform(0.006, 0.03) * SR)
        f = rng.uniform(900, 3500)
        t = np.arange(L) / SR
        drops[c : c + L] += np.sin(2 * np.pi * f * t * (1 + 2.5 * t)) * np.exp(-t * 180) * rng.uniform(0.1, 0.5)
    x = (body + low) * shimmer + drops
    return normalize(loopify(x), 0.7)


def waves(dur, name, period=(6.5, 9.5), size=1.0):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    t0 = 0.0
    while t0 < dur:
        p = rng.uniform(*period)
        L = int(p * 1.6 * SR)
        noise = pink(L, rng)
        t = np.linspace(0, 1, L)
        # Rise, crash, long retreating hiss.
        env = np.where(t < 0.35, (t / 0.35) ** 2, np.exp(-(t - 0.35) * 3.2))
        crash = lowpass(noise, 900 * size + 300) * env
        hiss = highpass(noise, 2500) * env * np.clip(t * 3 - 0.6, 0, 1) * 0.35
        wrap_add(out, (crash + hiss) * rng.uniform(0.6, 1.0), int(t0 * SR))
        t0 += p
    b = bed(n, rng, lambda m, r: lowpass(brown(m, r), 300)) * 0.25
    return normalize(out + b, 0.7)


# --------------------------------------------------------------------------- creatures


def chirp(f0, f1, dur, harm=(1.0, 0.25, 0.08), vib=0.0, rng=None):
    t = np.arange(int(dur * SR)) / SR
    k = t / max(dur, 1e-4)
    f = f0 + (f1 - f0) * (np.sin(k * np.pi / 2) ** 1.5)
    if vib:
        f = f * (1 + 0.04 * np.sin(2 * np.pi * vib * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(a * np.sin((i + 1) * ph) for i, a in enumerate(harm))
    env = np.sin(np.pi * k) ** 0.6
    return s * env


def bird_call(rng, kind):
    parts = []
    if kind == "trill":
        base = rng.uniform(3200, 4800)
        for i in range(int(rng.integers(6, 14))):
            parts.append(chirp(base * 1.1, base * 0.85, 0.035))
            parts.append(np.zeros(int(0.018 * SR)))
    elif kind == "whistle":
        a = rng.uniform(2200, 3000)
        parts += [chirp(a, a * 1.25, 0.22, vib=7), np.zeros(int(0.08 * SR)), chirp(a * 1.1, a * 0.9, 0.3, vib=6)]
    elif kind == "warble":
        base = rng.uniform(2600, 3800)
        for _ in range(int(rng.integers(4, 9))):
            d = rng.uniform(0.04, 0.11)
            f0 = base * rng.uniform(0.8, 1.3)
            parts.append(chirp(f0, f0 * rng.uniform(0.7, 1.4), d))
            parts.append(np.zeros(int(rng.uniform(0.01, 0.05) * SR)))
    else:  # coo (dove-ish, low)
        a = rng.uniform(550, 700)
        parts += [chirp(a, a * 1.05, 0.35, harm=(1, 0.5, 0.2)), np.zeros(int(0.12 * SR)), chirp(a * 1.05, a * 0.92, 0.6, harm=(1, 0.5, 0.2))]
    return np.concatenate(parts)


def birds(dur, name, calls_per_min=24, kinds=("trill", "whistle", "warble", "coo")):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(int(calls_per_min * dur / 60)):
        kind = kinds[int(rng.integers(0, len(kinds)))]
        call = bird_call(rng, kind) * rng.uniform(0.15, 0.6)
        # Distance: farther birds are quieter and duller.
        if rng.uniform() < 0.5:
            call = lowpass(call, 3500) * 0.6
        wrap_add(out, call, int(rng.uniform(0, n)))
    b = bed(n, rng, lambda m, r: bandpass(pink(m, r), 200, 2000)) * 0.05
    return normalize(out + b, 0.6)


def seagulls(dur, name):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(int(dur / 3.5)):
        start = int(rng.uniform(0, n))
        f = rng.uniform(1100, 1500)
        for j in range(int(rng.integers(1, 4))):
            L = rng.uniform(0.25, 0.45)
            t = np.arange(int(L * SR)) / SR
            k = t / L
            freq = f * (1.25 - 0.45 * k) * (1 + 0.02 * np.sin(2 * np.pi * 28 * t))
            ph = 2 * np.pi * np.cumsum(freq) / SR
            s = signal.sawtooth(ph) * 0.6 + np.sin(ph)
            s = bandpass(s, 800, 4500) * np.sin(np.pi * k) ** 0.5
            wrap_add(out, s * rng.uniform(0.2, 0.5), start + int(j * (L + 0.12) * SR))
    return normalize(lowpass(out, 5000), 0.55)


def crickets(dur, name):
    rng = rng_for(name)
    n = int(dur * SR)
    m = n + FADE
    t = np.arange(m) / SR
    out = np.zeros(m)
    for _ in range(6):
        f = rng.uniform(4200, 5200)
        pulse = rng.uniform(25, 38)
        group = rng.uniform(1.2, 2.4)
        carrier = np.sin(2 * np.pi * f * t)
        pulses = (np.sin(2 * np.pi * pulse * t) > 0.3).astype(float)
        groups = (np.sin(2 * np.pi * (1 / group) * t + rng.uniform(0, 6)) > 0.1).astype(float)
        env = lowpass(pulses * groups, 300)
        out += carrier * env * rng.uniform(0.15, 0.45)
    out = loopify(out)
    b = bed(n, rng, lambda k, r: bandpass(pink(k, r), 300, 1500)) * 0.03
    return normalize(out + b, 0.45)


def cicadas(dur, name):
    rng = rng_for(name)
    n = int(dur * SR) + FADE
    t = np.arange(n) / SR
    out = np.zeros(n)
    for _ in range(4):
        buzz = bandpass(rng.standard_normal(n), rng.uniform(4000, 5000), rng.uniform(6000, 7500), order=3)
        am = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(80, 140) * t)
        swell_period = rng.uniform(6, 12)
        swell = np.clip(np.sin(2 * np.pi * t / swell_period + rng.uniform(0, 6)), 0, None) ** 1.5
        out += buzz * am * swell
    return normalize(loopify(out), 0.45)


def bell(freq, dur, rng):
    t = np.arange(int(dur * SR)) / SR
    ratios = [0.5, 1.0, 1.19, 1.56, 2.0, 2.51, 2.66, 3.01, 4.07]
    amps = [0.6, 1.0, 0.55, 0.4, 0.35, 0.25, 0.2, 0.15, 0.08]
    s = np.zeros_like(t)
    for r, a in zip(ratios, amps):
        decay = 0.6 + 4.5 / (r + 0.5)
        s += a * np.sin(2 * np.pi * freq * r * t * (1 + rng.uniform(-0.001, 0.001))) * np.exp(-t / decay * 0.8)
    s *= 1 - np.exp(-t * 400)
    return s


def temple_bell(dur, name):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    for i, start in enumerate([0.5, dur * 0.48]):
        b = bell(rng.uniform(110, 130) if i == 0 else rng.uniform(140, 150), 14, rng)
        wrap_add(out, b * (0.9 if i == 0 else 0.6), int(start * SR))
    out = lowpass(out, 3000)
    b = bed(n, rng, lambda m, r: lowpass(brown(m, r), 250)) * 0.06
    return normalize(out + b, 0.6)


def wind_chimes(dur, name):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0]
    gust = slow_env(n, rng, rates=(0.05, 0.11), depth=0.9, base=0.3)
    for _ in range(int(dur * 3)):
        c = int(rng.uniform(0, n))
        if rng.uniform() > gust[c % n]:
            continue
        f = notes[int(rng.integers(0, len(notes)))]
        t = np.arange(int(3.5 * SR)) / SR
        s = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6))
        s *= np.exp(-t * 1.2) * (1 - np.exp(-t * 800)) * rng.uniform(0.15, 0.5)
        wrap_add(out, s, c)
    return normalize(out, 0.5)


def lake(dur, name):
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    t0 = 0.0
    while t0 < dur:
        p = rng.uniform(1.4, 2.8)
        L = int(p * 1.3 * SR)
        noise = pink(L, rng)
        k = np.linspace(0, 1, L)
        env = np.where(k < 0.25, (k / 0.25) ** 2, np.exp(-(k - 0.25) * 5))
        lap = bandpass(noise, 150, 1400) * env
        # Little "plip" as the water touches the shore.
        plip = np.zeros(L)
        pl = int(0.03 * SR)
        tt = np.arange(pl) / SR
        plip[int(0.25 * L) : int(0.25 * L) + pl] = np.sin(2 * np.pi * rng.uniform(500, 900) * tt) * np.exp(-tt * 120) * 0.4
        wrap_add(out, (lap + plip) * rng.uniform(0.4, 1.0), int(t0 * SR))
        t0 += p
    return normalize(out, 0.6)


def lava(dur, name):
    """Thick bubbling: low glooping pops over a dense, rolling bed."""
    rng = rng_for(name)
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(int(dur * 7)):
        L = int(rng.uniform(0.08, 0.35) * SR)
        t = np.arange(L) / SR
        f0 = rng.uniform(60, 180)
        pop = np.sin(2 * np.pi * f0 * t * (1 + 3 * t)) * np.exp(-t * rng.uniform(9, 20))
        pop += bandpass(rng.standard_normal(L), 200, 1200) * np.exp(-t * 40) * 0.4
        wrap_add(out, pop * rng.uniform(0.2, 0.8), int(rng.uniform(0, n)))
    b = bed(n, rng, lambda m, r: lowpass(brown(m, r), 220)) * 0.5
    hiss = bed(n, rng, lambda m, r: bandpass(pink(m, r), 1500, 5000)) * 0.06
    return normalize(out + b + hiss, 0.7)


def rumble(dur, name):
    """Deep volcanic rumble with slow surges."""
    rng = rng_for(name)
    n = int(dur * SR)
    m = n + FADE
    t = np.arange(m) / SR
    deep = lowpass(brown(m, rng), 90, order=4)
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 11.0 + 1.0) * np.sin(2 * np.pi * t / 7.3)
    out = loopify(deep * (0.5 + 0.8 * swell))
    return normalize(out, 0.75)


def high_wind(dur, name):
    """Howling summit wind: gusty bed plus resonant, pitch-wandering whistles."""
    rng = rng_for(name)
    n = int((dur + 2) * SR)
    t = np.arange(n) / SR
    base = wind(dur, name + "-bed", gusty=True)
    howl = np.zeros(n)
    for f0, depth in ((420, 90), (610, 130), (880, 160)):
        f = f0 + depth * np.sin(2 * np.pi * t / rng.uniform(5, 9) + rng.uniform(0, 6))
        ph = 2 * np.pi * np.cumsum(f) / SR
        noise = bandpass(pink(n, rng), f0 * 0.8, f0 * 1.25, order=3)
        howl += (np.sin(ph) * 0.25 + noise) * slow_env(n, rng, rates=(0.07, 0.15), depth=0.9, base=0.25)
    howl = loopify(howl)
    return normalize(base[: len(howl)] + howl[: len(base)] * 0.6, 0.7)


def mystic_hum(dur, name):
    """A slow, beating drone with faint shimmering overtones (resonating stone)."""
    rng = rng_for(name)
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    # Frequencies chosen to complete whole cycles over the loop so it is seamless.
    for f, a in ((55.0, 1.0), (55.5, 0.8), (110.25, 0.45), (164.75, 0.25), (440.0, 0.06), (659.5, 0.04)):
        fc = round(f * dur) / dur
        out += a * np.sin(2 * np.pi * fc * t)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t * (round(dur / 8) / dur))
    return normalize(out * lfo, 0.6)


# --------------------------------------------------------------------------- catalogue

AMBIENCE = {
    "wind-soft": lambda: wind(32, "wind-soft"),
    "wind-gusts": lambda: wind(32, "wind-gusts", gusty=True),
    "grass-rustle": lambda: rustle(30, "grass-rustle", density=16, bright=2200),
    "leaves-rustle": lambda: rustle(30, "leaves-rustle", density=22, bright=1600),
    "fountain": lambda: fountain(24, "fountain"),
    "waves-gentle": lambda: waves(40, "waves-gentle"),
    "lake-lapping": lambda: lake(30, "lake-lapping"),
    "birds-morning": lambda: birds(40, "birds-morning", calls_per_min=30, kinds=("trill", "whistle", "warble")),
    "birds-evening": lambda: birds(40, "birds-evening", calls_per_min=16, kinds=("whistle", "coo", "warble")),
    "seagulls": lambda: seagulls(36, "seagulls"),
    "crickets": lambda: crickets(30, "crickets"),
    "summer-insects": lambda: cicadas(36, "summer-insects"),
    "temple-bell": lambda: temple_bell(36, "temple-bell"),
    "wind-chimes": lambda: wind_chimes(30, "wind-chimes"),
    "forest-insects": lambda: 0.6 * cicadas(30, "forest-insects"),
    "lava-bubbling": lambda: lava(30, "lava-bubbling"),
    "volcanic-rumble": lambda: rumble(36, "volcanic-rumble"),
    "high-wind": lambda: high_wind(32, "high-wind"),
    "mystic-hum": lambda: mystic_hum(32, "mystic-hum"),
}
