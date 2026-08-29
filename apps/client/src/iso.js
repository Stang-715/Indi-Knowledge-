/**
 * The ISO preview: one state as a solid you can read at a glance.
 *
 * The map answers "where"; this answers "how much, and where is it thin".
 * Each district of the focused state is drawn as an extruded block whose
 * height is a number you care about right now, so a state where your people
 * are crowded into two districts and absent from twelve says so in one look —
 * which is the decision, before any panel has been read.
 *
 * Plain Canvas 2D, painter's algorithm: districts sorted back to front, each
 * one's walls drawn and then its top face over them. The atlas's own 3D view
 * is WebGL with a triangulated mesh; none of that is needed for a 336-pixel
 * inset, and none of it is carried here.
 */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

/** Rings can run to hundreds of points; an inset needs tens. */
function simplify(ring, target = 44) {
  const n = ring.length / 2;
  const step = Math.max(1, Math.floor(n / target));
  const out = [];
  for (let i = 0; i < n; i += step) out.push(ring[i * 2], ring[i * 2 + 1]);
  return out.length >= 6 ? out : ring;
}

function shade(rgb, k) {
  return `rgb(${Math.round(rgb[0] * k)},${Math.round(rgb[1] * k)},${Math.round(rgb[2] * k)})`;
}

/**
 * @param ctx     a 2D context sized in device pixels
 * @param state   an atlas state: { name, outline, districts: [{ name, c, rings }] }
 * @param value   (district) => 0..1, the block's height
 * @param rgb     the sheet's own hue, [r, g, b]
 * @param mark    (district) => boolean, gets a gold cap — gold means yours
 * @returns       [{ district, x, y }] screen anchors, for labels and hit-testing
 */
export function drawIso(ctx, state, { value, rgb = [122, 78, 142], mark = () => false } = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  const ds = state?.districts ?? [];
  if (!ds.length) return [];

  // Normalise the state into a unit square, north-up, then tip it.
  let w = 180, s = 90, e = -180, n = -90;
  for (const ring of state.outline)
    for (let i = 0; i < ring.length; i += 2) {
      if (ring[i] < w) w = ring[i];
      if (ring[i] > e) e = ring[i];
      if (ring[i + 1] < s) s = ring[i + 1];
      if (ring[i + 1] > n) n = ring[i + 1];
    }
  const span = Math.max(e - w, n - s) || 1;
  const nx = (lon) => (lon - (w + e) / 2) / span;
  const ny = (lat) => ((n + s) / 2 - lat) / span;

  // Scale so the tipped footprint fills the inset, leaving room to rise.
  const LIFT = Math.min(W, H) * 0.30;              // what a full-height block adds
  const S = Math.min(W / (2.06 * COS30), (H - LIFT) / (2.06 * SIN30)) * 0.98;
  const ox = W / 2, oy = (H + LIFT) / 2;
  const px = (x, y) => ox + (x - y) * COS30 * S;
  const py = (x, y, h) => oy + (x + y) * SIN30 * S - h * LIFT;

  // A flat state still needs a floor to stand on, or an empty one reads as
  // a rendering failure rather than as "nobody is here".
  ctx.fillStyle = 'rgba(42,33,24,0.06)';
  ctx.beginPath();
  ctx.moveTo(px(-0.5, -0.5), py(-0.5, -0.5, 0));
  ctx.lineTo(px(0.5, -0.5), py(0.5, -0.5, 0));
  ctx.lineTo(px(0.5, 0.5), py(0.5, 0.5, 0));
  ctx.lineTo(px(-0.5, 0.5), py(-0.5, 0.5, 0));
  ctx.closePath();
  ctx.fill();

  const blocks = ds.map((d) => {
    const ring = simplify(d.rings[0] ?? []);
    const pts = [];
    for (let i = 0; i < ring.length; i += 2) pts.push([nx(ring[i]), ny(ring[i + 1])]);
    const depth = nx(d.c[0]) + ny(d.c[1]);          // back-to-front order
    return { d, pts, depth, h: Math.max(0, Math.min(1, value?.(d) ?? 0)) };
  }).filter((b) => b.pts.length >= 3).sort((a, b) => a.depth - b.depth);

  const anchors = [];
  for (const b of blocks) {
    const top = b.pts.map(([x, y]) => [px(x, y), py(x, y, b.h)]);
    const base = b.pts.map(([x, y]) => [px(x, y), py(x, y, 0)]);

    // Walls first. Every edge is drawn; the top face then covers the ones
    // that face away, which is cheaper than deciding which those are.
    ctx.fillStyle = shade(rgb, 0.62);
    ctx.strokeStyle = shade(rgb, 0.5);
    ctx.lineWidth = 1;
    for (let i = 0; i < top.length; i++) {
      const j = (i + 1) % top.length;
      ctx.beginPath();
      ctx.moveTo(top[i][0], top[i][1]);
      ctx.lineTo(top[j][0], top[j][1]);
      ctx.lineTo(base[j][0], base[j][1]);
      ctx.lineTo(base[i][0], base[i][1]);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    for (let i = 1; i < top.length; i++) ctx.lineTo(top[i][0], top[i][1]);
    ctx.closePath();
    // Lightness carries the value, so a tall block also reads as a bright one
    // even where the tipped view hides its walls.
    ctx.fillStyle = mark(b.d) ? '#C9A227' : shade(rgb, 0.86 + b.h * 0.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(42,33,24,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const cx = px(nx(b.d.c[0]), ny(b.d.c[1]));
    anchors.push({ district: b.d, x: cx, y: py(nx(b.d.c[0]), ny(b.d.c[1]), b.h), h: b.h });
  }
  return anchors;
}
