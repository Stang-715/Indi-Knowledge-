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
         setListenFocus, takeCounters, lightFire, campList, START_POP,
         setEconomyFlags, setBuildings, cowCount, campAt, campName, campPop,
         farmLayout, workAt, grainBurst, FARM_PLOTS, WELL_DIGS, WELL_MAX_WATER,
         CAMP_RADIUS } from './pop.js';
import { initDeck, card, allCards, recordRecital, recitedEntries, recitedCount,
         totalXP, levelFor, levelName, nextLevelAt, cardsAtLevel, nextCard,
         timesRecited, bookProgress, cardInBooks } from './deck.js';
import { initPages, openCardsPage, openBooksPage, openDetail } from './pages.js';
import { initLenses, registerLens, lensList, lensById, armedLens, armedLensId,
         arm, disarm, actionAt, execute as lensExecute, buildTray, paintTray,
         keyToLens, ELIGIBILITY, ELIGIBILITY_ORDER } from './lenses.js';
import { drawGrid, drawMarks } from './sheet.js';

const $ = (id) => document.getElementById(id);

/* ── World: terrain and the deck ────────────────────────────────────────── */

const [bundle, DECK, ATLAS] = await Promise.all([
  fetch('../../data/skeleton/bundle.json').then(r => r.json()),
  fetch('../../data/game/deck.json').then(r => r.json()),
  fetch('../../data/atlas/boundaries.json').then(r => r.json()),
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
  // The sheet's own subdivision goes in here too: it changes only when the
  // camera or the lens changes, so it costs nothing per frame.
  drawGrid(tctx, proj, dpr, cam.level(w / dpr), effectiveLens().grid,
           { atlas: ATLAS, camps: campList(), campRadius: CAMP_RADIUS });
}

function cameraMoved() {
  terrainDirty = true;
  terrainFine = false;
  clearTimeout(fineTimer);
  fineTimer = setTimeout(() => { terrainDirty = true; terrainFine = false; wantFine = true; }, 140);
}
let wantFine = true;

/* pan, zoom, and one tap: go and stand in a camp */
let dragging = false, last = null, downAt = null;

/** Where the pointer is, in degrees. */
function pointerLonLat(e) {
  const rect = cv.getBoundingClientRect();
  const proj = cam.projection(cv.width, cv.height);
  return [proj.toLon((e.clientX - rect.left) * dpr), proj.toLat((e.clientY - rect.top) * dpr)];
}

cv.addEventListener('pointerdown', (e) => {
  dragging = true; last = [e.clientX, e.clientY]; downAt = [e.clientX, e.clientY];
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => {
  if (!dragging) {
    if (view.camp >= 0) hoverFarm = farmHit(...pointerLonLat(e));
    cv.style.cursor = hoverFarm != null ? 'pointer' : '';
    return;
  }
  hoverFarm = null;
  const proj = cam.projection(cv.width, cv.height);
  cam.panBy(-(e.clientX - last[0]) * dpr / cv.width * cam.span,
             (e.clientY - last[1]) * dpr / cv.height * proj.spanY);
  last = [e.clientX, e.clientY];
  wantFine = false;
  cameraMoved();
});
cv.addEventListener('pointerup', (e) => {
  dragging = false;
  // A tap, not a drag: in the wide view a tap on a camp goes in.
  const moved = downAt ? Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) : 99;
  downAt = null;
  if (moved > 6 || recite) return;
  const [lon, lat] = pointerLonLat(e);
  lensExecute(effectiveLens(), lon, lat);
});
cv.addEventListener('pointercancel', () => { dragging = false; downAt = null; });
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
  meters: { order: 12, food: 50, knowledge: 0, money: 0 },
  flags: { fire: false, farming: 0, herding: 0, craft: 0, barter: false, money: false },
  built: {},                         // buildingId → true
  builtAt: {},                       // buildingId → the camp it was raised at
  // The ledger of the raising: what it has cost so far, and what it grew.
  tally: { deathsFight: 0, deathsHunger: 0, births: 0 },
  // Cards whose full text you have actually opened. You cannot teach what
  // you have not read, so this gates the first recital of every card.
  read: new Set(),
  // The ground you have worked, camp by camp: campIdx → { plots, well }.
  farms: {},
  // The sheet lying on the table, or '' for the bare model.
  lens: '',
};
let currentCard = null;
const BOOK_TITLE = new Map(DECK.books.map((b) => [b.id, b.title]));

/* ── Save & restore: a raised population should survive a refresh ───────── */

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      day: G.day, meters: G.meters, flags: G.flags, built: G.built, builtAt: G.builtAt,
      tally: G.tally,
      read: [...G.read], farms: G.farms, lens: armedLensId() ?? '',
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

/* ── The close-up: go and stand in one camp ─────────────────────────────── */
//
// Not a second renderer — the same canvas, the same people, the camera
// simply walks in. `view.camp` is the whole mode: -1 is the subcontinent,
// anything else is that settlement, its people drawn large and alone.

// Wide enough to hold the whole camp: villagers roam CAMP_RADIUS (1.6°) from
// their fire, so a tighter framing than ~3.5° would put most of them
// off-screen — a close-up of nobody.
const CLOSEUP_SPAN = 3.6;
const view = { camp: -1, wide: null };   // wide: the framing to come back to

