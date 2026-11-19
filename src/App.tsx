import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, Globe2, Leaf, MapPin, Navigation, Search, Sun, X } from 'lucide-react';
import { johto, getLocation, type Location } from './data/regions';
import { explorerReducer } from './state/explorer';
import { LocationArtwork } from './components/LocationArtwork';
import { RegionMap } from './components/RegionMap';
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
  const select=useCallback((location: Location)=>{setHovered(null);setSelectedId(location.id);dispatch({type:'SELECT',locationId:location.id,transitionId:++serial.current});},[]);
  const settled=useCallback((id:number,returning:boolean)=>dispatch({type:returning?'RESTORED':'ARRIVED',transitionId:id}),[]);
  const returnToMap=useCallback(()=>dispatch({type:'RETURN',transitionId:++serial.current}),[]);
  const wasMap=useRef(true);
  useEffect(()=>{
    if(state.phase==='preview')returnRef.current?.focus();
    if(state.phase==='map'&&!wasMap.current)document.getElementById(`location-${selectedId}`)?.focus();
    wasMap.current=state.phase==='map';
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&state.phase!=='map')returnToMap();};
    window.addEventListener('keydown',escape); return()=>window.removeEventListener('keydown',escape);
  },[state.phase,selectedId,returnToMap]);
  return <div className="app-shell">
    <header className="topbar"><a href="./" className="brand" aria-label="PokeEarth home"><span className="brand-mark"><Globe2 size={22}/></span>Poke<span>Earth</span><span className="beta">ATLAS / 01</span></a><div className="topbar-right"><span className="live-dot"/> A little closer to the world you love <span className="version">JOHTO EDITION</span></div></header>
    <main className="explorer">
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
        <div className="sr-only" role="status" aria-live="polite">{state.phase==='focusing'?`Flying to ${selected.name}`:state.phase==='preview'?`${selected.name} location preview. First-person exploration is planned for phase two.`:state.phase==='returning'?'Returning to Johto map':'Johto map ready'}</div>
        {state.phase==='focusing'&&<div className="travel-chip"><span className="live-dot"/>Approaching {selected.name}…</div>}
        {state.phase==='preview'&&<section className="destination-panel" aria-labelledby="destination-title"><button ref={returnRef} className="back-button" onClick={returnToMap}><ArrowLeft size={16}/>Return to region map <kbd>Esc</kbd></button><div className="destination-body"><span className="eyebrow"><MapPin size={13}/> JOHTO / {selected.category.toUpperCase()}</span><h2 id="destination-title">{selected.name}</h2><p>{selected.description}</p><div className="landmarks">{selected.landmarks.map(l=><span key={l}>{l}</span>)}</div><div className="phase-note"><span className="live-dot"/>Location preview · First-person exploration arrives in phase 2</div></div></section>}
      </section>
    </main>
  </div>;
}
