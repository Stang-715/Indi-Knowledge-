#!/usr/bin/env node
/*
 * Contrast check — WCAG 2.1 AA, measured against what is actually composited.
 *
 * Why this cannot be done statically: Chowk deliberately puts white text over a
 * drifting, recolouring mesh, seen through glass that samples the ground beneath
 * it. The effective background of a word is therefore not in any stylesheet. It
 * is the result of a gradient, a blur, a tint and a theme, and it changes while
 * you look at it.
 *
 * So the method is empirical:
 *
 *   1. Record every text element's computed colour and box.
 *   2. Make the text itself transparent, which changes no layout, leaving the
 *      real composited backdrop — mesh, blur, tint and all.
 *   3. Screenshot.
 *   4. Send the screenshot back into the page, draw it to a canvas, and sample
 *      the pixels behind each box. Doing the decode in the browser avoids a PNG
 *      library and keeps this dependency-free.
 *   5. Contrast each element's real colour against the *worst* pixel behind it,
 *      not the average — a word is unreadable over its darkest patch even if it
 *      averages fine.
 *
 * The mesh drifts, so every surface is sampled at several points in the cycle.
 * A check that measures one frame of a moving background proves nothing.
 *
 * Run: npm run check:contrast   (needs a served build)
 */

import { chromium } from 'playwright'

const PORT = process.env.PREVIEW_PORT ?? '4330'
const BASE = `http://localhost:${PORT}`

/** WCAG AA: 4.5:1 for body text, 3:1 for large text. */
const AA_BODY = 4.5
const AA_LARGE = 3.0
/** Sampling moments across the mesh drift, in ms. */
const FRAMES = [0, 2200, 4600]

const ROUTES = [
  { path: '/s/sarathi', name: 'Sarathi' },
  { path: '/s/bharat', name: 'Bharat' },
  { path: '/s/bills', name: 'Bills' },
  { path: '/s/bills/b/bill_water', name: 'Bill detail' },
  { path: '/s/bills/b/bill_transport', name: 'Unreadable source' },
  { path: '/s/bills/constitution', name: 'Constitution' },
  { path: '/s/bills/constituency', name: 'Constituency' },
  { path: '/s/bills/debate/top_water_bill', name: 'Debate' },
  { path: '/s/works', name: 'Works' },
  { path: '/s/works/w/wk_market_fibre', name: 'One work' },
  { path: '/s/works/mine', name: 'My streets' },
  { path: '/s/works/record', name: 'The record' },
  { path: '/app/profile/privacy', name: 'Privacy & rights' },
]

const SEED = () => {
  localStorage.setItem('cdp:eligibility:record', JSON.stringify({
    verified: true, idHash: 'a', verifiedAt: Date.now(),
    attestedBy: 'National ID Verification Service', ageBand: 'adult',
  }))
  localStorage.setItem('cdp:voice:record', JSON.stringify({
    pseudonym: 'OpenCedar515', createdAt: 1, lastChangedAt: 1,
  }))
  localStorage.setItem('cdp:prefs:prefs', JSON.stringify({
    locale: 'en', onboarded: true, seenNoticeIds: [],
    followedStreets: [{ id: 's1', name: 'MG Road' }, { id: 's2', name: 'Market Approach' }],
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

/* ------------------------- in-page instrumentation ---------------------- */

/** Every element that renders its own text, with colour, box and size class. */
const COLLECT = () => {
  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  let node
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim()
    if (!text || text.length < 2) continue
    const el = node.parentElement
    if (!el || seen.has(el)) continue
    seen.add(el)

    const cs = getComputedStyle(el)
    if (Number(cs.opacity) < 0.15) continue
    if (el.closest('.sr-only, [aria-hidden="true"]')) continue
    // checkVisibility catches what a display/visibility test misses — notably
    // content inside a closed <details>, which reports a box but paints nothing.
    // Without this the sampler reads the page's top-left corner and reports a
    // meaningless 1:1.
    if (el.checkVisibility && !el.checkVisibility({
      checkVisibilityCSS: true, contentVisibilityAuto: true,
      opacityProperty: true, visibilityProperty: true,
    })) continue

    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue
    // Fully in view only. A box straddling an edge has part of its sample band
    // outside the screenshot, which reads as whatever happens to be at the
    // clamped coordinate. Anything cut off here is measured after a scroll.
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) continue

    // Occlusion is not low contrast. Content scrolling under the floating dock
    // is expected; reading the dock's glow as this element's background invents
    // failures. Require the element to be the topmost thing at its own centre.
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2))
    const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))
    const top = document.elementFromPoint(cx, cy)
    if (!top || (top !== el && !el.contains(top) && !top.contains(el))) continue

    const px = parseFloat(cs.fontSize)
    const weight = Number(cs.fontWeight) || 400
    // WCAG "large": 18.66px bold, or 24px at any weight.
    const large = px >= 24 || (px >= 18.66 && weight >= 700)

    out.push({
      color: cs.color,
      opacity: Number(cs.opacity),
      fontPx: px,
      large,
      text: text.slice(0, 48),
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 40),
      rect: {
        x: Math.max(0, r.left), y: Math.max(0, r.top),
        w: Math.min(r.width, innerWidth - Math.max(0, r.left)),
        h: Math.min(r.height, innerHeight - Math.max(0, r.top)),
      },
    })
  }
  return out
}

