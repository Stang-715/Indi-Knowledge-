/**
 * The people map mode: the atlas game's chibi population, on Paramountcy's
 * table. Placement is presentation, never state — figures scatter around
 * district centroids by drawFrom(seed, ...keys), so the crowd is stable
 * while you watch, different a generation later, and identical on replay.
 * The gentle wander is wall-clock, which is allowed here: nothing reads it
 * back into the sim.
 */
import { drawFrom } from '../../../packages/sim/src/rng.js';
import { armyLevel } from '../../../packages/sim/src/military.js';

const PALETTE = ['#f4491c', '#00a085', '#fdae1c', '#7a4e8e', '#f79fb4'];

let listen = null; // {lon, lat, rDeg} while the Teach lens hovers the map

export function setListenFocus(f) { listen = f; }

/**
 * Scale: a fixed roster of chibi glyphs, not one per head — nobody wants to
 * count a billion dots. TARGET stays constant as the population grows from
 * a few thousand to millions; instead the PEOPLE each glyph stands for grows,
 * and the glyph grows with it — a hamlet's chibi looks like everyone else's,
 * a metropolis's chibi is visibly bigger. "The bigger the chibi, the bigger
 * the city" is the whole idea; this is its arithmetic.
 */
const TARGET_CHIBIS = 160;

function scaleFor(peopleHere) {
  if (peopleHere < 400) return 1.0;      // a hamlet
  if (peopleHere < 4_000) return 1.25;   // a village
  if (peopleHere < 40_000) return 1.55;  // a town
  if (peopleHere < 400_000) return 1.9;  // a city
  return 2.3;                            // a metropolis — one figure for a great many
}

/**
 * How much of the population lives near each atlas district, for the
 * purpose of handing out the chibi roster — not a claim about real
 * settlement counts. Weighted by the sim's own survey grid (packages/sim/
 * src/survey.js), whose `land` field is real terrain coverage, not invented
 * here: it is the same number the Survey map mode and district estimates
 * already use. Computed once (terrain is static for the campaign) and cached.
 */
let districtWeight = null;
function buildDistrictWeights(boundaries, simDistricts) {
  const grid = [...simDistricts.values()];
  const w = new Map();
  for (const s of boundaries.states) {
    for (const d of s.districts) {
      let best = 1, bestDist = Infinity;
      for (const g of grid) {
        const dd = (g.lon - d.c[0]) ** 2 + (g.lat - d.c[1]) ** 2;
        if (dd < bestDist) { bestDist = dd; best = g.land ?? 1; }
      }
      w.set(d.id, Math.max(0.15, best));
    }
  }
  return w;
}

/** role for figure i, from the sim's own population mix */
function roleFor(pops, u) {
  const total = pops.farmers + pops.reciters + pops.scribes + pops.merchants + pops.teachers + pops.soldiers || 1;
  let acc = 0;
  for (const role of ['reciters', 'scribes', 'teachers', 'merchants', 'soldiers', 'farmers']) {
    acc += pops[role] / total;
    if (u < acc) return role;
  }
  return 'farmers';
}

/**
 * How long a fight stays visible on the map after its log entry lands —
 * real sim time, not a fixed wall-clock window, so it reads right whether
 * the clock is crawling or running at 100x.
 */
const FIGHT_AFTERGLOW_YEARS = 2;

/** Was there a real fight — trade.js's own 'encounter'/'mission' log entries,
 *  never invented here — recently enough that the army should still be
 *  shown clashing? Scans from the newest entry backward, so it's cheap even
 *  on a long campaign log. */
function recentlyFought(state) {
  const log = state.log;
  for (let i = log.length - 1; i >= 0; i--) {
    const l = log[i];
    if (state.year - l.year > FIGHT_AFTERGLOW_YEARS) return false;
    if ((l.kind === 'encounter' || l.kind === 'mission') && l.method === 'fight') return true;
  }
  return false;
}

