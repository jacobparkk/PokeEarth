import type { Location } from '../../data/regions';
export function EnvironmentRig({ location }: { location: Location }) {
  const environment = location.environment;
  return <>
    <color attach="background" args={[environment.sky.horizon]} />
    <fog attach="fog" args={[environment.fog.color, environment.fog.near, environment.fog.far]} />
    <hemisphereLight args={[environment.ambient.skyColor, environment.ambient.groundColor, environment.ambient.intensity]} />
    <directionalLight position={[...environment.sun.position]} color={environment.sun.color} intensity={environment.sun.intensity} castShadow={environment.sun.shadows} shadow-mapSize={[2048, 2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-near={0.5} shadow-camera-far={160} shadow-normalBias={0.05} shadow-bias={-0.0001} />
    <mesh position={[-90, 70, -140]}><sphereGeometry args={[8, 24, 16]} /><meshBasicMaterial color="#fff5ce" fog={false} /></mesh>
  </>;
}
