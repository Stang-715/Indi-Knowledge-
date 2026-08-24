/**
 * Named people (docs/12-buildplan-2.md Phase 14).
 *
 * The largest gap in the first build was that the world had no people in it.
 * Patronage was `grain -= 50; reciters += 1`, which is a statistic, not a
 * decision about anybody.
 *
 * Three things this module adds, in order of how much they matter:
 *
 *   1. **Schools, not counts.** A work held orally is held by a named group of
 *      people who recite it and teach it. If the last member of a shakha dies
 *      without students, the work's oral carrier dies with them — even though a
 *      manuscript of the same text may sit intact in the next room. That is
 *      what happened to most of the Vedic shakhas, and it is the single most
 *      important thing this file models.
 *
 *   2. **Named patronage that compounds.** Endow Panini and the ledger will
 *      still be telling you, two thousand years later, what that endowment is
 *      paying — because prestige flows backward along derivation edges and
 *      every grammarian after Patanjali is downstream of him.
 *
 *   3. **Honest provenance.** SOURCED people are named in the record. SYNTHESIZED
 *      people are generated to fill a count the record gives without names — the
 *      Thanjavur inscription really does settle 400 temple women, and really
 *      does not hand us 400 usable biographies. The interface must never blur
 *      the two.
 */
import { record, bumpPillar } from './state.js';
import { generateName } from '../../worldgen/src/names.js';
import { drawFrom } from './rng.js';

/** How many works one person can hold in living memory. */
const WORKS_PER_RECITER = 3;

/** How long a generated person lives, before infant mortality is applied. */
const LIFESPAN = [46, 74];

export function initPeople(state, datapack, fromYear) {
  state.people = new Map();
  state.schools = new Map();
  state.endowments = [];

  for (const p of datapack.people?.people ?? []) {
    state.people.set(p.id, {
      ...p,
      from: p.floruit[0], to: p.floruit[1],
      alive: false, patronised: false, patronisedAt: null,
      students: [], produced: [], returned: 0,
    });
  }
  state.cohorts = datapack.people?.cohorts ?? [];
}

/** Everyone alive in a given year. */
export function living(state, year = state.year) {
  const out = [];
  for (const p of state.people.values())
    if (year >= p.from && year <= p.to) out.push(p);
  return out;
}

export function tickPeople(state, span, rng, datapack) {
  const year = state.year;

  // 1. Arrivals and departures.
  for (const p of state.people.values()) {
    const shouldLive = year >= p.from && year <= p.to;
    if (shouldLive && !p.alive) {
      p.alive = true;
      if (p.role !== 'ruler' && (p.certainty ?? 0) > 0.55)
        record(state, year, 'person', `${p.name} is at work.`, { person: p.id, role: p.role });
    } else if (!shouldLive && p.alive) {
      p.alive = false;
      if (p.patronised)
        record(state, year, 'person', `${p.name} dies. What they built does not.`,
          { person: p.id, role: p.role });
      onDeath(state, p, year);
    }
  }

  // 2. Cohorts. Where the record gives a count and no names, generate the count.
  //    This is the constraint-fitting rule from docs/02-data-spine.md §2 applied
  //    to people: synthesized children must sum to the sourced parent.
  for (const c of state.cohorts) {
    if (year < c.from || state.schools.has(c.id)) continue;
    const members = [];
    for (let i = 0; i < Math.min(c.count, 64); i++) {   // sample, not roster
      const { name, gender } = generateName(state.seed, `${c.id}/${i}`,
        { region: c.region, gender: c.gender ?? null, role: c.role });
      members.push({ id: `${c.id}#${i}`, name, gender, role: c.role,
                     provenance: c.member_provenance ?? 'SYNTHESIZED' });
    }
    state.schools.set(c.id, {
      id: c.id, name: c.name, kind: 'cohort', region: c.region,
      founded: year, members, sampled: members.length, count: c.count,
      provenance: c.provenance, works: [],
    });
    record(state, year, 'cohort',
      `${c.name}: ${c.count} people, named in the record as a body.`, { cohort: c.id });
  }

  // 3. Schools of transmission. Every reciter you keep belongs to one, and a
  //    school is what actually holds an oral work.
  reconcileSchools(state, rng);

  // 4. Endowments pay out.
  //
  //    An earlier version paid only while the named students were alive, so
  //    endowing Panini stopped returning ninety years later when Patanjali
  //    died — which gets the whole point backwards. Foundational investment
  //    compounds because the WORKS go on being built on, not because the people
  //    go on breathing. So an endowment draws from two streams:
  //
  //      the living line — students, and their students, while they work
  //      the derived corpus — every surviving work descended from theirs,
  //                           for as long as any of them survives
  //
  //    The second is why the ledger can still be reporting a return on a
  //    fourth-century-BCE grammarian in 1200 CE. It is also why the return
  //    stops if you let the corpus rot: the line is dead either way, but a
  //    dead line whose books survive keeps paying and one whose books do not
  //    stops. That asymmetry is the argument the whole game is making.
  for (const e of state.endowments) {
    const p = state.people.get(e.person);
    if (!p) continue;
    e.age += span;                                    // always: the ledger remembers

    const heirs = descendants(state, p.id);
    const activeLine = (p.alive ? 1 : 0) + heirs.filter(h => h.alive).length;

    // What survives downstream of this person's works.
    let downstream = 0;
    for (const wid of worksOf(state, p)) {
      const w = state.corpus.get(wid);
      if (!w || w.lost) continue;
      downstream += 1 + w.prestige * 0.02;
    }
    e.downstream = downstream;

    const yield_ = span * (activeLine * 0.05 + downstream * 0.03);
    if (yield_ <= 0) continue;
    e.returned += yield_;
    p.returned += yield_;
    for (const pillar of pillarsFor(p.role)) bumpPillar(state, pillar, yield_ * 0.12);
  }
}

