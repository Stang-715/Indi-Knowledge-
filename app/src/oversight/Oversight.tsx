import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listAudit } from '../core/audit'
import { listFlags, listNotices, listPolls, listReports, listTopics, listPosts, retractionOverlay } from '../data/repo'
import { PRINCIPLES } from '../core/principles'
import { Banner, PrincipleNote, timeAgo } from '../components/ui'
import { useT } from '../i18n'

/**
 * 12.0 Oversight layer.
 *
 * Public, read-only, and intended to be operated by a body that is neither the
 * government nor the platform. Note that this module imports `listAudit` and
 * nothing that could write to it — the append-only trail has no delete or edit
 * function anywhere in the codebase to import.
 */
export default function Oversight() {
  const t = useT()
  const [tab, setTab] = useState<'report' | 'audit'>('report')

  return (
    <div className="shell">
      <a className="skip" href="#main">{t('nav.skipToContent')}</a>
      <header className="topbar">
        <h1 className="topbar__title">{t('oversight.title')}</h1>
        <Link to="/" className="topbar__icon tap" aria-label="Home">⌂</Link>
      </header>

      <main className="shell__main" id="main">
        <p className="muted">{t('oversight.subtitle')}</p>

        <div className="row" role="tablist" aria-label="Oversight sections">
          <button type="button" role="tab" className="chip" aria-selected={tab === 'report'} aria-pressed={tab === 'report'} onClick={() => setTab('report')}>
            Transparency report
          </button>
          <button type="button" role="tab" className="chip" aria-selected={tab === 'audit'} aria-pressed={tab === 'audit'} onClick={() => setTab('audit')}>
            Audit log
          </button>
        </div>

        {tab === 'report' ? <TransparencyReport /> : <AuditLog />}
      </main>
      <div />
    </div>
  )
}

/* --------------------------- 12.1 Transparency ---------------------------- */

function TransparencyReport() {
  const notices = listNotices()
  const overlay = retractionOverlay()
  const retracted = notices.filter((n) => n.retracted || overlay[n.id]).length
  const reports = listReports()
  const removed = reports.filter((r) => r.status === 'removed').length
  const dismissed = reports.filter((r) => r.status === 'dismissed').length
  const flags = listFlags()
  const posts = listTopics().flatMap((topic) => listPosts(topic.id))
  const removedPosts = posts.filter((p) => p.removed).length

  const stats: { label: string; value: string; note: string }[] = [
    { label: 'Notices published', value: String(notices.length), note: 'Across all localities' },
    { label: 'Notices retracted', value: String(retracted), note: 'Kept publicly visible, never deleted' },
    { label: 'Polls run', value: String(listPolls().length), note: 'All advisory' },
    { label: 'Posts removed', value: String(removedPosts), note: 'Listed with the reason, never deleted' },
    { label: 'Reports actioned', value: String(removed), note: 'By a human moderator' },
    { label: 'Reports dismissed', value: String(dismissed), note: 'No action taken' },
    { label: 'Brigading flags raised', value: String(flags.length), note: 'None acted on automatically' },
    { label: 'Flags cleared on review', value: String(flags.filter((f) => f.status === 'cleared').length), note: 'Judged legitimate activity' },
  ]

  return (
    <>
      <div className="stack stack--tight">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <span className="spread">
              <span>
                <span className="card__title" style={{ margin: 0 }}>{stat.label}</span>
                <span className="tiny" style={{ display: 'block' }}>{stat.note}</span>
              </span>
              <strong style={{ fontSize: '1.5rem' }}>{stat.value}</strong>
            </span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Requests to identify a citizen</h2>
      <div className="card">
        <span className="spread">
          <span>
            <span className="card__title" style={{ margin: 0 }}>Requests received</span>
            <span className="tiny" style={{ display: 'block' }}>Courts, police, departments</span>
          </span>
          <strong style={{ fontSize: '1.5rem' }}>3</strong>
        </span>
        <span className="spread" style={{ marginTop: 'var(--s3)' }}>
          <span>
            <span className="card__title" style={{ margin: 0 }}>Requests fulfilled</span>
            <span className="tiny" style={{ display: 'block' }}>Technically impossible to fulfil</span>
          </span>
          <strong style={{ fontSize: '1.5rem' }}>0</strong>
        </span>
      </div>

      <Banner tone="ok" title="Why that second number is always zero">
        There is no stored link between a verified identity and a pseudonym. A request for one
        is answered with the truth: the record does not exist. This is not a policy that a
        future operator can revise — it is an absence in how the system is built, and changing
        it would require shipping visibly different software.
      </Banner>

      <h2 className="section-title">The constraints being audited</h2>
      <div className="stack stack--tight">
        {PRINCIPLES.map((p) => (
          <div key={p.id} className="card">
            <p className="card__title">{p.title}</p>
            <p className="card__body">{p.statement}</p>
          </div>
        ))}
      </div>

      <PrincipleNote>
        This page is published on a schedule by an independent body. The government accounts it
        describes have no write access to it and no ability to delay it.
      </PrincipleNote>
    </>
  )
}

/* ------------------------------ 12.2 Audit log ---------------------------- */

function AuditLog() {
  const t = useT()
  const [filter, setFilter] = useState('all')
  const entries = listAudit()
  const kinds = [...new Set(entries.map((e) => e.actorKind))]
  const shown = filter === 'all' ? entries : entries.filter((e) => e.actorKind === filter)

  return (
    <>
      <Banner title="What this log is">
        A record of who touched what class of data, and when. It never names a citizen — the
        entries describe institutional actions, because those are the ones that need watching.
      </Banner>

      <div className="field">
        <label className="field__label" htmlFor="actorfilter">Actor</label>
        <select id="actorfilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {shown.length === 0 && (
        <p className="empty">
          No entries yet. Actions taken in the government portal appear here as they happen.
        </p>
      )}

      <div className="stack stack--tight">
        {shown.map((entry) => (
          <article key={entry.id} className="card">
            <p className="card__meta">
              <span className="badge">{entry.actorKind}</span>
              <span>{entry.action}</span>
              <span>·</span>
              <span>{timeAgo(entry.at, t)}</span>
            </p>
            <p className="card__title" style={{ marginTop: 'var(--s2)', marginBottom: 2 }}>{entry.actor}</p>
            <p className="tiny">Scope: {entry.scope}</p>
            <p className="card__body">{entry.detail}</p>
          </article>
        ))}
      </div>

      <PrincipleNote>
        Append-only. There is no edit and no delete — not restricted to certain roles, but
        absent from the codebase. An institution can add to its own record by acting, and can
        do nothing else to it.
      </PrincipleNote>
    </>
  )
}
