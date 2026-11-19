"use client";

import { memo, useMemo } from "react";
import { buildTerrain } from "@/lib/terrain";
import type { Biome, RegionDefinition } from "@/types/world";

interface RegionTerrainProps {
  region: RegionDefinition;
}

const LABEL_SIZE = { sm: 8, md: 13, lg: 18 } as const;

const BIOME_FILL: Record<Biome["kind"], { color: string; opacity: number }> = {
  snow: { color: "#eef3f5", opacity: 0.92 },
  desert: { color: "#e3c98d", opacity: 0.9 },
  ash: { color: "#aaa398", opacity: 0.6 },
  marsh: { color: "#5f7d55", opacity: 0.65 },
  beach: { color: "#efdfae", opacity: 0.9 },
  meadow: { color: "#cfe09a", opacity: 0.55 },
};

/**
 * Static, procedurally-decorated region map in map-space units.
 * Rendered once and memoised; the parent only changes the wrapping <g> transform
 * when the camera moves, so panning/zooming never re-renders these nodes.
 *
 * Swap-in point for custom art: replace the <g id="terrain-art"> block with an
 * <image href="/maps/johto.webp" width={size.width} height={size.height} />
 * painted at the same 1000×640 scale and all pins/routes still line up.
 */
export const RegionTerrain = memo(function RegionTerrain({ region }: RegionTerrainProps) {
  const t = region.theme;
  const { width, height } = region.geography.size;
  const features = useMemo(() => buildTerrain(region), [region]);
  const ids = useMemo(() => {
    const p = `terrain-${region.id}`;
    return { sea: `${p}-sea`, waves: `${p}-waves`, land: `${p}-land`, landClip: `${p}-landclip` };
  }, [region.id]);

  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id={ids.sea} gradientUnits="userSpaceOnUse" cx={width / 2} cy={height * 0.45} r={width * 0.75}>
          <stop offset="0%" stopColor={t.seaShallow} stopOpacity={0.55} />
          <stop offset="100%" stopColor={t.seaDeep} stopOpacity={0} />
        </radialGradient>
        <pattern id={ids.waves} width="26" height="14" patternUnits="userSpaceOnUse">
          <path d="M1 9 q 4 -4 8 0 t 8 0" fill="none" stroke="#ffffff" strokeOpacity={0.09} strokeWidth={0.9} />
        </pattern>
        <linearGradient id={ids.land} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={t.land} />
          <stop offset="100%" stopColor={t.landShade} />
        </linearGradient>
        <clipPath id={ids.landClip}>
          {features.landPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
      </defs>

      {/* Sea — oversized so the edges never show during a tilted dive. */}
      <rect x={-width} y={-height} width={width * 3} height={height * 3} fill={t.seaDeep} />
      <rect x={-width} y={-height} width={width * 3} height={height * 3} fill={`url(#${ids.sea})`} />
      <rect x={-width} y={-height} width={width * 3} height={height * 3} fill={`url(#${ids.waves})`} />

      <g id="terrain-art">
        {/* Shallows halo, beach rim, then land fill. */}
        {features.landPaths.map((d, i) => (
          <path key={`sh-${i}`} d={d} fill="none" stroke={t.seaShallow} strokeOpacity={0.45} strokeWidth={24} strokeLinejoin="round" />
        ))}
        {features.landPaths.map((d, i) => (
          <path key={`sh2-${i}`} d={d} fill="none" stroke={t.seaShallow} strokeOpacity={0.5} strokeWidth={10} strokeLinejoin="round" />
        ))}
        {features.landPaths.map((d, i) => (
          <path key={`sand-${i}`} d={d} fill="none" stroke={t.sand} strokeWidth={5} strokeLinejoin="round" />
        ))}
        {features.landPaths.map((d, i) => (
          <path key={`land-${i}`} d={d} fill={`url(#${ids.land})`} />
        ))}

        {/* Meadow tint, clipped to land. */}
        <g clipPath={`url(#${ids.landClip})`}>
          {features.meadows.map((m, i) => (
            <ellipse
              key={i}
              cx={m.x}
              cy={m.y}
              rx={m.rx}
              ry={m.ry}
              transform={`rotate(${m.rotation} ${m.x} ${m.y})`}
              fill={i % 3 === 0 ? t.sand : t.landShade}
              opacity={m.opacity}
            />
          ))}
        </g>

        {/* Biomes (soft-edged: a wide translucent stroke feathers the boundary) */}
        <g clipPath={`url(#${ids.landClip})`}>
          {features.biomePaths.map((b) => {
            const f = BIOME_FILL[b.kind];
            return (
              <g key={b.id}>
                <path d={b.d} fill="none" stroke={f.color} strokeOpacity={f.opacity * 0.35} strokeWidth={14} strokeLinejoin="round" />
                <path d={b.d} fill={f.color} fillOpacity={f.opacity} stroke={f.color} strokeOpacity={f.opacity * 0.6} strokeWidth={5} strokeLinejoin="round" />
              </g>
            );
          })}
        </g>

        {/* Lakes */}
        {features.waterPaths.map((w) => (
          <g key={w.id}>
            <path d={w.d} fill={t.seaShallow} stroke={t.sand} strokeWidth={2.5} />
            <path d={w.d} fill={`url(#${ids.waves})`} />
          </g>
        ))}

        {/* Routes (constant on-screen width at any zoom) */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {features.routePaths.map((r) =>
            r.kind === "land" ? (
              <g key={r.id}>
                <path d={r.d} stroke={t.routeEdge} strokeWidth={5.5} vectorEffect="non-scaling-stroke" />
                <path d={r.d} stroke={t.route} strokeWidth={3} vectorEffect="non-scaling-stroke" />
              </g>
            ) : r.kind === "water" ? (
              <path key={r.id} d={r.d} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={1.8} strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            ) : (
              <path key={r.id} d={r.d} stroke={t.rockShade} strokeWidth={3} strokeDasharray="0.5 6" vectorEffect="non-scaling-stroke" />
            ),
          )}
        </g>

        {/* Mountains: ground shadow, lit face, shaded face, snow cap */}
        <g>
          {features.peaks.map((p, i) => {
            const sx = p.x + p.lean;
            const sy = p.y - p.h;
            const left = `${p.x - p.w},${p.y}`;
            const right = `${p.x + p.w},${p.y}`;
            const summit = `${sx},${sy}`;
            const base = `${p.x + p.lean * 0.4},${p.y}`;
            const capT = 0.34;
            const capL = `${sx + (p.x - p.w - sx) * capT},${sy + p.h * capT}`;
            const capR = `${sx + (p.x + p.w - sx) * capT},${sy + p.h * capT}`;
            const capMid = `${sx + (p.x + p.lean * 0.4 - sx) * capT * 1.15},${sy + p.h * capT * 0.8}`;
            return (
              <g key={i}>
                <ellipse cx={p.x + 3} cy={p.y + 1} rx={p.w * 1.05} ry={p.w * 0.28} fill="#000" opacity={0.16} />
                <polygon points={`${left} ${summit} ${base}`} fill={t.rock} />
                <polygon points={`${base} ${summit} ${right}`} fill={t.rockShade} />
                {p.snow && <polygon points={`${capL} ${summit} ${capR} ${capMid}`} fill="#f6f4ee" />}
              </g>
            );
          })}
        </g>

        {/* Trees: shadow, canopy, highlight */}
        <g>
          {features.trees.map((tr, i) => (
            <g key={i}>
              <circle cx={tr.x + 0.9} cy={tr.y + 1.2} r={tr.r} fill={t.forestShade} opacity={0.75} />
              <circle cx={tr.x} cy={tr.y} r={tr.r} fill={tr.tone > 0.55 ? t.forest : t.forestShade} />
              <circle
                cx={tr.x - tr.r * 0.3}
                cy={tr.y - tr.r * 0.3}
                r={tr.r * (tr.snowy ? 0.62 : 0.45)}
                fill="#ffffff"
                opacity={tr.snowy ? 0.85 : 0.14}
              />
            </g>
          ))}
        </g>
      </g>

      {/* Geographic labels */}
      <g style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
        {region.geography.labels.map((l) => (
          <text
            key={l.text}
            x={l.position[0]}
            y={l.position[1]}
            textAnchor="middle"
            fontSize={LABEL_SIZE[l.size]}
            fontStyle={l.style === "water" ? "italic" : "normal"}
            letterSpacing={l.style === "water" ? 3 : 0.6}
            fill={l.style === "water" ? "#d6ecf4" : "#3e3626"}
            fillOpacity={l.style === "water" ? 0.75 : 0.85}
            stroke={l.style === "water" ? "none" : "#f5ecd0"}
            strokeWidth={l.style === "water" ? 0 : 2.2}
            strokeOpacity={0.7}
            paintOrder="stroke"
          >
            {l.text}
          </text>
        ))}
      </g>
    </g>
  );
});
