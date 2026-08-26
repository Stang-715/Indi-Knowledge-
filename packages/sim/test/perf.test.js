import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';

/**
 * The performance tripwire (docs/19-play-depth.md Phase 54).
 *
 * The scrub bar and the save link both depend on full recompute being cheap:
 * every drag re-runs the world from the start. Measured at ~150 ms to 1900 on
 * this rig when the tripwire was set; the budget is 400 ms so CI noise and
 * slower rigs fit, but a regression that doubles the sim's cost still trips.
 * If this fails, profile before raising the number — the number moving IS the
 * finding.
 */

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
  polities: read('../../../data/polities/polities.json'),
};

test('full recompute to 1900 stays under 400 ms', () => {
  const decisions = [];
  for (let y = -3000; y < 1800; y += 100) decisions.push({ year: y, action: 'patronise' });
  run(DP, 'perf-warmup', decisions, { to: 1900 });          // JIT warm-up run
  const t0 = performance.now();
  const world = run(DP, 'perf', decisions, { to: 1900 });
  const ms = performance.now() - t0;
  assert.equal(world.year, 1900, 'the run actually completed');
  assert.ok(ms < 400, `full recompute took ${ms.toFixed(0)} ms — the scrub bar just got heavy`);
});
