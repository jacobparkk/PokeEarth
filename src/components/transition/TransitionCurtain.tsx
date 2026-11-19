"use client";

import { motion, type Transition } from "motion/react";
import { TRANSITION } from "@/config/transitions";
import { getLocation, getRegion } from "@/data/regions";
import { useExplorerStore, type ExplorerMode } from "@/store/useExplorerStore";

const s = (ms: number) => ms / 1000;

const CURTAIN: Record<ExplorerMode, { opacity: number; transition: Transition }> = {
  // Closes over the last stretch of the map dive.
  entering: { opacity: 1, transition: { delay: s(TRANSITION.curtainInDelayMs), duration: s(TRANSITION.curtainInMs), ease: "easeIn" } },
  // Holds briefly while the 3D scene mounts, then reveals it.
  street: { opacity: 0, transition: { delay: s(TRANSITION.curtainHoldMs), duration: s(TRANSITION.curtainOutMs), ease: "easeOut" } },
  // Closes over the scene before the map remounts.
  exiting: { opacity: 1, transition: { duration: s(TRANSITION.exitCurtainInMs), ease: "easeInOut" } },
  // Reveals the map as it flies back out.
  map: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

/**
 * Full-screen "cloud break" curtain that hides the hand-off between the 2D map
 * and the 3D scene. It is also the clock for the exit sequence: when it finishes
 * covering the screen in `exiting` mode it calls completeExit().
 */
export function TransitionCurtain() {
  const mode = useExplorerStore((st) => st.mode);
  const regionId = useExplorerStore((st) => st.regionId);
  const activeLocationId = useExplorerStore((st) => st.activeLocationId);
  const completeExit = useExplorerStore((st) => st.completeExit);

  const location = activeLocationId ? getLocation(regionId, activeLocationId) : null;
  const region = getRegion(regionId);
  const { opacity, transition } = CURTAIN[mode];
  const blocking = mode === "entering" || mode === "exiting";

  return (
    <motion.div
      aria-hidden={!blocking}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={transition}
      onAnimationComplete={() => {
        if (useExplorerStore.getState().mode === "exiting") completeExit();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        pointerEvents: blocking ? "auto" : "none",
        background:
          "radial-gradient(ellipse at 50% 45%, #fffaf0 0%, #fbeed2 28%, #d9ecf3 62%, #a9cfe0 100%)",
      }}
    >
      <div className="text-center text-ink">
        {mode === "exiting" ? (
          <p className="font-display text-2xl tracking-wide opacity-80">Returning to {region?.name ?? "the map"}…</p>
        ) : (
          location && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/55">{region?.name}</p>
              <h2 className="mt-1 font-display text-4xl md:text-5xl">{location.name}</h2>
              <p className="mt-2 text-sm italic text-ink/60">{location.preview.tagline}</p>
            </>
          )
        )}
      </div>
    </motion.div>
  );
}
