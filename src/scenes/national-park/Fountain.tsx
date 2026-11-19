import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, Color, ShaderMaterial } from 'three';
const vertex = `varying vec2 world; #include <fog_pars_vertex>
void main(){world=position.xy;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const fragment = `uniform float time;varying vec2 world;
#include <fog_pars_fragment>
void main(){float r=length(world);float wave=sin(r*9.-time*3.2)*.5+.5;float fleck=pow(max(0.,sin(world.x*12.+time)*cos(world.y*11.-time)),16.);vec3 color=mix(vec3(.18,.44,.42),vec3(.48,.72,.66),wave*.25+fleck*.55);gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`;
export function Fountain({ radius, fog }: { radius: number; fog: { color: string; near: number; far: number } }) {
  const water = useRef<ShaderMaterial>(null);
  const droplets = useRef<BufferAttribute>(null);
  const count = 240;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const uniforms = useMemo(() => ({ time: { value: 0 }, fogColor: { value: new Color(fog.color) }, fogNear: { value: fog.near }, fogFar: { value: fog.far } }), [fog]);
  useFrame(state => {
    const time = state.clock.elapsedTime;
    if (water.current) water.current.uniforms.time.value = time;
    for (let i = 0; i < count; i++) {
      const t = (i / count + time * 0.35) % 1;
      const angle = (i % 12) / 12 * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * t * 1.65;
      positions[i * 3 + 1] = 2.9 + 3.8 * t - 5.8 * t * t;
      positions[i * 3 + 2] = Math.sin(angle) * t * 1.65;
    }
    if (droplets.current) droplets.current.needsUpdate = true;
  });
  return <group>
    <mesh position={[0,0.1,0]} receiveShadow><cylinderGeometry args={[radius+0.45,radius+0.65,0.2,64]} /><meshStandardMaterial color="#b5ac8e" roughness={0.9} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.65,0]} castShadow receiveShadow><torusGeometry args={[radius,0.27,12,64]} /><meshStandardMaterial color="#d7ceb4" roughness={0.72} /></mesh>
    <mesh position={[0,0.35,0]} receiveShadow><cylinderGeometry args={[radius,radius,0.5,64]} /><meshStandardMaterial color="#a5b7a7" roughness={0.5} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.62,0]}><circleGeometry args={[radius-0.15,64]} /><shaderMaterial ref={water} vertexShader={vertex.replace(' #include','\n#include')} fragmentShader={fragment} uniforms={uniforms} fog /></mesh>
    <mesh position={[0,1.5,0]} castShadow><cylinderGeometry args={[0.22,0.5,2.1,16]} /><meshStandardMaterial color="#d8d1bb" roughness={0.7} /></mesh>
    <mesh position={[0,2.55,0]} castShadow><cylinderGeometry args={[1.15,0.6,0.3,32]} /><meshStandardMaterial color="#d8d1bb" roughness={0.7} /></mesh>
    <mesh position={[0,2.8,0]}><sphereGeometry args={[0.22,16,12]} /><meshStandardMaterial color="#e2dfc5" /></mesh>
    <points frustumCulled={false}><bufferGeometry><bufferAttribute ref={droplets} attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#e1fff0" size={0.065} transparent opacity={0.75} depthWrite={false} /></points>
  </group>;
}
