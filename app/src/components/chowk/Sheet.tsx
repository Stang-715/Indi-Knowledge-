import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './sheet.css'

interface Props {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom sheet — the app's only modal surface.
 *
 * Rises from the bottom edge because that is where the thumb is, and because a
 * sheet that slides from where the island sits reads as the island opening up
 * rather than as a new screen arriving.
 */
export default function Sheet({ title, open, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      // Trap focus: a sheet the keyboard can walk out of is not a sheet.
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sheet__scrim" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sheet__grip" aria-hidden="true" />
        <h2 className="sheet__title">{title}</h2>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}
