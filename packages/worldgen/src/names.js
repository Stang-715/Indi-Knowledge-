/**
 * Deterministic name generation for the silent record.
 *
 * The great majority of people in this game were never named by anything that
 * survives. The game still has to call them something, so it generates — and it
 * marks every generated person SYNTHESIZED, so the interface can always tell the
 * player the difference between somebody the record named and somebody we made
 * up to stand where a real person stood.
 *
 * The elements below are drawn from the kinds of name that actually appear in
 * inscriptions of each region and period — Tamil inscriptional names are
 * commonly theophoric, or place-based with an honorific ending, or occupational.
 * They are combined, not copied: this generator does not reproduce any specific
 * individual from any specific inscription.
 */
import { drawFrom } from '../../sim/src/rng.js';

/**
 * Per region: given elements, honorific and place endings, and the epithets that
 * attach to a name in the record.
 */
const POOLS = {
  'RGN.TAMILAKAM': {
    given: ['Nakkan', 'Aran', 'Kuttan', 'Sattan', 'Maran', 'Kovan', 'VElan', 'Cheyon',
            'Poovan', 'Tirumalai', 'Arangan', 'Chola', 'Pallavan', 'Kannan', 'Murugan',
            'Perumal', 'Sivan', 'Nambi', 'Adichan', 'Villavan'],
    givenF: ['Nangai', 'Ammai', 'Ponni', 'Alli', 'Vanji', 'Sengamalai', 'Tirumagal',
             'Kunthavai', 'Umai', 'Valli', 'Adigal', 'Manimekalai'],
    second: ['Udaiyan', 'Kilavan', 'Araiyan', 'Muvendavelan', 'Peruman', 'Adigal',
             'Devan', 'Pallavaraiyan', 'Brahmadhirajan', 'Marayan'],
    places: ['Uttaramerur', 'Tirunelveli', 'Kudamukku', 'Palaiyarai', 'Kanchi',
             'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Kumbakonam', 'Karuvur'],
  },
  'RGN.KARNATAKA': {
    given: ['Bommana', 'Kaliyamma', 'Chavunda', 'Marasimha', 'Ereyanga', 'Bittiga',
            'Sovideva', 'Nagavarma', 'Ranna', 'Ponna', 'Kesava', 'Ballala'],
    givenF: ['Attimabbe', 'Jakkiyabbe', 'Mahadevi', 'Ketaladevi', 'Padmavati', 'Kanti'],
    second: ['Setti', 'Gavunda', 'Nayaka', 'Arasa', 'Heggade', 'Odeya'],
    places: ['Banavasi', 'Aihole', 'Talakad', 'Belur', 'Halebidu', 'Kalyani', 'Lakkundi'],
  },
  'RGN.ANDHRA': {
    given: ['Bhima', 'Malla', 'Ganapati', 'Prola', 'Beta', 'Kata', 'Nanne', 'Erra'],
    givenF: ['Mailama', 'Rudrama', 'Ganapamba', 'Kuppambika'],
    second: ['Reddi', 'Nayaka', 'Setti', 'Preggada', 'Bhupati'],
    places: ['Vengi', 'Warangal', 'Draksharama', 'Amaravati', 'Rajahmundry'],
  },
  'RGN.KERALA': {
    given: ['Ravi', 'Kotha', 'Iravi', 'Govindan', 'Kesavan', 'Sankaran', 'Damodaran'],
    givenF: ['Umadevi', 'Kunhikkavu', 'Cheriyamma'],
    second: ['Namputiri', 'Panikkar', 'Menon', 'Kartha', 'Varman'],
    places: ['Makotai', 'Kodungallur', 'Trikkanamatilakam', 'Quilon', 'Sangamagrama'],
  },
  'RGN.GANGETIC': {
    given: ['Devadatta', 'Vishnusharman', 'Haridatta', 'Yashovarman', 'Bhattaraka',
            'Govindachandra', 'Madhava', 'Somesvara', 'Jayadeva', 'Ishvara'],
    givenF: ['Kumaradevi', 'Vasavadatta', 'Prabhavati', 'Sita', 'Gauri'],
    second: ['Sharman', 'Datta', 'Gupta', 'Bhatta', 'Mishra', 'Upadhyaya'],
    places: ['Pataliputra', 'Kausambi', 'Varanasi', 'Kanyakubja', 'Ujjayini', 'Mathura'],
  },
  'RGN.BENGAL': {
    given: ['Gopala', 'Vigrahapala', 'Dharma', 'Narayana', 'Chandra', 'Sena', 'Bhava'],
    givenF: ['Kambojadevi', 'Rannadevi', 'Vilasadevi'],
    second: ['Pala', 'Datta', 'Dasa', 'Nandi', 'Kara'],
    places: ['Gauda', 'Pundravardhana', 'Vikrampur', 'Somapura', 'Nadia'],
  },
  'RGN.KASHMIR': {
    given: ['Chandra', 'Bilhana', 'Kshemendra', 'Utpala', 'Damodara', 'Lalla'],
    givenF: ['Didda', 'Sugandha', 'Lalla'],
    second: ['Bhatta', 'Pandita', 'Gupta', 'Naga'],
    places: ['Srinagari', 'Parihasapura', 'Martanda', 'Avantipura'],
  },
  'RGN.ASSAM': {
    given: ['Sukaphaa', 'Sudangphaa', 'Lachit', 'Momai', 'Bhaskara', 'Ratna'],
    givenF: ['Joymoti', 'Sadhani', 'Padmapriya'],
    second: ['Barua', 'Phukan', 'Gohain', 'Bora'],
    places: ['Charaideo', 'Pragjyotishpura', 'Hajo', 'Sadiya'],
  },
};

const DEFAULT_POOL = POOLS['RGN.GANGETIC'];

/** Epithets by role, appended the way inscriptions append them. */
const EPITHET = {
  performer: ['of the temple', 'the dancer', 'the singer'],
  official:  ['of the assembly', 'the accountant', 'the arbiter'],
  scholar:   ['the learned', 'of the school'],
  scribe:    ['the writer', 'of the palm leaf'],
  architect: ['the sthapati', 'the stone-cutter'],
  poet:      ['the poet'],
  merchant:  ['the merchant', 'of the guild'],
};

/**
 * Generate a name.
 *
 * Pure: the same (seed, key) always gives the same name, so a person keeps their
 * name across a reload, a replay, and somebody else's machine.
 */
export function generateName(seed, key, { region, gender = null, role = null } = {}) {
  const pool = POOLS[region] ?? DEFAULT_POOL;
  const f = gender === 'f' || (gender === null && drawFrom(seed, 'sex', key) < 0.45);
  const givens = f && pool.givenF?.length ? pool.givenF : pool.given;

  const g = pick(givens, seed, 'given', key);
  const shape = drawFrom(seed, 'shape', key);

  let name;
  if (shape < 0.42) {
    name = `${g} ${pick(pool.second, seed, 'second', key)}`;
  } else if (shape < 0.76) {
    name = `${pick(pool.places, seed, 'place', key)} ${g}`;
  } else {
    name = `${g} ${pick(pool.second, seed, 'second2', key)} of ${pick(pool.places, seed, 'place2', key)}`;
  }

  const eps = EPITHET[role];
  if (eps && drawFrom(seed, 'epithet', key) < 0.30) name += `, ${pick(eps, seed, 'ep', key)}`;

  return { name, gender: f ? 'f' : 'm' };
}

function pick(arr, seed, tag, key) {
  return arr[Math.floor(drawFrom(seed, tag, key) * arr.length) % arr.length];
}

export const NAME_REGIONS = Object.keys(POOLS);
