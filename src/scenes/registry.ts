import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ExplorableLocation, SceneKey } from "@/types/world";

/** Props every first-person scene receives from the StreetViewGateway. */
export interface SceneProps {
  location: ExplorableLocation;
  /** Starts the exit transition back to the region map. */
  onExit: () => void;
}

export type LazyScene = LazyExoticComponent<ComponentType<SceneProps>>;

/**
 * SceneKey → lazily-loaded 3D scene. Each scene is code-split, so three.js and
 * the scene's generators only download when the user actually drops in.
 *
 * Register a scene by adding one line. Locations whose key isn't registered
 * yet fall back to the schema-driven arrival screen in StreetViewGateway, so
 * the transition flow always works.
 */
export const sceneRegistry: Partial<Record<SceneKey, LazyScene>> = {
  "national-park": lazy(() => import("./national-park/NationalParkScene")),
};

export function getSceneComponent(key: SceneKey): LazyScene | null {
  return sceneRegistry[key] ?? null;
}
