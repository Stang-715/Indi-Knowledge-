import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSession } from '../core/session'
import { listNotices, listPolls, isOpen } from '../data/repo'
import { passesNotificationFilter } from '../core/prefs'

const TABS = [
  { to: '/app', end: true, glyph: '☰', key: 'nav.home' },
  { to: '/app/notices', end: false, glyph: '▤', key: 'nav.notices' },
  { to: '/app/polls', end: false, glyph: '◎', key: 'nav.polls' },
  { to: '/app/discuss', end: false, glyph: '❝', key: 'nav.discuss' },
  { to: '/app/profile', end: false, glyph: '☺', key: 'nav.profile' },
]

/** Count of things worth a badge — filtered by the citizen's own thresholds. */
export function useInboxCount(): number {
  const { prefs } = useSession()
  const localityIds = prefs.localities.map((l) => l.id)
  const notices = listNotices(localityIds).filter(
    (n) =>
      !n.retracted &&
      !prefs.seenNoticeIds.includes(n.id) &&
      passesNotificationFilter(n.priority, prefs.notifications),
  )
  const polls = prefs.notifications.polls ? listPolls().filter(isOpen) : []
  return notices.length + polls.length
}

export default function CitizenShell() {
  const t = useT()
  const navigate = useNavigate()
  const unread = useInboxCount()

  return (
    <div className="shell">
      <a className="skip" href="#main">{t('nav.skipToContent')}</a>

      <header className="topbar">
        <h1 className="topbar__title">{t('app.name')}</h1>
        <button
          type="button"
          className="topbar__icon"
          onClick={() => navigate('/app/search')}
          aria-label={t('action.search')}
        >
          ⌕
        </button>
        <button
          type="button"
          className="topbar__icon"
          onClick={() => navigate('/app/inbox')}
          aria-label={`${t('nav.home')} — ${unread} new`}
        >
          ◔
          {unread > 0 && <span className="topbar__badge">{unread > 99 ? '99+' : unread}</span>}
        </button>
      </header>

      <main className="shell__main" id="main">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className="tabbar__item">
            <span className="tabbar__glyph" aria-hidden="true">{tab.glyph}</span>
            <span>{t(tab.key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
