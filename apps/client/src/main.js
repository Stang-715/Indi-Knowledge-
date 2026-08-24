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

const $ = (id) => document.getElementById(id);

/** Startup timing, kept in the build: a slow first paint is a real bug. */
const T0 = performance.now();
const marks = [];
const mark = (label) => { marks.push([label, performance.now() - T0]); };

/* ── World ──────────────────────────────────────────────────────────────── */

const [bundle, timeline, works, cityData] = await Promise.all([
  fetch('../../data/skeleton/bundle.json').then(r => r.json()),
  fetch('../../data/timeline/timeline.json').then(r => r.json()),
  fetch('../../data/corpus/works.json').then(r => r.json()),
  fetch('../../data/cities/cities.json').then(r => r.json()),
]);

mark('fetch');
const SK = loadSkeleton(bundle);
const O  = compileOrography(SK.oro);
mark('skeleton');
const climate = buildClimate(O, SK.bbox, SK.land, SK.rivers, { size: 220, sweeps: 90 });
mark('climate');
const renderer = new RealmRenderer({ skeleton: SK, climate });
const cityRenderer = new CityRenderer({ cities: cityData.cities });
const DP = { timeline, works };

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
  }

  drawSites(proj, level, dive);
}

/**
 * Which city we are diving into, and how far in.
 *
 * Nothing happens until L8.6, and by L10.4 the city is fully drawn. The camera
 * centre has to be inside the city's own footprint — you dive into a place, not
 * into a zoom level.
 */
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
    // Caravans in transit, as marks moving along the road.
    for (const c of state.caravans) {
      const r = state.routes.get(c.route); if (!r) continue;
      const a = SITE_BY_ID.get(r.from), b = SITE_BY_ID.get(r.to); if (!a || !b) continue;
      const k = c.state === 'outbound' ? Math.min(1, c.progress / c.days) : 1;
      const x = proj.toX(a.lon + (b.lon - a.lon) * k);
      const y = proj.toY(a.lat + (b.lat - a.lat) * k);
      ctx.fillStyle = '#2A2118';
      ctx.beginPath(); ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2); ctx.fill();
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
cv.addEventListener('pointerup', endDrag);
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

/* ── The game ───────────────────────────────────────────────────────────── */

const SEED = new URLSearchParams(location.search).get('seed') ?? 'paramountcy';
let decisions = [];
let state = null;
let target = -6000;
let playing = false;
let speed = 1;

const SPEEDS = [1, 5, 25, 100];
let speedIdx = 0;

/** Recompute the world from (datapack, seed, decisions). The rule, literally. */
function recompute() {
  state = run(DP, SEED, decisions, { to: target });
  paint();
}

function decide(action, extra = {}) {
  decisions.push({ year: state.year, action, ...extra });
  recompute();
}

/* ── Painting the UI ────────────────────────────────────────────────────── */

const PILLARS = ['DESIGN','IT','STRUCTURE','CLASSICISM','NETWORKING','TRADE','CULTIVATION','AGRICULTURE'];
const ERA_MATERIAL = (y) =>
  y < -3300 ? 'neolithic' : y < -1300 ? 'bronze' : y < -200 ? 'iron'
  : y < 650 ? 'classical' : y < 1500 ? 'medieval' : 'modern';

let lastLogLen = 0;

