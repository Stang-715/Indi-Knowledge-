#!/usr/bin/env node
/**
 * Recompute the survey grid's land mask from the coastline.
 *
 * The result is pasted into packages/sim/src/survey.js as a constant, because
 * the simulation may not call worldgen — that boundary is one of the four that
 * must not blur — and it should not have to load a data file to know that the
 * Bay of Bengal is not a district.
 */
import { readFileSync } from 'node:fs';
import { loadSkeleton } from '../packages/worldgen/src/skeleton.js';
import { fillRings } from '../packages/worldgen/src/raster.js';

const ROOT = new URL('..', import.meta.url);
const SK = loadSkeleton(JSON.parse(readFileSync(new URL('data/skeleton/bundle.json', ROOT), 'utf8')));
const G = { w: 66.0, s: 6.0, e: 94.0, n: 35.0, cols: 9, rows: 9 };
const W = 560, H = 580;
const toX = (l) => (l - G.w) / (G.e - G.w) * W;
const toY = (l) => (l - G.s) / (G.n - G.s) * H;
const mask = fillRings(SK.land.map(r => ({ x: Array.from(r.lon, toX), y: Array.from(r.lat, toY) })), W, H);
const dw = (G.e - G.w) / G.cols, dh = (G.n - G.s) / G.rows;

const rows = [];
for (let j = 0; j < G.rows; j++) {
  const row = [];
  for (let i = 0; i < G.cols; i++) {
    let land = 0, n = 0;
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
      const lon = G.w + (i + (a + 0.5) / 12) * dw, lat = G.s + (j + (b + 0.5) / 12) * dh;
      const px = Math.floor(toX(lon)), py = Math.floor(toY(lat));
      if (px >= 0 && py >= 0 && px < W && py < H) { n++; if (mask[py * W + px]) land++; }
    }
    row.push(Math.round(land / Math.max(1, n) * 100) / 100);
  }
  rows.push(row);
}
console.log('  Paste into packages/sim/src/survey.js as LAND:\n');
console.log('[' + rows.map(r => '\n  [' + r.join(', ') + ']').join(',') + '\n]');
