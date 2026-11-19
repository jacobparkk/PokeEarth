import { createRng } from "@/lib/geometry";
import { FLOWERBEDS, PARK, PATH_SPOKES, TALL_GRASS_PATCHES, distanceToPath } from "./layout";

/**
 * Paints the park's ground (lawn, gravel walkways, paved plaza, flowerbed soil,
 * worn tall-grass fields) into a 2D canvas. Pure canvas code: no three.js, so it
 * can run in a worker or be previewed on its own.
 *
 * Canvas x → world x, canvas y → world z, covering ±PARK.groundHalf metres.
 */
export function paintParkGround(ctx: CanvasRenderingContext2D, px: number, seed: number) {
  const half = PARK.groundHalf;
  const k = px / (half * 2);
  const X = (x: number) => (x + half) * k;
  const Z = (z: number) => (z + half) * k;
  const M = (m: number) => m * k;
  const rng = createRng(seed);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)] as T;

  /* Lawn base with large tonal patches and fine speckle */
  ctx.fillStyle = "#6f8d3c";
  ctx.fillRect(0, 0, px, px);
  const blotches = ["#7d9a45", "#62803a", "#86a04a", "#5b7734", "#8a9a48"];
  for (let i = 0; i < 110; i++) {
    const cx = rng() * px;
    const cy = rng() * px;
    const r = M(3 + rng() * 9);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const c = pick(blotches);
    g.addColorStop(0, `${c}66`);
    g.addColorStop(1, `${c}00`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  const speckle = ["#88a54c", "#5d7a33", "#9bb35a", "#4f6a2c", "#a3a556"];
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 110000; i++) {
    ctx.fillStyle = pick(speckle);
    ctx.fillRect(rng() * px, rng() * px, 1 + rng() * 1.6, 1 + rng() * 1.6);
  }
  ctx.globalAlpha = 1;

  /* Forest floor outside the wall */
  ctx.fillStyle = "rgba(56, 70, 32, 0.55)";
  ctx.beginPath();
  ctx.rect(0, 0, px, px);
  ctx.rect(X(-PARK.wallHalf), Z(-PARK.wallHalf), M(PARK.wallHalf * 2), M(PARK.wallHalf * 2));
  ctx.fill("evenodd");

  /* Soft contact shadow along the inside of the wall / hedge line */
  ctx.strokeStyle = "rgba(28, 38, 18, 0.32)";
  ctx.lineWidth = M(2.4);
  ctx.strokeRect(X(-PARK.wallHalf + 1.3), Z(-PARK.wallHalf + 1.3), M((PARK.wallHalf - 1.3) * 2), M((PARK.wallHalf - 1.3) * 2));

  /* Trampled soil under the tall grass fields */
  for (const patch of TALL_GRASS_PATCHES) {
    ctx.beginPath();
    patch.forEach(([x, z], i) => (i === 0 ? ctx.moveTo(X(x), Z(z)) : ctx.lineTo(X(x), Z(z))));
    ctx.closePath();
    ctx.fillStyle = "rgba(76, 98, 40, 0.85)";
    ctx.fill();
    ctx.lineWidth = M(1.2);
    ctx.strokeStyle = "rgba(76, 98, 40, 0.35)";
    ctx.stroke();
  }

  /* Flowerbeds: dark soil inside a pale stone kerb */
  for (const f of FLOWERBEDS) {
    ctx.beginPath();
    ctx.arc(X(f.x), Z(f.z), M(f.r), 0, Math.PI * 2);
    ctx.fillStyle = "#5a3f2c";
    ctx.fill();
    ctx.lineWidth = M(0.3);
    ctx.strokeStyle = "#bdb197";
    ctx.stroke();
  }

  /* Gravel walkways */
  const strokeWalkways = (extra: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineCap = "butt";
    for (const ring of [PARK.innerRing, PARK.outerRing]) {
      ctx.lineWidth = M(ring.width + extra);
      ctx.beginPath();
      ctx.arc(X(0), Z(0), M(ring.radius), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = M(PARK.spokeWidth + extra);
    for (const [a, b] of PATH_SPOKES) {
      ctx.beginPath();
      ctx.moveTo(X(a[0]), Z(a[1]));
      ctx.lineTo(X(b[0]), Z(b[1]));
      ctx.stroke();
    }
  };
  strokeWalkways(0.5, "rgba(120, 104, 70, 0.55)");
  strokeWalkways(0.2, "#a99671");
  strokeWalkways(0, "#cbb68c");

  const gravel = ["#e0cfa6", "#a8946c", "#bfa97e", "#d6c39a", "#93805c"];
  for (let i = 0; i < 160000; i++) {
    const x = (rng() * 2 - 1) * half;
    const z = (rng() * 2 - 1) * half;
    const d = distanceToPath(x, z);
    if (d > 0 || Math.hypot(x, z) < PARK.plazaRadius) continue;
    ctx.fillStyle = pick(gravel);
    ctx.globalAlpha = 0.55 + rng() * 0.45;
    ctx.fillRect(X(x), Z(z), 1 + rng() * 1.8, 1 + rng() * 1.8);
  }
  ctx.globalAlpha = 1;

  /* Paved plaza: concentric courses of stone with staggered joints */
  ctx.beginPath();
  ctx.arc(X(0), Z(0), M(PARK.plazaRadius), 0, Math.PI * 2);
  ctx.fillStyle = "#d5c9ae";
  ctx.fill();
  ctx.lineWidth = Math.max(1, M(0.06));
  ctx.strokeStyle = "#b7ab90";
  const course = 1.1;
  for (let r = PARK.fountainRadius; r < PARK.plazaRadius - 0.5; r += course) {
    ctx.beginPath();
    ctx.arc(X(0), Z(0), M(r), 0, Math.PI * 2);
    ctx.stroke();
    const n = Math.max(8, Math.floor((2 * Math.PI * r) / 1.3));
    const offset = (Math.round(r / course) % 2) * (Math.PI / n);
    for (let j = 0; j < n; j++) {
      const a = offset + (j / n) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(X(Math.cos(a) * r), Z(Math.sin(a) * r));
      ctx.lineTo(X(Math.cos(a) * (r + course)), Z(Math.sin(a) * (r + course)));
      ctx.stroke();
    }
  }
  const stone = ["#c9bda2", "#e2d8c0", "#bfb296"];
  for (let i = 0; i < 26000; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * PARK.plazaRadius;
    ctx.fillStyle = pick(stone);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(X(Math.cos(a) * r), Z(Math.sin(a) * r), 1.4, 1.4);
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(X(0), Z(0), M(PARK.plazaRadius - 0.22), 0, Math.PI * 2);
  ctx.lineWidth = M(0.44);
  ctx.strokeStyle = "#9e927a";
  ctx.stroke();
}
