/**
 * The atlas boundaries, carried onto the table.
 *
 * data/atlas/boundaries.json holds the India Knowledge Map's state and
 * district rings in plain lon/lat degrees — the same geographic space the
 * Camera projects — so they stroke straight onto the canvas. Simplified
 * community geometry, for visualisation only.
 */

function strokeRing(ctx, proj, flat) {
  ctx.moveTo(proj.toX(flat[0]), proj.toY(flat[1]));
  for (let i = 2; i < flat.length; i += 2) {
    ctx.lineTo(proj.toX(flat[i]), proj.toY(flat[i + 1]));
  }
  ctx.closePath();
}

export function drawBoundaries(ctx, proj, level, data, dpr) {
  if (!data) return;
  ctx.save();

  // districts first, faint, once the model is close enough to want them
  if (level >= 3) {
    ctx.beginPath();
    for (const s of data.states) {
      for (const d of s.districts) {
        for (const ring of d.rings) strokeRing(ctx, proj, ring);
      }
    }
    ctx.strokeStyle = 'rgba(62, 37, 64, 0.18)';
    ctx.lineWidth = 0.7 * dpr;
    ctx.stroke();
  }

  // state outlines on top
  ctx.beginPath();
  for (const s of data.states) {
    for (const ring of s.outline) strokeRing(ctx, proj, ring);
  }
  ctx.strokeStyle = 'rgba(62, 37, 64, 0.45)';
  ctx.lineWidth = 1.1 * dpr;
  ctx.stroke();

  ctx.restore();
}
