/**
 * The camera, and the ladder.
 *
 * Seventeen spatial rungs from 13.44 km/px down to 0.21 m/px
 * (docs/00-plan.md §2). This package owns L0–L9; render-city owns L10–L16 and
 * shares nothing with this one but the camera contract.
 */
import { KX } from '../../worldgen/src/terrain.js';

export const L0_METRES_PER_PX = 13440;

/** Metres per pixel at a rung. Each rung is half the last. */
export const metresPerPx = (level) => L0_METRES_PER_PX / Math.pow(2, level);

/** Which rung a given span (in degrees across the viewport) sits at. */
export function levelFor(spanDeg, viewportPx) {
  const metresAcross = spanDeg * 111_320 * KX;
  const mpp = metresAcross / viewportPx;
  return Math.max(0, Math.min(16, Math.log2(L0_METRES_PER_PX / mpp)));
}

/**
 * Depth of field, as a fraction.
 *
 * The tilt-shift is a mechanic, not a filter (docs/08-visual-design.md §6.1).
 * Reference A's shallow focus is what makes the subcontinent read as a *model on
 * a table*. So blur is strongest fully zoomed out and falls to zero as you dive:
 * the world stops being an object and becomes a place. That transition is the
 * L9→L10 dive given an emotional register for free.
 */
export function tiltShift(level) {
  if (level >= 7) return 0;
  return Math.pow(1 - level / 7, 1.6);
}

/**
 * Fit a bounding box to a viewport, in degrees of longitude.
 *
 * Both dimensions have to fit. Sizing from longitude alone crops the south off
 * a wide viewport — Kanyakumari and Sri Lanka simply are not on the map.
 */
export function fitSpan(bbox, w, h) {
  const needX = bbox.e - bbox.w;
  const needY = (bbox.n - bbox.s) * (w / h) / KX;
  return Math.max(needX, needY) * 1.03;
}

export class Camera {
  constructor({ cx, cy, span }) {
    this.cx = cx; this.cy = cy; this.span = span;
    this.minSpan = 0.05; this.maxSpan = 80;
  }

  /** Projection for a viewport, in CSS pixels. */
  projection(w, h) {
    const spanY = this.span * (h / w) * KX;
    const x0 = this.cx - this.span / 2, y0 = this.cy - spanY / 2;
    return {
      toX: (lon) => (lon - x0) / this.span * w,
      toY: (lat) => h - (lat - y0) / spanY * h,
      toLon: (px) => x0 + (px / w) * this.span,
      toLat: (py) => y0 + ((h - py) / h) * spanY,
      spanY, x0, y0,
      bounds: { w: x0, s: y0, e: x0 + this.span, n: y0 + spanY },
    };
  }

  zoomAt(factor, lon, lat) {
    const next = Math.max(this.minSpan, Math.min(this.maxSpan, this.span * factor));
    const k = next / this.span;
    // Keep the point under the cursor fixed.
    this.cx = lon + (this.cx - lon) * k;
    this.cy = lat + (this.cy - lat) * k;
    this.span = next;
  }

  panBy(dLon, dLat) { this.cx += dLon; this.cy += dLat; }

  clampTo(bbox) {
    this.cx = Math.max(bbox.w, Math.min(bbox.e, this.cx));
    this.cy = Math.max(bbox.s, Math.min(bbox.n, this.cy));
  }

  level(w) { return levelFor(this.span, w); }
}
