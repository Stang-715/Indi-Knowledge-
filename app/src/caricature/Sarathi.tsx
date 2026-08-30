import { useEffect, useRef, useState } from 'react'
import type { Mood } from './brain'
import './sarathi.css'

interface Props {
  mood: Mood
  speaking: boolean
  /** Disables blinking, sway and pupil tracking. */
  still: boolean
  size?: number
  onPoke?: () => void
  label: string
}

interface MoodShape {
  browY: number
  browTilt: number
  eyeOpen: number
  mouthCurve: number
  headTilt: number
}

const MOODS: Record<Mood, MoodShape> = {
  neutral:    { browY: 0,  browTilt: 0,  eyeOpen: 1,    mouthCurve: 4,   headTilt: 0 },
  happy:      { browY: -3, browTilt: -4, eyeOpen: 0.82, mouthCurve: 15,  headTilt: -2 },
  thinking:   { browY: -5, browTilt: 11, eyeOpen: 0.9,  mouthCurve: -2,  headTilt: 4 },
  concerned:  { browY: 3,  browTilt: -13, eyeOpen: 1.05, mouthCurve: -7, headTilt: 0 },
  explaining: { browY: -4, browTilt: 2,  eyeOpen: 1,    mouthCurve: 7,   headTilt: -1 },
}

/**
 * The caricature on the home screen.
 *
 * Hand-drawn as SVG rather than shipped as video or a sprite sheet: it weighs
 * a couple of kilobytes, scales to any screen, and works in low-bandwidth mode
 * where images are dropped. On a slow connection he is the one thing that
 * still arrives whole.
 */
