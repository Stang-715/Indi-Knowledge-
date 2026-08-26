/**
 * Paramountcy — the client.
 *
 * Wires the four packages together and gets out of the way:
 *   worldgen      → terrain and climate, pure
 *   render-realm  → the table, L0–L9
 *   sim           → the world, deterministic and headless
 *   ui            → the objects on the table
 *
 * The client owns none of the rules. It owns the canvas, the input, and the
 * decision log — and the decision log is the save file (docs/10-buildplan.md A.3).
 */
import { loadSkeleton }      from '../../../packages/worldgen/src/skeleton.js';
import { compileOrography }  from '../../../packages/worldgen/src/terrain.js';
import { buildClimate }      from '../../../packages/worldgen/src/climate.js';
import { RealmRenderer }     from '../../../packages/render-realm/src/renderer.js';
import { Camera, fitSpan }   from '../../../packages/render-realm/src/camera.js';
import { run }               from '../../../packages/sim/src/engine.js';
import { corpusSummary, worksAtRisk } from '../../../packages/sim/src/corpus.js';
import { formatYear }        from '../../../packages/sim/src/clock.js';
import { spriteURL, spriteFor } from '../../../packages/ui/src/sprites.js';
import { throughput, CHOKES } from '../../../packages/sim/src/trade.js';
import { CityRenderer }      from '../../../packages/render-city/src/renderer.js';
import { WorldgenClient }    from '../../../packages/render-realm/src/workerclient.js';
import { endowable, endowmentLedger, living, lineageOf }
  from '../../../packages/sim/src/people.js';
import { cardModel, renderCard, renderYearPage, indexCards, authoredFor,
         indexThreads, threadsFor }
  from '../../../packages/ui/src/eventcard.js';
import { surveyable, surveySummary, TIER, SURVEY_COST }
  from '../../../packages/sim/src/survey.js';
import { blocked, locked, trustRung, nextRung } from '../../../packages/sim/src/pillars.js';
import { frontierPresent, frontierLedger, STANCE } from '../../../packages/sim/src/frontier.js';
import { LAYERS, LAYER_INFO, yieldTo } from '../../../packages/sim/src/sovereignty.js';
import { trustCeiling } from '../../../packages/sim/src/occupations.js';
import { save as mkSave, load as loadSave, reconcile, toURLFragment, fromURLFragment,
         replayStops, saveSize } from '../../../packages/sim/src/save.js';
import { Sound, textureFamily } from '../../../packages/ui/src/sound.js';
import { creditsHTML } from '../../../packages/ui/src/credits.js';
import { damagedHTML } from '../../../packages/ui/src/damaged.js';
import { renderCardPlate } from '../../../packages/ui/src/cardplate.js';
import { makeTelemetry } from '../../../packages/ui/src/telemetry.js';
import { composeChronicle, chronicleHTML, chronicleText } from '../../../packages/ui/src/chronicle.js';
import { makeSlipTracker } from '../../../packages/ui/src/slips.js';
import { interiorHTML } from '../../../packages/ui/src/interiors.js';
import { drawFrom } from '../../../packages/sim/src/rng.js';
import { buildCodexIndex, searchCodex, codexHTML, shelfHTML, resultsHTML }
  from '../../../packages/ui/src/codex.js';
import { CHOLA, CHAPTERS, chapterAt, reckoning, openingState }
  from '../../../packages/sim/src/campaign.js';

const $ = (id) => document.getElementById(id);

/** Startup timing, kept in the build: a slow first paint is a real bug. */
const T0 = performance.now();
const marks = [];
const mark = (label) => { marks.push([label, performance.now() - T0]); };

/* ── World ──────────────────────────────────────────────────────────────── */

const [bundle, timeline, works, cityData, people, cardsDoc, gazetteer, texture, occupations, fontManifest] = await Promise.all([
  fetch('../../data/skeleton/bundle.json').then(r => r.json()),
  fetch('../../data/timeline/timeline.json').then(r => r.json()),
  fetch('../../data/corpus/works.json').then(r => r.json()),
  fetch('../../data/cities/cities.json').then(r => r.json()),
  fetch('../../data/people/people.json').then(r => r.json()),
  fetch('../../data/timeline/cards.json').then(r => r.json()),
  fetch('../../data/gazetteer/places.json').then(r => r.json()),
  fetch('../../data/timeline/texture.json').then(r => r.json()),
  fetch('../../data/timeline/occupations.json').then(r => r.json()),
  fetch('../../data/fonts/manifest.json').then(r => r.json()).catch(() => null),
]);
const PLACE_BY_ID = new Map(gazetteer.places.map(g => [g.id, g]));

mark('fetch');
const SK = loadSkeleton(bundle);
const O  = compileOrography(SK.oro);
mark('skeleton');
/**
 * The climate build is about a second of solid arithmetic. Hand it to a worker
 * and paint meanwhile, so the page is interactive immediately instead of frozen
 * until the monsoon has finished relaxing.
 *
 * The worker is a performance decision, not a dependency: if it cannot start —
 * a file:// page, a locked-down embed, an old browser — the identical code runs
 * inline. That it CAN run in either place is the payoff for keeping worldgen
 * pure, which looked pedantic at the time.
 */
const wg = new WorldgenClient(new URL('./worldgen.worker.js', import.meta.url));

/**
 * A provisional climate, so the map can be drawn before the real one exists.
 *
 * The monsoon relaxation is about a second of solid arithmetic. Awaiting it
 * before the first paint means a second of frozen page for no reason: the
 * coastline, the elevation and the sea are all ready immediately, and the only
 * thing missing is which shade of green the lowlands are. So paint with a flat
 * field, then swap the real one in and repaint.
 */
function provisionalClimate(W = 8, H = 8) {
  const moisture = new Float32Array(W * H).fill(0.45);
  return { W, H, bbox: SK.bbox, moisture, isSea: new Uint8Array(W * H),
           riverField: new Float32Array(W * H), height: new Float32Array(W * H),
           provisional: true };
}

let climate = provisionalClimate();

const renderer = new RealmRenderer({ skeleton: SK, climate });

/** Swap in the real climate the moment it lands, and repaint. */
async function upgradeClimate() {
  let real = null;
  if (wg.available) {
    try {
      const r = await wg.send('init', { bundle, size: 220, sweeps: 90 });
      real = { ...r, riverField: new Float32Array(r.W * r.H), height: new Float32Array(r.W * r.H) };
      mark('climate-worker');
    } catch (e) {
      console.warn('worldgen worker unavailable, falling back inline:', e.message);
    }
  }
  if (!real) {
    real = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 220, sweeps: 90 });
    mark('climate-inline');
  }
  climate = real;
  renderer.climate = real;
  draw(3); scheduleFull();
}
const cityRenderer = new CityRenderer({ cities: cityData.cities });
const DP = { timeline, works, people, gazetteer, texture, occupations };
const CARDS = indexCards(cardsDoc);
const TELEMETRY = makeTelemetry();
const THREAD_IDX = indexThreads(timeline);
const CHAPTER_BY_ID = new Map((timeline.chapters ?? []).map(c => [c.id, c]));
const withChapter = (ev) =>
  ev.chapter && CHAPTER_BY_ID.has(ev.chapter)
    ? { ...ev, chapterName: CHAPTER_BY_ID.get(ev.chapter).name } : ev;
const eraOf = (y) => timeline.eras.find(e => y >= e.from && y < e.to) ?? timeline.eras[15];

/** Open a full event card. This is where `evidence` and `dispute` get read. */
function openCard(ev) {
  const m = cardModel(withChapter(ev), { era: eraOf(ev.year), authored: authoredFor(CARDS, ev),
                            threads: threadsFor(THREAD_IDX, ev) });
  $('drawer-inner').innerHTML = renderCard(m);
  $('drawer').classList.add('on');
  TELEMETRY.cardOpened();
}

/** "Keep this card": render the 1200x1600 plate and present it to save.
 *  Script-initiated downloads are inert in the artifact sandbox, so the PNG
 *  opens in a modal and the player saves it natively. */
