import { Link, useParams } from 'react-router-dom'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import StageRail from './StageRail'
import VotePanel, { DebateLink } from './VotePanel'
import { ProvenanceChip, SourceFallback, SourceLink } from './Sourced'
import { getBill } from '../../data/repo'
import { disputedClauses, readable, type Bill, type Clause } from '../../core/legislation'
import { useT } from '../../i18n'
import './bills.css'

/**
 * 3.2 — one bill, read before it is answered.
 *
 * The order on this screen is the argument: what it is, where it has got to,
 * what it does in plain words, then the clauses, and only then the box that
 * takes a view. Putting the vote at the top would make it a poll about a title.
 *
 * When the source could not be read, none of that is shown. There is no partial
 * render of a bill here — a plain summary written from a half-parsed document
 * is a lie with a citation, so the screen shows the link to the original and
 * stops.
 */
export default function BillDetail() {
  const t = useT()
  const { id = '' } = useParams()
  const bill = getBill(id)

  if (!bill) {
    return (
      <div className="bl">
        <BackToPipeline />
        <ScreenState kind="empty" />
      </div>
    )
  }

  const disputed = disputedClauses(bill)
  const rest = bill.clauses.filter((c) => !c.disputed)

  return (
    <div className="bl">
      <BackToPipeline />

      <header className="bl__head">
        <h1 className="bl__billtitle">{bill.title}</h1>
        <p className="bl__cite">
          {bill.citation} · {t(`bills.house.${bill.house}`)} · {bill.ministry}
        </p>
        <ProvenanceChip of={bill} />
      </header>

      <SourceFallback of={bill} />

      {readable(bill) && (
        <>
          <section className="bl__block">
            <h2 className="bl__h2">{t('bills.history')}</h2>
            <StageRail bill={bill} labelled />
            <ol className="hist">
              {bill.history.map((event) => (
                <li key={`${event.stage}-${event.at}`} className="hist__item">
                  <span className="hist__stage">{t(`bills.stage.${event.stage}`)}</span>
                  <span className="hist__date">
                    {new Date(event.at).toLocaleDateString(undefined, {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  {event.note && <span className="hist__note">{event.note}</span>}
                </li>
              ))}
            </ol>
          </section>

          <section className="bl__block">
            <h2 className="bl__h2">{t('bills.summary')}</h2>
            {bill.plainSummary
              ? <p className="bl__prose">{bill.plainSummary}</p>
              : <p className="bl__none">{t('bills.noSummary')}</p>}
            <SourceLink of={bill} />
          </section>

          <section className="bl__block">
            <h2 className="bl__h2">{t('bills.clauses')}</h2>

            {bill.clauses.length === 0 && (
              <p className="bl__none">{t('bills.clausesNone')}</p>
            )}

            {disputed.length > 0 && (
              <>
                <p className="t-label bl__disputed">{t('bills.disputed')}</p>
                {disputed.map((c) => <ClauseCard key={c.id} clause={c} bill={bill} />)}
              </>
            )}

            {rest.map((c) => <ClauseCard key={c.id} clause={c} bill={bill} />)}
          </section>
        </>
      )}

      {bill.pollId
        ? <VotePanel pollId={bill.pollId} />
        : <p className="bl__none">{t('bills.noPoll')}</p>}

      {bill.topicId && <DebateLink topicId={bill.topicId} />}
    </div>
  )
}

/**
 * A clause, opened where you are standing.
 *
 * Plain words first and the drafted text underneath, because the reader came to
 * find out what it does — but the text is on the same screen rather than behind
 * a link, so checking the paraphrase against the clause costs one scroll rather
 * than a trip to a PDF.
 */
function ClauseCard({ clause, bill }: { clause: Clause; bill: Bill }) {
  const t = useT()
  return (
    <Disclosure
      icon={<span className="clause__num">{clause.number}</span>}
      title={clause.heading}
      meta={clause.disputed ? t('bills.disputedTag') : (clause.plain ? t('bills.inPlain') : t('bills.asDrafted'))}
      defaultOpen={Boolean(clause.disputed)}
    >
      {clause.plain && (
        <>
          <p className="t-label clause__label">{t('bills.inPlain')}</p>
          <p className="clause__plain">{clause.plain}</p>
        </>
      )}
      <p className="t-label clause__label">{t('bills.asDrafted')}</p>
      <p className="clause__text">{clause.text}</p>
      {clause.amends && (
        <p className="clause__amends">
          <span className="t-label">{t('bills.amends')}</span> {clause.amends}
        </p>
      )}
      <SourceLink of={bill} />
    </Disclosure>
  )
}

function BackToPipeline() {
  const t = useT()
  return (
    <Link to="/s/bills" className="bl__back">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      {t('bills.section.pipeline')}
    </Link>
  )
}