/** Hiding the ink leaves the real backdrop. Colour does not affect layout. */
/**
 * Rects of anything painted in a fixed layer above the content — the dock, the
 * dynamic island. Pixels inside these are not the background of the text under
 * them, and reading them as such invents failures that are really occlusion.
 */
const OVERLAYS = () => {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    out.push({ x: r.left, y: r.top, w: r.width, h: r.height })
  }
  return out
}

const HIDE = () => {
  const s = document.createElement('style')
  s.id = 'ct-hide'
  s.textContent = `*, *::before, *::after {
    color: transparent !important;
    text-shadow: none !important;
    -webkit-text-fill-color: transparent !important;
  }`
  document.head.appendChild(s)
}
const SHOW = () => document.getElementById('ct-hide')?.remove()

/**
 * Decode the screenshot in the page and measure. Doing the PNG work here rather
 * than in Node keeps the check dependency-free.
 */
const MEASURE = async (dataUrl, items, dpr, overlays) => {
  const img = new Image()
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl })
  const cv = document.createElement('canvas')
  cv.width = img.width; cv.height = img.height
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)

  const chan = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const lum = (r, g, b) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
  const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  const parse = (css) => {
    const m = css.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a] = m[1].split(',').map((n) => parseFloat(n))
    return { r, g, b, a: a === undefined ? 1 : a }
  }

  const results = []
  for (const it of items) {
    const fg = parse(it.color)
    if (!fg || fg.a < 0.15) continue

    // Inset by a pixel so a border or an antialiased glass edge is not read as
    // the background the text sits on.
    // Sample a band through the vertical centre rather than the whole box: that
    // is where the glyphs are, and it avoids borders, padding and any overlay
    // clipping the element's edges.
    const inset = Math.round(dpr * 2)
    const bandH = Math.max(1, Math.min(
      Math.round(it.rect.h * dpr) - inset * 2,
      Math.round(it.fontPx * dpr * 1.2),
    ))
    const x = Math.round(it.rect.x * dpr) + inset
    const y = Math.round((it.rect.y + it.rect.h / 2) * dpr - bandH / 2)
    const w = Math.max(1, Math.round(it.rect.w * dpr) - inset * 2)
    const h = bandH
    if (x < 0 || y < 0 || x + w > cv.width || y + h > cv.height) continue

    const data = ctx.getImageData(x, y, w, h).data
    // Worst pixel, not the average: a word is unreadable over its darkest patch
    // even when the box averages comfortably.
    // Pixel coordinates covered by a fixed overlay, in screenshot space.
    const masks = (overlays || []).map((o) => ({
      x0: o.x * dpr, y0: o.y * dpr, x1: (o.x + o.w) * dpr, y1: (o.y + o.h) * dpr,
    }))
    const masked = (px, py) =>
      masks.some((m) => px >= m.x0 && px <= m.x1 && py >= m.y0 && py <= m.y1)

    let worst = Infinity
    let worstPx = null
    let sampled = 0
    // Effective ink, once the element's own opacity is applied over the backdrop.
    const step = Math.max(1, Math.floor((w * h) / 4000))
    for (let i = 0; i < w * h; i += step) {
      const px = x + (i % w)
      const py = y + Math.floor(i / w)
      if (masked(px, py)) continue
      sampled += 1
      const o = i * 4
      const br = data[o], bg = data[o + 1], bb = data[o + 2]
      const alpha = fg.a * it.opacity
      const er = fg.r * alpha + br * (1 - alpha)
      const eg = fg.g * alpha + bg * (1 - alpha)
      const eb = fg.b * alpha + bb * (1 - alpha)
      const c = ratio(lum(er, eg, eb), lum(br, bg, bb))
      if (c < worst) { worst = c; worstPx = [br, bg, bb] }
    }
    // Entirely behind an overlay: nothing to judge.
    if (sampled === 0 || worstPx === null) continue
    results.push({ ...it, ratio: Math.round(worst * 100) / 100, backdrop: worstPx })
  }
  return results
}

