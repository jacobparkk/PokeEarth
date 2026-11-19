import { Component, Suspense, lazy, useMemo } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type SceneHost from '../scenes/SceneHost';
class LoadBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function SceneLoader(props: ComponentProps<typeof SceneHost>) {
  // Recreated on retry by the parent's transition key, including a fresh lazy promise.
  const LazyScene = useMemo(() => lazy(() => import('../scenes/SceneHost')), []);
  return <LoadBoundary onError={props.onError}><Suspense fallback={<div className="scene-loading" role="status">Preparing the park…</div>}><LazyScene {...props}/></Suspense></LoadBoundary>;
}
