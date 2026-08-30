import type { ReactNode } from 'react'
import './disclosure.css'

interface Props {
  icon: ReactNode
  title: string
  meta: string
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * Contextual disclosure.
 *
 * Depth opens where you are standing. Tapping never throws you onto a new screen
 * unless you asked to go somewhere — which is how twenty-six sub-pages stay
 * reachable behind four tabs.
 */
export default function Disclosure({
  icon, title, meta, children, defaultOpen = false,
}: Props) {
  return (
    <details className="disc" open={defaultOpen}>
      <summary className="disc__head">
        <span className="disc__icon" aria-hidden="true">{icon}</span>
        <span className="disc__text">
          <span className="disc__title">{title}</span>
          <span className="disc__meta">{meta}</span>
        </span>
        <span className="disc__caret" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="disc__body">{children}</div>
    </details>
  )
}
