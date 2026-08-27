import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creditsHTML } from '../src/credits.js';
import { damagedHTML } from '../src/damaged.js';

const manifest = JSON.parse(
  readFileSync(new URL('../../../data/fonts/manifest.json', import.meta.url), 'utf8'));

test('the credits page names every font file shipped', () => {
  // The OFL requires the notice to travel with the fonts. "Every file" is the
  // release gate from docs/19 phase 54 — a subset added later without a
  // credit line fails here, not in a lawyer's inbox.
  const html = creditsHTML(manifest);
  for (const [script, info] of Object.entries(manifest.fonts)) {
    assert.ok(html.includes(info.family), `family ${info.family} (${script}) missing`);
    for (const part of info.parts) {
      assert.ok(html.includes(part.file), `file ${part.file} missing from credits`);
    }
  }
  assert.match(html, /SIL Open Font License/, 'the licence is named');
  assert.match(html, /Noto Project Authors/, 'the copyright holder is named');
});

test('the credits page states the method, not just the sources', () => {
  const html = creditsHTML(manifest);
  assert.match(html, /presents the argument/, 'the dispute register standing statement');
  assert.match(html, /does not adjudicate/);
  assert.match(html, /sources\.json/, 'points at the citations that ship');
});

test('the colophon renders stamped and unstamped', () => {
  const stamped = creditsHTML(manifest, { commit: 'abc1234', date: '2026-08-26', datapack: 'deadbeef' });
  assert.match(stamped, /abc1234/);
  assert.match(stamped, /deadbeef/);
  const dev = creditsHTML(manifest, null);
  assert.match(dev, /development build/, 'a dev build says so instead of lying');
});

test('the credits page survives a missing manifest', () => {
  // The dev server may not have fonts fetched; the page must render, not throw.
  assert.doesNotThrow(() => creditsHTML(null));
  assert.match(creditsHTML(null), /SIL Open Font License/);
});

/* ── The failure surface ────────────────────────────────────────────────── */

test('the damage panel keeps the save and speaks the game\'s language', () => {
  const html = damagedHTML(new Error('pillar NaN at year -2200'), '{"v":2,"seed":"s","d":[]}',
                           { commit: 'abc1234', date: '2026-08-26', datapack: 'deadbeef' });
  assert.match(html, /The record is damaged/, 'era-styled, not a stack trace headline');
  assert.match(html, /pillar NaN at year -2200/, 'the fault is shown, not hidden');
  assert.ok(html.includes('&quot;seed&quot;'), 'the save blob is in the panel, escaped');
  assert.match(html, /data-copy-save/, 'and offered for copy');
  assert.match(html, /abc1234/, 'with the colophon the bug report needs');
});

test('the damage panel never throws on strange faults', () => {
  for (const weird of [null, undefined, 'a string', 42, { odd: true }]) {
    assert.doesNotThrow(() => damagedHTML(weird, '', null), `threw on ${String(weird)}`);
  }
  // A malicious message cannot script the panel.
  const html = damagedHTML(new Error('<script>alert(1)</script>'), '<b>x</b>');
  assert.ok(!html.includes('<script>alert'), 'error text is escaped');
  assert.ok(!html.includes('<b>x</b>'), 'save text is escaped');
});
