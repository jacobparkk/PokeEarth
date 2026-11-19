"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence } from "motion/react";
import { TRANSITION } from "@/config/transitions";
import { easeInOutCubic, easeInQuad, easeOutCubic, type MapCamera } from "@/lib/mapCamera";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { LocationDefinition, RegionDefinition } from "@/types/world";
import { MapPin } from "./MapPin";
import { PinPreviewCard } from "./PinPreviewCard";
import { RegionTerrain } from "./RegionTerrain";
import { useMapCamera } from "./useMapCamera";

interface RegionMapProps {
  region: RegionDefinition;
}

/** Zoom at which each importance tier gets its label. */
const LABEL_ZOOM: Record<1 | 2 | 3, number> = { 1: 1, 2: 1.6, 3: 2.6 };
const FOCUS_ZOOM = 3.4;
const RETURN_ZOOM = 1.8;
const PREVIEW_HIDE_DELAY_MS = 180;
const KEY_PAN_PX = 90;

/**
 * Bird's-eye region map.
 *
 * Owns the map camera and drives the map half of the Map ⇄ Street transition:
 *  - mode "entering": dives into the active pin with a perspective tilt, then calls completeEnter()
 *  - mounted with returnFromLocationId: starts zoomed + tilted on that pin and flies back out
 */
