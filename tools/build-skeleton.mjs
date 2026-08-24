#!/usr/bin/env node
// Builds the base-map SKELETON: the small, exact vector control data the procedural
// generator hangs everything else on.  See docs/09-procedural-map.md.
//
//   The shape is data.  The detail is code.
//
// Source: Natural Earth 10m (public domain).  We take LAND polygons, not country
// polygons -- so the base map carries no international boundary depiction at all, which
// keeps it clear of the Criminal Law (Amendment) Act 1990 issue in docs/00-plan.md §5.
// Political boundaries arrive later as their own SOI-compliant layer.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const BBOX = { w: 58.0, s: -2.0, e: 108.0, n: 44.0 };

const LODS = [                 // simplification tolerance in degrees, per level
  { level: 0, tol: 0.40 },     // ~44 km  — national outline
  { level: 1, tol: 0.16 },     // ~18 km
  { level: 2, tol: 0.06 },     // ~7 km
  { level: 3, tol: 0.02 },     // ~2 km
  { level: 4, tol: 0.006 },    // ~660 m  — the floor of the source data
];

// ---------- geometry ----------
const inside = (p, edge) => {
  switch (edge) {
    case 'w': return p[0] >= BBOX.w;
    case 'e': return p[0] <= BBOX.e;
    case 's': return p[1] >= BBOX.s;
    case 'n': return p[1] <= BBOX.n;
  }
};
const intersect = (a, b, edge) => {
  const [x1, y1] = a, [x2, y2] = b;
  let t;
  if (edge === 'w') t = (BBOX.w - x1) / (x2 - x1);
  else if (edge === 'e') t = (BBOX.e - x1) / (x2 - x1);
  else if (edge === 's') t = (BBOX.s - y1) / (y2 - y1);
  else t = (BBOX.n - y1) / (y2 - y1);
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
};

// Sutherland-Hodgman against an axis-aligned rect (convex, so this is valid).
function clipRing(ring) {
  let out = ring;
  for (const edge of ['w', 'e', 's', 'n']) {
    const input = out; out = [];
    if (!input.length) break;
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      const cIn = inside(cur, edge), pIn = inside(prev, edge);
      if (cIn) { if (!pIn) out.push(intersect(prev, cur, edge)); out.push(cur); }
      else if (pIn) out.push(intersect(prev, cur, edge));
    }
  }
  return out;
}

// Liang-Barsky segment clip, for open polylines (rivers).
function clipLine(line) {
  const segs = []; let cur = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    const ok = p[0] >= BBOX.w && p[0] <= BBOX.e && p[1] >= BBOX.s && p[1] <= BBOX.n;
    if (ok) cur.push(p);
    else if (cur.length) { if (cur.length > 1) segs.push(cur); cur = []; }
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

// Douglas-Peucker.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = -1, idx = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d;
      if (len2 === 0) d = Math.hypot(px - ax, py - ay);
      else {
        let t = ((px - ax) * dx + (py - ay) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      }
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const areaOf = r => {           // signed area in deg², for dropping specks
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
};

// Quantise to uint16 over the bbox.
const QMAX = 65535;
const qx = x => Math.round((x - BBOX.w) / (BBOX.e - BBOX.w) * QMAX);
const qy = y => Math.round((y - BBOX.s) / (BBOX.n - BBOX.s) * QMAX);
const quantise = ring => { const o = new Array(ring.length * 2); for (let i = 0; i < ring.length; i++) { o[i*2] = qx(ring[i][0]); o[i*2+1] = qy(ring[i][1]); } return o; };

// ---------- extract ----------
const load = f => JSON.parse(readFileSync(`/tmp/${f}.geojson`, 'utf8'));

function ringsFrom(gj, minArea) {
  const out = [];
  for (const f of gj.features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) for (const ring of poly) {
      // cheap reject: skip rings whose bbox misses ours entirely
      let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
      for (const [x, y] of ring) { if (x<mnx)mnx=x; if (x>mxx)mxx=x; if (y<mny)mny=y; if (y>mxy)mxy=y; }
      if (mxx < BBOX.w || mnx > BBOX.e || mxy < BBOX.s || mny > BBOX.n) continue;
      const c = clipRing(ring);
      if (c.length >= 4 && areaOf(c) >= minArea) out.push(c);
    }
  }
  return out;
}

console.log('reading Natural Earth 10m…');
const landRings  = ringsFrom(load('ne_10m_land'), 0.0004);      // ~5 km² floor
const lakeRings  = ringsFrom(load('ne_10m_lakes'), 0.002);

// Admin outlines, used ONLY as a visual emphasis mask (India in colour, neighbours blank).
// !! Natural Earth's depiction of J&K, Aksai Chin and Arunachal does NOT necessarily match
// !! Survey of India. This layer must be replaced with SOI geometry before any India
// !! release — see docs/00-plan.md §5. The terrain layers carry no boundary at all.
const admin = load('ne_10m_admin_0_countries');
const nameOf = f => f.properties?.NAME || '';
const adminRings = (pred, minArea) => {
  const out = [];
  for (const f of admin.features) {
    if (!pred(nameOf(f))) continue;
    const g = f.geometry; if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const ring of poly) {
      let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
      for (const [x,y] of ring){if(x<mnx)mnx=x;if(x>mxx)mxx=x;if(y<mny)mny=y;if(y>mxy)mxy=y;}
      if (mxx < BBOX.w || mnx > BBOX.e || mxy < BBOX.s || mny > BBOX.n) continue;
      const c = clipRing(ring);
      if (c.length >= 4 && areaOf(c) >= minArea) out.push(c);
    }
  }
  return out;
};
const indiaRings     = adminRings(n => n === 'India', 0.0002);
const neighbourRings = adminRings(n => n !== 'India', 0.004);
console.log(`admin: ${indiaRings.length} India rings · ${neighbourRings.length} neighbour rings`);

