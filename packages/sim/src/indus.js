/**
 * The emptying — the Indus era's play loop (phase 38).
 *
 * The design's hardest promise: twenty hours whose antagonist is the climate
 * and which end with nobody to fight. The loop is triage, not defence.
 *
 *   2600–2300   growth — the cities fill, water is engineering, trade runs
 *   2300–1900   the drying — each settlement's water falls with the monsoon;
 *               the player provisions, digs, or resettles east, and chooses
 *               what the leavers carry
 *
 * The one outcome the tuning must forbid is victory. The cities empty
 * whatever the player does — the record says dispersal, not defeat, and a
 * playtester who reports "I saved Mohenjo-daro" has found a bug. What a good
 * player exits with is more carried forward: crops, techniques, and the
 * memory of towns, which the era reckoning reports without a score
 * (campaign.js's pattern).
 */
import { record, bumpPillar, effectivePillar } from './state.js';
import { drawFrom } from './rng.js';

/** The urban settlements the era is about. Water is a 0..1 head of security:
 *  reservoirs, wells and river reach, abstracted to one number per town. */
export const INDUS_TOWNS = [
  { id: 'mohenjo-daro', name: 'Mohenjo-daro', river: 'indus',   size: 5 },
  { id: 'harappa',      name: 'Harappa',      river: 'ravi',    size: 4 },
  { id: 'dholavira',    name: 'Dholavira',    river: 'rain',    size: 3 },
  { id: 'rakhigarhi',   name: 'Rakhigarhi',   river: 'ghaggar', size: 5 },
  { id: 'kalibangan',   name: 'Kalibangan',   river: 'ghaggar', size: 2 },
  { id: 'ganweriwala',  name: 'Ganweriwala',  river: 'ghaggar', size: 4 },
  { id: 'lothal',       name: 'Lothal',       river: 'coast',   size: 2 },
];

/** How hard the drying hits each water source, per century after -2300.
 *  The Ghaggar dies, the rivers wander, the rain-fed reservoirs hold longest
 *  — Dholavira's engineering bought it centuries, and the model honours that. */
// Nothing the player does slows THIS table — the water is the antagonist and
// it does not negotiate. Provisioning and wells change how people leave, not
// whether. Per century after -2300, before the deterministic weather wobble:
const DECLINE = { ghaggar: 0.30, ravi: 0.24, indus: 0.23, coast: 0.20, rain: 0.13 };

export function initIndus(state) {
  state.indus = new Map(INDUS_TOWNS.map(t => [t.id, {
    ...t, water: 1, people: t.size, standing: true, provisioned: 0, wells: 0,
  }]));
  state.indusCarried = { crops: 0, techniques: 0, memory: 0, resettled: 0 };
}

export function tickIndus(state, span, seed) {
  if (!state.indus || state.year < -2600 || state.year > -1900) return;
  for (const t of state.indus.values()) {
    if (!t.standing) continue;
    if (state.year >= -2300) {
      const centuries = span / 100;
      let loss = (DECLINE[t.river] ?? 0.2) * centuries;
      // A little deterministic weather on top, so no two towns die in step.
      loss *= 0.8 + drawFrom(state.seed ?? seed, 'indus', t.id, state.year) * 0.4;
      t.water = Math.max(0, t.water - loss);
      if (t.provisioned > 0) t.provisioned -= span;
    }
    // People leave once the water is short. Wells let them hold on a little
    // past the threshold; provisioning halves the rate of drift while the
    // grain lasts. Unmanaged leavers carry little — that is the whole case
    // for the resettle verb.
    if (t.water <= 0.25 && t.people > 0) {
      const rate = t.provisioned > 0 ? 0.25 : 0.5;
      const leaving = Math.min(t.people, Math.max(1, Math.round(t.people * rate)));
      t.people -= leaving;
      state.indusCarried.memory += leaving * 0.25;
      record(state, state.year, 'indus',
        `${t.name}: the wells run short and households drift east on their own.`,
        { town: t.id });
    }
    if (t.people <= 0 && t.standing) {
      t.standing = false;
      record(state, state.year, 'indus',
        `${t.name} stands empty. No fire, no enemy — the water simply stopped being worth the walk.`,
        { town: t.id });
    }
  }
}

/** The era's decisions. All of them are about what persists, none about winning. */
export const INDUS_DECISIONS = {
  /** Grain buys a town time — slower decline for a generation. */
  'provision-town'(state, d) {
    const t = state.indus?.get(d.town);
    if (!t || !t.standing || state.grain < 120) return;
    state.grain -= 120;
    t.provisioned = 30;
    record(state, d.year, 'decision', `Grain moves to ${t.name}; the town holds a while longer.`);
  },
  /** Wells buy water once — a bounded, honest delay. A threshold shift was
   *  the first implementation and it was an immunity exploit: enough wells
   *  held a town above the departure line for ever, and the era acquired the
   *  win state it must not have. Three wells per town, each worth about a
   *  generation of decline, and the third finds the same falling water table
   *  as the first. */
  'dig-wells'(state, d) {
    const t = state.indus?.get(d.town);
    if (!t || !t.standing || t.wells >= 3 || state.grain < 80) return;
    state.grain -= 80;
    t.wells += 1;
    t.water = Math.min(1, t.water + 0.06);
    bumpPillar(state, 'STRUCTURE', 0.5);
    record(state, d.year, 'decision', `New wells at ${t.name}. Deeper than the last ones.`);
  },
  /** The era's real verb: move people east ON PURPOSE, and choose what they
   *  carry. Managed resettlement preserves far more than drift. */
  'resettle-east'(state, d) {
    const t = state.indus?.get(d.town);
    if (!t || t.people <= 0 || state.grain < 100) return;
    state.grain -= 100;
    const moving = Math.min(t.people, 2);
    t.people -= moving;
    state.indusCarried.resettled += moving;
    state.indusCarried.crops      += moving * 0.8;   // seed grain travels with people
    state.indusCarried.techniques += moving * 0.6;   // so do the crafts
    state.indusCarried.memory     += moving * 1.0;
    bumpPillar(state, 'AGRICULTURE', 0.4);
    bumpPillar(state, 'NETWORKING', 0.3);
    record(state, d.year, 'decision',
      `${t.name}: a planned column moves east with seed, tools and the songs. ` +
      `The town is smaller and the future is larger.`);
  },
};

/**
 * The era reckoning, -1900. Deliberately no score (campaign.js's rule): it
 * reports what persisted, and it states the one thing that was never on
 * offer. If every town could be standing here, the tuning is broken — a test
 * enforces that they cannot be.
 */
export function indusReckoning(state) {
  if (!state.indus) return null;
  const towns = [...state.indus.values()];
  const standing = towns.filter(t => t.standing).length;
  const c = state.indusCarried;
  return {
    standing,
    emptied: towns.length - standing,
    carried: {
      resettled: Math.round(c.resettled),
      crops: Math.round(c.crops * 10) / 10,
      techniques: Math.round(c.techniques * 10) / 10,
      memory: Math.round(c.memory * 10) / 10,
    },
    lines: [
      `The cities are ${standing === 0 ? 'all' : towns.length - standing + ' of ' + towns.length} empty. Nobody sacked them.`,
      c.resettled > 0
        ? `${Math.round(c.resettled)} planned columns went east with seed, tools and the songs. The dispersal was survival, and you organised it.`
        : `The people drifted east on their own, carrying what they could remember. More was lost than needed to be.`,
      `What persists: the crops, the double harvest, the cart, the weights — and the memory of towns, which will wait sixteen centuries for the next ones.`,
    ],
  };
}
