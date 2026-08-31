#!/usr/bin/env node
/*
 * Field conditions, in a browser: a slow connection and a slow processor.
 *
 * What this is, precisely: Chromium with its network throttled to 2G and its
 * CPU divided by six. What it is not: a four-year-old ₹8,000 Android handset.
 * A divided desktop core has a full desktop cache hierarchy, a desktop GPU and
 * no thermal ceiling, so it flatters anything limited by memory bandwidth or
 * sustained load — which is most of what actually hurts on a budget phone.
 * Treat a pass here as necessary and nowhere near sufficient; the plan asks for
 * a real handset and it means it (G-10-01).
 *
 * What it does catch, and catches cheaply: a screen that never paints, a route
 * that pulls megabytes before rendering, a main thread blocked long enough that
 * the first tap is dropped, and any regression in those.
 *
 * Run: npm run check:field (needs a served build, PREVIEW_PORT or 4340)
 */

import { chromium } from 'playwright'

const PORT = process.env.PREVIEW_PORT ?? '4340'
const BASE = `http://localhost:${PORT}`

/** Roughly 2G: throughput, and the latency that actually does the damage. */
const NETWORK = {
  offline: false,
  downloadThroughput: 35 * 1024,
  uploadThroughput: 20 * 1024,
  latency: 400,
}
const CPU_DIVISOR = 6

const ROUTES = [
  { path: '/s/sarathi', name: 'Sarathi' },
  { path: '/s/bills', name: 'Bills' },
  { path: '/s/works', name: 'Works' },
  { path: '/s/bharat', name: 'Bharat' },
]

/** Seconds. Set above what the build measures, so a regression trips it. */
const BUDGET = {
  firstPaint: 9,
  /** The heading of the surface you asked for, actually on screen. */
  readable: 11,
  /** Milliseconds the main thread is blocked in one go. Above this a tap is lost. */
  longestTask: 550,
}

const SEED = () => {
  localStorage.setItem('cdp:eligibility:record', JSON.stringify({
    verified: true, idHash: 'a', verifiedAt: Date.now(),
    attestedBy: 'National ID Verification Service', ageBand: 'adult',
  }))
  localStorage.setItem('cdp:voice:record', JSON.stringify({
    pseudonym: 'OpenCedar515', createdAt: 1, lastChangedAt: 1,
  }))
  localStorage.setItem('cdp:prefs:prefs', JSON.stringify({
    locale: 'en', onboarded: true, seenNoticeIds: [], followedStreets: [],
    localities: [{ id: 'loc_w12', label: 'Ward 12', ward: 'W12', district: 'Pune', state: 'MH' }],
  }))
  localStorage.setItem('cdp:prefs:consent', JSON.stringify({
    version: 1, locale: 'en', decidedAt: Date.now(),
    decisions: Object.fromEntries(
      ['eligibility', 'pseudonym', 'locality', 'poll-response', 'public-speech',
        'reach-count', 'settings'].map((id) => [id, { decision: 'granted', at: Date.now() }]),
    ),
  }))
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
let failed = false

console.log(`\nField conditions — 2G (${NETWORK.downloadThroughput / 1024} kB/s, ` +
  `${NETWORK.latency}ms latency), CPU ÷ ${CPU_DIVISOR}\n`)

for (const route of ROUTES) {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  })
  /* The session is seeded by a script that runs before the app does, rather
     than by navigating once to set localStorage and navigating again.
     The first version did the latter, which warmed the HTTP cache before the
     throttling was switched on — every measurement was of a cache hit, and
     every route "passed" 2G in a second. A harness that cannot fail is not a
     harness. */
  await context.addInitScript(SEED)
  await context.addInitScript(() => {
    window.__longTasks = []
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__longTasks.push(e.duration)
      }).observe({ entryTypes: ['longtask'] })
    } catch { /* not supported; reported as zero rather than as a pass */ }
  })

  const page = await context.newPage()
  const client = await context.newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', NETWORK)
  await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_DIVISOR })
  // Nothing may be served from cache: the question is what a first visit costs.
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })

  const started = Date.now()

  await page.goto(`${BASE}${route.path}`, { waitUntil: 'commit' })

  let readable = null
  try {
    await page.waitForSelector('h1, .sar__name', { state: 'visible', timeout: 45_000 })
    readable = (Date.now() - started) / 1000
  } catch { /* left null; reported as a failure below */ }

  const paint = await page.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    return fcp ? fcp.startTime / 1000 : null
  })
  const longest = await page.evaluate(() => Math.max(0, ...(window.__longTasks ?? [])))
  const transferred = await page.evaluate(() => performance
    .getEntriesByType('resource')
    .reduce((n, e) => n + (e.transferSize || 0), 0))

  const over =
    readable === null
    || readable > BUDGET.readable
    || (paint !== null && paint > BUDGET.firstPaint)
    || longest > BUDGET.longestTask
  failed = failed || over

  console.log(
    `  ${over ? '✗' : '✓'} ${route.name.padEnd(9)}` +
    ` paint ${(paint ?? NaN).toFixed(1).padStart(5)}s` +
    `  readable ${readable === null ? ' never' : `${readable.toFixed(1).padStart(5)}s`}` +
    `  longest task ${String(Math.round(longest)).padStart(4)}ms` +
    `  ${(transferred / 1024).toFixed(0).padStart(4)} kB`,
  )

  await context.close()
}