export function RegionMap({ region }: RegionMapProps) {
  const mode = useExplorerStore((s) => s.mode);
  const activeLocationId = useExplorerStore((s) => s.activeLocationId);
  const hoveredLocationId = useExplorerStore((s) => s.hoveredLocationId);
  const focusRequest = useExplorerStore((s) => s.focusRequest);
  const setHovered = useExplorerStore((s) => s.setHovered);
  const enterLocation = useExplorerStore((s) => s.enterLocation);
  const completeEnter = useExplorerStore((s) => s.completeEnter);
  const requestFocus = useExplorerStore((s) => s.requestFocus);
  const consumeReturn = useExplorerStore((s) => s.consumeReturn);

  const locationsById = useMemo(() => new Map(region.locations.map((l) => [l.id, l])), [region.locations]);

  /* ----------------------- initial state (mount only) ---------------------- */

  const [returnLocation] = useState<LocationDefinition | null>(() => {
    const id = useExplorerStore.getState().returnFromLocationId;
    return (id && region.locations.find((l) => l.id === id)) || null;
  });
  const [initialCamera] = useState<MapCamera>(() =>
    returnLocation
      ? { cx: returnLocation.map.position[0], cy: returnLocation.map.position[1], k: returnLocation.map.focusZoom }
      : { cx: region.initialView.center[0], cy: region.initialView.center[1], k: region.initialView.zoom },
  );
  const [returning, setReturning] = useState(returnLocation !== null);
  const [tilt, setTilt] = useState(returnLocation ? TRANSITION.maxDiveTiltDeg : 0);

  const interactive = mode === "map" && !returning;
  const cam = useMapCamera({ mapSize: region.geography.size, initial: initialCamera, interactive });
  const { flyTo, cancelAnimation, panBy, zoomBy, toScreen, camera, viewport, scale } = cam;
  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  /* ------------------------------ ENTER dive ------------------------------- */

  useEffect(() => {
    if (mode !== "entering" || !activeLocationId) return;
    const loc = locationsById.get(activeLocationId);
    if (!loc) return;
    flyTo(
      { cx: loc.map.position[0], cy: loc.map.position[1], k: loc.map.focusZoom },
      {
        durationMs: TRANSITION.mapFlyInMs,
        clamp: false,
        ease: easeInOutCubic,
        onProgress: (u) => setTilt(TRANSITION.maxDiveTiltDeg * easeInQuad(u)),
        onComplete: completeEnter,
      },
    );
    return () => cancelAnimation();
  }, [mode, activeLocationId, locationsById, flyTo, cancelAnimation, completeEnter]);

  /* ----------------------------- RETURN ascent ----------------------------- */

  useEffect(() => {
    if (!returning || !returnLocation) return;
    const timer = window.setTimeout(() => {
      flyTo(
        { cx: returnLocation.map.position[0], cy: returnLocation.map.position[1], k: RETURN_ZOOM },
        {
          durationMs: TRANSITION.mapFlyOutMs,
          ease: easeInOutCubic,
          onProgress: (u) => setTilt(TRANSITION.maxDiveTiltDeg * (1 - easeOutCubic(u))),
          onComplete: () => {
            setTilt(0);
            setReturning(false);
            consumeReturn();
          },
        },
      );
    }, 120);
    return () => {
      window.clearTimeout(timer);
      cancelAnimation();
    };
  }, [returning, returnLocation, flyTo, cancelAnimation, consumeReturn]);

  /* --------------------------- sidebar focus requests ---------------------- */

  useEffect(() => {
    if (!focusRequest || mode !== "map") return;
    const loc = locationsById.get(focusRequest.locationId);
    if (!loc) return;
    flyTo(
      { cx: loc.map.position[0], cy: loc.map.position[1], k: Math.max(cameraRef.current.k, FOCUS_ZOOM) },
      { durationMs: 900, ease: easeInOutCubic, onComplete: () => setHovered(loc.id) },
    );
  }, [focusRequest, mode, locationsById, flyTo, setHovered]);

  /* ------------------------- hover preview debounce ------------------------ */

  const [previewId, setPreviewId] = useState<string | null>(null);
  useEffect(() => {
    if (hoveredLocationId) {
      setPreviewId(hoveredLocationId);
      return;
    }
    const t = window.setTimeout(() => setPreviewId(null), PREVIEW_HIDE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [hoveredLocationId]);

  /* ------------------------------ interactions ----------------------------- */

  const touchArmedId = useRef<string | null>(null);

  const dropIn = useCallback(
    (loc: LocationDefinition) => {
      if (loc.status === "explorable") enterLocation(loc.id);
    },
    [enterLocation],
  );

  const handleActivate = useCallback(
    (loc: LocationDefinition, viaTouch: boolean) => {
      if (!interactive) return;
      // On touch there is no hover: first tap previews, second tap acts.
      if (viaTouch && touchArmedId.current !== loc.id) {
        touchArmedId.current = loc.id;
        setHovered(loc.id);
        return;
      }
      touchArmedId.current = null;
      if (loc.status === "explorable") enterLocation(loc.id);
      else requestFocus(loc.id);
    },
    [interactive, enterLocation, requestFocus, setHovered],
  );

  const handleHover = useCallback(
    (id: string | null) => {
      if (interactive) setHovered(id);
    },
    [interactive, setHovered],
  );

  const onBackgroundPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest("[data-map-ui]")) return;
    touchArmedId.current = null;
    setHovered(null);
  };

  const resetView = useCallback(() => {
    flyTo(
      { cx: region.initialView.center[0], cy: region.initialView.center[1], k: region.initialView.zoom },
      { durationMs: 800, ease: easeInOutCubic },
    );
  }, [flyTo, region.initialView]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || e.target !== e.currentTarget) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => panBy(KEY_PAN_PX, 0),
      ArrowRight: () => panBy(-KEY_PAN_PX, 0),
      ArrowUp: () => panBy(0, KEY_PAN_PX),
      ArrowDown: () => panBy(0, -KEY_PAN_PX),
      "+": () => zoomBy(1.5, undefined, true),
      "=": () => zoomBy(1.5, undefined, true),
      "-": () => zoomBy(1 / 1.5, undefined, true),
      "0": () => resetView(),
      Escape: () => setHovered(null),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };


  /* -------------------------------- render --------------------------------- */

  const tiltProgress = tilt / TRANSITION.maxDiveTiltDeg;
  const tx = viewport.width / 2 - camera.cx * scale;
  const ty = viewport.height / 2 - camera.cy * scale;
  const ready = viewport.width > 0;
  const previewLocation = previewId && interactive && tilt === 0 ? locationsById.get(previewId) ?? null : null;
  const diving = mode === "entering" || returning;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: region.theme.seaDeep }}>
      {/* Atmosphere behind the tilted plane (visible only while diving). */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, #cfe6f0 0%, #9cc7da 30%, ${region.theme.seaDeep} 70%)` }}
      />

      <div
        ref={cam.containerRef}
        tabIndex={0}
        role="application"
        aria-roledescription="interactive map"
        aria-label={`${region.name} region map. Drag to pan, scroll to zoom, arrow keys to move, plus and minus to zoom. Tab to reach locations.`}
        onKeyDown={onKeyDown}
        onPointerDownCapture={onBackgroundPointerDown}
        className="absolute inset-0 cursor-grab touch-none select-none outline-none data-[dragging=true]:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/60"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 35%" }}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: tilt > 0 ? `rotateX(${tilt}deg) scale(${1 + tilt / 80})` : undefined,
            transformOrigin: "50% 55%",
          }}
        >
          {ready && (
            <svg className="absolute inset-0 block" width={viewport.width} height={viewport.height} aria-hidden="true">
              <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
                <RegionTerrain region={region} />
              </g>
            </svg>
          )}

          {ready &&
            region.locations.map((loc) => {
              const isActive = loc.id === activeLocationId || loc.id === returnLocation?.id;
              return (
                <MapPin
                  key={loc.id}
                  location={loc}
                  screen={toScreen(loc.map.position)}
                  showLabel={camera.k >= LABEL_ZOOM[loc.map.importance]}
                  hovered={loc.id === hoveredLocationId}
                  active={isActive && diving}
                  dimmed={diving && !isActive}
                  onHover={handleHover}
                  onActivate={handleActivate}
                />
              );
            })}
        </div>
      </div>

      {/* Screen-space haze that thickens as the camera tilts toward the horizon. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          opacity: tiltProgress,
          background: "linear-gradient(to bottom, rgba(214,236,244,0.95), rgba(214,236,244,0.35) 45%, transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(5,15,25,0.55)]" />
      <div className="map-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      <AnimatePresence>
        {previewLocation && (
          <PinPreviewCard
            key={previewLocation.id}
            location={previewLocation}
            regionName={region.name}
            anchor={toScreen(previewLocation.map.position)}
            viewport={viewport}
            onDropIn={dropIn}
            onFocus={(l) => requestFocus(l.id)}
            onPointerEnter={() => setHovered(previewLocation.id)}
            onPointerLeave={() => setHovered(null)}
          />
        )}
      </AnimatePresence>

      <MapControls
        visible={interactive}
        zoom={camera.k}
        onZoomIn={() => zoomBy(1.6, undefined, true)}
        onZoomOut={() => zoomBy(1 / 1.6, undefined, true)}
        onReset={resetView}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface MapControlsProps {
  visible: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

function MapControls({ visible, zoom, onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  const btn =
    "flex h-9 w-9 items-center justify-center text-lg text-parchment/90 transition hover:bg-white/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-gold";
  return (
    <>
      <div
        data-map-ui
        className="absolute right-5 bottom-20 z-30 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink/80 shadow-lg backdrop-blur-md transition-opacity duration-300 md:bottom-8"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      >
        <button type="button" aria-label="Zoom in" className={btn} onClick={onZoomIn}>
          +
        </button>
        <div className="h-px bg-white/10" />
        <button type="button" aria-label="Zoom out" className={btn} onClick={onZoomOut}>
          −
        </button>
        <div className="h-px bg-white/10" />
        <button type="button" aria-label="Reset view" title="Reset view (0)" className={`${btn} text-sm`} onClick={onReset}>
          ⌂
        </button>
      </div>

      {/* Compass rose + zoom readout */}
      <div
        className="pointer-events-none absolute right-5 top-20 z-30 flex flex-col items-center gap-1 transition-opacity duration-300"
        style={{ opacity: visible ? 0.9 : 0 }}
        aria-hidden="true"
      >
        <span className="font-display text-[11px] font-semibold tracking-widest text-gold">N</span>
        <svg width="54" height="54" viewBox="-27 -27 54 54">
          <circle r="25" fill="rgba(15,26,34,0.75)" stroke="rgba(255,255,255,0.15)" />
          <circle r="18" fill="none" stroke="rgba(255,255,255,0.08)" />
          <polygon points="0,-20 5,0 0,4 -5,0" fill="#f2c14e" />
          <polygon points="0,20 5,0 0,-4 -5,0" fill="#efe6cf" opacity="0.7" />
          <polygon points="-20,0 0,-3 3,0 0,3" fill="#efe6cf" opacity="0.35" />
          <polygon points="20,0 0,-3 -3,0 0,3" fill="#efe6cf" opacity="0.35" />
        </svg>
        <span className="rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-parchment/70">{zoom.toFixed(1)}×</span>
      </div>
    </>
  );
}
