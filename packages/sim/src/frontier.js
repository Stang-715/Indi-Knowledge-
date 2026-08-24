/**
 * The internal frontier (docs/12-buildplan-2.md §17).
 *
 * `THR.THE_INTERNAL_FRONTIER` runs from 4500 BCE to 1947. For most of the focus
 * period the frontier is not a border — it is the treeline. Forest and hill
 * peoples, shifting cultivation against settled agriculture, and a clearance
 * line that moves east with the iron axe.
 *
 * The modelling decision that matters: **these are not obstacles.** They are
 * polities with their own interests, their own knowledge, and their own reasons
 * to trade or refuse. The settled record calls them barbarians because the
 * settled record was written by the people clearing their forest.
 *
 * So a frontier people can be traded with, learned from, married into, ignored,
 * or displaced — and the game keeps score of which you did. Displacement is
 * available, because it happened; it is not free, and it is not quiet.
 */
import { record, bumpPillar } from './state.js';
import { drawFrom } from './rng.js';

/**
 * Frontier peoples. Named where the record names them, described by practice
 * where it does not. NOT reviewed — this is the part of the design most likely
 * to be done badly, and it needs a historian and a cultural reviewer.
 */
export const PEOPLES = [
  { id: 'FRT.VINDHYA',  name: 'The Vindhya forest bands', from: -6000, to: 1400,
    lon: 80.0, lat: 23.4, practice: 'foraging',
    knows: ['forest pharmacopoeia', 'seasonal fire management'],
    note: 'Foragers persisting alongside farmers for four thousand years, which is not a failure to develop.' },
  { id: 'FRT.BHIL',     name: 'The Bhil of the Aravalli hills', from: -2000, to: 1947,
    lon: 73.6, lat: 23.8, practice: 'mixed',
    knows: ['hill route knowledge', 'archery'] },
  { id: 'FRT.GOND',     name: 'The Gond of the central highlands', from: -1000, to: 1947,
    lon: 80.4, lat: 21.2, practice: 'shifting',
    knows: ['iron smelting', 'teak and sal management'],
    note: 'Later formed substantial kingdoms; the frontier is not a permanent condition.' },
  { id: 'FRT.KHASI',    name: 'The Khasi hill communities', from: -1000, to: 1947,
    lon: 91.7, lat: 25.5, practice: 'shifting',
    knows: ['living root bridges', 'megalithic memorial practice', 'matrilineal inheritance'] },
  { id: 'FRT.NAGA',     name: 'The Naga hill communities', from: -500, to: 1947,
    lon: 94.3, lat: 25.9, practice: 'terraced',
    knows: ['terraced wet-rice on steep ground', 'village republics'] },
  { id: 'FRT.IRULA',    name: 'The Irula of the Nilgiris', from: -1000, to: 1947,
    lon: 76.7, lat: 11.4, practice: 'foraging',
    knows: ['snake and venom knowledge', 'honey collection'] },
  { id: 'FRT.SANTHAL',  name: 'The Santhal of the eastern uplands', from: -500, to: 1947,
    lon: 86.9, lat: 24.2, practice: 'shifting',
    knows: ['oral epic cycles', 'hill agriculture'] },
  { id: 'FRT.TODA',     name: 'The Toda of the Nilgiri plateau', from: -500, to: 1947,
    lon: 76.6, lat: 11.4, practice: 'pastoral',
    knows: ['buffalo husbandry', 'a ritual dairy practice found nowhere else'] },
];

/** How a settled polity can stand toward a frontier people. */
/** How far the plough can push on its own before it needs a decision. */
export const PASSIVE_LIMIT = 0.5;

export const STANCE = {
  ignore:   { label: 'leave alone',  cost: 0,   standing:  0 },
  trade:    { label: 'trade',        cost: 40,  standing: +6 },
  learn:    { label: 'learn from',   cost: 90,  standing: +9 },
  clear:    { label: 'clear',        cost: 150, standing: -30 },
};

export function initFrontier(state, datapack, fromYear) {
  state.frontier = new Map();
  for (const p of PEOPLES) {
    state.frontier.set(p.id, {
      ...p, present: false,
      standing: 12, stance: 'ignore',
      taught: [],                 // what you learned from them
      displaced: 0,               // how much of their range you took
    });
  }
}

