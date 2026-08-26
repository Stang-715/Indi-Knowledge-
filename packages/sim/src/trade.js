/**
 * The trade network (docs/11-trade-network.md).
 *
 * A route is not a pipe. It is four independent numbers, and throughput is their
 * product — so a route is only as good as its worst one:
 *
 *     delivered = capacity × hold × safety × season
 *
 * Goods take days. Payment takes longer. Both are simulated.
 */
import { record, bumpPillar } from './state.js';
import { drawFrom } from './rng.js';

/** The five kinds of choke. One resolver, five skins (docs/11 §6). */
export const CHOKES = {
  pass:      { label: 'a pass held against you', clearable: true,  works: ['fight','pay','hire'] },
  toll:      { label: 'a toll that eats the margin', clearable: true, works: ['pay','treaty'] },
  raid:      { label: 'raiders on the road', clearable: false, works: ['escort','convoy'] },
  blockade:  { label: 'a fleet across the lane', clearable: true, works: ['fight','reroute'] },
  rot:       { label: 'the road itself is gone', clearable: false, works: ['reroute','wait'] },
};

/** Goods enter the game when history delivers them, not when a tech unlocks. */
export const GOODS_CALENDAR = [
  { year: -6000, id: 'grain' },      { year: -5850, id: 'shell' },
  { year: -5500, id: 'cotton' },     { year: -4850, id: 'lapis' },
  { year: -4200, id: 'copper' },     { year: -2850, id: 'bronze' },
  { year: -2800, id: 'carnelian' },  { year: -2000, id: 'millet' },
  { year: -1300, id: 'iron' },       { year: -600,  id: 'silk' },
  { year: -550,  id: 'coin' },       { year: -300,  id: 'pepper' },
  { year: 100,   id: 'steel' },      { year: 1350,  id: 'paper' },
  { year: 1500,  id: 'chilli' },     { year: 1510,  id: 'potato' },
  { year: 1520,  id: 'tomato' },     { year: 1530,  id: 'maize' },
  { year: 1540,  id: 'tobacco' },
];

/** Foreign partners unlock by reach, not by date (docs/11 §8). */
export const PARTNERS = [
  { id: 'badakhshan',  from: -4850, wants: 'grain',  sends: 'lapis',   knowledge: false },
  { id: 'magan',       from: -2750, wants: 'beads',  sends: 'copper',  knowledge: false },
  { id: 'dilmun',      from: -2410, wants: 'any',    sends: 'any',     knowledge: false },
  { id: 'mesopotamia', from: -2350, wants: 'carnelian', sends: 'silver', knowledge: false },
  { id: 'persia',      from: -518,  wants: 'cotton', sends: 'script',  knowledge: true  },
  { id: 'rome',        from: 50,    wants: 'pepper', sends: 'gold',    knowledge: false },
  { id: 'china',       from: 110,   wants: 'cotton', sends: 'silk',    knowledge: true  },
  { id: 'baghdad',     from: 771,   wants: 'numerals', sends: 'paper', knowledge: true  },
  { id: 'srivijaya',   from: 1025,  wants: 'cloth',  sends: 'camphor', knowledge: false },
  { id: 'portugal',    from: 1498,  wants: 'pepper', sends: 'newworld', knowledge: false },
];

export function initTrade(state, datapack, fromYear) {
  for (const g of GOODS_CALENDAR) if (g.year <= fromYear) state.goods.add(g.id);
  for (const p of PARTNERS) if (p.from <= fromYear) openPartner(state, p, fromYear);
}

function openPartner(state, p, year) {
  if (state.partners.has(p.id)) return;
  state.partners.set(p.id, { ...p, standing: 10, volume: 0 });
  state.standing.set(p.id, 10);
}

/**
 * Create a route. Capacity/hold/safety/communication are the four numbers;
 * `days` is transit time, which in the full game comes from the terrain field.
 */
