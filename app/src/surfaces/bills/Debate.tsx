import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sheet from '../../components/chowk/Sheet'
import Segmented from '../../components/chowk/Segmented'
import ScreenState from '../../components/chowk/ScreenState'
import {
  addPost, canDo, getTopic, listPosts, myReaction, react, reactionDelta,
} from '../../data/repo'
import { SORT_MODES, sortPosts, type SortMode } from '../../core/ranking'
import { getPseudonym } from '../../core/identity'
import type { Stance } from '../../core/types'
import { useT } from '../../i18n'
import './bills.css'

/**
 * 3.6 — debate, in Chowk's own materials.
 *
 * The ordering is the feature. Balanced is the default and it round-robins
 * across positions, so the top of a thread shows disagreement rather than
 * whichever side arrived first or shouted loudest. There is no author term in
 * any of the comparators — no account can be boosted, because there is nowhere
 * in `core/ranking.ts` to put the boost, and the constraint check fails the
 * build if one appears.
 *
 * Removed posts stay in the thread with the reason attached. A thread that
 * silently loses posts is a thread nobody can reason about.
 */
export default function Debate() {
  const t = useT()
  const { id = '' } = useParams()
  const topic = getTopic(id)
  const [mode, setMode] = useState<SortMode>('balanced')
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')
  const [stance, setStance] = useState<Stance>('mixed')
  const [tick, force] = useState(0)

  const me = getPseudonym()
  const posts = useMemo(() => listPosts(id), [id, tick])
  const live = posts.filter((p) => !p.removed)
  const removed = posts.filter((p) => p.removed)
  const ordered = useMemo(() => sortPosts(live, mode), [live, mode])

  if (!topic) {
    return <div className="bl"><ScreenState kind="empty" /></div>
  }

  const post = () => {
    const body = draft.trim()
    if (body.length < 2) return
    addPost(id, body, stance)
    setDraft('')
    setComposing(false)
    force((n) => n + 1)
  }

  return (
    <div className="bl">
      <Link to="/s/bills" className="bl__back">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        {t('bills.section.pipeline')}
      </Link>

      <header className="bl__head">
        <h1 className="bl__billtitle">{topic.title}</h1>
        <p className="bl__cite">{t('debate.title')}</p>
      </header>

      <Segmented
        label={t('debate.title')}
        value={mode}
        onChange={setMode}
        options={SORT_MODES.map((m) => ({ id: m.id, label: t(m.labelKey) }))}
      />

      {mode === 'balanced' && <p className="bl__note">{t('debate.balanced')}</p>}

      {canDo('public-speech') && (
        <button type="button" className="btn btn--hue btn--block"
          onClick={() => setComposing(true)}>
          {t('discuss.postOpinion')}
        </button>
      )}

      {ordered.length === 0 && <ScreenState kind="empty" title={t('debate.empty')} />}

      <div className="bl__list">
        {ordered.map((p) => {
          const counts = reactionDelta(p)
          const mine = myReaction(p.id)
          return (
            <article key={p.id} className="dp glass-dark">
              <p className="dp__who">
                <span className="dp__name">{p.authorPseudonym}</span>
                {p.authorPseudonym === me && <span className="dp__you">{t('common.you')}</span>}
                <span className={`dp__stance dp__stance--${p.stance}`}>
                  {t(`discuss.stance.${p.stance}`)}
                </span>
              </p>
              <p className="dp__body">{p.body}</p>
              <p className="dp__acts">
                <button type="button" className="chip chip--glass" aria-pressed={mine === 'agree'}
                  onClick={() => { react(p.id, 'agree'); force((n) => n + 1) }}>
                  {t('discuss.agree')} {counts.agree}
                </button>
                <button type="button" className="chip chip--glass" aria-pressed={mine === 'disagree'}
                  onClick={() => { react(p.id, 'disagree'); force((n) => n + 1) }}>
                  {t('discuss.disagree')} {counts.disagree}
                </button>
              </p>
            </article>
          )
        })}

        {removed.map((p) => (
          <article key={p.id} className="dp dp--removed">
            <p className="dp__body">{t('discuss.removed')} — {p.removed?.reason}</p>
          </article>
        ))}
      </div>

      <Sheet open={composing} onClose={() => setComposing(false)} title={t('discuss.postOpinion')}>
        <div className="field">
          <label className="field__label" htmlFor="dp-stance">{t('discuss.stance')}</label>
          <div className="dp__stances" id="dp-stance">
            {(['support', 'oppose', 'mixed', 'question'] as Stance[]).map((s) => (
              <button key={s} type="button" className="chip chip--glass" aria-pressed={stance === s}
                onClick={() => setStance(s)}>
                {t(`discuss.stance.${s}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="dp-body">{t('discuss.postOpinion')}</label>
          <textarea id="dp-body" rows={5} value={draft}
            onChange={(e) => setDraft(e.target.value)} />
        </div>
        <button type="button" className="btn btn--hue btn--block" onClick={post}>
          {t('action.post')}
        </button>
      </Sheet>
    </div>
  )
}
