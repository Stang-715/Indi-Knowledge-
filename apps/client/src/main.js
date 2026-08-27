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
import { compileOrography, landHeight } from '../../../packages/worldgen/src/terrain.js';
import { buildClimate }      from '../../../packages/worldgen/src/climate.js';
import { RealmRenderer }     from '../../../packages/render-realm/src/renderer.js';
import { Camera, fitSpan }   from '../../../packages/render-realm/src/camera.js';
import { run }               from '../../../packages/sim/src/engine.js';
import { corpusSummary, worksAtRisk } from '../../../packages/sim/src/corpus.js';
import { formatYear }        from '../../../packages/sim/src/clock.js';
import { spriteURL, spriteFor } from '../../../packages/ui/src/sprites.js';
import { throughput, CHOKES, ESCORT_LEVELS, ordersOf } from '../../../packages/sim/src/trade.js';
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
import { deriveSituations, situationBadge } from '../../../packages/ui/src/situations.js';
import { ELIGIBILITY, validateLens, normalizeEligibility } from '../../../packages/ui/src/lenses.js';
import { damagedHTML } from '../../../packages/ui/src/damaged.js';
import { renderCardPlate } from '../../../packages/ui/src/cardplate.js';
import { makeTelemetry } from '../../../packages/ui/src/telemetry.js';
import { composeChronicle, chronicleHTML, chronicleText } from '../../../packages/ui/src/chronicle.js';
import { makeSlipTracker } from '../../../packages/ui/src/slips.js';
import { interiorHTML, scriptoriumModel } from '../../../packages/ui/src/interiors.js';
import { drawFrom } from '../../../packages/sim/src/rng.js';
import { RECITE_COST, cardFreshness, isCardLocked, districtLiteracy } from '../../../packages/sim/src/teaching.js';
import { CHALLENGE_TYPES } from '../../../packages/sim/src/challenges.js';
import { KNOWLEDGE_TABS, slugFromBndId, loadKnowledgeTab, findStateAt, confidenceWeight } from './knowledge.js';
import { drawBoundaries } from './boundaries.js';
import { drawPeopleMode, setListenFocus, chibiCountNear, setHoldRipple } from './people-layer.js';
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

