# The Specialist Pass — the briefing this repository cannot write for itself

**Status: open. This is phase 33 of [`14-event-completion.md`](14-event-completion.md),
and it is a hire, not a task.** Everything below is preparation for the people who will
do it — a historian, an archaeologist, and a cultural reviewer — so that their first
week is review rather than archaeology of the repository.

The rule they are guarding is fixed and already enforced by tests:

> **The game presents the argument. It does not adjudicate it.** A disputed event shows
> the competing positions and who holds them; where scholarship is genuinely divided on
> whether the thing happened at all, the trigger is `latent`, so a campaign may or may
> not contain it. `dispute_scope` says *what kind* of argument it is — `occurrence` and
> `date` bind the certainty rule; `causation` and `interpretation` do not.

## What the reviewers receive

- `data/timeline/timeline.json` — 1,347 events, each with `provenance`, `certainty`,
  `trigger`, `evidence`, and `dispute`/`dispute_scope` where flagged.
- `data/timeline/cards.json` — 343 authored Tier-1 cards. The `evidence` slot is the
  teaching mechanism and the slot most in need of a specialist eye; the `dispute` slot
  may only exist where the event is flagged (a test enforces this).
- `data/corpus/works.json`, `data/people/people.json`, `data/polities/polities.json` —
  the works, the 87 named individuals (the Thanjavur cohort members are `SYNTHESIZED`
  and marked as such), and the polities.
- `npm run gaps` — the current coverage report.

## What we need ruled on

