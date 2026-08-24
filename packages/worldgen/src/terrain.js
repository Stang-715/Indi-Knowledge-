/**
 * Terrain — the skeleton-plus-field model (docs/09-procedural-map.md).
 *
 * The shape is data and the detail is code. 103 elevation control points and 17
 * typed terrain regions, in ~16 KB, expand to a continent's landform at any
 * scale you ask for. Nothing here is stored; everything is computed.
 *
 * Every function in this file is pure.
 */
import { fbm, ridged } from './noise.js';

/** Longitude compression at Indian latitudes. One constant, used everywhere. */
export const KX = Math.cos(21.5 * Math.PI / 180);

/** Distance from a point to a segment, in degrees, and the parameter along it. */
function segDist(px, py, ax, ay, bx, by) {
  const dx = (bx - ax) * KX, dy = by - ay;
  const ux = (px - ax) * KX, uy = py - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? (ux * dx + uy * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = ux - t * dx, ey = uy - t * dy;
  return { d: Math.sqrt(ex * ex + ey * ey), t };
}

/** Precompute bounding boxes so most points skip most features. */
export function compileOrography(oro) {
  const box = (pts, pad) => {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const p of pts) {
      if (p[0] < a) a = p[0]; if (p[0] > c) c = p[0];
      if (p[1] < b) b = p[1]; if (p[1] > d) d = p[1];
    }
    return { mnx: a - pad, mxx: c + pad, mny: b - pad, mxy: d + pad };
  };
  return {
    ridges:  oro.ridges.map(r => ({ ...r, ...box(r.pts, r.w * 2.6) })),
    troughs: oro.troughs.map(t => ({ ...t, ...box(t.pts, t.w * 2.4) })),
    swells:  oro.swells,
    regions: (oro.regions ?? []).map(R => ({ ...R, ir0: 1 / R.r[0], ir1: 1 / R.r[1] })),
  };
}

/**
 * Elevation before typed regions: warped ridges, swells, noise, then troughs.
 *
 * The domain warp is what stops the ridges reading as drawn lines. Troughs are
 * applied last and blend downward, so a river valley cuts through whatever the
 * ridges built rather than being averaged with it.
 */
export function baseHeight(O, lon, lat) {
  const wx = lon + (fbm(lon * 0.85, lat * 0.85, 911, 3) - 0.5) * 1.15;
  const wy = lat + (fbm(lon * 0.85 + 31.7, lat * 0.85 + 17.3, 911, 3) - 0.5) * 1.15;
  let h = 0;

  for (const R of O.ridges) {
    if (wx < R.mnx || wx > R.mxx || wy < R.mny || wy > R.mxy) continue;
    const P = R.pts;
    let best = Infinity, peak = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const r = segDist(wx, wy, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]);
      if (r.d < best) { best = r.d; peak = P[i][2] + (P[i + 1][2] - P[i][2]) * r.t; }
    }
    const k = best / R.w;
    if (k < 3) h = Math.max(h, peak * Math.exp(-k * k * 1.15) *
      (0.70 + 0.38 * ridged(lon * 6.5, lat * 6.5, 11, 4)));
  }

  for (const S of O.swells) {
    const sx = lon + (fbm(lon * 0.42, lat * 0.42, 404, 4) - 0.5) * 3.4;
    const sy = lat + (fbm(lon * 0.42 + 9.1, lat * 0.42 + 4.7, 404, 4) - 0.5) * 3.4;
    const dx = (sx - S.c[0]) * KX, dy = sy - S.c[1];
    const k = Math.sqrt(dx * dx + dy * dy) / S.r;
    if (k < 1.5) h = Math.max(h, S.h * Math.exp(-k * k * 1.5));
  }

  h += (fbm(lon * 3.1, lat * 3.1, 7, 5) - 0.5) * 240;

  for (const T of O.troughs) {
    if (lon < T.mnx || lon > T.mxx || lat < T.mny || lat > T.mxy) continue;
    const P = T.pts;
    let best = Infinity, base = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const r = segDist(lon, lat, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]);
      if (r.d < best) { best = r.d; base = P[i][2] + (P[i + 1][2] - P[i][2]) * r.t; }
    }
    const k = best / T.w;
    if (k < 2.2) { const g = Math.exp(-k * k * 1.05); h = h * (1 - g * 0.92) + base * g * 0.92; }
  }
  return h;
}

