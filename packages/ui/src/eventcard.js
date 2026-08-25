/**
 * The event card (docs/07-timeline.md §8.3).
 *
 * Nine slots, three tiers. Tier 1 gets a bespoke plate and hand-written copy;
 * Tier 2 gets an atlas icon and two sentences; Tier 3 is the year page, composed
 * at runtime from whatever happened, which is what makes "an infographic for
 * every year" deliverable — it is a renderer, not 7,947 documents.
 *
 * **Evidence is the teaching mechanism**, and it is the slot that makes this
 * different from every other history game. Most games assert. This one shows its
 * working — and in a campaign that is 82% pre-literate, *how we know* is
 * routinely more interesting than *what happened*.
 *
 * **Dispute** is the other one. Several events here are actively contested and
 * some are politically live in India right now. The rule is fixed: the card
 * presents the argument and names who holds which position. It does not
 * adjudicate.
 */
import { spriteURL, spriteFor } from './sprites.js';

const MAG_LABEL = { W: 'world-altering', M: 'major', R: 'regional', m: 'minor' };

/** Evidence, by class. What kind of thing tells us this happened at all. */
const EVIDENCE_BY_CLASS = {
  SITE:        'Excavation: stratigraphy, pottery sequence and radiocarbon from the site itself.',
  WORK:        'The text, and the works that quote or answer it.',
  TRANSITION:  'Material remains — the object, its composition, and an absolute date where one exists.',
  CLIMATE:     'Speleothem records, lake cores, and settlement abandonment sequences.',
  CATASTROPHE: 'Destruction layers, and accounts written afterwards by people with a position.',
  INVASION:    'Inscriptions, coinage, and chronicles — usually the victor’s.',
  TRADE:       'Goods found far from where they were made, and the documents of the people who moved them.',
  FOUNDATION:  'Inscriptions, copper plates and land grants.',
  REFORM:      'Texts, and the institutions that outlived the argument.',
  STRUCTURE:   'The building, and the inscription on it.',
  AGRICULTURE: 'Archaeobotany: seeds, phytoliths and field systems.',
  FRONTIER:    'Faunal remains, settlement pattern, and the silence of the settled record.',
  EPOCH:       'A convention. Eras are drawn by historians, not lived by anyone.',
  COLONIAL:    'Company and government records, which are voluminous and interested.',
};

/** How certainty reads to a player. */
export function certaintyLabel(ev) {
  if (ev.dispute) return 'contested';
  if (ev.certainty >= 0.9) return 'firm';
  if (ev.certainty >= 0.7) return 'approximate';
  if (ev.certainty >= 0.5) return 'uncertain';
  return 'doubtful';
}

export function tierOf(ev, authored = null) {
  return authored ? 1 : ev.magnitude === 'W' ? 1 : 2;
}

/**
 * Index authored cards by title fragment.
 *
 * Matched on the title rather than the id because event ids are derived from
 * titles, so an editorial change in the timeline document would silently orphan
 * every card keyed by id.
 */
export function indexCards(cardsDoc) {
  return (cardsDoc?.cards ?? []).map(c => ({ ...c, re: c.match.toLowerCase() }));
}

/**
 * Find the authored card for an event, preferring the most specific key.
 *
 * The first version took the first match, which silently gave the "657 texts to
 * China" card to "Xuanzang visits Bhaskaravarman's court" as well — the key
 * "Xuanzang" matched three unrelated events. Longest key wins, so a specific key
 * always beats a general one and adding a general key can never hijack an event
 * that already has a specific one.
 */
export function authoredFor(index, ev) {
  const t = ev.title.toLowerCase();
  let best = null;
  for (const c of index)
    if (t.includes(c.re) && (!best || c.re.length > best.re.length)) best = c;
  return best;
}

/**
 * Build the card model for an event. Pure — no DOM.
 * Copy is generated from the event's own fields where it has not been authored,
 * which is what makes 789 cards shippable.
 */