/** Ease the camera to a target over ~450ms; the terrain cache follows. */
let flight = null;
function flyTo(cx, cy, span) {
  flight = { t0: performance.now(), ms: 450,
    from: { cx: cam.cx, cy: cam.cy, span: cam.span }, to: { cx, cy, span } };
}
function stepFlight(now) {
  if (!flight) return;
  const k = Math.min(1, (now - flight.t0) / flight.ms);
  const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;   // easeInOutQuad
  cam.cx = flight.from.cx + (flight.to.cx - flight.from.cx) * e;
  cam.cy = flight.from.cy + (flight.to.cy - flight.from.cy) * e;
  cam.span = flight.from.span + (flight.to.span - flight.from.span) * e;
  wantFine = k >= 1;
  cameraMoved();
  if (k >= 1) flight = null;
}

function enterCamp(i) {
  if (view.camp === i) return;
  if (view.camp < 0) view.wide = { cx: cam.cx, cy: cam.cy, span: cam.span };
  view.camp = i;
  const [lon, lat] = campList()[i];
  flyTo(lon, lat, CLOSEUP_SPAN);
  paintCampChip();
}

function exitCamp() {
  if (view.camp < 0) return;
  view.camp = -1;
  hoverFarm = null;
  if (view.wide) flyTo(view.wide.cx, view.wide.cy, view.wide.span);
  paintCampChip();
}

function paintCampChip() {
  const inCamp = view.camp >= 0;
  $('campchip').hidden = !inCamp;
  if (inCamp) {
    $('campname').textContent = campName(view.camp);
    $('camppop').textContent = `${campPop(view.camp)} here`;
  }
  // The hint line belongs to whatever sheet is down, so it speaks in the
  // wide view too — not only from inside a camp.
  const hint = inCamp || armedLens() ? (effectiveLens().hint?.() ?? '') : '';
  $('camphint').hidden = !hint;
  $('camphint').textContent = hint;
  $('camphint').style.top = inCamp ? '' : '14px';
  paintLegend();
}

/* ── The farm: work you do with your hands ──────────────────────────────── */
//
// No toolbar. Inside a camp the verbs ARE the taps: a wild plot ploughs, a
// tilled plot takes seed, a sown plot drinks from the well, a ripe plot is
// harvested, and the well itself is dug one tap at a time. Each verb is
// taught by the card that unlocks it — you cannot plough before "Soil & the
// Seed", nor sink a well before "Water & the Field".

const CARD_PLOUGH = 'EDU.SKILL.AGRI.1';
const CARD_WELL = 'EDU.SKILL.AGRI.2';
const GROW_DAYS = 3;                 // watered → ripe
const HARVEST_FOOD = 6;

const knowsPlough = () => timesRecited(CARD_PLOUGH) > 0;
const knowsWell = () => timesRecited(CARD_WELL) > 0;

/** The farm record for a camp, created the first time it is looked at. */
function farmFor(i) {
  return (G.farms[i] ??= {
    plots: Array.from({ length: FARM_PLOTS }, () => ({ stage: 'wild', days: 0 })),
    well: { digs: 0, water: 0 },
  });
}

/** What drawPop should paint under the close-up, or null before the seed
 *  card: an unploughed camp shows plain ground, not six empty squares. */
function farmView() {
  if (view.camp < 0 || !knowsPlough()) return null;
  const f = farmFor(view.camp);
  return { plots: f.plots, well: f.well, wellShown: knowsWell(), hover: hoverFarm };
}

/** What lies under a point in the close-up: a plot index, 'well', or null. */
let hoverFarm = null;
function farmHit(lon, lat) {
  const i = view.camp;
  if (i < 0 || !knowsPlough()) return null;
  const L = farmLayout(i);
  if (knowsWell() && Math.hypot(lon - L.well.lon, lat - L.well.lat) <= L.well.r * 1.5) return 'well';
  for (let j = 0; j < L.plots.length; j++) {
    const g = L.plots[j];
    if (Math.abs(lon - g.lon) <= g.w / 2 && Math.abs(lat - g.lat) <= g.h / 2) return j;
  }
  return null;
}

/* ── The lenses: sheets you lay over the table ──────────────────────────── */
//
// The tap routing lives here, not in a special case per feature. Whatever
// sheet is down decides what the world is asking for; the farm's five verbs
// are simply the first lens, and the wide-view "walk into a camp" is the
// second. With nothing armed the table behaves exactly as it always did:
// the Field sheet inside a camp, the Hearth sheet over the subcontinent.

const FIELD_MSG = {
  water: () => !knowsWell() ? 'It waits on rain. Recite "Water & the Field" to sink a well.'
    : 'The well is not dug yet — tap the pit to dig.',
  dry: () => 'The well is dry today — it fills again by morning.',
};

