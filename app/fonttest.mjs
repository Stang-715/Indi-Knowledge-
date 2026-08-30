import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage()
await p.goto('http://localhost:4190/', { waitUntil:'networkidle' })
await p.waitForTimeout(3000)
const r = await p.evaluate(async () => {
  await document.fonts.ready
  return {
    anek: document.fonts.check('700 40px "Anek Latin"'),
    instrument: document.fonts.check('400 16px "Instrument Sans"'),
    loaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).slice(0, 6),
  }
})
console.log(JSON.stringify(r, null, 1))
await b.close()
