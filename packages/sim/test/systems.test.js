import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { LAYERS, yieldTo, holdingsOf, contested, mandalaAt } from '../src/sovereignty.js';
import { blocked, locked, trustRung, nextRung, TRUST_RUNGS, GATES } from '../src/pillars.js';
import { frontierPresent, frontierLedger, PEOPLES, STANCE } from '../src/frontier.js';
import { bumpPillar } from '../src/state.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
  polities: read('../../../data/polities/polities.json'),
};
const tending = () => {
  const d = [];
  for (let y = -3000; y < 1900; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) d.push({ year: y, action: 'train-scribe' });
  return d;
};

/* ── Sovereignty ────────────────────────────────────────────────────────── */

test('a district can be held, taxed, tributary and paramount all at once', () => {
  const s0 = run(DP, 'sov', [], { to: 900 });
  const id = [...s0.districts.keys()][5];
  const d = [
    { year: 900, action: 'claim', district: id, layer: 'holder',    holder: 'you',    strength: 0.9 },
    { year: 901, action: 'claim', district: id, layer: 'revenue',   holder: 'chola',  strength: 0.7 },
    { year: 902, action: 'claim', district: id, layer: 'tributary', holder: 'pandya', strength: 0.5 },
    { year: 903, action: 'claim', district: id, layer: 'paramount', holder: 'chola',  strength: 0.3 },
  ];
  const s = run(DP, 'sov', d, { to: 950 });
  const c = s.claims.get(id);
  assert.equal(c.holder, 'you');
  assert.equal(c.revenue, 'chola');
  assert.equal(c.tributary, 'pandya');
  assert.equal(c.paramount, 'chola');
  assert.equal(new Set(LAYERS.map(l => c[l])).size, 3, 'three different parties');
});

test('holding ground you do not tax is worth less than taxing ground you do not hold', () => {
  const s0 = run(DP, 'sov', [], { to: 900 });
  const a = [...s0.districts.keys()][1], b = [...s0.districts.keys()][2];
  const s = run(DP, 'sov', [
    { year: 900, action: 'claim', district: a, layer: 'holder',  holder: 'you', strength: 1 },
    { year: 900, action: 'claim', district: b, layer: 'revenue', holder: 'you', strength: 1 },
  ], { to: 950 });
  assert.ok(yieldTo(s, b, 'you') > yieldTo(s, a, 'you'),
    'revenue is the layer that pays, which is why it was fought over');
});

test('a contested district reports every party with a claim', () => {
  const s0 = run(DP, 'sov', [], { to: 900 });
  const id = [...s0.districts.keys()][7];
  const s = run(DP, 'sov', [
    { year: 900, action: 'claim', district: id, layer: 'holder',  holder: 'you' },
    { year: 900, action: 'claim', district: id, layer: 'revenue', holder: 'rashtrakuta' },
  ], { to: 950 });
  const c = contested(s).find(x => x.district === id);
  assert.ok(c, 'this district is contested');
  assert.deepEqual(c.parties.sort(), ['rashtrakuta', 'you']);
});

test('the mandala is a gradient, not a border', () => {
  const s = run(DP, 'sov', [], { to: 900 });
  const ids = [...s.districts.keys()];
  const centre = { lon: 79.1, lat: 10.8 };          // Thanjavur
  const vals = ids.map(id => mandalaAt(s, id, centre, 12)).sort((a, b) => b - a);
  assert.ok(vals[0] > 0.8, 'the centre is plainly inside');
  assert.ok(vals[vals.length - 1] === 0, 'the far edge is plainly outside');
  const partial = vals.filter(v => v > 0.05 && v < 0.85);
  assert.ok(partial.length >= 5, 'and a real number of places are ambiguously inside');
});

test('holdings can be listed per layer', () => {
  const s0 = run(DP, 'sov', [], { to: 900 });
  // Pick districts outside the home region, which starts held (phase 49) —
  // claiming what you already hold adds nothing to the count.
  const ids = [...s0.districts.values()]
    .filter(d => d.region !== s0.homeRegion).slice(0, 3).map(d => d.id);
  const s = run(DP, 'sov', ids.map((id, i) =>
    ({ year: 900 + i, action: 'claim', district: id, layer: 'revenue', holder: 'you' })), { to: 950 });
  // Since phase 49 the home region is held from the start — a campaign
  // begins as a small power somewhere, not as a ghost — so the claims land
  // on top of a baseline instead of on nothing.
  const base = run(DP, 'sov', [], { to: 950 });
  assert.equal(holdingsOf(s, 'you').revenue.length,
               holdingsOf(base, 'you').revenue.length + 3);
  assert.equal(holdingsOf(s, 'you').holder.length,
               holdingsOf(base, 'you').holder.length);
  assert.ok(holdingsOf(base, 'you').holder.length > 0,
    'the home region starts held');
});