const LENS_FIELD = registerLens({
  id: 'field', glyph: '🌾', name: 'The Field', grid: 'camps', books: ['krishi'],
  blurb: 'Soil, seed, water and the harvest — the ground worked by hand.',
  target(lon, lat) {
    const i = view.camp;
    if (i < 0) return null;
    if (!knowsPlough()) return { kind: 'ground', camp: i };
    const farm = farmFor(i);
    const L = farmLayout(i);
    const hit = farmHit(lon, lat);
    if (hit === 'well') return { kind: 'well', camp: i, farm, at: L.well };
    if (hit != null) return { kind: 'plot', camp: i, farm, j: hit, plot: farm.plots[hit], at: L.plots[hit] };
    return null;
  },
  verbs: [
    { id: 'harvest', label: 'harvest',
      eligible: (t) => t.kind === 'plot' && t.plot.stage === 'ready' ? 'can' : 'never',
      execute: (t) => {
        t.plot.stage = 'tilled'; t.plot.days = 0;
        G.meters.food = Math.min(100, G.meters.food + HARVEST_FOOD);
        grainBurst(t.at.lon, t.at.lat);
        toast(`Harvest — +${HARVEST_FOOD} food. The ground is ready for the next sowing.`);
        workAt(t.at.lon, t.at.lat);
        afterFarmChange();
      } },
    { id: 'plough', label: 'plough',
      eligible: (t) => t.kind === 'plot' && t.plot.stage === 'wild' ? 'can' : 'never',
      execute: (t) => {
        t.plot.stage = 'tilled'; t.plot.days = 0;
        toast('Ploughed. The soil is open.');
        workAt(t.at.lon, t.at.lat);
        afterFarmChange();
      } },
    { id: 'sow', label: 'sow seed',
      eligible: (t) => t.kind === 'plot' && t.plot.stage === 'tilled' ? 'can' : 'never',
      execute: (t) => {
        t.plot.stage = 'sown'; t.plot.days = 0;
        toast('Sown. Now it needs water.');
        workAt(t.at.lon, t.at.lat);
        afterFarmChange();
      } },
    { id: 'water', label: 'water',
      eligible: (t) => {
        if (t.kind !== 'plot' || t.plot.stage !== 'sown') return 'never';
        if (!knowsWell() || t.farm.well.digs < WELL_DIGS || t.farm.well.water <= 0) return 'could';
        return 'can';
      },
      why: (t) => t.farm.well.digs >= WELL_DIGS && knowsWell() ? FIELD_MSG.dry() : FIELD_MSG.water(),
      execute: (t) => {
        t.farm.well.water--;
        t.plot.stage = 'growing'; t.plot.days = 0;
        toast('Watered. Three days to the harvest.');
        workAt(t.at.lon, t.at.lat);
        afterFarmChange();
      } },
    { id: 'dig', label: 'dig the well',
      eligible: (t) => {
        if (t.kind !== 'well') return 'never';
        if (!knowsWell()) return 'could';
        return t.farm.well.digs < WELL_DIGS ? 'can' : 'already';
      },
      why: (t) => t.farm.well.digs >= WELL_DIGS
        ? (t.farm.well.water > 0
            ? `${t.farm.well.water} bucket${t.farm.well.water === 1 ? '' : 's'} drawn and waiting.`
            : FIELD_MSG.dry())
        : 'Recite "Water & the Field" before anyone here can sink a well.',
      execute: (t) => {
        t.farm.well.digs++;
        workAt(t.at.lon, t.at.lat, 4);
        // Striking water fills the well then and there — the last spadeful
        // is the reward, not the start of another wait.
        if (t.farm.well.digs >= WELL_DIGS) t.farm.well.water = WELL_MAX_WATER;
        toast(t.farm.well.digs >= WELL_DIGS
          ? 'Water — the well fills to the brim. The field need not wait for rain again.'
          : `You dig. ${WELL_DIGS - t.farm.well.digs} more to reach water.`);
        afterFarmChange();
      } },
    { id: 'wait', label: 'let it grow',
      eligible: (t) => t.kind === 'plot' && t.plot.stage === 'growing' ? 'progress' : 'never',
      why: (t) => `Still growing — ${Math.max(1, GROW_DAYS - t.plot.days)} day${GROW_DAYS - t.plot.days === 1 ? '' : 's'} to go.`,
      execute: () => {} },
    { id: 'learn', label: 'learn the soil',
      eligible: (t) => t.kind === 'ground' ? 'could' : 'never',
      why: () => 'Nobody here knows what to do with soil yet. Recite "Soil & the Seed".',
      execute: () => {} },
  ],
  hint: () => closeupHint(),
  // Inside a camp the Field reads plots and a well, not camps.
  marks() {
    if (view.camp < 0 || !knowsPlough()) return null;
    const L = farmLayout(view.camp);
    const out = L.plots.map((g, j) => {
      const a = actionAt(LENS_FIELD, g.lon, g.lat);
      return a && { lon: g.lon, lat: g.lat, w: g.w, h: g.h, state: a.state };
    }).filter(Boolean);
    if (knowsWell()) {
      const a = actionAt(LENS_FIELD, L.well.lon, L.well.lat);
      if (a) out.push({ lon: L.well.lon, lat: L.well.lat, r: L.well.r * 1.35, state: a.state });
    }
    return out;
  },
});

const LENS_HEARTH = registerLens({
  id: 'hearth', glyph: '🪔', name: 'The Hearth', grid: 'camps',
  books: ['kahani', 'gita', 'user'],
  blurb: 'Where your people gather — walk in and stand among them.',
  target: (lon, lat) => {
    if (view.camp >= 0) return null;
    const i = campAt(lon, lat);
    return i >= 0 ? { kind: 'camp', camp: i } : null;
  },
  verbs: [
    { id: 'visit', label: 'go and stand there',
      eligible: () => 'can',
      execute: (t) => enterCamp(t.camp) },
  ],
  hint: () => view.camp >= 0
    ? 'you are standing among them — Esc or ✕ to step back'
    : 'tap a camp to walk into it',
});

