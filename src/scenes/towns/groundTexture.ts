import { createRng } from "@/lib/geometry";
import type { Vec2 } from "@/types/world";
import type { Rect, TownLayout } from "./types";
import { distanceToPaths } from "./resolve";

const SURFACE = (layout: TownLayout, s: "dirt" | "stone" | "gravel") =>
  s === "dirt" ? layout.palette.dirt : s === "stone" ? layout.palette.stone : layout.palette.gravel;

/** Darken (amount < 0) or lighten a hex colour. */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amount * 255)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

/**
 * Paints a town's ground texture: lawn, beach, lake shore, walkways (dirt,
 * stone or gravel), plazas, flower soil, tall-grass soil, building
 * foundations and, for autumn towns, fallen leaves. Pure 2D canvas code.
 */
export function paintTownGround(ctx: CanvasRenderingContext2D, px: number, layout: TownLayout, foundations: readonly Rect[], seed: number) {
  const half = layout.groundHalf;
  const k = px / (half * 2);
  const X = (x: number) => (x + half) * k;
  const Z = (z: number) => (z + half) * k;
  const M = (m: number) => m * k;
  const rng = createRng(seed);
  const pal = layout.palette;
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rng() * a.length)] as T;

  /* Lawn */
  ctx.fillStyle = pal.grass;
  ctx.fillRect(0, 0, px, px);
  for (let i = 0; i < 140; i++) {
    const cx = rng() * px;
    const cy = rng() * px;
    const r = M(3 + rng() * 10);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const c = pick([pal.grassDark, pal.grassLight, pal.grass]);
    g.addColorStop(0, `${c}70`);
    g.addColorStop(1, `${c}00`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 0.45;
  const speck = [pal.grassDark, pal.grassLight, shade(pal.grass, 0.06), shade(pal.grass, -0.08)];
  for (let i = 0; i < 120000; i++) {
    ctx.fillStyle = pick(speck);
    ctx.fillRect(rng() * px, rng() * px, 1 + rng() * 1.6, 1 + rng() * 1.6);
  }
  ctx.globalAlpha = 1;

  /* Beach: wavy-edged sand band blending into the lawn */
  if (layout.sea) {
    const top = layout.sea.shoreZ - 7;
    ctx.beginPath();
    ctx.moveTo(0, px);
    for (let x = -half; x <= half; x += 1) {
      const wob = Math.sin(x * 0.21) * 0.9 + Math.sin(x * 0.07 + 1.3) * 1.4;
      ctx.lineTo(X(x), Z(top + wob));
    }
    ctx.lineTo(px, px);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, Z(top - 1.5), 0, Z(top + 3));
    g.addColorStop(0, `${pal.sand}00`);
    g.addColorStop(0.45, pal.sand);
    g.addColorStop(1, pal.sand);
    ctx.fillStyle = g;
    ctx.fill();
    // Wet sand near the water.
    const wet = ctx.createLinearGradient(0, Z(layout.sea.shoreZ - 2.5), 0, Z(layout.sea.shoreZ));
    wet.addColorStop(0, `${pal.sand}00`);
    wet.addColorStop(1, shade(pal.sand, -0.18));
    ctx.fillStyle = wet;
    ctx.fillRect(0, Z(layout.sea.shoreZ - 2.5), px, px);
  }

  /* Lake shore */
  if (layout.lake) {
    const L = layout.lake;
    const g = ctx.createRadialGradient(X(L.x), Z(L.z), M(L.r - 1), X(L.x), Z(L.z), M(L.r + 3));
    g.addColorStop(0, shade(pal.sand, -0.2));
    g.addColorStop(0.45, pal.sand);
    g.addColorStop(1, `${pal.sand}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(X(L.x), Z(L.z), M(L.r + 3), 0, Math.PI * 2);
    ctx.fill();
  }

  /* Soil under tall grass and building foundations */
  for (const patch of layout.tallGrass) {
    ctx.beginPath();
    patch.forEach(([x, z], i) => (i === 0 ? ctx.moveTo(X(x), Z(z)) : ctx.lineTo(X(x), Z(z))));
    ctx.closePath();
    ctx.fillStyle = shade(pal.grassDark, -0.06);
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const f of foundations) {
    ctx.fillStyle = "rgba(40, 34, 24, 0.35)";
    ctx.fillRect(X(f.minX - 0.6), Z(f.minZ - 0.6), M(f.maxX - f.minX + 1.2), M(f.maxZ - f.minZ + 1.2));
  }

  /* Walkways and plazas */
  const strokePaths = (extra: number, colorFor: (s: "dirt" | "stone" | "gravel") => string) => {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const p of layout.paths) {
      ctx.strokeStyle = colorFor(p.surface);
      ctx.lineWidth = M(p.width + extra);
      ctx.beginPath();
      p.points.forEach(([x, z], i) => (i === 0 ? ctx.moveTo(X(x), Z(z)) : ctx.lineTo(X(x), Z(z))));
      ctx.stroke();
    }
    for (const pl of layout.plazas) {
      ctx.fillStyle = colorFor(pl.surface);
      ctx.beginPath();
      ctx.arc(X(pl.x), Z(pl.z), M(pl.r + extra / 2), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  strokePaths(0.6, (s) => shade(SURFACE(layout, s), -0.22));
  strokePaths(0.2, (s) => shade(SURFACE(layout, s), -0.08));
  strokePaths(0, (s) => SURFACE(layout, s));

  // Paving joints on stone surfaces, speckle on dirt/gravel.
  for (let i = 0; i < 180000; i++) {
    const x = (rng() * 2 - 1) * half;
    const z = (rng() * 2 - 1) * half;
    if (distanceToPaths(layout, x, z) > 0) continue;
    ctx.fillStyle = rng() < 0.5 ? shade(pal.dirt, 0.1) : shade(pal.dirt, -0.12);
    ctx.globalAlpha = 0.35 + rng() * 0.4;
    ctx.fillRect(X(x), Z(z), 1 + rng() * 1.8, 1 + rng() * 1.8);
  }
  ctx.globalAlpha = 1;
  for (const p of layout.paths.filter((pp) => pp.surface === "stone")) {
    ctx.strokeStyle = shade(pal.stone, -0.16);
    ctx.lineWidth = Math.max(1, M(0.05));
    for (let i = 0; i < p.points.length - 1; i++) {
      const a = p.points[i] as Vec2;
      const b = p.points[i + 1] as Vec2;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / len;
      const uz = (b[1] - a[1]) / len;
      for (let s = 0; s < len; s += 1.1) {
        const cx = a[0] + ux * s;
        const cz = a[1] + uz * s;
        ctx.beginPath();
        ctx.moveTo(X(cx - uz * (p.width / 2)), Z(cz + ux * (p.width / 2)));
        ctx.lineTo(X(cx + uz * (p.width / 2)), Z(cz - ux * (p.width / 2)));
        ctx.stroke();
      }
    }
  }

  /* Flowerbed soil */
  for (const f of layout.flowerBeds) {
    ctx.beginPath();
    ctx.arc(X(f.x), Z(f.z), M(f.r + 0.2), 0, Math.PI * 2);
    ctx.fillStyle = "#5a3f2c";
    ctx.fill();
  }

  /* Autumn: fallen leaves scattered everywhere, densest under the belt */
  if (pal.leaves) {
    const leafColors = [pal.leaves, shade(pal.leaves, 0.12), shade(pal.leaves, -0.15), "#d9a43a", "#a8432a"];
    for (let i = 0; i < 32000; i++) {
      const x = (rng() * 2 - 1) * half;
      const z = (rng() * 2 - 1) * half;
      const edge = Math.max(Math.abs(x), Math.abs(z)) / half;
      if (rng() > 0.35 + edge * 0.65) continue;
      ctx.fillStyle = pick(leafColors);
      ctx.globalAlpha = 0.55 + rng() * 0.4;
      ctx.beginPath();
      ctx.ellipse(X(x), Z(z), 1.5 + rng() * 2, 1 + rng() * 1.2, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
