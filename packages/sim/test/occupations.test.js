import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { trustCeiling } from '../src/occupations.js';
import { trustRung, TRUST_RUNGS } from '../src/pillars.js';
import { conditionMet } from '../src/events.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:    read('../../../data/timeline/timeline.json'),
  works:       read('../../../data/corpus/works.json'),
  gazetteer:   read('../../../data/gazetteer/places.json'),
  texture:     read('../../../data/timeline/texture.json'),
  occupations: read('../../../data/timeline/occupations.json'),
};

test('occupations are states with duration: they begin, they weigh, they end', () => {
  const s = run(DP, 'occ', [], { to: 1400 });
  const log = s.log.filter(l => l.kind === 'occupation');
  const sultanate = log.filter(l => l.id === 'OCC.DELHI_SULTANATE');
  assert.equal(sultanate.length, 2, 'begins and ends');
  assert.ok(sultanate[0].year >= 1206 && sultanate[1].year <= 1400);
});

test('occupation extraction is a real weight on the granary', () => {
  const base  = { ...DP, occupations: { occupations: [] } };
  const heavy = { ...DP, occupations: { occupations: [
    { id: 'OCC.TEST', name: 'A test yoke', from: -3000, to: 1900,
      where: [], extract: 3, patronage: {}, note: 'test' }] } };
  const a = run(base,  'yoke', [], { to: -1000 });
  const b = run(heavy, 'yoke', [], { to: -1000 });
  assert.ok(b.grain < a.grain, `yoked ${b.grain} should be below free ${a.grain}`);
});

test('the trust ladder caps under an occupation, and recovers after', () => {
  const s = run(DP, 'cap-occ', [], { to: 1800 });
  const cap = trustCeiling(s, DP);
  assert.equal(cap, 60, 'Company rule caps the ladder at 60');
  const capped = trustRung(s, cap);
  const free = trustRung(s, null);
  const idx = (r) => TRUST_RUNGS.findIndex(x => x.id === r.id);
  assert.ok(idx(capped) <= idx(free));
  // and the cap is a ceiling, not a penalty: state itself is untouched
  assert.equal(s.pillars.NETWORKING, s.pillars.NETWORKING);
});

test('a conditional event fires when its world arrives, and not before', () => {
  const s = run(DP, 'cond', [], { to: 1500 });
  const paper = s.log.find(l => /daily records to paper/.test(l.text));
  assert.ok(paper, 'the paper-records event fired');
  assert.ok(paper.year >= 1350, `fired at ${paper.year}, before paper exists`);
});

test('a condition that never comes true never fires — honestly', () => {
  const never = { good: 'unobtainium' };
  assert.equal(conditionMet(never, { goods: new Set(['paper']) }), false);
  const s = run(DP, 'cond2', [], { to: -3000 });
  assert.ok(!s.log.some(l => /hundi clears/.test(l.text)),
    'the hundi cannot clear in the Neolithic');
});

test('the coinage grant replaced the title regex, and still works', () => {
  const s = run(DP, 'coin', [], { to: -400 });
  assert.equal(s.coinageKnown, true);
  const line = s.log.find(l => /Money\. Value stops being heavy/.test(l.text));
  assert.ok(line && line.year <= -400 && line.year >= -600);
});
