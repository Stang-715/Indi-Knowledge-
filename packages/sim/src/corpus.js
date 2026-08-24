/**
 * The knowledge economy — the core system (docs/05-knowledge-economy.md).
 *
 * Works are goods with unusual physics. They are non-rival, they are excludable
 * only by forgetting, and they perish. Three rules govern everything here:
 *
 *   1. A work is NEVER removed from the game. It is only ever reduced to zero
 *      surviving carriers, and it stays in the ledger forever — greyed, with its
 *      title, author, and the year it was lost.
 *   2. Knowledge has upkeep, not research. Palm leaf lasts ~300 years, so the
 *      corpus is maintained infrastructure. Neglect kills more works than every
 *      invasion combined, which is true, and is the quietest lesson here.
 *   3. Prestige flows backward along derivation edges. Patronise Panini and you
 *      are still collecting through every grammarian after Patanjali.
 */
import { record, bumpPillar } from './state.js';
import { oralCapacity } from './people.js';

/** Below this fraction of integrity a carrier is unreadable, so it is gone. */
export const CARRIER_DEATH = 0.2;

/** Carrier half-lives, in years. The physics of remembering. */
export const MEDIA = {
  memory:     { half: 35,   label: 'a reciter',        fragile: true  },
  palmleaf:   { half: 300,  label: 'a palm-leaf copy', fragile: false },
  birchbark:  { half: 420,  label: 'a birch-bark roll',fragile: false },
  copper:     { half: 3000, label: 'a copper plate',   fragile: false },
  stone:      { half: 6000, label: 'an inscription',   fragile: false },
  paper:      { half: 700,  label: 'a paper copy',     fragile: false },
};

/** Where a carrier sits. Distance is redundancy — that is the whole point. */
export const PLACES = ['home', 'south', 'tibet', 'lanka', 'china', 'abroad'];

/**
 * Destinations with institutions of their own, which maintain what they receive.
 * `abroad` and `south` are deliberately not on this list: a copy left with a
 * merchant is out of the fire but nobody is recopying it.
 */
export const FOSTERING = new Set(['tibet', 'lanka', 'china']);

export function initCorpus(state, datapack, fromYear) {
  for (const w of datapack.works.works) {
    state.corpus.set(w.id, {
      id: w.id,
      title: w.title,
      author: w.attributed_to,
      composedFrom: w.composed_from,
      composedTo: w.composed_to,
      derivesFrom: w.derives_from ?? [],
      pillars: w.pillars ?? [],
      transmission: w.transmission,
      /** @type {{medium:string, place:string, born:number, health:number}[]} */
      carriers: [],
      exists: false,        // has it been composed yet?
      lost: false,
      lostYear: null,
      prestige: 0,
    });
  }
  // Anything already composed before the campaign window opens starts extant.
  for (const c of state.corpus.values()) {
    if (c.composedFrom !== null && c.composedFrom <= fromYear) compose(state, c, fromYear);
  }
}

function compose(state, c, year) {
  if (c.exists) return;
  c.exists = true;
  // A new work begins as memory only. Nothing is written down at first — for
  // three thousand years of this game, nothing CAN be.
  c.carriers.push({ medium: 'memory', place: 'home', born: year, health: 1 });
}

/**
 * The standing upkeep. This is the system that actually kills the corpus.
 *
 * The key correction over a naive decay model: an oral tradition is not passively
 * remembered, it is *actively maintained*. That is what reciters do, and it is why
 * the Rigveda crossed three thousand years with no writing at all — the padapatha
 * and kramapatha schemes are error-correcting codes, and the shakha system is
 * replication. So living reciters REFRESH the works in their repertoire.
 *
 * The constraint is capacity. A body of reciters can hold only so many works in
 * living memory. Everything past that line decays, and the only escape is to
 * write it down — which is why the arrival of writing is an event the corpus
 * feels, not a tech unlock.
 */
