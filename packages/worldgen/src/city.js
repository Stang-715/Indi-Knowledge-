/**
 * City generation — ladder rungs L10 to L16.
 *
 * Everything here is computed, never stored. That is not only a memory
 * argument: India's Geospatial Data Guidelines 2021 restrict data finer than
 * 1 m, and L15–L16 are 0.41 m and 0.21 m. So sub-metre detail is procedural
 * BY DESIGN and never ships as data (docs/00-plan.md §5). The legal line and
 * the technical line turned out to be the same line.
 *
 * Pure. Same (city, year, seed) gives the same streets, the same plots and the
 * same houses, on every machine, for ever — so a player can walk a lane in
 * Thanjavur, quit, and find the same lane there next year.
 *
 * Coordinates are metres east/north of the city centre. The renderer projects.
 */
import { drawFrom } from '../../sim/src/rng.js';
import { fbm } from './noise.js';

/** Street ranks, widest first. */
export const STREET = {
  processional: { rank: 0, width: 22 },   // temple approach — the widest thing in the city
  ring:         { rank: 1, width: 14 },   // concentric
  radial:       { rank: 2, width: 11 },   // out to the gates
  street:       { rank: 3, width: 7 },
  lane:         { rank: 4, width: 3.6 },
};

/** What kind of ground a block is. Drives building form and density. */
export const DISTRICT = {
  temple:   { density: 0.30, height: [4, 9],  colour: 'stone' },
  market:   { density: 0.86, height: [4, 7],  colour: 'brick' },
  craft:    { density: 0.78, height: [3, 5],  colour: 'mud'   },
  dwelling: { density: 0.70, height: [3, 6],  colour: 'mud'   },
  garden:   { density: 0.12, height: [2, 3],  colour: 'mud'   },
  tank:     { density: 0.00, height: [0, 0],  colour: 'water' },
};

const TAU = Math.PI * 2;

/**
 * Generate a city.
 *
 * The layout is **nested rectangular rings around the temple** — the
 * prakaram plan of a South Indian temple town. Madurai is the textbook case:
 * concentric streets named for the months, each enclosing the last, with the
 * sanctum at the centre. Thanjavur and Srirangam are the same idea.
 *
 * A first version used concentric *circles* with radial plot divisions. It was
 * both wrong and unreadable: the plots came out as thin wedges pointing at the
 * centre, and the whole thing rendered as a dartboard. Rectangular rings give
 * rectangular blocks, which give rectangular plots, which give buildings that
 * look like buildings — and they happen to be what was actually built.
 *
 * @param {object} city  { id, lon, lat, founded, anchors[], rings, ... }
 * @param {number} year
 * @param {string} seed
 */
