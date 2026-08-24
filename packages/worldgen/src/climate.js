/**
 * Climate — the monsoon, as an advection field.
 *
 * A single ray march cannot work here, and three attempts proved it. Assam is
 * wet because moist air comes up the Brahmaputra valley from a Ganga plain that
 * is *itself already moist* — a ray does not know that, so it read the wettest
 * place on earth as desert. The field has to propagate.
 *
 * So: relax moisture across a grid over many sweeps, with sea cells as permanent
 * sources and terrain rise as the loss term. India's four monsoon arms are the
 * advection directions, and a cell takes the wettest arm that reaches it.
 *
 * Two separations matter, and each fixed a wrong-looking map:
 *
 *   air moisture ≠ rainfall — moist air over flat desert does not rain, it needs
 *   lifting. That is why the Thar is dry downwind of the Arabian Sea while the
 *   Konkan drowns and the Deccan twenty miles inland does not.
 *
 *   rainfall ≠ fertility — the Ganga plain and the Kaveri delta are green
 *   because of alluvium and water on the ground, not because it rains on them.
 *   Without the river term the model spends its life fighting the monsoon to
 *   explain greenery the monsoon was never going to explain.
 */
import { fillRings, nearestLineField, sampleGrid } from './raster.js';
import { landHeight } from './terrain.js';

export const GRID = 220;

/** Travel directions, as unit vectors in degrees. */
export const MONSOON_ARMS = [
  [ 0.74, 0.67],   // Arabian Sea   → NE over the Konkan and Malabar
  [ 0.18, 0.98],   // Bay of Bengal → N up the bay
  [-0.93, 0.30],   // Gangetic funnel → WNW from the delta
  [ 0.90, 0.25],   // Brahmaputra funnel → ENE up the valley
];

/**
 * Build the climate field.
 *
 * @param {object} O        compiled orography
 * @param {object} bbox     {w,s,e,n}
 * @param {Array}  landRings rings in lon/lat
 * @param {Array}  rivers    [{lon:[],lat:[],rank:number}]
 * @param {object} opts      {size, sweeps}
 */
