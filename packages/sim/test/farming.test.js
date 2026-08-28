import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { FARM_COST, HERD_CAP } from '../src/farming.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

// The default homeRegion is RGN.TAMILAKAM (state.js); DST.4.1 sits in it,
// DST.4.5 (Gangetic) does not — a real district outside the player's state.
const HOME = 'DST.4.1';
const AWAY = 'DST.4.5';

test('a farm can be built in the home region and costs grain', () => {
  const before = run(DP, 'farm-1', [], { from: -5990, to: -5989 });
  const after = run(DP, 'farm-1',
    [{ year: -5990, action: 'build-farm', district: HOME }], { from: -5990, to: -5989 });
  assert.ok(after.farms.has(HOME), 'the farm should exist');
  assert.equal(after.farms.get(HOME).builtYear, -5990);
  assert.ok(before.grain - after.grain >= FARM_COST.grain - 1,
    'grain should have dropped by roughly the farm cost');
});

test('a farm cannot be built outside the home region', () => {
  const s = run(DP, 'farm-2',
    [{ year: -5990, action: 'build-farm', district: AWAY }], { to: -5980 });
  assert.ok(!s.farms.has(AWAY), 'building outside your state should be refused, silently');
  assert.equal(s.stats.farmsBuilt ?? 0, 0);
});

test('building twice in the same district does not double-charge or double-build', () => {
  const once = run(DP, 'farm-3',
    [{ year: -5990, action: 'build-farm', district: HOME }], { to: -5980 });
  const twice = run(DP, 'farm-3', [
    { year: -5990, action: 'build-farm', district: HOME },
    { year: -5985, action: 'build-farm', district: HOME },
  ], { to: -5980 });
  assert.equal(once.farms.size, twice.farms.size, 'a second attempt at the same district is a no-op');
  assert.equal(once.grain, twice.grain, 'no grain spent on the refused second attempt');
});

test('building without enough grain is refused', () => {
  const s = run(DP, 'farm-4',
    [{ year: -5990, action: 'build-farm', district: HOME }],
    { from: -5990, to: -5989, initial: { grain: FARM_COST.grain - 1 } });
  assert.ok(!s.farms.has(HOME));
});

test('a farm gives the district a visible reward and nudges AGRICULTURE', () => {
  const before = run(DP, 'farm-5', [], { to: -5980 });
  const after = run(DP, 'farm-5',
    [{ year: -5990, action: 'build-farm', district: HOME }], { to: -5980 });
  const dBefore = before.districts.get(HOME), dAfter = after.districts.get(HOME);
  assert.ok(dAfter.estimate > dBefore.estimate, 'the built district should read a bit more populated');
  assert.ok(after.pillars.AGRICULTURE > before.pillars.AGRICULTURE);
});

test('farming replays deterministically', () => {
  const log = [{ year: -5990, action: 'build-farm', district: HOME }];
  const a = run(DP, 'farm-6', log, { to: -5900 });
  const b = run(DP, 'farm-6', log, { to: -5900 });
  assert.equal(a.fingerprint, b.fingerprint);
});

/* ── livestock: a real herd ────────────────────────────────────────────── */

// Husbandry cards recite the same work as Agriculture (Krishi-Parashara,
// composed from 400) — recited right after so corpus decay (a real, working
// mechanic, just not what these tests are about) can't intermittently
// swallow it before the card gets recited, same reasoning as teaching.test.js's
// job tests.
const HUSBANDRY = { card: 'EDU.SKILL.CATTLE.1', work: 'WRK.KRISHIPARASHARA' };

test('a herd only grows once Husbandry is taught, and only at a built farm', () => {
  const noHerder = run(DP, 'herd-1',
    [{ year: 405, action: 'build-farm', district: HOME }], { to: 500 });
  assert.equal(noHerder.farms.get(HOME).herd, 0, 'no herd without the Husbandry card');

  const withHerder = run(DP, 'herd-1', [
    { year: 405, action: 'build-farm', district: HOME },
    { year: 406, action: 'recite', work: HUSBANDRY.work, card: HUSBANDRY.card },
  ], { to: 500 });
  const herd = withHerder.farms.get(HOME).herd;
  assert.ok(herd > 0 && herd <= HERD_CAP, `herd should grow within (0, ${HERD_CAP}], got ${herd}`);
});

test('herd size measurably raises carrying capacity beyond the taught-but-empty floor', () => {
  const log = [
    { year: 405, action: 'build-farm', district: HOME },
    { year: 406, action: 'recite', work: HUSBANDRY.work, card: HUSBANDRY.card },
  ];
  const justTaught = run(DP, 'herd-2', log, { to: 410 });
  const grown = run(DP, 'herd-2', log, { to: 800 });
  assert.ok(grown.farms.get(HOME).herd > justTaught.farms.get(HOME).herd,
    'more time with a herder taught should grow the herd further');
});

test('herding replays deterministically', () => {
  const log = [
    { year: 405, action: 'build-farm', district: HOME },
    { year: 406, action: 'recite', work: HUSBANDRY.work, card: HUSBANDRY.card },
  ];
  const a = run(DP, 'herd-3', log, { to: 700 });
  const b = run(DP, 'herd-3', log, { to: 700 });
  assert.equal(a.fingerprint, b.fingerprint);
});