const [bundle, timeline, works, cityData, people, cardsDoc, gazetteer, texture, occupations, fontManifest, BOUNDARIES, EDU] = await Promise.all([
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
  fetch('../../data/atlas/boundaries.json').then(r => r.json()).catch(() => null),
  fetch('../../data/corpus/education.json').then(r => r.json()).catch(() => null),
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
  // Reading is teaching, just gentler: the people are listening whenever you
  // read, not only when you recite. Free, ambient, idempotent by card id.
  if (state && !state.studied.has(ev.id)) decide('study', { kind: 'card', id: ev.id });
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
  if (mapMode === 'corpus') drawCorpusMode(proj);
  if (mapMode === 'literacy') drawLiteracyMode(proj);
  if (mapMode === 'knowledge') drawKnowledgeMode(proj);
  if (mapMode === 'relief') drawReliefMode(proj);
  if (mapMode === 'people') {
    drawBoundaries(ctx, proj, level, BOUNDARIES, dpr);
    drawPeopleMode(ctx, proj, state, BOUNDARIES, level, dpr);
    drawChallenges(proj);
  }
  drawSites(proj, level, dive);
  if (LENS) drawLensOverlay(proj);
}

/**
 * The lens overlay (phase 14): with a verb armed, every district answers in
 * one of six pigments. A ring, not a fill — the terrain stays legible under
 * the tool, the way a glass sheet lies over the model.
 */
/** What an armed verb aims at: districts by default, Indus towns or the
 *  Lanka anchors when asked. */
const LANKA_ANCHORS = ['aluvihare', 'anuradhapura', 'polonnaruwa'];
function lensTargets(verb) {
  if (verb?.targets === 'town') {
    return [...(state.indus?.values() ?? [])].map(t => {
      const g = PLACE_BY_ID.get(t.id);
      return g ? { ...t, lon: g.lon, lat: g.lat } : null;
    }).filter(Boolean);
  }
  if (verb?.targets === 'openable') {
    return OPENABLE_ROUTES.map(r => {
      const site = SITE_BY_ID.get(r.to);
      return site && state.year >= site.from ? { ...r, name: site.name, lon: site.lon, lat: site.lat } : null;
    }).filter(Boolean);
  }
  if (verb?.targets === 'openroutes') {
    return [...state.routes.values()].map(r => {
      const site = SITE_BY_ID.get(r.to);
      return site ? { id: r.id, name: site.name, lon: site.lon, lat: site.lat } : null;
    }).filter(Boolean);
  }
  if (verb?.targets === 'lanka') {
    return LANKA_ANCHORS.map(id => {
      const g = PLACE_BY_ID.get(id);
      return g ? { id, name: g.name, lon: g.lon, lat: g.lat } : null;
    }).filter(Boolean);
  }
  return [...state.districts.values()];
}

function drawLensOverlay(proj) {
  if (!state || !LENS) return;
  const verb = LENS.verb;
  if (!verb) return;
  ctx.save();
  ctx.font = `${11 * dpr}px ${getComputedStyle(document.body).fontFamily}`;
  for (const d of lensTargets(verb)) {
    const x = proj.toX(d.lon), y = proj.toY(d.lat);
    if (x < -40 || y < -40 || x > cv.width + 40 || y > cv.height + 40) continue;
    const st = normalizeEligibility(verb.eligible(state, d, LENS.payload));
    const e = ELIGIBILITY[st];
    ctx.beginPath();
    ctx.arc(x, y, (st === 'can' || st === 'yours' ? 11 : 8) * dpr, 0, Math.PI * 2);
    ctx.strokeStyle = e.color;
    ctx.globalAlpha = st === 'never' ? 0.35 : 0.95;
    ctx.lineWidth = (st === 'can' ? 3 : 1.6) * dpr;
    ctx.stroke();
    if (st === 'can') {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = e.color;
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Challenge colors, client-side only — the sim names types, the client
 *  paints them (challenges.js stays free of presentation). */
const CHAL_COLOR = { drought: '#c98a1b', despair: '#7a4e8e', rumor: '#6b6b64' };

/**
 * Regional challenges — drought, despair, rumour — pulsing where they stand,
 * so the player sees the district that needs the right card before it lapses
 * into a growth stall. Pulse phase is keyed by state.year, not the wall clock,
 * so it stays deterministic-friendly and honors reduced-motion like the W-event
 * pulse above.
 */
function drawChallenges(proj) {
  if (!state?.challenges?.length) return;
  ctx.save();
  ctx.font = `${Math.round(13 * dpr)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const c of state.challenges) {
    const d = state.districts.get(c.district);
    if (!d) continue;
    const x = proj.toX(d.lon), y = proj.toY(d.lat);
    if (x < -40 || y < -40 || x > cv.width + 40 || y > cv.height + 40) continue;
    const T = CHALLENGE_TYPES[c.type];
    const color = CHAL_COLOR[c.type] ?? '#a8642b';
    const age = Math.max(0, state.year - c.startYear);
    const pulse = REDUCED_MOTION ? 0.5 : (age % 6) / 6;
    ctx.globalAlpha = 0.7 * (1 - pulse * 0.6);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6 * dpr;
    ctx.beginPath(); ctx.arc(x, y, (9 + pulse * 9) * dpr, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 7 * dpr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(T.icon, x, y);
  }
  ctx.restore();
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

/** Warm-to-gold ramp: a struggling district reads warn-red, a well-taught
 *  one reads the same gold the rest of the interface uses for "yours" and
 *  "good." Interpolated in the 2..98 range districtLiteracy actually returns. */
function literacyColor(v) {
  const t = Math.max(0, Math.min(1, (v - 2) / 96));
  const lo = [168, 100, 43], hi = [201, 162, 39]; // --warn, --gold
  const c = lo.map((l, i) => Math.round(l + (hi[i] - l) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/**
 * The literacy choropleth (phase, this session): one sheet, one number per
 * district — districtLiteracy() (teaching.js), the national figure pulled up
 * wherever a district has been taught its own lessons. Same grid geometry as
 * survey and mandala, so switching modes doesn't relearn the map.
 */
function drawLiteracyMode(proj) {
  if (!state?.districts) return;
  const w = 28 / 9, h = 29 / 9;
  ctx.save();
  for (const d of state.districts.values()) {
    const x0 = proj.toX(d.lon - w / 2), x1 = proj.toX(d.lon + w / 2);
    const y0 = proj.toY(d.lat + h / 2), y1 = proj.toY(d.lat - h / 2);
    if (x1 < 0 || y1 < 0 || x0 > cv.width || y0 > cv.height) continue;
    const v = districtLiteracy(state, d.id);
    ctx.fillStyle = literacyColor(v);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
    ctx.globalAlpha = 1;
    if (state.districtTaught?.get(d.id)?.size) {
      ctx.strokeStyle = 'rgba(201,162,39,.85)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeRect(x0 + 2, y0 + 2, x1 - x0 - 4, y1 - y0 - 4);
    }
  }
  // Legend: the ramp itself, and what the gold outline means. Clear of the
  // mode-tab bar overlaying the canvas's own bottom edge.
  ctx.font = `${Math.round(11 * dpr)}px Georgia, serif`;
  const ly = cv.height - 52 * dpr;
  let lx = 14 * dpr;
  const stops = [2, 26, 50, 74, 98];
  for (const s of stops) {
    ctx.fillStyle = literacyColor(s);
    ctx.fillRect(lx, ly - 9 * dpr, 14 * dpr, 10 * dpr);
    lx += 16 * dpr;
  }
  ctx.fillStyle = '#2A2118';
  ctx.fillText(`literacy: ${Math.round(2)}% → ${Math.round(98)}%`, lx + 6 * dpr, ly);
  lx += ctx.measureText(`literacy: ${Math.round(2)}% → ${Math.round(98)}%`).width + 30 * dpr;
  ctx.strokeStyle = 'rgba(201,162,39,.85)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.strokeRect(lx, ly - 9 * dpr, 12 * dpr, 10 * dpr);
  ctx.fillStyle = '#2A2118';
  ctx.fillText('taught locally', lx + 16 * dpr, ly);
  ctx.restore();
}

/** Elevation, banded — the classic hypsometric ramp: green lowland through
 *  tan plateau, brown highland, grey rock, white snow. */
function elevationTint(m) {
  if (m < 100)  return [90, 140, 80];
  if (m < 400)  return [150, 160, 90];
  if (m < 1000) return [180, 140, 90];
  if (m < 2500) return [150, 110, 90];
  if (m < 4000) return [140, 130, 135];
  return [235, 235, 240];
}

/**
 * Relief: elevation and slope, shaded — the atlas's separate WebGL 3D mode
 * (js/map3d.js's per-state extrusion, a second camera and geometry system)
 * given this table's own grammar instead. Height comes straight from the
 * same landHeight() the terrain renderer itself samples
 * (packages/worldgen/src/terrain.js), so nothing here can disagree with the
 * ground already drawn underneath; the light-and-shadow is a classic
 * cartographic hillshade — the trick a physical relief map or a GIS layer
 * uses to make slope legible without a second dimension of camera.
 */
function drawReliefMode(proj) {
  if (!state?.districts) return;
  const w = 28 / 9, h = 29 / 9;
  const EPS = 0.35;
  ctx.save();
  for (const d of state.districts.values()) {
    const x0 = proj.toX(d.lon - w / 2), x1 = proj.toX(d.lon + w / 2);
    const y0 = proj.toY(d.lat + h / 2), y1 = proj.toY(d.lat - h / 2);
    if (x1 < 0 || y1 < 0 || x0 > cv.width || y0 > cv.height) continue;

    const hc = landHeight(O, d.lon, d.lat);
    // Light from the northwest — the cartographic convention every relief
    // map since the 19th century has used, because a light from directly
    // overhead flattens the very slopes it exists to show.
    const dhx = landHeight(O, d.lon + EPS, d.lat) - landHeight(O, d.lon - EPS, d.lat);
    const dhy = landHeight(O, d.lon, d.lat + EPS) - landHeight(O, d.lon, d.lat - EPS);
    const shade = Math.max(0, Math.min(1, 0.55 - dhx * 0.0009 + dhy * 0.0009));

    const [r, g, b] = elevationTint(hc);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = shade > 0.5 ? (shade - 0.5) * 0.7 : (0.5 - shade) * 0.7;
    ctx.fillStyle = shade > 0.5 ? '#fff' : '#141009';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(42,33,24,.28)';
    ctx.lineWidth = 0.7 * dpr;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  }

  // Legend: the elevation ramp, in metres.
  ctx.font = `${Math.round(11 * dpr)}px Georgia, serif`;
  const ly = cv.height - 52 * dpr;
  let lx = 14 * dpr;
  for (const [label, m] of [['<100m', 50], ['400m', 400], ['1000m', 1000], ['2500m', 2500], ['4000m', 4000], ['4000m+', 4500]]) {
    const [r, g, b] = elevationTint(m);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(lx, ly - 9 * dpr, 14 * dpr, 10 * dpr);
    ctx.fillStyle = '#2A2118';
    ctx.fillText(label, lx + 18 * dpr, ly);
    lx += ctx.measureText(label).width + 34 * dpr;
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

/* ── Hold-to-recite: teaching is a held moment, not a tap ──────────────────
 * Every other lens verb executes on a tap. Recite alone asks for a hold —
 * a progress ring fills while the crowd within earshot gathers, and only a
 * COMPLETED hold executes. Release early — or hold over empty land where
 * chibiCountNear is zero — and nothing happens: the atlas game's own rule,
 * where "no one can hear you" was never a punishment, just the truth. */
const RECITE_HOLD_MS = 3200;
let holdRecite = null; // {target, x, y, startedAt, elapsed, raf}

function isReciteArmed() {
  return LENS?.lens?.id === 'teachcards' && LENS.verb?.id === 'recite' && LENS.payload;
}
function reciteHitTest(clientX, clientY) {
  const rect = cv.getBoundingClientRect();
  const px = (clientX - rect.left) * dpr, py = (clientY - rect.top) * dpr;
  const proj = cam.projection(cv.width, cv.height);
  const lon = proj.toLon(px), lat = proj.toLat(py);
  let best = null, bd = 2.2;
  for (const t of lensTargets(LENS.verb)) {
    const dist = Math.hypot(t.lon - lon, t.lat - lat);
    if (dist < bd) { bd = dist; best = t; }
  }
  return best;
}
function startHoldRecite(e) {
  const target = reciteHitTest(e.clientX, e.clientY);
  if (!target) return false;
  const st = normalizeEligibility(LENS.verb.eligible(state, target, LENS.payload));
  if (st !== 'can') {
    notice({ kind: 'texture', year: state.year, text: `${target.name}: ${ELIGIBILITY[st].hint}` });
    return false;
  }
  holdRecite = { target, x: e.clientX, y: e.clientY, startedAt: performance.now(), elapsed: 0 };
  $('eduRecite').hidden = false;
  tickHoldRecite();
  return true;
}
function cancelHoldRecite() {
  if (holdRecite?.raf) cancelAnimationFrame(holdRecite.raf);
  holdRecite = null;
  setHoldRipple(null);
  $('eduRecite').hidden = true;
}
function tickHoldRecite() {
  if (!holdRecite) return;
  const rect = cv.getBoundingClientRect();
  const p = cam.projection(cv.width, cv.height);
  const lon = p.toLon((holdRecite.x - rect.left) * dpr), lat = p.toLat((holdRecite.y - rect.top) * dpr);
  const rDeg = 2.2;
  setListenFocus({ lon, lat, rDeg });
  const listeners = chibiCountNear(state, BOUNDARIES, lon, lat);
  const bar = $('eduRecite');
  if (listeners <= 0) {
    // no one to hear it: the hold does not advance, and does not lose ground
    bar.classList.add('mute');
    bar.innerHTML = `<span class="rtext">no one can hear you here</span>`;
    setHoldRipple({ lon, lat, rDeg, frac: 0.05 });
  } else {
    bar.classList.remove('mute');
    holdRecite.elapsed = performance.now() - holdRecite.startedAt;
    const frac = Math.min(1, holdRecite.elapsed / RECITE_HOLD_MS);
    bar.innerHTML = `<span class="rfill" style="width:${(frac * 100).toFixed(1)}%"></span><span class="rtext">reciting…</span>`;
    setHoldRipple({ lon, lat, rDeg, frac });
    if (frac >= 1) {
      LENS.verb.execute(holdRecite.target, LENS.payload);
      TELEMETRY.lensExecuted(LENS.lens.id);
      cancelHoldRecite();
      return;
    }
  }
  draw(3);
  holdRecite.raf = requestAnimationFrame(tickHoldRecite);
}

let dragging = false, last = null;
cv.addEventListener('pointerdown', (e) => {
  last = [e.clientX, e.clientY];
  if (isReciteArmed() && startHoldRecite(e)) {
    cv.setPointerCapture(e.pointerId);
    return; // held, not dragged — the camera stays put while teaching
  }
  dragging = true;
  cv.classList.add('drag'); cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => {
  if (holdRecite) {
    // moving too far away from where the hold started cancels it, same as
    // any other tap-vs-drag threshold in this app
    if (Math.hypot(e.clientX - holdRecite.x, e.clientY - holdRecite.y) > 12) cancelHoldRecite();
    else { holdRecite.x = e.clientX; holdRecite.y = e.clientY; }
    return;
  }
  // Teach lens armed: the crowd within earshot of the cursor turns to listen.
  if (LENS?.lens?.id === 'teachcards' && state && !dragging) {
    const rect = cv.getBoundingClientRect();
    const p = cam.projection(cv.width, cv.height);
    setListenFocus({
      lon: p.toLon((e.clientX - rect.left) * dpr),
      lat: p.toLat((e.clientY - rect.top) * dpr),
      rDeg: 2.2,
    });
  }
  if (!dragging) return;
  const proj = cam.projection(cv.width, cv.height);
  const dx = (e.clientX - last[0]) * dpr, dy = (e.clientY - last[1]) * dpr;
  cam.panBy(-dx / cv.width * cam.span, dy / cv.height * proj.spanY);
  last = [e.clientX, e.clientY];
  draw(3); scheduleFull();
});
const endDrag = () => { dragging = false; cv.classList.remove('drag'); };
cv.addEventListener('pointerup', (e) => {
  if (holdRecite) { cancelHoldRecite(); return; } // release early: lost, on purpose
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
  // Knowledge mode hit-tests the atlas's own state outlines, not the sim's
  // survey grid — a different geometry with its own dossier, not a district
  // detail panel.
  if (mapMode === 'knowledge') {
    const proj = cam.projection(cv.width, cv.height);
    const lon = proj.toLon(px), lat = proj.toLat(py);
    const s = findStateAt(BOUNDARIES, lon, lat);
    if (s) openKnowledgeState(s);
    return;
  }
  // Clicking a district opens its panel in ANY informational mode (phase 10)
  // — the census's state-panel pattern. Mandala mode merely colors the answer.
  // With a lens verb armed (phase 14), the same click EXECUTES instead: the
  // tool stays in hand for repeat use until Escape puts it down.
  if (state?.districts) {
    const proj = cam.projection(cv.width, cv.height);
    const lon = proj.toLon(px), lat = proj.toLat(py);
    let best = null, bd = 9;
    for (const d of state.districts.values()) {
      const dist = Math.hypot(d.lon - lon, d.lat - lat);
      if (dist < bd) { bd = dist; best = d; }
    }
    if (LENS?.verb) {
      // Armed verbs aim at THEIR target set, which may not be districts.
      let tbest = null, tbd = 9;
      for (const t of lensTargets(LENS.verb)) {
        const dist = Math.hypot(t.lon - lon, t.lat - lat);
        if (dist < tbd) { tbd = dist; tbest = t; }
      }
      if (!(tbest && tbd < 2.2)) return;
      const st = normalizeEligibility(LENS.verb.eligible(state, tbest, LENS.payload));
      if (st === 'can') { LENS.verb.execute(tbest, LENS.payload); TELEMETRY.lensExecuted(LENS.lens.id); }
      else notice({ kind: 'texture', year: state.year,
        text: `${tbest.name}: ${ELIGIBILITY[st].hint}` });
      return;
    }
    if (!(best && bd < 2.2)) return;
    openClaims(best);
  }
});

/** The claims panel: one district's full stack, and its history here. */
/**
 * The district panel (phase 10): clicking the map opens the Land drawer with
 * this district at the top — the state panel pattern from the census, in our
 * grammar. Survey status, the sovereignty stack, and the one verb that makes
 * sense here.
 */
let landSelected = null;
function renderDistrictDetail(s) {
  const dist = landSelected && s.districts.get(landSelected);
  if (!dist) { $('districtdetail').innerHTML = ''; return; }
  const c = s.claims.get(landSelected);
  const line = (layer, label) => {
    const who = c?.[layer];
    const occ = who && who.startsWith?.('OCC.')
      ? (occupations.occupations.find(o => o.id === who)?.name ?? who) : who;
    return `<div class="chron-line"><span class="tb-year">${label}</span>
      <span>${who ? `${occ === 'you' ? 'you' : occ} <span class="tiny muted">(${Math.round((c.strength[layer] ?? 0) * 100)}%)</span>` : '<span class="tiny muted">nobody</span>'}</span></div>`;
  };
  const surveyed = dist.surveyed;
  const gate = blocked(s, 'survey');
  const why = gate ? gate.why
    : s.pops.scribes < 1 ? 'A survey needs a scribe, and you have none.'
    : s.grain < 90 ? 'Surveyors are paid in grain you do not have.'
    : `Send surveyors. The truth was fixed at world-creation; looking is what costs.`;
  const can = !gate && s.pops.scribes >= 1 && s.grain >= 90;
  $('districtdetail').innerHTML = `
    <div class="panel" style="border:1px solid var(--rule);padding:8px 10px;background:var(--paper)">
      <b>${dist.name}</b>
      <span class="tiny muted">${surveyed ? `surveyed ${formatYear(surveyed)} — truth ${dist.truth}` : 'never looked at'}</span>
      ${c ? `<div style="margin:6px 0 4px" class="tiny muted">The stack, not a colour:</div>
      ${line('holder', 'held by')}${line('revenue', 'taxed by')}${line('tributary', 'tribute to')}${line('paramount', 'paramount')}` : ''}
      ${!surveyed ? `<div class="acts" style="margin-top:6px">
        <button class="btn" data-survey="${landSelected}" ${can ? '' : 'disabled'} title="${why}">survey</button></div>` : ''}
    </div>`;
}
function openClaims(d) {
  landSelected = d.id;
  renderDistrictDetail(state);
  openRail('land', false);
}
cv.addEventListener('pointercancel', (e) => { if (holdRecite) cancelHoldRecite(); endDrag(); });

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

// The population is the game: the table opens on the people, not the land.
let mapMode = 'people';
const MODES = [
  { id: 'terrain', label: 'terrain', hint: 'The land, before anyone owns it.' },
  { id: 'survey',  label: 'survey',  hint: 'What we know, and what we have not looked at.' },
  { id: 'mandala', label: 'mandala', hint: 'Sovereignty as it actually was: held, taxed, tributary, paramount — four claims, not one colour.' },
  { id: 'corpus',  label: 'corpus',  hint: 'Where the works are physically held — every carrier, placed.' },
  { id: 'people',  label: 'people',  hint: 'The population, going about its work over the atlas boundaries — and listening when you teach.' },
  { id: 'literacy', label: 'literacy', hint: 'Who can actually read: the national figure, pulled up wherever a district has been taught its own lessons.' },
  { id: 'knowledge', label: 'knowledge', hint: "The atlas's own ten layers — soil, history, governance, craft, wars, scripture, folklore, heritage — laid over the same land." },
  { id: 'relief', label: 'relief', hint: "Elevation, shaded: the atlas's 3D mode as this table's own grammar — height and slope, not a second camera." },
];
// The globe (phase 18): modes are selectable AND lockable. A locked mode
// survives a lens's contextual switch; an unlocked one is borrowed and
// returned. (Roads earned no mode: routes and caravans are already drawn
// on every mode — a dedicated one would duplicate the terrain view.)
let modeLocked = false;
function setMapMode(id) {
  mapMode = id;
  for (const t of $('modes').querySelectorAll('[data-mode]'))
    t.setAttribute('aria-selected', t.dataset.mode === id);
  if (id === 'knowledge') {
    renderKnowTabs();
    if (!knowData && !knowLoading) selectKnowTab(knowTab);
  } else if ($('knowTabs')) {
    $('knowTabs').hidden = true;
  }
  draw(1);
}
$('modes').innerHTML = MODES.map(m =>
  `<button class="tab" role="tab" data-mode="${m.id}" title="${m.hint}"
     aria-selected="${m.id === mapMode}">${m.label}</button>`).join('')
  + `<button class="tab" id="modelock" title="Lock the mode: a locked mode is not borrowed by lenses." aria-pressed="false">\u{1F513}</button>`;
$('modes').addEventListener('click', (e) => {
  if (e.target.id === 'modelock') {
    modeLocked = !modeLocked;
    e.target.textContent = modeLocked ? '\u{1F512}' : '\u{1F513}';
    e.target.setAttribute('aria-pressed', modeLocked);
    return;
  }
  const b = e.target.closest('[data-mode]');
  if (!b) return;
  setMapMode(b.dataset.mode);
});

/* ── Knowledge layers: the atlas's own ten subject tabs ──────────────────── */

let knowTab = 'soil';
let knowData = null;   // this tab's atlas-data payload, once loaded
let knowLoading = false;

function renderKnowTabs() {
  const el = $('knowTabs');
  if (!el) return;
  el.hidden = mapMode !== 'knowledge';
  if (mapMode !== 'knowledge') return;
  el.innerHTML = KNOWLEDGE_TABS.map(t =>
    `<button class="tab tiny" data-know="${t.key}" aria-selected="${t.key === knowTab}"
       title="${t.label}">${t.icon} ${t.label}</button>`).join('')
    + (knowLoading ? `<span class="tiny muted">loading…</span>` : '');
}
function selectKnowTab(key) {
  knowTab = key;
  knowData = null;
  knowLoading = true;
  renderKnowTabs();
  loadKnowledgeTab(key).then((d) => {
    if (knowTab !== key) return; // a later click already moved on
    knowData = d;
    knowLoading = false;
    renderKnowTabs();
    draw(1);
  }).catch(() => { knowLoading = false; renderKnowTabs(); });
}
$('knowTabs')?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-know]');
  if (!b) return;
  selectKnowTab(b.dataset.know);
});

/**
 * The knowledge choropleth: one atlas subject at a time, over the real state
 * outlines. Rather than a bespoke metric per tab (the atlas's own approach —
 * ten separate color functions, one per data shape), every tab reads the
 * same two fields every entry actually carries: presence and `confidence`.
 * A state with a richer, more confident record glows gold; one with none
 * reads as bare paper — the same "the gaps ARE the game" grammar Survey
 * mode already uses, applied to curated knowledge instead of population.
 */
function drawKnowledgeMode(proj) {
  if (!BOUNDARIES) return;
  ctx.save();
  ctx.globalAlpha = 1;
  for (const s of BOUNDARIES.states) {
    const entry = knowData?.states?.[slugFromBndId(s.id)];
    ctx.beginPath();
    for (const ring of s.outline) {
      ctx.moveTo(proj.toX(ring[0]), proj.toY(ring[1]));
      for (let i = 2; i < ring.length; i += 2) ctx.lineTo(proj.toX(ring[i]), proj.toY(ring[i + 1]));
      ctx.closePath();
    }
    if (entry) {
      // A plum wash, not gold — gold already means "yours" everywhere else
      // in this interface, and a hue this close to the terrain's own tans
      // reads as no fill at all (confirmed by pixel-sampling during testing).
      const w = confidenceWeight(entry);
      ctx.fillStyle = `rgba(122,78,142,${(0.32 + w * 0.4).toFixed(2)})`;
    } else {
      ctx.fillStyle = 'rgba(216,203,170,0.4)'; // unsurveyed paper, same tone as Survey mode
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(62,37,64,0.4)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  }
  // Legend.
  ctx.font = `${Math.round(11 * dpr)}px Georgia, serif`;
  const ly = cv.height - 52 * dpr;
  let lx = 14 * dpr;
  for (const [label, w] of [['no record', 0], ['low', 0.35], ['medium', 0.62], ['high', 1]]) {
    ctx.fillStyle = w === 0 ? 'rgba(216,203,170,0.6)' : `rgba(122,78,142,${(0.32 + w * 0.4).toFixed(2)})`;
    ctx.fillRect(lx, ly - 9 * dpr, 14 * dpr, 10 * dpr);
    ctx.fillStyle = '#2A2118';
    ctx.fillText(label, lx + 18 * dpr, ly);
    lx += ctx.measureText(label).width + 34 * dpr;
  }
  ctx.restore();
}

/** The dossier: reuses the shared drawer, since the ten tabs' schemas share
 *  enough (name, summary, facts, sources, confidence) that one generic
 *  renderer covers all of them without ten bespoke templates — the atlas's
 *  own per-tab RENDER[key] functions differ mostly in the extra sections
 *  this port does not attempt to reproduce one-for-one. */
function openKnowledgeState(s) {
  const slug = slugFromBndId(s.id);
  const entry = knowData?.states?.[slug];
  const tabMeta = KNOWLEDGE_TABS.find((t) => t.key === knowTab);
  const districts = s.districts.map((d) => d.name).sort();
  if (!entry) {
    $('drawer-inner').innerHTML = `<article class="card">
      <h3>${tabMeta?.icon ?? ''} ${s.name ?? slug}</h3>
      <p class="muted">No verified ${tabMeta?.label.toLowerCase() ?? 'record'} for this state yet.</p>
      <h4>Districts</h4>
      <div class="chip-row">${districts.map((n) => `<span class="token">${n}</span>`).join('')}</div>
    </article>`;
  } else {
    const facts = (entry.facts ?? []).slice(0, 8).map((f) => `<li>${f}</li>`).join('');
    const sources = (entry.sources ?? []).slice(0, 6).map((src) =>
      `<li>${src.url ? `<a href="${src.url}" target="_blank" rel="noopener">${src.title}</a>` : src.title}
        <span class="tiny muted">${[src.publisher, src.year].filter(Boolean).join(', ')}</span></li>`).join('');
    $('drawer-inner').innerHTML = `<article class="card">
      <h3>${tabMeta?.icon ?? ''} ${entry.name ?? s.name}</h3>
      <span class="confidence-badge">${entry.confidence ?? 'unrated'} confidence</span>
      <p>${entry.summary ?? ''}</p>
      ${facts ? `<h4>Facts</h4><ul>${facts}</ul>` : ''}
      ${sources ? `<h4>Sources</h4><ul class="tiny">${sources}</ul>` : ''}
      <h4>Districts</h4>
      <div class="chip-row">${districts.map((n) => `<span class="token">${n}</span>`).join('')}</div>
    </article>`;
  }
  $('drawer').classList.add('on');
}

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
  const totalPop = s.pops.farmers + s.pops.reciters + s.pops.scribes
    + s.pops.soldiers + s.pops.merchants + s.pops.teachers;
  let popTrend = '';
  if (lastVital && s.year > lastVital.year && lastVital.pop != null) {
    popTrend = totalPop > lastVital.pop ? ' <i class="up">▲</i>'
      : totalPop < lastVital.pop ? ' <i class="down">▼</i>' : '';
  }
  lastVital = { year: s.year, grain: s.grain, pop: totalPop };
  const grainCls = s.grain < 100 ? 'dire' : falling ? 'bad' : '';
  // At a fresh start EVERYTHING is technically at risk, which makes "at risk"
  // noise. The middle number is the count that cannot wait: works down to one
  // carrier — one fire, one fever, and the text is gone.
  const corpusCls = last > 0 ? 'dire' : cs.lost > 0 ? 'bad' : '';
  $('vitals').innerHTML =
    `<span class="vital" data-goto="land" title="The population — everyone your teaching and your grain keep alive. This is the number the whole game is for.">
       <span class="k">Population</span><span class="v">${Math.round(totalPop).toLocaleString()}${popTrend}</span></span>
     <span class="vital ${grainCls}" data-goto="ledger" title="The treasury, and its flow. Click: the Ledger.">
       <span class="k">Grain</span><span class="v">${Math.round(s.grain).toLocaleString()}${flow}</span></span>
     <span class="vital ${corpusCls}" data-goto="chest" title="Extant · at last carrier · lost. Click: the Library.">
       <span class="k">Corpus</span><span class="v">${cs.extant} · ${last} · ${cs.lost}</span></span>
     <span class="vital" title="The literacy rate: taught coverage of the corpus, its survival, and CULTIVATION. Recite to raise it; neglect lets it fade.">
       <span class="k">Literacy</span><span class="v">${Math.round(s.literacy ?? 0)}%</span></span>
     <span class="vital ${capped ? 'bad' : ''}" data-goto="pillars" title="The trust ladder${capped ? ` — capped at ${cap} under occupation` : ''}. Click: the gauges.">
       <span class="k">Trust</span><span class="v">${rung.name}</span></span>
     <span class="pillarglyphs" data-goto="pillars" title="Agriculture · Trade · Structure · Networking. Click: the full gauges.">
       ${VITAL_PILLARS.map(p => `<span class="pg"><i style="height:${Math.round(s.pillars[p])}%"></i></span>`).join('')}</span>`;
}
$('vitals').addEventListener('click', (e) => {
  const v = e.target.closest('[data-goto]');
  if (!v) return;
  openRail({ ledger: 'ledger', chest: 'library', pillars: 'court' }[v.dataset.goto]);
});

/* ── The alert shelf (phase 5) ──────────────────────────────────────────────
 * The engine derives; the client presents. Dismissal and routing are player
 * preferences, so they live here — dismissal for this sitting only, routing
 * persisted. A dismissed situation that stops being true simply vanishes;
 * one that returns after the restore button is a real recurrence. */
const sitDismissed = new Set();
let sitRouting = { work: true, route: true, town: true, grain: true, trust: true, lineage: true, texture: true };
try { Object.assign(sitRouting, JSON.parse(localStorage.getItem('pm-sit-routing') ?? '{}')); } catch {}
let sitOpen = false, sitShowRouting = false;

function paintSituations(s) {
  const all = deriveSituations(s, DP);
  const routed = all.filter(x => sitRouting[x.kind] !== false);
  const shown = routed.filter(x => !sitDismissed.has(x.id));
  const badge = situationBadge(shown);
  $('sitnum').textContent = badge.count;
  $('sitbtn').className = 'btn' + (badge.tier ? ` glow-${badge.tier}` : '');
  paintRailBadges(all);
  if (!sitOpen) return;
  const hidden = routed.length - shown.length;
  $('sitlist').innerHTML =
    `<header><span>Situations</span>
       <span>${hidden ? `<button class="btn" data-sit-restore title="Restore ${hidden} dismissed">↺ ${hidden}</button>` : ''}
       <button class="btn" data-sit-gear title="Choose which kinds appear">⚙</button></span></header>` +
    (sitShowRouting ? `<div class="sit-routing">` + Object.keys(sitRouting).map(k =>
      `<label><span>${k}</span><input type="checkbox" data-sit-kind="${k}" ${sitRouting[k] !== false ? 'checked' : ''}></label>`).join('') + `</div>` : '') +
    (shown.length ? shown.map(x =>
      `<div class="sit ${x.tier}" data-sit-id="${x.id}" data-sit-kind2="${x.kind}" data-sit-target="${x.target ?? ''}">
         <i></i><span>${x.text}</span><span class="x" data-sit-x="${x.id}" title="Dismiss (it returns if it recurs)">✕</span></div>`).join('')
     : `<div class="sit feed"><i></i><span>Nothing needs you. The record is being kept.</span></div>`);
}

$('sitbtn').addEventListener('click', () => {
  sitOpen = !sitOpen;
  $('sitlist').style.display = sitOpen ? '' : 'none';
  if (sitOpen && state) paintSituations(state);
});
$('sitlist').addEventListener('click', (e) => {
  const x = e.target.closest('[data-sit-x]');
  if (x) { sitDismissed.add(x.dataset.sitX); paintSituations(state); return; }
  if (e.target.closest('[data-sit-restore]')) { sitDismissed.clear(); paintSituations(state); return; }
  if (e.target.closest('[data-sit-gear]')) { sitShowRouting = !sitShowRouting; paintSituations(state); return; }
  const kindBox = e.target.closest('[data-sit-kind]');
  if (kindBox) {
    sitRouting[kindBox.dataset.sitKind] = kindBox.checked;
    try { localStorage.setItem('pm-sit-routing', JSON.stringify(sitRouting)); } catch {}
    paintSituations(state); return;
  }
  const row = e.target.closest('[data-sit-id]');
  if (!row) return;
  const goto = { work: 'library', route: 'road', town: 'land', grain: 'ledger', trust: 'court', lineage: 'people' }[row.dataset.sitKind2];
  if (goto) openRail(goto);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sitOpen) { sitOpen = false; $('sitlist').style.display = 'none'; }
});

/* ── The major rail (phase 6) ───────────────────────────────────────────────
 * Six seals, one drawer at a time. Panel bodies live parked in #panels and
 * are MOVED into the rail panel on open — the nodes keep their ids and their
 * listeners, so every painter and click handler survives relocation. */
const RAIL = [
  { id: 'ledger',  glyph: 'L',  key: 'q', title: 'The Ledger — where grain comes from and where it goes' },
  { id: 'library', glyph: 'B',  key: 'w', title: 'The Library — the corpus you are keeping alive' },
  { id: 'people',  glyph: 'P',  key: 'e', title: 'The People — reciters, scribes, patrons' },
  { id: 'land',    glyph: 'Ld', key: 'r', title: 'The Land — settlements, survey, the Indus triage' },
  { id: 'road',    glyph: 'R',  key: 't', title: 'The Road — routes, orders, missions, partners' },
  { id: 'court',   glyph: 'C',  key: 'y', title: 'The Court — sovereignty, occupations, trust' },
];
let railOpen = null;
$('rail').innerHTML = RAIL.map(r =>
  `<button class="seal" data-rail="${r.id}" aria-pressed="false"
     title="${r.title} (${r.key})"><span class="badge" style="display:none"></span>${r.glyph}</button>`).join('')
  + '<div class="divider"></div>';
document.body.dataset.rail = '1';
const railPanel = document.createElement('div');
railPanel.id = 'railpanel';
railPanel.style.display = 'none';
railPanel.innerHTML = `<div class="rp-head"><b id="rp-title"></b>
  <button class="btn tiny" id="rp-close">close</button></div><div id="rp-mount"></div>`;
$('stage').appendChild(railPanel);

function closeRail() {
  if (!railOpen) return;
  const body = $('rp-mount').firstElementChild;
  if (body) $('panels').appendChild(body);          // park it again
  railPanel.style.display = 'none';
  $('stage').classList.remove('panel-open');
  document.querySelector(`[data-rail="${railOpen}"]`)?.setAttribute('aria-pressed', 'false');
  railOpen = null;
}
function openRail(id, toggle = true) {
  if (railOpen === id) { if (toggle) closeRail(); return; }
  closeRail();
  const body = document.querySelector(`[data-rail-panel="${id}"]`);
  if (!body) return;
  $('rp-title').textContent = body.dataset.title;
  TELEMETRY.railOpened(id);
  $('rp-mount').appendChild(body);
  railPanel.style.display = '';
  $('stage').classList.add('panel-open');
  document.querySelector(`[data-rail="${id}"]`)?.setAttribute('aria-pressed', 'true');
  railOpen = id;
}
$('rail').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rail]');
  if (b) openRail(b.dataset.rail);
});

/* ── The minor rail (phase 13): reference lives below the fold ────────────── */
// The reference buttons MOVE from the status bar — same nodes, same
// listeners, new clothes. The status bar keeps only what changes the moment.
for (const [id, glyph] of [['codex', 'cx'], ['chronicle', 'ch']]) {
  const b = $(id);
  b.className = 'seal seal--minor';
  b.textContent = glyph;
  $('rail').appendChild(b);
}
const threadsBtn = document.createElement('button');
threadsBtn.className = 'seal seal--minor';
threadsBtn.id = 'threadsbtn';
threadsBtn.textContent = 'th';
threadsBtn.title = 'Threads — the fifteen arcs running through the whole record.';
$('rail').appendChild(threadsBtn);
const railGap = document.createElement('div');
railGap.className = 'gap';
$('rail').appendChild(railGap);
for (const [id, glyph] of [['helpbtn', '?'], ['telemetry', 'm'], ['creditsbtn', '©']]) {
  const b = $(id);
  b.className = 'seal seal--minor';
  b.textContent = glyph;
  $('rail').appendChild(b);
}

/** The Threads panel: each arc, its progress THIS campaign, its next beat. */
threadsBtn.addEventListener('click', () => {
  const now = state?.year ?? -6000;
  const rows = [...THREAD_IDX.values()].map(t => {
    const passed = t.beats.filter(b => b.year <= now);
    const next = t.beats.find(b => b.year > now);
    const active = now >= t.span[0] && now <= t.span[1];
    return `<div class="thread-beat" style="${active ? '' : 'opacity:.55'}">
      <b>${t.name}</b> <span class="tiny muted">${formatYear(t.span[0])} → ${formatYear(t.span[1])}
        · ${passed.length}/${t.beats.length} beats</span>
      <div class="tiny" style="margin:3px 0">${t.arc}</div>
      ${next ? `<button class="btn tiny" data-goto="${next.id}"
        title="The arc's next beat, as the evidence dates it.">next: ${next.title} (${formatYear(next.year)})</button>` : `<span class="tiny muted">the arc has run its course</span>`}
    </div>`;
  }).join('');
  $('drawer-inner').innerHTML = `<div class="codex"><h3>The Threads</h3>
    <p class="chron-sub">Fifteen arcs cross the chapters and the eras. A thread is how a
    single evening's event belongs to a three-thousand-year story.</p>${rows}</div>`;
  $('drawer').classList.add('on');
});
railPanel.addEventListener('click', (e) => { if (e.target.id === 'rp-close') closeRail(); });
document.addEventListener('keydown', (e) => {
  if (e.target.matches?.('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const r = RAIL.find(x => x.key === e.key);
  if (r) { e.preventDefault(); openRail(r.id); return; }
  // Lenses on the number row (phase 20): 1–4 arm, in tray order.
  // The map claims arrows, +/- and space — never the number row, so the
  // lens keys work even while the canvas holds focus.
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= LENSES.length) {
    e.preventDefault();
    armLens(LENSES[n - 1].id);
  }
});

/* ── The Ledger (phase 7): flows from the till, and the standing patronage ── */
const PATRONAGE_TIPS = {
  none:   'Nothing automatic. Every reciter is your own click.',
  steady: 'Keeps five reciters in grain: hires at 50 whenever the bench is short and the granary holds 200.',
  lavish: 'Grows the bench to twelve while the granary holds 600. Generosity as policy.',
};
function paintFlows(s) {
  const entries = Object.entries(s.flows ?? {}).filter(([, v]) => Math.round(v) !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const row = ([k, v]) =>
    `<div class="ledger-row"><span>${k}</span>
       <span class="v" style="${v < 0 ? '' : 'color:#4c6136'}">${v > 0 ? '+' : ''}${Math.round(v).toLocaleString()}</span></div>`;
  // Standing costs, right now — the money that leaves while you look away.
  let standingRows = '';
  let escortYr = 0;
  for (const r of s.routes.values()) escortYr += (ESCORT_LEVELS[ordersOf(r).escort] ?? {}).costPerYear ?? 0;
  if (escortYr) standingRows += `<div class="ledger-row"><span>escorts, standing</span><span class="v">−${escortYr}/yr</span></div>`;
  for (const id of s.occupationsActive ?? []) {
    const o = (occupations.occupations ?? []).find(x => x.id === id);
    if (o?.extract) standingRows += `<div class="ledger-row"><span>${o.name}</span><span class="v">−${o.extract}/yr</span></div>`;
  }
  $('flows').innerHTML =
    (entries.length ? entries.map(row).join('')
                    : `<div class="tiny muted">Nothing has moved yet. The ledger fills as the campaign does.</div>`)
    + (standingRows ? `<div style="margin-top:6px" class="tiny muted">standing now</div>${standingRows}` : '')
    + `<div style="margin-top:8px" class="tiny muted">patronage</div>
       <div class="acts">${['none', 'steady', 'lavish'].map(l =>
         `<button class="btn" data-patronage="${l}" title="${PATRONAGE_TIPS[l]}"
            ${(s.patronage ?? 'none') === l ? 'style="border-color:var(--gold);font-weight:700"' : ''}>${l}</button>`).join('')}
       </div>`;
}
// Delegated on document: the ledger body moves between #panels and the rail
// panel, and a listener pinned to either home misses it in the other.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-patronage]');
  if (b && state) decide('set-patronage', { level: b.dataset.patronage });
});

/* ── The Library (phase 8): the chest rebuilt around risk ─────────────────── */
let libFilter = 'all', libSelected = null;
const LIB_FILTERS = {
  all:    { label: 'all',      test: (c) => c.exists || c.lost },
  risk:   { label: 'at risk',  test: (c, risky) => !c.lost && c.exists && risky.has(c.id) },
  abroad: { label: 'abroad',   test: (c) => !c.lost && c.exists && c.carriers.some(x => x.place !== 'home') },
  lost:   { label: 'lost',     test: (c) => c.lost },
};
function paintLibrary(s) {
  const risky = new Set(worksAtRisk(s, 'home').map(w => w.id));
  const all = [...s.corpus.values()];
  $('libfilters').innerHTML = Object.entries(LIB_FILTERS).map(([k, f]) => {
    const n = all.filter(c => f.test(c, risky)).length;
    return `<button class="tab" data-libf="${k}" aria-selected="${k === libFilter}">${f.label} ${n}</button>`;
  }).join('');
  const rows = all.filter(c => LIB_FILTERS[libFilter].test(c, risky))
    .sort((a, b) => (a.lost - b.lost) || (a.carriers.length - b.carriers.length))
    .slice(0, 70);
  $('chest').innerHTML = rows.map(c => {
    const cls = c.lost ? 'work--lost' : risky.has(c.id) ? 'work--risk' : 'work--safe';
    const meta = c.lost ? `lost ${formatYear(c.lostYear)}`
      : `${c.carriers.length}×${c.carriers.some(x => x.place !== 'home') ? ' ✈' : ''}`;
    return `<div class="work ${cls}" data-work="${c.id}" ${c.id === libSelected ? 'style="outline:2px solid var(--gold)"' : ''}>
      <span class="title">${c.title}</span><span class="meta">${meta}</span></div>`;
  }).join('');
  paintWorkDetail(s);
}
function paintWorkDetail(s) {
  const c = libSelected && s.corpus.get(libSelected);
  if (!c || (!c.exists && !c.lost)) { $('workdetail').innerHTML = ''; return; }
  const carriers = c.carriers.map(x =>
    `<span class="token">${x.medium} · ${x.place}</span>`).join('') || '<span class="tiny muted">none</span>';
  const copyGate = blocked(s, 'copy');
  const canCopy = !c.lost && !copyGate && s.grain >= 60 && s.pops.scribes >= 1;
  const teachGate = blocked(s, 'send-teacher');
  const canTeach = !c.lost && !teachGate && s.grain >= 120 && (s.pops.scribes >= 1 || s.pops.reciters >= 2);
  $('workdetail').innerHTML = `
    <div class="panel" style="border:1px solid var(--rule);padding:8px 10px;background:var(--paper)">
      <span class="star" style="float:right;cursor:pointer;color:${isPinned('work', c.id) ? 'var(--gold)' : 'var(--ink-faint)'}"
        data-pin-star="work:${c.id}" data-pin-label="${c.title}" title="Pin to the outliner">★</span>
      <b>${c.title}</b> <span class="tiny muted">${c.lost ? `lost ${formatYear(c.lostYear)}` : `${c.carriers.length} carrier(s)`}</span>
      <div class="tokens" style="margin:6px 0">${carriers}</div>
      ${c.lost ? `<div class="tiny muted">Reduced to zero carriers. Works are never deleted — only unheld.</div>` : `
      <div class="acts">
        <button class="btn" data-lib-copy="${c.id}" ${canCopy ? '' : 'disabled'}
          title="${copyGate ? copyGate.why : `60 grain, a scribe's season. Carriers ${c.carriers.length} → ${c.carriers.length + 1}, at home.`}">copy</button>
        <button class="btn" data-lib-teach="${c.id}" ${canTeach ? '' : 'disabled'}
          title="${teachGate ? teachGate.why : `120 grain and a keeper leaves. A copy abroad is maintained there — for ever.`}">send a teacher</button>
      </div>`}
    </div>`;
}
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-libf]');
  if (f) { libFilter = f.dataset.libf; if (state) paintLibrary(state); return; }
  const w = e.target.closest('[data-work]');
  if (w) {
    libSelected = w.dataset.work;
    // decide() repaints everything (including the Library) on its own; only
    // call it when there is something new to log, else just repaint as before.
    if (state && !state.studied.has(libSelected)) decide('study', { kind: 'work', id: libSelected });
    else if (state) paintLibrary(state);
    return;
  }
  const cp = e.target.closest('[data-lib-copy]');
  if (cp && state) { decide('copy', { work: cp.dataset.libCopy }); return; }
  const th = e.target.closest('[data-lib-teach]');
  if (th && state) { decide('send-teacher', { work: th.dataset.libTeach, destination: 'abroad' }); return; }
  // The district detail's survey button (phase 10). Scoped to its container so
  // the #survey list's own listener is not doubled.
  const sv = e.target.closest('#districtdetail [data-survey]');
  if (sv && state) decide('survey', { district: sv.dataset.survey });
});

