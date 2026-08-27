import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
};

test('the ledger flows are recorded at the till, and are deterministic', () => {
  const d = [{ year: -3000, action: 'patronise' }, { year: -2900, action: 'train-scribe' }];
  const a = run(DP, 'flows', d, { to: -2000 });
  const b = run(DP, 'flows', d, { to: -2000 });
  assert.deepEqual(a.flows, b.flows);
  assert.ok(a.flows.harvest > 0, 'harvest flows in');
  assert.ok(a.flows['keepers fed'] < 0, 'keepers are fed from the granary');
  assert.equal(a.flows.patronage, -50);
  assert.equal(a.flows.training, -80);
});

test('the standing patronage is a policy, not a conjuring trick', () => {
  const to = -4000;
  const none   = run(DP, 'pat', [], { to });
  const lavish = run(DP, 'pat', [{ year: -5900, action: 'set-patronage', level: 'lavish' }], { to });
  assert.ok(lavish.pops.reciters > none.pops.reciters,
    `lavish must grow the bench: ${lavish.pops.reciters} vs ${none.pops.reciters}`);
  assert.ok(lavish.pops.reciters <= 12, 'and stop at its ceiling');
  assert.ok((lavish.flows.patronage ?? 0) < 0, 'and pay for every keeping');
});

test('steady patronage respects the grain floor at the moment of hiring', () => {
  // One tick, arriving under the floor: no keeping. Same tick, over it: one.
  // (Over a longer window the harvest lifts the granary and hiring resumes —
  // which is the policy working, not the floor failing; the first draft of
  // this test asserted that and was wrong.)
  const poor = run(DP, 'floor', [{ year: -6000, action: 'set-patronage', level: 'steady' }],
    { to: -5996, initial: { grain: 60 } });
  assert.equal(poor.flows.patronage ?? 0, 0, 'no keeping bought under the floor');
  const fed = run(DP, 'floor', [{ year: -6000, action: 'set-patronage', level: 'steady' }],
    { to: -5996, initial: { grain: 400 } });
  assert.equal(fed.flows.patronage, -50, 'one keeping per tick once fed');
});

test('an invalid patronage level is refused silently, not applied', () => {
  const s = run(DP, 'bad', [{ year: -5900, action: 'set-patronage', level: 'imperial' }], { to: -5800 });
  assert.equal(s.patronage, 'none');
});
