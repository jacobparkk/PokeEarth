import type { SceneId } from '../data/regions.ts';
export type ExplorerState = { phase: 'map' } | { phase: 'focusing' | 'preview' | 'returning'; locationId: SceneId; transitionId: number };
export type ExplorerEvent = { type: 'SELECT'; locationId: SceneId; transitionId: number } | { type: 'ARRIVED'; transitionId: number } | { type: 'RETURN'; transitionId: number } | { type: 'RESTORED'; transitionId: number };
export function explorerReducer(state: ExplorerState, event: ExplorerEvent): ExplorerState {
  switch (event.type) {
    case 'SELECT': return { phase: 'focusing', locationId: event.locationId, transitionId: event.transitionId };
    case 'ARRIVED': return state.phase === 'focusing' && state.transitionId === event.transitionId ? { ...state, phase: 'preview' } : state;
    case 'RETURN': return state.phase === 'map' ? state : { ...state, phase: 'returning', transitionId: event.transitionId };
    case 'RESTORED': return state.phase === 'returning' && state.transitionId === event.transitionId ? { phase: 'map' } : state;
  }
}
