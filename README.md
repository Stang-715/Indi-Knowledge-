# Indi-Knowledge

An India map strategy game for the web, pegged to Victoria 3.

## Docs

- [Map density & animation criteria](docs/map-density-and-animation-spec.md) — how
  Victoria 3's map density actually measures up, how much denser an India-only map needs
  to be, and the web-platform criteria (texture limits, memory, frame budget, animation
  layers) that decide whether it ships.

## Tools

- `node tools/density-calc.mjs` — recomputes every density figure in the spec from named
  assumptions.
