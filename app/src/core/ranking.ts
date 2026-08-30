/**
 * Discussion ordering (design principle 5).
 *
 * "Balanced view" is the default, and the alternatives deliberately exclude a
 * pure engagement sort. There is no author-weighting term in any of these
 * comparators — an account cannot be boosted because there is nowhere to put
 * the boost.
 */

import type { Post, Stance } from './types'

export type SortMode = 'balanced' | 'recent' | 'discussed'

export const SORT_MODES: { id: SortMode; labelKey: string }[] = [
  { id: 'balanced', labelKey: 'sort.balanced' },
  { id: 'recent', labelKey: 'sort.recent' },
  { id: 'discussed', labelKey: 'sort.discussed' },
]

const STANCE_ORDER: Stance[] = ['support', 'oppose', 'mixed', 'question']

/**
 * Round-robin across stances so the top of a thread always shows disagreement
 * rather than whichever side arrived first or shouted loudest. Within a stance
 * the ordering is by engagement, so the best-argued version of each position
 * surfaces — the diversity is across groups, the quality signal within them.
 */
export function balanced(posts: Post[]): Post[] {
  const lanes = new Map<Stance, Post[]>()
  for (const stance of STANCE_ORDER) lanes.set(stance, [])
  for (const post of posts) {
    (lanes.get(post.stance) ?? lanes.get('mixed'))!.push(post)
  }
  for (const lane of lanes.values()) {
    lane.sort((a, b) => b.agree + b.disagree - (a.agree + a.disagree))
  }

  const out: Post[] = []
  let drained = false
  let round = 0
  while (!drained) {
    drained = true
    for (const stance of STANCE_ORDER) {
      const lane = lanes.get(stance)!
      if (round < lane.length) {
        out.push(lane[round])
        drained = false
      }
    }
    round += 1
  }
  return out
}

export function sortPosts(posts: Post[], mode: SortMode): Post[] {
  const live = posts.filter((p) => !p.removed)
  switch (mode) {
    case 'recent':
      return [...live].sort((a, b) => b.createdAt - a.createdAt)
    case 'discussed':
      // Total engagement, not net approval: a contested post is *more*
      // interesting here, not less.
      return [...live].sort(
        (a, b) => b.agree + b.disagree - (a.agree + a.disagree),
      )
    case 'balanced':
    default:
      return balanced(live)
  }
}

export function stanceMix(posts: Post[]): Record<Stance, number> {
  const mix: Record<Stance, number> = { support: 0, oppose: 0, mixed: 0, question: 0 }
  for (const p of posts) if (!p.removed) mix[p.stance] += 1
  return mix
}
