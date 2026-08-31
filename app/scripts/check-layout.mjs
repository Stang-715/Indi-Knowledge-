#!/usr/bin/env node
/*
 * Layout check — the pseudo-locale pass, in a browser.
 *
 * The static checks cannot see a layout that only fits because English is
 * short. This one runs every built surface in the pseudo-locale at the largest
 * text scale and fails if anything escapes the viewport, because the shell's
 * overflow:hidden turns that failure into a silent one.
 *
 * It checked one route until Surface 3 landed, which meant a new surface could
 * ship having never been measured at 160% in a language 40% longer than
 * English. Every route a citizen can reach is in the list below now.
 *
 * Needs a served build:
 *   npm run build && npx vite preview --port 4320 &
 *   node scripts/check-layout.mjs
 *
 * Not part of `npm test`, which must stay fast and offline; this belongs in the
 * pre-release pass alongside the screen-reader and contrast checks.
 */

import { chromium } from 'playwright'

/** Port of the served build. Override with PREVIEW_PORT when it differs. */
const PORT = process.env.PREVIEW_PORT ?? '4320'
const BASE = `http://localhost:${PORT}`
const D='/tmp/claude-0/-home-user-Indi-Knowledge-/7454615a-3621-576f-bc63-a893c88c0483/scratchpad'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:'dark' })
const errs=[]; p.on('pageerror',e=>errs.push('ERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())})
await p.goto(`${BASE}/`)
await p.evaluate(()=>{
  localStorage.setItem('cdp:eligibility:record',JSON.stringify({verified:true,idHash:'a',verifiedAt:Date.now(),attestedBy:'x'}))
  localStorage.setItem('cdp:voice:record',JSON.stringify({pseudonym:'OpenCedar515',createdAt:1,lastChangedAt:1}))
  // pseudo-locale AND the largest text scale — the two together are the real test
  localStorage.setItem('cdp:prefs:prefs',JSON.stringify({locale:'zz',onboarded:true,
    localities:[{id:'loc_w12',label:'W12',ward:'W12',district:'Pune',state:'MH'}],seenNoticeIds:[],
    followedStreets:[{id:'s1',name:'MG Road'},{id:'s2',name:'Market Approach'}],
    a11y:{textScale:1.6,highContrast:false,reduceMotion:true,lowBandwidth:false,screenReaderMode:false,voiceOut:false}}))
})
const ROUTES = [
  ['Sarathi', '/s/sarathi'],
  ['Bills · pipeline', '/s/bills'],
  ['Bills · a bill', '/s/bills/b/bill_water'],
  ['Bills · unreadable source', '/s/bills/b/bill_transport'],
  ['Bills · Constitution', '/s/bills/constitution'],
  ['Bills · constituency', '/s/bills/constituency'],
  ['Bills · debate', '/s/bills/debate/top_water_bill'],
  ['Works · map', '/s/works'],
  ['Works · one work', '/s/works/w/wk_market_fibre'],
  ['Works · no permit', '/s/works/w/wk_temple_fibre'],
  ['Works · my streets', '/s/works/mine'],
  ['Works · the record', '/s/works/record'],
  ['Bharat (stub)', '/s/bharat'],
]

let failed = false

for (const [name, route] of ROUTES) {
  await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)

  // any element whose content overflows its own box horizontally = clipped layout
  const clipped = await p.evaluate(()=>{
    const bad=[]; const vw = window.innerWidth
    for (const el of document.querySelectorAll('.shell *')) {
      const cs=getComputedStyle(el)
      if (cs.overflowX==='auto'||cs.overflowX==='scroll') continue
      if (el.classList.contains('sr-only')) continue        // clipped by design
      if (cs.position==='fixed') continue                    // dock centres itself
      const r = el.getBoundingClientRect()
      if (r.width === 0) continue
      // Escaping the viewport is the failure the shell's overflow:hidden hides.
      if (r.right > vw + 2 || r.left < -2) {
        bad.push((el.className||el.tagName).toString().slice(0,28)+' ['+Math.round(r.left)+'..'+Math.round(r.right)+']')
      }
    }
    return bad.slice(0,8)
  })
  const hscroll = await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2)
  const unresolved = await p.evaluate(()=>(document.body.innerText.match(/⟦[^⟧]+⟧/g)||[]).slice(0,10))

  const bad = clipped.length > 0 || unresolved.length > 0 || hscroll
  failed = failed || bad
  console.log(`${bad ? '✗' : '✓'} ${name.padEnd(26)} ${
    bad
      ? [hscroll && 'page scrolls sideways', clipped.length && `clipped: ${clipped.join(' | ')}`,
         unresolved.length && `unresolved: ${unresolved.join(' ')}`].filter(Boolean).join(' · ')
      : 'nothing clipped, no unresolved keys'}`)
}

await p.goto(`${BASE}/s/bills`, { waitUntil: 'networkidle' })
await p.screenshot({path:`${D}/pseudo-160.png`})
if (errs.length) console.log('console errors:', errs.slice(0,3).join(' | '))

console.log(failed ? '\n✗ layout check failed' : `\n✓ ${ROUTES.length} routes at 160% in the pseudo-locale — nothing clipped, no unresolved keys`)
await b.close()
process.exit(failed ? 1 : 0)
