"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Object3D,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Vec2 } from "@/types/world";
import { hipRoof } from "../shared/roofs";
import type { PropPlacement } from "./types";

const deg = (d = 0) => (d * Math.PI) / 180;

const part = (g: BufferGeometry, x: number, y: number, z: number) => {
  g.translate(x, y, z);
  return g;
};
const merge = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false);
  if (!g) throw new Error("Failed to merge prop geometry");
  return g;
};

/** One InstancedMesh per material for a list of placements. */
function Instanced({
  geometry,
  items,
  color,
  emissive,
  emissiveIntensity = 0,
  roughness = 0.8,
  metalness = 0,
  castShadow = true,
}: {
  geometry: BufferGeometry;
  items: readonly PropPlacement[];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  castShadow?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new Object3D();
    items.forEach((p, i) => {
      d.position.set(p.x, 0, p.z);
      d.rotation.set(0, deg(p.rot), 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, items.length]} castShadow={castShadow} receiveShadow>
      <meshStandardMaterial color={color} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity} roughness={roughness} metalness={metalness} />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------- fences */

/** White picket fence along axis-aligned polylines. */
export function Fences({ lines, color = "#f1ede4" }: { lines: readonly (readonly Vec2[])[]; color?: string }) {
  const posts = useRef<InstancedMesh>(null);
  const rails = useRef<InstancedMesh>(null);
  const { postList, railList } = useMemo(() => {
    const postList: Vec2[] = [];
    const railList: { x: number; z: number; len: number; rot: number; y: number }[] = [];
    for (const line of lines) {
      for (let i = 0; i < line.length - 1; i++) {
        const a = line[i] as Vec2;
        const b = line[i + 1] as Vec2;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.max(1, Math.round(len / 0.55));
        for (let k = 0; k <= n; k++) {
          if (k === n && i < line.length - 2) continue;
          postList.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
        }
        const rot = Math.atan2(b[0] - a[0], b[1] - a[1]);
        for (const y of [0.35, 0.75]) railList.push({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, len, rot, y });
      }
    }
    return { postList, railList };
  }, [lines]);
  const geo = useMemo(() => {
    const picket = new BoxGeometry(0.09, 1.0, 0.05);
    picket.translate(0, 0.5, 0);
    const tip = new CylinderGeometry(0, 0.065, 0.12, 4);
    tip.rotateY(Math.PI / 4);
    tip.translate(0, 1.06, 0);
    return { post: merge([picket, tip]), rail: new BoxGeometry(0.04, 0.07, 1) };
  }, []);
  useLayoutEffect(() => {
    const p = posts.current;
    const r = rails.current;
    if (!p || !r) return;
    const d = new Object3D();
    postList.forEach(([x, z], i) => {
      d.position.set(x, 0, z);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      p.setMatrixAt(i, d.matrix);
    });
    railList.forEach((rl, i) => {
      d.position.set(rl.x, rl.y, rl.z);
      d.rotation.set(0, rl.rot, 0);
      d.scale.set(1, 1, rl.len);
      d.updateMatrix();
      r.setMatrixAt(i, d.matrix);
    });
    p.instanceMatrix.needsUpdate = true;
    r.instanceMatrix.needsUpdate = true;
    p.computeBoundingSphere();
    r.computeBoundingSphere();
  }, [postList, railList]);
  if (lines.length === 0) return null;
  return (
    <>
      <instancedMesh ref={posts} args={[geo.post, undefined, postList.length]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[geo.rail, undefined, railList.length]} castShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </instancedMesh>
    </>
  );
}

/* ---------------------------------------------------- signs and mailboxes */

export function Signposts({ items }: { items: readonly PropPlacement[] }) {
  const geo = useMemo(
    () => ({
      wood: merge([part(new BoxGeometry(0.14, 1.5, 0.14), -0.55, 0.75, 0), part(new BoxGeometry(0.14, 1.5, 0.14), 0.55, 0.75, 0), part(new BoxGeometry(1.5, 0.08, 0.2), 0, 1.62, 0)]),
      board: part(new BoxGeometry(1.4, 0.75, 0.08), 0, 1.15, 0.02),
    }),
    [],
  );
  return (
    <>
      <Instanced geometry={geo.wood} items={items} color="#6b4630" />
      <Instanced geometry={geo.board} items={items} color="#e9dcb8" roughness={0.9} />
    </>
  );
}

export function Mailboxes({ items }: { items: readonly PropPlacement[] }) {
  const geo = useMemo(
    () => ({
      post: part(new BoxGeometry(0.12, 1.0, 0.12), 0, 0.5, 0),
      box: merge([part(new BoxGeometry(0.42, 0.34, 0.6), 0, 1.15, 0), part(new CylinderGeometry(0.21, 0.21, 0.6, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), 0, 1.32, 0)]),
    }),
    [],
  );
  return (
    <>
      <Instanced geometry={geo.post} items={items} color="#5a4030" />
      <Instanced geometry={geo.box} items={items} color="#c8463a" roughness={0.5} metalness={0.2} />
    </>
  );
}

/* --------------------------------------------------------- stone lanterns */

export function StoneLanterns({ items }: { items: readonly PropPlacement[] }) {
  const geo = useMemo(() => {
    const stone = merge([
      part(new BoxGeometry(0.9, 0.25, 0.9), 0, 0.125, 0),
      part(new CylinderGeometry(0.16, 0.2, 1.0, 8), 0, 0.75, 0),
      part(new BoxGeometry(0.7, 0.15, 0.7), 0, 1.32, 0),
      part(hipRoof(0.55, 0.08, 0.38), 0, 1.84, 0),
      part(new CylinderGeometry(0.06, 0.1, 0.18, 8), 0, 2.3, 0),
    ]);
    const light = part(new BoxGeometry(0.42, 0.4, 0.42), 0, 1.6, 0);
    return { stone, light };
  }, []);
  return (
    <>
      <Instanced geometry={geo.stone} items={items} color="#a59e90" roughness={0.95} />
      <Instanced geometry={geo.light} items={items} color="#ffe6b8" emissive="#ffa646" emissiveIntensity={2.0} castShadow={false} />
    </>
  );
}

/* ------------------------------------------------------------------ torii */

export function Torii({ items }: { items: readonly PropPlacement[] }) {
  const geo = useMemo(
    () => ({
      red: merge([
        part(new CylinderGeometry(0.26, 0.3, 5.2, 12), -2.6, 2.6, 0),
        part(new CylinderGeometry(0.26, 0.3, 5.2, 12), 2.6, 2.6, 0),
        part(new BoxGeometry(6.4, 0.32, 0.32), 0, 4.2, 0),
        part(new BoxGeometry(0.3, 0.7, 0.2), 0, 4.65, 0),
        part(new BoxGeometry(7.2, 0.35, 0.55), 0, 5.15, 0),
      ]),
      black: merge([part(new BoxGeometry(7.8, 0.22, 0.7), 0, 5.42, 0), part(new BoxGeometry(0.75, 0.5, 0.75), -2.6, 0.25, 0), part(new BoxGeometry(0.75, 0.5, 0.75), 2.6, 0.25, 0)]),
    }),
    [],
  );
  return (
    <>
      <Instanced geometry={geo.red} items={items} color="#c23a22" roughness={0.55} />
      <Instanced geometry={geo.black} items={items} color="#24201d" roughness={0.6} />
    </>
  );
}

/* --------------------------------------------------------------- windmills */

export function Windmills({ items, wind }: { items: readonly PropPlacement[]; wind: number }) {
  const rotors = useRef<(Group | null)[]>([]);
  useFrame((_, dt) => {
    rotors.current.forEach((r, i) => {
      if (r) r.rotation.z -= dt * (0.5 + wind * 1.6) * (1 + i * 0.07);
    });
  });
  return (
    <>
      {items.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation-y={deg(p.rot)}>
          <mesh position-y={5.5} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.9, 11, 16]} />
            <meshStandardMaterial color="#f3f1ea" roughness={0.6} />
          </mesh>
          <mesh position={[0, 11.2, 0.2]} castShadow>
            <boxGeometry args={[0.9, 0.9, 2.0]} />
            <meshStandardMaterial color="#e7e5de" roughness={0.5} />
          </mesh>
          <group position={[0, 11.2, 1.3]} ref={(g) => { rotors.current[i] = g; }}>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.32, 0.32, 0.5, 12]} />
              <meshStandardMaterial color="#cfccc4" roughness={0.4} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <group key={k} rotation-z={(k * Math.PI * 2) / 3}>
                <mesh position-y={2.4} castShadow>
                  <boxGeometry args={[0.45, 4.8, 0.08]} />
                  <meshStandardMaterial color="#fbfaf6" roughness={0.5} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      ))}
    </>
  );
}

