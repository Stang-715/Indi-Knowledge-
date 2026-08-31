import { useState } from 'react'
import SectionSwitch from './SectionSwitch'
import FigureValue from './Figure'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import { currentState, setCurrentState } from './state-context'
import { brandsFor, flowsFor, listStates, portsFor } from '../../data/repo'
import { yearOnYear } from '../../core/figures'
import type { Sector } from '../../core/bharat'
import { useT } from '../../i18n'
import './bharat.css'

const SECTORS: Sector[] = ['export-house', 'electric-vehicle', 'battery', 'components']

/**
 * 2.4 — agriculture and export. 2.5 — the directory.
 *
 * The year-on-year change is derived rather than stored, and `derive` carries
 * the older period and the weaker provenance of the two figures behind it. That
 * matters more than it sounds: a change computed from an official figure and a
 * sample one would otherwise be presented as official, which is how a number
 * launders itself.
 *
 * Destination shares are figures too, not decoration. "31% to the Netherlands"
 * is a claim about somebody's trade and it carries the period it describes.
 */
export default function Trade() {
  const t = useT()
  const [code, setCode] = useState(() => currentState())
  const [sector, setSector] = useState<Sector | 'all'>('all')

  const flows = flowsFor(code)
  const ports = portsFor(code)
  const brands = brandsFor(code, sector === 'all' ? undefined : sector)

  return (
    <div className="bh">
      <header className="bh__head">
        <h1 className="t-display bh__title">{t('trade.title')}</h1>
      </header>

      <SectionSwitch active="trade" />

      <div className="field">
        <label className="field__label" htmlFor="tr-state">{t('bharat.pick')}</label>
        <select id="tr-state" value={code}
          onChange={(e) => { setCurrentState(e.target.value); setCode(e.target.value) }}>
          {listStates().map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      {flows.length === 0 && <ScreenState kind="empty" title={t('trade.none')} />}

      {flows.map((f) => {
        const change = yearOnYear(f.volume, f.volumeLastYear)
        return (
          <article key={f.id} className="fl glass">
            <h2 className="fl__name">{f.commodity}</h2>
            <p className="fl__period">{t('trade.period')}: {f.period}</p>

            <div className="bh__grid">
              <FigureValue of={f.volume} label={t('trade.volume')} size="lead" />
              <FigureValue of={f.value} label={t('trade.value')} size="lead" />
              {change && <FigureValue of={change} label={t('trade.yoy')} size="lead" />}
            </div>

            <h3 className="bh__h3">{t('trade.destinations')}</h3>
            <div className="fl__dest">
              {f.destinations.map((d) => (
                <FigureValue key={d.country} of={d.share} label={d.country} />
              ))}
            </div>
          </article>
        )
      })}

      {ports.length > 0 && (
        <section className="bh__block">
          <h2 className="bh__h2">{t('trade.ports')}</h2>
          {ports.map((p) => (
            <article key={p.port} className="fl glass">
              <h3 className="fl__name">{p.port}</h3>
              <p className="fl__period">{t('trade.period')}: {p.period}</p>
              <div className="bh__grid">
                <FigureValue of={p.containers} label={t('trade.containers')} size="lead" />
                <FigureValue of={p.cargo} label={t('trade.cargo')} size="lead" />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* 2.5 — the directory sits under trade because that is what it is about. */}
      <section className="bh__block">
        <h2 className="bh__h2">{t('dir.title')}</h2>

        <div className="bh__chips" role="group" aria-label={t('dir.title')}>
          <button type="button" className="chip" aria-pressed={sector === 'all'}
            onClick={() => setSector('all')}>{t('dir.all')}</button>
          {SECTORS.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={sector === s}
              onClick={() => setSector(s)}>{t(`dir.sector.${s}`)}</button>
          ))}
        </div>

        {brands.length === 0
          ? <p className="bh__none">{t('dir.none')}</p>
          : brands.map((b) => (
            <Disclosure
              key={b.id}
              icon={<span className="bh__num">{b.town.slice(0, 2).toUpperCase()}</span>}
              title={b.name}
              meta={t(`dir.sector.${b.sector}`)}
            >
              <p className="bh__prose">{b.what}</p>
              <p className="bh__note">
                {b.town}
                {b.since ? ` · ${t('dir.since', { y: String(b.since) })}` : ''}
              </p>
              <p className="bh__sample">{b.sourceName}</p>
              <a className="btn btn--ghost btn--sm" href={b.sourceUrl}
                target="_blank" rel="noreferrer noopener">
                {b.sourceName}
              </a>
            </Disclosure>
          ))}
      </section>
    </div>
  )
}