function drawChibi(ctx, x, y, h, palette, role, listening, now, phase, dpr, level, fighting) {
  const headR = h * 0.30;
  const bodyW = h * 0.34, bodyH = h * 0.42;
  const walk = listening ? 0 : Math.sin(now * (fighting ? 8 : 4) + phase);
  const bob = listening ? Math.sin(now * 5 + phase) * h * 0.06 : 0;

  ctx.save();
  ctx.translate(x, y - bob);

  // legs
  ctx.strokeStyle = '#3e2540';
  ctx.lineWidth = Math.max(1, h * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.25, 0);
  ctx.lineTo(-bodyW * 0.25 + walk * h * 0.06, h * 0.14);
  ctx.moveTo(bodyW * 0.25, 0);
  ctx.lineTo(bodyW * 0.25 - walk * h * 0.06, h * 0.14);
  ctx.stroke();

  // body
  ctx.fillStyle = palette;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bodyW / 2, -bodyH, bodyW, bodyH, bodyW * 0.35);
  else ctx.rect(-bodyW / 2, -bodyH, bodyW, bodyH);
  ctx.fill();

  // head
  const hy = -bodyH - headR * 0.75;
  ctx.fillStyle = '#f7e7d3';
  ctx.strokeStyle = '#3e2540';
  ctx.lineWidth = Math.max(0.6, h * 0.05);
  ctx.beginPath();
  ctx.arc(0, hy, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // eyes
  ctx.fillStyle = '#3e2540';
  ctx.beginPath();
  ctx.arc(-headR * 0.35, hy, headR * 0.14, 0, Math.PI * 2);
  ctx.arc(headR * 0.35, hy, headR * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // role props, in the chibi idiom
  if (role === 'reciters' || role === 'teachers') {
    ctx.strokeStyle = '#f7f7f5';
    ctx.lineWidth = Math.max(1, h * 0.09);
    ctx.beginPath();
    ctx.arc(0, hy - headR * 0.15, headR * 0.95, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = '#c63c13';
    ctx.fillRect(bodyW * 0.55, -bodyH * 0.7, h * 0.14, h * 0.1);
  } else if (role === 'merchants') {
    ctx.fillStyle = '#7a5230';
    ctx.beginPath();
    ctx.arc(-bodyW * 0.8, -bodyH * 0.9, h * 0.11, 0, Math.PI * 2);
    ctx.fill();
  } else if (role === 'farmers' && !listening) {
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = Math.max(1, h * 0.06);
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.5, -bodyH * 0.6);
    ctx.lineTo(bodyW * 0.5 + h * 0.24, -bodyH * 0.6 - Math.abs(walk) * h * 0.22);
    ctx.stroke();
  } else if (role === 'soldiers') {
    // a raised spear, angled sharper while a real fight is on the log
    const raise = fighting ? 0.55 : 0.25;
    ctx.strokeStyle = '#3e2540';
    ctx.lineWidth = Math.max(1, h * 0.07);
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.4, -bodyH * 0.5);
    ctx.lineTo(bodyW * 0.4 + h * raise, -bodyH * 0.5 - h * 0.5);
    ctx.stroke();
    ctx.fillStyle = fighting ? '#c63c13' : '#7b6a7e';
    ctx.beginPath();
    ctx.arc(bodyW * 0.4 + h * raise, -bodyH * 0.5 - h * 0.5, h * 0.045, 0, Math.PI * 2);
    ctx.fill();
    if (fighting) {
      ctx.strokeStyle = '#c63c13';
      ctx.lineWidth = Math.max(0.6, h * 0.05);
      for (let s = 0; s < 3; s++) {
        const a = now * 10 + s * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * h * 0.5, hy + Math.sin(a) * h * 0.5);
        ctx.lineTo(Math.cos(a) * h * 0.65, hy + Math.sin(a) * h * 0.65);
        ctx.stroke();
      }
    }
    // the level: what the whole standing army currently is, not just this
    // figure — there is one army, not one per glyph, so every soldier chibi
    // reads the same number, honestly
    if (level != null) {
      ctx.fillStyle = '#f7f7f5';
      ctx.strokeStyle = '#3e2540';
      ctx.lineWidth = Math.max(0.6, h * 0.04);
      const tag = String(level);
      ctx.font = `${Math.max(7, Math.round(h * 0.42))}px monospace`;
      const tw = ctx.measureText(tag).width;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-tw / 2 - h * 0.08, hy - headR - h * 0.55, tw + h * 0.16, h * 0.4, h * 0.08);
      else ctx.rect(-tw / 2 - h * 0.08, hy - headR - h * 0.55, tw + h * 0.16, h * 0.4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3e2540';
      ctx.textAlign = 'center';
      ctx.fillText(tag, 0, hy - headR - h * 0.24);
    }
  }

  if (listening) {
    ctx.fillStyle = '#f4491c';
    ctx.font = Math.round(h * 0.55) + 'px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', headR * 1.2, hy - headR * 1.1); // ॐ
  }
  ctx.restore();
}

