# Seed corpus — provenance and caveat

`seed_*.py` holds **103 hand-authored events** across six states: Kerala, West Bengal,
Gujarat, Jharkhand, Tamil Nadu, Punjab.

## Why it exists

The network policy in the environment where this was built blocks `en.wikipedia.org` and
`query.wikidata.org`, so the scrapers could not run. Rather than ship an untested
pipeline, the corpus was authored by hand so that the pattern engine, the quiz generator
and the simulation could all be exercised end to end on real historical content.

## The caveat, stated plainly

**These events were written from general historical knowledge and have not been checked
against a source.** They are marked `provenance: "seed-v1-authored-pending-verification"`
and every row carries a verification URL in its `sources` array.

Dates and framings for well-attested events (Plassey 1757, the Permanent Settlement 1793,
Kerala's 1969 Land Reforms) are reliable. Anything with `year_precision` coarser than
`exact`, and anything in the pre-1200 eras, should be treated as a research lead rather
than a fact.

**A reviewer should walk the flagged queue before any of this is shown to players as
fact.** The first live ingest will corroborate rather than overwrite — `merge()` preserves
prior rows, and rows marked `human_verified` are never touched by automation.

## Why six states

They were chosen because their histories carry *different* causal shapes, so the pattern
engine is tested against variety rather than repetition:

| State | The shape it contributes |
|---|---|
| Kerala | Reform dividend — early schooling and land reform compounding into human development |
| West Bengal | Revenue ratchet, craft destruction, partition, capital drain |
| Gujarat | Port-to-workshop, cooperatives, mercantile capital |
| Jharkhand | Resource curse — minerals, displacement, insurgency |
| Tamil Nadu | Identity politics, temple patronage, welfare-led development |
| Punjab | Canal colonies, green revolution, irrigation trap, insurgency and accord |
