import { useMemo } from 'react'
import SectionSwitch from './SectionSwitch'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import { ProvenanceChip, SourceFallback } from '../bills/Sourced'
import { overrunRecord } from '../../data/repo'
import { useT } from '../../i18n'
import './works.css'

/**
 * 4.6 — promised against actual, per department, permanently.
 *
 * This is the page that makes the other five work. A scheduler nobody is
 * measured against becomes a form people fill in afterwards; publishing the
 * record is what converts filing a work from paperwork into a commitment. And
 * it costs nothing to build, because the data exists the moment a permit is
 * issued.
 *
 * The framing is the load-bearing part. Most states have a Right to Service Act
 * setting statutory timelines for notified services, with a designated officer
 * and an appeal when a deadline is missed. This is that record — a duty those
 * bodies already owe, presented as a duty. Publishing it as a league table
 * before departments are on board reads as adversarial and poisons the
 * departmental half before it is built, so nothing here ranks anybody by a
 * single score, and every figure says what it counts.
 *
 * Nothing waits for an admission either. An overrun appears the day a committed
 * date passes, whether or not the department has updated anything, because a
 * record that needed the department's cooperation would show its best figures
 * on the day it was worst.
 */
export default function Record() {
  const t = useT()
  const rows = useMemo(() => overrunRecord(), [])

  return (
    <div className="wk">
      <header className="wk__head">
        <h1 className="t-display wk__title">{t('works.record.title')}</h1>
        <p className="wk__tagline">{t('works.record.intro')}</p>
      </header>

      <SectionSwitch active="record" />

      {rows.length > 0 && <SourceFallback of={rows[0].department} />}

      {rows.length === 0 ? (
        <ScreenState kind="empty" title={t('works.record.clean')} />
      ) : (
        <div className="wk__list">
          {rows.map((row) => {
            const share = row.finished > 0 ? Math.round((row.onTime / row.finished) * 100) : 0
            return (
              <article key={row.department.id} className="rec glass">
                <h2 className="rec__name">{row.department.name}</h2>
                <p className="rec__counts">
                  <span>{t('works.record.finished', { n: String(row.finished) })}</span>
                  <span className="rec__ok">{t('works.record.onTime', { n: String(row.onTime) })}</span>
                  {row.late > 0 && (
                    <span className="rec__late">{t('works.record.late', { n: String(row.late) })}</span>
                  )}
                </p>

                <p className="rec__track" aria-hidden="true">
                  <span className="rec__fill" style={{ width: `${share}%` }} />
                </p>

                <p className="rec__detail">
                  {row.late > 0 && (
                    <>
                      <span>{t('works.record.median', { n: String(row.medianLateDays) })}</span>
                      <span>{t('works.record.worst', { n: String(row.worstLateDays) })}</span>
                    </>
                  )}
                  {row.revisions > 0 && (
                    <span>{t('works.record.revisions', { n: String(row.revisions) })}</span>
                  )}
                </p>

                {row.department.appealOfficer && (
                  <p className="rec__appeal">{row.department.appealOfficer}</p>
                )}
                <ProvenanceChip of={row.department} />
              </article>
            )
          })}
        </div>
      )}

      <Disclosure
        icon={<span className="clause__num">?</span>}
        title={t('works.record.why')}
        meta={t('works.appeal')}
      >
        <p className="wk__prose">{t('works.appealBody')}</p>
      </Disclosure>
    </div>
  )
}
