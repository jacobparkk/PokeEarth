import type { Location } from '../../data/regions.ts';
import { seededRandom, type Collider } from '../shared/movement.ts';
export function createParkLayout(location: Location) {
  const random = seededRandom(location.scene.seed);
  const fountain = location.scene.features.find(feature => feature.kind === 'fountain')!;
  const radius = fountain.size[0] / 2;
  const trees = Array.from({ length: 124 }, (_, i) => {
    const angle = i / 124 * Math.PI * 2;
    const distance = 41 + random() * 12;
    return { x: Math.sin(angle) * distance, z: Math.cos(angle) * distance, height: 7 + random() * 6, width: 2.1 + random() * 1.3, rotation: random() * Math.PI };
  });
  const benches = [-1, 1].flatMap(side => [-9, 9].map(z => ({ x: side * 25, z, rotation: side * Math.PI / 2 })));
  const colliders: Collider[] = [
    { kind: 'circle', x: fountain.position[0], z: fountain.position[2], radius: radius + 0.4 },
    ...benches.map(bench => ({ kind: 'box' as const, x: bench.x, z: bench.z, halfWidth: 0.7, halfDepth: 2.0 })),
    ...trees.map(tree => ({ kind: 'circle' as const, x: tree.x, z: tree.z, radius: 0.55 })),
    { kind: 'box', x: -5.1, z: 33, halfWidth: 0.6, halfDepth: 0.6 },
    { kind: 'box', x: 5.1, z: 33, halfWidth: 0.6, halfDepth: 0.6 },
    { kind: 'box', x: -7, z: 27, halfWidth: 1.2, halfDepth: 0.3 },
  ];
  return { trees, benches, colliders, fountainRadius: radius };
}
export type ParkLayout = ReturnType<typeof createParkLayout>;
