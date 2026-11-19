"use client";

import { useEffect } from "react";
import { useSoundtrack } from "@/audio/useSoundtrack";
import { DEFAULT_REGION_ID, getRegion } from "@/data/regions";
import { useExplorerStore } from "@/store/useExplorerStore";
import { RegionMap } from "./map/RegionMap";
import { RegionSidebar } from "./map/RegionSidebar";
import { StreetViewGateway } from "./street/StreetViewGateway";
import { TransitionCurtain } from "./transition/TransitionCurtain";
import { AppHeader } from "./ui/AppHeader";

/**
 * Top-level view router. Exactly one of the two "worlds" is mounted at a time:
 *   map | entering   → <RegionMap>          (2D bird's-eye, owns the dive)
 *   street | exiting → <StreetViewGateway>  (3D first-person scene)
 * The curtain sits above both and hides the swap.
 */
export function ExplorerShell() {
  const mode = useExplorerStore((s) => s.mode);
  const regionId = useExplorerStore((s) => s.regionId);

  useEffect(() => {
    void useExplorerStore.persist.rehydrate();
  }, []);

  useSoundtrack();

  const region = getRegion(regionId) ?? getRegion(DEFAULT_REGION_ID);
  if (!region) throw new Error(`Default region "${DEFAULT_REGION_ID}" is not available.`);

  const mapMounted = mode === "map" || mode === "entering";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-parchment">
      {mapMounted ? <RegionMap key={region.id} region={region} /> : <StreetViewGateway />}

      <RegionSidebar region={region} visible={mode === "map"} />
      <AppHeader region={region} />

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 rounded-full border border-white/10 bg-ink/75 px-4 py-2 text-[12px] text-parchment/75 shadow-lg backdrop-blur-md transition-opacity duration-300 md:block"
        style={{ opacity: mode === "map" ? 1 : 0 }}
      >
        Drag to pan · Scroll to zoom · Click a <span className="font-semibold text-gold">gold pin</span> to drop in
      </div>

      <p className="pointer-events-none absolute right-4 bottom-1.5 z-30 text-[10px] text-parchment/35">
        Fan project · not affiliated with Nintendo, Game Freak or The Pokémon Company
      </p>

      <TransitionCurtain />
    </main>
  );
}
