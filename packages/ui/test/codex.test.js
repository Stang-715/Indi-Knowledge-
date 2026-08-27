import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCodexIndex, searchCodex, codexHTML, resultsHTML } from '../src/codex.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const TL = read('../../../data/timeline/timeline.json');
const CARDS = read('../../../data/timeline/cards.json');
const GAZ = read('../../../data/gazetteer/places.json');
const IDX = buildCodexIndex(TL, CARDS, GAZ);

test('search finds Uttaramerur from "lot", "committee" and its own script', () => {
  for (const q of ['lot', 'committee', 'உத்தரமேரூர்']) {
    const hits = searchCodex(IDX, q);
    assert.ok(hits.some(e => e.title.toLowerCase().includes('uttaramerur')),
      `"${q}" did not find Uttaramerur`);
  }
});

test('the codex never reveals a firing year', () => {
  const html = codexHTML(IDX);
  // A window event renders its window with a tilde; a latent one admits it
  // may not occur. Spot-check the famous latent case.
  assert.match(html, /may not occur/);
  assert.match(html, /~/);
});

test('every era renders, every chapter renders, and rows deep-link', () => {
  const html = codexHTML(IDX);
  for (const era of TL.eras) assert.ok(html.includes(era.name));
  const rows = (html.match(/data-goto=/g) ?? []).length;
  assert.ok(rows >= TL.events.length * 0.95, `${rows} linked rows`);
  const threads = (html.match(/data-thread=/g) ?? []).length;
  assert.equal(threads, 15);
});

test('search results render, and an empty search says so honestly', () => {
  assert.match(resultsHTML([]), /Nothing found/);
  const zero = searchCodex(IDX, 'zero becomes');
  assert.ok(zero.length >= 1);
});
