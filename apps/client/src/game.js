/**
 * The Recite Game — the whole client.
 *
 * One verb: hold Space and the population hears you. The old grand-strategy
 * UI (panels, lenses, mode tabs, drawers) is gone; what remains on screen is
 * the living map, one card, one bar, and two doors (Cards, Books).
 *
 *   worldgen + render-realm  →  the terrain, unchanged
 *   pop.js                   →  the population, alive in real time
 *   deck.js (phase 2)        →  the cards and books
 *
 * Time: one game day ≈ 10 real seconds at 1x, fast-forwardable. The year
 * counts up from 6000 BCE, one year per day — a life's read stretches
 * across millennia, which is the point.
 */
import { loadSkeleton } from '../../../packages/worldgen/src/skeleton.js';
import { compileOrography } from '../../../packages/worldgen/src/terrain.js';
import { buildClimate } from '../../../packages/worldgen/src/climate.js';
import { RealmRenderer } from '../../../packages/render-realm/src/renderer.js';
import { Camera, fitSpan } from '../../../packages/render-realm/src/camera.js';
import { WorldgenClient } from '../../../packages/render-realm/src/workerclient.js';
import { initPop, tickPop, dailyPop, drawPop, popCount, animalCount,
         setListenFocus, takeCounters, START_POP } from './pop.js';

const $ = (id) => document.getElementById(id);

/* ── World: terrain only ────────────────────────────────────────────────── */

const [bundle] = await Promise.all([
  fetch('../../data/skeleton/bundle.json').then(r => r.json()),
]);

const SK = loadSkeleton(bundle);
const O = compileOrography(SK.oro);

function provisionalClimate(W = 8, H = 8) {
  return { W, H, bbox: SK.bbox, moisture: new Float32Array(W * H).fill(0.45),
           isSea: new Uint8Array(W * H), riverField: new Float32Array(W * H),
           height: new Float32Array(W * H), provisional: true };
}
const renderer = new RealmRenderer({ skeleton: SK, climate: provisionalClimate() });

const wg = new WorldgenClient(new URL('./worldgen.worker.js', import.meta.url));
(async () => {
  // Yield one microtask first: with no worker (file://, the bundle) this
  // function otherwise runs synchronously to its end during module
  // evaluation and hits `terrainDirty` before its `let` below — a TDZ crash
  // the dev server's worker path never shows.
  await Promise.resolve();
  let real = null;
  if (wg.available) {
    try {
      const r = await wg.send('init', { bundle, size: 220, sweeps: 90 });
      real = { ...r, riverField: new Float32Array(r.W * r.H), height: new Float32Array(r.W * r.H) };
    } catch { /* fall through to inline */ }
  }
  if (!real) real = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 220, sweeps: 90 });
  renderer.climate = real;
  terrainDirty = true;
})();

/* ── Camera & terrain cache ─────────────────────────────────────────────── */

const HOME = { w: 66.5, s: 5.5, e: 93.5, n: 36.5 };
const cam = new Camera({ cx: (HOME.w + HOME.e) / 2, cy: (HOME.s + HOME.n) / 2, span: HOME.e - HOME.w });
let fitted = false;

const cv = $('map'), ctx = cv.getContext('2d');
const off = document.createElement('canvas'), octx = off.getContext('2d');
const terrainCv = document.createElement('canvas'), tctx = terrainCv.getContext('2d');
let dpr = 1;
let terrainDirty = true;      // re-render the cached terrain on the next frame
let terrainFine = false;      // whether the cache was drawn at full budget
let fineTimer = 0;

const BUDGET = { preview: 26_000, full: 230_000 };

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = cv.parentElement.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
  if (!fitted && cv.width && cv.height) { cam.span = fitSpan(HOME, cv.width, cv.height); fitted = true; }
  terrainDirty = true;
}
window.addEventListener('resize', resize);

/** The terrain never moves; the people do. Render land+water into a cache
 *  whenever the camera changes, and blit it every frame under the crowd —
 *  a fast preview immediately, the full pass a beat after the camera rests. */
function renderTerrainCache(budget) {
  const w = cv.width, h = cv.height;
  if (!w || !h) return;
  const proj = cam.projection(w, h);
  const { data, gw, gh } = renderer.renderTerrain(proj, w, h, budget === BUDGET.full ? 1 : 3, budget);
  off.width = gw; off.height = gh;
  octx.putImageData(new ImageData(data, gw, gh), 0, 0);
  terrainCv.width = w; terrainCv.height = h;
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.clearRect(0, 0, w, h);
  tctx.drawImage(off, 0, 0, w, h);
  renderer.drawWater(tctx, proj, w, h, cam.level(w / dpr), 1);
}

