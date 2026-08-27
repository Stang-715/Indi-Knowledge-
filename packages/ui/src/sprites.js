/**
 * Landmark sprites, drawn in code.
 *
 * The manifest in `data/art/sprites.json` specifies 85 generated assets. Three
 * style anchors were generated; the pixels cannot be fetched into this
 * environment because the network policy blocks the image host, so these
 * procedural sprites are what the game actually ships.
 *
 * They are built under the SAME locked lighting rig as the generated set
 * (docs/08-visual-design.md §6.6) — warm key from the upper-left at 35°
 * elevation, cool ambient fill at 15%, short warm contact shadow, matte, no
 * gloss, no rim light — so a generated asset can replace any one of them
 * without the map ever looking half-finished.
 *
 * Landmarks are symbolic markers at fixed screen size, deliberately out of
 * scale — pictorial-map grammar (§6.3). At L10 a real temple is four pixels
 * across, and a symbol carries meaning that scale cannot.
 */

/* ── The rig, as five tones ─────────────────────────────────────────────── */

const KEY   = '#EFE0BC';   // catching the key light directly
const LIT   = '#D9C49A';   // key-lit face
const MID   = '#B99E76';   // half-lit
const SHADE = '#8A7250';   // turned away
const DARK  = '#5F4C31';   // openings, incised lines
const GOLD  = '#C9A227';   // means yours, or gilded. Nothing else.
const WATER = '#2E6E80';
const WATER_LIT = '#6FA8B6';
const GREEN = '#7A8F52';

/**
 * The contact shadow.
 *
 * Two stacked ellipses rather than a blur filter: an SVG filter inside a data
 * URI is re-rasterised on every draw and shows up immediately in a frame
 * budget, where two fills do not.
 */
const base = (w) =>
  `<ellipse cx="1.2" cy="2.4" rx="${w * 1.06}" ry="${w * 0.3}" fill="rgba(92,70,40,.13)"/>` +
  `<ellipse cx="0.6" cy="1.8" rx="${w * 0.82}" ry="${w * 0.22}" fill="rgba(92,70,40,.22)"/>`;

/** A few incised marks. Matte surfaces need tooth or they read as plastic. */
const grain = (d) => `<g stroke="${DARK}" stroke-width=".5" opacity=".22" fill="none">${d}</g>`;

/** The lit edge along a silhouette's upper left, where the key catches it. */
const edge = (d) => `<path d="${d}" stroke="${KEY}" stroke-width=".9" fill="none" opacity=".7"/>`;

/* ── The set ────────────────────────────────────────────────────────────── */

