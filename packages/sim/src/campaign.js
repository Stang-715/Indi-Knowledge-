/**
 * The Chola campaign (docs/12-buildplan-2.md Phase 22).
 *
 * 850 to 1279, played end to end. Not a slice — a campaign with a beginning, a
 * shape, and an ending you can lose.
 *
 * **Why this era and not the Indus.** The Indus is the better story: a
 * civilisation that ends with no conqueror, which is the honesty test for the
 * whole project. But the Cholas left tens of thousands of published
 * inscriptions naming individuals, transactions, committees and irrigation
 * shares. It is the one era where the game can operate at village resolution on
 * REAL DATA, so it is the one that proves the design rather than illustrating
 * it.
 */
import { corpusSummary, worksAtRisk } from './corpus.js';
import { living, endowmentLedger } from './people.js';
import { frontierLedger } from './frontier.js';
import { surveySummary } from './survey.js';

export const CHOLA = {
  id: 'CAM.CHOLA',
  name: 'The Chola Age',
  from: 850, to: 1279,
  homeRegion: 'RGN.TAMILAKAM',
  seat: 'thanjavur',
  opening: {
    // Vijayalaya takes Thanjavur with very little: this is a small kingdom in
    // 850 and the campaign should start like one.
    grain: 900,
    pillars: { DESIGN: 22, IT: 26, STRUCTURE: 24, CLASSICISM: 24,
               NETWORKING: 20, TRADE: 18, CULTIVATION: 22, AGRICULTURE: 30 },
  },
};

/**
 * The chapters. Each is a stretch with its own question, and the question is
 * what the player is actually being asked, not what happened.
 */
export const CHAPTERS = [
  { from: 850,  to: 907,  name: 'Vijayalaya',
    asks: 'You have one town and no institutions. What do you build first?' },
  { from: 907,  to: 985,  name: 'The Assemblies',
    asks: 'Uttaramerur writes its own constitution. Do you let villages run themselves?' },
  { from: 985,  to: 1014, name: 'Rajaraja',
    asks: 'The survey, and the great temple. Will the record you cut in stone outlive you?' },
  { from: 1014, to: 1070, name: 'The Ganges and the Sea',
    asks: 'You can reach Bengal and Srivijaya. What is worth the fleet?' },
  { from: 1070, to: 1150, name: 'Kulottunga',
    asks: 'Tolls abolished, guilds chartered. Does a road earn more open than taxed?' },
  { from: 1150, to: 1279, name: 'The Long Decline',
    asks: 'The north burns in 1193. Is anything of yours already somewhere else?' },
];

export function chapterAt(year) {
  return CHAPTERS.find(c => year >= c.from && year < c.to) ?? CHAPTERS[CHAPTERS.length - 1];
}

/**
 * The objectives.
 *
 * Deliberately not a score. Each is a thing the historical Cholas actually did
 * or failed to do, and the end screen reports which of them you managed —
 * because the interesting question after four hundred years is not how many
 * points you got, it is what you kept.
 */
export const OBJECTIVES = [
  { id: 'OBJ.ASSEMBLY', name: 'Let the villages govern themselves',
    note: 'Uttaramerur elected its committees by drawing palm-leaf tickets from a pot.',
    test: (s) => s.schools.has('COH.UTTARAMERUR_SABHA') },
  { id: 'OBJ.TEMPLE', name: 'Build the great temple',
    note: 'Completed 1010. Its walls are an archive.',
    test: (s) => s.year >= 1010 },
  { id: 'OBJ.RECORD', name: 'Cut the record in stone',
    note: 'Survey at least eight districts. The Cholas surveyed their whole realm.',
    test: (s) => (s.stats.surveys ?? 0) >= 8 },
  { id: 'OBJ.SEA', name: 'Reach across the sea',
    note: 'A route to Srivijaya, or an embassy that arrives.',
    test: (s) => s.stats.tradesCompleted >= 3 },
  { id: 'OBJ.PATRONS', name: 'Keep the people the record names',
    note: 'Endow four of them. Sembiyan Mahadevi endowed under her own name.',
    test: (s) => (s.stats.endowments ?? 0) >= 4 },
  { id: 'OBJ.LEARN', name: 'Learn from the treeline',
    note: 'What the forest peoples knew, the settled record mostly did not write down.',
    test: (s) => (s.stats.learnedFromFrontier ?? 0) >= 2 },
  { id: 'OBJ.SURVIVE', name: 'Have something left in 1279',
    note: 'Thirty works still extant at the end.',
    test: (s) => corpusSummary(s).extant >= 30 },
  { id: 'OBJ.ABROAD', name: 'Put something out of reach',
    note: 'Send four teachers abroad before 1193. This is the one that is timed.',
    test: (s) => s.stats.teachersSent >= 4 },
];

/**
 * The reckoning.
 *
 * Reports what survived and what it cost, in that order, and does not add them
 * up. A number would let the player stop reading.
 */
export function reckoning(state) {
  const cs = corpusSummary(state);
  const met = OBJECTIVES.filter(o => { try { return o.test(state); } catch { return false; } });
  const missed = OBJECTIVES.filter(o => !met.includes(o));

  const burned = state.log
    .filter(l => l.kind === 'catastrophe' && l.year >= 1190 && l.year <= 1200)
    .reduce((n, l) => n + (l.lost ?? 0), 0);

  const lostTitles = state.log.filter(l => l.kind === 'loss').map(l => l.work);
  const abroad = [...state.corpus.values()]
    .filter(c => !c.lost && c.carriers.some(x => x.place !== 'home'));

  return {
    year: state.year,
    corpus: cs,
    met, missed,
    burnedIn1193: burned,
    savedAbroad: abroad.length,
    savedTitles: abroad.slice(0, 8).map(c => c.title),
    lostCount: lostTitles.length,
    endowments: endowmentLedger(state),
    frontier: frontierLedger(state),
    survey: surveySummary(state),
    schools: state.schools.size,
    schoolsLost: state.stats.schoolsLost ?? 0,
    // The sentence the end screen leads with.
    verdict: verdict(cs, burned, abroad.length),
  };
}

function verdict(cs, burned, abroad) {
  if (cs.extant === 0)
    return 'Nothing survives. The ledger still has every title in it, greyed, with the year each one went.';
  if (burned === 0 && abroad > 0)
    return `Nothing burned that you had not already copied out. ${abroad} works survive because somebody carried them somewhere else.`;
  if (abroad === 0)
    return `${cs.extant} works survive, all of them at home. Nothing was ever put out of reach, and that was luck rather than judgement.`;
  return `${cs.extant} works survive and ${cs.lost} do not. ${burned} of the losses were in 1193, and ${abroad} works were somewhere else by then.`;
}

/** A campaign's opening state, for the engine's `initial` option. */
export function openingState(campaign = CHOLA) {
  return { grain: campaign.opening.grain, pillars: { ...campaign.opening.pillars },
           homeRegion: campaign.homeRegion };
}
