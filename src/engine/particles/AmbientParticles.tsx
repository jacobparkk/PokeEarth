"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, NormalBlending, ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import { createRng } from "@/lib/geometry";
import type { ParticleEffect } from "@/types/world";

interface AmbientParticlesProps {
  effect: ParticleEffect;
  /** Half-size of the square area to fill, in metres. */
  extent: number;
  seed: number;
  wind: number;
}

interface Preset {
  count: number;
  color: string;
  size: number;
  minY: number;
  maxY: number;
  /** Downward speed in m/s (negative rises). */
  fall: number;
  drift: number;
  twinkle: number;
  additive: boolean;
}

const PRESETS: Record<Exclude<ParticleEffect, "none">, Preset> = {
  pollen: { count: 700, color: "#fff1c4", size: 0.07, minY: 0.3, maxY: 7, fall: 0.05, drift: 0.35, twinkle: 0.4, additive: true },
  "falling-leaves": { count: 420, color: "#e07a3c", size: 0.16, minY: 0, maxY: 14, fall: 0.7, drift: 0.9, twinkle: 0, additive: false },
  fireflies: { count: 260, color: "#d8ff8a", size: 0.1, minY: 0.3, maxY: 3.5, fall: 0, drift: 0.5, twinkle: 1, additive: true },
  "sea-spray": { count: 500, color: "#f2fbff", size: 0.06, minY: 0, maxY: 3, fall: -0.15, drift: 0.8, twinkle: 0.3, additive: true },
  ash: { count: 1100, color: "#9c958d", size: 0.07, minY: -2, maxY: 18, fall: 0.35, drift: 0.7, twinkle: 0, additive: false },
  snow: { count: 1800, color: "#f6f9ff", size: 0.09, minY: -2, maxY: 16, fall: 1.1, drift: 0.6, twinkle: 0, additive: false },
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uFall;
  uniform float uDrift;
  uniform float uWind;
  uniform float uMinY;
  uniform float uMaxY;
  uniform float uTwinkle;
  attribute float aSeed;
  varying float vAlpha;
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    float range = uMaxY - uMinY;
    // Wrap vertical motion so particles recycle forever.
    p.y = uMinY + mod(p.y - uMinY - uTime * uFall * (0.6 + aSeed * 0.8), range);
    p.x += sin(uTime * 0.4 + aSeed * 31.0) * uDrift + uTime * uWind * 0.6 * (0.5 + aSeed);
    p.z += cos(uTime * 0.33 + aSeed * 17.0) * uDrift;
    // Keep the wind drift wrapped inside the field.
    p.x = mod(p.x + 64.0, 128.0) - 64.0;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
    float edge = smoothstep(0.0, 0.08 * range, p.y - uMinY) * smoothstep(0.0, 0.12 * range, uMaxY - p.y);
    float blink = mix(1.0, 0.5 + 0.5 * sin(uTime * (1.5 + aSeed * 3.0) + aSeed * 40.0), uTwinkle);
    vAlpha = edge * blink;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  #include <fog_pars_fragment>
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

/** GPU-animated weather particles (pollen motes, falling leaves, fireflies, sea spray). */
export function AmbientParticles({ effect, extent, seed, wind }: AmbientParticlesProps) {
  const preset = effect === "none" ? null : PRESETS[effect];

  const geometry = useMemo(() => {
    if (!preset) return null;
    const rng = createRng(seed);
    const pos = new Float32Array(preset.count * 3);
    const seeds = new Float32Array(preset.count);
    for (let i = 0; i < preset.count; i++) {
      pos[i * 3] = (rng() * 2 - 1) * extent;
      pos[i * 3 + 1] = preset.minY + rng() * (preset.maxY - preset.minY);
      pos[i * 3 + 2] = (rng() * 2 - 1) * extent;
      seeds[i] = rng();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return g;
  }, [preset, extent, seed]);

  const material = useMemo(() => {
    if (!preset) return null;
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      fog: true,
      blending: preset.additive ? AdditiveBlending : NormalBlending,
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime: { value: 0 },
          uSize: { value: preset.size },
          uFall: { value: preset.fall },
          uDrift: { value: preset.drift },
          uWind: { value: wind },
          uMinY: { value: preset.minY },
          uMaxY: { value: preset.maxY },
          uTwinkle: { value: preset.twinkle },
          uColor: { value: new Color(preset.color) },
        },
      ]),
    });
  }, [preset, wind]);

  useFrame((_, dt) => {
    if (material) material.uniforms.uTime!.value += dt;
  });

  if (!geometry || !material) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
