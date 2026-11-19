import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, Globe2, Leaf, MapPin, Navigation, Search, Sun, X } from 'lucide-react';
import { johto, getLocation, type Location } from './data/regions';
import { explorerReducer } from './state/explorer';
import { LocationArtwork } from './components/LocationArtwork';
import { RegionMap } from './components/RegionMap';
import { SceneLoader } from './components/SceneLoader';
import { ExplorationHUD } from './components/ExplorationHUD';
import { useLocationAudio } from './audio/useLocationAudio';
import type { TouchMovement } from './scenes/shared/FirstPersonController';
export default function App() {
  const [state,dispatch]=useReducer(explorerReducer,{phase:'map'});
  const [selectedId,setSelectedId]=useState(johto.locations[0].id as Location['id']);
  const [hovered,setHovered]=useState<Location|null>(null);
  const [query,setQuery]=useState('');
  const serial=useRef(0);
  const returnRef=useRef<HTMLButtonElement>(null);
  const selected=getLocation(johto,selectedId)!;
  const shown=state.phase==='map'&&hovered?hovered:selected;
  const filtered=johto.locations.filter(l=>`${l.name} ${l.category}`.toLowerCase().includes(query.toLowerCase()));
  const sceneVisible = ['loading','entering','exploring','error'].includes(state.phase);
  const touchMovement = useRef<TouchMovement>({ forward: 0, right: 0 });
  const audio = useLocationAudio(state.phase === 'entering' || state.phase === 'exploring' ? selected : null);
  const select=useCallback((location: Location)=>{
    const playable = location.scene.availability === 'ready';
    if (playable) audio.unlock();
    setHovered(null); setSelectedId(location.id);
    dispatch({type:'SELECT',locationId:location.id,transitionId:++serial.current,playable});
  },[audio.unlock]);
  const transitionId = state.phase === 'map' ? -1 : state.transitionId;
  const sceneReady = useCallback(()=>dispatch({type:'SCENE_READY',transitionId}),[transitionId]);
  const sceneEntered = useCallback(()=>dispatch({type:'ENTERED',transitionId}),[transitionId]);
  const sceneError = useCallback(()=>dispatch({type:'FAILED',transitionId}),[transitionId]);
  useEffect(()=>{
    if(state.phase!=='loading') return;
    const timer=setTimeout(sceneError,25000);
    return ()=>clearTimeout(timer);
  },[state.phase,sceneError]);
  const settled=useCallback((id:number,returning:boolean)=>dispatch({type:returning?'RESTORED':'ARRIVED',transitionId:id}),[]);
  const returnToMap=useCallback(()=>{if(document.pointerLockElement)document.exitPointerLock();touchMovement.current={forward:0,right:0};dispatch({type:'RETURN',transitionId:++serial.current});},[]);
  const wasMap=useRef(true);
  useEffect(()=>{
    if(state.phase==='preview'||state.phase==='error')returnRef.current?.focus();
    if(state.phase==='map'&&!wasMap.current)document.getElementById(`location-${selectedId}`)?.focus();
    wasMap.current=state.phase==='map';
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&state.phase!=='map')returnToMap();};
    window.addEventListener('keydown',escape); return()=>window.removeEventListener('keydown',escape);
  },[state.phase,selectedId,returnToMap]);
  return <div className="app-shell">
    <header className="topbar"><a href="./" className="brand" aria-label="PokeEarth home"><span className="brand-mark"><Globe2 size={22}/></span>Poke<span>Earth</span><span className="beta">ATLAS / 01</span></a><div className="topbar-right"><span className="live-dot"/> A little closer to the world you love <span className="version">JOHTO EDITION</span></div></header>
    <main className="explorer" inert={sceneVisible} aria-hidden={sceneVisible}>
      <aside className="sidebar">
        <div className="region-selector"><Globe2 size={17}/><label htmlFor="region">REGION</label><select id="region" value="johto" aria-label="Select region" onChange={()=>{}}><option value="johto">Johto</option><option disabled>Kanto · planned</option><option disabled>Hoenn · planned</option><option disabled>Sinnoh · planned</option></select><ChevronDown size={16}/></div>
        <div className="intro"><div className="eyebrow">ANOTHER WAY TO EXPLORE</div><h1>A world of<br/><em>quiet wonders.</em></h1><p>{johto.description}</p></div>
        <label className="search"><Search size={17}/><input aria-label="Find a location" placeholder="Find your next destination" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={15}/></button>}</label>
        <div className="list-heading"><span>PLACES TO DISCOVER</span><span>0{filtered.length}</span></div>
        <nav className="location-list" aria-label="Johto destinations">
          {filtered.map((location,i)=><button id={`location-${location.id}`} key={location.id} disabled={state.phase!=='map'} className={`location-row ${selectedId===location.id?'selected':''}`} onClick={()=>select(location)} onMouseEnter={()=>setHovered(location)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(location)} onBlur={()=>setHovered(null)}><span className="location-number">0{i+1}</span><span><strong>{location.name}</strong><small>{location.category}</small></span><ArrowUpRight size={17}/></button>)}
          {!filtered.length&&<p className="empty">No places found. Try “park” or “town”.</p>}
        </nav>
        <div className="feature-card"><div className="artwork"><LocationArtwork location={shown}/><span className="artwork-badge"><Sun size={13}/>{shown.environment.timeOfDay.replace('-',' ')}</span></div><div className="feature-copy"><span className="eyebrow">{shown.category}</span><h2>{shown.name}</h2><p>{shown.tagline}</p><button className="primary-button" disabled={state.phase!=='map'} onClick={()=>select(shown)}>Explore location <ArrowUpRight size={16}/></button></div></div>
        <footer className="sidebar-footer"><Leaf size={14}/><span>An unofficial fan-made world atlas.</span></footer>
      </aside>
      <section className="map-area" aria-label="Region explorer">
        <RegionMap region={johto} state={state} selected={selected} onSelect={select} onHover={setHovered} onSettled={settled}/>
        {state.phase==='map'&&<div className="map-hint"><Navigation size={16}/><span>Pick a place. Get a little lost.</span><kbd>Drag to pan</kbd></div>}
        <div className="sr-only" role="status" aria-live="polite">{state.phase==='focusing'?`Flying to ${selected.name}`:state.phase==='preview'?`${selected.name} location preview. This location is available as a map preview.`:state.phase==='returning'?'Returning to Johto map':state.phase==='exploring'?'Exploring National Park':'Johto map ready'}</div>
        {state.phase==='focusing'&&<div className="travel-chip"><span className="live-dot"/>Approaching {selected.name}…</div>}
        {state.phase==='preview'&&<section className="destination-panel" aria-labelledby="destination-title"><button ref={returnRef} className="back-button" onClick={returnToMap}><ArrowLeft size={16}/>Return to region map <kbd>Esc</kbd></button><div className="destination-body"><span className="eyebrow"><MapPin size={13}/> JOHTO / {selected.category.toUpperCase()}</span><h2 id="destination-title">{selected.name}</h2><p>{selected.description}</p><div className="landmarks">{selected.landmarks.map(l=><span key={l}>{l}</span>)}</div><div className="phase-note"><span className="live-dot"/>Location preview · This 3D destination is planned</div></div></section>}
      </section>
    </main>
    {sceneVisible&&<section className="scene-layer" data-phase={state.phase} aria-label="National Park exploration">
      {(state.phase==='loading'||state.phase==='entering'||state.phase==='exploring')&&<>
        <SceneLoader key={transitionId} location={selected} phase={state.phase} touchMovement={touchMovement} onReady={sceneReady} onEntered={sceneEntered} onError={sceneError}/>
        <ExplorationHUD active={state.phase==='exploring'} onReturn={returnToMap} audio={audio} touchMovement={touchMovement}/>
      </>}
      {state.phase==='error'&&<div className="scene-error" role="alert"><span className="eyebrow">LET’S FIND OUR WAY BACK</span><h2>The park couldn’t open.</h2><p>The 3D view needs WebGL. Try again, or return to the regional map.</p><button className="scene-button" onClick={()=>dispatch({type:'RETRY',transitionId:++serial.current})}>Retry 3D view</button><button ref={returnRef} className="scene-button" onClick={returnToMap}>Return to region map</button></div>}
    </section>}
  </div>;
}
