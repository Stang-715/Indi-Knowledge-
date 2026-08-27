/**
 * Challenges — drought, despair, rumour.
 *
 * A regional challenge is fought with knowledge, not force: a drought is
 * broken by reciting an Agriculture skill card over it, a wave of despair by
 * a chapter of the Gita, a rumour by numeracy that scatters it. This is a
 * growth game, not a combat one — an unanswered challenge never kills
 * anyone. It stalls growth for a while (the logistic climb in tickEconomy
 * slows) until it is taught away or the window passes. Answering it in time
 * does more than clear the problem: it gives the taught district a visible
 * population bump, the reward for teaching the right thing in the right
 * place.
 */
import { record, bumpPillar } from './state.js';
import { drawFrom } from './rng.js';

export const CHALLENGE_TYPES = {
  drought: {
    label: 'Drought',
    icon: '☀',
    hint: 'recite an Agriculture skill card here',
    counters: (cardId) => cardId?.startsWith('EDU.SKILL.AGRI'),
    resolvedMsg: (name) => `${name}: the drought breaks — the fields drink again.`,
    expiredMsg: (name) => `${name}: growth stalls as the drought lingers.`,
  },
  despair: {
    label: 'Wave of despair',
    icon: '🌀',
    hint: 'recite a Bhagavad Gita chapter here',
    counters: (cardId) => cardId?.startsWith('EDU.GITA'),
    resolvedMsg: (name) => `${name}: hearts steady — the despair lifts.`,
    expiredMsg: (name) => `${name}: growth stalls as despair lingers.`,
  },
  rumor: {
    label: 'Rumour & superstition',
    icon: '❗',
    hint: 'recite an Arithmetic skill card here',
    counters: (cardId) => cardId?.startsWith('EDU.SKILL.ARITH'),
    resolvedMsg: (name) => `${name}: the numbers scatter the rumour.`,
    expiredMsg: (name) => `${name}: growth stalls as the rumour spreads.`,
  },
};
const TYPE_KEYS = Object.keys(CHALLENGE_TYPES);

/** How long a challenge stays open before it expires unanswered. */
const CHALLENGE_WINDOW_YEARS = 25;
/** How long an expired challenge stalls growth for. */
const STAGNATE_YEARS = 20;
/** Spread between challenges, in years — deterministic jitter around this. */
const SPAWN_INTERVAL = [30, 70];
/** Population reward for resolving one in time. */
const RESOLVE_BUMP = 1.06;

export function initChallenges(state, fromYear) {
  state.challenges = [];
  state.growthStalledUntil = fromYear;
  state.stats.challengesResolved = 0;
  state.stats.challengesExpired = 0;
  state.nextChallengeYear = fromYear + 40
    + Math.round(drawFrom(state.seed, 'chal-first') * 40);
}

function pickDistrict(state, atYear) {
  const populated = [...state.districts.values()]
    .filter((d) => (d.estimate ?? 0) > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!populated.length) return null;
  const taken = new Set(state.challenges.map((c) => c.district));
  const free = populated.filter((d) => !taken.has(d.id));
  const pool = free.length ? free : populated;
  const idx = Math.min(pool.length - 1,
    Math.floor(drawFrom(state.seed, 'chal-district', atYear) * pool.length));
  return pool[idx];
}

/** Standing system: spawn new challenges on schedule, expire the stale ones. */
export function tickChallenges(state, span) {
  if (!state.districts?.size) return;
  if (state.nextChallengeYear == null) initChallenges(state, state.year);

  if (state.year >= state.nextChallengeYear) {
    const d = pickDistrict(state, state.nextChallengeYear);
    if (d) {
      const type = TYPE_KEYS[Math.floor(
        drawFrom(state.seed, 'chal-type', state.nextChallengeYear) * TYPE_KEYS.length)];
      state.challenges.push({
        id: `CHAL.${state.nextChallengeYear}.${d.id}`,
        type, district: d.id,
        startYear: state.year,
        expiresYear: state.year + CHALLENGE_WINDOW_YEARS,
      });
      record(state, state.year, 'challenge',
        `${CHALLENGE_TYPES[type].label} in ${d.name}.`, { district: d.id, kind: type });
    }
    const [lo, hi] = SPAWN_INTERVAL;
    state.nextChallengeYear += lo
      + Math.round(drawFrom(state.seed, 'chal-interval', state.nextChallengeYear) * (hi - lo));
  }

  for (let i = state.challenges.length - 1; i >= 0; i--) {
    const c = state.challenges[i];
    if (state.year < c.expiresYear) continue;
    const d = state.districts.get(c.district);
    const T = CHALLENGE_TYPES[c.type];
    state.growthStalledUntil = Math.max(state.growthStalledUntil ?? 0, state.year + STAGNATE_YEARS);
    if (c.type !== 'drought') bumpPillar(state, 'CULTIVATION', -0.3);
    record(state, state.year, 'challenge-expired',
      T.expiredMsg(d?.name ?? c.district), { district: c.district, kind: c.type });
    state.stats.challengesExpired = (state.stats.challengesExpired ?? 0) + 1;
    state.challenges.splice(i, 1);
  }
}

/** Called from teaching.js's `recite` decision: does this recital answer any
 *  open challenge standing in this district? */
export function resolveChallenges(state, districtId, cardId) {
  if (!districtId || !cardId || !state.challenges?.length) return;
  for (let i = state.challenges.length - 1; i >= 0; i--) {
    const c = state.challenges[i];
    if (c.district !== districtId) continue;
    const T = CHALLENGE_TYPES[c.type];
    if (!T.counters(cardId)) continue;
    const d = state.districts.get(districtId);
    record(state, state.year, 'challenge-resolved',
      T.resolvedMsg(d?.name ?? districtId), { district: districtId, kind: c.type });
    if (d) d.estimate = Math.round((d.estimate ?? 0) * RESOLVE_BUMP);
    state.stats.challengesResolved = (state.stats.challengesResolved ?? 0) + 1;
    state.challenges.splice(i, 1);
  }
}

/** Is growth currently stalled by an unanswered challenge? Read by
 *  tickEconomy to slow the logistic climb — never to reverse it. */
export function growthStalled(state) {
  return state.year < (state.growthStalledUntil ?? 0);
}
