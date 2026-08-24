/**
 * The only source of randomness in the simulation.
 *
 * Everything the sim does that looks random comes from here, and here it comes
 * from a seed. That is what makes `world = f(datapack, seed, decision_log)` true
 * (docs/10-buildplan.md Part A.3).
 *
 * Uses SplitMix32: fast, well-distributed, and — importantly — implementable in
 * exact 32-bit integer arithmetic, so it produces byte-identical streams on every
 * platform. Float-based generators do not guarantee that.
 */

/** Hash a string to a 32-bit integer. Stable across runs and machines. */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class Rng {
  /** @param {number|string} seed */
  constructor(seed) {
    this.state = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
  }

  /** Next raw 32-bit unsigned integer. */
  next() {
    this.state = (this.state + 0x9e3779b9) >>> 0;
    let z = this.state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    return (z ^ (z >>> 15)) >>> 0;
  }

  /** Float in [0, 1). */
  float() {
    return this.next() / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min, max) {
    if (max < min) throw new RangeError(`Rng.int: max ${max} < min ${min}`);
    return min + (this.next() % (max - min + 1));
  }

  /** True with probability p. */
  chance(p) {
    return this.float() < p;
  }

  /** Pick one element. Does not mutate the array. */
  pick(arr) {
    if (arr.length === 0) throw new RangeError('Rng.pick: empty array');
    return arr[this.next() % arr.length];
  }

  /**
   * A child generator for a named subsystem.
   *
   * This matters more than it looks. If trade and the corpus draw from one shared
   * stream, adding a single trade roll shifts every later corpus roll and the whole
   * campaign diverges. Named substreams keep subsystems independent, so a change in
   * one does not silently rewrite the others.
   */
  fork(name) {
    return new Rng((this.state ^ hashString(name)) >>> 0);
  }
}

/**
 * A deterministic draw that depends only on its inputs, with no stream state.
 * Use where order of evaluation must not matter — e.g. per-tile terrain.
 */
export function drawFrom(seed, ...keys) {
  let h = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  for (const k of keys) {
    h ^= typeof k === 'string' ? hashString(k) : (k | 0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97) >>> 0;
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
