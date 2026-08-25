# The Timeline — Information Architecture & Event Spine

**6000 BCE → 1947 CE · 7,947 years · 210-hour campaign · 82% of playtime before 1300 CE**

The spine: what happens, when, and how the game paces eight thousand years. Companion to
[`08-visual-design.md`](08-visual-design.md), which locks how it looks.

Specified as **data with a generator**, like [`data/polities/`](../data/polities/) and
[`data/corpus/`](../data/corpus/) — revising a table beats rewriting a document.

**787 events written** against a ~1,150 target. Locked: 210 hours · ends at Independence ·
sixteen eras, thirteen of them ancient.

---

# Part 1 — Information Architecture

## 1.1 Entity hierarchy

```
Timeline
├─ Era            16    Rule-set boundaries. Thirteen before 1300.
│  └─ Chapter     ~62   Narrative units. 40–800 years each.
│     └─ Event    ~1,150 target · ~500 written · ~950 of them ancient
├─ Thread         ~28   Multi-event arcs crossing chapters and eras.
├─ Occupation     ~35   A *state*, not an event: foreign rule with duration.
└─ Cadence        16    Time compression per era.
```

**The era count itself carries the emphasis.** The Neolithic is no longer one era over
1,400 years — it is two eras over 2,700, each with its own extraction and sovereignty
model. Where the game is dense, the *structure* is dense, not just the clock.

## 1.2 The Event record

```jsonc
{
  "id": "EVT.M2200.ARIDIFICATION",
  "chapter": "CHP.THE_DRYING",
  "era": "ERA.MATURE_HARAPPAN",
  "year": -2200, "year_end": -2100,
  "class": "CLIMATE",
  "magnitude": "WORLD",
  "certainty": 0.75,
  "trigger": "window",            // certainty < 0.9, so it cannot be `dated`
  "window": [-2250, -2100],
  "scope": "subcontinental",
  "where": ["IN.GJ", "IN.HR", "PK.SINDH"],
  "evidence": "speleothem records, lake cores, settlement abandonment sequences",
  "dispute": null,                // populated when scholarship is actively divided
  "affects": { "pillars": { "AGRICULTURE": -4, "TRADE": -2 } },
  "threads": ["THR.THE_RIVERS"],
  "sources": [...],
  "teaches": "A civilisation can end without a conqueror."
}
```

Two fields exist for the ancient game specifically. **`evidence`** — for pre-literate eras
an event's warrant is archaeological, and the game should show the player *why we think
this happened*; that is the teaching mechanism. **`dispute`** — see 1.6.

## 1.3 Event classes — twelve

| Class | What it is | Target | Pre-1300 |
|---|---|---:|---:|
| `SITE` | A settlement is founded, peaks, or is abandoned | ~210 | ~205 |
| `WORK` | A text is composed — 89 already in `data/corpus/` | ~220 | ~190 |
| `REFORM` | Religious or social movement, schism, legal change | ~150 | ~120 |
| `FOUNDATION` | A polity, city, institution begins | ~140 | ~115 |
| `TRANSITION` | Economic or technological threshold | ~130 | ~110 |
| `INVASION` | External military incursion | ~95 | ~65 |
| `CATASTROPHE` | Corpus loss, famine, plague, flood, quake | ~80 | ~50 |
| `TRADE` | A route opens or closes | ~70 | ~55 |
| `FRONTIER` | Pressure from mobile/pastoral or forest peoples | ~60 | ~50 |
| `CLIMATE` | Aridification, monsoon regime, river avulsion | ~50 | ~45 |
| `COLONIAL` | The colonial sequence, 1498–1947 | ~30 | 0 |
| `EPOCH` | Era transition | 16 | 13 |
| | | **~1,150** | **~950** |

`SITE` is the workhorse of the ancient game, and the record supports it — hundreds of
datable foundations, peaks and abandonments across the subcontinent.

## 1.4 Invasion, "barbarism", and occupation

> **`INVASION` is an event. `FRONTIER` is a condition.** Every `INVASION` carries a
> **`becomes` field** — what the invader turned into. Kushans funded the workshops that
> made the first Buddha images; Turks built the Sultanate that produced Amir Khusrau. A
> game that renders these purely as destruction tells a false story and throws away its
> best arc.

`FRONTIER` also covers the **internal** frontier — forest and hill peoples, shifting
cultivation against settled agriculture. With the centre of gravity in the deep past this
stops being a footnote: **for most of the focus period the frontier is not a border, it is
the treeline.**

**Occupation** is a *state*, not an event: duration, extractive intensity, administrative
depth, and a **patronage rate**. *(I read "all the occupations" as this sense. If you meant
the professions list, that is a separate document.)*

## 1.5 Trigger types — certainty as mechanics

| Trigger | Meaning | Used when |
|---|---|---|
| `dated` | Fires that year, always | Certainty ≥ 0.9 |
| `window` | Fires at a random year in a range | Certainty 0.5–0.9 |
| `conditional` | Fires when world state matches | Coinage when trade crosses a threshold |
| `player` | The player initiates | Endowments, surveys, copying, reform |
| `latent` | Exists, may never fire | Contested events, shown as *possible* |

**This matters more under the new weighting.** Most of the campaign now runs on `window`
and `conditional`, because that is what the evidence supports. **Most of this game is
genuinely replayable**, with the fixed-tragedy feeling confined to the closing skim. That
falls out of the evidence rather than being designed in.

## 1.6 The `dispute` field — and a warning

Several events in the focus period are **actively contested scholarship, and some are
politically live in India right now.** Two examples that came up while researching this
tranche and that materially changed it:

- **Iron in Tamil Nadu.** Mayiladumparai returns AMS dates of **2172 BCE** — the oldest
  confirmed iron in India, which would put the southern Iron Age roughly a millennium
  ahead of the Gangetic one. Sivagalai's claimed **3345 BCE** is disputed: rice from the
  same intact urn as the iron dates to c. 1248 and 1155 BCE, and critics cite stratigraphic
  mixing and selective emphasis on the earliest charcoal.
- **Keeladi.** Dated by the Tamil Nadu Archaeology Department to **585 BCE**, 6th c. BCE –
  1st c. CE. The 2023 Amarnath Ramakrishna report placed the settlement 8th–3rd c. BCE; the
  ASI asked for it to be reworked, and it is an open Centre–State dispute as of 2025.

Both are now in the spine with `dispute` populated and `certainty` set low. The rule:

> **The game presents the argument. It does not adjudicate it.** A `dispute` event shows
> the competing dates, the evidence for each, and who holds which position — and where
> scholarship is genuinely divided, the trigger is `latent` so a campaign may or may not
> contain it.

**This is now a hiring requirement, not a footnote.** A game centred on exactly these
centuries needs an archaeologist and a historian on the team from P1.

---

# Part 2 — Timing and cadence

## 2.1 Baseline

Victoria 3: 1836–1936, exactly 100 years. Community expectation 20–25 h; one measured run
of 8 h for 1900–1936. **~15 real minutes per in-game year**, daily tick, 36,500 ticks.

## 2.2 The inverted cadence

7,947 years ÷ 210 h = **95 seconds per in-game year average** — but the average is now
deeply misleading, which is the point.

| # | Era | Span | Yrs | Hours | Per year | vs Vic 3 | Events |
|--:|---|---|---:|---:|---:|---:|---:|
| 1 | Early Neolithic | 6000–4500 BCE | 1,500 | 12 | 29 s | 31× | 42 |
| 2 | Late Neolithic & Chalcolithic | 4500–3300 BCE | 1,200 | 12 | 36 s | 25× | 40 |
| 3 | Early Harappan | 3300–2600 BCE | 700 | 11 | 57 s | 16× | 34 |
| 4 | **Indus Civilisation** | 2600–1900 BCE | 700 | **20** | 1.7 min | 8.7× | 56 |
| 5 | Late Harappan | 1900–1300 BCE | 600 | 10 | 60 s | 15× | 38 |
| 6 | Early Vedic | 1300–900 BCE | 400 | 10 | 90 s | 10× | 30 |
| 7 | Late Vedic | 900–600 BCE | 300 | 9 | 1.8 min | 8.3× | 32 |
| 8 | Second Urbanisation | 600–322 BCE | 278 | 15 | 3.2 min | 4.6× | 40 |
| 9 | **Mauryan** | 322–185 BCE | 137 | 13 | **5.7 min** | **2.6×** | 30 |
| 10 | Classical | 185 BCE–320 CE | 505 | 18 | 2.1 min | 7.0× | 44 |
| 11 | Gupta & Post-Gupta | 320–650 | 330 | 15 | 2.7 min | 5.5× | 36 |
| 12 | Regional Kingdoms | 650–850 | 200 | 10 | 3.0 min | 5.0× | 26 |
| 13 | **The Chola Age** | 850–1279 | 429 | **18** | 2.5 min | 6.0× | 48 |
| | **— focus —** | | **6,979** | **173** | | | **496** |
| 14 | Delhi & Vijayanagara | 1279–1526 | 247 | 14 | 3.4 min | 4.4× | 14 |
| 15 | Early Modern | 1526–1757 | 231 | 10 | 2.6 min | 5.8× | 12 |
| 16 | Colonial | 1757–1947 | 190 | 13 | 4.1 min | 3.7× | 15 |
| | **— skim —** | | **668** | **37** | | | **41** |
| | | | **7,947** | **210** | 95 s | | **537** |

**The Mauryan era is the densest in the game** at 5.7 minutes per in-game year — more time
per year than the colonial era gets. The Indus gets 20 hours; the Cholas 18.

## 2.3 Emphasis must be spent on content, not clock

Slowing the clock without adding content produces boredom, not depth. This tranche takes
the ancient spine from ~200 to **496 events**. The target is ~950, so **roughly 450
remain** — see Part 5.3 for how they get written.

## 2.4 What the player does for 173 hours

The ancient game cannot run on the Victoria 3 verb set. Its verbs are:

- **Settle, clear, abandon.** Where people live and what it costs to keep them there.
- **Domesticate and adapt.** Crop packages, herds, water. `AGRICULTURE` is the early
  economy entire.
- **Remember.** The knowledge economy (`05-knowledge-economy.md`) is *the* system here —
  before writing and before coinage, storytellers paid in grain are the only knowledge
  infrastructure that exists.
- **Trade at enormous distance.** Meluhha–Mesopotamia, the Gulf, later Rome and Srivijaya.
- **Endure.** The 8.2 and 4.2 kiloyear events, river avulsions, monsoon failure. **Climate
  is the ancient game's antagonist, and it has no face.**

Only from Era 8 does the familiar verb set switch on — and it arrives *as an era
transition the player feels*: the first coins, the first edicts, the first real armies.

## 2.5 Tick granularity

| Span | Tick | Ticks |
|---|---|---:|
| 6000–1300 BCE | 5-yearly | 940 |
| 1300 BCE – 650 CE | yearly | 1,950 |
| 650 – 1526 | monthly | 10,512 |
| 1526 – 1857 | monthly | 3,972 |
| 1857 – 1947 | daily | 32,850 |
| | | **50,224** |

239 ticks per real hour against Victoria 3's 1,460 — **6× cheaper**, the headroom that
pays for 648,802 settlements.

---

# Part 3 — The event spine

**W** world-altering · **M** major · **R** regional · **m** minor. `~` = window, not date.
**‡** marks an event with a populated `dispute` field.

---

