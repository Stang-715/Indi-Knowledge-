# The Temporal Ladder — 4000 BCE to now

The spatial ladder has seventeen rungs ([`00-plan.md`](00-plan.md) §2). This is the other
ladder. It has thirteen.

---

## 1. The problem, stated honestly

Victoria 3's machinery — pops with professions, buildings with production methods, a
market that clears prices, interest groups, laws — assumes four things:

1. a monetised economy,
2. wage labour,
3. a state that collects tax in cash,
4. a legible administrative geography.

**In 4000 BCE, none of the four exist.** There is no state, no money, no writing, and no
one ruling anyone. Running the Victoria 3 loop there does not produce a bad simulation;
it produces a meaningless one.

The Victoria 3 model is a good fit for roughly **1757–1947 — about 3% of the timeline.**
It is a workable fit, with modification, back to about 1206. Before that it degrades, and
before about 600 BCE it does not apply at all.

So the answer is not "extend Victoria 3 across 6,000 years." It is:

> **The entities stay constant. The rules that govern them swap.**

---

## 2. The three-layer simulation

| Layer | Changes with era? | What it holds |
|---|---|---|
| **Invariant** | No — only its parameters | Terrain, climate, hydrology, soil, population, settlements, subsistence, disease, migration |
| **Extraction** | **Yes — swapped per era** | How surplus is produced and who takes it |
| **Sovereignty** | **Yes — swapped per era** | What "ruling" means, and who rules whom |

The invariant layer runs the same code from 4000 BCE to 2026. What changes is its
parameters: which crops exist, what yields are achievable, what a plough is, whether
there is iron. Population, settlement and subsistence are the continuous thread that
makes a 6,000-year campaign one campaign rather than thirteen games in a trenchcoat.

The other two layers are **modules**, selected by era. An era transition is not a
cosmetic reskin — it loads a different economic model and a different theory of
sovereignty, and migrates state across the boundary.

### Extraction models, in order

| Era | Extraction model |
|---|---|
| Neolithic → Late Harappan | **Subsistence + reciprocity.** No extraction. Surplus is stored, feasted, or traded. |
| Indus | **Redistributive network.** Standardised weights, granaries, craft specialisation, no visible extractor. |
| Vedic / Second Urbanisation | **Tribute (bali, bhaga).** Sporadic, personal, non-cash. Coinage appears late. |
| Mauryan | **Assessed land revenue.** Salaried officials, state monopolies, the Arthashastra's fiscal apparatus. |
| Classical → Gupta | **Land grants (agrahara, brahmadeya).** The state alienates revenue rights instead of collecting. |
| Early Medieval | **Grant proliferation.** Intermediary lords multiply; the "feudalism" debate lives here. |
| Sultanate | **Iqta.** Revenue assignment for military service, transferable, non-hereditary by design. |
| Mughal | **Mansabdari + zabt.** Measured, rated, cash-assessed. The Ain-i-Akbari is its ledger. |
| Colonial | **Zamindari / ryotwari / mahalwari.** Which one a district got in the 1790s–1850s decides who captures surplus for a century. |
| Republic | **Income tax, planning, then markets.** Zamindari abolition, Five-Year Plans, 1991. |

### Sovereignty models, in order

| Era | What "ruling" means |
|---|---|
| Neolithic | **Nothing.** There is no rule. The map has no owners. |
| Indus | **Network membership.** Shared norms, no centre. Modelled as affiliation strength, not ownership. |
| Vedic | **Clan and assembly.** Janapada, sabha, samiti. |
| Second Urbanisation | **Kingdom vs. gana-sangha.** Two rival forms — monarchy and oligarchic republic — actually competing. |
| Mauryan | **Provincial empire.** Governors, inspectors, edicts. The first time a line on a map means something. |
| Classical → Early Medieval | **Mandala — the circle of kings.** Graded, overlapping overlordship. Tribute without administration. |
| Sultanate | **Sultanic authority + iqta.** Central assignment, frontier autonomy. |
| Mughal | **Padshahi + mansab.** Ranked service nobility; zamindars beneath, tributary rajas alongside. |
| Colonial | **Paramountcy.** Direct rule beside 565 states with internal autonomy and no foreign policy. |
| Republic | **Federal union.** Enumerated lists, Governors, President's Rule. |

---

## 3. The thesis: sovereignty is graded, not exclusive

Victoria 3 paints each province one colour. One province, one owner. That is a
**Westphalian** model, and it is roughly true of Europe after 1648.

It is false for most of Indian history.

For the majority of these 6,000 years, "who rules here" was not a colour but a **stack**:
who works the land, who takes its revenue, who takes tribute from the one who takes the
revenue, and who claims the overlordship above that. The *Arthashastra*'s **mandala** —
the circle of kings — is an explicit theory of exactly this: sovereignty as concentric,
overlapping, and graded. A Chola inscription and a Maratha *chauth* demand and a British
subsidiary alliance are all the same shape of thing.

> **So the map does not paint an owner. It paints a stack.**
>
> Every place, at every moment, has a *holder*, a *revenue claimant*, a *tributary
> superior*, and a *paramount*. Usually several of these are the same party. When they
> are not, that is the interesting part — and it is where almost all of Indian political
> history happens.

