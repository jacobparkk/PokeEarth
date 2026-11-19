"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  type BufferGeometry,
  type IUniform,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createRng } from "@/lib/geometry";

export interface TreeSpec {
  x: number;
  z: number;
  /** Total height in metres. */
  height: number;
  /** 0–1 picks a canopy shade between the two palette colours. */
  tint: number;
  /** Per-tree seed for blob layout. */
  seed: number;
}

interface TreeFieldProps {
  trees: readonly TreeSpec[];
  canopyA: string;
  canopyB: string;
  trunk: string;
  wind: number;
}

const BLOBS_PER_TREE = 5;

/** Lumpy, smooth-shaded foliage blob with baked light/dark vertex colours (shared by trees and hedges). */
export function createFoliageBlobGeometry(): BufferGeometry {
  let g: BufferGeometry = new IcosahedronGeometry(1, 3);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  const pos = g.getAttribute("position") as BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const lump = 1 + 0.16 * Math.sin(5.1 * x + 1.3) * Math.sin(4.7 * y + 2.1) * Math.sin(5.3 * z + 0.7);
    const fine = 0.05 * Math.sin(17 * x + 11 * z) * Math.sin(13 * y);
    const k = lump + fine;
    pos.setXYZ(i, x * k, y * k * 0.88, z * k);
    // Darker underside, brighter crown, mottled by the same noise.
    const shade = 0.62 + 0.38 * ((y + 1) / 2) + fine * 2;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }
  g.setAttribute("color", new BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function createTrunkGeometry(): BufferGeometry {
  const g = new CylinderGeometry(0.13, 0.24, 1, 8, 1);
  g.translate(0, 0.5, 0);
  return g;
}

/**
 * Instanced broadleaf trees: one draw call for every trunk, one for every
 * canopy blob. Canopies sway in the wind on the GPU.
 */
export function TreeField({ trees, canopyA, canopyB, trunk, wind }: TreeFieldProps) {
  const trunks = useRef<InstancedMesh>(null);
  const canopies = useRef<InstancedMesh>(null);
  const trunkGeo = useMemo(createTrunkGeometry, []);
  const canopyGeo = useMemo(createFoliageBlobGeometry, []);
  // Created once; wind is pushed into the uniform every frame instead.
  const uniforms = useMemo<Record<string, IUniform>>(() => ({ uTime: { value: 0 }, uWind: { value: wind } }), []);

  const trunkMat = useMemo(() => new MeshStandardMaterial({ color: trunk, roughness: 0.95 }), [trunk]);
  const canopyMat = useMemo(() => {
    const m = new MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        "uniform float uTime;\nuniform float uWind;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 treeOrigin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          #else
            vec3 treeOrigin = vec3(0.0);
          #endif
          float sway = sin(uTime * 0.9 + treeOrigin.x * 0.21 + treeOrigin.z * 0.17)
                     + 0.35 * sin(uTime * 2.3 + treeOrigin.z * 0.5 + position.y * 2.0);
          transformed.x += sway * uWind * 0.07 * (position.y + 1.2);
          transformed.z += cos(uTime * 0.8 + treeOrigin.x * 0.3) * uWind * 0.04 * (position.y + 1.2);`,
        );
    };
    m.customProgramCacheKey = () => "pokeearth-canopy";
    return m;
  }, [uniforms]);

  useLayoutEffect(() => {
    const t = trunks.current;
    const c = canopies.current;
    if (!t || !c) return;
    const dummy = new Object3D();
    const ca = new Color(canopyA);
    const cb = new Color(canopyB);
    const col = new Color();
    let blob = 0;
    trees.forEach((tree, i) => {
      const rng = createRng(tree.seed);
      const trunkH = tree.height * 0.48;
      const girth = 0.8 + tree.height * 0.05;
      dummy.position.set(tree.x, 0, tree.z);
      dummy.rotation.set(0, rng() * Math.PI * 2, 0);
      dummy.scale.set(girth, trunkH, girth);
      dummy.updateMatrix();
      t.setMatrixAt(i, dummy.matrix);

      const R = tree.height * 0.27;
      const cy = tree.height * 0.66;
      const layout: [number, number, number, number][] = [[0, cy, 0, R]];
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + rng() * 1.2;
        layout.push([Math.cos(a) * R * 0.6, cy - R * 0.15 + rng() * R * 0.3, Math.sin(a) * R * 0.6, R * (0.62 + rng() * 0.15)]);
      }
      layout.push([(rng() - 0.5) * R * 0.3, cy + R * 0.55, (rng() - 0.5) * R * 0.3, R * 0.6]);
      for (const [bx, by, bz, s] of layout.slice(0, BLOBS_PER_TREE)) {
        dummy.position.set(tree.x + bx, by, tree.z + bz);
        dummy.rotation.set(rng() * 0.6, rng() * Math.PI * 2, rng() * 0.6);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        c.setMatrixAt(blob, dummy.matrix);
        c.setColorAt(blob, col.copy(ca).lerp(cb, Math.min(1, Math.max(0, tree.tint + (rng() - 0.5) * 0.25))));
        blob++;
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

  return (
    <>
      <instancedMesh ref={trunks} args={[trunkGeo, trunkMat, trees.length]} castShadow receiveShadow />
      <instancedMesh ref={canopies} args={[canopyGeo, canopyMat, trees.length * BLOBS_PER_TREE]} castShadow receiveShadow />
    </>
  );
}
