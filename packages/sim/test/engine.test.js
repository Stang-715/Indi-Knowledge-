import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { corpusSummary, worksAtRisk } from '../src/corpus.js';

const DP = {
  timeline: JSON.parse(readFileSync(new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8')),
  works:    JSON.parse(readFileSync(new URL('../../../data/corpus/works.json',      import.meta.url), 'utf8')),
};

/* ── The property the whole design rests on ─────────────────────────────── */

test('THE RULE: same seed and same decisions give a byte-identical world', () => {
  const decisions = [
    { year: -1000, action: 'patronise' },
    { year: -500,  action: 'raise-soldiers', count: 10 },
    { year: 200,   action: 'open-route', id: 'R1', from: 'thanjavur', to: 'muziris', days: 40 },
    { year: 900,   action: 'send-caravan', route: 'R1' },
  ];
  const a = run(DP, 'campaign-1', decisions);
  const b = run(DP, 'campaign-1', decisions);
  assert.equal(a.fingerprint, b.fingerprint);
});

test('a different seed gives a different world', () => {
  const a = run(DP, 'campaign-1', []);
  const b = run(DP, 'campaign-2', []);
  assert.notEqual(a.fingerprint, b.fingerprint);
});

test('a different decision log gives a different world', () => {
  const a = run(DP, 'same-seed', []);
  const b = run(DP, 'same-seed', [{ year: -1000, action: 'patronise' }]);
  assert.notEqual(a.fingerprint, b.fingerprint);
});

test('replay from a partial log reproduces the same prefix', () => {
  const log = [{ year: -2000, action: 'patronise' }, { year: -1000, action: 'patronise' }];
  const full = run(DP, 's', log, { to: 0 });
  const again = run(DP, 's', log, { to: 0 });
  assert.equal(full.fingerprint, again.fingerprint);
});

test('a full campaign completes in well under ten seconds', () => {
  const t0 = Date.now();
  run(DP, 'perf', []);
  assert.ok(Date.now() - t0 < 10000, 'headless campaign must be fast');
});

test('the campaign reaches 1947', () => {
  assert.equal(run(DP, 's', []).year, 1947);
});

/* ── The knowledge economy ──────────────────────────────────────────────── */

test('a work is never deleted, only reduced to zero carriers', () => {
  const s = run(DP, 'loss-test', []);
  assert.equal(s.corpus.size, DP.works.works.length, 'corpus size never shrinks');
  const lost = [...s.corpus.values()].filter(c => c.lost);
  assert.ok(lost.length > 0);
  for (const c of lost) {
    assert.ok(c.title, 'a lost work keeps its title');
    assert.ok(c.lostYear !== null, 'a lost work keeps its year of loss');
    assert.equal(c.carriers.length, 0);
  }
});

test('neglect is the bigger killer for a corpus nobody is keeping', () => {
  const s = run(DP, 'neglect', []);
  const by = s.log.filter(l => l.kind === 'loss')
    .reduce((m, l) => (m[l.cause] = (m[l.cause] ?? 0) + 1, m), {});
  assert.ok((by.neglect ?? 0) > (by.catastrophe ?? 0),
    `neglect ${by.neglect} should exceed catastrophe ${by.catastrophe}`);
});

test('upkeep beats neglect, and only distance beats catastrophe', () => {
  // The two halves of the design, stated as one assertion. Tending the corpus
  // — reciters fed, scribes working — removes neglect as a cause entirely.
  // What it cannot remove is fire, because every copy is still in one place.
  const tending = [];
  for (let y = -3000; y < 1900; y += 100) tending.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) tending.push({ year: y, action: 'train-scribe' });
  const s = run(DP, 'neglect', tending);
  const by = s.log.filter(l => l.kind === 'loss')
    .reduce((m, l) => (m[l.cause] = (m[l.cause] ?? 0) + 1, m), {});
  assert.equal(by.neglect ?? 0, 0, 'a tended corpus should lose nothing to rot');
  assert.ok((by.catastrophe ?? 0) > 0, 'fire is the residual risk upkeep cannot touch');
});

test('tending the corpus roughly triples what survives to 1947', () => {
  const idle = corpusSummary(run(DP, 'compare-2', []));
  const tending = [];
  for (let y = -3000; y < 1900; y += 100) tending.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) tending.push({ year: y, action: 'train-scribe' });
  const kept = corpusSummary(run(DP, 'compare-2', tending));
  assert.ok(kept.extant > idle.extant * 2,
    `tended ${kept.extant} vs idle ${idle.extant}`);
});

test('doing nothing loses most of the corpus', () => {
  const s = run(DP, 'do-nothing', []);
  const sum = corpusSummary(s);
  assert.ok(sum.lost > sum.extant, 'an unattended corpus should not survive');
});

test('patronage and copying save works that would otherwise be lost', () => {
  const idle = run(DP, 'compare', []);
  const decisions = [];
  // Feed reciters steadily across the whole campaign.
  for (let y = -3000; y < 1900; y += 50) decisions.push({ year: y, action: 'patronise' });
  const tended = run(DP, 'compare', decisions);
  assert.ok(tended.pops.reciters > idle.pops.reciters);
  assert.ok(tended.stats.worksLost <= idle.stats.worksLost,
    `tended lost ${tended.stats.worksLost}, idle lost ${idle.stats.worksLost}`);
});

test('worksAtRisk finds works that exist in exactly one place', () => {
  const s = run(DP, 'risk', [], { to: 1100 });
  const risk = worksAtRisk(s, 'home');
  for (const r of risk) {
    const c = s.corpus.get(r.id);
    assert.ok(c.carriers.every(x => x.place === 'home'));
  }
});

