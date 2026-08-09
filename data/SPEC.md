# INDIA_DATA — Shared Data Specification

Every data file in this directory is a plain JavaScript file (NOT JSON) loaded via a
`<script>` tag, so the app works when `index.html` is opened directly from disk (`file://`).

## File template (mandatory)

```js
// data/<tab>.js — <Tab Title>
// Compiled from internet research on 2026-08-07. Every fact carries sources.
window.INDIA_DATA = window.INDIA_DATA || {};
window.INDIA_DATA.<tabKey> = {
  meta: {
    tab: "<tabKey>",
    title: "<Tab Title>",
    compiledOn: "2026-08-07",
    coverage: "All 28 states + 8 union territories",
    primarySources: ["...", "..."],           // the main portals/institutions used
    qc: { status: "pending", checkedOn: null, notes: "" }   // QC agent fills this
  },
  states: {
    "<slug>": { /* StateEntry, see below */ }
  }
};
```

## Canonical state/UT slugs (ALL 36 MUST be present in every file)

States (28):
`andhra-pradesh, arunachal-pradesh, assam, bihar, chhattisgarh, goa, gujarat, haryana,
himachal-pradesh, jharkhand, karnataka, kerala, madhya-pradesh, maharashtra, manipur,
meghalaya, mizoram, nagaland, odisha, punjab, rajasthan, sikkim, tamil-nadu, telangana,
tripura, uttar-pradesh, uttarakhand, west-bengal`

Union territories (8):
`andaman-nicobar, chandigarh, dadra-nagar-haveli-daman-diu, delhi, jammu-kashmir,
ladakh, lakshadweep, puducherry`

Display names: use official names — "Andaman & Nicobar Islands", "Dadra & Nagar Haveli
and Daman & Diu", "Jammu & Kashmir", "Odisha", "Puducherry", "Delhi (NCT)".

## StateEntry — common fields (every tab)

```js
{
  name: "Display Name",
  summary: "2–4 sentence overview for this tab's topic in this state.",
  // ...tab-specific fields (see the tab's brief)...
  facts: ["Concise verified fact 1", "..."],       // 3–6 per state
  sources: [                                        // 2–4 per state, REQUIRED
    { title: "...", publisher: "...", url: "https://...", year: 2024 }
  ],
  confidence: "high" | "medium" | "low",
  media: []    // reserved: future videos/images enter ONLY via backend/contribution pipeline
}
```

## Integrity rules (non-negotiable)

1. **No fabrication.** Every fact must come from a source you actually consulted.
   If a datum cannot be verified, omit it or state the gap explicitly and set
   `confidence: "low"`. Never guess numbers.
2. **Source quality order:** government portals (gov.in/nic.in), ICAR/ASI/Census/RBI,
   academic publications, national academies (Sahitya/Sangeet Natak/Lalit Kala),
   GI Registry, established encyclopedias. Avoid user-editable wikis as the *only*
   source for any claim.
3. Keep prose compact — this is a knowledge map, not an essay. Summaries ≤ 4 sentences.
4. Valid JS: strings double-quoted, no trailing garbage, file must pass `node --check`.
5. ASCII quotes in code; Unicode (Devanagari etc.) allowed inside strings.