export function tickFrontier(state, span, rng) {
  const year = state.year;
  for (const f of state.frontier.values()) {
    const should = year >= f.from && year <= f.to && f.displaced < 1;
    if (should && !f.present) {
      f.present = true;
      record(state, year, 'frontier', `${f.name} are on the treeline.`, { people: f.id });
    } else if (!should && f.present) {
      f.present = false;
      if (f.displaced >= 1)
        record(state, year, 'frontier',
          `${f.name} are gone from their range. What they knew went with them.`,
          { people: f.id, displaced: true });
    }
    if (!f.present) continue;

    // The clearance line advances on its own once iron is common: a pressure
    // the player exerts by existing, not only by deciding.
    //
    // It stops at PASSIVE_LIMIT. Settled agriculture pressing on the treeline
    // is a fact of the period and belongs in the model; a people being finished
    // off is a claim the game should not make on the player's behalf while they
    // are looking the other way. Past that line it takes a decision.
    // Note the guard rather than a clamp on the total: written as
    // `Math.min(PASSIVE_LIMIT, ...)` this silently dragged DELIBERATE
    // displacement back down to the passive ceiling, so a player who chose to
    // clear four times saw no effect at all.
    if (state.goods.has('iron') && f.practice !== 'pastoral' && f.displaced < PASSIVE_LIMIT) {
      f.displaced = Math.min(PASSIVE_LIMIT,
        f.displaced + 0.00018 * span * (state.pillars.AGRICULTURE / 100));
    }

    // Standing does NOT decay. An earlier version drained it a little each tick,
    // which over seven thousand years meant every frontier people was at zero
    // regard for you by the medieval period without your having done anything.
    // Neglect is not hostility, and the model should not quietly say it is.
  }
}

/** Set a stance toward a frontier people. */
export function stance(state, peopleId, how, year) {
  const f = state.frontier.get(peopleId);
  const spec = STANCE[how];
  if (!f || !f.present || !spec) return false;
  if (state.grain < spec.cost) return false;
  state.grain -= spec.cost;
  f.stance = how;
  f.standing = Math.max(0, Math.min(100, f.standing + spec.standing));

  if (how === 'learn') {
    // Their knowledge enters your corpus. This is the part the historical
    // record mostly did not do, and the game should let the player notice that.
    const idx = f.taught.length;
    if (idx < f.knows.length) {
      f.taught.push(f.knows[idx]);
      bumpPillar(state, 'CULTIVATION', 3);
      bumpPillar(state, 'AGRICULTURE', 2);
      state.stats.learnedFromFrontier = (state.stats.learnedFromFrontier ?? 0) + 1;
      record(state, year, 'frontier',
        `${f.name} teach you ${f.knows[idx]}.`, { people: peopleId, learned: f.knows[idx] });
      return true;
    }
  }
  if (how === 'clear') {
    f.displaced = Math.min(1, f.displaced + 0.34);   // a decision can finish it
    state.stats.displaced = (state.stats.displaced ?? 0) + 1;
    bumpPillar(state, 'AGRICULTURE', 4);
    bumpPillar(state, 'NETWORKING', -3);
    record(state, year, 'frontier',
      `You take a third of the ${f.name.replace(/^The /, '')} range for the plough.`,
      { people: peopleId, cleared: true });
    return true;
  }
  if (how === 'trade') {
    bumpPillar(state, 'TRADE', 1.5);
    bumpPillar(state, 'NETWORKING', 1.5);
    record(state, year, 'frontier', `Trade opens with ${f.name}.`, { people: peopleId });
  }
  return true;
}

export function frontierPresent(state) {
  return [...state.frontier.values()].filter(f => f.present);
}

/** What you took, and what you were taught. The score the game keeps. */
export function frontierLedger(state) {
  const out = [];
  for (const f of state.frontier.values())
    if (f.taught.length || f.displaced > 0)
      out.push({ id: f.id, name: f.name, taught: f.taught.slice(),
                 displaced: Math.round(f.displaced * 100), gone: f.displaced >= 1 });
  return out;
}

export const DECISIONS = {
  'frontier'(state, d) { stance(state, d.people, d.how, d.year); },
};
