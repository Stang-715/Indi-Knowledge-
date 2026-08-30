import { useState } from 'react'
import { Link } from 'react-router-dom'
import Conversation from '../caricature/Conversation'
import { useT } from '../i18n'
import { useSession } from '../core/session'
import { isOpen, listNotices, listPolls, listTopics, myResponse } from '../data/repo'
import { AdvisoryBanner, countdown, timeAgo } from '../components/ui'

type FeedTab = 'notices' | 'polls' | 'discussions'

/**
 * 2.0 Home — the caricature, with the feed (2.1) directly beneath him.
 *
 * He comes first because for a first-time user the hardest part of this
 * platform is not finding a screen, it is believing what the screens claim.
 * A person you can interrogate does that better than a paragraph of policy.
 */
export default function Home() {
  const t = useT()
  const { prefs } = useSession()
  const [tab, setTab] = useState<FeedTab>('notices')

  const localityIds = prefs.localities.map((l) => l.id)
  const notices = listNotices(localityIds)
  const polls = listPolls().filter(
    (p) => p.localityIds === 'all' || p.localityIds.some((l) => localityIds.includes(l)),
  )
  const topics = listTopics()

  return (
    <>
      <Conversation />

      <section aria-labelledby="feedheading">
        <h2 className="section-title" id="feedheading">Your feed</h2>

        <div className="row" role="tablist" aria-label="Feed sections" style={{ marginTop: 'var(--s2)' }}>
          {(['notices', 'polls', 'discussions'] as FeedTab[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              className="chip"
              aria-selected={tab === id}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {t(`feed.${id}`)}
            </button>
          ))}
        </div>

        <div className="stack" style={{ marginTop: 'var(--s3)' }} role="tabpanel">
          {tab === 'notices' &&
            (notices.length === 0 ? (
              <p className="empty">{t('feed.empty')}</p>
            ) : (
              notices.slice(0, 6).map((n) => (
                <Link key={n.id} to={`/app/notices/${n.id}`} className="card">
                  <span className="card__title">{n.title}</span>
                  <span className="card__meta">
                    <span>{n.issuedBy.name}</span>
                    <span>·</span>
                    <span>{timeAgo(n.publishedAt, t)}</span>
                    {n.priority === 'time-critical' && (
                      <span className="badge badge--critical">Time-critical</span>
                    )}
                    {n.retracted && <span className="badge badge--retracted">{t('notice.retracted')}</span>}
                  </span>
                </Link>
              ))
            ))}

          {tab === 'polls' && (
            <>
              <AdvisoryBanner detail={false} />
              {polls.length === 0 ? (
                <p className="empty">{t('feed.empty')}</p>
              ) : (
                polls.map((p) => {
                  const open = isOpen(p)
                  const mine = myResponse(p.id)
                  return (
                    <Link key={p.id} to={`/app/polls/${p.id}`} className="card">
                      <span className="card__title">{p.billTitle}</span>
                      <span className="card__meta">
                        <span>{p.issuedBy.name}</span>
                        <span>·</span>
                        <span>
                          {open
                            ? t('poll.closesIn', { t: countdown(p.closesAt) })
                            : t('poll.closed')}
                        </span>
                        {mine && <span className="badge badge--verified">Answered</span>}
                      </span>
                    </Link>
                  )
                })
              )}
            </>
          )}

          {tab === 'discussions' &&
            topics.map((topic) => (
              <Link key={topic.id} to={`/app/discuss/${topic.id}`} className="card">
                <span className="card__title">{topic.title}</span>
                <span className="card__meta">
                  <span>{topic.anchor.kind === 'poll' ? 'On a poll' : 'On a notice'}</span>
                  <span>·</span>
                  <span>{timeAgo(topic.createdAt, t)}</span>
                </span>
              </Link>
            ))}
        </div>
      </section>
    </>
  )
}
