import { useEffect, useRef } from 'react'
import './mesh.css'

interface Props {
  /** Two hues to bloom. Usually the surface hue plus a neighbour. */
  from: string
  to: string
  /** Always-dark base — a screen with white text must not inherit a light page. */
  base?: string
  /** Ambient drift. Disabled for reduced motion regardless of this. */
  animated?: boolean
}

/**
 * The ground every surface sits on.
 *
 * Drawn on a canvas rather than shipped as an image: it weighs nothing, scales
 * to any screen, recolours per surface from one variable, and survives
 * low-bandwidth mode where images are dropped. It is also what gives the glass
 * something to refract — glass over a flat fill is just grey.
 */
export default function MeshGround({
  from, to, base = '#0F1320', animated = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const ctx = cv.getContext('2d')
    if (!ctx) return undefined

    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced' ||
      !animated

    let raf = 0
    let start = performance.now()

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
      ctx.fillStyle = base
      ctx.fillRect(0, 0, w, h)

      // Slow enough to read as light shifting rather than as animation.
      const t = still ? 0 : (now - start) / 9000
      const span = Math.max(w, h)
      const blobs = [
        { x: w * (0.18 + Math.sin(t) * 0.06), y: h * (0.10 + Math.cos(t * 0.8) * 0.04), r: span * 0.72, c: from },
        { x: w * (0.90 + Math.cos(t * 0.7) * 0.05), y: h * (0.74 + Math.sin(t) * 0.05), r: span * 0.62, c: to },
        { x: w * 0.52, y: h * (1.06 + Math.sin(t * 0.6) * 0.04), r: span * 0.55, c: from },
      ]

      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, b.c + '99')
        g.addColorStop(0.55, b.c + '2E')
        g.addColorStop(1, b.c + '00')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
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
  }, [from, to, base, animated])

  return <canvas className="mesh" ref={ref} aria-hidden="true" />
}
