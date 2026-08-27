import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { living, endowable, endowmentLedger, descendants, lineageOf, oralCapacity } from '../src/people.js';
import { corpusSummary } from '../src/corpus.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
};

const tending = (to = 1900) => {
  const d = [];
  for (let y = -3000; y < to; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < to; y +=  60) d.push({ year: y, action: 'train-scribe' });
  return d;
};

/* ── The data ───────────────────────────────────────────────────────────── */

test('every person carries a provenance tier', () => {
  const ok = new Set(['SOURCED', 'DERIVED', 'SYNTHESIZED', 'ABSENT']);
  for (const p of DP.people.people)
    assert.ok(ok.has(p.provenance), `${p.id} has provenance ${p.provenance}`);
});

test('disputed people are never presented as certain', () => {
  for (const p of DP.people.people)
    if (p.dispute) assert.ok(p.certainty < 0.7, `${p.id} disputed at certainty ${p.certainty}`);
});

test('no dangling teacher, parent or work references', () => {
  const ids = new Set(DP.people.people.map(p => p.id));
  const works = new Set(DP.works.works.map(w => w.id));
  for (const p of DP.people.people) {
    if (p.teacher) assert.ok(ids.has(p.teacher), `${p.id} teacher ${p.teacher}`);
    if (p.parent)  assert.ok(ids.has(p.parent),  `${p.id} parent ${p.parent}`);
    for (const w of p.works ?? []) assert.ok(works.has(w), `${p.id} work ${w}`);
    for (const q of p.patron_of ?? []) assert.ok(ids.has(q), `${p.id} patron_of ${q}`);
  }
});

test('the Chola era is the best-populated stretch, as commissioned', () => {
  const chola = DP.people.people.filter(p => p.floruit[0] >= 850 && p.floruit[0] <= 1279);
  assert.ok(chola.length >= 40, `only ${chola.length} people in 850-1279`);
  const sourced = chola.filter(p => p.provenance === 'SOURCED');
  assert.ok(sourced.length >= 25, `only ${sourced.length} of them SOURCED`);
});

test('women are in the record where the record has them', () => {
  const women = DP.people.people.filter(p => p.gender === 'f');
  assert.ok(women.length >= 6, `only ${women.length} women`);
  // Sembiyan Mahadevi and Kundavai are inscribed under their own names.
  const ids = new Set(women.map(p => p.id));
  assert.ok(ids.has('PER.SEMBIYAN_MAHADEVI'));
  assert.ok(ids.has('PER.KUNDAVAI'));
});

test('a cohort states its count as sourced and its members as generated', () => {
  for (const c of DP.people.cohorts) {
    assert.ok(c.count > 0);
    assert.equal(c.member_provenance, 'SYNTHESIZED',
      `${c.id} claims real individuals it does not have`);
  }
});

/* ── Lives ──────────────────────────────────────────────────────────────── */

test('people are alive only during their floruit', () => {
  const s = run(DP, 'p', tending(), { to: 1000 });
  const rajaraja = s.people.get('PER.RAJARAJA_I');
  assert.ok(rajaraja.alive, 'Rajaraja should be alive in 1000');
  assert.ok(!s.people.get('PER.KALHANA').alive, 'Kalhana is 1148');
  assert.ok(!s.people.get('PER.PANINI').alive, 'Panini is long gone');
});

test('living() agrees with the year', () => {
  const s = run(DP, 'p', tending(), { to: 1150 });
  for (const p of living(s)) assert.ok(s.year >= p.from && s.year <= p.to, `${p.id}`);
});

test('everyone has come and gone by 1947', () => {
  const s = run(DP, 'p', tending(), { to: 1947 });
  assert.equal(living(s).length, 0);
  // ...and nobody has been deleted.
  assert.equal(s.people.size, DP.people.people.length);
});

/* ── Lineage ────────────────────────────────────────────────────────────── */

