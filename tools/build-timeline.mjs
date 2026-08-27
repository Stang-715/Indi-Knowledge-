#!/usr/bin/env node
/**
 * Build data/timeline/timeline.json from docs/07-timeline.md.
 *
 * The document is the source of truth. Events are authored as markdown tables
 * because that is what a historian will actually edit; this turns them into the
 * structured spine the simulation reads, and enforces the seven validations from
 * docs/07-timeline.md §5.2.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CLASS_EFFECTS, MAG_WEIGHT } from '../packages/sim/src/effects.js';
import { indexCards, authoredFor } from '../packages/ui/src/eventcard.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'docs/07-timeline.md');
const OUT = join(ROOT, 'data/timeline/timeline.json');

/* ── Era definitions, with the locked cadence ───────────────────────────── */

const ERAS = [
  { n: 1,  id:'ERA.EARLY_NEOLITHIC',   name:'Early Neolithic',              from:-6000, to:-4500, hours:12, tick:5 },
  { n: 2,  id:'ERA.LATE_NEOLITHIC',    name:'Late Neolithic & Chalcolithic',from:-4500, to:-3300, hours:12, tick:5 },
  { n: 3,  id:'ERA.EARLY_HARAPPAN',    name:'Early Harappan',               from:-3300, to:-2600, hours:11, tick:5 },
  { n: 4,  id:'ERA.INDUS',             name:'Indus Civilisation',           from:-2600, to:-1900, hours:20, tick:5 },
  { n: 5,  id:'ERA.LATE_HARAPPAN',     name:'Late Harappan',                from:-1900, to:-1300, hours:10, tick:5 },
  { n: 6,  id:'ERA.EARLY_VEDIC',       name:'Early Vedic',                  from:-1300, to:-900,  hours:10, tick:1 },
  { n: 7,  id:'ERA.LATE_VEDIC',        name:'Late Vedic',                   from:-900,  to:-600,  hours:9,  tick:1 },
  { n: 8,  id:'ERA.SECOND_URBAN',      name:'Second Urbanisation',          from:-600,  to:-322,  hours:15, tick:1 },
  { n: 9,  id:'ERA.MAURYAN',           name:'Mauryan',                      from:-322,  to:-185,  hours:13, tick:1 },
  { n:10,  id:'ERA.CLASSICAL',         name:'Classical',                    from:-185,  to:320,   hours:18, tick:1 },
  { n:11,  id:'ERA.GUPTA',             name:'Gupta & Post-Gupta',           from:320,   to:650,   hours:15, tick:1 },
  { n:12,  id:'ERA.REGIONAL_KINGDOMS', name:'Regional Kingdoms',            from:650,   to:850,   hours:10, tick:1 },
  { n:13,  id:'ERA.CHOLA',             name:'The Chola Age',                from:850,   to:1279,  hours:18, tick:1 },
  { n:14,  id:'ERA.DELHI_VIJAYANAGARA',name:'Delhi & Vijayanagara',         from:1279,  to:1526,  hours:14, tick:1 },
  { n:15,  id:'ERA.EARLY_MODERN',      name:'Early Modern',                 from:1526,  to:1757,  hours:10, tick:1 },
  { n:16,  id:'ERA.COLONIAL',          name:'Colonial',                     from:1757,  to:1947,  hours:13, tick:1 },
];

/** Regions with their own parallel spine (docs/07-timeline.md Part 3B). */
const REGIONS = {
  'Tamilakam':'RGN.TAMILAKAM', 'Karnataka':'RGN.KARNATAKA',
  'Andhra & Telangana':'RGN.ANDHRA', 'Kerala':'RGN.KERALA',
  'Bengal & Vanga':'RGN.BENGAL', 'Odisha & Kalinga':'RGN.ODISHA',
  'Assam & the Northeast':'RGN.ASSAM', 'Kashmir':'RGN.KASHMIR',
  'Gujarat & Saurashtra':'RGN.GUJARAT',
  'Maharashtra & the western Deccan':'RGN.MAHARASHTRA',
  'Rajasthan & the western desert':'RGN.RAJASTHAN',
  'Sri Lanka':'RGN.SRI_LANKA',
};

/** What kind of thing tells us an event of this class happened at all. */
const EVIDENCE = {
  SITE:        'Excavation: stratigraphy, pottery sequence and radiocarbon from the site itself.',
  WORK:        'The text, and the works that quote or answer it.',
  TRANSITION:  'Material remains — the object, its composition, and an absolute date where one exists.',
  CLIMATE:     'Speleothem records, lake cores, and settlement abandonment sequences.',
  CATASTROPHE: 'Destruction layers, and accounts written afterwards by people with a position.',
  INVASION:    'Inscriptions, coinage, and chronicles — usually the victor\'s.',
  TRADE:       'Goods found far from where they were made, and the documents of the people who moved them.',
  FOUNDATION:  'Inscriptions, copper plates and land grants.',
  REFORM:      'Texts, and the institutions that outlived the argument.',
  STRUCTURE:   'The building, and the inscription on it.',
  AGRICULTURE: 'Archaeobotany: seeds, phytoliths and field systems.',
  FRONTIER:    'Faunal remains, settlement pattern, and the silence of the settled record.',
  EPOCH:       'A convention. Eras are drawn by historians, not lived by anyone.',
  COLONIAL:    'Company and government records, which are voluminous and interested.',
  // The document leaves regnal and dynastic events unclassed. They are not
  // unevidenced — they are the best-evidenced events in the ancient record,
  // because a reign is what inscriptions are dated by.
  '\u2014':    'Inscriptions dated in regnal years, coinage, and the dynastic lists that later chronicles compile from both.',
};