## Era 1 · Early Neolithic — 6000–4500 BCE · 12 h · 42 events
*Chapters: The Mehrgarh Threshold · The Cold Snap · The First Herds · Rice in the East · The Long Networks*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~6000 | **Game begins.** Aceramic farming at Mehrgarh: wheat, barley, goat, sheep | EPOCH | W |
| ~6000 | **Dental drilling at Mehrgarh — the earliest known dentistry anywhere** | TRANSITION | M |
| ~6000 | Mudbrick rectangular houses; the compartmented storage room | STRUCTURE | M |
| ~5950 | Bitumen-lined baskets; the first waterproof containers | TRANSITION | R |
| ~5900 | **Zebu cattle domesticated locally — an independent domestication** | TRANSITION | W |
| ~5900 | Water buffalo taken into the herd | TRANSITION | M |
| **~6200** | **The 8.2 kiloyear cooling event** | CLIMATE | **W** |
| ~6100 | Foraging bands in the Vindhyas persist alongside farmers | FRONTIER | M |
| ~5900 | Naked six-row barley becomes the staple | AGRICULTURE | M |
| ~5850 | Marine shell (*Turbinella pyrum*) reaches Mehrgarh from the coast | TRADE | M |
| ~5800 | Granary blocks at Mehrgarh — **storage means surplus means hierarchy** | TRANSITION | W |
| ~5750 | Goat burials accompany human graves; the first grave goods | REFORM | M |
| ~5700 | Bone-tool and microlith industries specialise | TRANSITION | R |
| ~5600 | Sedentism completes; the seasonal round ends at Mehrgarh | TRANSITION | M |
| ~5500 | **Mehrgarh II: pottery arrives.** Basket-marked, then wheel-finished | TRANSITION | W |
| **~5500** | **Cotton thread preserved in a copper bead — earliest cotton use anywhere** | TRANSITION | **W** |
| ~5500 | Native copper worked cold into beads | TRANSITION | M |
| ~5400 | Steatite working; the first seals-in-embryo | TRANSITION | R |
| ~5400 | Differentiated burials: some graves richer than others | REFORM | M |
| ~5300 | The Holocene climatic optimum; monsoon at maximum strength | CLIMATE | W |
| ~5200 | Bhirrana period IA; Hakra ware on the Ghaggar ‡ | SITE | M |
| ~5100 | Population rises; Mehrgarh expands across the terrace | SITE | M |
| ~5000 | **Lahuradewa: rice at the eastern edge — independent domestication argued** ‡ | TRANSITION | W |
| ~5000 | Kunal founded on the Ghaggar | SITE | M |
| ~5000 | Jhusi and the middle Ganga Neolithic | SITE | R |
| ~4950 | Mungbean and horsegram enter cultivation in the peninsula | AGRICULTURE | M |
| ~4900 | Sesame cultivation begins | AGRICULTURE | R |
| ~4850 | **Lapis lazuli from Badakhshan reaches Mehrgarh** — 1,500 km | TRADE | W |
| ~4800 | Turquoise from the Iranian plateau; the western network opens | TRADE | M |
| ~4800 | The monsoon peaks; the Ghaggar runs strong | CLIMATE | M |
| ~4750 | Kiln-fired pottery replaces open firing | TRANSITION | M |
| ~4700 | **Mehrgarh III: mass-produced wheel pottery. Faience appears** | TRANSITION | W |
| ~4700 | The potter's workshop: the first full-time non-farming specialist | TRANSITION | W |
| ~4650 | Chirand on the Ganga; a bone-tool industry of remarkable refinement | SITE | M |
| ~4600 | Terracotta female figurines proliferate | WORK | M |
| ~4600 | Copper smelting, as distinct from working native metal | TRANSITION | W |
| ~4550 | The first regional pottery styles diverge — identity becomes visible | TRANSITION | M |
| ~4550 | Seasonal calendars inferred from sowing regularity | TRANSITION | M |
| ~4500 | **Herding reaches the Deccan; the ashmound tradition opens at Utnur** | FRONTIER | W |
| ~4500 | Bagor: Mesolithic hunters adopt domestic sheep without settling | FRONTIER | M |
| ~4500 | Mehrgarh's cemetery closes; the settlement shifts | SITE | R |

## Era 2 · Late Neolithic & Chalcolithic — 4500–3300 BCE · 12 h · 40 events
*Chapters: Copper · The Ashmounds · The Regional Cultures · The Plough · Toward Convergence*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~4500 | Utnur ashmound: cattle penned, dung burned, seasonally, for centuries | SITE | W |
| ~4400 | Kodekal and Kupgal; the ashmound belt across the Deccan | SITE | M |
| ~4350 | Kupgal's rock gongs — struck boulders, an acoustic site | WORK | M |
| ~4300 | Mehrgarh IV–V; compartmented stamp seals | TRANSITION | M |
| ~4300 | Amri I in Sindh; the western sequence begins | SITE | M |
| ~4200 | Ahar-Banas: Balathal and Gilund founded in Mewar | SITE | W |
| ~4200 | Copper smelting at scale in the Aravallis — Khetri ore | TRANSITION | W |
| ~4100 | Sothi-Siswal ware across Haryana and northern Rajasthan | SITE | M |
| ~4000 | Koldihwa and Mahagara; rice in the Belan valley ‡ | SITE | M |
| ~4000 | Balathal's fortification wall — early, and unexplained | STRUCTURE | M |
| ~3950 | Anarta tradition in northern Gujarat | SITE | R |
| ~3900 | Nal ware in Balochistan; polychrome ceramics | TRANSITION | R |
| ~3850 | Padri: salt production on the Saurashtra coast | TRANSITION | M |
| ~3800 | Mundigak in Afghanistan; the northwestern network thickens | TRADE | M |
| ~3750 | Shahr-i-Sokhta contact; goods move both ways | TRADE | M |
| **~3700** | **Ravi phase at Harappa** | SITE | **W** |
| ~3700 | Terracotta cart models — wheeled transport attested | TRANSITION | W |
| ~3650 | Bullock traction; the yoke enters the record | TRANSITION | M |
| ~3600 | Kot Diji founded in Sindh | SITE | M |
| ~3550 | Gilund's parallel-walled structure; storage on a new scale | STRUCTURE | M |
| **~3500** | **The Kalibangan ploughed field — the earliest known anywhere** | TRANSITION | **W** |
| ~3500 | Cross-ploughing implies two crops in one field | AGRICULTURE | W |
| ~3450 | Kayatha in Malwa; the central Indian Chalcolithic | SITE | M |
| ~3400 | Savalda in the Tapi valley | SITE | R |
| ~3400 | Sanganakallu; the Karnataka Neolithic matures | SITE | M |
| ~3350 | Sivagalai: a claimed 3345 BCE iron date ‡ — **heavily disputed** | TRANSITION | M |
| ~3350 | Millets domesticated in the peninsula: browntop, bristley foxtail | AGRICULTURE | W |
| ~3350 | Brahmagiri and Piklihal; the southern Neolithic web | SITE | M |
| ~3330 | Rehman Dheri laid out on a grid — **before the mature cities** | SITE | W |
| ~3320 | Nausharo founded beside Mehrgarh | SITE | M |
| ~3320 | Burzahom period I: pit dwellings in Kashmir | SITE | M |
| ~3310 | Gufkral; the Kashmir Neolithic's second centre | SITE | R |
| ~3310 | Chert blade industry standardises across the northwest | TRANSITION | M |
| ~3300 | **Potters' marks proliferate — the script's ancestry** | TRANSITION | W |
| ~3300 | Faience and steatite bead production industrialises | TRANSITION | M |
| ~3300 | Regional cultures begin converging on shared norms | EPOCH | W |
| ~3300 | Damb Sadaat in the Quetta valley | SITE | R |
| ~3300 | Wheat and barley reach Gujarat | AGRICULTURE | R |
| ~3300 | The first walled enclosures in the Ghaggar cluster | STRUCTURE | M |
| ~3300 | Long-distance shell exchange links coast to Punjab | TRADE | M |

## Era 3 · Early Harappan — 3300–2600 BCE · 11 h · 34 events
*Chapters: Kot Diji · The Convergence · Standard Measures · The First Storytellers · The Threshold*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~3300 | **Early Harappan begins** — Ravi, Kot Diji and Sothi-Siswal converge | EPOCH | W |
| ~3250 | Harappa period 2; the settlement doubles | SITE | M |
| ~3200 | Kot Diji fortified; the walled form spreads | STRUCTURE | W |
| ~3150 | Amri II; Sindh's own trajectory | SITE | M |
| ~3100 | Kalibangan I: a fortified parallelogram, mudbrick | SITE | M |
| ~3100 | Banawali I founded | SITE | R |
| ~3050 | Fire altars at Kalibangan — **function disputed** ‡ | REFORM | M |
| **~3000** | **Cotton cultivated, not merely gathered, at Mehrgarh** | AGRICULTURE | **W** |
| ~3000 | Kunal: silver and gold ornaments; a small crown | TRANSITION | M |
| ~3000 | Dholavira's earliest phase on Khadir island | SITE | M |
| ~2950 | The first Indus signs incised on pottery | TRANSITION | W |
| ~2900 | Nageshwar and Balakot: shell bangle workshops | TRANSITION | M |
| ~2900 | Rakhigarhi's early occupation | SITE | M |
| ~2850 | Copper alloying with arsenic, then tin — bronze | TRANSITION | W |
| **~2800** | **Weights and measures standardise across regions** | TRANSITION | **W** |
| ~2800 | Carnelian bead etching invented — a signature export | TRANSITION | W |
| ~2800 | The drilled long carnelian bead; a tool problem solved | TRANSITION | M |
| ~2780 | Ganweriwala founded in Cholistan | SITE | M |
| ~2750 | Trade contact with Magan (Oman) for copper | TRADE | M |
| **~2700** | **Storytellers first paid in grain — the knowledge economy opens** | TRANSITION | **W** |
| ~2700 | Specialist craft quarters appear within settlements | TRANSITION | M |
| ~2700 | Lothal's first occupation | SITE | M |
| ~2680 | Kalibangan's cross-ploughed field goes out of use | SITE | m |
| ~2660 | Bagasra and the Gujarat bead network | SITE | R |
| ~2650 | **Standardised brick ratios (1:2:4) appear across the whole region** | TRANSITION | W |
| ~2650 | The drainage principle: waste water leaves the house | STRUCTURE | W |
| ~2640 | Surkotada founded | SITE | R |
| ~2630 | Pottery forms converge to a shared repertoire | TRANSITION | M |
| ~2620 | The stamp seal takes its mature square form | TRANSITION | M |
| ~2610 | Chanhudaro's first occupation | SITE | R |
| ~2600 | **Kot Diji burns** — the transition is not everywhere peaceful ‡ | CATASTROPHE | M |
| ~2600 | Nausharo transitions to Harappan forms without a break | SITE | M |
| ~2600 | Population concentrates; small sites empty into large ones | SITE | W |
| ~2600 | The threshold crossed: planning replaces accretion | EPOCH | W |

## Era 4 · Indus Civilisation — 2600–1900 BCE · 20 h · 56 events
*Chapters: The Urban Turn · The Cities of the Plain · Meluhha · The Craft Towns · The Drying · The Emptying*