function paint() {
  const s = state;
  $('year').textContent = formatYear(s.year);
  const era = timeline.eras.find(e => s.year >= e.from && s.year < e.to) ?? timeline.eras[15];
  $('era').textContent = era.name;
  document.body.dataset.era = ERA_MATERIAL(s.year);
  $('gnomon').style.setProperty('--sun', `${((s.year + 6000) / 7947 * 300 - 150).toFixed(0)}deg`);

  const n = (v) => Math.round(v).toLocaleString();
  $('grain').textContent    = n(s.grain);
  $('coin').textContent     = s.coinageKnown ? n(s.coin) : '—';
  $('farmers').textContent  = n(s.pops.farmers);
  $('reciters').textContent = n(s.pops.reciters);
  $('scribes').textContent  = n(s.pops.scribes);
  $('soldiers').textContent = n(s.pops.soldiers);

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
    ['epoch','catastrophe','loss','goods','teacher','decision','famine'].includes(l.kind));
  $('log').innerHTML = interesting.slice(-40).reverse().map(l =>
    `<div><span class="y">${formatYear(l.year)}</span>${l.text}</div>`).join('');

  // New notices since the last paint.
  for (const l of interesting.slice(lastLogLen)) {
    if (['catastrophe','epoch','loss'].includes(l.kind)) notice(l);
  }
  lastLogLen = interesting.length;

  paintActions();
  paintRoutes();
}

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
    if (r.choke) {
      const spec = CHOKES[r.choke.kind];
      const method = spec.works[0];
      acts.push(`<button class="btn btn--primary" data-route="clear" data-id="${r.id}"
        data-method="${method}" title="${spec.label} — try to ${method}">
        ${method === 'reroute' ? 'Reroute' : method === 'pay' ? 'Pay the toll' : 'Clear'} ${r.to}</button>`);
    } else {
      acts.push(`<button class="btn" data-route="caravan" data-id="${r.id}"
        title="Goods take days. Payment takes longer.">Send caravan</button>`);
      if (r.safety < 0.9 && s.pops.soldiers >= 5)
        acts.push(`<button class="btn" data-route="escort" data-id="${r.id}"
          title="Safety and speed trade against each other.">Escort</button>`);
      if (r.hold < 0.9 && s.pops.soldiers >= 5)
        acts.push(`<button class="btn" data-route="garrison" data-id="${r.id}"
          title="Hold is how much of the road is actually yours.">Garrison</button>`);
    }
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
  else if (d.route === 'escort')   decide('escort',   { route: d.id });
  else if (d.route === 'garrison') decide('garrison', { route: d.id });
});

function paintActions() {
  const s = state;
  const atRisk = worksAtRisk(s, 'home').filter(w => w.carriers <= 3);
  const acts = [
    { a:'patronise',    label:'Feed a reciter',   ok: s.grain >= 50,
      tip:'50 grain. One more work held in living memory.' },
    { a:'train-scribe', label:'Train a scribe',   ok: s.grain >= 80 && s.pillars.IT >= 8,
      tip:'80 grain. Scribes maintain manuscripts and make new ones.' },
    { a:'raise-soldiers', label:'Raise 5 soldiers', ok: s.grain >= 100,
      tip:'100 grain. Soldiers make roads safe for caravans.' },
  ];
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
             : l.kind === 'epoch' ? 'notice--epoch' : 'notice--good';
  const el = document.createElement('div');
  el.className = `notice ${kind}`;
  el.innerHTML = `<b>${formatYear(l.year)}</b> — ${l.text}`;
  $('notices').append(el);
  setTimeout(() => { el.style.transition = 'opacity 500ms'; el.style.opacity = 0;
                     setTimeout(() => el.remove(), 520); }, 5200);
  while ($('notices').children.length > 4) $('notices').firstChild.remove();
}

/* ── The loop ───────────────────────────────────────────────────────────── */

$('play').addEventListener('click', () => {
  playing = !playing;
  $('play').textContent = playing ? '❚❚ pause' : '▶ play';
});
$('speed').addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  speed = SPEEDS[speedIdx];
  $('speed').textContent = `${speed}×`;
});

let acc = 0, lastT = 0;
function tick(t) {
  requestAnimationFrame(tick);
  const dt = lastT ? Math.min(100, t - lastT) : 16;
  lastT = t;
  if (!playing || !state) return;
  acc += dt;
  const step = 45;                       // ms per advance
  while (acc >= step) {
    acc -= step;
    const years = state.year < -1300 ? 5 * speed : 1 * speed;
    target = Math.min(1947, target + years);
  }
  if (target !== state.year) {
    recompute();
    // The map must redraw as the world changes, or destroyed sites go on
    // showing as live. This is the P0 fault from HANDOFF.md.
    draw(3);
    if (target >= 1947) { playing = false; $('play').textContent = '▶ play'; }
  }
}

/* ── Go ─────────────────────────────────────────────────────────────────── */

addEventListener('resize', resize);
resize();
mark('first-draw');
recompute();
mark('sim');
// Paint the coarse pass and clear the curtain first, then refine. Waiting for
// the full pass before showing anything is what made this take thirty seconds.
draw(3);
mark('preview');
$('loading').remove();
requestAnimationFrame(() => {
  draw(1);
  mark('full');
  console.info('startup', marks.map(([l, t]) => `${l} ${t.toFixed(0)}ms`).join(' · '));
  requestAnimationFrame(tick);
});

// Handy in the console: the save file is the decision log.
Object.assign(globalThis, {
  paramountcy: { get state() { return state; }, decisions, cam, draw, recompute, marks,
                 save: () => JSON.stringify({ seed: SEED, decisions }) },
});
