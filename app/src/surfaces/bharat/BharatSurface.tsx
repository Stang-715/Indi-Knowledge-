import { useMemo, useState } from 'react'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import SectionSwitch from './SectionSwitch'
import FigureValue from './Figure'
import { currentState, setCurrentState } from './state-context'
import { listStates, sourcesUsed, stateProfile } from '../../data/repo'
import { useT } from '../../i18n'
import './bharat.css'

/**
 * Surface 2 — Bharat. 2.1 the state picker, 2.2 the state profile.
 *
 * An almanac you trust: dense, and never showing off. The density is the point
 * — this is the one surface where a person arrives wanting numbers rather than
 * an answer — and the discipline that makes density safe is that every number
 * is a `Figure`, which cannot exist without naming its source and the period it
 * describes.
 *
 * The timeline is the dates a person from the state would name, not a summary
 * paragraph. A profile that reads like an encyclopaedia entry is a profile
 * nobody from the place recognises.
 */
export default function BharatSurface() {
  const t = useT()
  const [code, setCode] = useState(() => currentState())
  const states = listStates()
  const profile = stateProfile(code)
  const sources = useMemo(() => sourcesUsed(code), [code])

  const pick = (next: string) => {
    setCurrentState(next)
    setCode(next)
  }

  return (
    <div className="bh">
      <header className="bh__head">
        <h1 className="t-display bh__title">{t('bharat.title')}</h1>
        <p className="bh__tagline">{t('bharat.tagline')}</p>
      </header>

      <SectionSwitch active="state" />

      <div className="field">
        <label className="field__label" htmlFor="bh-state">{t('bharat.pick')}</label>
        <select id="bh-state" value={code} onChange={(e) => pick(e.target.value)}>
          {states.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
        <p className="field__hint">{t('bharat.pickHint')}</p>
      </div>

      {!profile ? <ScreenState kind="empty" /> : (
        <>
          <section className="bh__block">
            <dl className="bh__facts">
              <dt>{t('state.formed')}</dt>
              <dd>{profile.formedOn}</dd>
              <dt>{t('state.capital')}</dt>
              <dd>{profile.capital}{profile.seats ? ` — ${profile.seats}` : ''}</dd>
              <dt>{t('state.languages')}</dt>
              <dd>{profile.languages.join(', ')}</dd>
            </dl>
          </section>

          <section className="bh__grid">
            <FigureValue of={profile.districts} label={t('state.districts')} size="lead" />
            <FigureValue of={profile.lokSabhaSeats} label={t('state.lok')} size="lead" />
            <FigureValue of={profile.assemblySeats} label={t('state.assembly')} size="lead" />
          </section>

          <section className="bh__block">
            <h2 className="bh__h2">{t('state.timeline')}</h2>
            <ol className="tl">
              {profile.timeline.map((m) => (
                <li key={`${m.year}-${m.what.slice(0, 12)}`} className="tl__item">
                  <span className="tl__year">{m.year}</span>
                  <span className="tl__what">{m.what}</span>
                </li>
              ))}
            </ol>
          </section>

          <Disclosure
            icon={<span className="bh__num">§</span>}
            title={t('bharat.sources')}
            meta={String(sources.length)}
          >
            <p className="bh__note">{t('bharat.sourcesBody')}</p>
            <ul className="bh__sources">
              {sources.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer noopener">{s.name}</a>
                </li>
              ))}
            </ul>
          </Disclosure>
        </>
      )}
    </div>
  )
}
