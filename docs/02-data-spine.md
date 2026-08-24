# The Data Spine — pouring data into a world that is mostly empty

How "we'll fill it in later" becomes an engineering guarantee rather than a hope.

---

## 1. Every entity carries its own epistemology

Each entity in the world — a district, a village, a ward, a street, a building — is a
record with a stable identity and an honest statement about where its values came from.

```jsonc
{
  "id": "IN.TN.THANJAVUR.KUMBAKONAM.W07",   // stable, hierarchical, permanent
  "kind": "ward",
  "parent": "IN.TN.THANJAVUR.KUMBAKONAM",
  "provenance": "SYNTHESIZED",
  "confidence": 0.35,
  "as_of": "1881-02-17",
  "source": null,                            // required when provenance = SOURCED
  "seed": "a3f1c2...",                       // required when provenance = SYNTHESIZED
  "fields": { "population": 4820, "literacy_rate": 0.11 }
}
```

**Four provenance tiers:**

| Tier | Meaning | Renders as |
|---|---|---|
| `SOURCED` | Real data from a cited dataset | Normal |
| `DERIVED` | Computed from sourced data (interpolation, apportionment) | Normal |
| `SYNTHESIZED` | Invented by `worldgen` from a deterministic seed | Normal — the player cannot tell |
| `ABSENT` | Explicitly unknown; nothing generated | **Unsurveyed map sheet** |

`ABSENT` is a decision, not a bug. Some regions should start unsurveyed because they
*were* — and because the survey mechanic needs somewhere to point.

Provenance is per-**field**, not just per-entity: a village can have a `SOURCED`
population from the 1881 census and a `SYNTHESIZED` street layout. Store it as a
parallel map keyed by field name.

---

## 2. Synthesized children sum to sourced parents

This is the rule that keeps a 5%-complete world internally consistent.

If Thanjavur district's 1881 population is known (`SOURCED`) but the breakdown across
its 11 tehsils is not, the synthesized tehsil populations **must sum to the district
total**. Otherwise the economy sees one number at L4 and a different number at L5, and
every derived quantity — revenue, grain demand, famine risk — forks.

The technique is **iterative proportional fitting** (IPF), the standard method in
spatial microsimulation for exactly this problem: generate a plausible fine-grained
population that matches every known coarse marginal.

```
fit(children, known_parent_totals, priors):
  seed children from priors (area, terrain, historical settlement density, distance to river/road)
  repeat until convergence:
    for each constraint axis (total pop, religion split, occupation split, ...):
      scale children so their sum matches the known marginal
  return children   # deterministic given the same seed and the same datapack
```

**Consequences that must hold:**

- A pour that adds real tehsil data *replaces* the synthesized values, and the district
  total does not move. Nothing downstream notices.
- A pour that adds a real district total *re-fits* the tehsils beneath it. They shift,
  but they stay consistent.
- Constraints propagate down the whole ladder: nation → state → district → tehsil →
  village → ward. Any rung may be sourced, and everything below it fits to it.

Every aggregate the simulation reads goes through the fitted hierarchy. The simulation
never reads a raw synthesized number directly.

---

## 3. Determinism, or none of this works

`worldgen` is a **pure function**. Given `(entity_id, world_seed, datapack_version,
context)` it returns the same result on every machine, every time, forever.

- **No `Math.random`.** A seeded PRNG (PCG or xoshiro) keyed by hashing the entity ID
  with the world seed. Two clients generating the same ward generate the same ward
  without exchanging a byte.
- **No wall clock, no locale, no floating-point drift.** Fixed-point or carefully
  ordered f64 in the simulation core; the usual determinism discipline.
- **No I/O.** Everything `worldgen` needs is passed in.

This one property buys three things that would otherwise each need their own system:
multiplayer (clients agree without syncing the world), replay and debugging, and
datapack migration (§4).

---

## 4. Saves store decisions, not worlds

> **world = f(datapack_version, world_seed, decision_log)**

A save file contains the world seed, the datapack version it was created against, and
the ordered log of everything the player and the simulation decided. It does **not**
contain the generated world.

So when datapack v2 lands with 40,000 real villages:

1. Load the save. Note it was made against v1.
2. Rebuild the world from v2 plus the same seed.
3. Replay the decision log.
4. Entities keep their IDs, so decisions still resolve. Values that were synthesized
   in v1 are now sourced — the world is truer, and the campaign continues.

**Migration hazards and their answers:**

- *An entity disappears between versions* (a village turns out not to exist, or two
  merge). Datapacks carry a **tombstone and remap table**: `IN.TN.X.V0041 → merged into
  IN.TN.X.V0038`. Decisions referencing a tombstoned ID follow the remap.
- *A decision becomes impossible* (you built a mill in a village that is now a lake).
  The replay records a **reconciliation event**, shown to the player in a migration
  report rather than silently dropped. Rare, honest, and legible.