| Year | Event | Class | Mag |
|---|---|---|---|
| **~2600** | **Urban transition.** Mohenjo-daro, Harappa, Dholavira planned on a grid | EPOCH | **W** |
| ~2600 | The citadel-and-lower-town plan appears at multiple sites at once | STRUCTURE | W |
| ~2600 | The Dholavira signboard — the largest Indus inscription | WORK | M |
| ~2590 | Streets laid on cardinal alignments | STRUCTURE | M |
| ~2580 | Harappa 3A; the great walls raised | STRUCTURE | M |
| ~2570 | Covered drains in every street; soak-pits and manholes | STRUCTURE | W |
| ~2560 | **The Great Bath at Mohenjo-daro** | STRUCTURE | W |
| ~2550 | The so-called granaries — **function still disputed** ‡ | STRUCTURE | M |
| ~2550 | Wells in most houses; Mohenjo-daro alone has some 700 | STRUCTURE | W |
| ~2540 | **No temples. No palaces. No royal burials.** A structural fact | REFORM | W |
| ~2530 | Fired brick used at scale — enormous fuel demand | TRANSITION | M |
| **~2500** | **The Indus script in use — c. 400 signs, average inscription 5 signs** ‡ | TRANSITION | **W** |
| ~2500 | The unicorn seal: the commonest motif, and unexplained | WORK | M |
| ~2500 | Cubical chert weights on a 0.856 g unit; binary then decimal | TRANSITION | W |
| ~2500 | The Priest-King steatite figure | WORK | M |
| ~2500 | The Dancing Girl — lost-wax bronze casting | WORK | W |
| ~2490 | Dockyards, warehouses and standardised sealings | TRADE | M |
| ~2480 | Rakhigarhi at peak; the largest Indus city by area | SITE | W |
| **~2450** | **Lothal's basin — dockyard or reservoir, still argued** ‡ | TRADE | **W** |
| ~2450 | Lothal's bead factory; the finest drilled carnelian anywhere | TRANSITION | W |
| ~2440 | Weight standards adopted in the Gulf — Indus norms travel | TRADE | W |
| ~2430 | Ras al-Jinz, Oman: Indus pottery on the Arabian shore | TRADE | M |
| ~2420 | Chanhudaro: a town that is essentially an industrial estate | SITE | M |
| ~2410 | Dilmun (Bahrain) becomes the entrepôt between Meluhha and Sumer | TRADE | W |
| **~2350** | **Akkadian records name Meluhha ships at Sargon's quay** | TRADE | **W** |
| ~2340 | Shu-ilishu's seal: *"interpreter of the Meluhhan tongue"* | TRADE | W |
| ~2330 | A Meluhhan village attested in Mesopotamia | TRADE | M |
| **~2300** | **Shortugai founded on the Oxus — an Indus outpost for lapis** | SITE | **W** |
| ~2300 | Surkotada's horse bones — **disputed identification** ‡ | FRONTIER | m |
| ~2280 | Banawali and Bhirrana at their fullest extent | SITE | M |
| ~2260 | Kalibangan: evidence read as earthquake damage ‡ | CATASTROPHE | M |
| ~2250 | Sutkagen Dor: the western frontier on the Makran coast | SITE | M |
| ~2240 | Gola Dhoro (Bagasra): a fortified craft enclave | SITE | R |
| **~2200** | **The 4.2 kiloyear aridification event** — hemispheric | CLIMATE | **W** |
| ~2200 | Dholavira's sixteen reservoirs at maximum extent | STRUCTURE | W |
| **~2172** | **Iron at Mayiladumparai, Tamil Nadu — the oldest AMS-dated iron in India** ‡ | TRANSITION | **W** |
| | *A thousand years before the Ganga plain. The south is not a periphery.* | | |
| ~2150 | Meluhha disappears from Mesopotamian records | TRADE | W |
| ~2100 | Ghaggar-Hakra flow declines; settlement shifts east | CLIMATE | W |
| ~2100 | Mohenjo-daro's upper levels: crowding, subdivision, blocked streets | SITE | W |
| ~2080 | Rebuilding stops keeping pace with decay | SITE | M |
| ~2050 | Public buildings fall out of maintenance | STRUCTURE | M |
| ~2030 | Standardised weights start to drift | TRANSITION | M |
| ~2000 | **Sorghum and pearl millet arrive from Africa** | AGRICULTURE | W |
| ~2000 | Rice adopted in the eastern and Gujarat settlements | AGRICULTURE | W |
| ~2000 | **Kharif and rabi: double-cropping begins** | AGRICULTURE | W |
| ~1990 | Contact with the BMAC in Central Asia | TRADE | M |
| ~1980 | Dholavira abandoned, reoccupied more simply, abandoned again | SITE | M |
| ~1960 | Long-distance trade in luxury goods ceases | TRADE | W |
| ~1950 | Craft specialisation collapses back toward household production | TRANSITION | W |
| ~1940 | Seal use declines sharply | TRANSITION | M |
| ~1930 | Mohenjo-daro's population falls below urban threshold | SITE | W |
| ~1920 | Harappa's cemetery H burials begin — different rites, same place | REFORM | M |
| ~1910 | Shortugai abandoned; the Oxus link breaks | SITE | M |
| **~1900** | **Deurbanisation.** Cities emptied, not sacked — no destruction layer | EPOCH | **W** |
| ~1900 | **Last use of the Indus script.** Literacy ends for 1,650 years | CATASTROPHE | **W** |
| ~1900 | Settlement count *rises* as size falls — dispersal, not extinction | SITE | W |

> **The design's first great lesson, and it has no villain.** Nobody invades. The rivers
> change. A civilisation with no army, no palace and no royal burial simply stops. Getting
> through twenty hours of Indus play and out the other side without inventing a conqueror
> is the honesty test for the entire project.

## Era 5 · Late Harappan — 1900–1300 BCE · 10 h · 38 events
*Chapters: Cemetery H · The Eastward Dispersal · The Copper Hoards · Daimabad · The Southern Iron*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~1900 | Cemetery H in the Punjab; Jhukar in Sindh | EPOCH | M |
| ~1900 | Rangpur IIB; Gujarat's sequence runs longest | SITE | M |
| ~1880 | Painted burial urns replace extended inhumation at Harappa | REFORM | M |
| ~1850 | Bara ware across the eastern Punjab | SITE | M |
| **~1800** | **Site numbers multiply eastward — many more, and far smaller** | SITE | **W** |
| ~1800 | Rojdi and Kuntasi continue Harappan forms without cities | SITE | M |
| ~1780 | Millet-based agriculture spreads through Gujarat and the Deccan | AGRICULTURE | W |
| ~1750 | Ochre Coloured Pottery in the Doab | SITE | M |
| ~1720 | **The copper hoards: harpoons, anthropomorphs, antennae swords** ‡ | TRANSITION | W |
| ~1700 | Craft skill survives; the scale of organisation does not | TRANSITION | M |
| ~1680 | Pirak founded: horse, camel, rice and millet in one place | SITE | W |
| ~1650 | Malwa culture; Navdatoli on the Narmada | SITE | M |
| **~1600** | **The Daimabad bronzes — chariot, elephant, rhinoceros, buffalo** ‡ | WORK | **W** |
| ~1600 | The Jorwe culture across the Deccan | SITE | M |
| ~1560 | Chandoli and Nevasa; the Deccan Chalcolithic at its widest | SITE | M |
| **~1510** | **Iron at Mangadu, Salem — southern metallurgy consolidates** ‡ | TRANSITION | W |
| ~1500 | Inamgaon: an irrigation channel, a chief's house, a granary | SITE | W |
| ~1500 | **Indo-Aryan migration — `latent`, contested, presented as debated** ‡ | FRONTIER | W |
| ~1480 | Gandhara Grave culture in the Swat valley | SITE | M |
| ~1450 | Horse remains become common in the northwest | FRONTIER | M |
| ~1450 | The spoked wheel appears | TRANSITION | W |
| ~1400 | The southern megalithic tradition opens: cists, dolmens, urns | REFORM | W |
| ~1400 | Hallur: iron in Karnataka | TRANSITION | M |
| ~1380 | Adichanallur's urn burials begin | SITE | W |
| ~1350 | Cattle-keeping and mobility rise as farming intensity falls | AGRICULTURE | M |
| ~1350 | Jorwe settlements contract sharply — a regional drought ‡ | CLIMATE | M |
| ~1330 | Inamgaon's population falls; the chief's house is abandoned | SITE | M |
| ~1320 | Daimabad abandoned | SITE | M |
| ~1300 | **Painted Grey Ware appears in the Doab** | TRANSITION | W |
| ~1300 | Iron working begins in the Ganga plain ‡ | TRANSITION | W |
| ~1300 | Rice paddy cultivation intensifies in the middle Ganga | AGRICULTURE | W |
| ~1300 | The knowledge economy runs entirely on memory — no script anywhere | TRANSITION | W |
| ~1300 | Northeast: Daojali Hading; the eastern Neolithic | SITE | R |
| ~1300 | Assam rice cultivation; the Brahmaputra corridor | AGRICULTURE | R |
| ~1300 | Sri Lanka: early Iron Age at Anuradhapura | SITE | R |
| ~1300 | Chalcolithic Malwa gives way to iron-using cultures | TRANSITION | M |
| ~1300 | Shell and bead exchange networks re-form at smaller scale | TRADE | M |
| ~1300 | Pastoral mobility peaks across the western dry zone | FRONTIER | M |

## Era 6 · Early Vedic — 1300–900 BCE · 10 h · 30 events
*Chapters: The Composers · The Ten Kings · Iron and the Clearance · The Kuru Settlement*

| Year | Event | Class | Mag |
|---|---|---|---|
| **~1300** | **Rigveda composition begins** — oral, and stays oral for 3,000 years | WORK | **W** |
| ~1300 | The reciters: the knowledge economy's first full-time profession | TRANSITION | W |
| ~1280 | Cattle raiding (*gavishti*) as the basic form of conflict | FRONTIER | M |
| ~1250 | **The Dasarajna — the Battle of the Ten Kings, on the Ravi** | INVASION | M |
| ~1230 | The *dana-stuti* hymns: patronage recorded in verse | WORK | W |
| **~1200** | **Iron in the Ganga plain at scale. Forest clearance accelerates** | TRANSITION | **W** |
| ~1200 | Malhar and Raja Nala ka Tila: early Gangetic iron ‡ | SITE | M |
| ~1180 | The iron axe changes what land can be farmed | AGRICULTURE | W |
| ~1150 | Atranjikhera; the PGW settlement web thickens | SITE | M |
| ~1120 | The *ashvamedha*: sovereignty performed as ritual | REFORM | W |
| **~1100** | **Kuru state formation; ritual codification begins** | FOUNDATION | **W** |
| ~1080 | The Rigveda is arranged into ten mandalas | WORK | W |
| **~1050** | **The mnemonic schemes fixed: padapatha, then kramapatha** | TRANSITION | **W** |
| | *Error-correcting codes. The finest pre-modern information technology anywhere.* | | |
| ~1030 | The *sabha* and *samiti*: assembly as an institution | REFORM | W |
| ~1000 | Hastinapura; the janapada takes shape | SITE | M |
| ~1000 | Ahichchhatra and Jakhera | SITE | R |
| ~980 | Barley yields to rice and wheat in the eastern settlements | AGRICULTURE | M |
| ~970 | Tribute (*bali*, *bhaga*) as voluntary offering, not assessment | TRANSITION | W |
| ~960 | The four-*varna* scheme first stated, in a late hymn ‡ | REFORM | W |
| ~950 | **The Hastinapura flood layer** | CATASTROPHE | M |
| ~940 | Kausambi occupied as Hastinapura declines | SITE | M |
| ~930 | The Samaveda: the Rigveda set to melody | WORK | W |
| ~925 | The Yajurveda; ritual procedure separated from hymn | WORK | W |
| ~920 | Southern megaliths spread; iron everywhere in the peninsula | TRANSITION | W |
| ~915 | Brahmagiri and Maski; the megalithic-to-historic sequence begins | SITE | M |
| ~910 | Copper and iron circulate together in the Deccan | TRADE | M |
| ~905 | The Atharvaveda: healing, herbs, household life | WORK | W |
| ~900 | The *shakha* system: schools of transmission diverge | TRANSITION | W |
| ~900 | Chirand and the middle Ganga move to iron | SITE | M |
| ~900 | Painted Grey Ware at its widest distribution | TRANSITION | M |

## Era 7 · Late Vedic — 900–600 BCE · 9 h · 32 events
*Chapters: The Brahmana Age · Videha and the East · The Upanishadic Turn · The Cities Return*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~900 | **Shatapatha Brahmana; altar geometry as applied mathematics** | WORK | W |
| ~890 | The Kuru-Panchala realm; the shrauta ritual system matures | FOUNDATION | W |
| ~870 | The Aitareya Brahmana | WORK | M |
| ~860 | Ritual specialisation: sixteen priests for a single sacrifice | TRANSITION | M |
| **~850** | **Videgha Mathava's fire — the eastward expansion, told as myth** | FRONTIER | W |
| ~840 | Rice transplantation raises yields sharply | AGRICULTURE | W |
| ~830 | Iron ploughshares in the middle Ganga | TRANSITION | W |
| ~820 | Surplus concentrates; the *grama* becomes a taxable unit | TRANSITION | W |
| **~800** | **Shulba Sutras — the Pythagorean relation, stated** | WORK | **W** |
| ~800 | Kosala and Kashi emerge as distinct powers | FOUNDATION | M |
| ~790 | The Panchavimsha Brahmana | WORK | M |
| ~780 | The Vedanga disciplines separate out: six auxiliary sciences | TRANSITION | W |
| ~770 | Adichanallur's urn cemetery at its fullest | SITE | M |
| **~750** | **The Upanishadic turn. Yajnavalkya; the Brihadaranyaka** | WORK | **W** |
| ~750 | **Gargi Vachaknavi argues in open assembly** | WORK | W |
| ~745 | Uddalaka Aruni; *tat tvam asi* in the Chandogya | WORK | W |
| ~740 | Renunciation appears as a recognised life stage | REFORM | W |
| ~730 | Kausambi's rampart — the earliest great fortification of the Ganga ‡ | STRUCTURE | W |
| ~720 | Ujjain fortified; the Malwa route secured | SITE | M |
| **~700** | **Second urbanisation begins in the middle Ganga** | TRANSITION | **W** |
| ~700 | Northern Black Polished Ware; luxury exchange resumes | TRANSITION | W |
| ~700 | The internal frontier: forest peoples and the clearance line | FRONTIER | W |
| ~690 | Rajgir's cyclopean walls | STRUCTURE | M |
| ~680 | Sravasti, Champa, Ahichchhatra fortified | SITE | M |
| ~670 | The *shreni*: craft associations acquire standing | TRANSITION | W |
| ~660 | Coined-money precursors: weighed silver bent-bars | TRANSITION | W |
| ~650 | The *jana* becomes the *janapada* — people become territory | REFORM | **W** |
| ~640 | Anga, Magadha and Kashi contest the eastern trade | FOUNDATION | M |
| ~630 | Iron production at Malhar reaches industrial scale | TRANSITION | M |
| ~620 | Sri Lanka: Anuradhapura becomes a town | SITE | R |
| ~610 | Tamil Brahmi's precursors in the far south ‡ | TRANSITION | M |
| ~600 | Sixteen mahajanapadas: the map has states on it | EPOCH | W |

