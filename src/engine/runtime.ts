"use client";

import { create } from "zustand";

/**
 * Per-scene runtime state shared between the R3F loop and the DOM HUD.
 * Reset whenever a scene mounts.
 */
interface SceneRuntimeState {
  phase: "descending" | "walking";
  pointerLocked: boolean;
  /** performance.now() of the last pointer-lock release; lets Esc release the mouse without also leaving the scene. */
  lastUnlockAt: number;
  setPhase: (p: SceneRuntimeState["phase"]) => void;
  setPointerLocked: (locked: boolean) => void;
  reset: () => void;
}

export const useSceneRuntime = create<SceneRuntimeState>()((set, get) => ({
  phase: "descending",
  pointerLocked: false,
  lastUnlockAt: 0,
  setPhase: (phase) => set({ phase }),
  setPointerLocked: (locked) => {
    if (get().pointerLocked && !locked) set({ pointerLocked: false, lastUnlockAt: performance.now() });
    else set({ pointerLocked: locked });
  },
  reset: () => set({ phase: "descending", pointerLocked: false }),
}));

/**
 * Mutable input snapshot written by keyboard/mouse/touch handlers and read once
 * per frame by the controller. Kept outside React so input never causes renders.
 */
export const playerInput = {
  keys: new Set<string>(),
  /** Accumulated look delta in radians, consumed every frame. */
  lookYaw: 0,
  lookPitch: 0,
  /** Virtual joystick, −1…1 on each axis (+y = forward). */
  joystick: { x: 0, y: 0 },
  sprint: false,
};

export function resetPlayerInput() {
  playerInput.keys.clear();
  playerInput.lookYaw = 0;
  playerInput.lookPitch = 0;
  playerInput.joystick.x = 0;
  playerInput.joystick.y = 0;
  playerInput.sprint = false;
}
