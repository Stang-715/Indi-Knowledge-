/**
 * The chronicle (phase 46): your campaign as a written history.
 *
 * The Ahoms kept history as a department of state; the game does too. The
 * campaign log is already a complete annal — this composes it into a book,
 * era by era: the turning points, every decision, the losses, a taste of the
 * ordinary years. Selection, not transcription: two thousand log lines make
 * a ledger, not a chronicle, so each era keeps its weightiest lines and lets
 * a texture incident or two stand for all the quiet ones.
 *
 * Derived purely from state (which is derived purely from seed + decisions),
 * so sharing a save URL IS sharing the chronicle.
 */
import { drawFrom } from '../../sim/src/rng.js';

const fmt = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

/** What always makes the book, in rank order. */
const ALWAYS = new Set(['epoch', 'decision', 'catastrophe', 'preserve', 'loss',
  'famine', 'mission', 'encounter', 'indus', 'occupation', 'teacher']);

export function composeChronicle(state, timeline, { texturePerEra = 2 } = {}) {
  const eras = timeline.eras.filter(e => e.from < state.year);
  const pages = [];

  for (const era of eras) {
    const to = Math.min(era.to, state.year);
    const lines = state.log.filter(l => l.year >= era.from && l.year < to);
    if (!lines.length) continue;

    const kept = lines.filter(l => ALWAYS.has(l.kind));
    // The quiet years, represented: a deterministic sample of texture lines,
    // so the book remembers that most years were ordinary.
    const texture = lines.filter(l => l.kind === 'texture');
    const sample = [];
    for (let i = 0; i < Math.min(texturePerEra, texture.length); i++) {
      const u = drawFrom(state.seed ?? 'x', 'chronicle', era.id, i);
      const pick = texture[Math.floor(u * texture.length)];
      if (!sample.includes(pick)) sample.push(pick);
    }
    const entries = [...kept, ...sample].sort((a, b) => a.year - b.year);

    // W-magnitude world events fired in this era, from their own log lines.
    pages.push({
      era: era.id, name: era.name,
      span: `${fmt(era.from)} — ${fmt(to)}`,
      entries: entries.map(l => ({ year: l.year, kind: l.kind, text: l.text })),
      counts: {
        decisions: lines.filter(l => l.kind === 'decision').length,
        losses: lines.filter(l => l.kind === 'loss').length,
        quiet: texture.length,
      },
    });
  }

  return {
    title: 'The Chronicle of this Campaign',
    seed: state.seed,
    through: fmt(state.year),
    pages,
  };
}

export function chronicleHTML(book) {
  return `<div class="chronicle">
    <h3>${book.title}</h3>
    <p class="chron-sub">kept to ${book.through} · seed “${book.seed}” —
      the same seed and the same decisions write the same book</p>
    ${book.pages.map(p => `
      <section class="chron-era">
        <h4>${p.name} <span class="tiny muted">${p.span}</span></h4>
        <p class="tiny muted">${p.counts.decisions} decision${p.counts.decisions === 1 ? '' : 's'}
          · ${p.counts.losses} work${p.counts.losses === 1 ? '' : 's'} lost
          · ${p.counts.quiet} quiet notice${p.counts.quiet === 1 ? '' : 's'}, of which a taste:</p>
        ${p.entries.map(e => `<div class="chron-line chron-${e.kind}">
          <span class="tb-year">${fmt(e.year)}</span><span>${e.text}</span></div>`).join('')}
      </section>`).join('')}
    <button class="btn" data-chron-copy>Copy the chronicle as text</button>
  </div>`;
}

export function chronicleText(book) {
  const out = [book.title.toUpperCase(), `kept to ${book.through} · seed "${book.seed}"`, ''];
  for (const p of book.pages) {
    out.push(`== ${p.name} (${p.span}) ==`);
    for (const e of p.entries) out.push(`  ${fmt(e.year).padStart(9)}  ${e.text}`);
    out.push('');
  }
  return out.join('\n');
}
