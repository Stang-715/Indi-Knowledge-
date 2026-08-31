import { useCallback, useEffect, useState } from 'react'
import { useGov } from './GovPortal'
import { apiGet, apiPost } from '../core/api'
import { departmentPublicKey, signAs } from '../core/deptkey'
import { listStretches } from '../data/repo'
import { appendAudit } from '../core/audit'
import { Banner, PrincipleNote } from '../components/ui'

/**
 * 4.2 file a work · 4.3 clash detector · 4.4 approval to permit.
 *
 * The desk half of Surface 4. Three things about it are load-bearing.
 *
 * **The department signs, not the officer.** An account is a person at a desk;
 * a department is an entry in the register holding a key. A filing signed by
 * the department survives the officer leaving, and it is the register — not a
 * staff list on our server — that a citizen's phone checks when it verifies a
 * permit.
 *
 * **The clash check runs at filing time.** A department that learns about a
 * clash at approval has already ordered the barriers. So the answer comes back
 * with the filing, and approval is refused while a clash stands — resolving one
 * means somebody's window actually moves, not that a note was added saying it
 * was discussed.
 *
 * **Enrolment is not gated.** This build enrols any body that asks. That is the
 * unresolved half of this phase and it is stated on this screen and on the
 * citizen's permit check, because a scheduler where a fake water board can file
 * is worse than no scheduler, and the only thing worse is one that looks
 * trustworthy.
 */

interface Filing {
  id: string
  department: string
  stretch: string
  utility: string
  reason: string
  starts_at: number
  restore_by: number
  closure: string
  state: string
  note?: string | null
}

const DAY = 24 * 60 * 60 * 1000
const dateValue = (at: number) => new Date(at).toISOString().slice(0, 10)

