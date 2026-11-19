import { Howl, Howler } from "howler";
import type { AmbientLayer, AudioTrackRef, Vec3 } from "@/types/world";

interface Voice {
  key: string;
  howl: Howl;
  id: number;
  target: number;
}

const LISTENER_INTERVAL_MS = 50;

/**
 * Global audio engine (one per tab), built on Howler.
 *
 * Channels
 *  - music:    exactly one looping track; switching tracks crossfades
 *              (old fades out with its fadeOutMs while the new one fades in).
 *  - ambience: any number of looping layers, diffed by id so shared layers keep
 *              playing seamlessly; spatial layers are positioned in 3D.
 *
 * Master volume/mute are applied with Howler.volume()/Howler.mute(), so track
 * volumes from the data schema stay relative. Missing files fail silently.
 */
export class AudioManager {
  private music: Voice | null = null;
  private ambience = new Map<string, Voice>();
  private failed = new Set<string>();
  private lastListenerUpdate = 0;

  /* ---------------------------------------------------------------- master */

  setMaster(volume: number, muted: boolean) {
    Howler.volume(Math.min(1, Math.max(0, volume)));
    Howler.mute(muted);
  }

  /* ----------------------------------------------------------------- music */

  /** Crossfade to `track`; pass null to fade the current track out. */
  playMusic(track: AudioTrackRef | null, overrideFadeOutMs?: number) {
    if (track && this.music?.key === track.id) {
      this.rampTo(this.music, track.volume, track.fadeInMs);
      return;
    }
    if (this.music) {
      this.release(this.music, overrideFadeOutMs ?? 1200);
      this.music = null;
    }
    if (!track || this.failed.has(track.id)) return;
    const voice = this.createVoice(track.id, track.src, track.loop, track.volume);
    if (!voice) return;
    this.music = voice;
    this.rampTo(voice, track.volume, track.fadeInMs);
  }

  /** Id of the track currently playing (or fading in), if any. */
  get currentMusicId(): string | null {
    return this.music?.key ?? null;
  }

  /* -------------------------------------------------------------- ambience */

  /**
   * Make `layers` the active ambience. Layers already playing are kept (and
   * re-levelled), new ones fade in, and missing ones fade out.
   */
  setAmbience(layers: readonly AmbientLayer[], windStrength: number, fadeMs = 1800) {
    const wanted = new Map(layers.map((l) => [l.id, l]));

    for (const [id, voice] of this.ambience) {
      if (!wanted.has(id)) {
        this.release(voice, fadeMs);
        this.ambience.delete(id);
      }
    }

    for (const layer of layers) {
      const level = layer.volume * (layer.windDriven ? 0.35 + 0.65 * windStrength : 1);
      const existing = this.ambience.get(layer.id);
      if (existing) {
        this.rampTo(existing, level, fadeMs);
        continue;
      }
      if (this.failed.has(layer.id)) continue;
      const voice = this.createVoice(layer.id, layer.src, true, level);
      if (!voice) continue;
      if (layer.spatial) {
        const { position, refDistance, rolloffFactor } = layer.spatial;
        voice.howl.pannerAttr(
          {
            panningModel: "HRTF",
            distanceModel: "inverse",
            refDistance,
            rolloffFactor,
            maxDistance: 400,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
          },
          voice.id,
        );
        voice.howl.pos(position[0], position[1], position[2], voice.id);
      }
      // Start each loop at a random offset so identical files never phase.
      voice.howl.once("load", () => {
        const d = voice.howl.duration();
        if (d > 0) voice.howl.seek(Math.random() * d, voice.id);
      });
      this.ambience.set(layer.id, voice);
      this.rampTo(voice, level, fadeMs);
    }
  }

  /** Fade every channel out (used when leaving a scene). */
  fadeOutAll(ms: number) {
    this.playMusic(null, ms);
    this.setAmbience([], 0, ms);
  }

  /* -------------------------------------------------------------- listener */

  /** Keep the Web Audio listener glued to the first-person camera. Throttled. */
  setListener(position: Vec3, forward: Vec3) {
    const now = performance.now();
    if (now - this.lastListenerUpdate < LISTENER_INTERVAL_MS) return;
    this.lastListenerUpdate = now;
    if (!Howler.ctx) return;
    Howler.pos(position[0], position[1], position[2]);
    Howler.orientation(forward[0], forward[1], forward[2], 0, 1, 0);
  }

  resetListener() {
    if (!Howler.ctx) return;
    Howler.pos(0, 0, 0);
    Howler.orientation(0, 0, -1, 0, 1, 0);
  }

  /* --------------------------------------------------------------- helpers */

  private createVoice(key: string, src: readonly string[], loop: boolean, target: number): Voice | null {
    if (src.length === 0) return null;
    const howl = new Howl({
      src: [...src],
      loop,
      volume: 0,
      preload: true,
      onloaderror: () => {
        // Asset not provided yet — remember and stay silent instead of retrying every visit.
        this.failed.add(key);
        if (this.music?.key === key) this.music = null;
        this.ambience.delete(key);
        howl.unload();
      },
    });
    // play() before load/unlock is queued by Howler and starts automatically.
    const id = howl.play();
    howl.volume(0, id);
    return { key, howl, id, target };
  }

  private rampTo(voice: Voice, volume: number, ms: number) {
    voice.target = volume;
    const from = voice.howl.volume(voice.id) as number;
    voice.howl.fade(typeof from === "number" ? from : 0, volume, Math.max(16, ms), voice.id);
  }

  private release(voice: Voice, ms: number) {
    const from = voice.howl.volume(voice.id) as number;
    voice.howl.fade(typeof from === "number" ? from : voice.target, 0, Math.max(16, ms), voice.id);
    window.setTimeout(() => {
      voice.howl.stop(voice.id);
      voice.howl.unload();
    }, ms + 60);
  }
}

let instance: AudioManager | null = null;

/** Lazily-created singleton; returns null during SSR. */
export function getAudioManager(): AudioManager | null {
  if (typeof window === "undefined") return null;
  instance ??= new AudioManager();
  return instance;
}
