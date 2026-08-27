/**
 * The worldgen worker (docs/12-buildplan-2.md Phase 19).
 *
 * Terrain sampling costs about a microsecond a cell, and the climate relaxation
 * is a second of solid arithmetic. Both were on the main thread, which meant the
 * page froze while the world was being built and every pan competed with the
 * renderer for the same core.
 *
 * The purity work in Phase 6 made this move trivial: `worldgen` has no DOM, no
 * state and no I/O, so it runs here unchanged. That is the payoff for a boundary
 * that looked pedantic at the time.
 *
 * Results come back as transferable buffers, so a terrain tile crosses the
 * thread boundary by handing over ownership rather than by being copied.
 */
import { loadSkeleton } from '../../../packages/worldgen/src/skeleton.js';
import { compileOrography, landSurface } from '../../../packages/worldgen/src/terrain.js';
import { buildClimate, moistureAt } from '../../../packages/worldgen/src/climate.js';

let SK = null, O = null, climate = null;

self.onmessage = (e) => {
  const { id, kind, payload } = e.data;
  try {
    if (kind === 'init') {
      SK = loadSkeleton(payload.bundle);
      O = compileOrography(SK.oro);
      climate = buildClimate(O, SK.bbox, SK.land, SK.rivers,
        { size: payload.size ?? 220, sweeps: payload.sweeps ?? 90 });
      // Hand the climate grids back so the main thread can sample them for
      // labels and tooltips without a round trip.
      self.postMessage({ id, ok: true, result: {
        W: climate.W, H: climate.H, bbox: climate.bbox,
        moisture: climate.moisture, isSea: climate.isSea,
      } }, [climate.moisture.buffer.slice(0), climate.isSea.buffer.slice(0)]);
      return;
    }

    if (kind === 'field') {
      // Sample height and moisture over a lon/lat grid. This is the expensive
      // half of a terrain render, and it is now entirely off the main thread.
      const { x0, y0, x1, y1, gw, gh } = payload;
      const heights = new Float32Array(gw * gh);
      const texes = new Float32Array(gw * gh);
      const moist = new Float32Array(gw * gh);
      for (let j = 0; j < gh; j++) {
        const lat = y0 + (y1 - y0) * ((j + 0.5) / gh);
        for (let i = 0; i < gw; i++) {
          const lon = x0 + (x1 - x0) * ((i + 0.5) / gw);
          const k = j * gw + i;
          const s = landSurface(O, lon, lat);
          heights[k] = s.h; texes[k] = s.tex;
          moist[k] = moistureAt(climate, lon, lat);
        }
      }
      self.postMessage({ id, ok: true, result: { heights, texes, moist, gw, gh } },
        [heights.buffer, texes.buffer, moist.buffer]);
      return;
    }

    throw new Error(`unknown message ${kind}`);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message ?? err) });
  }
};
