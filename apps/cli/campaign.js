#!/usr/bin/env node
/**
 * The campaign, played as text.
 *
 * This is Phase 5 — the gate (docs/10-buildplan.md). No map, no art, no music.
 * One question: when a book goes grey, does it land?
 *
 *   node packages/sim/src/cli.js                    a full campaign, idle
 *   node packages/sim/src/cli.js --seed=x --tend    with the corpus tended
 *   node packages/sim/src/cli.js --gate             the 1193 scenario, playable
 */
import { run } from '../../packages/sim/src/engine.js';
import { loadDatapack } from '../../packages/sim/host/datapack.js';
import { corpusSummary, worksAtRisk } from '../../packages/sim/src/corpus.js';
import { formatYear } from '../../packages/sim/src/clock.js';

const ROOT = new URL('../../', import.meta.url);
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const hit = argv.find(a => a.startsWith(`--${k}=`));
  return hit ? hit.split('=')[1] : d;
};
const has = (k) => argv.includes(`--${k}`);

const C = process.stdout.isTTY || has('color') ? {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,   grey: (s) => `\x1b[90m${s}\x1b[0m`,
  gold: (s) => `\x1b[33m${s}\x1b[0m`, red:  (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,  green:(s) => `\x1b[32m${s}\x1b[0m`,
} : { dim: s=>s, grey: s=>s, gold: s=>s, red: s=>s, bold: s=>s, green: s=>s };

const dp = loadDatapack(ROOT);
const seed = arg('seed', 'paramountcy');

/* ── Decision logs ──────────────────────────────────────────────────────── */

function tendedLog() {
  const d = [];
  for (let y = -3000; y < 1900; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1900; y +=  60) d.push({ year: y, action: 'train-scribe' });
  return d;
}

/**
 * The Aluvihare decision, offered to the player. Copy out, or don't.
 *
 * `maxCarriers` is the interesting dial. Sending a teacher costs grain and one
 * of the people keeping the corpus at home, so insuring a work that already sits
 * in four houses is a bad trade — measurably so. Insuring everything that is
 * genuinely thin is the play.
 */
function copyOutLog(state, atYear, destination, maxCarriers = 3) {
  const risk = worksAtRisk(state, 'home').filter(w => w.carriers <= maxCarriers);
  return risk.map((w, i) => ({
    year: atYear + i, action: 'send-teacher', work: w.id, destination,
  }));
}

/* ── The gate: 1193 ─────────────────────────────────────────────────────── */

function gate() {
  console.log(C.bold('\n  THE FIRST LOSS — 1193\n'));
  console.log(C.dim('  History is pre-routed. You can see it coming from 1000 CE.\n'));

  // Run to 1000 with the corpus tended, so there is something to lose.
  const base = tendedLog();
  const warn = run(dp, seed, base, { to: 1000 });

  const risk = worksAtRisk(warn, 'home');
  const sum = corpusSummary(warn);
  console.log(`  ${C.gold('1000 CE')}  ${sum.extant} works extant, ${C.grey(`${sum.lost} already lost`)}`);
  console.log(`            ${C.red(`${risk.length} exist in exactly one place.`)}\n`);
  for (const w of risk.slice(0, 8))
    console.log(`      ${C.red('◆')} ${w.title}  ${C.dim(`${w.carriers} carrier${w.carriers>1?'s':''}, all at home`)}`);
  if (risk.length > 8) console.log(C.dim(`      … and ${risk.length - 8} more\n`));

  console.log(C.dim('\n  Two centuries to decide. Copying costs grain and a teacher\'s life.\n'));

  // Two campaigns, identical but for one choice.
  const nothing = run(dp, seed, base, { to: 1250 });
  const saved   = run(dp, seed, [...base, ...copyOutLog(warn, 1050, 'tibet', 3)], { to: 1250 });

  const line = (label, s) => {
    const cs = corpusSummary(s);
    const cat = s.log.filter(l => l.kind === 'catastrophe' && l.year >= 1190 && l.year <= 1200);
    const lostHere = cat.reduce((n, l) => n + (l.lost ?? 0), 0);
    console.log(`  ${C.bold(label.padEnd(22))} ${String(cs.extant).padStart(3)} extant   ` +
                `${C.grey(String(cs.lost).padStart(3) + ' lost')}   ` +
                `${lostHere ? C.red(`${lostHere} burned in 1193`) : C.green('nothing burned in 1193')}`);
    return { cs, cat, lostHere };
  };

  console.log(C.bold('\n  1250 CE\n'));
  const a = line('You did nothing.', nothing);
  const b = line('You sent teachers.', saved);

  const burned = nothing.log.find(l => l.kind === 'catastrophe' && l.year >= 1190 && l.year <= 1200);
  if (burned?.casualties?.length) {
    console.log(C.grey('\n  Lost in the fire, and still in your ledger:\n'));
    for (const t of burned.casualties.slice(0, 10)) console.log(C.grey(`      ✕ ${t}`));
  }

  const delta = a.cs.lost - b.cs.lost;
  console.log(C.bold(`\n  ${delta} work${delta === 1 ? '' : 's'} survived because you moved ` +
                     `${delta === 1 ? 'it' : 'them'} 140 years early.\n`));
  console.log(C.dim('  You did not do it for 1193. You did it because a teacher asked to go.\n'));
}

/* ── A full campaign ────────────────────────────────────────────────────── */

function campaign() {
  const decisions = has('tend') ? tendedLog() : [];
  const t0 = Date.now();
  const s = run(dp, seed, decisions);
  const ms = Date.now() - t0;

  console.log(C.bold(`\n  PARAMOUNTCY — 6000 BCE to 1947`));
  console.log(C.dim(`  seed "${seed}"${has('tend') ? ', corpus tended' : ', idle'} · ` +
                    `${s.tick} ticks · ${ms} ms\n`));

  const show = new Set(['epoch', 'catastrophe', 'loss', 'goods', 'teacher']);
  let shown = 0;
  const limit = parseInt(arg('lines', '46'), 10);
  const step = Math.max(1, Math.ceil(s.log.filter(l => show.has(l.kind)).length / limit));
  let i = 0;
  for (const l of s.log) {
    if (!show.has(l.kind)) continue;
    if (l.kind !== 'catastrophe' && l.kind !== 'epoch' && (i++ % step)) continue;
    const y = formatYear(l.year).padStart(9);
    const paint = l.kind === 'loss' ? C.grey
                : l.kind === 'catastrophe' ? C.red
                : l.kind === 'epoch' ? C.gold : C.dim;
    console.log(`  ${C.dim(y)}  ${paint(l.text)}`);
    if (++shown > limit + 12) break;
  }

  const cs = corpusSummary(s);
  console.log(C.bold('\n  1947\n'));
  console.log(`    corpus        ${C.green(cs.extant + ' extant')}  ${C.grey(cs.lost + ' lost')}  of ${cs.total}`);
  console.log(`    events fired  ${s.stats.eventsFired}`);
  console.log(`    copied        ${s.stats.worksCopied}   teachers sent ${s.stats.teachersSent}`);
  console.log(`    grain         ${Math.round(s.grain)}   coin ${Math.round(s.coin)}`);
  console.log(`    farmers       ${Math.round(s.pops.farmers).toLocaleString()}   reciters ${s.pops.reciters}   scribes ${s.pops.scribes}`);
  console.log(`    pillars       ${Object.entries(s.pillars)
    .map(([k, v]) => `${k.slice(0,4).toLowerCase()} ${Math.round(v)}`).join('  ')}`);
  console.log(C.dim(`\n    fingerprint   ${hash(s.fingerprint)}\n`));
}

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

if (has('gate')) gate(); else campaign();
