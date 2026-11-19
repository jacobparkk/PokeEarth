import { useState } from 'react';
import type { MutableRefObject } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Volume2, VolumeX, MousePointer2, Sun, HelpCircle } from 'lucide-react';
import type { TouchMovement } from '../scenes/shared/FirstPersonController';
import type { useLocationAudio } from '../audio/useLocationAudio';
interface Props { active: boolean; onReturn: () => void; audio: ReturnType<typeof useLocationAudio>; touchMovement: MutableRefObject<TouchMovement> }
export function ExplorationHUD({ active, onReturn, audio, touchMovement }: Props) {
  const [help, setHelp] = useState(false);
  const [pointerMessage, setPointerMessage] = useState('');
  async function captureMouse() {
    try { const canvas = document.querySelector<HTMLCanvasElement>('.scene-layer canvas'); if (!canvas?.requestPointerLock) throw new Error('Unsupported'); await canvas.requestPointerLock(); setPointerMessage(''); }
    catch { setPointerMessage('Mouse capture unavailable. Drag the scene to look around.'); }
  }
  return <>
    <div className="scene-top"><button className="scene-button return-map" onClick={onReturn}><ArrowLeft size={16}/>Return to region map</button><div className="scene-location"><span className="eyebrow">JOHTO / NATURE RESERVE</span><strong>National Park</strong><span><Sun size={12}/> Golden hour</span></div><button className="scene-button help-button" aria-label="Show controls" aria-expanded={help} onClick={()=>setHelp(value=>!value)}><HelpCircle size={18}/></button></div>
    {active && <div className="crosshair" aria-hidden="true" />}
    {!active && <div className="scene-arriving" role="status"><span className="eyebrow">SLOW DOWN. LOOK AROUND.</span><h2>Welcome to National Park.</h2><p>Finding your feet…</p></div>}
    <div className="scene-bottom"><div className="scene-controls-copy"><strong>{active ? 'A moment away from everything.' : 'Descending into the park'}</strong><span>WASD / arrows to walk · Drag to look · Esc to return</span><button className="capture-button" disabled={!active} onClick={captureMouse}><MousePointer2 size={12}/> Capture mouse</button>{pointerMessage&&<small role="status">{pointerMessage}</small>}</div><div className="sound-controls"><button aria-label={audio.muted?'Unmute audio':'Mute audio'} onClick={audio.toggleMute}>{audio.muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><label><span>Soundscape</span><input aria-label="Sound volume" type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={event=>audio.setVolume(Number(event.target.value))}/></label><small>{audio.status}</small></div></div>
    {active && <div className="touch-pad" aria-label="Touch movement controls">{[
      { label:'Move forward', forward:1, right:0, icon:<ArrowUp size={20}/>, className:'up' },
      { label:'Move left', forward:0, right:-1, icon:<ArrowLeft size={20}/>, className:'left' },
      { label:'Move backward', forward:-1, right:0, icon:<ArrowDown size={20}/>, className:'down' },
      { label:'Move right', forward:0, right:1, icon:<ArrowRight size={20}/>, className:'right' },
    ].map(button=><button key={button.label} className={button.className} aria-label={button.label} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);touchMovement.current={forward:button.forward,right:button.right};}} onPointerUp={()=>{touchMovement.current={forward:0,right:0};}} onPointerCancel={()=>{touchMovement.current={forward:0,right:0};}} onLostPointerCapture={()=>{touchMovement.current={forward:0,right:0};}}>{button.icon}</button>)}</div>}
    {help&&<div className="controls-help" role="region" aria-label="Exploration controls"><strong>Make yourself at home.</strong><p>Walk with WASD or the arrow keys. Hold and drag the scene to look around. On touch screens, hold the direction buttons while dragging the scene with your other hand.</p><p>“Capture mouse” enables free mouse look. Escape returns to the atlas. If your browser consumes the first Escape to release the mouse, press it once more.</p><p>The fountain, benches, gateposts, trees, and park boundary block movement.</p><button className="scene-button" onClick={()=>setHelp(false)}>Got it</button></div>}
  </>;
}