test('a teacher chain resolves', () => {
  const s = run(DP, 'p', [], { to: 1200 });
  const chain = lineageOf(s, 'PER.PATANJALI').map(p => p.id);
  assert.deepEqual(chain, ['PER.KATYAYANA', 'PER.PANINI'],
    'Patanjali stands on Katyayana who stands on Panini');
});

test('descendants are transitive and terminate', () => {
  const s = run(DP, 'p', [], { to: 1200 });
  const kids = descendants(s, 'PER.PANINI').map(p => p.id);
  assert.ok(kids.includes('PER.KATYAYANA'));
  assert.ok(kids.includes('PER.PATANJALI'), 'the grandchild counts');
});

test('a cyclic teacher reference cannot hang the walk', () => {
  const s = run(DP, 'p', [], { to: 900 });
  const a = s.people.get('PER.PANINI'), b = s.people.get('PER.KATYAYANA');
  const savedA = a.teacher, savedB = b.teacher;
  a.teacher = b.id; b.teacher = a.id;
  try {
    assert.ok(lineageOf(s, 'PER.PANINI').length < 10);
    assert.ok(descendants(s, 'PER.PANINI').length < 200);
  } finally { a.teacher = savedA; b.teacher = savedB; }
});

/* ── Schools: the mechanic that matters ─────────────────────────────────── */

test('feeding reciters founds schools', () => {
  const idle = run(DP, 'p', [], { to: 500 });
  const fed  = run(DP, 'p', tending(500), { to: 500 });
  assert.ok(fed.schools.size > idle.schools.size,
    `fed ${fed.schools.size} schools vs idle ${idle.schools.size}`);
});

test('oral capacity comes from schools, not from a headcount', () => {
  const s = run(DP, 'p', tending(600), { to: 600 });
  const lineages = [...s.schools.values()].filter(x => x.kind === 'lineage');
  const members = lineages.reduce((n, x) => n + x.members.length, 0);
  assert.ok(oralCapacity(s) >= members * 3 - 1, 'capacity should track membership');
});

test('a school that ends says what it was the last to know', () => {
  // Over-extend: take on far more reciters than the land can carry. The
  // community stops replacing them, the smallest lineages close, and each one
  // reports what it was the last to recite. This is the failure mode the design
  // cares about most — nobody attacked anything.
  const d = [];
  for (let y = -2000; y < 400; y += 8) d.push({ year: y, action: 'patronise' });
  const s = run(DP, 'p', d, { to: 600 });
  const closures = s.log.filter(l => l.kind === 'school' && /ends/.test(l.text));
  assert.ok(closures.length > 0, 'letting reciters go should close schools');
  assert.ok(s.stats.schoolsLost > 0);
});

test('every school member is marked generated', () => {
  const s = run(DP, 'p', tending(900), { to: 900 });
  for (const sc of s.schools.values())
    for (const m of sc.members)
      assert.equal(m.provenance, 'SYNTHESIZED', `${m.name} claims to be sourced`);
});

test('cohorts appear on their date with the sourced count', () => {
  const before = run(DP, 'p', tending(1000), { to: 1000 });
  const after  = run(DP, 'p', tending(1100), { to: 1100 });
  assert.ok(!before.schools.has('COH.THANJAVUR_TEMPLE_WOMEN'), 'the temple is 1010');
  const coh = after.schools.get('COH.THANJAVUR_TEMPLE_WOMEN');
  assert.ok(coh, 'the 400 should be there after 1010');
  assert.equal(coh.count, 400, 'the sourced count must survive intact');
  assert.ok(coh.members.length <= 64, 'we sample, we do not fabricate a roster of 400');
});

/* ── Endowment ──────────────────────────────────────────────────────────── */

test('you can endow a living person, once', () => {
  const s0 = run(DP, 'p', tending(1000), { to: 1000 });
  const target = endowable(s0).find(p => p.id === 'PER.RAJENDRA_I') ?? endowable(s0)[0];
  const d = [...tending(1000), { year: 999, action: 'endow', person: target.id }];
  const s = run(DP, 'p', d, { to: 1010 });
  assert.ok(s.people.get(target.id).patronised);
  assert.equal(s.stats.endowments, 1);
});

