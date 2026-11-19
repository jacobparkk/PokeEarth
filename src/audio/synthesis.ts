import { seededRandom } from '../scenes/shared/movement.ts';
export type GeneratedSound = 'park-score' | 'wind' | 'water';
export function synthesizeSound(kind: GeneratedSound, sampleRate = 22050): Float32Array {
  const duration = kind === 'park-score' ? 32 : 8;
  const samples = new Float32Array(duration * sampleRate);
  const random = seededRandom(kind === 'wind' ? 178 : 251);
  if (kind !== 'park-score') {
    let low = 0;
    for (let i = 0; i < samples.length; i++) {
      const noise = random() * 2 - 1;
      low = low * 0.97 + noise * 0.03;
      const envelope = 0.65 + 0.2 * Math.sin(i / samples.length * Math.PI * 4);
      // Wind is low-pass noise. Water combines a quiet broad wash with softer low frequencies.
      samples[i] = (kind === 'wind' ? low * 1.8 : noise * 0.075 + low * 0.7) * envelope;
    }
  } else {
    // Original composition: an eight-bar celesta/pad loop. This is not the game soundtrack.
    const melody = [76,79,83,79,74,78,81,78,72,76,79,83,74,78,81,86,76,79,83,86,74,78,81,78,72,76,79,76,74,78,83,78];
    const roots = [48,50,45,43,48,50,45,47];
    function note(midi: number, start: number, length: number, volume: number, pad: boolean) {
      const frequency = 440 * 2 ** ((midi - 69) / 12);
      const startSample = Math.floor(start * sampleRate);
      const count = Math.floor(length * sampleRate);
      for (let j = 0; j < count; j++) {
        const time = j / sampleRate;
        const attack = Math.min(1, time / (pad ? 0.5 : 0.012));
        const release = Math.min(1, (length - time) / (pad ? 0.8 : 0.25));
        const envelope = attack * release * Math.exp(-time * (pad ? 0.2 : 2.1));
        const tone = Math.sin(time * frequency * Math.PI * 2) + (pad ? 0.1 : 0.25) * Math.sin(time * frequency * Math.PI * 4);
        samples[(startSample + j) % samples.length] += tone * envelope * volume;
      }
    }
    melody.forEach((midi, i) => note(midi, i, 2.6, 0.095, false));
    roots.forEach((root, i) => { note(root, i * 4, 5, 0.075, true); note(root + 7, i * 4, 5, 0.035, true); note(root + 16, i * 4, 5, 0.025, true); });
  }
  // Make the seam quiet and continuous for noise as well as the composed loop.
  const fade = Math.floor(sampleRate * 0.025);
  for (let i = 0; i < fade; i++) { samples[i] *= i / fade; samples[samples.length - 1 - i] *= i / fade; }
  return samples;
}
