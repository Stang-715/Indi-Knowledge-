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
         setEconomyFlags, setBuildings, cowCount } from './pop.js';
import { initDeck, card, allCards, recordRecital, recitedEntries, recitedCount,
         totalXP, levelFor, levelName, nextLevelAt, cardsAtLevel, nextCard,
         timesRecited, bookProgress } from './deck.js';
import { initPages, openCardsPage, openBooksPage, openDetail } from './pages.js';

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
  meters: { order: 12, food: 50, knowledge: 0, money: 0 },
  flags: { fire: false, farming: 0, herding: 0, craft: 0, barter: false, money: false },
  built: {},                         // buildingId → true
  // The ledger of the raising: what it has cost so far, and what it grew.
  tally: { deathsFight: 0, deathsHunger: 0, births: 0 },
  // Cards whose full text you have actually opened. You cannot teach what
  // you have not read, so this gates the first recital of every card.
  read: new Set(),
};
let currentCard = null;
const BOOK_TITLE = new Map(DECK.books.map((b) => [b.id, b.title]));

/* ── Save & restore: a raised population should survive a refresh ───────── */

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      day: G.day, meters: G.meters, flags: G.flags, built: G.built, tally: G.tally,
      read: [...G.read],
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
}

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
    .map((b) => { const [lon, lat] = campList()[b.camp]; return { type: b.id, lon: lon - 0.3, lat: lat - 0.15 }; }));
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
  const fields = G.flags.farming * 1.6 + G.flags.herding * 1.2;
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
  Object.assign(G.tally, SAVED.tally ?? {});
  for (const id of SAVED.read ?? []) G.read.add(id);
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
  recited: () => recitedEntries().map(([id]) => id),
  currentCard: () => currentCard?.id ?? null,
  setSpeed: (i) => { G.speedIdx = i; },
  setOrder: (v) => { G.meters.order = v; },
  reciteNow: () => { if (currentCard) onRecited(currentCard); },   // skip the hold, for fast unlock tests
  wipeSave: () => { try { localStorage.removeItem(SAVE_KEY); } catch {} },
  cows: () => cowCount(),
  built: () => ({ ...G.built }),
  tally: () => ({ ...G.tally }),
  addMoney: (n) => { G.meters.money += n; paintHUD(); },
};
