import type { SceneId } from '../data/regions.ts';

type DestinationState = {
  phase: 'focusing' | 'preview' | 'loading' | 'entering' | 'exploring' | 'error' | 'returning';
  locationId: SceneId;
  transitionId: number;
  playable: boolean;
};
export type ExplorerState = { phase: 'map' } | DestinationState;
export type ExplorerEvent =
  | { type: 'SELECT'; locationId: SceneId; transitionId: number; playable?: boolean }
  | { type: 'ARRIVED' | 'SCENE_READY' | 'ENTERED' | 'FAILED' | 'RETRY' | 'RETURN' | 'RESTORED'; transitionId: number };

export function explorerReducer(state: ExplorerState, event: ExplorerEvent): ExplorerState {
  if (event.type === 'SELECT') {
    return { phase: 'focusing', locationId: event.locationId, transitionId: event.transitionId, playable: event.playable ?? false };
  }
  if (state.phase === 'map') return state;
  if (event.type === 'RETURN') return { ...state, phase: 'returning', transitionId: event.transitionId };
  if (event.type === 'RETRY') return state.phase === 'error' ? { ...state, phase: 'loading', transitionId: event.transitionId } : state;
  if (state.transitionId !== event.transitionId) return state;
  switch (event.type) {
    case 'ARRIVED': return state.phase === 'focusing' ? { ...state, phase: state.playable ? 'loading' : 'preview' } : state;
    case 'SCENE_READY': return state.phase === 'loading' ? { ...state, phase: 'entering' } : state;
    case 'ENTERED': return state.phase === 'entering' ? { ...state, phase: 'exploring' } : state;
    case 'FAILED': return ['loading', 'entering', 'exploring'].includes(state.phase) ? { ...state, phase: 'error' } : state;
    case 'RESTORED': return state.phase === 'returning' ? { phase: 'map' } : state;
    default: return state;
  }
}