export function addRoute(state, { id, from, to, days, capacity = 10, mode = 'land' }) {
  state.routes.set(id, {
    id, from, to, days, mode,
    capacity,
    hold: 0.50,             // how much of it you actually control
    safety: 0.65,           // how likely a caravan survives
    communication: 0.3,     // how fast you learn what happened on it
    open: true,
    choke: null,
    trust: 1,               // the trust ladder rung (docs/11 §2)
    delivered: 0,
  });
  return state.routes.get(id);
}

/** Throughput. A product, not a sum — the worst number caps the route. */
export function throughput(route, year) {
  if (!route.open) return 0;
  const season = seasonFactor(route, year);
  return route.capacity * route.hold * route.safety * season;
}

/**
 * The monsoon that waters the Deccan is the same monsoon that carries the ships.
 * Sea routes are fast with the wind and shut against it.
 */
function seasonFactor(route, year) {
  if (route.mode !== 'sea') return 0.9;
  return 0.75;
}

/**
 * Standing orders (phase 45, implementing the phase-34 ruling in full):
 * policy per route, set once, obeyed for a century without a click. Escort
 * level is a standing cost and a safety floor; the choke policy is what the
 * road does when trouble arrives and nobody is watching. The watched caravan
 * is the exception that proves it — a one-off `resolve-encounter` decision
 * overrides the standing policy for that meeting only.
 */
export const ESCORT_LEVELS = {
  none:  { costPerYear: 0,   safetyFloor: 0    },
  light: { costPerYear: 2,   safetyFloor: 0.45 },
  heavy: { costPerYear: 6,   safetyFloor: 0.75 },
};

export function ordersOf(r) {
  return r.orders ?? { escort: 'none', chokePolicy: 'wait' };
}

/**
 * One resolver for every meeting between a caravan and trouble — the scene in
 * the client is a skin over this, never a second implementation. Deterministic:
 * the draw is keyed by route, year and caravan ordinal.
 */
export function resolveEncounter(state, r, c, method, year, rng) {
  const kind = r.choke?.kind ?? 'raid';
  const u = drawFrom(state.seed ?? 'x', 'encounter', r.id, year, c.ordinal ?? 0);
  const out = { method, kind };
  switch (method) {
    case 'fight': {
      const strength = Math.min(0.9, 0.25 + state.pops.soldiers / 40
        + (ordersOf(r).escort === 'heavy' ? 0.2 : ordersOf(r).escort === 'light' ? 0.1 : 0));
      if (u < strength) { out.result = 'won'; r.safety = Math.min(0.95, r.safety + 0.1); }
      else { out.result = 'lost'; c.value *= 0.4; c.progress = Math.max(0, c.progress - c.days * 0.2); }
      break;
    }
    case 'pay':
      out.result = 'paid'; c.value *= (kind === 'toll' ? 0.85 : 0.7);
      break;
    case 'reroute':
      out.result = 'rerouted'; c.days = Math.round(c.days * 1.4);
      break;
    default:
      out.result = 'waited'; c.progress = Math.max(0, c.progress - c.days * 0.35); c.value *= 0.9;
  }
  record(state, year, 'encounter',
    `${r.id}: a caravan meets ${CHOKES[kind].label} — ${out.result}.`,
    { route: r.id, kind, method, result: out.result });
  return out;
}

