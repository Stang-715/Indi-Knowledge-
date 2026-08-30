import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './island-nav.css'

export type SurfaceId = 'sarathi' | 'bharat' | 'bills' | 'works'

export interface NavTab {
  id: SurfaceId
  label: string
  hue: string
  icon: React.ReactNode
}

interface Props {
  tabs: NavTab[]
  active: SurfaceId
  onSelect: (id: SurfaceId) => void
  /** Label for the contextual action; changes meaning per surface. */
  actionLabel: string
  onAction: () => void
}

/**
 * The floating island.
 *
 * Only the selected tab carries its label, so the island stays narrow and the
 * active surface is unmistakable. The glow slides between tabs and adopts that
 * surface's hue — the navigation is where the four colours are taught.
 */
export default function IslandNav({
  tabs, active, onSelect, actionLabel, onAction,
}: Props) {
  const navRef = useRef<HTMLElement>(null)
  const [glow, setGlow] = useState({ left: 0, width: 0, hue: tabs[0]?.hue ?? '#E8991F' })

  const place = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    const el = nav.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!el) return
    const tab = tabs.find((t) => t.id === active)
    setGlow({ left: el.offsetLeft, width: el.offsetWidth, hue: tab?.hue ?? '#E8991F' })
  }, [active, tabs])

  // Layout effect so the glow never renders a frame behind the label expanding.
  useLayoutEffect(place, [place])

  useEffect(() => {
    // The selected label animates open, so the final width only settles after
    // the transition — measure again once it has.
    const t = window.setTimeout(place, 460)
    window.addEventListener('resize', place, { passive: true })
    document.fonts?.ready.then(place).catch(() => {})
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', place)
    }
  }, [place])

  return (
    <nav className="inav" ref={navRef} aria-label="Surfaces">
      <span
        className="inav__glow"
        aria-hidden="true"
        style={{
          left: glow.left, width: glow.width,
          background: glow.hue, boxShadow: `0 6px 18px -6px ${glow.hue}`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="inav__tab"
          aria-selected={tab.id === active}
          aria-label={tab.label}
          onClick={() => onSelect(tab.id)}
        >
          <span className="inav__icon" aria-hidden="true">{tab.icon}</span>
          <span className="inav__label">{tab.label}</span>
        </button>
      ))}

      <span className="inav__sep" aria-hidden="true" />

      <button type="button" className="inav__act" onClick={onAction} aria-label={actionLabel}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </nav>
  )
}