- *Numbers shift under the player.* Acceptable and thematically correct — the survey
  came back with better figures. The migration report says so.

The rule that makes all of this cheap: **IDs are permanent and semantic**. Never
renumber. Never reuse. A tombstoned ID is dead forever.

---

## 5. Datapacks

A datapack is a signed, versioned, content-addressed bundle of **data only — never
code**, validated against [`packages/schema/datapack.schema.json`](../packages/schema/datapack.schema.json).

```
datapacks/
  in-core@1.4.0/          # boundaries, census marginals, terrain — ships with the game
  in-cities-tier1@0.3.0/  # street networks and footprints for the 50 largest cities
  in-tn-thanjavur@2.1.0/  # a single district, poured deep — community-authored
```

Packs declare what they cover and what they depend on:

```jsonc
{
  "id": "in-tn-thanjavur",
  "version": "2.1.0",
  "covers": { "levels": [4, 12], "extent": "IN.TN.THANJAVUR" },
  "requires": { "in-core": "^1.4.0" },
  "license": "CC-BY-4.0",
  "sources": [ { "name": "Census of India 1881, Madras", "url": "...", "license": "public-domain" } ],
  "entities": 18442,
  "checksum": "sha256:..."
}
```

**Resolution order:** higher-specificity packs win. A district pack overrides the core
pack within its extent, field by field, and only for fields it actually supplies.

**Why public.** 648,802 villages and 24 million buildings will not be poured by a
studio. They will be poured by people who care about one district — the way OSM and
Wikipedia were built. That requires the format to be documented, the schema to be
stable, the validator to be shipped, and the tooling (`apps/studio`) to be usable by
someone who is not an engineer. Design for that from P0, not from P4.

**Why data-only.** Community packs must not be able to execute anything. Balance
changes belong in mods, which are a separate, sandboxed, and clearly-labelled
mechanism.

---

## 6. Source inventory and licensing

The licensing column is the one that decides whether something ships. Verify each with
counsel before release; this table is a starting point, not legal advice.

| Layer | Source | Licence | Note |
|---|---|---|---|
| Admin boundaries (current) | Survey of India / data.gov.in | GODL-India | **Must** follow SOI depiction — see plan §5 |
| Admin boundaries (historical) | Digitised gazetteers, academic GIS | Mixed | Per-source review; historical depiction is separable from current |
| Census marginals 1871–1941 | Digitised Census of India volumes | Public domain (age) | OCR + manual QA; the richest single seam |
| Census 2011 | Census of India | GODL-India | For the modern variant, and as a prior for fitting |
| Building footprints | **Microsoft GlobalMLBuildingFootprints** | **CDLA-Permissive-2.0** | **24 M in India. Permissive, no share-alike — the default choice** |
| Building footprints (alt) | Google Open Buildings v3 | CC BY 4.0 *or* ODbL — **take CC BY 4.0** | Covers South Asia |
| Street networks | OpenStreetMap | **ODbL — share-alike** | See warning below |
| Terrain / elevation | SRTM, Copernicus DEM | Public domain / free | ≥ 30 m, well above the 1 m threshold |
| Land cover, rivers | Bhuvan, HydroSHEDS | Mixed | |

**The OSM warning.** ODbL is share-alike at the *database* level. Rendered images and
screenshots are "produced works" and are fine, but a derived database that we distribute
must itself be ODbL. For a commercial game the standard mitigation is to keep
OSM-derived geometry in a **separately distributed, clearly ODbL-licensed datapack**,
architecturally isolated from proprietary content — which our datapack model already
does by construction. Get this reviewed before P3; it is much cheaper to design around
now than to unwind later.

**The happy accident.** Microsoft's footprints are CDLA-Permissive and Google's can be
taken as CC BY — so *buildings*, the largest and most visible layer, carry no
share-alike burden at all. Only street centrelines are ODbL-encumbered, and street
centrelines are the layer easiest to derive independently or license separately.

---

## 7. What a pour actually looks like

The operational loop, for a contributor or for us:

1. **Claim an extent.** "I'm pouring Thanjavur district, levels 4–8."
2. **Ingest** through `data/pipelines/` — OCR the 1881 district gazetteer, geocode
   village names against the current village directory, attach footprints.
3. **Validate** — `studio` checks schema conformance, ID stability against the previous
   version, and constraint consistency (do the children sum to the parent?).
4. **Diff against synthesis.** The studio shows, side by side, what the game *invented*
   for this extent and what the real data says. This is the most useful screen in the
   tool: it is a continuous audit of whether `worldgen`'s priors are any good.
5. **Publish** as a versioned pack.
6. **The map gets truer.** No code change. No save breaks. No release.

Step 4 also produces the project's most valuable feedback signal. If synthesised
Thanjavur was 30% off on population and wrong about where the settlements clustered,
that is a bug in the priors — and fixing it improves all 779 districts nobody has
poured yet.
