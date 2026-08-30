import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useSession } from '../core/session'
import {
  fileReport, getNotice, listNotices, markSeen, noticeReach, retractionOverlay,
  topicForAnchor,
} from '../data/repo'
import { Banner, BackBar, Modal, PrincipleNote, timeAgo } from '../components/ui'
import type { ReportReason } from '../core/types'
import { checkLimit, recordUse, REPORT_LIMIT } from '../core/ratelimit'

/* ------------------------------ 3.1 / 3.4 List ---------------------------- */

export function NoticeList({ archive = false }: { archive?: boolean }) {
  const t = useT()
  const { prefs } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const localityIds = prefs.localities.map((l) => l.id)
  const overlay = retractionOverlay()
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

  const all = listNotices(filter === 'all' ? localityIds : [filter]).map((n) =>
    overlay[n.id] ? { ...n, retracted: overlay[n.id] } : n,
  )
  const notices = all.filter((n) =>
    archive ? Date.now() - n.publishedAt > THIRTY_DAYS || !!n.retracted
            : Date.now() - n.publishedAt <= THIRTY_DAYS && !n.retracted,
  )

  return (
    <>
      <div className="spread">
        <h2 style={{ margin: 0 }}>{archive ? t('notice.archive') : t('feed.notices')}</h2>
        {!archive && (
          <Link to="/app/notices/archive" className="chip tap">
            {t('notice.archive')}
          </Link>
        )}
      </div>

      {prefs.localities.length > 1 && (
        <div className="field">
          <label className="field__label" htmlFor="locfilter">Locality</label>
          <select id="locfilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All localities I follow</option>
            {prefs.localities.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="stack">
        {notices.length === 0 && <p className="empty">{t('feed.empty')}</p>}
        {notices.map((n) => (
          <Link key={n.id} to={`/app/notices/${n.id}`} className="card">
            <span className="card__title">{n.title}</span>
            <span className="card__meta">
              <span>{n.issuedBy.name}</span>
              <span>·</span>
              <span>{timeAgo(n.publishedAt, t)}</span>
              {n.priority === 'time-critical' && <span className="badge badge--critical">Time-critical</span>}
              {n.priority === 'important' && <span className="badge badge--important">Important</span>}
              {n.retracted && <span className="badge badge--retracted">{t('notice.retracted')}</span>}
            </span>
            <span className="card__body">{n.body.split('\n')[0].slice(0, 130)}…</span>
          </Link>
        ))}
      </div>
    </>
  )
}

/* ------------------------------ 3.2 Detail -------------------------------- */

export function NoticeDetail() {
  const t = useT()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { prefs, markNoticeSeen } = useSession()
  const [sourceInfo, setSourceInfo] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [shared, setShared] = useState(false)

  const base = getNotice(id)
  const overlay = retractionOverlay()
  const notice = base && overlay[id] ? { ...base, retracted: overlay[id] } : base

  const seen = prefs.seenNoticeIds.includes(id)
  const topic = notice ? topicForAnchor('notice', notice.id) : undefined

  if (!notice) {
    return (
      <>
        <BackBar title={t('feed.notices')} to="/app/notices" />
        <p className="empty">This notice is no longer available.</p>
      </>
    )
  }

  const acknowledge = () => {
    if (seen) return
    markSeen(notice.id)
    markNoticeSeen(notice.id)
  }

  const share = async () => {
    const text = `${notice.title}\n\n${notice.issuedBy.name}`
    try {
      if (navigator.share) await navigator.share({ title: notice.title, text })
      else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
        setShared(true)
        window.setTimeout(() => setShared(false), 2200)
      }
    } catch {
      /* the citizen dismissed the sheet — nothing to do */
    }
  }

  return (
    <>
      <BackBar title={notice.category} to="/app/notices" />

      {notice.retracted && (
        <Banner tone="danger" title={t('notice.retracted')}>
          {t('notice.retractedBody')} — {notice.retracted.reason}
        </Banner>
      )}

      <h2 style={{ margin: 0 }}>{notice.title}</h2>

      <div className="row">
        <button
          type="button"
          className="badge badge--verified"
          onClick={() => setSourceInfo(true)}
          style={{ cursor: 'pointer', minHeight: 32 }}
        >
          ✓ {t('notice.verifiedSource')}
        </button>
        <span className="tiny">{notice.issuedBy.name} · {notice.issuedBy.department}</span>
      </div>

      <p className="tiny">
        Published {new Date(notice.publishedAt).toLocaleString()} · {notice.localityIds.length}{' '}
        {notice.localityIds.length === 1 ? 'locality' : 'localities'}
      </p>

      <p className="prose">{notice.body}</p>

      {notice.attachmentLabel && (
        <>
          <a className="btn btn--ghost heavy" href="#attachment" onClick={(e) => e.preventDefault()}>
            📎 {notice.attachmentLabel}
          </a>
          <p className="lowbw-note tiny">
            Attachment hidden in low-bandwidth mode: {notice.attachmentLabel}. The key details
            are in the notice text above.
          </p>
        </>
      )}

      <div className="row">
        <button
          type="button"
          className={seen ? 'btn btn--ghost' : 'btn'}
          onClick={acknowledge}
          disabled={seen}
        >
          {seen ? `✓ ${t('action.seen')}` : t('action.markSeen')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={share}>
          {shared ? 'Copied' : t('action.share')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setReporting(true)}>
          {t('notice.reportFake')}
        </button>
      </div>

      <p className="tiny">
        {t('notice.reach', { n: noticeReach(notice.id).toLocaleString() })} — {t('notice.reachExplain')}
      </p>

      {topic && (
        <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate(`/app/discuss/${topic.id}`)}>
          {t('discuss.postOpinion')} →
        </button>
      )}

      {sourceInfo && (
        <Modal title={t('notice.verifiedSource')} onClose={() => setSourceInfo(false)}>
          <p className="prose">{t('notice.verifiedExplain')}</p>
          <p className="prose">
            <strong>{notice.issuedBy.name}</strong><br />
            {notice.issuedBy.department}
          </p>
          <p className="tiny">
            Nothing in this platform will ever ask you for a payment or a personal detail. A
            message that does is not from here, whatever badge it shows.
          </p>
        </Modal>
      )}

      {reporting && (
        <ReportFlow
          target={{ kind: 'notice', id: notice.id }}
          defaultReason="fake-notice"
          onClose={() => setReporting(false)}
        />
      )}
    </>
  )
}

/* ----------------------------- 3.3 / 5.4 Report --------------------------- */

const REASONS: ReportReason[] = [
  'fake-notice', 'abuse', 'spam', 'coordinated', 'misinformation', 'other',
]

export function ReportFlow({
  target, defaultReason, onClose,
}: {
  target: { kind: 'notice' | 'post'; id: string }
  defaultReason?: ReportReason
  onClose: () => void
}) {
  const t = useT()
  const [reason, setReason] = useState<ReportReason>(defaultReason ?? 'abuse')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const limit = useMemo(() => checkLimit('report', REPORT_LIMIT), [])

  const submit = () => {
    if (!limit.allowed) return
    fileReport(target, reason, note.trim())
    recordUse('report', REPORT_LIMIT)
    setSent(true)
  }

  return (
    <Modal title={t('report.title')} onClose={onClose}>
      {sent ? (
        <>
          <Banner tone="ok" title={t('report.sent')}>{t('report.sentBody')}</Banner>
        </>
      ) : (
        <>
          <div className="field">
            <span className="field__label" id="reasonlabel">{t('report.reason')}</span>
            <div className="stack stack--tight" role="radiogroup" aria-labelledby="reasonlabel">
              {(target.kind === 'notice' ? REASONS : REASONS.filter((r) => r !== 'fake-notice')).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={reason === r}
                  className="chip"
                  onClick={() => setReason(r)}
                  style={{ textAlign: 'start' }}
                >
                  {t(`report.reason.${r}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="reportnote">{t('report.note')}</label>
            <textarea
              id="reportnote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={600}
              style={{ minHeight: 90 }}
            />
          </div>

          {!limit.allowed && (
            <Banner tone="danger">
              You have filed several reports recently. Try again later — the limit exists so
              that mass-reporting cannot be used to bury someone.
            </Banner>
          )}

          <button type="button" className="btn btn--block" onClick={submit} disabled={!limit.allowed}>
            {t('action.report')}
          </button>

          <PrincipleNote>
            We do not store who filed a report. It reaches a human moderator as the content
            plus your reason, and nothing about you.
          </PrincipleNote>
        </>
      )}
    </Modal>
  )
}
