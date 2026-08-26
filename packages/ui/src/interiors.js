/**
 * The interiors (phase 50): three rooms inside Thanjavur, each a composed
 * panel over live sim state — never a second simulation. The scriptorium
 * shows what is actually being copied this decade; the treasury shows the
 * endowments actually paying; the assembly draws its committee by lot the
 * way Uttaramerur's wall says to, deterministically per year, so the same
 * campaign always seats the same names.
 *
 * A work lost yesterday is missing from the desks today — that is the test.
 */
import { drawFrom } from '../../sim/src/rng.js';
import { worksAtRisk, corpusSummary } from '../../sim/src/corpus.js';
import { endowmentLedger } from '../../sim/src/people.js';

const fmt = (y) => y < 0 ? `${-y} BCE` : `${y} CE`;

/** What is on the desks: extant works with a home carrier and the fewest
 *  written copies — exactly what a working scriptorium would prioritise. */
export function scriptoriumModel(state) {
  const desks = [];
  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    if (!c.carriers.some(x => x.place === 'home')) continue;
    const written = c.carriers.filter(x => x.medium !== 'memory').length;
    if (written >= 3) continue;
    desks.push({ id: c.id, title: c.title, written, carriers: c.carriers.length });
  }
  desks.sort((a, b) => (a.written - b.written) || (a.carriers - b.carriers));
  return {
    scribes: state.pops.scribes,
    medium: state.goods.has('paper') ? 'paper' : 'palm leaf',
    desks: desks.slice(0, 6),
    summary: corpusSummary(state),
  };
}

/** The committee, drawn by lot: names on palm-leaf tickets, from a pot,
 *  re-drawn each year, term limits by construction. */
export function assemblyModel(state, seats = 5) {
  const pool = [...state.people.values()].filter(p => p.alive);
  const names = pool.length ? pool.map(p => p.name)
    : ['the tank supervisor', 'the garden warden', 'the gold assayer',
       'the justice recorder', 'the famine steward'];
  const seated = [];
  const taken = new Set();
  for (let i = 0; i < Math.min(seats, names.length); i++) {
    let k = Math.floor(drawFrom(state.seed ?? 'x', 'variyam', state.year, i) * names.length);
    while (taken.has(k)) k = (k + 1) % names.length;
    taken.add(k);
    seated.push(names[k]);
  }
  return { year: state.year, seated,
    note: 'Eligibility rules, term limits, disqualification for unaudited accounts — cut in stone because it was ordinary.' };
}

export function treasuryModel(state) {
  return {
    grain: Math.round(state.grain),
    coin: Math.round(state.coin),
    coinage: state.coinageKnown,
    endowments: endowmentLedger(state).slice(0, 8),
  };
}

export function interiorHTML(kind, state) {
  if (kind === 'scriptorium') {
    const m = scriptoriumModel(state);
    return `<div class="codex interior"><h3>The Scriptorium</h3>
      <p class="chron-sub">${m.scribes} scribe${m.scribes === 1 ? '' : 's'} at work on ${m.medium}
        · ${m.summary.extant} works extant, ${m.summary.atRisk} in one place only</p>
      ${m.desks.length ? m.desks.map(d => `<div class="chron-line">
          <span class="tb-year">${d.written} written</span>
          <span>${d.title} <span class="tiny muted">· ${d.carriers} carrier${d.carriers === 1 ? '' : 's'}</span></span>
        </div>`).join('')
        : '<p class="tiny muted">The desks are clear. Either everything is safe, or nothing is left to copy.</p>'}
    </div>`;
  }
  if (kind === 'assembly') {
    const m = assemblyModel(state);
    return `<div class="codex interior"><h3>The Assembly</h3>
      <p class="chron-sub">The variyam of ${fmt(m.year)}, drawn by lot — names on palm leaf, from a pot.</p>
      ${m.seated.map(n => `<div class="chron-line"><span class="tb-year">seated</span><span>${n}</span></div>`).join('')}
      <p class="tiny muted">${m.note}</p>
    </div>`;
  }
  const m = treasuryModel(state);
  return `<div class="codex interior"><h3>The Treasury</h3>
    <p class="chron-sub">${m.grain} grain${m.coinage ? ` · ${m.coin} coin` : ' · value is still heavy'}</p>
    ${m.endowments.length ? m.endowments.map(e => `<div class="chron-line">
        <span class="tb-year">${fmt(e.since)}</span>
        <span>${e.name} — returned ${Math.round(e.returned)}
          <span class="tiny muted">· ${e.stillPaying ? 'still paying' : 'exhausted'}</span></span>
      </div>`).join('')
      : '<p class="tiny muted">No endowments yet. The temple lends nothing it has not been given.</p>'}
  </div>`;
}
