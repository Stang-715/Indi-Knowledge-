import { Link, useParams } from 'react-router-dom'
import ScreenState from '../../components/chowk/ScreenState'
import Disclosure from '../../components/chowk/Disclosure'
import { ProvenanceChip, SourceFallback, SourceLink } from '../bills/Sourced'
import { getDepartment, getStretch, getWork } from '../../data/repo'
import { daysRemaining, originalCommitment, overrunDays, stateOf } from '../../core/works'
import { useSession } from '../../core/session'
import { useT } from '../../i18n'
import './works.css'

/**
 * One work, and the promise attached to it.
 *
 * The revision list is the point of this screen. A department that can quietly
 * move its own deadline has no deadline, so every change to the committed date
 * is kept with the date it was changed and the reason given — the original
 * commitment first, and it cannot be edited. A citizen reading three revisions
 * knows something that no single status field could have told them.
 */
export default function WorkDetail() {
  const t = useT()
  const { id = '' } = useParams()
  const { prefs, toggleStreet } = useSession()
  const work = getWork(id)

  if (!work) {
    return <div className="wk"><Back /><ScreenState kind="empty" /></div>
  }

  const stretch = getStretch(work.stretchId)
  const department = getDepartment(work.departmentId)
  const state = stateOf(work)
  const late = overrunDays(work)
  const remaining = daysRemaining(work)
  const original = originalCommitment(work)
  const moved = work.revisions.length - 1

  const following = stretch
    ? prefs.followedStreets.some(
      (s) => s.name.trim().toLowerCase() === stretch.street.trim().toLowerCase())
    : false

  const date = (at: number) =>
    new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="wk">
      <Back />

      <header className="wk__head">
        <p className={`wk__when wk__when--${state}`}>
          {state === 'overrun'
            ? t('works.lateBy', { n: String(late) })
            : state === 'restored'
              ? t('works.restoredOn', { d: date(work.restoredAt ?? work.restoreBy) })
              : remaining <= 0 ? t('works.dueToday') : t('works.dueIn', { n: String(remaining) })}
        </p>
        <h1 className="wk__street">{stretch?.street ?? ''}</h1>
        <p className="wk__cite">
          {stretch?.locality} · {t(`works.utility.${work.utility}`)} ·{' '}
          {t(`works.closure.${work.closure}`)}
        </p>
        <ProvenanceChip of={work} />
      </header>

      <SourceFallback of={work} />

      {stretch && (
        <button
          type="button"
          className={`btn ${following ? 'btn--ghost' : 'btn--hue'} btn--block`}
          onClick={() => toggleStreet(stretch.street, stretch.locality)}
        >
          {following ? t('works.mine.unfollow') : t('works.mine.follow')}
        </button>
      )}

      <section className="wk__block">
        <h2 className="wk__h2">{t('works.reason')}</h2>
        <p className="wk__prose">{work.reason}</p>
      </section>

      <section className="wk__block">
        <h2 className="wk__h2">{t('works.who')}</h2>
        <p className="wk__prose">{department?.name}</p>
        {work.permitNumber
          ? <p className="wk__permit">{t('works.permit', { n: work.permitNumber })}</p>
          : (
            <>
              <p className="wk__permit wk__permit--none">{t('works.noPermit')}</p>
              <p className="wk__note">{t('works.noPermitBody')}</p>
            </>
          )}
      </section>

      <section className="wk__block">
        <h2 className="wk__h2">{t('works.history')}</h2>
        <p className="wk__committed">
          {t('works.committed')} <strong>{date(work.restoreBy)}</strong>
        </p>
        {moved > 0 && (
          <p className="wk__moved">
            {moved === 1
              ? t('works.revision')
              : t('works.revisions', { n: String(moved) })}
            {' — '}
            {t('works.originally', { d: date(original) })}
          </p>
        )}
        <ol className="wk__revisions">
          {work.revisions.map((r) => (
            <li key={`${r.at}-${r.to}`}>
              <span className="wk__rev-date">{date(r.to)}</span>
              <span className="wk__rev-why">{r.reason}</span>
            </li>
          ))}
        </ol>
      </section>

      {department?.appealOfficer && (
        <Disclosure
          icon={<span className="clause__num">§</span>}
          title={t('works.appeal')}
          meta={department.appealOfficer}
        >
          <p className="wk__prose">{t('works.appealBody')}</p>
          <SourceLink of={department} />
        </Disclosure>
      )}
    </div>
  )
}

function Back() {
  const t = useT()
  return (
    <Link to="/s/works" className="wk__back">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      {t('works.section.map')}
    </Link>
  )
}
