/**
 * The engine.
 *
 *     world = f(datapack, seed, decision_log)
 *
 * That equation is this file. `run()` takes exactly those three things and
 * returns a world. It stores nothing, reads no files, and has no wall clock, so
 * the same three inputs give the same world on every machine, forever.
 */
import { Clock, START_YEAR, END_YEAR, formatYear } from './clock.js';
import { buildSchedule, eventsIn } from './events.js';
import { newState, record, bumpPillar, fingerprint, shock, tickShocks, effectivePillar } from './state.js';
import { Rng } from './rng.js';
import { initCorpus, tickCorpus, applyWorkEvent, catastrophe, preserve, copyOut, worksAtRisk } from './corpus.js';
import { initTrade, tickTrade, applyTradeEvent, DECISIONS as TRADE_DECISIONS } from './trade.js';
import { initPeople, tickPeople, oralCapacity, DECISIONS as PEOPLE_DECISIONS } from './people.js';
import { initSurvey, DECISIONS as SURVEY_DECISIONS } from './survey.js';
import { initSovereignty, DECISIONS as SOV_DECISIONS } from './sovereignty.js';
import { blocked } from './pillars.js';
import { compareDecisions } from './save.js';
import { initFrontier, tickFrontier, DECISIONS as FRONTIER_DECISIONS } from './frontier.js';

/** Pillar deltas by event class. Coarse, deliberately — tuning comes later. */
const CLASS_EFFECTS = {
  WORK:        { IT: 1, CLASSICISM: 1 },
  SITE:        { STRUCTURE: 1 },
  STRUCTURE:   { STRUCTURE: 2 },
  TRANSITION:  { DESIGN: 1, IT: 1 },
  AGRICULTURE: { AGRICULTURE: 2 },
  TRADE:       { TRADE: 2, NETWORKING: 1 },
  REFORM:      { CULTIVATION: 1, NETWORKING: 1 },
  FOUNDATION:  { STRUCTURE: 1, NETWORKING: 1 },
  FRONTIER:    { NETWORKING: -1 },
  INVASION:    { TRADE: -2, STRUCTURE: -1 },
  CATASTROPHE: { IT: -2, CLASSICISM: -1 },
  CLIMATE:     { AGRICULTURE: -2, TRADE: -1 },
  COLONIAL:    { TRADE: -2 },
  EPOCH:       {},
};

const MAG_WEIGHT = { W: 2.0, M: 1.0, R: 0.5, m: 0.25 };

/**
 * Run a campaign.
 *
 * @param {object}   datapack       { timeline, works }
 * @param {string}   seed
 * @param {Array}    decisionLog    [{ year, action, ...args }]
 * @param {object}   opts           { from, to, onYear }
 */
export function run(datapack, seed, decisionLog = [], opts = {}) {
  const from = opts.from ?? START_YEAR;
  const to = opts.to ?? END_YEAR;

  const state = newState(opts.initial);
  state.year = from;
  state.seed = seed;

  // Subsystems fork the seed ONCE, by name. That keeps them independent: adding
  // a trade roll cannot silently rewrite the corpus (see rng.js).
  const rng = {
    corpus: new Rng(seed).fork('corpus'),
    trade:  new Rng(seed).fork('trade'),
    people: new Rng(seed).fork('people'),
    world:  new Rng(seed).fork('world'),
  };

  const schedule = buildSchedule(datapack.timeline, seed);
  initCorpus(state, datapack, from);
  initTrade(state, datapack, from);
  initPeople(state, datapack, from);
  initSurvey(state, datapack, from);
  initSovereignty(state, datapack, from);
  initFrontier(state, datapack, from);

  // Decisions indexed by the year they are taken.
  const decisionsByYear = new Map();
  for (const d of decisionLog) {
    if (!decisionsByYear.has(d.year)) decisionsByYear.set(d.year, []);
    decisionsByYear.get(d.year).push(d);
  }
  // Canonical order within a year, so the decision log is a SET and not a
  // sequence. Otherwise sorting a save — which any serialiser will do — quietly
  // produces a different world from the one that was saved.
  for (const list of decisionsByYear.values()) list.sort(compareDecisions);

  const clock = new Clock({ from, to });
  const applied = new Set();

  while (!clock.done) {
    const [prev, next] = clock.advance();
    state.year = next;
    state.tick = clock.tick;
    const span = next - prev;

    // 1. Player decisions taken in this span, in log order.
    for (let y = prev; y < next; y++) {
      for (const d of decisionsByYear.get(y) ?? []) {
        applyDecision(state, d, datapack, rng);
        applied.add(d);
      }
    }

    // 2. Calendar events.
    for (const ev of eventsIn(schedule, prev, next)) {
      fireEvent(state, ev, datapack, rng);
    }

    // 3. Standing systems. These run every tick and are what actually kills the
    //    corpus — neglect destroys more works than every invasion combined.
    // People before the corpus: schools are what hold an oral work, so they have
    // to exist before the corpus asks how much it can remember.
    tickPeople(state, span, rng.people, datapack);
    tickCorpus(state, span, rng.corpus, datapack);
    tickTrade(state, span, rng.trade);
    tickFrontier(state, span, rng.world);
    tickShocks(state, span);
    tickEconomy(state, span);

    if (opts.onYear) opts.onYear(state, next, span);
  }

  // A decision taken in the campaign's final year still has to happen.
  //
  // The tick loop covers half-open spans, so a decision dated exactly `to` fell
  // through every one of them and silently did nothing — which in the client
  // meant that any decision the player took *now* was discarded, because the
  // client recomputes with `to` set to the current year. Decisions the player
  // just made are the ones they care about most.
  for (const d of decisionsByYear.get(state.year) ?? []) {
    if (applied.has(d)) continue;
    applyDecision(state, d, datapack, rng);
    applied.add(d);
  }

  state.fingerprint = fingerprint(state);
  return state;
}

