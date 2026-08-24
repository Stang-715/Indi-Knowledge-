# The Simulation — Victoria 3 depth, Indian bones

The design stance: Victoria 3's *machinery* (pops, goods, buildings, markets, interest
groups, journal entries) is the right machinery. Its *content* is European and its
central assumption — that you are a sovereign state — is the one thing that does not
transfer. Where India's history gives a better mechanic, take India's.

**Period: 1836 → 1947.** Victoria 3's start date; ends at Independence and Partition.

---

## 1. Pops on four axes

Victoria 3 gives a pop a culture, a religion, and a profession. In India during this
period, occupation and mobility ran on four things, and collapsing any two of them
produces a false model.

| Axis | Examples | Drives |
|---|---|---|
| **Language** | Bengali, Marathi, Tamil, Telugu, Punjabi, Gujarati, Hindustani, Kannada, Malayalam, Odia, Assamese | Administration, print, education, later provincial politics |
| **Religion** | Hindu, Muslim, Sikh, Christian, Jain, Buddhist, Parsi, tribal traditions | Personal law, communal politics, separate electorates from 1909 |
| **Jati-cluster** | Modelled as occupational clusters, not a ranked ladder | Occupational access, credit access, mobility friction, land rights |
| **Profession** | Ryot, agricultural labourer, artisan, zamindar, bania, clerk, industrialist, sepoy, officer | Income, workplace, political weight |

A pop is the intersection: *Tamil / Hindu / cultivator-cluster / ryot in Thanjavur*.
This is more pops than Victoria 3 carries, which is a performance problem with a known
answer — pops are aggregated per (tehsil × axis-tuple) and the simulation ticks at 4 Hz
in a worker, not per frame.

### On modelling caste

It is not optional. It is the single largest determinant of occupation and mobility in
this period, and a game that omits it tells a false story about Indian economic history.
Three rules govern how it is modelled:

1. **It is a system, not a trait.** It affects *access* — to occupations, to credit, to
   land, to schooling — never a pop's inherent competence or productivity. There is no
   "+10% efficiency" attached to any community, ever.
2. **Reform is a mechanic.** The historical movements that changed it are playable
   forces: Brahmo Samaj, Arya Samaj, Satyashodhak Samaj, the temple entry movements,
   Ambedkar's constitutionalism, reservation in the princely states (Mysore's 1921
   Miller Committee). Changing the system is a central campaign arc, not a background
   number.
3. **Historian review before it ships**, commissioned in P1 — early enough to shape the
   design, not as a compliance pass at the end.

---

## 2. Land revenue is the economy

Victoria 3's buildings capture their surplus in a broadly uniform way. In colonial
India, **who captured the agricultural surplus was set by which revenue settlement the
district was under** — and that varied district by district, permanently, from
decisions made in the 1790s–1850s. It is the most India-specific economic mechanic
available and it maps directly onto the map.

| System | Where | Surplus flows to | Consequence |
|---|---|---|---|
| **Zamindari** (Permanent Settlement, 1793) | Bengal, Bihar, Odisha, parts of UP | Zamindar takes the residual; state's take is **fixed in nominal terms forever** | State revenue erodes with inflation; a powerful landed interest group; low investment incentive |
| **Ryotwari** | Madras, Bombay | State assesses each cultivator directly | Higher state revenue, periodic reassessment, direct exposure of ryots to price shocks |
| **Mahalwari** | North-Western Provinces, Punjab | Village body assessed collectively | Intermediate; village solidarity as a political unit |

This is a **building-level modifier** on every agricultural building, a superb map mode,
and the root of several journal entries (the Deccan Riots of 1875; the Bengal Tenancy
Act of 1885; zamindari abolition after 1947 — the last act of the campaign).

---

## 3. Goods chains that are India's

Not a reskin of European industrialisation. Each of these carries its own arc.

- **Cotton.** Raw cotton → yarn → cloth. The handloom weaver is a pop with a
  profession that the arrival of Lancashire cloth destroys, then Bombay mills partly
  restore. Deindustrialisation is a modelled process, not flavour text.
- **Jute.** Bengal held a near-world monopoly. Sacking for the world's grain trade.
  Concentrated, lucrative, and fragile.
- **Indigo.** Plantation coercion, the Indigo Revolt of 1859–60, then near-total
  collapse when synthetic dyes arrive around 1900. A whole sector that *ends*.
- **Opium.** Company monopoly, exported to China, and central to the balance of
  payments. Historically enormous and morally loaded — presented with the ledger open,
  not sanitised, and not celebrated.
- **Tea.** Assam from the 1830s. Indentured labour recruitment from Chotanagpur —
  a labour-supply mechanic with a real human cost the model does not hide.
- **Salt.** A monopoly and a tax on a necessity, paid by everyone. Its political
  charge accumulates for a century until it detonates in 1930.
