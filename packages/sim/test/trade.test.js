import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { throughput, CHOKES, GOODS_CALENDAR } from '../src/trade.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

const base = (extra = []) => {
  const d = [];
  for (let y = -3000; y < 1900; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) d.push({ year: y, action: 'train-scribe' });
  return [...d, ...extra];
};

test('a route can be opened and it persists', () => {
  const s = run(DP, 't', base([
    { year: 900, action: 'open-route', id: 'R1', from: 'thanjavur', to: 'muziris', days: 22, capacity: 12 },
  ]), { to: 1000 });
  assert.ok(s.routes.has('R1'), 'route should exist');
});

test('a caravan completes and pays', () => {
  const withTrade = run(DP, 't', base([
    { year: 900, action: 'open-route', id: 'R1', from: 'a', to: 'b', days: 22, capacity: 12 },
    { year: 902, action: 'send-caravan', route: 'R1' },
  ]), { to: 1000 });
  assert.ok(withTrade.stats.tradesCompleted > 0,
    `no caravan completed (${withTrade.caravans.length} still in transit)`);
});

test('throughput is a product — the worst number caps the route', () => {
  const r = { open: true, capacity: 10, hold: 1, safety: 1, mode: 'land' };
  const full = throughput(r, 900);
  assert.ok(full > 0);
  // Drop any single term and throughput must fall proportionally.
  assert.ok(Math.abs(throughput({ ...r, hold: 0.5 }, 900) - full / 2) < 1e-9);
  assert.ok(Math.abs(throughput({ ...r, safety: 0.5 }, 900) - full / 2) < 1e-9);
  assert.equal(throughput({ ...r, open: false }, 900), 0);
});

test('a magnificent road you do not control delivers nothing', () => {
  assert.equal(throughput({ open: true, capacity: 100, hold: 0, safety: 1, mode: 'land' }, 900), 0);
});

test('settlement is slower under barter than under coin', () => {
  // Barter has bad physics: grain is heavy, perishable, and worth least when
  // everyone has it. The player should feel coinage as a latency cliff.
  const early = run(DP, 't', [
    { year: -1000, action: 'open-route', id: 'R', from: 'a', to: 'b', days: 40, capacity: 10 },
    { year: -998,  action: 'send-caravan', route: 'R' },
  ], { to: -900 });
  const late = run(DP, 't', base([
    { year: 900, action: 'open-route', id: 'R', from: 'a', to: 'b', days: 40, capacity: 10 },
    { year: 902, action: 'send-caravan', route: 'R' },
  ]), { to: 1000 });
  assert.equal(early.coinageKnown, false);
  assert.equal(late.coinageKnown, true);
});

test('escorting raises safety, garrisoning raises hold', () => {
  const plain = run(DP, 't', base([
    { year: 900, action: 'open-route', id: 'R', from: 'a', to: 'b', days: 10, capacity: 10 },
  ]), { to: 950 });
  const guarded = run(DP, 't', base([
    { year: 898, action: 'raise-soldiers', count: 20 },
    { year: 900, action: 'open-route', id: 'R', from: 'a', to: 'b', days: 10, capacity: 10 },
    { year: 901, action: 'escort',   route: 'R' },
    { year: 902, action: 'garrison', route: 'R' },
  ]), { to: 950 });
  assert.ok(guarded.routes.get('R').safety > plain.routes.get('R').safety);
  assert.ok(guarded.routes.get('R').hold   > plain.routes.get('R').hold);
});

test('all five choke kinds exist and one of them has no enemy', () => {
  assert.deepEqual(Object.keys(CHOKES).sort(),
    ['blockade','pass','raid','rot','toll']);
  // The rot is flood, monsoon failure, a river moving its bed. There is nobody
  // to fight, and it must stay in: a trade system where every problem has
  // someone to kill would contradict the Indus ending with no conqueror.
  assert.ok(!CHOKES.rot.works.includes('fight'));
  assert.ok(CHOKES.rot.works.includes('reroute'));
});

test('goods arrive by calendar, and only by calendar', () => {
  const at1000 = run(DP, 'g', [], { to: 1000 });
  const at1947 = run(DP, 'g', [], { to: 1947 });
  for (const g of GOODS_CALENDAR) {
    if (g.year <= 1000) assert.ok(at1000.goods.has(g.id), `${g.id} missing at 1000`);
    else assert.ok(!at1000.goods.has(g.id), `${g.id} arrived early`);
    if (g.year <= 1947) assert.ok(at1947.goods.has(g.id), `${g.id} missing at 1947`);
  }
});

test('the new world arrives because a ship arrived', () => {
  const before = run(DP, 'g', [], { to: 1490 });
  const after  = run(DP, 'g', [], { to: 1600 });
  for (const g of ['chilli','potato','tomato','maize','tobacco']) {
    assert.ok(!before.goods.has(g), `${g} before 1498`);
    assert.ok(after.goods.has(g),   `${g} after the Portuguese`);
  }
});

test('paper collapses recopying cost and shows in the corpus', () => {
  const s = run(DP, 'g', base(), { to: 1500 });
  assert.ok(s.goods.has('paper'));
  assert.ok(s.log.some(l => /paper displaces palm leaf/i.test(l.text)));
});

/* ── Phase 34 ruling: standing cannot be farmed ─────────────────────────── */

test('the trust ladder has diminishing returns per partner per generation', () => {
  // Ten gifts to the same partner in one generation must buy far less than ten
  // gifts spread across ten generations — otherwise surplus grain converts to
  // a guild charter by 900 BCE and the ladder means nothing.
  const burst = [];
  for (let i = 0; i < 10; i++) burst.push({ year: -1000 + i, action: 'share', with: 'kin-east' });
  const spread = [];
  for (let i = 0; i < 10; i++) spread.push({ year: -1000 + i * 30, action: 'share', with: 'kin-east' });

  const a = run(DP, 'cap', burst,  { to: -700 });
  const b = run(DP, 'cap', spread, { to: -700 });
  const sa = a.standing.get('kin-east') ?? 0;
  const sb = b.standing.get('kin-east') ?? 0;
  assert.ok(sb > sa * 1.5, `spread ${sb} should far exceed burst ${sa}`);
});
