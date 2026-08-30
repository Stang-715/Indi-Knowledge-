import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage()
await p.goto('http://localhost:4190/', { waitUntil:'networkidle' })
await p.waitForTimeout(3000)
const r = await p.evaluate(async () => {
  await document.fonts.ready
  const mk = (st) => { const s=document.createElement('span'); s.textContent='Chowk 13.12 DEC';
    s.style.cssText=`position:fixed;font-size:60px;font-weight:700;font-family:'Anek Latin';font-stretch:${st}`;
    document.body.appendChild(s); const w=s.getBoundingClientRect().width; s.remove(); return Math.round(w) }
  const h1 = document.querySelector('.hero h1')
  return { at75: mk('75%'), at100: mk('100%'), at125: mk('125%'),
           heroFont: getComputedStyle(h1).fontFamily.split(',')[0],
           heroStretch: getComputedStyle(h1).fontStretch }
})
console.log(JSON.stringify(r))
await b.close()
