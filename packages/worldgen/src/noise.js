/**
 * Deterministic value noise.
 *
 * Pure: `noise(x, y, seed)` depends on nothing but its arguments, so the same
 * coordinate gives the same value on every machine, every time, without any
 * stored state. That is what lets the world hold 648,802 settlements as a recipe
 * rather than as data.
 */

/** 2D integer hash → [0,1). Exact 32-bit arithmetic, so it is platform-stable. */
export function hash2(x, y, s) {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/** Bilinear value noise with a quintic fade. */
export function valueNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = smooth(x - xi), v = smooth(y - yi);
  const a = hash2(xi, yi, s),     b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  const p = a + (b - a) * u, q = c + (d - c) * u;
  return p + (q - p) * v;
}

/** Fractional Brownian motion — the general-purpose landform term. */
export function fbm(x, y, s, octaves) {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise(x * freq, y * freq, s + i * 131);
    freq *= 2.03; amp *= 0.5;
  }
  return v;
}

/** Ridged multifractal — creases and crest lines, for mountains and dune fields. */
export function ridged(x, y, s, octaves) {
  let v = 0, amp = 0.5, freq = 1, w = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq, s + i * 57) * 2 - 1);
    v += amp * n * n; w += amp;
    freq *= 2.11; amp *= 0.52;
  }
  return v / w;
}
