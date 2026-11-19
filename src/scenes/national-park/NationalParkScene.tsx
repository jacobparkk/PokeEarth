"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Vector3 } from "three";
import { StreetHud } from "@/components/hud/StreetHud";
import { AudioListenerSync } from "@/engine/AudioListenerSync";
import { FirstPersonController } from "@/engine/FirstPersonController";
import { GrassField } from "@/engine/foliage/GrassField";
import { TreeField } from "@/engine/foliage/TreeField";
import { ModelSlot } from "@/engine/ModelSlot";
import { AmbientParticles } from "@/engine/particles/AmbientParticles";
import { useSceneRuntime } from "@/engine/runtime";
import { SceneEnvironment } from "@/engine/SceneEnvironment";
import { sunDirection } from "@/engine/sun";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { ModelSlot as ModelSlotConfig } from "@/types/world";
import type { SceneProps } from "../registry";
import { Fountain } from "./Fountain";
import { Flowerbeds } from "../shared/Flowerbeds";
import { Gatehouse } from "../shared/Gatehouse";
import { buildColliders, buildLawnGrass, buildTallGrass, buildTrees, FLOWERBEDS, PARK } from "./layout";
import { Benches, DistantHills, Hedges, Lamps, ParkGround, ParkWall } from "./ParkProps";

/**
 * Johto · National Park — the MVP first-person scene.
 *
 * Everything is procedural and seeded from `location.scene.seed`, so the park
 * looks identical on every visit. Each major piece sits in a ModelSlot: set a
 * slot's `url` in the location data to replace it with a custom .glb.
 */
export default function NationalParkScene({ location, onExit }: SceneProps) {
  const mode = useExplorerStore((s) => s.mode);
  const resetRuntime = useSceneRuntime((s) => s.reset);
  const { environment: env, camera, scene } = location;

  useEffect(() => {
    resetRuntime();
  }, [resetRuntime]);

  const world = useMemo(() => {
    const trees = buildTrees(scene.seed);
    return {
      trees,
      tallGrass: buildTallGrass(scene.seed + 1),
      lawn: buildLawnGrass(scene.seed + 2, 26000),
      colliders: buildColliders(trees),
    };
  }, [scene.seed]);

  const sunDir = useMemo(() => {
    const d = sunDirection(env.sun.elevationDeg, env.sun.azimuthDeg);
    return new Vector3(d[0], d[1], d[2]);
  }, [env.sun.elevationDeg, env.sun.azimuthDeg]);

  const slots = useMemo(() => {
    const bySlot = new Map<string, ModelSlotConfig>(scene.models.map((m) => [m.slot, m]));
    const get = (name: string): ModelSlotConfig =>
      bySlot.get(name) ?? {
        slot: name,
        url: null,
        proceduralFallback: `procedural:${name}`,
        position: [0, 0, 0],
        rotationDeg: [0, 0, 0],
        scale: 1,
        castShadow: true,
        receiveShadow: true,
      };
    return {
      terrain: get("terrain"),
      fountain: get("fountain"),
      gateSouth: get("gate-south"),
      gateEast: get("gate-east"),
      benches: get("benches"),
    };
  }, [scene.models]);

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
          <SceneEnvironment env={env} shadowExtent={66} />

          <ModelSlot slot={slots.terrain} fallback={<ParkGround seed={scene.seed} />} />
          <ModelSlot slot={slots.fountain} fallback={<Fountain sunDir={sunDir} skyColor={env.hemisphere.skyColor} />} />
          <ModelSlot slot={slots.gateSouth} fallback={<Gatehouse />} />
          <ModelSlot slot={slots.gateEast} fallback={<Gatehouse />} />
          <ModelSlot slot={slots.benches} fallback={<Benches />} />

          <ParkWall />
          <Hedges />
          <Lamps />
          <Flowerbeds beds={FLOWERBEDS} seed={scene.seed + 3} />
          <TreeField trees={world.trees} canopyA="#4f7d2f" canopyB="#8a9a3a" trunk="#5a4030" wind={wind} />
          <GrassField blades={world.tallGrass} colorA="#5f8a2c" colorB="#a3b04a" wind={wind} />
          <GrassField blades={world.lawn} colorA="#6d8f38" colorB="#93a84a" wind={wind * 0.6} parting={false} />
          <DistantHills seed={scene.seed + 4} />
          <AmbientParticles effect={env.weather.particles} extent={PARK.wallHalf} seed={scene.seed + 5} wind={wind} />

          <FirstPersonController
            ground={camera.ground}
            aerial={camera.aerial}
            descentDurationMs={camera.descentDurationMs}
            colliders={world.colliders}
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
