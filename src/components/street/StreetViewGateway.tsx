"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { getExplorableLocation } from "@/data/regions";
import { useSceneRuntime } from "@/engine/runtime";
import { getSceneComponent } from "@/scenes/registry";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { ExplorableLocation } from "@/types/world";

/**
 * Mounts the first-person scene for the active location (mode "street"/"exiting").
 * Resolves the scene through the registry; until a location's scene is
 * registered it shows a schema-driven arrival screen so the full
 * Map → Street → Map loop is testable end to end.
 */
export function StreetViewGateway() {
  const regionId = useExplorerStore((s) => s.regionId);
  const activeLocationId = useExplorerStore((s) => s.activeLocationId);
  const exitToMap = useExplorerStore((s) => s.exitToMap);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.pointerLockElement) return;
      // The first Esc only frees a captured mouse; ignore the keydown some browsers still deliver for it.
      if (performance.now() - useSceneRuntime.getState().lastUnlockAt < 250) return;
      exitToMap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exitToMap]);

  const location = activeLocationId ? getExplorableLocation(regionId, activeLocationId) : null;
  if (!location) return null;

  const Scene = getSceneComponent(location.scene.sceneKey);
  if (!Scene) return <LocationArrival location={location} onExit={exitToMap} />;

  return (
    <Suspense fallback={<SceneLoading location={location} />}>
      <Scene location={location} onExit={exitToMap} />
    </Suspense>
  );
}

/* -------------------------------------------------------------------------- */

function SceneLoading({ location }: { location: ExplorableLocation }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: location.environment.fog.color }}>
      <p className="animate-pulse font-display text-xl text-ink/70">Building {location.name}…</p>
    </div>
  );
}

const fmtTime = (t: string) => t.replace("-", " ").replace(/^\w/, (c) => c.toUpperCase());

function LocationArrival({ location, onExit }: { location: ExplorableLocation; onExit: () => void }) {
  const env = location.environment;
  const [a, b, c] = location.preview.palette;

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{ background: `linear-gradient(180deg, ${b} 0%, ${a} 38%, ${env.fog.color} 60%, ${c} 100%)` }}
    >
      {/* Procedural horizon so the arrival screen still feels like a place. */}
      <svg className="pointer-events-none fixed inset-x-0 bottom-0 h-[45vh] w-full" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220 C 200 160, 380 190, 600 210 S 1000 150, 1200 190 L1200 400 L0 400Z" fill={c} opacity={0.45} />
        <path d="M0 290 C 240 250, 520 280, 760 290 S 1080 250, 1200 270 L1200 400 L0 400Z" fill={c} opacity={0.85} />
      </svg>

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-24">
        <div className="rounded-3xl border border-white/15 bg-ink/80 p-6 text-parchment shadow-2xl backdrop-blur-md md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/90">Street view · {location.kind}</p>
          <h1 className="mt-1 font-display text-4xl">{location.name}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-parchment/80">{location.summary}</p>

          <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-[13px] text-parchment/85">
            The first-person 3D scene for this location (<code className="text-gold">{location.scene.sceneKey}</code>) isn't
            registered yet. Everything below is already loaded from the data schema and is what the scene engine will consume.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel title="Environment">
              <Row k="Time of day" v={fmtTime(env.timeOfDay)} />
              <Row k="Sun" v={`${env.sun.elevationDeg}° up · ${env.sun.azimuthDeg}° az`} swatch={env.sun.color} />
              <Row k="Weather" v={`${fmtTime(env.weather.type)} · wind ${Math.round(env.weather.windStrength * 100)}%`} />
              <Row k="Particles" v={fmtTime(env.weather.particles)} />
              <Row k="Fog" v={`${env.fog.near}–${env.fog.far} m`} swatch={env.fog.color} />
            </Panel>
            <Panel title="Audio">
              <Row k="Music" v={location.audio.music.title} />
              <Row k="Fade in" v={`${location.audio.music.fadeInMs} ms`} />
              {location.audio.ambience.map((l) => (
                <Row key={l.id} k={l.spatial ? "Ambience (3D)" : "Ambience"} v={l.label} />
              ))}
            </Panel>
            <Panel title="Camera">
              <Row k="Spawn" v={location.camera.ground.spawn.join(", ")} />
              <Row k="Eye height" v={`${location.camera.ground.eyeHeight} m`} />
              <Row k="Walk speed" v={`${location.camera.ground.walkSpeed} m/s`} />
              <Row k="Descent" v={`${location.camera.descentDurationMs} ms`} />
            </Panel>
            <Panel title={`Asset slots · ${location.scene.assetMode}`}>
              {location.scene.models.map((m) => (
                <Row key={m.slot} k={m.slot} v={m.url ? m.url.split("/").pop() ?? m.url : m.proceduralFallback.replace("procedural:", "⚙ ")} />
              ))}
            </Panel>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-[14px] font-semibold text-ink transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            ↑ Return to Region Map
          </button>
          <span className="ml-3 text-[12px] text-parchment/50">or press Esc</span>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/80">{title}</h3>
      <dl className="space-y-1.5">{children}</dl>
    </section>
  );
}

function Row({ k, v, swatch }: { k: string; v: string; swatch?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <dt className="text-parchment/55">{k}</dt>
      <dd className="flex items-center gap-1.5 text-right text-parchment/90">
        {swatch && <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20" style={{ background: swatch }} />}
        {v}
      </dd>
    </div>
  );
}
