/**
 * The people map mode: the atlas game's chibi population, on Paramountcy's
 * table. Placement is presentation, never state — figures scatter around
 * district centroids by drawFrom(seed, ...keys), so the crowd is stable
 * while you watch, different a generation later, and identical on replay.
 * The gentle wander is wall-clock, which is allowed here: nothing reads it
 * back into the sim.
 */
import { drawFrom } from '../../../packages/sim/src/rng.js';

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

function drawChibi(ctx, x, y, h, palette, role, listening, now, phase, dpr) {
  const headR = h * 0.30;
  const bodyW = h * 0.34, bodyH = h * 0.42;
  const walk = listening ? 0 : Math.sin(now * 4 + phase);
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
      drawChibi(ctx, x, y, h, palette, role, listening, now, n * 1.31, dpr);
    }
  }
  ctx.restore();
}