/**
 * Typed terrain regions.
 *
 * Micro-texture driven by terrain TYPE, not just slope. A dune field, a salt
 * flat, a basalt terrace and a ravine field are four different surfaces, and
 * giving them one shared grain is what makes generated terrain read as
 * generated. Returns a texture multiplier that suppresses the generic grain
 * where a region has supplied its own.
 */
export function applyRegions(O, lon, lat, h) {
  let tex = 1;
  for (const R of O.regions) {
    const dx = (lon - R.c[0]) * KX * R.ir0, dy = (lat - R.c[1]) * R.ir1;
    const d2 = dx * dx + dy * dy;
    if (d2 > 2.4) continue;
    const w = Math.exp(-d2 * 1.7);
    if (w < 0.012) continue;
    const p = R.p ?? {};
    switch (R.kind) {
      case 'dunes': {
        // Longitudinal dunes: crests run along `dir`, so the wave varies across it.
        const a = (p.dir ?? 30) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        const u = (lon * KX) * ca + lat * sa, v = -(lon * KX) * sa + lat * ca;
        const jitter = (fbm(u * 3.1, v * 3.1, 1201, 3) - 0.5) * 0.35;
        const crest = 1 - Math.abs(Math.sin((v + jitter) * (p.wave ?? 0.6) * 210));
        const grain = ridged(u * 70, v * 160, 1301, 3);
        h = h * (1 - w) + (p.base ?? 160) * w;
        h += w * ((p.amp ?? 40) * (crest * crest * 0.85 + grain * 0.35));
        tex = Math.min(tex, 1 - w * 0.72); break;
      }
      case 'saltflat': {
        const crack = ridged(lon * 260, lat * 260, 1451, 3);
        const k = Math.min(1, w * 1.3);
        h = h * (1 - k) + ((p.h ?? 3) + (p.crack ?? 0.5) * 2.2 * (crack - 0.5)) * k;
        tex = Math.min(tex, 1 - w * 0.94); break;
      }
      case 'depression': {
        const k = Math.min(1, w * (p.soft ?? 0.9) * 1.25);
        h = h * (1 - k) + (p.h ?? 0) * k;
        tex = Math.min(tex, 1 - w * 0.85); break;
      }
      case 'delta': {
        const ch = ridged(lon * 150 + fbm(lat * 22, lon * 22, 1511, 3) * 4, lat * 150, 1601, 4);
        h = h * (1 - w) + (3 + (p.chan ?? 0.6) * 9 * (1 - ch)) * w;
        tex = Math.min(tex, 1 - w * 0.9); break;
      }
      case 'mesa': {
        // Flood-basalt terracing: flat tops, steep risers.
        const st = p.step ?? 120, sh = p.sharp ?? 0.55;
        const t = h / st, fl = Math.floor(t), fr = t - fl;
        const e = fr < sh ? 0 : (fr - sh) / (1 - sh);
        h = h * (1 - w) + (fl + e * e * (3 - 2 * e)) * st * w; break;
      }
      case 'badlands': {
        const g = ridged(lon * (p.freq ?? 400), lat * (p.freq ?? 400), 1701, 4);
        h -= w * Math.min(p.amp ?? 90, Math.max(0, h) * 0.42) * (1 - g) * 1.25;
        tex = Math.min(tex, 1 - w * 0.35); break;
      }
      case 'fan': {
        h += w * (p.amp ?? 25) * (fbm(lon * 46, lat * 46, 1801, 3) - 0.5);
        tex = Math.min(tex, 1 - w * 0.4); break;
      }
    }
  }
  return { h, tex };
}

/**
 * The one definition of ground height, used by the climate model and the
 * renderer alike.
 *
 * The floor at 2 m is load-bearing. Removing it so Kuttanad could go negative
 * let ±120 m of base noise push a fifth of India below sea level, which tinted
 * the Deccan as marsh — and was completely invisible on screen. Only typed
 * regions may go below zero, and only where they say so.
 */
export function landHeight(O, lon, lat) {
  return applyRegions(O, lon, lat, Math.max(2, baseHeight(O, lon, lat))).h;
}

export function landSurface(O, lon, lat) {
  return applyRegions(O, lon, lat, Math.max(2, baseHeight(O, lon, lat)));
}
