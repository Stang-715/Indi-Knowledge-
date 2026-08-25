/**
 * The exportable card (phase 42): the fixed 1200x1600 plate from
 * 07-timeline §9.1, rendered to canvas so a player can keep the moment.
 *
 * Plates are procedural until the real art pipeline unblocks: an era-washed
 * ground under the event's sprite, composed with the locked rig's warmth.
 * The Magnific plate is an asset swap later, not a redesign. Downloads are
 * script-inert inside the artifact sandbox, so the caller shows the PNG in a
 * modal and the player saves it natively — right-click, or long-press.
 */

const W = 1200, H = 1600;
const INK = '#2A2118', PAPER = '#E8DCC2', SHEET = '#D9C6A2',
      GOLD = '#C9A227', RULE = 'rgba(42,33,24,0.22)', SOFT = 'rgba(42,33,24,0.62)';

function wrap(ctx, text, x, y, maxW, lh, font, color, maxLines = 99) {
  ctx.font = font; ctx.fillStyle = color;
  const words = String(text ?? '').split(/\s+/);
  let line = '', lines = 0;
  for (const w of words) {
    const probe = line ? line + ' ' + w : w;
    if (ctx.measureText(probe).width > maxW && line) {
      ctx.fillText(line, x, y); y += lh; line = w;
      if (++lines >= maxLines - 1) { line += '…'; break; }
    } else line = probe;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

const fmt = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

export function renderCardPlate(m, { spriteImg = null } = {}) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // The sheet, with the laid-paper warmth of the table.
  ctx.fillStyle = SHEET; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.3, H * 0.1, 80, W * 0.5, H * 0.5, H);
  g.addColorStop(0, 'rgba(255,246,222,0.5)'); g.addColorStop(1, 'rgba(142,114,72,0.25)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = RULE; ctx.lineWidth = 3; ctx.strokeRect(28, 28, W - 56, H - 56);

  // Ribbon.
  ctx.fillStyle = INK; ctx.font = '600 34px Georgia, serif';
  const yearText = `${m.approx ? '~' : ''}${fmt(m.year)}`;
  ctx.fillText(yearText, 60, 96);
  ctx.font = 'italic 28px Georgia, serif'; ctx.fillStyle = SOFT;
  const eraText = `${m.chapter ? m.chapter + ' · ' : ''}${m.era}`;
  ctx.fillText(eraText, 60, 134);

  // The plate: era wash and the sprite, oversized on purpose — pictorial-map
  // grammar, the same convention as the map's landmarks.
  const px = 60, py = 170, pw = W - 120, ph = 560;
  ctx.fillStyle = PAPER; ctx.fillRect(px, py, pw, ph);
  const wash = ctx.createLinearGradient(0, py, 0, py + ph);
  wash.addColorStop(0, 'rgba(124,180,192,0.30)');
  wash.addColorStop(0.62, 'rgba(122,143,82,0.22)');
  wash.addColorStop(1, 'rgba(195,165,120,0.45)');
  ctx.fillStyle = wash; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = RULE; ctx.lineWidth = 2; ctx.strokeRect(px, py, pw, ph);
  if (spriteImg) {
    const s = Math.min(pw, ph) * 0.62;
    ctx.save();
    ctx.shadowColor = 'rgba(70,52,28,0.4)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.drawImage(spriteImg, px + (pw - s) / 2, py + (ph - s) / 2 - 12, s, s);
    ctx.restore();
  }

  // Title, then the slots in card order.
  let y = wrap(ctx, m.title, 60, py + ph + 74, W - 120, 56,
    '700 46px Georgia, serif', INK, 3);
  y = wrap(ctx, m.what, 60, y + 26, W - 120, 40, '28px Georgia, serif', INK, 8);
  y = wrap(ctx, m.why, 60, y + 20, W - 120, 38, 'italic 27px Georgia, serif', SOFT, 3);

  if (m.effects?.length) {
    y += 22; let ex = 60;
    ctx.font = '600 22px Georgia, serif';
    for (const e of m.effects) {
      const label = `${e.pillar.toLowerCase()} ${e.delta > 0 ? '+' : ''}${e.delta}`;
      const wpx = ctx.measureText(label).width + 28;
      ctx.fillStyle = e.delta < 0 ? 'rgba(168,100,43,0.16)' : 'rgba(201,162,39,0.18)';
      ctx.fillRect(ex, y - 22, wpx, 34);
      ctx.fillStyle = e.delta < 0 ? '#A8642B' : '#8a6d13';
      ctx.fillText(label, ex + 14, y + 2);
      ex += wpx + 12;
      if (ex > W - 200) break;
    }
    y += 26;
  }

  ctx.fillStyle = GOLD; ctx.fillRect(60, y + 6, 46, 4);
  y = wrap(ctx, 'HOW WE KNOW', 60, y + 40, W - 120, 30, '600 22px Georgia, serif', SOFT, 1);
  y = wrap(ctx, m.evidence, 60, y + 4, W - 120, 34, '25px Georgia, serif', INK, 4);
  if (m.dispute) {
    y = wrap(ctx, 'DISPUTED', 60, y + 26, W - 120, 30, '600 22px Georgia, serif', '#A8642B', 1);
    y = wrap(ctx, m.dispute, 60, y + 4, W - 120, 32, 'italic 24px Georgia, serif', SOFT, 4);
  }

  // Footer: the game's name, and the certainty mark — the card admits what
  // kind of claim it is even on a fridge door.
  ctx.strokeStyle = RULE; ctx.beginPath();
  ctx.moveTo(60, H - 96); ctx.lineTo(W - 60, H - 96); ctx.stroke();
  ctx.font = '600 26px Georgia, serif'; ctx.fillStyle = INK;
  ctx.fillText('PARAMOUNTCY', 60, H - 54);
  ctx.font = 'italic 22px Georgia, serif'; ctx.fillStyle = SOFT;
  const cert = `certainty: ${m.certainty}`;
  ctx.fillText(cert, W - 60 - ctx.measureText(cert).width, H - 54);

  return cv;
}
