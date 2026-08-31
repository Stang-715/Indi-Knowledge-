/**
 * How much machine there is to work with.
 *
 * The plan's risk line for this phase is blunt: this is where the glass and the
 * mesh get cut if they do not survive, and that trade is worth making because
 * the exclusion is the central weakness of the product. A continuously repainted
 * gradient and a stack of backdrop filters are the two most expensive things in
 * this app, and on a four-year-old handset they are paid for in frame drops,
 * battery and heat — none of which show up on a developer's machine.
 *
 * So the decision is made by the device, not by a setting somebody has to find.
 * Where the browser will say the machine is small or the connection is thin,
 * the mesh paints once instead of animating and the glass becomes a flat panel.
 * The layout, the type and every word are unchanged; what goes is the part that
 * costs frames.
 *
 * Two things about the signals below.
 *
 * They are read and never sent. `deviceMemory` and `hardwareConcurrency` are
 * fingerprinting surface — coarse, but real — so they are used to make one
 * local rendering decision and go no further. Nothing here reaches the network,
 * the analytics layer or storage.
 *
 * They are conservative in the direction that helps. A browser that declines to
 * answer is treated as capable, because degrading a good phone is a smaller
 * harm than melting a bad one is — but `saveData` is honoured absolutely, since
 * somebody who has turned it on has told us what they want.
 */

export type PowerTier = 'full' | 'low'

interface Connection {
  saveData?: boolean
  effectiveType?: string
}

function connection(): Connection | undefined {
  const nav = navigator as Navigator & { connection?: Connection }
  return nav.connection
}

export interface Reading {
  tier: PowerTier
  /** Why, in the words the accessibility screen shows. */
  because: string[]
}

/** The measurement, before any preference is applied. */
export function measure(): Reading {
  const because: string[] = []
  const nav = navigator as Navigator & { deviceMemory?: number }
  const conn = connection()

  if (conn?.saveData) because.push('data-saver')
  if (conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
    because.push('slow-connection')
  }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) because.push('small-memory')
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    because.push('few-cores')
  }
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) because.push('reduced-motion')
  } catch { /* no matchMedia; not a reason either way */ }

  return { tier: because.length > 0 ? 'low' : 'full', because }
}

export type PowerPreference = 'auto' | 'full' | 'low'

/** What the app should actually render, once the citizen's choice is applied. */
export function tierFor(preference: PowerPreference): PowerTier {
  if (preference === 'full') return 'full'
  if (preference === 'low') return 'low'
  return measure().tier
}

/* ------------------------------------------------------------------ *
 * Reading the tier from a component.
 * ------------------------------------------------------------------ */

/**
 * The tier as currently applied to the document, kept in sync.
 *
 * `data-power` is written by the session provider in an effect, and a component
 * that reads it once at mount can easily read it before that has happened —
 * which is precisely what the mesh did: it checked the attribute, found nothing,
 * started its animation loop, and never looked again. The device that most
 * needed the loop stopped was the one still running it.
 *
 * So this observes the attribute rather than sampling it.
 */
export function subscribeToTier(onChange: (tier: PowerTier) => void): () => void {
  const root = document.documentElement
  const read = () => (root.dataset.power === 'low' ? 'low' : 'full')
  onChange(read())

  const observer = new MutationObserver(() => onChange(read()))
  observer.observe(root, { attributes: true, attributeFilter: ['data-power'] })
  return () => { observer.disconnect() }
}