document.addEventListener('click', async (e) => {
  const b = e.target.closest?.('[data-keep]');
  if (!b) return;
  const ev = timeline.events.find(x => x.id === b.dataset.keep);
  if (!ev) return;
  const m = cardModel(withChapter(ev), { era: eraOf(ev.year), authored: authoredFor(CARDS, ev),
                            threads: threadsFor(THREAD_IDX, ev) });
  const img = new Image();
  await new Promise((res) => { img.onload = res; img.onerror = res;
    img.src = spriteURL(m.icon, 256); });
  const cv = renderCardPlate(m, { spriteImg: img.naturalWidth ? img : null });
  const overlay = document.createElement('div');
  overlay.className = 'plate-overlay';
  overlay.innerHTML = `<div class="plate-box">
    <img alt="${m.title}" src="${cv.toDataURL('image/png')}">
    <p class="tiny">Right-click or long-press the card to save it.</p>
  </div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.append(overlay);
  TELEMETRY.cardKept();
});

/** Open the year page — composed, never authored. */
/** Thread navigation: a click on a prev/next beat opens that beat's card. */
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('[data-goto]');
  if (!a) return;
  const ev = timeline.events.find(x => x.id === a.dataset.goto);
  if (ev) openCard(ev);
});

/** Read a whole thread end to end — the loom view. */
function openThread(tid) {
  TELEMETRY.threadOpened();
  const t = THREAD_IDX.get(tid);
  if (!t) return;
  const beats = t.beats.map(b =>
    `<div class="thread-beat" data-goto="${b.id}">
       <span class="tb-year">${b.year < 0 ? (-b.year) + ' BCE' : b.year + ' CE'}</span>
       <span class="tb-title">${b.title}</span>
     </div>`).join('');
  $('drawer-inner').innerHTML =
    `<div class="thread-view">
       <h3>${t.name}</h3>
       <p class="thread-arc">${t.arc}</p>
       ${beats}
     </div>`;
  $('drawer').classList.add('on');
}
document.addEventListener('click', (e) => {
  const el = e.target.closest?.('[data-thread]');
  if (el && !e.target.closest('[data-goto]')) openThread(el.dataset.thread);
});

function openYear(year) {
  const evs = timeline.events.filter(e => e.year === year && e.scope !== 'prologue');
  const models = evs.map(e => cardModel(withChapter(e), { era: eraOf(year), authored: authoredFor(CARDS, e),
                                             threads: threadsFor(THREAD_IDX, e) }));
  const log = state.log.filter(l => l.year === year);
  $('drawer-inner').innerHTML = renderYearPage(year, { events: models, log, era: eraOf(year) });
  $('drawer').classList.add('on');
  TELEMETRY.yearOpened();
}

/* ── Camera ─────────────────────────────────────────────────────────────── */

// Framed on India. The neighbours are computed and rendered in full — they are
// not blank — but they are not what the camera is for.
const HOME = { w: 66.5, s: 5.5, e: 93.5, n: 36.5 };
const cam = new Camera({
  cx: (HOME.w + HOME.e) / 2, cy: (HOME.s + HOME.n) / 2, span: HOME.e - HOME.w,
});
let fitted = false;

const cv = $('map'), ctx = cv.getContext('2d');
const off = document.createElement('canvas'), octx = off.getContext('2d');
const blurCv = document.createElement('canvas'), blurCtx = blurCv.getContext('2d');
let dpr = 1, needsFull = true, raf = 0;

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = cv.parentElement.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
  // Fit both dimensions, once. Sizing from longitude alone crops the south.
  if (!fitted && cv.width && cv.height) {
    cam.span = fitSpan(HOME, cv.width, cv.height);
    fitted = true;
  }
  needsFull = true;
  draw(3);
  scheduleFull();
}

let fullTimer = 0;
function scheduleFull() {
  clearTimeout(fullTimer);
  fullTimer = setTimeout(() => draw(1), 110);
}

/** Cell budgets: a fast preview while panning, a fuller pass when still. */
const BUDGET = { preview: 26_000, full: 230_000 };

function draw(step) {
  const w = cv.width, h = cv.height;
  if (!w || !h) return;
  const proj = cam.projection(w, h);
  const level = cam.level(w / dpr);

  const { data, gw, gh } = renderer.renderTerrain(
    proj, w, h, step, step > 1 ? BUDGET.preview : BUDGET.full);
  off.width = gw; off.height = gh;
  octx.putImageData(new ImageData(data, gw, gh), 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, w, h);

  // The tilt-shift is a mechanic: strongest zoomed out, gone by L7.
  //
  // It is applied to the SMALL buffer, not the full canvas. A 21-pixel blur
  // across four million pixels took eleven seconds; the same blur across the
  // 535x430 buffer is imperceptibly different after the upscale and costs
  // almost nothing. The whole point of the effect is that detail is not there.
  const bufBlur = renderer.blurFor(level, gh);

  if (bufBlur > 0.3) {
    // Water goes into the buffer so it blurs with the land, in one pass.
    octx.save();
    renderer.drawWater(octx, proj, w, h, level, gw / w);
    octx.restore();

    // Sharp underneath.
    ctx.drawImage(off, 0, 0, w, h);

    // A blurred copy on top, with the focal band punched out of it. That
    // gradient is what makes the subcontinent read as a model on a table
    // rather than an out-of-focus photograph.
    blurCv.width = gw; blurCv.height = gh;
    blurCtx.globalCompositeOperation = 'source-over';
    blurCtx.filter = `blur(${bufBlur.toFixed(2)}px)`;
    blurCtx.clearRect(0, 0, gw, gh);
    blurCtx.drawImage(off, 0, 0);
    blurCtx.filter = 'none';

    const band = renderer.focalBand(level);
    const g = blurCtx.createLinearGradient(0, 0, 0, gh);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(Math.max(0.01, band.near), 'rgba(0,0,0,1)');
    g.addColorStop(Math.min(0.99, band.far),  'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    blurCtx.globalCompositeOperation = 'destination-out';
    blurCtx.fillStyle = g;
    blurCtx.fillRect(0, 0, gw, gh);
    blurCtx.globalCompositeOperation = 'source-over';

    ctx.drawImage(blurCv, 0, 0, w, h);
  } else {
    // Past L7 the model has become a place. Draw the water crisp, at full size.
    ctx.drawImage(off, 0, 0, w, h);
    renderer.drawWater(ctx, proj, w, h, level, 1);
  }

  // ── The dive ──────────────────────────────────────────────────────────
  //
  // render-realm owns L0-L9 and render-city owns L10-L16, and they share a
  // camera and nothing else. The handoff is a cross-fade rather than a switch:
  // the city fades up across the same rungs where the tilt-shift fades out, so
  // the world stops being a model and becomes a place in one continuous move.
  const dive = diveTarget(proj, level);
  if (dive) {
    cityRenderer.draw(ctx, proj, dive.id, state ? state.year : -6000, level, dpr, dive.alpha);
    drawTemplePeople(proj, dive, level);
  }

  if (mapMode === 'survey') drawSurvey(proj, level);
  if (mapMode === 'mandala') drawMandala(proj, level);
  drawSites(proj, level, dive);
}

/**
 * The survey overlay — a map mode, laid over the model rather than replacing it
 * (docs/08-visual-design.md §7.3).
 *
 * An unsurveyed district is drawn as a blank survey sheet with a torn,
 * hand-drawn edge: the game saying, on the face of the map, that it does not
 * know. That is the distinction the whole mechanic exists to make — between
 * "there is nothing there" and "we have not looked".
 */
/**
 * The mandala map-mode (phase 49): the four-claim stack as a transparent
 * sheet over the model. One hue at four lightnesses — semantic colour stays
 * out of the terrain palette — and the gold outline means exactly what gold
 * always means: yours.
 */
function drawMandala(proj) {
  if (!state?.claims) return;
  const w = 28 / 9, h = 29 / 9;
  ctx.save();
  for (const c of state.claims.values()) {
    const d = state.districts.get(c.district);
    if (!d || !d.land) continue;
    const x0 = proj.toX(d.lon - w / 2), x1 = proj.toX(d.lon + w / 2);
    const y0 = proj.toY(d.lat + h / 2), y1 = proj.toY(d.lat - h / 2);
    if (x1 < 0 || y1 < 0 || x0 > cv.width || y0 > cv.height) continue;

    // Deepest applicable layer wins the wash; strength sets the alpha.
    const layer = c.holder ? 'holder' : c.revenue ? 'revenue'
                : c.tributary ? 'tributary' : c.paramount ? 'paramount' : null;
    if (layer) {
      const who = c[layer];
      const strength = c.strength[layer] ?? 0.4;
      const light = { holder: 0.36, revenue: 0.26, tributary: 0.16, paramount: 0.09 }[layer];
      ctx.fillStyle = `rgba(62,132,150,${(light * (0.5 + strength)).toFixed(3)})`;
      ctx.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
      if (who === 'you') {
        ctx.strokeStyle = 'rgba(201,162,39,.8)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeRect(x0 + 2, y0 + 2, x1 - x0 - 4, y1 - y0 - 4);
      }
    }
  }
  // The legend, on the sheet itself.
  ctx.font = `${Math.round(11 * dpr)}px Georgia, serif`;
  ctx.fillStyle = '#2A2118';
  let lx = 14 * dpr, ly = cv.height - 16 * dpr;
  for (const [layer, label] of [['holder', 'held'], ['revenue', 'taxed'],
      ['tributary', 'tributary'], ['paramount', 'paramount']]) {
    const light = { holder: 0.36, revenue: 0.26, tributary: 0.16, paramount: 0.09 }[layer];
    ctx.fillStyle = `rgba(62,132,150,${light + 0.1})`;
    ctx.fillRect(lx, ly - 9 * dpr, 12 * dpr, 10 * dpr);
    ctx.fillStyle = '#2A2118';
    ctx.fillText(label, lx + 16 * dpr, ly);
    lx += (ctx.measureText(label).width + 44 * dpr);
  }
  ctx.restore();
}

function drawSurvey(proj, level) {
  if (!state?.districts) return;
  const w = 28 / 9, h = 29 / 9;       // one grid cell, in degrees
  ctx.save();
  ctx.font = `${Math.round(10 * dpr)}px Georgia, serif`;
  ctx.textAlign = 'center';

  for (const d of state.districts.values()) {
    const x0 = proj.toX(d.lon - w / 2), x1 = proj.toX(d.lon + w / 2);
    const y0 = proj.toY(d.lat + h / 2), y1 = proj.toY(d.lat - h / 2);
    if (x1 < 0 || y1 < 0 || x0 > cv.width || y0 > cv.height) continue;

    if (d.surveyed !== null) {
      // Surveyed: the sheet lifts and the terrain shows through.
      ctx.strokeStyle = 'rgba(201,162,39,.55)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeRect(x0 + 2, y0 + 2, x1 - x0 - 4, y1 - y0 - 4);
      continue;
    }

    // Unsurveyed: paper laid over the ground, opaque in proportion to ignorance.
    const t = TIER[d.tier];
    const cover = 1 - t.trust;
    ctx.fillStyle = `rgba(216,203,170,${(0.30 + cover * 0.55).toFixed(2)})`;
    torn(ctx, x0, y0, x1, y1, d.id);
    ctx.fill();
    ctx.strokeStyle = 'rgba(42,33,24,.28)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    if (level > 1.6) {
      ctx.fillStyle = 'rgba(42,33,24,.62)';
      ctx.fillText(t.label, (x0 + x1) / 2, (y0 + y1) / 2);
    }
  }
  ctx.restore();
}

/** A rectangle with a deckle edge, so it reads as paper and not as a tile. */
function torn(ctx, x0, y0, x1, y1, key) {
  const seed = [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const wob = (i) => ((Math.sin(seed * 0.7 + i * 2.399) + 1) / 2 - 0.5) * 5 * dpr;
  ctx.beginPath();
  const n = 7;
  for (let i = 0; i <= n; i++) ctx.lineTo(x0 + (x1 - x0) * i / n, y0 + wob(i));
  for (let i = 0; i <= n; i++) ctx.lineTo(x1 + wob(i + 9), y0 + (y1 - y0) * i / n);
  for (let i = n; i >= 0; i--) ctx.lineTo(x0 + (x1 - x0) * i / n, y1 + wob(i + 18));
  for (let i = n; i >= 0; i--) ctx.lineTo(x0 + wob(i + 27), y0 + (y1 - y0) * i / n);
  ctx.closePath();
}

/**
 * Which city we are diving into, and how far in.
 *
 * Nothing happens until L8.6, and by L10.4 the city is fully drawn. The camera
 * centre has to be inside the city's own footprint — you dive into a place, not
 * into a zoom level.
 */
/**
 * The temple's people (phase 50). At street level, after 1010, the cohorts
 * the inscriptions name — 400 dancers and singers, 212 musicians — appear as
 * figures around the Brihadeeswarar: procedurally placed, seeded per decade,
 * so the courtyard crowd is stable while you watch and different when you
 * come back a generation later. Symbolic, like everything on the table.
 */
function drawTemplePeople(proj, dive, level) {
  if (dive.id !== 'thanjavur' || level < 12 || !state || state.year < 1010) return;
  const alive = state.cohorts?.some?.(c => c.site === 'thanjavur' || /THANJAVUR/.test(c.id));
  if (alive === false) return;
  const c = cityRenderer.city('thanjavur');
  const mpd = 1 / 111320;                       // metres → degrees, roughly
  const temple = c.anchors.find(a => a.name === 'Brihadeeswarar');
  if (!temple) return;
  const decade = Math.floor(state.year / 10);
  const n = Math.min(48, 12 + Math.floor(dive.alpha * 36));
  ctx.save();
  ctx.globalAlpha = dive.alpha;
  for (let i = 0; i < n; i++) {
    const u = drawFrom('temple-people', decade, i);
    const v = drawFrom('temple-people-v', decade, i);
    const mx = temple.at[0] + (u - 0.5) * (temple.size[0] + 160);
    const my = temple.at[1] + (v - 0.5) * (temple.size[1] + 160);
    const x = proj.toX(c.lon + mx * mpd / Math.cos(c.lat * Math.PI / 180));
    const y = proj.toY(c.lat + my * mpd);
    ctx.fillStyle = i % 3 ? '#2A2118' : '#8a5a2b';
    ctx.beginPath(); ctx.arc(x, y, 1.6 * dpr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // The enter strip: three rooms, live over the sim.
  const strip = $('interiors');
  if (strip) {
    strip.style.display = dive.alpha > 0.6 ? 'flex' : 'none';
  }
}

function diveTarget(proj, level) {
  if (level < 8.6) return null;
  const year = state ? state.year : -6000;
  let best = null;
  for (const c of cityData.cities) {
    if (year < c.founded) continue;
    const M = cityRenderer.model(c.id, year);
    if (!M) continue;
    const dLon = (cam.cx - c.lon) * Math.cos(c.lat * Math.PI / 180) * 111320;
    const dLat = (cam.cy - c.lat) * 110574;
    const d = Math.hypot(dLon, dLat);
    if (d > M.radius * 2.4) continue;
    if (!best || d < best.d) best = { id: c.id, d, radius: M.radius };
  }
  if (!best) return null;
  const alpha = Math.max(0, Math.min(1, (level - 8.6) / 1.8));
  return { ...best, alpha };
}

/* ── Sites ──────────────────────────────────────────────────────────────── */
/* Landmarks are symbolic markers at fixed screen size, deliberately out of
   scale — pictorial-map grammar (docs/08-visual-design.md §6.3). At L10 a real
   temple is four pixels wide; a symbol carries meaning that scale cannot. */

const SITES = [
  { id:'mehrgarh',   name:'Mehrgarh',     lon:67.72, lat:29.38, from:-6000, to:-2600, sprite:'mudbrick' },
  { id:'mohenjo',    name:'Mohenjo-daro', lon:68.14, lat:27.32, from:-2600, to:-1900, sprite:'bath' },
  { id:'dholavira',  name:'Dholavira',    lon:70.22, lat:23.89, from:-2600, to:-1900, sprite:'reservoir' },
  { id:'lothal',     name:'Lothal',       lon:72.25, lat:22.52, from:-2700, to:-1900, sprite:'basin' },
  { id:'utnur',      name:'Utnur',        lon:78.72, lat:19.38, from:-4500, to:-1500, sprite:'ashmound' },
  { id:'adichanallur',name:'Adichanallur',lon:77.87, lat:8.63,  from:-1380, to:-300,  sprite:'megalith' },
  { id:'taxila',     name:'Taxila',       lon:72.84, lat:33.74, from:-580,  to:500,   sprite:'vihara' },
  { id:'ujjain',     name:'Ujjain',       lon:75.78, lat:23.18, from:-720,  sprite:'rampart' },
  { id:'pataliputra',name:'Pataliputra',  lon:85.14, lat:25.61, from:-490,  sprite:'city' },
  { id:'sanchi',     name:'Sanchi',       lon:77.74, lat:23.48, from:-250,  sprite:'stupa' },
  { id:'madurai',    name:'Madurai',      lon:78.12, lat:9.93,  from:-300,  sprite:'city' },
  { id:'muziris',    name:'Muziris',      lon:76.25, lat:10.18, from:-300,  sprite:'port', port:true },
  { id:'anuradha',   name:'Anuradhapura', lon:80.40, lat:8.31,  from:-900,  sprite:'stupa' },
  { id:'nalanda',    name:'Nalanda',      lon:85.44, lat:25.14, from:415,   sprite:'vihara' },
  { id:'kanchi',     name:'Kanchipuram',  lon:79.70, lat:12.84, from:-300,  sprite:'vimana' },
  { id:'thanjavur',  name:'Thanjavur',    lon:79.14, lat:10.79, from:850,   sprite:'vimana' },
  { id:'konark',     name:'Konark',       lon:86.09, lat:19.89, from:1250,  sprite:'wheel' },
  { id:'bharuch',    name:'Bharuch',      lon:72.99, lat:21.71, from:-300,  sprite:'port', port:true },
  { id:'kaveripattinam',name:'Kaveripattinam',lon:79.85,lat:11.14,from:-400,sprite:'port', port:true },
];
const SITE_BY_ID = new Map(SITES.map(s => [s.id, s]));
// Native names (phase 41): each site borrows its gazetteer entry's native
// form and script, matched by name. The label is drawn native-first at close
// zoom; a site without a native form stays Latin — never tofu.
for (const s of SITES) {
  const g = gazetteer.places.find(p =>
    p.name.toLowerCase().split(' (')[0] === s.name.toLowerCase()
    || p.id === s.id);
  if (g?.native) { s.native = g.native; s.script = g.script; }
}
// data-URI faces load lazily and fonts.ready resolves before they do —
// load each script we will actually draw, with a sample glyph, then repaint.
let INDIC_READY = false;
let frameCaravans = [];
let watchedCaravan = null;   // the ordinal of the caravan being followed
{
  const wanted = new Map();
  for (const s of SITES) if (s.native) wanted.set(s.script, s.native[0]);
  Promise.all([...wanted].map(([sc, ch]) =>
    document.fonts?.load?.(`10px 'PI-${sc}'`, ch) ?? Promise.resolve()))
    .then(() => { INDIC_READY = true; })
    .catch(() => {});
}

/** Sprite images, rasterised once. */
const SPRITE_IMG = new Map();
function spriteImage(name) {
  if (!SPRITE_IMG.has(name)) {
    const img = new Image();
    img.src = spriteURL(name, 96);
    SPRITE_IMG.set(name, img);
  }
  return SPRITE_IMG.get(name);
}
for (const s of SITES) spriteImage(s.sprite);

function drawSites(proj, level, dive) {
  const year = state ? state.year : -6000;
  // Once you are inside a city, its symbolic marker is in the way of the thing
  // it stands for. The symbol dissolves into the actual building footprint —
  // that crossover IS the dive (docs/08-visual-design.md §6.3).
  const markerFade = dive ? 1 - dive.alpha : 1;
  if (markerFade <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = markerFade;

  // Routes first, under the markers. A route is drawn by its condition, not as
  // a line on a map: thickness is throughput, and a choke shows as a broken
  // line with a mark on it.
  if (state) {
    for (const r of state.routes.values()) {
      const a = SITE_BY_ID.get(r.from), b = SITE_BY_ID.get(r.to);
      if (!a || !b) continue;
      const x1 = proj.toX(a.lon), y1 = proj.toY(a.lat);
      const x2 = proj.toX(b.lon), y2 = proj.toY(b.lat);
      const t = throughput(r, year);
      ctx.lineWidth = Math.max(1, Math.min(7, t * 0.5)) * dpr;
      ctx.strokeStyle = r.choke ? 'rgba(168,100,43,.85)' : 'rgba(201,162,39,.72)';
      ctx.setLineDash(r.choke ? [6 * dpr, 5 * dpr] : []);
      ctx.beginPath(); ctx.moveTo(x1, y1);
      // Bow the line so it reads as a road, not a ruler.
      const mx = (x1 + x2) / 2 - (y2 - y1) * 0.12, my = (y1 + y2) / 2 + (x2 - x1) * 0.12;
      ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      if (r.choke) {
        ctx.fillStyle = '#A8642B';
        ctx.beginPath(); ctx.arc(mx, my, 4.5 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E8DCC2'; ctx.font = `bold ${9 * dpr}px Georgia`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('!', mx, my + 0.5 * dpr);
        ctx.textAlign = 'start';
      }
    }
    // Caravans in transit. The phase-34 ruling: sprites inside the viewport,
    // flow everywhere else. The nearest few caravans on screen draw as marks
    // with a direction nub (the sprite slot — the atlas swaps in when the real
    // assets land); every other caravan on a route thickens that route's flow
    // instead of drawing, so a hundred caravans read as a busy road, not as a
    // hundred dots.
    const onScreen = [];
    const flowByRoute = new Map();
    for (const c of state.caravans) {
      const r = state.routes.get(c.route); if (!r) continue;
      const a = SITE_BY_ID.get(r.from), b = SITE_BY_ID.get(r.to); if (!a || !b) continue;
      const k = c.state === 'outbound' ? Math.min(1, c.progress / c.days) : 1;
      const x = proj.toX(a.lon + (b.lon - a.lon) * k);
      const y = proj.toY(a.lat + (b.lat - a.lat) * k);
      const visible = x >= -20 && y >= -20 && x <= ctx.canvas.width + 20 && y <= ctx.canvas.height + 20;
      if (visible && onScreen.length < 12) onScreen.push({ x, y, a, b, c });
      else flowByRoute.set(c.route, (flowByRoute.get(c.route) ?? 0) + 1);
    }
    for (const [id, n] of flowByRoute) {
      const r = state.routes.get(id); if (!r || !r.open) continue;
      const a = SITE_BY_ID.get(r.from), b = SITE_BY_ID.get(r.to); if (!a || !b) continue;
      ctx.strokeStyle = 'rgba(42,33,24,0.30)';
      ctx.lineWidth = Math.min(4, 1 + n * 0.6) * dpr;
      ctx.beginPath();
      ctx.moveTo(proj.toX(a.lon), proj.toY(a.lat));
      ctx.lineTo(proj.toX(b.lon), proj.toY(b.lat));
      ctx.stroke();
    }
    frameCaravans = onScreen;
    for (const c of onScreen) {
      const watched = watchedCaravan && c.c?.ordinal === watchedCaravan;
      ctx.fillStyle = watched ? '#C9A227' : '#2A2118';
      ctx.beginPath(); ctx.arc(c.x, c.y, (watched ? 4.5 : 3) * dpr, 0, Math.PI * 2); ctx.fill();
      if (watched) { ctx.strokeStyle = '#C9A227'; ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.arc(c.x, c.y, 8 * dpr, 0, Math.PI * 2); ctx.stroke(); }
      const dx = c.b.lon - c.a.lon, dy = c.b.lat - c.a.lat;
      const m = Math.hypot(dx, dy) || 1;
      ctx.beginPath();
      ctx.arc(c.x + (dx / m) * 5 * dpr, c.y - (dy / m) * 5 * dpr, 1.4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    // Where it happened. Events now carry gazetteer places (phase 35); the
    // last few years' W events pulse at their location, so history lands on
    // the map instead of only in the drawer.
    if (state && !REDUCED_MOTION) {
      for (const ev of timeline.events) {
        if (ev.magnitude !== 'W') continue;
        const age = state.year - ev.year;
        if (age < 0 || age > 12) continue;
        const key = (ev.where ?? [])[0];
        const g = key && PLACE_BY_ID.get(key);
        if (!g) continue;
        const x = proj.toX(g.lon), y = proj.toY(g.lat);
        const fade = 1 - age / 12;
        ctx.strokeStyle = `rgba(201,162,39,${0.55 * fade})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(x, y, (6 + (1 - fade) * 10) * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

  }

  // Landmarks. Symbolic markers at fixed screen size, deliberately out of
  // scale — pictorial-map grammar (docs/08-visual-design.md §6.3). At L10 a real
  // temple is four pixels wide; a symbol carries meaning that scale cannot.
  const placed = [];
  const scale = (0.55 + Math.min(level, 6) * 0.10) * dpr;
  ctx.font = `${Math.round(11 * dpr)}px Georgia, serif`;
  ctx.textBaseline = 'middle';

  for (const s of SITES) {
    if (year < s.from) continue;
    const dead = s.to != null && year > s.to;
    const x = proj.toX(s.lon), y = proj.toY(s.lat);
    if (x < -60 || y < -60 || x > cv.width + 60 || y > cv.height + 60) continue;

    const img = spriteImage(spriteFor(s, year));
    const w = 46 * scale, h = 35 * scale;
    ctx.globalAlpha = dead ? 0.42 : 1;
    if (img.complete && img.naturalWidth) ctx.drawImage(img, x - w / 2, y - h + 4 * scale, w, h);
    else { ctx.fillStyle = dead ? '#6E6A62' : '#C9A227';
           ctx.beginPath(); ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;

    if (level < 1.1) continue;
    // Label collision: the Magadha cluster puts five sites within 0.9 degrees,
    // and unresolved labels stack into an unreadable smear. Skip, do not overlap.
    const tw = ctx.measureText(s.name).width;
    const bx = x - tw / 2, by = y + 8 * scale;
    const box = { x0: bx - 3, y0: by - 8 * dpr, x1: bx + tw + 3, y1: by + 8 * dpr };
    if (placed.some(p => !(box.x1 < p.x0 || box.x0 > p.x1 || box.y1 < p.y0 || box.y0 > p.y1))) continue;
    placed.push(box);

    ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(232,220,194,.9)';
    ctx.strokeText(s.name, bx, by);
    ctx.fillStyle = dead ? 'rgba(42,33,24,.5)' : '#2A2118';
    ctx.fillText(s.name, bx, by);

    // Native form beneath, at close zoom, in the script's own subset face.
    // Place names are half the atmosphere (08-visual §6.5), and a game about
    // Indian knowledge that cannot set Tamil is embarrassing.
    if (s.native && INDIC_READY && level >= 3) {
      const f = ctx.font;
      ctx.font = `${Math.round(10 * dpr)}px 'PI-${s.script}', serif`;
      const nw = ctx.measureText(s.native).width;
      const nx = x - nw / 2, ny = by + 12 * dpr;
      ctx.strokeText(s.native, nx, ny);
      ctx.fillText(s.native, nx, ny);
      ctx.font = f;
    }
  }
  ctx.restore();
}

/* ── Input ──────────────────────────────────────────────────────────────── */

let dragging = false, last = null;
cv.addEventListener('pointerdown', (e) => {
  dragging = true; last = [e.clientX, e.clientY];
  cv.classList.add('drag'); cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const proj = cam.projection(cv.width, cv.height);
  const dx = (e.clientX - last[0]) * dpr, dy = (e.clientY - last[1]) * dpr;
  cam.panBy(-dx / cv.width * cam.span, dy / cv.height * proj.spanY);
  last = [e.clientX, e.clientY];
  draw(3); scheduleFull();
});
const endDrag = () => { dragging = false; cv.classList.remove('drag'); };
cv.addEventListener('pointerup', (e) => {
  // A tap (no real drag) hit-tests the frame's caravans: click one to watch
  // it — the phase-34 ruling's exception. Click empty road to stop watching.
  const moved = last ? Math.hypot(e.clientX - last[0], e.clientY - last[1]) : 99;
  endDrag();
  if (moved > 5) return;
  const rect = cv.getBoundingClientRect();
  const px = (e.clientX - rect.left) * dpr, py = (e.clientY - rect.top) * dpr;
  const hit = frameCaravans.find(c => Math.hypot(c.x - px, c.y - py) < 14 * dpr);
  if (hit?.c?.ordinal) {
    watchedCaravan = watchedCaravan === hit.c.ordinal ? null : hit.c.ordinal;
    paintWatched();
    return;
  }
  if (mapMode === 'mandala' && state?.claims) {
    const proj = cam.projection(cv.width, cv.height);
    const lon = proj.toLon(px), lat = proj.toLat(py);
    let best = null, bd = 9;
    for (const d of state.districts.values()) {
      const dist = Math.hypot(d.lon - lon, d.lat - lat);
      if (dist < bd) { bd = dist; best = d; }
    }
    if (best && bd < 2.2) openClaims(best);
  }
});

/** The claims panel: one district's full stack, and its history here. */
function openClaims(d) {
  const c = state.claims.get(d.id);
  if (!c) return;
  const line = (layer, label) => {
    const who = c[layer];
    const occ = who && who.startsWith?.('OCC.')
      ? (occupations.occupations.find(o => o.id === who)?.name ?? who) : who;
    return `<div class="chron-line"><span class="tb-year">${label}</span>
      <span>${who ? `${occ === 'you' ? 'you' : occ} <span class="tiny muted">(${Math.round((c.strength[layer] ?? 0) * 100)}%)</span>` : '<span class="tiny muted">nobody</span>'}</span></div>`;
  };
  $('drawer-inner').innerHTML = `<div class="codex">
    <h3>${d.name}</h3>
    <p class="chron-sub">${LAYER_INFO.holder ? 'The stack, not a colour: for most of Indian history rule was graded and overlapping.' : ''}</p>
    ${line('holder', 'held by')}
    ${line('revenue', 'taxed by')}
    ${line('tributary', 'tribute to')}
    ${line('paramount', 'paramount')}
  </div>`;
  $('drawer').classList.add('on');
}
cv.addEventListener('pointercancel', endDrag);

cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = cv.getBoundingClientRect();
  const proj = cam.projection(cv.width, cv.height);
  const lon = proj.toLon((e.clientX - rect.left) * dpr);
  const lat = proj.toLat((e.clientY - rect.top) * dpr);
  cam.zoomAt(e.deltaY > 0 ? 1.14 : 0.88, lon, lat);
  draw(3); scheduleFull();
}, { passive: false });

