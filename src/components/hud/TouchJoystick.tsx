"use client";

import { useRef, useState, type PointerEvent } from "react";
import { playerInput } from "@/engine/runtime";

const RADIUS = 56;

/** On-screen movement stick for touch devices; writes into the shared player input. */
export function TouchJoystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [sprint, setSprint] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const update = (e: PointerEvent<HTMLDivElement>) => {
    if (!origin.current) return;
    let dx = e.clientX - origin.current.x;
    let dy = e.clientY - origin.current.y;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    playerInput.joystick.x = dx / RADIUS;
    playerInput.joystick.y = -dy / RADIUS;
  };

  const release = () => {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    playerInput.joystick.x = 0;
    playerInput.joystick.y = 0;
  };

  return (
    <div className="pointer-events-auto absolute bottom-8 left-6 z-40 flex items-end gap-4">
      <div
        role="application"
        aria-label="Movement joystick"
        className="relative h-36 w-36 touch-none rounded-full border border-white/20 bg-ink/45 backdrop-blur-sm"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={update}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div
          className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full border border-gold/60 bg-gold/30 shadow-lg"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <button
        type="button"
        aria-pressed={sprint}
        onClick={() => {
          playerInput.sprint = !sprint;
          setSprint(!sprint);
        }}
        className={[
          "mb-2 rounded-full border px-3 py-2 text-[12px] font-semibold backdrop-blur-sm transition",
          sprint ? "border-gold bg-gold text-ink" : "border-white/20 bg-ink/45 text-parchment/85",
        ].join(" ")}
      >
        Run
      </button>
    </div>
  );
}
