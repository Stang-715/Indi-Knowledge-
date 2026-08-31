import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import WorksMap from './WorksMap'
import WorkCard from './WorkCard'
import SectionSwitch from './SectionSwitch'
import ScreenState from '../../components/chowk/ScreenState'
import { listStretches, liveWorks } from '../../data/repo'
import { useT } from '../../i18n'
import './works.css'

/**
 * Surface 4 — Works, citizen half.
 *
 * The half that needs no departmental buy-in, so the surface has users before
 * it asks institutions for anything. Everything here can be assembled from what
 * authorities already publish; the scheduler, the clash detector and the permit
 * are the other half and are blocked on institutional identity.
 *
 * A site notice board: blunt, factual, dated. Map first, list second, and the
 * date larger than anything else on the card.
 */
export default function WorksSurface() {
  const t = useT()
  const [selected, setSelected] = useState<string | null>(null)

  const stretches = useMemo(() => listStretches(), [])
  const works = useMemo(() => liveWorks(), [])

  // The tapped work floats to the top of the list rather than opening a sheet,
  // so the map and the answer are on screen together.
  const ordered = useMemo(() => {
    if (!selected) return works
    const picked = works.filter((w) => w.id === selected)
    return [...picked, ...works.filter((w) => w.id !== selected)]
  }, [works, selected])

  return (
    <div className="wk">
      <header className="wk__head">
        <h1 className="t-display wk__title">{t('works.title')}</h1>
        <p className="wk__tagline">{t('works.tagline')}</p>
      </header>

      <SectionSwitch active="map" />

      <WorksMap
        stretches={stretches}
        works={works}
        selected={selected}
        onSelect={(id) => setSelected(id === selected ? null : id)}
      />

      {/* "No permit, no dig" is only a rule if the person next to the hole can
          check the permit. The route to do that is on the front of the surface,
          not buried in a menu. */}
      <Link to="/s/works/permit" className="btn btn--ghost btn--block">
        {t('permit.title')}
      </Link>

      <h2 className="wk__h2">{t('works.map.list')}</h2>
      {ordered.length === 0
        ? <ScreenState kind="empty" title={t('works.map.empty')} />
        : <div className="wk__list">{ordered.map((w) => <WorkCard key={w.id} work={w} />)}</div>}
    </div>
  )
}
