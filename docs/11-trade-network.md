# The Trade Network — routes, escorts, chokes, and the missionary vector

**Implements the `Trade` and `Networking` pillars** ([`06-pillars-and-campaign.md`](06-pillars-and-campaign.md) §1),
which the pillar table already anticipated: Networking runs *kin and clan → guru lineages,
guilds, pilgrimage, monastic circuits → post, rail, press*. This document is that line,
turned into mechanics.

> **The core sentence.** Producing a good asks you a question — *send it where?* — and
> every answer you give writes one line of a network you did not plan. **The network is
> the accumulated residue of thousands of small export decisions**, not something you
> build from a menu.

---

## 1. The offer, and the plan that writes itself

**The moment any good is first produced anywhere you hold, the game offers: export, share, or keep.**
Not a menu you go looking for — a slip that arrives at the table's edge
([`08-visual-design.md`](08-visual-design.md) §7.3).

Three verbs, three different games:

| Verb | Costs | Returns | Pillar |
|---|---|---|---|
| **Keep** | nothing | consumption, stability | — |
| **Share** | the good, and nothing back | **standing** with the receiver | `Networking` |
| **Export** | the good, plus transit and escort | goods, grain, later coin | `Trade` |

**Share is not charity and it is not a worse Export.** It is how you buy the trust that
Export later requires. You cannot run a caravan through a valley whose people have never
received anything from you.

### The intent map — the game's quest log, without a quest log

Every export offer you accept is recorded as **intent**: *this good wants to go there.*
The game keeps two overlays and draws them on top of each other:

- **Where goods want to go** — your accumulated intent
- **Where goods can actually go** — routes that exist, are open, and are safe enough

> **The gap between the two overlays is your entire to-do list**, and it drew itself. A
> thick intent line with no route under it is the game saying *here is your next hundred
> years of work* without ever printing a quest.

This is what "it will slowly create a game plan for developing the network" becomes in code.

---

## 2. The trust ladder — you start with your relatives

Your first trade network is your family. Historically true, and mechanically the right
starting constraint: at 6000 BCE there is no contract, no coin, no state, and no writing.
**The only enforcement mechanism is that you know these people.**

So every route runs on a **trust basis**, and the ladder is the Networking pillar itself:

| Rung | Basis | Range | Volume | Unlocked by |
|---|---|---|---|---|
| 1 | **Kin** | one valley | tiny | start of game |
| 2 | **Neighbour** | adjacent settlements | small | repeated Share |
| 3 | **Shared shrine** | a region | moderate | a common cult, festival, or pilgrimage |
| 4 | **Marriage / hostage** | between two houses | moderate, durable | a diplomatic act |
| 5 | **Guild charter** | across polities | large | the Ayyavole 500, Manigramam — ~825 CE |
| 6 | **State treaty** | international | largest | a polity with reach on both ends |

**Rung 5 is the one that changes the game.** A guild charter is the invention that lets
**strangers trade at scale** — it substitutes a written, portable, enforceable membership
for the personal knowledge that rungs 1–4 depend on. When the Ayyavole 500 fires around
825 CE ([`07-timeline.md`](07-timeline.md) Era 12), the constraint that has bound the
player for **five thousand years** finally lifts.

That is the correct emotional weight for it, and it is free — we only have to not skip it.

---

## 3. What a route actually is

A route is not a pipe. It is four independent numbers, and confusing them is the commonest
way trade systems in this genre go flat.

| Number | Means | Raised by | Lowered by |
|---|---|---|---|
| **Capacity** | how much can physically move | roads, ports, pack animals, hulls | terrain, gradient |
| **Hold** | how much of the route you actually control | garrisons, forts, allied segments, local standing | rival claims, unadministered stretches |
| **Safety** | how likely a caravan survives | escorts, patrols, cleared chokes | raiders, war, famine inland |
| **Communication** | how fast news travels back along it | relay posts, rest-houses, literacy, pilgrim traffic | distance, mountains, sea |

**Throughput is a product, not a sum:**

```
delivered = capacity × hold × safety × season
```

Which means **a route is only as good as its worst number.** A magnificent road you do not
control delivers nothing. This is the arithmetic behind your "the more you have better hold
and communication, the more you can move."

