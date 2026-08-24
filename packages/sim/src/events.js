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
