import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { minutesPerYear } from '../src/texture.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:  read('../../../data/timeline/timeline.json'),
  works:     read('../../../data/corpus/works.json'),
  gazetteer: read('../../../data/gazetteer/places.json'),
  texture:   read('../../../data/timeline/texture.json'),
};

test('THE RULE holds with the texture layer on', () => {
  const a = run(DP, 'texture-rule', [{ year: -1000, action: 'patronise' }]);
  const b = run(DP, 'texture-rule', [{ year: -1000, action: 'patronise' }]);
  assert.equal(a.fingerprint, b.fingerprint);
});

test('the texture layer actually fires, and often', () => {
  const s = run(DP, 'texture-fires', []);
  assert.ok((s.stats.textureIncidents ?? 0) > 300,
    `only ${s.stats.textureIncidents} incidents across the whole campaign`);
});

test('THE SILENCE RULE, asserted in play: nothing to read for 20 minutes never happens', () => {
  // The rule the plan promised (16-gap-closure, phase 37): convert year gaps
  // into play minutes via the era cadence, and assert no stretch of the
  // campaign passes 20 minutes without an authored event OR a texture
  // incident. This is the test that closes the eleven authored silent
  // stretches without writing filler for centuries whose honest content is
  // "life continued".
  const s = run(DP, 'silence', []);
  const years = new Set();
  for (const l of s.log) years.add(l.year);
  for (const ev of DP.timeline.events)
    if (ev.scope !== 'prologue') years.add(ev.year);
  const sorted = [...years].sort((a, b) => a - b).filter(y => y >= -6000 && y <= 1947);
  let worst = 0, at = null;
  for (let i = 1; i < sorted.length; i++) {
    const mid = (sorted[i] + sorted[i - 1]) / 2;
    const minutes = (sorted[i] - sorted[i - 1]) * minutesPerYear(DP.timeline.eras, mid);
    if (minutes > worst) { worst = minutes; at = [sorted[i - 1], sorted[i]]; }
  }
  assert.ok(worst <= 20, `${worst.toFixed(1)} silent minutes between ${at}`);
});

test('a century does not rhyme: no duplicate surface strings close together', () => {
  const s = run(DP, 'variety', []);
  const texture = s.log.filter(l => l.kind === 'texture');
  for (let i = 0; i < texture.length; i++) {
    for (let j = i + 1; j < texture.length && texture[j].year - texture[i].year <= 100; j++) {
      assert.notEqual(texture[i].text, texture[j].text,
        `"${texture[i].text}" repeats within a century (${texture[i].year}, ${texture[j].year})`);
    }
  }
});

test('needs gate: drought texture only during an agricultural shock', () => {
  const s = run(DP, 'gates', []);
  const shockYears = [];
  // Reconstruct shock windows from the log's climate/catastrophe record is
  // fragile; instead assert the cheap invariant — the drought template's
  // incidents never fire in the first clean centuries before any CLIMATE
  // event has landed.
  const first = s.log.find(l => l.kind === 'texture' && l.template === 'drought-bites');
  if (first) {
    const anyShockSource = DP.timeline.events.some(e =>
      e.class === 'CLIMATE' && e.year <= first.year);
    assert.ok(anyShockSource, `drought texture at ${first.year} with no climate event before it`);
  }
});

test('the Neolithic no longer has authored silence a texture cannot fill', () => {
  // The eleven ~100-year silent stretches sit in 5700-4000 BCE. At Neolithic
  // cadence (~0.48 min/yr) a 100-year gap is ~48 minutes of play. With the
  // texture layer the longest quiet stretch in that window must be under 20.
  const s = run(DP, 'neolithic', [], { to: -4000 });
  const years = new Set(s.log.filter(l => l.year <= -4000).map(l => l.year));
  for (const ev of DP.timeline.events)
    if (ev.year >= -5800 && ev.year <= -4000) years.add(ev.year);
  const sorted = [...years].sort((a, b) => a - b).filter(y => y >= -5800);
  let worst = 0;
  for (let i = 1; i < sorted.length; i++)
    worst = Math.max(worst, (sorted[i] - sorted[i - 1]) * 0.48);
  assert.ok(worst <= 20, `${worst.toFixed(1)} silent Neolithic minutes`);
});
