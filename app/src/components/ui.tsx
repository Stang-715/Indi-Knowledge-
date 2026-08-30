import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'

/* --------------------------------- chrome -------------------------------- */

export function TopBar({
  title, onBack, right, inline,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
  /** Rendered inside a shell that already has an app bar. */
  inline?: boolean
}) {
  const t = useT()
  return (
    <header className={inline ? 'topbar topbar--inline' : 'topbar'}>
      {onBack && (
        <button type="button" className="topbar__icon" onClick={onBack} aria-label={t('nav.back')}>
          ←
        </button>
      )}
      <h1 className="topbar__title">{title}</h1>
      {right}
    </header>
  )
}

export function BackBar({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate()
  return <TopBar inline title={title} onBack={() => (to ? navigate(to) : navigate(-1))} />
}

/* --------------------------------- banners ------------------------------- */

/**
 * The advisory disclaimer (design principle 3).
 *
 * There is no `dismissible` prop and no close button. Every poll surface
 * renders this, and it cannot be turned off from anywhere — which is the point.
 */
export function AdvisoryBanner({ detail = true }: { detail?: boolean }) {
  const t = useT()
  return (
    <aside className="banner banner--advisory" role="note">
      <p className="banner__title">⚖ {t('poll.advisory')}</p>
      {detail && <p>{t('poll.advisoryBody')}</p>}
    </aside>
  )
}

export function PrincipleNote({ children }: { children: ReactNode }) {
  const t = useT()
  return (
    <aside className="banner banner--principle" role="note">
      <p className="banner__title">{t('common.principle')}</p>
      <p>{children}</p>
    </aside>
  )
}

export function Banner({
  tone = 'neutral', title, children,
}: {
  tone?: 'neutral' | 'danger' | 'ok' | 'advisory'
  title?: string
  children: ReactNode
}) {
  const cls = tone === 'neutral' ? '' : ` banner--${tone}`
  return (
    <aside className={`banner${cls}`} role="note">
      {title && <p className="banner__title">{title}</p>}
      <p>{children}</p>
    </aside>
  )
}

/* --------------------------------- widgets ------------------------------- */

export function Switch({
  name, hint, checked, onChange, disabled,
}: {
  name: string
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="switch tap">
      <span className="switch__text">
        <span className="switch__name">{name}</span>
        {hint && <span className="tiny">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__knob" />
      </span>
    </label>
  )
}

export function Modal({
  title, onClose, children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const t = useT()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [onClose])

  return (
    <div className="modal__scrim" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          {t('action.close')}
        </button>
      </div>
    </div>
  )
}

export function Bars({
  buckets, total, highlightKey,
}: {
  buckets: { key: string; label: string; count: number }[]
  total: number
  highlightKey?: string
}) {
  const t = useT()
  return (
    <div className="bars">
      {buckets.map((b) => {
        const pct = total === 0 ? 0 : Math.round((b.count / total) * 1000) / 10
        const mine = b.key === highlightKey
        return (
          <div key={b.key}>
            <div className="bar__head">
              <span>
                {b.label}
                {mine && <> · <strong>{t('poll.yourChoice')}</strong></>}
              </span>
              <span>
                <strong>{pct}%</strong>{' '}
                <span className="tiny">{b.count.toLocaleString()}</span>
              </span>
            </div>
            <div
              className="bar__track"
              role="meter"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${b.label}: ${pct}%`}
            >
              <div
                className={`bar__fill${mine ? ' bar__fill--mine' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}

/* --------------------------------- format -------------------------------- */

export function timeAgo(ts: number, _t?: (k: string) => string): string {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} d ago`
  return new Date(ts).toLocaleDateString()
}

export function countdown(until: number): string {
  const diff = until - Date.now()
  if (diff <= 0) return '—'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days} d ${hours} h`
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours} h ${mins} m`
}
