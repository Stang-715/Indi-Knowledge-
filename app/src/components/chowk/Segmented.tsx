import { useCallback, useLayoutEffect, useRef, useState } from 'react'

interface Props<T extends string> {
  options: { id: T; label: string }[]
  value: T
  onChange: (next: T) => void
  label: string
}

/** The thumb slides rather than cuts, so the eye follows where it landed. */
export default function Segmented<T extends string>({
  options, value, onChange, label,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ left: 0, width: 0 })

  const place = useCallback(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  useLayoutEffect(() => {
    place()
    document.fonts?.ready.then(place).catch(() => {})
  }, [place, value, options])

  return (
    <div className="seg" role="tablist" aria-label={label} ref={ref}>
      <span className="seg__thumb" aria-hidden="true" style={{ left: thumb.left, width: thumb.width }} />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={o.id === value}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
