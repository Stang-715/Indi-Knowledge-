import { useT } from '../../i18n'

/**
 * 1.6 — the in-surface offline state.
 *
 * Most apps go quiet when the signal drops and people reasonably assume the
 * whole thing is broken. Saying which part still works is cheap and stops that.
 */
export default function OfflineNote() {
  const t = useT()
  return (
    <aside className="sar__offline glass-dark" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
        <path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4-2.5M19 12.9a10 10 0 0 0-7-2.9M12 20h.01" />
      </svg>
      <span>
        <b>{t('sar.offline.title')}</b>
        <em>{t('sar.offline.body')}</em>
      </span>
    </aside>
  )
}