/**
 * Keep the schools in step with the reciters you are feeding.
 *
 * A school is a named lineage. Feeding reciters creates or grows one; letting
 * them starve shrinks it; when a school reaches zero members it does not merely
 * get smaller — it ends, and the works only it held go with it.
 */
function reconcileSchools(state, rng) {
  const year = state.year;
  const lineages = [...state.schools.values()].filter(s => s.kind === 'lineage');
  const held = lineages.reduce((n, s) => n + s.members.length, 0);
  const want = state.pops.reciters;

  if (want > held) {
    let need = want - held;
    // Prefer to grow an existing school — a tradition recruits before it splits.
    for (const s of lineages) {
      while (need > 0 && s.members.length < 9) {
        s.members.push(newMember(state, s, s.members.length));
        need--;
      }
      if (need === 0) break;
    }
    while (need > 0) {
      const id = `SCH.${year < 0 ? 'M' : ''}${Math.abs(year)}.${state.schools.size}`;
      const region = state.homeRegion ?? 'RGN.TAMILAKAM';
      const { name } = generateName(state.seed, `${id}/founder`, { region, role: 'scholar' });
      const s = { id, name: `the school of ${name}`, kind: 'lineage', region,
                  founded: year, members: [], works: [], provenance: 'SYNTHESIZED' };
      s.members.push(newMember(state, s, 0));
      state.schools.set(id, s);
      record(state, year, 'school', `${s.name} is founded.`, { school: id });
      need--;
    }
  } else if (want < held) {
    let lose = held - want;
    // Losses fall on the smallest schools first: a big tradition absorbs a bad
    // generation, a one-teacher lineage does not.
    const order = lineages.slice().sort((a, b) => a.members.length - b.members.length);
    for (const s of order) {
      while (lose > 0 && s.members.length > 0) { s.members.pop(); lose--; }
      if (s.members.length === 0) {
        state.schools.delete(s.id);
        state.stats.schoolsLost = (state.stats.schoolsLost ?? 0) + 1;
        record(state, year, 'school',
          `${s.name} ends. ${s.works.length
            ? `It was the last to recite ${s.works.length} work${s.works.length > 1 ? 's' : ''}.`
            : 'It held nothing nobody else held.'}`,
          { school: s.id, works: s.works.slice() });
      }
      if (lose === 0) break;
    }
  }
}

function newMember(state, school, i) {
  const key = `${school.id}/m${i}/${state.year}`;
  const { name, gender } = generateName(state.seed, key,
    { region: school.region, role: 'scholar' });
  return { id: key, name, gender, role: 'reciter', provenance: 'SYNTHESIZED',
           joined: state.year };
}

/** Total oral capacity: how many works the living schools can hold between them. */
export function oralCapacity(state) {
  let n = 0;
  for (const s of state.schools.values()) {
    if (s.kind === 'lineage') n += s.members.length * WORKS_PER_RECITER;
    else n += Math.min(s.count, 40) * 0.15;      // a cohort holds its own repertoire
  }
  return Math.floor(n);
}

