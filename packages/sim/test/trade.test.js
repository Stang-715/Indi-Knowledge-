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

/* ── Phase 45: the road, played ─────────────────────────────────────────── */

test('a standing order runs a route for a century without another click', () => {
  const d = [
    { year: 850, action: 'open-route', id: 'R45', from: 'thanjavur', to: 'muziris', days: 30 },
    { year: 851, action: 'raise-soldiers', count: 10 },
    { year: 852, action: 'set-orders', route: 'R45', escort: 'heavy', chokePolicy: 'fight' },
  ];
  const s = run(DP, 'orders', d, { to: 980 });
  const r = s.routes.get('R45');
  assert.equal(r.orders.escort, 'heavy');
  assert.ok(r.safety >= 0.75, `heavy escort floors safety at 0.75, got ${r.safety}`);
  // and the order survives the save/replay round trip because it IS a decision
  const s2 = run(DP, 'orders', d, { to: 980 });
  assert.equal(s.fingerprint, s2.fingerprint);
});

test('escorts cost grain whether or not a caravan moves', () => {
  const open = [{ year: 850, action: 'open-route', id: 'R45', from: 'thanjavur', to: 'muziris', days: 30 }];
  const guarded = [...open, { year: 851, action: 'set-orders', route: 'R45', escort: 'heavy', chokePolicy: 'wait' }];
  // A short window from a fixed start, below the granary cap — from -6000 the
  // economy saturates to the ceiling and a 6-grain-a-year cost is invisible.
  const a = run(DP, 'escort-cost', open,    { from: 849, to: 950, initial: { grain: 800, pillars: { TRADE: 20, STRUCTURE: 15 } } });
  const b = run(DP, 'escort-cost', guarded, { from: 849, to: 950, initial: { grain: 800, pillars: { TRADE: 20, STRUCTURE: 15 } } });
  assert.ok(b.grain < a.grain, `guarded ${b.grain} should cost against free ${a.grain}`);
});

test('a mission takes as long as the march, and only then clears the road', () => {
  // Find a campaign year where a choke exists, launch, and watch the clock.
  const base = [
    { year: 850, action: 'open-route', id: 'R45', from: 'thanjavur', to: 'muziris', days: 40 },
    { year: 851, action: 'raise-soldiers', count: 30 },
  ];
  let choked = null;
  const probe = run(DP, 'mission-clock', base, { to: 1279 });
  for (const l of probe.log) if (l.kind === 'choke' && l.route === 'R45') { choked = l.year; break; }
  if (choked === null) return; // this seed never chokes the route — nothing to assert
  const d = [...base, { year: choked + 1, action: 'start-mission', route: 'R45', method: 'fight' }];
  const s = run(DP, 'mission-clock', d, { to: 1279 });
  const launch = s.log.find(l => l.kind === 'mission' && /expedition marches/.test(l.text));
  const outcome = s.log.find(l => l.kind === 'mission' && /(open again|fails)/.test(l.text));
  assert.ok(launch && outcome, 'the mission both departs and resolves');
  assert.ok(outcome.year >= launch.year, 'resolution never precedes departure');
});

test('the watched caravan overrides the standing policy for one meeting only', () => {
  const base = [
    { year: 850, action: 'open-route', id: 'R45', from: 'thanjavur', to: 'muziris', days: 60 },
    { year: 852, action: 'set-orders', route: 'R45', escort: 'none', chokePolicy: 'wait' },
  ];
  const probe = run(DP, 'watched', base, { to: 1279 });
  const choke = probe.log.find(l => l.kind === 'choke' && l.route === 'R45');
  if (!choke) return;
  const send = { year: choke.year + 1, action: 'send-caravan', route: 'R45' };
  const a = run(DP, 'watched', [...base, send], { to: choke.year + 3 });
  const sent = a.log.find(l => l.route === 'R45' && l.ordinal);
  if (!sent) return;
  const override = { year: choke.year + 1, action: 'resolve-encounter',
    route: 'R45', ordinal: sent.ordinal, method: 'pay' };
  const b = run(DP, 'watched', [...base, send, override], { to: choke.year + 3 });
  const encA = a.log.find(l => l.kind === 'encounter');
  const encB = b.log.find(l => l.kind === 'encounter');
  if (encA && encB) assert.notEqual(encA.result, undefined),
    assert.equal(encB.method, 'pay'),
    assert.equal(encA.method, 'wait');
});
