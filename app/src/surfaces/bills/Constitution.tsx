import { useMemo, useState } from 'react'
import Segmented from '../../components/chowk/Segmented'
import Disclosure from '../../components/chowk/Disclosure'
import ScreenState from '../../components/chowk/ScreenState'
import SectionSwitch from './SectionSwitch'
import { ProvenanceChip, SourceLink } from './Sourced'
import { constitution, searchConstitution } from '../../data/repo'
import { useT } from '../../i18n'
import './bills.css'

type Tab = 'parts' | 'articles' | 'schedules' | 'amendments'

/**
 * 3.4 — the Constitution, made findable.
 *
 * Two decisions carry this screen.
 *
 * The first is that everything here is a summary in plain words and never the
 * text of an Article. A paraphrase is what makes a document of 470 Articles
 * searchable by someone who does not already know where to look; presenting one
 * as though it were the law would be worse than not having the screen. So the
 * source link sits on every entry and the note above says which is which.
 *
 * The second is that it is dated and says how much of it is here. A constitution
 * changes rarely, which is exactly why an undated copy goes stale without
 * anybody noticing, and why "showing 24 of about 470" is on the screen rather
 * than in a comment.
 */
export default function Constitution() {
  const t = useT()
  const data = constitution()
  const [tab, setTab] = useState<Tab>('parts')
  const [query, setQuery] = useState('')

  const hits = useMemo(() => searchConstitution(query), [query])
  const searching = query.trim().length >= 2

  return (
    <div className="bl">
      <header className="bl__head">
        <h1 className="t-display bl__title">{t('const.title')}</h1>
        <p className="bl__tagline">{t('const.asOf', { d: data.asOf })}</p>
        <ProvenanceChip of={data} />
      </header>

      <SectionSwitch active="constitution" />

      <div className="field bl__search">
        <label className="field__label" htmlFor="const-q">{t('const.search')}</label>
        <input id="const-q" type="search" value={query} autoComplete="off"
          onChange={(e) => setQuery(e.target.value)} />
        <p className="field__hint">{t('const.searchHint')}</p>
      </div>

      <p className="bl__note">{t('const.gistNote')}</p>

      {searching ? (
        hits.length === 0
          ? <ScreenState kind="empty" />
          : (
            <div className="bl__list">
              {hits.map((hit) => (
                <article key={`${hit.kind}-${hit.id}`} className="ce glass">
                  <h2 className="ce__title">{hit.title}</h2>
                  <p className="ce__detail">{hit.detail}</p>
                </article>
              ))}
            </div>
          )
      ) : (
        <>
          <Segmented
            label={t('const.title')}
            value={tab}
            onChange={setTab}
            options={[
              { id: 'parts', label: t('const.tab.parts') },
              { id: 'articles', label: t('const.tab.articles') },
              { id: 'schedules', label: t('const.tab.schedules') },
              { id: 'amendments', label: t('const.tab.amendments') },
            ]}
          />

          {tab === 'parts' && (
            <>
              <p className="bl__showing">
                {t('const.showing', {
                  n: String(data.parts.length), total: String(data.counts.parts),
                })}
              </p>
              <div className="bl__list">
                {data.parts.map((p) => (
                  <Disclosure
                    key={p.roman}
                    icon={<span className="clause__num">{p.roman}</span>}
                    title={p.title}
                    meta={t('const.articles', { r: p.articleRange })}
                  >
                    <p className="ce__detail">{p.subject}</p>
                  </Disclosure>
                ))}
              </div>
            </>
          )}

          {tab === 'articles' && (
            <>
              <p className="bl__showing">
                {t('const.showing', {
                  n: String(data.articles.length), total: data.counts.articles,
                })}
              </p>
              <div className="bl__list">
                {data.articles.map((a) => (
                  <Disclosure
                    key={a.number}
                    icon={<span className="clause__num">{a.number}</span>}
                    title={a.heading}
                    meta={t('const.part', { p: a.partRoman })}
                  >
                    <p className="ce__detail">{a.gist}</p>
                  </Disclosure>
                ))}
              </div>
            </>
          )}

          {tab === 'schedules' && (
            <div className="bl__list">
              {data.schedules.map((s) => (
                <article key={s.number} className="ce glass">
                  <h2 className="ce__title">{s.title}</h2>
                  <p className="ce__detail">{s.subject}</p>
                </article>
              ))}
            </div>
          )}

          {tab === 'amendments' && (
            <>
              <p className="bl__showing">
                {t('const.showing', {
                  n: String(data.amendments.length), total: String(data.counts.amendments),
                })}
              </p>
              <div className="bl__list">
                {data.amendments.map((a) => (
                  <article key={a.number} className="ce glass">
                    <h2 className="ce__title">{a.shortTitle}</h2>
                    <p className="ce__meta">{a.year}</p>
                    <p className="ce__detail">{a.effect}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <SourceLink of={data} />
    </div>
  )
}
