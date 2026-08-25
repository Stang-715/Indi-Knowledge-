/**
 * World state.
 *
 * Never saved. It is always recomputed by replaying the decision log against the
 * datapack and seed (docs/10-buildplan.md Part A.3). Everything here is therefore
 * derived, and nothing here is authoritative.
 */

/** The eight pillars of development (docs/06-pillars-and-campaign.md §1). */
export const PILLARS = ['DESIGN','IT','STRUCTURE','CLASSICISM','NETWORKING','TRADE','CULTIVATION','AGRICULTURE'];

export function newState(opts = {}) {
  return {
    year: -6000,
    tick: 0,

    /** Pillars, 0..100. They start near nothing because the game starts at foraging. */
    pillars: Object.fromEntries(PILLARS.map(p => [p, opts.pillars?.[p] ?? 2])),

    /** The pre-coinage economy. Grain is the store of value for ~3,000 years. */
    grain: opts.grain ?? 400,
    underfed: 0,

    /**
     * Transient shocks.
     *
     * A drought reduces this year's yield; it does not permanently destroy a
     * society's knowledge of how to farm. Adding forty-three climate events
     * made that distinction load-bearing: as permanent pillar damage they took
     * AGRICULTURE from 55 to zero and the campaign became unsurvivable by
     * 1200. A famine is a shock, and shocks heal.
     */
    shocks: [],
    coin: 0,
    coinageKnown: false,

    /** People. Reciters and scribes are the knowledge infrastructure. */
    pops: { farmers: 1000, reciters: 4, scribes: 0, soldiers: 0, merchants: 0, teachers: 0 },

    /** Corpus: workId → carrier record. Set up by corpus.js. */
    corpus: new Map(),

    /** People: id → person. Set up by people.js. */
    people: new Map(),
    schools: new Map(),
    cohorts: [],
    endowments: [],
    homeRegion: opts.homeRegion ?? 'RGN.TAMILAKAM',

    /** Districts: id → what we know and how we know it. Set up by survey.js. */
    districts: new Map(),

    /** Sovereignty: districtId → four claims. Set up by sovereignty.js. */
    claims: new Map(),
    polities: new Map(),

    /** Frontier peoples. Set up by frontier.js. */
    frontier: new Map(),

    /** Trade: routeId → route. Set up by trade.js. */
    routes: new Map(),
    partners: new Map(),
    caravans: [],
    goods: new Set(['grain']),

    /** Standing with other regions, 0..100. The currency Share buys. */
    standing: new Map(),

    /** Narrative log for this campaign. */
    log: [],

    /** Counters the UI reads. */
    stats: { eventsFired: 0, worksLost: 0, worksCopied: 0, tradesCompleted: 0,
             caravansLost: 0, teachersSent: 0, chokesCleared: 0,
             endowments: 0, schoolsLost: 0, surveys: 0, surveysDisappointing: 0, blocked: 0, learnedFromFrontier: 0, displaced: 0 },
  };
}

/**
 * Apply a transient penalty to a pillar. It decays linearly over `years`.
 */
export function shock(state, pillar, amount, years) {
  if (!(pillar in state.pillars) || amount <= 0) return;
  state.shocks.push({ pillar, amount, years, age: 0 });
}

/** Age the shocks and drop the spent ones. */
export function tickShocks(state, span) {
  for (const s of state.shocks) s.age += span;
  state.shocks = state.shocks.filter(s => s.age < s.years);
}

/** A pillar as it is actually functioning right now, shocks included. */
export function effectivePillar(state, pillar) {
  let v = state.pillars[pillar] ?? 0;
  for (const s of state.shocks) {
    if (s.pillar !== pillar) continue;
    v -= s.amount * (1 - s.age / s.years);
  }
  return Math.max(0, v);
}

/**
 * Move a pillar, with diminishing returns toward its ceiling.
 *
 * A flat delta was fine when the timeline held two hundred events. At eleven
 * hundred every pillar but AGRICULTURE pegged at 100 before the year 1000, and
 * a pegged gauge is not a gauge: nothing the player did after that could move
 * it, so learning from a frontier people, endowing a school and sacking a city
 * all read the same. Writing the events revealed the arithmetic; the arithmetic
 * was always wrong.
 *
 * So a gain is scaled by the headroom left and a loss by how much there is to
 * lose. The tenth irrigation work teaches less than the first, 0 and 100 become
 * asymptotes rather than walls, and the range stays legible however many events
 * land in it.
 */
export function bumpPillar(state, pillar, delta) {
  if (!(pillar in state.pillars)) return;
  const v = state.pillars[pillar];
  const scaled = delta > 0 ? delta * (1 - v / 100) : delta * (v / 100);
  state.pillars[pillar] = Math.max(0, Math.min(100, v + scaled));
}

export function record(state, year, kind, text, extra = {}) {
  state.log.push({ year, kind, text, ...extra });
}

/**
 * Serialise the parts of state that must be identical across two runs of the
 * same campaign. Used by the determinism test — it deliberately excludes nothing,
 * because anything excluded is somewhere divergence can hide.
 */
export function fingerprint(state) {
  const sortedMap = (m, f) => [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(f);
  return JSON.stringify({
    year: state.year, tick: state.tick,
    pillars: state.pillars,
    grain: Math.round(state.grain), coin: Math.round(state.coin),
    coinageKnown: state.coinageKnown,
    pops: Object.fromEntries(Object.entries(state.pops).map(([k, v]) => [k, Math.round(v)])),
    corpus: sortedMap(state.corpus, ([id, c]) => [id, c.carriers.length, c.lost, c.lostYear ?? 0]),
    routes: sortedMap(state.routes, ([id, r]) => [id, r.open, Math.round(r.safety * 1000), Math.round(r.hold * 1000)]),
    standing: sortedMap(state.standing, ([id, v]) => [id, Math.round(v)]),
    goods: [...state.goods].sort(),
    shocks: state.shocks.length,
    people: sortedMap(state.people, ([id, p]) => [id, p.alive ? 1 : 0, p.patronised ? 1 : 0, Math.round(p.returned)]),
    schools: sortedMap(state.schools, ([id, s]) => [id, s.members?.length ?? 0, s.works?.length ?? 0]),
    districts: sortedMap(state.districts, ([id, d]) => [id, d.tier, d.surveyed ?? 0, d.truth ?? 0]),
    frontier: sortedMap(state.frontier, ([id, f]) => [id, f.present ? 1 : 0, f.taught.length, Math.round(f.displaced * 100)]),
    claims: sortedMap(state.claims, ([id, c]) => [id, c.holder ?? '', c.revenue ?? '', c.tributary ?? '', c.paramount ?? '']),
    stats: state.stats,
    logLength: state.log.length,
    logHash: state.log.reduce((h, l) => (h * 31 + l.text.length + l.year) | 0, 7),
  });
}
