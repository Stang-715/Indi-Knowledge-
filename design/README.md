# Chowk — design system

`chowk-kit.html` is the brand kit, UI kit and page map in one self-contained page.
Open it in a browser; the components in it are live, not screenshots.

Published: https://claude.ai/code/artifact/7f500136-20a9-4b30-8884-d8b57c4501cd

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
