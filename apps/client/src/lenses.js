/**
 * The lens grammar (docs/21-hud.md §A4, docs/08-visual-design.md §2.3).
 *
 * A lens is a glass sheet you lay over the model. It does not replace the
 * world — the terrain stays legible under it — but while it is down, the
 * table answers in that sheet's language: the ground colors itself by what
 * the sheet cares about, the grid changes to the sheet's own subdivision,
 * and a tap on the world executes the verb that thing is asking for.
 *
 * The eligibility pigments and the shape a verb must have are NOT reinvented
 * here: they come from packages/ui/src/lenses.js, written for the old
 * grand-strategy client and kept when its UI went. Six states, gold means
 * yours, and a lens with a misspelled state fails at boot rather than
 * silently on the map.
 *
 * One departure from that engine, and it is the Recite Game's whole posture:
 * you do not arm a VERB there and then click. You lay down a SHEET, and the
 * verb is whatever the thing under your finger is asking for — the same rule
 * the farm already taught by hand. So a lens lists its verbs, and the first
 * one that can act on the target is the one that runs.
 */
import { ELIGIBILITY, ELIGIBILITY_ORDER, normalizeEligibility, validateLens }
  from '../../../packages/ui/src/lenses.js';

export { ELIGIBILITY, ELIGIBILITY_ORDER, normalizeEligibility };

const LENSES = [];
const byId = new Map();
let armedId = null;
let hooks = {};

export function initLenses(h) { hooks = h ?? {}; }

/**
 * Register a lens, loudly. Registration order is tray order is key order.
 *
 * @param def {{
 *   id, glyph, name, blurb,
 *   grid?:  'camps'|'states'|'survey'|'none',
 *   books?: string[],
 *   target: (lon, lat) => object|null,   what lies under the finger
 *   verbs?: [{ id, label, eligible(target) => string, execute(target) }],
 *   hint?:  () => string,
 * }}
 */
export function registerLens(def) {
  const lens = { grid: 'none', books: [], verbs: [], ...def };
  if (!lens.id || !lens.glyph || !lens.name)
    throw new Error(`lens ${lens.id ?? '?'}: needs id, glyph and name`);
  if (typeof lens.target !== 'function')
    throw new Error(`lens ${lens.id}: needs target(lon, lat)`);
  if (byId.has(lens.id)) throw new Error(`lens ${lens.id}: registered twice`);
  // A lens with verbs answers to the shared grammar and is checked by it.
  // A lens with none is a reading sheet — informational, which the Table has
  // always allowed ("modes are informational; lenses are verbs").
  if (lens.verbs.length) validateLens(lens);
  LENSES.push(lens);
  byId.set(lens.id, lens);
  return lens;
}

export const lensList = () => LENSES;
export const lensById = (id) => byId.get(id) ?? null;
export const armedLens = () => (armedId ? byId.get(armedId) : null);
export const armedLensId = () => armedId;

/** Lay a sheet down (or pick it back up with null / the same id). */
export function arm(id) {
  const next = id && byId.has(id) ? id : null;
  if (next === armedId) return armedLens();
  armedId = next;
  hooks.onArm?.(armedLens());
  return armedLens();
}
export const disarm = () => arm(null);

/** Next/previous sheet in the tray; wraps, and steps off the end to bare table. */
export function cycle(dir = 1) {
  const i = LENSES.findIndex((l) => l.id === armedId);
  const n = LENSES.length;
  const next = i < 0 ? (dir > 0 ? 0 : n - 1) : i + dir;
  return arm(next < 0 || next >= n ? null : LENSES[next].id);
}

/**
 * What this lens would do at a point: the target under the finger, the verb
 * that can act on it, and how that reads in the six pigments. A verb that
 * cannot act still comes back — its state is the reason, and the reason is
 * what the hint line says out loud.
 */
export function actionAt(lens, lon, lat) {
  if (!lens) return null;
  const target = lens.target(lon, lat);
  if (!target) return null;
  let blocked = null;
  for (const verb of lens.verbs) {
    const state = normalizeEligibility(verb.eligible(target));
    if (state === 'can') return { target, verb, state };
    if (!blocked && state !== 'never') blocked = { target, verb, state };
  }
  return blocked ?? { target, verb: null, state: 'never' };
}

/** Run what the target is asking for. A blocked verb explains itself instead. */
export function execute(lens, lon, lat) {
  const a = actionAt(lens, lon, lat);
  if (!a) return null;
  if (a.state === 'can' && a.verb) a.verb.execute(a.target);
  else hooks.onBlocked?.(a, lens);
  return a;
}

/* ── The tray: sheets stacked at the edge of the table ──────────────────── */

export function buildTray(el) {
  el.innerHTML = LENSES.map((l, i) => `
    <button class="lens" data-lens="${l.id}" aria-pressed="false"
      title="${l.name} — ${l.blurb}  [${i + 1}]">
      <span class="lens-glyph">${l.glyph}</span>
      <span class="lens-name">${l.name}</span>
    </button>`).join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lens]');
    if (!b) return;
    arm(b.dataset.lens === armedId ? null : b.dataset.lens);
  });
  paintTray(el);
}

export function paintTray(el) {
  for (const b of el.querySelectorAll('[data-lens]'))
    b.setAttribute('aria-pressed', String(b.dataset.lens === armedId));
}

/** The number keys lay sheets down: 1..9 by tray order, 0 picks them all up. */
export function keyToLens(key) {
  if (key === '0') return null;
  const n = Number(key);
  return Number.isInteger(n) && n >= 1 && n <= LENSES.length ? LENSES[n - 1].id : undefined;
}
