/**
 * One source of truth for every timing in the Map ⇄ Street-View hand-off,
 * so the map camera, the curtain and (in Phase 4) the 3D descent and audio
 * crossfade stay in lock-step.
 *
 *  ENTER   map fly-in ───────────────┐
 *          curtain fades in  ┌───────┤ (overlaps the last part of the fly-in)
 *                            └ mode = "street" → scene mounts under the curtain
 *          curtain fades out ────────┘ → 3D aerial→ground descent plays
 *
 *  EXIT    curtain fades in over the scene → mode = "map"
 *          map remounts zoomed on the pin, curtain fades out, map flies out
 */
export const TRANSITION = {
  /** Map camera dive towards the selected pin. */
  mapFlyInMs: 1400,
  /** Curtain starts covering the map this long after the dive begins. */
  curtainInDelayMs: 850,
  curtainInMs: 550,
  /** Hold on the covered screen so the 3D scene can compile shaders. */
  curtainHoldMs: 250,
  curtainOutMs: 900,
  /** Return trip. */
  exitCurtainInMs: 500,
  mapFlyOutMs: 1300,
  /** Maximum CSS perspective tilt applied to the map plane during a dive (deg). */
  maxDiveTiltDeg: 38,
} as const;
