"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, CylinderGeometry, IcosahedronGeometry, InstancedMesh, Object3D } from "three";
import { createRng } from "@/lib/geometry";

/* -------------------------------------------------------------------------- */
/*  Flowerbeds                                                                 */
/* -------------------------------------------------------------------------- */

const FLOWER_COLORS = ["#e8435a", "#f6c94a", "#f7f3ea", "#f28ab2", "#b06ad6", "#ff8a3d"];

export interface FlowerBed {
  x: number;
  z: number;
  r: number;
}

/** Raised soil beds with a stone kerb, densely planted with instanced flowers. */
export function Flowerbeds({ beds, seed, perBed = 140 }: { beds: readonly FlowerBed[]; seed: number; perBed?: number }) {
  const stems = useRef<InstancedMesh>(null);
  const blooms = useRef<InstancedMesh>(null);
  const flowers = useMemo(() => {
    const rng = createRng(seed);
    const out: { x: number; z: number; h: number; c: string; s: number }[] = [];
    beds.forEach((bed, bi) => {
      const palette = [FLOWER_COLORS[bi % FLOWER_COLORS.length]!, FLOWER_COLORS[(bi + 2) % FLOWER_COLORS.length]!, "#f7f3ea"];
      const count = Math.round(perBed * (bed.r / 2.2) ** 2);
      for (let i = 0; i < count; i++) {
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * (bed.r - 0.25);
        // Taller flowers in the middle of each bed.
        const h = 0.22 + (1 - r / bed.r) * 0.35 + rng() * 0.1;
        out.push({ x: bed.x + Math.cos(a) * r, z: bed.z + Math.sin(a) * r, h, c: palette[Math.floor(rng() * palette.length)]!, s: 0.06 + rng() * 0.05 });
      }
    });
    return out;
  }, [beds, seed, perBed]);
  const geo = useMemo(() => {
    const stem = new CylinderGeometry(0.012, 0.016, 1, 4);
    stem.translate(0, 0.5, 0);
    return { stem, bloom: new IcosahedronGeometry(1, 0) };
  }, []);

  useLayoutEffect(() => {
    const st = stems.current;
    const bl = blooms.current;
    if (!st || !bl) return;
    const d = new Object3D();
    const c = new Color();
    flowers.forEach((f, i) => {
      d.position.set(f.x, 0.12, f.z);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, f.h, 1);
      d.updateMatrix();
      st.setMatrixAt(i, d.matrix);
      d.position.set(f.x, 0.12 + f.h, f.z);
      d.rotation.set(f.x * 3, f.z * 5, 0);
      d.scale.setScalar(f.s);
      d.updateMatrix();
      bl.setMatrixAt(i, d.matrix);
      bl.setColorAt(i, c.set(f.c));
    });
    st.instanceMatrix.needsUpdate = true;
    bl.instanceMatrix.needsUpdate = true;
    if (bl.instanceColor) bl.instanceColor.needsUpdate = true;
    st.computeBoundingSphere();
    bl.computeBoundingSphere();
  }, [flowers]);

  return (
    <>
      {beds.map((bed, i) => (
        <group key={i} position={[bed.x, 0, bed.z]}>
          {/* Raised soil and a low stone kerb */}
          <mesh position-y={0.06} receiveShadow>
            <cylinderGeometry args={[bed.r, bed.r, 0.12, 40]} />
            <meshStandardMaterial color="#4f3726" roughness={1} />
          </mesh>
          <mesh position-y={0.11} castShadow receiveShadow>
            <torusGeometry args={[bed.r + 0.05, 0.12, 8, 48]} />
            <meshStandardMaterial color="#c2b69c" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={stems} args={[geo.stem, undefined, flowers.length]}>
        <meshStandardMaterial color="#3f6b2a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={blooms} args={[geo.bloom, undefined, flowers.length]} castShadow>
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </>
  );
}
