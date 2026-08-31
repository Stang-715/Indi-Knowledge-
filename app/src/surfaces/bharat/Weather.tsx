import { useState } from 'react'
import SectionSwitch from './SectionSwitch'
import FigureValue from './Figure'
import ScreenState from '../../components/chowk/ScreenState'
import { currentState, setCurrentState } from './state-context'
import { listStates, weatherFor } from '../../data/repo'
import { useT } from '../../i18n'
import './bharat.css'

/**
 * 2.3 — weather, and what it means for somebody with a field or a lorry.
 *
 * A temperature on its own is dashboard theatre. The advisories are the reason
 * this page exists: a reading is only useful once somebody has said what to do
 * about it, and saying so is a judgement that has to come from the met service
 * rather than from us inventing thresholds.
 *
 * The age on these figures is hours rather than months, which is exactly why
 * they carry it — a weather reading a day old is not slightly worse, it is
 * wrong, and `isStale` marks it as such on the figure itself.
 */
export default function Weather() {
  const t = useT()
  const [code, setCode] = useState(() => currentState())
  const readings = weatherFor(code)

  return (
    <div className="bh">
      <header className="bh__head">
        <h1 className="t-display bh__title">{t('wx.title')}</h1>
      </header>

      <SectionSwitch active="data" />

      <div className="field">
        <label className="field__label" htmlFor="wx-state">{t('bharat.pick')}</label>
        <select id="wx-state" value={code}
          onChange={(e) => { setCurrentState(e.target.value); setCode(e.target.value) }}>
          {listStates().map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      {readings.length === 0 && <ScreenState kind="empty" title={t('wx.none')} />}

      {readings.map((r) => (
        <article key={r.district} className="wx glass">
          <h2 className="wx__district">{r.district}</h2>
          <div className="bh__grid">
            <FigureValue of={r.temperature} label={t('wx.temp')} size="lead" />
            <FigureValue of={r.rainfall24h} label={t('wx.rain')} size="lead" />
            <FigureValue of={r.humidity} label={t('wx.humidity')} size="lead" />
          </div>

          {r.advisories.length > 0 && (
            <>
              <h3 className="bh__h3">{t('wx.advisories')}</h3>
              <ul className="wx__adv">
                {r.advisories.map((a) => (
                  <li key={a.kind} className={`wx__adv-item wx__adv-item--${a.kind}`}>
                    <span className="wx__adv-kind">{t(`wx.kind.${a.kind}`)}</span>
                    <span className="wx__adv-text">{a.text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      ))}
    </div>
  )
}
