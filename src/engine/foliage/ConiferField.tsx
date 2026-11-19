"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ConeGeometry, CylinderGeometry, InstancedMesh, MeshStandardMaterial, Object3D, type IUniform } from "three";
import { createRng } from "@/lib/geometry";
import type { TreeSpec } from "./TreeField";

interface ConiferFieldProps {
  trees: readonly TreeSpec[];
  canopyA: string;
  canopyB: string;
  trunk: string;
  wind: number;
}

const TIERS = 4;

/** Instanced pines/firs: one trunk mesh and stacked cone tiers that sway gently in the wind. */
export function ConiferField({ trees, canopyA, canopyB, trunk, wind }: ConiferFieldProps) {
  const trunks = useRef<InstancedMesh>(null);
  const tiers = useRef<InstancedMesh>(null);
  const trunkGeo = useMemo(() => {
    const g = new CylinderGeometry(0.1, 0.22, 1, 7);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const coneGeo = useMemo(() => {
    const g = new ConeGeometry(1, 1, 10, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  // Created once; wind is pushed into the uniform every frame instead.
  const uniforms = useMemo<Record<string, IUniform>>(() => ({ uTime: { value: 0 }, uWind: { value: wind } }), []);
  const trunkMat = useMemo(() => new MeshStandardMaterial({ color: trunk, roughness: 0.95 }), [trunk]);
  const coneMat = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: 0.9, flatShading: true });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        "uniform float uTime;\nuniform float uWind;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 o = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          #else
            vec3 o = vec3(0.0);
          #endif
          float sway = sin(uTime * 1.1 + o.x * 0.3 + o.z * 0.2) * uWind * 0.05 * position.y;
          transformed.x += sway;`,
        );
    };
    m.customProgramCacheKey = () => "pokeearth-conifer";
    return m;
  }, [uniforms]);

  useLayoutEffect(() => {
    const t = trunks.current;
    const c = tiers.current;
    if (!t || !c) return;
    const d = new Object3D();
    const a = new Color(canopyA);
    const b = new Color(canopyB);
    const col = new Color();
    trees.forEach((tree, i) => {
      const rng = createRng(tree.seed);
      d.position.set(tree.x, 0, tree.z);
      d.rotation.set(0, rng() * Math.PI * 2, 0);
      d.scale.set(1 + tree.height * 0.04, tree.height * 0.35, 1 + tree.height * 0.04);
      d.updateMatrix();
      t.setMatrixAt(i, d.matrix);
      const R = tree.height * 0.24;
      for (let k = 0; k < TIERS; k++) {
        const f = k / TIERS;
        const radius = R * (1 - f * 0.72);
        const h = tree.height * 0.36;
        d.position.set(tree.x, tree.height * (0.2 + f * 0.6), tree.z);
        d.rotation.set(0, rng() * Math.PI, 0);
        d.scale.set(radius, h, radius);
        d.updateMatrix();
        c.setMatrixAt(i * TIERS + k, d.matrix);
        c.setColorAt(i * TIERS + k, col.copy(a).lerp(b, Math.min(1, tree.tint * 0.7 + f * 0.3)));
      }
    });
    t.instanceMatrix.needsUpdate = true;
    c.instanceMatrix.needsUpdate = true;
    if (c.instanceColor) c.instanceColor.needsUpdate = true;
    t.computeBoundingSphere();
    c.computeBoundingSphere();
  }, [trees, canopyA, canopyB]);

  useFrame((_, dt) => {
    (uniforms.uTime as IUniform<number>).value += dt;
    (uniforms.uWind as IUniform<number>).value = wind;
  });

  if (trees.length === 0) return null;
  return (
    <>
      <instancedMesh ref={trunks} args={[trunkGeo, trunkMat, trees.length]} castShadow receiveShadow />
      <instancedMesh ref={tiers} args={[coneGeo, coneMat, trees.length * TIERS]} castShadow receiveShadow />
    </>
  );
}
