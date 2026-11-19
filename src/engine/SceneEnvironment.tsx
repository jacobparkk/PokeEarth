"use client";

import { useMemo } from "react";
import { Sky } from "@react-three/drei";
import { Bloom, EffectComposer, HueSaturation, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { EnvironmentConfig } from "@/types/world";
import { sunDirection } from "./sun";

interface SceneEnvironmentProps {
  env: EnvironmentConfig;
  /** Half-size of the area that needs shadows, in metres. */
  shadowExtent?: number;
}

/**
 * Lighting, sky, fog and post-processing, all driven by `EnvironmentConfig`.
 * Exposure is applied to light intensities so it is independent of the
 * tone-mapping path used by the composer.
 */
export function SceneEnvironment({ env, shadowExtent = 62 }: SceneEnvironmentProps) {
  const dir = useMemo(() => sunDirection(env.sun.elevationDeg, env.sun.azimuthDeg), [env.sun.elevationDeg, env.sun.azimuthDeg]);
  const sunPos = useMemo(() => [dir[0] * 120, dir[1] * 120, dir[2] * 120] as [number, number, number], [dir]);
  const exposure = env.postFx.exposure;
  const shadow = env.sun.shadowMapSize;

  return (
    <>
      <color attach="background" args={[env.fog.color]} />
      <fog attach="fog" args={[env.fog.color, env.fog.near, env.fog.far]} />

      <Sky
        distance={450}
        sunPosition={sunPos}
        turbidity={env.sky.turbidity}
        rayleigh={env.sky.rayleigh}
        mieCoefficient={env.sky.mieCoefficient}
        mieDirectionalG={env.sky.mieDirectionalG}
      />

      <hemisphereLight args={[env.hemisphere.skyColor, env.hemisphere.groundColor, env.hemisphere.intensity * exposure]} />
      <ambientLight intensity={0.06 * exposure} />
      <directionalLight
        position={sunPos}
        color={env.sun.color}
        intensity={env.sun.intensity * exposure}
        castShadow={env.sun.castShadows}
        shadow-mapSize={[shadow, shadow]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-camera-near={1}
        shadow-camera-far={320}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
      />

      <EffectComposer multisampling={4}>
        <Bloom intensity={env.postFx.bloom} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
        <HueSaturation saturation={env.postFx.saturation - 1} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.32} darkness={env.postFx.vignette} />
      </EffectComposer>
    </>
  );
}