function cameraMoved() {
  terrainDirty = true;
  terrainFine = false;
  clearTimeout(fineTimer);
  fineTimer = setTimeout(() => { terrainDirty = true; terrainFine = false; wantFine = true; }, 140);
}
let wantFine = true;

/* pan + zoom — the only pointer verbs the stage has */
let dragging = false, last = null;
cv.addEventListener('pointerdown', (e) => { dragging = true; last = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const proj = cam.projection(cv.width, cv.height);
  cam.panBy(-(e.clientX - last[0]) * dpr / cv.width * cam.span,
             (e.clientY - last[1]) * dpr / cv.height * proj.spanY);
  last = [e.clientX, e.clientY];
  wantFine = false;
  cameraMoved();
});
cv.addEventListener('pointerup', () => { dragging = false; });
cv.addEventListener('pointercancel', () => { dragging = false; });
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = cv.getBoundingClientRect();
  const proj = cam.projection(cv.width, cv.height);
  cam.zoomAt(e.deltaY > 0 ? 1.14 : 0.88,
    proj.toLon((e.clientX - rect.left) * dpr), proj.toLat((e.clientY - rect.top) * dpr));
  wantFine = false;
  cameraMoved();
}, { passive: false });

/* ── Game state ─────────────────────────────────────────────────────────── */

const DAY_MS = 10_000;               // one day at 1x — the floor the user set
const SPEEDS = [1, 4, 12];
const START_YEAR = -6000;

const G = {
  day: 0,
  speedIdx: 0,
  level: 1,
  xp: 0,
  meters: { order: 8, food: 50, knowledge: 0, money: 0 },
  moneyKnown: false,
  recited: new Set(),               // card ids, phase 2 fills this properly
};

/** Phase 1's single hardcoded card — the deck arrives in phase 2. */
const FIRST_CARD = {
  id: 'EDU.GITA.01',
  book: 'Bhagavad Gita',
  title: "The Yoga of Arjuna's Despair",
  recite: 'You grieve for those who need no grief. The wise mourn neither the living nor the dead.',
};
let currentCard = FIRST_CARD;

/* ── The recital: hold Space ────────────────────────────────────────────── */

const RECITE_MS = 3000;
const LISTEN_RADIUS_DEG = 7;         // a voice that carries — most camps hear it
let recite = null;                   // { startedAt }

function reciteFocus() {
  const proj = cam.projection(cv.width, cv.height);
  return { lon: proj.toLon(cv.width / 2), lat: proj.toLat(cv.height / 2), rDeg: LISTEN_RADIUS_DEG };
}

function startRecite() {
  if (recite || !currentCard || pageOpen()) return;
  recite = { startedAt: performance.now() };
  setListenFocus(reciteFocus());
  $('recitebar').classList.add('on');
}

function endRecite(completed) {
  recite = null;
  setListenFocus(null);
  $('recitebar').classList.remove('on');
  $('recitefill').style.width = '0%';
  if (completed) onRecited(currentCard);
}

function onRecited(card) {
  G.recited.add(card.id);
  G.meters.order = Math.min(100, G.meters.order + 7);
  G.meters.knowledge = Math.min(100, G.meters.knowledge + 3);
  G.xp += 10;
  toast(`The people listen. Order grows.`);
  paintHUD();
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) { e.preventDefault(); startRecite(); }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space' && recite) {
    e.preventDefault();
    const done = performance.now() - recite.startedAt >= RECITE_MS;
    endRecite(done);
    if (!done) toast('The words trail off — a recital needs finishing.');
  }
});
window.addEventListener('blur', () => { if (recite) endRecite(false); });

/* ── Pages (full-screen; real content in phase 3) ───────────────────────── */

const pageOpen = () => !$('page-cards').hidden || !$('page-books').hidden;
$('btnCards').addEventListener('click', () => { $('page-cards').hidden = false; });
$('btnBooks').addEventListener('click', () => { $('page-books').hidden = false; });
for (const el of document.querySelectorAll('[data-back]'))
  el.addEventListener('click', () => { $('page-cards').hidden = true; $('page-books').hidden = true; });
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('page-cards').hidden = true; $('page-books').hidden = true; }
});

