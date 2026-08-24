import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Clock, tickYears, totalTicks, formatYear, START_YEAR, END_YEAR } from '../src/clock.js';
import { buildSchedule, resolveFiringYear, eventsIn } from '../src/events.js';

const TL = JSON.parse(readFileSync(
  new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8'));

test('tick granularity coarsens in the deep past', () => {
  assert.equal(tickYears(-6000), 5);
  assert.equal(tickYears(-2000), 5);
  assert.equal(tickYears(-1300), 1);
  assert.equal(tickYears(1000), 1);
});

test('a full campaign runs the expected number of ticks', () => {
  const n = totalTicks();
  // 6000 BCE to 1300 BCE at 5-yearly, then yearly to 1947.
  assert.equal(n, 940 + 3247);
  assert.ok(n < 5000, 'far cheaper than Victoria 3 per hour of play');
});

test('the clock reaches the end and stops', () => {
  const c = new Clock();
  let guard = 0;
  while (!c.done && guard++ < 100000) c.advance();
  assert.equal(c.year, END_YEAR);
  assert.equal(c.advance(), null);
});

test('the clock never overshoots the end year', () => {
  const c = new Clock({ from: 1945, to: 1947 });
  while (!c.done) c.advance();
  assert.equal(c.year, 1947);
});

test('advance returns the span it crossed', () => {
  const c = new Clock({ from: -6000 });
  assert.deepEqual(c.advance(), [-6000, -5995]);
  assert.deepEqual(c.advance(), [-5995, -5990]);
});

test('formatYear reads correctly on both sides of the epoch', () => {
  assert.equal(formatYear(-6000), '6000 BCE');
  assert.equal(formatYear(1193), '1193 CE');
});

/* ── The property the whole design rests on ─────────────────────────────── */

test('same seed produces a byte-identical schedule', () => {
  const a = buildSchedule(TL, 'seed-alpha');
  const b = buildSchedule(TL, 'seed-alpha');
  const ser = (s) => JSON.stringify([...s.byYear.entries()].sort((x, y) => x[0] - y[0])
    .map(([y, evs]) => [y, evs.map(e => e.id)]));
  assert.equal(ser(a), ser(b));
});

test('different seeds produce different campaigns', () => {
  const a = buildSchedule(TL, 'seed-alpha');
  const b = buildSchedule(TL, 'seed-beta');
  const ser = (s) => JSON.stringify([...s.byYear.entries()].sort((x, y) => x[0] - y[0])
    .map(([y, evs]) => [y, evs.map(e => e.id)]));
  assert.notEqual(ser(a), ser(b), 'window triggers should move between campaigns');
});

test('dated events land on their year in every campaign', () => {
  for (const seed of ['a', 'b', 'c', 'd']) {
    for (const ev of TL.events.filter(e => e.trigger === 'dated' && e.scope !== 'prologue').slice(0, 200))
      assert.equal(resolveFiringYear(ev, seed), ev.year, `${ev.id} moved`);
  }
});

test('window events stay inside their window', () => {
  for (const seed of ['a', 'b', 'c']) {
    for (const ev of TL.events.filter(e => e.trigger === 'window' && e.scope !== 'prologue')) {
      const y = resolveFiringYear(ev, seed);
      const [lo, hi] = ev.window;
      assert.ok(y >= lo && y <= hi, `${ev.id}: ${y} outside [${lo}, ${hi}]`);
    }
  }
});

test('latent events sometimes do not happen at all', () => {
  const latent = TL.events.filter(e => e.trigger === 'latent');
  assert.ok(latent.length > 0);
  let anySkipped = false;
  for (const seed of ['a','b','c','d','e','f','g','h']) {
    if (latent.some(ev => resolveFiringYear(ev, seed) === null)) { anySkipped = true; break; }
  }
  assert.ok(anySkipped, 'contested scholarship should be absent from some campaigns');
});

test('prologue events never fire', () => {
  for (const ev of TL.events.filter(e => e.scope === 'prologue'))
    assert.equal(resolveFiringYear(ev, 'any'), null);
});

test('most of the campaign is genuinely replayable', () => {
  const movable = TL.events.filter(e => e.trigger === 'window' || e.trigger === 'latent').length;
  assert.ok(movable / TL.events.length > 0.7,
    `only ${(movable/TL.events.length*100).toFixed(0)}% of events can move`);
});

test('eventsIn respects the half-open span', () => {
  const s = buildSchedule(TL, 'x');
  const a = eventsIn(s, 1190, 1200);
  const b = eventsIn(s, 1190, 1195);
  assert.ok(a.length >= b.length);
  assert.equal(eventsIn(s, 1200, 1200).length, 0);
});
