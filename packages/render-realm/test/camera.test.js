import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Camera, metresPerPx, levelFor, tiltShift, L0_METRES_PER_PX } from '../src/camera.js';

test('the ladder halves at every rung', () => {
  assert.equal(metresPerPx(0), L0_METRES_PER_PX);
  for (let l = 1; l <= 16; l++)
    assert.ok(Math.abs(metresPerPx(l) * 2 - metresPerPx(l - 1)) < 1e-9);
});

test('the ladder reaches sub-metre at the bottom', () => {
  assert.ok(metresPerPx(16) < 0.25, `L16 is ${metresPerPx(16)} m/px`);
  assert.ok(metresPerPx(15) < 0.5,  `L15 is ${metresPerPx(15)} m/px`);
});

test('the whole subcontinent sits near L0', () => {
  const l = levelFor(33, 1000);   // ~33 degrees across a 1000 px viewport
  assert.ok(l >= 0 && l < 2, `subcontinent view is L${l.toFixed(1)}`);
});

test('a single village sits deep in the ladder', () => {
  const l = levelFor(0.01, 1000); // ~1 km across
  assert.ok(l > 8, `village view is only L${l.toFixed(1)}`);
});

test('the tilt-shift is strongest zoomed out and gone by L7', () => {
  assert.equal(tiltShift(0), 1);
  assert.ok(tiltShift(3) < tiltShift(1));
  assert.equal(tiltShift(7), 0);
  assert.equal(tiltShift(10), 0);
});

test('the tilt-shift falls monotonically — the world resolves as you dive', () => {
  let prev = Infinity;
  for (let l = 0; l <= 9; l += 0.25) {
    const t = tiltShift(l);
    assert.ok(t <= prev + 1e-9, `blur rose at L${l}`);
    prev = t;
  }
});

test('zooming keeps the point under the cursor fixed', () => {
  const c = new Camera({ cx: 78, cy: 22, span: 30 });
  c.zoomAt(0.5, 80, 12);
  // The anchor must map to the same relative offset after the zoom.
  const rel = (c.cx - 80) / c.span;
  const c2 = new Camera({ cx: 78, cy: 22, span: 30 });
  const rel0 = (c2.cx - 80) / c2.span;
  assert.ok(Math.abs(rel - rel0) < 1e-9, 'zoom anchor drifted');
});

test('zoom respects its limits', () => {
  const c = new Camera({ cx: 78, cy: 22, span: 30 });
  for (let i = 0; i < 50; i++) c.zoomAt(0.5, 78, 22);
  assert.ok(c.span >= c.minSpan);
  for (let i = 0; i < 100; i++) c.zoomAt(2, 78, 22);
  assert.ok(c.span <= c.maxSpan);
});

test('projection round-trips', () => {
  const c = new Camera({ cx: 78, cy: 22, span: 30 });
  const p = c.projection(900, 1000);
  for (const [lon, lat] of [[78, 22], [70, 15], [88, 28]]) {
    assert.ok(Math.abs(p.toLon(p.toX(lon)) - lon) < 1e-9);
    assert.ok(Math.abs(p.toLat(p.toY(lat)) - lat) < 1e-9);
  }
});

test('projection bounds contain the centre', () => {
  const c = new Camera({ cx: 78, cy: 22, span: 30 });
  const b = c.projection(900, 1000).bounds;
  assert.ok(b.w < 78 && b.e > 78 && b.s < 22 && b.n > 22);
});
