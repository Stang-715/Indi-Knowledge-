import { useEffect, useState } from 'react'
import './dynamic-island.css'

export type IslandState = 'hidden' | 'compact' | 'pill' | 'expanded'

export interface Activity {
  id: string
  /** Which surface raised it — the island takes that hue. */
  hue: string
  /** Small text on the pill. */
  label: string
  /** Right-aligned value: a countdown, a temperature, a count. */
  value?: string
  /** Shown only when expanded. */
  title?: string
  eyebrow?: string
  actions?: { label: string; primary?: boolean; onSelect: () => void }[]
}

interface Props {
  /** Label for the dismiss control, from the catalogue. */
  dismissLabel: string
  activity: Activity | null
  state: IslandState
  onStateChange: (next: IslandState) => void
}

/**
 * The app's only interruption channel, which earns that by staying small.
 *
 * Compact while something ticks in the background, pill when there is a number
 * worth glancing at, expanded only on a tap or a genuine alert. It inherits the
 * hue of whatever raised it, so you know which surface is talking before you
 * read a word.
 */
export default function DynamicIsland({ activity, state, onStateChange, dismissLabel }: Props) {
  const [mounted, setMounted] = useState(false)

  // Mount one frame late so the first paint animates in rather than snapping.
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40)
    return () => window.clearTimeout(t)
  }, [])

  if (!activity || state === 'hidden') {
    // The notch itself is always drawn — the island grows out of it.
    return <div className="di di--notch" aria-hidden="true" />
  }

  const expanded = state === 'expanded'
  const interactive = state !== 'expanded'

  return (
    <div
      className={`di di--${state}${mounted ? ' is-mounted' : ''}`}
      style={{ ['--di-hue' as string]: activity.hue }}
      role={expanded ? 'region' : undefined}
      aria-label={expanded ? activity.title ?? activity.label : undefined}
      onClick={interactive ? () => onStateChange('expanded') : undefined}
    >
      {state === 'compact' && <span className="di__pulse" aria-hidden="true" />}

      {state === 'pill' && (
        <>
          <span className="di__pulse" aria-hidden="true" />
          <span className="di__label">{activity.label}</span>
          {activity.value && <span className="di__value">{activity.value}</span>}
        </>
      )}

      {expanded && (
        <>
          <div className="di__head">
            <span className="di__eyebrow">{activity.eyebrow ?? activity.label}</span>
            <span className="di__pulse" aria-hidden="true" />
          </div>
          <p className="di__title">{activity.title ?? activity.label}</p>
          <div className="di__actions">
            {(activity.actions ?? []).map((a) => (
              <button
                key={a.label}
                type="button"
                className={a.primary ? 'di__btn di__btn--key' : 'di__btn'}
                onClick={(e) => { e.stopPropagation(); a.onSelect() }}
              >
                {a.label}
              </button>
            ))}
            <button
              type="button"
              className="di__btn"
              onClick={(e) => { e.stopPropagation(); onStateChange('pill') }}
            >
              {dismissLabel}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