1. **The dispute register below — 72 events.** For each: is the framing fair to the
   positions actually held? Is anything presented as settled that is not, or as open
   that is not? Several are politically live in India now (Keeladi, the Sarasvati
   identification, the Tamil iron dates, Indo-Aryan migration, Somnath's memory, the
   1943 famine's responsibility). These need a specialist's judgement on *tone*, not
   just fact.
2. **The evidence lines.** Every event carries one. They were written from the standard
   literature by a generalist; a specialist will find ones that overstate, understate,
   or cite the wrong warrant.
3. **The frontier events (phase 24) need the cultural reviewer specifically.** Living
   communities — Santhal, Munda, Gond, Bhil, the Northeast hill peoples — appear as
   playable-adjacent content. The design treats persistence as an answer rather than a
   failure; whether the execution honours that is exactly what the review is for.
4. **Sacred architecture in the sprite manifest** (`data/art/sprites.json`) before any
   generated art ships.
5. **The certainty numbers.** They gate trigger types. Anything at ≥0.9 fires on a fixed
   date in every campaign; a reviewer who thinks a date is softer than we scored it is
   changing gameplay, and should.

## What the reviewers may not be asked to do

Lower a certainty to dodge a controversy, or raise one to settle it. The register is
the mechanism for saying "this is argued"; use it.

## The dispute register

| Year | Event | Scope | Certainty | Trigger |
|---|---|---|---|---|
| 1200 BCE | The iron axe opens the eastern forest | `causation` | 0.6 | window |
| 900 CE | Buddhism thins in India while it grows everywhere else | `causation` | 0.6 | window |
| 1336 CE | Vijayanagara founded | `causation` | 0.95 | dated |
| 1820 CE | Indian textile manufacturing collapses against Lancashire | `causation` | 0.8 | window |
| 1943 CE | The Bengal famine of 1943 | `causation` | 0.95 | dated |
| 6000 BCE | The Sutlej abandons the Ghaggar for the Indus | `date` | 0.4 | latent |
| 5200 BCE | Bhirrana period IA; Hakra ware on the Ghaggar | `date` | 0.45 | latent |
| 5000 BCE | Lahuradewa: rice at the eastern edge — independent domestication argued | `date` | 0.45 | latent |
| 4000 BCE | Koldihwa and Mahagara; rice in the Belan valley | `date` | 0.45 | latent |
| 3350 BCE | Sivagalai: a claimed 3345 BCE iron date — heavily disputed | `date` | 0.45 | latent |
| 3050 BCE | Fire altars at Kalibangan — function disputed | `date` | 0.45 | latent |
| 2600 BCE | The Yamuna turns east into the Ganga system | `date` | 0.35 | latent |
| 2600 BCE | Kot Diji burns — the transition is not everywhere peaceful | `date` | 0.45 | latent |
| 2550 BCE | The so-called granaries — function still disputed | `date` | 0.45 | latent |
| 2500 BCE | The Indus script in use — c. 400 signs, average inscription 5 signs | `date` | 0.45 | latent |
| 2450 BCE | Lothal's basin — dockyard or reservoir, still argued | `date` | 0.45 | latent |
| 2300 BCE | Surkotada's horse bones — disputed identification | `date` | 0.45 | latent |
| 2260 BCE | Kalibangan: evidence read as earthquake damage | `date` | 0.45 | latent |
| 2172 BCE | Iron at Mayiladumparai, Tamil Nadu — the oldest AMS-dated iron in India | `date` | 0.45 | latent |
| 1720 BCE | The copper hoards: harpoons, anthropomorphs, antennae swords | `date` | 0.45 | latent |
| 1600 BCE | The Daimabad bronzes — chariot, elephant, rhinoceros, buffalo | `date` | 0.45 | latent |
| 1510 BCE | Iron at Mangadu, Salem — southern metallurgy consolidates | `date` | 0.45 | latent |
| 1500 BCE | Coastal Gujarat sites are lost to the sea | `date` | 0.35 | window |
| 1500 BCE | Indo-Aryan migration — latent, contested, presented as debated | `date` | 0.45 | latent |
| 1300 BCE | Iron working begins in the Ganga plain | `date` | 0.45 | latent |
| 1200 BCE | Malhar and Raja Nala ka Tila: early Gangetic iron | `date` | 0.45 | latent |
| 960 BCE | The four-varna scheme first stated, in a late hymn | `date` | 0.45 | latent |
| 730 BCE | Kausambi's rampart — the earliest great fortification of the Ganga | `date` | 0.45 | latent |
| 610 BCE | Tamil Brahmi's precursors in the far south | `date` | 0.45 | latent |
| 599 BCE | Mahavira; the Jain order | `date` | 0.45 | latent |
| 585 BCE | Keeladi: urban settlement on the Vaigai — disputed, politically live | `date` | 0.45 | latent |
| 563 BCE | The Buddha — long and short chronologies both window | `date` | 0.45 | latent |
| 500 BCE | Dhulikatta and Kotalingala: early urban centres | `date` | 0.7 | window |
| 500 BCE | Porunthal and Kodumanal: graffiti, then Tamil-Brahmi | `date` | 0.45 | latent |
| 400 BCE | Wari-Bateshwar's fort, roads and Indo-Pacific beads | `date` | 0.7 | window |
| 370 BCE | The Brahmi script emerges — origin actively contested | `date` | 0.45 | latent |
| 321 BCE | Chanakya as chief minister; the Arthashastra tradition begins | `date` | 0.45 | latent |
| 250 BCE | Ashoka founds Srinagari (per Kalhana) | `date` | 0.45 | latent |
| 100 BCE | Karikala Chola; the Kallanai dam on the Kaveri | `date` | 0.45 | latent |
| 33 CE | Manipur: the Ningthouja line, by traditional chronology | `date` | 0.45 | latent |
| 78 CE | Shaka era; Kanishka — date contested, window | `date` | 0.45 | latent |
| 80 CE | Fourth Buddhist Council; Mahayana crystallises | `date` | 0.45 | latent |
| 100 CE | The fourth council under Kanishka, and Sanskrit displaces Prakrit | `date` | 0.65 | window |
| 500 CE | Zinc distillation at Zawar — centuries before Europe | `date` | 0.45 | latent |
| 550 CE | Elephanta's cave and the Trimurti are cut | `date` | 0.7 | window |
| 600 CE | Shashanka of Gauda; the Bengali era | `date` | 0.45 | latent |
| 650 CE | Appar and the Shaiva turn; Jainism loses royal favour | `date` | 0.45 | latent |
| 724 CE | Lalitaditya Muktapida; the Martand sun temple | `date` | 0.45 | latent |
| 1200 CE | Zinc is distilled at Zawar by downward condensation | `date` | 0.8 | window |
| 1396 CE | The Durga Devi famine empties the Deccan | `date` | 0.6 | window |
| 3300 BCE | The Ghaggar runs strong and perennial | `interpretation` | 0.55 | window |
| 2450 BCE | The material record holds almost no weapons and no siege works | `interpretation` | 0.7 | window |
| 1350 BCE | The Deccan dries and the Jorwe settlements contract | `interpretation` | 0.55 | window |
| 600 BCE | Potsherd graffiti precede Tamil-Brahmi and may be related to it | `interpretation` | 0.6 | window |
| 100 CE | Pattanam on the Periyar, argued to be Muziris | `interpretation` | 0.6 | window |
| 1026 CE | Mahmud of Ghazni reaches Somnath | `interpretation` | 0.9 | dated |
| 1303 CE | Alauddin takes Chittor | `interpretation` | 0.85 | window |
| 1400 CE | Kashmiri Sanskrit libraries are dispersed | `interpretation` | 0.45 | window |
| 1400 CE | Temple destruction under Sikandar, and the argument about its scale | `interpretation` | 0.6 | window |
| 1737 CE | A cyclone and surge destroy the Hooghly shipping | `interpretation` | 0.5 | window |
| 1829 CE | Sati is prohibited by regulation, after argument on both sides in Sanskrit | `interpretation` | 1 | dated |
| 1829 CE | James Tod writes the Annals and fixes a version of Rajput history | `interpretation` | 0.95 | dated |
| 1870 CE | Shifting cultivation is declared wasteful by people who do not practise it | `interpretation` | 0.75 | window |
| 1932 CE | the Poona Pact | `interpretation` | 0.95 | dated |
| 300 BCE | The Jain council at Pataliputra, and the first division | `occurrence` | 0.6 | window |
| 300 BCE | The Jain Agamas are carried orally through famine and schism | `occurrence` | 0.75 | window |
| 100 BCE | The southwestern Silk Road runs from Sichuan through Assam to Bengal | `occurrence` | 0.6 | window |
| 350 CE | The Kalabhras take the Tamil country, and the record goes quiet | `occurrence` | 0.5 | window |
| 650 CE | Jain institutions lose royal favour in the Tamil country | `occurrence` | 0.4 | window |
| 800 CE | Shankara founds four mathas at the compass points | `occurrence` | 0.7 | window |
| 800 CE | The Nambudiri settlements and the sixty-four gramams take institutional shape | `occurrence` | 0.7 | window |
| 1737 CE | A great storm and shock strike Bengal | `occurrence` | 0.4 | window |

*Generated from `data/timeline/timeline.json`; regenerate rather than edit — the table
is a view, not a source.*

## Release gate

Nothing in phases 23–32 ships without this pass. The tests keep the mechanics honest;
they cannot keep the history honest. That is a person's job, and the person has not
been hired yet.