/** How long a shock from each class takes to heal, in years. */
const SHOCK_YEARS = { CLIMATE: 60, CATASTROPHE: 90, INVASION: 40 };

function fireEvent(state, ev, datapack, rng) {
  state.stats.eventsFired++;
  const w = MAG_WEIGHT[ev.magnitude] ?? 0.5;
  const heals = SHOCK_YEARS[ev.class];
  for (const [pillar, delta] of Object.entries(CLASS_EFFECTS[ev.class] ?? {})) {
    // Gains are permanent; harm from weather, fire and war is a shock that
    // heals. A society that survives a drought still knows how to farm.
    if (heals && delta < 0) shock(state, pillar, -delta * w, heals);
    else bumpPillar(state, pillar, delta * w);
  }

  if (ev.class === 'WORK')       applyWorkEvent(state, ev, datapack);
  if (ev.class === 'TRADE')      applyTradeEvent(state, ev, datapack);
  // Not every catastrophe is a corpus catastrophe, and some are the opposite.
  // An earthquake in Kutch levels towns and touches no library; Xuanzang leaving
  // with six hundred and fifty-seven texts is filed here because it belongs to
  // the same thread — what happens to the corpus — and it is the reason a third
  // of the Sanskrit Buddhist canon can still be read. The `corpus` field says
  // which of the three an event is. A document event without one keeps the old
  // default, so the eleven catastrophes written before this field existed
  // behave exactly as they did.
  // The `corpus` field decides, not the class. Mahinda carrying the canon to
  // Sri Lanka is filed under TRADE and the Jain bhandaras under TRANSITION;
  // both are corpus rescues and both were inert while this keyed off the class.
  if (ev.corpus === 'preserve') preserve(state, ev, rng.corpus);
  else if (ev.corpus === 'destroy' ||
           (!ev.corpus && ev.class === 'CATASTROPHE' && ev.magnitude === 'W'))
    catastrophe(state, ev, rng.corpus);

  // Coinage: the moment the settlement problem stops being physical.
  if (!state.coinageKnown && ev.year >= -600 &&
      /coin|karshapana|bent-bar|punch-marked|money/i.test(ev.title)) {
    state.coinageKnown = true;
    state.coin = Math.floor(state.grain * 0.05);
    record(state, ev.year, 'epoch',
      'Money. Value stops being heavy, stops rotting, and stops taking a season to arrive.');
  }

  if (ev.magnitude === 'W' || ev.class === 'EPOCH')
    record(state, ev.year, ev.class.toLowerCase(), ev.title, { id: ev.id, mag: ev.magnitude });
}

/**
 * The economy tick.
 *
 * Everyone who is not farming has to be fed by someone who is. That is the whole
 * pre-coinage knowledge economy in one line, and it is the constraint the player
 * spends three thousand years working against.
 *
 * Farmers grow logistically toward a carrying capacity set by the AGRICULTURE
 * pillar — which is why AGRICULTURE is the oldest of the eight and why every
 * irrigation work in the timeline matters. Without that, patronage is a trap:
 * every reciter you take into keeping is one the land cannot feed.
 */