const LENS_ORDER = registerLens({
  id: 'order', glyph: '⚖️', name: 'The Order', grid: 'states',
  books: ['shilpa', 'ganit', 'vigyan'],
  blurb: 'What the common pot pays for: halls, schools, granaries.',
  // Funding is placed, not assigned: the next thing the people need rises at
  // the camp you tap, which is the only decision the common pot ever asks for.
  target: (lon, lat) => {
    const i = view.camp >= 0 ? view.camp : campAt(lon, lat);
    return i >= 0 ? { kind: 'camp', camp: i, def: BUILDINGS.find((b) => !G.built[b.id]) } : null;
  },
  verbs: [
    { id: 'fund', label: 'fund it',
      eligible: (t) => {
        if (!t.def) return 'already';           // everything the pot can buy, stands
        if (!G.flags.money) return 'could';
        return G.meters.money >= t.def.cost ? 'can' : 'could';
      },
      why: (t) => !t.def ? 'Every building the pot can buy already stands.'
        : !G.flags.money ? 'There is no money yet. Teach barter and counting first.'
        : `The ${t.def.name} costs ₹${t.def.cost}; the pot holds ₹${Math.round(G.meters.money)}.`,
      execute: (t) => {
        G.meters.money -= t.def.cost;
        G.built[t.def.id] = true;
        G.builtAt[t.def.id] = t.camp;
        syncBuildings();
        toast(`${t.def.icon} The ${t.def.name} rises at ${campName(t.camp)}.`);
        saveGame();
        paintHUD();
        paintCampChip();
      } },
  ],
  hint: () => {
    if (!G.flags.money) return 'nothing to fund yet — money comes with barter and counting';
    const next = BUILDINGS.find((b) => !G.built[b.id]);
    return next ? `₹${Math.round(G.meters.money)} in the pot — tap a camp to raise the ${next.name} (₹${next.cost})`
                : 'every building stands; the pot is yours to grow';
  },
});

const LENS_CHRONICLE = registerLens({
  id: 'chronicle', glyph: '🏛️', name: 'The Chronicle', grid: 'survey', books: ['veda'],
  blurb: 'What this ground remembers — the record laid over the living map.',
  target: (lon, lat) => {
    const i = view.camp >= 0 ? view.camp : campAt(lon, lat, 3.5);
    return i >= 0 ? { kind: 'camp', camp: i } : null;
  },
  hint: () => 'a reading sheet — nothing to do here, only to see',
});

/** The next card from this sheet's own books: something unrecited if there
 *  is any, otherwise the one you have kept warmest least recently. */
function nextCardIn(books) {
  if (!books?.length) return null;
  const lv = G.level;
  const mine = allCards().filter((c) => c.level <= lv && cardInBooks(c, books));
  return mine.find((c) => timesRecited(c.id) === 0) ?? mine[0] ?? null;
}

/** The sheet actually governing taps: what you armed, or the one this view
 *  has always used. Arming nothing must leave the game exactly as it was. */
function effectiveLens() {
  return armedLens() ?? (view.camp >= 0 ? LENS_FIELD : LENS_HEARTH);
}

initLenses({
  onArm: (l) => {
    paintTray($('lensrail'));
    cameraMoved();                 // the grid lives in the terrain cache
    paintLegend();
    // The table changes material with the sheet: same palette mechanism the
    // kit has always shipped for eras, driven by the lens instead.
    if (l) document.body.dataset.lens = l.id; else delete document.body.dataset.lens;
    // And the card in your hands changes with it — a sheet is a subject, and
    // the subject brings its own book. Nothing is lost: an already-chosen
    // card is only set aside if this sheet has something of its own to say.
    if (l) {
      const c = nextCardIn(l.books);
      if (c) currentCard = c;
    }
    paintCampChip();
    paintHUD();
    saveGame();
    if (l) toast(`${l.glyph} ${l.name} — ${l.blurb}`);
  },
  // A verb that cannot act says why, in the words the farm already used.
  onBlocked: (a) => { const m = a.verb?.why?.(a.target); if (m) toast(m); },
});

/**
 * How the world answers the sheet right now: one mark per thing the sheet
 * reads, in the six pigments. A lens may paint its own things (the Field
 * paints plots); otherwise the camps answer, and each one answers with
 * exactly what a tap there would do — the sheet cannot lie about the verb.
 */
function lensMarks() {
  const l = effectiveLens();
  if (!l) return null;
  if (l.marks) return l.marks();
  // A reading sheet has no verbs, so it has nothing to say about eligibility.
  // Painting every camp "never" would be a sentence it does not mean.
  if (!l.verbs.length) return null;
  const out = [];
  const camps = campList();
  for (let i = 0; i < camps.length; i++) {
    const [lon, lat] = camps[i];
    const a = actionAt(l, lon, lat);
    if (a) out.push({ lon, lat, state: a.state });
  }
  return out;
}

/** The pigments actually in play, named — the legend as a slip of paper. */
function paintLegend() {
  const el = $('lenslegend');
  const l = armedLens();
  const marks = l ? lensMarks() : null;
  const seen = new Set((marks ?? []).map((m) => m.state));
  const rows = ELIGIBILITY_ORDER.filter((k) => seen.has(k));
  el.hidden = !rows.length;
  el.innerHTML = rows.map((k) =>
    `<span class="lg-row" title="${ELIGIBILITY[k].hint}"><i style="background:${ELIGIBILITY[k].color}"></i>${ELIGIBILITY[k].label}</span>`).join('');
}

