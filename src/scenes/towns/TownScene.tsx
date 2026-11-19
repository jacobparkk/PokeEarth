"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, Vector3 } from "three";
import { StreetHud } from "@/components/hud/StreetHud";
import { AudioListenerSync } from "@/engine/AudioListenerSync";
import { FirstPersonController } from "@/engine/FirstPersonController";
import { ConiferField } from "@/engine/foliage/ConiferField";
import { GrassField } from "@/engine/foliage/GrassField";
import { TreeField } from "@/engine/foliage/TreeField";
import { ModelSlot } from "@/engine/ModelSlot";
import { AmbientParticles } from "@/engine/particles/AmbientParticles";
import { useSceneRuntime } from "@/engine/runtime";
import { SceneEnvironment } from "@/engine/SceneEnvironment";
import { sunDirection } from "@/engine/sun";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { SceneProps } from "../registry";
import { DistantHills } from "../national-park/ParkProps";
import { Flowerbeds } from "../shared/Flowerbeds";
import { ProceduralBuilding } from "./buildings";
import { paintTownGround } from "./groundTexture";
import { TOWN_LAYOUTS } from "./layouts";
import { Fences, Mailboxes, MovingTrucks, Signposts, StoneLanterns, Torii, Windmills } from "./props";
import { resolveTown } from "./resolve";
import type { Rect, TownLayout } from "./types";
import { Lake, Sea } from "./Water";

function TownGround({ layout, foundations, seed }: { layout: TownLayout; foundations: readonly Rect[]; seed: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2048;
    const ctx = canvas.getContext("2d");
    if (ctx) paintTownGround(ctx, 2048, layout, foundations, seed);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [layout, foundations, seed]);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[layout.groundHalf * 2, layout.groundHalf * 2]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color={layout.palette.grassDark} roughness={1} />
      </mesh>
    </>
  );
}

/**
 * Generic, data-driven town scene used by Pallet, New Bark, Littleroot,
 * Twinleaf and Ecruteak. Buildings that are model slots in the location data
 * can be swapped for .glb files; everything else comes from TOWN_LAYOUTS.
 */
export default function TownScene({ location, onExit }: SceneProps) {
  const mode = useExplorerStore((s) => s.mode);
  const resetRuntime = useSceneRuntime((s) => s.reset);
  const { environment: env, camera, scene } = location;
  const layout = TOWN_LAYOUTS[scene.sceneKey];

  useEffect(() => {
    resetRuntime();
  }, [resetRuntime]);

  const town = useMemo(() => (layout ? resolveTown(layout, location) : null), [layout, location]);
  const foundations = useMemo(() => town?.buildings.map((b) => b.bounds) ?? [], [town]);
  const sunDir = useMemo(() => {
    const d = sunDirection(env.sun.elevationDeg, env.sun.azimuthDeg);
    return new Vector3(d[0], d[1], d[2]);
  }, [env.sun.elevationDeg, env.sun.azimuthDeg]);

  if (!layout || !town) {
    throw new Error(`No town layout registered for scene "${scene.sceneKey}".`);
  }

  const wind = env.weather.windStrength;
  const sky = env.hemisphere.skyColor;
  const p = layout.props;

  return (
    <div className="absolute inset-0 bg-ink">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: camera.aerial.fov, near: 0.1, far: 1000, position: [...camera.aerial.position] }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment env={env} shadowExtent={layout.shadowExtent} />
          <TownGround layout={layout} foundations={foundations} seed={scene.seed} />
          {layout.sea && <Sea shoreZ={layout.sea.shoreZ} sunDir={sunDir} sky={sky} />}
          {layout.lake && <Lake lake={layout.lake} sunDir={sunDir} sky={sky} />}

          {town.buildings.map((b) =>
            b.slot ? (
              <ModelSlot key={b.id} slot={b.slot} fallback={<ProceduralBuilding kind={b.kind} style={b.style} />} />
            ) : (
              <group key={b.id} position={[b.x, 0, b.z]} rotation-y={(b.rotDeg * Math.PI) / 180}>
                <ProceduralBuilding kind={b.kind} style={b.style} />
              </group>
            ),
          )}

          <Fences lines={layout.fences} />
          {p.signposts && <Signposts items={p.signposts} />}
          {p.mailboxes && <Mailboxes items={p.mailboxes} />}
          {p.lanterns && <StoneLanterns items={p.lanterns} />}
          {p.torii && <Torii items={p.torii} />}
          {p.windmills && <Windmills items={p.windmills} wind={wind} />}
          {p.trucks && <MovingTrucks items={p.trucks} />}
          <Flowerbeds beds={layout.flowerBeds} seed={scene.seed + 3} perBed={120} />

          <TreeField trees={town.broadleaf} canopyA={layout.trees.canopy[0]} canopyB={layout.trees.canopy[1]} trunk={layout.trees.trunk} wind={wind} />
          <ConiferField trees={town.conifers} canopyA={layout.trees.canopy[0]} canopyB={layout.trees.canopy[1]} trunk={layout.trees.trunk} wind={wind} />
          {town.tallGrass.length > 0 && <GrassField blades={town.tallGrass} colorA={layout.palette.grassDark} colorB={layout.palette.grassLight} wind={wind} />}
          <GrassField blades={town.lawn} colorA={layout.palette.grass} colorB={layout.palette.grassLight} wind={wind * 0.6} parting={false} />
          <DistantHills seed={scene.seed + 4} />
          <AmbientParticles effect={env.weather.particles} extent={Math.min(64, layout.groundHalf)} seed={scene.seed + 5} wind={wind} />

          <FirstPersonController
            ground={camera.ground}
            aerial={camera.aerial}
            descentDurationMs={camera.descentDurationMs}
            colliders={town.colliders}
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