## Era 8 · Second Urbanisation — 600–322 BCE · 15 h · 40 events
*Chapters: The Sixteen · The Renouncers · The First Coins · Magadha Ascendant · Persians and Greeks*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~600 | **Sixteen mahajanapadas. Kingdom and republic compete as forms** | EPOCH | W |
| ~590 | The gana-sangha: Vajji, Malla, Shakya govern by assembly | REFORM | W |
| **~585** | **Keeladi: urban settlement on the Vaigai** ‡ — *disputed, politically live* | SITE | **W** |
| ~580 | Taxila becomes a centre of learning | FOUNDATION | W |
| ~570 | Long-distance caravan routes: the *uttarapatha* and *dakshinapatha* | TRADE | W |
| **~550** | **Punch-marked coinage — money enters the game** | TRANSITION | **W** |
| ~563–480 | **The Buddha** — long and short chronologies both `window` ‡ | REFORM | W |
| ~599–527 | Mahavira; the Jain order ‡ | REFORM | W |
| ~545 | Bimbisara; Magadhan expansion begins | FOUNDATION | M |
| ~540 | Makkhali Gosala and the Ajivikas — the third renouncer path | REFORM | W |
| ~535 | Ajita Kesakambali and the materialists | REFORM | M |
| ~528 | The enlightenment at Bodh Gaya (traditional) | REFORM | W |
| ~525 | The first *sangha*: a corporate body that outlives its founder | REFORM | W |
| **518** | **Achaemenid annexation of Gandhara and Hindush** | INVASION | **M** |
| | → `becomes`: Aramaic script, imperial administration, the satrapy model | | |
| ~515 | Aramaic in use in the northwest — literacy returns, from outside | TRANSITION | W |
| ~510 | Skylax sails the Indus for Darius | TRADE | M |
| **~500** | **Panini's Ashtadhyayi — 3,959 generative rules** | WORK | **W** |
| ~495 | Ajatashatru; the war with Vajji; siege engines | INVASION | M |
| ~490 | Pataliputra founded at the Ganga–Son confluence | FOUNDATION | W |
| ~483 | First Buddhist Council — the canon fixed orally | WORK | W |
| ~475 | Vajji falls; the republican form loses its greatest example | REFORM | W |
| ~460 | Shreni banking: guilds take deposits and lend | TRANSITION | W |
| ~450 | Herodotus reports on India from Persian sources | TRADE | M |
| ~440 | The *nigama* — market-town corporations | TRANSITION | M |
| ~430 | Silver *karshapana* standardises across the north | TRANSITION | W |
| ~413 | Shishunaga; Avanti absorbed | — | M |
| ~400 | The Sushruta surgical tradition takes shape | WORK | W |
| ~390 | Vinaya rules codified; monastic property becomes a question | REFORM | M |
| ~383 | Second Buddhist Council; the first schism | REFORM | W |
| ~370 | The *Brahmi* script emerges ‡ — **origin actively contested** | TRANSITION | **W** |
| ~360 | Kharoshthi in the northwest, derived from Aramaic | TRANSITION | W |
| ~350 | Iron production at Ujjain and Rajgir scales up | TRANSITION | M |
| 345 | Nanda: a vast standing army, heavy taxation, deep unpopularity | FOUNDATION | M |
| ~340 | The Nanda treasury becomes proverbial | TRANSITION | M |
| **327–325** | **Alexander's campaign.** Hydaspes 326; mutiny at the Beas | INVASION | **M** |
| | → `becomes`: Indo-Greek kingdoms, bilingual coinage, Gandharan synthesis | | |
| 326 | Porus and the elephant line; the last great chariot battle | INVASION | M |
| 325 | Nearchus sails the coast; the sea route is charted | TRADE | M |
| 324 | Revolt in the satrapies; the Greek garrisons fail | INVASION | M |
| 322 | Chandragupta takes Magadha | EPOCH | W |

## Era 9 · Mauryan — 322–185 BCE · 13 h · 30 events — *densest era in the game*
*Chapters: The First Empire · The Arthashastra State · Kalinga · The Edicts · The Long Peace · The Coup*

| Year | Event | Class | Mag |
|---|---|---|---|
| 322 | Mauryan foundation; the first subcontinental state | EPOCH | W |
| ~321 | Chanakya as chief minister; the Arthashastra tradition begins ‡ | WORK | W |
| ~318 | The *janapada* survey: land measured and classified | TRANSITION | W |
| ~315 | The fiscal apparatus: assessment, mines, salt, forests, monopolies | TRANSITION | W |
| ~312 | The *sita* lands — state farms worked by dependent labour | AGRICULTURE | M |
| ~310 | Espionage as an arm of government; the *gudhapurusha* | REFORM | M |
| 305–303 | Seleucid war; Kabul and Arachosia ceded for 500 elephants | INVASION | M |
| **~302** | **Megasthenes at Pataliputra; the *Indica*** | TRADE | **W** |
| ~300 | The royal road to Taxila; the Grand Trunk's ancestor | STRUCTURE | W |
| ~298 | Chandragupta abdicates; the Jain tradition at Shravanabelagola | REFORM | M |
| 297 | Bindusara; southward expansion to the Deccan | — | M |
| ~290 | Sohgaura and Mahasthan: **famine-relief inscriptions, on copper and stone** | WORK | W |
| ~285 | Irrigation as state work; the Sudarshana lake at Girnar | STRUCTURE | W |
| 268 | Ashoka accedes | — | M |
| **261** | **The Kalinga war.** ~100,000 dead by Ashoka's own count | INVASION | **W** |
| ~260 | The thirteenth rock edict: a ruler publishes his own remorse | WORK | **W** |
| **~258** | **The Major Rock Edicts — writing returns after 1,650 years** | TRANSITION | **W** |
| ~257 | The *dhamma-mahamatta*: officers of moral administration | REFORM | W |
| ~256 | Edicts in Greek and Aramaic at Kandahar | WORK | W |
| ~255 | Wells, rest-houses and shade trees along the roads | STRUCTURE | M |
| ~253 | Medical provision for people and animals, claimed in edict | REFORM | M |
| ~250 | Third Buddhist Council at Pataliputra | REFORM | W |
| ~250 | Missions to Sri Lanka, Bactria, Egypt, Macedon, Cyrene, Epirus | TRADE | **W** |
| ~250 | Sanchi begun; the stupa form established | FOUNDATION | W |
| ~250 | The Barabar caves granted to the Ajivikas — polished granite | FOUNDATION | M |
| ~240 | **Mahinda to Sri Lanka; the Pali canon leaves the mainland** | TRADE | **W** |
| ~240 | The pillar edicts; the Sarnath lion capital | WORK | W |
| 232 | Ashoka dies; the empire begins to loosen | — | W |
| ~230 | Satavahana independence in the Deccan | FOUNDATION | M |
| 185 | Pushyamitra's coup ends the Mauryas | EPOCH | M |

## Era 10 · Classical — 185 BCE–320 CE · 18 h · 44 events
*Chapters: The Fragmenting North · The Deccan Powers · Rome and the Monsoon · The Kushan Synthesis · The Sangam Age*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~185 | The Shungas; Sanchi's railings and gateways | FOUNDATION | M |
| ~180 | **Indo-Greek invasion** (Demetrius) | INVASION | M |
| ~175 | Bharhut's stupa railing — narrative relief begins | WORK | W |
| ~160 | The Yavanarajya inscription; Greek rule dated in Indian terms | WORK | M |
| ~155 | Menander; the *Milindapanha* | WORK | W |
| **~150** | **The Heliodorus pillar at Besnagar** — a Greek envoy's Vaishnava column | WORK | **W** |
| ~150 | Patanjali's *Mahabhashya* | WORK | W |
| ~150 | Tamil Brahmi inscriptions in the Madurai caves | WORK | W |
| ~130 | Junnar, Karle and Bhaja: rock-cut halls funded by merchants | FOUNDATION | W |
| ~120 | The Hathigumpha inscription; Kharavela of Kalinga | WORK | M |
| ~110 | The Sanchi donative inscriptions — hundreds of small donors named | WORK | W |
| ~100 | The Satavahanas rise; the Deccan trade routes consolidate | FOUNDATION | W |
| ~90 | **Saka (Indo-Scythian) incursions** | FRONTIER | M |
| ~70 | The Yuga Purana; astronomy meets prophecy | WORK | m |
| ~58 | The Vikrama era begins | — | m |
| ~50 | Hippalus and the monsoon route — **the crossing time halves** | TRADE | W |
| **~50** | ***Periplus of the Erythraean Sea*; the Roman trade boom** | TRADE | **W** |
| ~40 | Arikamedu: Roman amphorae and Arretine ware on the Coromandel | SITE | W |
| ~30 CE | **Kushans arrive** (Kujula Kadphises) → `becomes`: the era's great patrons | INVASION | M |
| ~50 CE | Thomas tradition; Christianity on the Malabar coast | REFORM | M |
| ~50 | Muziris: Roman gold flows in; Pliny complains about the deficit | TRADE | W |
| ~60 | The Western Satraps; dated coinage begins — unusual precision | TRANSITION | W |
| ~78 | Shaka era; Kanishka ‡ — *date contested, `window`* | — | W |
| ~80 | Fourth Buddhist Council; Mahayana crystallises ‡ | REFORM | W |
| **~100** | **Gandharan art. The first images of the Buddha** | TRANSITION | **W** |
| ~100 | The Mathura school — a parallel, independent idiom | TRANSITION | W |
| ~100 | Kanishka's coinage names Greek, Iranian and Indian deities together | TRANSITION | W |
| ~110 | Buddhism moves along the Silk Road into Central Asia and China | TRADE | **W** |
| ~120 | Ashvaghosha's *Buddhacharita* — Sanskrit kavya's first great poem | WORK | W |
| ~130 | Nasik and Karle inscriptions record guild endowments at interest | TRANSITION | W |
| ~150 | The Junagadh inscription — the first long Sanskrit inscription | WORK | W |
| ~150 | The Sudarshana lake dam repaired, and the repair recorded | STRUCTURE | M |
| ~150 | Amaravati; the Andhra stupa tradition | FOUNDATION | W |
| ~160 | Charaka's medical compendium takes form | WORK | W |
| ~180 | Yavana settlements at Kaveripattinam and Muziris | TRADE | M |
| ~200 | Nagarjuna; Madhyamaka philosophy | WORK | W |
| ~200 | Ajanta, first phase | FOUNDATION | W |
| **~200** | **The Sangam age peaks — 473 named poets, many of them women** | WORK | **W** |
| ~200 | *Tolkappiyam*; Tamil grammar and poetics codified | WORK | W |
| ~200 | *Silappatikaram* and *Manimekalai* | WORK | W |
| ~225 | Satavahana collapse; the Deccan fragments | — | M |
| ~250 | Roman trade contracts with the third-century crisis | TRADE | W |
| ~300 | The *Panchatantra* takes shape | WORK | W |
| ~300 | *Tirukkural* | WORK | W |

## Era 11 · Gupta & Post-Gupta — 320–650 · 15 h · 36 events
*Chapters: The Classical Peak · The Golden Court · Nalanda · The Huna Wars · The Southern Ascent · Harsha*

