"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Color, Group, IcosahedronGeometry, InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { StreetHud } from "@/components/hud/StreetHud";
import { AudioListenerSync } from "@/engine/AudioListenerSync";
import { FirstPersonController } from "@/engine/FirstPersonController";
import { createCloudSeaMaterial } from "@/engine/materials/effects";
import { ModelSlot } from "@/engine/ModelSlot";
import { AmbientParticles } from "@/engine/particles/AmbientParticles";
import { useSceneRuntime } from "@/engine/runtime";
import { SceneEnvironment } from "@/engine/SceneEnvironment";
import { Heightfield } from "@/engine/terrain/Heightfield";
import { createRng } from "@/lib/geometry";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { ModelSlot as ModelSlotConfig } from "@/types/world";
import type { SceneProps } from "../registry";
import { buildRuins, RUINS, summitColor, summitHeight, summitTerrain, type Column } from "./layout";

const MARBLE = "#d9d6e0";
const MARBLE_DARK = "#a9a5b4";
const SNOW = "#f2f5fb";

/* ---------------------------------------------------------------- platform */

function Platform({ tiles }: { tiles: ReturnType<typeof buildRuins>["tiles"] }) {
  const mesh = useRef<InstancedMesh>(null);
  const { platform, steps } = RUINS;
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const d = new Object3D();
    const a = new Color(MARBLE);
    const b = new Color(SNOW);
    const c = new Color();
    tiles.forEach((t, i) => {
      d.position.set(t.x, platform.height - 0.06 + t.dy, t.z);
      d.rotation.set(t.rx, 0, t.rz);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, c.copy(a).lerp(b, t.shade * 0.6).multiplyScalar(0.92 + t.shade * 0.1));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [tiles, platform.height]);

  return (
    <group>
      {/* Bedding slab under the tiles (visible through the gaps) */}
      <mesh position={[0, platform.height / 2 - 0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[platform.halfX * 2 + 0.4, platform.height - 0.1, platform.halfZ * 2 + 0.4]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.9} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, tiles.length]} receiveShadow castShadow>
        <boxGeometry args={[2.42, 0.12, 2.42]} />
        <meshStandardMaterial roughness={0.45} />
      </instancedMesh>
      {/* South steps */}
      {Array.from({ length: steps.count }, (_, i) => {
        const h = (platform.height / steps.count) * (steps.count - i);
        const depth = (steps.depth / steps.count) * (i + 1);
        return (
          <mesh key={i} position={[0, h / 2, steps.from + depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[steps.halfX * 2, h, depth]} />
            <meshStandardMaterial color={MARBLE} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ----------------------------------------------------------------- columns */

function ColumnPiece({ c }: { c: Column }) {
  const base = RUINS.platform.height;
  const full = c.height >= 9;
  return (
    <group>
      <mesh position={[c.x, base + 0.3, c.z]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.6, 2.0]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[c.x, base + 0.6 + c.height / 2, c.z]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.66, c.height, 20]} />
        <meshStandardMaterial color={MARBLE} roughness={0.5} />
      </mesh>
      {full ? (
        <>
          <mesh position={[c.x, base + 0.6 + c.height + 0.3, c.z]} castShadow>
            <boxGeometry args={[2.1, 0.6, 2.1]} />
            <meshStandardMaterial color={MARBLE_DARK} roughness={0.6} />
          </mesh>
          <mesh position={[c.x, base + 0.6 + c.height + 0.64, c.z]}>
            <boxGeometry args={[2.0, 0.08, 2.0]} />
            <meshStandardMaterial color={SNOW} roughness={0.9} />
          </mesh>
        </>
      ) : (
        // Snapped top: a tilted broken slice dusted with snow.
        <mesh position={[c.x, base + 0.6 + c.height + 0.05, c.z]} rotation={[0.35, c.z, 0.2]}>
          <cylinderGeometry args={[0.58, 0.62, 0.3, 20]} />
          <meshStandardMaterial color={SNOW} roughness={0.9} />
        </mesh>
      )}
      {c.fallen &&
        [0, 1, 2].map((k) => {
          const d = 2.3 + k * 2.7;
          const x = c.x + Math.cos(c.angle) * d;
          const z = c.z + Math.sin(c.angle) * d;
          return (
            <mesh key={k} position={[x, summitHeight(x, z) + 0.6, z]} rotation={[0, -c.angle, Math.PI / 2 + (k - 1) * 0.05]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.62, 2.55, 20]} />
              <meshStandardMaterial color={MARBLE} roughness={0.55} />
            </mesh>
          );
        })}
    </group>
  );
}

function Colonnade({ columns }: { columns: readonly Column[] }) {
  const top = RUINS.platform.height + 0.6 + 9 + 0.6;
  // Lintels survive only where two neighbouring columns still stand at full height.
  const lintels = columns.filter((c, i) => {
    const next = columns[i + 1];
    return next && next.x === c.x && c.height >= 9 && next.height >= 9;
  });
  return (
    <group>
      {columns.map((c, i) => (
        <ColumnPiece key={i} c={c} />
      ))}
      {lintels.map((c, i) => (
        <group key={i}>
          <mesh position={[c.x, top + 0.45, c.z + 3]} castShadow>
            <boxGeometry args={[1.9, 0.9, 7.6]} />
            <meshStandardMaterial color={MARBLE} roughness={0.55} />
          </mesh>
          <mesh position={[c.x, top + 0.94, c.z + 3]}>
            <boxGeometry args={[1.8, 0.1, 7.4]} />
            <meshStandardMaterial color={SNOW} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- dais/altar */

function Dais() {
  const { dais, platform } = RUINS;
  const ring = useRef<Mesh>(null);
  const crystal = useRef<Group>(null);
  const ringMat = useMemo(() => new MeshStandardMaterial({ color: "#c9d6ff", emissive: "#7f9cff", emissiveIntensity: 2, roughness: 0.3 }), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ringMat.emissiveIntensity = 1.6 + Math.sin(t * 1.3) * 0.8;
    if (ring.current) ring.current.rotation.z = t * 0.15;
    if (crystal.current) {
      crystal.current.rotation.y = t * 0.5;
      crystal.current.position.y = platform.height + dais.rise * 3 + 3.4 + Math.sin(t * 0.9) * 0.25;
    }
  });
  const topY = platform.height + dais.rise * dais.tiers.length;
  return (
    <group position={[dais.x, 0, dais.z]}>
      {dais.tiers.map((r, i) => (
        <mesh key={r} position-y={platform.height + dais.rise * (i + 0.5)} castShadow receiveShadow>
          <cylinderGeometry args={[r, r + 0.15, dais.rise, 48]} />
          <meshStandardMaterial color={i % 2 ? MARBLE_DARK : MARBLE} roughness={0.5} />
        </mesh>
      ))}
      <mesh ref={ring} position-y={topY + 0.03} rotation-x={-Math.PI / 2} material={ringMat}>
        <torusGeometry args={[3.2, 0.07, 8, 96]} />
      </mesh>
      <mesh position-y={topY + 0.6} castShadow>
        <boxGeometry args={[2.4, 1.2, 1.5]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.4} />
      </mesh>
      <group ref={crystal}>
        <mesh castShadow>
          <octahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color="#e6ecff" emissive="#8fa8ff" emissiveIntensity={1.4} roughness={0.15} metalness={0.2} />
        </mesh>
        <pointLight color="#9fb4ff" intensity={60} distance={18} decay={2} />
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- backdrop */

function Crags({ items }: { items: ReturnType<typeof buildRuins>["crags"] }) {
  const mesh = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new IcosahedronGeometry(1, 0), []);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const d = new Object3D();
    items.forEach((c, i) => {
      d.position.set(c.x, summitTerrain(c.x, c.z) + c.s * 0.3, c.z);
      d.rotation.set(c.rot * 0.4, c.rot, 0);
      d.scale.set(c.s * 0.8, c.s * 1.3, c.s * 0.8);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, items.length]} castShadow receiveShadow>
      <meshStandardMaterial color="#3b3c44" roughness={0.9} flatShading />
    </instancedMesh>
  );
}

function DistantPeaks({ seed }: { seed: number }) {
  const peaks = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + rng() * 0.25;
      const r = 380 + rng() * 320;
      return { x: Math.sin(a) * r, z: Math.cos(a) * r, rad: 90 + rng() * 90, h: 150 + rng() * 140, rot: rng() * Math.PI };
    });
  }, [seed]);
  return (
    <group>
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, RUINS.cloudY - 40, p.z]} rotation-y={p.rot}>
          <mesh position-y={p.h / 2}>
            <coneGeometry args={[p.rad, p.h, 7]} />
            <meshStandardMaterial color="#4a4d5c" roughness={1} flatShading />
          </mesh>
          <mesh position-y={p.h * 0.82}>
            <coneGeometry args={[p.rad * 0.37, p.h * 0.37, 7]} />
            <meshStandardMaterial color="#eef2fa" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CloudSea() {
  const material = useMemo(() => createCloudSeaMaterial({ tint: "#f4d6e4", shadow: "#9aa3c4", light: "#fdf6f4" }), []);
  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={RUINS.cloudY} material={material} renderOrder={-1}>
      <planeGeometry args={[3200, 3200]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------- scene */

const fallbackSlot = (name: string): ModelSlotConfig => ({
  slot: name,
  url: null,
  proceduralFallback: `procedural:${name}`,
  position: [0, 0, 0],
  rotationDeg: [0, 0, 0],
  scale: 1,
  castShadow: true,
  receiveShadow: true,
});

/**
 * Sinnoh · Spear Pillar: ancient ruins on the summit of Mt. Coronet at dawn,
 * above a sea of clouds. Climb the steps onto the platform and up the dais.
 */
export default function SpearPillarScene({ location, onExit }: SceneProps) {
  const mode = useExplorerStore((s) => s.mode);
  const resetRuntime = useSceneRuntime((s) => s.reset);
  const { environment: env, camera, scene } = location;
  useEffect(() => {
    resetRuntime();
  }, [resetRuntime]);

  const ruins = useMemo(() => buildRuins(scene.seed), [scene.seed]);
  const slots = useMemo(() => {
    const by = new Map(scene.models.map((m) => [m.slot, m]));
    return { terrain: by.get("terrain") ?? fallbackSlot("terrain"), ruins: by.get("ruins") ?? fallbackSlot("ruins") };
  }, [scene.models]);
  const wind = env.weather.windStrength;

  return (
    <div className="absolute inset-0 bg-ink">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: camera.aerial.fov, near: 0.1, far: 2600, position: [...camera.aerial.position] }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment env={env} shadowExtent={60} skyDistance={1500} />
          <CloudSea />
          <DistantPeaks seed={scene.seed + 1} />
          <ModelSlot
            slot={slots.terrain}
            fallback={<Heightfield size={RUINS.terrainSize} segments={260} height={summitTerrain} color={summitColor} />}
          />
          <Crags items={ruins.crags} />
          <ModelSlot
            slot={slots.ruins}
            fallback={
              <>
                <Platform tiles={ruins.tiles} />
                <Colonnade columns={ruins.columns} />
                <Dais />
              </>
            }
          />
          <AmbientParticles effect={env.weather.particles} extent={55} seed={scene.seed + 5} wind={wind} />

          <FirstPersonController
            ground={camera.ground}
            aerial={camera.aerial}
            descentDurationMs={camera.descentDurationMs}
            colliders={ruins.colliders}
            groundHeight={summitHeight}
            enabled={mode === "street"}
          />
          <AudioListenerSync />
          <Preload all />
        </Suspense>
      </Canvas>
      <StreetHud location={location} onExit={onExit} />
    </div>
  );
}
