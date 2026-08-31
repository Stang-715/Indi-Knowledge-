import { useEffect, useMemo, useRef, useState } from 'react'
import { subscribeToTier, type PowerTier } from '../../core/capability'
import type { ReactNode } from 'react'
import { MeshContext, type MeshSampler } from './mesh-context'
import './mesh.css'

interface Props {
  /** Two hues to bloom. Usually the surface hue plus a neighbour. */
  from: string
  to: string
  /** Always-dark base — a screen with white text must not inherit a light page. */
  base?: string
  /** Ambient drift. Disabled for reduced motion regardless of this. */
  animated?: boolean
  children?: ReactNode
}

/** Probe resolution. Big enough to locate a bloom, small enough to read for free. */
const PW = 24
const PH = 48

/**
 * The ground every surface sits on, and the thing glass samples.
 *
 * Drawn on a canvas rather than shipped as an image: it weighs nothing, scales
 * to any screen, recolours per surface from one variable, and survives
 * low-bandwidth mode where images are dropped. It is also what gives the glass
 * something to refract — glass over a flat fill is just grey.
 *
 * Alongside the visible canvas it maintains a 24×48 copy of the same gradient.
 * Glass surfaces sample that to find out what colour they are sitting over,
 * which is what makes them behave like glass rather than merely look like it.
 */
export default function MeshGround({
  from, to, base = '#0F1320', animated = true, children,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const probe = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(0)
  /* Observed rather than read once: the session provider sets `data-power` in
     its own effect, and whichever of the two ran first decided whether this
     canvas animated forever. */
  const [tier, setTier] = useState<PowerTier>('full')
  useEffect(() => subscribeToTier(setTier), [])

  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const ctx = cv.getContext('2d')
    if (!ctx) return undefined

    if (!probe.current) {
      probe.current = document.createElement('canvas')
      probe.current.width = PW
      probe.current.height = PH
    }
    const pctx = probe.current.getContext('2d', { willReadFrequently: true })

    /* A continuously repainted gradient is the single most expensive thing in
       this app. It stops for a stated motion preference, and equally for a
       device that told us it is small or on a thin connection — the person on
       a four-year-old handset is the one who can least afford it and the least
       likely to go looking for a setting. */
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced' ||
      tier === 'low' ||
      !animated

    let raf = 0
    let start = performance.now()

    /** One gradient, drawn into whichever context and scale it is handed. */
    const paint = (
      c: CanvasRenderingContext2D, w: number, h: number, t: number,
    ) => {
      c.fillStyle = base
      c.fillRect(0, 0, w, h)
      const span = Math.max(w, h)
      const blobs = [
        { x: w * (0.18 + Math.sin(t) * 0.06), y: h * (0.10 + Math.cos(t * 0.8) * 0.04), r: span * 0.72, c: from },
        { x: w * (0.90 + Math.cos(t * 0.7) * 0.05), y: h * (0.74 + Math.sin(t) * 0.05), r: span * 0.62, c: to },
        { x: w * 0.52, y: h * (1.06 + Math.sin(t * 0.6) * 0.04), r: span * 0.55, c: from },
      ]
      for (const b of blobs) {
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, b.c + '7A')
        g.addColorStop(0.55, b.c + '22')
        g.addColorStop(1, b.c + '00')
        c.fillStyle = g
        c.beginPath()
        c.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        c.fill()
      }
    }

    const draw = (now: number) => {
      const w = cv.clientWidth
      const h = cv.clientHeight
      if (w === 0 || h === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (cv.width !== w * dpr || cv.height !== h * dpr) {
        cv.width = w * dpr
        cv.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Slow enough to read as light shifting rather than as animation.
      const t = still ? 0 : (now - start) / 9000
      paint(ctx, w, h, t)
      if (pctx) {
        paint(pctx, PW, PH, t)
        setReady((n) => (n === 0 ? 1 : n))
      }

      if (!still) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    const onResize = () => draw(performance.now())
    window.addEventListener('resize', onResize, { passive: true })

    // Stop burning frames while the app is backgrounded — this runs on phones.
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!still) { start = performance.now(); raf = requestAnimationFrame(draw) }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [from, to, base, animated, tier])

  const sampler = useMemo<MeshSampler>(() => ({
    sample: (rect) => {
      const cv = probe.current
      if (!cv || ready === 0) return null
      // High contrast hides the mesh entirely, so there is nothing behind glass.
      if (document.documentElement.dataset.contrast === 'high') return null
      const pctx = cv.getContext('2d', { willReadFrequently: true })
      if (!pctx) return null

      const x = Math.round(((rect.left + rect.width / 2) / window.innerWidth) * PW)
      const y = Math.round(((rect.top + rect.height / 2) / window.innerHeight) * PH)
      const px = Math.max(0, Math.min(PW - 1, x))
      const py = Math.max(0, Math.min(PH - 1, y))

      try {
        const d = pctx.getImageData(px, py, 1, 1).data
        return { r: d[0], g: d[1], b: d[2] }
      } catch {
        return null
      }
    },
  }), [ready])

  return (
    <MeshContext.Provider value={sampler}>
      <canvas className="mesh" ref={ref} aria-hidden="true" />
      {children}
    </MeshContext.Provider>
  )
}