// Pinch zoom.
let pinch = null;
cv.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 2) return;
  e.preventDefault();
  const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                       e.touches[0].clientY - e.touches[1].clientY);
  if (pinch) { cam.zoomAt(pinch / d, cam.cx, cam.cy); draw(3); scheduleFull(); }
  pinch = d;
}, { passive: false });
cv.addEventListener('touchend', () => { pinch = null; });

/* ── Map modes: transparent sheets laid over the model ──────────────────── */

let mapMode = 'terrain';
const MODES = [
  { id: 'terrain', label: 'terrain', hint: 'The land, before anyone owns it.' },
  { id: 'survey',  label: 'survey',  hint: 'What we know, and what we have not looked at.' },
  { id: 'mandala', label: 'mandala', hint: 'Sovereignty as it actually was: held, taxed, tributary, paramount — four claims, not one colour.' },
];
$('modes').innerHTML = MODES.map(m =>
  `<button class="tab" role="tab" data-mode="${m.id}" title="${m.hint}"
     aria-selected="${m.id === 'terrain'}">${m.label}</button>`).join('');
$('modes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (!b) return;
  mapMode = b.dataset.mode;
  for (const t of $('modes').children) t.setAttribute('aria-selected', t === b);
  draw(1);
});

/* ── The game ───────────────────────────────────────────────────────────── */