export default function Works() {
  const { account, can } = useGov()
  const stretches = listStretches()

  const [enrolled, setEnrolled] = useState<'unknown' | 'yes' | 'failed'>('unknown')
  const [filings, setFilings] = useState<Filing[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [clashes, setClashes] = useState<Filing[]>([])
  const [busy, setBusy] = useState(false)

  const [stretch, setStretch] = useState(stretches[0]?.id ?? '')
  const [reason, setReason] = useState('')
  const [closure, setClosure] = useState('partial')
  const [from, setFrom] = useState(dateValue(Date.now() + 14 * DAY))
  const [to, setTo] = useState(dateValue(Date.now() + 28 * DAY))

  const departmentId = account?.departmentId

  const refresh = useCallback(async () => {
    try {
      const res = await apiGet<{ filings?: Filing[] }>('/v1/works/filings')
      setFilings(res.filings ?? [])
    } catch {
      setMessage('The register is not reachable. Nothing below is current.')
    }
  }, [])

  /* Enrolment on first use of the desk. In production a department is entered
     in the register by whoever is accountable for deciding that; here it asks
     and is admitted, which is the gap this phase leaves open. */
  useEffect(() => {
    if (!departmentId || !account) return
    let cancelled = false
    void (async () => {
      const publicKey = await departmentPublicKey(departmentId)
      if (!publicKey || cancelled) return
      const payload = {
        id: departmentId,
        name: `${account.institution.name} — ${account.utility ?? 'works'}`,
        utility: account.utility ?? 'road',
        publicKey,
        approver: account.roles.includes('works-approver'),
      }
      const sig = await signAs(departmentId, '/v1/registry/enrol', payload)
      if (!sig || cancelled) return
      try {
        const res = await apiPost<{ ok?: boolean }>('/v1/registry/enrol', { ...payload, sig })
        if (!cancelled) setEnrolled(res.ok ? 'yes' : 'failed')
      } catch {
        if (!cancelled) setEnrolled('failed')
      }
      if (!cancelled) void refresh()
    })()
    return () => { cancelled = true }
  }, [departmentId, account, refresh])

  const file = async () => {
    if (!departmentId || !reason.trim()) return
    setBusy(true)
    setMessage(null)
    setClashes([])

    const payload = {
      id: `wk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      department: departmentId,
      stretch,
      utility: account?.utility ?? 'road',
      reason: reason.trim(),
      closure,
      startsAt: Date.parse(from),
      restoreBy: Date.parse(to),
    }
    const sig = await signAs(departmentId, '/v1/works/file', payload)
    if (!sig) { setBusy(false); setMessage('No signing key on this device.'); return }

    try {
      const res = await apiPost<{ ok?: boolean; reason?: string; state?: string; clashes?: Filing[] }>(
        '/v1/works/file', { ...payload, sig },
      )
      if (!res.ok) setMessage(`Refused: ${res.reason}`)
      else {
        setReason('')
        setClashes(res.clashes ?? [])
        setMessage(res.state === 'clashed'
          ? 'Filed, and it clashes with work already booked on this stretch. It cannot be approved until one of the two windows moves.'
          : 'Filed. No other work is booked on this stretch in that window.')
        appendAudit({
          actorKind: 'gov',
          actor: account?.institution.name ?? 'Department',
          action: 'works.file',
          scope: stretch,
          detail: `Work filed for ${from} to ${to}. Signed by the department, not the officer.`,
        })
      }
      await refresh()
    } catch {
      setMessage('The register is not reachable. Nothing was filed.')
    }
    setBusy(false)
  }

  const decide = async (filing: Filing, decision: 'approve' | 'refuse') => {
    if (!departmentId) return
    setBusy(true)
    setMessage(null)
    const payload = {
      filing: filing.id, department: departmentId, decision,
      note: decision === 'approve' ? 'Approved.' : 'Refused at approval.',
    }
    const sig = await signAs(departmentId, '/v1/works/decide', payload)
    if (!sig) { setBusy(false); return }

    try {
      const res = await apiPost<{
        ok?: boolean; reason?: string; permit?: { number: string }; clashes?: Filing[]
      }>('/v1/works/decide', { ...payload, sig })
      if (res.ok && res.permit) {
        setMessage(`Permit ${res.permit.number} issued. Anybody can now check that number.`)
      } else if (res.ok) {
        setMessage('Refused, with the reason recorded against the filing.')
      } else if (res.reason === 'clash-stands') {
        setClashes(res.clashes ?? [])
        setMessage('Not approved: a clash still stands. One of the two windows has to move.')
      } else {
        setMessage(`Refused: ${res.reason}`)
      }
      await refresh()
    } catch {
      setMessage('The register is not reachable.')
    }
    setBusy(false)
  }

  const mine = filings.filter((f) => f.department === departmentId)
  const awaiting = filings.filter((f) => f.state === 'filed' || f.state === 'clashed')
  const streetOf = (id: string) => stretches.find((s) => s.id === id)?.street ?? id

  return (
    <>
      <h2 style={{ margin: 0 }}>Works</h2>

      {enrolled === 'failed' && (
        <Banner tone="danger">
          This department could not be entered in the register. Nothing can be filed until it is.
        </Banner>
      )}

      <Banner tone="advisory" title="Enrolment in this build is not gated">
        Any body that asks is entered in the register, and every entry records that. The
        signatures are real cryptography; what they prove is that somebody held a key, not
        that they are the department they say they are. Deciding who counts as a department
        is an institutional arrangement, and it does not exist yet.
      </Banner>

      {message && <Banner tone="neutral">{message}</Banner>}

      {/* ------------------------------ 4.2 file ----------------------------- */}
      <h3 className="section-title">File a work</h3>

      <div className="field">
        <label className="field__label" htmlFor="wf-stretch">Stretch</label>
        <select id="wf-stretch" value={stretch} onChange={(e) => setStretch(e.target.value)}>
          {stretches.map((s) => (
            <option key={s.id} value={s.id}>{s.street} — {s.locality}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="wf-reason">
          Why the road is being opened
        </label>
        <textarea id="wf-reason" rows={3} value={reason}
          onChange={(e) => setReason(e.target.value)} />
        <p className="field__hint">
          In the words a resident would use. This is what appears on the citizen side.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="wf-from">Digging starts</label>
        <input id="wf-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="wf-to">Restoration complete by</label>
        <input id="wf-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <p className="field__hint">
          This is the commitment. Moving it later is recorded and published against the
          department, so file the date you can meet rather than the one you would like.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="wf-closure">Effect on traffic</label>
        <select id="wf-closure" value={closure} onChange={(e) => setClosure(e.target.value)}>
          <option value="full">Road closed</option>
          <option value="partial">Partly open</option>
          <option value="none">Traffic unaffected</option>
        </select>
      </div>

      <button type="button" className="btn btn--block" disabled={busy || !departmentId}
        onClick={() => { void file() }}>
        File it
      </button>

      {/* ---------------------------- 4.3 clashes ---------------------------- */}
      {clashes.length > 0 && (
        <>
          <h3 className="section-title">Already booked on this stretch</h3>
          <div className="stack stack--tight">
            {clashes.map((c) => (
              <article key={c.id} className="card">
                <span className="card__title">{streetOf(c.stretch)}</span>
                <span className="card__meta">
                  {new Date(c.starts_at).toLocaleDateString()} —{' '}
                  {new Date(c.restore_by).toLocaleDateString()} · {c.utility}
                </span>
                <span className="card__body">{c.reason}</span>
              </article>
            ))}
          </div>
          <PrincipleNote>
            A clash is not a warning to click past. Approval is refused while one stands, so
            the road is dug once instead of twice — which is the entire reason this scheduler
            exists.
          </PrincipleNote>
        </>
      )}

      {/* --------------------------- 4.4 approvals --------------------------- */}
      {can('works-approver') && (
        <>
          <h3 className="section-title">Awaiting a decision</h3>
          {awaiting.length === 0 && <p className="empty">Nothing is waiting.</p>}
          <div className="stack stack--tight">
            {awaiting.map((f) => (
              <article key={f.id} className="card">
                <span className="card__title">{streetOf(f.stretch)}</span>
                <span className="card__meta">
                  {new Date(f.starts_at).toLocaleDateString()} —{' '}
                  {new Date(f.restore_by).toLocaleDateString()} · {f.utility}
                  {f.state === 'clashed' && <span className="badge badge--critical">Clash</span>}
                </span>
                <span className="card__body">{f.reason}</span>
                <div className="row" style={{ marginTop: 'var(--s3)' }}>
                  <button type="button" className="chip" disabled={busy}
                    onClick={() => { void decide(f, 'approve') }}>
                    Approve and issue a permit
                  </button>
                  <button type="button" className="chip" disabled={busy}
                    onClick={() => { void decide(f, 'refuse') }}>
                    Refuse
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <h3 className="section-title">Filed by this department</h3>
      {mine.length === 0 && <p className="empty">Nothing filed yet.</p>}
      <div className="stack stack--tight">
        {mine.map((f) => (
          <article key={f.id} className="card">
            <span className="card__title">{streetOf(f.stretch)}</span>
            <span className="card__meta">
              {new Date(f.starts_at).toLocaleDateString()} —{' '}
              {new Date(f.restore_by).toLocaleDateString()}
              <span className="badge">{f.state}</span>
            </span>
            <span className="card__body">{f.reason}</span>
          </article>
        ))}
      </div>

      <PrincipleNote>
        The filing is signed by the department, not by you. That is why it survives your post
        being reassigned, and why a citizen standing next to the hole can check the permit
        against the register rather than having to take this system's word for it.
      </PrincipleNote>
    </>
  )
}
