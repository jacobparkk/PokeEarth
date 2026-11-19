import { useEffect, useRef, useState } from 'react';
import { Compass, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Location, Region } from '../data/regions';
import type { ExplorerState } from '../state/explorer';
import { MapArtwork } from './MapArtwork';
interface Props { region: Region; state: ExplorerState; selected: Location; onSelect: (location: Location) => void; onHover: (location: Location | null) => void; onSettled: (id: number, returning: boolean) => void }
type Camera = { x: number; y: number; scale: number };
export function RegionMap({ region, state, selected, onSelect, onHover, onSettled }: Props) {
  const initial = region.map.camera;
  const [camera, setCamera] = useState<Camera>(initial);
  const cameraRef = useRef(camera);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; camera: Camera; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const free = state.phase === 'map';
  useEffect(() => {
    if (state.phase !== 'focusing' && state.phase !== 'returning') return;
    const returning = state.phase === 'returning';
    const target = returning ? initial : { x: selected.map.x, y: selected.map.y, scale: selected.map.focusScale };
    const start = { ...cameraRef.current };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 0 : 1150;
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min((now - began) / duration, 1);
      const ease = t * t * (3 - 2 * t);
      const next = { x: start.x + (target.x-start.x)*ease, y: start.y + (target.y-start.y)*ease, scale: start.scale + (target.scale-start.scale)*ease };
      cameraRef.current = next; setCamera(next);
      if (t < 1) frame = requestAnimationFrame(tick); else onSettled(state.transitionId, returning);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, selected, initial, onSettled]);
  function update(next: Camera) { cameraRef.current = next; setCamera(next); }
  function zoom(amount: number) { if (free) update({ ...cameraRef.current, scale: Math.max(0.85, Math.min(3, cameraRef.current.scale * amount)) }); }
  const w = region.map.width / camera.scale, h = region.map.height / camera.scale;
  return <div className={`map-surface ${free ? '' : 'is-focused'}`}>
    <svg ref={svgRef} className="region-map" viewBox={`${camera.x-w/2} ${camera.y-h/2} ${w} ${h}`} aria-label="Interactive map of Johto" role="group"
      onPointerDown={e=> { suppressClick.current=false; if (!free || e.button !== 0 || (e.target as Element).closest('[data-pin]')) return; drag.current = { x:e.clientX,y:e.clientY,camera:{...cameraRef.current},moved:false }; suppressClick.current=false; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e=> { const d=drag.current; if(!d || !free || !svgRef.current)return; const rect=svgRef.current.getBoundingClientRect(); const factor=Math.max(w/rect.width,h/rect.height); const dx=e.clientX-d.x,dy=e.clientY-d.y; if(Math.hypot(dx,dy)>4)d.moved=true; update({...d.camera,x:Math.max(0,Math.min(region.map.width,d.camera.x-dx*factor)),y:Math.max(0,Math.min(region.map.height,d.camera.y-dy*factor))}); }}
      onPointerUp={()=>{suppressClick.current=drag.current?.moved??false;drag.current=null;}}
      onPointerCancel={()=>{drag.current=null;}}>
      <MapArtwork region={region}/>
      {region.locations.map(location=> { const active=selected.id===location.id; const [lx,ly]=location.map.labelOffset; return <g key={location.id} data-pin="true" role="button" tabIndex={free?0:-1} aria-label={`Preview ${location.name}`} aria-pressed={active} className={`map-pin ${active?'active':''}`} transform={`translate(${location.map.x} ${location.map.y})`} onPointerEnter={()=>free&&onHover(location)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(location)} onBlur={()=>onHover(null)} onClick={()=>{if(free&&!suppressClick.current)onSelect(location);}} onKeyDown={e=>{if(free&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(location);}}}>
        <circle className="pin-halo" r="25"/><circle r="14" className="pin-body"/><circle r="5" className="pin-center"/>
        <text x={lx} y={ly} textAnchor={lx<0?'end':'start'} className="pin-label">{location.name}</text>
      </g>; })}
    </svg>
    <div className="map-heading"><span className="eyebrow">THE {region.name.toUpperCase()} ATLAS</span><span>A familiar world, rediscovered</span></div>
    <div className="map-compass" aria-hidden="true"><span>N</span><Compass size={32} strokeWidth={1}/></div>
    <div className="map-controls"><button aria-label="Zoom in" disabled={!free||camera.scale>=3} onClick={()=>zoom(1.25)}><Plus size={18}/></button><button aria-label="Zoom out" disabled={!free||camera.scale<=.85} onClick={()=>zoom(.8)}><Minus size={18}/></button><button aria-label="Reset map view" disabled={!free} onClick={()=>update(initial)}><RotateCcw size={16}/></button></div>
    <div className="map-legend"><i/> Places to discover <span>—</span> Regional routes</div>
    <div className="map-caption">Illustrated regional map · Not to scale</div>
  </div>;
}
