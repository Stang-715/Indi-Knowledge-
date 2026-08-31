import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '../core/api'
import { verifyChain, type ChainEntry, type Verdict } from '../core/auditchain'
import { Banner, PrincipleNote } from '../components/ui'

/**
 * 12.3 — the chain, checked here rather than taken on trust.
 *
 * The server will tell you the trail verifies. An oversight layer whose
 * verification is performed by the party being overseen is not oversight, so
 * this fetches the entries and recomputes every digest in the reader's own
 * browser. If the two ever disagree, this page is the one to believe.
 *
 * The number worth taking away is the head. Written down somewhere this
 * platform does not control and compared next month, it turns a rewritten
 * history from something nobody could notice into something anybody can prove.
 * That is the whole mechanism, and it is worth precisely as much as somebody
 * bothering to keep the copies — which is the part software cannot supply.
 */
export default function Chain() {
  const [entries, setEntries] = useState<ChainEntry[] | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [serverSays, setServerSays] = useState<{ seq: number; digest: string } | null>(null)
  const [observers, setObservers] = useState<Record<string, unknown>[]>([])
  const [attestations, setAttestations] = useState<Record<string, unknown>[]>([])
  const [reports, setReports] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const [chain, head, obs, rep] = await Promise.all([
        apiGet<{ entries?: ChainEntry[] }>('/v1/oversight/chain'),
        apiGet<{ seq: number; digest: string }>('/v1/oversight/head'),
        apiGet<{ observers?: Record<string, unknown>[]; attestations?: Record<string, unknown>[] }>(
          '/v1/oversight/observers',
        ),
        apiGet<{ reports?: Record<string, unknown>[] }>('/v1/oversight/reports'),
      ])
      const rows = chain.entries ?? []
      setEntries(rows)
      setServerSays(head)
      setObservers(obs.observers ?? [])
      setAttestations(obs.attestations ?? [])
      setReports(rep.reports ?? [])
      setVerdict(await verifyChain(rows))
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (error) {
    return (
      <Banner tone="danger" title="The trail is not reachable">
        Nothing can be checked from here without it. That is not a reassuring state and it is
        not being presented as one.
      </Banner>
    )
  }

  if (!verdict || !entries) return <p className="empty">Fetching the trail and checking it…</p>

  const agrees = serverSays && verdict.head === serverSays.digest

  return (
    <>
      <Banner
        tone={verdict.ok ? 'ok' : 'danger'}
        title={verdict.ok
          ? `${verdict.checked} entries, every one following from the one before`
          : `The chain breaks at entry ${verdict.brokenAt}`}
      >
        {verdict.ok
          ? 'Recomputed in this browser from the entries as fetched. The server was not asked whether to believe it.'
          : 'An entry does not follow from its predecessor. Either the trail has been altered or something is very wrong with how it is written. Neither is a small matter.'}
      </Banner>

      <h2 className="section-title">The head</h2>
      <div className="card">
        <p className="tiny">Keep this. Compare it next month.</p>
        <p className="card__body" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {verdict.head}
        </p>
        <p className="tiny">
          Entry {serverSays?.seq ?? verdict.checked}
          {agrees === false && ' — and this server reports a different head, which is the one thing on this page that should never happen.'}
        </p>
      </div>

      {agrees === false && (
        <Banner tone="danger" title="This page and the server disagree">
          The digest computed here from the entries does not match the head the server reports.
          Believe this page: it did the arithmetic.
        </Banner>
      )}

      <h2 className="section-title">Countersigned by</h2>
      {observers.length === 0 && (
        <p className="empty">
          Nobody. A chain nobody outside has signed is a chain with nothing anchoring it.
        </p>
      )}
      {attestations.length === 0 && observers.length > 0 && (
        <p className="empty">An observer is enrolled but has not countersigned a head yet.</p>
      )}
      <div className="stack stack--tight">
        {attestations.map((a) => {
          const observer = observers.find((o) => o.id === a.observer)
          return (
            <article key={String(a.id)} className="card">
              <p className="card__title" style={{ marginBottom: 2 }}>
                {String(observer?.name ?? a.observer)}
              </p>
              <p className="tiny">
                Entry {String(a.seq)} · {new Date(Number(a.at)).toLocaleString()}
              </p>
              <p className="card__body" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {String(a.digest).slice(0, 32)}…
              </p>
            </article>
          )
        })}
      </div>

      <h2 className="section-title">Reports published</h2>
      <p className="tiny">
        One for every completed month, written by the calendar rather than when somebody asks —
        and immutable once written, so a later rewrite of history contradicts a report already
        out.
      </p>
      <div className="stack stack--tight">
        {reports.map((r) => {
          const body = JSON.parse(String(r.body)) as { entries: number }
          return (
            <article key={String(r.period)} className="card">
              <span className="spread">
                <span>
                  <span className="card__title" style={{ margin: 0 }}>{String(r.period)}</span>
                  <span className="tiny" style={{ display: 'block' }}>
                    Head at publication: {String(r.head_digest).slice(0, 16)}…
                  </span>
                </span>
                <strong style={{ fontSize: '1.5rem' }}>{body.entries}</strong>
              </span>
            </article>
          )
        })}
      </div>

      <PrincipleNote>
        Append-only triggers stop this server editing its own history. They do nothing about it
        being replaced wholesale by a database with a tidier past, and from outside the two look
        identical. The chain is what makes that difference visible — but only to somebody who
        kept an older head. Software can publish the head on a schedule and let an outside body
        sign it. It cannot make that body exist, and a layer that implied otherwise would be the
        exact failure this one is here to prevent.
      </PrincipleNote>
    </>
  )
}
