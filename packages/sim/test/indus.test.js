import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { indusReckoning, INDUS_TOWNS } from '../src/indus.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline:  read('../../../data/timeline/timeline.json'),
  works:     read('../../../data/corpus/works.json'),
  gazetteer: read('../../../data/gazetteer/places.json'),
  texture:   read('../../../data/timeline/texture.json'),
};

test('NO VILLAIN, enforced: not one invasion fires inside the Indus era', () => {
  const inv = DP.timeline.events.filter(e =>
    e.class === 'INVASION' && e.year >= -2600 && e.year < -1900);
  assert.deepEqual(inv.map(e => e.title), []);
});

test('the cities empty whatever the player does — dispersal, not defeat', () => {
  // Maximum effort: provision and dig at every town, every generation. If
  // this keeps the cities standing, the era has a win state and the tuning
  // is broken — "I saved Mohenjo-daro" is a bug report.
  const all = [];
  for (let y = -2350; y < -1900; y += 25)
    for (const t of INDUS_TOWNS) {
      all.push({ year: y, action: 'provision-town', town: t.id });
      all.push({ year: y + 5, action: 'dig-wells', town: t.id });
    }
  const s = run(DP, 'save-the-cities', all, { to: -1900, from: -2600,
    initial: { grain: 500000 } });
  const r = indusReckoning(s);
  assert.ok(r.standing <= 2,
    `${r.standing} cities still standing at -1900; the drying must not be beatable`);
});

test('managed resettlement carries far more forward than drift', () => {
  const drift = run(DP, 'emptying', [], { to: -1900, from: -2600 });
  const cols = [];
  for (let y = -2250; y < -1950; y += 20)
    for (const t of ['ganweriwala', 'kalibangan', 'rakhigarhi', 'mohenjo-daro'])
      cols.push({ year: y, action: 'resettle-east', town: t });
  const managed = run(DP, 'emptying', cols, { to: -1900, from: -2600,
    initial: { grain: 100000 } });
  const a = indusReckoning(drift).carried, b = indusReckoning(managed).carried;
  assert.ok(b.techniques > a.techniques * 2 + 1,
    `managed carried ${b.techniques} techniques vs drift ${a.techniques}`);
  assert.ok(b.resettled > 0 && a.resettled === 0);
});

test('Dholavira outlasts the Ghaggar towns — the engineering bought centuries', () => {
  const s = run(DP, 'sequence', [], { to: -1900, from: -2600 });
  const log = s.log.filter(l => l.kind === 'indus' && /stands empty/.test(l.text));
  const yearOf = (id) => log.find(l => l.town === id)?.year ?? -1900;
  assert.ok(yearOf('dholavira') > yearOf('kalibangan'),
    `Dholavira emptied ${yearOf('dholavira')}, Kalibangan ${yearOf('kalibangan')}`);
});

test('the reckoning has no score, and says what was never on offer', () => {
  const s = run(DP, 'reckon', [], { to: -1900, from: -2600 });
  const r = indusReckoning(s);
  assert.ok(!('score' in r));
  assert.match(r.lines[0], /Nobody sacked them/);
});

test('the era loop is deterministic like everything else', () => {
  const d = [{ year: -2200, action: 'resettle-east', town: 'kalibangan' }];
  const a = run(DP, 'indus-det', d, { to: -1900, from: -2600 });
  const b = run(DP, 'indus-det', d, { to: -1900, from: -2600 });
  assert.equal(a.fingerprint, b.fingerprint);
});

test('the scripted session: arc, silence and carriage all inside bounds', () => {
  // The compressed form of docs/17-indus-session.md's driver — a reasonable
  // player, not an optimal one.
  const d = [];
  for (let y = -2550; y < -2350; y += 50) d.push({ year: y, action: 'patronise' });
  for (const t of ['mohenjo-daro', 'harappa']) d.push({ year: -2450, action: 'dig-wells', town: t });
  for (let y = -2280; y < -2000; y += 30) d.push({ year: y, action: 'provision-town', town: 'mohenjo-daro' });
  for (let y = -2250; y < -2050; y += 25)
    for (const t of ['kalibangan', 'ganweriwala', 'rakhigarhi'])
      d.push({ year: y, action: 'resettle-east', town: t });
  const s = run(DP, 'indus-session', d, { from: -2600, to: -1900, initial: { grain: 14000 } });
  const r = indusReckoning(s);
  assert.ok(r.emptied >= 5, `only ${r.emptied} towns emptied`);
  assert.ok(r.carried.resettled >= 10, `only ${r.carried.resettled} columns east`);
  // Silence inside the era: at 5-year ticks and Indus cadence the floor is
  // two ticks = 17.1 minutes; the bound stays 20.
  const years = [...new Set(s.log.map(l => l.year))].sort((a, b) => a - b);
  const mpy = (20 * 60) / 700;
  let worst = 0;
  for (let i = 1; i < years.length; i++)
    worst = Math.max(worst, (years[i] - years[i - 1]) * mpy);
  assert.ok(worst <= 20, `${worst.toFixed(1)} silent minutes inside the era`);
});