/* ── Pillars that bite ──────────────────────────────────────────────────── */

test('every gate names a pillar, a threshold and a reason', () => {
  for (const [action, g] of Object.entries(GATES)) {
    assert.ok(g.pillar && g.need > 0, `${action} is not a real gate`);
    assert.ok(g.why.length > 25, `${action} gives no reason`);
  }
});

test('the opening position cannot write, teach abroad, or garrison', () => {
  const s = run(DP, 'gate', [], { to: -5900 });
  for (const a of ['train-scribe', 'copy', 'send-teacher', 'garrison']) {
    const b = blocked(s, a);
    assert.ok(b, `${a} should be locked at the start of the game`);
    assert.equal(b.pillar, GATES[a].pillar);
  }
});

test('a gate opens when its pillar rises, and says what opened it', () => {
  const early = run(DP, 'gate', [], { to: -5900 });
  const late  = run(DP, 'gate', tending(), { to: 900 });
  assert.ok(blocked(early, 'train-scribe'), 'locked early');
  assert.equal(blocked(late, 'train-scribe'), null, 'open later');
});

test('a blocked decision is refused, not silently half-applied', () => {
  const s = run(DP, 'gate', [{ year: -5900, action: 'train-scribe' }], { to: -5800 });
  assert.equal(s.pops.scribes, 0);
  assert.ok(s.stats.blocked > 0, 'the refusal should be counted');
});

test('the trust ladder climbs with NETWORKING and ends at a state treaty', () => {
  const early = run(DP, 'gate', [], { to: -5900 });
  const late  = run(DP, 'gate', tending(), { to: 1200 });
  assert.equal(trustRung(early).name, 'kin', 'you start with your relatives');
  assert.ok(trustRung(late).rung > trustRung(early).rung);
  assert.equal(TRUST_RUNGS[TRUST_RUNGS.length - 1].name, 'state treaty');
});

test('nextRung tells the player what they are short of', () => {
  const s = run(DP, 'gate', [], { to: -5900 });
  const n = nextRung(s);
  assert.ok(n && n.need > s.pillars.NETWORKING);
});

test('locked() gives the interface a horizon to show', () => {
  const s = run(DP, 'gate', [], { to: -5900 });
  const l = locked(s);
  assert.ok(l.length >= 4);
  for (const x of l) assert.ok(x.block.why);
});

/* ── The frontier ───────────────────────────────────────────────────────── */

test('frontier peoples have knowledge, not just a position', () => {
  for (const p of PEOPLES) {
    assert.ok(p.knows.length > 0, `${p.id} knows nothing, which is the error to avoid`);
    assert.ok(p.practice, `${p.id} has no practice`);
  }
});

test('they appear on their own dates', () => {
  const early = run(DP, 'fr', [], { to: -3000 });
  const late  = run(DP, 'fr', [], { to: 900 });
  assert.ok(frontierPresent(early).length >= 1);
  assert.ok(frontierPresent(late).length > frontierPresent(early).length);
});

test('you can learn from them, and it enters your pillars', () => {
  const s0 = run(DP, 'fr', tending(), { to: 900 });
  const target = frontierPresent(s0)[0];
  const plain = run(DP, 'fr', tending(), { to: 1000 });
  const taught = run(DP, 'fr', [...tending(),
    { year: 900, action: 'frontier', people: target.id, how: 'learn' }], { to: 1000 });
  assert.ok(taught.stats.learnedFromFrontier > 0);
  assert.ok(taught.pillars.CULTIVATION > plain.pillars.CULTIVATION);
  const led = frontierLedger(taught).find(x => x.id === target.id);
  assert.ok(led.taught.length > 0, 'the ledger records what they taught you');
});

