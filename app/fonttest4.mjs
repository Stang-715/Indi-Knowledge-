import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const p = await b.newPage()
p.on('response', async r => {
  if (r.url().includes('fonts.googleapis.com')) {
    console.log('CSS status', r.status())
    const t = await r.text().catch(()=>'')
    console.log(t.split('\n').filter(l=>/font-stretch|src:|format/.test(l)).slice(0,6).join('\n'))
  }
  if (r.url().includes('gstatic')) console.log('FONT FILE', r.status(), r.url().slice(-40))
})
await p.goto('http://localhost:4190/', { waitUntil:'networkidle' })
await p.waitForTimeout(4000)
await b.close()
