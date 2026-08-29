/**
 * The sheet: what a lens actually paints on the table.
 *
 * Two halves, on purpose:
 *
 *   · the GRID — the subdivision this sheet reads the country in. Camps and
 *     the ground each one walks, the states the atlas surveyed, or those
 *     states cut into districts, the unit of administration. A grid only
 *     changes when the camera or the sheet changes, so it is baked into the
 *     terrain cache alongside the rivers rather than redrawn every frame —
 *     and so is the wash a knowledge sheet lays under it.
 *
 *   · the MARKS — how each thing on that grid answers the sheet right now,
 *     in the six eligibility pigments. That changes with the game, so it is
 *     a per-frame pass, laid over the terrain and under the people.
 *
 * The marks keep the deleted engine's grammar exactly: a ring, not a fill, so
 * the terrain stays legible under the glass; "can act" gets a fat ring and a
 * whisper of colour inside it, "never" barely shows at all.
 */
import { ELIGIBILITY } from './lenses.js';

/* ── The grids ──────────────────────────────────────────────────────────── */

function strokeRing(ctx, proj, flat) {
  ctx.moveTo(proj.toX(flat[0]), proj.toY(flat[1]));
  for (let i = 2; i < flat.length; i += 2) ctx.lineTo(proj.toX(flat[i]), proj.toY(flat[i + 1]));
  ctx.closePath();
}

/**
 * The atlas boundaries, carried onto the table. data/atlas/boundaries.json
 * holds state and district rings in plain lon/lat degrees — the same space
 * the Camera projects — so they stroke straight onto the canvas. Simplified
 * community geometry, for visualisation only.
 */
function drawStateGrid(ctx, proj, dpr, level, atlas, withDistricts) {
  if (!atlas) return;
  // Districts are the unit of administration, so the Order draws them at any
  // zoom; every other sheet only wants them once you have leaned in.
  if (withDistricts || level >= 3) {
    ctx.beginPath();
    for (const s of atlas.states) for (const d of s.districts) for (const r of d.rings) strokeRing(ctx, proj, r);
    ctx.strokeStyle = 'rgba(62, 37, 64, 0.16)';
    ctx.lineWidth = 0.7 * dpr;
    ctx.stroke();
  }
  ctx.beginPath();
  for (const s of atlas.states) for (const r of s.outline) strokeRing(ctx, proj, r);
  ctx.strokeStyle = 'rgba(62, 37, 64, 0.42)';
  ctx.lineWidth = 1.1 * dpr;
  ctx.stroke();
}

/** Camps and the ground each one walks: a thin catchment circle per camp. */
function drawCampGrid(ctx, proj, dpr, camps, radius) {
  ctx.setLineDash([3 * dpr, 4 * dpr]);
  ctx.strokeStyle = 'rgba(62, 37, 64, 0.26)';
  ctx.lineWidth = 0.9 * dpr;
  for (const [lon, lat] of camps) {
    const x = proj.toX(lon), y = proj.toY(lat);
    const r = Math.abs(proj.toX(lon + radius) - x);
    if (r < 6 * dpr) continue;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/**
 * Draw the grid a sheet reads the country in. Called from the terrain cache
 * build, so it costs nothing per frame.
 */
export function drawGrid(ctx, proj, dpr, level, kind, { atlas, camps, campRadius } = {}) {
  if (!kind || kind === 'none') return;
  ctx.save();
  if (kind === 'states' || kind === 'districts')
    drawStateGrid(ctx, proj, dpr, level, atlas, kind === 'districts');
  else if (kind === 'camps' && camps) drawCampGrid(ctx, proj, dpr, camps, campRadius ?? 1.6);
  ctx.restore();
}

/* ── The wash: a magnitude, state by state ──────────────────────────────── */

/**
 * A knowledge sheet paints how MUCH, not what you can do — so it must not
 * borrow the eligibility pigments, which mean one thing each. It gets a wash
 * instead: one hue at five lightnesses over the state outlines, in its own
 * colour, well away from gold (gold means yours). Ground the record has
 * nothing to say about is left as unsurveyed paper — the distinction between
 * "there is nothing there" and "we have not looked".
 *
 * @param values  slug → 0..1, or undefined where there is no record
 * @param rgb     the sheet's hue, [r, g, b]
 */
export function drawWash(ctx, proj, dpr, atlas, values, rgb) {
  if (!atlas || !values) return;
  ctx.save();
  for (const st of atlas.states) {
    const v = values[st.slug];
    ctx.beginPath();
    for (const ring of st.outline) strokeRing(ctx, proj, ring);
    ctx.fillStyle = v == null
      ? 'rgba(216,203,170,0.40)'
      : `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(0.10 + Math.max(0, Math.min(1, v)) * 0.34).toFixed(3)})`;
    ctx.fill('evenodd');
  }
  ctx.restore();
}

/* ── The marks ──────────────────────────────────────────────────────────── */

/**
 * How each thing answers the sheet, in the six pigments. A mark is
 * `{ lon, lat, state }` plus a shape: `w`/`h` in degrees for something with
 * corners (a plot), `r` in degrees for something round (a well), or neither
 * for a point on the map (a camp), which gets a ring at a fixed size.
 */
export function drawMarks(ctx, proj, dpr, marks) {
  if (!marks?.length) return;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.save();
  for (const m of marks) {
    const e = ELIGIBILITY[m.state];
    if (!e) continue;
    const x = proj.toX(m.lon), y = proj.toY(m.lat);
    if (x < -60 || y < -60 || x > w + 60 || y > h + 60) continue;
    const can = m.state === 'can' || m.state === 'yours';
    ctx.globalAlpha = m.state === 'never' ? 0.28 : 0.92;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = (can ? 3 : 1.6) * dpr;
    ctx.beginPath();
    if (m.w != null) {
      // Something with corners answers in its own shape, drawn just inside
      // its edge so the ring reads as an annotation, not a second border.
      const px = Math.abs(proj.toX(m.lon + m.w / 2) - x) - 2 * dpr;
      const py = Math.abs(proj.toY(m.lat + m.h / 2) - y) - 2 * dpr;
      ctx.rect(x - px, y - py, px * 2, py * 2);
    } else {
      ctx.arc(x, y, m.r != null
        ? Math.max(6 * dpr, Math.abs(proj.toX(m.lon + m.r) - x))
        : (can ? 13 : 10) * dpr, 0, Math.PI * 2);
    }
    ctx.stroke();
    if (can) {
      ctx.globalAlpha = m.w != null ? 0.12 : 0.18;
      ctx.fillStyle = e.color;
      ctx.fill();
    }
  }
  ctx.restore();
}
