"use client";

import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";

const W = 10;
const D = 6;
const WALL_H = 3.6;
const ROOF_H = 1.9;
const OVERHANG = 0.45;

/**
 * Route gatehouse (procedural stand-in for the "gate-*" model slots).
 * Local origin = centre of the front wall at ground level; the front faces −z
 * (into the park) and the building extends toward +z.
 */
export function Gatehouse() {
  const roof = useMemo(() => {
    const s = new Shape();
    const hd = D / 2 + OVERHANG;
    s.moveTo(-hd, 0);
    s.lineTo(hd, 0);
    s.lineTo(0, ROOF_H);
    s.closePath();
    const g = new ExtrudeGeometry(s, { depth: W + OVERHANG * 2, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-(W + OVERHANG * 2) / 2, WALL_H, D / 2);
    return g;
  }, []);

  return (
    <group>
      {/* Stone plinth and walls */}
      <mesh position={[0, 0.25, D / 2]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.3, 0.5, D + 0.3]} />
        <meshStandardMaterial color="#a89c84" roughness={0.95} />
      </mesh>
      <mesh position={[0, WALL_H / 2 + 0.25, D / 2]} castShadow receiveShadow>
        <boxGeometry args={[W, WALL_H - 0.5, D]} />
        <meshStandardMaterial color="#efe3c8" roughness={0.9} />
      </mesh>
      {/* Timber band under the eaves */}
      <mesh position={[0, WALL_H - 0.12, D / 2]} castShadow>
        <boxGeometry args={[W + 0.12, 0.24, D + 0.12]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.8} />
      </mesh>
      {/* Gabled roof with a ridge cap */}
      <mesh geometry={roof} castShadow receiveShadow>
        <meshStandardMaterial color="#8c3b2e" roughness={0.75} />
      </mesh>
      <mesh position={[0, WALL_H + ROOF_H, D / 2]} castShadow>
        <boxGeometry args={[W + OVERHANG * 2 + 0.1, 0.16, 0.3]} />
        <meshStandardMaterial color="#5e2a21" roughness={0.7} />
      </mesh>

      {/* Doorways on both sides (park and route) */}
      {[-0.01, D + 0.01].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[2.4, 2.6, 0.06]} />
            <meshStandardMaterial color="#2a211b" roughness={1} />
          </mesh>
          <mesh position={[0, 2.95, z < 0 ? -0.04 : 0.04]} castShadow>
            <boxGeometry args={[2.9, 0.2, 0.14]} />
            <meshStandardMaterial color="#6b4a32" />
          </mesh>
        </group>
      ))}

      {/* Warm-lit windows (bloom picks these up at golden hour) */}
      {[-3.1, 3.1].map((x) => (
        <group key={x} position={[x, 2.05, -0.03]}>
          <mesh>
            <boxGeometry args={[1.4, 1.0, 0.05]} />
            <meshStandardMaterial color="#ffd89a" emissive="#ffb85c" emissiveIntensity={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[1.56, 0.08, 0.06]} />
            <meshStandardMaterial color="#6b4a32" />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[0.08, 1.1, 0.06]} />
            <meshStandardMaterial color="#6b4a32" />
          </mesh>
        </group>
      ))}

      {/* Sign board above the door */}
      <mesh position={[0, 3.25, -0.08]} castShadow>
        <boxGeometry args={[1.8, 0.42, 0.08]} />
        <meshStandardMaterial color="#3e5a7a" roughness={0.6} />
      </mesh>
    </group>
  );
}
