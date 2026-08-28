#!/usr/bin/env node
/**
 * Build the recite game's deck: data/game/deck.json.
 *
 * One deck, three sources, no hand-maintained copies:
 *   - data/corpus/education.json   → Gita chapters + skill cards (agri, cattle,
 *                                    craft, arithmetic)
 *   - atlas-data/folklore.js       → the Dadi-Nani ki Kahaniyan: real state
 *                                    folk tales with en/hi titles and morals
 *   - atlas-data/vedas.js          → regional Vedic traditions, for the late-
 *                                    game Veda cards
 * plus a handful of authored Science cards (fire first — you cannot civilize
 * anyone in the cold).
 *
 * Every card: { id, book, category, level, title, hi?, recite, text, moral? }
 * Levels gate reveals; the level table itself ships in the deck so the client
 * has one source of truth for progression.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data/game/deck.json');

const edu = JSON.parse(readFileSync(join(ROOT, 'data/corpus/education.json'), 'utf8'));
const liftAtlas = (name) => {
  const src = readFileSync(join(ROOT, 'atlas-data', name), 'utf8');
  return JSON.parse(src.match(/window\.INDIA_DATA\.\w+\s*=\s*([\s\S]*?);\s*$/)[1]);
};
const folklore = liftAtlas('folklore.js');
const vedas = liftAtlas('vedas.js');

/* ── The level table ────────────────────────────────────────────────────── */

const LEVELS = [
  { lv: 1,  name: 'The Wild',        xp: 0 },
  { lv: 2,  name: 'First Words',     xp: 30 },
  { lv: 3,  name: 'Fire & Hands',    xp: 70 },
  { lv: 4,  name: 'Seeds',           xp: 120 },
  { lv: 5,  name: 'Herds',           xp: 180 },
  { lv: 6,  name: 'The Bazaar',      xp: 250 },
  { lv: 7,  name: 'Money',           xp: 330 },
  { lv: 8,  name: 'Order & Law',     xp: 420 },
  { lv: 9,  name: 'The Vedic Age',   xp: 520 },
  { lv: 10, name: 'Flourishing',     xp: 630 },
];

const BOOKS = [
  { id: 'gita',   title: 'Bhagavad Gita',            icon: '🕉️' },
  { id: 'kahani', title: 'Dadi-Nani ki Kahaniyan',   icon: '🪔' },
  { id: 'krishi', title: 'The Field Book',           icon: '🌾' },
  { id: 'shilpa', title: 'The Craft Book',           icon: '🧵' },
  { id: 'ganit',  title: 'The Number Book',          icon: '🔢' },
  { id: 'vigyan', title: 'The Science Book',         icon: '🔥' },
  { id: 'veda',   title: 'The Vedas',                icon: '📜' },
];

const cards = [];

/* ── Gita: 18 chapters. Ch1 opens the game; the last chapter closes it. ─── */

const GITA_LEVEL = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
                     11: 7, 12: 7, 13: 8, 14: 8, 15: 8, 16: 9, 17: 9, 18: 10 };
for (const c of edu.cards.filter((x) => x.kind === 'gita')) {
  const n = Number(c.id.slice(-2));
  cards.push({
    id: c.id, book: 'gita', category: 'Morals', level: GITA_LEVEL[n] ?? 8,
    // The yoga name is the card; the chapter number is bookkeeping.
    title: c.subtitle ? `${c.subtitle}` : c.title,
    sub: c.subtitle ? c.title : null,
    recite: c.recite, text: c.summary,
  });
}

/* ── Skills, routed to their books and levels ───────────────────────────── */

const SKILL_ROUTE = {
  'EDU.SKILL.AGRI.1':   { book: 'krishi', category: 'Agriculture', level: 4 },
  'EDU.SKILL.AGRI.2':   { book: 'krishi', category: 'Agriculture', level: 4 },
  'EDU.SKILL.CATTLE.1': { book: 'krishi', category: 'Agriculture', level: 5 },
  'EDU.SKILL.CATTLE.2': { book: 'krishi', category: 'Agriculture', level: 5 },
  'EDU.SKILL.CRAFT.1':  { book: 'shilpa', category: 'Craft', level: 3 },
  'EDU.SKILL.CRAFT.2':  { book: 'shilpa', category: 'Craft', level: 6 },
  'EDU.SKILL.ARITH.1':  { book: 'ganit', category: 'Numbers', level: 6 },
  'EDU.SKILL.ARITH.2':  { book: 'ganit', category: 'Numbers', level: 7 },
};
for (const c of edu.cards.filter((x) => x.kind === 'skill')) {
  const r = SKILL_ROUTE[c.id];
  if (!r) continue;
  cards.push({ id: c.id, ...r, title: c.title, sub: c.subtitle ?? null,
               recite: c.recite, text: c.summary });
}

/* ── Science: authored. Fire is the first thing you teach with your hands. ─ */

