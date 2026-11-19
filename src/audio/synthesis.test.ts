import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeSound, type GeneratedSound } from './synthesis.ts';
describe('self-contained soundscape', () => {
  for (const kind of ['park-score','wind','water'] as GeneratedSound[]) {
    it(`${kind} produces finite, non-clipping audio with quiet loop seams`, () => {
      const samples=synthesizeSound(kind,8000);
      let peak=0,total=0;
      for(const value of samples) { assert.ok(Number.isFinite(value)); peak=Math.max(peak,Math.abs(value)); total+=value*value; }
      assert.ok(peak>0.01&&peak<1);
      assert.ok(total/samples.length>0.00001);
      assert.equal(Math.abs(samples[0]),0); assert.ok(Math.abs(samples.at(-1)!)<0.0001);
      assert.deepEqual(samples.slice(0,200),synthesizeSound(kind,8000).slice(0,200));
    });
  }
});
