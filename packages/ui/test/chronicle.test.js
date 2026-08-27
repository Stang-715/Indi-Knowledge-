import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../../sim/src/engine.js';
import { composeChronicle, chronicleText, chronicleHTML } from '../src/chronicle.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:  read('../../../data/timeline/timeline.json'),
  works:     read('../../../data/corpus/works.json'),
  gazetteer: read('../../../data/gazetteer/places.json'),
  texture:   read('../../../data/timeline/texture.json'),
};
const tending = () => {
  const d = [];
  for (let y = -3000; y < 1900; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400; y < 1900; y += 60) d.push({ year: y, action: 'train-scribe' });
  return d;
};

test('the chronicle selects, it does not transcribe', () => {
  const s = run(DP, 'chron', tending());
  const book = composeChronicle(s, DP.timeline);
  const total = book.pages.reduce((a, p) => a + p.entries.length, 0);
  assert.ok(total < s.log.length * 0.6,
    `book has ${total} lines against a log of ${s.log.length}`);
  assert.ok(book.pages.length >= 12, 'an era with happenings gets a page');
});

test('every decision makes the book, and the quiet years get a taste', () => {
  const s = run(DP, 'chron', tending());
  const book = composeChronicle(s, DP.timeline);
  const decisions = book.pages.flatMap(p => p.entries).filter(e => e.kind === 'decision');
  const logDecisions = s.log.filter(l => l.kind === 'decision');
  assert.equal(decisions.length, logDecisions.length);
  assert.ok(book.pages.some(p => p.entries.some(e => e.kind === 'texture')));
});

test('two seeds write two different books; one seed writes one', () => {
  const a = composeChronicle(run(DP, 'chron-a', tending()), DP.timeline);
  const b = composeChronicle(run(DP, 'chron-b', tending()), DP.timeline);
  const a2 = composeChronicle(run(DP, 'chron-a', tending()), DP.timeline);
  assert.notEqual(chronicleText(a), chronicleText(b));
  assert.equal(chronicleText(a), chronicleText(a2));
});

test('the Nalanda year reads like a page you would keep', () => {
  const s = run(DP, 'chron', tending());
  const txt = chronicleText(composeChronicle(s, DP.timeline));
  assert.match(txt, /1193/);
  const html = chronicleHTML(composeChronicle(s, DP.timeline));
  const open = (html.match(/<(div|section|span|h3|h4|p|button)\b/g) ?? []).length;
  const close = (html.match(/<\/(div|section|span|h3|h4|p|button)>/g) ?? []).length;
  assert.equal(open, close, 'well-formed markup');
});