export function tickTrade(state, span, rng) {
  const year = state.year;

  // Goods arrive because a ship arrived.
  for (const g of GOODS_CALENDAR) {
    if (g.year <= year && !state.goods.has(g.id)) {
      state.goods.add(g.id);
      record(state, year, 'goods', `${g.id} enters the market.`, { good: g.id });
      if (g.id === 'paper') {
        bumpPillar(state, 'IT', 6);
        record(state, year, 'epoch', 'Paper displaces palm leaf. Recopying costs collapse.');
      }
    }
  }
  for (const p of PARTNERS) if (p.from <= year) openPartner(state, p, year);

  // Standing escorts cost grain whether or not a caravan is moving — a
  // guard you only pay when attacked is not a guard.
  for (const r of state.routes.values()) {
    const lvl = ESCORT_LEVELS[ordersOf(r).escort] ?? ESCORT_LEVELS.none;
    if (lvl.costPerYear) state.grain = Math.max(0, state.grain - lvl.costPerYear * span);
  }

  // Missions march. Clearing a choke takes as long as reaching it.
  if (state.missions?.length) {
    for (const m of state.missions) {
      m.elapsed += span * 365;
      if (m.elapsed < m.days || m.done) continue;
      m.done = true;
      const r = state.routes.get(m.route);
      if (!r || !r.choke) {
        record(state, year, 'mission', `${m.route}: the expedition finds the road already open.`, { route: m.route });
        continue;
      }
      const spec = CHOKES[r.choke.kind];
      const works = spec.works.includes(m.method);
      const u = drawFrom(state.seed ?? 'x', 'mission', m.route, m.started);
      const strength = m.method === 'fight' ? Math.min(0.9, state.pops.soldiers / 30) : 0.7;
      if (works && (m.method !== 'fight' || u < strength)) {
        r.choke = null; r.open = true;
        r.safety = Math.min(0.95, r.safety + 0.3);
        state.stats.chokesCleared++;
        record(state, year, 'mission', `${m.route} is open again — the expedition returns.`, { route: m.route, result: 'cleared' });
      } else {
        record(state, year, 'mission', `The expedition on ${m.route} fails and limps home.`, { route: m.route, result: 'failed' });
      }
    }
    state.missions = state.missions.filter(m => !m.done);
  }

  // Caravans move. Transit takes days; settlement is a second journey.
  for (const c of state.caravans) {
    if (c.state === 'outbound') {
      const wasBefore = c.progress;
      c.progress += span * 365;
      // A caravan that crosses a choked road has a meeting. Resolved by the
      // route's standing policy unless a watched-caravan decision already
      // resolved this exact meeting (the client records it as a decision, so
      // the replay is identical with or without the scene).
      const r = state.caravans && state.routes.get(c.route);
      if (r?.choke && !c.met && wasBefore > 0) {
        c.met = true;
        const override = state.encounterOverrides?.get(`${c.route}:${c.ordinal ?? 0}`);
        resolveEncounter(state, r, c, override ?? ordersOf(r).chokePolicy, year, rng);
      }
      if (c.progress >= c.days) { c.state = 'settling'; c.progress = 0; }
    } else if (c.state === 'settling') {
      c.progress += span * 365;
      // Coin settles fast because value stops being heavy. Barter does not.
      const settleDays = state.coinageKnown ? c.days * 0.25 : c.days * 1.1;
      if (c.progress >= settleDays) {
        c.state = 'done';
        state.grain += c.value * (state.coinageKnown ? 0.4 : 1);
        if (state.coinageKnown) state.coin += c.value * 0.6;
        state.stats.tradesCompleted++;
      }
    }
  }
  state.caravans = state.caravans.filter(c => c.state !== 'done');

  // Routes drift. Unattended hold decays; safety follows soldiers.
  for (const r of state.routes.values()) {
    // Hold decays because a road nobody walks stops being yours — but at the
    // old rate a route was worthless within a century of opening, which made
    // garrisoning a tax rather than a choice.
    r.hold = Math.max(0.08, r.hold - 0.0012 * span);
    const cover = state.pops.soldiers > 0 ? Math.min(0.4, state.pops.soldiers / 60) : 0;
    r.safety = Math.max(0.1, Math.min(0.95, r.safety * 0.998 + cover * 0.02 * span));
    const floor = (ESCORT_LEVELS[ordersOf(r).escort] ?? ESCORT_LEVELS.none).safetyFloor;
    if (floor) r.safety = Math.max(r.safety, floor);

    // A choke appears. Rarely, and one of the five kinds.
    //
    // Rate matters more than it looks: at one chance in 250 a year, a route
    // opened in 850 is choked several times before the Cholas fall, and in
    // practice the player never gets a caravan out at all. Once a century is
    // enough to make the road feel contested without making it useless.
    if (!r.choke && rng.chance(0.0011 * span)) {
      const kinds = Object.keys(CHOKES);
      const kind = kinds[rng.next() % kinds.length];
      r.choke = { kind, since: year };
      r.open = kind !== 'rot' && kind !== 'blockade';
      r.safety *= 0.5;
      record(state, year, 'choke',
        `${r.id}: ${CHOKES[kind].label}.`, { route: r.id, kind });
    }
    // A standing 'pay' policy keeps toll-type chokes from ever closing the
    // road: the fee is simply part of the route's cost now, skimmed from
    // deliveries below. A standing 'fight' policy launches a mission the
    // season the choke appears, without waiting for the player to notice.
    if (r.choke && r.orders) {
      if (r.orders.chokePolicy === 'pay' && (r.choke.kind === 'toll' || r.choke.kind === 'pass')) {
        r.open = true; r.tolled = true;
      } else if (r.orders.chokePolicy === 'fight' && CHOKES[r.choke.kind].works.includes('fight')
                 && !state.missions?.some(m => m.route === r.id)) {
        (state.missions ??= []).push({ route: r.id, method: 'fight',
          started: year, days: r.days * 2, elapsed: 0 });
        record(state, year, 'mission',
          `${r.id}: the standing order raises an expedition without being asked.`, { route: r.id });
      }
    } else if (!r.choke) r.tolled = false;

    // The rot is not cleared, it is outlived: a river finds a new channel, a
    // flood recedes. The other four kinds wait for the player.
    if (r.choke && r.choke.kind === 'rot' && year - r.choke.since > 25) {
      r.choke = null; r.open = true;
      record(state, year, 'choke', `${r.id}: the water has found a new way through.`,
        { route: r.id });
    }

    if (r.open) {
      const t = throughput(r, year) * (r.tolled ? 0.75 : 1);
      r.delivered += t * span;
      state.grain += t * span * 0.4;
      bumpPillar(state, 'TRADE', 0.02 * span);
    }
  }
}

