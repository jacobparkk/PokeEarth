"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { BufferAttribute, Group, IcosahedronGeometry, InstancedMesh, Object3D, Quaternion, Vector3 } from "three";
import { StreetHud } from "@/components/hud/StreetHud";
import { AudioListenerSync } from "@/engine/AudioListenerSync";
import { FirstPersonController } from "@/engine/FirstPersonController";
import { createLavaMaterial } from "@/engine/materials/effects";
import { ModelSlot } from "@/engine/ModelSlot";
import { AmbientParticles } from "@/engine/particles/AmbientParticles";
import { SteamPlumes } from "@/engine/particles/SteamPlumes";
import { useSceneRuntime } from "@/engine/runtime";
import { SceneEnvironment } from "@/engine/SceneEnvironment";
import { Heightfield } from "@/engine/terrain/Heightfield";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { ModelSlot as ModelSlotConfig } from "@/types/world";
import type { SceneProps } from "../registry";
import { Signposts } from "../towns/props";
import { buildVolcano, VOLCANO, volcanoColor, volcanoHeight, type Boulder } from "./terrain";

/* ------------------------------------------------------------------ pieces */

function LavaLake() {
  const material = useMemo(createLavaMaterial, []);
  useFrame((_, dt) => {
    material.uniforms.uTime!.value += dt;
  });
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={VOLCANO.lavaY} material={material}>
        <circleGeometry args={[VOLCANO.lavaRadius + 2, 80]} />
      </mesh>
      {/* The lava lights the crater walls from below. */}
      <pointLight position={[0, VOLCANO.lavaY + 3, 0]} color="#ff6a1f" intensity={900} distance={90} decay={2} />
    </>
  );
}

function Boulders({ items }: { items: readonly Boulder[] }) {
  const mesh = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new IcosahedronGeometry(1, 1);
    const pos = g.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const k = 1 + 0.22 * Math.sin(x * 4.1 + y * 2.3) * Math.cos(z * 3.7 - y);
      pos.setXYZ(i, x * k, y * k * 0.72, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const d = new Object3D();
    items.forEach((b, i) => {
      d.position.set(b.x, b.y + b.s * 0.25, b.z);
      d.rotation.set(b.rot * 0.3, b.rot, b.rot * 0.2);
      d.scale.setScalar(b.s);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, items.length]} castShadow receiveShadow>
      <meshStandardMaterial color="#3a332e" roughness={0.95} flatShading />
    </instancedMesh>
  );
}

/** Cable-car station (procedural stand-in for the "cable-car-station" slot). Local front = +z (toward the crater). */
function CableCarStation() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[11, 1.6, 7.5]} />
        <meshStandardMaterial color="#8a837a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 3.6, 6.5]} />
        <meshStandardMaterial color="#d4cec4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.0, 0]} castShadow>
        <boxGeometry args={[11, 0.4, 7.5]} />
        <meshStandardMaterial color="#6d4a3a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.1, 3.27]}>
        <boxGeometry args={[8, 1.3, 0.05]} />
        <meshStandardMaterial color="#a8d0e0" roughness={0.15} emissive="#ffe0b0" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.8, 3.28]}>
        <boxGeometry args={[2.2, 2.2, 0.06]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Bay where the cables leave, on the back (−z) side */}
      <mesh position={[0, 3.2, -3.6]} castShadow>
        <boxGeometry args={[4.5, 3, 1.2]} />
        <meshStandardMaterial color="#c24a35" roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.6, 2.2]}>
        <boxGeometry args={[4.4, 0.8, 0.12]} />
        <meshStandardMaterial color="#c24a35" emissive="#ff6a3d" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

/** Static cable geometry: from the station's back bay down the mountainside, away from the crater. */
const CABLE = (() => {
  const st = VOLCANO.station;
  const a = (st.rotDeg * Math.PI) / 180;
  const back = new Vector3(-Math.sin(a), 0, -Math.cos(a));
  const side = new Vector3(back.z, 0, -back.x);
  const start = new Vector3(st.x, volcanoHeight(st.x, st.z) + 4.2, st.z).addScaledVector(back, 4.5);
  const end = start.clone().addScaledVector(back, 190);
  end.y = volcanoHeight(end.x, end.z) + 14;
  const up = new Vector3(0, 1, 0);
  const cables = [-1.1, 1.1].map((o) => {
    const s = start.clone().addScaledVector(side, o);
    const e = end.clone().addScaledVector(side, o);
    return { o, mid: s.clone().add(e).multiplyScalar(0.5), len: s.distanceTo(e), quat: new Quaternion().setFromUnitVectors(up, e.clone().sub(s).normalize()) };
  });
  const pylons = [0.33, 0.66].map((f) => {
    const p = start.clone().lerp(end, f);
    return { x: p.x, z: p.z, top: p.y, bottom: volcanoHeight(p.x, p.z) };
  });
  return { start, end, side, cables, pylons };
})();

