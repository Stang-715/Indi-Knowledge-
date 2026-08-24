# The Knowledge Economy

The core system. Everything else in this design — the map, the eras, the sovereignty
stack — is infrastructure for this.

> **Victoria 3's first economy is goods. This game's first economy is stories.**
>
> For roughly three thousand years of the campaign there is no money. A storyteller
> recites, and is fed. That is the whole market, and it is enough to build a civilisation
> on.

---

## 1. Knowledge has different physics from grain

This is not a tech tree with Sanskrit names. A **work** is an economic entity, and it
obeys rules no Victoria 3 good obeys:

| | Grain | A work |
|---|---|---|
| **Rival?** | Yes — if I eat it, you can't | **No.** I tell you the story; we both have it |
| **Excludable?** | Yes, by holding it | **Only by forgetting.** Exclusion requires that nobody else knows |
| **Destroyed by** | Consumption | **Neglect.** It dies when the last carrier dies |
| **Value on copying** | Divided | **Multiplied.** More copies means more derivation, more prestige, more patronage |
| **Upkeep** | Storage loss | **Recopying.** Palm leaf lasts ~300 years in this climate. Everything must be rewritten or it is gone |

Those five rows generate every mechanic below. Nothing here is decorative.

---

## 2. Four entities

**Work.** A composition. Has a title, a date range, a language, a subject, an attribution,
a tradition, and a set of **pillars** it feeds ([`06-pillars.md`](06-pillars.md)). It is
never deleted from the game — see §5.

**Carrier.** A thing that holds a work: a *reciter* (a person), a *manuscript*, or a
*library*. **Works exist only where carriers exist.** A work with zero carriers is not
in the world any more, even though it stays in the ledger forever.

| Carrier | Fidelity | Lifespan | Cost | Fails by |
|---|---|---|---|---|
| Reciter | Near-perfect, with the Vedic mnemonic schemes | One human life | Continuous grain | Death, famine, war |
| Palm-leaf manuscript | Copy errors accumulate | **~300 years** | One-off scribal cost, then recopying | Rot, insects, fire, damp |
| Birch bark (north) | As above | Longer in dry cold | Higher | Fire |
| Paper (from ~1200) | Better | ~700 years | Lower per copy | Fire |
| Print (from ~1550) | Exact | Long, and cheap in volume | Very low per copy | Nothing much — the endgame |

**Transmission.** Moving a work from one carrier to another. Costs grain (or later,
money), takes time, and may introduce error. This is the single most-used verb in the
game.

**Lineage.** The guru–shishya chain, the school (*shakha*, *sampradaya*, *vihara*).
A lineage is a *network* of carriers with a shared curriculum — and networks are what
make redundancy cheap.

---

## 3. The grain standard

Before coinage there is no abstract store of value, so knowledge and food trade directly
against each other. That is not a simplification; it is what patronage *was*.

```
storyteller performs  ──►  audience gives grain  ──►  storyteller lives another season
patron endows a school ──► grain flows to reciters ──► works acquire carriers
a work gains carriers  ──►  its lineage gains prestige  ──►  the patron gains standing
patron's standing      ──►  tribute, alliance, legitimacy
```

**Grain is the only currency until the Mauryas.** Punch-marked coins appear in the
Mahajanapada period and are systematised under Chandragupta — a genuine monetary
transition with real consequences:

- **Before coin:** patronage is local, personal, and perishable. You cannot save
  knowledge-value across a famine; you can only keep the reciters alive or lose them.
  This makes early-game catastrophes *brutal* in exactly the right way.
- **After coin:** endowment becomes possible. A land grant (*agrahara*, *brahmadeya*) is
  a permanent income stream attached to a school — knowledge production gets a balance
  sheet. This is why the land-grant era produces so much text.

The transition should be felt, not announced. The first time you can endow rather than
feed, the game changes shape.

---

## 4. The core loop: upkeep, not research

Most strategy games make knowledge a ratchet — once researched, yours forever. **Here it
is a maintained infrastructure with running costs, and the ratchet can slip.**

Every work with manuscript carriers accrues a **recopying obligation** on roughly a
300-year cycle. Every work with reciter carriers needs continuous feeding. A campaign
that spends everything on temples and armies will, three centuries later, find entries in
its own ledger going grey.

This is historically exact. It is also the best thing about the design, because it means:

- **You can lose ground.** Knowledge decay is a real failure state, not a theoretical one.
- **Scribes and reciters are a permanent budget line**, competing with soldiers and
  canals — a genuine guns-versus-libraries tension that runs for six thousand years.
