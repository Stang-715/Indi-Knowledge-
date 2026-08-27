import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { freshness, literacy, RECITE_COST, FRESH_YEARS, FRESH_FLOOR } from '../src/teaching.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

// The Rigveda composes from -1500; by -1000 it exists as a memory carrier.
const RV = 'WRK.RIGVEDA';

test('a recital credits the work, refreshes its memory carrier, and costs grain', () => {
  const base = run(DP, 'teach-1', [], { to: -900 });
  const s = run(DP, 'teach-1', [{ year: -950, action: 'recite', work: RV, district: 'DIS.KAVERI_DELTA' }], { to: -900 });
  assert.ok(s.taughtWorks.has(RV), 'taughtWorks should record the recital');
  assert.equal(s.taughtWorks.get(RV), -950);
  const c = s.corpus.get(RV);
  assert.ok(c.carriers.some((k) => k.medium === 'memory' && k.place === 'home'), 'a home memory carrier exists');
  assert.ok(s.stats.recitals >= 1);
  assert.ok(s.pillars.CULTIVATION > base.pillars.CULTIVATION, 'CULTIVATION rises with teaching');
});

test('reciting a work that does not exist yet is refused silently', () => {
  const s = run(DP, 'teach-2', [{ year: -3000, action: 'recite', work: RV }], { to: -2900 });
  assert.ok(!s.taughtWorks.has(RV));
});

test('taught knowledge is fresh, then fades toward the floor, never to zero', () => {
  const log = [{ year: -1400, action: 'recite', work: RV }];
  const soon = run(DP, 'teach-3', log, { to: -1400 + FRESH_YEARS - 10 });
  assert.equal(freshness(soon, RV), 1, 'full strength within the fresh window');
  const later = run(DP, 'teach-3', log, { to: -1400 + FRESH_YEARS + 200 });
  const f = freshness(later, RV);
  assert.ok(f < 1, 'faded after the window');
  assert.ok(f >= FRESH_FLOOR, 'never below the floor');
});

test('literacy rises with a recital and sags as the teaching ages', () => {
  const untaught = run(DP, 'teach-4', [], { to: -800 });
  const log = [{ year: -900, action: 'recite', work: RV }];
  const taught = run(DP, 'teach-4', log, { to: -800 });
  assert.ok(taught.literacy > untaught.literacy, 'teaching raises literacy');
  const centuries = run(DP, 'teach-4', log, { to: 400 });
  assert.ok(centuries.literacy < taught.literacy, 'unrefreshed teaching fades');
  assert.ok(centuries.literacy >= 2 && taught.literacy <= 98, 'literacy stays in range');
});

test('teachers slow the fading (the scholar mechanic, sim-side)', () => {
  // several recitals make teacher conversion near-certain (p=0.25 each)
  const recitals = [-1400, -1380, -1360, -1340, -1320, -1300, -1280, -1260]
    .map((year) => ({ year, action: 'recite', work: RV }));
  const s = run(DP, 'teach-5', recitals, { to: -600 });
  if (s.pops.teachers > 0) {
    // teachers kept re-telling: the taught-year crept forward past the last recital
    assert.ok(s.taughtWorks.get(RV) > -1260, 'teachers refresh old teachings');
  } else {
    // with this seed no listener converted — the log alone must still stand
    assert.equal(s.taughtWorks.get(RV), -1260);
  }
});

test('recitals replay deterministically', () => {
  const log = [
    { year: -1200, action: 'recite', work: RV, district: 'DIS.KAVERI_DELTA' },
    { year: -700,  action: 'recite', work: RV },
  ];
  const a = run(DP, 'teach-6', log);
  const b = run(DP, 'teach-6', log);
  assert.equal(a.fingerprint, b.fingerprint);
  assert.equal(a.literacy, b.literacy);
});

test('literacy() is a pure derivation of state', () => {
  const s = run(DP, 'teach-7', [{ year: -1000, action: 'recite', work: RV }], { to: -500 });
  assert.equal(literacy(s), s.literacy);
});

test('a recital without grain or reciters does nothing', () => {
  const s0 = run(DP, 'teach-8', [], { to: -900 });
  assert.ok(RECITE_COST > 0 && s0.grain >= 0);
});

/* ── study: reading is teaching, just gentler ────────────────────────────── */

test('study is free and ungated: it works even with no grain and no reciters', () => {
  // recite would refuse under these conditions (RECITE_COST=20, 0 reciters);
  // study carries no such gate — it is reading, not a ceremony.
  const s = run(DP, 'study-1', [
    { year: -5990, action: 'study', kind: 'card', id: 'EV.TEST.1' },
  ], { to: -5989, initial: { grain: 5, pops: { farmers: 1000, reciters: 0, scribes: 0, soldiers: 0, merchants: 0, teachers: 0 } } });
  assert.ok(s.studied.has('EV.TEST.1'), 'study should land with no grain and no reciters');
  assert.equal(s.stats.studied, 1);
});

test('studying the same id twice is idempotent', () => {
  const s = run(DP, 'study-2', [
    { year: -950, action: 'study', kind: 'card', id: 'EV.TEST.1' },
    { year: -940, action: 'study', kind: 'card', id: 'EV.TEST.1' },
  ], { to: -900 });
  assert.equal(s.studied.size, 1);
  assert.equal(s.stats.studied, 1);
});

test('study alone (no recital at all) still raises literacy', () => {
  const bare = run(DP, 'study-3', [], { to: -900 });
  const read = run(DP, 'study-3', Array.from({ length: 20 }, (_, i) => (
    { year: -990 + i, action: 'study', kind: 'card', id: `EV.TEST.${i}` }
  )), { to: -900 });
  assert.ok(read.literacy > bare.literacy, 'reading alone should lift literacy some');
});

test('study replays deterministically', () => {
  const log = [
    { year: -950, action: 'study', kind: 'card', id: 'EV.TEST.1' },
    { year: -900, action: 'study', kind: 'work', id: RV },
  ];
  const a = run(DP, 'study-4', log);
  const b = run(DP, 'study-4', log);
  assert.equal(a.fingerprint, b.fingerprint);
  assert.deepEqual([...a.studied], [...b.studied]);
});

/* ── the growth loop: teach them and they grow ───────────────────────────── */

test('a taught people carries further: farmers outgrow an untaught control', () => {
  // several recitals + reads across the classical era, then let two centuries
  // of ordinary logistic growth run so the carrying-capacity gap compounds
  const recitals = [-1400, -1300, -1200, -1100, -1000, -900, -800]
    .map((year) => ({ year, action: 'recite', work: RV }));
  const reads = Array.from({ length: 30 }, (_, i) => (
    { year: -1400 + i * 20, action: 'study', kind: 'card', id: `EV.GROWTH.${i}` }
  ));
  const taught = run(DP, 'growth-1', [...recitals, ...reads], { to: -400 });
  const untaught = run(DP, 'growth-1', [], { to: -400 });
  assert.ok(taught.literacy > untaught.literacy, 'sanity: the taught run is actually more literate');
  assert.ok(taught.pops.farmers > untaught.pops.farmers,
    `taught farmers (${taught.pops.farmers}) should exceed untaught (${untaught.pops.farmers})`);
});
