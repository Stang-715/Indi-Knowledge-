/**
 * Teaching — the education layer, folded in from the atlas game.
 *
 * A recital is a decision: a reciter stands before the people of a district
 * and a work is spoken aloud. The work gains (or refreshes) a memory carrier,
 * the people remember it for a while, and CULTIVATION — schooling, the pillar
 * that grows minds rather than grain — creeps up. What is taught fades unless
 * re-taught; teachers (the reserved pops field, at last in use) slow the fade.
 *
 * Literacy is derived, never stored in a save: like everything else it is
 * f(datapack, seed, decision_log).
 */
import { record, bumpPillar, flow } from './state.js';

export const RECITE_COST = 20;
/** Taught knowledge holds full strength this many years, then fades. */
export const FRESH_YEARS = 30;
/** Fade floor: a work once taught is never wholly forgotten by the taught. */
export const FRESH_FLOOR = 0.35;

/** How fresh one work's teaching is, 0..1 (0 = never taught). */
export function freshness(state, workId) {
  const t = state.taughtWorks?.get(workId);
  if (t == null) return 0;
  const age = state.year - t;
  if (age <= FRESH_YEARS) return 1;
  return Math.max(FRESH_FLOOR, 1 - 0.01 * (age - FRESH_YEARS));
}

/** How fresh one education CARD's teaching is, 0..1 — same curve as a work,
 *  keyed by card id instead. Cards that were only studied (read, never
 *  recited) are not "taught" at all: freshness is 0 until a real recital. */
export function cardFreshness(state, cardId) {
  const t = state.taughtCards?.get(cardId);
  if (t == null) return 0;
  const age = state.year - t;
  if (age <= FRESH_YEARS) return 1;
  return Math.max(FRESH_FLOOR, 1 - 0.01 * (age - FRESH_YEARS));
}

/** Sequential unlock: a Gita chapter stays locked until the one before it
 *  has actually been recited (studying it is not enough). `order` is the
 *  card's 1-based position within its own kind — chapter number for Gita,
 *  meaningless (unused) for kinds with no sequence. `siblingId(order)` maps
 *  a position back to a card id within the same kind, so this stays generic
 *  rather than hard-coding the "EDU.GITA.NN" id shape here. */
export function isCardLocked(state, card, siblingId) {
  if (card.kind !== 'gita' || card.order <= 1) return false;
  const prev = siblingId(card.order - 1);
  return !state.taughtCards?.has(prev);
}

/** How much of the read coverage a people has picked up simply by paying
 *  attention — cards opened, works read. Caps once the reading habit is
 *  well established; it does not need to cover the whole corpus to count. */
const STUDY_CAP = 60;

/** The literacy rate, 2..98: taught coverage of the composed corpus (recite,
 *  the costly deliberate verb), its physical survival, ambient read coverage
 *  (study, the free quiet verb), and the CULTIVATION pillar. Two verbs, two
 *  terms — recital is stronger per-work but study is what keeps a people
 *  from going illiterate between recitals. */
export function literacy(state) {
  let composed = 0, extant = 0, taughtW = 0;
  for (const [id, c] of state.corpus) {
    if (!c.exists) continue;
    composed++;
    if (!c.lost) extant++;
    taughtW += freshness(state, id);
  }
  const coverage = composed ? taughtW / composed : 0;
  const survival = composed ? extant / composed : 1;
  const readCoverage = Math.min(1, (state.studied?.size ?? 0) / STUDY_CAP);
  const raw = 50 * coverage + 15 * survival + 15 * readCoverage
    + 0.18 * (state.pillars.CULTIVATION ?? 0);
  return Math.max(2, Math.min(98, raw));
}

export const DECISIONS = {
  /** recite {work, card?, district?}: teach one work to the people. `card`
   *  is optional and purely for the Library's own bookkeeping — several
   *  education cards can share one corpus work (all 18 Gita chapters are
   *  one work, WRK.GITA), so the card is tracked separately from the work
   *  it recites, letting the shelf show each chapter's own taught state
   *  and lock chapter N+1 until N has actually been recited. */
  recite(state, d, rng) {
    const c = state.corpus.get(d.work);
    if (!c || !c.exists || c.lost) return;
    if (state.pops.reciters < 1 || state.grain < RECITE_COST) return;
    state.grain -= RECITE_COST;
    flow(state, 'recitals', -RECITE_COST);

    // the recital itself is a living copy: refresh the home memory carrier
    const mem = c.carriers.find((k) => k.medium === 'memory' && k.place === 'home');
    if (mem) mem.health = 1;
    else c.carriers.push({ medium: 'memory', place: 'home', born: d.year, health: 1 });

    state.taughtWorks.set(d.work, d.year);
    if (d.card) {
      if (!state.taughtCards) state.taughtCards = new Map();
      state.taughtCards.set(d.card, d.year);
    }
    bumpPillar(state, 'CULTIVATION', 0.4);
    state.stats.recitals = (state.stats.recitals ?? 0) + 1;

    // now and then a listener takes up the calling and becomes a teacher
    if (rng.chance(0.25) && state.pops.farmers > 1) {
      state.pops.farmers -= 1;
      state.pops.teachers += 1;
      record(state, d.year, 'decision', 'A listener takes up teaching.');
    }
    record(state, d.year, 'decision', `A recital is held${d.district ? ` in ${d.district}` : ''}.`);
  },

  /** study {kind:'card'|'work', id}: reading is teaching, just gentler. Free,
   *  no gate, no district — an ambient national exposure, idempotent by id.
   *  Kept distinct from recite on purpose: this is what makes the click that
   *  opens a card matter to the population, without letting the player farm
   *  it — the set only ever grows, so opening the same thing twice is inert. */
  study(state, d) {
    if (!state.studied) state.studied = new Set();
    if (state.studied.has(d.id)) return;
    state.studied.add(d.id);
    state.stats.studied = (state.stats.studied ?? 0) + 1;
  },
};

/** Standing system: knowledge fades; teachers slow the fading. */
export function tickTeaching(state, span) {
  if (!state.taughtWorks) state.taughtWorks = new Map();

  // Each teacher spends the tick re-telling the oldest teachings: their
  // taught-year creeps forward, so the freshness curve fades more slowly
  // where teachers walk. Deterministic — no dice needed to hold a class.
  if (state.pops.teachers > 0 && state.taughtWorks.size) {
    let budget = state.pops.teachers * span * 0.5;
    const oldestFirst = [...state.taughtWorks.entries()].sort((a, b) => a[1] - b[1]);
    for (const [id, y] of oldestFirst) {
      if (budget <= 0) break;
      const add = Math.min(budget, state.year - y);
      if (add > 0) { state.taughtWorks.set(id, y + add); budget -= add; }
    }
  }

  state.literacy = literacy(state);
}
