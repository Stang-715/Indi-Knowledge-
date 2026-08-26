/**
 * Occupations (phase 39) — the entity 07-timeline §1.4 promised and phases
 * 23–33 never built. An occupation is a STATE, not an event: foreign or
 * imperial rule with a duration, an extractive intensity, and a patronage
 * rate. It is weather, not a bang — the event that begins it fires once and
 * carries `becomes`; the occupation is what `becomes` feels like for three
 * hundred years.
 *
 * Mechanics, deliberately small and legible:
 *   extract    grain per year skimmed while active (the assessment)
 *   patronage  pillar drip per year (what the court funds)
 *   trustCap   optional ceiling on the trust ladder while active — a rung
 *              like a state treaty needs a state that treats you as party
 */
import { record, bumpPillar, flow } from './state.js';
import { claim } from './sovereignty.js';

export function initOccupations(state, datapack) {
  state.occupationsActive = new Set();
  state.occupationLog = [];
}

export function tickOccupations(state, datapack, span) {
  const occ = datapack.occupations;
  if (!occ) return;
  for (const o of occ.occupations) {
    const active = state.year >= o.from && state.year < o.to;
    const was = state.occupationsActive.has(o.id);
    if (active && !was) {
      state.occupationsActive.add(o.id);
      record(state, state.year, 'occupation',
        `${o.name}. ${o.note}`, { id: o.id, phase: 'begins' });
      // An occupation is a paramount claim over its where — or over everything
      // it can reach, when it names no regions. This is what puts history on
      // the mandala map-mode without a single player decision.
      for (const c of state.claims?.values() ?? []) {
        const inScope = !o.where?.length || o.where.includes(c.region);
        if (inScope) claim(state, c.district, 'paramount', o.id, 0.6, state.year);
      }
    } else if (!active && was) {
      state.occupationsActive.delete(o.id);
      record(state, state.year, 'occupation',
        `${o.name} ends.`, { id: o.id, phase: 'ends' });
      for (const c of state.claims?.values() ?? [])
        if (c.paramount === o.id) claim(state, c.district, 'paramount', null, 0, state.year);
    }
    if (!active) continue;
    if (o.extract) {
      const taken = Math.min(state.grain, o.extract * span);
      state.grain -= taken;
      flow(state, 'occupation', -taken);
    }
    for (const [pillar, perYear] of Object.entries(o.patronage ?? {}))
      bumpPillar(state, pillar, perYear * span);
  }
}

/** The lowest trustCap among active occupations, or null. */
export function trustCeiling(state, datapack) {
  const occ = datapack.occupations;
  if (!occ || !state.occupationsActive?.size) return null;
  let cap = null;
  for (const o of occ.occupations)
    if (state.occupationsActive.has(o.id) && o.trustCap != null)
      cap = cap === null ? o.trustCap : Math.min(cap, o.trustCap);
  return cap;
}
