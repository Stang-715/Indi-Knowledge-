import { useEffect, useRef, useState } from 'react'
import type { Mood } from '../../caricature/brain'
import './stage.css'

interface Props {
  mood: Mood
  speaking: boolean
  listening: boolean
  /** Blinking, gaze tracking and sway all off — reduced motion or screen reader. */
  still: boolean
  size?: number
  onPoke?: () => void
  label: string
}

interface Shape {
  browY: number
  browTilt: number
  eyeOpen: number
  mouthCurve: number
  headTilt: number
}

const MOODS: Record<Mood, Shape> = {
  neutral:    { browY: 0,  browTilt: 0,   eyeOpen: 1,    mouthCurve: 4,  headTilt: 0 },
  happy:      { browY: -3, browTilt: -4,  eyeOpen: .82,  mouthCurve: 15, headTilt: -2 },
  thinking:   { browY: -5, browTilt: 11,  eyeOpen: .9,   mouthCurve: -2, headTilt: 4 },
  concerned:  { browY: 3,  browTilt: -13, eyeOpen: 1.05, mouthCurve: -7, headTilt: 0 },
  explaining: { browY: -4, browTilt: 2,   eyeOpen: 1,    mouthCurve: 7,  headTilt: -1 },
}

/**
 * 1.1 — the stage.
 *
 * Hand-drawn as SVG rather than shipped as video or a sprite sheet: a couple of
 * kilobytes, scales to any screen, recolours with the surface, and works in
 * low-bandwidth mode where images are dropped. On a slow connection he is the
 * one thing that still arrives whole.
 */