/** Two cables running down the mountain from the station, with pylons and a gondola shuttling along them. */
function CableLine() {
  const { start, end, side, cables, pylons } = CABLE;
  const gondola = useRef<Group>(null);
  const clock = useRef(17);

  useFrame((_, dt) => {
    clock.current += dt;
    const period = 48;
    const u = (clock.current % period) / period;
    const k = u < 0.5 ? u * 2 : 2 - u * 2; // ping-pong
    const ease = k * k * (3 - 2 * k);
    if (gondola.current) gondola.current.position.lerpVectors(start, end, 0.04 + ease * 0.92).addScaledVector(side, 1.1);
  });

  return (
    <group>
      {cables.map((c) => (
        <mesh key={c.o} position={c.mid} quaternion={c.quat}>
          <cylinderGeometry args={[0.04, 0.04, c.len, 5]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {pylons.map((p, i) => (
        <group key={i}>
          <mesh position={[p.x, (p.top + p.bottom) / 2, p.z]} castShadow>
            <boxGeometry args={[0.8, p.top - p.bottom + 1, 0.8]} />
            <meshStandardMaterial color="#8b8f93" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[p.x, p.top + 0.4, p.z]} rotation-y={Math.atan2(side.x, side.z)}>
            <boxGeometry args={[0.4, 0.4, 3.4]} />
            <meshStandardMaterial color="#8b8f93" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <group ref={gondola}>
        <mesh position-y={-0.9}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 5]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
        <mesh position-y={-2.6} castShadow>
          <boxGeometry args={[2.2, 1.9, 2.6]} />
          <meshStandardMaterial color="#d0402e" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position-y={-2.35}>
          <boxGeometry args={[2.25, 0.8, 2.3]} />
          <meshStandardMaterial color="#bcd8e4" roughness={0.1} emissive="#fff0d0" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ scene */

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
 * Hoenn · Mt. Chimney: walk the rim of an active crater above a churning lava
 * lake while ash drifts down and fumaroles hiss around you.
 */
export default function MtChimneyScene({ location, onExit }: SceneProps) {
  const mode = useExplorerStore((s) => s.mode);
  const resetRuntime = useSceneRuntime((s) => s.reset);
  const { environment: env, camera, scene } = location;
  useEffect(() => {
    resetRuntime();
  }, [resetRuntime]);

  const world = useMemo(() => buildVolcano(scene.seed), [scene.seed]);
  const slots = useMemo(() => {
    const by = new Map(scene.models.map((m) => [m.slot, m]));
    return { terrain: by.get("terrain") ?? fallbackSlot("terrain"), station: by.get("cable-car-station") ?? fallbackSlot("cable-car-station") };
  }, [scene.models]);
  const signs = useMemo(() => [{ x: 3.4, z: 34, rot: 0 }], []);
  const wind = env.weather.windStrength;

  return (
    <div className="absolute inset-0 bg-ink">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: camera.aerial.fov, near: 0.1, far: 1000, position: [...camera.aerial.position] }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment env={env} shadowExtent={70} />
          <ModelSlot
            slot={slots.terrain}
            fallback={<Heightfield size={VOLCANO.terrainSize} segments={240} height={volcanoHeight} color={volcanoColor} />}
          />
          <LavaLake />
          <Boulders items={world.boulders} />
          <SteamPlumes vents={world.vents} height={11} density={120} seed={scene.seed} />
          <group position-y={volcanoHeight(VOLCANO.station.x, VOLCANO.station.z) - 0.3}>
            <ModelSlot slot={slots.station} fallback={<CableCarStation />} />
          </group>
          <CableLine />
          <group position-y={volcanoHeight(3.4, 34)}>
            <Signposts items={signs} />
          </group>
          <AmbientParticles effect={env.weather.particles} extent={60} seed={scene.seed + 5} wind={wind} />

          <FirstPersonController
            ground={camera.ground}
            aerial={camera.aerial}
            descentDurationMs={camera.descentDurationMs}
            colliders={world.colliders}
            groundHeight={volcanoHeight}
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