const CLASSES = new Set(['SITE','WORK','REFORM','FOUNDATION','TRANSITION','INVASION',
  'CATASTROPHE','TRADE','FRONTIER','CLIMATE','COLONIAL','EPOCH','STRUCTURE','AGRICULTURE','—']);

/* ── Parsing ────────────────────────────────────────────────────────────── */

/** Strip markdown emphasis and footnote marks, keep the words. */
function clean(s) {
  return s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/‡/g, '')
          .replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Parse a year cell. Handles: `~6000`, `~2172 BCE`, `261`, `563–480`, `~29 BCE`,
 * `~30 CE`. Returns {year, yearEnd, approx}.
 *
 * The sign convention is the fiddly part, and getting it wrong is silent: a table
 * that reads "780 Valabhi sacked" means 780 CE, but a naive rule inside a span
 * that starts in 6000 BCE reads it as 780 BCE and files a Gupta-era catastrophe
 * in the Vedic period.
 *
 * The document's own convention is what to follow: every table that crosses the
 * epoch marks the crossing explicitly with `CE`, and all twelve regional spines
 * do. So track a mode per table and flip it only on an explicit marker.
 *
 * An earlier version also flipped when a bare year stopped descending, on the
 * theory that BCE years count down. That is true of the data but not of the
 * prose: the 8.2 kiloyear event is written mid-table, out of order, because it
 * is thematically placed — and the heuristic read it as the epoch crossing and
 * inverted the entire Neolithic. Explicit markers only.
 */
function parseYear(cell, ctx) {
  const raw = clean(cell);
  const approx = /~/.test(raw);
  const bce = /\bBCE\b/.test(raw);
  const ce  = /\bCE\b/.test(raw);
  const nums = raw.replace(/[~]/g, '').match(/\d+/g);
  if (!nums) return null;

  let a = parseInt(nums[0], 10);
  let b = nums.length > 1 ? parseInt(nums[1], 10) : null;

  if (ce)  ctx.mode = 1;
  if (bce) ctx.mode = -1;

  // A span wholly after the epoch cannot hold BCE years.
  if (ctx.from >= 0) ctx.mode = 1;
  const sign = ctx.mode;
  ctx.lastAbs = a;

  let year = sign * a;
  let yearEnd = b === null ? null : sign * b;
  // A range like 563–480 BCE descends; normalise so year <= yearEnd.
  if (yearEnd !== null && yearEnd < year) [year, yearEnd] = [yearEnd, year];
  return { year, yearEnd, approx };
}

/** Stable slug for an id. */
function slug(s) {
  return s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 44);
}

/**
 * Parse a skim-era prose run: "1221 Genghis at the Indus · 1297-1308 Mongol
 * invasions repelled · ...". Bold marks a W-magnitude event; everything else is M.
 */
function parseSkim(text, era, seenIds) {
  const out = [];
  for (const chunk of text.split('·')) {
    const bold = /\*\*/.test(chunk);
    const raw = clean(chunk);
    if (!raw) continue;
    const m = raw.match(/^(~?)(\d{3,4})(?:\s*[-–]\s*(\d{2,4}))?\s+(.+)$/);
    if (!m) continue;
    const approx = m[1] === '~';
    const year = parseInt(m[2], 10);
    let yearEnd = m[3] ? parseInt(m[3], 10) : null;
    // "1440-1518" is a full year; "1540-55" is abbreviated.
    if (yearEnd !== null && yearEnd < 100) yearEnd = Math.floor(year / 100) * 100 + yearEnd;
    const title = m[4].trim();
    if (title.length < 3) continue;

    const certainty = approx ? 0.7 : 0.95;
    const trigger = certainty >= 0.9 ? 'dated' : 'window';
    const cls = /invasion|sack|Panipat|Genghis|Timur|Nadir|Mongol/i.test(title) ? 'INVASION'
              : /famine|Jallianwala/i.test(title) ? 'CATASTROPHE'
              : /Company|Plassey|Diwani|Permanent Settlement|Macaulay|Drain|removal/i.test(title) ? 'COLONIAL'
              : /founded|chartered|Congress|Khalsa|crowned/i.test(title) ? 'FOUNDATION'
              : /paper|currency|rupiya|railway|telegraph/i.test(title) ? 'TRANSITION'
              : /Granth|Ain-i|Sirr-i|series|Kabir|Nanak|Chaitanya/i.test(title) ? 'WORK'
              : 'REFORM';

    let id = `EVT.${year}.${slug(title)}`;
    const n = (seenIds.get(id) ?? 0) + 1;
    seenIds.set(id, n);
    if (n > 1) id += `_${n}`;

    const ev = {
      id, title, year, year_end: yearEnd, era: era.id, class: cls,
      magnitude: bold ? 'W' : 'M', certainty, trigger,
      provenance: certainty >= 0.9 ? 'SOURCED' : 'DERIVED',
      evidence: EVIDENCE[cls] ?? 'The record, such as it is.',
      scope: 'subcontinental', region: null, dispute: false,
    };
    if (trigger === 'window') ev.window = [year - 10, (yearEnd ?? year) + 10];
    if (cls === 'INVASION') ev.becomes = 'nothing';
    out.push(ev);
  }
  return out;
}