/* ----------------------------------------------------------- moving truck */

export function MovingTrucks({ items }: { items: readonly PropPlacement[] }) {
  return (
    <>
      {items.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation-y={deg(p.rot)}>
          {/* Cargo box with a stripe */}
          <mesh position={[0, 1.75, -0.9]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 2.5, 4.2]} />
            <meshStandardMaterial color="#f4f2ee" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.4, -0.9]}>
            <boxGeometry args={[2.42, 0.35, 4.22]} />
            <meshStandardMaterial color="#3f7fc0" roughness={0.5} />
          </mesh>
          {/* Cab */}
          <mesh position={[0, 1.25, 2.05]} castShadow>
            <boxGeometry args={[2.3, 1.7, 1.6]} />
            <meshStandardMaterial color="#3f7fc0" roughness={0.45} metalness={0.2} />
          </mesh>
          <mesh position={[0, 1.6, 2.86]}>
            <boxGeometry args={[2.0, 0.8, 0.04]} />
            <meshStandardMaterial color="#a8cfe0" roughness={0.1} metalness={0.3} />
          </mesh>
          {[[-1.1, -2.2], [1.1, -2.2], [-1.1, 0.4], [1.1, 0.4], [-1.1, 2.2], [1.1, 2.2]].map(([x, z], k) => (
            <mesh key={k} position={[x!, 0.42, z!]} rotation-z={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
              <meshStandardMaterial color="#222" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------ forest floor */

/** Mossy fallen logs lying along local Z, with a broken stump at one end. */
export function FallenLogs({ items }: { items: readonly PropPlacement[] }) {
  const geo = useMemo(() => {
    const log = new CylinderGeometry(0.42, 0.5, 6, 12);
    log.rotateX(Math.PI / 2);
    log.translate(0, 0.45, 0);
    const moss = new CylinderGeometry(0.44, 0.52, 4.2, 12, 1, true, -0.9, 1.8);
    moss.rotateX(Math.PI / 2);
    moss.translate(0, 0.47, 0.4);
    const stump = new CylinderGeometry(0.42, 0.6, 0.9, 10);
    stump.translate(0, 0.45, 3.6);
    return { wood: merge([log, stump]), moss };
  }, []);
  return (
    <>
      <Instanced geometry={geo.wood} items={items} color="#5a4231" roughness={0.95} />
      <Instanced geometry={geo.moss} items={items} color="#5f8a34" roughness={1} />
    </>
  );
}

/** Small clusters of toadstools around each placement. */
export function Mushrooms({ items, seed = 5 }: { items: readonly PropPlacement[]; seed?: number }) {
  const stems = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);
  const shrooms = useMemo(() => {
    let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return items.flatMap((c) =>
      Array.from({ length: 5 + Math.floor(rnd() * 5) }, () => {
        const a = rnd() * Math.PI * 2;
        const r = rnd() * 1.1;
        return { x: c.x + Math.cos(a) * r, z: c.z + Math.sin(a) * r, s: 0.6 + rnd() * 0.9 };
      }),
    );
  }, [items, seed]);
  const geo = useMemo(() => {
    const stem = new CylinderGeometry(0.05, 0.07, 0.25, 8);
    stem.translate(0, 0.125, 0);
    const cap = new CylinderGeometry(0.02, 0.2, 0.12, 12);
    cap.translate(0, 0.29, 0);
    return { stem, cap };
  }, []);
  useLayoutEffect(() => {
    const st = stems.current;
    const cp = caps.current;
    if (!st || !cp) return;
    const d = new Object3D();
    shrooms.forEach((m, i) => {
      d.position.set(m.x, 0, m.z);
      d.rotation.set(0, i, 0);
      d.scale.setScalar(m.s);
      d.updateMatrix();
      st.setMatrixAt(i, d.matrix);
      cp.setMatrixAt(i, d.matrix);
    });
    st.instanceMatrix.needsUpdate = true;
    cp.instanceMatrix.needsUpdate = true;
    st.computeBoundingSphere();
    cp.computeBoundingSphere();
  }, [shrooms]);
  if (shrooms.length === 0) return null;
  return (
    <>
      <instancedMesh ref={stems} args={[geo.stem, undefined, shrooms.length]}>
        <meshStandardMaterial color="#efe6d2" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[geo.cap, undefined, shrooms.length]} castShadow>
        <meshStandardMaterial color="#c8382c" roughness={0.6} />
      </instancedMesh>
    </>
  );
}

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    float edge = pow(abs(dot(vNormalV, vViewDir)), 1.6);   // soft cylinder edges
    float fade = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));
    float flicker = 0.85 + 0.15 * sin(uTime * 0.7 + vUv.x * 12.0);
    gl_FragColor = vec4(uColor, edge * fade * flicker * uStrength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Volumetric-looking light shafts angled toward the sun (additive, no depth write). */
export function Sunbeams({ items, sunDir, color = "#fff1c8", strength = 0.12 }: { items: readonly PropPlacement[]; sunDir: Vector3; color?: string; strength?: number }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: { uColor: { value: new Color(color) }, uTime: { value: 0 }, uStrength: { value: strength } },
      }),
    [color, strength],
  );
  const quat = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), sunDir.clone().normalize()), [sunDir]);
  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });
  const H = 24;
  return (
    <>
      {items.map((p, i) => {
        const centre = sunDir.clone().normalize().multiplyScalar(H / 2);
        return (
          <mesh key={i} position={[p.x + centre.x, centre.y, p.z + centre.z]} quaternion={quat} material={material} renderOrder={10}>
            <cylinderGeometry args={[2.6, 1.6, H, 20, 1, true]} />
          </mesh>
        );
      })}
    </>
  );
}