/** A tap on the world: hand it to the sheet that is down. */
function onCloseupTap(lon, lat) { lensExecute(effectiveLens(), lon, lat); }

function afterFarmChange() { saveGame(); paintHUD(); paintCampChip(); paintLegend(); }

/** Every camp's crops grow and every well refills, whether or not you are
 *  standing there — the work you did keeps working. */
function dailyFarms() {
  for (const f of Object.values(G.farms)) {
    if (f.well.digs >= WELL_DIGS) f.well.water = Math.min(WELL_MAX_WATER, f.well.water + 1);
    for (const plot of f.plots) {
      if (plot.stage !== 'growing') continue;
      plot.days++;
      if (plot.days >= GROW_DAYS) { plot.stage = 'ready'; plot.days = 0; }
    }
  }
}

/** The one next sensible thing to do here, in a sentence. */
function closeupHint() {
  if (view.camp < 0) return '';
  if (!knowsPlough()) return 'wild ground — recite "Soil & the Seed" before anyone can break it';
  const f = farmFor(view.camp);
  if (f.plots.some((p) => p.stage === 'ready')) return 'a golden plot is ripe — tap it to harvest';
  if (f.plots.some((p) => p.stage === 'wild')) return 'tap a plot to plough it';
  if (f.plots.some((p) => p.stage === 'tilled')) return 'tap the open soil to sow seed';
  if (knowsWell() && f.well.digs < WELL_DIGS) return `tap the well pit to dig — ${WELL_DIGS - f.well.digs} to go`;
  if (f.plots.some((p) => p.stage === 'sown')) {
    if (!knowsWell()) return 'the seed waits on rain — recite "Water & the Field"';
    return f.well.water > 0 ? 'tap the sown plots to water them' : 'the well is dry — it fills each morning';
  }
  return 'the field is growing — come back in a day or two';
}

$('campclose').addEventListener('click', exitCamp);
// Escape backs out of one thing at a time: the chant first, then the camp.
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || pageOpen()) return;
  if (recite) { endRecite(false); toast('You stop mid-verse.'); return; }
  if (armedLens()) { disarm(); toast('You lift the sheet off the table.'); return; }
  if (view.camp >= 0) exitCamp();
});

/* ── The recital: a chant, kept in time ─────────────────────────────────── */
//
// Reciting is the whole game, so it is not one button held down. A slow beat
// runs while you chant; press Space ON each beat and the chant carries, the
// voice-rings pulse, and the crowd draws nearer. Drift off the beat and the
// chant stalls; miss three and it falters and is lost. Eight beats to a card.

const BEAT_MS = 900;
const HIT_WINDOW_MS = 240;           // how near the beat a press must land
const CHANT_BEATS = 8;
const MAX_MISSES = 3;
const LISTEN_RADIUS_MIN = 4.5;       // your voice before the crowd gathers
const LISTEN_RADIUS_MAX = 9;         // and once they are rapt

let recite = null;   // { startedAt, nextBeat, hits, misses, lastHitAt, beatIndex }

function reciteFocus() {
  const proj = cam.projection(cv.width, cv.height);
  const grip = recite ? recite.hits / CHANT_BEATS : 0;
  return {
    lon: proj.toLon(cv.width / 2), lat: proj.toLat(cv.height / 2),
    rDeg: LISTEN_RADIUS_MIN + (LISTEN_RADIUS_MAX - LISTEN_RADIUS_MIN) * grip,
  };
}

function startRecite() {
  if (recite || !currentCard || pageOpen()) return;
  // You cannot teach what you have not read.
  if (!G.read.has(currentCard.id)) {
    $('cardslot').classList.add('needsread');
    setTimeout(() => $('cardslot').classList.remove('needsread'), 900);
    toast('Read it first — open the card and take it in.');
    return;
  }
  const now = performance.now();
  recite = { startedAt: now, nextBeat: now + BEAT_MS, hits: 0, misses: 0,
             lastHitAt: 0, beatIndex: 0 };
  setListenFocus(reciteFocus());
  $('recitebar').classList.add('on');
  paintChant();
}

function endRecite(completed) {
  recite = null;
  setListenFocus(null);
  $('recitebar').classList.remove('on');
  $('recitefill').style.width = '0%';
  $('chantpips').innerHTML = '';
  $('recitebar').classList.remove('hit', 'miss');
  if (completed) onRecited(currentCard);
}

/** One press of Space during a chant: on the beat, or not. */
function chantPress() {
  if (!recite) return;
  const now = performance.now();
  const off = Math.abs(now - recite.nextBeat);
  // Also accept a press just AFTER the beat has already ticked past.
  const offPrev = Math.abs(now - (recite.nextBeat - BEAT_MS));
  if (Math.min(off, offPrev) <= HIT_WINDOW_MS) {
    recite.hits++;
    recite.lastHitAt = now;
    $('recitebar').classList.remove('miss');
    $('recitebar').classList.add('hit');
    setTimeout(() => $('recitebar')?.classList.remove('hit'), 160);
    if (recite.hits >= CHANT_BEATS) { endRecite(true); return; }
  } else {
    chantMiss();
  }
  paintChant();
}

function chantMiss() {
  if (!recite) return;
  recite.misses++;
  $('recitebar').classList.remove('hit');
  $('recitebar').classList.add('miss');
  setTimeout(() => $('recitebar')?.classList.remove('miss'), 200);
  if (recite.misses >= MAX_MISSES) {
    endRecite(false);
    toast('The chant falters and the crowd drifts away.');
  }
}

