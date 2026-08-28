/**
 * Chibi art — the drawing half of the old people layer, kept.
 *
 * The recite game deleted the grand-strategy UI, but these little figures
 * were always the point ("your population is just like your children"), so
 * the pure drawing functions survive here, unchanged in idiom: canvas
 * primitives, no sprites, every proportion derived from one height `h`.
 * Behavior (who walks where, who fights whom) lives in pop.js — this file
 * only knows how a body looks.
 */

/** One villager. `pose`: 'idle' | 'walk' | 'listen' | 'fight' | 'hunt' | 'farm'. */
export function drawChibi(ctx, x, y, h, palette, pose, now, phase, dpr) {
  const headR = h * 0.30;
  const bodyW = h * 0.34, bodyH = h * 0.42;
  const listening = pose === 'listen';
  const fighting = pose === 'fight';
  const moving = pose === 'walk' || pose === 'hunt';
  const walk = listening ? 0 : Math.sin(now * (fighting ? 9 : moving ? 5 : 2.5) + phase);
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

  if (fighting) {
    // a raised fist and anger sparks — bare hands: this population has no
    // weapons to carry, which is exactly the problem you are here to solve
    ctx.strokeStyle = '#3e2540';
    ctx.lineWidth = Math.max(1, h * 0.07);
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.4, -bodyH * 0.55);
    ctx.lineTo(bodyW * 0.4 + h * 0.22, -bodyH * 0.55 - h * 0.3 - walk * h * 0.08);
    ctx.stroke();
    ctx.strokeStyle = '#c63c13';
    ctx.lineWidth = Math.max(0.6, h * 0.05);
    for (let s = 0; s < 3; s++) {
      const a = now * 10 + s * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * h * 0.5, hy + Math.sin(a) * h * 0.5);
      ctx.lineTo(Math.cos(a) * h * 0.65, hy + Math.sin(a) * h * 0.65);
      ctx.stroke();
    }
  } else if (pose === 'hunt') {
    // a thrown stone mid-arc
    ctx.fillStyle = '#7b6a7e';
    ctx.beginPath();
    ctx.arc(bodyW * 0.7 + Math.abs(walk) * h * 0.2, -bodyH * 0.9, h * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'farm') {
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

/** A cow — one glyph stands for several head. */
export function drawCow(ctx, x, y, h, dpr, phase, now) {
  const bodyW = h * 0.9, bodyH = h * 0.42;
  const bob = Math.sin(now * 2 + phase) * h * 0.03;
  ctx.save();
  ctx.translate(x, y - bob);

  ctx.strokeStyle = '#3e2540';
  ctx.lineWidth = Math.max(1, h * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const lx of [-bodyW * 0.32, bodyW * 0.32]) {
    ctx.moveTo(lx, bodyH * 0.05); ctx.lineTo(lx, bodyH * 0.4);
  }
  ctx.stroke();

  ctx.fillStyle = '#f2e6cf';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bodyW / 2, -bodyH, bodyW, bodyH, bodyH * 0.4);
  else ctx.rect(-bodyW / 2, -bodyH, bodyW, bodyH);
  ctx.fill();
  ctx.strokeStyle = '#3e2540';
  ctx.lineWidth = Math.max(0.6, h * 0.04);
  ctx.stroke();

  ctx.fillStyle = '#8a6a4a';
  ctx.beginPath();
  ctx.arc(-bodyW * 0.15, -bodyH * 0.6, h * 0.1, 0, Math.PI * 2);
  ctx.arc(bodyW * 0.15, -bodyH * 0.25, h * 0.08, 0, Math.PI * 2);
  ctx.fill();

  const hx = bodyW * 0.55, hy = -bodyH * 0.7;
  ctx.fillStyle = '#f2e6cf';
  ctx.beginPath();
  ctx.arc(hx, hy, h * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#c9b28a';
  ctx.lineWidth = Math.max(0.6, h * 0.045);
  ctx.beginPath();
  ctx.moveTo(hx - h * 0.12, hy - h * 0.18); ctx.lineTo(hx - h * 0.2, hy - h * 0.3);
  ctx.moveTo(hx + h * 0.12, hy - h * 0.18); ctx.lineTo(hx + h * 0.2, hy - h * 0.3);
  ctx.stroke();

  ctx.restore();
}

/** A deer — the wild's walking food supply. Skittish; drawn lighter than the cow. */
export function drawDeer(ctx, x, y, h, dpr, phase, now, fleeing) {
  const bodyW = h * 0.78, bodyH = h * 0.36;
  const gait = Math.sin(now * (fleeing ? 10 : 3) + phase);
  ctx.save();
  ctx.translate(x, y - Math.abs(gait) * (fleeing ? h * 0.12 : 0));

  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = Math.max(1, h * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const [lx, dir] of [[-bodyW * 0.3, 1], [bodyW * 0.3, -1]]) {
    ctx.moveTo(lx, bodyH * 0.05);
    ctx.lineTo(lx + dir * gait * h * 0.08, bodyH * 0.42);
  }
  ctx.stroke();

  ctx.fillStyle = '#b0885a';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bodyW / 2, -bodyH, bodyW, bodyH, bodyH * 0.5);
  else ctx.rect(-bodyW / 2, -bodyH, bodyW, bodyH);
  ctx.fill();
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = Math.max(0.5, h * 0.035);
  ctx.stroke();

  // spots
  ctx.fillStyle = '#e8d9bd';
  ctx.beginPath();
  ctx.arc(-bodyW * 0.15, -bodyH * 0.5, h * 0.05, 0, Math.PI * 2);
  ctx.arc(bodyW * 0.1, -bodyH * 0.35, h * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // head + antlers
  const hx = bodyW * 0.5, hy = -bodyH * 0.85;
  ctx.fillStyle = '#b0885a';
  ctx.beginPath();
  ctx.arc(hx, hy, h * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#7a5f3d';
  ctx.lineWidth = Math.max(0.6, h * 0.04);
  ctx.beginPath();
  ctx.moveTo(hx - h * 0.06, hy - h * 0.14); ctx.lineTo(hx - h * 0.16, hy - h * 0.34);
  ctx.moveTo(hx - h * 0.11, hy - h * 0.24); ctx.lineTo(hx - h * 0.2, hy - h * 0.3);
  ctx.moveTo(hx + h * 0.06, hy - h * 0.14); ctx.lineTo(hx + h * 0.13, hy - h * 0.34);
  ctx.stroke();

  ctx.restore();
}

/**
 * One farm plot, at whatever stage the player's own hands have got it to.
 * `w`/`h` are the plot's screen size; the drawing is deliberately literal —
 * you should be able to tell wild ground from ploughed rows from a green
 * crop from a ready harvest at a glance, because those are the four things
 * the tap does.
 */
export function drawPlot(ctx, x, y, w, h, stage, dpr, hover) {
  ctx.save();
  ctx.translate(x, y);

  const GROUND = { wild: '#6f7f4a', tilled: '#8a6a45', sown: '#8a6a45',
                   growing: '#6f8a3f', ready: '#c9a227' };
  ctx.fillStyle = GROUND[stage] ?? GROUND.wild;
  ctx.globalAlpha = stage === 'wild' ? 0.5 : 0.85;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = hover ? '#C9A227' : 'rgba(62,37,64,.55)';
  ctx.lineWidth = (hover ? 2.2 : 1) * dpr;
  ctx.strokeRect(0, 0, w, h);

  const rows = 4;
  const rowY = (r) => h * (r + 1) / (rows + 1);

  if (stage === 'wild') {
    // tussocks of uncleared grass
    ctx.strokeStyle = 'rgba(52,72,34,.7)';
    ctx.lineWidth = Math.max(1, 1.1 * dpr);
    for (let i = 0; i < 9; i++) {
      const gx = w * ((i * 0.37) % 1) + w * 0.05, gy = h * ((i * 0.61) % 1) * 0.85 + h * 0.1;
      ctx.beginPath();
      ctx.moveTo(gx, gy); ctx.lineTo(gx - w * 0.02, gy - h * 0.13);
      ctx.moveTo(gx, gy); ctx.lineTo(gx + w * 0.025, gy - h * 0.11);
      ctx.stroke();
    }
  } else {
    // ploughed rows, always visible once broken
    ctx.strokeStyle = 'rgba(90,60,34,.75)';
    ctx.lineWidth = Math.max(1, 1.3 * dpr);
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.06, rowY(r)); ctx.lineTo(w * 0.94, rowY(r));
      ctx.stroke();
    }
  }

  if (stage === 'sown') {
    ctx.fillStyle = '#e8dcc2';
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.14 + i * 0.18), rowY(r), Math.max(1, 1.5 * dpr), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (stage === 'growing') {
    ctx.strokeStyle = '#3f6b28';
    ctx.lineWidth = Math.max(1, 1.4 * dpr);
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < 5; i++) {
        const sx = w * (0.14 + i * 0.18), sy = rowY(r);
        ctx.beginPath();
        ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - h * 0.1);
        ctx.moveTo(sx, sy - h * 0.06); ctx.lineTo(sx - w * 0.025, sy - h * 0.12);
        ctx.moveTo(sx, sy - h * 0.06); ctx.lineTo(sx + w * 0.025, sy - h * 0.12);
        ctx.stroke();
      }
    }
  } else if (stage === 'ready') {
    // heavy heads, leaning
    ctx.strokeStyle = '#8a6a1e';
    ctx.lineWidth = Math.max(1, 1.5 * dpr);
    ctx.fillStyle = '#f0d878';
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < 5; i++) {
        const sx = w * (0.14 + i * 0.18), sy = rowY(r);
        ctx.beginPath();
        ctx.moveTo(sx, sy); ctx.lineTo(sx + w * 0.012, sy - h * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(sx + w * 0.015, sy - h * 0.17, w * 0.016, h * 0.05, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/**
 * The well: a hole that deepens as you dig it, then a stone ring holding
 * water. `digs` 0..needed shows the digging; once dug, `water` buckets show
 * what is drawable today.
 */
export function drawWell(ctx, x, y, r, digs, needed, water, maxWater, dpr, hover) {
  ctx.save();
  ctx.translate(x, y);
  const dug = digs >= needed;

  if (!dug) {
    // a widening, deepening pit — progress you can see in the ground
    const k = digs / needed;
    ctx.fillStyle = `rgba(74,52,30,${(0.3 + k * 0.55).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * (0.4 + k * 0.6), r * (0.3 + k * 0.45), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hover ? '#C9A227' : 'rgba(62,37,64,.6)';
    ctx.lineWidth = (hover ? 2.2 : 1.2) * dpr;
    ctx.stroke();
    // spoil heaps beside it
    ctx.fillStyle = 'rgba(122,82,48,.7)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(r * (1.1 - i * 0.15), r * (0.5 - i * 0.35), r * 0.22, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // stone ring
    ctx.fillStyle = '#8d8377';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hover ? '#C9A227' : '#3e2540';
    ctx.lineWidth = (hover ? 2.4 : 1.3) * dpr;
    ctx.stroke();
    // the water in it, as much as there is
    const k = maxWater ? water / maxWater : 0;
    ctx.fillStyle = k > 0 ? '#3e7d92' : '#5a4632';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.66, r * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    if (k > 0) {
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.18, -r * 0.12, r * 0.2 * k, r * 0.1 * k, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // buckets drawn today, as pips above the rim
    for (let i = 0; i < maxWater; i++) {
      ctx.fillStyle = i < water ? '#3e7d92' : 'rgba(62,37,64,.25)';
      ctx.beginPath();
      ctx.arc((i - (maxWater - 1) / 2) * r * 0.34, -r * 0.95, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * A funded building — the shapes money and attention buy. Pictorial-map
 * grammar: symbolic, at fixed screen size, deliberately out of scale.
 */
export function drawBuilding(ctx, x, y, h, type, dpr) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#3e2540';
  ctx.lineWidth = Math.max(0.8, h * 0.05);
  if (type === 'hall') {
    // meditation hall: a dome on a plinth, a finial above
    ctx.fillStyle = '#e0d3b4';
    ctx.fillRect(-h * 0.45, -h * 0.28, h * 0.9, h * 0.28);
    ctx.strokeRect(-h * 0.45, -h * 0.28, h * 0.9, h * 0.28);
    ctx.beginPath();
    ctx.arc(0, -h * 0.28, h * 0.34, Math.PI, 0);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.62); ctx.lineTo(0, -h * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#C9A227';
    ctx.beginPath(); ctx.arc(0, -h * 0.8, h * 0.06, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'school') {
    // vedic school: a pitched roof over an open porch, a scroll leaning at the door
    ctx.fillStyle = '#e0d3b4';
    ctx.fillRect(-h * 0.42, -h * 0.32, h * 0.84, h * 0.32);
    ctx.strokeRect(-h * 0.42, -h * 0.32, h * 0.84, h * 0.32);
    ctx.fillStyle = '#a8642b';
    ctx.beginPath();
    ctx.moveTo(-h * 0.52, -h * 0.32); ctx.lineTo(0, -h * 0.62); ctx.lineTo(h * 0.52, -h * 0.32);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f7f7f5';
    ctx.fillRect(h * 0.12, -h * 0.22, h * 0.14, h * 0.18);
    ctx.strokeRect(h * 0.12, -h * 0.22, h * 0.14, h * 0.18);
  } else {
    // granary: a round bin with a straw cap
    ctx.fillStyle = '#d9c49a';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.2, h * 0.34, h * 0.26, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b8934e';
    ctx.beginPath();
    ctx.moveTo(-h * 0.4, -h * 0.36); ctx.lineTo(0, -h * 0.6); ctx.lineTo(h * 0.4, -h * 0.36);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** A campfire — the first thing science gives this population. */
export function drawFire(ctx, x, y, h, now, phase) {
  ctx.save();
  ctx.translate(x, y);
  // logs
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = Math.max(1.2, h * 0.12);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-h * 0.3, 0); ctx.lineTo(h * 0.3, -h * 0.08);
  ctx.moveTo(-h * 0.28, -h * 0.08); ctx.lineTo(h * 0.3, 0);
  ctx.stroke();
  // flame, licking
  const f = 0.75 + Math.sin(now * 7 + phase) * 0.2;
  const g = ctx.createRadialGradient(0, -h * 0.3, h * 0.05, 0, -h * 0.3, h * 0.5 * f);
  g.addColorStop(0, 'rgba(255,214,90,0.95)');
  g.addColorStop(0.55, 'rgba(230,120,30,0.8)');
  g.addColorStop(1, 'rgba(198,60,19,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-h * 0.22, -h * 0.05);
  ctx.quadraticCurveTo(-h * 0.25, -h * 0.5 * f, 0, -h * 0.75 * f);
  ctx.quadraticCurveTo(h * 0.25, -h * 0.5 * f, h * 0.22, -h * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