/* ------------------------- the low-power path ---------------------------- *
 *
 * A tier that is never exercised is a tier that does not work. This asserts the
 * two expensive things actually stop: the mesh stops repainting, and no panel
 * is still compositing a blurred copy of the ground behind it.
 */

const lowContext = await browser.newContext({ viewport: { width: 360, height: 640 } })
await lowContext.addInitScript(SEED)
await lowContext.addInitScript(() => {
  const held = JSON.parse(localStorage.getItem('cdp:prefs:prefs') ?? '{}')
  localStorage.setItem('cdp:prefs:prefs', JSON.stringify({
    ...held,
    a11y: {
      textScale: 1, highContrast: false, reduceMotion: false, lowBandwidth: false,
      screenReaderMode: false, voiceOut: false, power: 'low',
    },
  }))
  // Count repaints of the mesh by counting the frames it asks for.
  window.__frames = 0
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => { window.__frames += 1; return raf(cb) }
})

/* Measured on Bills rather than Sarathi. The caricature has its own ambient
   motion and it stays — a few animated transforms on one SVG is not what makes
   a budget handset stutter, and the front door of the app going dead is a real
   cost against a small saving. What has to stop is the full-viewport canvas
   repaint, and this is the surface where that is the only thing moving. */
const lowPage = await lowContext.newPage()
await lowPage.goto(`${BASE}/s/bills`, { waitUntil: 'networkidle' })
await lowPage.waitForTimeout(2500)

const low = await lowPage.evaluate(() => {
  const blurred = [...document.querySelectorAll('.glass, .glass-dark')].filter((el) => {
    const filter = getComputedStyle(el).backdropFilter
    return filter && filter !== 'none'
  }).length
  return {
    tier: document.documentElement.dataset.power,
    blurred,
    panels: document.querySelectorAll('.glass, .glass-dark').length,
    frames: window.__frames ?? 0,
  }
})
await lowContext.close()

/* Two and a half seconds of an animating mesh is 150 frames. A handful is the
   app settling; a hundred is the gradient still running. */
const FRAME_CEILING = 40
const lowOk = low.tier === 'low' && low.blurred === 0 && low.frames < FRAME_CEILING
failed = failed || !lowOk

console.log(
  `\n  ${lowOk ? '✓' : '✗'} low power  tier "${low.tier}"` +
  `  ${low.blurred} of ${low.panels} panels still blurred` +
  `  ${low.frames} animation frames in 2.5s`,
)

await browser.close()

console.log(
  `\n  Budgets: paint ${BUDGET.firstPaint}s, readable ${BUDGET.readable}s, ` +
  `longest task ${BUDGET.longestTask}ms.`,
)
console.log(
  '  A pass here is a floor, not the exit criterion. That one needs a real\n' +
  '  handset and somebody who is not us — see G-10-01.\n',
)

if (failed) {
  console.error('✗ field conditions failed\n')
  process.exit(1)
}
console.log('✓ every surface paints and becomes readable within budget.\n')
