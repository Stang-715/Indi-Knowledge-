/**
 * Landmark sprites, drawn in code.
 *
 * The sprite manifest in docs/08-visual-design.md §7.2 calls for ~85 generated
 * assets through Magnific. That spends real credits and needs an explicit go, so
 * these are procedural stand-ins built under the SAME locked lighting rig
 * (§6.6): warm key from the upper-left at 35° elevation, cool ambient fill at
 * 15%, short warm contact shadow, matte, no gloss, no rim.
 *
 * They are not placeholders in the usual sense. Because they share the rig, the
 * generated assets can replace them one at a time without the map ever looking
 * half-finished — and because they are code, they cost nothing and scale
 * cleanly.
 *
 * Landmarks are symbolic markers at fixed screen size, deliberately out of
 * scale — pictorial-map grammar (§6.3). At L10 a real temple is four pixels.
 */

const LIT   = '#E4D3AC';   // key-lit face
const MID   = '#C0A77E';   // half-lit
const SHADE = '#8E7248';   // shadowed face
const DARK  = '#6B5636';
const GOLD  = '#C9A227';
const CONTACT = 'rgba(92,70,40,.28)';

/** Every sprite sits on the same warm contact shadow. */
const base = (w) =>
  `<ellipse cx="0" cy="1.5" rx="${w}" ry="${w * 0.26}" fill="${CONTACT}"/>`;

/**
 * Era-correct landmark set. The reference image placed a Taj Mahal, which is
 * 1653 and anachronistic for 95% of this campaign (§6.2) — so the vocabulary
 * here is ashmounds, reservoirs, stupas, viharas and vimanas.
 *
 * Each returns SVG in a 40x40 box, origin at base centre.
 */
