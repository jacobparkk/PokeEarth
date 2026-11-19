import { useMemo } from 'react';
import type { Location } from '../../data/regions';
import { Fountain } from './Fountain';
import { Grass, Trees } from './Foliage';
import type { ParkLayout } from './layout';
import { seededRandom } from '../shared/movement';
function Bench({ x, z, rotation }: { x: number; z: number; rotation: number }) {
  return <group position={[x,0,z]} rotation={[0,rotation,0]}>
    {[0,1,2].map(i => <mesh key={i} position={[0,0.65,i*0.22-0.22]} castShadow receiveShadow><boxGeometry args={[3.6,0.12,0.18]} /><meshStandardMaterial color="#977c4c" roughness={0.9} /></mesh>)}
    {[0,1].map(i => <mesh key={i} position={[0,1.03+i*0.22,-0.42]} castShadow><boxGeometry args={[3.6,0.18,0.1]} /><meshStandardMaterial color="#977c4c" roughness={0.9} /></mesh>)}
    {[-1.3,1.3].map(x => <group key={x}><mesh position={[x,0.32,0]} castShadow><boxGeometry args={[0.12,0.65,0.7]} /><meshStandardMaterial color="#3f5141" /></mesh><mesh position={[x,0.93,-0.45]} castShadow><boxGeometry args={[0.1,0.8,0.1]} /><meshStandardMaterial color="#3f5141" /></mesh></group>)}
  </group>;
}
export default function NationalPark({ location, layout }: { location: Location; layout: ParkLayout }) {
  const ring = location.scene.features.find(feature => feature.kind === 'path-ring')!;
  const petals = useMemo(() => { const random = seededRandom(97); return Array.from({ length: 90 }, () => { const angle=random()*Math.PI*2; const r=20.5+random()*1.4; return {x:Math.sin(angle)*r,z:Math.cos(angle)*r,color:['#dfc88c','#bdafcd','#eee1a6'][Math.floor(random()*3)]}; }); }, []);
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[340,340]} /><meshStandardMaterial color="#91a16c" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.015,0]} receiveShadow><circleGeometry args={[37,96]} /><meshStandardMaterial color="#a6b378" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.035,0]} receiveShadow><ringGeometry args={[ring.size[0]/2-3.8,ring.size[0]/2,96]} /><meshStandardMaterial color="#d7c594" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.04,0]} receiveShadow><circleGeometry args={[6.3,64]} /><meshStandardMaterial color="#d9cba5" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.03,8]} receiveShadow><planeGeometry args={[4,60]} /><meshStandardMaterial color="#d7c594" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.028,0]} receiveShadow><planeGeometry args={[58,3]} /><meshStandardMaterial color="#d7c594" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.025,0]} receiveShadow><ringGeometry args={[29.5,33,96]} /><meshStandardMaterial color="#c6bc90" roughness={1} /></mesh>
    <Fountain radius={layout.fountainRadius} fog={location.environment.fog} />
    <Trees layout={layout} /><Grass location={location} />
    {layout.benches.map(bench => <Bench key={`${bench.x}:${bench.z}`} {...bench} />)}
    {petals.map((flower,i) => <mesh key={i} position={[flower.x,0.18,flower.z]} rotation={[-Math.PI/2,0,i]}><circleGeometry args={[0.13,5]} /><meshStandardMaterial color={flower.color} side={2} /></mesh>)}
    {[-5.1,5.1].map(x => <group key={x} position={[x,0,33]}><mesh position={[0,1.5,0]} castShadow><boxGeometry args={[1.2,3,1.2]} /><meshStandardMaterial color="#b5b392" /></mesh><mesh position={[0,3.15,0]} castShadow><boxGeometry args={[1.5,0.3,1.5]} /><meshStandardMaterial color="#d5cfaa" /></mesh><mesh position={[0,3.65,0]}><sphereGeometry args={[0.35,12,8]} /><meshStandardMaterial color="#faf0c7" emissive="#f9c574" emissiveIntensity={0.25} /></mesh></group>)}
    <group position={[-7,0,27]}><mesh position={[0,0.8,0]} castShadow><boxGeometry args={[0.16,1.6,0.16]} /><meshStandardMaterial color="#665638" /></mesh><mesh position={[0,1.6,0]} castShadow><boxGeometry args={[2.4,0.9,0.15]} /><meshStandardMaterial color="#3e6247" /></mesh><mesh position={[0,1.6,0.081]}><ringGeometry args={[0.18,0.22,24]} /><meshBasicMaterial color="#d9d7ac" /></mesh></group>
  </group>;
}
