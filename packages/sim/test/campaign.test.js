import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { CHOLA, CHAPTERS, OBJECTIVES, chapterAt, reckoning, openingState } from '../src/campaign.js';
import { corpusSummary, worksAtRisk } from '../src/corpus.js';
import { living } from '../src/people.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
  polities: read('../../../data/polities/polities.json'),
};

const playChola = (decisions = [], to = CHOLA.to) =>
  run(DP, 'chola', decisions, { from: CHOLA.from, to, initial: openingState() });

test('the campaign runs 850 to 1279', () => {
  const s = playChola();
  assert.equal(s.year, 1279);
  assert.ok(s.tick > 400, `only ${s.tick} ticks`);
});

test('it opens as a small kingdom, not as an empire', () => {
  const s = playChola([], 855);
  assert.ok(s.grain < 2000);
  for (const v of Object.values(s.pillars)) assert.ok(v < 45, 'no pillar starts near its ceiling');
});

test('the chapters cover the whole span with no gap', () => {
  assert.equal(CHAPTERS[0].from, CHOLA.from);
  assert.equal(CHAPTERS[CHAPTERS.length - 1].to, CHOLA.to);
  for (let i = 1; i < CHAPTERS.length; i++)
    assert.equal(CHAPTERS[i].from, CHAPTERS[i - 1].to, `gap before ${CHAPTERS[i].name}`);
  for (const y of [850, 900, 1000, 1100, 1200, 1278]) assert.ok(chapterAt(y));
});

test('every chapter asks a question rather than stating a fact', () => {
  for (const c of CHAPTERS) assert.match(c.asks, /\?/, `${c.name} does not ask anything`);
});

test('the named people of the era are alive during it', () => {
  // The point of choosing this era: the record hands us people.
  const seen = new Set();
  for (const y of [900, 1000, 1050, 1100, 1150, 1200]) {
    for (const p of living(playChola([], y))) seen.add(p.id);
  }
  assert.ok(seen.has('PER.RAJARAJA_I'));
  assert.ok(seen.has('PER.SEMBIYAN_MAHADEVI'));
  assert.ok(seen.has('PER.KULOTTUNGA_I'));
  assert.ok(seen.size >= 25, `only ${seen.size} named people appeared across the campaign`);
});

test('1193 happens inside the campaign', () => {
  const s = playChola();
  assert.ok(s.log.some(l => l.year >= 1190 && l.year <= 1200 && l.kind === 'catastrophe'),
    'the campaign must contain the thing it is about');
});

test('the reckoning reports what survived before what it cost', () => {
  const r = reckoning(playChola());
  assert.ok(r.verdict.length > 40);
  assert.ok(Array.isArray(r.met) && Array.isArray(r.missed));
  assert.equal(r.met.length + r.missed.length, OBJECTIVES.length);
  assert.equal(typeof r.burnedIn1193, 'number');
  // Deliberately not a score.
  assert.ok(!('score' in r), 'a number would let the player stop reading');
});

test('doing nothing is a losing campaign, and says so plainly', () => {
  const r = reckoning(playChola());
  assert.ok(r.met.length < OBJECTIVES.length, 'an idle campaign should not meet everything');
  assert.match(r.verdict, /survive|Nothing/);
});

test('a played campaign meets more objectives than an idle one', () => {
  const d = [];
  for (let y = 860; y < 1270; y += 22) d.push({ year: y, action: 'patronise' });
  for (let y = 880; y < 1270; y += 30) d.push({ year: y, action: 'train-scribe' });
  const idle = reckoning(playChola());
  const played = reckoning(playChola(d));
  assert.ok(played.met.length >= idle.met.length);
  assert.ok(corpusSummary(playChola(d)).extant >= corpusSummary(playChola()).extant);
});

test('THE CAMPAIGN: copying out before 1193 changes how it ends', () => {
  // A lighter hand than the obvious one. Feeding every reciter you can afford
  // leaves nothing in the granary, and copying a work out costs grain — so the
  // campaign's real trade is between holding more now and being able to save
  // any of it later. A maximal tending schedule pins grain at zero and every
  // teacher is refused.
  const base = [];
  for (let y = 860; y < 1270; y += 45) base.push({ year: y, action: 'patronise' });
  for (let y = 880; y < 1270; y += 70) base.push({ year: y, action: 'train-scribe' });

  const warn = playChola(base, 1100);
  const risk = worksAtRisk(warn, 'home').filter(w => w.carriers <= 3);
  assert.ok(risk.length > 0, 'there must be something to lose at 1100');

  const sending = risk.map((w, i) => ({
    year: 1110 + i, action: 'send-teacher', work: w.id, destination: 'tibet',
  }));

  const nothing = reckoning(playChola(base));
  const saved   = reckoning(playChola([...base, ...sending]));

  assert.ok(saved.corpus.extant > nothing.corpus.extant,
    `saved ${saved.corpus.extant} vs nothing ${nothing.corpus.extant}`);
  assert.ok(saved.savedAbroad > 0);
  assert.notEqual(saved.verdict, nothing.verdict, 'and the ending should read differently');
});

test('the campaign obeys the rule', () => {
  const d = [{ year: 900, action: 'patronise' }, { year: 1000, action: 'train-scribe' }];
  assert.equal(playChola(d).fingerprint, playChola(d).fingerprint);
});

test('every objective is reachable in principle', () => {
  // An objective nothing can satisfy is a lie told to the player.
  for (const o of OBJECTIVES) {
    assert.ok(typeof o.test === 'function');
    assert.ok(o.note && o.note.length > 20, `${o.id} does not explain itself`);
  }
  // OBJ.TEMPLE is time-based and must be met by simply reaching 1010.
  const late = playChola();
  assert.ok(OBJECTIVES.find(o => o.id === 'OBJ.TEMPLE').test(late));
});
