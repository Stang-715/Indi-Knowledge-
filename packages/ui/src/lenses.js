/**
 * The lens grammar (docs/21-hud.md Phase 14).
 *
 * Lenses are for VERBS; panels are for subjects — the census's cleanest
 * line, kept. Arming a verb turns the cursor into a tool: the map recolors
 * by eligibility, the click executes on the district, Escape puts the tool
 * down. This module is the pure part: the six-state eligibility palette on
 * the Table's own colors, and the shape a lens must have.
 *
 * The palette rule that outranks the census: gold means YOURS and nothing
 * else. The census's green/orange/blue/red/white becomes Table pigments.
 */

export const ELIGIBILITY = {
  yours:    { color: '#C9A227', label: 'yours',        hint: 'Already under your seal.' },
  can:      { color: '#7A8F52', label: 'can act',      hint: 'The verb works here. Click to do it.' },
  already:  { color: '#C29A48', label: 'already so',   hint: 'Done, or already true here.' },
  progress: { color: '#7CB4C0', label: 'in progress',  hint: 'Under way; the years will finish it.' },
  could:    { color: '#A8642B', label: 'not yet',      hint: 'Blocked — the reason names what would qualify.' },
  never:    { color: '#E2E5E2', label: 'never',        hint: 'Cannot apply here, and no change would make it.' },
};

export const ELIGIBILITY_ORDER = ['yours', 'can', 'already', 'progress', 'could', 'never'];

/**
 * Validate a lens definition at registration time, loudly. A lens with a
 * misspelled eligibility state fails HERE, not silently on the map.
 */
export function validateLens(lens) {
  if (!lens.id || !lens.glyph || !Array.isArray(lens.verbs) || lens.verbs.length === 0)
    throw new Error(`lens ${lens.id ?? '?'}: needs id, glyph, and at least one verb`);
  for (const v of lens.verbs) {
    if (!v.id || !v.label || typeof v.eligible !== 'function' || typeof v.execute !== 'function')
      throw new Error(`lens ${lens.id}, verb ${v.id ?? '?'}: needs id, label, eligible(), execute()`);
  }
  return lens;
}

/** Clamp an eligibility answer to the six known states; unknown = never. */
export function normalizeEligibility(x) {
  return ELIGIBILITY[x] ? x : 'never';
}