export function buildClimate(O, bbox, landRings, rivers, { size = GRID, sweeps = 90 } = {}) {
  const W = size, H = size;
  const { w: bw, s: bs, e: be, n: bn } = bbox;
  const toX = (lon) => (lon - bw) / (be - bw) * W;
  const toY = (lat) => (lat - bs) / (bn - bs) * H;

  // 1. Land mask. Rasterised from the coastline, not inferred from height —
  //    getting this wrong made open ocean read as land and starved Kerala.
  const land = fillRings(
    landRings.map(r => ({ x: r.lon.map(toX), y: r.lat.map(toY) })), W, H);

  const height = new Float32Array(W * H);
  const isSea = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const idx = j * W + i;
    const lon = bw + (i + 0.5) / W * (be - bw);
    const lat = bs + (j + 0.5) / H * (bn - bs);
    isSea[idx] = land[idx] ? 0 : 1;
    height[idx] = land[idx] ? Math.max(0, landHeight(O, lon, lat)) : 0;
  }

  // 2. Relax the moisture field.
  const dLon = (be - bw) / W, dLat = (bn - bs) / H;
  const arms = MONSOON_ARMS.map(([dx, dy]) => [dx / dLon * 0.30, dy / dLat * 0.30]);

  let cur = new Float32Array(W * H), nxt = new Float32Array(W * H);
  for (let i = 0; i < cur.length; i++) cur[i] = isSea[i] ? 1 : 0.05;
  const lift = new Float32Array(W * H);

  for (let it = 0; it < sweeps; it++) {
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const idx = j * W + i;
      if (isSea[idx]) { nxt[idx] = 1; continue; }
      const h = height[idx];
      let best = 0.05, bestLift = 0;
      for (const [ax, ay] of arms) {
        const mu = sampleGrid(cur, W, H, i - ax, j - ay);
        const hu = sampleGrid(height, W, H, i - ax, j - ay);
        const dh = Math.max(0, h - hu);
        const m = mu * Math.exp(-dh / 620) * 0.988;   // orographic loss, then slow drying
        if (m > best) { best = m; bestLift = dh; }
      }
      nxt[idx] = Math.min(1, best);
      lift[idx] = bestLift;
    }
    const t = cur; cur = nxt; nxt = t;
  }

  // 3. River-corridor fertility. Rank-weighted: a rank-1 river carries a wider
  //    belt than a rank-9 stream.
  const riverField = nearestLineField(rivers.map(r => ({
    x: r.lon.map(toX), y: r.lat.map(toY),
    weight: Math.max(0.35, (10 - r.rank) * 0.16),
  })), W, H, { falloff: 3.0 });

  // 4. Spread lift slightly, so a windward coast gets the rain its mountain wrings out.
  const liftBlur = Float32Array.from(lift);
  for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++)
    liftBlur[j * W + i] = (lift[j * W + i] * 3 + lift[j * W + i - 1] + lift[j * W + i + 1] +
                           lift[(j - 1) * W + i] + lift[(j + 1) * W + i]) / 7;

  // 5. Rainfall from lifting, then fertility from rivers.
  const moisture = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const idx = j * W + i;
    if (isSea[idx]) { moisture[idx] = 0; continue; }
    const lat = bs + (j + 0.5) / H * (bn - bs);
    const lon = bw + (i + 0.5) / W * (be - bw);
    const L = Math.min(1, Math.max(lift[idx], liftBlur[idx] * 0.95) / 240);
    // Subtropical subsidence over the north-west — the descending limb that
    // keeps the Thar arid even when the air above it is damp.
    const sub = Math.max(0, Math.min(1, (lat - 21) / 9)) *
                Math.max(0, Math.min(1, (76.5 - lon) / 7));
    const rain = cur[idx] * (0.34 + 0.92 * L) * (1 - 0.62 * sub);
    moisture[idx] = Math.min(1, rain + riverField[idx] * 0.58 * (0.35 + 0.65 * cur[idx]));
  }

  // 6. Normalise on a high percentile, not the max. Normalising by the maximum
  //    let one Himalayan outlier flatten everywhere else to zero.
  const landVals = [];
  for (let i = 0; i < moisture.length; i++) if (!isSea[i]) landVals.push(moisture[i]);
  landVals.sort((a, b) => a - b);
  const hi = landVals[Math.floor(landVals.length * 0.93)] || 1;
  for (let i = 0; i < moisture.length; i++) moisture[i] = Math.min(1, moisture[i] / hi);

  // 7. Two light smoothing passes.
  const tmp = Float32Array.from(moisture);
  for (let p = 0; p < 2; p++) {
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++)
      moisture[j * W + i] = (tmp[j * W + i] * 4 + tmp[j * W + i - 1] + tmp[j * W + i + 1] +
                             tmp[(j - 1) * W + i] + tmp[(j + 1) * W + i]) / 8;
    tmp.set(moisture);
  }

  return { moisture, height, isSea, riverField, W, H, bbox };
}

/** Bilinear moisture lookup at a lon/lat. */
export function moistureAt(climate, lon, lat) {
  const { W, H, bbox: b, moisture } = climate;
  const fx = (lon - b.w) / (b.e - b.w) * W - 0.5;
  const fy = (lat - b.s) / (b.n - b.s) * H - 0.5;
  return sampleGrid(moisture, W, H, fx, fy);
}

/** Bilinear fertility lookup — the river term alone. */
export function fertilityAt(climate, lon, lat) {
  const { W, H, bbox: b, riverField } = climate;
  const fx = (lon - b.w) / (b.e - b.w) * W - 0.5;
  const fy = (lat - b.s) / (b.n - b.s) * H - 0.5;
  return sampleGrid(riverField, W, H, fx, fy);
}
