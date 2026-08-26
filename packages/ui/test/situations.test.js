import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../../sim/src/engine.js';
import { deriveSituations, situationBadge } from '../src/situations.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
  occupations: read('../../../data/timeline/occupations.json'),
};

// A minimal synthetic state: the engine's shape, none of its weight.
const bare = (over = {}) => ({
  year: 900, grain: 5000, pillars: { NETWORKING: 10 },
  corpus: new Map(), routes: new Map(), log: [],
  occupationsActive: new Set(), indus: null, ...over,
});

test('situations are a pure function of the state', () => {
  const world = run(DP, 'sit', [], { to: 1200 });
  const a = deriveSituations(world, DP);
  const b = deriveSituations(world, DP);
  assert.deepEqual(a, b, 'two derivations from one state must agree exactly');
  for (const s of a) {
    assert.ok(['red', 'amber', 'feed'].includes(s.tier), s.tier);
    assert.ok(s.id && s.text, 'every situation is addressable and readable');
  }
});

test('a work at its last carrier is red, and named', () => {
  const s = bare();
  s.corpus.set('W1', { id: 'W1', title: 'The Test Hymn', exists: true, lost: false,
    prestige: 5, carriers: [{ place: 'home', medium: 'memory' }] });
  const sits = deriveSituations(s);
  const red = sits.find(x => x.tier === 'red' && x.kind === 'work');
  assert.ok(red, 'last carrier must surface as red');
  assert.match(red.text, /The Test Hymn/);
});

test('more than three last-carrier works collapse into a count, not a wall', () => {
  const s = bare();
  for (let i = 0; i < 7; i++)
    s.corpus.set(`W${i}`, { id: `W${i}`, title: `Work ${i}`, exists: true, lost: false,
      prestige: 1, carriers: [{ place: 'home', medium: 'memory' }] });
  const reds = deriveSituations(s).filter(x => x.kind === 'work');
  assert.equal(reds.length, 4, 'three named plus one rollup');
  assert.match(reds[3].text, /4 more/);
});

test('a choked route is amber; a dead one is red', () => {
  const s = bare();
  s.routes.set('pass', { id: 'pass', open: true, choke: { kind: 'toll' } });
  s.routes.set('gone', { id: 'gone', open: false, choke: null });
  const sits = deriveSituations(s);
  assert.ok(sits.some(x => x.tier === 'amber' && x.id === 'choke-pass'));
  assert.ok(sits.some(x => x.tier === 'red' && x.id === 'dead-gone'));
});

test('an empty granary is red', () => {
  const sits = deriveSituations(bare({ grain: 40 }));
  assert.ok(sits.some(x => x.id === 'grain-empty'));
});

test('texture is feed, capped, and never promoted', () => {
  const s = bare();
  for (let y = 890; y < 900; y++) s.log.push({ year: y, kind: 'texture', text: `t${y}` });
  const feed = deriveSituations(s).filter(x => x.tier === 'feed');
  assert.equal(feed.length, 3, 'only the last few lines');
});

test('the badge counts the loud tiers only, and reds win', () => {
  const s = bare({ grain: 40 });
  s.routes.set('pass', { id: 'pass', open: true, choke: { kind: 'raid' } });
  s.log.push({ year: 899, kind: 'texture', text: 'a fair' });
  const b = situationBadge(deriveSituations(s));
  assert.equal(b.count, 2, 'feed lines are not attention debt');
  assert.equal(b.tier, 'red');
  const quiet = situationBadge(deriveSituations(bare()));
  assert.equal(quiet.count, 0);
  assert.equal(quiet.tier, null);
});

test('the Indus era surfaces leaving thresholds and remaining wells', () => {
  const s = bare({ year: -2100 });
  s.indus = new Map([
    ['a', { id: 'a', name: 'Kalibangan', standing: true, people: 3, water: 0.30, wells: 0 }],
    ['b', { id: 'b', name: 'Lothal',     standing: true, people: 4, water: 0.45, wells: 1 }],
    ['c', { id: 'c', name: 'Harappa',    standing: true, people: 5, water: 0.80, wells: 0 }],
  ]);
  const sits = deriveSituations(s);
  assert.ok(sits.some(x => x.id === 'leaving-a' && x.tier === 'red'));
  assert.ok(sits.some(x => x.id === 'wells-b' && x.tier === 'amber'));
  assert.ok(!sits.some(x => x.target === 'c'), 'a healthy town raises nothing');
});