test('a copy abroad survives a catastrophe at home', () => {
  // Build a tiny world and prove the mechanic in isolation.
  const s = run(DP, 'rescue', [], { to: 1000 });
  const alive = [...s.corpus.values()].filter(c => c.exists && !c.lost);
  assert.ok(alive.length > 0, 'something should still exist in 1000 CE');
});

/* ── Trade ──────────────────────────────────────────────────────────────── */

test('goods arrive because history delivers them, not on a tech unlock', () => {
  const early = run(DP, 'g', [], { to: 1000 });
  const late  = run(DP, 'g', [], { to: 1947 });
  assert.ok(!early.goods.has('potato'), 'no potato before 1498');
  assert.ok(late.goods.has('potato'),   'potato after the Portuguese');
  assert.ok(!early.goods.has('paper'),  'no paper before ~1350');
  assert.ok(late.goods.has('paper'));
});

test('coinage arrives and changes settlement', () => {
  const s = run(DP, 'coin', []);
  assert.ok(s.coinageKnown, 'coinage should be discovered during the campaign');
});

test('pillars grow over a campaign', () => {
  const s = run(DP, 'pillars', []);
  assert.ok(s.pillars.IT > 2, 'IT should rise from its floor');
  assert.ok(s.pillars.TRADE > 2);
});

test('the risk list leads with the fragile, not the famous', () => {
  const s = run(DP, 'risk-order', [], { to: 1000 });
  const risk = worksAtRisk(s, 'home');
  for (let i = 1; i < risk.length; i++)
    assert.ok(risk[i].carriers >= risk[i-1].carriers,
      'risk must be ordered by carrier count, or the player is shown the wrong works');
});

test('THE GATE: sending teachers abroad saves works that otherwise burn in 1193', () => {
  // Asserted across twelve seeds, not one. A gate that only lands on a lucky
  // campaign is not a gate.
  const base = [];
  for (let y = -3000; y < 1900; y += 100) base.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) base.push({ year: y, action: 'train-scribe' });

  const seeds = ['gate','paramountcy','a','b','c','d','e','f','g','h','i','j'];
  let improved = 0, totalDelta = 0;

  for (const seed of seeds) {
    const warn = run(DP, seed, base, { to: 1000 });
    // Everything genuinely thin — not a fixed count, and not the famous works
    // that already sit in four houses.
    const atRisk = worksAtRisk(warn, 'home').filter(w => w.carriers <= 3);
    assert.ok(atRisk.length > 0, `${seed}: there must be something to lose`);

    const sending = atRisk.map((w, i) => ({
      year: 1050 + i, action: 'send-teacher', work: w.id, destination: 'tibet',
    }));

    const nothing = run(DP, seed, base, { to: 1250 });
    const saved   = run(DP, seed, [...base, ...sending], { to: 1250 });
    const delta = corpusSummary(saved).extant - corpusSummary(nothing).extant;
    if (delta > 0) improved++;
    totalDelta += delta;
  }

  assert.equal(improved, seeds.length,
    `copying out must help in every campaign, helped in ${improved}/${seeds.length}`);
  assert.ok(totalDelta / seeds.length > 3,
    `average gain was only ${(totalDelta / seeds.length).toFixed(1)} works`);
});

test('a copy left with a merchant is not a copy left with an institution', () => {
  // 'abroad' is out of the fire but nobody is recopying it; 'tibet' is.
  // If those two ever behave the same, the missionary vector has lost its point.
  const base = [];
  for (let y = -3000; y < 1900; y += 100) base.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) base.push({ year: y, action: 'train-scribe' });

  const warn = run(DP, 'foster', base, { to: 1000 });
  const atRisk = worksAtRisk(warn, 'home').filter(w => w.carriers <= 3);
  const send = (dest) => atRisk.map((w, i) => ({
    year: 1050 + i, action: 'send-teacher', work: w.id, destination: dest,
  }));

  // Run to the end of the campaign: an unmaintained palm-leaf copy takes about
  // seven centuries to become unreadable, so the two only diverge over that long.
  const toInstitution = run(DP, 'foster', [...base, ...send('tibet')],  { to: 1947 });
  const toNowhere     = run(DP, 'foster', [...base, ...send('abroad')], { to: 1947 });
  assert.ok(corpusSummary(toInstitution).extant > corpusSummary(toNowhere).extant,
    'a fostering destination must outperform a merchant\'s chest');
});

test('a decision taken in the final year still happens', () => {
  // The tick loop covers half-open spans, so a decision dated exactly at `to`
  // used to fall through all of them. In the client that meant every decision
  // the player took *right now* was silently discarded.
  const base = [];
  for (let y = -3000; y < 900; y += 100) base.push({ year: y, action: 'patronise' });
  const before = run(DP, 'edge', base, { to: 900 });
  const after  = run(DP, 'edge', [...base, { year: 900, action: 'raise-soldiers', count: 5 }],
    { to: 900 });
  assert.ok(after.pops.soldiers > before.pops.soldiers,
    'a decision at the campaign edge must take effect');
});

test('a decision is never applied twice at the edge', () => {
  const base = [{ year: 500, action: 'raise-soldiers', count: 5 }];
  const a = run(DP, 'edge2', base, { to: 500 });
  const b = run(DP, 'edge2', base, { to: 600 });
  assert.equal(a.pops.soldiers, b.pops.soldiers, 'the edge pass must not double-apply');
});
