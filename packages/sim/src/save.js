/**
 * Saves (docs/12-buildplan-2.md Phase 18).
 *
 * The rule was implemented from Phase 1; this makes it a feature.
 *
 *     world = f(datapack, seed, decision_log)
 *
 * A save is a recipe, not a photograph of the cake — so it is a seed, a datapack
 * version, and a list of decisions. Nothing about the world is stored, because
 * everything about the world can be recomputed.
 *
 * Four things fall out of that, and this file is where they stop being theory:
 * saves are kilobytes; a campaign fits in a URL; a replay is just running the
 * same log to a shorter `to`; and an old log replayed against a newer datapack
 * lands on the truer world instead of breaking.
 */

export const SAVE_VERSION = 2;

/** Serialise a campaign. */
export function save(seed, decisions, meta = {}) {
  return {
    v: SAVE_VERSION,
    seed,
    datapack: meta.datapack ?? 'builtin',
    at: meta.year ?? null,
    // Sorted by year so two logs that differ only in insertion order compare
    // equal — a save should not depend on the order the player clicked.
    d: [...decisions].sort(compareDecisions),
  };
}

/**
 * The canonical ordering of decisions.
 *
 * The engine applies decisions in this order too, so a save is genuinely a SET
 * of decisions rather than a sequence. Without that, sorting the log on save
 * changed the world it reproduced — two decisions taken in the same year came
 * back in a different order and the campaign diverged.
 */
export const decisionKey = (d) => JSON.stringify([d.action, d.person ?? '', d.district ?? '',
  d.route ?? '', d.work ?? '', d.people ?? '', d.id ?? '', d.how ?? '', d.layer ?? '',
  d.holder ?? '', d.count ?? '', d.destination ?? '']);

export const compareDecisions = (a, b) =>
  (a.year - b.year) || decisionKey(a).localeCompare(decisionKey(b));

const key = decisionKey;

export function load(text) {
  const o = typeof text === 'string' ? JSON.parse(text) : text;
  if (!o || typeof o !== 'object') throw new Error('not a save');
  if (typeof o.seed !== 'string' && typeof o.seed !== 'number')
    throw new Error('save has no seed');
  if (!Array.isArray(o.d)) throw new Error('save has no decision log');
  return migrate(o);
}

/**
 * Bring an old save forward.
 *
 * Migration operates on the LOG, never on world state, which is the whole
 * advantage of storing decisions: there is no world to migrate.
 */
export function migrate(o) {
  let s = { ...o };
  if (s.v === 1) {
    // v1 stored `{t: year}` and used `patron` for what is now `endow`.
    s.d = s.d.map(d => ({ ...d, year: d.year ?? d.t,
                          action: d.action === 'patron' ? 'endow' : d.action }));
    s.v = 2;
  }
  // Refuse legibly: the message must tell the player what to do, because it
  // is the one error a person with a treasured campaign will actually read.
  if (s.v == null)
    throw new Error('This does not look like a Paramountcy save — it carries no version.');
  if (s.v > SAVE_VERSION)
    throw new Error(`This save is from a newer build (save version ${s.v}; this build reads ${SAVE_VERSION}). Update the game, not the save.`);
  if (s.v !== SAVE_VERSION)
    throw new Error(`Save version ${s.v} is no longer readable; this build reads ${SAVE_VERSION}.`);
  // Drop decisions whose entity no longer exists rather than failing the load:
  // a datapack that renamed something should cost you that decision, not the
  // whole campaign.
  s.dropped = 0;
  return s;
}

/** Validate a loaded log against a datapack, dropping what no longer resolves. */
export function reconcile(sv, datapack) {
  const people = new Set((datapack.people?.people ?? []).map(p => p.id));
  const works  = new Set((datapack.works?.works ?? []).map(w => w.id));
  const kept = [], dropped = [];
  for (const d of sv.d) {
    if (d.person && !people.has(d.person)) { dropped.push(d); continue; }
    if (d.work && !works.has(d.work))      { dropped.push(d); continue; }
    kept.push(d);
  }
  return { ...sv, d: kept, dropped: dropped.length, droppedDetail: dropped };
}

/* ── URL packing ────────────────────────────────────────────────────────── */

/**
 * A campaign in a link.
 *
 * For a title nobody has heard of, a shareable link that opens somebody else's
 * exact campaign at 1193 is the best marketing artefact available, and it costs
 * almost nothing because the save is already tiny.
 */
export function toURLFragment(sv) {
  const json = JSON.stringify(sv);
  return b64urlEncode(json);
}

export function fromURLFragment(frag) {
  return load(b64urlDecode(frag));
}

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(frag) {
  const b64 = frag.replace(/-/g, '+').replace(/_/g, '/');
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ── Replay ─────────────────────────────────────────────────────────────── */

/**
 * The years worth scrubbing to.
 *
 * A replay is not a recording — it is the same pure function evaluated at a
 * different `to`. So the scrub bar's stops are simply the years something
 * happened, and dragging it re-runs the campaign.
 */
export function replayStops(sv, { from = -6000, to = 1947, max = 240 } = {}) {
  const years = new Set([from, to]);
  for (const d of sv.d) years.add(d.year);
  const sorted = [...years].filter(y => y >= from && y <= to).sort((a, b) => a - b);
  if (sorted.length <= max) return sorted;
  const step = Math.ceil(sorted.length / max);
  return sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);
}

/** Size of a save, for the interface to boast about honestly. */
export function saveSize(sv) {
  return new TextEncoder().encode(JSON.stringify(sv)).length;
}
