# Sources & Licensing

## What we ingest

| Source | Licence | Used for |
|---|---|---|
| Wikipedia (en) | CC-BY-SA-4.0 | Narrative history, section prose |
| Wikidata | CC0-1.0 | Battles, dates, places — structured claims |
| data.gov.in | GODL-India | Census, development indicators |
| PIB releases | GoI Open | Modern-era policy events |
| State gazetteers | Public domain (pre-1954) | District and craft detail |
| Archive.org | Varies — check per item | Colonial-era gazetteers and reports |

## Obligations we actually have to meet

**CC-BY-SA is share-alike.** Any Historia text derived from Wikipedia prose carries that
obligation. Two ways to discharge it, and the choice must be deliberate:

1. Ship the corpus under CC-BY-SA-4.0 with attribution — simplest, and it is why every
   event stores its full `sources` array with URLs.
2. Use Wikipedia only to *locate* facts, then write original summaries — facts are not
   copyrightable, expression is. This removes the share-alike obligation on the text.

The seed corpus is written under option 2 and marked `kind: "authored"`. Anything the
scraper ingests verbatim falls under option 1 and is stored with its quote and URL so the
distinction stays auditable per row rather than becoming a blanket assumption.

**Attribution is per event, not per project.** Every event carries its own sources with
retrieval timestamps. A reader can see exactly where any claim came from.

## Scraping conduct

- 2 requests/second — far below Wikimedia's courtesy ceiling. There is no deadline that
  justifies hammering a free service.
- A contactable User-Agent, as Wikimedia asks for.
- On-disk cache with a 30-day TTL: a re-run after a crash costs zero requests.
- `Retry-After` honoured when sent.
- No authentication walls circumvented, no paywalled content, no robots.txt disregarded.

## The seed corpus caveat

`data/historia/*.json` currently holds **103 authored events** marked
`provenance: "seed-v1-authored-pending-verification"`. They were written from general
historical knowledge to make the pattern engine and game layer testable before the
scrapers could run, and each carries a verification URL.

**They have not been checked against a source.** The first live ingest corroborates them
— it will not overwrite them, because merge preserves prior rows — and a reviewer should
walk the flagged queue before any of this is shown to players as fact.
