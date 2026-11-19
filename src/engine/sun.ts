import type { Vec3 } from "@/types/world";

/**
 * Unit vector pointing from the ground toward the sun.
 * Azimuth is a compass bearing (0 = north = −z, 90 = east = +x).
 */
export function sunDirection(elevationDeg: number, azimuthDeg: number): Vec3 {
  const el = (elevationDeg * Math.PI) / 180;
  const az = (azimuthDeg * Math.PI) / 180;
  return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
}
