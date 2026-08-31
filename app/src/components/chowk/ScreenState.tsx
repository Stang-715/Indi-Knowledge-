import type { ReactNode } from 'react'
import { useT } from '../../i18n'
import './screen-state.css'

export type StateKind = 'empty' | 'loading' | 'error' | 'stale'

interface Props {
  kind: StateKind
  /** Overrides the catalogue default when a screen can say something better. */
  title?: string
  body?: string
  onRetry?: () => void
  children?: ReactNode
}

/**
 * The four states every screen has, designed rather than left to fall out of
 * the framework.
 *
 * Most apps design the happy path and let empty, loading, error and stale look
 * after themselves. On a platform whose users are on slow connections and old
 * handsets, those three are not edge cases — they are the experience. A screen
 * that goes blank reads as a broken government service, which is the single
 * impression this product can least afford.
 *
 * `stale` is the one most apps do not have at all: content that loaded once and
 * may since have changed. Saying so is more useful than either hiding it or
 * pretending it is fresh.
 */
export default function ScreenState({ kind, title, body, onRetry, children }: Props) {
  const t = useT()

  const copy: Record<StateKind, { title: string; body?: string }> = {
    empty: { title: t('state.empty') },
    loading: { title: t('state.loading') },
    error: { title: t('state.error'), body: t('state.errorBody') },
    stale: { title: t('state.stale'), body: t('state.staleBody') },
  }

  const text = copy[kind]

  return (
    <div
      className={`sstate sstate--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'loading' ? 'polite' : undefined}
      aria-busy={kind === 'loading' || undefined}
    >
      <span className="sstate__mark" aria-hidden="true">
        {kind === 'loading' ? (
          <span className="sstate__spin" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {kind === 'empty' && <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>}
            {kind === 'error' && <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.01" /></>}
            {kind === 'stale' && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
          </svg>
        )}
      </span>

      <span className="sstate__text">
        <b>{title ?? text.title}</b>
        {(body ?? text.body) && <em>{body ?? text.body}</em>}
      </span>

      {kind === 'error' && onRetry && (
        <button type="button" className="btn btn--hue btn--sm sstate__retry" onClick={onRetry}>
          {t('state.retry')}
        </button>
      )}

      {children}
    </div>
  )
}

/**
 * Skeleton rows for a loading list. Deliberately not a spinner: a spinner says
 * "wait", a skeleton says "here is the shape of what is coming", which is a
 * meaningfully better answer on a connection that may take ten seconds.
 */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  const t = useT()
  return (
    <div className="skel" role="status" aria-busy="true" aria-label={t('state.loading')}>
      {Array.from({ length: rows }, (_, i) => (
        <span className="skel__row" key={i} style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  )
}
