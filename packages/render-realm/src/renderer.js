/**
 * The realm renderer — L0 to L9.
 *
 * Draws the world as a made object on a survey sheet: terrain shaded by a single
 * fixed lighting rig, sea by depth, rivers and lakes as vector overlay, and a
 * tilt-shift that falls away as you dive.
 *
 * Nature first, and nature only. No borders, no polities, no units, no labels —
 * the land exists before anyone owns it. Political layers are overlays that lay
 * *over* this, never replace it (docs/08-visual-design.md §7.3).
 */
import { compileOrography, landSurface, KX } from '../../worldgen/src/terrain.js';
import { moistureAt, fertilityAt } from '../../worldgen/src/climate.js';
import { tint, seaTint, SEA } from '../../worldgen/src/palette.js';
import { fillRings } from '../../worldgen/src/raster.js';
import { tiltShift } from './camera.js';

/**
 * The locked lighting rig (docs/08-visual-design.md §6.6).
 * Key warm from the upper-left at 35° elevation, 45° azimuth. Every asset in the
 * game shares it — that is the difference between a made object and a pile of
 * unrelated pictures.
 */
export const RIG = {
  azimuth: 45 * Math.PI / 180,
  elevation: 35 * Math.PI / 180,
  fill: 0.15,
};

const LX = -Math.cos(RIG.azimuth) * Math.cos(RIG.elevation);
const LY = -Math.sin(RIG.azimuth) * Math.cos(RIG.elevation);
const LZ = Math.sin(RIG.elevation);

export class RealmRenderer {
  constructor({ skeleton, climate }) {
    this.sk = skeleton;
    this.O = compileOrography(skeleton.oro);
    this.climate = climate;
  }

