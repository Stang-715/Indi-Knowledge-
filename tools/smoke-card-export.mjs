import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1280,height:800}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file:///home/user/Indi-Knowledge-/dist/paramountcy.html');
await p.waitForTimeout(2000);
const btn = await p.$('text=Begin') ?? await p.$('button');
if (btn) { await btn.click(); await p.waitForTimeout(1500); }
// open a card via the API surface: click a log year then a card? Use openCard indirectly:
const r = await p.evaluate(async () => {
  // simulate: find any event, open its card through the drawer flow
  const ev = document.querySelector('#log [data-year]');
  return !!ev;
});
// direct: call the keep flow by dispatching on a synthetic card button
const out = await p.evaluate(async () => {
  const tl = window.__TL_TEST; // not exposed; instead drive the UI:
  return null;
});
// Drive UI: open year page from log if present, else skip
// press play and let a few years pass so the log has rows
const play = await p.$('#play');
if (play) { await play.click(); await p.waitForTimeout(4000); await play.click(); }
const dbg = await p.evaluate(() => ({
  logRows: document.querySelectorAll('#log [data-year]').length,
  drawer: !!document.getElementById('drawer'),
}));
console.log('dbg', dbg);
const logRow = await p.$('#log [data-year]');
if (logRow) { await logRow.click(); await p.waitForTimeout(800); }
const keep = await p.$('.keep-card');
let plate = null;
if (keep) {
  await keep.click(); await p.waitForTimeout(1200);
  plate = await p.$eval('.plate-overlay img', i => ({ w: i.naturalWidth, h: i.naturalHeight, png: i.src.startsWith('data:image/png') }));
}
console.log('keep button:', !!keep, 'plate:', plate, 'errors:', errs.slice(0,3));
await b.close();
