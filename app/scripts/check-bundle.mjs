#!/usr/bin/env node
/*
 * Bundle budget.
 *
 * The app is for people on 2G connections and four-year-old handsets. At a
 * realistic 2G throughput of around 35 kB/s, every 35 kB in the first load is
 * another second of blank screen — so the budget is expressed in what actually
 * crosses the wire, gzipped, and the first load is budgeted separately from
 * everything that can arrive later.
 *
 * Before route splitting the whole app was one 606 kB chunk, 146 kB gzipped:
 * roughly eight seconds before anything appeared, most of it code the person
 * opening Sarathi would never run. Splitting halved the entry. The budget is
 * set a little above where that landed, so a regression is caught while it is
 * still one commit rather than after six.
 *
 * Run: npm run check:bundle (after a build)
 */

import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../dist', import.meta.url).pathname
const KB = 1024

/** Everything in kB, gzipped where gzip is what the server would send. */
const BUDGET = {
  /** The JavaScript needed before anything renders. */
  entryJs: 85,
  /** The stylesheet that comes with it. */
  entryCss: 9,
  /** Entry JS + entry CSS + the two faces that ship in the shell. */
  firstLoad: 210,
  /** Any one route's chunk. A single fat route is a single slow screen. */
  routeChunk: 45,
  /** Everything, for the offline cache the service worker fills. */
  total: 520,
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else out.push(path)
  }
  return out
}

/** woff2 and images are already compressed; gzipping them again measures nothing. */
const PRECOMPRESSED = /\.(woff2?|png|jpg|jpeg|webp|avif|gif|ico)$/

function transferSize(path) {
  const raw = readFileSync(path)
  return PRECOMPRESSED.test(path) ? raw.length : gzipSync(raw, { level: 9 }).length
}

let files
try {
  files = walk(DIST)
} catch {
  console.error('\n✗ No dist/. Run `npm run build` first.\n')
  process.exit(1)
}

const assets = files.map((path) => ({
  path,
  name: path.slice(DIST.length + 1),
  size: transferSize(path),
}))

const entryJs = assets.filter((a) => /assets\/index-[^/]+\.js$/.test(a.name))
const entryCss = assets.filter((a) => /assets\/index-[^/]+\.css$/.test(a.name))
const fonts = assets.filter((a) => /\.woff2$/.test(a.name))
const chunks = assets.filter((a) => /\.js$/.test(a.name) && !entryJs.includes(a))

const sum = (list) => list.reduce((n, a) => n + a.size, 0)
const kb = (n) => (n / KB).toFixed(1)

const firstLoad = sum(entryJs) + sum(entryCss) + sum(fonts)
const total = sum(assets)
const worstChunk = chunks.sort((a, b) => b.size - a.size)[0]

const results = [
  ['entry JavaScript', sum(entryJs), BUDGET.entryJs],
  ['entry stylesheet', sum(entryCss), BUDGET.entryCss],
  ['first load (entry + shell fonts)', firstLoad, BUDGET.firstLoad],
  [`largest route chunk (${worstChunk?.name ?? 'none'})`, worstChunk?.size ?? 0, BUDGET.routeChunk],
  ['everything', total, BUDGET.total],
]

let failed = false
console.log('\nBundle budget — transfer size, gzipped\n')
for (const [label, size, budget] of results) {
  const over = size > budget * KB
  failed = failed || over
  const headroom = ((budget * KB - size) / KB).toFixed(1)
  console.log(
    `  ${over ? '✗' : '✓'} ${label.padEnd(38)} ${kb(size).padStart(7)} kB` +
    `  / ${String(budget).padStart(4)} kB` +
    `  ${over ? `over by ${(-headroom).toFixed(1)} kB` : `${headroom} kB spare`}`,
  )
}

/* At 2G throughput the first load is the number that decides whether somebody
   sees anything at all, so it is said in seconds as well as kilobytes. */
const TWO_G_KBPS = 35
console.log(
  `\n  ${(firstLoad / KB / TWO_G_KBPS).toFixed(1)}s to first paint at ${TWO_G_KBPS} kB/s, ` +
  `before the handset has parsed a byte of it.`,
)
console.log(`  ${chunks.length} route chunks, fetched when their screen is opened.\n`)

if (failed) {
  console.error(
    'Over budget. This is the phase where the glass and the mesh get cut if they do\n' +
    'not survive — and the same applies to anything else that grew. Find what got\n' +
    'bigger before raising the number.\n',
  )
  process.exit(1)
}
console.log('✓ within budget.\n')
