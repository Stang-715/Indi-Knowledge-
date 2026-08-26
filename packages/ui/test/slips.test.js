import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../../sim/src/engine.js';
import { worksAtRisk } from '../../sim/src/corpus.js';
import { SLIPS, makeSlipTracker } from '../src/slips.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:  read('../../../data/timeline/timeline.json'),
  works:     read('../../../data/corpus/works.json'),
  gazetteer: read('../../../data/gazetteer/places.json'),
  texture:   read('../../../data/timeline/texture.json'),
};

test('no slip fires twice, and each is one sentence in the game voice', () => {
  const tr = makeSlipTracker();
  const state = { grain: 1000, pops: { reciters: 2 }, pillars: { IT: 0, CULTIVATION: 0 },
    routes: new Map(), coinageKnown: false };
  const a = tr.next(state, { atRisk: 0, frontierHere: 0, eraTurned: false, losses: 0 });
  const b = tr.next(state, { atRisk: 0, frontierHere: 0, eraTurned: false, losses: 0 });
  assert.equal(a.id, 'first-surplus');
  assert.notEqual(b?.id, 'first-surplus');
  for (const s of SLIPS) {
    assert.ok(s.text.length < 260, `${s.id} is a paragraph, not a slip`);
    assert.ok(!/click|button|UI|menu|tutorial/i.test(s.text),
      `${s.id} breaks the voice: "${s.text}"`);
  }
});

test('the first fifteen Chola minutes surface the teaching moments', () => {
  // A cold player who only patronises: within ~6 in-game years of the Chola
  // start (≈15 play-minutes at era cadence) the world itself must have made
  // the first three slips true — surplus, risk, writing — so the slips can
  // do their work without a tour.
  const s = run(DP, 'slips', [{ year: 851, action: 'patronise' }],
    { from: 850, to: 856, initial: { grain: 900, pillars: { IT: 10, TRADE: 8 } } });
  const tr = makeSlipTracker();
  const extras = { atRisk: worksAtRisk(s, 'home').length, frontierHere: 0,
    eraTurned: false, losses: 0 };
  const fired = [];
  let slip;
  while ((slip = tr.next(s, extras))) fired.push(slip.id);
  assert.ok(fired.includes('first-surplus'), `fired: ${fired}`);
  assert.ok(fired.includes('first-writing'), `fired: ${fired}`);
  assert.ok(fired.includes('first-at-risk'), `fired: ${fired}`);
});