/** Rail badges ride the same derivation as the shelf: one source of truth. */
function paintRailBadges(situations) {
  const byPanel = { ledger: 0, library: 0, people: 0, land: 0, road: 0, court: 0 };
  const redByPanel = { ...byPanel };
  const home = { work: 'library', route: 'road', town: 'land', grain: 'ledger', trust: 'court', lineage: 'people' };
  for (const s of situations) {
    if (s.tier === 'feed') continue;
    const p = home[s.kind];
    if (!p) continue;
    byPanel[p]++;
    if (s.tier === 'red') redByPanel[p]++;
  }
  for (const r of RAIL) {
    const el = document.querySelector(`[data-rail="${r.id}"] .badge`);
    if (!el) continue;
    const n = byPanel[r.id];
    el.style.display = n ? '' : 'none';
    el.textContent = n;
    el.classList.toggle('red', redByPanel[r.id] > 0);
  }
}

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
  renderEduDock();
  paintSituations(s);
  paintFlows(s);
  renderDistrictDetail(s);
  paintCourt(s);
  paintOutliner(s);

  $('pillars').innerHTML = PILLARS.map(p => {
    const v = Math.round(s.pillars[p]);
    return `<div class="pillar"><span class="tiny">${p[0] + p.slice(1).toLowerCase()}</span>
      <span class="bar"><i style="width:${v}%"></i></span><span class="n">${v}</span></div>`;
  }).join('');

  const cs = corpusSummary(s);
  $('corpus-sum').textContent = `${cs.extant} extant · ${cs.lost} lost · ${cs.unwritten} to come`;
  paintLibrary(s);

  $('goods').innerHTML = [...s.goods].map(g => `<span class="token">${g}</span>`).join('');

  const interesting = s.log.filter(l =>
    ['epoch','catastrophe','loss','goods','teacher','decision','famine','texture','preserve',
     'challenge','challenge-resolved','challenge-expired'].includes(l.kind));
  $('log').innerHTML = interesting.slice(-40).reverse().map(l =>
    `<div data-year="${l.year}" title="Open the year page for ${formatYear(l.year)}"
        style="cursor:pointer"><span class="y">${formatYear(l.year)}</span>${l.text}</div>`).join('');

  // New notices since the last paint.
  for (const l of interesting.slice(lastLogLen)) {
    if (['catastrophe','epoch','loss','challenge','challenge-resolved','challenge-expired'].includes(l.kind)) notice(l);
    // One deliberate silence, in 1193.
    if (l.kind === 'catastrophe' && /Nalanda sacked/.test(l.text)) sound.silence(4);
    else if (l.kind === 'catastrophe') sound.strike('loss');
    else if (l.kind === 'epoch') sound.strike('epoch');
    else if (l.kind === 'challenge-resolved') sound.strike('epoch');
    else if (l.kind === 'challenge-expired') sound.strike('loss');
    // The m-tier, audible: each texture incident is one quiet strike in its
    // family's timbre (phase 52).
    else if (l.kind === 'texture') sound.strikeFamily(textureFamily(l.template));
  }
  lastLogLen = interesting.length;
  syncSound();

  paintGoals(s);
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
 * Community goals (ported from the atlas prototype's GameShare.goals): what
 * a taught population actually adds up to, checked off as the campaign earns
 * it. Every target reads straight off real sim state — nothing here is a
 * second scoreboard, it is the same numbers the HUD already shows, framed as
 * a checklist.
 */
const GOAL_POP_TARGET = 10_000;
function paintGoals(s) {
  const el = $('goals');
  if (!el) return;
  const cards = [...EDU_BY_ID.values()];
  const gitaTaught = cards.filter(c => c.kind === 'gita' && s.taughtCards?.has(c.id)).length;
  const gitaTotal = cards.filter(c => c.kind === 'gita').length || 18;
  const skillTaught = cards.filter(c => c.kind === 'skill' && s.taughtCards?.has(c.id)).length;
  const skillTotal = cards.filter(c => c.kind === 'skill').length || 8;
  const totalPop = Math.round(s.pops.farmers + s.pops.reciters + s.pops.scribes
    + s.pops.merchants + s.pops.teachers + s.pops.soldiers);
  const districtsTaught = s.districtTaught?.size ?? 0;
  const DISTRICT_TARGET = 5;
  const CHALLENGE_TARGET = 3;
  const TEACHER_TARGET = 5;
  const LITERACY_TARGET = 60;

  const goals = [
    { label: 'Teach the whole Bhagavad Gita', done: gitaTaught >= gitaTotal, prog: `${gitaTaught}/${gitaTotal}` },
    { label: 'Teach all eight skills', done: skillTaught >= skillTotal, prog: `${skillTaught}/${skillTotal}` },
    { label: `Literacy above ${LITERACY_TARGET}%`, done: (s.literacy ?? 0) >= LITERACY_TARGET,
      prog: `${Math.round(s.literacy ?? 0)}/${LITERACY_TARGET}` },
    { label: `Raise ${TEACHER_TARGET} teachers`, done: s.pops.teachers >= TEACHER_TARGET,
      prog: `${Math.round(s.pops.teachers)}/${TEACHER_TARGET}` },
    { label: `A population of ${GOAL_POP_TARGET.toLocaleString()}`, done: totalPop >= GOAL_POP_TARGET,
      prog: `${totalPop.toLocaleString()}/${GOAL_POP_TARGET.toLocaleString()}` },
    { label: `Answer ${CHALLENGE_TARGET} challenges`, done: (s.stats.challengesResolved ?? 0) >= CHALLENGE_TARGET,
      prog: `${s.stats.challengesResolved ?? 0}/${CHALLENGE_TARGET}` },
    { label: `${DISTRICT_TARGET} districts taught their own lesson`, done: districtsTaught >= DISTRICT_TARGET,
      prog: `${districtsTaught}/${DISTRICT_TARGET}` },
  ];

  el.innerHTML = goals.map(g => `<div class="goal ${g.done ? 'done' : ''}">
    <span class="mark">${g.done ? '✓' : ''}</span>
    <span class="label">${g.label}</span>
    <span class="prog">${g.prog}</span>
  </div>`).join('');
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

  // The lineages (phase 9): a school is an unbroken line of hands. One member
  // left means the line ends with a single death — the Library's last-carrier
  // logic, applied to people.
  const schools = [...s.schools.values()]
    .sort((a, b) => (a.members.length - b.members.length) || (b.works.length - a.works.length));
  $('lineages').innerHTML = schools.length
    ? schools.slice(0, 8).map(sc => {
        const thin = sc.members.length <= 1;
        return `<div class="endw ${thin ? '' : ''}" style="${thin ? 'color:var(--warn);font-weight:600' : ''}"
          title="${sc.members.length} keeper(s), holding ${sc.works.length} work(s)${thin ? ' — the line ends with one death' : ''}.">
          <span>${sc.name}</span>
          <span class="num">${sc.members.length} · ${sc.works.length}w</span></div>`;
      }).join('')
    : `<div class="tiny muted">No school yet holds a line. Patronage builds them.</div>`;

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
/* ── The lens engine (phase 14) ─────────────────────────────────────────────
 * Arm → the map recolors → the click executes → Escape puts the tool down.
 * The registry fills in phases 15–18; the engine neither knows nor cares
 * which verbs exist, only that they passed validateLens at registration. */
const LENSES = [];
let LENS = null;                    // { lens, verb, payload } while armed

function registerLens(def) {
  LENSES.push(validateLens(def));
  buildLensTray();
}
function buildLensTray() {
  let tray = $('lenstray');
  if (!tray) {
    tray = document.createElement('div');
    tray.id = 'lenstray';
    tray.setAttribute('role', 'toolbar');
    tray.setAttribute('aria-label', 'Lenses');
    $('stage').appendChild(tray);
    const vr = document.createElement('div');
    vr.id = 'verbrow';
    vr.style.display = 'none';
    $('stage').appendChild(vr);
  }
  tray.style.display = LENSES.length ? '' : 'none';
  tray.innerHTML = LENSES.map(l =>
    `<button class="lens" data-lens="${l.id}" title="${l.title}"
       aria-pressed="${LENS?.lens.id === l.id}">${l.glyph}</button>`).join('');
}
function renderVerbRow() {
  const vr = $('verbrow');
  if (!LENS) { vr.style.display = 'none'; return; }
  vr.style.display = '';
  // A lens may carry a payload picker (phase 16): the thing the verb acts
  // WITH — a work to copy or send — chosen here, spent by the click.
  let picker = '';
  if (LENS.lens.payload) {
    const opts = LENS.lens.payload.options(state);
    if (!opts.some(o => o.id === LENS.payload)) LENS.payload = opts[0]?.id ?? null;
    // teachcards has its own picker — the Library shelf (#eduDock) — so the
    // raw <select> would just duplicate it; LENS.payload is still the same
    // state either way, the shelf just sets it directly instead.
    if (LENS.lens.id !== 'teachcards') {
      picker = `<select data-lens-payload title="${LENS.lens.payload.label}">
        ${opts.map(o => `<option value="${o.id}" ${o.id === LENS.payload ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>`;
    }
  }
  vr.innerHTML = picker + LENS.lens.verbs.map(v =>
    `<button class="btn" data-verb="${v.id}" title="${v.tip ?? ''}"
       style="${LENS.verb?.id === v.id ? 'border-color:var(--gold);font-weight:700' : ''}">${v.label}</button>`).join('')
    + `<span class="hint">${LENS.verb ? 'click the map · Esc puts the tool down' : 'pick a verb'}</span>`;
}
document.addEventListener('change', (e) => {
  if (e.target.matches?.('[data-lens-payload]') && LENS) {
    LENS.payload = e.target.value;
    draw(3); scheduleFull();
  }
});
function armLens(lensId) {
  const l = LENSES.find(x => x.id === lensId);
  if (!l) return;
  if (LENS?.lens.id === lensId) { cancelLens(); return; }
  LENS = { lens: l, verb: l.verbs.length === 1 ? l.verbs[0] : null, payload: null };
  l.onArm?.(state);
  buildLensTray(); renderVerbRow(); renderEduDock(); draw(3); scheduleFull();
}
function cancelLens() {
  if (!LENS) return;
  LENS.lens.onCancel?.(state);
  LENS = null;
  buildLensTray(); renderVerbRow(); renderEduDock(); draw(3); scheduleFull();
}
document.addEventListener('click', (e) => {
  const lb = e.target.closest('[data-lens]');
  if (lb) { armLens(lb.dataset.lens); return; }
  const vb = e.target.closest('#verbrow [data-verb]');
  if (vb && LENS) {
    LENS.verb = LENS.lens.verbs.find(v => v.id === vb.dataset.verb) ?? null;
    renderVerbRow(); draw(3); scheduleFull();
  }
});

/* ── The Settle lens (phase 15): the land's verbs, on the land ────────────── */
const inIndusEra = (s) => s.indus && s.year >= -2600 && s.year <= -1900;
registerLens({
  id: 'settle', glyph: '⛺',
  title: 'Settle — survey the land; triage the towns when the rivers turn',
  verbs: [
    { id: 'survey', label: 'survey',
      tip: 'A scribe and 90 grain buy the truth of a district. The truth was fixed at world-creation; looking is what costs.',
      eligible: (s, d) => d.surveyed !== null ? 'already'
        : blocked(s, 'survey') || s.pops.scribes < 1 || s.grain < 90 ? 'could' : 'can',
      execute: (d) => decide('survey', { district: d.id }) },
    { id: 'provision', label: 'provision', targets: 'town',
      tip: '120 grain slows a town’s decline for a generation. It does not stop the river.',
      eligible: (s, t) => !inIndusEra(s) || !t.standing || t.people <= 0 ? 'never'
        : t.provisioned > 0 ? 'progress' : s.grain < 120 ? 'could' : 'can',
      execute: (t) => decide('provision-town', { town: t.id }) },
    { id: 'wells', label: 'dig wells', targets: 'town',
      tip: '80 grain. Three wells per town, each worth a generation; the third finds the same falling water table as the first.',
      eligible: (s, t) => !inIndusEra(s) || !t.standing ? 'never'
        : t.wells >= 3 ? 'already' : s.grain < 80 ? 'could' : 'can',
      execute: (t) => decide('dig-wells', { town: t.id }) },
    { id: 'resettle', label: 'resettle east', targets: 'town',
      tip: '100 grain. A planned column moves east with seed, tools and the songs — smaller town, larger future.',
      eligible: (s, t) => !inIndusEra(s) || t.people <= 0 ? 'never'
        : s.grain < 100 ? 'could' : 'can',
      execute: (t) => decide('resettle-east', { town: t.id }) },
  ],
});

/* ── The Trade lens (phase 17): the road's verbs, on the road ─────────────── */
// The trust ladder: you start with your relatives and those nearby.
const OPENABLE_ROUTES = [
  { id:'R.KAVERI',  from:'thanjavur', to:'kaveripattinam', days:6,  capacity:8,  need:850,  mode:'land' },
  { id:'R.MALABAR', from:'thanjavur', to:'muziris',        days:22, capacity:12, need:-300, mode:'land' },
  { id:'R.WEST',    from:'muziris',   to:'bharuch',        days:48, capacity:16, need:-300, mode:'sea'  },
];
registerLens({
  id: 'trade', glyph: '\u2696',
  title: 'Trade \u2014 open roads, send caravans, tend the standing orders',
  verbs: [
    { id: 'open', label: 'open route', targets: 'openable',
      tip: 'Opening a route costs nothing but attention. Keeping it open costs everything else.',
      eligible: (s, t) => s.routes.has(t.id) ? 'already'
        : s.year < t.need ? 'could' : 'can',
      execute: (t) => decide('open-route', { id: t.id, from: t.from, to: t.to,
        days: t.days, capacity: t.capacity, mode: t.mode }) },
    { id: 'caravan', label: 'send caravan', targets: 'openroutes',
      tip: 'Goods take days. Payment takes longer. Click the road\u2019s far end.',
      eligible: (s, t) => { const r = s.routes.get(t.id);
        return !r ? 'never' : r.choke ? 'could' : !r.open ? 'never'
          : s.grain < 5 ? 'could' : 'can'; },
      execute: (t) => decide('send-caravan', { route: t.id }) },
    { id: 'orders', label: 'set orders', targets: 'openroutes',
      tip: 'Open the road\u2019s standing orders \u2014 escort level and choke policy.',
      eligible: (s, t) => s.routes.has(t.id) ? 'can' : 'never',
      execute: () => openRail('road', false) },
  ],
});

/* ── The Remember lens (phase 16): the corpus made spatial ────────────────── */
// Only the verbs that are HONESTLY spatial in the sim: copying happens at
// your scriptoria; the teacher's road to Lanka is on the map, and Aluvihare
// is the game's founding example of the redundancy call. Generic 'send
// abroad' stays a Library button — pretending Baghdad is on an India-only
// map would be a lie the census warns about (style over substance).
registerLens({
  id: 'remember', glyph: '✍',
  title: 'Remember — copy at your scriptoria; send a teacher down the Lanka road',
  payload: {
    label: 'The work in hand — thinnest first.',
    options: (s) => worksAtRisk(s, 'home').slice(0, 20)
      .map(w => ({ id: w.id, label: `${w.title} (${w.carriers}×)` })),
  },
  verbs: [
    { id: 'copy', label: 'copy here',
      tip: '60 grain, a scribe’s season. One more carrier of the work in hand, kept at home.',
      eligible: (s, d, work) => !work ? 'never'
        : s.claims.get(d.id)?.holder !== 'you' ? 'never'
        : blocked(s, 'copy') || s.grain < 60 || s.pops.scribes < 1 ? 'could' : 'can',
      execute: (d, work) => decide('copy', { work }) },
    { id: 'teach', label: 'send a teacher', targets: 'lanka',
      tip: '120 grain and a keeper takes the road south. A copy at Aluvihare is maintained there — for ever.',
      eligible: (s, t, work) => !work ? 'never'
        : blocked(s, 'send-teacher') ? 'could'
        : s.grain < 120 || (s.pops.scribes < 1 && s.pops.reciters < 2) ? 'could' : 'can',
      execute: (t, work) => decide('send-teacher', { work, destination: t.id }) },
  ],
});

/* ── The outliner (phase 19) ────────────────────────────────────────────────
 * The player chooses what stays visible; the game insists on what cannot be
 * looked away from. Pins are a client preference (localStorage); auto-pins
 * derive from state and are non-removable while their condition runs. */
let pins = [];
try { pins = JSON.parse(localStorage.getItem('pm-pins') ?? '[]'); } catch {}
function savePins() { try { localStorage.setItem('pm-pins', JSON.stringify(pins)); } catch {} }
function togglePin(type, id, label) {
  const i = pins.findIndex(p => p.type === type && p.id === id);
  if (i >= 0) pins.splice(i, 1);
  else pins.push({ type, id, label });
  savePins();
  if (state) { paintOutliner(state); paint(); }
}
const isPinned = (type, id) => pins.some(p => p.type === type && p.id === id);

function paintOutliner(s) {
  // Pinned: the player's own shortlist.
  $('outliner-pins').innerHTML = pins.length ? pins.map(p => {
    let meta = '';
    if (p.type === 'work') {
      const c = s.corpus.get(p.id);
      meta = c ? (c.lost ? `lost ${formatYear(c.lostYear)}` : `${c.carriers.length} carrier(s)`) : '';
    } else if (p.type === 'route') {
      const r = s.routes.get(p.id);
      meta = r ? (r.choke ? CHOKES[r.choke.kind].label : `${throughput(r, s.year).toFixed(1)}/yr`) : 'closed';
    }
    return `<div class="pinned" data-pin-open="${p.type}:${p.id}">
      <div class="t"><b>${p.label}</b><span class="star" data-pin-x="${p.type}:${p.id}" title="Unpin">★</span></div>
      ${meta ? `<div class="meta">${meta}</div>` : ''}</div>`;
  }).join('') : `<div class="tiny muted">Nothing pinned. Stars on works and routes pin them here.</div>`;

  // Ongoing: the auto-pins. Non-removable while they run — the census rule.
  const auto = [];
  if (campaign) {
    const ch = chapterAt(s.year);
    const pct = Math.round(((s.year - ch.from) / Math.max(1, ch.to - ch.from)) * 100);
    auto.push(`<div class="pinned auto" title="${ch.asks}">
      <div class="t"><b>Chapter: ${ch.name}</b></div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`);
  }
  for (const m of s.missions ?? []) {
    const pct = Math.min(100, Math.round((m.elapsed / m.days) * 100));
    auto.push(`<div class="pinned auto"><div class="t"><b>Mission: ${m.route}</b></div>
      <div class="meta">${m.method} · marching</div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`);
  }
  if (s.indus && s.year >= -2600 && s.year <= -1900) {
    const standing = [...s.indus.values()].filter(t => t.standing);
    const avg = standing.length ? standing.reduce((a, t) => a + t.water, 0) / standing.length : 0;
    auto.push(`<div class="pinned auto" title="The average water of the standing towns. Nothing stops this; you choose what leaves.">
      <div class="t"><b>The drying</b></div>
      <div class="meta">${standing.length} towns stand</div>
      <div class="bar"><i style="width:${Math.round(avg * 100)}%"></i></div></div>`);
  }
  $('outliner-auto').innerHTML = auto.join('') ||
    `<div class="tiny muted">Nothing runs against you tonight.</div>`;

  // Copying: the desks, thinnest first.
  const sm = scriptoriumModel(s);
  $('copyqueue').innerHTML = sm.desks.length ? sm.desks.slice(0, 4).map(d =>
    `<div class="pinned" data-pin-open="work:${d.id}" title="Open in the Library">
      <div class="t"><b>${d.title}</b></div>
      <div class="meta">${d.written} written of ${d.carriers} · onto ${sm.medium}</div></div>`).join('')
    : `<div class="tiny muted">${sm.scribes ? 'The desks are clear.' : 'No scribes — nothing can be copied.'}</div>`;
}
document.addEventListener('click', (e) => {
  const x = e.target.closest('[data-pin-x]');
  if (x) { const [t, ...r] = x.dataset.pinX.split(':'); togglePin(t, r.join(':')); return; }
  const star = e.target.closest('[data-pin-star]');
  if (star) {
    const [t, ...r] = star.dataset.pinStar.split(':');
    togglePin(t, r.join(':'), star.dataset.pinLabel ?? r.join(':'));
    return;
  }
  const open = e.target.closest('[data-pin-open]');
  if (open) {
    const [t, ...r] = open.dataset.pinOpen.split(':');
    const id = r.join(':');
    if (t === 'work') { libSelected = id; openRail('library', false); if (state) paintLibrary(state); }
    else if (t === 'route') openRail('road', false);
  }
});
$('outliner-tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-otab]');
  if (!b) return;
  for (const t of $('outliner-tabs').children) t.setAttribute('aria-selected', t === b);
  const pinnedOnly = b.dataset.otab === 'pinned';
  for (const el of document.querySelectorAll('aside .o-all'))
    el.style.display = pinnedOnly ? 'none' : '';
});

/* ── The corpus map mode + Mandala lens (phase 18) ────────────────────────── */
/** Where the works physically are: a ring per holding place, sized by count. */
function drawCorpusMode(proj) {
  if (!state) return;
  const counts = new Map();          // place → carriers there
  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    for (const x of c.carriers) counts.set(x.place, (counts.get(x.place) ?? 0) + 1);
  }
  ctx.save();
  for (const [place, n] of counts) {
    const g = place === 'home'
      ? (campaign ? { lon: 79.14, lat: 10.79 } : { lon: 67.6, lat: 29.4 })
      : PLACE_BY_ID.get(place);
    if (!g) continue;                // 'abroad' and 'tibet' are off this map
    const x = proj.toX(g.lon), y = proj.toY(g.lat);
    ctx.beginPath();
    ctx.arc(x, y, (8 + Math.min(26, Math.sqrt(n) * 5)) * dpr, 0, Math.PI * 2);
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 2.2 * dpr;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.font = `${11 * dpr}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = '#C9A227';
    ctx.fillText(String(n), x + 6 * dpr, y - 6 * dpr);
  }
  ctx.restore();
}

registerLens({
  id: 'mandala', glyph: '\u25CE',
  title: 'Mandala \u2014 press claims, offer tribute; the map answers in four layers',
  onArm() {
    this._prevMode = mapMode;
    if (!modeLocked) setMapMode('mandala');
  },
  onCancel() {
    if (!modeLocked && this._prevMode) setMapMode(this._prevMode);
  },
  verbs: [
    { id: 'hold', label: 'press claim',
      tip: 'Assert the holder layer here. A claim is a statement the years then test.',
      eligible: (s, d) => {
        const c = s.claims.get(d.id);
        return c?.holder === 'you' ? 'yours' : 'can';
      },
      execute: (d) => decide('claim', { district: d.id, layer: 'holder' }) },
    { id: 'revenue', label: 'claim revenue',
      tip: 'Assert the revenue layer: the right to tax, which is not the same as holding.',
      eligible: (s, d) => {
        const c = s.claims.get(d.id);
        return c?.revenue === 'you' ? 'yours' : c?.holder === 'you' ? 'can'
          : c?.holder ? 'could' : 'can';
      },
      execute: (d) => decide('claim', { district: d.id, layer: 'revenue' }) },
    { id: 'tribute', label: 'offer tribute',
      tip: 'Acknowledge a superior over this district \u2014 the mandala\u2019s oldest move. Needs a standing power over you.',
      eligible: (s, d) => (s.occupationsActive?.size ?? 0) === 0 ? 'never'
        : s.claims.get(d.id)?.tributary ? 'already' : 'can',
      execute: (d) => {
        const to = [...state.occupationsActive][0];
        decide('tribute', { district: d.id, to });
      } },
  ],
});

/* ── The Teach lens: the atlas game's learning loop, on the table ─────────
 * A card is a crisp recitable line over a corpus work. Arm the lens, study
 * a card off the shelf, recite it over a district: decide('recite',
 * {work, card, district}) — the work gains a living carrier, the card
 * itself is credited (several cards can share one work — all 18 Gita
 * chapters are one WRK.GITA), and the chibi crowd in the people mode stops
 * to listen. This also lands the "endow school" verb docs/21-hud.md §A4
 * specified and phase 16 left out. */
const EDU_BY_ID = new Map((EDU?.cards ?? []).map(c => [c.id, c]));

/** A card's 1-based position within its own kind, parsed from its id
 *  ("EDU.GITA.07" → 7). Only Gita chapters are sequenced; everything else
 *  reports 0 and is therefore never locked. */
function eduOrder(id) {
  if (!id.startsWith('EDU.GITA.')) return 0;
  return parseInt(id.slice('EDU.GITA.'.length), 10) || 0;
}
const eduSibling = (n) => 'EDU.GITA.' + String(n).padStart(2, '0');

function eduAvailable(s, card) {
  const w = s.corpus.get(card.work);
  return !!(w && w.exists && !w.lost);
}
function eduLocked(s, card) {
  return isCardLocked(s, { kind: card.kind, order: eduOrder(card.id) }, eduSibling);
}
/** locked / taught / fading / studied / fresh — the shelf badge state. */
function eduCardState(s, card) {
  if (eduLocked(s, card)) return 'locked';
  if (s.taughtCards?.has(card.id)) {
    return cardFreshness(s, card.id) < 0.75 ? 'fading' : 'taught';
  }
  if (s.studied?.has(card.id)) return 'studied';
  return 'fresh';
}
const EDU_BADGE = { locked: '🔒', fresh: '✨', studied: '📖', taught: '✔', fading: '🕯' };
const EDU_KIND_LABEL = { gita: 'गीता', skill: 'कौशल' };

function renderEduDock() {
  const dock = $('eduDock');
  if (LENS?.lens?.id !== 'teachcards' || !state) { dock.hidden = true; return; }
  dock.hidden = false;
  const cards = (EDU?.cards ?? []).filter((c) => eduAvailable(state, c));
  dock.innerHTML = `<div class="edu-head">the library — study a card, then recite it to a district</div>
    <div class="edu-shelf">${cards.map((c) => {
      const st = eduCardState(state, c);
      const locked = st === 'locked';
      return `<button class="edu-card ${st} ${LENS.payload === c.id ? 'armed' : ''}"
        data-edu-card="${c.id}" ${locked ? 'disabled' : ''}
        title="${locked ? 'Recite the previous chapter first' : ''}">
        <span class="ek">${EDU_BADGE[st]}</span>
        <span class="et">${EDU_KIND_LABEL[c.kind] ?? c.kind}</span>
        <span class="en">${c.title}</span>
        <span class="es">${c.subtitle}</span>
      </button>`;
    }).join('')}</div>`;
}
$('eduDock').addEventListener('click', (e) => {
  const b = e.target.closest('[data-edu-card]');
  if (!b || b.disabled || !LENS) return;
  const card = EDU_BY_ID.get(b.dataset.eduCard);
  if (!card) return;
  openEduStudy(card);
});

/** The study card: rendered into the shared #drawer, exactly like a
 *  timeline event card. Opening it is itself a `study` decision (reading
 *  is teaching, just gentler) — free, ambient, idempotent. A taught card
 *  gets a recall quiz instead of the "go recite this" nudge. */
function openEduStudy(card) {
  LENS.payload = card.id;
  renderVerbRow(); renderEduDock();
  if (state && !state.studied.has(card.id)) decide('study', { kind: 'edu', id: card.id });

  const taught = state.taughtCards?.has(card.id);
  let body = `<div class="study-kicker">${card.kind === 'gita' ? 'BHAGAVAD GITA' : 'SKILL'} · ${card.subtitle}</div>
    <h3>${card.title}</h3>
    <div class="study-recite"><p>“${card.recite}”</p></div>
    <p>${card.summary}</p>`;
  if (card.sloka) {
    body += `<div class="study-sloka">
      <div class="dev">${card.sloka.sa}</div>
      <div class="tr">${card.sloka.translit}</div>
      <div>${card.sloka.en} <span class="ref">(${card.sloka.ref})</span></div>
    </div>`;
  }
  if (card.source) body += `<div class="study-source">${card.source}</div>`;

  if (taught) {
    const pool = (EDU?.cards ?? []).filter((c) => c.id !== card.id && eduAvailable(state, c));
    const opts = [card.title];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    while (opts.length < 3 && shuffled.length) opts.push(shuffled.pop().title);
    opts.sort(() => Math.random() - 0.5);
    body += `<div class="study-quiz"><div class="study-kicker">RECALL QUIZ</div>
      <p>Which teaching is the line above from?</p>
      ${opts.map((t) => `<button class="quiz-opt" data-ok="${t === card.title ? 1 : 0}">${t}</button>`).join('')}
      <div class="quiz-msg"></div></div>`;
  } else {
    body += `<p class="study-source">Arm this card, then click a district on the map to recite it — ${RECITE_COST} grain and a reciter's breath.</p>`;
  }
  $('drawer-inner').innerHTML = body;
  $('drawer').classList.add('on');
}
document.addEventListener('click', (e) => {
  const q = e.target.closest('.quiz-opt');
  if (!q) return;
  const msg = q.closest('.study-quiz').querySelector('.quiz-msg');
  if (q.dataset.ok === '1') {
    // studying it again (the quiz itself is the "reading") already keeps it
    // in state.studied; the real refresh is a fresh recital, so point there
    msg.textContent = '✔ Recalled correctly — recite it again to truly refresh the people’s memory.';
    msg.className = 'quiz-msg good';
  } else {
    q.classList.add('shake');
    msg.textContent = 'Not this one — read the line again.';
    msg.className = 'quiz-msg bad';
    setTimeout(() => q.classList.remove('shake'), 400);
  }
});

if (EDU_BY_ID.size) {
  registerLens({
    id: 'teachcards', glyph: '📖',
    title: 'Teach — study a card off the shelf, recite it to the people of a district',
    onArm() {
      this._prevMode = mapMode;
      if (!modeLocked) setMapMode('people');
    },
    onCancel() {
      cancelHoldRecite();
      setListenFocus(null);
      $('eduDock').hidden = true;
      if (!modeLocked && this._prevMode) setMapMode(this._prevMode);
    },
    payload: {
      // the shelf (#eduDock) is the real picker; this stays the source of
      // truth the lens engine and verbs read (LENS.payload)
      label: 'The card in hand — its line is what you will recite.',
      options: (s) => (EDU?.cards ?? [])
        .filter((c) => eduAvailable(s, c) && !eduLocked(s, c))
        .map((c) => ({ id: c.id, label: `${c.title} — “${c.recite}”` })),
    },
    verbs: [
      { id: 'recite', label: 'recite here',
        tip: `${RECITE_COST} grain and a reciter's breath. The card's work gains a living carrier and the people remember it for a generation.`,
        eligible: (s, d, cardId) => !cardId ? 'never'
          : s.pops.reciters < 1 || s.grain < RECITE_COST ? 'could' : 'can',
        execute: (d, cardId) => {
          const card = EDU_BY_ID.get(cardId);
          if (card) decide('recite', { work: card.work, card: card.id, district: d.id });
        } },
      { id: 'endow', label: 'endow a school',
        tip: 'Grain to a living lineage, so the teaching outlives the teacher.',
        eligible: (s) => endowable(s).length ? 'can' : 'could',
        execute: () => {
          const e = endowable(state);
          if (e.length) decide('endow', { person: e[0].id });
        } },
    ],
  });
}

/* ── The Court (phase 12): the stack, the occupations, the ladder ─────────── */
function paintCourt(s) {
  const cap = trustCeiling(s, DP);
  const rung = trustRung(s, cap), next = nextRung(s);
  const capped = cap != null && s.pillars.NETWORKING > cap;
  const LAYERS4 = ['holder', 'revenue', 'tributary', 'paramount'];
  const mine = [...s.claims.entries()].filter(([, c]) => LAYERS4.some(l => c[l] === 'you'));
  const mark = (c, l) => c[l] === 'you'
    ? `<b style="color:var(--gold)" title="${l}: yours at ${Math.round((c.strength[l] ?? 0) * 100)}%">●</b>`
    : c[l] ? `<span title="${l}: ${c[l]}" style="color:var(--ink-soft)">●</span>`
    : `<span class="tiny muted" title="${l}: nobody">·</span>`;
  const occRows = [...(s.occupationsActive ?? [])].map(id => {
    const o = (occupations.occupations ?? []).find(x => x.id === id);
    if (!o) return '';
    return `<div class="route"><div class="nm"><span>${o.name}</span>
        <span class="num">${o.extract ? `takes ${o.extract}/yr` : 'takes nothing'}</span></div>
      <div class="tiny muted">${o.trustCap != null ? `caps trust at ${o.trustCap} · ` : ''}${
        Object.keys(o.patronage ?? {}).length ? `patronises ${Object.keys(o.patronage).map(x => x.toLowerCase()).join(', ')}` : ''}</div></div>`;
  }).join('');
  $('court').innerHTML = `
    <div class="tiny muted" style="margin-bottom:4px">The ladder</div>
    <div class="ledger-row"><span>trust</span><span class="v">${rung.name}${capped ? ` <b style="color:var(--warn)">capped ${cap}</b>` : ''}</span></div>
    ${next ? `<div class="tiny muted">next: ${next.name} at ${next.need}</div>` : ''}
    ${occRows ? `<div class="tiny muted" style="margin:8px 0 4px">Standing rule over you</div>${occRows}` : ''}
    <div class="tiny muted" style="margin:8px 0 4px">Where you stand — held · taxed · tribute · paramount</div>
    ${mine.length ? mine.slice(0, 12).map(([id, c]) => {
      const d = s.districts.get(id);
      return `<div class="chron-line" data-court-d="${id}" style="cursor:pointer" title="Open ${d?.name ?? id} in the Land panel">
        <span>${d?.name ?? id}</span>
        <span style="display:flex;gap:6px">${LAYERS4.map(l => mark(c, l)).join('')}</span></div>`;
    }).join('') : `<div class="tiny muted">No claim yet bears your seal.</div>`}`;
}
document.addEventListener('click', (e) => {
  const r = e.target.closest('[data-court-d]');
  if (r && state) { landSelected = r.dataset.courtD; renderDistrictDetail(state); openRail('land', false); }
});

/* ── The Road's second half (phase 11): missions and partners ─────────────── */
function paintMissions(s) {
  const ms = s.missions ?? [];
  $('missionlist').innerHTML = ms.length ? ms.map(m => {
    const pct = Math.min(100, Math.round((m.elapsed / m.days) * 100));
    return `<div class="route"><div class="nm"><span>⚑ ${m.route} — ${m.method}</span>
        <span class="num">${pct}%</span></div>
      <div class="four"><span><i><b style="width:${pct}%"></b></i></span></div></div>`;
  }).join('') : `<div class="tiny muted">Nobody is on the march.</div>`;
}
function paintPartners(s) {
  const ps = [...(s.partners?.values() ?? [])];
  $('partnerlist').innerHTML = ps.length ? ps.map(p => {
    const standing = Math.round(s.standing.get(p.id) ?? p.standing ?? 0);
    const gen = Math.floor(s.year / 30);
    const g = s.shareGen?.get(p.id);
    const given = (g && g.gen === gen) ? g.count : 0;
    const next = Math.round(8 * (1 / (1 + given)) ** 2 * 10) / 10;
    const can = s.grain >= 30;
    return `<div class="route"><div class="nm"><span>${p.name ?? p.id}</span>
        <span class="num">standing ${standing}</span></div>
      <div class="acts" style="margin-top:3px">
        <button class="btn tiny" data-share="${p.id}" ${can ? '' : 'disabled'}
          title="30 grain. This generation has been given to ${given} time(s); the next gift buys about +${next} standing — appetite resets in ${30 - (s.year % 30)} year(s).">share surplus</button>
      </div></div>`;
  }).join('') : `<div class="tiny muted">Nobody within reach yet. Roads make partners.</div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-share]');
  if (b && state) decide('share', { with: b.dataset.share });
});

function paintRoutes() {
  const s = state;
  const rs = [...s.routes.values()];
  paintMissions(s);
  paintPartners(s);
  $('routes').innerHTML = rs.length ? rs.map(r => {
    const bar = (v) => `<span><i><b style="width:${Math.round(v * 100)}%"></b></i></span>`;
    const t = throughput(r, s.year);
    return `<div class="route ${r.choke ? 'choked' : ''}">
      <div class="nm"><span><span class="star" style="cursor:pointer;color:${isPinned('route', r.id) ? 'var(--gold)' : 'var(--ink-faint)'}"
          data-pin-star="route:${r.id}" data-pin-label="${r.from} → ${r.to}" title="Pin to the outliner">★</span>
        ${r.from} → ${r.to}</span>
        <span class="num">${r.choke ? CHOKES[r.choke.kind].label : t.toFixed(1) + '/yr'}</span></div>
      <div class="four" title="capacity · hold · safety · season">
        ${bar(Math.min(1, r.capacity / 20))}${bar(r.hold)}${bar(r.safety)}${bar(0.9)}</div>
    </div>`;
  }).join('') : `<div class="tiny muted">No routes yet. Trade begins with the people you already know.</div>`;

  const acts = [];
  const OPENABLE = OPENABLE_ROUTES;
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
             : l.kind === 'texture' ? 'notice--texture'
             : l.kind === 'challenge' ? 'notice--challenge'
             : l.kind === 'challenge-expired' ? 'notice--loss'
             : l.kind === 'challenge-resolved' ? 'notice--good' : 'notice--good';
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
    // An armed tool is the topmost thing on the table: Escape puts it down
    // first, and only an empty hand closes what is under it.
    if (LENS) { cancelLens(); return; }
    $('drawer').classList.remove('on');
    document.querySelector('.plate-overlay')?.remove();
    closeRail();
  }
});

/* ── Test hook (headless drives only; not a player surface) ─────────────── */
window.__test = {
  year: () => state?.year,
  cam: () => ({ cx: cam.cx, cy: cam.cy, span: cam.span }),
  lonLatToScreen(lon, lat) {
    const proj = cam.projection(cv.width, cv.height);
    const rect = cv.getBoundingClientRect();
    return { x: rect.left + proj.toX(lon) / dpr, y: rect.top + proj.toY(lat) / dpr };
  },
  chibisNear: (lon, lat) => chibiCountNear(state, BOUNDARIES, lon, lat),
  challenges: () => state?.challenges,
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
  // The people mode is alive even with the clock stopped: the crowd's gentle
  // wander is wall-clock presentation, so it needs frames while visible.
  if (!playing && state && mapMode === 'people') draw(3);
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
