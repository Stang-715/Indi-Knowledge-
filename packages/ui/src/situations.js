/**
 * The situations engine (docs/21-hud.md Phase 4).
 *
 * One derivation, three tiers, no memory of its own: everything is computed
 * from the state each call, so scrubbing backwards shows the situations of
 * THAT year, and two calls on the same state agree exactly. Dismissal is a
 * player preference, so it lives in the client, never here.
 *
 * Tier discipline (the census's hardest lesson, adopted before launch):
 *   red    loss is imminent and irreversible — a work at its last carrier,
 *          a town at the leaving threshold, an empty granary, a dead route.
 *   amber  a window is closing or a standing problem waits on a decision —
 *          a choked road, a bounded delay still available, capped trust.
 *   feed   the m-tier. Texture is never louder than a line.
 */

import { worksAtRisk } from '../../sim/src/corpus.js';

/** Every situation for this state, most urgent first. Deterministic. */
export function deriveSituations(state, dp = null) {
  const out = [];
  const push = (tier, kind, id, text, target = null) =>
    out.push({ tier, kind, id, text, target });

  // ── red: the irreversible ────────────────────────────────────────────────
  if (state.grain < 100)
    push('red', 'grain', 'grain-empty',
      'The granary is nearly empty. Below 100 grain nothing else can be paid for.');

  const risk = worksAtRisk(state, 'home');
  const last = risk.filter(w => w.carriers <= 1);
  if (last.length > 5) {
    // When fragility is universal — every early campaign opens this way —
    // naming three arbitrary works is false specificity. One situation,
    // stated at its true scale.
    push('red', 'work', 'last-all',
      `${last.length} works each have a single carrier. The shelf is one fever from silence; copies and teachers are the answer.`);
  } else {
    for (const w of last.slice(0, 3))
      push('red', 'work', `last-${w.id}`,
        `${w.title} is down to its last carrier.`, w.id);
    if (last.length > 3)
      push('red', 'work', 'last-more',
        `…and ${last.length - 3} more works are each one death from silence.`);
  }

  if (state.indus && state.year >= -2600 && state.year <= -1900) {
    for (const t of state.indus.values()) {
      if (!t.standing || t.people <= 0) continue;
      if (t.water <= 0.32)
        push('red', 'town', `leaving-${t.id}`,
          `${t.name} is at the leaving threshold. What its people carry is still yours to choose.`, t.id);
    }
  }

  for (const r of state.routes.values())
    if (!r.open && !r.choke)
      push('red', 'route', `dead-${r.id}`, `The ${r.id} route has closed.`, r.id);

  // ── amber: the decidable ─────────────────────────────────────────────────
  for (const r of state.routes.values())
    if (r.choke)
      push('amber', 'route', `choke-${r.id}`,
        `The ${r.id} road is ${r.choke.kind === 'toll' ? 'tolled' : 'blocked'} — a ${r.choke.kind}. Your standing policy decides, or you do.`, r.id);

  if (state.indus && state.year >= -2600 && state.year <= -1900) {
    const drying = [...state.indus.values()]
      .filter(t => t.standing && t.people > 0 && t.water > 0.32 && t.water < 0.5 && t.wells < 3);
    if (drying.length > 2) {
      // The drying hits the whole plain at once; a row per town is a flood.
      push('amber', 'town', 'wells-many',
        `${drying.length} towns are drying and can still dig wells. Triage is the era's verb.`);
    } else {
      for (const t of drying)
        push('amber', 'town', `wells-${t.id}`,
          `${t.name} is drying; ${3 - t.wells} well(s) can still be dug there.`, t.id);
    }
  }

  const activeOcc = state.occupationsActive?.size ?? 0;
  if (activeOcc && dp) {
    for (const id of state.occupationsActive) {
      const o = (dp.occupations?.occupations ?? []).find(x => x.id === id);
      if (o?.trustCap != null && state.pillars.NETWORKING > o.trustCap)
        push('amber', 'trust', `cap-${id}`,
          `${o.name} caps trust at ${o.trustCap}; what you build above it does not hold.`, id);
    }
  }

  const thinLines = [...(state.schools?.values() ?? [])]
    .filter(sc => sc.members.length === 1 && sc.works.length > 0);
  if (thinLines.length > 2) {
    push('amber', 'lineage', 'lineage-many',
      `${thinLines.length} school lines are each down to one keeper.`);
  } else {
    for (const sc of thinLines)
      push('amber', 'lineage', `lineage-${sc.id}`,
        `The ${sc.name} line is down to one keeper, holding ${sc.works.length} work(s).`, sc.id);
  }

  // ── feed: the texture, last few lines only ───────────────────────────────
  const texture = state.log.filter(l => l.kind === 'texture').slice(-3);
  for (const [i, l] of texture.entries())
    push('feed', 'texture', `tex-${l.year}-${i}`, l.text);

  const order = { red: 0, amber: 1, feed: 2 };
  return out.sort((a, b) => order[a.tier] - order[b.tier]);
}

/** The badge: how many, and the loudest tier (null when quiet). */
export function situationBadge(situations) {
  const loud = situations.filter(s => s.tier !== 'feed');
  return { count: loud.length, tier: loud.some(s => s.tier === 'red') ? 'red' : loud.length ? 'amber' : null };
}
