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

/** The literacy rate, 2..98: taught coverage of the composed corpus,
 *  its physical survival, and the CULTIVATION pillar. */
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
  const raw = 60 * coverage + 20 * survival + 0.2 * (state.pillars.CULTIVATION ?? 0);
  return Math.max(2, Math.min(98, raw));
}

export const DECISIONS = {
  /** recite {work, district?}: teach one work to the people. */
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
