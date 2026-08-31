import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { checkPermit, ensureRoot, type PermitCheck } from '../../core/institution'
import { useT } from '../../i18n'
import './works.css'

/**
 * Checking a permit from the street.
 *
 * "No permit, no dig" is only a rule if the permit can be checked by the person
 * standing next to the hole. So this screen takes a number off a barrier board
 * and nothing else — no account, no session, no record of who asked — and the
 * answer comes from a signature the phone verifies against a pinned key rather
 * than from the server saying yes.
 *
 * It is also the screen where the unresolved half of Phase 7 is visible.
 * A signature proves somebody held a key. It does not prove that somebody is
 * the Water Board, and in this build enrolment is automatic, so it does not
 * prove that at all. The screen says so, in the same place it says the
 * signature checked out, because a green tick over an ungated register is the
 * most dangerous thing this surface could show.
 */
export default function Permit() {
  const t = useT()
  const [number, setNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<PermitCheck | null>(null)
  const [rootChanged, setRootChanged] = useState(false)

  useEffect(() => {
    void ensureRoot().then((r) => setRootChanged(r.changed))
  }, [])

  const run = async () => {
    const n = number.trim().toUpperCase()
    if (n.length < 4) return
    setBusy(true)
    setResult(await checkPermit(n))
    setBusy(false)
  }

  const date = (at: number) =>
    new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="wk">
      <Link to="/s/works" className="wk__back">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        {t('works.section.map')}
      </Link>

      <header className="wk__head">
        <h1 className="t-display wk__title">{t('permit.title')}</h1>
        <p className="wk__tagline">{t('permit.tagline')}</p>
      </header>

      {rootChanged && (
        <aside className="pv pv--bad" role="alert">
          <p className="pv__verdict">{t('permit.rootChanged')}</p>
        </aside>
      )}

      <div className="field">
        <label className="field__label" htmlFor="pv-num">{t('permit.number')}</label>
        <input id="pv-num" type="text" value={number} autoComplete="off"
          inputMode="text" spellCheck={false}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void run() }} />
        <p className="field__hint">{t('permit.numberHint')}</p>
      </div>

      <button type="button" className="btn btn--hue btn--block" disabled={busy}
        onClick={() => { void run() }}>
        {busy ? t('permit.checking') : t('permit.check')}
      </button>

      {result && (
        <section className={`pv pv--${result.found ? (result.valid ? 'ok' : 'bad') : 'none'}`}>
          <p className="pv__verdict">
            {!result.found
              ? (result.reason === 'offline' ? t('permit.offline') : t('permit.missing'))
              : result.valid ? t('permit.valid') : t('permit.invalid')}
          </p>
          <p className="pv__body">
            {!result.found
              ? (result.reason === 'offline' ? t('permit.offlineBody') : t('permit.missingBody'))
              : result.valid ? t('permit.validBody') : t('permit.invalidBody')}
          </p>

          {result.permit && (
            <>
              <dl className="pv__facts">
                <dt>{t('permit.for')}</dt>
                <dd>{result.reason}</dd>
                <dt>{t('permit.window')
                  .replace('{from}', date(result.permit.startsAt))
                  .replace('{to}', date(result.permit.restoreBy))}</dt>
                <dd>{result.closure ? t(`works.closure.${result.closure}`) : ''}</dd>
                <dt>{t('permit.by')}</dt>
                <dd>
                  {result.department
                    ? result.department.name
                    : t('permit.unregistered')}
                </dd>
              </dl>
              <p className="pv__meta">{t('permit.issued', { d: date(result.permit.issuedAt) })}</p>
            </>
          )}

          <p className="pv__meta">{t(`permit.pin.${result.pinning}`)}</p>

          {/* The gate, said where the tick is — not in a footnote. */}
          {result.department?.enrolledBy === 'automatic' && (
            <p className="pv__gate">{t('permit.gate')}</p>
          )}
        </section>
      )}
    </div>
  )
}