export default function Sarathi({
  mood, speaking, still, size = 260, onPoke, label,
}: Props) {
  const shape = MOODS[mood]
  const [blink, setBlink] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [mouthOpen, setMouthOpen] = useState(0)
  const [poked, setPoked] = useState(false)
  const frame = useRef<number>(0)

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

  /* Pupils follow the pointer. Purely local; nothing is recorded. */
  useEffect(() => {
    if (still) return undefined
    const onMove = (event: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 3
      setGaze({
        x: Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth / 2))),
        y: Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight / 2))),
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [still])

  /* Mouth movement while speaking. Not real visemes — a jaw that moves at
     speaking cadence, which is what reads as talking at this scale. */
  useEffect(() => {
    if (!speaking || still) {
      // Guarded: an unconditional reset here re-renders on every mood change.
      setMouthOpen((v) => (v === 0 ? v : 0))
      return undefined
    }
    let last = performance.now()
    let target = 0.7
    const tick = (now: number) => {
      if (now - last > 90 + Math.random() * 80) {
        target = 0.15 + Math.random() * 0.85
        last = now
      }
      setMouthOpen((v) => v + (target - v) * 0.35)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [speaking, still])

  const handlePoke = () => {
    setPoked(true)
    window.setTimeout(() => setPoked(false), 480)
    onPoke?.()
  }

  const eyeH = blink ? 0.06 : shape.eyeOpen
  const px = gaze.x * 4.5
  const py = gaze.y * 3

  // Mouth: interpolate between the resting curve and an open oval.
  const open = mouthOpen
  const mouthTop = 158
  const lipDrop = shape.mouthCurve * (1 - open * 0.6)
  const jaw = 3 + open * 20

  return (
    <div
      className={[
        'sarathi',
        still ? 'sarathi--still' : '',
        speaking ? 'sarathi--speaking' : '',
        poked ? 'sarathi--poked' : '',
      ].join(' ')}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 220 230"
        width={size}
        height={size}
        role="img"
        aria-label={label}
        onClick={handlePoke}
        className="sarathi__svg"
        style={{ transform: `rotate(${shape.headTilt}deg)` }}
      >
        <defs>
          <radialGradient id="sk" cx="42%" cy="34%">
            <stop offset="0%" stopColor="#d99b6c" />
            <stop offset="100%" stopColor="#bd7c4d" />
          </radialGradient>
          <linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6f6b" />
            <stop offset="100%" stopColor="#1f4f4d" />
          </linearGradient>
          <linearGradient id="shawl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8d9bd" />
            <stop offset="100%" stopColor="#cdb894" />
          </linearGradient>
        </defs>

        {/* shoulders and shawl */}
        <path
          d="M18 232 C24 196 58 178 110 178 C162 178 196 196 202 232 Z"
          fill="url(#shawl)"
          stroke="#8d7a58"
          strokeWidth="2.5"
        />
        <path d="M84 180 C96 200 124 200 136 180" fill="none" stroke="#8d7a58" strokeWidth="2.5" />

        {/* ears */}
        <ellipse cx="38" cy="118" rx="10" ry="14" fill="url(#sk)" stroke="#8a5a34" strokeWidth="2.5" />
        <ellipse cx="182" cy="118" rx="10" ry="14" fill="url(#sk)" stroke="#8a5a34" strokeWidth="2.5" />

        {/* head */}
        <path
          d="M44 106 C44 62 72 38 110 38 C148 38 176 62 176 106 C176 150 152 182 110 182 C68 182 44 150 44 106 Z"
          fill="url(#sk)"
          stroke="#8a5a34"
          strokeWidth="3"
        />

        {/* cap */}
        <path
          d="M40 92 C44 46 74 26 110 26 C146 26 176 46 180 92 C160 74 140 66 110 66 C80 66 60 74 40 92 Z"
          fill="url(#cloth)"
          stroke="#173c3a"
          strokeWidth="3"
        />
        <path d="M38 92 C70 76 150 76 182 92" fill="none" stroke="#e8d9bd" strokeWidth="5" strokeLinecap="round" />
        <circle cx="110" cy="24" r="7" fill="#e0a33a" stroke="#173c3a" strokeWidth="2.5" />

        {/* eyebrows */}
        <g className="sarathi__brows">
          <path
            d={`M60 ${104 + shape.browY} q16 -10 34 -2`}
            fill="none" stroke="#3a2718" strokeWidth="6" strokeLinecap="round"
            transform={`rotate(${shape.browTilt} 77 102)`}
          />
          <path
            d={`M126 ${102 + shape.browY} q18 -8 34 2`}
            fill="none" stroke="#3a2718" strokeWidth="6" strokeLinecap="round"
            transform={`rotate(${-shape.browTilt} 143 102)`}
          />
        </g>

        {/* eyes */}
        <g className="sarathi__eyes">
          <ellipse cx="78" cy="120" rx="16" ry={16 * eyeH} fill="#fffaf2" stroke="#6b452a" strokeWidth="2.5" />
          <ellipse cx="142" cy="120" rx="16" ry={16 * eyeH} fill="#fffaf2" stroke="#6b452a" strokeWidth="2.5" />
          {!blink && (
            <>
              <circle cx={78 + px} cy={120 + py} r="6.6" fill="#2a1b10" />
              <circle cx={142 + px} cy={120 + py} r="6.6" fill="#2a1b10" />
              <circle cx={80 + px} cy={117 + py} r="2.1" fill="#fff" opacity="0.9" />
              <circle cx={144 + px} cy={117 + py} r="2.1" fill="#fff" opacity="0.9" />
            </>
          )}
        </g>

        {/* nose */}
        <path d="M110 124 C104 138 102 144 110 148 C116 148 118 145 118 142"
          fill="none" stroke="#8a5a34" strokeWidth="3" strokeLinecap="round" />

        {/* moustache */}
        <path
          d="M80 155 C88 143 102 149 110 149 C118 149 132 143 140 155
             C130 152 118 155 110 155 C102 155 90 152 80 155 Z"
          fill="#3a2718" stroke="#3a2718" strokeWidth="3" strokeLinejoin="round"
        />

        {/* mouth */}
        <path
          d={`M88 ${mouthTop + 10} Q110 ${mouthTop + 10 + lipDrop} 132 ${mouthTop + 10}
              Q110 ${mouthTop + 10 + lipDrop + jaw} 88 ${mouthTop + 10} Z`}
          fill={open > 0.12 ? '#6d2c2c' : '#a44b4b'}
          stroke="#5a2020"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* thinking dots */}
        {mood === 'thinking' && !still && (
          <g className="sarathi__think">
            <circle cx="188" cy="60" r="4" />
            <circle cx="200" cy="46" r="5.5" />
            <circle cx="210" cy="30" r="7" />
          </g>
        )}
      </svg>
    </div>
  )
}
