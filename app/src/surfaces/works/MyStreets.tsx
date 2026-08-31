import { useMemo, useState } from 'react'
import SectionSwitch from './SectionSwitch'
import WorkCard from './WorkCard'
import ScreenState from '../../components/chowk/ScreenState'
import { alertsOnFollowed, streetSuggestions, worksOnFollowed } from '../../data/repo'
import { useSession } from '../../core/session'
import { useT } from '../../i18n'
import './works.css'

/**
 * 4.5 — what is happening on my road, and when it ends.
 *
 * This is the screen the whole surface is for, and the one where the location
 * temptation is sharpest: a coordinate would answer it without the citizen
 * typing anything.
 *
 * It is answered by asking. The streets are typed, stored on this device, and
 * matched here — the filter runs locally against a local list, so no list of
 * the streets somebody cares about is ever sent anywhere. That list is a home
 * address written down slowly, and the fact that it would be convenient to hold
 * it on a server is exactly why it is not held on one.
 */
export default function MyStreets() {
  const t = useT()
  const { prefs, toggleStreet } = useSession()
  const [draft, setDraft] = useState('')

  const followed = prefs.followedStreets
  const suggestions = useMemo(() => streetSuggestions(draft), [draft])
  const works = useMemo(() => worksOnFollowed(followed), [followed])
  const alerts = useMemo(() => alertsOnFollowed(followed), [followed])
  const alertIds = new Set(alerts.map((a) => a.id))

  const add = (name: string, locality?: string) => {
    toggleStreet(name, locality)
    setDraft('')
  }

  return (
    <div className="wk">
      <header className="wk__head">
        <h1 className="t-display wk__title">{t('works.mine.title')}</h1>
        <p className="wk__tagline">{t('works.mine.local')}</p>
      </header>

      <SectionSwitch active="mine" />

      <div className="field wk__search">
        <label className="field__label" htmlFor="wk-street">{t('works.mine.add')}</label>
        <input id="wk-street" type="search" value={draft} autoComplete="off"
          onChange={(e) => setDraft(e.target.value)} />
        <p className="field__hint">{t('works.mine.addHint')}</p>
      </div>

      {suggestions.length > 0 && (
        <div className="wk__list">
          {suggestions.map((s) => (
            <button key={s.id} type="button" className="street glass glass--press"
              onClick={() => add(s.street, s.locality)}>
              <span className="street__name">{s.street}</span>
              <span className="street__where">{s.locality} · {s.district}</span>
              <span className="street__act">{t('works.mine.follow')}</span>
            </button>
          ))}
        </div>
      )}

      {followed.length === 0 ? (
        <p className="wk__none">{t('works.mine.none')}</p>
      ) : (
        <>
          <p className="t-label wk__label">{t('works.mine.following')}</p>
          <ul className="street__chips">
            {followed.map((s) => (
              <li key={s.id}>
                <button type="button" className="chip is-on"
                  onClick={() => toggleStreet(s.name)}
                  aria-label={`${t('works.mine.unfollow')} — ${s.name}`}>
                  {s.name} ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* The notification tier, shown on the screen it would fire from. A tier
          that only exists in a settings list is a tier nobody understands. */}
      {alerts.length > 0 && prefs.notifications.followedStreets && (
        <>
          <h2 className="wk__h2 wk__h2--alert">{t('works.mine.alerts')}</h2>
          <div className="wk__list">
            {alerts.map((w) => <WorkCard key={w.id} work={w} />)}
          </div>
        </>
      )}

      {followed.length > 0 && (
        works.length === 0
          ? <ScreenState kind="empty" title={t('works.mine.nothing')} />
          : (
            <>
              <h2 className="wk__h2">{t('works.title')}</h2>
              <div className="wk__list">
                {works.filter((w) => !alertIds.has(w.id) || !prefs.notifications.followedStreets)
                  .map((w) => <WorkCard key={w.id} work={w} />)}
              </div>
            </>
          )
      )}
    </div>
  )
}