const riversGJ = load('ne_10m_rivers_lake_centerlines');
const rivers = [];
for (const f of riversGJ.features) {
  const g = f.geometry; if (!g) continue;
  const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
  const rank = f.properties?.scalerank ?? 10;
  const name = f.properties?.name ?? null;
  for (const l of lines) for (const seg of clipLine(l)) if (seg.length > 1) rivers.push({ rank, name, pts: seg });
}

console.log(`clipped: ${landRings.length} land rings · ${lakeRings.length} lakes · ${rivers.length} river segments`);

// ---------- build LODs ----------
const out = { bbox: BBOX, quant: QMAX, note: 'Natural Earth 10m (public domain). LAND polygons only — no political boundaries. See docs/09-procedural-map.md.', lods: {} };
console.log('\nlvl   tol°     land pts   river pts   lake pts  india pts      bytes');
console.log('-'.repeat(72));
for (const { level, tol } of LODS) {
  const land   = landRings.map(r => simplify(r, tol)).filter(r => r.length >= 4);
  const india  = indiaRings.map(r => simplify(r, tol)).filter(r => r.length >= 4);
  const neigh  = neighbourRings.map(r => simplify(r, tol)).filter(r => r.length >= 4);
  const lakes  = lakeRings.map(r => simplify(r, tol)).filter(r => r.length >= 4);
  const rivs   = rivers
    .filter(r => r.rank <= 4 + level * 2)                   // fewer rivers when zoomed out
    .map(r => ({ rank: r.rank, name: r.name, pts: simplify(r.pts, tol) }))
    .filter(r => r.pts.length > 1);
  const ip = india.reduce((s, r) => s + r.length, 0);
  const lp = land.reduce((s, r) => s + r.length, 0);
  const rp = rivs.reduce((s, r) => s + r.pts.length, 0);
  const kp = lakes.reduce((s, r) => s + r.length, 0);
  out.lods[level] = {
    land:   land.map(quantise),
    india:  india.map(quantise),
    neigh:  neigh.map(quantise),
    lakes:  lakes.map(quantise),
    rivers: rivs.map(r => ({ r: r.rank, n: r.name, p: quantise(r.pts) })),
  };
  const bytes = (lp + rp + kp) * 4;                          // 2 × uint16
  console.log(
    String(level).padEnd(6) + String(tol).padEnd(9) +
    lp.toLocaleString().padStart(9) + rp.toLocaleString().padStart(12) +
    kp.toLocaleString().padStart(11) + ip.toLocaleString().padStart(10) + (bytes/1024).toFixed(1).padStart(11) + ' KB'
  );
}

mkdirSync('data/skeleton', { recursive: true });
writeFileSync('data/skeleton/india-skeleton.json', JSON.stringify(out));
const size = readFileSync('data/skeleton/india-skeleton.json').length;
console.log(`\nwrote data/skeleton/india-skeleton.json — ${(size/1024).toFixed(0)} KB raw JSON`);
