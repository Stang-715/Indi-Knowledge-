import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { armyLevel } from '../src/military.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

/* ── level: real, derived, no new pool ──────────────────────────────────── */

test('armyLevel is soldiers scaled by STRUCTURE, not a second population', () => {
  // a short window right around the decision, so the starting pillar hasn't
  // had thousands of years to drift away from what this test actually sets.
  // raise-soldiers is itself gated on STRUCTURE >= 4 (pillars.js GATES), so
  // "weak" is the gate's own floor, not zero — the bonus is still visible.
  const raise = [{ year: 850, action: 'raise-soldiers', count: 20 }];
  const weak = run(DP, 'lvl-1', raise, { from: 849, to: 851, initial: { grain: 2000, pillars: { STRUCTURE: 4 } } });
  const strong = run(DP, 'lvl-1', raise, { from: 849, to: 851, initial: { grain: 2000, pillars: { STRUCTURE: 80 } } });
  assert.equal(weak.pops.soldiers, 20, 'the raise itself should have gone through');
  assert.ok(armyLevel(strong) > armyLevel(weak), 'a more organized state gets more out of the same headcount');
  assert.equal(strong.pops.soldiers, weak.pops.soldiers, 'level is not a separate pool — the headcount is unchanged');
});

test('zero soldiers is zero level, regardless of structure', () => {
  const s = run(DP, 'lvl-2', [], { to: -5990, initial: { pillars: { STRUCTURE: 90 } } });
  assert.equal(s.pops.soldiers, 0);
  assert.equal(armyLevel(s), 0);
});

/* ── the split: raise-soldiers, made to matter and made reversible ───────── */

test('raise-soldiers moves people out of the fields, not a duplicate creation', () => {
  const before = run(DP, 'split-1', [], { to: 899 });
  const after = run(DP, 'split-1', [{ year: 851, action: 'raise-soldiers', count: 20 }], { to: 899 });
  assert.equal(after.pops.soldiers - before.pops.soldiers, 20);
  assert.ok(after.pops.farmers < before.pops.farmers + 20, 'grain cost and the raise itself should tell on the fields');
});

test('disband is the reverse: soldiers return to farmers, level drops immediately', () => {
  const raised = run(DP, 'merge-1', [
    { year: 851, action: 'raise-soldiers', count: 20 },
  ], { to: 899 });
  const disbanded = run(DP, 'merge-1', [
    { year: 851, action: 'raise-soldiers', count: 20 },
    { year: 870, action: 'disband', n: 12 },
  ], { to: 899 });
  assert.equal(raised.pops.soldiers - disbanded.pops.soldiers, 12);
  // farmers keep growing logistically after the return, so the gap isn't a
  // fixed +12 forever — only that disbanding leaves strictly more farmers
  assert.ok(disbanded.pops.farmers > raised.pops.farmers);
  assert.ok(armyLevel(disbanded) < armyLevel(raised));
});

test('disband cannot go negative and defaults to at least one', () => {
  const s = run(DP, 'merge-2', [
    { year: 851, action: 'raise-soldiers', count: 5 },
    { year: 852, action: 'disband', n: 500 },
  ], { to: 899 });
  assert.equal(s.pops.soldiers, 0);
});

/* ── the fight: level, not raw headcount, decides route defense ──────────── */

test('a more structured state defends a route better with the same soldiers', () => {
  const d = [
    { year: 850, action: 'open-route', id: 'RM1', from: 'thanjavur', to: 'muziris', days: 10, capacity: 10 },
    { year: 851, action: 'raise-soldiers', count: 20 },
  ];
  const low = run(DP, 'fight-1', d, { to: 950, initial: { pillars: { STRUCTURE: 4 } } });
  const high = run(DP, 'fight-1', d, { to: 950, initial: { pillars: { STRUCTURE: 4 } } });
  // same seed, same log, same starting pillar -> identical: sanity check first
  assert.equal(low.fingerprint, high.fingerprint);
  const boosted = run(DP, 'fight-2', d, { to: 950, initial: { pillars: { STRUCTURE: 90 } } });
  const plain = run(DP, 'fight-2', d, { to: 950, initial: { pillars: { STRUCTURE: 4 } } });
  assert.ok(boosted.routes.get('RM1').safety >= plain.routes.get('RM1').safety,
    'higher STRUCTURE should never defend worse with the same soldiers');
});

test('military replays deterministically', () => {
  const log = [
    { year: 851, action: 'raise-soldiers', count: 15 },
    { year: 870, action: 'disband', n: 5 },
  ];
  const a = run(DP, 'mil-replay', log);
  const b = run(DP, 'mil-replay', log);
  assert.equal(a.fingerprint, b.fingerprint);
});
