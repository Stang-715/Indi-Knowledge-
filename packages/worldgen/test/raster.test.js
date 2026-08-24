import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillRings, nearestLineField, sampleGrid } from '../src/raster.js';

const box = (x0, y0, x1, y1) => ({ x: [x0, x1, x1, x0], y: [y0, y0, y1, y1] });
const count = (m) => m.reduce((n, v) => n + v, 0);

test('a square fills its area', () => {
  const m = fillRings([box(2, 2, 8, 8)], 10, 10);
  assert.equal(count(m), 36);
  assert.equal(m[5 * 10 + 5], 1);
  assert.equal(m[0], 0);
});

test('even-odd punches a hole', () => {
  const m = fillRings([box(0, 0, 10, 10), box(3, 3, 7, 7)], 10, 10);
  assert.equal(m[5 * 10 + 5], 0, 'the inner ring should be a hole');
  assert.equal(m[1 * 10 + 1], 1, 'the outer ring should still be filled');
});

test('a triangle fills roughly half its bounding box', () => {
  const tri = { x: [0, 20, 0], y: [0, 0, 20] };
  const n = count(fillRings([tri], 20, 20));
  assert.ok(n > 150 && n < 250, `triangle filled ${n} of 400`);
});

test('geometry outside the grid is clipped, not wrapped', () => {
  const m = fillRings([box(-50, -50, 5, 5)], 10, 10);
  assert.equal(m[9 * 10 + 9], 0, 'nothing should appear in the far corner');
  assert.equal(m[2 * 10 + 2], 1);
});

test('horizontal edges do not create spurious spans', () => {
  const m = fillRings([box(0, 4, 10, 4)], 10, 10);  // zero-height box
  assert.equal(count(m), 0);
});

test('an empty input gives an empty mask', () => {
  assert.equal(count(fillRings([], 10, 10)), 0);
});

test('the bucketed fill matches a naive reference', () => {
  // The optimisation that took first paint from 30 s to under a second must not
  // have changed a single pixel.
  const naive = (rings, w, h) => {
    const mask = new Uint8Array(w * h);
    for (let py = 0; py < h; py++) {
      const y = py + 0.5, xs = [];
      for (const r of rings) {
        const n = r.x.length;
        for (let i = 0, j = n - 1; i < n; j = i++) {
          const y0 = r.y[j], y1 = r.y[i];
          if ((y0 <= y) === (y1 <= y)) continue;
          xs.push(r.x[j] + ((y - y0) / (y1 - y0)) * (r.x[i] - r.x[j]));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.max(0, Math.ceil(xs[k] - 0.5));
        const b = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
        for (let px = a; px <= b; px++) mask[py * w + px] = 1;
      }
    }
    return mask;
  };
  // A few pseudo-random polygons, deterministically generated.
  const rings = [];
  let s = 12345;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let k = 0; k < 8; k++) {
    const n = 5 + Math.floor(rnd() * 9), x = [], y = [];
    const cx = rnd() * 60, cy = rnd() * 60, rad = 4 + rnd() * 16;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      x.push(cx + Math.cos(a) * rad * (0.6 + rnd() * 0.8));
      y.push(cy + Math.sin(a) * rad * (0.6 + rnd() * 0.8));
    }
    rings.push({ x, y });
  }
  const a = fillRings(rings, 64, 64), b = naive(rings, 64, 64);
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  assert.equal(diff, 0, `${diff} pixels differ from the reference`);
});

test('the line field peaks on the line and decays away', () => {
  const f = nearestLineField([{ x: [0, 20], y: [10, 10], weight: 1 }], 20, 20, { falloff: 2 });
  assert.ok(f[10 * 20 + 10] > 0.7, 'should be strong on the line');
  assert.ok(f[0 * 20 + 10] < 0.05, 'should be weak far from it');
});

test('a heavier weight carries a wider belt', () => {
  const thin = nearestLineField([{ x: [0, 20], y: [10, 10], weight: 0.4 }], 20, 20, { falloff: 2 });
  const wide = nearestLineField([{ x: [0, 20], y: [10, 10], weight: 2.0 }], 20, 20, { falloff: 2 });
  assert.ok(wide[5 * 20 + 10] > thin[5 * 20 + 10], 'rank should widen the corridor');
});

test('sampleGrid interpolates and clamps', () => {
  const g = Float32Array.from([0, 1, 2, 3]);   // 2x2
  assert.equal(sampleGrid(g, 2, 2, 0, 0), 0);
  assert.equal(sampleGrid(g, 2, 2, 1, 0), 1);
  assert.equal(sampleGrid(g, 2, 2, 0.5, 0), 0.5);
  assert.equal(sampleGrid(g, 2, 2, -5, -5), 0, 'clamps low');
  assert.equal(sampleGrid(g, 2, 2, 99, 99), 3, 'clamps high');
});