export function tickCorpus(state, span, rng, datapack) {
  const year = state.year;

  // 1. Works whose composition window has arrived enter the world.
  for (const c of state.corpus.values()) {
    if (!c.exists && !c.lost && c.composedFrom !== null && c.composedFrom <= year) {
      compose(state, c, year);
      record(state, year, 'compose', `${c.title} is composed.`, { work: c.id });
    }
  }

  // 2. Work out what is being actively maintained, and by whom.
  //    Reciters hold oral works; scribes recopy manuscripts before they rot.
  //    Both are capacity-limited, and both are paid in grain.
  // Oral capacity is not a headcount, it is the sum of what the living schools
  // can hold between them. The distinction matters: reciters without a school
  // hold nothing, and a school that loses its last member takes its repertoire
  // with it whether or not anybody else is still being fed.
  const oralCap = oralCapacity(state);
  const scribalCapacity = Math.floor(state.pops.scribes * 4);

  const living = [...state.corpus.values()].filter(c => c.exists && !c.lost);
  // Priority is prestige, then age. A community keeps what it values, and what it
  // has kept longest — not a random subset.
  const byPriority = living.slice().sort((a, b) =>
    (b.prestige - a.prestige) || (a.composedFrom ?? 0) - (b.composedFrom ?? 0) || a.id.localeCompare(b.id));

  const oralKept = new Set(byPriority.filter(c => c.carriers.some(x => x.medium === 'memory'))
    .slice(0, oralCap).map(c => c.id));
  const scribalKept = new Set(byPriority.filter(c => c.carriers.some(x => x.medium !== 'memory'))
    .slice(0, scribalCapacity).map(c => c.id));

  // 3. Carriers decay — or are renewed, if someone is doing the work.
  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    for (const carrier of c.carriers) {
      const m = MEDIA[carrier.medium] ?? MEDIA.palmleaf;

      if (carrier.medium === 'memory') {
        if (oralKept.has(c.id)) { carrier.health = 1; continue; }   // recited, so kept
        // Outside the repertoire, memory goes fast. One generation, roughly.
        carrier.health *= Math.pow(0.5, span / m.half);
      } else if (carrier.place === 'home') {
        // A copy in the same town as a working scriptorium gets recopied.
        if (scribalKept.has(c.id)) { carrier.health = 1; continue; }
        carrier.health *= Math.pow(0.5, span / m.half);
      } else {
        // A copy that reached a foreign institution is maintained BY that
        // institution. This is not generosity in the model, it is what happened:
        // the Abhidharmakosha survives because Tibetan monasteries went on
        // copying it for a thousand years after the Indian ones were ash.
        //
        // It is the whole return on the missionary vector. A teacher does not
        // just carry a text out of reach of the fire — they leave it somewhere
        // that will keep it without you.
        if (FOSTERING.has(carrier.place)) { carrier.health = 1; continue; }
        carrier.health *= Math.pow(0.5, span / m.half);
      }
    }
    // A carrier below a fifth of its integrity is gone. A threshold rather than
    // zero, because a manuscript too rotted to read is not a surviving copy —
    // and at 300-year palm leaf that puts an unmaintained copy's working life at
    // roughly seven centuries, which is about right.
    const before = c.carriers.length;
    c.carriers = c.carriers.filter(x => x.health > CARRIER_DEATH);
    if (c.carriers.length === 0 && before > 0) lose(state, c, year, 'neglect');
  }

  // 3b. Assign the oral repertoire to schools, so a school that ends can say
  //     what it was the last to know.
  const lineages = [...state.schools.values()];
  if (lineages.length) {
    for (const s of lineages) s.works = [];
    const oral = byPriority.filter(c => oralKept.has(c.id));
    for (let i = 0; i < oral.length; i++) {
      const s = lineages[i % lineages.length];
      s.works.push(oral[i].title);
    }
  }

  // 4. A working scriptorium does not only maintain manuscripts, it makes them.
  //    That is what redundancy at home actually was: several houses each holding
  //    a copy. It is a weaker hedge than distance — a fire takes a share of the
  //    town — but it is the only hedge available before there is anywhere to send
  //    a copy to.
  if (scribalCapacity > 0) {
    const spare = scribalCapacity - scribalKept.size;
    if (spare > 0) {
      let made = 0;
      for (const c of byPriority) {
        if (made >= spare) break;
        if (c.lost || !c.exists) continue;
        // Three written copies is where the return on another one flattens.
        // A work with none is the highest-value target: writing down what is
        // only remembered is the single biggest survival gain in the game.
        const written = c.carriers.filter(x => x.medium !== 'memory');
        if (written.length >= 3) continue;
        // Rate-limited by span so a long tick does not mass-produce.
        if (rng.chance(Math.min(0.5, 0.02 * span))) {
          c.carriers.push({
            medium: state.goods.has('paper') ? 'paper' : 'palmleaf',
            place: 'home', born: year, health: 1,
          });
          made++;
        }
      }
    }
  }

  // 5. Prestige flows backward along derivation edges.
  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    for (const parentId of c.derivesFrom) {
      const parent = state.corpus.get(parentId);
      if (parent && !parent.lost) parent.prestige += 0.02 * span;
    }
  }
}

