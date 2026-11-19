import type { Region } from '../data/regions';
const land = 'M120 100Q230 50 340 97L480 65 620 100 750 60 875 80 1040 110Q1110 130 1100 230L1135 345 1080 470 1095 575 1010 655 890 685 830 745 665 759 570 715 470 670 445 565 363 520 330 437 260 405 215 315 140 280 100 190Z';
export function MapArtwork({ region }: { region: Region }) {
  return <g aria-hidden="true">
    <defs>
      <linearGradient id="sea" x2="1" y2="1"><stop stopColor="#a2c8c1"/><stop offset="1" stopColor="#6caba9"/></linearGradient>
      <linearGradient id="land" x2=".6" y2="1"><stop stopColor="#c6ce9a"/><stop offset="1" stopColor="#e0d9a6"/></linearGradient>
      <pattern id="sea-grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#e9f3d7" strokeOpacity=".14"/></pattern>
      <pattern id="forest" width="33" height="29" patternUnits="userSpaceOnUse"><path d="M7 24L14 8 22 24Z" fill="#537c61" opacity=".35"/><path d="M22 12L27 0 32 12Z" fill="#74916a" opacity=".5"/></pattern>
      <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#285d50" floodOpacity=".22"/></filter>
      <clipPath id="land-clip"><path d={land}/></clipPath>
    </defs>
    <rect x="-3000" y="-3000" width="7200" height="6860" fill="url(#sea)"/>
    <rect x="-3000" y="-3000" width="7200" height="6860" fill="url(#sea-grid)"/>
    <path d={land} fill="none" stroke="#d5e2b6" strokeWidth="32" opacity=".22"/>
    <path d={land} fill="url(#land)" stroke="#e5e1b4" strokeWidth="9" filter="url(#shadow)"/>
    <g clipPath="url(#land-clip)">
      <path d="M70 150Q300 10 508 175T1100 130L1110 360Q900 250 790 345T470 370Q260 270 70 340Z" fill="#8ea57a" opacity=".6"/>
      <path d="M110 160Q280 65 470 176T1070 160M140 190Q300 100 460 210T1060 200M170 220Q300 135 450 245T1050 235" fill="none" stroke="#e4dfaf" strokeWidth="2" opacity=".45"/>
      <path d="M420 150L570 170 540 300 425 380 310 340 245 225ZM600 460L708 460 723 650 660 700 580 620ZM900 320L1060 305 1040 510 950 490Z" fill="url(#forest)"/>
      {[[215,170,60],[310,153,78],[415,128,53],[677,161,67],[966,157,85],[1040,218,57]].map(([x,y,s],i)=><g key={i}><path d={`M${x-s} ${y+s*.6}L${x} ${y-s}L${x+s} ${y+s*.6}Z`} fill="#7c9472"/><path d={`M${x} ${y-s}L${x+s} ${y+s*.6}L${x+7} ${y+s*.2}Z`} fill="#657e68"/><path d={`M${x-16} ${y-s+26}L${x} ${y-s}L${x+19} ${y-s+30}L${x+2} ${y-s+22}Z`} fill="#d9dbb7"/></g>)}
      <path d="M788 121Q815 102 853 120L867 149 843 175 810 179 785 155Z" fill="#79b1aa" stroke="#d4d9a4" strokeWidth="7"/>
      <path d="M895 360Q860 420 887 480T932 610" fill="none" stroke="#8ebbb0" strokeWidth="12"/>
      {region.routes.map(route=><polyline key={route.id} points={route.points.map(p=>p.join(',')).join(' ')} fill="none" stroke="#f3e6b7" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round"/>)}
      {region.routes.map(route=><polyline key={route.id} points={route.points.map(p=>p.join(',')).join(' ')} fill="none" stroke="#b2a675" strokeWidth="1.5" strokeDasharray="3 7"/>)}
    </g>
    <path d="M149 555Q181 533 208 568L219 648 192 696 144 684 126 631Z" fill="url(#land)" stroke="#e2dfb1" strokeWidth="6"/>
    <g transform="translate(548 388)"><ellipse rx="36" ry="29" fill="#6f9368"/><ellipse rx="24" ry="19" fill="none" stroke="#e8dbaf" strokeWidth="5"/><circle r="6" fill="#a9cfcc" stroke="#f1e7bc" strokeWidth="3"/></g>
    <g transform="translate(603 252)">{[0,1,2].map(i=><g key={i} transform={`translate(0 ${-i*12})`}><rect x="-9" width="18" height="12" fill="#7a624a"/><path d="M-17 0L0 -9 17 0Z" fill="#4a6759"/></g>)}</g>
    {region.towns.map(town=><g key={town.name} transform={`translate(${town.x} ${town.y})`}><rect x="-8" y="-7" width="16" height="14" rx="4" fill="#eee3bf" stroke="#7e8e6d" strokeWidth="2"/><text y="29" textAnchor="middle" className="town-label">{town.name}</text></g>)}
    <text x="370" y="182" className="terrain-label" transform="rotate(-12 370 182)">THE NORTHERN HIGHLANDS</text>
    <text x="221" y="766" className="ocean-label">S E A  O F  J O H T O</text>
    <text x="1045" y="720" className="terrain-label" textAnchor="middle">TOWARD KANTO →</text>
    <g fill="none" stroke="#e5efcf" opacity=".55">{[0,1,2].map(i=><path key={i} d={`M70 ${430+i*10}q15 -8 30 0t30 0M360 ${740+i*10}q15 -8 30 0t30 0`}/>)}</g>
  </g>;
}
