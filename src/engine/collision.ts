/** Simple 2D (XZ-plane) collision primitives for a walking player. */
export type Collider =
  | { kind: "circle"; x: number; z: number; r: number }
  | { kind: "box"; minX: number; maxX: number; minZ: number; maxZ: number };

export const circle = (x: number, z: number, r: number): Collider => ({ kind: "circle", x, z, r });
export const box = (minX: number, minZ: number, maxX: number, maxZ: number): Collider => ({ kind: "box", minX, maxX, minZ, maxZ });

/**
 * Pushes a circle of radius `radius` at (p.x, p.z) out of every collider.
 * Two relaxation passes are enough for the sparse obstacles in our scenes.
 */
export function resolveCollisions(p: { x: number; z: number }, radius: number, colliders: readonly Collider[]) {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of colliders) {
      if (c.kind === "circle") {
        const dx = p.x - c.x;
        const dz = p.z - c.z;
        const min = c.r + radius;
        const d2 = dx * dx + dz * dz;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || 1e-4;
        p.x = c.x + (dx / d) * min;
        p.z = c.z + (dz / d) * min;
      } else {
        const qx = Math.max(c.minX, Math.min(p.x, c.maxX));
        const qz = Math.max(c.minZ, Math.min(p.z, c.maxZ));
        const dx = p.x - qx;
        const dz = p.z - qz;
        const d2 = dx * dx + dz * dz;
        if (d2 > 1e-8) {
          if (d2 >= radius * radius) continue;
          const d = Math.sqrt(d2);
          p.x = qx + (dx / d) * radius;
          p.z = qz + (dz / d) * radius;
        } else {
          // Centre is inside the box: exit through the nearest face.
          const exits = [
            { d: p.x - c.minX, x: c.minX - radius, z: p.z },
            { d: c.maxX - p.x, x: c.maxX + radius, z: p.z },
            { d: p.z - c.minZ, x: p.x, z: c.minZ - radius },
            { d: c.maxZ - p.z, x: p.x, z: c.maxZ + radius },
          ].sort((a, b) => a.d - b.d);
          const best = exits[0];
          if (best) {
            p.x = best.x;
            p.z = best.z;
          }
        }
      }
    }
  }
}
