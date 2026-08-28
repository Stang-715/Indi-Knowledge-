/**
 * The atlas's own knowledge layers, carried onto Paramountcy's table.
 *
 * The standalone atlas (index.html, js/app.js) shows ten subject tabs —
 * soil, history, governance, community, art, craft, wars, vedas, folklore,
 * heritage — each a state-level choropleth backed by a curated data file in
 * atlas-data/. Rather than forking that content into a second copy, each
 * tab's script is fetched on first open exactly as the atlas itself loads
 * it (a plain `window.INDIA_DATA.<key> = {...}` global), so the two apps
 * read one source of truth.
 */

export const KNOWLEDGE_TABS = [
  { key: 'soil',       icon: '🌱', label: 'Soil Health' },
  { key: 'history',    icon: '🏛️', label: 'History' },
  { key: 'governance', icon: '⚖️', label: 'Governance' },
  { key: 'community',  icon: '🪷', label: 'Communities' },
  { key: 'art',        icon: '🎨', label: 'Local Art' },
  { key: 'craft',      icon: '🧵', label: 'Local Craft' },
  { key: 'wars',       icon: '🛡️', label: 'Wars' },
  { key: 'vedas',      icon: '🕉️', label: 'Vedas' },
  { key: 'folklore',   icon: '🪔', label: 'Folk Tales' },
  { key: 'heritage',   icon: '🏰', label: 'Heritage' },
];

/** BND.DADRA_NAGAR_HAVELI_DAMAN_DIU -> dadra-nagar-haveli-daman-diu, the
 *  slug shape atlas-data/*.js keys its `states` object by. */
export function slugFromBndId(id) {
  return id.replace(/^BND\./, '').toLowerCase().replace(/_/g, '-');
}

const loaded = new Map(); // key -> Promise<data | null>

/** Fetch one tab's data file exactly once, however many times it is opened.
 *  The bundled single-file build (tools/build-client.mjs) has no sibling
 *  atlas-data/ tree to fetch from, so it inlines every tab's data ahead of
 *  time into `window.__KNOWLEDGE_INLINE` — checked first, so the artifact
 *  never touches the network for this at all. */
export function loadKnowledgeTab(key) {
  if (loaded.has(key)) return loaded.get(key);
  const inline = globalThis.__KNOWLEDGE_INLINE?.[key];
  const p = inline
    ? Promise.resolve(inline)
    : new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = `../../atlas-data/${key}.js`;
        el.onload = () => resolve(window.INDIA_DATA?.[key] ?? null);
        el.onerror = () => reject(new Error(`could not load atlas-data/${key}.js`));
        document.head.appendChild(el);
      });
  loaded.set(key, p);
  return p;
}

/** Even-odd point-in-polygon across every ring of a state outline — a hole
 *  ring cancels its parent correctly under XOR, the same rule SVG's own
 *  fill-rule:evenodd uses, which is how these outlines were authored. */
export function pointInRings(rings, lon, lat) {
  let inside = false;
  for (const ring of rings) {
    let j = ring.length - 2;
    for (let i = 0; i < ring.length; i += 2) {
      const xi = ring[i], yi = ring[i + 1];
      const xj = ring[j], yj = ring[j + 1];
      if (((yi > lat) !== (yj > lat)) &&
          (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
      j = i;
    }
  }
  return inside;
}

export function findStateAt(boundaries, lon, lat) {
  if (!boundaries) return null;
  for (const s of boundaries.states) {
    if (pointInRings(s.outline, lon, lat)) return s;
  }
  return null;
}

const CONFIDENCE_WEIGHT = { high: 1, medium: 0.62, low: 0.35 };
export function confidenceWeight(entry) {
  return CONFIDENCE_WEIGHT[entry?.confidence] ?? 0.5;
}

/* ── Your state ────────────────────────────────────────────────────────── */

/** Which of the sim's own districts (packages/sim/src/survey.js's 53-cell
 *  grid, NOT this file's 724-district atlas boundaries) fall inside a
 *  chosen real-world state's outline. This is the actual scoping rule for
 *  anything the player builds "in their state" — precise, because it tests
 *  real geometry rather than the coarser 12-region spine every district
 *  already carries as `region`.
 *
 *  A strict-containment test alone leaves 18 of the 36 states — Bihar,
 *  Kerala, West Bengal, Punjab among them — with NOTHING: the sim's grid is
 *  9x9 over the whole subcontinent, coarse enough that a real state can sit
 *  entirely between cell centres without ever containing one. So when the
 *  strict list is empty, this falls back to the single nearest sim district
 *  to the state's own centroid — every state gets at least one place to
 *  build, honestly labelled as "nearest" rather than silently doing nothing. */
export function districtsInState(simDistricts, s) {
  const out = [];
  for (const d of simDistricts.values()) {
    if (pointInRings(s.outline, d.lon, d.lat)) out.push(d);
  }
  if (out.length) return out;
  let nearest = null, bestD = Infinity;
  for (const d of simDistricts.values()) {
    const dd = (d.lon - s.c[0]) ** 2 + (d.lat - s.c[1]) ** 2;
    if (dd < bestD) { bestD = dd; nearest = d; }
  }
  return nearest ? [nearest] : [];
}

/** The nearest of the sim's twelve documented regional spines (survey.js's
 *  `ANCHORS`) to a point — how a chosen real-world state becomes the sim's
 *  own `homeRegion`, without a second hand-maintained state→region table. */
export function nearestRegion(anchors, lon, lat) {
  let best = anchors[0], bestD = Infinity;
  for (const a of anchors) {
    const d = Math.hypot((a.lon - lon) * 0.93, a.lat - lat);
    if (d < bestD) { bestD = d; best = a; }
  }
  return best.id;
}