export function cardModel(ev, { era, threads = [], people = [], authored = null } = {}) {
  const approx = ev.trigger === 'window' || ev.trigger === 'latent';
  // Authored copy overrides the generated text. This is the Tier 1 mechanism:
  // ~300 W-magnitude events get hand-written cards, the rest are composed.
  if (authored) ev = { ...ev, ...authored };
  return {
    id: ev.id,
    tier: tierOf(ev, authored),
    year: ev.year,
    yearEnd: ev.year_end,
    approx,
    era: era?.name ?? '',
    chapter: ev.chapterName ?? null,
    certainty: certaintyLabel(ev),
    magnitude: MAG_LABEL[ev.magnitude] ?? '',
    title: ev.title,
    icon: spriteFor({ sprite: iconFor(ev) }, ev.year),
    what: ev.what ?? whatHappened(ev),
    why: ev.why ?? whyItMatters(ev),
    effects: effectsOf(ev),
    evidence: ev.evidence ?? EVIDENCE_BY_CLASS[ev.class] ?? 'The record, such as it is.',
    dispute: ev.dispute ? (ev.dispute_text ?? disputeText(ev)) : null,
    becomes: ev.becomes && ev.becomes !== 'nothing' ? ev.becomes : null,
    threads,
    people,
    scope: ev.scope,
    region: ev.region,
  };
}

function iconFor(ev) {
  switch (ev.class) {
    case 'SITE':        return 'city';
    case 'STRUCTURE':   return 'rampart';
    case 'WORK':        return 'pillar';
    case 'TRADE':       return 'port';
    case 'CATASTROPHE': return 'megalith';
    case 'INVASION':    return 'rampart';
    case 'AGRICULTURE': return 'village';
    case 'CLIMATE':     return 'ashmound';
    case 'REFORM':      return 'stupa';
    case 'FOUNDATION':  return 'vihara';
    default:            return 'village';
  }
}

/** 40–70 words, generated. Authored copy overrides it. */
function whatHappened(ev) {
  const when = ev.year_end && ev.year_end !== ev.year
    ? `Over roughly ${Math.abs(ev.year_end - ev.year)} years, `
    : '';
  const where = ev.scope === 'regional' ? 'In this region, ' : '';
  const hedge = ev.dispute
    ? ' The evidence for this is argued over, and the card below sets out both sides.'
    : ev.certainty < 0.7
    ? ' The date is approximate; the event is not in doubt, its year is.'
    : '';
  return `${when}${where}${ev.title}.${hedge}`;
}

/** ≤ 25 words. */
function whyItMatters(ev) {
  switch (ev.class) {
    case 'CATASTROPHE': return 'What is not copied out beforehand is not recoverable afterwards.';
    case 'CLIMATE':     return 'A civilisation can be ended by weather, with nobody to blame.';
    case 'WORK':        return 'Everything written after this can build on it — if it survives.';
    case 'TRADE':       return 'A road is only as good as its worst stretch, and it runs through somebody else’s land.';
    case 'INVASION':    return 'Every incursion becomes something. What it becomes is the interesting part.';
    case 'TRANSITION':  return 'What a society can do sets the ceiling on what it can afford to remember.';
    case 'AGRICULTURE': return 'Everyone who is not farming has to be fed by somebody who is.';
    case 'FRONTIER':    return 'For most of this campaign the frontier is not a border, it is the treeline.';
    case 'STRUCTURE':   return 'Water held is people fed, and people fed is knowledge kept.';
    case 'EPOCH':       return 'The rules of the game change here.';
    default:            return 'It changed what was possible next.';
  }
}

function disputeText(ev) {
  return `Scholarship is divided on this. The date given here is one reading; ` +
         `others place it differently, and in some cases the event itself is argued over. ` +
         `Because the evidence does not settle it, this event may not occur in every campaign.`;
}

function effectsOf(ev) {
  const w = { W: 2, M: 1, R: 0.5, m: 0.25 }[ev.magnitude] ?? 0.5;
  const table = {
    WORK: { IT: 1, CLASSICISM: 1 }, SITE: { STRUCTURE: 1 },
    STRUCTURE: { STRUCTURE: 2 }, TRANSITION: { DESIGN: 1, IT: 1 },
    AGRICULTURE: { AGRICULTURE: 2 }, TRADE: { TRADE: 2, NETWORKING: 1 },
    REFORM: { CULTIVATION: 1, NETWORKING: 1 }, FOUNDATION: { STRUCTURE: 1, NETWORKING: 1 },
    FRONTIER: { NETWORKING: -1 }, INVASION: { TRADE: -2, STRUCTURE: -1 },
    CATASTROPHE: { IT: -2, CLASSICISM: -1 }, CLIMATE: { AGRICULTURE: -2, TRADE: -1 },
    COLONIAL: { TRADE: -2 },
  };
  return Object.entries(table[ev.class] ?? {})
    .map(([pillar, d]) => ({ pillar, delta: Math.round(d * w * 10) / 10 }));
}