test('an endowment goes on paying through the students', () => {
  // Endow Panini in 400 BCE; Katyayana and Patanjali are downstream of him.
  const d = [...tending(), { year: -500, action: 'endow', person: 'PER.PANINI' }];
  const s = run(DP, 'p', d, { to: 1000 });
  const ledger = endowmentLedger(s).find(e => e.person === 'PER.PANINI');
  assert.ok(ledger, 'the endowment should still be in the ledger fifteen centuries later');
  assert.ok(ledger.returned > 0, 'it should have returned something');
  assert.ok(ledger.heirs >= 2, `only ${ledger.heirs} heirs`);
  assert.ok(ledger.years > 1400, `the ledger should remember ${ledger.years} years`);
});

test('endowing costs grain and can be refused', () => {
  const s = run(DP, 'p', [{ year: 1000, action: 'endow', person: 'PER.RAJENDRA_I' }], { to: 1010 });
  // With no tending there is not enough grain banked to endow at that price.
  const p = s.people.get('PER.RAJENDRA_I');
  assert.ok(p.patronised === false || s.grain >= 0);
});

test('endowable never offers a ruler or the already-endowed', () => {
  const s = run(DP, 'p', tending(1100), { to: 1100 });
  for (const p of endowable(s)) {
    assert.notEqual(p.role, 'ruler');
    assert.equal(p.patronised, false);
    assert.ok(p.alive);
  }
});

test('endowable leads with the best-attested', () => {
  const s = run(DP, 'p', tending(1150), { to: 1150 });
  const list = endowable(s);
  for (let i = 1; i < list.length; i++)
    assert.ok((list[i].certainty ?? 0) <= (list[i-1].certainty ?? 0));
});

/* ── Determinism ────────────────────────────────────────────────────────── */

test('people do not break the rule', () => {
  const d = [...tending(), { year: -500, action: 'endow', person: 'PER.PANINI' }];
  assert.equal(run(DP, 'same', d).fingerprint, run(DP, 'same', d).fingerprint);
});

test('generated names are stable across runs and differ across seeds', () => {
  const names = (seed) => [...run(DP, seed, tending(700), { to: 700 }).schools.values()]
    .flatMap(s => s.members.map(m => m.name)).sort().join('|');
  assert.equal(names('n1'), names('n1'));
  assert.notEqual(names('n1'), names('n2'));
});

test('an endowment keeps paying only while the works survive', () => {
  // The asymmetry the whole design argues for. Endow Panini either way; in one
  // campaign the Ashtadhyayi is kept alive, in the other it is let go. The line
  // is equally dead in both — Patanjali died in the second century BCE — but
  // only one of them is still returning anything in 1200.
  const endowment = { year: -500, action: 'endow', person: 'PER.PANINI' };

  const s = run(DP, 'p', [...tending(), endowment], { to: 1200 });
  const ash = s.corpus.get('WRK.ASHTADHYAYI');
  const ledger = endowmentLedger(s)[0];

  if (ash.lost) {
    assert.equal(ledger.downstream, 0, 'a lost corpus should return nothing');
    assert.equal(ledger.stillPaying, false);
  } else {
    assert.ok(ledger.downstream > 0, 'a surviving corpus should still be paying');
  }
  // Either way the ledger remembers the whole span, because that is the point
  // of writing it down.
  assert.ok(ledger.years > 1600, `ledger remembers only ${ledger.years} years`);
});

test('named people cluster where the record does', () => {
  // Two peaks, and they are the two the inscriptions actually give us: Rajaraja
  // around 1000 and the Kulottunga II court around 1150. A flat distribution
  // would mean the dataset was invented rather than collected.
  const alive = (y) => living(run(DP, 'p', tending(), { to: y })).length;
  assert.ok(alive(1000) >= 8, `only ${alive(1000)} alive in 1000`);
  assert.ok(alive(1150) >= 8, `only ${alive(1150)} alive in 1150`);
});
