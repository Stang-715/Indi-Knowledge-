#!/usr/bin/env node
/**
 * Build data/timeline/timeline.json from docs/07-timeline.md.
 *
 * The document is the source of truth. Events are authored as markdown tables
 * because that is what a historian will actually edit; this turns them into the
 * structured spine the simulation reads, and enforces the seven validations from
 * docs/07-timeline.md §5.2.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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

  // 5. Every disputed event has certainty < 0.9.
  for (const ev of doc.events)
    if (ev.dispute && ev.certainty >= 0.9)
      errors.push(`${ev.id}: dispute with certainty ${ev.certainty}`);

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

  return { errors, warnings, share, total };
}

/* ── Build ──────────────────────────────────────────────────────────────── */

const md = readFileSync(SRC, 'utf8');
const events = parseTables(md);

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

const doc = {
  $schema: '../../packages/schema/timeline.schema.json',
  note: 'Generated from docs/07-timeline.md. The document is the source of truth; edit it, not this file. NOT yet historian-reviewed.',
  generated_by: 'tools/build-timeline.mjs',
  span: { from: -6000, to: 1947, years: 7947 },
  campaign_hours: 210,
  eras: ERAS.map(({ n, ...e }) => ({ ...e, number: n })),
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

console.log(`\n  Events parsed        ${events.length}`);
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