/**
 * A work is reduced to zero carriers. It is not deleted — it stays in the ledger
 * with its title, its author, and the year it went.
 */
function lose(state, c, year, cause) {
  if (c.lost) return;
  c.lost = true;
  c.lostYear = year;
  c.carriers = [];
  state.stats.worksLost++;
  bumpPillar(state, 'IT', -1);
  bumpPillar(state, 'CLASSICISM', -1);
  record(state, year, 'loss',
    `${c.title} is lost. ${cause === 'neglect'
      ? 'Nobody attacked it. The last copy simply rotted.'
      : 'The last surviving copy is destroyed.'}`,
    { work: c.id, cause });
}

/** A WORK-class event brings its text into being, if we can match it. */
export function applyWorkEvent(state, ev, datapack) {
  const t = ev.title.toLowerCase();
  for (const c of state.corpus.values()) {
    if (c.exists || c.lost) continue;
    const title = c.title.toLowerCase();
    if (title.length > 5 && t.includes(title.split(/[\s,(]/)[0])) {
      compose(state, c, ev.year);
      record(state, ev.year, 'compose', `${c.title} enters the corpus.`, { work: c.id });
      return;
    }
  }
}

/**
 * Copy a work. Costs grain and scribe-time; adds a carrier.
 * Destination matters more than medium: a copy in the same room as the original
 * dies in the same fire.
 */
export function copyOut(state, workId, destination, year, { teacher = false } = {}) {
  const c = state.corpus.get(workId);
  if (!c || c.lost || !c.exists) return false;

  const cost = teacher ? 120 : 60;
  if (state.grain < cost) return false;
  if (!teacher && state.pops.scribes < 1) return false;
  // The real price of sending a teacher is not the grain for the road. It is
  // that a person who was keeping the corpus at home is now three thousand
  // kilometres away, and everything they were maintaining is one copy thinner.
  if (teacher && state.pops.scribes < 1 && state.pops.reciters < 2) return false;

  state.grain -= cost;
  if (teacher) {
    if (state.pops.scribes >= 1) state.pops.scribes -= 1;
    else state.pops.reciters -= 1;
  }

  // Medium follows what the era knows how to do.
  const medium = state.goods.has('paper') ? 'paper'
               : state.pillars.IT >= 12 ? 'palmleaf'
               : 'memory';

  c.carriers.push({ medium, place: destination, born: year, health: 1 });
  state.stats.worksCopied++;
  bumpPillar(state, 'IT', 0.5);

  if (teacher) {
    state.stats.teachersSent++;
    state.pops.teachers += 1;
    bumpPillar(state, 'CULTIVATION', 1.5);
    bumpPillar(state, 'NETWORKING', 1.5);
    record(state, year, 'teacher',
      `A teacher leaves for ${destination}, carrying ${c.title}.`, { work: workId });
  } else {
    record(state, year, 'copy', `${c.title} is copied to ${destination}.`, { work: workId });
  }
  return true;
}

/**
 * A catastrophe.
 *
 * It destroys carriers where it reaches, and only there. A work with a copy in
 * Tibet survives Nalanda burning; that is the entire game.
 *
 * The severity matters as much as the reach. An earlier version destroyed every
 * carrier held at home, which made a single library's sack wipe the corpus of a
 * subcontinent — historically wrong and mechanically flat, because it made
 * redundancy at home worthless. A sack takes an institution, not a civilisation:
 * so it destroys a share of home carriers, deterministically chosen. Two copies
 * in two houses is now a real hedge, and a copy abroad is still a better one.
 */
const SEVERITY = { W: 0.62, M: 0.34, R: 0.18, m: 0.08 };

export function catastrophe(state, ev, rng) {
  const reach = catastropheReach(ev);
  const severity = SEVERITY[ev.magnitude] ?? 0.3;
  let destroyed = 0, saved = 0;
  const casualties = [];

  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    const before = c.carriers.length;
    c.carriers = c.carriers.filter(x => !reach.includes(x.place) || !rng.chance(severity));
    destroyed += before - c.carriers.length;
    if (c.carriers.length === 0 && before > 0) {
      lose(state, c, ev.year, 'catastrophe');
      casualties.push(c.title);
    } else if (before > c.carriers.length) {
      saved++;
    }
  }

  record(state, ev.year, 'catastrophe',
    `${ev.title} — ${destroyed} carrier${destroyed === 1 ? '' : 's'} destroyed, ` +
    `${casualties.length} work${casualties.length === 1 ? '' : 's'} lost outright` +
    (saved ? `, ${saved} saved by a copy elsewhere.` : '.'),
    { id: ev.id, destroyed, lost: casualties.length, saved, casualties });
  return { destroyed, lost: casualties, saved };
}

