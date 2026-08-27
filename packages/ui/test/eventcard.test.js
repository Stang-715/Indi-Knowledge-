import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cardModel, renderCard, renderYearPage, indexCards, authoredFor,
         tierOf, certaintyLabel } from '../src/eventcard.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const TL = read('../../../data/timeline/timeline.json');
const CARDS = read('../../../data/timeline/cards.json');
const IDX = indexCards(CARDS);
const eraOf = (ev) => TL.eras.find(e => e.id === ev.era);
const find = (frag) => TL.events.find(e => e.title.toLowerCase().includes(frag.toLowerCase()));

test('every event produces a card', () => {
  for (const ev of TL.events) {
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    assert.ok(m.title && m.what && m.why && m.evidence, `${ev.id} has an empty slot`);
  }
});

test('every authored card matches a real event', () => {
  const unmatched = CARDS.cards.filter(c =>
    !TL.events.some(e => e.title.toLowerCase().includes(c.match.toLowerCase())));
  assert.deepEqual(unmatched.map(c => c.match), []);
});

test('evidence is never empty, because it is the teaching mechanism', () => {
  for (const ev of TL.events) {
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    assert.ok(m.evidence.length > 20, `${ev.id}: evidence is "${m.evidence}"`);
  }
});

test('a disputed event always carries dispute text', () => {
  const disputed = TL.events.filter(e => e.dispute);
  assert.ok(disputed.length > 20);
  for (const ev of disputed) {
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    assert.ok(m.dispute, `${ev.id} is disputed and says nothing about it`);
  }
});

test('an undisputed event carries none', () => {
  for (const ev of TL.events.filter(e => !e.dispute).slice(0, 200)) {
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    assert.equal(m.dispute, null, `${ev.id} invents a dispute`);
  }
});

test('no authored key claims two different events', () => {
  // The same event is often authored twice — once in its era table and once in
  // a regional spine — and both copies should get the card. Two DIFFERENT
  // events sharing a key is a mis-attribution, and a silent one.
  // Compare on the part before the em-dash: the era table and the regional
  // spine often word the same event's trailing clause differently, and that is
  // one event, not two.
  const stem = (t) => t.split(' — ')[0].trim().toLowerCase();
  for (const c of CARDS.cards) {
    const stems = new Set(TL.events
      .filter(e => e.title.toLowerCase().includes(c.match.toLowerCase()))
      .map(e => stem(e.title)));
    assert.ok(stems.size <= 1,
      `"${c.match}" matches ${stems.size} different events: ${[...stems].join(' | ')}`);
  }
});

test('the politically live cases name the disagreement without settling it', () => {
  for (const frag of ['Keeladi', 'Indo-Aryan migration', "Surkotada's horse", 'Mayiladumparai']) {
    const ev = find(frag);
    assert.ok(ev, `${frag} missing from the timeline`);
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    assert.ok(m.dispute, `${frag} has no dispute text`);
    // It must present positions, not a verdict.
    assert.ok(!/\b(proves|settles|conclusively|clearly shows|debunk)\b/i.test(m.dispute),
      `${frag} adjudicates: "${m.dispute}"`);
  }
});

test('Keeladi states both dates and that the dispute is open', () => {
  const m = cardModel(find('Keeladi'), { era: eraOf(find('Keeladi')), authored: authoredFor(IDX, find('Keeladi')) });
  assert.match(m.dispute, /6th century BCE/);
  assert.match(m.dispute, /8th–3rd century BCE/);
  assert.match(m.dispute, /open|remains/i);
});

test('certainty reads as a word, and contested outranks the number', () => {
  assert.equal(certaintyLabel({ certainty: 0.95 }), 'firm');
  assert.equal(certaintyLabel({ certainty: 0.75 }), 'approximate');
  assert.equal(certaintyLabel({ certainty: 0.95, dispute: true }), 'contested');
});