- **Coal and steel.** Raniganj, Jharia; TISCO at Jamshedpur from 1907 — the flagship of
  indigenous capital.
- **Railways.** See below; they are not just infrastructure.

### The railway guarantee

Railways were built by British companies under a **guaranteed 5% return**, paid out of
Indian revenues regardless of whether the line made money. Mechanically: you get track
— which genuinely transforms grain movement, famine response, and troop deployment —
and you also get a permanent liability that is not proportional to whether the line
works. It is the cleanest possible teaching mechanic about colonial infrastructure, and
it plays as a real, painful decision.

---

## 4. Politics: you may not be sovereign

This is the flagship departure from Victoria 3.

**Paramountcy.** A princely state has internal autonomy and no foreign policy. A
**Resident** sits at your court. You pay tribute. You maintain a fixed subsidiary force.
Succession requires recognition. Under the doctrine of lapse (until 1858), an heirless
state can be annexed outright.

The mechanics that follow are new verbs:

- **Standing with the Paramount Power** — a resource you spend and rebuild, gating what
  you can do without intervention.
- **The Resident** — an NPC with an agenda, opinions about your ministers, and a
  dispatch channel to Calcutta. Managing, cultivating, or deceiving them is gameplay.
- **Internal freedom is real.** Mysore under the Wodeyars electrified Bangalore in
  1905, built the Krishnarajasagar dam, and founded the Indian Institute of Science.
  You cannot conquer, but you can *build* — and the game should make that as satisfying
  as conquest is elsewhere.
- **The long game** is not independence by war. It is arriving at 1947 with a state
  worth inheriting.

### Interest groups

Replacing Victoria 3's set with the ones that actually contested this period:

Landed Zamindars & Talukdars · The Raj Administration (which you may not control) ·
Industrialists & Managing Agencies (Tata, Birla, Sassoon) · The Intelligentsia
(bhadralok, reformers, Congress moderates) · Ryots & Agricultural Labour · Religious
Orthodoxies (per community) · The Army (and martial-race recruitment doctrine) · Trade
Unions (from ~1918; AITUC 1920) · Princely Courts.

### The Drain

Home Charges. Council Bills. The railway guarantee. A trade surplus that never comes
home. Modelled as a **literal outflow line in the budget that you cannot remove while
under Crown rule** — visible, quantified, and unfixable by any means the game gives
you except changing your constitutional status.

Its magnitude is genuinely contested among historians. The model therefore exposes its
assumptions in the tooltip, cites them, and lets a mod retune them. Showing the argument
is better design than picking a side silently.

---

## 5. Journal entries

Victoria 3's journal entries are its questlines. India's write themselves:

The Great Trigonometrical Survey · The Permanent Settlement's Long Shadow · The Railway
Guarantee · The Indigo Revolt · 1857 and After · The Deccan Riots · The Famine Codes ·
The Vernacular Press Act · The Founding of Congress · Partition of Bengal & Swadeshi ·
Indentured Emigration · Dyarchy and the Montagu–Chelmsford Reforms · The Salt Monopoly ·
The Bengal Famine of 1943 · Transfer of Power.

Several are timed, several are triggered by your own choices, and the survey mechanic
(plan §3) is itself the first journal entry the player ever sees.

---

## 6. Map modes

The map mode list is where a grand strategy game's depth becomes *visible*, and India
supplies unusually good ones:

Political · Princely states vs. directly administered · **Land revenue system** ·
Language · Religion · Population density · Literacy · Land use and crop · Railway
network by year · Famine risk · Land revenue demand per head · Irrigation · Caste
occupational structure · Standard of living · **Survey completeness** (the fog of war
itself, as a map mode).

---

## 7. Tick architecture

| Layer | Rate | Where |
|---|---|---|
| Render | 60 Hz | Main thread |
| Economy & pops | 4 Hz | Worker (Rust → WASM) |
| Politics & IGs | Weekly (game time) | Same worker |
| Construction, migration | Monthly | Same worker |
| Journal & event evaluation | Daily | Same worker |

The simulation core is deterministic and headless — no rendering, no wall clock, no
unseeded randomness. This is not fastidiousness: it is the single property that makes
multiplayer, replay, and datapack migration ([`02-data-spine.md`](02-data-spine.md) §4)
all work through one mechanism instead of three.

State crosses to the main thread as transferable typed arrays, never as objects. The
main thread never blocks on a tick.

---

## 8. Depth is legibility

The thing that makes Victoria 3 feel deep is not the number of systems. It is that
**every number can be opened**, recursively, until you reach something you already
understand. A price opens into supply and demand; supply opens into buildings; a
building opens into its production method, its staffing, its pops; a pop opens into
its needs.

That is a UI architecture decision made on day one, not a feature added in year two.
The nested-tooltip primitive lives in `packages/ui` and everything that displays a
number uses it. If a number cannot explain itself, it does not ship.
