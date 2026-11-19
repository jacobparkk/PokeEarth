"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  LatheGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
} from "three";
import { createWaterMaterial, createWaterfallMaterial } from "@/engine/materials/water";
import { createRng } from "@/lib/geometry";

interface FountainProps {
  sunDir: Vector3;
  skyColor: string;
}

const STONE = "#d9cfb8";
const STONE_DARK = "#b9ad93";

const lathe = (pts: [number, number][], segments = 64) =>
  new LatheGeometry(pts.map(([x, y]) => new Vector2(x, y)), segments);

/** Heights (m) of the water surfaces the jets and sheets fall into. */
const BASIN_WATER_Y = 0.62;
const MID_BOWL_Y = 2.2;
const TOP_BOWL_Y = 3.62;

const jetVertex = /* glsl */ `
  uniform float uTime;
  attribute vec4 aJet; // x: angle, y: horizontal speed, z: vertical speed, w: phase
  attribute vec3 aOrigin;
  varying float vAlpha;
  #include <fog_pars_vertex>
  void main() {
    float life = 1.15;
    float t = mod(uTime + aJet.w * life, life);
    vec3 p = aOrigin + vec3(cos(aJet.x) * aJet.y * t, aJet.z * t - 4.9 * t * t, sin(aJet.x) * aJet.y * t);
    vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(life * 0.75, life, t));
    if (p.y < 0.6) vAlpha = 0.0; // swallowed by the basin
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 3.6 * (16.0 / -mvPosition.z);
    #include <fog_vertex>
  }
`;
const jetFragment = /* glsl */ `
  varying float vAlpha;
  #include <fog_pars_fragment>
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha * 0.75;
    if (a < 0.01) discard;
    gl_FragColor = vec4(0.88, 0.95, 1.0, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

/** Three-tier stone fountain: lathed basin and bowls, animated water, falling sheets and spray jets. */
export function Fountain({ sunDir, skyColor }: FountainProps) {
  const geo = useMemo(
    () => ({
      // Outer basin: floor, inner wall, wide rim lip, outer wall.
      basin: lathe([[0.01, 0.28], [4.9, 0.28], [4.95, 0.78], [5.25, 0.86], [5.6, 0.8], [5.65, 0.0]]),
      plinth: lathe([[0.01, 0.0], [1.2, 0.0], [1.15, 0.35], [0.85, 0.5], [0.72, 0.5]], 32),
      column: lathe([[0.72, 0.5], [0.55, 0.8], [0.5, 1.5], [0.62, 1.9], [0.9, 2.0], [0.01, 2.0]], 32),
      midBowl: lathe([[0.5, 1.9], [1.4, 2.05], [2.0, 2.24], [2.08, 2.34], [1.95, 2.34], [0.01, 2.12]]),
      upperColumn: lathe([[0.32, 2.3], [0.26, 2.8], [0.3, 3.4], [0.5, 3.48], [0.01, 3.48]], 24),
      topBowl: lathe([[0.3, 3.4], [0.8, 3.52], [1.05, 3.66], [1.1, 3.74], [1.0, 3.74], [0.01, 3.56]], 48),
      finial: lathe([[0.01, 3.6], [0.14, 3.7], [0.1, 3.95], [0.18, 4.1], [0.06, 4.3], [0.01, 4.32]], 24),
    }),
    [],
  );

  const water = useMemo(
    () => ({
      basin: createWaterMaterial({ center: [0, 0], radius: 4.9, deep: "#2f6f86", shallow: "#6db7c9", sky: skyColor, sunDir }),
      mid: createWaterMaterial({ center: [0, 0], radius: 1.95, deep: "#3c7f93", shallow: "#7cc3d2", sky: skyColor, sunDir, rippleSpeed: 1.6 }),
      top: createWaterMaterial({ center: [0, 0], radius: 1.0, deep: "#3c7f93", shallow: "#86c9d6", sky: skyColor, sunDir, rippleSpeed: 2 }),
      sheet: createWaterfallMaterial("#cfe9f2"),
    }),
    [sunDir, skyColor],
  );

  const jets = useMemo(() => {
    const rng = createRng(4242);
    const count = 900;
    const jet = new Float32Array(count * 4);
    const origin = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const crown = i < 520; // crown spray from the finial; the rest are rim spouts on the middle bowl
      const a = rng() * Math.PI * 2;
      jet.set(crown ? [a, 0.35 + rng() * 0.5, 3.2 + rng() * 1.2, rng()] : [a, 0.9 + rng() * 0.4, 0.4 + rng() * 0.5, rng()], i * 4);
      origin.set(crown ? [0, 4.3, 0] : [Math.cos(a) * 2.05, MID_BOWL_Y + 0.14, Math.sin(a) * 2.05], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aJet", new BufferAttribute(jet, 4));
    g.setAttribute("aOrigin", new BufferAttribute(origin, 3));
    const m = new ShaderMaterial({
      vertexShader: jetVertex,
      fragmentShader: jetFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: true,
      uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 } }]),
    });
    return { g, m };
  }, []);

  useFrame((_, dt) => {
    for (const m of [water.basin, water.mid, water.top, water.sheet, jets.m]) m.uniforms.uTime!.value += dt;
  });

  const stoneProps = { castShadow: true, receiveShadow: true } as const;

  return (
    <group>
      <mesh geometry={geo.basin} {...stoneProps}>
        <meshStandardMaterial color={STONE} roughness={0.85} side={DoubleSide} />
      </mesh>
      <mesh geometry={geo.plinth} {...stoneProps}>
        <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
      </mesh>
      <mesh geometry={geo.column} {...stoneProps}>
        <meshStandardMaterial color={STONE} roughness={0.8} side={DoubleSide} />
      </mesh>
      <mesh geometry={geo.midBowl} {...stoneProps}>
        <meshStandardMaterial color={STONE} roughness={0.8} side={DoubleSide} />
      </mesh>
      <mesh geometry={geo.upperColumn} {...stoneProps}>
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      <mesh geometry={geo.topBowl} {...stoneProps}>
        <meshStandardMaterial color={STONE} roughness={0.8} side={DoubleSide} />
      </mesh>
      <mesh geometry={geo.finial} {...stoneProps}>
        <meshStandardMaterial color={new Color(STONE).multiplyScalar(1.05)} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Water surfaces */}
      <mesh rotation-x={-Math.PI / 2} position-y={BASIN_WATER_Y} material={water.basin}>
        <circleGeometry args={[4.9, 72]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={MID_BOWL_Y + 0.1} material={water.mid}>
        <circleGeometry args={[1.95, 48]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={TOP_BOWL_Y + 0.08} material={water.top}>
        <circleGeometry args={[1.0, 32]} />
      </mesh>

      {/* Sheets of water spilling over the bowl rims */}
      <mesh position-y={(MID_BOWL_Y + 0.3 + BASIN_WATER_Y) / 2} material={water.sheet}>
        <cylinderGeometry args={[2.1, 2.45, MID_BOWL_Y + 0.3 - BASIN_WATER_Y, 56, 1, true]} />
      </mesh>
      <mesh position-y={(TOP_BOWL_Y + 0.12 + MID_BOWL_Y + 0.1) / 2} material={water.sheet}>
        <cylinderGeometry args={[1.12, 1.3, TOP_BOWL_Y + 0.12 - (MID_BOWL_Y + 0.1), 40, 1, true]} />
      </mesh>

      <points geometry={jets.g} material={jets.m} frustumCulled={false} />
    </group>
  );
}