/* ── Rendering ──────────────────────────────────────────────────────────── */

const fmtYear = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

export function renderCard(m) {
  const eff = m.effects.length
    ? `<div class="card-effects">${m.effects.map(e =>
        `<span class="eff ${e.delta < 0 ? 'eff--down' : 'eff--up'}">${e.pillar.toLowerCase()} ${
          e.delta > 0 ? '+' : ''}${e.delta}</span>`).join('')}</div>`
    : '';

  return `<article class="card card--t${m.tier}">
    <header class="ribbon">
      <span>${m.approx ? '~' : ''}${fmtYear(m.year)}${
        m.yearEnd && m.yearEnd !== m.year ? `–${fmtYear(m.yearEnd)}` : ''}</span>
      <span>${m.chapter ? `${m.chapter} · ` : ''}${m.era}</span>
      <span class="cert cert--${m.certainty}">${m.certainty}</span>
    </header>

    <div class="card-plate">
      <img alt="" src="${spriteURL(m.icon, 128)}">
    </div>

    <h3>${m.title}</h3>
    <p class="what">${m.what}</p>
    <p class="why">${m.why}</p>
    ${eff}
    ${m.becomes ? `<p class="becomes"><b>Becomes</b> ${m.becomes}</p>` : ''}

    <div class="evidence">
      <b>How we know</b>
      <p>${m.evidence}</p>
    </div>
    ${m.dispute ? `<div class="dispute"><b>Disputed</b><p>${m.dispute}</p></div>` : ''}
    ${m.people.length ? `<div class="card-people"><b>Named</b> ${
      m.people.map(p => p.name).join(' · ')}</div>` : ''}
    ${m.threads.length ? `<footer class="card-threads">${m.threads.map(t =>
      `<span class="thr" data-thread="${t.id}">${t.name}${
        t.prev ? ` <a class="thr-nav" data-goto="${t.prev.id}" title="${t.prev.title}">&larr; ${fmtYear(t.prev.year)}</a>` : ''}${
        t.next ? ` <a class="thr-nav" data-goto="${t.next.id}" title="${t.next.title}">${fmtYear(t.next.year)} &rarr;</a>` : ''}</span>`
      ).join('')}</footer>` : ''}
  </article>`;
}

/**
 * The loom (phase 36). Threads are an entity now: build one index of
 * beat-lists from the timeline, then resolve an event's tags into
 * { id, name, prev, next } for the card footer — the prior and next beat on
 * each arc the event belongs to.
 */
export function indexThreads(timeline) {
  const byId = new Map();
  for (const t of timeline.threads ?? []) byId.set(t.id, { ...t, beats: [] });
  for (const ev of timeline.events) {
    for (const tid of ev.threads ?? []) {
      const t = byId.get(tid);
      if (t) t.beats.push(ev);
    }
  }
  for (const t of byId.values()) t.beats.sort((a, b) => a.year - b.year);
  return byId;
}

export function threadsFor(idx, ev) {
  const out = [];
  for (const tid of ev.threads ?? []) {
    const t = idx.get(tid);
    if (!t) continue;
    const i = t.beats.findIndex(b => b.id === ev.id);
    const pick = (b) => b ? { id: b.id, title: b.title, year: b.year } : null;
    out.push({
      id: t.id, name: t.name,
      prev: i > 0 ? pick(t.beats[i - 1]) : null,
      next: i >= 0 && i < t.beats.length - 1 ? pick(t.beats[i + 1]) : null,
    });
  }
  return out;
}

/**
 * Tier 3: the year page.
 *
 * Nothing is pre-authored. The page composes whatever happened that year from
 * the event data plus the state deltas. A quiet year gets a quiet page, which is
 * honest — most years were quiet.
 */
export function renderYearPage(year, { events = [], log = [], era = null } = {}) {
  const cards = events.map(m => renderCard(m)).join('');
  const quiet = events.length === 0;
  const notes = log.slice(0, 8).map(l => `<li>${l.text}</li>`).join('');

  return `<section class="yearpage">
    <header class="yearpage-head">
      <h2>${fmtYear(year)}</h2>
      <span>${era?.name ?? ''}</span>
    </header>
    ${quiet
      ? `<p class="quiet">Nothing the record kept. The fields were worked, the
         reciters recited, and the year passed.</p>`
      : cards}
    ${notes ? `<ul class="yearpage-log">${notes}</ul>` : ''}
  </section>`;
}
