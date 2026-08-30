import { useEffect, useRef, useState, type RefObject } from 'react'
import { useMeshSampler } from './mesh-context'

/**
 * Content-sampled tint — the difference between glass that looks like glass and
 * glass that behaves like it.
 *
 * Real glass takes its colour from whatever is behind it. Static glassmorphism
 * fakes this with a fixed white or grey wash, which is why it reads as a flat
 * overlay the moment the content beneath changes. This samples the ground under
 * the element and tints toward it, so a card over the marigold bloom and the
 * same card over the violet one are visibly different objects.
 *
 * Returns a CSS colour, or null when there is nothing to sample — in which case
 * the caller falls back to the static token and nothing breaks.
 */
export function useContentTint(
  ref: RefObject<HTMLElement | null>,
  { strength = 0.5, enabled = true }: { strength?: number; enabled?: boolean } = {},
): string | null {
  const sampler = useMeshSampler()
  const [tint, setTint] = useState<string | null>(null)
  const last = useRef<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !sampler || !enabled) {
      setTint(null)
      return undefined
    }

    let raf = 0
    let queued = false

    const read = () => {
      queued = false
      const rgb = sampler.sample(el.getBoundingClientRect())
      if (!rgb) return
      const next = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${strength})`
      // Only re-render when the tint actually moved — scrolling past a flat
      // stretch of ground should cost nothing.
      if (next !== last.current) {
        last.current = next
        setTint(next)
      }
    }

    const schedule = () => {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(read)
    }

    read()

    // The ground drifts and the element moves; both change what is behind it.
    const scroller = el.closest('.shell__main') ?? window
    scroller.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    const timer = window.setInterval(schedule, 900)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(timer)
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref, sampler, strength, enabled])

  return tint
}
