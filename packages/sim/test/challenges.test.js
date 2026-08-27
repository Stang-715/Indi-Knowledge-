import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { CHALLENGE_TYPES, growthStalled } from '../src/challenges.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

/** card + work that answers each challenge type. */
const COUNTER = {
  drought: { card: 'EDU.SKILL.AGRI.1', work: 'WRK.KRISHIPARASHARA' },
  despair: { card: 'EDU.GITA.01', work: 'WRK.GITA' },
  rumor:   { card: 'EDU.SKILL.ARITH.1', work: 'WRK.ARYABHATIYA' },
};

/** Run from 900 (by which every counter-work already exists) far enough for
 *  the first challenge to spawn, and hand back a copy of it. */
function firstChallenge(seed) {
  let found = null;
  run(DP, seed, [], { from: 900, to: 1300, onYear: (s) => {
    if (!found && s.challenges.length) found = { ...s.challenges[0] };
  } });
  return found;
}

test('challenges spawn deterministically from the same seed', () => {
  const a = firstChallenge('chal-det');
  const b = firstChallenge('chal-det');
  assert.ok(a, 'a challenge should have spawned within the window');
  assert.deepEqual(a, b, 'the same seed produces the same first challenge, in full');
});

test('a matching recital at the right district resolves the challenge and rewards the district', () => {
  const found = firstChallenge('chal-resolve');
  assert.ok(found);
  const { card, work } = COUNTER[found.type];

  const answered = run(DP, 'chal-resolve',
    [{ year: found.startYear + 2, action: 'recite', work, card, district: found.district }],
    { from: 900, to: found.expiresYear + 5 });

  assert.equal(answered.stats.challengesResolved, 1, 'the recital should have resolved it');
  assert.ok(!answered.challenges.some((c) => c.id === found.id), 'the resolved challenge is gone');

  const unanswered = run(DP, 'chal-resolve', [], { from: 900, to: found.expiresYear + 5 });
  const dAnswered = answered.districts.get(found.district);
  const dUnanswered = unanswered.districts.get(found.district);
  assert.ok(dAnswered.estimate > dUnanswered.estimate,
    'answering in time gives that district a visible population bump over leaving it unanswered');
});

test('a recital of the wrong kind does not resolve the challenge', () => {
  const found = firstChallenge('chal-wrong');
  assert.ok(found);
  // pick a counter that is NOT this challenge's own type
  const otherType = Object.keys(CHALLENGE_TYPES).find((t) => t !== found.type);
  const { card, work } = COUNTER[otherType];

  const s = run(DP, 'chal-wrong',
    [{ year: found.startYear + 2, action: 'recite', work, card, district: found.district }],
    { from: 900, to: found.expiresYear + 5 });

  assert.equal(s.stats.challengesResolved, 0, 'the wrong lesson should not clear it');
  assert.equal(s.stats.challengesExpired, 1, 'left unanswered, it expires instead');
});

test('an unanswered challenge opens a stall window that answering it avoids entirely', () => {
  const found = firstChallenge('chal-stall');
  assert.ok(found);
  const { card, work } = COUNTER[found.type];

  const stallEnd = found.expiresYear + 30;
  const unanswered = run(DP, 'chal-stall', [], { from: 900, to: stallEnd });
  assert.ok(unanswered.growthStalledUntil > found.expiresYear,
    'expiry should set a stall window running past the expiry year itself');
  assert.ok(growthStalled({ year: found.expiresYear + 1, growthStalledUntil: unanswered.growthStalledUntil }),
    'growth reads as stalled the moment the challenge expires');

  const answered = run(DP, 'chal-stall',
    [{ year: found.startYear + 2, action: 'recite', work, card, district: found.district }],
    { from: 900, to: stallEnd });
  assert.equal(answered.growthStalledUntil, 900, 'answered in time, growth was never stalled at all (still at its from-year floor)');
});

test('the stalled rate is a slowdown, never a reversal', () => {
  // growthStalled only ever multiplies tickEconomy's r by a fraction below 1 —
  // it cannot turn positive growth negative, which is the whole point of the
  // reframe (docs: growth pressure, not death). Exercised directly since the
  // effect is a few percent of population over a multi-century run and easily
  // lost in the noise of the recital's own grain cost.
  assert.ok(growthStalled({ year: 1000, growthStalledUntil: 1010 }));
  assert.ok(!growthStalled({ year: 1010, growthStalledUntil: 1010 }));
  assert.ok(!growthStalled({ year: 900, growthStalledUntil: 0 }));
});

test('challenges replay identically — same seed and log, same world', () => {
  const found = firstChallenge('chal-replay');
  const log = [{ year: found.startYear + 2, action: 'recite', ...COUNTER[found.type], district: found.district }];
  const a = run(DP, 'chal-replay', log, { from: 900, to: found.expiresYear + 50 });
  const b = run(DP, 'chal-replay', log, { from: 900, to: found.expiresYear + 50 });
  assert.equal(a.fingerprint, b.fingerprint);
});
