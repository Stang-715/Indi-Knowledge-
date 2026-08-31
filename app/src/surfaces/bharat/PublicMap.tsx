import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ScreenState from '../../components/chowk/ScreenState'
import { listStores, listStretches, liveWorks } from '../../data/repo'
import { stateOf } from '../../core/works'
import { useT } from '../../i18n'
import './bharat.css'

/**
 * 2.7 — the public map, with layers.
 *
 * Drawn, not fetched, for the reason Surface 4's map is: a tile request hands a
 * third party the viewer's address and the exact rectangle they are looking at,
 * and no amount of never calling a location API undoes that. The constraint
 * check fails the build if a tile source appears anywhere in the tree.
 *
 * The map shows shops and roadworks. It has never shown a person and there is
 * nothing on it that could become one — a shop's position is where its owner
 * placed a pin on a form about their own business, and a roadwork's is public
 * infrastructure geometry.
 */

const VIEW = 1000

export default function PublicMap() {
  const t = useT()
  const [layers, setLayers] = useState({ stores: true, works: true })
  const [selected, setSelected] = useState<string | null>(null)

  const stretches = useMemo(() => listStretches(), [])
  const works = useMemo(() => liveWorks(), [])
  const stores = useMemo(() => listStores(), [])

  /* A shop without a placed pin still belongs on the map, so it is laid out
     along the bottom band rather than dropped — an entry that vanishes because
     a field was left blank is an entry its owner cannot find. */
  const placed = stores.map((s, i) => ({
    store: s,
    at: s.at ?? { x: 90 + (i % 8) * 110, y: 900 + Math.floor(i / 8) * 44 },
    pinned: Boolean(s.at),
  }))

  const midpoint = (path: { x: number; y: number }[]) => {
    const i = Math.floor((path.length - 1) / 2)
    const a = path[i]
    const b = path[Math.min(i + 1, path.length - 1)]
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  return (
    <div className="bh">
      <Link to="/s/bharat/shops" className="bh__back">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        {t('shop.title')}
      </Link>

      <header className="bh__head">
        <h1 className="t-display bh__title">{t('pmap.title')}</h1>
      </header>

      <div className="bh__chips" role="group" aria-label={t('pmap.layers')}>
        <button type="button" className="chip" aria-pressed={layers.stores}
          onClick={() => setLayers((l) => ({ ...l, stores: !l.stores }))}>
          {t('pmap.layer.stores')}
        </button>
        <button type="button" className="chip" aria-pressed={layers.works}
          onClick={() => setLayers((l) => ({ ...l, works: !l.works }))}>
          {t('pmap.layer.works')}
        </button>
      </div>

      <svg className="pmap" viewBox={`0 0 ${VIEW} ${VIEW}`} role="group"
        aria-label={t('pmap.title')}>
        {stretches.map((s) => (
          <polyline key={s.id} className="pmap__road"
            points={s.path.map((p) => `${p.x},${p.y}`).join(' ')} />
        ))}

        {layers.works && works.map((w) => {
          const stretch = stretches.find((s) => s.id === w.stretchId)
          if (!stretch) return null
          const at = midpoint(stretch.path)
          return (
            <rect key={w.id} className={`pmap__work pmap__work--${stateOf(w)}`}
              x={at.x - 9} y={at.y - 9} width={18} height={18} rx={4}>
              <title>{stretch.street}</title>
            </rect>
          )
        })}

        {layers.stores && placed.map(({ store, at, pinned }) => (
          <g key={store.id} className={`pmap__shop${selected === store.id ? ' is-on' : ''}`}
            transform={`translate(${at.x} ${at.y})`}
            role="button" tabIndex={0}
            aria-label={store.name}
            onClick={() => setSelected(store.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(store.id) }}>
            <circle r={selected === store.id ? 16 : 12}
              className={pinned ? 'pmap__shop-dot' : 'pmap__shop-dot pmap__shop-dot--unplaced'} />
            <title>{store.name}</title>
          </g>
        ))}
      </svg>

      {stores.length === 0 && works.length === 0 && (
        <ScreenState kind="empty" title={t('pmap.empty')} />
      )}

      {selected && (
        <div className="bh__list">
          {stores.filter((s) => s.id === selected).map((s) => (
            <Link key={s.id} to={`/s/bharat/shops/${s.id}`} className="sh glass glass--press">
              <span className="sh__name">{s.name}</span>
              <span className="sh__what">{s.what}</span>
              <span className="sh__where">{s.address}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
