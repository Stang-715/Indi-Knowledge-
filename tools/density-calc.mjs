#!/usr/bin/env node
// Map-density calculator: Victoria 3 baseline vs. an India-only map.
// All assumptions are named constants so they can be challenged and re-run.

const KM_PER_DEG_LAT = 110.6;   // mean, WGS84
const KM_PER_DEG_LON = 111.32;  // at the equator

// ---- Victoria 3 baseline -------------------------------------------------
const VIC3 = {
  width: 8192, height: 4096,    // map_data/*.png, vanilla
  stateRegions: 617,            // dev diary #16
  provincesLow: 13000, provincesHigh: 40000, // conflicting public figures
  landKm2: 134_700_000,         // world land minus Antarctica (Vic3 omits it)
};

// Equirectangular: 8192 px over 360 deg of longitude.
const vicPxPerDeg = VIC3.width / 360;
const vicKmPerPxLat = KM_PER_DEG_LAT / (VIC3.height / 180);
const vicKmPerPxLonEq = KM_PER_DEG_LON / vicPxPerDeg;
// Longitudinal ground distance per pixel shrinks with cos(lat).
const kmPerPxLonAt = (lat) => vicKmPerPxLonEq * Math.cos(lat * Math.PI / 180);
const vicKm2PerPxAt = (lat) => vicKmPerPxLat * kmPerPxLonAt(lat);

const INDIA_MID_LAT = 23;
const VIC_KM2_PER_PX_INDIA = vicKm2PerPxAt(INDIA_MID_LAT);

// ---- India ---------------------------------------------------------------
const INDIA = {
  landKm2: 3_287_263,
  lonMin: 68.11, lonMax: 97.42,
  latMin: 6.75,  latMax: 37.10,
  units: [
    { name: 'State / UT',        n: 36 },
    { name: 'District',          n: 780 },
    { name: 'Tehsil / sub-dist', n: 5924 },
    { name: 'Village',           n: 640867 },
  ],
};
const dLon = INDIA.lonMax - INDIA.lonMin;
const dLat = INDIA.latMax - INDIA.latMin;
const bboxWidthKm  = dLon * KM_PER_DEG_LON * Math.cos(INDIA_MID_LAT * Math.PI / 180);
const bboxHeightKm = dLat * KM_PER_DEG_LAT;

const f = (x, d = 0) => x.toLocaleString('en-US', { maximumFractionDigits: d });

console.log('=== VICTORIA 3 BASELINE ===');
console.log(`raster              ${VIC3.width} x ${VIC3.height} = ${f(VIC3.width*VIC3.height/1e6,1)} Mpx`);
console.log(`px per degree       ${vicPxPerDeg.toFixed(2)}`);
console.log(`km/px (lat)         ${vicKmPerPxLat.toFixed(2)}`);
console.log(`km/px (lon @ 0N)    ${vicKmPerPxLonEq.toFixed(2)}`);
console.log(`km/px (lon @ 23N)   ${kmPerPxLonAt(23).toFixed(2)}`);
console.log(`km2/px @ 23N        ${VIC_KM2_PER_PX_INDIA.toFixed(1)}`);
const indiaPxInVic3 = INDIA.landKm2 / VIC_KM2_PER_PX_INDIA;
console.log(`India land in Vic3  ${f(indiaPxInVic3)} px  (a ${Math.round(Math.sqrt(indiaPxInVic3))} x ${Math.round(Math.sqrt(indiaPxInVic3))} square)`);
console.log(`avg state region    ${f(VIC3.landKm2 / VIC3.stateRegions)} km2  -> ${f(VIC3.landKm2/VIC3.stateRegions/VIC_KM2_PER_PX_INDIA)} px of map`);
console.log(`avg province        ${f(VIC3.landKm2 / VIC3.provincesHigh)} - ${f(VIC3.landKm2 / VIC3.provincesLow)} km2`);

// On-map footprint a Vic3 state region enjoys; use it as the parity target.
const PARITY_PX = (VIC3.landKm2 / VIC3.stateRegions) / VIC_KM2_PER_PX_INDIA;

console.log('\n=== INDIA BBOX ===');
console.log(`extent              ${dLon.toFixed(2)} deg lon x ${dLat.toFixed(2)} deg lat`);
console.log(`ground             ~${f(bboxWidthKm)} km x ${f(bboxHeightKm)} km`);

console.log('\n=== TIERS: resolution needed to give each unit Vic3 state-region presence ===');
console.log('unit              count     avg km2    m/px    raster over bbox        land px    vs Vic3');
for (const u of INDIA.units) {
  const avgKm2 = INDIA.landKm2 / u.n;
  const km2PerPx = avgKm2 / PARITY_PX;
  const kmPerPx = Math.sqrt(km2PerPx);
  const w = bboxWidthKm / kmPerPx, h = bboxHeightKm / kmPerPx;
  const landPx = INDIA.landKm2 / km2PerPx;
  console.log(
    u.name.padEnd(17) +
    f(u.n).padStart(8) +
    f(avgKm2).padStart(11) +
    f(kmPerPx * 1000).padStart(8) +
    `   ${f(w)} x ${f(h)}`.padEnd(24) +
    `${f(landPx/1e6,2)} Mpx`.padStart(12) +
    `${f(VIC_KM2_PER_PX_INDIA / km2PerPx)}x`.padStart(10)
  );
}

console.log('\n=== VRAM / PAYLOAD for a single ID raster over the India bbox ===');
for (const side of [1024, 2048, 4096, 8192, 16384]) {
  const kmPerPx = bboxWidthKm / side;
  const rg8 = side * side * 2 / 1024 / 1024;    // 16-bit unit ID, 2 bytes
  const rgba8 = side * side * 4 / 1024 / 1024;
  console.log(`${String(side).padStart(5)}^2  ${f(kmPerPx*1000).padStart(6)} m/px   RG8 ${f(rg8)} MB   RGBA8 ${f(rgba8)} MB   ${f(VIC_KM2_PER_PX_INDIA/(kmPerPx*kmPerPx))}x Vic3`);
}
