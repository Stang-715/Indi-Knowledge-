import { Link } from 'react-router-dom'
import { daysRemaining, overrunDays, stateOf, type Work } from '../../core/works'
import { getDepartment, getStretch } from '../../data/repo'
import { useT } from '../../i18n'

/**
 * A work, as a card.
 *
 * The date is the largest thing on it. Everything else on this surface — who is
 * digging, why, under which permit — is answerable from a sign on a barrier.
 * When the road comes back is the fact nobody publishes where a resident can
 * find it, so it is the fact the card is built around, and it is phrased as a
 * countdown rather than a date because "in nine days" is what somebody is
 * actually asking.
 */
export default function WorkCard({ work }: { work: Work }) {
  const t = useT()
  const stretch = getStretch(work.stretchId)
  const department = getDepartment(work.departmentId)
  const state = stateOf(work)
  const remaining = daysRemaining(work)
  const late = overrunDays(work)

  const headline = state === 'overrun'
    ? t('works.lateBy', { n: String(late) })
    : state === 'restored'
      ? t('works.restoredOn', {
        d: new Date(work.restoredAt ?? work.restoreBy).toLocaleDateString(undefined,
          { day: 'numeric', month: 'short' }),
      })
      : state === 'planned'
        ? t('works.startsIn', { n: String(Math.max(0, Math.ceil((work.startsAt - Date.now()) / 86400000))) })
        : remaining <= 0 ? t('works.dueToday') : t('works.dueIn', { n: String(remaining) })

  return (
    <Link to={`/s/works/w/${work.id}`} className={`wc glass glass--press wc--${state}`}>
      <span className="wc__when">{headline}</span>
      <span className="wc__street">{stretch?.street ?? ''}</span>
      <span className="wc__meta">
        <span className={`wc__tag wc__tag--${state}`}>{t(`works.state.${state}`)}</span>
        <span className="wc__tag">{t(`works.utility.${work.utility}`)}</span>
        <span className="wc__tag">{t(`works.closure.${work.closure}`)}</span>
      </span>
      <span className="wc__who">{department?.name ?? ''}</span>
    </Link>
  )
}