/* ── Save, load, share ──────────────────────────────────────────────────── */

let SEED = new URLSearchParams(location.search).get('seed') ?? 'paramountcy';
let decisions = [];

// A campaign in a link. The fragment is the save, so opening somebody's link
// opens their exact campaign — the whole point of storing decisions.
if (location.hash.length > 2) {
  try {
    const sv = reconcile(fromURLFragment(location.hash.slice(1)), DP);
    SEED = String(sv.seed);
    decisions = sv.d;
    if (sv.at) queueMicrotask(() => { target = sv.at; recompute(); draw(1); });
    if (sv.dropped) console.info(`${sv.dropped} decision(s) dropped — the datapack has moved on.`);
  } catch (e) {
    console.warn('That link is not a campaign:', e.message);
  }
}
let state = null;
let campaign = null;          // null = the long campaign
let target = -6000;
let playing = false;
let speed = 1;

const SPEEDS = [1, 5, 25, 100];
let speedIdx = 0;

/** Recompute the world from (datapack, seed, decisions). The rule, literally. */
function recompute() {
  // The failure surface (phase 54): a sim fault must never be a white screen.
  // The save is a recipe, so even an uncomputable world keeps its full record.
  try {
    state = run(DP, SEED, decisions, campaign
      ? { from: campaign.from, to: target, initial: openingState(campaign) }
      : { to: target });
    paint();
  } catch (e) {
    playing = false; $('play').textContent = '▶ play';
    showDamaged(e);
  }
}

function showDamaged(e) {
  console.error(e);
  let blob = '';
  try { blob = JSON.stringify(mkSave(SEED, decisions, { year: target })); } catch {}
  $('drawer-inner').innerHTML = damagedHTML(e, blob, globalThis.__BUILD);
  $('drawer').classList.add('on');
  $('drawer-inner').querySelector('[data-copy-save]')?.addEventListener('click', (ev) => {
    navigator.clipboard?.writeText(blob);
    ev.target.textContent = 'copied';
  });
}

/* ── Campaigns ──────────────────────────────────────────────────────────── */

$('start').addEventListener('click', (e) => {
  const b = e.target.closest('[data-campaign]');
  if (!b) return;
  if (b.dataset.campaign === 'chola') {
    campaign = CHOLA;
    target = CHOLA.from;
    cam.cx = 79.14; cam.cy = 10.79; cam.span = 9;
  } else {
    campaign = null;
    target = -6000;
  }
  decisions = [];
  $('start').classList.add('off');
  recompute(); syncScrub(); draw(3); scheduleFull();
});