function tickEconomy(state, span) {
  const { reciters, scribes, soldiers, merchants } = state.pops;

  // Carrying capacity. Foraging supports very few; irrigation and double-cropping
  // support an order of magnitude more.
  const K = 1000 * (1 + effectivePillar(state, 'AGRICULTURE') / 10);
  const farmers = state.pops.farmers;

  const yieldPerFarmer = 0.035 * (0.55 + effectivePillar(state, 'AGRICULTURE') / 120);
  const produced = farmers * yieldPerFarmer * span;
  // Teachers abroad are not in this sum. They eat at the monastery that took
  // them in — the cost of sending one is the journey, and the maintainer you no
  // longer have at home.
  const consumed = (reciters * 3 + scribes * 3 + soldiers * 2.5 + merchants * 2) * span;
  state.grain += produced - consumed;

  // Logistic growth toward capacity, slowed when the granary is empty.
  const fed = state.grain > 0 ? 1 : 0.2;
  const r = 0.004 * fed;
  state.pops.farmers = Math.max(200, Math.min(4_000_000,
    farmers + farmers * r * (1 - farmers / K) * span));

  // Being merely short is not the same as starving, and it should not be
  // survivable indefinitely. A community running with no buffer stops replacing
  // the reciters it loses, so a lineage over-extended for two generations
  // quietly ends — which is a decision the player made, not a dice roll.
  const buffer = consumed * 3;
  if (state.grain >= 0 && state.grain < buffer && state.pops.reciters > 1) {
    state.underfed = (state.underfed ?? 0) + span;
    if (state.underfed > 40) {
      state.underfed = 0;
      state.pops.reciters -= 1;
      record(state, state.year, 'famine',
        'A reciter is not replaced. There was not enough put by.');
    }
  } else if (state.grain >= buffer) {
    state.underfed = 0;
  }

  // Refilling the seats left by teachers sent abroad. A generation, and only
  // out of surplus: a house living hand to mouth does not train a replacement.
  if ((state.vacancies ?? 0) > 0 && state.grain >= buffer) {
    state.vacancyAge = (state.vacancyAge ?? 0) + span;
    if (state.vacancyAge >= 25) {
      state.vacancyAge = 0;
      // A house backfills in parallel, not one seat at a time. Twenty-five
      // teachers sent in a generation still costs about a century to recover.
      const filled = Math.max(1, Math.ceil(state.vacancies / 3));
      state.vacancies -= filled;
      state.pops.scribes += filled;
      record(state, state.year, 'succession',
        `${filled} student${filled === 1 ? ' takes a seat' : 's take seats'} left empty ` +
        'by teachers who went abroad.');
    }
  }

  if (state.grain < 0) {
    // Starvation falls first on the people who do not grow food.
    const shortfall = -state.grain;
    state.grain = 0;
    const lose = Math.min(state.pops.reciters, Math.floor(shortfall / 200));
    if (lose > 0) {
      state.pops.reciters -= lose;
      record(state, state.year, 'famine',
        `Grain runs short. ${lose} reciter${lose > 1 ? 's' : ''} leave the work to farm.`);
    }
  }
  state.grain = Math.min(state.grain, 500000);
}

/** Apply one player decision. This is the only way the player touches the world. */
export function applyDecision(state, d, datapack, rng) {
  // A pillar that never stops anything is decoration. Refusals are silent in
  // the log — the interface disables the control and says why — but they are
  // enforced here, so a hand-written decision log cannot route around them.
  const gate = blocked(state, d.action);
  if (gate) { state.stats.blocked = (state.stats.blocked ?? 0) + 1; return; }

  switch (d.action) {
    case 'patronise':                    // grain to reciters
      if (state.grain >= 50) { state.grain -= 50; state.pops.reciters += 1;
        record(state, d.year, 'decision', `A reciter is taken into keeping.`); }
      return;

    case 'train-scribe':
      if (state.grain >= 80 && state.pillars.IT >= 8) {
        state.grain -= 80; state.pops.scribes += 1;
        record(state, d.year, 'decision', `A scribe is trained.`); }
      return;

    case 'copy':                         // add a carrier to one work
      copyOut(state, d.work, d.destination ?? 'home', d.year);
      return;

    case 'send-teacher':                 // the missionary vector
      copyOut(state, d.work, d.destination ?? 'abroad', d.year, { teacher: true });
      return;

    default:
      if (PEOPLE_DECISIONS[d.action]) return PEOPLE_DECISIONS[d.action](state, d, rng.people);
      if (SURVEY_DECISIONS[d.action]) return SURVEY_DECISIONS[d.action](state, d, rng.world);
      if (SOV_DECISIONS[d.action])    return SOV_DECISIONS[d.action](state, d, rng.world);
      if (FRONTIER_DECISIONS[d.action]) return FRONTIER_DECISIONS[d.action](state, d, rng.world);
      if (TRADE_DECISIONS[d.action])  return TRADE_DECISIONS[d.action](state, d, rng.trade);
      return;
  }
}

export { fingerprint, formatYear, worksAtRisk };
