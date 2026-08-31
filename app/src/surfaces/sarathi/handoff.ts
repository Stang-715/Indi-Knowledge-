import type { Answer } from '../../caricature/brain'

/**
 * 1.4 — handoff.
 *
 * When Sarathi's answer points somewhere, he offers the jump rather than taking
 * it. Being moved mid-sentence by something you were talking to is disorienting,
 * and on a guide surface the whole contract is that he explains and you decide.
 *
 * The context he was answering travels with the jump, so the destination can say
 * why you arrived instead of dropping you on a cold list.
 */

export interface Handoff {
  label: string
  to: string
  /** Carried into the destination so it can explain the arrival. */
  because: string
}

/** Built surfaces first; legacy paths still map onto the surface that will
    absorb them, so the handoff is coloured correctly either way. */
const SURFACE_OF: { prefix: string; surface: string }[] = [
  { prefix: '/s/bills', surface: 'bills' },
  { prefix: '/s/bharat', surface: 'bharat' },
  { prefix: '/s/works', surface: 'works' },
  { prefix: '/s/sarathi', surface: 'sarathi' },
  { prefix: '/app/polls', surface: 'bills' },
  { prefix: '/app/discuss', surface: 'bills' },
  { prefix: '/app/notices', surface: 'works' },
  { prefix: '/gov', surface: 'works' },
  { prefix: '/oversight', surface: 'bills' },
  { prefix: '/app/profile', surface: 'sarathi' },
]

export function surfaceFor(path: string): string | null {
  return SURFACE_OF.find((m) => path.startsWith(m.prefix))?.surface ?? null
}

export function handoffFrom(answer: Answer, question: string): Handoff | null {
  if (!answer.goto) return null
  return {
    label: answer.goto.label,
    to: answer.goto.to,
    because: question,
  }
}

const KEY = 'chowk:handoff'

/**
 * Session storage, not local: an explanation of why you arrived is only useful
 * for the arrival. Keeping it past the tab would mean a stale reason surfacing
 * days later on an unrelated visit.
 */
export function stashHandoff(h: Handoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(h))
  } catch {
    /* private mode — the jump still works, it just arrives without the reason */
  }
}

export function takeHandoff(): Handoff | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    sessionStorage.removeItem(KEY)
    return JSON.parse(raw) as Handoff
  } catch {
    return null
  }
}