function catastropheReach(ev) {
  const t = ev.title.toLowerCase();
  // Everything reaches 'home' for now. Regional reach lands with the map, when
  // a carrier's place is a real position rather than a label.
  if (/nalanda|vikramashila|odantapuri|bakhtiyar|valabhi|taxila/.test(t)) return ['home'];
  return ['home'];
}

/**
 * Works that exist in exactly one place — the ones a catastrophe would end.
 * This is what the corpus panel shows the player two centuries before 1193.
 */
export function worksAtRisk(state, place = 'home') {
  const out = [];
  for (const c of state.corpus.values()) {
    if (!c.exists || c.lost) continue;
    const elsewhere = c.carriers.filter(x => x.place !== place);
    if (elsewhere.length === 0 && c.carriers.length > 0)
      out.push({ id: c.id, title: c.title, carriers: c.carriers.length, prestige: c.prestige });
  }
  // Fragility first, then prestige. A famous work held in four houses is far
  // safer than an obscure one held in a single room, and a risk list sorted by
  // fame shows the player exactly the wrong twelve.
  return out.sort((a, b) => (a.carriers - b.carriers) || (b.prestige - a.prestige));
}

/** Ledger summary for the UI. */
export function corpusSummary(state) {
  let extant = 0, lost = 0, unwritten = 0, atRisk = 0;
  for (const c of state.corpus.values()) {
    if (c.lost) lost++;
    else if (!c.exists) unwritten++;
    else {
      extant++;
      if (c.carriers.every(x => x.place === 'home')) atRisk++;
    }
  }
  return { extant, lost, unwritten, atRisk, total: state.corpus.size };
}
