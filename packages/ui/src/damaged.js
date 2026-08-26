/**
 * The failure surface (docs/19-play-depth.md Phase 54).
 *
 * A sim exception during recompute must never be a white screen. The save is
 * a recipe — seed and decision log — so even a world that cannot be computed
 * still has a complete, tiny record of everything the player did. This panel
 * says so, in the game's own voice, and hands the record over.
 */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * The era-styled damage panel. `err` is whatever was thrown; `saveText` is
 * the serialised save; `build` is the colophon stamp (may be absent).
 */
export function damagedHTML(err, saveText, build = null) {
  const msg = err instanceof Error ? err.message : String(err ?? 'unknown fault');
  const stamp = build
    ? `build ${esc(build.commit)} · ${esc(build.date)} · datapack ${esc(build.datapack)}`
    : 'development build';
  return `<div class="damaged">
  <h2>The record is damaged</h2>
  <p>The world could not be recomputed from here — a fault in the engine, not
  in anything you did. Your campaign is not lost: the save below is the
  complete decision log, and a repaired build will replay it.</p>
  <p class="tiny muted">${esc(msg)}</p>
  <textarea class="damaged-save" readonly rows="4">${esc(saveText)}</textarea>
  <button class="btn" data-copy-save>copy the save</button>
  <p class="tiny muted">If you report this, include the line above and the
  colophon: ${stamp}.</p>
  </div>`;
}