### Communication is the sleeper, and it is fog of war

Communication does not move goods. It moves **knowing**.

> At low communication, your caravan is attacked in the Bolan Pass in spring and **you find
> out in autumn.** The ledger simply shows goods that never arrived. You do not know whether
> they were robbed, drowned, or sold.

That is not a UI failure — it is 2000 BCE, rendered honestly. It also makes **relay posts,
rest-houses and shade trees** (Ashoka, ~255 BCE, already in the timeline) into a real
mechanical investment rather than flavour text, and it gives the `IT` pillar a job in the
trade system.

---

## 4. Time, and the physics of goods

**Goods take days. Payment takes longer.** Both are simulated; neither is instant.

### Transit

Transit time is computed **from the procedural map we already built** — the elevation
field, the terrain regions, the river network, and the monsoon
([`09-procedural-map.md`](09-procedural-map.md)). Not from a lookup table.

```
days = Σ over segments ( length / speed(terrain, mode, season, improvement) )
```

Gujarat → Kerala is not one number. It is:

- **Coastal sail, monsoon favourable** — fast, seasonal, and closed for months at a time
- **Coastal sail, against the wind** — slow, or impossible
- **Overland via the ghat passes** — slower, but open year-round and choke-prone
- **River and coast combined** — depends which century, because rivers move

> **The monsoon that waters the Deccan is the same monsoon that carries your ships.** One
> field, two systems. When **Hippalus** fires around 50 CE ([`07-timeline.md`](07-timeline.md)
> Era 10) the open-sea crossing time roughly halves — **a timeline event rewriting a
> physics constant**, which is exactly what that discovery was.

### Settlement — the part you specifically called out

When the goods arrive, **you have not been paid.** Payment is a second physical journey.

| Era | You are paid in | Settlement lag | Loss on the way |
|---|---|---|---|
| Pre-coinage | grain, cattle, shell, metal | **as long as the outbound trip, or longer** | spoilage, mortality |
| Bent-bar & punch-marked silver, ~660–550 BCE | coin | still a journey, but dense and durable | theft only |
| Guild credit, ~825 CE+ | a claim, redeemable elsewhere | **near zero** | counterparty failure |

> **This is why money is a revolution and not a tech unlock.** Barter is not merely
> "primitive" — it has *bad physics*. Grain is heavy, perishable, and its value collapses
> exactly when everyone has it. Silver is the same value in a hundredth of the volume and
> it does not rot. The player feels coinage arrive as **latency and spoilage falling off a
> cliff**, in a system they have been fighting for three thousand years.
>
> And the guild letter of credit at rung 5 is a *second* such moment: the goods still move,
> but the **payment stops moving at all.**

This satisfies the build plan's requirement that the arrival of money be an era transition
the player physically feels ([`10-buildplan.md`](10-buildplan.md) Phase 10).

---

## 5. Protection — merchants, escorts, and your neighbour's problem

**Merchants are simulated agents on the map**, not an abstraction. A caravan is a real
thing at a real position, carrying real goods, and it can be gone tomorrow.

You assign soldiers to merchants. The assignment is a genuine cost, because those soldiers
are not somewhere else:

| Escort | Effect | Cost |
|---|---|---|
| None | fastest, cheapest, and you may simply lose everything | — |
| Light | deters opportunists | small, mobile |
| Heavy | survives an organised raid | **slows the caravan**, expensive |
| Local hire | cheap and effective in that valley only | standing, not troops |
| Convoy | many caravans, one escort | requires them to travel together, which costs time |

**Heavy escort slowing the caravan is the important line.** Safety and speed trade against
each other, so there is no dominant setting, so the decision stays interesting for two
hundred hours.

### Why you protect your neighbour's routes

You raised this and it is the best mechanic in the system, because it produces alliances
without a diplomacy screen.

> **Most of your route is not in your territory.** A route from Gujarat to Kerala runs
> through Konkan, through the ghats, past three polities you do not rule. Its `safety` is
> the **minimum** across all segments, not the average.
>
> So a segment you do not own, cannot garrison, and get no revenue from is **capping your
> entire trade income.** Protecting your neighbour's stretch is not altruism. It is the
> cheapest available upgrade to your own throughput.

