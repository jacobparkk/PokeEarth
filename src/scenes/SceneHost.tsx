import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ErrorInfo, MutableRefObject, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import type { Location } from '../data/regions';
import { EnvironmentRig } from './shared/EnvironmentRig';
import { FirstPersonController, type TouchMovement } from './shared/FirstPersonController';
import NationalPark from './national-park/NationalPark';
import { createParkLayout } from './national-park/layout';
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('PokeEarth scene failed', error, info.componentStack); this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Ready({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  const fired = useRef(false);
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  useFrame(() => { if (!fired.current) { fired.current = true; onReady(); } });
  return null;
}
interface Props {
  location: Location;
  phase: 'loading' | 'entering' | 'exploring';
  touchMovement: MutableRefObject<TouchMovement>;
  onReady: () => void;
  onEntered: () => void;
  onError: () => void;
}
export default function SceneHost({ location, phase, touchMovement, onReady, onEntered, onError }: Props) {
  const layout = useMemo(() => createParkLayout(location), [location]);
  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(onError, 20000);
    return () => clearTimeout(timer);
  }, [phase, onError]);
  return <SceneBoundary onError={onError}>
    <Canvas shadows dpr={[1,1.5]} camera={{ position: [...location.camera.overview.position], fov: location.camera.overview.fov, near: 0.1, far: 400 }} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = location.environment.exposure; }} fallback={<NoWebGL onError={onError} />}>
      <Suspense fallback={null}>
        <EnvironmentRig location={location} />
        <NationalPark location={location} layout={layout} />
        <FirstPersonController location={location} phase={phase} colliders={layout.colliders} touchMovement={touchMovement} onEntered={onEntered} />
        <Ready onReady={onReady} onError={onError} />
      </Suspense>
    </Canvas>
  </SceneBoundary>;
}
function NoWebGL({ onError }: { onError: () => void }) {
  useEffect(onError, [onError]);
  return <p>Your browser cannot start the 3D view. Return to the map to continue.</p>;
}