export const SPRITES = {

  /* — Prehistory ————————————————————————————————— */

  /** A cattle pen burned season after season for centuries. */
  ashmound: () => `${base(13)}
    <path d="M-13 2 Q-10-8 0-11 Q10-8 13 2 Z" fill="${MID}"/>
    <path d="M-13 2 Q-10-8 0-11 L0 2 Z" fill="${LIT}"/>
    ${edge('M-12 0 Q-9-7 0-10.4')}
    ${grain('M-7-4 Q0-7 7-4 M-5-1 Q0-3 6-1')}
    <path d="M-14 2 L-15-2 M-11 2 L-13-3 M14 2 L15-2" stroke="${SHADE}" stroke-width="1"/>`,

  /** Raised stones over a burial. */
  megalith: () => `${base(12)}
    <path d="M-9 2 L-7.4-9 L-3.6-9 L-4 2 Z" fill="${LIT}"/>
    <path d="M3 2 L4-10 L7.6-10 L8 2 Z" fill="${MID}"/>
    <path d="M-11-10.5 L10-12.6 L11.4-8.6 L-9.8-6.4 Z" fill="${SHADE}"/>
    <path d="M-11-10.5 L10-12.6 L10.6-11 L-10.4-8.8 Z" fill="${MID}"/>
    ${grain('M-6-8 L-6 1 M5-9 L5 1')}`,

  /** Urn burials in dry earth. */
  urnfield: () => `${base(12)}
    <path d="M-12 2 Q-6-4-2-2 Q3-5 8-2 Q11-3 12 2 Z" fill="${MID}" opacity=".55"/>
    <ellipse cx="-6" cy="-2" rx="4.4" ry="5" fill="#A0724E"/>
    <ellipse cx="-7.4" cy="-2.4" rx="2.2" ry="4" fill="#BE8B62"/>
    <ellipse cx="4" cy="-1" rx="3.6" ry="4.2" fill="#96694A"/>
    <ellipse cx="3" cy="-1.4" rx="1.7" ry="3.2" fill="#B07E58"/>
    <ellipse cx="10" cy="0" rx="2.2" ry="2.6" fill="#8D6244"/>`,

  /** Mudbrick compound with the compartmented storage room. */
  mudbrick: () => `${base(13)}
    <path d="M-12 2 L-12-6.6 L1-10.6 L1 2 Z" fill="${LIT}"/>
    <path d="M1 2 L1-10.6 L12-6.6 L12 2 Z" fill="${SHADE}"/>
    <path d="M-12-6.6 L1-10.6 L12-6.6 L1-3.4 Z" fill="${MID}"/>
    ${edge('M-12-6.4 L1-10.4')}
    <rect x="-8.4" y="-3.6" width="3.6" height="5.6" fill="${DARK}" opacity=".6"/>
    ${grain('M-12-3.4 L1-6.6 M-12-0.6 L1-3.8 M1-6.6 L12-3.4')}`,

  /* — The Indus ————————————————————————————————— */

  /** Dholavira's stepped reservoir. */
  reservoir: () => `${base(14)}
    <path d="M-14 2 L-10.4-6 L10.4-6 L14 2 Z" fill="${MID}"/>
    <path d="M-14 2 L-10.4-6 L0-6 L0 2 Z" fill="${LIT}"/>
    <path d="M-10.4-6 L-6.6-10 L6.6-10 L10.4-6 Z" fill="${LIT}"/>
    <path d="M0-10 L6.6-10 L10.4-6 L0-6 Z" fill="${MID}"/>
    <path d="M-7-6 L-4-9 L4-9 L7-6 L4-3.2 L-4-3.2 Z" fill="${WATER}"/>
    <path d="M-7-6 L-4-9 L0-9 L0-3.2 L-4-3.2 Z" fill="${WATER_LIT}" opacity=".62"/>
    ${grain('M-9-8 L9-8 M-11-4 L11-4')}`,

  /** The Great Bath — the tank as public architecture. */
  bath: () => `${base(13)}
    <path d="M-13 2 L-13-7.4 L13-7.4 L13 2 Z" fill="${MID}"/>
    <path d="M-13 2 L-13-7.4 L0-7.4 L0 2 Z" fill="${LIT}"/>
    <rect x="-8.6" y="-5.6" width="17.2" height="6.4" fill="#1F5462"/>
    <rect x="-8.6" y="-5.6" width="8" height="6.4" fill="${WATER}"/>
    <rect x="-8.6" y="-5.6" width="17.2" height="1.4" fill="${WATER_LIT}" opacity=".5"/>
    ${edge('M-12.6-7 L12.6-7')}`,

  /** Lothal's basin. */
  basin: () => `${base(14)}
    <path d="M-14 2 L-12-6.6 L12-6.6 L14 2 Z" fill="${SHADE}"/>
    <path d="M-14 2 L-12-6.6 L0-6.6 L0 2 Z" fill="${MID}"/>
    <rect x="-10.4" y="-5.4" width="20.8" height="6.6" fill="#1F5462"/>
    <rect x="-10.4" y="-5.4" width="20.8" height="1.2" fill="${WATER}"/>
    <path d="M-3-5.4 L-3-14 L5-11.4 L-3-9" fill="${LIT}"/>
    <path d="M-3-14 L-3-5.4" stroke="${DARK}" stroke-width="1.1"/>`,

  /** A granary block: storage means surplus means hierarchy. */
  granary: () => `${base(13)}
    <path d="M-13 2 L-13-4.6 L13-4.6 L13 2 Z" fill="${SHADE}"/>
    <g fill="${MID}">
      <rect x="-11.4" y="-10.4" width="6.4" height="6"/>
      <rect x="-2.6" y="-11.4" width="6.4" height="7"/>
      <rect x="6.2" y="-10" width="6" height="5.6"/>
    </g>
    <g fill="${LIT}">
      <rect x="-11.4" y="-10.4" width="3" height="6"/>
      <rect x="-2.6" y="-11.4" width="3" height="7"/>
      <rect x="6.2" y="-10" width="2.8" height="5.6"/>
    </g>
    ${grain('M-13-2.4 L13-2.4')}`,

  /* — Writing and empire ——————————————————————————— */

  /** Sanchi. The stupa form, established. */
  stupa: () => `${base(13)}
    <path d="M-13 2 A13 12 0 0 1 13 2 Z" fill="${MID}"/>
    <path d="M-13 2 A13 12 0 0 1 0-10 L0 2 Z" fill="${LIT}"/>
    ${edge('M-12 -2 A13 12 0 0 1 -1 -9.9')}
    <rect x="-3.4" y="-14.6" width="6.8" height="4.6" fill="${SHADE}"/>
    <rect x="-3.4" y="-14.6" width="3" height="4.6" fill="${MID}"/>
    <path d="M0-14.6 L0-20.4" stroke="${GOLD}" stroke-width="1.2"/>
    <path d="M-5.4-19 L5.4-19 M-3.8-21.4 L3.8-21.4" stroke="${GOLD}" stroke-width="1.3"/>
    <path d="M-13 2 L-13-0.6 M13 2 L13-0.6" stroke="${SHADE}" stroke-width="1.4"/>`,

  /** An Ashokan pillar. Writing returns after 1,650 years. */
  pillar: () => `${base(7)}
    <path d="M-2.2-17.4 L-1.6 2 L1.6 2 L2.2-17.4 Z" fill="${LIT}"/>
    <path d="M0-17.4 L0 2 L1.6 2 L2.2-17.4 Z" fill="${MID}"/>
    <ellipse cx="0" cy="-18.6" rx="4.6" ry="1.9" fill="${SHADE}"/>
    <ellipse cx="0" cy="-19.4" rx="4.2" ry="1.7" fill="${GOLD}"/>
    <path d="M-3.6-20.6 Q0-25.4 3.6-20.6 Z" fill="${GOLD}"/>
    ${grain('M-1.4-13 L1.4-13 M-1.5-8 L1.5-8 M-1.5-3 L1.5-3')}`,

  /** A rock-cut chaitya hall in a basalt cliff. */
  chaitya: () => `${base(13)}
    <path d="M-13 2 L-11-12.6 L11-12.6 L13 2 Z" fill="${SHADE}"/>
    <path d="M-13 2 L-11-12.6 L0-12.6 L0 2 Z" fill="${MID}"/>
    <path d="M-5.4 2 L-5.4-5 A5.4 6 0 0 1 5.4-5 L5.4 2 Z" fill="${DARK}"/>
    <path d="M-5.4-5 A5.4 6 0 0 1 5.4-5" fill="none" stroke="${LIT}" stroke-width="1.3"/>
    ${grain('M-9-9 L9-9 M-10-5 L-7-5 M7-5 L10-5')}`,

  /** Nalanda: a vihara block. */
  vihara: () => `${base(14)}
    <path d="M-14 2 L-14-7.6 L2-11.6 L2 2 Z" fill="${LIT}"/>
    <path d="M2 2 L2-11.6 L14-7.6 L14 2 Z" fill="${SHADE}"/>
    ${edge('M-13.6-7.4 L1.6-11.2')}
    <g fill="${DARK}" opacity=".55">
      <rect x="-11.4" y="-5.6" width="2.8" height="4"/>
      <rect x="-6.6" y="-6.8" width="2.8" height="4"/>
      <rect x="-1.8" y="-8" width="2.8" height="4"/>
      <rect x="6" y="-4.6" width="2.6" height="3.6"/>
      <rect x="10" y="-3.4" width="2.6" height="3.4"/>
    </g>
    ${grain('M-14-3 L2-6.8 M2-6.8 L14-3')}`,

  /* — The temple age ——————————————————————————————— */

  /** Brihadeeswarar: the vimana, and it was the tallest thing in India. */
  vimana: () => `${base(11)}
    <path d="M-11 2 L-6.4-16 L6.4-16 L11 2 Z" fill="${MID}"/>
    <path d="M-11 2 L-6.4-16 L0-16 L0 2 Z" fill="${LIT}"/>
    ${edge('M-10.4 0 L-6.2-15.4')}
    <g stroke="${DARK}" stroke-width=".65" opacity=".42">
      <path d="M-9.4-4.6 L9.4-4.6"/><path d="M-8.2-9 L8.2-9"/><path d="M-7.2-12.8 L7.2-12.8"/>
    </g>
    <g fill="${SHADE}" opacity=".5">
      <rect x="-5" y="-8.4" width="1.8" height="3"/><rect x="3.2" y="-8.4" width="1.8" height="3"/>
      <rect x="-4.2" y="-12.4" width="1.6" height="2.6"/><rect x="2.6" y="-12.4" width="1.6" height="2.6"/>
    </g>
    <path d="M-6.4-16 L-3.4-19.4 L3.4-19.4 L6.4-16 Z" fill="${SHADE}"/>
    <path d="M-6.4-16 L-3.4-19.4 L0-19.4 L0-16 Z" fill="${MID}"/>
    <path d="M0-19.4 L0-22.6" stroke="${GOLD}" stroke-width="1.5"/>
    <circle cx="0" cy="-23.6" r="2.1" fill="${GOLD}"/>`,

  /** A Hoysala shrine on a star plan. */
  hoysala: () => `${base(12)}
    <path d="M-12 2 L-9-2 L-11-5 L-6-5.6 L-4-9.6 L0-7 L4-9.6 L6-5.6 L11-5 L9-2 L12 2 Z"
          fill="${MID}"/>
    <path d="M-12 2 L-9-2 L-11-5 L-6-5.6 L-4-9.6 L0-7 L0 2 Z" fill="${LIT}"/>
    <path d="M-5-9 L-3.6-14 L3.6-14 L5-9 Z" fill="${SHADE}"/>
    <path d="M-5-9 L-3.6-14 L0-14 L0-9 Z" fill="${MID}"/>
    ${grain('M-10-3.4 L10-3.4 M-7-6.6 L7-6.6')}`,

  /** Konark: the sun temple as a stone chariot. */
  wheel: () => `${base(12)}
    <path d="M-12 2 L-9.4-7.6 L9.4-7.6 L12 2 Z" fill="${SHADE}"/>
    <path d="M-12 2 L-9.4-7.6 L0-7.6 L0 2 Z" fill="${MID}"/>
    <circle cx="0" cy="-5.6" r="8.8" fill="${MID}" stroke="${DARK}" stroke-width="1.1"/>
    <path d="M-8.8-5.6 A8.8 8.8 0 0 1 0-14.4 L0-5.6 Z" fill="${LIT}"/>
    <g stroke="${DARK}" stroke-width=".8" opacity=".55">
      <path d="M0-14.4 L0 3.2"/><path d="M-8.8-5.6 L8.8-5.6"/>
      <path d="M-6.2-11.8 L6.2 0.6"/><path d="M6.2-11.8 L-6.2 0.6"/>
    </g>
    <circle cx="0" cy="-5.6" r="2.4" fill="${GOLD}" opacity=".85"/>`,

  /** An Odishan deul — vertical ribbed bands and a flattened disc. */
  deul: () => `${base(10)}
    <path d="M-10 2 L-7.6-8 Q-6-16-2.6-18.6 L2.6-18.6 Q6-16 7.6-8 L10 2 Z" fill="${MID}"/>
    <path d="M-10 2 L-7.6-8 Q-6-16-2.6-18.6 L0-18.6 L0 2 Z" fill="${LIT}"/>
    <g stroke="${DARK}" stroke-width=".6" opacity=".38">
      <path d="M-4-17 L-5.4 2"/><path d="M0-18.4 L0 2"/><path d="M4-17 L5.4 2"/>
    </g>
    <ellipse cx="0" cy="-19.6" rx="5.4" ry="1.8" fill="${SHADE}"/>
    <circle cx="0" cy="-22.4" r="1.8" fill="${GOLD}"/>`,

  /** A tank, and a tank is what makes the delta. */
  tank: () => `${base(13)}
    <path d="M-13 2 L-11-5 L11-5 L13 2 Z" fill="${MID}"/>
    <path d="M-13 2 L-11-5 L0-5 L0 2 Z" fill="${LIT}"/>
    <ellipse cx="0" cy="-4.2" rx="9.6" ry="3.6" fill="#1F5462"/>
    <ellipse cx="-1.4" cy="-4.8" rx="6.8" ry="2.2" fill="${WATER}"/>
    <path d="M-6-5.4 Q-2-6.6 2-5.4" stroke="${WATER_LIT}" stroke-width=".9" fill="none" opacity=".7"/>
    <g fill="${GREEN}" opacity=".8">
      <ellipse cx="-11" cy="-4.4" rx="2.2" ry="2.8"/><ellipse cx="11.4" cy="-4" rx="2" ry="2.6"/>
    </g>`,

  /** A fortified rampart. */
  rampart: () => `${base(14)}
    <path d="M-14 2 L-12.2-5.6 L12.2-5.6 L14 2 Z" fill="${MID}"/>
    <path d="M-14 2 L-12.2-5.6 L0-5.6 L0 2 Z" fill="${LIT}"/>
    <g fill="${SHADE}">
      <rect x="-12" y="-9.6" width="3.8" height="4"/><rect x="-4.6" y="-9.6" width="3.8" height="4"/>
      <rect x="2.6" y="-9.6" width="3.8" height="4"/><rect x="9" y="-9.6" width="3.4" height="4"/>
    </g>
    <g fill="${MID}">
      <rect x="-12" y="-9.6" width="1.8" height="4"/><rect x="-4.6" y="-9.6" width="1.8" height="4"/>
      <rect x="2.6" y="-9.6" width="1.8" height="4"/>
    </g>
    <rect x="-2.4" y="-3.4" width="4.8" height="5.4" fill="${DARK}" opacity=".62"/>`,

  /* — Places ————————————————————————————————————— */

  port: () => `${base(13)}
    <path d="M-13 2 L-11.4-4 L5-4 L7 2 Z" fill="${MID}"/>
    <path d="M-13 2 L-11.4-4 L-2-4 L-2 2 Z" fill="${LIT}"/>
    <path d="M-2-4 L-2-16.4 L8.6-11 L-2-8 Z" fill="${LIT}"/>
    <path d="M-2-11.4 L8.6-11 L-2-8 Z" fill="${MID}"/>
    <path d="M-2-16.4 L-2-3" stroke="${DARK}" stroke-width="1.2"/>
    <path d="M-13 1.4 Q-9 0-5 1.4 Q-1 2.8 3 1.4" stroke="${WATER}" stroke-width="1.1" fill="none"/>`,

  village: () => `${base(8)}
    <path d="M-8 2 L-8-2.6 L-3.2-6.6 L1.6-2.6 L1.6 2 Z" fill="${LIT}"/>
    <path d="M-3.2-6.6 L1.6-2.6 L1.6 2 L-3.2 2 Z" fill="${MID}"/>
    <path d="M2 2 L2-2.8 L6.4-5.6 L6.4 2 Z" fill="${SHADE}"/>
    ${grain('M-6-1 L-0.6-1')}`,

  town: () => `${base(11)}
    <path d="M-11 2 L-11-3.4 L-5.6-7.6 L-0.6-3.4 L-0.6 2 Z" fill="${LIT}"/>
    <path d="M-5.6-7.6 L-0.6-3.4 L-0.6 2 L-5.6 2 Z" fill="${MID}"/>
    <path d="M0 2 L0-5.4 L4.6-9 L9 -5.4 L9 2 Z" fill="${MID}"/>
    <path d="M4.6-9 L9-5.4 L9 2 L4.6 2 Z" fill="${SHADE}"/>
    <rect x="-3.4" y="-1" width="2.2" height="3" fill="${DARK}" opacity=".5"/>`,

  city: () => `${base(13)}
    <path d="M-13 2 L-13-4.6 L-6.4-9.4 L-6.4 2 Z" fill="${LIT}"/>
    <path d="M-6.4 2 L-6.4-11.6 L1.6-15.6 L1.6 2 Z" fill="${MID}"/>
    <path d="M-6.4-11.6 L1.6-15.6 L1.6-11.6 L-6.4-8 Z" fill="${LIT}"/>
    <path d="M2 2 L2-7.6 L11-3.6 L11 2 Z" fill="${SHADE}"/>
    <path d="M-2.4-15.6 L-2.4-18.6" stroke="${GOLD}" stroke-width="1.2"/>
    ${grain('M-13-1.6 L-6.4-1.6 M2-4.6 L11-1')}`,

  /* — Agents ————————————————————————————————————— */

  caravan: () => `${base(11)}
    <path d="M-9 1.4 Q-7.6-3.4-4.4-3.4 Q-1.2-3.4 0.2 1.4 Z" fill="${MID}"/>
    <path d="M-9 1.4 Q-7.6-3.4-4.4-3.4 L-4.4 1.4 Z" fill="${LIT}"/>
    <rect x="-7.4" y="-6" width="6" height="3" fill="${SHADE}"/>
    <path d="M2 1.4 Q3.2-2.6 6-2.6 Q8.8-2.6 10 1.4 Z" fill="${SHADE}"/>
    <rect x="3.6" y="-5" width="5" height="2.6" fill="${MID}"/>`,

  boat: () => `${base(11)}
    <path d="M-11 1.6 Q0 4.4 11 1.6 L9-2 L-9-2 Z" fill="${MID}"/>
    <path d="M-11 1.6 Q-5 3-0 3.4 L0-2 L-9-2 Z" fill="${LIT}"/>
    <path d="M-0.6-2 L-0.6-14" stroke="${DARK}" stroke-width="1.2"/>
    <path d="M-0.6-13.4 L7.6-9.4 L-0.6-5.4 Z" fill="${KEY}"/>
    <path d="M-0.6-9.4 L7.6-9.4 L-0.6-5.4 Z" fill="${LIT}"/>`,

  /* — What the record leaves ————————————————————— */

  /** An inscribed stone. The commonest evidence in this whole game. */
  inscription: () => `${base(9)}
    <path d="M-8 2 L-6.6-12 Q0-15 6.6-12 L8 2 Z" fill="${MID}"/>
    <path d="M-8 2 L-6.6-12 Q-3.4-13.4 0-13.6 L0 2 Z" fill="${LIT}"/>
    <g stroke="${DARK}" stroke-width=".55" opacity=".5">
      <path d="M-5-9 L5-9"/><path d="M-5.4-6 L5.4-6"/><path d="M-5.6-3 L5.6-3"/>
      <path d="M-5.8 0 L2 0"/>
    </g>`,

  /** A palm-leaf bundle. The corpus, as an object. */
  manuscript: () => `${base(10)}
    <path d="M-10 1.6 L-10-1.4 L10-3.4 L10-0.4 Z" fill="${SHADE}"/>
    <path d="M-10-1.4 L-10-3.4 L10-5.4 L10-3.4 Z" fill="${MID}"/>
    <path d="M-10-3.4 L-10-5.6 L10-7.6 L10-5.4 Z" fill="${LIT}"/>
    <path d="M-10-5.6 L-10-7.4 L10-9.4 L10-7.6 Z" fill="${KEY}"/>
    <path d="M-3-8.4 L-3 1" stroke="${DARK}" stroke-width=".9" opacity=".55"/>`,
};

