"use client";

import { useMemo, useState } from "react";
import { REGIONS, sortLocationsForList } from "@/data/regions";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { RegionDefinition } from "@/types/world";

interface RegionSidebarProps {
  region: RegionDefinition;
  visible: boolean;
}

/** Region switcher + location index. Hovering a row previews its pin on the map. */
export function RegionSidebar({ region, visible }: RegionSidebarProps) {
  const [open, setOpen] = useState(true);
  const hoveredLocationId = useExplorerStore((s) => s.hoveredLocationId);
  const setRegion = useExplorerStore((s) => s.setRegion);
  const setHovered = useExplorerStore((s) => s.setHovered);
  const enterLocation = useExplorerStore((s) => s.enterLocation);
  const requestFocus = useExplorerStore((s) => s.requestFocus);

  const locations = useMemo(() => sortLocationsForList(region.locations), [region.locations]);
  const explorableCount = locations.filter((l) => l.status === "explorable").length;

  return (
    <aside
      data-map-ui
      className="pointer-events-none absolute top-20 bottom-6 left-4 z-30 flex w-[300px] max-w-[calc(100vw-2rem)] flex-col transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, visibility: visible ? "visible" : "hidden" }}
      aria-label="Regions and locations"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="pointer-events-auto mb-2 self-start rounded-full border border-white/10 bg-ink/80 px-3 py-1.5 text-[12px] font-medium text-parchment/85 shadow-lg backdrop-blur-md transition hover:text-gold"
      >
        {open ? "◂ Hide index" : "▸ Locations"}
      </button>

      <div
        className={[
          "pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/80 text-parchment shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300",
          open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-4 opacity-0",
        ].join(" ")}
      >
        {/* Region tabs */}
        <div className="grid grid-cols-4 gap-1 border-b border-white/10 p-2" role="tablist" aria-label="Regions">
          {REGIONS.map((r) => {
            const selected = r.id === region.id;
            const locked = r.status === "locked";
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-disabled={locked}
                title={r.tagline}
                onClick={() => !locked && setRegion(r.id)}
                className={[
                  "rounded-lg px-1 py-1.5 text-center text-[12px] font-medium transition",
                  selected ? "bg-gold text-ink" : locked ? "cursor-not-allowed text-parchment/35" : "text-parchment/80 hover:bg-white/10",
                ].join(" ")}
              >
                {r.name}
                {locked && <span className="ml-0.5 text-[9px]">🔒</span>}
              </button>
            );
          })}
        </div>

        <div className="px-4 pt-3 pb-2">
          <h2 className="font-display text-xl leading-tight">{region.name}</h2>
          <p className="mt-0.5 text-[12px] leading-snug text-parchment/65">{region.tagline}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-gold/80">
            {explorableCount} explorable · {locations.length - explorableCount} coming soon
          </p>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:thin]">
          {locations.map((loc) => {
            const explorable = loc.status === "explorable";
            const hovered = hoveredLocationId === loc.id;
            return (
              <li key={loc.id}>
                <button
                  type="button"
                  onPointerEnter={() => setHovered(loc.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(loc.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => (explorable ? enterLocation(loc.id) : requestFocus(loc.id))}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                    hovered ? "bg-white/10" : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] border",
                      explorable ? "border-ink bg-gold shadow-[0_0_8px_rgba(242,193,78,0.7)]" : "border-parchment/40 bg-parchment/20",
                    ].join(" ")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={["block truncate text-[13.5px]", explorable ? "text-parchment" : "text-parchment/70"].join(" ")}>
                      {loc.name}
                    </span>
                    <span className="block truncate text-[11px] text-parchment/45">{loc.preview.tagline}</span>
                  </span>
                  {explorable ? (
                    <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-gold">3D</span>
                  ) : (
                    <span className="text-[10px] text-parchment/35">soon</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
