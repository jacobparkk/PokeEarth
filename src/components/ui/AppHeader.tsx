"use client";

import { getLocation } from "@/data/regions";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { RegionDefinition } from "@/types/world";

/** Brand, breadcrumb and global audio preferences (shared by map + street modes). */
export function AppHeader({ region }: { region: RegionDefinition }) {
  const mode = useExplorerStore((s) => s.mode);
  const activeLocationId = useExplorerStore((s) => s.activeLocationId);
  const muted = useExplorerStore((s) => s.audio.muted);
  const volume = useExplorerStore((s) => s.audio.masterVolume);
  const toggleMute = useExplorerStore((s) => s.toggleMute);
  const setMasterVolume = useExplorerStore((s) => s.setMasterVolume);
  const exitToMap = useExplorerStore((s) => s.exitToMap);

  const location = activeLocationId ? getLocation(region.id, activeLocationId) : null;
  const inStreet = mode === "street" || mode === "exiting";

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 py-3">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-ink/80 py-1.5 pr-4 pl-1.5 shadow-lg backdrop-blur-md">
        <Globe />
        <span className="font-display text-[19px] tracking-wide text-parchment">
          Poke<span className="text-gold">Earth</span>
        </span>
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-[12.5px] text-parchment/65 sm:flex">
          <span className="text-parchment/30">/</span>
          {inStreet ? (
            <button type="button" onClick={exitToMap} className="transition hover:text-gold">
              {region.name}
            </button>
          ) : (
            <span className="text-parchment/90">{region.name}</span>
          )}
          {inStreet && location && (
            <>
              <span className="text-parchment/30">/</span>
              <span className="text-parchment/90">{location.name}</span>
            </>
          )}
        </nav>
      </div>

      <div className="group pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-ink/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
        <label className="flex items-center overflow-hidden transition-all duration-300 md:w-0 md:opacity-0 md:group-focus-within:w-28 md:group-focus-within:opacity-100 md:group-hover:w-28 md:group-hover:opacity-100">
          <span className="sr-only">Master volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="ml-2 w-24 accent-[var(--color-gold)]"
          />
        </label>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          className="flex h-8 w-8 items-center justify-center rounded-full text-parchment/85 transition hover:bg-white/10 hover:text-gold"
        >
          <SpeakerIcon muted={muted || volume === 0} />
        </button>
      </div>
    </header>
  );
}

function Globe() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id="pe-globe" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#7cc3dc" />
          <stop offset="100%" stopColor="#16425b" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#pe-globe)" />
      <path d="M8 12 q4 -5 9 -2 q3 2 6 0 q2 3 -1 6 q-4 2 -6 6 q-4 1 -6 -3 q-3 -3 -2 -7z" fill="#b7cf8a" />
      <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#f2c14e" strokeWidth="1.3" opacity="0.85" transform="rotate(-18 16 16)" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.25)" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}