This is why *"who ruled who"* is the correct first dataset, and why it is stored as a
**relation table** rather than as a territorial colouring. See
[`data/polities/polities.json`](../data/polities/polities.json): 146 polities, 70 rule
relations, in nine kinds — conquest, annexation, tributary, vassal, suzerainty,
paramountcy, protectorate, accession, succession.

And it unifies the design: the **paramountcy** mechanic built for the colonial era is
not a colonial special case. It is the general engine, running for six thousand years.

---

## 4. The thirteen eras

| Era | Span | Polities in the first cut | Mean confidence |
|---|---|---:|---:|
| Neolithic & Chalcolithic | 7000–3300 BCE | 3 | 0.45 |
| Early Harappan | 3300–2600 BCE | 4 | 0.53 |
| Indus Civilisation | 2600–1900 BCE | 6 | 0.60 |
| Late Harappan & Vedic | 1900–600 BCE | 8 | 0.54 |
| Second Urbanisation | 600–322 BCE | 22 | 0.65 |
| Mauryan | 322–185 BCE | 2 | 0.88 |
| Classical | 185 BCE–320 CE | 12 | 0.72 |
| Gupta & Post-Gupta | 320–650 | 11 | 0.81 |
| Early Medieval | 650–1206 | 19 | 0.84 |
| Sultanate | 1206–1526 | 23 | 0.93 |
| Mughal & Early Modern | 1526–1757 | 23 | 0.95 |
| Company & Crown | 1757–1947 | 9 | 1.00 |
| Republic | 1947– | 4 | 1.00 |

The game starts at **4000 BCE**, inside the Early Harappan era. Regenerate the table with
`node tools/build-polities.mjs`.

`era` on a polity means **era of origin**, not containment. Mewar begins in the Sultanate
era and ends in 1949; the Ahom kingdom spans six centuries and four eras. The only
invariant the validator enforces is that a polity's lifespan overlaps its declared era.

---

## 5. Confidence is the fog of war — now across time as well as space

The plan's central mechanic ([`00-plan.md`](00-plan.md) §3) was that dataset completeness
*is* the fog of war. Extending to 4000 BCE makes that dramatically more true, because the
evidence density varies by roughly **six orders of magnitude** across the timeline:

| Period | What survives | Density |
|---|---|---|
| 4000–1900 BCE | Excavated sites, radiocarbon, material culture | Points on a map, no names |
| 1900–600 BCE | Oral corpus fixed much later; archaeological horizons | Names without places |
| 600 BCE–1200 CE | Inscriptions, coins, land-grant copperplates | Bright spots in a dark field |
| 1200–1757 | Chronicles, revenue records, **Ain-i-Akbari (1595)** | Regionally dense |
| 1757–1947 | Surveys, gazetteers, decennial census | Dense |
| 1947– | Full statistical apparatus | Total |

Look at the mean-confidence column in §4: it climbs from 0.45 to 1.00 almost
monotonically. **That column is the game's opacity setting.** A 3000 BCE map should be
vague, unnamed and shifting, because that is the honest state of the evidence. A 1900 CE
map should be crisp to the village. The player experiences six thousand years of history
*coming into focus* — and that is a better feeling than any fog-of-war system anyone
would design on purpose.

The **Ain-i-Akbari** deserves a specific note: Abu'l-Fazl's 1595 revenue statistics give
subah, sarkar and pargana with assessed revenue and measured area across the empire. It
is the single richest pre-colonial administrative dataset in existence for the region,
and Irfan Habib's *An Atlas of the Mughal Empire* has already done the georeferencing.
That is the anchor for the entire Mughal era, and it should be an early pour.

---

## 6. What this changes in the existing plan

- **Period** in [`00-plan.md`](00-plan.md) §7 becomes 4000 BCE – present, not 1836–1947.
- **The colonial design is not discarded** — it becomes the best-resourced era, and the
  natural target for the vertical slice, because it has the data.
- **Caste modelling** ([`03-simulation.md`](03-simulation.md)) now spans the whole
  timeline, which makes the historian review substantially more important and more
  delicate: the origins and early history of varna and jati are actively contested
  scholarship, not settled fact. The model must represent the debate, not adjudicate it.
- **Pops** need an era-varying axis set. Language and religion do not mean the same thing
  in 2000 BCE that they mean in 1900 CE, and pretending otherwise is worse than modelling
  less.
- **Save migration** gets harder and more valuable: a campaign can now cross thirteen
  rule-set boundaries. Each transition is a documented state migration with its own
  tests.

---

## 7. Where this dataset stands

`data/polities/polities.json` is a **first cut, not scholarship.** It is:

- **A skeleton, not a survey.** 146 polities across 6,000 years — the major ones. A real
  spine needs several times that.
- **Conventional in its dating.** Where dates are disputed it takes the common textbook
  figure and marks confidence down; it does not adjudicate.
- **Not historian-reviewed.** Several entries sit on genuinely contested ground: Vedic
  chronology, the Indus decline, Satavahana origins, the "Indian feudalism" debate, and
  the whole Aryan-migration question. These need a specialist before anything ships.
- **Territorially unresolved.** It records *who* and *when* and a coarse core region. It
  does not yet record *where*, precisely — that is the georeferencing pour, and it is the
  next substantial piece of work.

What it is good for right now: it is a runnable, validated, machine-readable spine that
the era model, the sovereignty stack, and the map can all be built against — and the
validator already caught three real errors on its first run.
