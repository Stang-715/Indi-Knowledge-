/**
 * The aggregation layer (design principle 4).
 *
 * Everything the Government Portal displays passes through here. Identity is
 * stripped on the way in, and small cells are suppressed on the way out — a
 * ward-level result of "3 people, all opposed" is a de-anonymisation vector,
 * not a useful signal.
 */

export const MIN_CELL = 5

export interface Bucket {
  key: string
  label: string
  count: number
}

export interface Aggregate {
  total: number
  buckets: Bucket[]
  suppressed: number
  /** Honest denominator — the platform's own reach, not "the public" (edge case 1). */
  coverage?: Coverage
}

export interface Coverage {
  /** Eligible population of the slice, from the electoral roll headcount. */
  eligible: number
  /** How many of them have an account at all. */
  reachable: number
  responded: number
}

export function coverageRate(c: Coverage): number {
  return c.eligible === 0 ? 0 : c.responded / c.eligible
}

/**
 * Turn identified rows into counts. The `identity` field of each row is read
 * only to de-duplicate and is not carried into the output — this function is
 * the boundary the spec describes.
 */
export function aggregateBy<T>(
  rows: T[],
  identityOf: (row: T) => string,
  bucketOf: (row: T) => { key: string; label: string },
  coverage?: Coverage,
): Aggregate {
  const seen = new Set<string>()
  const counts = new Map<string, Bucket>()

  for (const row of rows) {
    const id = identityOf(row)
    if (seen.has(id)) continue // one voice, one count
    seen.add(id)
    const { key, label } = bucketOf(row)
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, { key, label, count: 1 })
  }

  const all = [...counts.values()]
  const total = all.reduce((sum, b) => sum + b.count, 0)

  /*
   * Suppression applies to the breakdown, never to the headline total.
   *
   * There is deliberately no "but show it anyway when the total is small"
   * escape. That clause was here and it inverted the rule: with three responses
   * — precisely when a breakdown names people — it showed every cell. A poll
   * with one answer must report a total of one and no breakdown at all.
   */
  const kept = all.filter((b) => b.count >= MIN_CELL)
  const suppressed = all.length - kept.length

  return {
    total,
    buckets: kept.sort((a, b) => b.count - a.count),
    suppressed,
    coverage,
  }
}

export function percent(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}