- **Neglect kills more works than invasion ever does**, which is true, and is the
  quietest and most damning lesson the game can teach.

---

## 5. Books don't get destroyed — carriers do

> **A work is never removed from the game.** It is only ever reduced to **zero surviving
> carriers.**

When Nalanda burns in 1193, you do not lose "a library." You lose *specific named works
whose last carriers were shelved there.* Each one's entry in your ledger goes grey — and
**stays in the ledger forever**, with its title, its author, its date, its lineage, and
the year it stopped existing. You can still open it. You just cannot read it any more.

That permanent grey list is the emotional core of the game, and it is why the mechanic
that matters is **redundancy**:

```
survival_odds(work) = f(carrier_count, geographic_spread, medium_mix, lineage_health)
```

Four copies in one monastery is one copy. One copy each in Kanchi, Kashmir, Anuradhapura
and Tibet is four. **The player's real job is to make copies before the fire** — and
because history is pre-routed, Victoria 3–style, *you know the fire is coming.*

That is the design's central tension, and pre-routed history stops being a constraint and
becomes the source of dread. You have from 1000 to 1193 to get Nalanda's holdings out of
Nalanda. The clock is visible. Most players will not make it in time on their first run.

### The catastrophe ledger

Eleven events are modelled, in three kinds — and the distinction between them is
mechanical, not flavour:

- **destruction** — carriers are annihilated (Huna disruption; Ghaznavid raids;
  Nalanda, Vikramashila and Odantapuri in 1193; Timur in 1398; the Goa Inquisition).
- **displacement** — carriers survive, elsewhere (colonial manuscript removal 1784–1947;
  Partition). See §9.
- **neglect** — not an event at all. The permanent 300-year palm-leaf drain of §4, which
  costs more than every raid combined.

### Two rules for handling this honestly

The corpus data enforces both, because a game that got this wrong would deserve the
criticism it got.

1. **The same eras that destroyed also transmitted, and the data says so.** Al-Biruni
   learned Sanskrit and wrote the finest outsider ethnography of India *in the same
   decades as the Ghaznavid raids*. Dara Shikoh translated fifty Upanishads into Persian
   in 1657, and through a Latin version they reached Schopenhauer. Amir Khusrau's
   synthesis produced qawwali. Sultanate and Mughal patronage of scholarship was
   enormous. **Modelling only destruction would be false**, and it would also make a
   worse game, because destruction lands harder when it is the exception in a system
   otherwise full of transmission.
2. **Redundancy across borders is why we still have things.** Much Indian Buddhist
   scholarship survives today only in Tibetan and Chinese translation. Vasubandhu's
   *Abhidharmakosha* was lost in Sanskrit for centuries and recovered in Tibet in 1935.
   The Panchatantra's Sanskrit original is gone; the world kept the copies. The rescue
   mechanic is not a fantasy — it is the actual historical mechanism.

---

## 6. IP: attribution, lineage, and the commentary economy

"Every book has its IP" becomes a real graph. Each work carries:

- an **attribution** and an **attribution kind** — `authored`, `attributed`, `compiled`,
  `anonymous`, or `school`. Most of the corpus is *attributed*, not authored, and the
  distinction is interesting rather than inconvenient.
- a **derivation edge** to whatever it builds on. The current corpus has 47 root works,
  42 derived works and 46 edges.

And then the mechanic that makes this an economy rather than a family tree:

> **Prestige flows backward along derivation edges.** When someone writes a commentary,
> value accrues to the commentator *and to everything upstream*.

Patronise Panini's *Ashtadhyayi* in 400 BCE and you are still collecting when Patanjali
writes the *Mahabhashya* a quarter-millennium later, and again through every grammarian
after him. Investment in foundational works pays for centuries. This is historically how
Indian scholarship actually worked — the commentarial tradition (*bhashya*, *tika*,
*vritti*) is the main form scholarly production took — and as a game mechanic it is a
genuine long-horizon investment instrument, which almost nothing in the genre has.

Three derivation cases worth calling out because they teach the whole system:

- **Brihatkatha** (Gunadhya, ~200 CE) — *completely lost*. It survives only through three
  later Sanskrit adaptations, one of which is the 21,000-verse *Kathasaritsagara*. A work
  can vanish while its children thrive. The prestige graph still pays it.
- **Kamba Ramayanam** (1150s) — not a translation of Valmiki but a rival. Derivation as
  creation, and the derived work outstrips its source in its own language.