/* ── HUD ────────────────────────────────────────────────────────────────── */

$('speed').addEventListener('click', () => {
  G.speedIdx = (G.speedIdx + 1) % SPEEDS.length;
  $('speed').textContent = SPEEDS[G.speedIdx] === 1 ? '▸' : SPEEDS[G.speedIdx] === 4 ? '▸▸' : '▸▸▸';
  paintHUD();
});

function fmtYear(y) { return y < 0 ? `${-y} BCE` : `${y} CE`; }

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('toasts').append(el);
  setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 400); }, 3200);
  while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
}

function paintHUD() {
  $('day').textContent = `Day ${G.day}`;
  $('era').textContent = fmtYear(START_YEAR + G.day);
  $('popn').textContent = popCount();
  $('orderbar').style.width = `${G.meters.order}%`;
  $('foodbar').style.width = `${G.meters.food}%`;
  $('money').hidden = !G.moneyKnown;
  if (G.moneyKnown) $('money').textContent = `₹ ${Math.round(G.meters.money)}`;
  $('cardtitle').textContent = currentCard ? currentCard.title : '—';
  $('cardbook').textContent = currentCard ? currentCard.book : '';
  $('cardtext').textContent = currentCard ? currentCard.recite : '';
  $('btnCards').textContent = `🃏 Cards ${G.recited.size}/1`;
  $('btnBooks').textContent = `📖 Books`;
}

/* ── The day ────────────────────────────────────────────────────────────── */

function onNewDay() {
  G.day++;
  // Order frays on its own: an untaught population drifts back toward wild.
  G.meters.order = Math.max(4, G.meters.order - 0.25);
  // Food: yesterday's hunts feed today; the pot empties by headcount.
  const c = takeCounters();
  G.meters.food = Math.max(0, Math.min(100, G.meters.food + c.meat * 4 - popCount() * 0.055));
  if (c.deathsFight) toast(`${c.deathsFight} killed in a quarrel. They needed better words.`);
  if (c.deathsHunger) toast(`${c.deathsHunger} starved. The hunt is not enough.`);
  dailyPop(G.meters);
  paintHUD();
}

/* ── The loop ───────────────────────────────────────────────────────────── */

let lastT = performance.now();
let dayAcc = 0;

function frame(t) {
  const rdt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;
  const speed = SPEEDS[G.speedIdx];
  const dt = rdt * speed;

  dayAcc += rdt * 1000 * speed;
  while (dayAcc >= DAY_MS) { dayAcc -= DAY_MS; onNewDay(); }

  tickPop(dt, G.meters);

  if (terrainDirty && cv.width) {
    renderTerrainCache(wantFine ? BUDGET.full : BUDGET.preview);
    terrainDirty = false;
    terrainFine = wantFine;
    wantFine = true;
  }

  const w = cv.width, h = cv.height;
  if (w && h) {
    const proj = cam.projection(w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(terrainCv, 0, 0);
    drawPop(ctx, proj, dpr, t / 1000, G.level);

    if (recite) {
      const frac = Math.min(1, (t - recite.startedAt) / RECITE_MS);
      $('recitefill').style.width = `${(frac * 100).toFixed(1)}%`;
      const f = reciteFocus();
      setListenFocus(f);
      const cx = proj.toX(f.lon), cy = proj.toY(f.lat);
      const rMax = Math.abs(proj.toX(f.lon + f.rDeg) - cx);
      ctx.save();
      ctx.strokeStyle = 'rgba(201,162,39,0.55)';
      ctx.lineWidth = 1.4 * dpr;
      for (let i = 0; i < 3; i++) {
        const rr = rMax * (((t / 1400) + i / 3) % 1);
        ctx.globalAlpha = 0.6 * (1 - rr / rMax);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      if (frac >= 1) endRecite(true);
    }
  }

  requestAnimationFrame(frame);
}

/* ── Boot ───────────────────────────────────────────────────────────────── */

initPop();
resize();
paintHUD();
requestAnimationFrame(frame);
document.body.classList.add('ready');

/* Test hook (headless drives only; not a player surface). */
window.__test = {
  day: () => G.day,
  meters: () => ({ ...G.meters }),
  pop: () => popCount(),
  animals: () => animalCount(),
  reciting: () => !!recite,
  recited: () => [...G.recited],
  setSpeed: (i) => { G.speedIdx = i; },
  setOrder: (v) => { G.meters.order = v; },
};
