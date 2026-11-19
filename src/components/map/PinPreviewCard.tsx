"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { isExplorable, type LocationDefinition, type TimeOfDay, type Vec2, type WeatherType } from "@/types/world";
import type { Viewport } from "@/lib/mapCamera";

interface PinPreviewCardProps {
  location: LocationDefinition;
  regionName: string;
  anchor: Vec2;
  viewport: Viewport;
  onDropIn: (location: LocationDefinition) => void;
  onFocus: (location: LocationDefinition) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

const CARD_WIDTH = 300;
const CARD_EST_HEIGHT = 330;
const GAP = 26;
const EDGE = 16;

const TIME_LABEL: Record<TimeOfDay, string> = {
  dawn: "Dawn",
  morning: "Morning",
  midday: "Midday",
  "golden-hour": "Golden hour",
  dusk: "Dusk",
  night: "Night",
};

const WEATHER_LABEL: Record<WeatherType, string> = {
  clear: "Clear skies",
  "partly-cloudy": "Partly cloudy",
  overcast: "Overcast",
  rain: "Rain",
  snow: "Snow",
  mist: "Mist",
};

const KIND_LABEL: Record<LocationDefinition["kind"], string> = {
  town: "Town",
  city: "City",
  landmark: "Landmark",
  dungeon: "Cave / Peak",
  water: "Waters",
};

/** Procedural header art painted from the location's palette — no image assets needed. */
function PreviewArt({ location }: { location: LocationDefinition }) {
  const [a, b, c] = location.preview.palette;
  const id = `pv-${location.id}`;
  const sunHigh = isExplorable(location) ? location.environment.sun.elevationDeg > 20 : false;
  return (
    <svg viewBox="0 0 300 120" className="block h-[120px] w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={b} />
          <stop offset="100%" stopColor={a} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="45%" stopColor="#fff1c4" stopOpacity={0.85} />
          <stop offset="100%" stopColor={a} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="300" height="120" fill={`url(#${id}-sky)`} />
      <circle cx="222" cy={sunHigh ? 34 : 70} r="48" fill={`url(#${id}-sun)`} />
      <path d="M0 86 C 50 62, 92 70, 140 80 S 236 60, 300 74 L300 120 L0 120Z" fill={c} opacity={0.55} />
      <path d="M0 98 C 60 84, 120 92, 170 98 S 260 86, 300 92 L300 120 L0 120Z" fill={c} opacity={0.85} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 14 + i * 34 + (i % 2) * 9;
        const h = 14 + ((i * 37) % 11);
        return (
          <g key={i}>
            <rect x={x - 1.2} y={104 - h * 0.4} width={2.4} height={h * 0.45} fill="#2a1f14" opacity={0.6} />
            <ellipse cx={x} cy={104 - h * 0.6} rx={h * 0.38} ry={h * 0.5} fill={c} style={{ filter: "brightness(0.7)" }} />
          </g>
        );
      })}
    </svg>
  );
}

export function PinPreviewCard({
  location,
  regionName,
  anchor,
  viewport,
  onDropIn,
  onFocus,
  onPointerEnter,
  onPointerLeave,
}: PinPreviewCardProps) {
  const placeRight = anchor[0] + GAP + CARD_WIDTH < viewport.width - EDGE;
  const left = placeRight ? anchor[0] + GAP : anchor[0] - GAP - CARD_WIDTH;
  const top = Math.min(Math.max(anchor[1] - 90, EDGE + 64), viewport.height - CARD_EST_HEIGHT - EDGE);
  const explorable = isExplorable(location);

  return (
    <motion.div
      data-map-ui
      role="dialog"
      aria-label={`${location.name} preview`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={{ opacity: 0, x: placeRight ? -10 : 10, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: placeRight ? -6 : 6, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="absolute z-40 overflow-hidden rounded-2xl border border-white/10 bg-ink/90 text-parchment shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md"
      style={{ left: Math.max(EDGE, left), top, width: CARD_WIDTH }}
    >
      <div className="relative">
        <PreviewArt location={location} />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/95 to-transparent" />
        <div className="absolute bottom-2 left-4 right-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold/90">
            {KIND_LABEL[location.kind]} · {regionName}
          </p>
          <h3 className="font-display text-[22px] leading-tight">{location.name}</h3>
        </div>
      </div>

      <div className="space-y-3 px-4 pt-2 pb-4">
        <p className="text-[13px] italic leading-snug text-parchment/80">{location.preview.tagline}</p>

        {explorable && (
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <Chip icon="☀">{TIME_LABEL[location.environment.timeOfDay]}</Chip>
            <Chip icon="☁">{WEATHER_LABEL[location.environment.weather.type]}</Chip>
            <Chip icon="♪">{location.audio.music.title}</Chip>
          </div>
        )}

        <ul className="space-y-1 text-[12.5px] text-parchment/85">
          {location.preview.highlights.slice(0, 4).map((h) => (
            <li key={h} className="flex items-start gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-gold" />
              {h}
            </li>
          ))}
        </ul>

        {explorable ? (
          <button
            type="button"
            onClick={() => onDropIn(location)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-[13.5px] font-semibold text-ink transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Drop in to street view
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-[12px] text-parchment/60">
              Street view in development
            </span>
            <button
              type="button"
              onClick={() => onFocus(location)}
              className="rounded-xl border border-gold/40 px-3 py-2 text-[12px] font-medium text-gold transition hover:bg-gold/10"
            >
              Fly closer
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Chip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-parchment/85">
      <span aria-hidden="true" className="text-gold/90">
        {icon}
      </span>
      {children}
    </span>
  );
}