- **Yuktibhasha** (Kerala, 1530) — infinite series for π with proofs, ~200 years before
  Newton, written in Malayalam and effectively unknown outside Kerala until the 1830s.
  **The corpus's greatest failure of networking**, and a lesson the game teaches by
  letting the player make the same mistake.

---

## 7. You can actually read them

The brief said the storytelling can be read. Taken literally, and it is the right call:
it is what makes this teach history rather than gesture at it.

Opening a work shows a real passage — public-domain translation, cited, with the original
script alongside — plus its lineage, its carriers, where each copy currently is, and what
threatens them. Reading is not a codex entry you can skip. **Reading is load-bearing**:
knowing a work's contents is what unlocks the ability to commission derivations, argue in
council, and identify what is worth rescuing when you cannot rescue everything.

The corpus is chosen to make this worth doing. It is not a list of titles. It is
*Lilavati* teaching arithmetic through puzzles addressed to a girl; the Katha Upanishad's
boy arguing with Death; a merchant's wife burning down Madurai in the *Silappatikaram*;
Babur writing more about melons than battles; Tukaram's manuscripts thrown in the river
and surfacing again.

**Production note, stated once and plainly:** a substantial part of this corpus is
sacred to living communities. Use public-domain translations, attribute them, present
contested scholarship *as* contested, and get religious-studies review alongside the
historian review. This is not a legal risk so much as a matter of doing it properly.

---

## 8. Storytellers are pops

The knowledge economy needs labour, so it gets professions in the pop model
([`03-simulation.md`](03-simulation.md)) that exist from the first era to the last:

| Profession | Era | Paid in | Produces |
|---|---|---|---|
| Storyteller (*kathakar*, *pandavani*, *burrakatha*) | All | Grain, then coin | Transmission, cohesion, legitimacy |
| Reciter (*shrotriya*) | Vedic → | Grain, endowment | Fidelity: near-perfect oral carriers |
| Scribe (*lekhaka*, *kayastha*) | Mauryan → | Grain, then wage | Manuscript carriers |
| Teacher (*acharya*, *upadhyaya*) | All | Endowment | New carriers; lineage health |
| Monk-scholar | Buddhist/Jain eras | Monastic endowment | Derivation; cross-border redundancy |
| Court poet | Classical → | Patronage | Prestige, legitimacy |
| Translator | Persianate → | Patronage | Cross-tradition edges; the corpus's best insurance |
| Printer | 1550 → | Wage | Redundancy at collapsed cost |

**Storytellers are also the distribution network.** They walk pilgrimage circuits and
trade roads, which is why the **Networking** pillar and the **Trade** pillar are coupled
to knowledge rather than separate from it. A road built for grain carries stories for
free.

---

## 9. The late game is not rescue. It is repatriation.

The colonial catastrophe is a different shape, and the design should let the player feel
the difference.

From the 1780s, manuscripts are not burned — they are **collected**. Tens of thousands
enter European libraries. The books are not destroyed. They exist. They are simply
somewhere else, and you cannot read them.

So the endgame verb changes. Having spent five thousand years making copies before the
fire, you spend the last two centuries **getting things back**: cataloguing what left,
funding scholarship abroad, negotiating returns, photographing, and eventually digitising.
The 1905 recovery of the *Arthashastra* from a single Mysore palm-leaf manuscript, and
U. V. Swaminatha Iyer's one-man recovery of the Sangam anthologies in the 1880s, are both
in the corpus and both make excellent scenarios.

And there is a real closing note available: the last work in the campaign, the
Constitution of India, was handwritten and illuminated on purpose. After six thousand
years of the corpus, the founding document of the modern state was made as a manuscript.

---

## 10. Where this stands

`data/corpus/works.json` is a **first cut**: 89 works, 11 catastrophes, 8 pillars,
spanning 8000 BCE to 1950 CE, with a validated derivation graph (47 roots, 42 derived,
46 edges, no cycles).

It is a skeleton. A shipping corpus needs several hundred works, and every one of them
needs a readable passage, a citation and a licence check. What exists now is enough to
build and test the economy against, and enough to prove the shape is right.

The known gaps, stated so they don't get forgotten: Kashmiri Shaivism, the Nath and
Siddha traditions, Assamese and Odia literature, Ahom chronicles (*buranjis*), Rajput
bardic tradition, the Sufi *malfuzat*, Parsi texts, tribal oral corpora, and almost all
women's oral traditions — which are the least documented and the most likely to be
skipped by exactly this kind of project if nobody writes them down as a gap.
