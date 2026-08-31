import { useCallback, useMemo, useRef, useState } from 'react'
import type { Stretch, Work, WorkState } from '../../core/works'
import { stateOf } from '../../core/works'
import { useT } from '../../i18n'

/**
 * 4.1 — the map, drawn rather than fetched.
 *
 * Every map in every other civic app is a grid of tiles from a map service.
 * That is not available here, and the reason is not bandwidth.
 *
 * A tile request tells the tile server two things: the IP address of the person
 * looking, and the exact rectangle they are looking at. Do that once and you
 * have a rough position; do it every time they open the app and you have a
 * pattern of movement, held by a third party, assembled without the app ever
 * calling a location API. "We never asked for your location" would be true and
 * would not matter. So the map is an SVG drawn from published road geometry,
 * which weighs nothing, works with no signal, and sends nobody anything.
 *
 * What it gives up is real: no satellite view, no building footprints, no
 * search-as-you-drag. What a citizen actually needs from this screen — which of
 * these roads is dug, and when it is due back — survives the loss intact.
 */

const VIEW = 1000
const COLOUR: Record<WorkState, string> = {
  planned: 'var(--w-planned)',
  open: 'var(--w-open)',
  overrun: 'var(--w-overrun)',
  restored: 'var(--w-restored)',
  cancelled: 'var(--w-cancelled)',
}

interface Props {
  stretches: Stretch[]
  works: Work[]
  selected?: string | null
  onSelect: (workId: string) => void
}

/** The midpoint of a polyline, where a marker sits. */
function midpoint(path: { x: number; y: number }[]) {
  if (path.length === 0) return { x: 0, y: 0 }
  const i = Math.floor((path.length - 1) / 2)
  const a = path[i]
  const b = path[Math.min(i + 1, path.length - 1)]
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export default function WorksMap({ stretches, works, selected, onSelect }: Props) {
  const t = useT()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const byStretch = useMemo(() => {
    const map = new Map<string, Work[]>()
    for (const w of works) {
      const list = map.get(w.stretchId) ?? []
      list.push(w)
      map.set(w.stretchId, list)
    }
    return map
  }, [works])

  /** The most urgent state on a stretch decides its colour. */
  const stretchState = useCallback((id: string): WorkState | null => {
    const list = byStretch.get(id)
    if (!list || list.length === 0) return null
    const states = list.map((w) => stateOf(w))
    for (const s of ['overrun', 'open', 'planned', 'restored', 'cancelled'] as WorkState[]) {
      if (states.includes(s)) return s
    }
    return null
  }, [byStretch])

  const size = VIEW / zoom
  const viewBox = `${pan.x} ${pan.y} ${size} ${size}`

  const clampPan = (x: number, y: number) => ({
    x: Math.max(0, Math.min(VIEW - size, x)),
    y: Math.max(0, Math.min(VIEW - size, y)),
  })

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    svgRef.current?.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const scale = size / rect.width
    setPan(clampPan(d.px - (e.clientX - d.x) * scale, d.py - (e.clientY - d.y) * scale))
  }
  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = null
    svgRef.current?.releasePointerCapture(e.pointerId)
  }

  /* Panning with a pointer is a drag; panning without one is the arrow keys.
     A map that can only be moved by dragging is a map a keyboard cannot read,
     and the pins are focusable, so half of it would be reachable and the rest
     would not. */
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = size * 0.18
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0],
      ArrowUp: [0, -step], ArrowDown: [0, step],
    }
    const move = moves[e.key]
    if (move) {
      e.preventDefault()
      setPan(clampPan(pan.x + move[0], pan.y + move[1]))
      return
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.6) }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(1 / 1.6) }
  }

  const zoomBy = (factor: number) => {
    const next = Math.min(4, Math.max(1, zoom * factor))
    const nextSize = VIEW / next
    // Keep the centre where it was rather than snapping to a corner.
    const cx = pan.x + size / 2
    const cy = pan.y + size / 2
    setZoom(next)
    setPan({
      x: Math.max(0, Math.min(VIEW - nextSize, cx - nextSize / 2)),
      y: Math.max(0, Math.min(VIEW - nextSize, cy - nextSize / 2)),
    })
  }

  return (
    <div className="wmap">
      <svg
        ref={svgRef}
        className="wmap__svg"
        viewBox={viewBox}
        /* Not role="img": the pins inside are buttons, and everything inside an
           image is presentational to a screen reader. A group keeps them
           reachable, and the list below is the same information in a form that
           does not need the map at all. */
        role="group"
        aria-label={t('works.map.label')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Roads with nothing happening on them, so the ward reads as a place. */}
        {stretches.map((s) => (
          <polyline
            key={`base-${s.id}`}
            className="wmap__road"
            points={s.path.map((p) => `${p.x},${p.y}`).join(' ')}
          />
        ))}

        {/* Roads with work on them, coloured by the most urgent state. */}
        {stretches.map((s) => {
          const state = stretchState(s.id)
          if (!state) return null
          return (
            <polyline
              key={`work-${s.id}`}
              className={`wmap__road wmap__road--work wmap__road--${state}`}
              style={{ stroke: COLOUR[state] }}
              points={s.path.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          )
        })}

        {/* One marker per work, tappable. */}
        {works.map((w) => {
          const stretch = stretches.find((s) => s.id === w.stretchId)
          if (!stretch) return null
          const at = midpoint(stretch.path)
          const state = stateOf(w)
          const spread = (works.filter((o) => o.stretchId === w.stretchId).indexOf(w)) * 26
          return (
            <g
              key={w.id}
              className={`wmap__pin${selected === w.id ? ' is-on' : ''}`}
              transform={`translate(${at.x + spread} ${at.y - spread / 2})`}
              onClick={() => onSelect(w.id)}
              role="button"
              tabIndex={0}
              aria-label={`${stretch.street} — ${t(`works.state.${state}`)}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(w.id) }}
            >
              <circle r={selected === w.id ? 18 : 14} fill={COLOUR[state]} />
              <circle r={selected === w.id ? 18 : 14} className="wmap__pin-ring" />
            </g>
          )
        })}
      </svg>

      <div className="wmap__controls">
        <button type="button" className="btn btn--glass btn--icon"
          onClick={() => zoomBy(1.6)} aria-label={t('works.map.zoomIn')}>+</button>
        <button type="button" className="btn btn--glass btn--icon"
          onClick={() => zoomBy(1 / 1.6)} aria-label={t('works.map.zoomOut')}>−</button>
        <button type="button" className="btn btn--glass btn--sm"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
          {t('works.map.reset')}
        </button>
      </div>

      <ul className="wmap__legend" aria-label={t('works.map.legend')}>
        {(['open', 'overrun', 'planned', 'restored'] as WorkState[]).map((s) => (
          /* The label is its own span so that what is measured for contrast is
             the text against the ground, not the text against the swatch
             sitting beside it. A checker cannot tell those apart from the box
             alone, and it is right not to guess. */
          <li key={s}>
            <span className="wmap__swatch" style={{ background: COLOUR[s] }} aria-hidden="true" />
            <span className="wmap__legend-text">{t(`works.state.${s}`)}</span>
          </li>
        ))}
      </ul>

      <p className="wmap__note">{t('works.map.noTiles')}</p>
    </div>
  )
}