/**
 * The reckoning.
 *
 * Reports what survived, then what it cost, and does not add them up. A number
 * would let the player stop reading.
 */
let reckoned = false;
function showReckoning() {
  if (reckoned) return;
  reckoned = true;
  const r = reckoning(state);
  const list = (items, cls) => items.map(o =>
    `<li class="${cls}"><b>${o.name}</b><span>${o.note}</span></li>`).join('');
  $('drawer-inner').innerHTML = `<article class="card">
    <header class="ribbon"><span>${formatYear(r.year)}</span>
      <span>${campaign ? campaign.name : 'The long campaign'}</span>
      <span>the reckoning</span></header>
    <h3>${r.verdict}</h3>
    <p class="what">${r.corpus.extant} works extant · ${r.corpus.lost} lost ·
      ${r.savedAbroad} of them somewhere other than home.
      ${r.schools} schools standing, ${r.schoolsLost} ended.
      ${r.survey.surveyed} districts surveyed, ${r.survey.absent} never looked at.</p>
    ${r.savedTitles.length ? `<p class="why">Out of reach when it mattered:
      ${r.savedTitles.join(', ')}.</p>` : ''}
    <div class="reck">
      <ul class="reck-met">${list(r.met, 'met')}</ul>
      <ul class="reck-missed">${list(r.missed, 'missed')}</ul>
    </div>
    ${r.frontier.length ? `<div class="evidence"><b>The treeline</b><p>${
      r.frontier.map(f => `${f.name.replace(/^The /, '')}: ${
        f.taught.length ? `taught you ${f.taught.length}` : 'taught you nothing'}${
        f.displaced ? `, ${f.displaced}% displaced` : ''}`).join('. ')}.</p></div>` : ''}
  </article>`;
  $('drawer').classList.add('on');
}

function decide(action, extra = {}) {
  TELEMETRY.decision();
  decisions.push({ year: state.year, action, ...extra });
  recompute();
  syncScrub();
}

/* ── The teaching slips (phase 48) ──────────────────────────────────────── */

const SLIP_TRACKER = makeSlipTracker();
let slipsOn = true;
let lastEraId = null;
let lossCountSeen = 0;
let activeSlip = null;

function checkSlips() {
  if (!slipsOn || !state || activeSlip) return;
  const eraId = eraOf(state.year)?.id;
  const eraTurned = lastEraId !== null && eraId !== lastEraId;
  lastEraId = eraId;
  const losses = state.log.filter(l => l.kind === 'loss').length;
  const extras = {
    atRisk: worksAtRisk(state, 'home').length,
    frontierHere: frontierPresent(state).length,
    eraTurned,
    losses: losses > lossCountSeen ? losses : 0,
  };
  lossCountSeen = losses;
  const slip = SLIP_TRACKER.next(state, extras);
  if (!slip) return;
  activeSlip = slip.id;
  TELEMETRY.slipShown?.();
  const shownAt = performance.now();
  const el = document.createElement('div');
  el.className = 'slip-teach';
  el.innerHTML = `<span>${slip.text}</span><button class="btn tiny" data-slip-ok>noted</button>`;
  el.querySelector('[data-slip-ok]').addEventListener('click', () => {
    if (performance.now() - shownAt < 2000) TELEMETRY.slipDismissedUnread?.();
    el.remove(); activeSlip = null;
  });
  $('slips').append(el);
}

/* ── The watched caravan (phase 45) ─────────────────────────────────────── */