test('authored copy promotes an event to Tier 1', () => {
  const ev = find('Uttaramerur');
  assert.equal(tierOf(ev, authoredFor(IDX, ev)), 1);
  const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
  assert.match(m.what, /palm leaf/);
  assert.match(m.what, /audited accounts/);
});

test('an INVASION card says what it became', () => {
  const ev = find('Nalanda sacked');
  const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
  assert.ok(m.becomes, 'the becomes field is the point of the class');
  assert.match(m.becomes, /Tibetan/);
});

test('rendering produces well-formed markup with no unclosed tags', () => {
  for (const frag of ['Nalanda sacked', 'Uttaramerur', 'Keeladi', '4.2 kiloyear']) {
    const ev = find(frag);
    const html = renderCard(cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) }));
    const open = (html.match(/<(article|div|p|h3|header|span|b)\b/g) ?? []).length;
    const close = (html.match(/<\/(article|div|p|h3|header|span|b)>/g) ?? []).length;
    assert.equal(open, close, `${frag}: ${open} open vs ${close} close`);
    assert.ok(!html.includes('undefined'), `${frag} rendered "undefined"`);
    assert.ok(!html.includes('[object'), `${frag} rendered an object`);
  }
});

test('the year page composes, and a quiet year is honest about it', () => {
  const quiet = renderYearPage(-4123, { events: [], log: [], era: TL.eras[0] });
  assert.match(quiet, /quiet/);
  assert.ok(!quiet.includes('undefined'));

  const ev = find('Nalanda sacked');
  const busy = renderYearPage(1193, {
    events: [cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) })],
    log: [{ year: 1193, text: 'A work is lost.' }], era: eraOf(ev) });
  assert.match(busy, /1193 CE/);
  assert.match(busy, /Nalanda/);
});

test('every year in the campaign renders without throwing', () => {
  // Tier 3 claims to cover all 7,947 years. Check a wide sample rather than
  // asserting it and hoping.
  for (let y = -6000; y <= 1947; y += 37) {
    const evs = TL.events.filter(e => e.year === y && e.scope !== 'prologue');
    const models = evs.map(e => cardModel(e, { era: eraOf(e), authored: authoredFor(IDX, e) }));
    const html = renderYearPage(y, { events: models, era: TL.eras.find(x => y >= x.from && y < x.to) });
    assert.ok(html.length > 100, `year ${y} rendered nothing`);
    assert.ok(!html.includes('undefined'), `year ${y} rendered "undefined"`);
  }
});

test('word budgets are respected', () => {
  // Unbounded copy is how a 789-card set becomes unshippable.
  for (const ev of TL.events) {
    const m = cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev) });
    const words = (s) => s.trim().split(/\s+/).length;
    assert.ok(words(m.why) <= 30, `${ev.id}: "why" is ${words(m.why)} words`);
    assert.ok(words(m.evidence) <= 45, `${ev.id}: "evidence" is ${words(m.evidence)} words`);
    if (m.dispute) assert.ok(words(m.dispute) <= 95, `${ev.id}: dispute is ${words(m.dispute)} words`);
  }
});

test('the card footer navigates the thread: Uttaramerur knows its neighbours', async () => {
  const { indexThreads, threadsFor } = await import('../src/eventcard.js');
  const idx = indexThreads(TL);
  const ev = find('Uttaramerur');
  const ths = threadsFor(idx, ev);
  const asm = ths.find(t => t.id === 'THR.THE_ASSEMBLIES');
  assert.ok(asm, 'Uttaramerur is on the assemblies thread');
  assert.ok(asm.prev && asm.prev.year < ev.year, 'it has a prior beat');
  assert.ok(asm.next && asm.next.year > ev.year, 'and a next one');
  const html = renderCard(cardModel(ev, { era: eraOf(ev), authored: authoredFor(IDX, ev), threads: ths }));
  assert.ok(html.includes('data-goto'), 'the footer renders navigation');
});
