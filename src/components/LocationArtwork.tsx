import { useId } from 'react';
import type { Location } from '../data/regions';
export function LocationArtwork({ location }: { location: Location }) {
  const id = useId();
  const park = location.id === 'national-park';
  const city = location.id === 'ecruteak-city';
  return <svg viewBox="0 0 400 220" role="img" aria-label={`${location.name}, illustrated landscape`}>
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor={location.palette.sky}/><stop offset="1" stopColor="#faf0ca"/></linearGradient></defs>
    <rect width="400" height="220" fill={`url(#${id})`}/><circle cx="312" cy="52" r="24" fill="#fff3cc"/>
    <path d="M0 130L65 70 130 117 204 62 280 113 340 82 400 130V220H0Z" fill={location.palette.foliage} opacity=".25"/>
    <path d="M0 144Q100 108 210 141T400 124V220H0Z" fill={location.palette.ground}/>
    {Array.from({ length: 18 }, (_, i) => { const x = i * 25 - 10; const y = 126 + Math.sin(i * 4) * 12; return <g key={i}><rect x={x-2} y={y} width="4" height="29" fill="#655b43"/><ellipse cx={x} cy={y-5} rx="15" ry="24" fill={location.palette.foliage}/><ellipse cx={x-4} cy={y-10} rx="9" ry="17" fill="#d1d7a0" opacity=".23"/></g>; })}
    {park ? <><ellipse cx="200" cy="187" rx="123" ry="36" fill="none" stroke="#ede0b6" strokeWidth="18"/><path d="M187 220L194 173H206L218 220" fill="#ede0b6"/><ellipse cx="200" cy="176" rx="39" ry="14" fill="#738e87" stroke="#e7dec4" strokeWidth="7"/><rect x="196" y="144" width="8" height="29" fill="#e9dfc1"/><ellipse cx="200" cy="147" rx="20" ry="6" fill="#e9dfc1"/><path d="M183 158Q200 103 217 158M200 144V128" fill="none" stroke="#e7ffff" strokeWidth="2" opacity=".8"/></> : city ? <><path d="M174 220L202 146 222 146 258 220" fill="#d7c295"/>{[0,1,2,3].map(i=><g key={i} transform={`translate(209 ${140-i*25})`}><rect x={-25+i*4} y="0" width={50-i*8} height="24" fill="#816550"/><path d={`M${-42+i*6} 0 Q-10 -7 0 -19 Q10 -7 ${42-i*6} 0Z`} fill="#455a55"/><rect x="-4" y="7" width="8" height="12" fill="#e2b677"/></g>)}</> : <><path d="M312 148Q276 180 300 220H400V151Z" fill="#83b5b1"/>{[95,221].map((x,i)=><g key={x} transform={`translate(${x} ${157+i*20})`}><rect x="-32" y="-20" width="64" height="42" fill="#f3e3bc"/><path d="M-41 -20L0 -45 41 -20Z" fill="#a16f55"/><rect x="-9" y="-1" width="16" height="23" fill="#625e48"/><rect x="15" y="-10" width="12" height="12" fill="#99b8af"/></g>)}</>}
  </svg>;
}
