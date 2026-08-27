/**
 * The texture engine (phase 37).
 *
 * 07-timeline §5.3's unbuilt sentence: "in the ancient eras these carry most
 * of the texture — 173 hours cannot run on authored events alone." Authored
 * data keeps W, M and R; this layer IS the m tier. A drought year, a good
 * harvest, a manuscript found wormy in its chest, a storyteller adding a
 * local flood to an old tale — minor incidents composed at tick time from
 * data/timeline/texture.json, gated on actual world state, and paced so no
 * era runs twenty minutes of play without something to read.
 *
 * Determinism is non-negotiable: every draw comes through drawFrom keyed by
 * year, so the same campaign replays identically and the incidents are part
 * of the fingerprint like everything else. No template repeats its surface
 * string inside its cooldown, which is what keeps a century from rhyming.
 */
import { record, bumpPillar } from './state.js';
import { drawFrom } from './rng.js';

/** Minutes of real play per in-game year at this date, from the era table. */
export function minutesPerYear(eras, year) {
  const era = eras.find(e => year >= e.from && year < e.to) ?? eras[eras.length - 1];
  return (era.hours * 60) / (era.to - era.from);
}

/** Target: one texture incident about every this-many minutes of play. */
const TARGET_MINUTES = 8;

function eligible(t, state, year) {
  if (t.years && (year < t.years[0] || year > t.years[1])) return false;
  const n = t.needs;
  if (!n) return true;
  if (n.shock && !state.shocks.some(s => s.pillar === n.shock)) return false;
  if (n.noShock && state.shocks.some(s => s.pillar === n.noShock)) return false;
  if (n.reciters && state.pops.reciters < n.reciters) return false;
  if (n.soldiers && state.pops.soldiers < n.soldiers) return false;
  if (n.routeOpen && ![...state.routes.values()].some(r => r.open)) return false;
  if (n.writtenWorks) {
    let ok = false;
    for (const c of state.corpus.values()) {
      if (c.exists && !c.lost && c.carriers.some(x => x.medium !== 'memory')) { ok = true; break; }
    }
    if (!ok) return false;
  }
  return true;
}

/** A place name appropriate to the year: drawn from the where-keys of events
 *  within two centuries, so the Neolithic never name-drops Calcutta. */
function placeFor(datapack, state, year, u) {
  const gaz = datapack.gazetteer;
  if (!gaz) return 'the villages';
  const nearby = [];
  for (const ev of datapack.timeline.events) {
    if (Math.abs(ev.year - year) > 200) continue;
    for (const k of ev.where ?? []) if (!k.startsWith('RGN.')) nearby.push(k);
  }
  if (!nearby.length) return 'the villages';
  const key = nearby[Math.floor(u * nearby.length) % nearby.length];
  const g = gaz.places.find(p => p.id === key);
  return g ? g.name.split(' (')[0] : 'the villages';
}

function workFor(state, u) {
  const alive = [];
  for (const c of state.corpus.values()) if (c.exists && !c.lost) alive.push(c.title);
  if (!alive.length) return 'an old text';
  return alive[Math.floor(u * alive.length) % alive.length];
}

