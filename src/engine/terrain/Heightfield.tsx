"use client";

import { useMemo } from "react";
import { BufferAttribute, PlaneGeometry } from "three";

export type HeightFn = (x: number, z: number) => number;
/** Returns linear RGB 0–1 for a ground point given its height and slope (0 = flat, 1 = vertical). */
export type ColorFn = (x: number, z: number, h: number, slope: number) => [number, number, number];

interface HeightfieldProps {
  size: number;
  segments: number;
  height: HeightFn;
  color: ColorFn;
  roughness?: number;
}

/** Builds a displaced, vertex-coloured terrain plane centred on the origin. */
export function createHeightfieldGeometry(size: number, segments: number, height: HeightFn, color: ColorFn) {
  const g = new PlaneGeometry(size, size, segments, segments);
  g.rotateX(-Math.PI / 2);
  const pos = g.getAttribute("position") as BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
  g.computeVertexNormals();
  const normal = g.getAttribute("normal") as BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const slope = 1 - Math.min(1, Math.max(0, normal.getY(i)));
    const [r, gg, b] = color(pos.getX(i), pos.getZ(i), pos.getY(i), slope);
    colors[i * 3] = r;
    colors[i * 3 + 1] = gg;
    colors[i * 3 + 2] = b;
  }
  g.setAttribute("color", new BufferAttribute(colors, 3));
  return g;
}

/**
 * Terrain mesh for landmark scenes (volcano rims, mountain summits). Pass the
 * same `height` function to FirstPersonController's `groundHeight` so the
 * player walks on the surface.
 */
export function Heightfield({ size, segments, height, color, roughness = 0.95 }: HeightfieldProps) {
  const geometry = useMemo(() => createHeightfieldGeometry(size, segments, height, color), [size, segments, height, color]);
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={roughness} />
    </mesh>
  );
}
