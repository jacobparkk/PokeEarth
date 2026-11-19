export type CircleCollider = { kind: 'circle'; x: number; z: number; radius: number };
export type BoxCollider = { kind: 'box'; x: number; z: number; halfWidth: number; halfDepth: number };
export type Collider = CircleCollider | BoxCollider;
export type Point = { x: number; z: number };
export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };
export const PLAYER_RADIUS = 0.38;
export function smoothstep(value: number): number {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}
export function movementVector(forward: number, right: number, yaw: number, speed: number, delta: number): Point {
  const magnitude = Math.max(1, Math.hypot(forward, right));
  const distance = speed * Math.min(Math.max(delta, 0), 0.05);
  return {
    x: (-Math.sin(yaw) * forward + Math.cos(yaw) * right) / magnitude * distance,
    z: (-Math.cos(yaw) * forward - Math.sin(yaw) * right) / magnitude * distance,
  };
}
export function isBlocked(point: Point, colliders: readonly Collider[], radius = PLAYER_RADIUS): boolean {
  return colliders.some(c => c.kind === 'circle'
    ? Math.hypot(point.x - c.x, point.z - c.z) < c.radius + radius
    : Math.hypot(Math.max(Math.abs(point.x - c.x) - c.halfWidth, 0), Math.max(Math.abs(point.z - c.z) - c.halfDepth, 0)) < radius);
}
/** Small substeps prevent tunnelling. Separate axes allow sliding along obstacles. */
export function moveWithCollisions(point: Point, movement: Point, colliders: readonly Collider[], bounds: Bounds): Point {
  const steps = Math.max(1, Math.ceil(Math.hypot(movement.x, movement.z) / 0.15));
  const result = { ...point };
  for (let i = 0; i < steps; i++) {
    const nextX = Math.max(bounds.minX + PLAYER_RADIUS, Math.min(bounds.maxX - PLAYER_RADIUS, result.x + movement.x / steps));
    if (!isBlocked({ x: nextX, z: result.z }, colliders)) result.x = nextX;
    const nextZ = Math.max(bounds.minZ + PLAYER_RADIUS, Math.min(bounds.maxZ - PLAYER_RADIUS, result.z + movement.z / steps));
    if (!isBlocked({ x: result.x, z: nextZ }, colliders)) result.z = nextZ;
  }
  return result;
}
export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}
