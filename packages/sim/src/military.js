/**
 * Military — the level behind the soldiers pop.
 *
 * `raise-soldiers` already exists in trade.js: it moves people out of the
 * fields and into `state.pops.soldiers`, a number trade.js's own combat
 * resolvers have quietly used as raw strength for as long as the game has
 * had chokes and caravan raids. Nothing here replaces that resolver — this
 * gives the number it already uses a face: a level, real enough to actually
 * change those same fights, not just sit over a chibi's head.
 *
 * Level is not a second pool of people. It is soldiers, read through how
 * organized the state that trained them is — the STRUCTURE pillar, the same
 * one raise-soldiers is already gated behind. No new state, no new resource,
 * just the existing number made to matter visibly.
 */
import { record } from './state.js';

/** How much force the standing soldiers currently represent. Used directly
 *  by trade.js's route-defense and caravan-encounter resolvers in place of
 *  the raw headcount — a well-structured state's soldiers fight above their
 *  number, a foraging band's do not. */
export function armyLevel(state) {
  const structureBonus = 1 + (state.pillars.STRUCTURE ?? 0) / 100;
  return Math.round(state.pops.soldiers * structureBonus);
}

export const DECISIONS = {
  /** disband {n}: the reverse of raise-soldiers, which never existed until
   *  now. Soldiers stand down and return to the fields — a real decision,
   *  not decay: the level drops the moment it is taken, not on a timer. */
  disband(state, d) {
    const n = Math.min(state.pops.soldiers, Math.max(1, Math.round(d.n ?? 1)));
    if (n <= 0) return;
    state.pops.soldiers -= n;
    state.pops.farmers += n;
    record(state, d.year, 'decision', `${n} guard(s) stand down and return to the fields.`);
  },
};
