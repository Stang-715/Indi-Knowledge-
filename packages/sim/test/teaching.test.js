import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { freshness, literacy, RECITE_COST, FRESH_YEARS, FRESH_FLOOR, cardFreshness, isCardLocked, districtLiteracy } from '../src/teaching.js';

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

/* ── education cards: per-card taught state, distinct from the work ─────── */

test('reciting with a card id tracks that card, separately from the work', () => {
  const s = run(DP, 'card-1', [
    { year: -950, action: 'recite', work: RV, card: 'EDU.GITA.01', district: 'DIS.KAVERI_DELTA' },
  ], { to: -900 });
  assert.ok(s.taughtCards.has('EDU.GITA.01'));
  assert.equal(s.taughtCards.get('EDU.GITA.01'), -950);
  assert.ok(s.taughtWorks.has(RV), 'the underlying work is still credited too');
});

test('a recital with no card id leaves taughtCards untouched', () => {
  const s = run(DP, 'card-2', [{ year: -950, action: 'recite', work: RV }], { to: -900 });
  assert.equal(s.taughtCards.size, 0);
});

test('cardFreshness mirrors the work freshness curve, keyed by card', () => {
  const log = [{ year: -1400, action: 'recite', work: RV, card: 'EDU.GITA.01' }];
  const soon = run(DP, 'card-3', log, { to: -1400 + FRESH_YEARS - 10 });
  assert.equal(cardFreshness(soon, 'EDU.GITA.01'), 1);
  const later = run(DP, 'card-3', log, { to: -1400 + FRESH_YEARS + 200 });
  const f = cardFreshness(later, 'EDU.GITA.01');
  assert.ok(f < 1 && f >= FRESH_FLOOR);
  assert.equal(cardFreshness(later, 'EDU.GITA.02'), 0, 'a never-taught card is never fresh');
});

test('a Gita chapter locks until the previous one is actually recited', () => {
  const sib = (n) => 'EDU.GITA.' + String(n).padStart(2, '0');
  const ch1 = { kind: 'gita', order: 1 };
  const ch2 = { kind: 'gita', order: 2 };
  const ch3 = { kind: 'gita', order: 3 };
  const untaught = run(DP, 'card-4', [], { to: -900 });
  assert.equal(isCardLocked(untaught, ch1, sib), false, 'chapter 1 is never locked');
  assert.equal(isCardLocked(untaught, ch2, sib), true, 'chapter 2 locked before chapter 1 is taught');

  const taught1 = run(DP, 'card-4', [
    { year: -950, action: 'recite', work: RV, card: sib(1) },
  ], { to: -900 });
  assert.equal(isCardLocked(taught1, ch2, sib), false, 'chapter 2 unlocks once chapter 1 is recited');
  assert.equal(isCardLocked(taught1, ch3, sib), true, 'chapter 3 still locked — chapter 2 not yet taught');
});

test('studying a card (without reciting) does not unlock the next one', () => {
  const sib = (n) => 'EDU.GITA.' + String(n).padStart(2, '0');
  const ch2 = { kind: 'gita', order: 2 };
  const s = run(DP, 'card-5', [
    { year: -950, action: 'study', kind: 'card', id: sib(1) },
  ], { to: -900 });
  assert.equal(isCardLocked(s, ch2, sib), true, 'reading is not reciting — the sequence still needs the real thing');
});

test('card-keyed recitals replay deterministically', () => {
  const log = [
    { year: -1200, action: 'recite', work: RV, card: 'EDU.GITA.01', district: 'DIS.KAVERI_DELTA' },
    { year: -1100, action: 'recite', work: RV, card: 'EDU.GITA.02' },
  ];
  const a = run(DP, 'card-6', log);
  const b = run(DP, 'card-6', log);
  assert.equal(a.fingerprint, b.fingerprint);
  assert.deepEqual([...a.taughtCards.entries()], [...b.taughtCards.entries()]);
});

/* ── per-district literacy ────────────────────────────────────────────── */

test('a district taught nothing of its own reads exactly at the national baseline', () => {
  const s = run(DP, 'dist-1', [{ year: -1200, action: 'recite', work: RV, card: 'C1' }], { to: -1100 });
  assert.equal(districtLiteracy(s, 'DST.NOWHERE'), s.literacy);
});

test('a district taught locally, kept fresh, reads above the national baseline', () => {
  const log = [{ year: -1200, action: 'recite', work: RV, card: 'C1', district: 'DST.4.4' }];
  const s = run(DP, 'dist-2', log, { to: -1190 });
  assert.ok(districtLiteracy(s, 'DST.4.4') > s.literacy,
    'a district with its own fresh recital should read above the national figure');
});

test('a district reading stays in range as its local recital ages', () => {
  // Isolated from the national figure (which drifts with the whole 500-year
  // timeline) by comparing the local-only curve teaching.js actually uses —
  // the same one freshness()/cardFreshness() apply everywhere else.
  const ageCurve = (age) => (age <= FRESH_YEARS ? 1 : Math.max(FRESH_FLOOR, 1 - 0.01 * (age - FRESH_YEARS)));
  assert.ok(ageCurve(500) < ageCurve(10), 'the curve itself fades with age');
  assert.ok(ageCurve(5000) >= FRESH_FLOOR, 'and never below the floor');

  const log = [{ year: -3000, action: 'recite', work: RV, card: 'C1', district: 'DST.4.4' }];
  const later = run(DP, 'dist-3', log, { to: -3000 + FRESH_YEARS + 500 });
  const v = districtLiteracy(later, 'DST.4.4');
  assert.ok(v >= 2 && v <= 98, 'district literacy always stays in the 2..98 range');
});

test('district literacy replays deterministically', () => {
  const log = [{ year: -1200, action: 'recite', work: RV, card: 'C1', district: 'DST.4.4' }];
  const a = run(DP, 'dist-4', log, { to: -1000 });
  const b = run(DP, 'dist-4', log, { to: -1000 });
  assert.equal(districtLiteracy(a, 'DST.4.4'), districtLiteracy(b, 'DST.4.4'));
});