  /**
   * Render terrain into an ImageData-shaped buffer.
   *
   * The buffer is capped by a cell budget rather than following the canvas.
   * Terrain sampling costs about 1.3 microseconds a cell, so a 2236x1800 canvas
   * at full resolution is four million samples and five seconds — which is what
   * made the first playable build take thirty seconds to paint. Terrain is
   * low-frequency; upscaling a bounded buffer with smoothing is very close to
   * free and visually near-identical, especially under the tilt-shift.
   *
   * @param {object} proj  from Camera.projection
   * @param {number} w @param {number} h  target pixels
   * @param {number} step  1 = best available, 3 = coarse preview
   */
  renderTerrain(proj, w, h, step = 1, budget = 210_000) {
    let gw = Math.ceil(w / step), gh = Math.ceil(h / step);
    if (gw * gh > budget) {
      const k = Math.sqrt(budget / (gw * gh));
      gw = Math.max(2, Math.round(gw * k));
      gh = Math.max(2, Math.round(gh * k));
    }
    // The projection is in canvas pixels; the buffer may be smaller.
    const sx = w / gw, sy = h / gh;

    // Land mask at grid resolution, from the coastline.
    const rings = [];
    const b = proj.bounds;
    for (const r of this.sk.land) {
      // Cheap reject: skip rings entirely outside the view.
      let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
      for (let i = 0; i < r.lon.length; i++) {
        if (r.lon[i] < mnx) mnx = r.lon[i]; if (r.lon[i] > mxx) mxx = r.lon[i];
        if (r.lat[i] < mny) mny = r.lat[i]; if (r.lat[i] > mxy) mxy = r.lat[i];
      }
      if (mxx < b.w || mnx > b.e || mxy < b.s || mny > b.n) continue;
      const x = new Float64Array(r.lon.length), y = new Float64Array(r.lon.length);
      for (let i = 0; i < r.lon.length; i++) {
        x[i] = proj.toX(r.lon[i]) / sx;
        y[i] = proj.toY(r.lat[i]) / sy;
      }
      rings.push({ x, y });
    }
    const land = fillRings(rings, gw, gh);

    // Two distance fields: one from the coast out to sea (for depth shading) and
    // the sea mask itself. Initialising the sea field to zero everywhere made
    // every ocean pixel read as shoreline — the whole ocean came out pale.
    const seaDist = distanceOutward(land, gw, gh, 0);

    const heights = new Float32Array(gw * gh);
    const texes = new Float32Array(gw * gh);
    const out = new Uint8ClampedArray(gw * gh * 4);

    // Pass 1: sample the field.
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const idx = j * gw + i;
        if (!land[idx]) continue;
        const lon = proj.toLon((i + 0.5) * sx);
        const lat = proj.toLat((j + 0.5) * sy);
        const s = landSurface(this.O, lon, lat);
        heights[idx] = s.h;
        texes[idx] = s.tex;
      }
    }

    // Pass 2: shade and tint.
    const metresPerCell = (proj.bounds.e - proj.bounds.w) / gw * 111_320 * KX;
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const idx = j * gw + i, o = idx * 4;
        if (!land[idx]) {
          const d = Math.min(1, seaDist[idx] / Math.max(8, gw * 0.22));
          const c = seaTint(d);
          out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
          continue;
        }
        const lon = proj.toLon((i + 0.5) * sx);
        const lat = proj.toLat((j + 0.5) * sy);
        const h = heights[idx];
        const mo = moistureAt(this.climate, lon, lat);
        let c = tint(h, mo);

        // Two-scale hillshade: a broad landform pass and a one-cell grain pass,
        // mixed. One scale alone reads either as a relief map with no surface,
        // or as noise with no landform.
        const hx = (sample(heights, land, gw, gh, i + 1, j) - sample(heights, land, gw, gh, i - 1, j));
        const hy = (sample(heights, land, gw, gh, i, j + 1) - sample(heights, land, gw, gh, i, j - 1));
        const broad = shade(hx, hy, metresPerCell * 2, 1);

        // The one-cell grain pass gives the surface its handmade texture, but on
        // very steep ground adjacent cells differ so much that it alternates
        // light and dark and reads as stipple. So it is damped where the broad
        // slope is already doing the work — mountains get their form from the
        // landform pass, and the grain stays where it belongs, on gentler ground.
        const steep = Math.min(1, Math.hypot(hx, hy) / (metresPerCell * 1.6));
        const grainScale = texes[idx] * (1 - steep * 0.75);
        const gx = sample(heights, land, gw, gh, i + 1, j) - h;
        const gy = sample(heights, land, gw, gh, i, j + 1) - h;
        const grain = shade(gx, gy, metresPerCell, 1.3);
        const lit = broad * 0.62 + (grain * grainScale + (1 - grainScale)) * 0.38;

        const k = 0.55 + 0.75 * lit;
        out[o]     = c[0] * k;
        out[o + 1] = c[1] * k;
        out[o + 2] = c[2] * k;
        out[o + 3] = 255;
      }
    }
    return { data: out, gw, gh, land, heights };
  }

  /**
   * Rivers and lakes, drawn as vectors on top of the shaded terrain.
   *
   * `scale` maps canvas coordinates into buffer coordinates. When the
   * tilt-shift is active the water is drawn into the small buffer and blurred
   * with it, which costs a fraction of blurring the full canvas; when the blur
   * has fallen away the water is drawn at full resolution and stays crisp.
   */
  drawWater(ctx, proj, w, h, level, scale = 1) {
    const b = proj.bounds;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    for (const r of this.sk.rivers) {
      // Detail arrives with the dive: at L0 only the great rivers, by L6 all of them.
      if (r.rank > 3 + level * 1.2) continue;
      const width = Math.max(0.6, (9 - r.rank) * 0.34 * (0.6 + level * 0.22)) * scale;
      ctx.strokeStyle = `rgba(${SEA.SHALLOW.join(',')},${Math.min(0.95, 0.45 + level * 0.09)})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false, visible = false;
      for (let i = 0; i < r.lon.length; i++) {
        const lon = r.lon[i], lat = r.lat[i];
        if (lon >= b.w && lon <= b.e && lat >= b.s && lat <= b.n) visible = true;
        const x = proj.toX(lon) * scale, y = proj.toY(lat) * scale;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      if (visible) ctx.stroke(); else ctx.beginPath();
    }

    ctx.fillStyle = `rgb(${SEA.MID.join(',')})`;
    for (const l of this.sk.lakes) {
      ctx.beginPath();
      for (let i = 0; i < l.lon.length; i++) {
        const x = proj.toX(l.lon[i]) * scale, y = proj.toY(l.lat[i]) * scale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    }
  }

  /**
   * The tilt-shift blur radius, in buffer pixels. Zero at L7 and beyond.
   *
   * Deliberately small. A real tilt-shift is a narrow gradient, not a wash: the
   * focal band stays sharp and only the near and far edges go soft. A uniform
   * blur at this strength does not read as a miniature, it reads as a mistake.
   */
  blurFor(level, h) {
    const t = tiltShift(level);
    return t <= 0 ? 0 : t * h * 0.018;
  }

  /**
   * The focal band, as {near, far} fractions of viewport height where the image
   * is sharp. Widens as you dive, so the world resolves from the middle out.
   */
  focalBand(level) {
    const t = tiltShift(level);
    const half = 0.16 + (1 - t) * 0.34;
    return { near: 0.5 - half, far: 0.5 + half };
  }
}

function sample(f, land, w, h, i, j) {
  i = i < 0 ? 0 : i >= w ? w - 1 : i;
  j = j < 0 ? 0 : j >= h ? h - 1 : j;
  return land[j * w + i] ? f[j * w + i] : 0;
}

function shade(dx, dy, run, exaggeration) {
  const nx = -dx * exaggeration, ny = -dy * exaggeration, nz = run;
  const len = Math.hypot(nx, ny, nz) || 1;
  const dot = (nx * LX + ny * LY + nz * LZ) / len;
  return Math.max(0, Math.min(1, dot * (1 - RIG.fill) + RIG.fill));
}

/** Chamfer 3-4 distance transform outward from a mask. */
function distanceOutward(mask, w, h, inside) {
  const INF = 1e7;
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = (mask[i] === inside ? INF : 0);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = j * w + i; if (!d[x]) continue; let v = d[x];
    if (i > 0) v = Math.min(v, d[x - 1] + 3);
    if (j > 0) v = Math.min(v, d[x - w] + 3);
    if (i > 0 && j > 0) v = Math.min(v, d[x - w - 1] + 4);
    if (i < w - 1 && j > 0) v = Math.min(v, d[x - w + 1] + 4);
    d[x] = v;
  }
  for (let j = h - 1; j >= 0; j--) for (let i = w - 1; i >= 0; i--) {
    const x = j * w + i; if (!d[x]) continue; let v = d[x];
    if (i < w - 1) v = Math.min(v, d[x + 1] + 3);
    if (j < h - 1) v = Math.min(v, d[x + w] + 3);
    if (i < w - 1 && j < h - 1) v = Math.min(v, d[x + w + 1] + 4);
    if (i > 0 && j < h - 1) v = Math.min(v, d[x + w - 1] + 4);
    d[x] = v;
  }
  for (let i = 0; i < d.length; i++) d[i] /= 3;
  return d;
}
