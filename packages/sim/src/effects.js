/**
 * Class effects and magnitude weights, shared between the engine and the
 * timeline generator.
 *
 * Until phase 35 these lived inside the engine, which meant every event of a
 * class did the identical thing to the identical pillars — 1,347 events were
 * mechanically about twelve. The generator now bakes a per-event `affects`
 * into the data (hand-authored where a card makes a claim, seeded jitter on
 * these defaults everywhere else), and the engine prefers it. These tables
 * remain the fallback and the jitter's base, so they must stay in one place.
 */
export const CLASS_EFFECTS = {
  WORK:        { IT: 1, CLASSICISM: 1 },
  SITE:        { STRUCTURE: 1 },
  STRUCTURE:   { STRUCTURE: 2 },
  TRANSITION:  { DESIGN: 1, IT: 1 },
  AGRICULTURE: { AGRICULTURE: 2 },
  TRADE:       { TRADE: 2, NETWORKING: 1 },
  REFORM:      { CULTIVATION: 1, NETWORKING: 1 },
  FOUNDATION:  { STRUCTURE: 1, NETWORKING: 1 },
  FRONTIER:    { NETWORKING: -1 },
  INVASION:    { TRADE: -2, STRUCTURE: -1 },
  CATASTROPHE: { IT: -2, CLASSICISM: -1 },
  CLIMATE:     { AGRICULTURE: -2, TRADE: -1 },
  COLONIAL:    { TRADE: -2 },
  EPOCH:       {},
};

export const MAG_WEIGHT = { W: 2.0, M: 1.0, R: 0.5, m: 0.25 };
