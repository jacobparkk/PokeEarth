"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getRegion } from "@/data/regions";
import { useSceneRuntime } from "@/engine/runtime";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { ExplorableLocation } from "@/types/world";
import { TouchJoystick } from "./TouchJoystick";

interface StreetHudProps {
  location: ExplorableLocation;
  onExit: () => void;
}

const TIME_LABEL: Record<ExplorableLocation["environment"]["timeOfDay"], string> = {
  dawn: "Dawn",
  morning: "Morning",
  midday: "Midday",
  "golden-hour": "Golden hour",
  dusk: "Dusk",
  night: "Night",
};

/** DOM overlay for first-person scenes: return button, location card, now-playing/volume, look prompt, crosshair, touch controls. */
export function StreetHud({ location, onExit }: StreetHudProps) {
  const mode = useExplorerStore((s) => s.mode);
  const muted = useExplorerStore((s) => s.audio.muted);
  const volume = useExplorerStore((s) => s.audio.masterVolume);
  const toggleMute = useExplorerStore((s) => s.toggleMute);
  const setMasterVolume = useExplorerStore((s) => s.setMasterVolume);
  const phase = useSceneRuntime((s) => s.phase);
  const locked = useSceneRuntime((s) => s.pointerLocked);

  const [touch, setTouch] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (phase !== "walking" || interacted) return;
    const done = () => setInteracted(true);
    window.addEventListener("keydown", done, { once: true });
    window.addEventListener("pointerdown", done, { once: true });
    return () => {
      window.removeEventListener("keydown", done);
      window.removeEventListener("pointerdown", done);
    };
  }, [phase, interacted]);

  const visible = mode === "street";
  const walking = phase === "walking";
  const region = getRegion(location.regionId);
  const audible = !muted && volume > 0;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 select-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Return to map */}
      <button
        type="button"
        onClick={onExit}
        className="pointer-events-auto absolute top-20 right-4 flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-[13.5px] font-semibold text-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span aria-hidden="true">↑</span> Return to Region Map
      </button>

      {/* Location card */}
      <div
        className={[
          "absolute left-4 rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-parchment shadow-lg backdrop-blur-md",
          touch ? "top-20" : "bottom-6",
        ].join(" ")}
      >
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gold/90">
          {region?.name} · {location.kind}
        </p>
        <h2 className="font-display text-2xl leading-tight">{location.name}</h2>
        <p className="mt-1 text-[12px] text-parchment/70">
          {TIME_LABEL[location.environment.timeOfDay]} · {location.environment.weather.type.replace("-", " ")}
        </p>
      </div>

      {/* Now playing + volume */}
      <div className="pointer-events-auto absolute right-4 bottom-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-ink/70 py-2 pr-2 pl-3 text-parchment shadow-lg backdrop-blur-md">
        <Equalizer active={audible} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-parchment/50">Now playing</p>
          <p className="max-w-[160px] truncate text-[13px]">{location.audio.music.title}</p>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          aria-label="Master volume"
          className="hidden w-20 accent-[var(--color-gold)] sm:block"
        />
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[15px] transition hover:bg-white/10 hover:text-gold"
        >
          {audible ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Crosshair while the mouse is captured */}
      {locked && (
        <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.6)]" />
      )}

      <AnimatePresence>
        {!walking && visible && (
          <motion.p
            key="arriving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-ink/60 px-4 py-2 text-[13px] text-parchment/85 backdrop-blur-md"
          >
            Arriving at {location.name}…
          </motion.p>
        )}

        {walking && visible && !touch && !locked && !interacted && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink/75 px-6 py-5 text-center text-parchment shadow-2xl backdrop-blur-md"
          >
            <p className="font-display text-xl">Click to look around</p>
            <p className="mt-1 text-[12.5px] text-parchment/65">or drag with the mouse</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-[12px] text-parchment/80">
              <KeyHint keys={["W", "A", "S", "D"]} label="Move" />
              <KeyHint keys={["Shift"]} label="Run" />
              <KeyHint keys={["Esc"]} label="Release / exit" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {walking && !touch && (
        <p className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-[11.5px] text-parchment/60 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] lg:block">
          {locked ? "Esc to free the mouse · Esc again to return to the map" : "Click to capture the mouse · WASD to move · Shift to run · Esc to return"}
        </p>
      )}

      {touch && walking && visible && <TouchJoystick />}
    </div>
  );
}

function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {keys.map((k) => (
        <kbd key={k} className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[11px]">
          {k}
        </kbd>
      ))}
      <span className="text-parchment/55">{label}</span>
    </span>
  );
}

function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0.9, 0.5, 0.75].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-gold"
          style={{
            height: `${h * 100}%`,
            transformOrigin: "bottom",
            animation: active ? `eq-bounce ${0.7 + i * 0.18}s ease-in-out ${i * 0.1}s infinite alternate` : "none",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </span>
  );
}
