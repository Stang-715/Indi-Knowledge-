#!/usr/bin/env node
/**
 * The determinism guard.
 *
 * `packages/sim` must be deterministic and headless: same seed plus same decision
 * log equals the same world, on every machine, forever. That is the rule the whole
 * save/multiplayer/replay design rests on (docs/10-buildplan.md Part A.3).
 *
 * This script greps the sim and worldgen packages for the things that break it.
 * It is written now, while the packages are nearly empty and it trivially passes.
 * Written later, it fails everywhere at once and gets disabled — which is how
 * every project that loses determinism loses it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

/** Patterns that make a run non-reproducible. */
const BANNED = [
  { re: /\bMath\.random\s*\(/,            why: 'Math.random() — use the seeded Rng' },
  { re: /\bDate\.now\s*\(/,               why: 'Date.now() — the sim has no wall clock' },
  { re: /\bnew\s+Date\s*\(\s*\)/,         why: 'new Date() — the sim has no wall clock' },
  { re: /\bperformance\.now\s*\(/,        why: 'performance.now() — the sim has no wall clock' },
  { re: /\bprocess\.hrtime\b/,            why: 'process.hrtime — the sim has no wall clock' },
  { re: /\bcrypto\.randomUUID\s*\(/,      why: 'randomUUID() — ids must be derived, not drawn' },
  { re: /\bMath\.random\b/,               why: 'a reference to Math.random' },
];

/** Patterns that mean the headless boundary has been crossed. */
const HEADLESS = [
  { re: /\bdocument\./,                   why: 'DOM access — sim must not know a screen exists' },
  { re: /\bwindow\./,                     why: 'window access — sim must not know a screen exists' },
  { re: /\bcanvas\b/i,                    why: 'canvas — rendering belongs in render-*' },
  { re: /from\s+['"]node:fs['"]/,         why: 'filesystem access — sim takes data as arguments' },
];

/** Object key iteration order is stable in JS, but sorting is how we prove intent. */
const GUARDED = [
  { dir: 'packages/sim/src',      rules: [...BANNED, ...HEADLESS] },
  { dir: 'packages/worldgen/src', rules: [...BANNED, ...HEADLESS] },
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.js') || p.endsWith('.mjs')) out.push(p);
  }
  return out;
}

let violations = 0;
let scanned = 0;

for (const { dir, rules } of GUARDED) {
  const abs = join(ROOT, dir);
  for (const file of walk(abs)) {
    // The Rng is the one place allowed to talk about randomness, by name.
    const isRng = file.endsWith('rng.js');
    const lines = readFileSync(file, 'utf8').split('\n');
    scanned++;
    lines.forEach((line, i) => {
      // Skip comments — the rules are about code, and this file's own docs mention them.
      const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
      for (const { re, why } of rules) {
        if (isRng && /random/i.test(why)) continue;
        if (re.test(code)) {
          console.error(`  ${relative(ROOT, file)}:${i + 1}  ${why}`);
          console.error(`    ${line.trim()}`);
          violations++;
        }
      }
    });
  }
}

if (violations > 0) {
  console.error(`\n✗ determinism guard: ${violations} violation(s) across ${scanned} file(s).`);
  console.error('  The sim must be reproducible from (datapack, seed, decision_log) alone.');
  process.exit(1);
}
console.log(`✓ determinism guard: ${scanned} file(s) clean.`);
