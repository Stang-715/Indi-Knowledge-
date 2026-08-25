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

test('most invasions say what they actually became', () => {
  // The field being present was never the point. Every one of the forty-one
  // invasions the document carried had it set to the string "nothing", which
  // is the generator's placeholder and reads, on a card, as a claim.
  const inv = TL.events.filter(e => e.class === 'INVASION');
  const real = inv.filter(e => e.becomes && e.becomes !== 'nothing' && e.becomes.length > 40);
  assert.ok(real.length / inv.length > 0.5,
    `only ${real.length} of ${inv.length} invasions say what followed`);
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

test('no era goes more than twenty minutes of play without an authored event', () => {
  // Rule 7 of the generator's validations, which had been a warning since it
  // was written. Every era passes it as of phase 30, so it can be an assertion.
  const bad = [];
  for (const era of TL.eras) {
    const n = TL.events.filter(e => e.era === era.id && e.scope === 'subcontinental').length;
    const gap = n === 0 ? Infinity : (era.hours * 60) / n;
    if (gap > 20) bad.push(`${era.name}: one per ${gap.toFixed(1)} min`);
  }
  assert.deepEqual(bad, []);
});

test('the weighting has not drifted back toward the centuries people already know', () => {
  // The locked figure is playtime, not event count: 82% of the 210 hours before
  // 1300 (docs/07-timeline.md). That is what the generator asserts and it is
  // what the player experiences.
  const hours = TL.eras.reduce((a, e) => a + e.hours, 0);
  const deep  = TL.eras.filter(e => e.to <= 1300).reduce((a, e) => a + e.hours, 0);
  assert.equal(hours, 210);
  assert.ok(deep / hours >= 0.80, `pre-1300 playtime is ${(100 * deep / hours).toFixed(1)}%`);

  // Event count is a weaker floor, and deliberately so. The plan wanted a
  // 41-event skim for eras 14-16, and separately wanted no era to run more
  // than twenty minutes without an authored event. Those two rules cannot both
  // hold: 37 hours at one event per twenty minutes is 111 events minimum. The
  // density rule wins, because an hour of play with nothing to read is a
  // defect and a thin skim is only a preference. So the deep past keeps the
  // clear majority of the events, not the share the first plan projected.
  const pre = TL.events.filter(e => e.year < 1300).length;
  assert.ok(pre / TL.events.length >= 0.72,
    `pre-1300 event share is ${(100 * pre / TL.events.length).toFixed(1)}%`);
});

test('every regional spine runs to the end of the campaign', () => {
  const byRegion = new Map();
  for (const e of TL.events) {
    if (!e.region) continue;
    byRegion.set(e.region, Math.max(byRegion.get(e.region) ?? -9999, e.year));
  }
  assert.ok(byRegion.size >= 12, 'twelve spines');
  for (const [r, last] of byRegion)
    assert.ok(last >= 1850, `${r} stops at ${last}; a player there has a silent century`);
});

test('no spine goes silent for more than four centuries after 600 BCE', () => {
  // Before that the regional record genuinely is thin and the subcontinental
  // feed carries it, which is how a campaign composes its event list
  // (07-timeline.md, Part 3B). After it, a gap is a hole in the writing.
  const byRegion = new Map();
  for (const e of TL.events) {
    if (!e.region || e.year < -600) continue;
    if (!byRegion.has(e.region)) byRegion.set(e.region, []);
    byRegion.get(e.region).push(e.year);
  }
  for (const [r, years] of byRegion) {
    years.sort((a, b) => a - b);
    for (let i = 1; i < years.length; i++)
      assert.ok(years[i] - years[i - 1] <= 400,
        `${r}: nothing between ${years[i - 1]} and ${years[i]}`);
  }
});

test('no event is written twice', () => {
  // The document lists an era spine and a regional spine, and where they
  // overlap the same thing is written in both — a hundred and eleven pairs,
  // and the player would have seen every one of them happen twice. The
  // generator collapses them; this asserts the narrow, certain case, where one
  // title says nothing the other does not. Fuzzier matching belongs in the
  // generator, where a false positive can be inspected, not in a test, where
  // it would fail the build over Brihadeeswarar and Gangaikondacholapuram
  // sharing the words "temple" and "completed".
  const STOP = new Set(['the','a','an','of','and','in','at','on','to','is','as','its','for','with','by','from']);
  const words = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)));

  const dups = [];
  for (let i = 0; i < TL.events.length; i++) {
    for (let j = i + 1; j < TL.events.length; j++) {
      const a = TL.events[i], b = TL.events[j];
      if (b.year - a.year > 60) break;
      const A = words(a.title), B = words(b.title);
      let shared = 0;
      for (const w of A) if (B.has(w)) shared++;
      if (shared >= 2 && (shared === A.size || shared === B.size))
        dups.push(`${a.title} || ${b.title}`);
    }
  }
  assert.deepEqual(dups, []);
});

/* ── Phase 35: the payload ──────────────────────────────────────────────── */

const GAZ = JSON.parse(readFileSync(
  new URL('../../../data/gazetteer/places.json', import.meta.url), 'utf8'));
const GAZ_IDS = new Set(GAZ.places.map(p => p.id));

test('every where key resolves against the gazetteer', () => {
  for (const e of TL.events)
    for (const k of e.where ?? [])
      assert.ok(GAZ_IDS.has(k), `${e.id}: "${k}" is not a place`);
});

