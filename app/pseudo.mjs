import { chromium } from 'playwright'
const D='/tmp/claude-0/-home-user-Indi-Knowledge-/7454615a-3621-576f-bc63-a893c88c0483/scratchpad'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:'dark' })
const errs=[]; p.on('pageerror',e=>errs.push('ERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())})
await p.goto('http://localhost:4310/')
await p.evaluate(()=>{
  localStorage.setItem('cdp:eligibility:record',JSON.stringify({verified:true,idHash:'a',verifiedAt:Date.now(),attestedBy:'x'}))
  localStorage.setItem('cdp:voice:record',JSON.stringify({pseudonym:'OpenCedar515',createdAt:1,lastChangedAt:1}))
  // pseudo-locale AND the largest text scale — the two together are the real test
  localStorage.setItem('cdp:prefs:prefs',JSON.stringify({locale:'zz',onboarded:true,
    localities:[{id:'loc_w12',label:'W12',ward:'W12',district:'Pune',state:'MH'}],seenNoticeIds:[],
    a11y:{textScale:1.6,highContrast:false,reduceMotion:true,lowBandwidth:false,screenReaderMode:false,voiceOut:false}}))
})
await p.goto('http://localhost:4310/s/sarathi',{waitUntil:'networkidle'})
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
console.log('untranslated keys on screen:', await p.evaluate(()=>(document.body.innerText.match(/⟦[^⟧]+⟧/g)||[]).slice(0,10)))
await p.screenshot({path:`${D}/pseudo-160.png`})
console.log('errors:', errs.length?errs.slice(0,2).join(' | '):'none')
await b.close()