function parseTables(md) {
  const lines = md.split('\n');
  const events = [];
  const seenIds = new Map();

  let ctx = null;            // { eraId, from, to, scope, region }
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Era heading: "## Era 4 · Indus Civilisation — 2600–1900 BCE · 20 h · 56 events"
    const eraM = line.match(/^## Era (\d+) ·/);
    if (eraM) {
      const era = ERAS.find(e => e.n === parseInt(eraM[1], 10));
      ctx = { eraId: era.id, from: era.from, to: era.to, scope: 'subcontinental', region: null,
              mode: era.from < 0 ? -1 : 1, lastAbs: null };
      inTable = false;
      continue;
    }

    // Skim era heading: "### Era 14 · Delhi & Vijayanagara — 1279–1526 · 14 h"
    const skimM = line.match(/^### Era (\d+) ·/);
    if (skimM) {
      const era = ERAS.find(e => e.n === parseInt(skimM[1], 10));
      // The skim eras are authored as prose runs, not tables — deliberately thin
      // (docs/07-timeline.md "The skim"). Gather the paragraph and split on ·.
      const buf = [];
      for (let j = i + 1; j < lines.length && !/^#/.test(lines[j]); j++) buf.push(lines[j]);
      for (const ev of parseSkim(buf.join(' '), era, seenIds)) events.push(ev);
      ctx = null; inTable = false;
      continue;
    }

    // Regional spine heading: "### Tamilakam — 39 events"
    const regM = line.match(/^### (.+?) —/);
    if (regM) {
      const name = clean(regM[1]).replace(/ — coupled external$/, '');
      const id = REGIONS[name];
      if (id) {
        ctx = { eraId: null, from: -6000, to: 1947, scope: 'regional', region: id, regionName: name,
                mode: -1, lastAbs: null };
        inTable = false;
      }
      continue;
    }

    if (/^#/.test(line)) { if (!eraM && !regM) inTable = false; continue; }
    if (!ctx) continue;

    if (/^\|\s*Year\s*\|/.test(line)) { inTable = true; continue; }
    if (/^\|[-\s|]+\|$/.test(line))   continue;
    if (!/^\|/.test(line))            { inTable = false; continue; }
    if (!inTable) continue;

    const cells = line.split('|').slice(1, -1);
    if (cells.length < 4) continue;                       // continuation/aside rows
    const [yearCell, titleCell, classCell, magCell] = cells;
    if (!clean(yearCell)) continue;                       // indented commentary row

    const y = parseYear(yearCell, ctx);
    if (!y) continue;

    const title = clean(titleCell);
    if (!title) continue;

    let cls = clean(classCell) || '—';
    if (!CLASSES.has(cls)) cls = '—';
    const mag = clean(magCell) || 'm';
    if (!['W','M','R','m'].includes(mag)) continue;

    const dispute = /‡/.test(titleCell);

    // Era assignment for regional events: find the era containing the year.
    const eraId = ctx.eraId ?? (ERAS.find(e => y.year >= e.from && y.year < e.to)?.id ?? ERAS[0].id);

    // Certainty: approximate dates and disputes are less certain. This is what
    // drives the trigger type, so uncertainty becomes mechanics not a disclaimer.
    let certainty = y.approx ? 0.7 : 0.95;
    if (dispute) certainty = 0.45;
    if (y.year < -3000) certainty = Math.min(certainty, 0.6);

    const trigger = dispute ? 'latent' : (certainty >= 0.9 ? 'dated' : 'window');
    const spread = Math.max(5, Math.round(Math.abs(y.year) * 0.02));

    let id = `EVT.${y.year < 0 ? 'M' : ''}${Math.abs(y.year)}.${slug(title)}`;
    const n = (seenIds.get(id) ?? 0) + 1;
    seenIds.set(id, n);
    if (n > 1) id += `_${n}`;

    // The campaign opens at 6000 BCE. A handful of authored events predate it —
    // the 8.2 kiloyear cooling among them. They are real, they matter, and they
    // are not fireable: they become PROLOGUE, shown as the world the player
    // inherits rather than something that happens to them.
    const scope = y.year < -6000 ? 'prologue' : ctx.scope;

    // Provenance, derived from certainty and dispute. Every entity that asserts
    // a fact about the world has to say what kind of claim it is — the datapack
    // validator enforces it, and it caught all 789 of these missing.
    const provenance = dispute ? 'DERIVED'
                     : certainty >= 0.9 ? 'SOURCED'
                     : certainty >= 0.6 ? 'DERIVED'
                     : 'SYNTHESIZED';

    const ev = {
      id,
      title,
      provenance,
      evidence: EVIDENCE[cls] ?? 'The record, such as it is.',
      year: y.year,
      year_end: y.yearEnd,
      era: eraId,
      class: cls,
      magnitude: mag,
      certainty: Number(certainty.toFixed(2)),
      trigger,
      scope,
      region: ctx.region,
      dispute,
      ...(dispute ? { dispute_scope: 'date' } : {}),
    };
    if (trigger === 'window') ev.window = [y.year - spread, (y.yearEnd ?? y.year) + spread];
    // Every INVASION carries a `becomes` field, even if the value is "nothing".
    if (cls === 'INVASION') ev.becomes = 'nothing';
    events.push(ev);
  }
  return events;
}

/* ── Validation (docs/07-timeline.md §5.2) ──────────────────────────────── */

function validate(doc) {
  const errors = [], warnings = [];
  const eraById = new Map(doc.eras.map(e => [e.id, e]));

  // 1. Every event's year falls inside its era.
  for (const ev of doc.events) {
    const era = eraById.get(ev.era);
    if (!era) { errors.push(`${ev.id}: unknown era ${ev.era}`); continue; }
    if (ev.scope === 'prologue') continue;   // predates the campaign by design
    if (ev.year < era.from - 1 || ev.year > era.to + 1)
      errors.push(`${ev.id}: year ${ev.year} outside era ${era.id} [${era.from}, ${era.to}]`);
  }

  // 3. trigger consistent with certainty — nothing below 0.9 may be `dated`.
  for (const ev of doc.events)
    if (ev.trigger === 'dated' && ev.certainty < 0.9)
      errors.push(`${ev.id}: dated trigger with certainty ${ev.certainty}`);

  // 4. Every INVASION has a `becomes` field.
  for (const ev of doc.events)
    if (ev.class === 'INVASION' && typeof ev.becomes !== 'string')
      errors.push(`${ev.id}: INVASION without becomes`);

  // 5. A disputed event may not claim near-certainty — but only when what is
  //    disputed is whether it happened, or when.
  //
  //    Authoring the climate events exposed this: the Bengal famine of 1943
  //    certainly happened, and what is argued is its CAUSATION. Forcing its
  //    certainty below 0.9 would have the game state that the famine is
  //    doubtful, which is both false and offensive. So a disputed event now
  //    declares dispute_scope, and the certainty rule applies to the two scopes
  //    where certainty is the thing at issue.
  const CERTAINTY_SCOPES = new Set(['occurrence', 'date']);
  for (const ev of doc.events) {
    if (!ev.dispute) continue;
    const scope = ev.dispute_scope ?? 'occurrence';
    if (!['occurrence', 'date', 'causation', 'interpretation'].includes(scope))
      errors.push(`${ev.id}: dispute_scope "${scope}" is not one of occurrence/date/causation/interpretation`);
    if (CERTAINTY_SCOPES.has(scope) && ev.certainty >= 0.9)
      errors.push(`${ev.id}: ${scope} is disputed and certainty is ${ev.certainty}`);
  }

  // 6. Cadence hours sum to 210; pre-1300 share >= 80%.
  const total = doc.eras.reduce((s, e) => s + e.hours, 0);
  if (total !== 210) errors.push(`cadence: hours sum to ${total}, must be 210`);
  const ancient = doc.eras.filter(e => e.to <= 1300).reduce((s, e) => s + e.hours, 0);
  const share = ancient / total;
  if (share < 0.80)
    errors.push(`cadence: pre-1300 share is ${(share*100).toFixed(1)}%, must be >= 80%`);

  // 7. No era goes more than 20 minutes of play without an authored event.
  for (const era of doc.eras) {
    const n = doc.events.filter(e => e.era === era.id && e.scope === 'subcontinental').length;
    const gap = n === 0 ? Infinity : (era.hours * 60) / n;
    if (gap > 20) warnings.push(
      `density: ${era.name} — ${n} events across ${era.hours} h = one per ${gap === Infinity ? '∞' : gap.toFixed(1)} min`);
  }

  // Rule 5, enforceable at last: every disputed event carries at least two
  // citations. For nine years of this project the rule existed and nothing
  // could check it.
  for (const ev of doc.events)
    if (ev.dispute && (!ev.sources || ev.sources.length < 2))
      errors.push(`${ev.id}: disputed with ${ev.sources?.length ?? 0} citation(s)`);

  return { errors, warnings, share, total };
}

/* ── Build ──────────────────────────────────────────────────────────────── */

const md = readFileSync(SRC, 'utf8');
const events = parseTables(md);

/**
 * Merge the supplements.
 *
 * The 363 events of phases 23-33 are authored as JSON under
 * data/timeline/supplement/ rather than as more markdown tables. The document
 * stays what a historian edits for the narrative spine; the supplements are
 * where bulk goes, in exactly the shape a community datapack uses — so the
 * same validator checks both and there is one format, not two.
 */
const SUPP = join(ROOT, 'data/timeline/supplement');
const supplements = [];
try {
  for (const f of readdirSync(SUPP).filter(x => x.endsWith('.json')).sort()) {
    const doc = JSON.parse(readFileSync(join(SUPP, f), 'utf8'));
    for (const ev of doc.events ?? []) supplements.push({ ...ev, _from: f });
  }
} catch (e) { if (e.code !== 'ENOENT') throw e; }

/**
 * A supplement event may SUPERSEDE a document event, by title fragment.
 *
 * The document's skim carries "1943 the Bengal Famine" as five words; the
 * supplement carries the same famine with an evidence line, a dispute scope and
 * a provenance tier. Without this both end up in the timeline and the same
 * famine happens twice — which is what the first merge did, seven times over.
 */
const seenSupp = new Set(events.map(e => e.id));
let merged = 0, collided = 0, superseded = 0;
const supersededTitles = [];
for (const ev of supplements) {
  if (seenSupp.has(ev.id)) { collided++; continue; }
  const { _from, replaces, ...rest } = ev;
  if (replaces) {
    const frags = Array.isArray(replaces) ? replaces : [replaces];
    for (const frag of frags) {
      const f = frag.toLowerCase();
      for (let i = events.length - 1; i >= 0; i--) {
        if (!events[i].title.toLowerCase().includes(f)) continue;
        if (Math.abs(events[i].year - rest.year) > 200) continue;
        supersededTitles.push(`${events[i].title.slice(0, 46)} -> ${rest.id}`);
        events.splice(i, 1);
        superseded++;
      }
    }
  }
  seenSupp.add(ev.id);
  events.push(rest);
  merged++;
}

/**
 * Collapse the same event written twice.
 *
 * The document lists an era spine in Part 3 and a regional spine in Part 3B,
 * and where they overlap — Utnur's ashmound, the Kalibangan ploughed field,
 * the Daimabad bronzes — the same thing is written in both, in slightly
 * different words. The supplements then added more. A hundred and eleven
 * pairs, and the player would have seen every one of them happen twice.
 *
 * Two events are the same event if they sit within sixty years and their
 * titles share most of their content words. The survivor is the one carrying
 * more: an evidence line first, then more fields, then the longer title. The
 * comparison is over a canonical sort, so the result does not depend on the
 * order the files happened to be read in.
 */
const STOP = new Set(['the','a','an','of','and','in','at','on','to','is','as','its','for','with','by','from']);
const contentWords = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
  .split(/\s+/).filter(w => w.length > 1 && !STOP.has(w))
  // Crude singularisation, enough that "costs collapse" and "cost collapses"
  // count as the same words.
  .map(w => w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w));
// How many titles a word appears in. A shared rare word — "diji", "utnur",
// "ashmound" — means two lines are about the same thing; a shared common one
// — "temple", "completed" — means nothing at all, and matching on those
// collapsed Brihadeeswarar into Gangaikondacholapuram on the strength of
// "temple" and "completed".
const titleDf = new Map();
for (const e of events)
  for (const w of new Set(contentWords(e.title)))
    titleDf.set(w, (titleDf.get(w) ?? 0) + 1);

const richness = (e) => [
  (e.evidence ?? '').length,
  Object.keys(e).length,
  e.title.length,
].join('|');

events.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
const collapsed = [];
for (let i = 0; i < events.length; i++) {
  for (let j = events.length - 1; j > i; j--) {
    const a = events[i], b = events[j];
    if (Math.abs(a.year - b.year) > 60) continue;
    const A = contentWords(a.title), B = contentWords(b.title);
    if (!A.size || !B.size) continue;
    let shared = 0, rare = false;
    for (const w of A) {
      if (!B.has(w)) continue;
      shared++;
      if ((titleDf.get(w) ?? 0) <= 12) rare = true;
    }
    // A strict subset is a duplicate whatever the words are: "Kalibangan I
    // fortified" says nothing "Kalibangan I: a fortified parallelogram,
    // mudbrick" does not.
    const identical = a.title.toLowerCase() === b.title.toLowerCase();
    const subset = identical || (shared >= 2 && (shared === A.size || shared === B.size));
    // Otherwise: three shared words, one of them uncommon, and most of the
    // shorter title. Two is not enough — "temple" and "completed" are shared by
    // Brihadeeswarar and Gangaikondacholapuram, which are forty years and a
    // hundred and fifty kilometres apart.
    if (!subset) {
      if (shared < 3 || !rare) continue;
      if (shared / Math.min(A.size, B.size) < 0.6) continue;
    }
    // Keep the richer one. If b wins, move it into a's slot so the outer loop
    // keeps comparing against the survivor.
    const loser = richness(b) > richness(a) ? (events[i] = b, a) : b;
    // Keep the loser's payload. The two lines are the same event, but they were
    // written by different hands and carry different fields: the document's
    // version may be the better sentence while the supplement's is the one
    // holding `corpus: preserve` or a `becomes`. Dropping it whole lost three
    // of the corpus rescues and nobody would have noticed until a campaign ran
    // without Atisha in it.
    for (const [k, v] of Object.entries(loser)) {
      if (events[i][k] === undefined || events[i][k] === null || events[i][k] === false)
        if (v !== undefined && v !== null && v !== false) events[i][k] = v;
    }
    collapsed.push(`${loser.year} ${loser.title.slice(0, 44)} -> ${events[i].id}`);
    events.splice(j, 1);
  }
}

/**
 * An event's era is whichever era contains its year — not the block it was
 * written under. The document groups by narrative, and a few entries sit under
 * the wrong heading (Genghis 1221 filed with Delhi 1279+, Third Panipat 1761
 * filed with Early Modern which ends 1757). Reassign, and say so, because a
 * silent correction is how a data bug becomes permanent.
 */
const reassigned = [];
for (const ev of events) {
  if (ev.scope === 'prologue') continue;
  const era = ERAS.find(e => ev.year >= e.from && ev.year < e.to)
           ?? ERAS.find(e => ev.year === e.to);
  if (era && era.id !== ev.era) {
    reassigned.push(`${ev.year} ${ev.title.slice(0, 46)} — ${ev.era} → ${era.id}`);
    ev.era = era.id;
  }
}
events.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));

/* ── Phase 35: the payload — where, affects, teaches ─────────────────────
 *
 * Until this pass every event of a class did the identical thing to the
 * identical pillars, and landed no closer to the map than one of twelve
 * regions. Three derived fields fix that, baked here so the data is explicit
 * and the engine stays dumb:
 *
 *   where    gazetteer keys, derived from the title and evidence text by
 *            longest-name-first matching. Falls back to the region id (which
 *            is itself a gazetteer entry) — honest coarseness, never fake
 *            precision. An explicit `where` in a supplement wins and every
 *            key is validated; an unresolvable place fails the build exactly
 *            as an unresolvable work does.
 *   affects  final pillar deltas. Hand-authored where a card states a claim
 *            (data/timeline/affects.json, longest-match like cards); seeded
 *            jitter on the class defaults everywhere else, keyed by event id
 *            so the same build always bakes the same world.
 *   teaches  the one-line takeaway: the authored card's "why" where a card
 *            exists, the event's own note otherwise.
 */
const GAZ = JSON.parse(readFileSync(join(ROOT, 'data/gazetteer/places.json'), 'utf8'));
const GAZ_IDS = new Set(GAZ.places.map(g => g.id));
const GAZ_BY_NAME = GAZ.places
  .filter(g => g.kind !== 'region')
  .map(g => ({ id: g.id, needle: g.name.toLowerCase().split(' (')[0] }))
  .concat(GAZ.places.filter(g => g.kind !== 'region' && g.id.includes(' '))
    .map(g => ({ id: g.id, needle: g.id })))
  .sort((a, b) => b.needle.length - a.needle.length);

const AFFECTS = JSON.parse(readFileSync(join(ROOT, 'data/timeline/affects.json'), 'utf8'))
  .affects.sort((a, b) => b.match.length - a.match.length);

const CARDS = JSON.parse(readFileSync(join(ROOT, 'data/timeline/cards.json'), 'utf8'));
const SOURCES = JSON.parse(readFileSync(join(ROOT, 'data/timeline/sources.json'), 'utf8'));
const SOURCE_KEYS = Object.keys(SOURCES.sources).sort((a, b) => b.length - a.length);
const CARD_IDX = indexCards(CARDS);

// Deterministic 32-bit hash for the jitter. No Math.random in a build tool
// whose output is diffed and committed.
function h32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

const whereErrors = [];
let precise = 0, affected = 0, taught = 0;
for (const ev of events) {
  // where
  if (Array.isArray(ev.where)) {
    for (const k of ev.where) if (!GAZ_IDS.has(k))
      whereErrors.push(`${ev.id}: unresolvable place "${k}"`);
  } else {
    const hay = (ev.title + ' ' + (ev.evidence ?? '')).toLowerCase();
    const hits = [];
    for (const g of GAZ_BY_NAME) {
      if (hits.length >= 3) break;
      if (hay.includes(g.needle) && !hits.includes(g.id)) hits.push(g.id);
    }
    if (hits.length) { ev.where = hits; precise++; }
    else if (ev.region) ev.where = [ev.region];
    else ev.where = [];
  }

  // affects
  if (!ev.affects) {
    const t = ev.title.toLowerCase();
    const hand = AFFECTS.find(a => t.includes(a.match.toLowerCase()));
    if (hand) ev.affects = { ...hand.pillars };
    else {
      const base = CLASS_EFFECTS[ev.class] ?? {};
      const w = MAG_WEIGHT[ev.magnitude] ?? 0.5;
      const out = {};
      let i = 0;
      for (const [pillar, d] of Object.entries(base)) {
        // 0.70–1.30, per event per pillar, stable across builds.
        const jitter = 0.70 + ((h32(ev.id + ':' + pillar) % 61) / 100);
        out[pillar] = Math.round(d * w * jitter * 100) / 100;
        i++;
      }
      if (i) ev.affects = out;
    }
    if (ev.affects) affected++;
  } else affected++;

  // becomes — the last eighteen placeholders, filled by table (phase 40)
  if (ev.class === 'INVASION' && (!ev.becomes || ev.becomes === 'nothing')) {
    const t = ev.title;
    if (t.includes("Dasarajna")) ev.becomes = "Bharata hegemony on the Ravi, and a battle remembered in hymn so long it becomes the epic tradition's seed.";
    if (t.includes("Ajatashatru; the war with Vajji")) ev.becomes = "Magadhan primacy, siege engineering as a discipline, and the republican form's strongest example gone \u2014 the template for absorbing an assembly-state.";
    if (t.includes("Porus and the elephant line")) ev.becomes = "Porus restored as a satrap-king \u2014 the mandala's logic applied by a Macedonian \u2014 and the elephant priced into every later army's budget.";
    if (t.includes("Revolt in the satrapies")) ev.becomes = "The power vacuum Chandragupta walks into; within a decade the northwest is Mauryan.";
    if (t.includes("Skandagupta dies")) ev.becomes = "The fiscal exhaustion visible in the debased late Gupta coinage; the empire's western provinces slip within a generation.";
    if (t.includes("Pallava\u2013Pandya wars begin")) ev.becomes = "Three centuries of contest that fund temple-building as competitive display \u2014 the southern architectural tradition is partly an arms race in stone.";
    if (t.includes("Pratihara\u2013Pala\u2013Rashtrakuta struggle")) ev.becomes = "Three exhausted empires and a power vacuum at Kannauj \u2014 the ground on which the Ghurid conquest will find no united answer.";
    if (t.includes("Parantaka I")) ev.becomes = "Chola consolidation of the Tamil plain and the endowment surge at Chidambaram \u2014 victory converted directly into temple gold.";
    if (t.includes("Chola\u2013Pandya wars open")) ev.becomes = "A two-century rivalry that keeps the far south militarised and makes Sri Lanka the recurring second front.";
    if (t.includes("Takkolam")) ev.becomes = "A generation's pause in Chola expansion, and the Rashtrakuta claim to be the arbiter of the whole peninsula at its zenith.";
    if (t.includes("conquest of Sri Lanka begins")) ev.becomes = "Chola Rajarata: Polonnaruwa as a provincial capital, Shiva temples on the island, and a Tamil military-mercantile presence that outlasts the occupation.";
    if (t.includes("Kerala and Pandya campaigns")) ev.becomes = "The western ports brought inside the Chola trade system \u2014 the pepper coast now ships under Chola protection.";
    if (t.includes("Sri Lanka campaign completed")) ev.becomes = "Direct rule from Polonnaruwa for fifty years; when Vijayabahu expels the Cholas, he keeps their capital and much of their administration.";
    if (t.includes("Ganges expedition")) ev.becomes = "A new capital named for the deed, Ganges water in its tank, and the northern campaign converted wholly into sacral legitimacy.";
    if (t.includes("Chola wars exhaust the Cheras")) ev.becomes = "The Chera Perumal state's collapse into chiefdoms \u2014 and out of the fragments, the port polities that will meet the Portuguese.";
    if (t.includes("First Tarain")) ev.becomes = "A won battle and an unchanged strategy; the reprieve lasts one year and enters legend as the high-water mark of Rajput cavalry.";
    if (t.includes("Tibet expedition destroyed")) ev.becomes = "The eastern frontier fixed at the hills for five centuries, and Bengal's conquerors turned south and east instead \u2014 toward the delta.";
    if (t.includes("Mongol invasions repelled")) ev.becomes = "The standing army and market controls built to pay for it \u2014 a fiscal-military state assembled against the steppe and then pointed at the Deccan.";
  }

  // sources — citations on every disputed event (phase 40; rule 5 finally
  // enforceable)
  if (ev.dispute && !ev.sources) {
    const hit = SOURCE_KEYS.find(k =>
      ev.id.includes(k) || ev.title.toLowerCase().includes(k.toLowerCase()));
    if (hit) ev.sources = SOURCES.sources[hit];
  }

  // grants — the engine hooks that used to be title regexes
  if (!ev.grants) {
    const t = ev.title.toLowerCase();
    if (/punch-marked coinage|money enters the game/.test(t)) ev.grants = 'coinage';
    else if (/paper displaces palm leaf/.test(t)) ev.grants = 'good:paper';
  }

  // teaches
  if (!ev.teaches) {
    const card = authoredFor(CARD_IDX, ev);
    if (card?.why) { ev.teaches = card.why; taught++; }
    else if (ev.note) { ev.teaches = ev.note; taught++; }
  } else taught++;
}
if (whereErrors.length) {
  console.error('  \u2717 unresolvable places:');
  for (const e of whereErrors) console.error('    ' + e);
  process.exit(1);
}
console.log(`  Payload    where: ${precise} precise, affects: ${affected}, teaches: ${taught}`);

/* ── Phase 36: the loom — threads become an entity ───────────────────────
 *
 * Seven of the fifteen threads had zero events; tags lived only where a
 * supplement writer remembered them. Tagging is now declarative: each thread
 * in data/timeline/threads.json may carry `auto` rules (classes, keywords
 * against title+evidence, an optional year range), applied here. Hand tags on
 * events always survive; the corpus thread additionally claims every event
 * with a `corpus` field, and the northwest gate keeps its hand-tagged set.
 * Beats are the tagged events in year order, and the census asserts no thread
 * is thin.
 */
const THREADS = JSON.parse(readFileSync(join(ROOT, 'data/timeline/threads.json'), 'utf8'));
for (const ev of events) {
  const tags = new Set(ev.threads ?? []);
  // Titles only: evidence lines mention coins, scripts and temples as dating
  // apparatus at half the sites in India, which is how the writing ladder
  // briefly acquired 344 beats.
  const hay = ev.title.toLowerCase();
  for (const th of THREADS.threads) {
    if (tags.has(th.id)) continue;
    const a = th.auto;
    if (th.id === 'THR.THE_CORPUS_AT_RISK') {
      if (ev.corpus) tags.add(th.id);
      continue;
    }
    if (!a) continue;
    if (a.years && (ev.year < a.years[0] || ev.year > a.years[1])) continue;
    const classHit = a.classes?.includes(ev.class) ?? false;
    const kwHit = a.keywords?.some(k => hay.includes(k)) ?? false;
    // A class rule alone is enough only when the thread is defined by the
    // class (frontier); otherwise a keyword must corroborate.
    if ((a.classes && !a.keywords && classHit) ||
        (a.keywords && kwHit && (!a.classes || classHit || !a.classes.length)) ||
        (a.classes && a.keywords && classHit && kwHit)) tags.add(th.id);
  }
  if (tags.size) ev.threads = [...tags].sort();
}
{
  const perThread = new Map(THREADS.threads.map(t => [t.id, 0]));
  for (const ev of events) for (const t of ev.threads ?? [])
    if (perThread.has(t)) perThread.set(t, perThread.get(t) + 1);
  const thin = [...perThread].filter(([, n]) => n < 8);
  if (thin.length) {
    console.error('  ✗ thin threads: ' + thin.map(([t, n]) => `${t}=${n}`).join(', '));
    process.exit(1);
  }
  const tagged = events.filter(e => (e.threads ?? []).length).length;
  console.log(`  Threads    ${tagged} events tagged across ${perThread.size} threads` +
    ` (smallest: ${Math.min(...perThread.values())})`);
}

/* ── Phase 40: chapters — the narrative unit between era and event ───────
 *
 * The doc has always named them (the "*Chapters: ...*" line under each era
 * heading); nothing ever read those lines. Each era's chapters are parsed
 * from its own line and its events are split into them by quantile, so every
 * chapter holds a comparable share of the era's happenings — narrative
 * grouping for the UI, no mechanical weight.
 */
const chapterDefs = [];
{
  const eraHeads = [...md.matchAll(/^#{2,3} Era (\d+)[^\n]*\n+\*Chapters: ([^*]+)\*/gm)];
  for (const m of eraHeads) {
    const era = ERAS.find(e => e.n === Number(m[1]));
    if (!era) continue;
    const names = m[2].split('·').map(x => x.trim()).filter(Boolean);
    const evs = events.filter(e => e.era === era.id).sort((a, b) => a.year - b.year);
    const per = Math.max(1, evs.length / names.length);
    names.forEach((name, i) => {
      const lo = evs[Math.floor(i * per)]?.year ?? era.from;
      const hi = i === names.length - 1 ? era.to
               : (evs[Math.floor((i + 1) * per)]?.year ?? era.to);
      const id = 'CHP.' + era.id.replace('ERA.', '') + '.' +
        name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      chapterDefs.push({ id, era: era.id, name, from: i === 0 ? era.from : lo, to: hi });
    });
    // Same-year event clusters produce zero-width quantiles; force each
    // chapter to start where the last one ended and to span at least a year,
    // with the era's last chapter always reaching the era boundary.
    const chs = chapterDefs.filter(c => c.era === era.id);
    for (let i = 0; i < chs.length; i++) {
      if (i > 0) chs[i].from = chs[i - 1].to;
      if (chs[i].to <= chs[i].from) chs[i].to = chs[i].from + 1;
      if (i === chs.length - 1) chs[i].to = era.to;
    }
  }
  // Assign each event its chapter.
  for (const ev of events) {
    const ch = chapterDefs.find(c => c.era === ev.era && ev.year >= c.from && ev.year < c.to)
            ?? chapterDefs.filter(c => c.era === ev.era).at(-1);
    if (ch) ev.chapter = ch.id;
  }
  console.log(`  Chapters   ${chapterDefs.length} across ${new Set(chapterDefs.map(c => c.era)).size} eras`);
}

const doc = {
  $schema: '../../packages/schema/timeline.schema.json',
  note: 'Generated from docs/07-timeline.md. The document is the source of truth; edit it, not this file. NOT yet historian-reviewed.',
  generated_by: 'tools/build-timeline.mjs',
  span: { from: -6000, to: 1947, years: 7947 },
  campaign_hours: 210,
  eras: ERAS.map(({ n, ...e }) => ({ ...e, number: n })),
  threads: THREADS.threads.map(t => ({ ...t })),
  chapters: chapterDefs,
  regions: Object.entries(REGIONS).map(([name, id]) => ({ id, name })),
  events,
};

const { errors, warnings, share, total } = validate(doc);

/* ── Census ─────────────────────────────────────────────────────────────── */

const by = (k) => events.reduce((m, e) => (m[e[k]] = (m[e[k]] ?? 0) + 1, m), {});
const mag = by('magnitude'), cls = by('class'), trig = by('trigger');
const sub = events.filter(e => e.scope === 'subcontinental').length;
const reg = events.length - sub;
const ancientEvents = events.filter(e => e.year < 1300).length;

doc.census = {
  total: events.length, subcontinental: sub, regional: reg,
  pre_1300: ancientEvents,
  by_magnitude: mag, by_class: cls, by_trigger: trig,
  disputed: events.filter(e => e.dispute).length,
};

console.log(`\n  Events total         ${events.length}`);
console.log(`    from the document  ${events.length - merged}`);
console.log(`    from supplements   ${merged}${collided ? `  (${collided} duplicate id(s) skipped)` : ''}`);
if (collapsed.length) {
  console.log(`    collapsed          ${collapsed.length} duplicate event(s) written twice`);
  for (const t of collapsed.slice(0, 12)) console.log(`      = ${t}`);
  if (collapsed.length > 12) console.log(`      = ... and ${collapsed.length - 12} more`);
}
if (superseded) {
  console.log(`    superseded         ${superseded} thin document line(s) replaced by a richer supplement entry`);
  for (const t of supersededTitles) console.log(`      ~ ${t}`);
}
console.log(`    subcontinental     ${sub}`);
console.log(`    regional spines    ${reg}`);
console.log(`    pre-1300           ${ancientEvents}  (${(ancientEvents/events.length*100).toFixed(1)}%)`);
console.log(`    disputed (‡)       ${doc.census.disputed}`);
console.log(`\n  Magnitude   ${Object.entries(mag).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join('  ')}`);
console.log(`  Trigger     ${Object.entries(trig).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join('  ')}`);
console.log(`  Class       ${Object.entries(cls).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join('  ')}`);
console.log(`\n  Cadence     ${total} h, pre-1300 share ${(share*100).toFixed(1)}%`);

if (reassigned.length) {
  console.log(`\n  Era reassigned by year (${reassigned.length}) — the doc files these under the wrong heading:`);
  for (const r of reassigned) console.log(`    ~ ${r}`);
}
if (warnings.length) {
  console.log(`\n  Density warnings (§5.2 rule 7):`);
  for (const w of warnings) console.log(`    ! ${w}`);
}
if (errors.length) {
  console.error(`\n  ✗ ${errors.length} validation error(s):`);
  for (const e of errors.slice(0, 30)) console.error(`    ${e}`);
  if (errors.length > 30) console.error(`    … and ${errors.length - 30} more`);
  process.exit(1);
}

mkdirSync(join(ROOT, 'data/timeline'), { recursive: true });
writeFileSync(OUT, JSON.stringify(doc, null, 1));
console.log(`\n  ✓ ${OUT.replace(ROOT + '/', '')}  (${(JSON.stringify(doc).length/1024).toFixed(0)} KB)\n`);
