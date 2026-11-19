"use client";

import { memo, useRef } from "react";
import type { LocationDefinition, Vec2 } from "@/types/world";

interface MapPinProps {
  location: LocationDefinition;
  /** Screen-space position in px, relative to the map container. */
  screen: Vec2;
  showLabel: boolean;
  hovered: boolean;
  dimmed: boolean;
  /** This pin is the dive target; it stays bright while everything else fades. */
  active: boolean;
  onHover: (id: string | null) => void;
  onActivate: (location: LocationDefinition, viaTouch: boolean) => void;
}

const LABEL_POSITION: Record<LocationDefinition["map"]["labelSide"], string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
};

/**
 * HTML pin rendered in screen space so it stays crisp and constant-size at any
 * zoom, and is a real <button> (focusable, keyboard + screen-reader friendly).
 */
export const MapPin = memo(function MapPin({
  location,
  screen,
  showLabel,
  hovered,
  dimmed,
  active,
  onHover,
  onActivate,
}: MapPinProps) {
  const explorable = location.status === "explorable";
  const lastPointerType = useRef<string>("mouse");

  return (
    <button
      type="button"
      data-map-ui
      aria-label={`${location.name} — ${explorable ? "explorable, press to drop in" : "coming soon"}`}
      onPointerDown={(e) => {
        lastPointerType.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onHover(location.id);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onHover(null);
      }}
      onFocus={() => onHover(location.id)}
      onBlur={() => onHover(null)}
      onClick={() => onActivate(location, lastPointerType.current !== "mouse")}
      className="group absolute top-0 left-0 cursor-pointer outline-none"
      style={{
        transform: `translate3d(${screen[0]}px, ${screen[1]}px, 0) translate(-50%, -50%)`,
        opacity: dimmed ? 0 : 1,
        transition: "opacity 350ms ease",
        pointerEvents: dimmed ? "none" : "auto",
        zIndex: hovered || active ? 30 : explorable ? 20 : 10,
      }}
    >
      <span className="relative flex h-9 w-9 items-center justify-center">
        {explorable && (
          <>
            <span className="absolute inset-0 rounded-full bg-gold/35 animate-pin-pulse" />
            <span className="absolute inset-1.5 rounded-full bg-gold/25 blur-[2px]" />
          </>
        )}
        <span
          className={[
            "relative block rotate-45 rounded-[3px] border-2 shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-transform duration-200",
            explorable ? "h-3.5 w-3.5 border-ink bg-gold" : "h-2.5 w-2.5 border-ink/80 bg-parchment",
            hovered || active ? "scale-[1.45]" : "group-focus-visible:scale-[1.45]",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-gold/0 transition group-focus-visible:ring-gold" />
      </span>

      <span
        className={[
          "pointer-events-none absolute whitespace-nowrap rounded-full px-2 py-0.5 font-display text-[12.5px] leading-tight tracking-wide",
          "shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-all duration-200",
          LABEL_POSITION[location.map.labelSide],
          explorable ? "bg-ink/85 text-gold" : "bg-parchment/90 text-ink",
          showLabel || hovered || active ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {location.name}
      </span>
    </button>
  );
});
