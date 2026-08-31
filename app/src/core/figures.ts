import type { Provenance } from './provenance'

/**
 * A number that cannot be shown without saying where it came from and when.
 *
 * Surface 2's exit criterion is one sentence: every number on the surface can
 * name its source and its age, and no figure ships without both. That is easy
 * to write into a plan and hard to keep — the pressure is always the same, one
 * more tile on the dashboard, the source added later, later never arrives. The
 * failure mode is not an error. It is a screen that looks authoritative over
 * data that is four months stale, which is worse than an empty screen because
 * somebody will act on it.
 *
 * So the criterion is a type rather than a rule. `Figure` is branded, so no
 * object literal is assignable to it: the only way to obtain one is `figure()`,
 * and `figure()` will not compile without a source, a URL and an `asOf`. A
 * component that wants to print a number has to be handed one of these, and the
 * single component that renders them prints the lag beside the value.
 *
 * Derived numbers carry the derivation. A year-on-year change is only as fresh
 * as the older of the two figures behind it, and only as trustworthy as the
 * weaker of their provenances — `derive` works that out rather than letting a
 * calculation launder a stale input into a confident output.
 */

declare const FIGURE: unique symbol

export type Unit =
  | 'tonnes' | 'lakh-tonnes' | 'crore-rupees' | 'usd-million'
  | 'celsius' | 'mm' | 'percent' | 'count' | 'index' | 'teu'

export interface Figure {
  /** Brand. Nothing outside this module can produce one. */
  readonly [FIGURE]: true
  readonly value: number
  readonly unit: Unit
  /** Who published it, in the words they are known by. */
  readonly source: string
  readonly sourceUrl: string
  /** The period the number describes — not when we fetched it. */
  readonly asOf: number
  /** How it was arrived at, where that is not obvious. */
  readonly method?: string
  readonly provenance: Provenance
  /** Decimal places. Publishing more precision than the source had is a lie. */
  readonly precision: number
}

export interface FigureSpec {
  value: number
  unit: Unit
  source: string
  sourceUrl: string
  asOf: number
  provenance: Provenance
  method?: string
  precision?: number
}

/** The only way to make a Figure. Every field above is required for a reason. */
export function figure(spec: FigureSpec): Figure {
  return {
    value: spec.value,
    unit: spec.unit,
    source: spec.source,
    sourceUrl: spec.sourceUrl,
    asOf: spec.asOf,
    method: spec.method,
    provenance: spec.provenance,
    precision: spec.precision ?? 0,
  } as Figure
}

const DAY = 24 * 60 * 60 * 1000

/** How old the figure's own period is, in days. Not how long ago we fetched it. */
export function ageDays(f: Figure, now = Date.now()): number {
  return Math.max(0, Math.floor((now - f.asOf) / DAY))
}

/**
 * Whether a figure is old enough that showing it without emphasis would
 * mislead. Deliberately per-unit: a temperature from last week is useless and a
 * trade figure from last quarter is normal.
 */
const STALE_AFTER: Partial<Record<Unit, number>> = {
  celsius: 1, mm: 1, index: 30,
}
export function isStale(f: Figure, now = Date.now()): boolean {
  return ageDays(f, now) > (STALE_AFTER[f.unit] ?? 400)
}

const WEAKEST: Provenance[] = ['unreadable', 'sample', 'partial', 'official']

/**
 * A number computed from other numbers.
 *
 * It inherits the oldest `asOf` and the weakest provenance of its inputs,
 * because a derived figure is exactly as good as the worst thing it was
 * derived from. Without this, dividing an official figure by a sample one
 * produces something that looks official.
 */
export function derive(
  value: number,
  unit: Unit,
  from: Figure[],
  spec: { source?: string; sourceUrl?: string; method: string; precision?: number },
): Figure {
  if (from.length === 0) throw new Error('a derived figure needs its inputs')
  const asOf = Math.min(...from.map((f) => f.asOf))
  const provenance = from
    .map((f) => f.provenance)
    .sort((a, b) => WEAKEST.indexOf(a) - WEAKEST.indexOf(b))[0]

  return figure({
    value,
    unit,
    source: spec.source ?? from.map((f) => f.source).join(' and '),
    sourceUrl: spec.sourceUrl ?? from[0].sourceUrl,
    asOf,
    provenance,
    method: spec.method,
    precision: spec.precision ?? 1,
  })
}

/** Year-on-year change, as a percentage, carrying both inputs' weaknesses. */
export function yearOnYear(now: Figure, before: Figure): Figure | null {
  if (before.value === 0) return null
  return derive(
    ((now.value - before.value) / before.value) * 100,
    'percent',
    [now, before],
    {
      method: 'Change against the same period a year earlier.',
      precision: 1,
    },
  )
}

/** Formatting lives here and nowhere else, so no number reaches a screen bare. */
const SUFFIX: Record<Unit, string> = {
  tonnes: ' t',
  'lakh-tonnes': ' lakh t',
  'crore-rupees': ' cr',
  'usd-million': 'M',
  celsius: '°C',
  mm: ' mm',
  percent: '%',
  count: '',
  index: '',
  teu: ' TEU',
}

const PREFIX: Partial<Record<Unit, string>> = {
  'crore-rupees': '₹',
  'usd-million': '$',
}

export function formatFigure(f: Figure, locale?: string): string {
  const n = f.value.toLocaleString(locale, {
    minimumFractionDigits: f.precision,
    maximumFractionDigits: f.precision,
  })
  const sign = f.unit === 'percent' && f.value > 0 ? '+' : ''
  return `${PREFIX[f.unit] ?? ''}${sign}${n}${SUFFIX[f.unit]}`
}

/** The period a figure describes, said the way its source says it. */
export function formatPeriod(f: Figure, locale?: string): string {
  const d = new Date(f.asOf)
  if (f.unit === 'celsius' || f.unit === 'mm') {
    return d.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit' })
  }
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}
