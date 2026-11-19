import { CylinderGeometry, ExtrudeGeometry, Shape } from "three";

/**
 * Gable roof centred on the origin with its eaves at y = 0.
 * The ridge runs along X; the sloped faces point toward ±Z.
 */
export function gableRoof(width: number, depth: number, height: number, overhang: number) {
  const s = new Shape();
  const hd = depth / 2 + overhang;
  s.moveTo(-hd, 0);
  s.lineTo(hd, 0);
  s.lineTo(0, height);
  s.closePath();
  const len = width + overhang * 2;
  const g = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  g.rotateY(Math.PI / 2);
  g.translate(-len / 2, 0, 0);
  g.computeVertexNormals();
  return g;
}

/**
 * Square hip roof / pagoda tier: a four-sided frustum with eaves of
 * half-size `bottomHalf` and a top of half-size `topHalf`, base at y = 0.
 */
export function hipRoof(bottomHalf: number, topHalf: number, height: number) {
  const g = new CylinderGeometry(topHalf * Math.SQRT2, bottomHalf * Math.SQRT2, height, 4, 1);
  g.rotateY(Math.PI / 4);
  g.translate(0, height / 2, 0);
  g.computeVertexNormals();
  return g;
}
