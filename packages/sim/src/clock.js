/**
 * The clock.
 *
 * Advances the campaign from 6000 BCE to 1947 at the cadence in
 * docs/07-timeline.md §2.5 — five-yearly in the deep past, yearly from 1300 BCE.
 * It has no wall clock of its own: a tick is a tick, and how long a tick takes in
 * real seconds is the renderer's problem, not the simulation's.
 */

export const START_YEAR = -6000;
export const END_YEAR = 1947;

/** Years per tick, by year. Coarse where the evidence is coarse. */
export function tickYears(year) {
  if (year < -1300) return 5;
  return 1;
}

/**
 * Total ticks in a full campaign. Computed, not asserted, so the number in the
 * docs and the number in the engine can never disagree.
 */
export function totalTicks(from = START_YEAR, to = END_YEAR) {
  let n = 0;
  for (let y = from; y < to; y += tickYears(y)) n++;
  return n;
}

export class Clock {
  constructor({ from = START_YEAR, to = END_YEAR } = {}) {
    this.from = from;
    this.to = to;
    this.year = from;
    this.tick = 0;
  }

  get done() { return this.year >= this.to; }

  /** Advance one tick. Returns the span just crossed: [previousYear, newYear). */
  advance() {
    if (this.done) return null;
    const was = this.year;
    const step = tickYears(this.year);
    this.year = Math.min(this.year + step, this.to);
    this.tick++;
    return [was, this.year];
  }

  /** Fraction of the campaign elapsed, 0..1. */
  get progress() {
    return (this.year - this.from) / (this.to - this.from);
  }

  toJSON() { return { year: this.year, tick: this.tick }; }
}

/** Format a year the way the game shows it. */
export function formatYear(y) {
  return y < 0 ? `${-y} BCE` : `${y} CE`;
}
