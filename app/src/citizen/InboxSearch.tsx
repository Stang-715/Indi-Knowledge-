import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useSession } from '../core/session'
import { isOpen, listNotices, listPolls, search } from '../data/repo'
import { passesNotificationFilter } from '../core/prefs'
import { BackBar, countdown, timeAgo } from '../components/ui'

/* -------------------------------- 2.2 Inbox ------------------------------- */

export function Inbox() {
  const t = useT()
  const { prefs } = useSession()
  const localityIds = prefs.localities.map((l) => l.id)

  const noticeItems = listNotices(localityIds)
    .filter((n) => !n.retracted && passesNotificationFilter(n.priority, prefs.notifications))
    .slice(0, 12)
    .map((n) => ({
      key: `n_${n.id}`,
      to: `/app/notices/${n.id}`,
      title: n.title,
      meta: `${n.issuedBy.name} · ${timeAgo(n.publishedAt, t)}`,
      unread: !prefs.seenNoticeIds.includes(n.id),
      priority: n.priority,
    }))

  const pollItems = prefs.notifications.polls
    ? listPolls().filter(isOpen).map((p) => ({
        key: `p_${p.id}`,
        to: `/app/polls/${p.id}`,
        title: p.billTitle,
        meta: `${t('poll.closesIn', { t: countdown(p.closesAt) })}`,
        unread: true,
        priority: 'routine' as const,
      }))
    : []

  const items = [...noticeItems, ...pollItems]

  return (
    <>
      <BackBar title="Notifications" to="/app" />
      {items.length === 0 && <p className="empty">Nothing waiting for you.</p>}
      <div className="stack stack--tight">
        {items.map((item) => (
          <Link key={item.key} to={item.to} className="card">
            <span className="spread">
              <span className="card__title" style={{ margin: 0 }}>{item.title}</span>
              {item.unread && <span className="badge badge--important">New</span>}
            </span>
            <span className="tiny">{item.meta}</span>
          </Link>
        ))}
      </div>
      <p className="tiny">
        Filtered by your notification settings — currently{' '}
        <strong>{prefs.notifications.minimumPriority}</strong> and above.{' '}
        <Link to="/app/profile/notifications">Change</Link>
      </p>
    </>
  )
}

/* -------------------------------- 2.3 Search ------------------------------ */

export function Search() {
  const t = useT()
  const [query, setQuery] = useState('')
  const hits = useMemo(() => search(query), [query])

  const path = (hit: { kind: string; id: string }) =>
    hit.kind === 'notice' ? `/app/notices/${hit.id}`
      : hit.kind === 'poll' ? `/app/polls/${hit.id}`
      : `/app/discuss/${hit.id}`

  return (
    <>
      <BackBar title={t('action.search')} to="/app" />
      <div className="field">
        <label className="field__label" htmlFor="q">Search notices, bills and discussions</label>
        <input
          id="q"
          type="search"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          placeholder="water, vending bill, drainage…"
        />
      </div>

      {query.trim().length >= 2 && hits.length === 0 && (
        <p className="empty">Nothing matched “{query}”.</p>
      )}

      <div className="stack stack--tight">
        {hits.map((hit) => (
          <Link key={`${hit.kind}_${hit.id}`} to={path(hit)} className="card">
            <span className="card__meta"><span className="badge">{hit.kind}</span></span>
            <span className="card__title" style={{ marginTop: 'var(--s2)' }}>{hit.title}</span>
            <span className="card__body">{hit.snippet}</span>
          </Link>
        ))}
      </div>

      <p className="tiny">
        Searches run on your device against what has already been fetched. Nothing you type
        here is sent anywhere or recorded.
      </p>
    </>
  )
}
