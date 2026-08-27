import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ELIGIBILITY, ELIGIBILITY_ORDER, validateLens, normalizeEligibility } from '../src/lenses.js';

test('six eligibility states, each with a distinct pigment and a reason', () => {
  assert.equal(ELIGIBILITY_ORDER.length, 6);
  const colors = new Set();
  for (const k of ELIGIBILITY_ORDER) {
    const e = ELIGIBILITY[k];
    assert.ok(e, `state ${k} defined`);
    assert.match(e.color, /^#[0-9A-F]{6}$/i);
    assert.ok(e.hint.length > 10, 'every state explains itself');
    colors.add(e.color.toLowerCase());
  }
  assert.equal(colors.size, 6, 'no two states share a pigment');
});

test('gold means yours and nothing else', () => {
  assert.equal(ELIGIBILITY.yours.color, '#C9A227');
  for (const k of ELIGIBILITY_ORDER.slice(1))
    assert.notEqual(ELIGIBILITY[k].color.toLowerCase(), '#c9a227', `${k} must not wear the player's gold`);
});

test('a malformed lens fails at registration, not on the map', () => {
  assert.throws(() => validateLens({ id: 'x', glyph: '✷', verbs: [] }), /at least one verb/);
  assert.throws(() => validateLens({ id: 'x', glyph: '✷', verbs: [{ id: 'v', label: 'v' }] }), /eligible/);
  const ok = validateLens({ id: 'x', glyph: '✷', verbs: [{ id: 'v', label: 'v',
    eligible: () => 'can', execute: () => {} }] });
  assert.equal(ok.id, 'x');
});

test('unknown eligibility clamps to never — fail closed, not loud', () => {
  assert.equal(normalizeEligibility('can'), 'can');
  assert.equal(normalizeEligibility('maybe'), 'never');
  assert.equal(normalizeEligibility(undefined), 'never');
});
