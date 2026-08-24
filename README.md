# Paramountcy

An India-only grand strategy game, **6000 BCE → 1947**, with its centre of
gravity in the deep past: **82% of a 210-hour campaign falls before 1300 CE.**

Its first economy is not goods but **stories**. For roughly three thousand years
there is no money, and a storyteller recites and is fed in grain. Works are
economic entities that are never deleted, only reduced to zero surviving
carriers — so the corpus is maintained infrastructure with running costs, and
**neglect destroys more of it than any invasion.**

The map is generated from 138 KB of control data rather than shipped as an image.

## Run it

```bash
npm run serve      # → http://localhost:8420/
```

```bash
npm run campaign            # the whole campaign, as text
npm run campaign -- --gate  # the 1193 scenario: copy out, or don't
npm run campaign -- --tend --color
npm test                    # 111 tests
npm run check               # the determinism guard
```

No build step, no dependencies. Node 22+.

## The one rule

```
world = f(datapack, seed, decision_log)
```

The game never saves the world — it saves **what you did**, and replays it. A
save file is a recipe, not a photograph of the cake. Saves are kilobytes,
multiplayer needs no extra machinery, bug reports are exact, and old saves
survive new data.

The price: `packages/sim` may never call `Math.random()` and never ask what time
it is. `npm run check` fails the build if it does.

## Layout

| | |
|---|---|
| `docs/` | The design. Start with [`10-buildplan.md`](docs/10-buildplan.md), then [`HANDOFF.md`](docs/HANDOFF.md) |
| `packages/sim/` | Deterministic, headless simulation core |
| `packages/worldgen/` | Pure terrain, climate and rasterisation |
| `packages/render-realm/` | Camera, the seventeen-rung ladder, the renderer |
| `packages/ui/` | The Cartographer's Table kit and landmark sprites |
| `apps/client/` | The playable game |
| `apps/cli/` | The campaign as text |
| `data/` | 789 timeline events, 89 works, 146 polities, the map skeleton |
| `tools/` | Generators. Every number in the docs is recomputable |

## Two legal constraints that shaped the architecture

1. **India's Geospatial Data Guidelines 2021** restrict data finer than 1 m.
   Ladder levels 15–16 are 0.41 m and 0.21 m, so they are **procedural by
   design, never shipped as data.** The legal line and the technical line turned
   out to be the same line.
2. **Boundary depiction is a criminal matter** under the Criminal Law
   (Amendment) Act 1990. The base map uses land polygons, not country polygons,
   and carries no international boundary at all. The India outline exists only
   as a visual emphasis mask and **must be replaced with Survey of India
   geometry before any India release.**

## Status

All eleven phases of the build plan are implemented and tested. A full
7,947-year campaign runs headless in 53 ms; the client paints in 1.0 s.

Not yet built: `render-city` (ladder levels 10–16), the ~85 generated sprite
assets, and roughly 360 more timeline events. See `docs/HANDOFF.md` §6.