export function tickTexture(state, datapack, span, seed) {
  const tx = datapack.texture;
  if (!tx) return;                       // a datapack without texture plays without it
  const eras = datapack.timeline.eras ?? [];
  const mpy = minutesPerYear(eras, state.year);

  // Pacing by deficit, not by coin flip. A per-tick chance starves dense eras
  // — nine dry Mauryan years is fifty-one silent minutes, and a 5.7% run of
  // bad luck happens somewhere in every 2,000-year stretch. Instead, play
  // minutes accumulate as debt and an incident fires when the debt crosses
  // the target (jittered so the rhythm never turns metronomic). The maximum
  // silent stretch is target-plus-jitter by construction, which is what the
  // silence rule needs to be a guarantee rather than a hope.
  state.textureDebt = (state.textureDebt ?? 0) + span * mpy;
  // Jitter keeps the rhythm human, but it may only delay, never compound: at
  // coarse ticks (5-year Neolithic ticks are 8.6 Indus minutes each) a jitter
  // miss next to a surface-skip already cost 26 silent minutes in a scripted
  // session. Past one-and-a-half targets of debt, the incident fires, full
  // stop.
  const jitter = (drawFrom(seed, 'texture-jitter', state.year) - 0.5) * 6;
  const due = state.textureDebt >= TARGET_MINUTES * 1.5
           || state.textureDebt >= TARGET_MINUTES + jitter;
  if (!due) return;
  // The debt is cleared only when an incident actually lands. A skip — empty
  // pool, or every variant recently used — keeps the debt, so the next tick
  // fires instead of the silence compounding.

  if (!state.textureSeen) state.textureSeen = new Map();
  // Cooldowns are stated in play minutes, converted at the era's cadence: a
  // 50-minute cooldown is a century in the Neolithic and nine years in the
  // Mauryan, which is the same amount of the player's attention either way.
  let pool = tx.templates.filter(t => {
    const last = state.textureSeen.get(t.id);
    const coolYears = (t.cooldown ?? 60) / mpy;
    if (last !== undefined && state.year - last < coolYears) return false;
    return eligible(t, state, state.year);
  });
  // Cooldown starvation: eras where the needs-gating leaves a small eligible
  // set can cool every template at once, and the debt then compounds into
  // real silence (a scripted Indus session hit 25 quiet minutes this way).
  // Fall back to eligible-but-cooling templates — the 150-year surface memory
  // below still forbids an exact repeat, which is the promise that matters.
  if (!pool.length) pool = tx.templates.filter(t => eligible(t, state, state.year));
  if (!pool.length) return;

  if (!state.textureLast) state.textureLast = new Map();
  // Up to three template attempts: a surface-skip on the first pick tries a
  // different template instead of costing the whole tick — a skipped tick at
  // Neolithic granularity is 8.6 minutes of the player's evening.
  let t = null, text = null, recent = null;
  for (let attempt = 0; attempt < 3 && text === null; attempt++) {
    const total = pool.reduce((a, c) => a + (c.weight ?? 1), 0);
    let pick = drawFrom(seed, 'texture-pick', state.year, attempt) * total;
    t = pool[0];
    for (const c of pool) { pick -= (c.weight ?? 1); if (pick <= 0) { t = c; break; } }

    const uText  = drawFrom(seed, 'texture-text',  state.year, t.id);
    const uPlace = drawFrom(seed, 'texture-place', state.year, t.id);
    const uWork  = drawFrom(seed, 'texture-work',  state.year, t.id);
    const uGood  = drawFrom(seed, 'texture-good',  state.year, t.id);
    const compose = (vi) => t.texts[vi % t.texts.length]
      .replace('{place}', placeFor(datapack, state, state.year, uPlace))
      .replace('{work}',  workFor(state, uWork))
      .replace('{good}',  tx.goods[Math.floor(uGood * tx.goods.length) % tx.goods.length]);

    // Never repeat a template's exact surface string within living memory:
    // with two variants and a small place pool, A-B-A inside a century is
    // otherwise guaranteed.
    recent = (state.textureLast.get(t.id) ?? [])
      .filter(r => state.year - r.year < 150);
    const seenTexts = new Set(recent.map(r => r.text));
    let vi = Math.floor(uText * t.texts.length);
    let candidate = compose(vi);
    let tries = t.texts.length;
    while (seenTexts.has(candidate) && tries-- > 0) candidate = compose(++vi);
    if (!seenTexts.has(candidate)) text = candidate;
    else pool = pool.filter(c => c.id !== t.id);
    if (!pool.length) break;
  }
  if (text === null) return;
  recent.push({ year: state.year, text });
  state.textureLast.set(t.id, recent);

  for (const [pillar, d] of Object.entries(t.effects ?? {}))
    bumpPillar(state, pillar, d);

  state.textureDebt = 0;
  state.textureSeen.set(t.id, state.year);
  state.stats.textureIncidents = (state.stats.textureIncidents ?? 0) + 1;
  record(state, state.year, 'texture', text, { template: t.id });
}
