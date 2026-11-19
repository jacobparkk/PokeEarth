import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, InstancedMesh, Object3D, ShaderMaterial } from 'three';
import type { Location } from '../../data/regions';
import { seededRandom } from '../shared/movement';
import type { ParkLayout } from './layout';
export function Trees({ layout }: { layout: ParkLayout }) {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new Object3D(); const color = new Color();
    layout.trees.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.height * 0.28, tree.z); dummy.scale.set(0.45, tree.height * 0.56, 0.45); dummy.rotation.set(0, tree.rotation, 0); dummy.updateMatrix(); trunks.current!.setMatrixAt(index, dummy.matrix);
      for (let tier = 0; tier < 3; tier++) {
        dummy.position.set(tree.x, tree.height * (0.45 + tier * 0.17), tree.z); dummy.scale.set(tree.width * (1 - tier * 0.18), tree.height * 0.26, tree.width * (1 - tier * 0.18)); dummy.updateMatrix();
        crowns.current!.setMatrixAt(index * 3 + tier, dummy.matrix);
        color.setHSL(0.27 + (index % 7) * 0.008, 0.25 + (index % 3) * 0.04, 0.22 + tier * 0.04 + (index % 5) * 0.012); crowns.current!.setColorAt(index * 3 + tier, color);
      }
    });
    for (const mesh of [trunks.current!, crowns.current!]) { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; mesh.computeBoundingSphere(); }
  }, [layout]);
  return <>
    <instancedMesh ref={trunks} args={[undefined, undefined, layout.trees.length]} castShadow receiveShadow><cylinderGeometry args={[0.7, 1, 1, 7]} /><meshStandardMaterial color="#6c5942" roughness={1} /></instancedMesh>
    <instancedMesh ref={crowns} args={[undefined, undefined, layout.trees.length * 3]} castShadow receiveShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial roughness={0.9} /></instancedMesh>
  </>;
}
const grassVertex = `
  uniform float time;
  uniform float wind;
  varying float height;
  varying float shade;
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    height = p.y;
    vec4 root = instanceMatrix * vec4(0.,0.,0.,1.);
    p.x += sin(time * wind + root.x * .7 + root.z * .3) * p.y * p.y * .17;
    p.z += cos(time * wind * .7 + root.z) * p.y * p.y * .07;
    shade = fract(sin(root.x * 18.2 + root.z * 3.4) * 4213.2);
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p,1.);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const grassFragment = `
  varying float height;
  varying float shade;
  #include <fog_pars_fragment>
  void main() {
    vec3 root = vec3(.20,.30,.12);
    vec3 tip = mix(vec3(.48,.58,.24), vec3(.68,.65,.31), shade);
    gl_FragColor = vec4(mix(root,tip,height),1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;
export function Grass({ location }: { location: Location }) {
  const ref = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const patches = useMemo(() => location.scene.features.filter(feature => feature.kind === 'grass'), [location]);
  const count = patches.length * 1700;
  const uniforms = useMemo(() => ({ time: { value: 0 }, wind: { value: location.environment.weather.wind.speed + 0.6 }, fogColor: { value: new Color(location.environment.fog.color) }, fogNear: { value: location.environment.fog.near }, fogFar: { value: location.environment.fog.far } }), [location]);
  useLayoutEffect(() => {
    const random = seededRandom(location.scene.seed + 71); const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
      const patch = patches[i % patches.length];
      dummy.position.set(patch.position[0] + (random() - 0.5) * patch.size[0], 0.03, patch.position[2] + (random() - 0.5) * patch.size[2]);
      dummy.rotation.set(0, random() * Math.PI, 0); dummy.scale.set(0.16 + random() * 0.12, 0.45 + random() * 0.7, 1); dummy.updateMatrix(); ref.current!.setMatrixAt(i, dummy.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere();
  }, [location, patches, count]);
  useFrame((state) => { if (material.current) material.current.uniforms.time.value = state.clock.elapsedTime; });
  // The triangle's base is y=0 and tip y=1; wind never displaces its root.
  const vertices = useMemo(() => new Float32Array([-0.5,0,0, 0.5,0,0, 0,1,0]), []);
  return <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[vertices, 3]} /></bufferGeometry>
    <shaderMaterial ref={material} vertexShader={grassVertex} fragmentShader={grassFragment} uniforms={uniforms} side={DoubleSide} fog />
  </instancedMesh>;
}
