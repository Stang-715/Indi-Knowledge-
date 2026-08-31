import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import {
  decide, decideAll, isCurrent, loadConsent, PURPOSES, receipt,
  type ConsentRecord, type Decision, type PurposeId,
} from '../../core/consent'
import './consent.css'

interface Props {
  /** Shown during onboarding, and again from the privacy screen at any time. */
  onDone: (record: ConsentRecord) => void
  /** True when a version bump forced the notice back up. */
  reasked?: boolean
}

/**
 * The DPDP consent notice.
 *
 * The Act requires consent that is free, specific, informed, unconditional and
 * given by clear affirmative action. Four things in this screen come directly
 * from that:
 *
 *  - Nothing is pre-selected. A toggle already switched on is not an
 *    affirmative action, it is a default nobody chose.
 *  - Every purpose is decided on its own. Refusing one never blocks another,
 *    which is what "unconditional" rules out — no bundling.
 *  - Each item states what refusing costs, on the item. A cost you discover
 *    afterwards was not a free choice at the time.
 *  - "Refuse all of it" sits beside "Agree to all of it", at the same weight.
 *    An agree button that is larger or brighter than its refusal is a nudge,
 *    and a nudged consent is not freely given.
 */
export default function ConsentNotice({ onDone, reasked }: Props) {
  const { t, locale, meta } = useI18n()
  const [record, setRecord] = useState<ConsentRecord | null>(() => {
    const existing = loadConsent()
    // A stored consent against an older notice is not consent to this one.
    return isCurrent(existing) ? existing : null
  })
  const [saved, setSaved] = useState(false)

  const set = (id: PurposeId, decision: Decision) =>
    setRecord(decide(record, id, decision, locale))

  const decided = useMemo(
    () => PURPOSES.every((p) => record?.decisions[p.id] !== undefined),
    [record],
  )

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receipt(record))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2600)
    } catch {
      /* clipboard blocked — the receipt is still readable in the privacy screen */
    }
  }

  return (
    <section className="cns" aria-labelledby="cns-title">
      <h2 className="t-display cns__title" id="cns-title">{t('consent.title')}</h2>
      <p className="cns__intro">{t('consent.intro')}</p>

      {reasked && (
        <p className="cns__changed" role="status">{t('consent.changed')}</p>
      )}

      <p className="t-label cns__section">{t('consent.itemised')}</p>

      <ul className="cns__list">
        {PURPOSES.map((p) => {
          const current = record?.decisions[p.id]?.decision
          return (
            <li className="cns__item" key={p.id}>
              <div className="cns__facts">
                <p className="cns__factLabel">{t('consent.dataLabel')}</p>
                <p className="cns__fact">{t(p.dataKey)}</p>

                <p className="cns__factLabel">{t('consent.purposeLabel')}</p>
                <p className="cns__fact">{t(p.purposeKey)}</p>

                <p className="cns__factLabel">{t('consent.costLabel')}</p>
                <p className="cns__fact cns__cost">{t(p.costKey)}</p>
              </div>

              <div className="cns__tags">
                {p.necessary && <span className="tag">{t('consent.necessary')}</span>}
                <span className={p.seenByGov ? 'tag tag--gov' : 'tag'}>
                  {p.seenByGov ? t('consent.seenByGov') : t('consent.notSeenByGov')}
                </span>
              </div>

              {/* Two buttons of equal weight, neither pre-selected. */}
              <div
                className="cns__choice"
                role="radiogroup"
                aria-label={t(p.purposeKey)}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={current === 'granted'}
                  className="cns__btn cns__btn--grant"
                  onClick={() => set(p.id, 'granted')}
                >
                  {t('consent.grant')}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={current === 'refused'}
                  className="cns__btn cns__btn--refuse"
                  onClick={() => set(p.id, 'refused')}
                >
                  {t('consent.refuse')}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="cns__bulk">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setRecord(decideAll('granted', locale))}
        >
          {t('consent.acceptAll')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setRecord(decideAll('refused', locale))}
        >
          {t('consent.refuseAll')}
        </button>
      </div>

      <p className="cns__version">
        {t('consent.version', { v: record?.version ?? 1, lang: meta.endonym })}
      </p>

      {!decided && <p className="cns__must">{t('consent.mustDecide')}</p>}

      <button
        type="button"
        className="btn btn--hue btn--block btn--lg"
        disabled={!decided}
        onClick={() => record && onDone(record)}
      >
        {t('consent.continue')}
      </button>

      <button
        type="button"
        className="btn btn--quiet btn--block"
        disabled={!record}
        onClick={copyReceipt}
      >
        {saved ? t('consent.receiptSaved') : t('consent.receipt')}
      </button>
    </section>
  )
}