test('clearing them is available, costly, and remembered', () => {
  const s0 = run(DP, 'fr', tending(), { to: 900 });
  const target = frontierPresent(s0)[0];
  // Measured just after the act. A pillar penalty washes out once the pillar
  // is near its ceiling, which is exactly why the lasting cost is standing with
  // the people themselves and not a number on a gauge.
  const plain = run(DP, 'fr', tending(), { to: 905 });
  const cleared = run(DP, 'fr', [...tending(),
    { year: 900, action: 'frontier', people: target.id, how: 'clear' }], { to: 905 });
  assert.ok(cleared.stats.displaced > 0);
  assert.ok(cleared.pillars.AGRICULTURE > plain.pillars.AGRICULTURE, 'it does gain you land');
  assert.ok(cleared.frontier.get(target.id).standing < plain.frontier.get(target.id).standing,
    'and it costs you standing with them, permanently');
  const led = frontierLedger(cleared).find(x => x.id === target.id);
  assert.ok(led.displaced > 0, 'the ledger keeps the score');
});

test('the clearance line advances on its own once iron is common', () => {
  // A pressure the player exerts by existing, not only by deciding.
  const s = run(DP, 'fr', tending(), { to: 1500 });
  const pressed = [...s.frontier.values()].filter(f => f.displaced > 0);
  assert.ok(pressed.length > 0, 'settled agriculture should press on the treeline unprompted');
});

test('a people displaced entirely takes their knowledge with them', () => {
  const s0 = run(DP, 'fr', tending(), { to: 900 });
  const t = frontierPresent(s0)[0].id;
  const d = [...tending()];
  for (let i = 0; i < 4; i++) d.push({ year: 900 + i * 20, action: 'frontier', people: t, how: 'clear' });
  const s = run(DP, 'fr', d, { to: 1200 });
  const f = s.frontier.get(t);
  assert.ok(f.displaced >= 1, `displaced only ${f.displaced}`);
  assert.equal(f.present, false);
  assert.ok(s.log.some(l => l.people === t && l.displaced), 'and the log says so');
});

test('none of this breaks the rule', () => {
  const s0 = run(DP, 'det', [], { to: 900 });
  const d = [...tending(),
    { year: 900, action: 'claim', district: [...s0.districts.keys()][0], layer: 'revenue', holder: 'you' },
    { year: 901, action: 'frontier', people: 'FRT.GOND', how: 'learn' }];
  assert.equal(run(DP, 'det', d).fingerprint, run(DP, 'det', d).fingerprint);
});

test('the plough presses on its own but does not finish anyone off', () => {
  // Left entirely alone across the whole campaign, no frontier people should be
  // gone. Pressure is a fact of the period; extinction is a decision, and the
  // game must not make it on the player's behalf while they look elsewhere.
  const s = run(DP, 'fr', tending(), { to: 1947 });
  for (const f of s.frontier.values())
    assert.ok(f.displaced <= 0.5 + 1e-9,
      `${f.name} were displaced ${(f.displaced * 100) | 0}% with nobody deciding anything`);
});

test('standing does not rot from neglect', () => {
  const s = run(DP, 'fr', tending(), { to: 1200 });
  for (const f of s.frontier.values())
    assert.ok(f.standing > 0, `${f.name} are at zero regard and you never did anything to them`);
});

/* ── Pillars stay legible at eleven hundred events (phase 28) ────────────── */

test('no pillar pegs at its ceiling with a century of play still to come', () => {
  // A flat delta pegged seven of the eight at 100 before the year 1000, which
  // made every decision after that read the same. The gauges have to keep
  // meaning something to the end of the campaign.
  const tend = [];
  for (let y = -3000; y < 1900; y += 100) tend.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) tend.push({ year: y, action: 'train-scribe' });
  const s = run(DP, 'ceiling', tend, { to: 1800 });
  for (const [name, v] of Object.entries(s.pillars))
    assert.ok(v < 99.5, `${name} is pegged at ${v.toFixed(1)} with 147 years left`);
});

test('a gain still moves a pillar that is already high', () => {
  // Diminishing returns must diminish, not stop. A pillar at 99 that cannot be
  // moved at all is a pegged pillar wearing a curve.
  const st = { pillars: { IT: 99 } };
  bumpPillar(st, 'IT', 4);
  assert.ok(st.pillars.IT > 99, `99 + 4 gave ${st.pillars.IT}`);
  assert.ok(st.pillars.IT < 100, 'and it must not reach the ceiling');

  const low = { pillars: { IT: 10 } };
  bumpPillar(low, 'IT', 4);
  assert.ok(low.pillars.IT - 10 > st.pillars.IT - 99,
    'the same gain must be worth more when there is further to go');
});