export function generateCity(city, year, seed) {
  const key = `${seed}/${city.id}`;
  const age = Math.max(0, year - city.founded);

  // The city grows with age and then stops. A thousand-year-old city is not a
  // thousand times bigger than a one-year-old one.
  const growth = 1 - Math.exp(-age / 420);
  const radius = (city.minRadius ?? 260) + (city.maxRadius ?? 1750) * growth;

  const nRings = city.rings ?? 7;
  const core = city.core ?? 110;
  const aspect = city.aspect ?? 1.12;      // most of these towns are wider than deep

  /** Half-extents of each rectangular ring, innermost first. */
  const rings = [];
  for (let i = 0; i < nRings; i++) {
    const t = Math.pow((i + 1) / nRings, 1.28);
    const r = core + (radius - core) * t;
    const jx = 1 + (drawFrom(key, 'ringx', i) - 0.5) * 0.10;
    const jy = 1 + (drawFrom(key, 'ringy', i) - 0.5) * 0.10;
    rings.push({ x: r * aspect * jx, y: r * jy });
  }

  const streets = [];
  const blocks = [];

  // Ring streets. The innermost is the processional way around the sanctum.
  for (let i = 0; i < nRings; i++) {
    streets.push({
      pts: ringRect(rings[i], key, i),
      kind: i === 0 ? 'processional' : i <= 2 ? 'ring' : 'street',
      ring: i,
    });
  }

  // Radial streets on the cardinal axes — the gate roads — plus a couple of
  // minor ones off-axis so the plan is not perfectly symmetrical.
  const outer = rings[nRings - 1];
  const AXES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let i = 0; i < AXES.length; i++) {
    const [dx, dy] = AXES[i];
    const off = (drawFrom(key, 'axis', i) - 0.5) * core * 0.5;
    const pts = [
      [dx * core * 0.7 + dy * off, dy * core * 0.7 + dx * off],
      [dx * outer.x * 1.24 + dy * off, dy * outer.y * 1.24 + dx * off],
    ];
    streets.push({ pts, kind: 'radial', gate: i });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + TAU / 8 + (drawFrom(key, 'minor', i) - 0.5) * 0.4;
    streets.push({
      pts: [[Math.cos(a) * core, Math.sin(a) * core],
            [Math.cos(a) * outer.x * 1.1, Math.sin(a) * outer.y * 1.1]],
      kind: 'street',
    });
  }

  // Blocks: the strips between consecutive rings, on each of the four sides,
  // plus the four corners. Split along their length so blocks stay roughly
  // square as the rings grow.
  for (let i = 0; i + 1 < nRings; i++) {
    const a = rings[i], b = rings[i + 1];
    const depthY = b.y - a.y, depthX = b.x - a.x;
    const district = () => districtFor(city, i, nRings, key, blocks.length);

    // North and south strips run in x; east and west run in y.
    for (const sign of [1, -1]) {
      const n = Math.max(1, Math.round((a.x * 2) / 130));
      for (let s = 0; s < n; s++) {
        const x0 = -a.x + (a.x * 2) * (s / n), x1 = -a.x + (a.x * 2) * ((s + 1) / n);
        blocks.push({
          poly: jitterRect([[x0, sign * a.y], [x1, sign * a.y],
                            [x1, sign * b.y], [x0, sign * b.y]], key, blocks.length),
          district: district(), ring: i, along: 'x', depth: depthY,
        });
      }
    }
    for (const sign of [1, -1]) {
      const n = Math.max(1, Math.round((a.y * 2) / 130));
      for (let s = 0; s < n; s++) {
        const y0 = -a.y + (a.y * 2) * (s / n), y1 = -a.y + (a.y * 2) * ((s + 1) / n);
        blocks.push({
          poly: jitterRect([[sign * a.x, y0], [sign * a.x, y1],
                            [sign * b.x, y1], [sign * b.x, y0]], key, blocks.length),
          district: district(), ring: i, along: 'y', depth: depthX,
        });
      }
    }
    // Corners.
    for (const [sx, sy] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
      blocks.push({
        poly: jitterRect([[sx * a.x, sy * a.y], [sx * b.x, sy * a.y],
                          [sx * b.x, sy * b.y], [sx * a.x, sy * b.y]], key, blocks.length),
        district: district(), ring: i, along: 'x', depth: Math.min(depthX, depthY),
      });
    }
  }

  // Anchors override the lattice. They are data, because they are the one part
  // of a real city that is not generic.
  const anchors = (city.anchors ?? []).filter(x => year >= (x.from ?? -Infinity));
  const water = [];
  for (const an of anchors) {
    if (an.kind === 'tank') water.push(tankPoly(an));
    for (const b of blocks) {
      const c = centroid(b.poly);
      const dx = Math.abs(c[0] - an.at[0]), dy = Math.abs(c[1] - an.at[1]);
      if (dx < an.size[0] / 2 + 20 && dy < an.size[1] / 2 + 20)
        b.district = an.kind === 'tank' ? 'tank' : 'temple';
    }
  }

  // Plots and buildings.
  const buildings = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    const spec = DISTRICT[b.district] ?? DISTRICT.dwelling;
    if (spec.density <= 0) continue;
    const plots = subdivideRect(b, key, bi);
    for (const plot of plots) {
      if (drawFrom(key, 'occupy', bi, plot.i) > spec.density) continue;
      const foot = inset(plot.poly, 1.0 + drawFrom(key, 'setback', bi, plot.i) * 1.8);
      if (!foot) continue;
      const [lo, hi] = spec.height;
      const h = lo + drawFrom(key, 'height', bi, plot.i) * (hi - lo);
      buildings.push({ poly: foot, height: h, colour: spec.colour, district: b.district });
    }
  }

  return {
    id: city.id, lon: city.lon, lat: city.lat, year, radius,
    rings, streets, blocks, buildings, water,
    anchors: anchors.map(a => ({ ...a, poly: rectPoly(a.at, a.size, a.rot ?? 0) })),
    wall: city.walled != null && year >= city.walled
      ? ringRect({ x: outer.x * 1.14, y: outer.y * 1.14 }, key, 99) : null,
  };
}