From that one rule, without writing a diplomacy system, you get: joint patrols, subsidies
paid to neighbours who cannot afford their own garrison, shared forts at passes, and
guilds that police roads across four kingdoms because no single kingdom can. Which is what
the Ayyavole 500 actually did.

---

## 6. The chokes — five kinds, one resolver

You asked for mini-games. Here is the honest version, and it is a scope warning worth one
paragraph:

> **Do not build five bespoke mini-games.** Five hand-made minigames is five codebases,
> five art passes, and five things that go stale on the fourth play. Build **one resolver
> with five skins.** The variety must come from the *situation and the choice*, not from
> five different sets of rules the player has to learn.

### The resolver

A threat and a caravan meet. Before it resolves, you choose — and **the choice is the game**:

`Fight` · `Pay` · `Reroute` · `Wait for season` · `Hire local` · `Escort heavier next time`

Resolution is a deterministic function of caravan `escort / speed / value / local standing`
against threat `strength / mobility / position`, plus the seed. No dice
([`10-buildplan.md`](10-buildplan.md) Part A.3).

### The five kinds

| Kind | What it is | What actually works | Historical anchor |
|---|---|---|---|
| **The pass** | someone sits on a fixed chokepoint — Khyber, Bolan, a ghat, a ford | clear it once, then **garrison it forever** | the northwest gate, 2,279 years |
| **The toll** | a polity legally taxes your caravan into unprofitability | diplomacy, treaty, or conquest — not soldiers | Kulottunga abolishes tolls, ~1080 |
| **The raid** | mobile predation with no fixed position | escorts and convoys; there is nothing to capture | pastoral frontier pressure |
| **The blockade** | a rival fleet closes a sea lane | a navy, or a different ocean | Chola vs Srivijaya, 1025 |
| **The rot** | flood, monsoon failure, a river changing its bed | **nothing. Reroute.** | the Ghaggar fails, ~2100 BCE |

> **The fifth kind has no enemy, and it must stay in.** This game's thesis is that the
> Indus ended with nobody attacking it ([`07-timeline.md`](07-timeline.md) Era 4). A trade
> system where every problem has someone to kill would quietly contradict the entire
> design. Sometimes the road is simply gone, and the answer is to go a different way.

**Missions** are the offensive form: locate the raiders' base, march, and take it. The
reward is not loot — it is that a segment's `safety` stays high for a generation, and you
watch the throughput number climb afterwards.

---

## 7. The missionary vector — monks, priests, and the road that is never closed

You said: *you can **always** send monks and priests.* That word is the mechanic.

> **Knowledge passes where goods cannot.** A caravan needs capacity, safety, and a season.
> A monk needs a road and a reason. When a pass is choked, a fleet blockades a strait, or a
> war closes a border, **the missionary vector still runs** — slower, poorer, but open.
>
> So the player under total blockade is never without a move. They can still teach.

### What it costs and what it returns

| | |
|---|---|
| **Costs** | years of a trained person's life · grain for the journey · the works they carry are away from home |
| **Returns in gold** | nothing, ever |
| **Returns in standing** | large, permanent, and it compounds |
| **Returns in pillars** | `Cultivation` ↑↑ · `Networking` ↑↑ · `Classicism` ↑ at the destination |

**And the return that matters most:** a monk who reaches a foreign monastery **creates a
carrier there for every work he carried.**

> **This settles the open design question.** Exporting a text *does* create a surviving copy
> abroad — and the mechanism is a person, not a shipping manifest. Trade income and corpus
> survival become one decision, because that is what actually happened: Mahinda to Sri Lanka
> ~250 BCE, the Pali canon written at Aluvihare ~29 BCE, Atisha to Tibet ~1000, Xuanzang
> carrying **657 texts** to China in 645. The *Abhidharmakosha* survives because it reached
> Tibet. See [`05-knowledge-economy.md`](05-knowledge-economy.md) on redundancy.

