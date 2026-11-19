"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_REGION_ID, getExplorableLocation, getRegion } from "@/data/regions";
import type { RegionId } from "@/types/world";

/**
 * App-level view state machine.
 *
 *   map ──enterLocation()──▶ entering ──completeEnter()──▶ street
 *    ▲                                                       │
 *    └──completeExit()◀── exiting ◀──────exitToMap()─────────┘
 *
 * - `entering`: the region map dives toward the pin while the curtain closes.
 * - `street`:   the first-person scene is mounted; the map is unmounted to free the GPU.
 * - `exiting`:  the curtain closes over the scene, then the map remounts zoomed on
 *               `returnFromLocationId` and flies back out.
 */
export type ExplorerMode = "map" | "entering" | "street" | "exiting";

interface AudioPrefs {
  muted: boolean;
  /** 0–1 master gain applied on top of every track's own volume. */
  masterVolume: number;
}

interface ExplorerState {
  regionId: RegionId;
  mode: ExplorerMode;
  activeLocationId: string | null;
  hoveredLocationId: string | null;
  returnFromLocationId: string | null;
  /** Sidebar → map "fly to this pin" requests; nonce lets the same pin be re-requested. */
  focusRequest: { locationId: string; nonce: number } | null;
  audio: AudioPrefs;

  setRegion: (id: RegionId) => void;
  setHovered: (locationId: string | null) => void;
  requestFocus: (locationId: string) => void;
  enterLocation: (locationId: string) => boolean;
  completeEnter: () => void;
  exitToMap: () => void;
  completeExit: () => void;
  consumeReturn: () => void;
  toggleMute: () => void;
  setMasterVolume: (v: number) => void;
}

export const useExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      regionId: DEFAULT_REGION_ID,
      mode: "map",
      activeLocationId: null,
      hoveredLocationId: null,
      returnFromLocationId: null,
      focusRequest: null,
      audio: { muted: false, masterVolume: 0.8 },

      setRegion: (id) => {
        if (get().mode !== "map" || !getRegion(id)) return;
        set({ regionId: id, hoveredLocationId: null, returnFromLocationId: null, focusRequest: null });
      },

      setHovered: (locationId) => {
        if (get().hoveredLocationId !== locationId) set({ hoveredLocationId: locationId });
      },

      requestFocus: (locationId) =>
        set((s) => ({ focusRequest: { locationId, nonce: (s.focusRequest?.nonce ?? 0) + 1 } })),

      enterLocation: (locationId) => {
        const { mode, regionId } = get();
        if (mode !== "map" || !getExplorableLocation(regionId, locationId)) return false;
        set({ mode: "entering", activeLocationId: locationId, hoveredLocationId: null, focusRequest: null });
        return true;
      },

      completeEnter: () => {
        if (get().mode === "entering") set({ mode: "street" });
      },

      exitToMap: () => {
        if (get().mode === "street") set({ mode: "exiting" });
      },

      completeExit: () => {
        if (get().mode !== "exiting") return;
        set((s) => ({ mode: "map", returnFromLocationId: s.activeLocationId, activeLocationId: null }));
      },

      consumeReturn: () => set({ returnFromLocationId: null }),

      toggleMute: () => set((s) => ({ audio: { ...s.audio, muted: !s.audio.muted } })),

      // Moving the slider is an explicit intent to hear audio, so it also unmutes (or mutes at 0).
      setMasterVolume: (v) =>
        set((s) => ({ audio: { ...s.audio, masterVolume: Math.min(1, Math.max(0, v)), muted: v <= 0 } })),
    }),
    {
      name: "pokeearth:prefs",
      storage: createJSONStorage(() => localStorage),
      // Only user preferences survive reloads; view state always starts on the map.
      partialize: (s) => ({ audio: s.audio, regionId: s.regionId }),
      // Rehydrated manually after mount to avoid SSR hydration mismatches.
      skipHydration: true,
    },
  ),
);