/* ── Lattice helpers ────────────────────────────────────────────────────── */

/** A rectangular ring, with rounded-off corners and a little wobble. */
function ringRect(r, key, i) {
  const pts = [];
  const cut = Math.min(r.x, r.y) * 0.22;
  const corners = [
    [ r.x - cut,  r.y], [ r.x,  r.y - cut],
    [ r.x, -r.y + cut], [ r.x - cut, -r.y],
    [-r.x + cut, -r.y], [-r.x, -r.y + cut],
    [-r.x,  r.y - cut], [-r.x + cut,  r.y],
  ];
  for (let k = 0; k < corners.length; k++) {
    const [x, y] = corners[k];
    const w = 1 + (fbm(x * 0.004 + i * 3.1, y * 0.004 + i * 7.7, 4211, 3) - 0.5) * 0.09;
    pts.push([x * w, y * w]);
  }
  pts.push(pts[0]);
  return pts;
}

/** Nudge a block's corners so the grid is hand-laid rather than surveyed. */
function jitterRect(poly, key, bi) {
  return poly.map(([x, y], i) => [
    x + (drawFrom(key, 'jx', bi, i) - 0.5) * 7,
    y + (drawFrom(key, 'jy', bi, i) - 0.5) * 7,
  ]);
}

function centroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}

function districtFor(city, ring, nRings, key, n) {
  if (ring === 0) return 'temple';
  const d = drawFrom(key, 'district', ring, n);
  if (ring === 1) return d < 0.62 ? 'market' : 'craft';
  if (ring >= nRings - 2) return d < 0.34 ? 'garden' : 'dwelling';
  return d < 0.24 ? 'craft' : 'dwelling';
}

/* ── Plots ──────────────────────────────────────────────────────────────── */

/**
 * Split a block into plots along its street frontage.
 *
 * Real plots are narrow and deep, perpendicular to the street, because frontage
 * is the scarce thing and depth is not. Slicing across the block's long axis
 * gives exactly that without any rule saying so.
 */
function subdivideRect(block, key, bi) {
  const [p0, p1, p2, p3] = block.poly;
  const frontage = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const n = Math.max(1, Math.min(10, Math.round(frontage / 19)));
  const out = [];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    out.push({ i, poly: [lerp(p0, p1, t0), lerp(p0, p1, t1), lerp(p3, p2, t1), lerp(p3, p2, t0)] });
  }
  return out;
}

/** Shrink a quad toward its centroid by `d` metres. */
function inset(poly, d) {
  const [cx, cy] = centroid(poly);
  const out = [];
  for (const [x, y] of poly) {
    const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy);
    if (L <= d * 1.5) return null;          // plot too small to build on
    out.push([cx + dx * (1 - d / L), cy + dy * (1 - d / L)]);
  }
  return out;
}

function rectPoly([x, y], [w, h], rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]
    .map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]);
}

function tankPoly(an) {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * TAU;
    pts.push([an.at[0] + Math.cos(a) * an.size[0] / 2, an.at[1] + Math.sin(a) * an.size[1] / 2]);
  }
  return pts;
}

/** Metres per degree at a latitude — for projecting local metres to lon/lat. */
export function metresPerDegree(lat) {
  return { lon: 111_320 * Math.cos(lat * Math.PI / 180), lat: 110_574 };
}