export function drawPeopleMode(ctx, proj, state, boundaries, level, dpr) {
  if (!state || !boundaries) return;
  const now = performance.now() / 1000;
  const decade = Math.floor(state.year / 10);
  const pops = state.pops;
  const totalPop = pops.farmers + pops.reciters + pops.scribes + pops.merchants + pops.teachers + pops.soldiers;
  const baseH = Math.max(7, Math.min(15, 6 + level * 1.4)) * dpr;
  // one standing army, not one per glyph: every soldier chibi reads the
  // same real level, and the same real fight-or-not
  const armyLvl = pops.soldiers > 0 ? armyLevel(state) : null;
  const fighting = armyLvl != null && recentlyFought(state);

  if (!districtWeight && state.districts && state.districts.size) {
    districtWeight = buildDistrictWeights(boundaries, state.districts);
  }

  // districts whose centroid the camera can see get the crowd: density is
  // per visible district, so the model reads populated at every zoom
  const w = ctx.canvas.width, ch = ctx.canvas.height;
  const visible = [];
  let totalW = 0;
  for (const s of boundaries.states) {
    for (const d of s.districts) {
      const x = proj.toX(d.c[0]), y = proj.toY(d.c[1]);
      if (x > -60 && y > -60 && x < w + 60 && y < ch + 60) {
        visible.push(d);
        totalW += districtWeight?.get(d.id) ?? 1;
      }
    }
  }
  if (!visible.length) return;

  ctx.save();
  let n = 0;
  for (const d of visible) {
    const share = totalW ? (districtWeight?.get(d.id) ?? 1) / totalW : 1 / visible.length;
    const count = Math.min(6, Math.round(TARGET_CHIBIS * share));
    if (count <= 0) continue;
    const peopleHere = totalPop * share;
    const scale = scaleFor(peopleHere / count);
    const h = baseH * scale;
    for (let i = 0; i < count; i++, n++) {
      const spread = 0.5; // degrees of scatter around the district centroid
      const lon = d.c[0] + (drawFrom('chibi-u', d.id, decade, i) - 0.5) * spread
        + Math.sin(now * 0.35 + n * 1.7) * 0.04;
      const lat = d.c[1] + (drawFrom('chibi-v', d.id, decade, i) - 0.5) * spread * 0.8
        + Math.cos(now * 0.3 + n * 2.3) * 0.03;
      const x = proj.toX(lon), y = proj.toY(lat);
      if (x < -30 || y < -30 || x > w + 30 || y > ch + 30) continue;

      const listening = !!listen
        && (lon - listen.lon) ** 2 + (lat - listen.lat) ** 2 < listen.rDeg ** 2;
      const role = roleFor(pops, drawFrom('chibi-role', d.id, decade, i));
      const palette = PALETTE[Math.floor(drawFrom('chibi-cloth', d.id, decade, i) * PALETTE.length)];
      drawChibi(ctx, x, y, h, palette, role, listening, now, n * 1.31, dpr,
        role === 'soldiers' ? armyLvl : null, role === 'soldiers' && fighting);
    }
  }
  ctx.restore();
}
