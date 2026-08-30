import { useMemo, useState } from 'react'
import { listNotices, listPolls, listTopics, noticeReach, pollAggregate, sentiment } from '../data/repo'
import { coverageRate } from '../core/aggregate'
import { appendAudit } from '../core/audit'
import { Bars, Banner, PrincipleNote } from '../components/ui'
import { LOCALITY_CATALOGUE } from '../data/seed'

type Tab = 'polls' | 'sentiment' | 'reach'

/**
 * 10.0 Dashboards.
 *
 * Every number on this screen comes from `pollAggregate`, `sentiment` or
 * `noticeReach`. None of those functions can return a row about a person, so
 * there is no drill-down to build — the absence of that button is a property of
 * the data layer rather than a decision about this UI.
 */
export default function Dashboards() {
  const [tab, setTab] = useState<Tab>('polls')
  const [locality, setLocality] = useState('all')

  return (
    <>
      <h2 style={{ margin: 0 }}>Dashboards</h2>

      <div className="row" role="tablist" aria-label="Dashboard sections">
        {([
          ['polls', 'Poll results'],
          ['sentiment', 'Discussion sentiment'],
          ['reach', 'Notice reach'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" role="tab" className="chip" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="dlocality">District filter</label>
        <select id="dlocality" value={locality} onChange={(e) => setLocality(e.target.value)}>
          <option value="all">All districts</option>
          {[...new Set(LOCALITY_CATALOGUE.map((l) => l.district))].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {tab === 'polls' && <PollResults />}
      {tab === 'sentiment' && <SentimentPanel />}
      {tab === 'reach' && <ReachPanel />}

      <ExportPanel />

      <PrincipleNote>
        There is no respondent list behind any of these charts. The functions that produce them
        return counts, and identity is stripped before the data reaches this side — so the
        drill-down you might expect here does not exist to be hidden.
      </PrincipleNote>
    </>
  )
}

function PollResults() {
  const polls = listPolls()
  return (
    <div className="stack">
      {polls.map((poll) => {
        const agg = pollAggregate(poll.id)
        return (
          <section key={poll.id} className="card">
            <h3 className="card__title">{poll.billTitle}</h3>
            <Bars buckets={agg.buckets} total={agg.total} />
            <p className="tiny" style={{ marginTop: 'var(--s3)' }}>
              {agg.total.toLocaleString()} responses
              {agg.suppressed > 0 && ` · ${agg.suppressed} small groups suppressed`}
            </p>
            {agg.coverage && (
              <Banner
                tone={coverageRate(agg.coverage) < 0.05 ? 'advisory' : 'neutral'}
                title="Coverage"
              >
                {agg.coverage.responded.toLocaleString()} of{' '}
                {agg.coverage.eligible.toLocaleString()} eligible —{' '}
                <strong>{(coverageRate(agg.coverage) * 100).toFixed(1)}%</strong>.{' '}
                {agg.coverage.reachable.toLocaleString()} have an account at all.
                {coverageRate(agg.coverage) < 0.05 &&
                  ' Below five percent. This is a sample of smartphone owners who chose to respond — reporting it as ward opinion would be a misuse of it.'}
              </Banner>
            )}
          </section>
        )
      })}
    </div>
  )
}

function SentimentPanel() {
  const topics = listTopics()
  return (
    <div className="stack">
      {topics.map((topic) => {
        const agg = sentiment(topic.id)
        return (
          <section key={topic.id} className="card">
            <h3 className="card__title">{topic.title}</h3>
            <Bars buckets={agg.buckets} total={agg.total} />
            <p className="tiny" style={{ marginTop: 'var(--s3)' }}>
              {agg.total} posts, counted by stated position.
            </p>
          </section>
        )
      })}
      <Banner tone="advisory" title="Read this carefully">
        These are counts of how people tagged their own posts, not a machine's reading of what
        they meant. People who post are not people who read, and both are a small slice of
        people affected. Treat it as a list of arguments in circulation, not a measure of
        support.
      </Banner>
    </div>
  )
}

function ReachPanel() {
  const notices = listNotices()
  return (
    <div className="scroll-x">
      <table className="table">
        <thead>
          <tr><th>Notice</th><th>Priority</th><th>Marked seen</th></tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.priority}</td>
              <td>{noticeReach(n.id).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="tiny" style={{ marginTop: 'var(--s3)' }}>
        Counts only. There is no per-citizen read receipt — you cannot see whether a named
        person opened a notice, because that fact is not recorded anywhere.
      </p>
    </div>
  )
}

/* ------------------------------- 10.4 Export ------------------------------ */

function ExportPanel() {
  const [state, setState] = useState<'idle' | 'downloaded' | 'blocked' | 'copied'>('idle')

  const rows = useMemo(() => {
    const out: string[] = ['poll_id,bill_title,option,count,total,coverage_pct']
    for (const poll of listPolls()) {
      const agg = pollAggregate(poll.id)
      const cov = agg.coverage ? (coverageRate(agg.coverage) * 100).toFixed(2) : ''
      for (const bucket of agg.buckets) {
        out.push(
          [poll.id, `"${poll.billTitle}"`, `"${bucket.label}"`, bucket.count, agg.total, cov].join(','),
        )
      }
    }
    return out.join('\n')
  }, [])

  const record = () =>
    appendAudit({
      actorKind: 'gov',
      actor: 'Dashboard export',
      action: 'report.export',
      scope: 'all open polls',
      detail: 'Aggregate CSV exported. Contains counts and coverage only.',
    })

  /**
   * Some browsers — embedded webviews, kiosk builds, sandboxed frames — refuse
   * a script-initiated download without reporting an error. Rather than leaving
   * an officer clicking a button that does nothing, fall through to showing the
   * report so it can still be copied out.
   */
  const download = () => {
    record()
    try {
      const blob = new Blob([rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'civic-dialogue-aggregate.csv'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setState('downloaded')
    } catch {
      setState('blocked')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rows)
      setState('copied')
    } catch {
      setState('blocked')
    }
  }

  return (
    <>
      <h3 className="section-title">Export</h3>
      <div className="row">
        <button type="button" className="btn btn--ghost" onClick={download}>
          Download aggregate report (CSV)
        </button>
        <button type="button" className="btn btn--ghost" onClick={copy}>
          Copy to clipboard
        </button>
      </div>

      {state === 'downloaded' && (
        <Banner tone="ok">Exported. The export is recorded in the public audit trail.</Banner>
      )}
      {state === 'copied' && <Banner tone="ok">Copied. Paste it into a spreadsheet.</Banner>}
      {state === 'blocked' && (
        <Banner tone="advisory" title="This browser blocked the download">
          The report is below — select it and copy it out.
        </Banner>
      )}

      <details className="card">
        <summary style={{ cursor: 'pointer', fontWeight: 650 }}>Show the report</summary>
        <pre
          className="scroll-x"
          style={{ fontSize: '0.78rem', marginTop: 'var(--s3)', marginBottom: 0 }}
        >
          {rows}
        </pre>
      </details>

      <p className="tiny">
        The export carries the coverage percentage in every row on purpose — so a number cannot
        be lifted into a briefing without the figure that qualifies it.
      </p>
    </>
  )
}
