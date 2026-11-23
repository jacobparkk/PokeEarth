"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import { createRng } from "@/lib/geometry";
import type { Vec3 } from "@/types/world";

interface SteamPlumesProps {
  vents: readonly Vec3[];
  color?: string;
  /** Particles per vent. */
  density?: number;
  height?: number;
  seed?: number;
}

/** Rising, widening, fading plumes (fumaroles, chimneys, hot springs). Fully GPU-animated. */
export function SteamPlumes({ vents, color = "#e8e2da", density = 140, height = 9, seed = 7 }: SteamPlumesProps) {
  const { geometry, material } = useMemo(() => {
    const rng = createRng(seed);
    const n = vents.length * density;
    const origin = new Float32Array(n * 3);
    const params = new Float32Array(n * 4);
    vents.forEach((v, vi) => {
      for (let k = 0; k < density; k++) {
        const i = vi * density + k;
        origin.set(v, i * 3);
        params.set([rng(), rng() * Math.PI * 2, 0.6 + rng() * 0.8, rng()], i * 4);
      }
    });
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aOrigin", new BufferAttribute(origin, 3));
    g.setAttribute("aParams", new BufferAttribute(params, 4));
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 }, uHeight: { value: height }, uColor: { value: new Color(color) } }]),
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uHeight;
        attribute vec3 aOrigin;
        attribute vec4 aParams; // phase, angle, speed, size
        varying float vAlpha;
        #include <fog_pars_vertex>
        void main() {
          float life = 5.0;
          float t = fract(uTime / life * aParams.z + aParams.x);
          float spread = 0.3 + t * 2.2;
          vec3 p = aOrigin + vec3(cos(aParams.y) * spread * aParams.w, t * uHeight, sin(aParams.y) * spread * aParams.w);
          p.x += t * t * 2.0; // drift with the wind
          vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - t);
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (40.0 + t * 160.0) * (0.5 + aParams.w) / -mvPosition.z;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        #include <fog_pars_fragment>
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.32;
          if (a < 0.005) discard;
          gl_FragColor = vec4(uColor, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    });
    return { geometry: g, material: m };
  }, [vents, color, density, height, seed]);

  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
