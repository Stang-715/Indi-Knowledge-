import { chromium } from 'playwright'
const D='/tmp/claude-0/-home-user-Indi-Knowledge-/7454615a-3621-576f-bc63-a893c88c0483/scratchpad'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
for (const [name, opts] of [['kit-light',{colorScheme:'light'}], ['kit-dark',{colorScheme:'dark'}]]) {
  const p = await b.newPage({ viewport:{width:1280,height:1000}, deviceScaleFactor:1.5, ...opts })
  const errs=[]; p.on('pageerror',e=>errs.push(e.message))
  p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()) })
  await p.goto('http://localhost:4190/', { waitUntil:'networkidle' })
  await p.waitForTimeout(1400)
  await p.screenshot({ path:`${D}/${name}-hero.png` })
  // interact: switch nav to Bills, open island expanded, open a disclosure
  await p.locator('#nav .tab').nth(2).click(); await p.waitForTimeout(700)
  await p.locator('#seg2 button').nth(2).click(); await p.waitForTimeout(800)
  await p.locator('details.disc').first().click(); await p.waitForTimeout(600)
  await p.locator('.kit', { hasText:'Floating island navigation' }).scrollIntoViewIfNeeded()
  await p.waitForTimeout(500)
  await p.screenshot({ path:`${D}/${name}-kit.png` })
  await p.locator('.phones').scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
  await p.screenshot({ path:`${D}/${name}-phones.png` })
  console.log(name, 'errors:', errs.length?errs.join(' | '):'none')
  await p.close()
}
await b.close()
