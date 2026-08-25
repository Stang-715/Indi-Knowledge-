import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const TL = JSON.parse(readFileSync(
  new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8'));

test('spans 6000 BCE to 1947', () => {
  assert.equal(TL.span.from, -6000);
  assert.equal(TL.span.to, 1947);
});

test('cadence sums to exactly 210 hours', () => {
  assert.equal(TL.eras.reduce((s, e) => s + e.hours, 0), 210);
});

test('pre-1300 share is at least 80% — the emphasis cannot drift', () => {
  const total = TL.eras.reduce((s, e) => s + e.hours, 0);
  const ancient = TL.eras.filter(e => e.to <= 1300).reduce((s, e) => s + e.hours, 0);
  assert.ok(ancient / total >= 0.80, `pre-1300 share is ${(ancient/total*100).toFixed(1)}%`);
});

test('the Mauryan era is the densest in the game', () => {
  const perYear = TL.eras.map(e => ({
    id: e.id, s: (e.hours * 3600) / (e.to - e.from),
  })).sort((a, b) => b.s - a.s);
  assert.equal(perYear[0].id, 'ERA.MAURYAN');
});

test('no event below 0.9 certainty uses a dated trigger', () => {
  const bad = TL.events.filter(e => e.trigger === 'dated' && e.certainty < 0.9);
  assert.deepEqual(bad.map(e => e.id), []);
});

test('every INVASION carries a becomes field', () => {
  const bad = TL.events.filter(e => e.class === 'INVASION' && typeof e.becomes !== 'string');
  assert.deepEqual(bad.map(e => e.id), []);
});

test('every disputed event declares what is disputed', () => {
  const ok = new Set(['occurrence', 'date', 'causation', 'interpretation']);
  for (const e of TL.events.filter(x => x.dispute))
    assert.ok(ok.has(e.dispute_scope), `${e.id}: dispute_scope is ${e.dispute_scope}`);
});

test('certainty is only forced down where certainty is what is disputed', () => {
  // The Bengal famine of 1943 certainly happened; what is argued is its
  // causation. Forcing its certainty below 0.9 would have the game state that
  // the famine is doubtful, which is false and offensive. So the rule binds on
  // occurrence and date, and not on causation or interpretation.
  const bad = TL.events.filter(e =>
    e.dispute && ['occurrence', 'date'].includes(e.dispute_scope) && e.certainty >= 0.9);
  assert.deepEqual(bad.map(e => e.id), []);

  const bengal = TL.events.find(e => /Bengal famine/i.test(e.title) && e.year === 1943);
  if (bengal) {
    assert.equal(bengal.dispute_scope, 'causation');
    assert.ok(bengal.certainty >= 0.9, 'and it is not made doubtful to satisfy a rule');
  }
});

test('every event sits inside its era, except prologue', () => {
  const byId = new Map(TL.eras.map(e => [e.id, e]));
  for (const ev of TL.events) {
    if (ev.scope === 'prologue') continue;
    const era = byId.get(ev.era);
    assert.ok(era, `${ev.id}: unknown era`);
    assert.ok(ev.year >= era.from && ev.year <= era.to,
      `${ev.id}: year ${ev.year} outside ${era.id}`);
  }
});

test('event ids are unique', () => {
  const ids = TL.events.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('events are sorted by year', () => {
  for (let i = 1; i < TL.events.length; i++)
    assert.ok(TL.events[i].year >= TL.events[i-1].year, `unsorted at ${i}`);
});

test('twelve regional spines are present and populated', () => {
  assert.equal(TL.regions.length, 12);
  for (const r of TL.regions) {
    const n = TL.events.filter(e => e.region === r.id).length;
    assert.ok(n >= 14, `${r.name} has only ${n} events`);
  }
});

test('the corpus catastrophe of 1193 is in the spine', () => {
  const nalanda = TL.events.filter(e => e.year === 1193);
  assert.ok(nalanda.length > 0, '1193 must exist — it is the P0 gate');
});

test('prologue events exist and never claim to be fireable', () => {
  const pro = TL.events.filter(e => e.scope === 'prologue');
  assert.ok(pro.length > 0);
  for (const e of pro) assert.ok(e.year < -6000);
});