function paintChant() {
  if (!recite) return;
  $('recitefill').style.width = `${(recite.hits / CHANT_BEATS * 100).toFixed(1)}%`;
  $('chantpips').innerHTML = Array.from({ length: CHANT_BEATS }, (_, i) =>
    `<i class="${i < recite.hits ? 'on' : ''}"></i>`).join('')
    + `<b class="misses">${'✕'.repeat(recite.misses)}</b>`;
}

/** What each kind of teaching does to the world. Morals calm; stories
 *  gentle; skills change what the population can DO (flags the pop and
 *  economy read); everything adds a little knowledge. */
const CATEGORY_FX = {
  Morals:      (c) => { bump('order', 7);  toast('The people listen. Order grows.'); },
  Stories:     (c) => { bump('order', 5);  toast(`They retell "${c.title}" at the fires.`); },
  Agriculture: (c) => { bump('order', 2);
                        if (c.id.startsWith('EDU.SKILL.CATTLE')) { G.flags.herding++; toast('The herd learns you; you learn the herd.'); }
                        else { G.flags.farming++; toast('Seeds go into the ground. The pot will fill itself.'); } },
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
  Modern:      (c) => { bump('order', 4); bump('knowledge', 2);
                        toast('Your own book, read to your children.'); },
};
function bump(k, v) { G.meters[k] = Math.min(100, G.meters[k] + v); }

function onRecited(c) {
  const before = G.level;
  const { first } = recordRecital(c.id);
  bump('knowledge', first ? 3 : 1);
  (CATEGORY_FX[c.category] ?? CATEGORY_FX.Morals)(c);
  if (!first) bump('order', 2); // a re-recital keeps old teaching warm
  setEconomyFlags({ farming: G.flags.farming, herding: G.flags.herding });

  G.level = levelFor(totalXP());
  if (G.level > before) {
    const revealed = cardsAtLevel(G.level).length;
    toast(`⬆ Level ${G.level} — ${levelName(G.level)}. ${revealed} new card${revealed === 1 ? '' : 's'} revealed.`);
  }
  if (first || G.level > before) currentCard = nextCard(G.level);
  saveGame();
  paintHUD();
  paintCampChip();   // a new card can change what the camp is asking for
}

// The number keys lay sheets down and 0 lifts them; typing in a text box
// (the bring-your-own-book form) must never be hijacked.
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName ?? '')) return;
  const id = keyToLens(e.key);
  if (id === undefined) return;
  e.preventDefault();
  arm(id === armedLensId() ? null : id);
});

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return;
  e.preventDefault();
  if (recite) chantPress();
  else startRecite();
});
window.addEventListener('blur', () => { if (recite) endRecite(false); });

/* ── Pages (full-screen; real content in phase 3) ───────────────────────── */

const pageOpen = () =>
  !$('page-cards').hidden || !$('page-books').hidden || !$('page-fund').hidden;
function closePages() {
  $('page-cards').hidden = true;
  $('page-books').hidden = true;
  $('page-fund').hidden = true;
  for (const el of document.querySelectorAll('.card-detail')) el.remove();
}
$('btnCards').addEventListener('click', openCardsPage);
$('btnBooks').addEventListener('click', openBooksPage);
for (const el of document.querySelectorAll('[data-back]'))
  el.addEventListener('click', closePages);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePages(); });
$('btnRead').addEventListener('click', () => { if (currentCard) openDetail(currentCard.id, 'stage'); });

initPages({
  getLevel: () => G.level,
  onRead: (id) => {
    if (G.read.has(id)) return;
    G.read.add(id);
    saveGame();
    paintHUD();
  },
  setCurrentCard: (id) => {
    const c = card(id);
    if (!c) return;
    currentCard = c;
    closePages();
    saveGame();
    paintHUD();
    toast(`Ready: "${c.title}". Hold Space when you are.`);
  },
  onDeckChanged: () => { saveGame(); paintHUD(); },
  // The binder and the library open on the sheet that is down.
  getFilter: () => { const l = armedLens(); return l?.books.length ? { id: l.id, name: l.name, glyph: l.glyph, books: l.books } : null; },
  clearFilter: () => disarm(),
});

/* ── Funding: what money and attention buy ──────────────────────────────── */
//
// "I need to fund all the meditation, vedic development, etc., by money and
// attention so people get more organized." Money arrives with its card
// (Numbers, level 7); once it exists, a third door opens. Each building is
// bought once, stands at a real camp on the map, and works every day after.

const BUILDINGS = [
  { id: 'hall', icon: '🛕', name: 'Meditation Hall', cost: 120, camp: 0,
    blurb: 'A quiet dome. Order settles on its own: +0.5 Order every day, forever.' },
  { id: 'school', icon: '📚', name: 'Vedic School', cost: 200, camp: 2,
    blurb: 'Teachers of teachers. +0.4 Knowledge and +0.2 Order daily — your recitals, carried on without you.' },
  { id: 'granary', icon: '🏺', name: 'Granary', cost: 150, camp: 4,
    blurb: 'The harvest, kept past the monsoon: +1.5 Food every day.' },
];

