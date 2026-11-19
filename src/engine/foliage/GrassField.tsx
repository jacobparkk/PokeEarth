"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  type IUniform,
} from "three";

export interface GrassBlade {
  x: number;
  z: number;
  /** Rotation around Y in radians. */
  rot: number;
  height: number;
  width: number;
  /** 0–1 blend between the two tint colours. */
  tint: number;
}

interface GrassFieldProps {
  blades: readonly GrassBlade[];
  colorA: string;
  colorB: string;
  /** 0–1 from environment.weather.windStrength. */
  wind: number;
  /** Bend blades away from the camera when it walks through them. */
  parting?: boolean;
}

/** One blade: tapered 3-segment strip with a slight forward curl, height normalised to 1. */
function createBladeGeometry(): BufferGeometry {
  const rows = [
    { y: 0, w: 1 },
    { y: 0.38, w: 0.82 },
    { y: 0.72, w: 0.5 },
  ];
  const positions: number[] = [];
  const normals: number[] = [];
  for (const { y, w } of rows) {
    const z = 0.12 * y * y;
    positions.push(-w / 2, y, z, w / 2, y, z);
    normals.push(0, 0.8, 0.6, 0, 0.8, 0.6);
  }
  positions.push(0, 1, 0.12);
  normals.push(0, 0.8, 0.6);
  const indices = [0, 1, 3, 0, 3, 2, 2, 3, 5, 2, 5, 4, 4, 5, 6];
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  g.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  g.setIndex(indices);
  return g;
}

/**
 * Instanced grass with GPU wind sway and blades that part around the player.
 * Uses MeshStandardMaterial + shader injection so it keeps scene lighting,
 * shadows and fog.
 */
export function GrassField({ blades, colorA, colorB, wind, parting = true }: GrassFieldProps) {
  const mesh = useRef<InstancedMesh>(null);
  const geometry = useMemo(createBladeGeometry, []);
  const uniforms = useMemo<Record<string, IUniform>>(
    // Created once; wind is pushed into the uniform every frame instead.
    () => ({ uTime: { value: 0 }, uWind: { value: wind }, uPlayer: { value: new Vector3(0, 0, 0) } }),
    [],
  );

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ side: DoubleSide, roughness: 0.82, metalness: 0 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        "uniform float uTime;\nuniform float uWind;\nuniform vec3 uPlayer;\nvarying float vGrassH;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          float h = clamp(position.y, 0.0, 1.0);
          vGrassH = h;
          #ifdef USE_INSTANCING
            vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            mat3 im = mat3(instanceMatrix);
          #else
            vec3 origin = vec3(0.0);
            mat3 im = mat3(1.0);
          #endif
          float gust = sin(uTime * 1.6 + origin.x * 0.35 + origin.z * 0.22) * 0.6
                     + sin(uTime * 0.7 + origin.x * 0.09 - origin.z * 0.05) * 0.4;
          vec3 bend = vec3(gust * uWind * 0.45, 0.0, cos(uTime * 1.25 + origin.z * 0.3) * uWind * 0.15);
          vec2 away = origin.xz - uPlayer.xz;
          float dist = length(away);
          vec2 dir = away / max(dist, 1e-3);
          float push = (1.0 - smoothstep(0.2, 1.35, dist)) * uPlayer.y;
          bend += vec3(dir.x, -0.45, dir.y) * push * 0.95;
          // World-space bend → instance-local space (undo rotation and per-axis scale).
          vec3 local = transpose(im) * bend;
          local /= max(vec3(dot(im[0], im[0]), dot(im[1], im[1]), dot(im[2], im[2])), vec3(1e-4));
          transformed += local * h * h;`,
        );
      shader.fragmentShader =
        "varying float vGrassH;\n" +
        shader.fragmentShader.replace(
          "#include <color_fragment>",
          "#include <color_fragment>\n  diffuseColor.rgb *= mix(0.42, 1.12, vGrassH);",
        );
    };
    m.customProgramCacheKey = () => "pokeearth-grass";
    return m;
  }, [uniforms]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const dummy = new Object3D();
    const a = new Color(colorA);
    const b = new Color(colorB);
    const c = new Color();
    blades.forEach((bl, i) => {
      dummy.position.set(bl.x, 0, bl.z);
      dummy.rotation.set(0, bl.rot, 0);
      dummy.scale.set(bl.width, bl.height, bl.width);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, c.copy(a).lerp(b, bl.tint));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [blades, colorA, colorB]);

  useFrame(({ camera }, dt) => {
    (uniforms.uTime as IUniform<number>).value += dt;
    (uniforms.uWind as IUniform<number>).value = wind;
    const p = (uniforms.uPlayer as IUniform<Vector3>).value;
    // y carries the parting weight: only when the camera is at walking height.
    p.set(camera.position.x, parting && camera.position.y < 3 ? 1 : 0, camera.position.z);
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, blades.length]}
      frustumCulled={false}
      receiveShadow
    />
  );
}
