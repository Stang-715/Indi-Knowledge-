import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../../sim/src/engine.js';
import { scriptoriumModel, assemblyModel, interiorHTML } from '../src/interiors.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:  read('../../../data/timeline/timeline.json'),
  works:     read('../../../data/corpus/works.json'),
  people:    read('../../../data/people/people.json'),
  gazetteer: read('../../../data/gazetteer/places.json'),
  texture:   read('../../../data/timeline/texture.json'),
};
const tending = () => {
  const d = [];
  for (let y = -3000; y < 1100; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400; y < 1100; y += 60) d.push({ year: y, action: 'train-scribe' });
  return d;
};

test('a work lost yesterday is missing from the desks today', () => {
  const s = run(DP, 'interior', tending(), { to: 1200 });
  const m = scriptoriumModel(s);
  const lost = [...s.corpus.values()].filter(c => c.lost).map(c => c.id);
  assert.ok(lost.length > 0, 'something must have been lost by 1200');
  for (const d of m.desks) assert.ok(!lost.includes(d.id), `${d.id} is lost and on a desk`);
  // and the desks hold the thinnest works first
  for (let i = 1; i < m.desks.length; i++)
    assert.ok(m.desks[i].written >= m.desks[i - 1].written);
});

test('the assembly seats by lot: same year same names, next year new draw', () => {
  const s = run(DP, 'interior', tending(), { to: 1100 });
  const a = assemblyModel(s), b = assemblyModel(s);
  assert.deepEqual(a.seated, b.seated, 'the same year always seats the same committee');
  const s2 = run(DP, 'interior', tending(), { to: 1101 });
  const c = assemblyModel(s2);
  assert.notDeepEqual(a.seated, c.seated, 'a new year draws a new committee');
  assert.equal(new Set(a.seated).size, a.seated.length, 'nobody holds two seats');
});

test('all three rooms render well-formed and honest when empty', () => {
  const s = run(DP, 'interior', [], { to: 900 });
  for (const kind of ['scriptorium', 'assembly', 'treasury']) {
    const html = interiorHTML(kind, s);
    const open = (html.match(/<(div|span|h3|p)\b/g) ?? []).length;
    const close = (html.match(/<\/(div|span|h3|p)>/g) ?? []).length;
    assert.equal(open, close, `${kind}: unbalanced markup`);
    assert.ok(!html.includes('undefined'), `${kind} rendered "undefined"`);
  }
});