function syncBuildings() {
  setBuildings(BUILDINGS.filter((b) => G.built[b.id])
    .map((b) => {
      const [lon, lat] = campList()[G.builtAt[b.id] ?? b.camp];
      return { type: b.id, lon: lon - 0.3, lat: lat - 0.15 };
    }));
}

function renderFund() {
  $('fund-body').innerHTML = `
    <p class="lede">₹ ${Math.round(G.meters.money)} in the common pot — earned by taught craft and fair trade.
      A building is bought once and works every day after.</p>
    ${BUILDINGS.map((b) => {
      const done = !!G.built[b.id];
      const can = !done && G.meters.money >= b.cost;
      return `<div class="fund-row ${done ? 'done' : ''}">
        <span class="fr-icon">${b.icon}</span>
        <span class="fr-main"><b>${b.name}</b><span class="fr-blurb">${b.blurb}</span></span>
        ${done ? '<span class="fr-built">standing</span>'
               : `<button class="btn ${can ? 'btn--primary' : ''}" data-fund="${b.id}" ${can ? '' : 'disabled'}>₹ ${b.cost}</button>`}
      </div>`;
    }).join('')}`;
}

$('btnFund').addEventListener('click', () => { renderFund(); $('page-fund').hidden = false; });
$('page-fund').addEventListener('click', (e) => {
  const b = e.target.closest('[data-fund]');
  if (!b) return;
  const def = BUILDINGS.find((x) => x.id === b.dataset.fund);
  if (!def || G.built[def.id] || G.meters.money < def.cost) return;
  G.meters.money -= def.cost;
  G.built[def.id] = true;
  G.builtAt[def.id] ??= def.camp;
  syncBuildings();
  toast(`${def.icon} The ${def.name} rises.`);
  saveGame();
  renderFund();
  paintHUD();
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
  $('btnFund').hidden = !G.flags.money;
  $('cardtitle').textContent = currentCard ? currentCard.title : 'Everything is recited — keep it warm';
  $('cardbook').textContent = currentCard ? (BOOK_TITLE.get(currentCard.book) ?? currentCard.book) : '';
  $('cardtext').textContent = currentCard ? currentCard.recite : '';
  const unread = currentCard && !G.read.has(currentCard.id);
  $('btnRead').hidden = !currentCard;
  $('btnRead').textContent = unread ? '📖 Read it' : '📖 Read again';
  $('cardslot').classList.toggle('unread', !!unread);
  $('recitehint').textContent = !currentCard ? ''
    : unread ? 'read it before you can teach it'
    : 'press [space] to start — then keep the beat';
  $('btnCards').textContent = `🃏 Cards ${recitedCount()}/${allCards().length}`;
  const bp = bookProgress().filter((b) => b.done > 0).length;
  $('btnBooks').textContent = `📖 Books ${bp}/${bookProgress().length}`;
}

/* ── The day ────────────────────────────────────────────────────────────── */

function onNewDay() {
  G.day++;
  // Order frays on its own: an untaught population drifts back toward wild —
  // slowly enough that a few days away from the game is not a catastrophe.
  G.meters.order = Math.max(4, G.meters.order - 0.15);
  // Food: yesterday's hunts feed today; taught fields feed steadily; the pot
  // empties by headcount. Fire makes the meat go further.
  const c = takeCounters();
  // The abstract yield is now a trickle: harvesting by hand is the real
  // food engine, and a tended six-plot camp beats it several times over.
  const fields = G.flags.farming * 0.6 + G.flags.herding * 1.2;
  const meatWorth = G.flags.fire ? 5 : 4;
  G.meters.food = Math.max(0, Math.min(100,
    G.meters.food + c.meat * meatWorth + fields - popCount() * 0.055));
  // Barter earns a trickle once counting exists; money makes it countable.
  if (G.flags.money) G.meters.money += G.flags.craft * 2 + (G.flags.barter ? 3 : 0);
  // Funded buildings work every day, unattended — that is what they are FOR.
  if (G.built.hall) bump('order', 0.5);
  if (G.built.school) { bump('knowledge', 0.4); bump('order', 0.2); }
  if (G.built.granary) G.meters.food = Math.min(100, G.meters.food + 1.5);
  G.tally.deathsFight += c.deathsFight;
  G.tally.deathsHunger += c.deathsHunger;
  G.tally.births += c.births;
  if (c.deathsFight) toast(`${c.deathsFight} killed in a quarrel. They needed better words.`);
  if (c.deathsHunger) toast(`${c.deathsHunger} starved. The hunt is not enough.`);
  dailyFarms();
  dailyPop(G.meters);
  saveGame();
  paintHUD();
  paintCampChip();   // crops ripened overnight; the hint should say so
  paintLegend();
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
  stepFlight(t);

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
    drawMarks(ctx, proj, dpr, lensMarks());
    drawPop(ctx, proj, dpr, t / 1000, G.level, view.camp, farmView());

    if (recite) {
      const now = performance.now();
      // The beat passes whether or not you were on it.
      while (recite && now > recite.nextBeat + HIT_WINDOW_MS) {
        recite.nextBeat += BEAT_MS;
        recite.beatIndex++;
        // A beat that went by without a press near it is a missed beat —
        // unless the press that answered it landed early, inside the window.
        if (recite.lastHitAt < recite.nextBeat - BEAT_MS - HIT_WINDOW_MS) {
          chantMiss();
          if (recite) paintChant();
        }
      }
      if (recite) {
        // The strike marker sweeps toward the beat; the zone is the window.
        const untilBeat = recite.nextBeat - now;
        const sweep = 1 - Math.max(0, Math.min(1, untilBeat / BEAT_MS));
        $('chantmarker').style.left = `${(sweep * 100).toFixed(1)}%`;
        const f = reciteFocus();
        setListenFocus(f);
        const cx = proj.toX(f.lon), cy = proj.toY(f.lat);
        const rMax = Math.abs(proj.toX(f.lon + f.rDeg) - cx);
        ctx.save();
        ctx.strokeStyle = 'rgba(201,162,39,0.55)';
        ctx.lineWidth = 1.4 * dpr;
        // Rings ride the beat itself, so the map pulses in time with you.
        for (let i = 0; i < 3; i++) {
          const rr = rMax * (((now / (BEAT_MS * 1.6)) + i / 3) % 1);
          ctx.globalAlpha = 0.6 * (1 - rr / rMax);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
        // A brighter ring snaps out on each clean hit.
        const sinceHit = now - recite.lastHitAt;
        if (sinceHit < 420) {
          ctx.globalAlpha = 0.75 * (1 - sinceHit / 420);
          ctx.lineWidth = 2.4 * dpr;
          ctx.beginPath();
          ctx.arc(cx, cy, rMax * (sinceHit / 420) * 0.9, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
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
  Object.assign(G.built, SAVED.built ?? {});
  Object.assign(G.builtAt, SAVED.builtAt ?? {});
  Object.assign(G.tally, SAVED.tally ?? {});
  for (const id of SAVED.read ?? []) G.read.add(id);
  for (const [k, f] of Object.entries(SAVED.farms ?? {})) {
    const farm = farmFor(Number(k));
    for (let j = 0; j < FARM_PLOTS; j++) Object.assign(farm.plots[j], f.plots?.[j] ?? {});
    Object.assign(farm.well, f.well ?? {});
  }
  G.level = levelFor(totalXP());
  currentCard = (SAVED.currentCardId && card(SAVED.currentCardId)) || nextCard(G.level);
  initPop(Math.max(12, Math.min(420, SAVED.pop ?? START_POP)));
  if (G.flags.fire) for (const [lon, lat] of campList()) lightFire(lon + 0.15, lat + 0.1);
} else {
  currentCard = nextCard(G.level);
  initPop();
}
setEconomyFlags({ farming: G.flags.farming, herding: G.flags.herding });
syncBuildings();
buildTray($('lensrail'));
if (SAVED?.lens) arm(SAVED.lens);
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
  read: () => [...G.read],
  markRead: (id) => { G.read.add(id ?? currentCard?.id); paintHUD(); },
  // The chant, for headless drives: when the next beat lands, and how it goes.
  chant: () => recite && { hits: recite.hits, misses: recite.misses,
    nextBeatIn: recite.nextBeat - performance.now(), beats: CHANT_BEATS },
  beatMs: () => BEAT_MS,
  camp: () => view.camp,
  enterCamp: (i) => enterCamp(i),
  exitCamp: () => exitCamp(),
  campScreen: (i) => {                     // where a camp sits on screen, for taps
    const proj = cam.projection(cv.width, cv.height);
    const rect = cv.getBoundingClientRect();
    const [lon, lat] = campList()[i];
    return { x: rect.left + proj.toX(lon) / dpr, y: rect.top + proj.toY(lat) / dpr };
  },
  recited: () => recitedEntries().map(([id]) => id),
  currentCard: () => currentCard?.id ?? null,
  setSpeed: (i) => { G.speedIdx = i; },
  setOrder: (v) => { G.meters.order = v; },
  setCard: (id) => { const c = card(id); if (c) { currentCard = c; paintHUD(); } return !!c; },
  reciteNow: () => { if (currentCard) onRecited(currentCard); },   // skip the hold, for fast unlock tests
  wipeSave: () => { try { localStorage.removeItem(SAVE_KEY); } catch {} },
  cows: () => cowCount(),
  built: () => ({ ...G.built }),
  tally: () => ({ ...G.tally }),
  addMoney: (n) => { G.meters.money += n; paintHUD(); },
  lenses: () => lensList().map((l) => l.id),
  bookOf: (id) => card(id)?.book ?? null,
  setMoney: (n) => { G.meters.money = n; G.flags.money = true; paintHUD(); },
  farmLonLat: (i, what) => {
    const L = farmLayout(i);
    return what === 'well' ? L.well : L.plots[what];
  },
  lens: () => armedLensId() ?? '',
  arm: (id) => arm(id)?.id ?? '',
  disarm: () => disarm(),
  // What the sheet that is down would do at a point — the verb and its pigment.
  peek: (lon, lat) => {
    const a = actionAt(effectiveLens(), lon, lat);
    return a && { verb: a.verb?.id ?? null, state: a.state, kind: a.target.kind };
  },
  farm: (i) => JSON.parse(JSON.stringify(farmFor(i ?? Math.max(0, view.camp)))),
  hint: () => $('camphint').textContent,
  // Where a farm feature sits on screen, so a drive can tap it for real.
  farmScreen: (i, what) => {
    const L = farmLayout(i);
    const g = what === 'well' ? L.well : L.plots[what];
    const proj = cam.projection(cv.width, cv.height);
    const rect = cv.getBoundingClientRect();
    return { x: rect.left + proj.toX(g.lon) / dpr, y: rect.top + proj.toY(g.lat) / dpr };
  },
};