So the player who spent a century sending teachers abroad discovers, when 1193 arrives,
that they already saved the library — **six hundred years earlier, for reasons that had
nothing to do with 1193.** That is the best thing this system can do, and it falls straight
out of your grassroots framing.

### Teaching from the grassroots

The receiving side is modelled, not hand-waved. A teacher arriving somewhere with no
literate institution runs a slow ladder: **speak the language → gather students → found a
school → the school produces its own works → those works cite yours.**

And because prestige flows backward along derivation edges
([`05-knowledge-economy.md`](05-knowledge-economy.md)), **every work that foreign school
ever produces pays you, forever.** Teaching someone else's civilisation to write is the
highest-compounding investment in the game — and the slowest. First return: two to three
centuries.

---

## 8. Export routes and the wider world

Foreign trade unlocks by **reach**, not by date. A partner becomes available when a route
of sufficient rung and range can physically arrive.

| Partner | Earliest | Wants | Sends back |
|---|---|---|---|
| Badakhshan | ~4850 BCE | grain, shell | **lapis lazuli** |
| Magan (Oman) | ~2750 BCE | beads, timber | copper |
| Dilmun (Bahrain) | ~2410 BCE | everything — it is an entrepôt | everything |
| Mesopotamia | ~2350 BCE | carnelian, ivory, cotton | silver, wool, oil |
| Persia | ~518 BCE | cotton, ivory | **Aramaic script**, administration |
| Rome | ~50 CE | **pepper**, cotton, gems | gold — so much that Pliny complains |
| China | ~110 CE | cotton, glass, **Buddhism** | silk, later paper |
| Srivijaya | ~1025 | cloth, iron | camphor, spice, transit rights |
| Abbasid Baghdad | ~771 | **numerals, astronomy** | paper, philosophy |
| Portugal | 1498 | pepper | **chilli, potato, tomato, maize, tobacco** |

**Two rows are doing unusual work.** Persia and Baghdad send back *knowledge*, not goods —
Aramaic in 518 BCE is how literacy returns to India after 1,650 years of silence, and the
771 transmission of Brahmagupta to Baghdad is the single most consequential export in the
document. **The trade system and the knowledge economy are the same system**, and the goods
table is where that becomes undeniable.

New crops arrive **because a ship arrived**, never because a tech unlocked. The chilli is
not researched. It is delivered.

---

## 9. What this does to the build plan

Honestly: **Phase 10 as written was 1.5 weeks for barter → coin → a goods calendar. This is
not that.** Routes, escorts, five choke types, transit and settlement latency, and the
missionary vector are roughly **four weeks**, and pretending otherwise helps nobody.

So Phase 10 splits, and the eleven phases stay eleven by merging nothing — **Phase 10 gets
two halves**:

- **10a · The exchange** (1.5 w) — barter, the grain standard, coinage arriving as a
  latency cliff, and the goods calendar. *Unchanged.*
- **10b · The network** (2.5 w) — routes with the four numbers, transit computed off the
  real terrain field, merchants as agents, escorts, the one resolver with five skins, and
  the missionary vector.

**And for the Phase 11 slice, cut hard.** Twenty minutes needs exactly: **one route**
(Thanjavur → Muziris), **one choke** (a ghat pass), **one escort decision**, **one
settlement delay**, and **one monk**. That proves every idea in this document. Everything
else can arrive over the following year.

---

## 10. Still open

1. **Do caravans render as sprites at L0–L9, or as a flow on the route line?** Sprites are
   more alive; flow scales to thousands. Probably: sprites where you are looking, flow
   everywhere else — but that is a real rendering decision, not a preference.
2. **Can the player raid *other people's* routes?** Historically yes, constantly. But the
   campaign frame is defensive and within-India ([`06-pillars-and-campaign.md`](06-pillars-and-campaign.md)),
   so predation by the player needs a deliberate ruling rather than a default.
3. **How much does the player micromanage?** Two hundred hours of assigning escorts
   caravan-by-caravan is a spreadsheet. Suggested: **standing orders per route**, with
   manual control only for the caravan you are watching.
4. **Does Share have a cap?** If standing can be bought indefinitely with surplus grain,
   the trust ladder becomes a farming exercise. Likely needs diminishing returns per
   partner per generation.
