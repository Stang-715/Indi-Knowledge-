/**
 * Farming — a farm is a place, not a headcount.
 *
 * `pops.farmers` (engine.js) was always a national number: how many people
 * farm, nowhere in particular. That is honest for a headcount but wrong for
 * "build a farm" — a farm is somewhere. This gives the player one concrete,
 * placed thing to build: a district becomes a farm, the way it already
 * becomes surveyed (survey.js) or taught (teaching.js), and it is real
 * ground, not a second copy of the national economy.
 *
 * Scope follows the same rule sovereignty.js already uses for what a
 * campaign starts holding: `district.region === state.homeRegion`. The
 * player's chosen state (apps/client's state picker) becomes `homeRegion`
 * at world creation exactly the way it already does for the long campaign,
 * so this needs no second, sim-side copy of real-world state geometry —
 * the client's polygon-precise `districtsInState` stays a client-side aid
 * (for showing which districts read as "yours" on the map); the actual
 * gate here is the one field the sim already had.
 */
import { record, bumpPillar } from './state.js';
import { taughtJobs } from './teaching.js';

export const FARM_COST = { grain: 120 };
/** How many head one farm's own ground can support — a real ceiling, not a
 *  flat bonus: this is what makes the herd a place-shaped thing rather than
 *  another abstract multiplier. */
export const HERD_CAP = 40;

export function initFarming(state) {
  state.farms = new Map(); // districtId -> { builtYear, level, herd }
}

/** Has the player recited any Agriculture skill card, anywhere? A SOFT
 *  prerequisite: building without it still works (the sim starts at -6000,
 *  long before any card could exist, and this stays a continuous game, not
 *  a staged one — docs/06-pillars-and-campaign.md) — but the record differs,
 *  and it is what a future "farm level 2" will actually require. */
function hasAgricultureCard(state) {
  for (const id of state.taughtCards?.keys() ?? []) {
    if (id.startsWith('EDU.SKILL.AGRI')) return true;
  }
  return false;
}

export const DECISIONS = {
  /** build-farm {district}: a farm at one of the sim's own districts, gated
   *  to the player's home region — the same "yours from the start" rule
   *  sovereignty.js already applies to claims. */
  'build-farm'(state, d) {
    const district = state.districts?.get(d.district);
    if (!district) return;
    if (district.region !== state.homeRegion) return;
    if (state.farms.has(d.district)) return;
    if (state.grain < FARM_COST.grain) return;

    state.grain -= FARM_COST.grain;
    state.farms.set(d.district, { builtYear: d.year, level: 1, herd: 0 });

    // A visible reward at the place itself, the same shape challenges.js's
    // resolveChallenges already uses for "the right thing, the right place."
    district.estimate = Math.round((district.estimate ?? 0) * 1.04);
    bumpPillar(state, 'AGRICULTURE', 0.6);
    state.stats.farmsBuilt = (state.stats.farmsBuilt ?? 0) + 1;

    record(state, d.year, 'decision', hasAgricultureCard(state)
      ? `A farm is laid out at ${district.name}, worked the way the Krishi-Parashara teaches.`
      : `The first plough breaks the ground at ${district.name}.`);
  },
};

/** Standing system: a farm's herd grows toward HERD_CAP once Husbandry is
 *  taught (taughtJobs' 'herder' flag, teaching.js) — logistic, the same
 *  shape tickEconomy's own farmer growth already uses. A farm that never
 *  gets a herder stays at zero; nothing here culls a herd once grown, the
 *  same growth-not-loss rule the rest of this session's work follows. */
export function tickFarming(state, span) {
  if (!state.farms.size || !taughtJobs(state).has('herder')) return;
  const r = 0.05;
  for (const farm of state.farms.values()) {
    // A logistic curve alone never leaves zero (herd * r * (...) is zero at
    // herd=0); a small standing seed is what actually starts a herd once
    // herding is known, the way a farm cannot own zero cattle and call
    // itself a herd at all.
    const seed = farm.herd < 1 ? 0.6 * span : 0;
    farm.herd = Math.min(HERD_CAP, farm.herd + farm.herd * r * (1 - farm.herd / HERD_CAP) * span + seed);
  }
}

/** Every head of cattle the player's farms carry, summed — what actually
 *  backs the herder job's effect on carrying capacity in engine.js, in
 *  place of a flat bonus. */
export function totalHerd(state) {
  let n = 0;
  for (const farm of state.farms.values()) n += farm.herd;
  return n;
}
