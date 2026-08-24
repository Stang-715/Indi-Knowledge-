#!/usr/bin/env node
// The scale ladder: a quadtree pyramid over India, from whole-nation down to kerbstone.
// Level L has (256 * 2^L) pixels across a square canvas of SIDE_KM.

const SIDE_KM = 3440;          // square canvas covering India's bbox incl. Andaman & Lakshadweep
const VIC3_M_PER_PX = 4860;    // Victoria 3 at India's latitudes (see density-calc.mjs)

const RUNGS = [
  { L: 0,  name: 'Subcontinent',  unit: 'Nation',            count: 1 },
  { L: 1,  name: 'Region',        unit: 'Presidency/Region', count: 8 },
  { L: 2,  name: 'State',         unit: 'State / UT',        count: 36 },
  { L: 3,  name: 'Division',      unit: 'Division',          count: 102 },
  { L: 4,  name: 'District',      unit: 'District',          count: 780 },
  { L: 5,  name: 'Tehsil',        unit: 'Tehsil / taluk',    count: 5924 },
  { L: 6,  name: 'Block',         unit: 'Block',             count: 6500 },
  { L: 7,  name: 'Panchayat',     unit: 'Gram panchayat',    count: 255000 },
  { L: 8,  name: 'Settlement',    unit: 'Village / town',    count: 648802 },
  { L: 9,  name: 'Approach',      unit: '(city outline)',    count: null },
  { L: 10, name: 'Cityscape',     unit: 'City',              count: 4041 },
  { L: 11, name: 'Ward',          unit: 'Municipal ward',    count: 90000 },
  { L: 12, name: 'Neighbourhood', unit: 'Locality',          count: 400000 },
  { L: 13, name: 'Block face',    unit: 'Street block',      count: null },
  { L: 14, name: 'Street',        unit: 'Street segment',    count: null },
  { L: 15, name: 'Plot',          unit: 'Parcel',            count: null },
  { L: 16, name: 'Kerb',          unit: 'Building',          count: 24000000 },
];

const f = (x, d = 0) => x == null ? '—' : x.toLocaleString('en-US', { maximumFractionDigits: d });
const res = L => SIDE_KM * 1000 / (256 * 2 ** L);

console.log('L   name            px across      m/px        tile span   vs Vic3 (area)   canonical unit          count');
console.log('-'.repeat(112));
for (const r of RUNGS) {
  const px = 256 * 2 ** r.L;
  const m = res(r.L);
  const tileSpanM = m * 256;                       // one 256px tile covers this much ground
  const mult = (VIC3_M_PER_PX / m) ** 2;
  const span = tileSpanM >= 1000 ? `${f(tileSpanM/1000,1)} km` : `${f(tileSpanM)} m`;
  console.log(
    String(r.L).padEnd(4) +
    r.name.padEnd(16) +
    f(px).padStart(10) +
    (m >= 1000 ? `${f(m/1000,2)} km` : `${f(m,2)} m`).padStart(12) +
    span.padStart(12) +
    (mult >= 1e6 ? `${f(mult/1e6,1)}M x` : `${f(mult)}x`).padStart(17) +
    '   ' + r.unit.padEnd(22) +
    f(r.count).padStart(12)
  );
}

console.log('\nVictoria 3 sits at %s m/px — between L%d and L%d.',
  f(VIC3_M_PER_PX), 1, 2);

console.log('\n--- If a rung were rasterised as one image over the whole canvas ---');
for (const L of [4, 8, 12, 16]) {
  const px = 256 * 2 ** L;
  const bytes = px * px * 2;   // RG8, 16-bit id
  const unit = bytes > 1e12 ? `${f(bytes/1e12,1)} TB` : bytes > 1e9 ? `${f(bytes/1e9,1)} GB` : `${f(bytes/1e6)} MB`;
  console.log(`L${String(L).padStart(2)}  ${f(px)}^2 px = ${f(px*px/1e9,1)} Gpx  ->  ${unit}`);
}

console.log('\n--- Streaming budget: what actually ships per view ---');
const VIEWPORT_TILES = 12;      // ~1600x1000 viewport at 256px tiles, plus one prefetch ring
for (const [label, kb] of [['vector tile (admin)', 18], ['vector tile (streets)', 60], ['vector tile (buildings)', 140], ['terrain KTX2', 44]]) {
  console.log(`${label.padEnd(26)} ${String(kb).padStart(4)} KB x ${VIEWPORT_TILES} tiles = ${f(kb*VIEWPORT_TILES/1024,2)} MB per screen`);
}
