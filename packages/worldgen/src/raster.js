/**
 * Polygon and polyline rasterisation, without a canvas.
 *
 * The prototype used `getImageData` to work out land from sea and to lay down
 * river belts. That tied the climate model to a DOM, which meant it could not be
 * tested, could not run in a worker, and had to execute on the main thread —
 * one of the known faults in docs/HANDOFF.md. This replaces it with scanline
 * fill and a segment distance field, which are pure and a good deal faster.
 */

/**
 * Even-odd scanline fill of a set of closed rings into a byte mask.
 *
 * Edges are bucketed by the scanline they start on and carried in an active
 * list, so the cost is O(scanlines + edges) rather than O(scanlines × edges).
 *
 * That distinction is not academic here. The coastline is 302 rings and roughly
 * 150,000 edges; testing every edge on every scanline is ninety million
 * operations per frame, and it was the entire reason the first playable build
 * took thirty seconds to show anything.
 *
 * @param {Array<{x:ArrayLike<number>,y:ArrayLike<number>}>} rings  grid coordinates
 * @param {number} w @param {number} h
 * @returns {Uint8Array} 1 inside, 0 outside
 */
export function fillRings(rings, w, h) {
  const mask = new Uint8Array(w * h);

  // Bucket each edge by its first scanline. Store the edge as the x at that
  // scanline plus a per-scanline increment, so stepping down costs one add.
  /** @type {Array<Array<{x:number, dxdy:number, yEnd:number}>>} */
  const buckets = new Array(h);
  let any = false;

  for (const r of rings) {
    const n = r.x.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      let x0 = r.x[j], y0 = r.y[j], x1 = r.x[i], y1 = r.y[i];
      if (y0 === y1) continue;                       // horizontal edges contribute nothing
      if (y0 > y1) { const tx = x0, ty = y0; x0 = x1; y0 = y1; x1 = tx; y1 = ty; }

      // Scanline centres are at py + 0.5, so the first one strictly inside is:
      let py = Math.ceil(y0 - 0.5);
      if (py < 0) py = 0;
      const yEnd = Math.min(h - 1, Math.ceil(y1 - 0.5) - 1);
      if (py > yEnd) continue;

      const dxdy = (x1 - x0) / (y1 - y0);
      const x = x0 + ((py + 0.5) - y0) * dxdy;
      (buckets[py] ??= []).push({ x, dxdy, yEnd });
      any = true;
    }
  }
  if (!any) return mask;

  let active = [];
  const xs = [];
  for (let py = 0; py < h; py++) {
    if (buckets[py]) active = active.concat(buckets[py]);
    if (active.length === 0) continue;

    xs.length = 0;
    let keep = 0;
    for (let k = 0; k < active.length; k++) {
      const e = active[k];
      xs.push(e.x);
      e.x += e.dxdy;
      if (py < e.yEnd) active[keep++] = e;           // compact in place
    }
    active.length = keep;

    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    const row = py * w;
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let a = Math.ceil(xs[k] - 0.5);
      let b = Math.floor(xs[k + 1] - 0.5);
      if (a < 0) a = 0;
      if (b > w - 1) b = w - 1;
      for (let px = a; px <= b; px++) mask[row + px] = 1;
    }
  }
  return mask;
}

/**
 * Squared distance from a point to a segment.
 */
function segDist2(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = px - (ax + t * dx), ey = py - (ay + t * dy);
  return ex * ex + ey * ey;
}

/**
 * Distance to the nearest polyline, in grid cells, weighted by rank.
 *
 * A rank-1 river carries a wider fertile belt than a rank-9 stream, which is why
 * the Ganga plain is green and a Deccan creek is not. Computed directly rather
 * than by stroking and then running a distance transform — same result, no
 * raster round-trip, and no quantisation to a stroke width.
 */
export function nearestLineField(lines, w, h, { falloff = 7.8 } = {}) {
  const out = new Float32Array(w * h);
  // Bound each line so most cells skip most lines.
  const boxes = lines.map(({ x, y, weight = 1 }) => {
    let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
    for (let i = 0; i < x.length; i++) {
      if (x[i] < mnx) mnx = x[i]; if (x[i] > mxx) mxx = x[i];
      if (y[i] < mny) mny = y[i]; if (y[i] > mxy) mxy = y[i];
    }
    const pad = falloff * weight * 2.2;
    return { x, y, weight, mnx: mnx - pad, mny: mny - pad, mxx: mxx + pad, mxy: mxy + pad };
  });

  for (let py = 0; py < h; py++) {
    const cy = py + 0.5;
    for (let px = 0; px < w; px++) {
      const cx = px + 0.5;
      let best = 0;
      for (const L of boxes) {
        if (cx < L.mnx || cx > L.mxx || cy < L.mny || cy > L.mxy) continue;
        let d2 = Infinity;
        for (let i = 0; i + 1 < L.x.length; i++) {
          const d = segDist2(cx, cy, L.x[i], L.y[i], L.x[i + 1], L.y[i + 1]);
          if (d < d2) d2 = d;
        }
        if (d2 === Infinity) continue;
        const v = Math.exp(-Math.sqrt(d2) / (falloff * L.weight));
        if (v > best) best = v;
      }
      out[py * w + px] = best;
    }
  }
  return out;
}

/** Bilinear sample of a grid, clamped at the edges. */
export function sampleGrid(f, w, h, fx, fy) {
  fx = fx < 0 ? 0 : fx > w - 1 ? w - 1 : fx;
  fy = fy < 0 ? 0 : fy > h - 1 ? h - 1 : fy;
  const i = Math.floor(fx), j = Math.floor(fy);
  const u = fx - i, v = fy - j;
  const i2 = Math.min(w - 1, i + 1), j2 = Math.min(h - 1, j + 1);
  const a = f[j * w + i], b = f[j * w + i2], c = f[j2 * w + i], d = f[j2 * w + i2];
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
