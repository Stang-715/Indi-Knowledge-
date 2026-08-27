/**
 * The survey (docs/00-plan.md §3, docs/12-buildplan-2.md Phase 13).
 *
 * The thesis is that the gaps ARE the game. Every entity already carries a
 * provenance tier — SOURCED, DERIVED, SYNTHESIZED, ABSENT — and until now
 * nothing rendered it, so the map quietly told the player that a district we
 * know nothing about and a district where nothing happened look the same.
 *
 * They must not. An unsurveyed district shows as a blank sheet: the game
 * admitting, on the face of the map, that it does not know.
 *
 * And the survey has to cut both ways. A survey that only ever improves things
 * is a loading bar with extra steps. A real one can find that the settlement is
 * smaller than you assumed, the river has moved, the mine is worked out — and
 * finding that out is still worth more than not knowing.
 */
import { record, bumpPillar } from './state.js';
import { drawFrom } from './rng.js';

export const TIER = {
  SOURCED:     { rank: 3, label: 'attested',   trust: 1.00 },
  DERIVED:     { rank: 2, label: 'inferred',   trust: 0.75 },
  SYNTHESIZED: { rank: 1, label: 'assumed',    trust: 0.45 },
  ABSENT:      { rank: 0, label: 'unsurveyed', trust: 0.00 },
};

/** A survey costs people and years, not just grain. */
export const SURVEY_COST = { grain: 90, years: 4 };

/** Approximate centres of the twelve documented regional spines. */
const ANCHORS = [
  { id: 'RGN.TAMILAKAM',    lon: 78.6, lat: 10.6 },
  { id: 'RGN.KARNATAKA',    lon: 76.2, lat: 14.6 },
  { id: 'RGN.ANDHRA',       lon: 79.4, lat: 16.6 },
  { id: 'RGN.KERALA',       lon: 76.3, lat: 10.2 },
  { id: 'RGN.BENGAL',       lon: 88.4, lat: 23.6 },
  { id: 'RGN.ODISHA',       lon: 85.4, lat: 20.4 },
  { id: 'RGN.ASSAM',        lon: 92.4, lat: 26.2 },
  { id: 'RGN.KASHMIR',      lon: 74.9, lat: 34.1 },
  { id: 'RGN.GUJARAT',      lon: 71.8, lat: 22.4 },
  { id: 'RGN.MAHARASHTRA',  lon: 74.6, lat: 19.2 },
  { id: 'RGN.RAJASTHAN',    lon: 73.4, lat: 26.6 },
  { id: 'RGN.SRI_LANKA',    lon: 80.6, lat: 7.9  },
  // The Gangetic plain has no spine of its own because it is the spine of the
  // main timeline; it is nonetheless one of the best-documented stretches.
  { id: 'RGN.GANGETIC',     lon: 82.5, lat: 26.0 },
];

const GRID = { w: 66.0, s: 6.0, e: 94.0, n: 35.0, cols: 9, rows: 9 };

/**
 * Fraction of each grid cell that is land, computed once from the coastline by
 * tools/build-landmask.mjs and baked in.
 *
 * The sim may not call worldgen — that boundary is one of the four that must not
 * blur (docs/00-plan.md §9) — and a district in the middle of the Bay of Bengal
 * is not a district. Nine by nine floats is a cheap way to respect both.
 * Row 0 is the southern edge.
 */
