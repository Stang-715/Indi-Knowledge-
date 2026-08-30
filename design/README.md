# Chowk — design system

`chowk-kit.html` is the brand kit, UI kit and page map in one self-contained page.
Open it in a browser; the components in it are live, not screenshots.

Published: https://claude.ai/code/artifact/7f500136-20a9-4b30-8884-d8b57c4501cd

`chowk-plan.html` is the twelve-phase build plan: design orientation per surface,
exit criteria and risks per phase, a risk register, and the research findings that
reordered the work.

Published: https://claude.ai/code/artifact/0c7a6ea6-0e3d-4940-8ce7-f5af1b90c486

## External constraints the plan is built on

Researched rather than assumed, and each one changed the order of the work:

- **DPDP Act 2023 + Rules 2025** — full compliance expected 13 May 2027. Consent must
  be free, specific, informed and unconditional, preceded by a plain-language notice,
  available in English or any Eighth Schedule language. Under-18s must not be profiled.
- **Eighth Schedule** — 22 scheduled languages, not the 5 we scoped. Anek covers 10
  Indic scripts; Santali, Kashmiri, Sindhi, Dogri, Manipuri and Bodo need more.
- **Right to Service Acts** — statutory service timelines with appeal routes. Surface
  4's overrun record is a digital surface for an obligation that already exists.
- **UX4G / GIGW 3.0** — the government's own design system, WCAG 2.1 AA. Adopt its
  compliance substance, not its visual identity.
- **Liquid Glass vs Material 3 Expressive** — the platforms diverged in 2025, and
  current glass is behavioural rather than visual. Ours is the static kind.

## Why the fonts are inlined

`fonts/` holds the variable woff2 for Anek Latin and Instrument Sans, embedded in
the kit as data URIs rather than linked from Google Fonts.

The display face's width axis is load-bearing — the condensed numerals and
headlines are set between 78% and 92% — and a linked face fails silently: the
page still renders, at the wrong proportions, and nothing reports an error. It
was already failing that way during development before the fonts were embedded.

Two details worth keeping if this moves into the app build:

- The axis is reached through `font-stretch`, **not** `font-variation-settings`.
  Google serves Anek with `font-stretch: 75% 125%` on the `@font-face`, so
  `font-variation-settings: 'wdth' 80` is silently ignored.
- Google's CSS endpoint serves static TTF instances to older user agents and the
  variable woff2 to modern ones, so what you get depends on the request. Embedding
  removes the question.

Both faces are SIL Open Font License 1.1.

## Status

Nothing in the app is built against this kit yet. The six open decisions are at
the end of the page, under "Before I build".