/* ── API ────────────────────────────────────────────────────────────────── */

/** Wrap a sprite body into a standalone SVG string. */
export function spriteSVG(name, size = 40) {
  const body = SPRITES[name]?.();
  if (!body) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -26 40 31" ` +
         `width="${size}" height="${Math.round(size * 0.775)}">${body}</svg>`;
}

/** A data URI, ready for an <img> or a canvas drawImage. */
export function spriteURL(name, size = 40) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(spriteSVG(name, size))}`;
}

/**
 * Which sprite a site uses, by era and kind.
 *
 * The vocabulary is era-correct on purpose: the reference image that started
 * this placed a Taj Mahal, which is 1653 and anachronistic for 95% of the
 * campaign (docs/08-visual-design.md §6.2).
 */
export function spriteFor(site, year) {
  if (site.sprite) return site.sprite;
  if (year < -4000) return 'ashmound';
  if (year < -3300) return 'mudbrick';
  if (year < -1900) return 'reservoir';
  if (year < -1000) return 'urnfield';
  if (year < -600)  return 'megalith';
  if (year < -200)  return 'rampart';
  if (year < 100)   return 'stupa';
  if (year < 500)   return 'chaitya';
  if (year < 850)   return 'vihara';
  if (year < 1200)  return 'vimana';
  return 'deul';
}

export const SPRITE_NAMES = Object.keys(SPRITES);
