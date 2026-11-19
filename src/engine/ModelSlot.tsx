"use client";

import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { MathUtils, type Mesh } from "three";
import type { ModelSlot as ModelSlotConfig } from "@/types/world";

interface ModelSlotProps {
  slot: ModelSlotConfig;
  /** Procedural stand-in, authored in the slot's local space. */
  fallback: ReactNode;
}

/**
 * The plug-in point for custom 3D assets.
 *
 * Renders `slot.url` (a .glb) when the data sets one, otherwise the procedural
 * fallback. While the model downloads, or if it fails to load, the fallback is
 * shown, so a broken asset link never breaks the scene.
 */
export function ModelSlot({ slot, fallback }: ModelSlotProps) {
  const rotation = useMemo(
    () => slot.rotationDeg.map((d) => MathUtils.degToRad(d)) as [number, number, number],
    [slot.rotationDeg],
  );

  return (
    <group position={[...slot.position]} rotation={rotation} scale={slot.scale}>
      {slot.url ? (
        <GltfErrorBoundary fallback={fallback} url={slot.url}>
          <Suspense fallback={fallback}>
            <GltfModel url={slot.url} castShadow={slot.castShadow} receiveShadow={slot.receiveShadow} />
          </Suspense>
        </GltfErrorBoundary>
      ) : (
        fallback
      )}
    </group>
  );
}

function GltfModel({ url, castShadow, receiveShadow }: { url: string; castShadow: boolean; receiveShadow: boolean }) {
  const { scene } = useGLTF(url);
  const instance = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = castShadow;
        o.receiveShadow = receiveShadow;
      }
    });
    return clone;
  }, [scene, castShadow, receiveShadow]);
  return <primitive object={instance} />;
}

interface BoundaryProps {
  url: string;
  fallback: ReactNode;
  children: ReactNode;
}

class GltfErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.warn(`[PokeEarth] Could not load model "${this.props.url}", using procedural fallback.`, error.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
