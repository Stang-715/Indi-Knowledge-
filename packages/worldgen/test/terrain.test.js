import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileOrography, landHeight } from '../src/terrain.js';
import { buildClimate, moistureAt } from '../src/climate.js';
import { loadSkeleton } from '../src/skeleton.js';
import { tint } from '../src/palette.js';

const bundle = JSON.parse(readFileSync(
  new URL('../../../data/skeleton/bundle.json', import.meta.url), 'utf8'));
const SK = loadSkeleton(bundle);
const O = compileOrography(SK.oro);

/* ── Purity ─────────────────────────────────────────────────────────────── */

test('terrain is a pure function of position', () => {
  for (const [lon, lat] of [[77, 28], [72.8, 19], [88.4, 22.6], [76.3, 9.9]]) {
    const a = landHeight(O, lon, lat);
    for (let i = 0; i < 5; i++) assert.equal(landHeight(O, lon, lat), a);
  }
});

test('a second compile of the same data gives the same terrain', () => {
  const O2 = compileOrography(SK.oro);
  for (const [lon, lat] of [[77, 28], [75, 15], [80, 13]])
    assert.equal(landHeight(O, lon, lat), landHeight(O2, lon, lat));
});

/* ── The field, probed rather than looked at ────────────────────────────── */
/* This is how the 18.7%-below-sea-level bug was found. It was invisible on
   screen — the render looked correct while a fifth of India was underwater. */

const PLACES = {
  'Everest area':  [86.9, 27.9], 'Leh':         [77.6, 34.2],
  'Delhi':         [77.2, 28.6], 'Kolkata':     [88.4, 22.6],
  'Mumbai':        [72.9, 19.1], 'Chennai':     [80.3, 13.1],
  'Thanjavur':     [79.1, 10.8], 'Kochi':       [76.3,  9.9],
  'Jaisalmer':     [70.9, 26.9], 'Guwahati':    [91.7, 26.2],
  'Cherrapunji':   [91.7, 25.3], 'Pune':        [73.9, 18.5],
  'Hyderabad':     [78.5, 17.4], 'Varanasi':    [83.0, 25.3],
};

test('no part of India sits below sea level', () => {
  let below = 0, n = 0;
  for (let lon = 68; lon <= 97; lon += 0.35)
    for (let lat = 8; lat <= 35; lat += 0.35) { n++; if (landHeight(O, lon, lat) < 0) below++; }
  assert.equal(below, 0, `${(below / n * 100).toFixed(1)}% of the grid is underwater`);
});

test('elevations are in the right order of magnitude', () => {
  const h = (k) => landHeight(O, ...PLACES[k]);
  assert.ok(h('Everest area') > 3500, `Himalaya reads ${h('Everest area') | 0} m`);
  assert.ok(h('Leh') > 2500,          `Ladakh reads ${h('Leh') | 0} m`);
  assert.ok(h('Delhi') < 700,         `Delhi reads ${h('Delhi') | 0} m`);
  assert.ok(h('Kolkata') < 300,       `Kolkata reads ${h('Kolkata') | 0} m`);
  assert.ok(h('Chennai') < 400,       `Chennai reads ${h('Chennai') | 0} m`);
});

test('the Gangetic plain is flat', () => {
  // Delhi to Kolkata is 1,500 km with under 250 m of fall. If the noise term is
  // loose this reads as hill country and the whole north tints wrong.
  let max = 0;
  for (let lon = 77; lon <= 88; lon += 0.4) max = Math.max(max, landHeight(O, lon, 26.0));
  assert.ok(max < 900, `the plain peaks at ${max | 0} m`);
});

/* ── Climate ────────────────────────────────────────────────────────────── */

/**
 * Production resolution. This matters: at 150 cells the Western Ghats fall below
 * one cell wide, lose their orographic lift, and the Malabar coast reads at 0.32
 * instead of 0.62. The climate model is resolution-sensitive by construction —
 * lift is a gradient — so it must be tested at the size it ships at.
 */
const climate = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 220, sweeps: 90 });
const mo = (k) => moistureAt(climate, ...PLACES[k]);

test('the Thar is arid', () => {
  assert.ok(mo('Jaisalmer') < 0.42, `Jaisalmer reads ${mo('Jaisalmer').toFixed(2)}`);
});

test('the north-east is wet — the model failed this three times', () => {
  // A ray-marched version read Cherrapunji, the wettest place on earth, as
  // desert, because a single ray cannot know the plain it enters is already
  // moist. It took advection to fix.
  assert.ok(mo('Guwahati') > 0.5,    `Guwahati reads ${mo('Guwahati').toFixed(2)}`);
  assert.ok(mo('Cherrapunji') > 0.5, `Cherrapunji reads ${mo('Cherrapunji').toFixed(2)}`);
});

test('the Malabar coast is wet', () => {
  assert.ok(mo('Kochi') > 0.5, `Kochi reads ${mo('Kochi').toFixed(2)}`);
});

test('the Thar is drier than the Malabar coast, by a wide margin', () => {
  assert.ok(mo('Kochi') - mo('Jaisalmer') > 0.25,
    `Kochi ${mo('Kochi').toFixed(2)} vs Jaisalmer ${mo('Jaisalmer').toFixed(2)}`);
});

test('the Kaveri delta is fertile despite its rain shadow', () => {
  // River fertility, not rainfall. Without that term this reads as scrub and
  // the whole Chola heartland is the wrong colour.
  assert.ok(mo('Thanjavur') > 0.4, `Thanjavur reads ${mo('Thanjavur').toFixed(2)}`);
});

test('moisture stays in range everywhere', () => {
  for (let i = 0; i < climate.moisture.length; i++) {
    const v = climate.moisture[i];
    assert.ok(Number.isFinite(v) && v >= 0 && v <= 1, `moisture out of range: ${v}`);
  }
});

test('the sea is not treated as land', () => {
  const frac = climate.isSea.reduce((n, v) => n + v, 0) / climate.isSea.length;
  assert.ok(frac > 0.25 && frac < 0.75, `sea covers ${(frac * 100).toFixed(0)}% of the grid`);
});

test('climate is reproducible', () => {
  const a = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 60, sweeps: 12 });
  const b = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 60, sweeps: 12 });
  for (let i = 0; i < a.moisture.length; i++) assert.equal(a.moisture[i], b.moisture[i]);
});

/* ── Colour ─────────────────────────────────────────────────────────────── */

test('the palette separates wet from dry at the same elevation', () => {
  // The Western Ghats and the Deccan are the same height and must not be the
  // same colour. An elevation-first ramp gets this wrong.
  const wet = tint(600, 0.85), dry = tint(600, 0.15);
  const d = Math.abs(wet[0] - dry[0]) + Math.abs(wet[1] - dry[1]) + Math.abs(wet[2] - dry[2]);
  assert.ok(d > 100, `wet and dry differ by only ${d}`);
});

test('high ground goes to snow regardless of rainfall', () => {
  for (const m of [0.05, 0.5, 0.95]) {
    const c = tint(5200, m);
    assert.ok(c[0] > 200 && c[1] > 200 && c[2] > 200, `5200 m at moisture ${m} is not snow`);
  }
});
