/**
 * The codex (phase 47): the world outside the clock.
 *
 * 1,382 events, 15 threads, 79 chapters, the corpus and the gazetteer,
 * readable without playing past them. Reference, not spoilers: an event
 * whose date is a window shows the window, a latent event says it may not
 * occur in a given campaign, and nothing here reveals a firing year —
 * the codex reads timeline.json exactly as the game does and knows no seed.
 *
 * Made entirely of the kit that exists: slips, rows, the thread view, the
 * cards. Every entry deep-links (data-goto opens the card, data-thread the
 * loom); the search covers titles, takeaways, card copy and native names.
 */

const fmt = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

const dateOf = (ev) => {
  if (ev.trigger === 'dated') return fmt(ev.year);
  if (ev.trigger === 'latent') {
    const [lo, hi] = ev.window ?? [ev.year, ev.year];
    return `${fmt(lo)}–${fmt(hi)} · may not occur`;
  }
  if (ev.trigger === 'conditional') return 'when the world allows';
  const [lo, hi] = ev.window ?? [ev.year, ev.year];
  return lo === hi ? `~${fmt(lo)}` : `~${fmt(lo)}–${fmt(hi)}`;
};

export function buildCodexIndex(timeline, cards, gazetteer) {
  const cardByMatch = cards.cards.map(c => ({ ...c, needle: c.match.toLowerCase() }));
  const rows = timeline.events.map(ev => {
    const t = ev.title.toLowerCase();
    const card = cardByMatch.find(c => t.includes(c.needle));
    const places = (ev.where ?? [])
      .map(k => gazetteer.places.find(p => p.id === k))
      .filter(Boolean);
    return {
      id: ev.id, ev, card,
      hay: [ev.title, ev.teaches ?? '', card?.what ?? '', card?.why ?? '',
        ...places.map(p => p.name), ...places.map(p => p.native ?? '')]
        .join(' ').toLowerCase(),
    };
  });
  return { rows, timeline, gazetteer };
}

export function searchCodex(idx, query, limit = 30) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return idx.rows.filter(r => r.hay.includes(q)).slice(0, limit).map(r => r.ev);
}

const evRow = (ev) => `<div class="thread-beat" data-goto="${ev.id}">
  <span class="tb-year">${dateOf(ev)}</span>
  <span class="tb-title">${ev.title}${ev.dispute ? ' ‡' : ''}</span></div>`;

export function codexHTML(idx, state = null) {
  const { timeline } = idx;
  const eras = timeline.eras.map(era => {
    const chapters = timeline.chapters.filter(c => c.era === era.id);
    return `<details class="cdx-era"><summary>${era.name}
        <span class="tiny muted">${fmt(era.from)}–${fmt(era.to)} · ${era.hours} h</span></summary>
      ${chapters.map(ch => {
        const evs = timeline.events.filter(e => e.chapter === ch.id);
        return `<details class="cdx-chapter"><summary>${ch.name}
            <span class="tiny muted">${evs.length}</span></summary>
          ${evs.map(evRow).join('')}</details>`;
      }).join('')}
    </details>`;
  }).join('');

  const threads = timeline.threads.map(t =>
    `<div class="thread-beat" data-thread="${t.id}">
       <span class="tb-title"><b>${t.name}</b> <span class="tiny muted">${t.arc.slice(0, 90)}…</span></span>
     </div>`).join('');

  const shelfNote = state
    ? 'This campaign’s shelf — what is held, and what has been lost.'
    : 'The full shelf. In a campaign, works can be lost — and rescued.';

  return `<div class="codex">
    <h3>The Codex</h3>
    <p class="chron-sub">Reference, not spoilers: dates with a ~ are windows, and a
      latent entry may not occur in a given campaign.</p>
    <input class="cdx-search" type="search" data-codex-search
      placeholder="Search — try “lot”, “zero”, or உத்தரமேரூர்" aria-label="Search the codex">
    <div data-codex-results></div>
    <details open class="cdx-era"><summary>The sixteen eras</summary>${eras}</details>
    <details class="cdx-era"><summary>The fifteen threads</summary>${threads}</details>
    <details class="cdx-era"><summary>The corpus shelf <span class="tiny muted">${shelfNote}</span></summary>
      <div data-codex-shelf></div></details>
  </div>`;
}

export function shelfHTML(works, state = null) {
  return works.works.map(w => {
    let status = '';
    if (state) {
      const c = state.corpus.get(w.id);
      status = !c ? '' : c.lost ? ` <span class="cdx-lost">lost ${fmt(c.lostYear)}</span>`
        : !c.exists ? ' <span class="tiny muted">not yet composed</span>'
        : ` <span class="tiny muted">${c.carriers.length} carrier${c.carriers.length === 1 ? '' : 's'}</span>`;
    }
    return `<div class="chron-line"><span class="tb-year">${w.composed_from < 0
      ? fmt(w.composed_from) : fmt(w.composed_from)}</span>
      <span>${w.title}${status}</span></div>`;
  }).join('');
}

export function resultsHTML(events) {
  if (!events.length) return '<p class="tiny muted">Nothing found. The record, such as it is.</p>';
  return events.map(evRow).join('');
}
