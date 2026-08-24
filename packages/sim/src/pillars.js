/**
 * The pillars, as constraints (docs/12-buildplan-2.md §16).
 *
 * Eight gauges that only ever went up are decoration. A pillar earns its place
 * by stopping the player doing something, for a reason they can act on — and by
 * naming what would fix it.
 */
export const GATES = {
  'train-scribe':  { pillar: 'IT',          need: 8,
    why: 'Nobody here can write. Until the corpus has a written medium, everything is memory.' },
  'copy':          { pillar: 'IT',          need: 12,
    why: 'There is no material to copy onto and nobody trained to do it.' },
  'survey':        { pillar: 'IT',          need: 6,
    why: 'A survey has to be recorded or it is a rumour.' },
  'open-route':    { pillar: 'TRADE',       need: 5,
    why: 'You have nothing anyone beyond the next valley wants.' },
  'send-teacher':  { pillar: 'CULTIVATION', need: 14,
    why: 'You have nobody trained well enough to teach elsewhere.' },
  'raise-soldiers':{ pillar: 'STRUCTURE',   need: 4,
    why: 'There is no way to feed and house men who do not farm.' },
  'endow':         { pillar: 'CLASSICISM',  need: 6,
    why: 'Patronage needs somewhere for a scholar to work and a tradition to work in.' },
  'garrison':      { pillar: 'STRUCTURE',   need: 12,
    why: 'A garrison needs something built to garrison.' },
};

/** Trust-ladder rungs (docs/11-trade-network.md §2), gated by NETWORKING. */
export const TRUST_RUNGS = [
  { rung: 1, name: 'kin',            need: 0,  range: 'one valley' },
  { rung: 2, name: 'neighbour',      need: 8,  range: 'adjacent settlements' },
  { rung: 3, name: 'shared shrine',  need: 20, range: 'a region' },
  { rung: 4, name: 'marriage',       need: 34, range: 'between two houses' },
  { rung: 5, name: 'guild charter',  need: 52, range: 'across polities' },
  { rung: 6, name: 'state treaty',   need: 70, range: 'international' },
];

export function trustRung(state) {
  const n = state.pillars.NETWORKING;
  let cur = TRUST_RUNGS[0];
  for (const r of TRUST_RUNGS) if (n >= r.need) cur = r;
  return cur;
}

/** Next rung, and what it would take. */
export function nextRung(state) {
  const n = state.pillars.NETWORKING;
  return TRUST_RUNGS.find(r => n < r.need) ?? null;
}

/**
 * Can the player do this? If not, say why in terms they can act on.
 * Returns null when allowed, or { pillar, need, have, why }.
 */
export function blocked(state, action) {
  const g = GATES[action];
  if (!g) return null;
  const have = state.pillars[g.pillar] ?? 0;
  if (have >= g.need) return null;
  return { pillar: g.pillar, need: g.need, have: Math.round(have), why: g.why };
}

/** Everything currently locked, for the interface to show as a horizon. */
export function locked(state) {
  return Object.keys(GATES).map(a => ({ action: a, block: blocked(state, a) }))
    .filter(x => x.block);
}