export function applyTradeEvent(state, ev, datapack) {
  bumpPillar(state, 'TRADE', 1);
  // Hippalus: a timeline event that rewrites a physics constant.
  if (/hippalus|monsoon route/i.test(ev.title)) {
    for (const r of state.routes.values()) if (r.mode === 'sea') r.days *= 0.5;
    record(state, ev.year, 'epoch', 'The open-sea crossing time halves.');
  }
}

/** Player decisions that touch trade. */
export const DECISIONS = {
  'open-route'(state, d) {
    if (state.routes.has(d.id)) return;
    addRoute(state, d);
    record(state, d.year, 'decision', `Route opened: ${d.from} → ${d.to}.`);
  },
  'raise-soldiers'(state, d) {
    const n = d.count ?? 5;
    const cost = n * 20;
    if (state.grain < cost) return;
    state.grain -= cost;
    state.pops.soldiers += n;
    record(state, d.year, 'decision', `${n} raised to guard the roads.`);
  },
  'escort'(state, d) {
    const r = state.routes.get(d.route);
    if (!r) return;
    r.safety = Math.min(0.95, r.safety + 0.2);
    record(state, d.year, 'decision', `Escort assigned to ${r.id}.`);
  },
  'garrison'(state, d) {
    const r = state.routes.get(d.route);
    if (!r || state.pops.soldiers < 5) return;
    r.hold = Math.min(0.95, r.hold + 0.25);
    record(state, d.year, 'decision', `${r.id} garrisoned.`);
  },
  'clear-choke'(state, d, rng) {
    const r = state.routes.get(d.route);
    if (!r || !r.choke) return;
    const spec = CHOKES[r.choke.kind];
    const method = d.method ?? 'fight';
    const works = spec.works.includes(method);
    const strength = method === 'fight' ? state.pops.soldiers / 30 : 0.7;
    if (works && (method !== 'fight' || rng.float() < Math.min(0.9, strength))) {
      r.choke = null; r.open = true;
      r.safety = Math.min(0.95, r.safety + 0.3);
      state.stats.chokesCleared++;
      record(state, d.year, 'decision', `${r.id} is open again.`, { route: r.id });
    } else {
      record(state, d.year, 'decision', `The attempt on ${r.id} fails.`, { route: r.id });
    }
  },
  'send-caravan'(state, d) {
    const r = state.routes.get(d.route);
    if (!r || !r.open) return;
    const value = Math.min(state.grain * 0.2, throughput(r, state.year) * 8);
    if (value < 1) return;
    state.grain -= value * 0.3;
    const ordinal = (state.stats.caravansSent = (state.stats.caravansSent ?? 0) + 1);
    state.caravans.push({ route: r.id, days: r.days, progress: 0, state: 'outbound', value, ordinal });
    record(state, d.year, 'decision', `A caravan leaves on ${r.id}.`, { route: r.id, ordinal });
  },
  'set-orders'(state, d) {
    const r = state.routes.get(d.route);
    if (!r) return;
    if (!(d.escort in ESCORT_LEVELS)) return;
    r.orders = { escort: d.escort, chokePolicy: d.chokePolicy ?? 'wait' };
    record(state, d.year, 'decision',
      `${r.id}: standing orders — ${d.escort} escort, ${r.orders.chokePolicy} at trouble.`, { route: r.id });
  },
  'start-mission'(state, d) {
    const r = state.routes.get(d.route);
    if (!r || !r.choke || state.grain < 60) return;
    if (state.missions?.some(m => m.route === r.id)) return;
    state.grain -= 60;
    (state.missions ??= []).push({ route: r.id, method: d.method ?? 'fight',
      started: d.year, days: r.days * 2, elapsed: 0 });
    record(state, d.year, 'mission',
      `An expedition marches for ${r.id}: ${r.days * 2} days out and the same back.`, { route: r.id });
  },
  'resolve-encounter'(state, d) {
    // The watched caravan's one-off choice: recorded before the meeting is
    // ticked, so the replay resolves the same meeting the same way.
    (state.encounterOverrides ??= new Map()).set(`${d.route}:${d.ordinal}`, d.method);
    record(state, d.year, 'decision',
      `${d.route}: the watched caravan is ordered to ${d.method}.`, { route: d.route });
  },
  'share'(state, d) {
    // Share costs the good and returns standing. Not charity — it buys the trust
    // that Export later requires.
    //
    // The phase-34 ruling: standing has diminishing returns per partner per
    // generation. Without this the trust ladder is a farming exercise — surplus
    // grain converts to friendship at a flat rate, and a rich player buys a
    // guild charter by 900 BCE. Each further gift to the same partner within a
    // generation buys less, on the same squared-headroom curve as the pillars;
    // a generation later (30 years) the partner's appetite resets, which is
    // itself historical — trust is re-earned with people, not banked against a
    // house.
    if (state.grain < 30) return;
    state.grain -= 30;
    const key = d.with;
    const gen = Math.floor(d.year / 30);
    if (!state.shareGen) state.shareGen = new Map();
    const g = state.shareGen.get(key);
    const given = (g && g.gen === gen) ? g.count : 0;
    state.shareGen.set(key, { gen, count: given + 1 });
    const h = 1 / (1 + given);                    // 1, 1/2, 1/3 ...
    const cur = state.standing.get(key) ?? 0;
    state.standing.set(key, Math.min(100, cur + 8 * h * h));
    bumpPillar(state, 'NETWORKING', 1 * h);
    record(state, d.year, 'decision', `A gift is sent to ${key}.`);
  },
};