| Year | Event | Class | Mag |
|---|---|---|---|
| 320 | Gupta foundation | EPOCH | W |
| ~340 | The land-grant economy begins: revenue rights alienated, not collected | TRANSITION | **W** |
| ~350 | **The Allahabad pillar — Samudragupta names the mandala explicitly** | WORK | W |
| ~360 | The *agrahara* and *brahmadeya*: knowledge acquires an endowment | TRANSITION | W |
| 375–415 | Chandragupta II; Kalidasa at court | WORK | W |
| ~380 | *Abhijnanashakuntalam*, *Meghaduta*, *Raghuvamsha* | WORK | W |
| 399–414 | Faxian travels India and writes it down | TRADE | W |
| ~402 | The Iron Pillar of Delhi — unrusted for 1,600 years | TRANSITION | W |
| 405 | Western Satraps annexed; the Gujarat ports acquired | — | M |
| **~415** | **Nalanda founded** under Kumaragupta I | FOUNDATION | **W** |
| ~420 | The *Vishnu Purana* and the Puranic form | WORK | M |
| ~430 | Buddhaghosa in Sri Lanka; the *Visuddhimagga* | WORK | W |
| ~450 | Ajanta, second phase, under Vakataka patronage | FOUNDATION | W |
| ~450 | The *Kama Sutra*; the sixty-four arts as a curriculum | WORK | M |
| ~460 | The Vakataka–Gupta marriage alliance shapes the Deccan | — | M |
| **~470** | **Alchon Huna invasions begin** | INVASION | **M** |
| 484 | Skandagupta dies; Huna pressure intensifies | INVASION | M |
| **499** | **Aryabhatiya** — place-value, sine tables, a rotating earth | WORK | **W** |
| ~500 | Taxila never recovers; the northwest's scholarly centre ends | CATASTROPHE | W |
| ~505 | Varahamihira's *Panchasiddhantika* | WORK | M |
| 515 | Mihirakula; monastic destruction in the northwest | CATASTROPHE | M |
| ~530 | The Vakatakas end; the Chalukyas rise | — | M |
| 543 | Chalukya foundation at Badami | FOUNDATION | M |
| ~550 | Varahamihira's *Brihat Samhita* — an encyclopaedia of everything | WORK | W |
| 550 | Gupta collapse | EPOCH | M |
| ~550 | The Aihole inscription; Pallava–Chalukya rivalry opens | WORK | M |
| ~575 | Mahendravarman; Pallava rock architecture begins | FOUNDATION | W |
| ~580 | The temple as a landholding corporation | TRANSITION | **W** |
| ~600 | The Alvars and Nayanars begin; bhakti in Tamil | WORK | W |
| 606–647 | Harsha; the last great northern power before fragmentation | FOUNDATION | W |
| 618 | Pulakeshin II halts Harsha at the Narmada | INVASION | M |
| **628** | **Brahmasphutasiddhanta — zero becomes a number** | WORK | **W** |
| **629–645** | **Xuanzang studies at Nalanda; 657 texts to China** | TRADE | **W** |
| ~640 | Banabhatta's *Harshacharita* and *Kadambari* | WORK | W |
| ~640 | Mahabalipuram begun | FOUNDATION | W |
| ~645 | Nalanda at its height: reportedly thousands of students, a nine-storey library | FOUNDATION | W |

## Era 12 · Regional Kingdoms — 650–850 · 10 h · 26 events
*Chapters: The Tripartite Struggle · The Bhakti Turn · Shankara · The Temple Age Opens*

| Year | Event | Class | Mag |
|---|---|---|---|
| 650 | Fragmentation; the regional kingdom becomes the norm | EPOCH | W |
| ~660 | Vagbhata's *Ashtanga Hridayam* | WORK | M |
| ~670 | Dandin's *Kavyadarsha* — Indian poetics as an export good | WORK | W |
| ~675 | The Shore Temple; Pallava structural architecture | FOUNDATION | W |
| ~680 | Appar, Sambandar and Sundarar; the *Tevaram* | WORK | W |
| ~700 | Bhakti moves along the pilgrimage roads — knowledge distributed by walking | REFORM | **W** |
| **712** | **Arab conquest of Sindh** (Muhammad bin Qasim) | INVASION | **M** |
| | → `becomes`: a durable trade and scholarly link to the Abbasid world | | |
| ~715 | Andal, the one woman among the twelve Alvars | WORK | W |
| ~725 | Elephanta | FOUNDATION | W |
| ~730 | Gurjara-Pratihara; the struggle for Kannauj opens | FOUNDATION | W |
| 736 | Delhi founded by the Tomaras | FOUNDATION | R |
| ~740 | Kailasanatha at Kanchi; the Pallava high style | FOUNDATION | M |
| ~750 | Pala foundation; Buddhist patronage in Bengal | FOUNDATION | W |
| 753 | Rashtrakuta; Ellora Kailasa begun | FOUNDATION | W |
| ~760 | Odantapuri founded | FOUNDATION | M |
| **771** | **Indian numerals and Brahmagupta reach Baghdad** | TRADE | **W** |
| ~775 | Al-Fazari's Sanskrit-to-Arabic astronomy | WORK | W |
| ~783 | Vikramashila founded; Nalanda at its height | FOUNDATION | W |
| **788–820** | **Adi Shankara; Advaita and the four mathas** | REFORM | **W** |
| ~790 | The *matha* as an institution designed to outlive its founder | REFORM | W |
| ~800 | The Kailasa temple completed after a century of excavation | FOUNDATION | W |
| ~800 | The Chera Perumals of Makotai | FOUNDATION | M |
| ~810 | Bhavabhuti and the mature Sanskrit stage | WORK | M |
| **~825** | **The Ayyavole 500 and Manigramam — merchant guilds with charters** | TRADE | **W** |
| ~830 | The *Bhagavata Purana* takes form | WORK | W |
| ~840 | The Pratihara–Pala–Rashtrakuta struggle exhausts all three | INVASION | W |

## Era 13 · The Chola Age — 850–1279 · 18 h · 48 events
*Chapters: Vijayalaya's Foundation · The Assemblies · The Great Temples · The Ganges and the Sea · The Chalukya Wars · The Long Decline*

| Year | Event | Class | Mag |
|---|---|---|---|
| **850** | **Vijayalaya takes Thanjavur. The Chola revival** | EPOCH | **W** |
| ~860 | The *nadu* and *brahmadeya*: two parallel systems of local order | TRANSITION | W |
| ~871 | Aditya I; the Pallavas absorbed | — | M |
| ~880 | Temple-centred land transactions begin to be inscribed at scale | WORK | **W** |
| ~890 | Sembiyan Mahadevi's endowments; a queen as institutional patron | REFORM | W |
| ~907 | Parantaka I; the Pandyas defeated at Vellur | INVASION | M |
| ~910 | The Chola–Pandya wars open a two-century rivalry | INVASION | M |
| **~920** | **The Uttaramerur inscriptions — village committee election by lot** | WORK | **W** |
| | *Eligibility rules, term limits, disqualification for unaudited accounts.* | | |
| ~930 | The *variyam* system: committees for tanks, gardens, gold, justice | REFORM | W |
| ~940 | Village assemblies (*sabha*, *ur*) manage irrigation shares | REFORM | W |
| ~949 | Takkolam; the Rashtrakutas check Chola expansion | INVASION | M |
| ~960 | Temple treasuries begin lending at interest to villages | TRANSITION | W |
| ~980 | Uttama Chola; audit procedure documented | REFORM | M |
| **985** | **Rajaraja I accedes** | — | **W** |
| ~990 | The great land survey — assessment village by village | TRANSITION | W |
| ~993 | The conquest of Sri Lanka begins; Anuradhapura taken | INVASION | W |
| ~1000 | Revenue classified by soil, water access and crop | TRANSITION | W |
| ~1005 | The Kerala and Pandya campaigns | INVASION | M |
| **1010** | **The Brihadeeswarar temple at Thanjavur completed** | FOUNDATION | **W** |
| ~1010 | Its inscriptions name 400 dancers, singers and staff — individually | WORK | **W** |
| ~1012 | The temple as employer, landlord, bank and archive at once | TRANSITION | W |
| 1014 | Rajendra I accedes | — | W |
| ~1017 | Ramanuja born; the Srivaishnava tradition takes shape | REFORM | W |
| ~1018 | The Sri Lanka campaign completed; Polonnaruwa made capital | INVASION | M |
| **~1023** | **The Ganges expedition; Gangaikonda Cholapuram founded** | INVASION | **W** |
| ~1024 | Ganges water carried south in golden pots — sovereignty as ritual | REFORM | W |
| **1025** | **The naval expedition to Srivijaya** | TRADE | **W** |
| ~1030 | Embassies to Song China; the Quanzhou trade | TRADE | W |
| ~1035 | Chola bronze casting at its height; the Nataraja form matures | WORK | **W** |
| ~1040 | The Chola–Chalukya wars over Vengi and the Tungabhadra | INVASION | W |
| ~1050 | Gangaikondacholapuram temple completed | FOUNDATION | W |
| ~1060 | The Ayyavole guild operates from Java to the Persian Gulf | TRADE | W |
| ~1070 | **Kulottunga I; the Chola–Chalukya union** | — | W |
| ~1077 | An embassy of seventy-two merchants reaches the Song court | TRADE | W |
| **~1080** | **Kulottunga abolishes tolls — *Sungam Tavirtta*** | REFORM | **W** |
| ~1090 | Airavatesvara at Darasuram begun | FOUNDATION | M |
| ~1100 | Ramanuja at Srirangam; temple administration reformed | REFORM | W |
| ~1110 | Temple entry disputes recorded in inscription | REFORM | W |
| ~1120 | Kalingattuparani; war poetry as court literature | WORK | M |
| ~1130 | **Basava and the Sharanas; vachana poetry by artisans and washerwomen** | REFORM | **W** |
| ~1140 | Akka Mahadevi; a woman's voice at the centre of a movement | WORK | W |
| ~1148 | **Rajatarangini — the first Indian work that is recognisably history** | WORK | W |
| ~1150 | **Bhaskara II: *Lilavati* and *Siddhanta Shiromani*** | WORK | W |
| ~1150 | Kamba Ramayanam — not a translation but a rival | WORK | W |
| ~1150 | Hoysaleswara; the Hoysala style | FOUNDATION | W |
| ~1170 | The Kakatiyas and tank irrigation across the Telangana uplands | STRUCTURE | W |
| ~1190 | Pandya resurgence; Chola territory contracts | — | M |
| 1191 | First Tarain — Prithviraj wins | INVASION | R |
| **1192** | **Second Tarain. The hinge of the medieval period** | INVASION | **W** |
| **1193** | **Nalanda sacked. Vikramashila and Odantapuri follow** | CATASTROPHE | **W** |
| 1206 | The Delhi Sultanate founded | FOUNDATION | W |
| ~1250 | The Konark Sun Temple | FOUNDATION | W |
| 1279 | **The last Chola. The focus period closes** | EPOCH | W |

> **Why the Cholas carry 18 hours.** No other pre-modern Indian polity left a comparable
> record: tens of thousands of temple inscriptions documenting land transactions, assembly
> procedure, irrigation shares, endowments, and named individuals. Uttaramerur describes
> election to a village committee **by lot, with eligibility rules and term limits.** The
> Thanjavur temple lists its staff by name. This is the one era where the game can operate
> at village resolution on real data — and it is a maritime empire with a fleet at
> Srivijaya and embassies to Song China. It is the strongest content in the timeline.

---

# Part 3B — Regional Spines · +250 events

**The fix for the biggest gap in the draft.** Part 3 is a Gangetic-and-Indus timeline; a
Chola, Kannada or Ahom player would live through somebody else's event feed. Each region
gets a parallel track that runs the whole focus period.

**How they compose.** A campaign surfaces (a) all `W`-magnitude subcontinental events from
Part 3, (b) the player's own regional spine in full, and (c) neighbouring spines filtered
to `M` and above. So a Tamil player hears about the Kalinga war and Nalanda burning — but
lives through Keeladi, Kodumanal, the Kalabhra interregnum and Uttaramerur.

Running total: **496 + 250 = 746 ancient events**, plus 41 in the skim = **787**. Target ~1,150.

---

