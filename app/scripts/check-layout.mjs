#!/usr/bin/env node
/*
 * Layout check — the pseudo-locale pass, in a browser.
 *
 * The static checks cannot see a layout that only fits because English is
 * short. This one runs Surface 1 in the pseudo-locale at the largest text scale
 * and fails if anything escapes the viewport, because the shell's
 * overflow:hidden turns that failure into a silent one.
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
    a11y:{textScale:1.6,highContrast:false,reduceMotion:true,lowBandwidth:false,screenReaderMode:false,voiceOut:false}}))
})
await p.goto(`${BASE}/s/sarathi`,{waitUntil:'networkidle'})
await p.waitForTimeout(2200)

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
console.log('page h-scroll:', await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))
console.log('clipped elements:', clipped.length? clipped.join(' | ') : 'none')
const unresolved = await p.evaluate(()=>(document.body.innerText.match(/⟦[^⟧]+⟧/g)||[]).slice(0,10))
console.log('unresolved keys:', unresolved.length ? unresolved : 'none')
await p.screenshot({path:`${D}/pseudo-160.png`})
console.log('errors:', errs.length?errs.slice(0,2).join(' | '):'none')

const failed = clipped.length > 0 || unresolved.length > 0
console.log(failed ? '\n✗ layout check failed' : '\n✓ pseudo-locale at 160% — nothing clipped, no unresolved keys')
await b.close()
process.exit(failed ? 1 : 0)
