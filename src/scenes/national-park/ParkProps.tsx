"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createFoliageBlobGeometry } from "@/engine/foliage/TreeField";
import { createRng } from "@/lib/geometry";
import { paintParkGround } from "./groundTexture";
import { BENCHES, HEDGE_BUSHES, LAMPS, PARK, type Placement } from "./layout";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const box = (w: number, h: number, d: number, x: number, y: number, z: number, rx = 0) => {
  const g = new BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx);
  g.translate(x, y, z);
  return g;
};

const merge = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false);
  if (!g) throw new Error("Failed to merge prop geometry");
  return g;
};

/** Writes placements into an InstancedMesh's matrices. */
function useInstancePlacements(ref: RefObject<InstancedMesh | null>, items: readonly Placement[], y = 0) {
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new Object3D();
    items.forEach((p, i) => {
      d.position.set(p.x, y, p.z);
      d.rotation.set(0, p.rot, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [ref, items, y]);
}

/* -------------------------------------------------------------------------- */
/*  Ground                                                                     */
/* -------------------------------------------------------------------------- */

export function ParkGround({ seed }: { seed: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2048;
    const ctx = canvas.getContext("2d");
    if (ctx) paintParkGround(ctx, 2048, seed);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [seed]);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[PARK.groundHalf * 2, PARK.groundHalf * 2]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      {/* Endless outer ground that disappears into the fog */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color="#4f6a2e" roughness={1} />
      </mesh>
    </>
  );
}

/** Low hills on the horizon, softened by fog. */
export function DistantHills({ seed }: { seed: number }) {
  const hills = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + rng() * 0.3;
      const r = 115 + rng() * 40;
      return { x: Math.sin(a) * r, z: Math.cos(a) * r, sx: 30 + rng() * 30, sy: 10 + rng() * 14, sz: 24 + rng() * 20 };
    });
  }, [seed]);
  return (
    <group>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, -3, h.z]} scale={[h.sx, h.sy, h.sz]}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshStandardMaterial color="#5c7a3c" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Walls                                                                      */
/* -------------------------------------------------------------------------- */

export function ParkWall() {
  const h = PARK.wallHalf;
  const g = PARK.gateHalfWidth;
  const t = 0.6;
  const height = 1.15;
  const outer = h + t / 2;
  const segments: [number, number, number, number][] = [
    // [centerX, centerZ, lengthX, lengthZ]
    [0, -h, outer * 2, t],
    [-h, 0, t, outer * 2],
    [(-outer - g) / 2, h, outer - g, t],
    [(outer + g) / 2, h, outer - g, t],
    [h, (-outer - g) / 2, t, outer - g],
    [h, (outer + g) / 2, t, outer - g],
  ];
  const pillars: [number, number][] = [[-g - 0.3, h], [g + 0.3, h], [h, -g - 0.3], [h, g + 0.3]];
  return (
    <group>
      {segments.map(([x, z, lx, lz], i) => (
        <group key={i}>
          <mesh position={[x, height / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[lx, height, lz]} />
            <meshStandardMaterial color="#b3a68c" roughness={0.95} />
          </mesh>
          <mesh position={[x, height + 0.06, z]} castShadow>
            <boxGeometry args={[lx + 0.12, 0.12, lz + 0.12]} />
            <meshStandardMaterial color="#cdc2a8" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {pillars.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.9, 0.9]} />
            <meshStandardMaterial color="#a69a80" roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[0.32, 16, 12]} />
            <meshStandardMaterial color="#cdc2a8" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Benches                                                                    */
/* -------------------------------------------------------------------------- */

/** Wooden slatted benches with cast-iron sides; 2 draw calls for all of them. Local front = +z. */
export function Benches() {
  const wood = useRef<InstancedMesh>(null);
  const iron = useRef<InstancedMesh>(null);
  const geo = useMemo(() => {
    const slats: BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) slats.push(box(1.8, 0.04, 0.1, 0, 0.45, 0.17 - i * 0.12));
    for (let i = 0; i < 3; i++) slats.push(box(1.8, 0.1, 0.035, 0, 0.62 + i * 0.13, -0.24 - i * 0.025, -0.18));
    const sides: BufferGeometry[] = [];
    for (const x of [-0.78, 0.78]) {
      sides.push(box(0.06, 0.45, 0.06, x, 0.225, 0.18));
      sides.push(box(0.06, 0.95, 0.06, x, 0.475, -0.22));
      sides.push(box(0.06, 0.05, 0.5, x, 0.42, -0.02));
      sides.push(box(0.06, 0.05, 0.42, x, 0.66, 0.0));
    }
    return { wood: merge(slats), iron: merge(sides) };
  }, []);
  useInstancePlacements(wood, BENCHES);
  useInstancePlacements(iron, BENCHES);
  return (
    <>
      <instancedMesh ref={wood} args={[geo.wood, undefined, BENCHES.length]} castShadow receiveShadow>
        <meshStandardMaterial color="#8a5a36" roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={iron} args={[geo.iron, undefined, BENCHES.length]} castShadow>
        <meshStandardMaterial color="#2f3532" roughness={0.5} metalness={0.6} />
      </instancedMesh>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Lamp posts                                                                 */
/* -------------------------------------------------------------------------- */

export function Lamps() {
  const post = useRef<InstancedMesh>(null);
  const glass = useRef<InstancedMesh>(null);
  const geo = useMemo(() => {
    const base = new CylinderGeometry(0.16, 0.2, 0.35, 10);
    base.translate(0, 0.175, 0);
    const pole = new CylinderGeometry(0.055, 0.07, 3.0, 10);
    pole.translate(0, 1.85, 0);
    const cap = new CylinderGeometry(0.03, 0.26, 0.22, 8);
    cap.translate(0, 3.78, 0);
    const collar = new CylinderGeometry(0.14, 0.12, 0.08, 10);
    collar.translate(0, 3.34, 0);
    const lantern = new CylinderGeometry(0.18, 0.13, 0.36, 8);
    lantern.translate(0, 3.55, 0);
    return { post: merge([base, pole, cap, collar]), glass: lantern };
  }, []);
  useInstancePlacements(post, LAMPS);
  useInstancePlacements(glass, LAMPS);
  return (
    <>
      <instancedMesh ref={post} args={[geo.post, undefined, LAMPS.length]} castShadow>
        <meshStandardMaterial color="#2b302d" roughness={0.45} metalness={0.7} />
      </instancedMesh>
      <instancedMesh ref={glass} args={[geo.glass, undefined, LAMPS.length]}>
        <meshStandardMaterial color="#fff1cf" emissive="#ffc46b" emissiveIntensity={2.2} roughness={0.3} />
      </instancedMesh>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hedges                                                                     */
/* -------------------------------------------------------------------------- */

export function Hedges() {
  const mesh = useRef<InstancedMesh>(null);
  const geo = useMemo(createFoliageBlobGeometry, []);
  const mat = useMemo(() => new MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }), []);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const d = new Object3D();
    const a = new Color("#3f6e2c");
    const b = new Color("#567f34");
    const c = new Color();
    HEDGE_BUSHES.forEach((h, i) => {
      d.position.set(h.x, 0.48 * h.s, h.z);
      d.rotation.set(0, h.x * 1.7 + h.z, 0);
      d.scale.set(0.82 * h.s, 0.62 * h.s, 0.82 * h.s);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, c.copy(a).lerp(b, (Math.sin(h.x * 0.7 + h.z * 1.3) + 1) / 2));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, []);
  return <instancedMesh ref={mesh} args={[geo, mat, HEDGE_BUSHES.length]} castShadow receiveShadow />;
}