cards.push({
  id: 'SCI.FIRE', book: 'vigyan', category: 'Science', level: 3,
  title: 'Agni — the Keeping of Fire',
  recite: 'Twirl the hard stick on the soft board; feed the ember dry grass, then twigs, then your patience.',
  text: 'Fire is not found, it is kept. A hearth banked with ash holds its embers until morning; a camp that keeps fire cooks its meat, hardens its spear-points, and sits together after dark — and a people who sit together after dark start telling stories.',
});
cards.push({
  id: 'SCI.WHEEL', book: 'vigyan', category: 'Science', level: 6,
  title: 'The Potter\'s Wheel',
  recite: 'What spins carries: the wheel that throws a pot will one day carry the harvest.',
  text: 'A flat stone spun on a pivot turns wet clay into a vessel in minutes instead of days. Vessels store grain past the monsoon; carts on the same principle carry it to the next camp — and a camp that trades its surplus has invented the market without meaning to.',
});

/* ── Kahaniyan: real folk tales, spread level-by-level ──────────────────── */

const tales = [];
// Titles, tales AND morals all come localized ({en, hi}); take the string
// either way, keeping the hi variants where they exist.
const loc = (v, lang = 'en') => (v && typeof v === 'object' ? v[lang] ?? null : v ?? null);
for (const [slug, s] of Object.entries(folklore.states)) {
  for (const [i, t] of (s.tales ?? []).entries()) {
    tales.push({
      id: `KAH.${slug.toUpperCase().replace(/-/g, '_')}.${i + 1}`,
      title: loc(t.title) ?? 'A tale',
      hi: loc(t.title, 'hi'),
      moral: loc(t.moral),
      moralHi: loc(t.moral, 'hi'),
      text: loc(t.tale) ?? '',
      origin: loc(t.origin) ?? s.name,
    });
  }
}
// Deterministic order (by id), then dealt round the level table 1..9 so every
// level reveals a few new stories — the collection the user asked to unlock
// "level by level".
tales.sort((a, b) => a.id.localeCompare(b.id));
tales.forEach((t, i) => {
  cards.push({
    id: t.id, book: 'kahani', category: 'Stories', level: (i % 9) + 1,
    title: t.title, hi: t.hi,
    recite: t.moral ?? t.text.split('. ')[0] + '.',
    text: t.text, moral: t.moral, moralHi: t.moralHi, origin: t.origin,
  });
});

/* ── Vedas: four authored introductions + regional living traditions ────── */

const VEDA_INTROS = [
  ['VEDA.RIG',    'Rig Veda',    'A thousand and twenty-eight hymns, the oldest layer of the tradition — praise, question, and dawn after dawn.'],
  ['VEDA.SAMA',   'Sama Veda',   'The Rig set to melody: the same words, made to be sung — proof that a people remembers best what it can sing.'],
  ['VEDA.YAJUR',  'Yajur Veda',  'The formulas of the rite: what is said while the work is done. Method, spoken aloud.'],
  ['VEDA.ATHARVA','Atharva Veda','The Veda of daily life — healing, houses, harvests, quarrels mended. The everyday, kept holy.'],
];
for (const [id, title, recite] of VEDA_INTROS) {
  cards.push({ id, book: 'veda', category: 'Vedas', level: 9, title, recite, text: recite });
}
// Regional traditions: the strongest per-state entries, as late-game cards.
const vedaStates = Object.entries(vedas.states)
  .filter(([, s]) => (s.traditions?.length ?? 0) > 0 && s.summary)
  .sort(([a], [b]) => a.localeCompare(b))
  .slice(0, 6);
for (const [slug, s] of vedaStates) {
  const t = s.traditions[0];
  cards.push({
    id: `VEDA.RGN.${slug.toUpperCase().replace(/-/g, '_')}`,
    book: 'veda', category: 'Vedas', level: 9,
    title: `${t.name} — ${s.name}`,
    recite: t.note ?? s.summary.split('. ')[0] + '.',
    text: s.summary,
  });
}

/* ── Write ──────────────────────────────────────────────────────────────── */

const ids = new Set();
for (const c of cards) {
  if (ids.has(c.id)) throw new Error(`duplicate card id: ${c.id}`);
  ids.add(c.id);
  if (!BOOKS.some((b) => b.id === c.book)) throw new Error(`unknown book: ${c.book} (${c.id})`);
  if (!(c.level >= 1 && c.level <= 10)) throw new Error(`bad level: ${c.id}`);
  if (!c.recite) throw new Error(`no recite line: ${c.id}`);
}
cards.sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  note: 'Generated by tools/build-deck.mjs — do not edit by hand.',
  levels: LEVELS, books: BOOKS, cards,
}, null, 1));

const perLevel = {};
for (const c of cards) perLevel[c.level] = (perLevel[c.level] ?? 0) + 1;
console.log(`✓ data/game/deck.json — ${cards.length} cards, ${BOOKS.length} books`);
console.log('  per level:', Object.entries(perLevel).map(([l, n]) => `L${l}:${n}`).join(' '));
