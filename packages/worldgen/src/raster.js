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
 * @param {Array<{x:number[],y:number[]}>} rings  in grid coordinates
 * @param {number} w @param {number} h
 * @returns {Uint8Array} 1 inside, 0 outside
 */
export function fillRings(rings, w, h) {
  const mask = new Uint8Array(w * h);
  const xs = [];
  for (let py = 0; py < h; py++) {
    const y = py + 0.5;
    xs.length = 0;
    for (const r of rings) {
      const n = r.x.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const y0 = r.y[j], y1 = r.y[i];
        // Half-open test on y avoids double-counting shared vertices.
        if ((y0 <= y) === (y1 <= y)) continue;
        xs.push(r.x[j] + ((y - y0) / (y1 - y0)) * (r.x[i] - r.x[j]));
      }
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(xs[k] - 0.5));
      const b = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let px = a; px <= b; px++) mask[py * w + px] = 1;
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
