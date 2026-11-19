import type { Location, AudioLayer } from '../data/regions';
import { synthesizeSound } from './synthesis';
type Session = { bus: GainNode; sources: AudioBufferSourceNode[]; timer?: ReturnType<typeof setTimeout> };
export class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sessions = new Set<Session>();
  private buffers = new Map<string, AudioBuffer>();
  private version = 0;
  private desired: Location | null = null;
  private controller: AbortController | null = null;
  private volume = 0.5;
  private muted = false;
  onStatus: (message: string) => void = () => {};

  async unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.context.destination);
      }
      await this.context.resume();
      if (this.context.state !== 'running') { this.onStatus('Tap sound to enable audio'); return; }
      if (this.desired && this.sessions.size === 0) void this.setLocation(this.desired);
      else this.onStatus('Sound ready');
    } catch { this.onStatus('Audio unavailable — exploration still works'); }
  }
  setPreferences(volume: number, muted: boolean) {
    this.volume = volume; this.muted = muted;
    if (this.master && this.context) this.master.gain.setTargetAtTime(muted ? 0 : volume, this.context.currentTime, 0.06);
  }
  private retire(session: Session, seconds: number) {
    if (!this.context) return;
    if (session.timer) clearTimeout(session.timer);
    const now = this.context.currentTime;
    session.bus.gain.cancelAndHoldAtTime(now);
    session.bus.gain.linearRampToValueAtTime(0, now + seconds);
    session.timer = setTimeout(() => {
      session.sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); });
      session.bus.disconnect(); this.sessions.delete(session);
    }, seconds * 1000 + 100);
  }
  private async buffer(layer: AudioLayer, context: AudioContext, signal: AbortSignal): Promise<AudioBuffer | null> {
    const key = layer.src ?? layer.fallback;
    if (!key) return null;
    const cached = this.buffers.get(key); if (cached) return cached;
    let result: AudioBuffer;
    if (layer.src) {
      const response = await fetch(layer.src, { signal });
      if (!response.ok) throw new Error('Audio request failed');
      result = await context.decodeAudioData(await response.arrayBuffer());
    } else {
      const samples = synthesizeSound(layer.fallback!);
      result = context.createBuffer(1, samples.length, 22050);
      result.getChannelData(0).set(samples);
    }
    if (!signal.aborted) this.buffers.set(key, result);
    return result;
  }
  async setLocation(location: Location | null) {
    this.desired = location;
    const token = ++this.version;
    this.controller?.abort(); this.controller = new AbortController();
    const context = this.context;
    if (!context || !this.master) { if (location) this.onStatus('Tap sound to enable audio'); return; }
    if (!location) { this.sessions.forEach(session => this.retire(session, 0.7)); return; }
    this.onStatus('Preparing soundscape…');
    const layers = [location.audio.music, ...location.audio.ambience];
    const results = await Promise.allSettled(layers.map(layer => this.buffer(layer, context, this.controller!.signal)));
    if (token !== this.version || this.context !== context) return;
    const bus = context.createGain(); bus.gain.value = 0; bus.connect(this.master);
    const session: Session = { bus, sources: [] };
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled' || !result.value) return;
      const source = context.createBufferSource(); source.buffer = result.value; source.loop = layers[index].loop;
      const gain = context.createGain(); gain.gain.value = layers[index].volume;
      source.connect(gain); gain.connect(bus); source.onended = () => gain.disconnect(); source.start(); session.sources.push(source);
    });
    const seconds = location.audio.crossfadeMs / 1000;
    this.sessions.forEach(old => this.retire(old, seconds));
    this.sessions.add(session);
    bus.gain.linearRampToValueAtTime(1, context.currentTime + seconds);
    this.onStatus(results.some(result => result.status === 'rejected') ? 'Some audio unavailable' : location.audio.music.src ? 'Location soundtrack + ambience' : 'Original park score + natural ambience');
  }
  dispose() {
    ++this.version; this.controller?.abort();
    this.sessions.forEach(session => { if (session.timer) clearTimeout(session.timer); session.sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); }); session.bus.disconnect(); });
    this.sessions.clear(); this.buffers.clear(); this.master?.disconnect();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null; this.master = null;
  }
}