test('a substantial share of events land closer than a region', () => {
  const precise = TL.events.filter(e =>
    (e.where ?? []).some(k => !k.startsWith('RGN.'))).length;
  assert.ok(precise >= 600, `only ${precise} events have a precise place`);
});

test('every W event carries its own affects, and they are not all the same', () => {
  // EPOCH and the class-less dynastic lines ('—') legitimately carry no
  // pillar payload: an accession moves the map, not the knowledge economy.
  const ws = TL.events.filter(e => e.magnitude === 'W'
    && e.class !== 'EPOCH' && e.class !== '—');
  for (const e of ws)
    assert.ok(e.affects && Object.keys(e.affects).length,
      `${e.id} has no payload`);
  // Two same-class W events must differ — the whole point of the phase.
  const climates = ws.filter(e => e.class === 'CLIMATE').slice(0, 12);
  const shapes = new Set(climates.map(e => JSON.stringify(e.affects)));
  assert.ok(shapes.size >= climates.length - 1,
    `${climates.length} CLIMATE events share only ${shapes.size} payload shapes`);
});

test('the hand-authored claims survive the bake', () => {
  // The worked example from the plan: 4.2 kiloyear = AGRICULTURE -4, TRADE -2.
  const e = TL.events.find(x => x.title.includes('4.2 kiloyear aridification'));
  assert.deepEqual(e.affects, { AGRICULTURE: -4, TRADE: -2 });
});

test('every card-bearing event teaches something', () => {
  let n = 0;
  for (const e of TL.events) if (e.teaches) n++;
  assert.ok(n >= 450, `only ${n} events carry a takeaway`);
});

/* ── Phase 36: the loom ─────────────────────────────────────────────────── */

test('threads are an entity, and none is thin', () => {
  assert.equal(TL.threads.length, 15);
  const counts = new Map(TL.threads.map(t => [t.id, 0]));
  for (const e of TL.events) for (const t of e.threads ?? [])
    if (counts.has(t)) counts.set(t, counts.get(t) + 1);
  for (const [id, n] of counts)
    assert.ok(n >= 8, `${id} has only ${n} beats`);
  const tagged = TL.events.filter(e => (e.threads ?? []).length).length;
  assert.ok(tagged >= 400, `only ${tagged} events are on a thread`);
});

test('every thread tag resolves and beats are orderable', () => {
  const ids = new Set(TL.threads.map(t => t.id));
  for (const e of TL.events)
    for (const t of e.threads ?? [])
      assert.ok(ids.has(t), `${e.id} carries unknown thread ${t}`);
});

test('the assemblies run from the sabha to the Constituent Assembly', () => {
  const beats = TL.events.filter(e => (e.threads ?? []).includes('THR.THE_ASSEMBLIES'))
    .sort((a, b) => a.year - b.year);
  assert.ok(beats[0].year <= -900, `first beat is ${beats[0].year}`);
  assert.ok(beats.at(-1).year >= 1900, `last beat is ${beats.at(-1).year}`);
});

/* ── Phase 40: the last events ──────────────────────────────────────────── */

test('no invasion carries the placeholder any more', () => {
  const bad = TL.events.filter(e => e.class === 'INVASION' && e.becomes === 'nothing');
  assert.deepEqual(bad.map(e => e.title), []);
});

test('every disputed event carries at least two citations', () => {
  for (const e of TL.events)
    if (e.dispute)
      assert.ok((e.sources ?? []).length >= 2, `${e.id} has ${e.sources?.length ?? 0}`);
});

test('chapters exist, cover their eras, and every event has one', () => {
  assert.ok(TL.chapters.length >= 62, `${TL.chapters.length} chapters`);
  for (const c of TL.chapters) assert.ok(c.to > c.from, `${c.id} is degenerate`);
  for (const e of TL.events)
    assert.ok(e.chapter, `${e.id} has no chapter`);
  // Chapters tile each era without gaps.
  for (const era of TL.eras) {
    const chs = TL.chapters.filter(c => c.era === era.id).sort((a, b) => a.from - b.from);
    assert.ok(chs.length >= 3, `${era.id} has ${chs.length} chapters`);
    assert.equal(chs[0].from, era.from);
    assert.equal(chs.at(-1).to, era.to);
    for (let i = 1; i < chs.length; i++) assert.equal(chs[i].from, chs[i - 1].to);
  }
});

/* ── Phase 41: the names in their own scripts ───────────────────────────── */

test('the gazetteer speaks its own languages', () => {
  const withNative = GAZ.places.filter(p => p.native);
  assert.ok(withNative.length >= 180, `${withNative.length} native names`);
  for (const p of withNative) {
    assert.ok(p.script, `${p.id} has native text but no script tag`);
    assert.ok(!/[A-Za-z]/.test(p.native), `${p.id} native form contains Latin`);
  }
  // Script follows region: Thanjavur in Tamil, Dholavira in Gujarati.
  assert.equal(GAZ.places.find(p => p.id === 'thanjavur').script, 'taml');
  assert.equal(GAZ.places.find(p => p.id === 'dholavira').script, 'gujr');
});

test('every script used has a committed font subset covering its glyphs', () => {
  const manifest = JSON.parse(readFileSync(
    new URL('../../../data/fonts/manifest.json', import.meta.url), 'utf8'));
  const used = new Set(GAZ.places.filter(p => p.native).map(p => p.script));
  for (const sc of used)
    assert.ok(manifest.fonts[sc], `no font subset for ${sc}`);
  assert.ok(manifest.total <= 900 * 1024,
    `fonts total ${manifest.total} bytes, budget is 900 KB`);
});
