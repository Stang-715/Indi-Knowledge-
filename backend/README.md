# Backend: Contribution & Moderation Pipeline

This app is deliberately **not** an open wiki. Data enters the atlas slowly, through a
strict filter, so that what the reader sees is always research-backed. This document is
the design contract for that pipeline; the frontend already reserves the hooks
(`media: []` on every entry, `qc` metadata on every pack) so a backend can be attached
without changing the UI.

## Principles

1. **Slow integration beats fast corruption.** New findings wait in review; nothing
   hot-publishes.
2. **Provenance or it doesn't exist.** Every candidate fact/video must carry sources.
   Anonymous, sourceless submissions are rejected at intake — before human review.
3. **Two-key publishing.** A submission goes live only after (a) automated validation
   against `contribution.schema.json` AND (b) a named human curator approval.
4. **Append + supersede, never silent edit.** Published entries are immutable records;
   corrections create a new version that references what it replaces and why.

## Pipeline states

```
 submitted → machine-checked → in-review → verified → published
      ↘ rejected (schema/source failure)   ↘ rejected (failed fact-check)
```

| Stage           | Gate                                                                  |
|-----------------|-----------------------------------------------------------------------|
| submitted       | Schema-valid JSON (see `contribution.schema.json`)                     |
| machine-checked | Sources resolve (HTTP 200), domains rated, no duplicate pending claim  |
| in-review       | Curator cross-checks each claim against ≥2 independent sources         |
| verified        | QC stamp added (`qc.status`, `qc.checkedOn`, curator id)               |
| published       | Merged into the matching `data/<tab>.js` pack via a reviewed commit    |

## Media (videos / images / audio)

The frontend renders anything placed in an entry's `media` array:

```js
media: [
  {
    id: "uuid",
    type: "video" | "image" | "audio" | "document",
    title: "Madhubani master at work",
    url: "https://…",             // hosted asset or embed URL
    source: "who produced it",
    license: "CC-BY-4.0 / permission-on-file / public-domain",
    addedOn: "2026-08-07",
    reviewedBy: "curator id"
  }
]
```

Until a real service exists, media can be added by hand through a pull request that
must include the review fields — the PR review *is* the moderation step.

## Suggested implementation (when the time comes)

- **Intake:** a single serverless endpoint (or GitHub Issue form) writing to a
  `submissions/` queue — never directly to `data/`.
- **Machine checks:** JSON Schema validation + link checker + source-domain allowlist
  (gov.in, nic.in, ICAR, ASI, academic publishers rank high; user-editable wikis are
  flagged as insufficient as sole sources).
- **Review UI:** any static admin page reading the queue; approvals produce a signed
  commit to `data/`.
- **Versioning:** git history is the audit trail. Each publish commit message cites
  the submission id and curator.

## Why not Wikipedia-style editing?

Open editing optimizes for speed of change; this atlas optimizes for trustworthiness of
what is displayed. The cost — new findings appear with a delay — is accepted and
intentional. The QC report (`data/qc-report.md`) documents the current verification
state of every pack.
