import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBlocked, movementVector, moveWithCollisions, seededRandom, smoothstep } from './movement.ts';
import { createParkLayout } from '../national-park/layout.ts';
import { johto } from '../../data/regions.ts';
const bounds = { minX: -38, maxX: 38, minZ: -38, maxZ: 38 };
describe('movement and collision', () => {
  it('uses equal speed diagonally and faces the camera direction', () => {
    const straight = movementVector(1,0,0,4.2,0.016);
    const diagonal = movementVector(1,1,0,4.2,0.016);
    assert.ok(Math.abs(Math.hypot(straight.x,straight.z)-Math.hypot(diagonal.x,diagonal.z))<1e-10);
    assert.ok(straight.z<0); assert.equal(straight.x,0);
    const turned = movementVector(1,0,Math.PI/2,4.2,0.016);
    assert.ok(turned.x<0); assert.ok(Math.abs(turned.z)<1e-10);
    assert.ok(Math.hypot(...Object.values(movementVector(1,0,0,4.2,10)))<=0.211);
  });
  it('prevents tunnelling through the fountain and respects the park boundary', () => {
    const layout = createParkLayout(johto.locations[0]);
    const next = moveWithCollisions({ x:0,z:26 },{ x:0,z:-40 },layout.colliders,bounds);
    assert.ok(next.z>=layout.fountainRadius+0.4+0.38);
    const edge = moveWithCollisions({ x:37,z:0 },{ x:10,z:0 },[],bounds);
    assert.equal(edge.x,37.62);
  });
  it('allows sliding past a bench without crossing it', () => {
    const collider = [{ kind:'box' as const,x:0,z:0,halfWidth:2,halfDepth:1 }];
    const result = moveWithCollisions({ x:0,z:1.5 },{ x:1,z:-1 },collider,bounds);
    assert.ok(result.x>0.9); assert.ok(result.z>=1.38);
    assert.equal(isBlocked(result,collider),false);
  });
  it('keeps the spawn clear and procedural layouts deterministic', () => {
    const location = johto.locations[0];
    const a = createParkLayout(location), b = createParkLayout(location);
    assert.deepEqual(a,b);
    assert.equal(isBlocked({ x:location.camera.player.position[0],z:location.camera.player.position[2] },a.colliders),false);
    const random = seededRandom(235); const values = Array.from({length:20},random);
    assert.ok(values.every(v=>v>=0&&v<1)); assert.ok(new Set(values).size>15);
  });
  it('clamps cinematic easing to valid endpoints', () => {
    assert.equal(smoothstep(-1),0); assert.equal(smoothstep(0),0); assert.equal(smoothstep(1),1); assert.equal(smoothstep(2),1); assert.equal(smoothstep(0.5),0.5);
  });
});
