#!/usr/bin/env node
/**
 * The gap register.
 *
 * Where the timeline is thin, and by how much. Every number the phase plan
 * quotes comes from here, so the plan can be re-derived rather than believed.
 */
import { readFileSync } from 'node:fs';
const TL = JSON.parse(readFileSync(new URL('../data/timeline/timeline.json', import.meta.url), 'utf8'));
const fmt = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

const fired = TL.events.filter(e => e.scope !== 'prologue');

/* 1. Era density against the 20-minute rule. */
console.log('\n## Era density — the rule is one authored event per 20 minutes of play\n');
console.log('era                            hrs  events  min/evt  need');
let totalNeed = 0;
const eraNeed = [];
for (const era of TL.eras) {
  const n = fired.filter(e => e.era === era.id && e.scope === 'subcontinental').length;
  const minPer = n ? (era.hours * 60) / n : Infinity;
  const need = Math.max(0, Math.ceil((era.hours * 60) / 20) - n);
  totalNeed += need;
  eraNeed.push({ era: era.name, id: era.id, from: era.from, to: era.to, hours: era.hours, have: n, need });
  console.log(`${era.name.padEnd(30)}${String(era.hours).padStart(3)}  ${String(n).padStart(6)}  ${
    (minPer === Infinity ? '—' : minPer.toFixed(1)).padStart(7)}  ${String(need).padStart(4)}${need ? '' : '  ok'}`);
}
console.log(`\n  TOTAL SHORTFALL AGAINST THE DENSITY RULE: ${totalNeed} events`);

/* 2. Silent stretches — the longest runs with nothing at all. */
console.log('\n## Silent stretches over 60 years\n');
const years = [...new Set(fired.map(e => e.year))].sort((a, b) => a - b);
const gaps = [];
for (let i = 1; i < years.length; i++) {
  const g = years[i] - years[i - 1];
  if (g > 60) gaps.push({ from: years[i - 1], to: years[i], span: g });
}
gaps.sort((a, b) => b.span - a.span);
for (const g of gaps.slice(0, 14))
  console.log(`  ${String(g.span).padStart(4)} yr   ${fmt(g.from).padStart(9)} -> ${fmt(g.to)}`);
console.log(`  ${gaps.length} stretches over 60 years; ${gaps.filter(g=>g.span>120).length} over 120.`);

/* 3. Regional coverage. */
console.log('\n## Regional spines\n');
for (const r of TL.regions) {
  const evs = fired.filter(e => e.region === r.id);
  const span = evs.length ? `${fmt(Math.min(...evs.map(e=>e.year)))} – ${fmt(Math.max(...evs.map(e=>e.year)))}` : '—';
  console.log(`  ${r.name.padEnd(24)} ${String(evs.length).padStart(3)}   ${span}`);
}

/* 4. Class coverage against the targets in docs/07-timeline.md §1.3. */
const TARGET = { SITE:210, WORK:220, REFORM:150, FOUNDATION:140, TRANSITION:130, INVASION:95,
                 CATASTROPHE:80, TRADE:70, FRONTIER:60, CLIMATE:50, COLONIAL:30, EPOCH:16 };
console.log('\n## Class coverage against target\n');
let classNeed = 0;
for (const [cls, want] of Object.entries(TARGET)) {
  const have = fired.filter(e => e.class === cls).length;
  const short = Math.max(0, want - have);
  classNeed += short;
  console.log(`  ${cls.padEnd(13)} have ${String(have).padStart(3)}   want ${String(want).padStart(3)}   short ${String(short).padStart(3)}`);
}
console.log(`\n  TOTAL SHORTFALL AGAINST CLASS TARGETS: ${classNeed}`);

/* 5. The headline. */
console.log(`\n## Totals\n`);
console.log(`  written            ${fired.length}`);
console.log(`  target             1150`);
console.log(`  remaining          ${1150 - fired.length}`);
console.log(`  pre-1300 share     ${(fired.filter(e=>e.year<1300).length / fired.length * 100).toFixed(1)}%`);
console.log(`  disputed           ${fired.filter(e=>e.dispute).length}`);
console.log(`  authored cards     22`);
console.log('');

export { eraNeed };
