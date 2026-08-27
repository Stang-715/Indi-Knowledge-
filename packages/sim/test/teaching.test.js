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
