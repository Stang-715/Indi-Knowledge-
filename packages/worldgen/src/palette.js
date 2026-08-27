/**
 * The Cartographer's Table palette (docs/08-visual-design.md §6.4).
 *
 * Rainfall decides the lowlands; elevation takes over above the treeline. That
 * ordering matters — an elevation-first ramp paints the wet Western Ghats and the
 * dry Deccan the same colour because they are the same height.
 */
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const BIOME = {
  ARID:  [0xD2, 0xAF, 0x63], SCRUB: [0xC0, 0xAC, 0x64], GRASS: [0x9A, 0xA7, 0x59],
  FOREST:[0x67, 0x87, 0x44], WET:   [0x4E, 0x76, 0x3E],
  ROCK:  [0x9C, 0x86, 0x64], HIGH:  [0x90, 0x83, 0x72], SNOW:  [0xF0, 0xF2, 0xF0],
};

export const SEA = {
  DEEP: [0x1B, 0x52, 0x63], MID: [0x33, 0x79, 0x8C],
  SHALLOW: [0x74, 0xAD, 0xBA], SHELF: [0x8C, 0xBE, 0xC7],
};

export const TABLE = {
  table: '#C3A578', tableDeep: '#8E7248', gold: '#C9A227', ink: '#2A2118',
};

/** Land colour from height (m) and moisture (0..1). */
export function tint(h, mo) {
  let c;
  if (mo < 0.17)      c = BIOME.ARID;
  else if (mo < 0.33) c = mix(BIOME.ARID,  BIOME.SCRUB,  (mo - 0.17) / 0.16);
  else if (mo < 0.50) c = mix(BIOME.SCRUB, BIOME.GRASS,  (mo - 0.33) / 0.17);
  else if (mo < 0.70) c = mix(BIOME.GRASS, BIOME.FOREST, (mo - 0.50) / 0.20);
  else                c = mix(BIOME.FOREST, BIOME.WET, Math.min(1, (mo - 0.70) / 0.30));
  if (h > 700)  c = mix(c, BIOME.ROCK, Math.min(1, (h - 700)  / 1900));  // vegetation thins
  if (h > 2600) c = mix(c, BIOME.HIGH, Math.min(1, (h - 2600) / 1500));  // bare rock
  if (h > 4100) c = mix(c, BIOME.SNOW, Math.min(1, (h - 4100) / 900));   // permanent snow
  return c;
}

/** Sea colour from distance to shore, 0..1. */
export function seaTint(d) {
  if (d < 0.18) return mix(SEA.SHELF, SEA.SHALLOW, d / 0.18);
  if (d < 0.45) return mix(SEA.SHALLOW, SEA.MID, (d - 0.18) / 0.27);
  return mix(SEA.MID, SEA.DEEP, Math.min(1, (d - 0.45) / 0.55));
}

export const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
