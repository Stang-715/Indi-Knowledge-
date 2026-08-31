import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ScreenState from '../../components/chowk/ScreenState'
import SectionSwitch from './SectionSwitch'
import { ProvenanceChip, SourceFallback } from './Sourced'
import {
  constituenciesFromStatedLocalities, findConstituencies, getConstituency,
  representativeFor, votingRecord,
} from '../../data/repo'
import { useSession } from '../../core/session'
import { useT } from '../../i18n'
import './bills.css'

/**
 * 3.5 — your constituency, and how the seat was voted.
 *
 * This is the screen every other civic app solves with a location permission,
 * and the one place in Chowk where the temptation is strongest: a coordinate
 * would answer it in one tap and be right nearly every time.
 *
 * It is not available here, and not because a setting is switched off. There is
 * no device-location call anywhere in this codebase and the build fails if one
 * appears. What this screen has instead is a search box and the district the
 * citizen typed into settings — a stated fact, which they can correct, and
 * which reveals nothing about where they were at the time.
 */
export default function Constituency() {
  const t = useT()
  const { prefs } = useSession()
  const [query, setQuery] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)

  const districts = prefs.localities.map((l) => l.district)
  const suggested = useMemo(
    () => constituenciesFromStatedLocalities(districts),
    [districts.join('|')],   // eslint-disable-line react-hooks/exhaustive-deps
  )
  const results = useMemo(() => findConstituencies(query), [query])
  const searching = query.trim().length >= 2

  const seat = chosen ? getConstituency(chosen) : null

  if (seat) {
    return (
      <div className="bl">
        <button type="button" className="bl__back" onClick={() => setChosen(null)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {t('seat.change')}
        </button>
        <Seat id={seat.id} />
      </div>
    )
  }

  return (
    <div className="bl">
      <header className="bl__head">
        <h1 className="t-display bl__title">{t('seat.title')}</h1>
        <p className="bl__tagline">{t('seat.noLocation')}</p>
      </header>

      <SectionSwitch active="constituency" />

      <div className="field bl__search">
        <label className="field__label" htmlFor="seat-q">{t('seat.find')}</label>
        <input id="seat-q" type="search" value={query} autoComplete="off"
          onChange={(e) => setQuery(e.target.value)} />
        <p className="field__hint">{t('seat.findHint')}</p>
      </div>

      {searching && (
        results.length === 0
          ? <ScreenState kind="empty" title={t('seat.noMatch')} />
          : <List items={results} onPick={setChosen} />
      )}

      {!searching && (
        <>
          <p className="t-label bl__disputed">{t('seat.suggested')}</p>
          {suggested.length === 0
            ? <p className="bl__none">{t('seat.noStated')}</p>
            : <List items={suggested} onPick={setChosen} />}
        </>
      )}
    </div>
  )
}

function List({
  items, onPick,
}: {
  items: { id: string; name: string; state: string; districts: string[] }[]
  onPick: (id: string) => void
}) {
  return (
    <div className="bl__list">
      {items.map((c) => (
        <button key={c.id} type="button" className="seat glass-dark glass--press"
          onClick={() => onPick(c.id)}>
          <span className="seat__name">{c.name}</span>
          <span className="seat__where">{c.state} · {c.districts.join(', ')}</span>
        </button>
      ))}
    </div>
  )
}

/** The seat itself: who holds it, and how they voted where a division was called. */
function Seat({ id }: { id: string }) {
  const t = useT()
  const seat = getConstituency(id)
  const rep = representativeFor(id)
  if (!seat) return <ScreenState kind="empty" />

  return (
    <>
      <header className="bl__head">
        <h1 className="bl__billtitle">{seat.name}</h1>
        <p className="bl__cite">{seat.state} · {seat.districts.join(', ')}</p>
      </header>

      <section className="bl__block">
        <h2 className="bl__h2">{t('seat.rep')}</h2>
        {rep ? (
          <>
            <SourceFallback of={rep} />
            <article className="rep glass-dark">
              <p className="rep__name">{rep.name}</p>
              <p className="rep__party">{rep.party}</p>
              <p className="rep__since">
                {t('seat.since', { d: new Date(rep.since).getFullYear().toString() })}
              </p>
              <ProvenanceChip of={rep} />
            </article>
          </>
        ) : (
          <p className="bl__none">{t('state.empty')}</p>
        )}
      </section>

      {rep && (
        <section className="bl__block">
          <h2 className="bl__h2">{t('seat.record')}</h2>
          <p className="bl__note">{t('seat.recordNote')}</p>
          <div className="bl__list">
            {votingRecord(rep.id).map(({ bill, record }) => {
              const position = record?.position ?? 'not-recorded'
              return (
                <Link key={bill.id} to={`/s/bills/b/${bill.id}`} className="vr glass-dark glass--press">
                  <span className="vr__bill">{bill.title}</span>
                  <span className={`vr__pos vr__pos--${position}`}>
                    {t(`seat.vote.${position}`)}
                  </span>
                  {record?.divisionNumber && (
                    <span className="vr__div">
                      {t('seat.division', { n: record.divisionNumber })}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
