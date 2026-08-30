import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage()
await p.goto('http://localhost:4190/', { waitUntil:'networkidle' })
await p.waitForTimeout(3500)
const r = await p.evaluate(async () => {
  await document.fonts.ready
  const mk = (ff, vs) => { const s=document.createElement('span'); s.textContent='Chowk 13.12 DEC';
    s.style.cssText=`position:fixed;font-size:60px;font-weight:700;font-family:${ff};font-variation-settings:${vs}`;
    document.body.appendChild(s); const w=s.getBoundingClientRect().width; s.remove(); return Math.round(w) }
  return {
    anek_wdth80: mk("'Anek Latin'", "'wdth' 80"),
    anek_wdth125: mk("'Anek Latin'", "'wdth' 125"),
    fallback: mk('system-ui', 'normal'),
  }
})
console.log(JSON.stringify(r))
await b.close()