const LAND = [
  [0, 0, 0, 0.15, 0.48, 0.03, 0, 0, 0.01],
  [0, 0, 0.01, 0.83, 0.38, 0, 0, 0, 0.02],
  [0, 0, 0.28, 1, 0.56, 0, 0, 0, 0.01],
  [0, 0, 0.68, 1, 0.95, 0.41, 0, 0, 0.01],
  [0, 0.30, 0.84, 1, 1, 1, 0.58, 0.08, 0.38],
  [0.36, 0.94, 0.99, 1, 1, 1, 1, 0.97, 0.95],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const MIN_LAND = 0.25;

/**
 * Lay districts over the whole map, not only where the record is good.
 *
 * A first version generated four districts per documented region, which meant
 * every district on the map was attached to a regional spine and NOTHING came
 * out unsurveyed. That inverts the thesis: the twelve spines are precisely the
 * parts we know about, and the reason the survey mechanic exists is everything
 * else. So the grid covers the subcontinent and a district's starting tier
 * falls out of how close it is to a place the record actually talks about.
 */
export function initSurvey(state, datapack, fromYear) {
  state.districts = new Map();

  // How much the timeline says about each region.
  const weight = new Map();
  for (const ev of datapack.timeline?.events ?? [])
    if (ev.region) weight.set(ev.region, (weight.get(ev.region) ?? 0) + 1);

  const dw = (GRID.e - GRID.w) / GRID.cols, dh = (GRID.n - GRID.s) / GRID.rows;
  for (let j = 0; j < GRID.rows; j++) {
    for (let i = 0; i < GRID.cols; i++) {
      const land = LAND[j]?.[i] ?? 0;
      if (land < MIN_LAND) continue;                 // open water is not a district
      const lon = GRID.w + (i + 0.5) * dw, lat = GRID.s + (j + 0.5) * dh;
      const id = `DST.${i}.${j}`;

      // Nearest documented anchor, and how far away it is in degrees.
      let near = null, dist = Infinity;
      for (const a of ANCHORS) {
        const d = Math.hypot((a.lon - lon) * 0.93, a.lat - lat);
        if (d < dist) { dist = d; near = a; }
      }
      const evidence = (weight.get(near.id) ?? 0) / Math.max(1, dist * dist);

      const tier = evidence > 6 ? 'DERIVED'
                 : evidence > 1.2 ? 'SYNTHESIZED'
                 : 'ABSENT';

      state.districts.set(id, {
        id, lon, lat, region: near.id,
        name: districtName(lon, lat, near),
        tier, surveyed: null,
        land,
        estimate: Math.round((60 + drawFrom(state.seed, 'est', id) * 460) * land),
        truth: null,
        evidence: Math.round(evidence * 10) / 10,
      });
    }
  }
}

function districtName(lon, lat, near) {
  const region = near.id.replace('RGN.', '').toLowerCase()
    .replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const ns = lat > near.lat + 1.5 ? 'north' : lat < near.lat - 1.5 ? 'south' : '';
  const ew = lon > near.lon + 1.5 ? 'east'  : lon < near.lon - 1.5 ? 'west'  : '';
  const q = [ns, ew].filter(Boolean).join('-');
  return q ? `${region}, ${q}` : `${region}, centre`;
}

/**
 * Survey a district.
 *
 * The truth is drawn deterministically from the seed, so it was always going to
 * be what it is — the player is discovering, not rolling. About two in five
 * surveys return worse news than the estimate, which is what makes the decision
 * to look a real one.
 */
export function survey(state, districtId, year) {
  const d = state.districts.get(districtId);
  if (!d || d.surveyed !== null) return false;
  if (state.grain < SURVEY_COST.grain) return false;
  if (state.pops.scribes < 1) return false;

  state.grain -= SURVEY_COST.grain;
  d.surveyed = year;

  // The truth was fixed at world-creation. Looking does not change it.
  const roll = drawFrom(state.seed, 'truth', d.id);
  const factor = roll < 0.40 ? 0.45 + roll * 0.8        // worse than assumed
               : roll < 0.72 ? 0.95 + (roll - 0.40) * 0.4
               : 1.15 + (roll - 0.72) * 1.6;            // better
  d.truth = Math.round(d.estimate * factor);
  d.tier = 'SOURCED';

  const delta = d.truth - d.estimate;
  const pct = Math.round((delta / d.estimate) * 100);
  state.stats.surveys = (state.stats.surveys ?? 0) + 1;
  if (delta < 0) state.stats.surveysDisappointing = (state.stats.surveysDisappointing ?? 0) + 1;

  bumpPillar(state, 'IT', 1.5);
  bumpPillar(state, 'NETWORKING', 0.8);

  record(state, year, 'survey',
    delta < 0
      ? `${d.name} surveyed: ${Math.abs(pct)}% less than was assumed. Now you know.`
      : delta > 0
      ? `${d.name} surveyed: ${pct}% more than was assumed.`
      : `${d.name} surveyed. The estimate held.`,
    { district: d.id, delta, tier: 'SOURCED' });
  return true;
}

/** What the game currently believes about a district. */
export function believedValue(d) {
  return d.surveyed !== null ? d.truth : d.estimate;
}

/** Districts worth looking at, worst-understood first. */
export function surveyable(state) {
  return [...state.districts.values()]
    .filter(d => d.surveyed === null)
    .sort((a, b) => TIER[a.tier].rank - TIER[b.tier].rank);
}

export function surveySummary(state) {
  let surveyed = 0, absent = 0, derived = 0;
  for (const d of state.districts.values()) {
    if (d.surveyed !== null) surveyed++;
    else if (d.tier === 'ABSENT') absent++;
    else derived++;
  }
  return { surveyed, absent, derived, total: state.districts.size };
}

export const DECISIONS = {
  'survey'(state, d) { survey(state, d.district, d.year); },
};
