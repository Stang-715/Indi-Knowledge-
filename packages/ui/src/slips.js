/**
 * The teaching slips (phase 48): the ledger teaches, diegetically.
 *
 * Each slip is one sentence in the game's own register, keyed to the FIRST
 * occurrence of a world condition — never a tour, never a second showing.
 * The worked test for the voice: read a slip aloud next to a card and hear
 * no seam. All slips off reproduces yesterday's game exactly.
 */

export const SLIPS = [
  { id: 'first-surplus',
    when: (s) => s.grain > 550 && s.pops.reciters < 8,
    text: 'The granary holds more than the winter needs. Someone could be fed to remember things — that is what Patronise does.' },
  { id: 'first-at-risk',
    when: (s, x) => x.atRisk > 0,
    text: 'A work on your shelf exists in one place only. One fire, one flood, one bad monsoon of worm — the risk panel lists the twelve most fragile.' },
  { id: 'first-writing',
    when: (s) => s.pillars.IT >= 8,
    text: 'Writing is within reach. A scribe costs grain and makes copies that outlive their copyist — memory does not.' },
  { id: 'first-route',
    when: (s) => s.routes.size > 0,
    text: 'The road is open. Goods take days; payment takes longer; and a road nobody guards belongs to whoever walks it — set its standing orders once and it will obey them for a century.' },
  { id: 'first-choke',
    when: (s) => [...s.routes.values()].some(r => r.choke),
    text: 'Something is sitting on your road. Pay it, fight it, go around it, or wait it out — but a choked road earns nothing while you decide.' },
  { id: 'first-frontier',
    when: (s, x) => x.frontierHere > 0,
    text: 'People are living on your treeline who were here before your fields. They know things your villages do not. Learn and Clear both stay on the ledger for ever.' },
  { id: 'first-coin',
    when: (s) => s.coinageKnown,
    text: 'Money. Value stops being heavy and payment stops taking a season — watch what it does to the settlement half of every trade.' },
  { id: 'first-era-turn',
    when: (s, x) => x.eraTurned,
    text: 'The table has changed under the map — a new era runs by new rules. The codex says what this one rewards.' },
  { id: 'first-teacher-ready',
    when: (s) => s.pillars.CULTIVATION >= 14,
    text: 'You could send a teacher abroad now. A copy in Tibet survives a fire in Nalanda; that trade is the whole game.' },
  { id: 'first-loss',
    when: (s, x) => x.losses > 0,
    text: 'A work is gone — not burned, most likely, just never recopied. The chronicle will remember that it happened on your watch.' },
];

export function makeSlipTracker() {
  const shown = new Set();
  return {
    shown,
    /** The next slip that has newly become true, or null. One at a time. */
    next(state, extras) {
      for (const slip of SLIPS) {
        if (shown.has(slip.id)) continue;
        if (slip.when(state, extras)) { shown.add(slip.id); return slip; }
      }
      return null;
    },
  };
}