let sceneShownFor = null;
function paintWatched() {
  const el = $('watched');
  if (!el) return;
  const c = watchedCaravan && state?.caravans.find(x => x.ordinal === watchedCaravan);
  if (!c) { el.style.display = 'none'; watchedCaravan = null; return; }
  const r = state.routes.get(c.route);
  el.style.display = '';
  const phase = c.state === 'outbound'
    ? `${Math.min(100, Math.round(c.progress / c.days * 100))}% of ${c.days} days out`
    : 'settling — payment is a second journey';
  el.innerHTML = `<b>Watching a caravan · ${c.route}</b>
    <span>${phase} · cargo ${Math.round(c.value)} grain-worth · road safety ${Math.round((r?.safety ?? 0) * 100)}%</span>
    ${r?.choke ? `<span class="warn-line">${CHOKES[r.choke.kind].label} ahead</span>` : ''}
    <button class="btn tiny" data-unwatch>stop watching</button>`;

  // The scene: the caravan you are watching meets the trouble. Time pauses,
  // one panel, the choices the choke type allows — the resolver stays in the
  // sim; this panel only asks the question.
  if (r?.choke && c.state === 'outbound' && !c.met && sceneShownFor !== c.ordinal) {
    sceneShownFor = c.ordinal;
    if (playing) { playing = false; $('play').textContent = '▶ play'; TELEMETRY.paused(); }
    const spec = CHOKES[r.choke.kind];
    const opts = [...new Set(['fight', 'pay', 'reroute', 'wait'])]
      .filter(m => m === 'wait' || spec.works.includes(m) || m === 'pay');
    const overlay = document.createElement('div');
    overlay.className = 'plate-overlay scene';
    overlay.innerHTML = `<div class="scene-box">
      <img alt="" src="${spriteURL('rampart', 96)}">
      <h3>${spec.label}</h3>
      <p>Your caravan on ${r.route ?? c.route} — ${Math.round(c.value)} grain-worth of cargo —
         meets it ${Math.round(c.days - c.progress)} days from home.</p>
      <div class="scene-acts">${opts.map(m =>
        `<button class="btn ${m === 'fight' ? 'btn--primary' : ''}" data-scene="${m}"
           title="${m === 'fight' ? `Soldiers decide it: ${state.pops.soldiers} available.`
                 : m === 'pay' ? 'A cut of the cargo, and the road.'
                 : m === 'reroute' ? 'The long way round: +40% days.'
                 : 'Camp, and hope it moves on: days and a little cargo.'}">${m}</button>`).join('')}
      </div></div>`;
    overlay.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-scene]');
      if (!b) return;
      decide('resolve-encounter', { route: c.route, ordinal: c.ordinal, method: b.dataset.scene });
      overlay.remove();
    });
    document.body.append(overlay);
  }
}
document.addEventListener('click', (e) => {
  if (e.target.closest?.('[data-unwatch]')) { watchedCaravan = null; paintWatched(); }
});

/* ── Painting the UI ────────────────────────────────────────────────────── */

const PILLARS = ['DESIGN','IT','STRUCTURE','CLASSICISM','NETWORKING','TRADE','CULTIVATION','AGRICULTURE'];
const ERA_MATERIAL = (y) =>
  y < -3300 ? 'neolithic' : y < -1300 ? 'bronze' : y < -200 ? 'iron'
  : y < 650 ? 'classical' : y < 1500 ? 'medieval' : 'modern';

let lastLogLen = 0;

/* ── The status bar vitals (phase 3) ────────────────────────────────────────
 * The zero-click layer: grain, the corpus, trust, four pillar glyphs. Every
 * readout is a click-through and every danger state shows without opening
 * anything. Flow is computed against the last painted year, so scrubbing
 * backwards never fabricates a trend. */
let lastVital = null;
const VITAL_PILLARS = ['AGRICULTURE', 'TRADE', 'STRUCTURE', 'NETWORKING'];
function paintVitals(s) {
  const risk = worksAtRisk(s, 'home');
  const last = risk.filter(w => w.carriers <= 1).length;
  const cs = corpusSummary(s);
  const cap = trustCeiling(s, DP);
  const rung = trustRung(s, cap);
  const capped = cap != null && s.pillars.NETWORKING > cap;
  let flow = '';
  if (lastVital && s.year > lastVital.year) {
    const d = (s.grain - lastVital.grain) / (s.year - lastVital.year);
    flow = ` <small>${d >= 0 ? '+' : ''}${Math.round(d)}/yr</small>`;
  }
  const falling = lastVital && s.year > lastVital.year && s.grain < lastVital.grain;
  lastVital = { year: s.year, grain: s.grain };
  const grainCls = s.grain < 100 ? 'dire' : falling ? 'bad' : '';
  // At a fresh start EVERYTHING is technically at risk, which makes "at risk"
  // noise. The middle number is the count that cannot wait: works down to one
  // carrier — one fire, one fever, and the text is gone.
  const corpusCls = last > 0 ? 'dire' : cs.lost > 0 ? 'bad' : '';
  $('vitals').innerHTML =
    `<span class="vital ${grainCls}" data-goto="ledger" title="The treasury, and its flow. Click: the Ledger.">
       <span class="k">Grain</span><span class="v">${Math.round(s.grain).toLocaleString()}${flow}</span></span>
     <span class="vital ${corpusCls}" data-goto="chest" title="Extant · at last carrier · lost. Click: the Library.">
       <span class="k">Corpus</span><span class="v">${cs.extant} · ${last} · ${cs.lost}</span></span>
     <span class="vital ${capped ? 'bad' : ''}" data-goto="pillars" title="The trust ladder${capped ? ` — capped at ${cap} under occupation` : ''}. Click: the gauges.">
       <span class="k">Trust</span><span class="v">${rung.name}</span></span>
     <span class="pillarglyphs" data-goto="pillars" title="Agriculture · Trade · Structure · Networking. Click: the full gauges.">
       ${VITAL_PILLARS.map(p => `<span class="pg"><i style="height:${Math.round(s.pillars[p])}%"></i></span>`).join('')}</span>`;
}
$('vitals').addEventListener('click', (e) => {
  const v = e.target.closest('[data-goto]');
  if (!v) return;
  const target = { ledger: '.ledger', chest: '#chest', pillars: '#pillars' }[v.dataset.goto];
  document.querySelector(target)?.scrollIntoView({ block: 'center' });
});

function paint() {
  const s = state;
  $('year').textContent = formatYear(s.year);
  const era = timeline.eras.find(e => s.year >= e.from && s.year < e.to) ?? timeline.eras[15];
  $('era').textContent = campaign ? chapterAt(s.year).name : era.name;
  if (campaign) $('era').title = chapterAt(s.year).asks;
  document.body.dataset.era = ERA_MATERIAL(s.year);
  $('gnomon').style.setProperty('--sun', `${((s.year + 6000) / 7947 * 300 - 150).toFixed(0)}deg`);

  const n = (v) => Math.round(v).toLocaleString();
  $('grain').textContent    = n(s.grain);
  $('coin').textContent     = s.coinageKnown ? n(s.coin) : '—';
  $('farmers').textContent  = n(s.pops.farmers);
  $('reciters').textContent = n(s.pops.reciters);
  $('scribes').textContent  = n(s.pops.scribes);
  $('soldiers').textContent = n(s.pops.soldiers);
  paintVitals(s);

  $('pillars').innerHTML = PILLARS.map(p => {
    const v = Math.round(s.pillars[p]);
    return `<div class="pillar"><span class="tiny">${p[0] + p.slice(1).toLowerCase()}</span>
      <span class="bar"><i style="width:${v}%"></i></span><span class="n">${v}</span></div>`;
  }).join('');

  const cs = corpusSummary(s);
  $('corpus-sum').textContent = `${cs.extant} extant · ${cs.lost} lost · ${cs.unwritten} to come`;
  const risky = new Set(worksAtRisk(s, 'home').slice(0, 40).map(w => w.id));
  const rows = [...s.corpus.values()]
    .filter(c => c.exists || c.lost)
    .sort((a, b) => (a.lost - b.lost) || (a.carriers.length - b.carriers.length))
    .slice(0, 70);
  $('chest').innerHTML = rows.map(c => {
    const cls = c.lost ? 'work--lost' : risky.has(c.id) ? 'work--risk' : 'work--safe';
    const meta = c.lost ? `lost ${formatYear(c.lostYear)}`
      : `${c.carriers.length}×${c.carriers.some(x => x.place !== 'home') ? ' ✈' : ''}`;
    return `<div class="work ${cls}" data-work="${c.id}">
      <span class="title">${c.title}</span><span class="meta">${meta}</span></div>`;
  }).join('');

  $('goods').innerHTML = [...s.goods].map(g => `<span class="token">${g}</span>`).join('');

  const interesting = s.log.filter(l =>
    ['epoch','catastrophe','loss','goods','teacher','decision','famine','texture','preserve'].includes(l.kind));
  $('log').innerHTML = interesting.slice(-40).reverse().map(l =>
    `<div data-year="${l.year}" title="Open the year page for ${formatYear(l.year)}"
        style="cursor:pointer"><span class="y">${formatYear(l.year)}</span>${l.text}</div>`).join('');

  // New notices since the last paint.
  for (const l of interesting.slice(lastLogLen)) {
    if (['catastrophe','epoch','loss'].includes(l.kind)) notice(l);
    // One deliberate silence, in 1193.
    if (l.kind === 'catastrophe' && /Nalanda sacked/.test(l.text)) sound.silence(4);
    else if (l.kind === 'catastrophe') sound.strike('loss');
    else if (l.kind === 'epoch') sound.strike('epoch');
    // The m-tier, audible: each texture incident is one quiet strike in its
    // family's timbre (phase 52).
    else if (l.kind === 'texture') sound.strikeFamily(textureFamily(l.template));
  }
  lastLogLen = interesting.length;
  syncSound();

  paintActions();
  paintRoutes();
  paintPeople();
  paintSurvey();
  paintFrontier();
  paintIndus();
  paintWatched();
  checkSlips();
  paintLocks();
}

/**
 * The emptying (phase 38). Visible only during the Indus era: each town's
 * water as a draining gauge, and the three verbs — provision, wells,
 * resettle. The panel never offers rescue, because the era has none.
 */
function paintIndus() {
  const s = state;
  const inEra = s && s.year >= -2600 && s.year <= -1900 && s.indus;
  $('indus-h').style.display = inEra ? '' : 'none';
  if (!inEra) { $('indus').innerHTML = ''; return; }
  const towns = [...s.indus.values()];
  const standing = towns.filter(t => t.standing).length;
  const c = s.indusCarried;
  $('indus-sum').textContent =
    `${standing}/${towns.length} standing · ${Math.round(c.resettled)} resettled east`;
  $('indus').innerHTML = towns.map(t => {
    const w = Math.round(t.water * 100);
    const cls = t.water > 0.5 ? 'ok' : t.water > 0.25 ? 'warn' : 'dry';
    return `<div class="per${t.standing ? '' : ' gone'}"
      title="${t.standing ? `Water ${w}%. Provisioning slows the drift; wells buy a generation; a planned column east carries seed, tools and the songs.` : 'Empty. Nobody sacked it.'}">
      <span class="nm">${t.name}</span>
      <span class="indus-water indus-${cls}" style="--w:${w}%"></span>
      ${t.standing ? `
        <button class="btn tiny" data-indus="provision-town" data-town="${t.id}"
          ${s.grain < 120 ? 'disabled' : ''}>provision</button>
        <button class="btn tiny" data-indus="dig-wells" data-town="${t.id}"
          ${t.wells >= 3 || s.grain < 80 ? 'disabled' : ''}>wells</button>
        <button class="btn tiny" data-indus="resettle-east" data-town="${t.id}"
          ${t.people <= 0 || s.grain < 100 ? 'disabled' : ''}>resettle east</button>`
      : `<span class="tiny muted">empty</span>`}
    </div>`;
  }).join('');
}
$('indus').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-indus]');
  if (b && !b.disabled) decide(b.dataset.indus, { town: b.dataset.town });
});

/**
 * The frontier panel.
 *
 * Learn and clear sit next to each other on purpose. Both were available and
 * both happened; the game keeps score of which you chose, and the ledger below
 * does not let you forget.
 */
function paintFrontier() {
  const s = state;
  if (!s.frontier) return;
  const here = frontierPresent(s);
  const led = frontierLedger(s);
  const taught = led.reduce((n, x) => n + x.taught.length, 0);
  const gone = led.filter(x => x.gone).length;
  $('frontier-sum').textContent = here.length
    ? `${here.length} on the treeline${taught ? ` · ${taught} learned` : ''}${gone ? ` · ${gone} gone` : ''}`
    : (gone ? `${gone} gone` : '');

  $('frontier').innerHTML = here.length ? here.slice(0, 5).map(f => {
    const can = (how) => s.grain >= STANCE[how].cost;
    const learned = f.taught.length, total = f.knows.length;
    return `<div class="per" title="${(f.note ?? '')} They know: ${f.knows.join('; ')}.">
      <span class="nm">${f.name.replace(/^The /, '')}
        <span class="role">${f.practice}${learned ? ` · learned ${learned}/${total}` : ''}${
          f.displaced > 0 ? ` · ${Math.round(f.displaced * 100)}% displaced` : ''}</span></span>
      <span class="stances">
        <button class="btn" data-frontier="${f.id}" data-how="trade" ${can('trade') ? '' : 'disabled'}
          title="40 grain. Opens exchange.">trade</button>
        <button class="btn btn--primary" data-frontier="${f.id}" data-how="learn"
          ${can('learn') && learned < total ? '' : 'disabled'}
          title="90 grain. Their knowledge enters your corpus — which the historical record mostly did not do.">learn</button>
        <button class="btn" data-frontier="${f.id}" data-how="clear" ${can('clear') ? '' : 'disabled'}
          title="150 grain. Takes a third of their range for the plough, and costs you their regard for good.">clear</button>
      </span></div>`;
  }).join('') : `<div class="tiny muted">Nobody on the treeline here.</div>`;

  if (led.length) {
    $('frontier').innerHTML += `<div class="rule"></div>` + led.map(x =>
      `<div class="endw ${x.gone ? 'dead' : ''}">
        <span>${x.name.replace(/^The /, '')}</span>
        <span class="num">${x.taught.length ? `+${x.taught.length} learned` : ''}${
          x.displaced ? ` −${x.displaced}%` : ''}</span></div>`).join('');
  }
}

/** What is locked, and what would unlock it. A horizon, not a wall. */
function paintLocks() {
  const s = state;
  const cap = trustCeiling(s, DP);
  const rung = trustRung(s, cap), next = nextRung(s);
  const capped = cap != null && s.pillars.NETWORKING > cap;
  $('trust-rung').textContent = `trust: ${rung.name}` +
    (capped ? ` — capped at ${cap} under occupation`
            : next ? ` → ${next.name} at ${next.need}` : '');
  // Occupation weather: the standing banner. Rule is a season, not a bang.
  const active = (occupations.occupations ?? [])
    .filter(o => s.occupationsActive?.has(o.id));
  $('occupation-banner').innerHTML = active.map(o =>
    `<div class="occ-banner" title="${o.note}">
       <b>${o.name}</b><span class="tiny">${o.extract ? ` · takes ${o.extract} grain/yr` : ''}${
       Object.keys(o.patronage ?? {}).length ? ` · patronises ${Object.keys(o.patronage).map(x => x.toLowerCase()).join(', ')}` : ''}${
       o.trustCap != null ? ` · caps trust at ${o.trustCap}` : ''}</span>
     </div>`).join('');
  const l = locked(s);
  $('locked').innerHTML = l.length
    ? l.slice(0, 4).map(x =>
        `<div title="${x.block.why}"><b>${x.action}</b> needs ${
          x.block.pillar.toLowerCase()} ${x.block.need} — you have ${x.block.have}</div>`).join('')
    : '';
}

$('frontier').addEventListener('click', (e) => {
  const b = e.target.closest('[data-frontier]');
  if (b && !b.disabled) decide('frontier', { people: b.dataset.frontier, how: b.dataset.how });
});

function paintSurvey() {
  const s = state;
  if (!s.districts) return;
  const sum = surveySummary(s);
  $('survey-sum').textContent =
    `${sum.surveyed} surveyed · ${sum.absent} never looked at`;

  const can = s.grain >= SURVEY_COST.grain && s.pops.scribes >= 1;
  const next = surveyable(s).slice(0, 4);
  $('survey').innerHTML = next.length
    ? next.map(d => `<div class="per">
        <span class="prov prov--${d.tier === 'ABSENT' ? 'SYNTHESIZED' : 'DERIVED'}"
              title="${TIER[d.tier].label}">${d.tier[0]}</span>
        <span class="nm">${d.name} <span class="role">${TIER[d.tier].label}</span></span>
        ${can ? `<button class="btn" data-survey="${d.id}">survey</button>`
              : '<span class="tiny muted">—</span>'}
      </div>`).join('')
    : `<div class="tiny muted">Everything has been looked at.</div>`;
}

$('survey').addEventListener('click', (e) => {
  const b = e.target.closest('[data-survey]');
  if (b) decide('survey', { district: b.dataset.survey });
});

/**
 * The people panel.
 *
 * Provenance is on the face of it, always. A player must be able to see at a
 * glance that Sembiyan Mahadevi is named in an inscription and the reciter in
 * her school is not — because the difference between what the record holds and
 * what this game invented to stand in its place is the most important thing the
 * interface has to communicate.
 */
function paintPeople() {
  const s = state;
  const alive = living(s);
  const canEndow = endowable(s);
  $('people-sum').textContent = alive.length
    ? `${alive.length} living · ${s.schools.size} schools`
    : `${s.schools.size} schools`;

  const chip = (p) =>
    `<span class="prov prov--${p.provenance}" title="${p.provenance === 'SOURCED'
      ? 'Named in an inscription or a text.'
      : p.provenance === 'DERIVED'
      ? 'Attested, but a detail here is inferred.'
      : 'Generated to stand where a real person stood.'}">${p.provenance[0]}</span>`;

  const rows = alive.slice(0, 12).map(p => {
    const can = canEndow.includes(p) && s.grain >= (p.role === 'architect' ? 260 : 160);
    const title = (p.note ?? '').replace(/"/g, '&quot;');
    return `<div class="per" title="${title}">
      ${chip(p)}
      <span class="nm">${p.name}${p.dispute ? ' <span class="disputed" title="Scholarship is divided about this person.">‡</span>' : ''}
        <span class="role">${p.role}</span></span>
      ${p.patronised ? '<span class="tiny muted">kept</span>'
        : can ? `<button class="btn" data-endow="${p.id}">endow</button>`
        : p.role === 'ruler' ? '' : '<span class="tiny muted">—</span>'}
    </div>`;
  }).join('');

  $('people').innerHTML = rows ||
    `<div class="tiny muted">Nobody the record names is at work. Your schools carry it.</div>`;

  const led = endowmentLedger(s);
  $('endowments').innerHTML = led.length
    ? `<div class="rule"></div>` + led.slice(0, 6).map(e =>
        `<div class="endw ${e.stillPaying ? '' : 'dead'}"
           title="${e.stillPaying
             ? `Still paying after ${Math.round(e.years)} years, through ${e.aliveHeirs} living heir(s) and ${e.downstream.toFixed(1)} surviving derived work(s).`
             : `Stopped. The line died and nothing derived from it survives.`}">
           <span>${e.name}</span>
           <span class="num">${Math.round(e.returned)} · ${Math.round(e.years)}y</span></div>`).join('')
    : '';
}

