import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdvisoryBanner } from '../../components/ui'
import {
  ConsentRequiredError, ParticipationError, canDo, castVote, getPoll, isOpen,
  myResponse, pollAggregate, withinEditWindow,
} from '../../data/repo'
import { coverageRate } from '../../core/aggregate'
import { useT } from '../../i18n'

/**
 * 3.3 — registering a view.
 *
 * The advisory banner is rendered unconditionally and cannot be dismissed. That
 * is not a styling decision: this surface is one screen away from looking like
 * an election, and the moment it does, an advisory poll becomes a thing people
 * believe they have voted in. The constraint check fails the build if the
 * banner grows a way to be closed.
 *
 * Results appear only after answering, so the tally cannot pull an answer along
 * with it, and every result carries its coverage — how many of the people it
 * claims to speak for actually answered. A percentage without that is a number
 * pretending to be a mandate.
 */
export default function VotePanel({ pollId }: { pollId: string }) {
  const t = useT()
  const poll = getPoll(pollId)
  const [choice, setChoice] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<string | null>(null)
  const [, force] = useState(0)

  if (!poll) return null

  const mine = myResponse(pollId)
  const open = isOpen(poll)
  const canEdit = withinEditWindow(poll, mine)
  const mayAnswer = canDo('poll-response')

  const answer = (optionId: string) => {
    try {
      castVote(pollId, optionId)
      setChoice(null)
      force((n) => n + 1)
    } catch (err) {
      // The data layer refuses on consent and on age, not the screen. What is
      // left here is saying why, in words rather than a silent no-op.
      if (err instanceof ConsentRequiredError) setRefusal(t('poll.consentNeeded'))
      else if (err instanceof ParticipationError) setRefusal(t('poll.minorReadOnly'))
      else setRefusal(t('state.error'))
    }
  }

  const aggregate = pollAggregate(pollId)
  const showResults = Boolean(mine)
  const coverage = aggregate.coverage ? coverageRate(aggregate.coverage) : null

  return (
    <section className="vote">
      <h2 className="bl__h2">{t('bills.viewOn')}</h2>

      {/* Un-removable, on every surface that takes a view. */}
      <AdvisoryBanner />

      {!open && <p className="vote__closed">{t('poll.closed')}</p>}

      {open && (!mine || canEdit) && (
        <div className="vote__options" role="radiogroup" aria-label={poll.billTitle}>
          {poll.options.map((option) => {
            const selected = (choice ?? mine?.optionId) === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`vote__opt${selected ? ' is-on' : ''}`}
                disabled={!mayAnswer}
                onClick={() => setChoice(option.id)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {open && choice && choice !== mine?.optionId && (
        <button type="button" className="btn btn--hue btn--block" onClick={() => answer(choice)}>
          {mine ? t('poll.change') : t('action.confirm')}
        </button>
      )}

      {!mayAnswer && <p className="vote__note">{t('poll.needVerify')}</p>}
      {refusal && <p className="vote__note vote__note--warn" role="alert">{refusal}</p>}

      {mine && (
        <p className="vote__mine">
          {poll.options.find((o) => o.id === mine.optionId)?.label}
        </p>
      )}

      {showResults ? (
        <div className="vote__results">
          {aggregate.buckets.map((b) => {
            const share = aggregate.total > 0 ? Math.round((b.count / aggregate.total) * 100) : 0
            return (
              <div key={b.key} className="vote__bar">
                <span className="vote__bar-label">{b.label}</span>
                <span className="vote__bar-track" aria-hidden="true">
                  <span className="vote__bar-fill" style={{ width: `${share}%` }} />
                </span>
                <span className="vote__bar-value">{share}%</span>
              </div>
            )
          })}
          {coverage !== null && (
            <p className="vote__coverage">
              {t('poll.coverageOf', {
                n: String(aggregate.total),
                pct: String(Math.round(coverage * 100)),
              })}
            </p>
          )}
          {aggregate.suppressed > 0 && (
            <p className="vote__coverage">
              {t('common.suppressed', { n: String(aggregate.suppressed) })}
            </p>
          )}
        </div>
      ) : (
        <p className="vote__note">{t('poll.resultsLockedBody')}</p>
      )}
    </section>
  )
}

/** The debate attached to a bill, as a link rather than a second column. */
export function DebateLink({ topicId }: { topicId: string }) {
  const t = useT()
  return (
    <Link className="btn btn--ghost btn--block" to={`/s/bills/debate/${topicId}`}>
      {t('bills.debate')}
    </Link>
  )
}
