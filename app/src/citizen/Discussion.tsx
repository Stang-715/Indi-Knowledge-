import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import {
  addPost, listPosts, listTopics, getTopic, myReaction, react, reactionDelta,
} from '../data/repo'
import { SORT_MODES, sortPosts, stanceMix, type SortMode } from '../core/ranking'
import { checkLimit, POST_LIMIT, recordUse } from '../core/ratelimit'
import { getPseudonym } from '../core/identity'
import { BackBar, Banner, Modal, PrincipleNote, timeAgo } from '../components/ui'
import { ReportFlow } from './Notices'
import type { Stance } from '../core/types'

const MAX_CHARS = 600

const STANCES: Stance[] = ['support', 'oppose', 'mixed', 'question']

/* ------------------------------ 5.1 Topic list ---------------------------- */

export function TopicList() {
  const t = useT()
  const topics = listTopics()

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('feed.discussions')}</h2>
      <p className="muted">
        Every discussion is attached to a specific notice or bill. There is no general forum —
        a place to argue about everything becomes a place to decide nothing.
      </p>
      <div className="stack">
        {topics.map((topic) => {
          const posts = listPosts(topic.id)
          const mix = stanceMix(posts)
          return (
            <Link key={topic.id} to={`/app/discuss/${topic.id}`} className="card">
              <span className="card__title">{topic.title}</span>
              <span className="card__meta">
                <span>{posts.filter((p) => !p.removed).length} posts</span>
                <span>·</span>
                <span>{mix.support} support</span>
                <span>·</span>
                <span>{mix.oppose} oppose</span>
                <span>·</span>
                <span>{timeAgo(topic.createdAt, t)}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

/* ----------------------------- 5.2 Thread view ---------------------------- */

export function ThreadView() {
  const t = useT()
  const { id = '' } = useParams()
  const topic = getTopic(id)

  const [mode, setMode] = useState<SortMode>('balanced')
  const [composing, setComposing] = useState(false)
  const [reporting, setReporting] = useState<string | null>(null)
  const [tick, force] = useState(0)

  const posts = useMemo(() => listPosts(id), [id, tick])
  const ordered = sortPosts(posts, mode)
  const removedCount = posts.filter((p) => p.removed).length
  const me = getPseudonym()

  if (!topic) {
    return (
      <>
        <BackBar title={t('feed.discussions')} to="/app/discuss" />
        <p className="empty">This discussion is no longer available.</p>
      </>
    )
  }

  const anchorHref =
    topic.anchor.kind === 'poll'
      ? `/app/polls/${topic.anchor.id}`
      : `/app/notices/${topic.anchor.id}`

  return (
    <>
      <BackBar title={t('feed.discussions')} to="/app/discuss" />
      <h2 style={{ margin: 0 }}>{topic.title}</h2>
      <Link to={anchorHref} className="chip tap" style={{ justifySelf: 'start' }}>
        {topic.anchor.kind === 'poll' ? 'Open the bill →' : 'Open the notice →'}
      </Link>

      {/* 5.5 Sort / filter */}
      <div className="row" role="group" aria-label="Sort discussion">
        {SORT_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className="chip"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            {t(m.labelKey)}
          </button>
        ))}
      </div>

      {mode === 'balanced' && (
        <p className="tiny">✦ {t('discuss.balancedOn')}</p>
      )}

      <button type="button" className="btn btn--block" onClick={() => setComposing(true)}>
        {t('discuss.postOpinion')}
      </button>

      <div className="stack">
        {ordered.map((post) => {
          const counts = reactionDelta(post)
          const mineReaction = myReaction(post.id)
          return (
            <article key={post.id} className="card">
              <div className="spread">
                <span className="card__meta">
                  <strong>{post.authorPseudonym}</strong>
                  {post.authorPseudonym === me && <span className="badge">You</span>}
                  <span className={`badge badge--${post.stance === 'oppose' ? 'critical' : post.stance === 'support' ? 'verified' : ''}`}>
                    {t(`discuss.stance.${post.stance}`)}
                  </span>
                </span>
                <span className="tiny">{timeAgo(post.createdAt, t)}</span>
              </div>

              <p className="prose" style={{ marginTop: 'var(--s2)' }}>{post.body}</p>

              <div className="row" style={{ marginTop: 'var(--s3)' }}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={mineReaction === 'agree'}
                  onClick={() => { react(post.id, 'agree'); force((n) => n + 1) }}
                >
                  ▲ {t('discuss.agree')} {counts.agree}
                </button>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={mineReaction === 'disagree'}
                  onClick={() => { react(post.id, 'disagree'); force((n) => n + 1) }}
                >
                  ▼ {t('discuss.disagree')} {counts.disagree}
                </button>
                <button type="button" className="chip" onClick={() => setReporting(post.id)}>
                  {t('action.report')}
                </button>
              </div>
            </article>
          )
        })}

        {/* Removed posts stay in the thread, marked, rather than vanishing. */}
        {posts.filter((p) => p.removed).map((post) => (
          <article key={post.id} className="card surface-alt">
            <p className="muted" style={{ margin: 0 }}>
              ⌀ {t('discuss.removed')} — {post.removed?.reason}
            </p>
          </article>
        ))}
      </div>

      {removedCount > 0 && (
        <PrincipleNote>
          {removedCount === 1 ? 'One post has' : `${removedCount} posts have`} been removed from
          this thread. They stay listed above with the moderator's reason rather than
          disappearing — a thread that silently loses posts is a thread you cannot reason about,
          and the count is published on the oversight layer either way.
        </PrincipleNote>
      )}

      {composing && (
        <Compose
          topicId={id}
          onClose={() => setComposing(false)}
          onPosted={() => { setComposing(false); force((n) => n + 1) }}
        />
      )}

      {reporting && (
        <ReportFlow
          target={{ kind: 'post', id: reporting }}
          onClose={() => setReporting(null)}
        />
      )}
    </>
  )
}

/* ------------------------------- 5.3 Compose ------------------------------ */

function Compose({
  topicId, onClose, onPosted,
}: {
  topicId: string
  onClose: () => void
  onPosted: () => void
}) {
  const t = useT()
  const [body, setBody] = useState('')
  const [stance, setStance] = useState<Stance>('mixed')
  const limit = checkLimit('post', POST_LIMIT)
  const me = getPseudonym()

  const submit = () => {
    const text = body.trim()
    if (text.length === 0 || !limit.allowed) return
    addPost(topicId, text, stance)
    recordUse('post', POST_LIMIT)
    onPosted()
  }

  const left = MAX_CHARS - body.length

  return (
    <Modal title={t('discuss.postOpinion')} onClose={onClose}>
      <p className="tiny">Posting as <strong>{me}</strong></p>

      <div className="field">
        <span className="field__label" id="stancelabel">{t('discuss.stance')}</span>
        <div className="row" role="radiogroup" aria-labelledby="stancelabel">
          {STANCES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={stance === s}
              className="chip"
              onClick={() => setStance(s)}
            >
              {t(`discuss.stance.${s}`)}
            </button>
          ))}
        </div>
        <p className="field__hint">
          Tagging your position is what makes the balanced ordering possible — it is how the
          thread knows to show a reader someone who disagrees with them.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="postbody">Your opinion</label>
        <textarea
          id="postbody"
          value={body}
          maxLength={MAX_CHARS}
          onChange={(e) => setBody(e.target.value)}
          aria-describedby="charcount"
        />
        <p className="field__hint" id="charcount" aria-live="polite">
          {t('discuss.charsLeft', { n: left })}
        </p>
      </div>

      {!limit.allowed && (
        <Banner tone="danger">
          {t('discuss.rateLimited', {
            t: `in ${Math.ceil(limit.retryAfterMs / 60000)} minutes`,
          })}
        </Banner>
      )}

      <button
        type="button"
        className="btn btn--block"
        onClick={submit}
        disabled={body.trim().length === 0 || !limit.allowed}
      >
        {t('action.post')}
      </button>

      <p className="tiny">
        {limit.remaining} of {POST_LIMIT.max} posts left this hour. The limit is not about you —
        it is what makes a coordinated flood expensive.
      </p>
    </Modal>
  )
}