### Tamilakam — 39 events
*The south is not a periphery. It has iron a millennium before the Ganga plain.*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~2172 BCE | Iron at Mayiladumparai ‡ — oldest AMS-dated in India | TRANSITION | W |
| ~1510 | Iron at Mangadu, Salem ‡ | TRANSITION | M |
| ~1380 | Adichanallur urn burials begin | SITE | W |
| ~1000 | Megalithic cists and dolmens across Kongu | REFORM | M |
| ~800 | Paddy and tank irrigation in the Kaveri delta | AGRICULTURE | W |
| ~700 | The *tinai* landscape scheme: five ecologies, five poetic modes | WORK | W |
| ~600 | Korkai: pearl fishery and port | SITE | M |
| **~585** | **Keeladi: urban settlement on the Vaigai** ‡ — *live dispute* | SITE | **W** |
| ~500 | Porunthal and Kodumanal: graffiti, then Tamil-Brahmi ‡ | WORK | W |
| ~450 | Kodumanal: gem cutting, iron and high-carbon steel | SITE | W |
| ~400 | Kaveripattinam (Puhar) founded | SITE | M |
| ~300 | **Tamil-Brahmi cave inscriptions near Madurai** | WORK | W |
| ~300 | The Sangam age opens | WORK | W |
| ~250 | Ashokan edicts name the Cholas, Pandyas and Keralaputras | WORK | W |
| ~200 | The three crowned kings: Chera, Chola, Pandya | FOUNDATION | W |
| ~150 | Muziris and Korkai on the Roman circuit | TRADE | W |
| ~100 | Karikala Chola; the Kallanai dam on the Kaveri ‡ | STRUCTURE | W |
| ~50 CE | Arikamedu: amphorae, Arretine ware, a Yavana quarter | SITE | W |
| ~100 | Pattinappalai and the Puhar poems | WORK | M |
| ~150 | *Silappatikaram*: a merchant's wife burns Madurai down | WORK | W |
| ~200 | *Tolkappiyam*; grammar and poetics codified | WORK | W |
| ~200 | *Ettuthokai* and *Pattuppattu* — 2,381 poems, 473 poets | WORK | W |
| ~250 | Auvaiyar; women poets across the anthologies | WORK | W |
| ~300 | *Tirukkural* | WORK | W |
| ~350 | **The Kalabhra interregnum** ‡ — the "dark age", poorly evidenced | INVASION | W |
| ~450 | Jain and Buddhist institutions flourish under the Kalabhras | REFORM | M |
| ~575 | Kadungon; the Pandya revival | FOUNDATION | M |
| ~600 | Pallava–Pandya wars begin | INVASION | M |
| ~630 | Mahendravarman's *Mattavilasa Prahasana* — a satire by a king | WORK | M |
| ~650 | Appar and the Shaiva turn; Jainism loses royal favour | REFORM | W |
| ~675 | The Shore Temple at Mahabalipuram | FOUNDATION | W |
| ~700 | The Nayanars and Alvars; bhakti on the pilgrimage roads | WORK | W |
| ~715 | Andal — the one woman among the twelve Alvars | WORK | W |
| ~740 | Kailasanatha at Kanchi | FOUNDATION | M |
| ~780 | Nandivarman III; the Pallava high style closes | — | M |
| ~800 | The *Divya Prabandham* compiled | WORK | W |
| ~830 | Manikkavachakar's *Tiruvasagam* | WORK | W |
| 850 | Vijayalaya takes Thanjavur → *Era 13 carries the rest* | EPOCH | W |
| ~1150 | Kamba Ramayanam — a rival, not a translation | WORK | W |

### Karnataka — 30 events
*The oldest ashmounds, and the first Kannada sentence.*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~4500 BCE | Utnur ashmound: cattle penned and dung burned for centuries | SITE | W |
| ~4400 | Kodekal, Kupgal; the ashmound belt | SITE | M |
| ~4350 | Kupgal's rock gongs — struck boulders, an acoustic site | WORK | M |
| ~3400 | Sanganakallu; the Karnataka Neolithic matures | SITE | M |
| ~3350 | Brahmagiri and Piklihal | SITE | M |
| ~3350 | Browntop and bristley foxtail millet domesticated | AGRICULTURE | W |
| ~1400 | Hallur: iron in Karnataka | TRANSITION | W |
| ~915 | Maski; the megalithic-to-historic sequence | SITE | M |
| ~250 | **The Maski edict — the only one naming Ashoka personally** | WORK | W |
| ~250 | Ashokan edicts at Brahmagiri, Jatinga-Rameshwara, Siddapura | WORK | W |
| ~230 | Satavahana authority reaches the Tungabhadra | — | M |
| ~300 CE | Banavasi under the Chutus | SITE | M |
| 345 | **Kadamba founded at Banavasi** — the first Kannada-region dynasty | FOUNDATION | W |
| ~350 | Western Ganga at Talakad; Jain patronage | FOUNDATION | M |
| **~450** | **The Halmidi inscription — the earliest Kannada text** | WORK | **W** |
| 543 | Chalukya foundation at Badami | FOUNDATION | W |
| ~600 | Aihole: 125 temples; an architectural laboratory | FOUNDATION | W |
| ~634 | The Aihole inscription of Ravikirti | WORK | W |
| ~700 | Pattadakal; northern and southern styles built side by side | FOUNDATION | W |
| 753 | Rashtrakuta; the Deccan becomes the arbiter of the north | FOUNDATION | W |
| ~800 | Ellora Kailasa completed | FOUNDATION | W |
| ~850 | ***Kavirajamarga*** — the earliest surviving Kannada literary work | WORK | **W** |
| ~940 | Pampa's *Vikramarjuna Vijaya*; the "three gems" of Kannada | WORK | W |
| 973 | Western Chalukya at Kalyani | FOUNDATION | M |
| **983** | **Gommateshwara at Shravanabelagola — 17 m from a single rock** | FOUNDATION | **W** |
| 1026 | Hoysala foundation | FOUNDATION | M |
| ~1100 | Vijnaneshwara's *Mitakshara* — the standard commentary on Hindu law | WORK | W |
| **~1130** | **Basava and the Sharanas; the Anubhava Mantapa** | REFORM | **W** |
| ~1140 | Akka Mahadevi; vachanas by weavers, potters, washerwomen | WORK | W |
| ~1150 | Belur and Halebidu; the Hoysala style | FOUNDATION | W |

### Andhra & Telangana — 22 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~2000 BCE | The southern Neolithic reaches the Krishna–Tungabhadra doab | SITE | M |
| ~1100 | Megalithic burials across Telangana | REFORM | M |
| ~500 | Dhulikatta and Kotalingala: early urban centres | SITE | M |
| ~230 | Satavahana independence | FOUNDATION | W |
| ~150 | Amaravati stupa begun | FOUNDATION | W |
| ~100 | The Krishna valley trade route to the coast | TRADE | M |
| ~50 CE | Gautamiputra Satakarni; the Satavahana peak | — | W |
| ~150 | The Amaravati marbles; a distinct narrative idiom | WORK | W |
| ~225 | Ikshvakus at Nagarjunakonda | FOUNDATION | M |
| ~250 | Nagarjunakonda's Buddhist university and stadium | FOUNDATION | W |
| ~300 | Bavikonda and Thotlakonda; the coastal monasteries | SITE | M |
| ~575 | Eastern Chalukya at Vengi | FOUNDATION | M |
| ~630 | The Kalamalla inscription — early Telugu | WORK | W |
| ~848 | Telugu inscriptions multiply under the Rashtrakutas | WORK | M |
| ~1000 | **Nannaya's *Andhra Mahabharatamu* — Telugu literature begins** | WORK | **W** |
| ~1070 | Kulottunga unites Chola and Eastern Chalukya lines | — | W |
| 1083 | **Kakatiya foundation** | FOUNDATION | W |
| ~1170 | Tank irrigation transforms the Telangana uplands | STRUCTURE | W |
| ~1200 | Ramappa temple; floating brick and sandbox foundations | FOUNDATION | W |
| ~1262 | **Rani Rudrama Devi rules in her own name** | — | W |
| ~1290 | Palkuriki Somanatha; Telugu devotional literature | WORK | M |
| 1323 | Kakatiya falls to the Tughlaqs | CATASTROPHE | W |

### Kerala — 18 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~1000 BCE | Megalithic urn and rock-cut chamber burials | REFORM | M |
| ~300 | Black pepper enters long-distance trade | TRADE | W |
| ~200 | The Chera line; Vanchi and the Periyar | FOUNDATION | M |
| ~50 CE | **Muziris: Roman gold in, pepper out** | TRADE | W |
| ~52 | Thomas tradition; the Malabar Christian community | REFORM | W |
| ~100 | The Muziris papyrus records a single cargo's value | TRADE | W |
| ~200 | *Chilappatikaram*'s Chera chapters | WORK | M |
| ~600 | Jewish and Christian merchant settlements attested | TRADE | M |
| ~800 | The Chera Perumals of Makotai | FOUNDATION | W |
| **849** | **The Tarisappalli copper plates — a grant to a Christian church** | WORK | **W** |
| ~1000 | The Jewish copper plates of Bhaskara Ravi Varman | WORK | W |
| ~1000 | The *Manipravalam* register: Sanskrit and Malayalam fused | WORK | W |
| ~1090 | The Chola wars exhaust the Cheras | INVASION | M |
| 1102 | **The Chera Perumals end; Kerala fragments into chiefdoms** | EPOCH | W |
| ~1200 | Calicut rises; the Zamorin and the pepper trade | FOUNDATION | W |
| ~1340 | **Madhava of Sangamagrama founds the Kerala school** | WORK | **W** |
| ~1400 | Infinite series for π, sine and cosine — with proofs | WORK | W |
| 1498 | Vasco da Gama at Calicut | COLONIAL | W |

### Bengal & Vanga — 21 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~1500 BCE | Pandu Rajar Dhibi; the Bengal Chalcolithic | SITE | M |
| ~700 | Iron and rice in the lower Ganga delta | TRANSITION | M |
| ~450 | **Wari-Bateshwar: an early urban centre** ‡ | SITE | W |
| ~400 | Chandraketugarh; terracotta of astonishing quality | SITE | W |
| ~300 | **Mahasthangarh: the earliest inscription in Bengal** | WORK | W |
| ~250 | Pundravardhana under Mauryan administration | — | M |
| ~150 | Gangaridai in Greek and Roman accounts | TRADE | M |
| ~350 CE | Samatata and Vanga as distinct polities | FOUNDATION | M |
| ~450 | Copper-plate land grants proliferate | TRANSITION | W |
| ~600 | **Shashanka of Gauda; the Bengali era** ‡ | FOUNDATION | W |
| ~750 | **Gopala elected king — the Pala foundation, by assembly** | FOUNDATION | **W** |
| ~770 | Dharmapala; Vikramashila and Somapura founded | FOUNDATION | W |
| ~800 | Somapura Mahavihara at Paharpur — the largest south of the Himalaya | FOUNDATION | W |
| ~850 | The Pala school of bronze and manuscript painting | WORK | W |
| ~1000 | Atisha Dipankara leaves for Tibet | TRADE | **W** |
| ~1050 | Pala Buddhism transmits wholesale to Tibet | TRADE | W |
| ~1070 | The Senas; brahmanical reordering | FOUNDATION | M |
| ~1100 | **The *Charyapada* — the earliest Bengali (and Assamese, and Odia) verse** | WORK | **W** |
| ~1170 | Jayadeva's *Gita Govinda* | WORK | W |
| 1204 | Bakhtiyar Khalji takes Nadia | INVASION | W |
| 1352 | The Bengal Sultanate; a distinct literary patron | FOUNDATION | W |

### Odisha & Kalinga — 17 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~1200 BCE | Golbai Sasan; the Odishan Chalcolithic | SITE | M |
| ~700 | **Sisupalgarh: a fortified city, laid out on a grid** | SITE | W |
| ~400 | Kalinga's maritime trade to Southeast Asia begins | TRADE | W |
| **261** | **The Kalinga war** | INVASION | **W** |
| ~260 | The separate Kalinga edicts — Ashoka addresses the conquered | WORK | W |
| ~150 | **Kharavela and the Hathigumpha inscription** | WORK | W |
| ~150 | Udayagiri and Khandagiri caves | FOUNDATION | M |
| ~100 CE | *Bali Jatra*: the sailing season to Java and Bali | TRADE | W |
| ~400 | Mathara and Sailodbhava lines | FOUNDATION | M |
| ~600 | Shaivism and Buddhism share royal patronage | REFORM | M |
| ~750 | Ratnagiri, Lalitagiri, Udayagiri — the Buddhist diamond triangle | FOUNDATION | W |
| ~800 | Vajrayana schools flourish in coastal Odisha | REFORM | W |
| 1078 | **The Eastern Gangas** | FOUNDATION | W |
| **1161** | **The Jagannath temple at Puri completed** | FOUNDATION | **W** |
| ~1200 | The Jagannath cult absorbs tribal, Jain and Buddhist strands | REFORM | W |
| **~1250** | **Konark; the Sun Temple as a stone chariot** | FOUNDATION | **W** |
| 1434 | The Gajapatis | FOUNDATION | M |

