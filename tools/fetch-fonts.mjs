#!/usr/bin/env node
/**
 * Fetch exact-subset Indic fonts (phase 41).
 *
 * Google Fonts' css2 API accepts `text=` and returns a woff2 subset to
 * exactly those characters, which beats local subsetting: the files land in
 * data/fonts/ and are committed, so the build never needs the network. Run
 * again whenever the gazetteer's native names change; the budget check fails
 * the run if the total crosses 900 KB.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GAZ = JSON.parse(readFileSync(join(ROOT, 'data/gazetteer/places.json'), 'utf8'));

const FAMILY = {
  deva: 'Noto Serif Devanagari', taml: 'Noto Serif Tamil',
  mlym: 'Noto Serif Malayalam',  knda: 'Noto Serif Kannada',
  telu: 'Noto Serif Telugu',     beng: 'Noto Serif Bengali',
  orya: 'Noto Sans Oriya',       gujr: 'Noto Serif Gujarati',
  sinh: 'Noto Serif Sinhala',
};

const chars = new Map();
for (const p of GAZ.places) {
  if (!p.native) continue;
  if (!chars.has(p.script)) chars.set(p.script, new Set());
  for (const c of p.native) chars.get(p.script).add(c);
}

mkdirSync(join(ROOT, 'data/fonts'), { recursive: true });
const manifest = {};
let total = 0;
for (const [script, set] of chars) {
  const family = FAMILY[script];
  if (!family) { console.warn(`  ! no family for ${script}`); continue; }
  const text = [...set].sort().join('');
  const cssURL = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}` +
    `&text=${encodeURIComponent(text)}&display=swap`;
  const css = await (await fetch(cssURL, { headers: {
    // A modern UA gets woff2; the default gets ttf.
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  } })).text();
  // text=-subset responses serve from /l/font?kit=... (no .woff2 suffix), and
  // may split into several @font-face blocks by unicode-range.
  const faces = [...css.matchAll(/src: url\((https:[^)]+)\) format\('woff2'\);\s*\n\s*unicode-range: ([^;]+);/g)];
  if (!faces.length) { console.error(`  ✗ no woff2 for ${script}`); process.exitCode = 1; continue; }
  const parts = [];
  let bytes = 0;
  for (let i = 0; i < faces.length; i++) {
    const buf = Buffer.from(await (await fetch(faces[i][1])).arrayBuffer());
    const file = `data/fonts/${script}-${i}.woff2`;
    writeFileSync(join(ROOT, file), buf);
    parts.push({ file: `${script}-${i}.woff2`, range: faces[i][2].trim(), bytes: buf.length });
    bytes += buf.length;
  }
  manifest[script] = { family, bytes, chars: set.size, parts };
  total += bytes;
  console.log(`  ${script}  ${family}  ${set.size} chars  ${parts.length} part(s)  ${(bytes / 1024).toFixed(1)} KB`);
}
writeFileSync(join(ROOT, 'data/fonts/manifest.json'),
  JSON.stringify({ note: 'Exact-subset Indic fonts for the gazetteer’s native names. Regenerate with tools/fetch-fonts.mjs.', total, fonts: manifest }, null, 1));
console.log(`  total ${(total / 1024).toFixed(1)} KB` + (total > 900 * 1024 ? '  ✗ OVER BUDGET' : '  ✓ within 900 KB'));
if (total > 900 * 1024) process.exit(1);