$('drawer-close').addEventListener('click', () => $('drawer').classList.remove('on'));
$('drawer').addEventListener('click', (e) => {
  if (e.target === $('drawer')) $('drawer').classList.remove('on');
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('drawer').classList.remove('on');
});

// The chronicle opens the year page; a notice opens its own card.
$('log').addEventListener('click', (e) => {
  const row = e.target.closest('[data-year]');
  if (row) openYear(+row.dataset.year);
});
$('notices').addEventListener('click', (e) => {
  const n = e.target.closest('[data-event]');
  if (!n) return;
  const ev = timeline.events.find(x => x.id === n.dataset.event);
  if (ev) openCard(ev);
});

$('people').addEventListener('click', (e) => {
  const b = e.target.closest('[data-endow]');
  if (b) decide('endow', { person: b.dataset.endow });
});

/**
 * Routes, shown as their four numbers rather than as lines on a map.
 *
 * Throughput is capacity x hold x safety x season — a product, so a route is
 * only as good as its worst number (docs/11-trade-network.md §3). Showing all
 * four is what makes that legible: a magnificent road you do not control
 * delivers nothing, and the player should be able to see which number is the
 * one holding them back.
 */
function paintRoutes() {
  const s = state;
  const rs = [...s.routes.values()];
  $('routes').innerHTML = rs.length ? rs.map(r => {
    const bar = (v) => `<span><i><b style="width:${Math.round(v * 100)}%"></b></i></span>`;
    const t = throughput(r, s.year);
    return `<div class="route ${r.choke ? 'choked' : ''}">
      <div class="nm"><span>${r.from} → ${r.to}</span>
        <span class="num">${r.choke ? CHOKES[r.choke.kind].label : t.toFixed(1) + '/yr'}</span></div>
      <div class="four" title="capacity · hold · safety · season">
        ${bar(Math.min(1, r.capacity / 20))}${bar(r.hold)}${bar(r.safety)}${bar(0.9)}</div>
    </div>`;
  }).join('') : `<div class="tiny muted">No routes yet. Trade begins with the people you already know.</div>`;

  const acts = [];
  // The trust ladder: you start with your relatives and those nearby.
  const OPENABLE = [
    { id:'R.KAVERI',  from:'thanjavur', to:'kaveripattinam', days:6,  capacity:8,  need:850,  mode:'land' },
    { id:'R.MALABAR', from:'thanjavur', to:'muziris',        days:22, capacity:12, need:-300, mode:'land' },
    { id:'R.WEST',    from:'muziris',   to:'bharuch',        days:48, capacity:16, need:-300, mode:'sea'  },
  ];
  for (const r of OPENABLE) {
    if (s.routes.has(r.id) || s.year < r.need) continue;
    const from = SITE_BY_ID.get(r.from), to = SITE_BY_ID.get(r.to);
    if (!from || s.year < from.from || !to || s.year < to.from) continue;
    acts.push(`<button class="btn" data-route="open" data-id="${r.id}"
      data-from="${r.from}" data-to="${r.to}" data-days="${r.days}"
      data-capacity="${r.capacity}" data-mode="${r.mode}"
      title="Opening a route costs nothing but attention. Keeping it open costs everything else.">
      Open ${to.name} route</button>`);
  }
  for (const r of s.routes.values()) {
    const o = r.orders ?? { escort: 'none', chokePolicy: 'wait' };
    const onMission = s.missions?.some(m => m.route === r.id);
    if (r.choke) {
      const spec = CHOKES[r.choke.kind];
      if (onMission)
        acts.push(`<span class="route-note" title="The expedition is on the road. Missions take as long as the march.">
          ⚑ expedition out on ${r.id}</span>`);
      else if (spec.works.includes('fight'))
        acts.push(`<button class="btn btn--primary" data-route="mission" data-id="${r.id}"
          title="${spec.label}. An expedition marches ${r.days * 2} days out and the same back — 60 grain.">
          Launch expedition — ${r.to}</button>`);
      if (spec.works.includes('pay') && !r.tolled)
        acts.push(`<button class="btn" data-route="clear" data-id="${r.id}" data-method="pay"
          title="${spec.label} — pay, this once.">Pay the toll</button>`);
      if (spec.works.includes('reroute'))
        acts.push(`<button class="btn" data-route="clear" data-id="${r.id}" data-method="reroute"
          title="${spec.label} — the long way round.">Reroute</button>`);
    } else {
      acts.push(`<button class="btn" data-route="caravan" data-id="${r.id}"
        title="Goods take days. Payment takes longer.">Send caravan</button>`);
    }
    // Standing orders: the road's policy, obeyed for a century without a click.
    acts.push(`<div class="orders" data-orders="${r.id}">
      <span class="tiny muted">${r.id}</span>
      ${['none','light','heavy'].map(l =>
        `<button class="btn tiny ${o.escort === l ? 'btn--on' : ''}"
           data-esc="${l}" title="${l === 'none' ? 'No standing escort.'
             : l === 'light' ? 'Light escort: 2 grain a year, safety floor 0.45.'
             : 'Heavy escort: 6 grain a year, safety floor 0.75.'}">${l}</button>`).join('')}
      <select data-pol title="What the road does at trouble when nobody is watching.">
        ${['wait','pay','reroute','fight'].map(pn =>
          `<option value="${pn}" ${o.chokePolicy === pn ? 'selected' : ''}>${pn}</option>`).join('')}
      </select>
    </div>`);
  }
  $('route-acts').innerHTML = acts.join('');
}

$('route-acts').addEventListener('click', (e) => {
  const b = e.target.closest('[data-route]');
  if (!b) return;
  const d = b.dataset;
  if (d.route === 'open')
    decide('open-route', { id: d.id, from: d.from, to: d.to,
                           days: +d.days, capacity: +d.capacity, mode: d.mode });
  else if (d.route === 'clear')    decide('clear-choke', { route: d.id, method: d.method });
  else if (d.route === 'caravan')  decide('send-caravan', { route: d.id });
  else if (d.route === 'mission')  decide('start-mission', { route: d.id, method: 'fight' });
});
$('route-acts').addEventListener('click', (e) => {
  const esc = e.target.closest('[data-esc]');
  if (!esc) return;
  const box = esc.closest('[data-orders]');
  const pol = box.querySelector('[data-pol]').value;
  decide('set-orders', { route: box.dataset.orders, escort: esc.dataset.esc, chokePolicy: pol });
});
$('route-acts').addEventListener('change', (e) => {
  const pol = e.target.closest('[data-pol]');
  if (!pol) return;
  const box = pol.closest('[data-orders]');
  const cur = state.routes.get(box.dataset.orders)?.orders?.escort ?? 'none';
  decide('set-orders', { route: box.dataset.orders, escort: cur, chokePolicy: pol.value });
});

function paintActions() {
  const s = state;
  const atRisk = worksAtRisk(s, 'home').filter(w => w.carriers <= 3);
  const gate = (a) => blocked(s, a);
  const acts = [
    { a:'patronise',      label:'Feed a reciter',   ok: s.grain >= 50,
      tip:'50 grain. One more work held in living memory.' },
    { a:'train-scribe',   label:'Train a scribe',   ok: s.grain >= 80,
      tip:'80 grain. Scribes maintain manuscripts and make new ones.' },
    { a:'raise-soldiers', label:'Raise 5 soldiers', ok: s.grain >= 100,
      tip:'100 grain. Soldiers make roads safe for caravans.' },
  ].map(x => {
    const g = gate(x.a);
    return g ? { ...x, ok: false, tip: g.why } : x;
  });
  let html = acts.map(x =>
    `<button class="btn" data-act="${x.a}" ${x.ok ? '' : 'disabled'} title="${x.tip}">${x.label}</button>`
  ).join('');

  if (atRisk.length && s.grain >= 120 && (s.pops.scribes >= 1 || s.pops.reciters >= 2)) {
    html += `<button class="btn btn--primary" data-act="send-teacher"
      title="120 grain and one of your keepers. A copy that reaches a monastery is maintained there — for ever.">
      Send a teacher &nbsp;<span class="num">${atRisk.length}</span> at risk</button>`;
  }
  $('acts').innerHTML = html;
}

$('acts').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === 'send-teacher') {
    const w = worksAtRisk(state, 'home').filter(x => x.carriers <= 3)[0];
    if (w) decide('send-teacher', { work: w.id, destination: 'tibet' });
  } else {
    decide(a);
  }
});

function notice(l) {
  const kind = l.kind === 'catastrophe' ? 'notice--loss'
             : l.kind === 'loss' ? 'notice--loss'
             : l.kind === 'epoch' ? 'notice--epoch'
             : l.kind === 'texture' ? 'notice--texture' : 'notice--good';
  const el = document.createElement('div');
  el.className = `notice ${kind}`;
  if (l.id) { el.dataset.event = l.id; el.style.cursor = 'pointer';
              el.title = 'Open the card'; el.style.pointerEvents = 'auto'; }
  el.innerHTML = `<b>${formatYear(l.year)}</b> — ${l.text}`;
  $('notices').append(el);
  setTimeout(() => { el.style.transition = 'opacity 500ms'; el.style.opacity = 0;
                     setTimeout(() => el.remove(), 520); }, 5200);
  while ($('notices').children.length > 4) $('notices').firstChild.remove();
}

/* ── Keyboard and motion (phase 51) ─────────────────────────────────────── */

const REDUCED_MOTION = matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

cv.addEventListener('keydown', (e) => {
  const step = cam.span * 0.08;
  switch (e.key) {
    case 'ArrowLeft':  cam.cx -= step; break;
    case 'ArrowRight': cam.cx += step; break;
    case 'ArrowUp':    cam.cy += step * 0.7; break;
    case 'ArrowDown':  cam.cy -= step * 0.7; break;
    case '+': case '=': cam.zoomAt(0.85, cam.cx, cam.cy); break;
    case '-': case '_': cam.zoomAt(1.18, cam.cx, cam.cy); break;
    case ' ': e.preventDefault(); $('play').click(); return;
    default: return;
  }
  e.preventDefault();
  draw(3); scheduleFull();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('drawer').classList.remove('on');
    document.querySelector('.plate-overlay')?.remove();
  }
});

/* ── Test hook (headless drives only; not a player surface) ─────────────── */
window.__test = {
  year: () => state?.year,
  cam: () => ({ cx: cam.cx, cy: cam.cy, span: cam.span }),
  diveTo(id) {
    const c = cityRenderer.city(id);
    if (!c) return false;
    cam.cx = c.lon; cam.cy = c.lat; cam.span = 0.02;
    draw(1); scheduleFull();
    return true;
  },
  openRoom(kind) {
    $('drawer-inner').innerHTML = interiorHTML(kind, state);
    $('drawer').classList.add('on');
    return $('drawer-inner').innerHTML.length;
  },
};

/* ── The loop ───────────────────────────────────────────────────────────── */

const CODEX_IDX = buildCodexIndex(timeline, cardsDoc, gazetteer);
function openCodex() {
  $('drawer-inner').innerHTML = codexHTML(CODEX_IDX, state);
  const shelf = $('drawer-inner').querySelector('[data-codex-shelf]');
  if (shelf) shelf.innerHTML = shelfHTML(works, state);
  $('drawer').classList.add('on');
}
$('codex').addEventListener('click', openCodex);
$('interiors').addEventListener('click', (e) => {
  const b = e.target.closest('[data-room]');
  if (!b || !state) return;
  $('drawer-inner').innerHTML = interiorHTML(b.dataset.room, state);
  $('drawer').classList.add('on');
  TELEMETRY.cardOpened();
});
// Credits and colophon (phase 54). The OFL notice for the embedded fonts
// legally has to be reachable from inside the single file it ships in.
$('creditsbtn').addEventListener('click', () => {
  $('drawer-inner').innerHTML = creditsHTML(fontManifest, globalThis.__BUILD);
  $('drawer').classList.add('on');
});
$('colophon').textContent = globalThis.__BUILD
  ? `build ${globalThis.__BUILD.commit} · ${globalThis.__BUILD.date} · datapack ${globalThis.__BUILD.datapack}`
  : 'development build';

$('helpbtn').addEventListener('click', () => {
  document.body.toggleAttribute('data-help');
});
document.addEventListener('input', (e) => {
  const box = e.target.closest?.('[data-codex-search]');
  if (!box) return;
  const out = document.querySelector('[data-codex-results]');
  if (out) out.innerHTML = box.value.trim().length >= 2
    ? resultsHTML(searchCodex(CODEX_IDX, box.value)) : '';
});

$('chronicle').addEventListener('click', () => {
  if (!state) return;
  const book = composeChronicle(state, timeline);
  $('drawer-inner').innerHTML = chronicleHTML(book);
  $('drawer').classList.add('on');
});
document.addEventListener('click', async (e) => {
  if (!e.target.closest?.('[data-chron-copy]')) return;
  const txt = chronicleText(composeChronicle(state, timeline));
  try { await navigator.clipboard.writeText(txt);
    notice({ year: state.year, kind: 'decision', text: 'The chronicle is copied — the book of this campaign, as text.' }); }
  catch { prompt('The chronicle:', txt.slice(0, 2000)); }
});

$('telemetry').addEventListener('click', async () => {
  const blob = TELEMETRY.export();
  try { await navigator.clipboard.writeText(blob); notice({ year: state?.year ?? 0, kind: 'decision',
    text: 'Session metrics copied — paste them into the findings template.' }); }
  catch { prompt('Session metrics (copy):', blob); }
});

$('play').addEventListener('click', () => {
  playing = !playing;
  $('play').textContent = playing ? '❚❚ pause' : '▶ play';
});
$('speed').addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  speed = SPEEDS[speedIdx];
  $('speed').textContent = `${speed}×`;
});

$('share').addEventListener('click', async () => {
  const sv = mkSave(SEED, decisions, { year: state.year });
  const url = `${location.origin}${location.pathname}#${toURLFragment(sv)}`;
  try { await navigator.clipboard.writeText(url); flash($('share'), 'copied'); }
  catch { location.hash = toURLFragment(sv); flash($('share'), 'in the bar'); }
});

