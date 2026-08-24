import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { surveyable, surveySummary, believedValue, TIER } from '../src/survey.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
};
const tending = () => {
  const d = [];
  for (let y = -3000; y < 1900; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) d.push({ year: y, action: 'train-scribe' });
  return d;
};

test('every district starts with a provenance tier', () => {
  const s = run(DP, 'sv', [], { to: 0 });
  assert.ok(s.districts.size >= 40);
  for (const d of s.districts.values()) assert.ok(TIER[d.tier], `${d.id} tier ${d.tier}`);
});

test('most of the map begins unsurveyed, because it was', () => {
  const s = run(DP, 'sv', [], { to: 0 });
  const sum = surveySummary(s);
  assert.equal(sum.surveyed, 0);
  assert.ok(sum.absent + sum.derived === sum.total);
});

test('surveying costs grain and needs a scribe', () => {
  const target = [...run(DP, 'sv', [], { to: 900 }).districts.values()][0].id;
  const poor = run(DP, 'sv', [{ year: 900, action: 'survey', district: target }], { to: 950 });
  assert.equal(poor.districts.get(target).surveyed, null, 'no scribe, no survey');

  const rich = run(DP, 'sv', [...tending(),
    { year: 900, action: 'survey', district: target }], { to: 950 });
  assert.equal(rich.districts.get(target).surveyed, 900);
});

test('a survey replaces an assumption with a fact', () => {
  const target = [...run(DP, 'sv', [], { to: 900 }).districts.values()][0].id;
  const s = run(DP, 'sv', [...tending(), { year: 900, action: 'survey', district: target }], { to: 950 });
  const d = s.districts.get(target);
  assert.equal(d.tier, 'SOURCED');
  assert.equal(believedValue(d), d.truth);
  assert.notEqual(d.truth, null);
});

test('surveys sometimes disappoint — this is not a loading bar', () => {
  // Survey a lot of districts and check a real share come back worse than the
  // estimate. A survey that only ever improves things teaches nothing.
  const all = [...run(DP, 'sv', [], { to: 400 }).districts.keys()];
  const d = [...tending()];
  all.forEach((id, i) => d.push({ year: 400 + i * 3, action: 'survey', district: id }));
  const s = run(DP, 'sv', d, { to: 1400 });
  assert.ok(s.stats.surveys > 20, `only ${s.stats.surveys} surveys ran`);
  const bad = s.stats.surveysDisappointing / s.stats.surveys;
  assert.ok(bad > 0.2 && bad < 0.6, `${(bad * 100).toFixed(0)}% disappointed — should be around 40%`);
});

test('the truth was always the truth — looking does not change it', () => {
  // Survey the same district at two different dates. The answer must match:
  // the player is discovering, not rolling.
  const target = [...run(DP, 'sv', [], { to: 400 }).districts.keys()][3];
  const early = run(DP, 'sv', [...tending(), { year: 500, action: 'survey', district: target }], { to: 1400 });
  const late  = run(DP, 'sv', [...tending(), { year: 1300, action: 'survey', district: target }], { to: 1400 });
  assert.equal(early.districts.get(target).truth, late.districts.get(target).truth);
});

test('a district cannot be surveyed twice', () => {
  const target = [...run(DP, 'sv', [], { to: 400 }).districts.keys()][2];
  const s = run(DP, 'sv', [...tending(),
    { year: 900, action: 'survey', district: target },
    { year: 950, action: 'survey', district: target }], { to: 1000 });
  assert.equal(s.districts.get(target).surveyed, 900, 'the second attempt must be refused');
  assert.equal(s.stats.surveys, 1);
});

test('surveyable leads with what is least understood', () => {
  const s = run(DP, 'sv', tending(), { to: 900 });
  const list = surveyable(s);
  for (let i = 1; i < list.length; i++)
    assert.ok(TIER[list[i].tier].rank >= TIER[list[i-1].tier].rank);
  assert.ok(list.every(d => d.surveyed === null));
});

test('the map can say "we have not looked" as distinct from "there is nothing"', () => {
  const s = run(DP, 'sv', tending(), { to: 900 });
  const absent = [...s.districts.values()].filter(d => d.tier === 'ABSENT');
  assert.ok(absent.length > 0, 'something must be unsurveyed or the mechanic is dead');
  for (const d of absent) assert.equal(TIER[d.tier].trust, 0);
});

test('surveying does not break the rule', () => {
  const d = [...tending(), { year: 900, action: 'survey',
    district: [...run(DP, 'q', [], { to: 400 }).districts.keys()][1] }];
  assert.equal(run(DP, 'q', d).fingerprint, run(DP, 'q', d).fingerprint);
});

test('no district sits in open water', () => {
  const s = run(DP, 'sv', [], { to: 0 });
  for (const d of s.districts.values())
    assert.ok(d.land >= 0.25, `${d.name} at ${d.lon},${d.lat} is ${d.land * 100}% land`);
});

test('the map is mostly unknown, which is the point', () => {
  const s = run(DP, 'sv', [], { to: 0 });
  const sum = surveySummary(s);
  assert.ok(sum.absent / sum.total > 0.25,
    `only ${(sum.absent / sum.total * 100).toFixed(0)}% of the map is unsurveyed`);
  assert.ok(sum.derived > 0, 'some places really are well documented');
});

test('the best-documented districts are where the record actually is', () => {
  const s = run(DP, 'sv', [], { to: 0 });
  const best = [...s.districts.values()].sort((a, b) => b.evidence - a.evidence).slice(0, 6);
  const regions = new Set(best.map(d => d.region));
  // Tamilakam and the Gangetic plain have the deepest records in the dataset.
  assert.ok(regions.has('RGN.TAMILAKAM') || regions.has('RGN.GANGETIC'),
    `best-documented came out as ${[...regions].join(', ')}`);
});
