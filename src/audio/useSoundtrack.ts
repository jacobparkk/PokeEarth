"use client";

import { useEffect } from "react";
import { TRANSITION } from "@/config/transitions";
import { getExplorableLocation, getRegion } from "@/data/regions";
import { useExplorerStore } from "@/store/useExplorerStore";
import { getAudioManager } from "./AudioManager";

/**
 * Drives all music + ambience from the explorer state machine, so every
 * transition gets the right crossfade without components managing audio:
 *
 *   map       → region map theme (crossfades in)
 *   entering  → map theme fades out over the dive
 *   street    → location music fades in (fadeInMs) + ambience layers
 *   exiting   → everything fades out (music.fadeOutMs), then "map" brings the theme back
 */
export function useSoundtrack() {
  const mode = useExplorerStore((s) => s.mode);
  const regionId = useExplorerStore((s) => s.regionId);
  const activeLocationId = useExplorerStore((s) => s.activeLocationId);
  const muted = useExplorerStore((s) => s.audio.muted);
  const masterVolume = useExplorerStore((s) => s.audio.masterVolume);

  useEffect(() => {
    getAudioManager()?.setMaster(masterVolume, muted);
  }, [masterVolume, muted]);

  useEffect(() => {
    const audio = getAudioManager();
    if (!audio) return;
    const region = getRegion(regionId);
    const location = activeLocationId ? getExplorableLocation(regionId, activeLocationId) : null;

    switch (mode) {
      case "map":
        audio.resetListener();
        audio.setAmbience([], 0);
        audio.playMusic(region?.audio.mapTheme ?? null);
        break;
      case "entering":
        audio.fadeOutAll(TRANSITION.mapFlyInMs);
        break;
      case "street":
        if (!location) break;
        audio.playMusic(location.audio.music);
        audio.setAmbience(location.audio.ambience, location.environment.weather.windStrength);
        break;
      case "exiting":
        audio.fadeOutAll(location?.audio.music.fadeOutMs ?? TRANSITION.exitCurtainInMs);
        break;
    }
  }, [mode, regionId, activeLocationId]);
}
