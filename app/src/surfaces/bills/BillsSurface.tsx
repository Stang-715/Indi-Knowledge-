import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import StageRail from './StageRail'
import SectionSwitch from './SectionSwitch'
import { ProvenanceChip } from './Sourced'
import { endedBills, pipeline, searchBills } from '../../data/repo'
import { useT } from '../../i18n'
import type { Bill } from '../../core/legislation'
import './bills.css'

/**
 * Surface 3 — Bills.
 *
 * 3.1 the pipeline. The room is meant to read as a well-run reading room:
 * quiet, ordered, and impossible to mistake for a ballot. So the front page is
 * a list of what is in front of Parliament and how far it has got — not a wall
 * of things to vote on. Voting is downstream of reading, deliberately, and the
 * interface makes the reading the main event.
 */
export default function BillsSurface() {
  const t = useT()
  const [query, setQuery] = useState('')

  const stages = useMemo(() => pipeline(), [])
  const ended = useMemo(() => endedBills(), [])
  const results = useMemo(() => searchBills(query), [query])
  const searching = query.trim().length >= 2

  return (
    <div className="bl">
      <header className="bl__head">
        <h1 className="t-display bl__title">{t('bills.title')}</h1>
        <p className="bl__tagline">{t('bills.tagline')}</p>
      </header>

      <SectionSwitch active="pipeline" />

      <div className="field bl__search">
        <label className="field__label" htmlFor="bl-q">{t('bills.search')}</label>
        <input id="bl-q" type="search" value={query} autoComplete="off"
          onChange={(e) => setQuery(e.target.value)} />
        <p className="field__hint">{t('bills.searchHint')}</p>
      </div>

      {searching ? (
        results.length === 0
          ? <ScreenState kind="empty" title={t('bills.noResults')} />
          : <div className="bl__list">{results.map((b) => <BillCard key={b.id} bill={b} />)}</div>
      ) : (
        <>
          <div className="bl__stages">
            {stages.map(({ stage, bills }) => (
              <Disclosure
                key={stage}
                icon={<StageDot />}
                title={t(`bills.stage.${stage}`)}
                meta={String(bills.length)}
                defaultOpen={bills.length > 0}
              >
                {bills.length === 0
                  ? <p className="bl__none">{t('bills.stage.none')}</p>
                  : bills.map((b) => <BillCard key={b.id} bill={b} />)}
              </Disclosure>
            ))}
          </div>

          {ended.length > 0 && (
            <Disclosure
              icon={<StageDot muted />}
              title={t('bills.ended')}
              meta={t('bills.endedMeta')}
            >
              {ended.map((b) => <BillCard key={b.id} bill={b} />)}
            </Disclosure>
          )}
        </>
      )}
    </div>
  )
}

function StageDot({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" opacity={muted ? 0.55 : 1}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  )
}

export function BillCard({ bill }: { bill: Bill }) {
  const t = useT()
  return (
    <Link to={`/s/bills/b/${bill.id}`} className="bc glass glass--press">
      <span className="bc__title">{bill.title}</span>
      <span className="bc__meta">
        <span>{bill.citation}</span>
        <span aria-hidden="true">·</span>
        <span>{t(`bills.house.${bill.house}`)}</span>
      </span>
      <StageRail bill={bill} />
      <span className="bc__foot">
        <span className="bc__ministry">{bill.ministry}</span>
        <ProvenanceChip of={bill} />
      </span>
    </Link>
  )
}
