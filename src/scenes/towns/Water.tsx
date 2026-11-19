"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Vector3 } from "three";
import { createSeaMaterial, createWaterMaterial } from "@/engine/materials/water";
import type { Circle } from "./types";

/** Sea filling everything south of `shoreZ`, with a surging foam line. */
export function Sea({ shoreZ, sunDir, sky }: { shoreZ: number; sunDir: Vector3; sky: string }) {
  const material = useMemo(() => createSeaMaterial({ shoreZ, deep: "#1f5f7c", shallow: "#58b3c4", sky, sunDir }), [shoreZ, sunDir, sky]);
  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });
  const depth = 600;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.06, shoreZ - 3 + depth / 2]} material={material}>
      <planeGeometry args={[900, depth, 1, 1]} />
    </mesh>
  );
}

/** A still lake with ripples. */
export function Lake({ lake, sunDir, sky }: { lake: Circle; sunDir: Vector3; sky: string }) {
  const material = useMemo(
    () => createWaterMaterial({ center: [lake.x, lake.z], radius: lake.r, deep: "#2c5f74", shallow: "#6aaabb", sky, sunDir, rippleSpeed: 0.35 }),
    [lake, sunDir, sky],
  );
  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[lake.x, 0.05, lake.z]} material={material}>
      <circleGeometry args={[lake.r, 64]} />
    </mesh>
  );
}
