/**
 * Event firing.
 *
 * Certainty is mechanics here, not a disclaimer (docs/07-timeline.md §1.5):
 *
 *   dated        fires on its year, always
 *   window       fires on one year drawn from its range — so a replay with a new
 *                seed genuinely differs, because the evidence genuinely does not
 *                pin the year down
 *   latent       contested scholarship. May not happen at all in a campaign.
 *                The game presents the argument; it does not adjudicate it.
 *   conditional  fires when world state matches
 *   player       the player initiates
 */
import { drawFrom } from './rng.js';

/**
 * Resolve the year an event actually fires in this campaign.
 * Pure: depends only on the event, the seed, and nothing else.
 *
 * @returns {number|null} the firing year, or null if it never fires
 */
export function resolveFiringYear(ev, seed) {
  if (ev.scope === 'prologue') return null;      // predates the campaign
  switch (ev.trigger) {
    case 'dated':
      return ev.year;

    case 'window': {
      const [lo, hi] = ev.window ?? [ev.year, ev.year];
      if (hi <= lo) return lo;
      const r = drawFrom(seed, 'window', ev.id);
      return lo + Math.floor(r * (hi - lo + 1));
    }

    case 'latent': {
      // A disputed event happens in some campaigns and not others, at a rate
      // set by how much the evidence actually supports it.
      const happens = drawFrom(seed, 'latent', ev.id) < ev.certainty + 0.25;
      if (!happens) return null;
      const [lo, hi] = ev.window ?? [ev.year - 25, ev.year + 25];
      const r = drawFrom(seed, 'latent-year', ev.id);
      return lo + Math.floor(r * (hi - lo + 1));
    }

    case 'conditional':
    case 'player':
      return null;                               // fired by the world, not the calendar

    default:
      return ev.year;
  }
}

/**
 * Build the firing schedule for a campaign: year → events, sorted.
 * Computed once at setup from (timeline, seed), so it is part of `f`.
 */
export function buildSchedule(timeline, seed) {
  const byYear = new Map();
  const skipped = [];
  for (const ev of timeline.events) {
    const y = resolveFiringYear(ev, seed);
    if (y === null) { skipped.push(ev); continue; }
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(ev);
  }
  // Within a year, order by magnitude so the important thing is read first.
  const rank = { W: 0, M: 1, R: 2, m: 3 };
  for (const list of byYear.values())
    list.sort((a, b) => (rank[a.magnitude] - rank[b.magnitude]) || a.id.localeCompare(b.id));
  return { byYear, skipped };
}

/** Events firing in the half-open span [from, to). */
export function eventsIn(schedule, from, to) {
  const out = [];
  for (let y = from; y < to; y++) {
    const list = schedule.byYear.get(y);
    if (list) for (const ev of list) out.push(ev);
  }
  return out;
}

/* ── Conditional triggers (phase 39) ─────────────────────────────────────── */

/**
 * A conditional event's `condition` is a small declarative object tested
 * against live world state — never code in a datapack (the fourth boundary).
 * Supported keys, all of which must hold:
 *
 *   good        a named good exists            { "good": "paper" }
 *   coinage     coinage is known               { "coinage": true }
 *   pillarMin   effective pillar floors        { "pillarMin": { "TRADE": 30 } }
 *   tradeVolume total delivered route volume   { "tradeVolume": 200 }
 *   occupation  an occupation is active        { "occupation": "OCC.DELHI_SULTANATE" }
 *   writtenWorks at least n works have a written carrier
 *
 * The event also respects its window: the condition is only consulted once
 * the world reaches `window[0]` (or its nominal year), and if the condition
 * never comes true the event never fires — which is the honest reading of
 * "coinage arrives when trade demands it".
 */
export function conditionMet(cond, state) {
  if (!cond) return true;
  if (cond.good && !state.goods.has(cond.good)) return false;
  if (cond.coinage !== undefined && state.coinageKnown !== cond.coinage) return false;
  if (cond.pillarMin)
    for (const [p, min] of Object.entries(cond.pillarMin))
      if ((state.pillars[p] ?? 0) < min) return false;
  if (cond.tradeVolume) {
    let v = 0;
    for (const r of state.routes.values()) v += r.volume ?? 0;
    if (v < cond.tradeVolume) return false;
  }
  if (cond.occupation && !state.occupationsActive?.has(cond.occupation)) return false;
  if (cond.writtenWorks) {
    let n = 0;
    for (const c of state.corpus.values())
      if (c.exists && !c.lost && c.carriers.some(x => x.medium !== 'memory')) n++;
    if (n < cond.writtenWorks) return false;
  }
  return true;
}

/** The conditional events of a timeline, for the engine's per-tick check. */
export function conditionalEvents(timeline) {
  return timeline.events.filter(e => e.trigger === 'conditional');
}