### Assam & the Northeast — 20 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~2500 BCE | Daojali Hading; the eastern Neolithic, shouldered celts | SITE | W |
| ~2000 | Rice cultivation along the Brahmaputra | AGRICULTURE | W |
| ~1500 | *Jhum* (shifting cultivation) established in the hills | AGRICULTURE | W |
| ~1000 | Khasi megaliths; monoliths raised for the dead | REFORM | W |
| ~500 | Terraced wet-rice cultivation begins in the Naga hills | AGRICULTURE | W |
| ~350 CE | **Kamarupa; the Varman dynasty** | FOUNDATION | W |
| ~400 | The Umachal and Nagajari-Khanikargaon inscriptions | WORK | M |
| ~33 CE | Manipur: the Ningthouja line, by traditional chronology ‡ | FOUNDATION | M |
| ~600 | **Bhaskaravarman; Xuanzang visits his court** | — | W |
| ~640 | The Nidhanpur copper plates | WORK | M |
| ~800 | Silk and lac from Kamarupa reach the Gangetic markets | TRADE | M |
| ~900 | The Pala line of Kamarupa | FOUNDATION | M |
| ~1000 | The Kamakhya temple tradition; Tantric transmission | REFORM | W |
| ~1100 | Kamarupa fragments; the Chutiya and Kachari rise | FOUNDATION | M |
| **1206** | **Bakhtiyar Khalji's Tibet expedition destroyed in the hills** | INVASION | **W** |
| **1228** | **Sukaphaa crosses the Patkai — the Ahom kingdom begins** | FOUNDATION | **W** |
| ~1250 | The *paik* system: labour service as the basis of the state | TRANSITION | W |
| ~1280 | Twipra (Manikya) in the Tripura hills | FOUNDATION | M |
| ~1400 | **The *buranji* chronicle tradition begins — history as state practice** | WORK | **W** |
| ~1450 | Sankardev; the Ekasarana movement and Assamese literature | REFORM | W |

### Kashmir — 16 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~3000 BCE | Burzahom: pit dwellings, and a carved hunting scene | SITE | W |
| ~2500 | Gufkral; the Kashmir Neolithic's second centre | SITE | M |
| ~1500 | Contact with the Swat valley and Central Asia | TRADE | M |
| ~250 | Ashoka founds Srinagari (per Kalhana) ‡ | FOUNDATION | M |
| ~78 CE | **The Fourth Buddhist Council under Kanishka** ‡ | REFORM | W |
| ~200 | Kashmir becomes the Sarvastivada heartland | REFORM | W |
| ~400 | Kashmiri monks carry texts to Central Asia and China | TRADE | W |
| ~625 | The Karkota dynasty | FOUNDATION | M |
| **724** | **Lalitaditya Muktapida; the Martand sun temple** | FOUNDATION | W |
| ~855 | Avantivarman; Suyya's engineering drains the Jhelum floods | STRUCTURE | W |
| ~900 | Anandavardhana's *Dhvanyaloka* — poetics as philosophy | WORK | W |
| **~975** | **Abhinavagupta; Kashmir Shaivism and the *Tantraloka*** | WORK | **W** |
| ~1000 | The *Kathasaritsagara*'s Kashmiri court patronage | WORK | W |
| **1148** | **Kalhana's *Rajatarangini*** | WORK | **W** |
| ~1200 | Kashmiri Sanskrit scholarship at its widest influence | WORK | W |
| 1339 | The Kashmir Sultanate | FOUNDATION | W |

### Gujarat & Saurashtra — 18 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~3300 BCE | The Anarta tradition; Padri salt production | SITE | M |
| ~2600 | **Dholavira on Khadir island; sixteen reservoirs** | SITE | W |
| ~2450 | Lothal's basin and bead factory | SITE | W |
| ~2400 | Gola Dhoro and Nageshwar; shell and bead workshops | SITE | M |
| ~1900 | Rangpur and Rojdi; the longest Harappan continuity | SITE | W |
| ~1500 | Millet agriculture reshapes Saurashtra | AGRICULTURE | M |
| ~300 | Junagadh under Mauryan governors | — | M |
| ~300 | **The Sudarshana lake dam built under Chandragupta** | STRUCTURE | W |
| ~150 CE | **Rudradaman's Junagadh inscription — the dam repaired, and recorded** | WORK | W |
| ~200 | Bharuch (Barygaza) on the Roman circuit | TRADE | W |
| 475 | **The Maitrakas; Valabhi becomes a university** | FOUNDATION | W |
| ~640 | Xuanzang reports 6,000 monks at Valabhi | TRADE | W |
| ~780 | Valabhi sacked; the university ends | CATASTROPHE | W |
| 941 | The Chaulukyas (Solankis) | FOUNDATION | M |
| 1026 | Somnath raided by Mahmud of Ghazni | INVASION | W |
| **1031** | **The Dilwara temples at Mount Abu** | FOUNDATION | W |
| ~1100 | **Hemachandra; Jain scholarship and the *Siddha-Hema*** | WORK | **W** |
| ~1150 | Jain merchant capital funds libraries — the *bhandaras* | TRANSITION | **W** |

### Maharashtra & the western Deccan — 20 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~1600 BCE | **The Daimabad bronzes** | WORK | W |
| ~1500 | Inamgaon: irrigation channel, chief's house, granary | SITE | W |
| ~1350 | Jorwe settlements contract; a regional drought ‡ | CLIMATE | M |
| ~230 | Satavahana independence; the Deccan trade routes | FOUNDATION | W |
| ~150 | **Karle, Bhaja, Bedse — rock-cut halls funded by merchants** | FOUNDATION | W |
| ~130 | Guild endowments recorded at interest in the cave inscriptions | TRANSITION | W |
| ~100 CE | Nasik and Junnar; the ghat passes carry the ocean trade inland | TRADE | W |
| ~150 | Gautamiputra Satakarni's Nasik inscription | WORK | M |
| ~250 | The Vakatakas | FOUNDATION | M |
| ~450 | **Ajanta's second phase under Vakataka patronage** | FOUNDATION | W |
| ~600 | Ellora begun; Buddhist, Hindu and Jain caves in one cliff | FOUNDATION | W |
| 753 | The Rashtrakutas | FOUNDATION | W |
| ~800 | Ellora Kailasa completed | FOUNDATION | W |
| ~950 | The Shilaharas on the Konkan coast | FOUNDATION | M |
| 1187 | The Yadavas of Devagiri | FOUNDATION | M |
| ~1250 | The Mahanubhava sect; prose in Marathi | WORK | W |
| **~1290** | **Jnaneshwar's *Jnaneshwari* — Marathi literature arrives** | WORK | **W** |
| ~1300 | Namdev; the Varkari pilgrimage to Pandharpur | REFORM | W |
| 1296 | Devagiri raided by Alauddin Khalji | INVASION | W |
| 1317 | The Yadavas end | — | M |

### Rajasthan & the western desert — 14 events

| Year | Event | Class | Mag |
|---|---|---|---|
| ~4500 BCE | Bagor: Mesolithic hunters adopt domestic sheep without settling | SITE | W |
| ~4200 | Balathal and Gilund; the Ahar-Banas culture | SITE | W |
| ~4200 | **Copper smelting at scale from Khetri ore** | TRANSITION | W |
| ~3100 | Kalibangan I fortified | SITE | M |
| ~3500 | The Kalibangan ploughed field | TRANSITION | W |
| ~2260 | Kalibangan: evidence read as earthquake damage ‡ | CATASTROPHE | M |
| ~2100 | The Ghaggar fails; the desert advances | CLIMATE | W |
| ~250 | The Bairat edicts; a Mauryan circular temple | WORK | M |
| ~500 CE | Zinc distillation at Zawar ‡ — **centuries before Europe** | TRANSITION | W |
| ~730 | The Gurjara-Pratiharas | FOUNDATION | W |
| ~800 | The Guhilas of Mewar; the Chauhans of Sakambhari | FOUNDATION | M |
| ~950 | Osian and the Maru-Gurjara temple style | FOUNDATION | M |
| ~1150 | Jain *bhandara* libraries at Jaisalmer and Patan | TRANSITION | W |
| 1192 | Second Tarain | INVASION | W |

### Sri Lanka — coupled external · 15 events
*Not playable, but mechanically essential: it is where the corpus survives.*

| Year | Event | Class | Mag |
|---|---|---|---|
| ~900 BCE | Anuradhapura's early settlement | SITE | M |
| ~500 | Iron, and Brahmi inscriptions on drip-ledges | TRANSITION | M |
| **~250** | **Mahinda arrives; Buddhism is transmitted** | REFORM | **W** |
| ~240 | The Mahavihara founded | FOUNDATION | W |
| ~200 | The great tanks: Basawakkulama, then Nuwara Wewa | STRUCTURE | W |
| ~161 | Dutugemunu; the Ruwanwelisaya | FOUNDATION | M |
| **~29 BCE** | **The Pali canon written down at Aluvihare** | WORK | **W** |
| | *A deliberate act of redundancy against famine and war. It works.* | | |
| ~100 CE | The Abhayagiri schism | REFORM | M |
| ~400 | Faxian spends two years copying texts | TRADE | W |
| **~430** | **Buddhaghosa; the *Visuddhimagga* and the commentaries** | WORK | **W** |
| ~460 | Sigiriya | FOUNDATION | M |
| ~800 | Sri Lankan monks carry the canon to Southeast Asia | TRADE | W |
| 993 | Chola conquest; Anuradhapura falls | INVASION | W |
| 1070 | Vijayabahu restores independence; Polonnaruwa | FOUNDATION | M |
| ~1160 | Parakramabahu I; the tank system at maximum extent | STRUCTURE | W |

> **Why Sri Lanka is in the model.** The Pali canon was committed to writing at Aluvihare
> around 29 BCE *because* famine and war threatened the reciters who carried it. It is the
> single clearest historical instance of the game's core mechanic — a redundancy decision,
> taken deliberately, that preserved a corpus which would otherwise be gone. A Magadhan
> player should be able to make the same call, and see it pay off six hundred years later.

---

## The skim — 1279 to 1947 · 37 h · 18% · 41 events

Deliberately thin. These centuries are the ones a player most likely already knows.
Systems all run; event density drops roughly 5× and chapters coarsen.

### Era 14 · Delhi & Vijayanagara — 1279–1526 · 14 h

1221 Genghis at the Indus · 1297–1308 Mongol invasions repelled · 1296–1316 Alauddin's
market controls · 1327 Daulatabad · 1330 token currency fails · 1333 Ibn Battuta ·
**1336 Vijayanagara founded** · 1347 Bahmani secession · **~1350 paper displaces palm
leaf — recopying costs collapse** · 1398 Timur sacks Delhi · ~1440–1518 Kabir ·
**1469 Guru Nanak** · 1486 Chaitanya · ~1520 the Kerala school's infinite series ·
**1498 Vasco da Gama at Calicut**

### Era 15 · Early Modern — 1526–1757 · 10 h

1526 First Panipat · 1540–55 Sher Shah: the rupiya, the Grand Trunk Road, revenue survey ·
1565 Talikota · **1595 the *Ain-i-Akbari*** · 1600 the East India Company chartered ·
1604 the Adi Granth · 1657 Dara Shikoh's *Sirr-i-Akbar* · 1674 Shivaji crowned ·
1699 the Khalsa · 1707 Aurangzeb dies · 1739 Nadir Shah · 1761 Third Panipat

### Era 16 · Colonial — 1757–1947 · 13 h

1757/1765 Plassey and the Diwani — **the Drain opens** · 1770 the Great Bengal Famine ·
1784–1947 colonial manuscript removal — displacement, not destruction · 1793 the
Permanent Settlement · 1835 Macaulay's Minute · 1853 railway and telegraph ·
1857/1858 the Rebellion and Crown rule · 1876–78 the Great Famine · 1885 Congress ·
1905 Partition of Bengal · 1919 Jallianwala Bagh · 1930 the Salt March · 1932 the Poona
Pact · 1943 the Bengal Famine · **1947 Independence and Partition**

---

# Part 4 — Threads

| Thread | Span | What it is |
|---|---|---|
| `THR.THE_RIVERS` | −6000 → 1900 | **Central to the ancient game.** Ghaggar-Hakra, Indus avulsions, Yamuna capture, monsoon regime. The antagonist with no face |
| `THR.THE_DOMESTICATIONS` | −6000 → −1000 | Wheat, barley, zebu, buffalo, rice, cotton, millets, sorghum |
| `THR.THE_LONG_NETWORKS` | −4850 → 1498 | Badakhshan lapis → Meluhha–Sumer → Rome → Srivijaya → the Portuguese |
| `THR.THE_WRITING_LADDER` | −3300 → 1350 | Potters' marks → Indus script → 1,650 years of silence → Brahmi → palm leaf → paper |
| `THR.THE_CORPUS_AT_RISK` | −1300 → 1947 | Every catastrophe, every rescue |
| `THR.THE_ASSEMBLIES` | −1030 → 1279 | *sabha* → gana-sangha → *shreni* → Uttaramerur's ballot |
| `THR.THE_INTERNAL_FRONTIER` | −4500 → 1947 | Forest and hill peoples; the treeline as border |
| `THR.THE_MONETARY_LADDER` | −660 → 1540 | Bent-bar silver → punch-marked → tanka → rupiya |
| `THR.THE_RENOUNCERS` | −600 → 1699 | Buddhist, Jain, Ajivika → bhakti → Sikh |
| `THR.THE_NORTHWEST_GATE` | −518 → 1761 | Fourteen invasions, one corridor, 2,279 years |
| `THR.THE_MANDALA` | −300 → 1858 | Graded sovereignty, Arthashastra to paramountcy |
| `THR.THE_TEMPLE_ECONOMY` | 340 → 1800 | Land grants, treasuries, lending, pilgrimage, endowment |
| `THR.THE_TRANSLATORS` | −250 → 1947 | Mahinda, Xuanzang, Baghdad, Al-Biruni, Dara Shikoh, Jones |
| `THR.THE_CASTE_QUESTION` | −960 → 1947 | The four-varna hymn → renouncers → bhakti → Basava → Ambedkar |
| `THR.THE_FAMINE_CENTURY` | 1770 → 1943 | Compressed into the skim |

