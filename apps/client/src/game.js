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
         setListenFocus, takeCounters, lightFire, campList, START_POP } from './pop.js';
import { initDeck, card, allCards, recordRecital, recitedEntries, recitedCount,
         totalXP, levelFor, levelName, nextLevelAt, cardsAtLevel, nextCard,
         timesRecited, bookProgress } from './deck.js';

const $ = (id) => document.getElementById(id);

/* ── World: terrain and the deck ────────────────────────────────────────── */

const [bundle, DECK] = await Promise.all([
  fetch('../../data/skeleton/bundle.json').then(r => r.json()),
  fetch('../../data/game/deck.json').then(r => r.json()),
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
const SAVE_KEY = 'recite-game-v1';

const G = {
  day: 0,
  speedIdx: 0,
  level: 1,
  meters: { order: 8, food: 50, knowledge: 0, money: 0 },
  flags: { fire: false, farming: 0, herding: 0, craft: 0, barter: false, money: false },
};
let currentCard = null;
const BOOK_TITLE = new Map(DECK.books.map((b) => [b.id, b.title]));

/* ── Save & restore: a raised population should survive a refresh ───────── */

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      day: G.day, meters: G.meters, flags: G.flags,
      recited: recitedEntries(), currentCardId: currentCard?.id ?? null,
      pop: popCount(),
    }));
  } catch { /* storage may be unavailable; the game still plays */ }
}

function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (!s) return null;
    return s;
  } catch { return null; }
}

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

/** What each kind of teaching does to the world. Morals calm; stories
 *  gentle; skills change what the population can DO (flags the pop and
 *  economy read); everything adds a little knowledge. */
const CATEGORY_FX = {
  Morals:      (c) => { bump('order', 7);  toast('The people listen. Order grows.'); },
  Stories:     (c) => { bump('order', 5);  toast(`They retell "${c.title}" at the fires.`); },
  Agriculture: (c) => { bump('order', 2); G.flags.farming++;
                        toast('Seeds go into the ground. The pot will fill itself.'); },
  Craft:       (c) => { bump('order', 2); G.flags.craft++;
                        toast('Hands learn. Tools follow.'); },
  Numbers:     (c) => { bump('order', 2);
                        if (c.id === 'EDU.SKILL.ARITH.1') { G.flags.barter = true; toast('They begin to trade — this for that, counted fairly.'); }
                        else if (!G.flags.money) { G.flags.money = true; toast('Money. Value stops being heavy and starts being counted.'); }
                        else toast('The counting sharpens.'); },
  Science:     (c) => { bump('order', 2);
                        if (c.id === 'SCI.FIRE' && !G.flags.fire) {
                          G.flags.fire = true;
                          for (const [lon, lat] of campList()) lightFire(lon + 0.15, lat + 0.1);
                          toast('Fire. The camps glow tonight.');
                        } else toast('Science takes another step.'); },
  Vedas:       (c) => { bump('order', 6); bump('knowledge', 4);
                        toast('The old hymns settle over everything.'); },
};
function bump(k, v) { G.meters[k] = Math.min(100, G.meters[k] + v); }

function onRecited(c) {
  const before = G.level;
  const { first } = recordRecital(c.id);
  bump('knowledge', first ? 3 : 1);
  (CATEGORY_FX[c.category] ?? CATEGORY_FX.Morals)(c);
  if (!first) bump('order', 2); // a re-recital keeps old teaching warm

  G.level = levelFor(totalXP());
  if (G.level > before) {
    const revealed = cardsAtLevel(G.level).length;
    toast(`⬆ Level ${G.level} — ${levelName(G.level)}. ${revealed} new card${revealed === 1 ? '' : 's'} revealed.`);
  }
  if (first || G.level > before) currentCard = nextCard(G.level);
  saveGame();
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
  $('lvl').textContent = `Lv ${G.level} · ${levelName(G.level)}`;
  const nxt = nextLevelAt(G.level);
  $('lvl').title = nxt == null ? 'The top of the mountain.'
    : `${totalXP()} XP — next level at ${nxt}. New recitals earn the most.`;
  $('popn').textContent = popCount();
  $('orderbar').style.width = `${G.meters.order}%`;
  $('foodbar').style.width = `${G.meters.food}%`;
  $('money').hidden = !G.flags.money;
  if (G.flags.money) $('money').textContent = `₹ ${Math.round(G.meters.money)}`;
  $('cardtitle').textContent = currentCard ? currentCard.title : 'Everything is recited — keep it warm';
  $('cardbook').textContent = currentCard ? (BOOK_TITLE.get(currentCard.book) ?? currentCard.book) : '';
  $('cardtext').textContent = currentCard ? currentCard.recite : '';
  $('btnCards').textContent = `🃏 Cards ${recitedCount()}/${allCards().length}`;
  const bp = bookProgress().filter((b) => b.done > 0).length;
  $('btnBooks').textContent = `📖 Books ${bp}/${bookProgress().length}`;
}

/* ── The day ────────────────────────────────────────────────────────────── */

function onNewDay() {
  G.day++;
  // Order frays on its own: an untaught population drifts back toward wild.
  G.meters.order = Math.max(4, G.meters.order - 0.25);
  // Food: yesterday's hunts feed today; taught fields feed steadily; the pot
  // empties by headcount. Fire makes the meat go further.
  const c = takeCounters();
  const fields = G.flags.farming * 1.6 + G.flags.herding * 1.2;
  const meatWorth = G.flags.fire ? 5 : 4;
  G.meters.food = Math.max(0, Math.min(100,
    G.meters.food + c.meat * meatWorth + fields - popCount() * 0.055));
  // Barter earns a trickle once counting exists; money makes it countable.
  if (G.flags.money) G.meters.money += G.flags.craft * 2 + (G.flags.barter ? 3 : 0);
  if (c.deathsFight) toast(`${c.deathsFight} killed in a quarrel. They needed better words.`);
  if (c.deathsHunger) toast(`${c.deathsHunger} starved. The hunt is not enough.`);
  dailyPop(G.meters);
  saveGame();
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

const SAVED = loadGame();
initDeck(DECK, SAVED?.recited);
if (SAVED) {
  G.day = SAVED.day ?? 0;
  Object.assign(G.meters, SAVED.meters ?? {});
  Object.assign(G.flags, SAVED.flags ?? {});
  G.level = levelFor(totalXP());
  currentCard = (SAVED.currentCardId && card(SAVED.currentCardId)) || nextCard(G.level);
  initPop(Math.max(12, Math.min(420, SAVED.pop ?? START_POP)));
  if (G.flags.fire) for (const [lon, lat] of campList()) lightFire(lon + 0.15, lat + 0.1);
} else {
  currentCard = nextCard(G.level);
  initPop();
}
resize();
paintHUD();
requestAnimationFrame(frame);
document.body.classList.add('ready');

/* Test hook (headless drives only; not a player surface). */
window.__test = {
  day: () => G.day,
  level: () => G.level,
  xp: () => totalXP(),
  flags: () => ({ ...G.flags }),
  meters: () => ({ ...G.meters }),
  pop: () => popCount(),
  animals: () => animalCount(),
  reciting: () => !!recite,
  recited: () => recitedEntries().map(([id]) => id),
  currentCard: () => currentCard?.id ?? null,
  setSpeed: (i) => { G.speedIdx = i; },
  setOrder: (v) => { G.meters.order = v; },
  reciteNow: () => { if (currentCard) onRecited(currentCard); },   // skip the hold, for fast unlock tests
  wipeSave: () => { try { localStorage.removeItem(SAVE_KEY); } catch {} },
};
