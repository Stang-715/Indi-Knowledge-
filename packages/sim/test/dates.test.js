import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const TL = JSON.parse(readFileSync(
  new URL('../../../data/timeline/timeline.json', import.meta.url), 'utf8'));

/**
 * Date regression guard.
 *
 * The timeline is parsed out of prose, and a sign error is silent: "780 Valabhi
 * sacked" read as 780 BCE files a Gupta catastrophe in the Vedic period and
 * nothing complains. These are known dates, checked against the parse.
 */
const KNOWN = [
  ['8.2 kiloyear',        -6200], ['Dental drilling',     -6000],
  ['Kalibangan ploughed', -3500], ['Mayiladumparai',      -2172],
  ['Kalinga war',          -261], ['Aluvihare',              -29],
  ['Heliodorus',           -150], ['Periplus',              -50],
  ['Aryabhat',              499], ['Halmidi',               450],
  ['Brahmasphuta',          628], ['Valabhi sacked',        780],
  ['Tarisappalli',          849], ['Uttaramerur',           920],
  ['Gommateshwara',         983], ['Charyapada',           1100],
  ['Chera Perumals end',   1102], ['Nalanda sacked',       1193],
  ['Sukaphaa',             1228], ['Konark',               1250],
  ['Jnaneshwari',          1290], ['Kakatiya falls',       1323],
];

test('known events land on their known dates', () => {
  const wrong = [];
  for (const [frag, want] of KNOWN) {
    const e = TL.events.find(x => x.title.toLowerCase().includes(frag.toLowerCase()));
    if (!e) { wrong.push(`${frag}: missing`); continue; }
    if (Math.abs(e.year - want) > 6) wrong.push(`${frag}: want ${want}, got ${e.year}`);
  }
  assert.deepEqual(wrong, []);
});

test('every regional spine crosses the epoch in the right direction', () => {
  // A spine whose events are all BCE, or all CE, is a sign-parse failure —
  // every one of the twelve runs from prehistory into the medieval period.
  for (const r of TL.regions) {
    const evs = TL.events.filter(e => e.region === r.id);
    assert.ok(evs.some(e => e.year < 0), `${r.name} has no BCE events`);
    assert.ok(evs.some(e => e.year > 0), `${r.name} has no CE events`);
  }
});

test('no era table has been sign-inverted', () => {
  for (const era of TL.eras) {
    const evs = TL.events.filter(e => e.era === era.id && e.scope === 'subcontinental');
    if (evs.length === 0) continue;
    const median = evs.map(e => e.year).sort((a, b) => a - b)[Math.floor(evs.length / 2)];
    assert.ok(median >= era.from - 50 && median <= era.to + 50,
      `${era.name}: median event year ${median} is outside [${era.from}, ${era.to}]`);
  }
});

test('the Neolithic stays in the Neolithic', () => {
  const neo = TL.events.filter(e => e.era === 'ERA.EARLY_NEOLITHIC' && e.scope !== 'prologue');
  for (const e of neo) assert.ok(e.year < 0, `${e.id} has a positive year`);
});
