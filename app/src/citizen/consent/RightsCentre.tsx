import { useState } from 'react'
import { useI18n } from '../../i18n'
import { useSession } from '../../core/session'
import Disclosure from '../../components/chowk/Disclosure'
import {
  accessSummary, exportEverything, GRIEVANCE, getNomination, grievanceDueAt,
  listGrievances, raiseGrievance, setNomination, clearNomination,
} from '../../core/rights'
import './rights.css'

const ICON = {
  access: <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  correct: <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z M14 6l4 4" />,
  erase: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />,
  grievance: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M12 8v4M12 15v.01" />,
  nominate: <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.4V20 M9.5 11.6a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z M18 8v6M21 11h-6" />,
}

function Glyph({ d }: { d: React.ReactNode }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  )
}

/**
 * Data principal rights, DPDP Act sections 11 to 14, exercisable in place.
 *
 * The Act frames most of these as requests to a fiduciary. Here they are mostly
 * actions, because there is nowhere for a request to travel to — the data is on
 * the device. That is worth saying on the screen rather than quietly enjoying:
 * a person reading this should understand *why* erasure is instant here and
 * takes a month elsewhere.
 */
export default function RightsCentre() {
  const { t, locale } = useI18n()
  const { deleteAccount } = useSession()
  const [showAccess, setShowAccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tick, force] = useState(0)

  const summary = accessSummary()
  const grievances = listGrievances()
  const nominee = getNomination()

  const [gSubject, setGSubject] = useState('')
  const [gDetail, setGDetail] = useState('')
  const [nName, setNName] = useState(nominee?.name ?? '')
  const [nRel, setNRel] = useState(nominee?.relationship ?? '')
  const [nContact, setNContact] = useState(nominee?.contact ?? '')

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportEverything(locale))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2600)
    } catch {
      setShowAccess(true)
    }
  }

  return (
    <section className="rts">
      <h2 className="t-display rts__title">{t('rights.title')}</h2>
      <p className="rts__intro">{t('rights.intro')}</p>

      {/* ------------------------------ s11 access ---------------------- */}
      <Disclosure
        icon={<Glyph d={ICON.access} />}
        title={t('rights.access')}
        meta="DPDP s.11"
      >
        <p>{t('rights.accessNote')}</p>

        <div className="rts__row">
          <button type="button" className="btn btn--ghost btn--sm"
            onClick={() => setShowAccess((v) => !v)}>
            {t('rights.accessOpen')}
          </button>
          <button type="button" className="btn btn--hue btn--sm" onClick={copyExport}>
            {copied ? t('rights.exported') : t('rights.export')}
          </button>
        </div>

        {showAccess && (
          <pre className="rts__dump">{exportEverything(locale)}</pre>
        )}

        <p className="t-label">{t('rights.processors')}</p>
        <p>{t('rights.processorsNone')}</p>

        <p className="t-label">{t('rights.notExist')}</p>
        <p>{t('rights.notExistBody')}</p>
      </Disclosure>

      {/* --------------------- s12 correction & erasure ------------------ */}
      <Disclosure
        icon={<Glyph d={ICON.correct} />}
        title={t('rights.correct')}
        meta="DPDP s.12"
      >
        <p>{t('rights.correctNote')}</p>
      </Disclosure>

      <Disclosure
        icon={<Glyph d={ICON.erase} />}
        title={t('rights.erase')}
        meta="DPDP s.12"
      >
        <p>{t('rights.eraseNote')}</p>
        <button type="button" className="btn btn--sm rts__danger" onClick={deleteAccount}>
          {t('rights.erase')}
        </button>
      </Disclosure>

      {/* ---------------------------- s13 grievance --------------------- */}
      <Disclosure
        icon={<Glyph d={ICON.grievance} />}
        title={t('rights.grievance')}
        meta="DPDP s.13"
      >
        <p>{t('rights.grievanceNote', { days: GRIEVANCE.responseDays })}</p>

        <div className="field">
          <label className="field__label" htmlFor="g-subject">
            {t('rights.grievanceSubject')}
          </label>
          <input id="g-subject" type="text" value={gSubject}
            onChange={(e) => setGSubject(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="g-detail">
            {t('rights.grievanceDetail')}
          </label>
          <textarea id="g-detail" value={gDetail}
            onChange={(e) => setGDetail(e.target.value)} />
        </div>
        <button
          type="button"
          className="btn btn--hue btn--sm"
          disabled={gSubject.trim().length < 3}
          onClick={() => {
            raiseGrievance(gSubject.trim(), gDetail.trim())
            setGSubject(''); setGDetail(''); force(tick + 1)
          }}
        >
          {t('rights.grievanceSend')}
        </button>

        {grievances.length === 0 ? (
          <p className="t-tiny">{t('rights.grievanceNone')}</p>
        ) : (
          <ul className="rts__list">
            {grievances.map((g) => (
              <li key={g.id}>
                <b>{g.subject}</b>
                <em>
                  {t('rights.grievanceOpen')} · {' '}
                  {t('rights.grievanceDue', {
                    date: new Date(grievanceDueAt(g)).toLocaleDateString(),
                  })}
                </em>
              </li>
            ))}
          </ul>
        )}

        {/* The Rules require a DPO contact and a route to the Board on the
            notice. Saying it is not appointed is more honest than an address
            that would silently swallow complaints. */}
        <p className="t-label">{t('rights.officer')}</p>
        <p className={GRIEVANCE.configured ? '' : 'rts__pending'}>
          {GRIEVANCE.configured ? GRIEVANCE.officerContact : t('rights.officerPending')}
        </p>
        <p>{t('rights.board')}</p>
      </Disclosure>

      {/* --------------------------- s14 nomination --------------------- */}
      <Disclosure
        icon={<Glyph d={ICON.nominate} />}
        title={t('rights.nominate')}
        meta="DPDP s.14"
      >
        <p>{t('rights.nominateNote')}</p>

        <div className="field">
          <label className="field__label" htmlFor="n-name">{t('rights.nomineeName')}</label>
          <input id="n-name" type="text" value={nName} onChange={(e) => setNName(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="n-rel">{t('rights.nomineeRelation')}</label>
          <input id="n-rel" type="text" value={nRel} onChange={(e) => setNRel(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="n-contact">{t('rights.nomineeContact')}</label>
          <input id="n-contact" type="text" value={nContact}
            onChange={(e) => setNContact(e.target.value)} />
        </div>

        <div className="rts__row">
          <button
            type="button"
            className="btn btn--hue btn--sm"
            disabled={nName.trim().length < 2}
            onClick={() => {
              setNomination({
                name: nName.trim(), relationship: nRel.trim(), contact: nContact.trim(),
              })
              force(tick + 1)
            }}
          >
            {t('rights.nomineeSave')}
          </button>
          {nominee && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                clearNomination(); setNName(''); setNRel(''); setNContact(''); force(tick + 1)
              }}
            >
              {t('rights.nomineeClear')}
            </button>
          )}
        </div>

        {!nominee && <p className="t-tiny">{t('rights.nomineeNone')}</p>}
      </Disclosure>

      <p className="t-tiny rts__count">
        {summary.processing.filter((p) => p.decision === 'granted').length}
        {' / '}
        {summary.processing.length}
      </p>
    </section>
  )
}