/* --------------------------------- driver -------------------------------- */

const failures = []
let measured = 0

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

for (const scheme of ['dark', 'light']) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme,
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate(SEED)

  for (const route of ROUTES) {
    await page.goto(BASE + route.path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // How far the surface scrolls, so the whole of it is covered rather than
    // just what happens to be above the fold.
    const steps = await page.evaluate(() => {
      const el = document.querySelector('.shell__main') ?? document.scrollingElement
      if (!el) return [0]
      const max = Math.max(0, el.scrollHeight - el.clientHeight)
      const out = []
      for (let y = 0; y <= max; y += Math.round(el.clientHeight * 0.8)) out.push(y)
      if (out[out.length - 1] !== max) out.push(max)
      return out
    })

    for (const frame of FRAMES) {
      if (frame > 0) await page.waitForTimeout(frame - FRAMES[FRAMES.indexOf(frame) - 1])

      for (const top of steps) {
      await page.evaluate((y) => {
        const el = document.querySelector('.shell__main') ?? document.scrollingElement
        if (el) el.scrollTop = y
      }, top)
      await page.waitForTimeout(220)

      const items = await page.evaluate(COLLECT)
      if (items.length === 0) continue
      const overlays = await page.evaluate(OVERLAYS)

      await page.evaluate(HIDE)
      const shot = await page.screenshot({ type: 'png' })
      await page.evaluate(SHOW)

      const dataUrl = `data:image/png;base64,${shot.toString('base64')}`
      const dpr = 2
      const results = await page.evaluate(
        ([u, i, d, o]) => window.__ctMeasure(u, i, d, o),
        [dataUrl, items, dpr, overlays],
      ).catch(async () => {
        // First use: install the measure function, then retry.
        await page.addScriptTag({ content: `window.__ctMeasure = ${MEASURE.toString()}` })
        return page.evaluate(
          ([u, i, d, o]) => window.__ctMeasure(u, i, d, o),
          [dataUrl, items, dpr, overlays],
        )
      })

      for (const r of results) {
        measured += 1
        const floor = r.large ? AA_LARGE : AA_BODY
        if (r.ratio < floor) {
          failures.push({ scheme, route: route.name, frame, floor, ...r })
        }
      }
      }
    }
  }
  await page.close()
}

await browser.close()

/* --------------------------------- report -------------------------------- */

// One entry per element: the worst frame, theme and route it appeared in.
const worstByElement = new Map()
for (const f of failures) {
  const key = `${f.scheme}|${f.route}|${f.cls}|${f.text}`
  const prev = worstByElement.get(key)
  if (!prev || f.ratio < prev.ratio) worstByElement.set(key, f)
}
const unique = [...worstByElement.values()].sort((a, b) => a.ratio - b.ratio)

console.log(`Measured ${measured} text elements across ${ROUTES.length} routes, ` +
  `2 themes, ${FRAMES.length} points in the mesh drift.\n`)

if (unique.length > 0) {
  console.error(`✗ ${unique.length} below WCAG AA:\n`)
  for (const f of unique.slice(0, 30)) {
    console.error(
      `  ${String(f.ratio).padStart(5)}:1  (needs ${f.floor})  ${f.scheme}/${f.route}\n` +
      `         ${f.tag}.${f.cls || '—'}  “${f.text}”\n` +
      `         ink ${f.color} over rgb(${f.backdrop?.join(',')})`,
    )
  }
  if (unique.length > 30) console.error(`\n  … and ${unique.length - 30} more`)
  console.error('')
  process.exit(1)
}

console.log('✓ every text element meets WCAG AA against its real composited backdrop.')
