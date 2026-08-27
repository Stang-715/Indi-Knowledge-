/**
 * Credits and licences (docs/19-play-depth.md Phase 54).
 *
 * A legal requirement, not polish. The bundle embeds nine exact-subset Noto
 * faces, and the SIL Open Font License requires the copyright and licence
 * notice to travel with them — a single-file game has nowhere else to put it
 * than a page the player can open. The same page states where the record
 * comes from and how disputes are handled, because a game that shows its
 * working should also show its sources.
 */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * The full credits page.
 *
 * `fontManifest` is data/fonts/manifest.json; `build` is the colophon object
 * the bundler stamps (absent in dev — the page must still render).
 */
export function creditsHTML(fontManifest, build = null) {
  const fonts = Object.entries(fontManifest?.fonts ?? {});
  const fontRows = fonts.map(([script, info]) => {
    const files = (info.parts ?? []).map((p) => esc(p.file)).join(', ');
    return `<tr><td>${esc(info.family)}</td><td class="tiny">${files}</td>
      <td class="tiny">${((info.bytes ?? 0) / 1024).toFixed(1)} KB</td></tr>`;
  }).join('');

  return `<div class="credits">
  <h2>Credits &amp; licences</h2>

  <h3>Type</h3>
  <p class="tiny">The native place names are set in exact subsets of these faces,
  embedded in this file. Each is Copyright the Noto Project Authors
  (github.com/notofonts), licensed under the <b>SIL Open Font License,
  Version 1.1</b> (openfontlicense.org). The licence permits embedding and
  redistribution provided this notice travels with the fonts — this page is
  that notice.</p>
  <table class="credits-fonts"><tbody>${fontRows}</tbody></table>

  <h3>The record</h3>
  <p class="tiny">The timeline is drawn from the published scholarship: excavation
  reports and <i>Indian Archaeology — A Review</i> for the sites; the
  archaeometallurgy, archaeobotany and palaeoclimate literature for the
  transitions and the rivers; <i>Epigraphia Indica</i>, <i>South Indian
  Inscriptions</i> and <i>Epigraphia Carnatica</i> for the inscriptional
  record; and the standard literary histories for the works. Citations for
  every disputed event ship in the datapack (<code>sources.json</code>).</p>

  <h3>The method</h3>
  <p class="tiny"><b>The game presents the argument. It does not adjudicate
  it.</b> An event whose date is uncertain fires in a window, not on a year;
  an event scholarship genuinely divides over is latent — a campaign may or
  may not contain it — and its card shows the competing positions and who
  holds them. Nothing below 0.9 certainty is ever presented as a fixed date.</p>

  <h3>Colophon</h3>
  <p class="tiny colophon-line">${build
    ? `Paramountcy · build ${esc(build.commit)} · ${esc(build.date)} · datapack ${esc(build.datapack)}`
    : 'Paramountcy · development build (unstamped)'}</p>
  </div>`;
}