/**
 * The works a person is responsible for, plus everything derived from them.
 *
 * A person's endowment reaches as far as their influence does, and influence in
 * this model is the derivation graph.
 */
function worksOf(state, p, depth = 0, seen = new Set()) {
  const out = [];
  for (const wid of p.works ?? []) collect(wid);
  function collect(wid) {
    if (seen.has(wid)) return;
    seen.add(wid);
    out.push(wid);
    if (depth > 6) return;
    for (const c of state.corpus.values())
      if ((c.derivesFrom ?? []).includes(wid)) collect(c.id);
  }
  return out;
}

/** Which pillars a role feeds. */
function pillarsFor(role) {
  switch (role) {
    case 'scholar':   return ['CLASSICISM', 'IT'];
    case 'poet':      return ['CLASSICISM', 'DESIGN'];
    case 'saint':     return ['NETWORKING', 'CULTIVATION'];
    case 'architect': return ['STRUCTURE', 'DESIGN'];
    case 'performer': return ['DESIGN', 'CULTIVATION'];
    case 'official':  return ['NETWORKING', 'TRADE'];
    case 'traveller': return ['NETWORKING', 'IT'];
    case 'merchant':  return ['TRADE'];
    case 'ruler':     return ['STRUCTURE'];
    default:          return ['CULTIVATION'];
  }
}

function onDeath(state, p, year) {
  // A teacher's students carry the tradition. Without students it stops here.
  const kids = descendants(state, p.id).filter(k => k.alive);
  if (p.patronised && kids.length === 0)
    record(state, year, 'lineage',
      `${p.name} leaves no student. The line ends.`, { person: p.id });
}

/** Everyone who names this person as teacher, transitively. */
export function descendants(state, id, seen = new Set()) {
  const out = [];
  for (const p of state.people.values()) {
    if (p.teacher !== id || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p, ...descendants(state, p.id, seen));
  }
  return out;
}

/** The chain of teachers above a person. */
export function lineageOf(state, id) {
  const chain = [];
  let cur = state.people.get(id);
  const guard = new Set();
  while (cur?.teacher && !guard.has(cur.teacher)) {
    guard.add(cur.teacher);
    cur = state.people.get(cur.teacher);
    if (cur) chain.push(cur);
  }
  return chain;
}

/* ── Decisions ──────────────────────────────────────────────────────────── */

/**
 * Endow a named person.
 *
 * Unlike feeding an anonymous reciter, this is an investment in a line. It pays
 * while that person works, and it goes on paying through their students, and
 * their students' students, for as long as the lineage produces.
 */
export function endow(state, personId, year) {
  const p = state.people.get(personId);
  if (!p || !p.alive || p.patronised) return false;
  const cost = p.role === 'architect' ? 260 : 160;
  if (state.grain < cost) return false;

  state.grain -= cost;
  p.patronised = true;
  p.patronisedAt = year;
  state.endowments.push({ person: personId, at: year, age: 0, returned: 0 });
  state.stats.endowments = (state.stats.endowments ?? 0) + 1;

  for (const pillar of pillarsFor(p.role)) bumpPillar(state, pillar, 3);
  record(state, year, 'endow', `${p.name} is taken into your keeping.`,
    { person: personId, role: p.role });
  return true;
}

/** People you could endow right now. */
export function endowable(state) {
  const out = [];
  for (const p of state.people.values()) {
    if (!p.alive || p.patronised || p.role === 'ruler') continue;
    out.push(p);
  }
  // The best-attested first: a player should meet the people the record actually
  // names before the ones it merely implies.
  return out.sort((a, b) => (b.certainty ?? 0) - (a.certainty ?? 0));
}

/** What an endowment has returned since it was made. */
export function endowmentLedger(state) {
  return state.endowments.map(e => {
    const p = state.people.get(e.person);
    const heirs = descendants(state, e.person);
    return {
      person: e.person, name: p?.name ?? e.person,
      since: e.at, years: e.age,
      returned: e.returned,
      heirs: heirs.length,
      aliveHeirs: heirs.filter(h => h.alive).length,
      downstream: e.downstream ?? 0,
      stillPaying: ((p?.alive ? 1 : 0) + heirs.filter(h => h.alive).length + (e.downstream ?? 0)) > 0,
    };
  }).sort((a, b) => b.returned - a.returned);
}

export const DECISIONS = {
  'endow'(state, d) { endow(state, d.person, d.year); },
};
