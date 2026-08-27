# Datapacks — the format, and how to contribute one

**We are not going to author 648,802 settlements.** Public, versioned datapacks
are the only arithmetic that fills them ([`02-data-spine.md`](02-data-spine.md) §4).
Wikipedia and OpenStreetMap are the model, and this is the contract.

```bash
node tools/validate-datapack.mjs packs/your-pack
```

Run that before you show anyone. It checks everything below.

---

## Two rules that are absolute

**1. Datapacks never contain code.** JSON, Markdown, CSV and plain text only. No
`.js`, no `.wasm`, no HTML, and no function-shaped strings hiding in a JSON
field. A community pack must not be able to execute anything, and the validator
refuses one that tries.

**2. Provenance is mandatory.** Anything that asserts a fact about the world
states what kind of claim it is:

| Tier | Means |
|---|---|
| `SOURCED` | Named in an inscription, a text, or an excavation report — and you say which |
| `DERIVED` | The thing is attested; some detail here (a date, a relationship) is inferred |
| `SYNTHESIZED` | Generated to stand where a real thing stood. Say so plainly |
| `ABSENT` | Known to have existed and not recoverable |

> A pack that cannot say where a fact came from is not a contribution, it is a
> rumour. `SOURCED` without a `source`, `sources`, `evidence` or `note` is an
> error, not a warning.

And a corollary that catches people out: **if scholarship is divided, say so.**
An entity with `dispute: true` may not claim `certainty` at or above 0.9. The
game presents the argument; it does not adjudicate.

---

## What a pack looks like

```
packs/your-pack/
  pack.json        name, version, author, licence
  cities.json      city skeletons
  events.json      timeline events
  people.json      named individuals
  works.json       texts
```

Everything is optional except `pack.json`. A pack that adds three events is a
perfectly good pack. See [`packs/example-kalinga/`](../packs/example-kalinga) for
a worked one you can copy.

### A city is about 900 bytes

This is the part people underestimate. You do not draw a city — you give its
skeleton and the generator produces the streets, the blocks and the buildings.
Thanjavur is 1,700 buildings from these numbers:

```jsonc
{
  "id": "sisupalgarh", "name": "Sisupalgarh",
  "provenance": "SOURCED",
  "note": "Excavated fortified city; the ramparts and gateways are the sourced part.",
  "lon": 85.8410, "lat": 20.2280,
  "founded": -700, "walled": -400,
  "core": 120, "rings": 6, "gates": 8, "aspect": 1.0,
  "minRadius": 220, "maxRadius": 1100,
  "anchors": [
    { "kind": "temple", "name": "Central enclosure", "at": [0, 0],
      "size": [200, 200], "from": -400,
      "vimana": [0, 0], "vimanaSize": [70, 70], "height": 18 }
  ]
}
```

**Anchors are the only part of a real city that is not generic** — the temple
precinct, the tank, the fort — so they are the only part that is data. `at` and
`size` are metres from the city centre.

> **Never ship sub-metre geometry.** India's Geospatial Data Guidelines 2021
> restrict data finer than 1 m, and ladder levels 15–16 are 0.41 m and 0.21 m.
> Detail at that scale is generated at runtime, by design. A pack containing
> building footprints is both illegal to distribute in India and unnecessary.

### An event

```jsonc
{
  "id": "EVT.M260.KALINGA_EDICTS",
  "title": "The separate Kalinga edicts",
  "provenance": "SOURCED",
  "evidence": "The edicts at Dhauli and Jaugada, which differ from those issued elsewhere.",
  "year": -260, "era": "ERA.MAURYAN", "class": "WORK", "magnitude": "W",
  "certainty": 0.9, "trigger": "dated",
  "scope": "regional", "region": "RGN.ODISHA", "dispute": false
}
```

`trigger` must be consistent with `certainty`: **nothing below 0.9 may be
`dated`.** Use `window` with a range, or `latent` where the event may not have
happened at all. That is not a technicality — it is how uncertainty becomes
mechanics instead of a disclaimer, and it is why most of this game is genuinely
replayable.

### A person

Say `SYNTHESIZED` when you mean it. The example pack includes a Hathigumpha
engraver and a Bali Jatra shipmaster: the inscription and the sailing season are
both real, the individuals are not recoverable, and the entities say so.

> **Do not turn a real named list into game characters.** The Thanjavur
> inscription names four hundred temple women. This project treats the *count*
> as sourced and generates stand-ins, because reproducing a real roster of named
> people as playable pieces is a decision for a historian and a community, not
> for a contributor with a text editor.

---

## What the validator checks

| | |
|---|---|
| No code, in any form, including function-shaped strings | error |
| Valid JSON | error |
| Ids unique within their collection | error |
| Anything asserting a fact has a provenance tier | error |
| `SOURCED` says where from | error |
| `certainty` is a number in 0–1 | error |
| Disputed entities stay below 0.9 certainty | error |
| Ids that do not look like `PREFIX.NAME` | warning |
| File types the loader will ignore | warning |

It found eighteen unsourced polities and all 789 timeline events missing a
provenance tier the first time it was run against this repository's own data,
which is the argument for having it.

---

## Licensing

State a licence in `pack.json`. Note two things about sources:

- **OpenStreetMap is ODbL** and share-alike. A pack derived from OSM must be
  ODbL, and that propagates.
- **Microsoft building footprints are CDLA-Permissive**; Google Open Buildings
  can be taken as CC BY 4.0. Neither may be shipped at sub-metre resolution for
  India regardless of licence — see above.
