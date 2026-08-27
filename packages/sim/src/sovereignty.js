/**
 * Sovereignty as a stack, not a colour (docs/04-eras.md, docs/12-buildplan-2.md §15).
 *
 * A single-colour political map is a lie about most of Indian history. Rule was
 * graded and overlapping: the family that holds a village, the power that takes
 * its revenue, the king it sends tribute to, and the paramount whose mandala it
 * sits inside are frequently four different parties, and the arrangement is
 * stable precisely because none of them is exclusive.
 *
 * So a region does not have an owner. It has four claims, each with its own
 * holder, and the map has four sheets to lay over it.
 */
import { record } from './state.js';

/** The four layers, innermost outward. */
export const LAYERS = ['holder', 'revenue', 'tributary', 'paramount'];

export const LAYER_INFO = {
  holder:    { label: 'Held by',     note: 'Who actually works and defends the ground.' },
  revenue:   { label: 'Taxed by',    note: 'Who takes a share of what it produces.' },
  tributary: { label: 'Tribute to',  note: 'Who is sent a gift, and how often.' },
  paramount: { label: 'Paramount',   note: 'Whose mandala it is understood to sit inside.' },
};

export function initSovereignty(state, datapack, fromYear) {
  state.claims = new Map();
  const eras = datapack.polities?.eras ?? [];
  const polities = datapack.polities?.polities ?? [];
  state.polities = new Map(polities.map(p => [p.id, p]));
  state.ruleRelations = datapack.polities?.rule ?? datapack.polities?.relations ?? [];

  for (const d of state.districts?.values() ?? []) {
    const home = d.region === state.homeRegion;
    state.claims.set(d.id, {
      district: d.id,
      region: d.region ?? null,
      // The home region is held from the start: a campaign begins as a small
      // power somewhere, not as a ghost. Everything beyond it is earned.
      holder: home ? 'you' : null,
      revenue: home ? 'you' : null,
      tributary: null, paramount: null,
      // Intensity of each claim, 0..1. A paramount with 0.2 is a courtesy.
      strength: { holder: home ? 0.7 : 0, revenue: home ? 0.5 : 0, tributary: 0, paramount: 0 },
    });
  }
}

/** Set one layer of one district's claim. */
export function claim(state, districtId, layer, holder, strength, year) {
  const c = state.claims.get(districtId);
  if (!c || !LAYERS.includes(layer)) return false;
  const was = c[layer];
  c[layer] = holder;
  c.strength[layer] = Math.max(0, Math.min(1, strength));
  if (was !== holder && holder)
    record(state, year, 'claim',
      `${state.districts.get(districtId)?.name ?? districtId}: ${LAYER_INFO[layer].label.toLowerCase()} ${holder}.`,
      { district: districtId, layer, holder });
  return true;
}

/**
 * The mandala: a gradient, not a border.
 *
 * Paramountcy falls off with distance from the centre, so a region can be
 * plainly inside one power's orbit, ambiguously inside two, and formally inside
 * none. That ambiguity is the normal state, not an edge case.
 */
export function mandalaAt(state, districtId, centre, reach) {
  const d = state.districts.get(districtId);
  if (!d || !centre) return 0;
  const dist = Math.hypot((d.lon - centre.lon) * 0.93, d.lat - centre.lat);
  return Math.max(0, 1 - Math.pow(dist / reach, 1.6));
}

/**
 * How much of a district's product a player actually receives.
 *
 * This is the number that makes the stack matter rather than decorate. Holding
 * the ground is worth little if somebody else takes the revenue, and paying
 * tribute is cheap compared to being conquered — which is why the arrangement
 * persisted.
 */
export function yieldTo(state, districtId, who) {
  const c = state.claims.get(districtId);
  if (!c) return 0;
  let share = 0;
  if (c.holder === who)    share += 0.35 * c.strength.holder;
  if (c.revenue === who)   share += 0.45 * c.strength.revenue;
  if (c.tributary === who) share += 0.12 * c.strength.tributary;
  if (c.paramount === who) share += 0.08 * c.strength.paramount;
  return share;
}

/** Everything one party holds, at any layer. */
export function holdingsOf(state, who) {
  const out = { holder: [], revenue: [], tributary: [], paramount: [] };
  for (const c of state.claims.values())
    for (const l of LAYERS) if (c[l] === who) out[l].push(c.district);
  return out;
}

/** Districts where more than one party has a claim — the interesting ones. */
export function contested(state) {
  const out = [];
  for (const c of state.claims.values()) {
    const parties = new Set(LAYERS.map(l => c[l]).filter(Boolean));
    if (parties.size > 1) out.push({ district: c.district, parties: [...parties] });
  }
  return out;
}

export const DECISIONS = {
  'claim'(state, d) { claim(state, d.district, d.layer, d.holder ?? 'you', d.strength ?? 0.6, d.year); },
  'tribute'(state, d) { claim(state, d.district, 'tributary', d.to, d.strength ?? 0.5, d.year); },
};
