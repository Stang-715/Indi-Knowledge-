import { useState } from 'react'
import {
  listFlags, listPosts, listReports, listTopics, removePost, reportOverrides,
  resolveReport, setFlagStatus, getNotice, retractNotice,
} from '../data/repo'
import { Banner, PrincipleNote, timeAgo } from '../components/ui'
import { useT } from '../i18n'
import type { Post } from '../core/types'

type Tab = 'posts' | 'notices' | 'flags'

export default function Moderation() {
  const [tab, setTab] = useState<Tab>('posts')

  return (
    <>
      <h2 style={{ margin: 0 }}>Moderation console</h2>

      <div className="row" role="tablist" aria-label="Queues">
        {([
          ['posts', 'Reported posts'],
          ['notices', 'Suspected fake notices'],
          ['flags', 'Anti-brigading flags'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" role="tab" className="chip" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && <PostQueue />}
      {tab === 'notices' && <NoticeQueue />}
      {tab === 'flags' && <FlagQueue />}
    </>
  )
}

/* ---------------------------- 11.1 Reported posts ------------------------- */

function findPost(id: string): Post | undefined {
  for (const topic of listTopics()) {
    const hit = listPosts(topic.id).find((p) => p.id === id)
    if (hit) return hit
  }
  return undefined
}

function PostQueue() {
  const t = useT()
  const [, force] = useState(0)
  const overrides = reportOverrides()
  const reports = listReports('post').map((r) =>
    overrides[r.id] ? { ...r, status: overrides[r.id] } : r,
  )
  const open = reports.filter((r) => r.status === 'open')
  const closed = reports.filter((r) => r.status !== 'open')

  return (
    <div className="stack">
      {open.length === 0 && <p className="empty">Queue clear.</p>}

      {open.map((report) => {
        const post = findPost(report.target.id)
        return (
          <article key={report.id} className="card">
            <p className="card__meta">
              <span className="badge badge--important">{t(`report.reason.${report.reason}`)}</span>
              <span>{timeAgo(report.createdAt, t)}</span>
            </p>
            {report.note && <p className="card__body">“{report.note}”</p>}

            {post ? (
              <blockquote className="banner" style={{ margin: 'var(--s3) 0' }}>
                <p className="banner__title">{post.authorPseudonym} · {post.stance}</p>
                <p>{post.body}</p>
              </blockquote>
            ) : (
              <p className="tiny">The post is no longer retrievable.</p>
            )}

            <div className="row">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  removePost(report.target.id, t(`report.reason.${report.reason}`))
                  resolveReport(report.id, 'removed')
                  force((n) => n + 1)
                }}
              >
                Remove post
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { resolveReport(report.id, 'dismissed'); force((n) => n + 1) }}
              >
                Dismiss report
              </button>
            </div>
          </article>
        )
      })}

      {closed.length > 0 && (
        <>
          <h3 className="section-title">Resolved</h3>
          {closed.map((r) => (
            <div key={r.id} className="card surface-alt">
              <p className="card__meta">
                <span className="badge">{r.status}</span>
                <span>{t(`report.reason.${r.reason}`)}</span>
                <span>{timeAgo(r.createdAt, t)}</span>
              </p>
            </div>
          ))}
        </>
      )}

      <PrincipleNote>
        Removing a post leaves a marked gap in the thread with your reason attached — it does
        not disappear. The count of removals is published on the oversight layer, which no
        government account can edit.
      </PrincipleNote>
    </div>
  )
}

/* ---------------------------- 11.2 Fake notices --------------------------- */

function NoticeQueue() {
  const t = useT()
  const [, force] = useState(0)
  const [reason, setReason] = useState<Record<string, string>>({})
  const overrides = reportOverrides()
  const reports = listReports('notice')
    .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r))
    .filter((r) => r.status === 'open')

  return (
    <div className="stack">
      {reports.length === 0 && <p className="empty">Queue clear.</p>}

      {reports.map((report) => {
        const notice = getNotice(report.target.id)
        return (
          <article key={report.id} className="card">
            <p className="card__meta">
              <span className="badge badge--critical">{t(`report.reason.${report.reason}`)}</span>
              <span>{timeAgo(report.createdAt, t)}</span>
            </p>
            <p className="card__body">“{report.note}”</p>

            {notice && (
              <>
                <h3 className="card__title" style={{ marginTop: 'var(--s3)' }}>{notice.title}</h3>
                <p className="tiny">
                  Issued by {notice.issuedBy.name} — {notice.issuedBy.verified ? 'verified institutional account' : 'unverified'}
                </p>
                <Banner tone={notice.issuedBy.verified ? 'ok' : 'danger'}>
                  {notice.issuedBy.verified
                    ? 'This notice was posted from a verified account with multi-factor sign-in. A copy circulating elsewhere with different details is a forgery of it, not this notice — that needs a public warning rather than a retraction.'
                    : 'No verified institutional source. Treat as a forgery.'}
                </Banner>
              </>
            )}

            <div className="field" style={{ marginTop: 'var(--s3)' }}>
              <label className="field__label" htmlFor={`reason_${report.id}`}>
                Retraction reason (public, if you retract)
              </label>
              <textarea
                id={`reason_${report.id}`}
                value={reason[report.id] ?? ''}
                onChange={(e) => setReason((c) => ({ ...c, [report.id]: e.target.value }))}
                style={{ minHeight: 70 }}
              />
            </div>

            <div className="row">
              <button
                type="button"
                className="btn btn--danger"
                disabled={(reason[report.id] ?? '').trim().length < 10}
                onClick={() => {
                  retractNotice(report.target.id, reason[report.id].trim())
                  resolveReport(report.id, 'removed')
                  force((n) => n + 1)
                }}
              >
                Retract notice
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { resolveReport(report.id, 'dismissed'); force((n) => n + 1) }}
              >
                Genuine — dismiss
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

/* -------------------------- 11.3 Anti-brigading --------------------------- */

function FlagQueue() {
  const t = useT()
  const [, force] = useState(0)
  const flags = listFlags()
  const waiting = flags.filter((f) => f.status === 'awaiting-review')
  const done = flags.filter((f) => f.status !== 'awaiting-review')

  return (
    <div className="stack">
      <Banner tone="advisory" title="Nothing here has been acted on">
        These are patterns, not verdicts. Flags are surfaced for a person to judge and never
        trigger an automatic removal — a system that silently deletes what looks coordinated
        will eventually delete a genuine, sudden, entirely real protest.
      </Banner>

      {waiting.map((flag) => (
        <article key={flag.id} className="card">
          <p className="card__meta">
            <span className="badge badge--important">{flag.signal}</span>
            <span>{timeAgo(flag.raisedAt, t)}</span>
          </p>
          <h3 className="card__title" style={{ marginTop: 'var(--s2)' }}>{flag.subject}</h3>
          <p className="card__body">{flag.detail}</p>
          <div className="row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setFlagStatus(flag.id, 'cleared'); force((n) => n + 1) }}
            >
              Clear — legitimate activity
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => { setFlagStatus(flag.id, 'actioned'); force((n) => n + 1) }}
            >
              Escalate for investigation
            </button>
          </div>
          <p className="tiny" style={{ marginTop: 'var(--s2)' }}>
            Escalation opens a case for review. It does not remove anything, and it does not
            change the poll count.
          </p>
        </article>
      ))}

      {done.length > 0 && (
        <>
          <h3 className="section-title">Reviewed</h3>
          {done.map((flag) => (
            <div key={flag.id} className="card surface-alt">
              <p className="card__meta">
                <span className="badge">{flag.status}</span>
                <span>{flag.subject}</span>
              </p>
              <p className="card__body">{flag.detail}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