export default function Stage({
  mood, speaking, listening, still, size = 240, onPoke, label,
}: Props) {
  const shape = MOODS[mood]
  const [blink, setBlink] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [mouth, setMouth] = useState(0)
  const [poked, setPoked] = useState(false)
  const frame = useRef(0)

  /* Blinking — irregular, because a metronome blink reads as uncanny. */
  useEffect(() => {
    if (still) return undefined
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 110)
        schedule()
      }, 2200 + Math.random() * 4200)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [still])

  /* Gaze follows the touch or pointer. Entirely local; nothing is recorded. */
  useEffect(() => {
    if (still) return undefined
    const onMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 3
      setGaze({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))),
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [still])

  /* Mouth while speaking. Not real visemes — a jaw moving at speaking cadence,
     which is what reads as talking at this size. */
  useEffect(() => {
    if (!speaking || still) {
      setMouth((v) => (v === 0 ? v : 0))
      return undefined
    }
    let last = performance.now()
    let target = 0.7
    const tick = (now: number) => {
      if (now - last > 90 + Math.random() * 80) {
        target = 0.15 + Math.random() * 0.85
        last = now
      }
      setMouth((v) => v + (target - v) * 0.35)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [speaking, still])

  const poke = () => {
    setPoked(true)
    window.setTimeout(() => setPoked(false), 480)
    onPoke?.()
  }

  const eyeH = blink ? 0.06 : shape.eyeOpen
  const px = gaze.x * 4.5
  const py = gaze.y * 3
  const mouthTop = 158
  const lipDrop = shape.mouthCurve * (1 - mouth * 0.6)
  const jaw = 3 + mouth * 20

  return (
    <div
      className={[
        'stage',
        still ? 'stage--still' : '',
        speaking ? 'stage--speaking' : '',
        listening ? 'stage--listening' : '',
        poked ? 'stage--poked' : '',
      ].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      {/* A ring that only appears while the microphone is open. Nothing else in
          the app pulses, so it cannot be mistaken for decoration. */}
      {listening && <span className="stage__halo" aria-hidden="true" />}

      <svg
        viewBox="0 0 220 230"
        width={size}
        height={size}
        role="img"
        aria-label={label}
        className="stage__svg"
        style={{ transform: `rotate(${shape.headTilt}deg)` }}
        onClick={poke}
      >
        <defs>
          <radialGradient id="ch-skin" cx="42%" cy="34%">
            <stop offset="0%" stopColor="#D99B6C" />
            <stop offset="100%" stopColor="#BD7C4D" />
          </radialGradient>
          <linearGradient id="ch-cloth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F6F6B" />
            <stop offset="100%" stopColor="#1F4F4D" />
          </linearGradient>
          <linearGradient id="ch-shawl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8D9BD" />
            <stop offset="100%" stopColor="#CDB894" />
          </linearGradient>
        </defs>

        <path d="M18 232C24 196 58 178 110 178s86 18 92 54Z" fill="url(#ch-shawl)" stroke="#8D7A58" strokeWidth="2.5" />
        <path d="M84 180c12 20 40 20 52 0" fill="none" stroke="#8D7A58" strokeWidth="2.5" />

        <ellipse cx="38" cy="118" rx="10" ry="14" fill="url(#ch-skin)" stroke="#8A5A34" strokeWidth="2.5" />
        <ellipse cx="182" cy="118" rx="10" ry="14" fill="url(#ch-skin)" stroke="#8A5A34" strokeWidth="2.5" />

        <path d="M44 106c0-44 28-68 66-68s66 24 66 68-24 76-66 76-66-32-66-76Z"
          fill="url(#ch-skin)" stroke="#8A5A34" strokeWidth="3" />

        <path d="M40 92c4-46 34-66 70-66s66 20 70 66c-20-18-40-26-70-26s-50 8-70 26Z"
          fill="url(#ch-cloth)" stroke="#173C3A" strokeWidth="3" />
        <path d="M38 92c32-16 112-16 144 0" fill="none" stroke="#E8D9BD" strokeWidth="5" strokeLinecap="round" />
        {/* The one marigold note on him — it ties the guide to his surface. */}
        <circle cx="110" cy="24" r="7" fill="var(--hue)" stroke="#173C3A" strokeWidth="2.5" />

        <g className="stage__brows">
          <path d={`M60 ${104 + shape.browY}q16 -10 34 -2`} fill="none" stroke="#3A2718"
            strokeWidth="6" strokeLinecap="round" transform={`rotate(${shape.browTilt} 77 102)`} />
          <path d={`M126 ${102 + shape.browY}q18 -8 34 2`} fill="none" stroke="#3A2718"
            strokeWidth="6" strokeLinecap="round" transform={`rotate(${-shape.browTilt} 143 102)`} />
        </g>

        <g className="stage__eyes">
          <ellipse cx="78" cy="120" rx="16" ry={16 * eyeH} fill="#FFFAF2" stroke="#6B452A" strokeWidth="2.5" />
          <ellipse cx="142" cy="120" rx="16" ry={16 * eyeH} fill="#FFFAF2" stroke="#6B452A" strokeWidth="2.5" />
          {!blink && (
            <>
              <circle cx={78 + px} cy={120 + py} r="6.6" fill="#2A1B10" />
              <circle cx={142 + px} cy={120 + py} r="6.6" fill="#2A1B10" />
              <circle cx={80 + px} cy={117 + py} r="2.1" fill="#fff" opacity=".9" />
              <circle cx={144 + px} cy={117 + py} r="2.1" fill="#fff" opacity=".9" />
            </>
          )}
        </g>

        <path d="M110 124c-6 14-8 20 0 24 6 0 8-3 8-6" fill="none" stroke="#8A5A34"
          strokeWidth="3" strokeLinecap="round" />

        <path d="M80 155c8-12 22-6 30-6s22-6 30 6c-10-3-22 0-30 0s-20-3-30 0Z"
          fill="#3A2718" stroke="#3A2718" strokeWidth="3" strokeLinejoin="round" />

        <path
          d={`M88 ${mouthTop + 10}Q110 ${mouthTop + 10 + lipDrop} 132 ${mouthTop + 10}
              Q110 ${mouthTop + 10 + lipDrop + jaw} 88 ${mouthTop + 10}Z`}
          fill={mouth > 0.12 ? '#6D2C2C' : '#A44B4B'}
          stroke="#5A2020" strokeWidth="2.5" strokeLinejoin="round"
        />

        {mood === 'thinking' && !still && (
          <g className="stage__think">
            <circle cx="188" cy="60" r="4" />
            <circle cx="200" cy="46" r="5.5" />
            <circle cx="210" cy="30" r="7" />
          </g>
        )}
      </svg>
    </div>
  )
}