/**
 * Save copies the campaign to the clipboard rather than downloading it.
 *
 * A blob download works on a served page and does nothing at all inside an
 * embedded viewer, which is where most people will meet this — a control that
 * silently fails is worse than one that does something slightly different. The
 * clipboard works in both, and the text it copies is exactly what Load accepts.
 */
$('savebtn').addEventListener('click', async () => {
  const sv = mkSave(SEED, decisions, { year: state.year });
  const text = JSON.stringify(sv, null, 1);
  try {
    await navigator.clipboard.writeText(text);
    flash($('savebtn'), `${(saveSize(sv) / 1024).toFixed(1)} kB copied`);
  } catch {
    // No clipboard either: put it somewhere the player can reach it.
    console.info('Your campaign:\n' + text);
    flash($('savebtn'), 'in the console');
  }
});

$('loadfile').addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const sv = reconcile(loadSave(await f.text()), DP);
    SEED = String(sv.seed);
    decisions = sv.d;
    target = sv.at ?? 1947;
    recompute(); draw(1); syncScrub();
    flash($('loadfile').parentElement, sv.dropped ? `−${sv.dropped} stale` : 'loaded');
  } catch (err) {
    flash($('loadfile').parentElement, 'not a save');
    console.warn(err);
  }
});

function flash(el, msg) {
  const was = el.textContent;
  el.textContent = msg;
  setTimeout(() => { el.textContent = was; }, 1600);
}

/* ── Replay ─────────────────────────────────────────────────────────────── */

/**
 * Scrubbing is not playback. It re-evaluates the same pure function at a
 * different year, which is only possible because the world was never stored.
 */
let stops = [];
function syncScrub() {
  stops = replayStops(mkSave(SEED, decisions),
    { from: campaign ? campaign.from : -6000, to: campaign ? campaign.to : 1947 });
  const i = stops.findIndex(y => y >= target);
  $('scrubber').max = String(stops.length - 1);
  $('scrubber').value = String(i < 0 ? stops.length - 1 : i);
  $('scrub-year').textContent = formatYear(target);
}
$('scrubber').addEventListener('input', () => {
  playing = false; $('play').textContent = '▶ play';
  target = stops[+$('scrubber').value] ?? 1947;
  $('scrub-year').textContent = formatYear(target);
  recompute(); draw(3); scheduleFull();
});

/* ── Sound ──────────────────────────────────────────────────────────────── */

const sound = new Sound();
$('soundbtn').addEventListener('click', async () => {
  if (sound.on) { sound.disable(); $('soundbtn').textContent = '♪ off'; return; }
  const ok = await sound.enable();
  $('soundbtn').textContent = ok ? '♪ on' : '♪ —';
  if (ok) syncSound(true);
});

/** Keep the drone in step with the corpus. Called on every repaint. */
function syncSound(force = false) {
  if (!sound.on || !state) return;
  const cs = corpusSummary(state);
  sound.set(state.year, { extant: cs.extant, lost: cs.lost,
                          schools: state.schools.size, total: cs.total });
  // Phase 52: rule as an undertone, the drying as a thinning drone.
  sound.setUndertone((state.occupationsActive?.size ?? 0) > 0);
  if (state.indus && state.year >= -2600 && state.year <= -1900) {
    const standing = [...state.indus.values()].filter(t => t.standing);
    sound.setDrying(standing.length
      ? standing.reduce((a, t) => a + t.water, 0) / standing.length : 0);
  } else {
    sound.setDrying(null);
  }
}

let acc = 0, lastT = 0, lastClock = 0;
function tick(t) {
  requestAnimationFrame(tick);
  const dt = lastT ? Math.min(100, t - lastT) : 16;
  lastT = t;
  if (state) TELEMETRY.tick(eraOf(state.year)?.id, playing);
  if (!playing || !state) return;
  // The clock is audible in the era's own material (phase 52): a soft gnomon
  // breath before coinage, falling water after, brass past 1600. Once a second,
  // so speed changes pace the world, not the metronome.
  if (sound.on && t - lastClock >= 1000) { lastClock = t; sound.tick(state.year); }
  acc += dt;
  const step = 45;                       // ms per advance
  while (acc >= step) {
    acc -= step;
    const years = state.year < -1300 ? 5 * speed : 1 * speed;
    target = Math.min(campaign ? campaign.to : 1947, target + years);
  }
  if (target !== state.year) {
    recompute();
    $('scrub-year').textContent = formatYear(target);
    // The map must redraw as the world changes, or destroyed sites go on
    // showing as live. This is the P0 fault from HANDOFF.md.
    draw(3);
    const end = campaign ? campaign.to : 1947;
    if (target >= end) {
      playing = false; $('play').textContent = '▶ play';
      target = end;
      showReckoning();
    }
  }
}

/* ── Go ─────────────────────────────────────────────────────────────────── */

addEventListener('resize', resize);
resize();
mark('first-draw');
recompute();
mark('sim');
syncScrub();
// Kick the real climate off in the background. The map is on screen well
// before it lands, and repaints itself when it does.
const climateReady = upgradeClimate();
// Paint the coarse pass and clear the curtain first, then refine. Waiting for
// the full pass before showing anything is what made this take thirty seconds.
draw(3);
mark('preview');
$('loading').remove();
requestAnimationFrame(async () => {
  draw(1);
  mark('first-full');
  await climateReady;
  draw(1);
  mark('full');
  console.info('startup', marks.map(([l, t]) => `${l} ${t.toFixed(0)}ms`).join(' · '));
  requestAnimationFrame(tick);
});

// Handy in the console: the save file is the decision log.
Object.assign(globalThis, {
  paramountcy: { get state() { return state; }, decisions, cam, draw, recompute, marks,
                 timeline, openCard, openYear, get stops(){return stops;},
                 save: () => JSON.stringify({ seed: SEED, decisions }) },
});