export const SPRITES = {
  /** A cattle pen burned season after season for centuries. */
  ashmound: () => `${base(13)}
    <path d="M-13 2 Q-9-9 0-11 Q9-9 13 2 Z" fill="${MID}"/>
    <path d="M-13 2 Q-9-9 0-11 L0 2 Z" fill="${LIT}"/>
    <path d="M-6-6 Q0-8 6-6" stroke="${DARK}" stroke-width="1" fill="none" opacity=".5"/>`,

  /** Raised stones over a burial. */
  megalith: () => `${base(12)}
    <path d="M-9 2 L-7-9 L-3-9 L-4 2 Z" fill="${LIT}"/>
    <path d="M3 2 L4-10 L8-10 L8 2 Z" fill="${MID}"/>
    <path d="M-11-11 L10-13 L11-9 L-10-7 Z" fill="${SHADE}"/>`,

  /** Mudbrick compound with the compartmented storage room. */
  mudbrick: () => `${base(13)}
    <path d="M-12 2 L-12-7 L1-11 L1 2 Z" fill="${LIT}"/>
    <path d="M1 2 L1-11 L12-7 L12 2 Z" fill="${SHADE}"/>
    <path d="M-12-7 L1-11 L12-7 L1-4 Z" fill="${MID}"/>
    <rect x="-8" y="-4" width="4" height="6" fill="${DARK}" opacity=".55"/>`,

  /** Dholavira's stepped reservoir. */
  reservoir: () => `${base(14)}
    <path d="M-14 2 L-10-6 L10-6 L14 2 Z" fill="${MID}"/>
    <path d="M-10-6 L-6-10 L6-10 L10-6 Z" fill="${LIT}"/>
    <path d="M-7-6 L-4-9 L4-9 L7-6 L4-3 L-4-3 Z" fill="#3E8496"/>
    <path d="M-7-6 L-4-9 L0-9 L0-3 L-4-3 Z" fill="#7CB4C0" opacity=".7"/>`,

  /** The Great Bath — the tank as public architecture. */
  bath: () => `${base(13)}
    <rect x="-13" y="-8" width="26" height="10" fill="${MID}"/>
    <rect x="-13" y="-8" width="13" height="10" fill="${LIT}"/>
    <rect x="-8" y="-6" width="16" height="6" fill="#24606F"/>
    <rect x="-8" y="-6" width="16" height="2" fill="#3E8496"/>`,

  /** Lothal's basin. */
  basin: () => `${base(14)}
    <path d="M-14 2 L-12-7 L12-7 L14 2 Z" fill="${SHADE}"/>
    <rect x="-10" y="-6" width="20" height="7" fill="#24606F"/>
    <path d="M-3-6 L-3-12 M-3-11 L4-9 L-3-7" stroke="${DARK}" stroke-width="1" fill="none"/>`,

  /** Sanchi. The stupa form, established. */
  stupa: () => `${base(13)}
    <path d="M-13 2 A13 13 0 0 1 13 2 Z" fill="${MID}"/>
    <path d="M-13 2 A13 13 0 0 1 0-11 L0 2 Z" fill="${LIT}"/>
    <rect x="-3" y="-15" width="6" height="4" fill="${SHADE}"/>
    <path d="M-6-15 L6-15" stroke="${GOLD}" stroke-width="1.4"/>
    <path d="M0-15 L0-19" stroke="${GOLD}" stroke-width="1.2"/>`,

  /** Nalanda: a vihara block. */
  vihara: () => `${base(14)}
    <path d="M-14 2 L-14-8 L2-12 L2 2 Z" fill="${LIT}"/>
    <path d="M2 2 L2-12 L14-8 L14 2 Z" fill="${SHADE}"/>
    <g fill="${DARK}" opacity=".5">
      <rect x="-11" y="-6" width="3" height="4"/><rect x="-5" y="-7" width="3" height="4"/>
      <rect x="6" y="-5" width="3" height="4"/><rect x="10" y="-4" width="3" height="4"/>
    </g>`,

  /** Brihadeeswarar: the vimana. */
  vimana: () => `${base(11)}
    <path d="M-11 2 L-7-16 L7-16 L11 2 Z" fill="${MID}"/>
    <path d="M-11 2 L-7-16 L0-16 L0 2 Z" fill="${LIT}"/>
    <g stroke="${DARK}" stroke-width=".7" opacity=".45">
      <path d="M-9-4 L9-4"/><path d="M-8-9 L8-9"/><path d="M-7.4-13 L7.4-13"/>
    </g>
    <path d="M0-16 L0-21" stroke="${GOLD}" stroke-width="1.6"/>
    <circle cx="0" cy="-22" r="2" fill="${GOLD}"/>`,

  /** Konark: the sun temple as a stone chariot. */
  wheel: () => `${base(12)}
    <path d="M-12 2 L-9-8 L9-8 L12 2 Z" fill="${SHADE}"/>
    <circle cx="0" cy="-6" r="9" fill="${MID}" stroke="${DARK}" stroke-width="1.2"/>
    <circle cx="0" cy="-6" r="9" fill="none" stroke="${LIT}" stroke-width="1"
            stroke-dasharray="2 3"/>
    <circle cx="0" cy="-6" r="2.4" fill="${LIT}"/>`,

  /** A fortified rampart. */
  rampart: () => `${base(14)}
    <path d="M-14 2 L-12-6 L12-6 L14 2 Z" fill="${MID}"/>
    <path d="M-14 2 L-12-6 L0-6 L0 2 Z" fill="${LIT}"/>
    <g fill="${SHADE}">
      <rect x="-12" y="-10" width="4" height="4"/><rect x="-4" y="-10" width="4" height="4"/>
      <rect x="4" y="-10" width="4" height="4"/><rect x="9" y="-10" width="4" height="4"/>
    </g>`,

  /** An Ashokan pillar. Writing returns after 1,650 years. */
  pillar: () => `${base(7)}
    <rect x="-2" y="-18" width="4" height="20" fill="${LIT}"/>
    <rect x="0" y="-18" width="2" height="20" fill="${MID}"/>
    <ellipse cx="0" cy="-19" rx="4.5" ry="2" fill="${GOLD}"/>
    <path d="M-4-21 Q0-25 4-21" fill="${GOLD}"/>`,

  /** A port. */
  port: () => `${base(13)}
    <path d="M-13 2 L-11-4 L5-4 L7 2 Z" fill="${MID}"/>
    <path d="M-2-4 L-2-16 L8-11 L-2-8" fill="${LIT}"/>
    <path d="M-2-16 L-2-4" stroke="${DARK}" stroke-width="1.2"/>`,

  /** Settlement tiers, for everything unmarked. */
  village: () => `${base(8)}
    <path d="M-8 2 L-8-3 L-3-7 L2-3 L2 2 Z" fill="${LIT}"/>
    <path d="M2 2 L2-3 L7-6 L7 2 Z" fill="${SHADE}"/>`,

  city: () => `${base(13)}
    <path d="M-13 2 L-13-5 L-6-10 L-6 2 Z" fill="${LIT}"/>
    <path d="M-6 2 L-6-12 L2-16 L2 2 Z" fill="${MID}"/>
    <path d="M2 2 L2-8 L11-4 L11 2 Z" fill="${SHADE}"/>`,
};

/** Wrap a sprite body into a standalone SVG string. */
export function spriteSVG(name, size = 40) {
  const body = SPRITES[name]?.();
  if (!body) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -26 40 30" width="${size}" height="${size * 0.75}">${body}</svg>`;
}

/** A data URI, ready for an <img> or a canvas drawImage. */
export function spriteURL(name, size = 40) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(spriteSVG(name, size))}`;
}

/** Which sprite a site uses, by era and kind. */
export function spriteFor(site, year) {
  if (site.sprite) return site.sprite;
  if (year < -3300) return 'mudbrick';
  if (year < -1900) return 'reservoir';
  if (year < -600)  return 'megalith';
  if (year < 100)   return 'stupa';
  if (year < 850)   return 'vihara';
  return 'vimana';
}

export const SPRITE_NAMES = Object.keys(SPRITES);
