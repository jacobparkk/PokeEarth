import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { explorerReducer, type ExplorerState } from './explorer.ts';
import { johto } from '../data/regions.ts';

describe('exploration transitions', () => {
  it('ignores stale arrivals after changing destination', () => {
    let state: ExplorerState = { phase: 'map' };
    state = explorerReducer(state, { type: 'SELECT', locationId: 'national-park', transitionId: 1 });
    state = explorerReducer(state, { type: 'SELECT', locationId: 'ecruteak-city', transitionId: 2 });
    state = explorerReducer(state, { type: 'ARRIVED', transitionId: 1 });
    assert.deepEqual(state, { phase: 'focusing', locationId: 'ecruteak-city', transitionId: 2, playable: false });
    assert.equal(explorerReducer(state, { type: 'ARRIVED', transitionId: 2 }).phase, 'preview');
  });

  it('cancels a flight and rejects its late completion', () => {
    let state: ExplorerState = { phase: 'map' };
    state = explorerReducer(state, { type: 'SELECT', locationId: 'national-park', transitionId: 1 });
    state = explorerReducer(state, { type: 'RETURN', transitionId: 2 });
    assert.deepEqual(explorerReducer(state, { type: 'ARRIVED', transitionId: 1 }), state);
    assert.deepEqual(explorerReducer(state, { type: 'RESTORED', transitionId: 1 }), state);
    assert.deepEqual(explorerReducer(state, { type: 'RESTORED', transitionId: 2 }), { phase: 'map' });
  });

  it('returns from a preview and permits another destination', () => {
    let state: ExplorerState = { phase: 'map' };
    state = explorerReducer(state, { type: 'SELECT', locationId: 'new-bark-town', transitionId: 1 });
    state = explorerReducer(state, { type: 'ARRIVED', transitionId: 1 });
    assert.equal(state.phase, 'preview');
    state = explorerReducer(state, { type: 'RETURN', transitionId: 2 });
    state = explorerReducer(state, { type: 'RESTORED', transitionId: 2 });
    state = explorerReducer(state, { type: 'SELECT', locationId: 'national-park', transitionId: 3 });
    assert.deepEqual(state, { phase: 'focusing', locationId: 'national-park', transitionId: 3, playable: false });
  });
});

describe('region data contract', () => {
  it('has unique, bounded pins and valid spawns', () => {
    assert.equal(new Set(johto.locations.map(location => location.id)).size, johto.locations.length);
    for (const location of johto.locations) {
      assert.ok(location.map.x >= 0 && location.map.x <= johto.map.width);
      assert.ok(location.map.y >= 0 && location.map.y <= johto.map.height);
      location.camera.player.position.forEach((coordinate, axis) => {
        assert.ok(coordinate >= location.scene.bounds.min[axis]);
        assert.ok(coordinate <= location.scene.bounds.max[axis]);
      });
      assert.equal(location.camera.player.position[1], location.camera.player.eyeHeight);
      assert.ok(location.environment.fog.far > location.environment.fog.near);
      assert.equal(location.scene.id, location.id);
      assert.equal(location.audio.music.src, null);
      assert.ok(location.audio.crossfadeMs > 0);
      for (const layer of [location.audio.music, ...location.audio.ambience]) {
        assert.ok(layer.volume >= 0 && layer.volume <= 1);
      }
    }
  });
});


describe('first-person lifecycle', () => {
  it('waits for both map arrival and scene readiness before enabling exploration', () => {
    let state: ExplorerState = explorerReducer({ phase: 'map' }, { type: 'SELECT', locationId: 'national-park', transitionId: 1, playable: true });
    assert.equal(explorerReducer(state, { type: 'SCENE_READY', transitionId: 1 }).phase, 'focusing');
    state = explorerReducer(state, { type: 'ARRIVED', transitionId: 1 });
    assert.equal(state.phase, 'loading');
    assert.equal(explorerReducer(state, { type: 'ENTERED', transitionId: 1 }).phase, 'loading');
    state = explorerReducer(state, { type: 'SCENE_READY', transitionId: 1 });
    assert.equal(state.phase, 'entering');
    state = explorerReducer(state, { type: 'ENTERED', transitionId: 1 });
    assert.equal(state.phase, 'exploring');
  });
  it('recovers from failure and rejects ready signals from an earlier attempt', () => {
    let state: ExplorerState = explorerReducer({ phase: 'map' }, { type: 'SELECT', locationId: 'national-park', transitionId: 1, playable: true });
    state = explorerReducer(state, { type: 'ARRIVED', transitionId: 1 });
    state = explorerReducer(state, { type: 'FAILED', transitionId: 1 });
    assert.equal(state.phase, 'error');
    state = explorerReducer(state, { type: 'RETRY', transitionId: 2 });
    assert.equal(state.phase, 'loading');
    state = explorerReducer(state, { type: 'SCENE_READY', transitionId: 1 });
    assert.equal(state.phase, 'loading');
    state = explorerReducer(state, { type: 'RETURN', transitionId: 3 });
    state = explorerReducer(state, { type: 'SCENE_READY', transitionId: 2 });
    assert.equal(state.phase, 'returning');
    assert.equal(explorerReducer(state, { type: 'RESTORED', transitionId: 3 }).phase, 'map');
  });
});
