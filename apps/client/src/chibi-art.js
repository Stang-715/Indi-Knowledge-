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