**`THR.THE_ASSEMBLIES`** is the sleeper. From the Vedic *sabha* through the gana-sangha
republics and the merchant *shreni* to Uttaramerur's election by lot around 920 — a
2,300-year arc about self-government that most players do not know exists, sitting
squarely in the emphasised period.

---

# Part 5 — What to build

## 5.1 Files

```
tools/build-timeline.mjs        generator + validator
data/timeline/timeline.json     eras, chapters, events, threads, occupations, cadence
packages/schema/timeline.schema.json
docs/07-timeline.md             this document, as repo documentation
```

## 5.2 Validation the generator must enforce

1. Every event's year falls inside its chapter; every chapter inside its era.
2. Every reference resolves — cross-checked against `data/polities/polities.json` and
   `data/corpus/works.json`.
3. `trigger` consistent with `certainty`: nothing below 0.9 may be `dated`.
4. Every `INVASION` has a `becomes` field, even if the value is `"nothing"`.
5. Every event with `dispute` populated has `certainty` < 0.9 and at least two sources.
6. Cadence hours sum to 210; **pre-1300 share ≥ 80%** — asserted, so the emphasis cannot
   silently drift back.
7. **No era goes more than 20 minutes of play without an authored event.** At current
   counts Eras 1, 2 and 5 still fail; that is where the next writing goes.

## 5.3 How the remaining ~450 ancient events get written

Not by invention. There is a systematic source base:

- **`SITE` events** — *Indian Archaeology: A Review* (ASI annual, 1953–), site monographs,
  and the standard excavation reports. Each excavated site yields foundation, peak,
  transition and abandonment events with published dates and error bars.
- **`TRANSITION` events** — archaeometallurgy and archaeobotany literature: first
  appearances of crops, alloys, techniques, with AMS dates.
- **`CLIMATE` events** — speleothem records, lake cores, and the palaeo-channel literature
  on the Ghaggar-Hakra and Indus.
- **`WORK` events** — the 89 already in `data/corpus/works.json`, plus the standard
  literary histories.
- **Epigraphic events, 300 BCE onward** — *Epigraphia Indica*, *South Indian
  Inscriptions*, *Epigraphia Carnatica*. **The Chola corpus alone runs to tens of
  thousands of published inscriptions**, which is why Era 13 can be densest on real data.

Thin stretches then get **procedural events** seeded by region and era: a drought, a good
harvest, a herd lost, a feud, a travelling storyteller, a manuscript rotting, a river
shifting its bed. In the ancient eras these carry most of the texture — 173 hours of deep
past cannot run on authored events alone, and the procedural layer must be good.

---

# Part 6 — The Event Census, and what each event contains

## 6.1 The count

**787 events written.** Correcting a figure I stated wrongly in Part 3B: the regional
spines total **250**, not 262.

| Source | Events |
|---|---:|
| Part 3 — focus period, Eras 1–13 | 496 |
| Part 3 — skim, Eras 14–16 | 41 |
| Part 3B — regional spines | 250 |
| **Written** | **787** |
| Target | ~1,150 |
| **Remaining** | **~363** |

By era (focus period): Neolithic 42 · Late Neolithic 40 · Early Harappan 34 · **Indus 56**
· Late Harappan 38 · Early Vedic 30 · Late Vedic 32 · Second Urbanisation 40 · Mauryan 30
· Classical 44 · Gupta 36 · Regional Kingdoms 26 · **Chola 48**

By region: Tamilakam 39 · Karnataka 30 · Andhra 22 · Bengal 21 · Assam & NE 20 ·
Maharashtra 20 · Kerala 18 · Gujarat 18 · Odisha 17 · Kashmir 16 · Sri Lanka 15 ·
Rajasthan 14

**The exact `W`/`M`/`R`/`m` split needs the generator to count** — roughly 300 `W` and 250
`M` by eye, but I am not going to state a precise figure I have not computed. Producing
that census is the generator's first job (Part 5.2).

## 6.2 "An infographic for each year and major event" — the arithmetic

Three different asks hide in that sentence, with three very different costs:

| Scope | Count | Hand-authored? |
|---|---:|---|
| Every year, 6000 BCE → 1947 | **7,947** | No. At 10 min each that is 1,324 hours |
| Every event | 1,150 | Marginal — ~190 hours at 10 min each |
| Every **major** (`W`) event | ~300 | **Yes. This is the achievable one** |

So: **three tiers**, and only the top one gets bespoke work.

**Tier 1 — Authored cards. ~300 `W` events.** Bespoke art plate generated through the
Magnific pipeline ([`08-visual-design.md`](08-visual-design.md) Part 2), hand-written copy, full evidence and dispute treatment. This
is the set a player will screenshot and remember.

**Tier 2 — Template cards. ~600 `M` and `R` events.** One layout, data-driven. Art is an
icon pulled from the sprite atlas, not a bespoke plate. Copy is 2 sentences. Cheap,
consistent, and indistinguishable from Tier 1 at a glance.

**Tier 3 — The year page. All 7,947 years, assembled at runtime.** Nothing pre-authored.
The page composes whatever happened that year from the event data — plus the procedural
layer (a drought, a good harvest, a manuscript rotting) and the state deltas. **This is
what makes "an infographic for every year" actually deliverable**: it is a renderer, not
7,947 documents. A quiet year gets a quiet page, which is honest — most years were quiet.

## 6.3 What an event contains — the Event Card spec

Nine slots. Word budgets are enforced by the generator, because unbounded copy is how a
1,150-card set becomes unshippable.

| Slot | Content | Budget |
|---|---|---|
| **Year + era ribbon** | Date, era name, certainty mark if `window` | — |
| **Title** | The event, named | ≤ 8 words |
| **Plate** | Tier 1: generated art. Tier 2: atlas icon | — |
| **What happened** | Plain narration. No jargon, no dates the ribbon already gave | 40–70 words |
| **Why it matters** | The consequence, in one sentence | ≤ 25 words |
| **Effects** | Pillar deltas, corpus changes, polity changes — the mechanical payload | structured |
| **Evidence** | *How we know.* Excavation, inscription, text, radiocarbon | ≤ 20 words |
| **Dispute** | Competing positions, named, when scholarship is divided | ≤ 40 words |
| **Threads** | Which arcs this belongs to; links to prior and next beats | structured |
| **Sources** | Citations | structured |

**`Evidence` is the teaching mechanism**, and it is the slot that makes this game different
from every other history game. Most games assert. This one shows its working — and in a
campaign that is 82% pre-literate, "how we know" is often more interesting than "what
happened."

### Worked example — Tier 1, `W`

> **~2200 BCE · Indus Civilisation · ~ approximate**
> ### The Rivers Turn
> *[plate: cracked riverbed, a stepped reservoir standing dry]*
>
> **What happened.** Across the northern hemisphere the climate dried, sharply and for
> centuries. In the subcontinent the monsoon weakened and the Ghaggar-Hakra — which had
> carried water past dozens of Indus towns — began to fail. Nobody attacked. The cities
> simply became harder to feed, and one by one their people moved east toward rivers that
> still ran.
>
> **Why it matters.** A civilisation can end without a conqueror.
>
> **Effects.** `AGRICULTURE −4` · `TRADE −2` · settlement drift east begins ·
> Ghaggar-cluster sites enter decline
>
> **Evidence.** Speleothem records, lake cores, and the abandonment sequence of the
> Ghaggar sites themselves.
>
> **Dispute.** How much of the Indus decline this explains is argued. Some read it as the
> principal cause; others as one pressure among several, including river avulsion and
> shifting trade.
>
> **Threads.** `THE_RIVERS` → next: *The Emptying*, ~1900 BCE

### Worked example — Tier 1, `W`

> **~920 CE · The Chola Age**
> ### The Assembly of Uttaramerur
> *[plate: a temple wall, inscription in raking light]*
>
> **What happened.** A village near Kanchipuram cut its own constitution into the walls of
> its temple. It set out who could stand for the committees that ran the tanks, the
> gardens, the gold and the courts — and how they were chosen: names on palm leaf, drawn
> from a pot by a child. It disqualified anyone who had not submitted audited accounts,
> and it capped terms.
>
> **Why it matters.** Election by lot, with eligibility rules and term limits, a thousand
> years ago, cut in stone because it was ordinary.
>
> **Effects.** `NETWORKING +3` · `CULTIVATION +2` · unlocks *variyam* committee management
>
> **Evidence.** The inscriptions themselves, still on the Vaikunta Perumal temple wall.
>
> **Threads.** `THE_ASSEMBLIES` ← prior: gana-sangha, ~590 BCE

### Worked example — Tier 2, `M`

> **~450 CE · Gupta & Post-Gupta**
> ### The Halmidi Inscription
> *[icon: inscribed stone]*
>
> **What happened.** A stone at Halmidi in Karnataka carries the oldest surviving sentence
> in Kannada — a land grant to a warrior. The language had been spoken for centuries; this
> is the moment it starts being written.
>
> **Why it matters.** A regional language enters the record and never leaves it.
>
> **Effects.** `IT +2` · Kannada becomes an available literary register
>
> **Evidence.** The Halmidi pillar, now in the Halmidi museum.
>
> **Threads.** `THE_WRITING_LADDER`

## 6.4 The writing job, scoped honestly

787 events at the budgets in 8.3 — call it 90 words of prose per card across the *What
happened*, *Why it matters*, *Evidence* and *Dispute* slots:

> **~71,000 words for what is written. ~104,000 words at the full 1,150.**

That is a short book, and it is the single largest content task in the project. It is also
the part that most needs the historian and archaeologist from Part 7's open list — the
`Evidence` and `Dispute` slots cannot be written without them.

## 6.5 What game dev needs to start

The handoff is Part 5.1, and it is small:

```
packages/schema/timeline.schema.json    the Event Card contract from 8.3
tools/build-timeline.mjs                generator + the validations in 5.2
data/timeline/timeline.json             787 events, growing
```

**Dev does not wait for all 1,150.** The schema and the generator are the contract; events
land continuously as data, exactly as `polities` and `corpus` already do. The P0 slice
(`docs/00-plan.md`) needs **twelve** of them.

---

# Part 7 — Resolved, and still open

**Resolved:** 210 hours · 6000 BCE → **1947** · 82% before 1300 · sixteen eras, thirteen
ancient · Mughal and colonial centuries become a 37-hour skim · Cholas 18 h, Indus 20 h ·
**ancient spine expanded from ~200 to 496 events.**

**Still open:**

1. **~450 ancient events remain**, plus ~150 across the skim. Method in 5.3. Eras 1, 2 and
   5 still fail the density check and should be filled first.
2. **Regional spines.** Even with the Cholas at 18 hours this is a northern timeline for
   its first five millennia. Kannada, Telugu, Bengali, Assamese, Odia, Kashmiri, Maratha
   and north-eastern chronologies each need their own — a Chola player should not live
   through a Gangetic event feed.
3. **The `dispute` list needs a specialist, and it is now long.** Indo-Aryan migration ·
   Tamil Nadu iron dates (Mayiladumparai 2172 BCE confirmed; Sivagalai 3345 BCE contested)
   · Keeladi (585 BCE, live Centre–State dispute) · the Surkotada horse · Sangam
   chronology · Brahmi's origin · the Saraswati identification · Buddha and Mahavira
   chronologies · the Kot Diji burning · the Lothal basin · the Indus "granaries".
   **Several are politically live in India today.** The game presents the argument and does
   not adjudicate — but each case needs a decision made with an archaeologist and a
   historian. **This is a P1 hiring requirement, not a footnote.**
4. **Commit this to the repo** as `docs/07-timeline.md` plus generator, schema and data —
   matching how `polities` and `corpus` already work — before it grows further.
