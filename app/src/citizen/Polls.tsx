import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useSession } from '../core/session'
import {
  castVote, getPoll, isOpen, listPolls, myResponse, pollAggregate, topicForAnchor,
  withinEditWindow,
} from '../data/repo'
import { AdvisoryBanner, BackBar, Bars, Banner, Modal, PrincipleNote, countdown } from '../components/ui'
import { coverageRate } from '../core/aggregate'

/* ------------------------------ 4.1 / 4.5 List ---------------------------- */

export function PollList({ archive = false }: { archive?: boolean }) {
  const t = useT()
  const { prefs } = useSession()
  const localityIds = prefs.localities.map((l) => l.id)

  const polls = listPolls()
    .filter((p) => p.localityIds === 'all' || p.localityIds.some((l) => localityIds.includes(l)))
    .filter((p) => (archive ? !isOpen(p) : isOpen(p)))

  return (
    <>
      <div className="spread">
        <h2 style={{ margin: 0 }}>{archive ? 'Past polls' : t('feed.polls')}</h2>
        <Link to={archive ? '/app/polls' : '/app/polls/archive'} className="chip tap">
          {archive ? 'Open polls' : 'Archive'}
        </Link>
      </div>

      <AdvisoryBanner />

      <div className="stack">
        {polls.length === 0 && <p className="empty">{t('feed.empty')}</p>}
        {polls.map((p) => {
          const mine = myResponse(p.id)
          return (
            <Link key={p.id} to={`/app/polls/${p.id}`} className="card">
              <span className="card__title">{p.billTitle}</span>
              <span className="card__meta">
                <span>{p.issuedBy.name}</span>
                <span>·</span>
                <span>
                  {isOpen(p) ? t('poll.closesIn', { t: countdown(p.closesAt) }) : t('poll.closed')}
                </span>
                {mine && <span className="badge badge--verified">Answered</span>}
              </span>
              <span className="card__body">{p.plainSummary.split('\n')[0].slice(0, 140)}…</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

/* --------------------- 4.2 / 4.3 / 4.4 Detail, vote, results -------------- */

export function PollDetail() {
  const t = useT()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { eligibility } = useSession()

  const poll = getPoll(id)
  const [choice, setChoice] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [howItWorks, setHowItWorks] = useState(false)
  const [, force] = useState(0)

  if (!poll) {
    return (
      <>
        <BackBar title={t('feed.polls')} to="/app/polls" />
        <p className="empty">This poll is no longer available.</p>
      </>
    )
  }

  const mine = myResponse(poll.id)
  const open = isOpen(poll)
  const canEdit = withinEditWindow(poll, mine)
  const topic = topicForAnchor('poll', poll.id)
  const verified = eligibility?.verified === true

  const confirm = () => {
    if (!choice) return
    castVote(poll.id, choice)
    setConfirming(false)
    setChoice(null)
    force((n) => n + 1)
  }

  const showResults = mine !== null || !open

  return (
    <>
      <BackBar title={t('feed.polls')} to="/app/polls" />

      {/* Un-removable, on every poll surface. */}
      <AdvisoryBanner />

      <h2 style={{ margin: 0 }}>{poll.billTitle}</h2>
      <p className="tiny">
        {poll.issuedBy.name} ·{' '}
        {open ? t('poll.closesIn', { t: countdown(poll.closesAt) }) : t('poll.closed')}
      </p>

      <h3 className="section-title">{t('poll.summary')}</h3>
      <p className="prose">{poll.plainSummary}</p>

      <a className="btn btn--ghost" href={poll.fullTextUrl} target="_blank" rel="noreferrer">
        {t('poll.readFull')} — {poll.fullTextLabel} ↗
      </a>
      <p className="tiny">
        If the summary above and the full text disagree, the full text is the bill. The summary
        is written by the issuing office, and being able to check it is the point of having both.
      </p>

      <button type="button" className="btn btn--ghost" onClick={() => setHowItWorks(true)}>
        ⓘ {t('poll.howItWorks')}
      </button>

      {!verified && <Banner tone="danger">{t('poll.needVerify')}</Banner>}

      {open && verified && (!mine || canEdit) && (
        <>
          <h3 className="section-title">{mine ? t('poll.change') : 'Your answer'}</h3>
          <div className="stack stack--tight" role="radiogroup" aria-label={poll.billTitle}>
            {poll.options.map((option) => {
              const selected = (choice ?? mine?.optionId) === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className="card"
                  onClick={() => { setChoice(option.id); setConfirming(true) }}
                  style={selected ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
                >
                  <span className="card__title" style={{ marginBottom: 0 }}>{option.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {mine && (
        <Banner tone="ok" title="Answer recorded">
          {poll.options.find((o) => o.id === mine.optionId)?.label}
          {canEdit && (
            <> — {t('poll.changeWindow', {
              t: new Date(mine.at + poll.editWindowMs).toLocaleTimeString(),
            })}</>
          )}
        </Banner>
      )}

      {showResults ? (
        <Results pollId={poll.id} mineOptionId={mine?.optionId} />
      ) : (
        <Banner title={t('poll.resultsLocked')}>{t('poll.resultsLockedBody')}</Banner>
      )}

      {topic && (
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => navigate(`/app/discuss/${topic.id}`)}
        >
          {t('discuss.postOpinion')} →
        </button>
      )}

      {confirming && choice && (
        <Modal title={t('poll.confirm')} onClose={() => setConfirming(false)}>
          <p className="prose">
            <strong>{poll.options.find((o) => o.id === choice)?.label}</strong>
          </p>
          <p className="prose">{t('poll.confirmBody')}</p>
          <AdvisoryBanner detail={false} />
          <button type="button" className="btn btn--block" onClick={confirm}>
            {t('action.confirm')}
          </button>
        </Modal>
      )}

      {howItWorks && (
        <Modal title={t('poll.howItWorks')} onClose={() => setHowItWorks(false)}>
          <AdvisoryBanner />
          <p className="prose">
            Your choice is stored under your pseudonym and added to a total. What reaches the
            department is that total — there is no screen on their side that opens a list of
            respondents, because the data that gets there never had one.
          </p>
          <p className="prose">
            Results stay hidden until you have answered, so that what other people picked does
            not steer what you pick. You can change your answer for {Math.round(poll.editWindowMs / 3600000)} hours.
          </p>
          <p className="prose">
            One verified citizen, one response. Answering again replaces your previous answer
            rather than adding to it.
          </p>
        </Modal>
      )}
    </>
  )
}

/* ------------------------------- 4.4 Results ------------------------------ */

function Results({ pollId, mineOptionId }: { pollId: string; mineOptionId?: string }) {
  const t = useT()
  const agg = pollAggregate(pollId)

  return (
    <>
      <h3 className="section-title">{t('poll.results')}</h3>
      <Bars buckets={agg.buckets} total={agg.total} highlightKey={mineOptionId} />
      <p className="tiny">{agg.total.toLocaleString()} responses · {t('common.aggregateOnly')}</p>

      {agg.coverage && (
        <div className="banner">
          <p className="banner__title">{t('poll.coverage')}</p>
          <p>
            {agg.coverage.responded.toLocaleString()} of{' '}
            {agg.coverage.eligible.toLocaleString()} eligible people —{' '}
            <strong>{(coverageRate(agg.coverage) * 100).toFixed(1)}%</strong>. Of those,{' '}
            {agg.coverage.reachable.toLocaleString()} have an account here at all.
          </p>
          <p className="tiny">
            This is a sample of people who own a smartphone and chose to use it. It is not the
            ward, and reading it as the ward would be a mistake — which is why the number is
            printed here rather than buried.
          </p>
        </div>
      )}

      <PrincipleNote>
        Breakdowns smaller than five responses are suppressed. A result reading "four people in
        your lane, all opposed" is not a statistic, it is a pointing finger.
      </PrincipleNote>
    </>
  )
}
