#!/usr/bin/env node
// Packs one LOD of the skeleton + the orography into a base64 blob the renderer can
// inline. Artifacts cannot fetch external hosts (CSP), so the demo carries its data.
import { readFileSync, writeFileSync } from 'node:fs';

const LOD = Number(process.argv[2] ?? 4);
const sk = JSON.parse(readFileSync('data/skeleton/india-skeleton.json', 'utf8'));
const oro = JSON.parse(readFileSync('data/skeleton/orography.json', 'utf8'));
const L = sk.lods[LOD];

// layout: [count][len,pts...] per feature class
function pack(rings) {
  let n = 1; for (const r of rings) n += 1 + r.length;
  const a = new Uint16Array(n); let i = 0;
  a[i++] = rings.length;
  for (const r of rings) { a[i++] = r.length / 2; for (const v of r) a[i++] = v; }
  return a;
}
const land   = pack(L.land);
const india  = pack(L.india);
const neigh  = pack(L.neigh);
const lakes  = pack(L.lakes);
const rivers = pack(L.rivers.map(r => r.p));
const ranks  = Uint16Array.from(L.rivers.map(r => r.r));

const b64 = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const blob = {
  bbox: sk.bbox, lod: LOD,
  land: b64(land), india: b64(india), neigh: b64(neigh),
  lakes: b64(lakes), rivers: b64(rivers), riverRanks: b64(ranks),
  oro,
};
const js = JSON.stringify(blob);
writeFileSync('data/skeleton/bundle.json', js);
console.log(`LOD ${LOD} bundle: ${(js.length/1024).toFixed(1)} KB`);
console.log(`  land   ${L.land.length} rings, ${land.length*2/1024|0} KB packed`);
console.log(`  rivers ${L.rivers.length} lines, ${rivers.length*2/1024|0} KB packed`);
console.log(`  india  ${L.india.length} rings, ${india.length*2/1024|0} KB packed`);
console.log(`  lakes  ${L.lakes.length} rings`);
