import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sarathi from './Sarathi'
import { answerFor, ask, featuredPrompts, greeting, promptFor, type Answer, type Mood } from './brain'
import { cancelSpeech, speak, speechAvailable } from './speech'
import { useSession } from '../core/session'
import { useI18n } from '../i18n'
import { getPseudonym } from '../core/identity'
import './conversation.css'

interface Turn {
  id: string
  who: 'citizen' | 'sarathi'
  text: string
}

const REVEAL_MS_PER_CHAR = 14

export default function Conversation() {
  const { t, bcp47 } = useI18n()
  const { prefs } = useSession()
  const navigate = useNavigate()

  const still = prefs.a11y.reduceMotion || prefs.a11y.screenReaderMode
  const voiceOut = prefs.a11y.voiceOut && speechAvailable()

  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState<string[]>([])
  const [mood, setMood] = useState<Mood>('happy')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [goto, setGoto] = useState<Answer['goto']>(undefined)
  const [speaking, setSpeaking] = useState(false)
  const [draft, setDraft] = useState('')

  const logRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)
  const me = getPseudonym()

  const nextId = () => {
    seq.current += 1
    return `turn_${seq.current}`
  }

  /** Deliver an answer paragraph by paragraph, so he reads as talking rather than pasting. */
  const deliver = useCallback(
    (answer: Answer) => {
      setMood(answer.mood)
      setFollowUps([])
      setGoto(undefined)
      setPending(answer.say)
      setSpeaking(true)
      // Follow-ups appear only once he has finished, so the chips do not
      // compete with the sentence still arriving.
      window.setTimeout(
        () => {
          setFollowUps(answer.followUps ?? [])
          setGoto(answer.goto)
        },
        still ? 0 : answer.say.join(' ').length * REVEAL_MS_PER_CHAR + 260,
      )
    },
    [still],
  )

  /* Drain the pending paragraphs one at a time. */
  useEffect(() => {
    if (pending.length === 0) {
      setSpeaking(false)
      return undefined
    }
    const [head, ...rest] = pending
    const commit = () => {
      setTurns((current) => [...current, { id: nextId(), who: 'sarathi', text: head }])
      setPending(rest)
    }

    if (voiceOut) {
      speak(head, bcp47, commit)
      return () => cancelSpeech()
    }

    const delay = still ? 120 : Math.min(2600, 380 + head.length * REVEAL_MS_PER_CHAR)
    const timer = window.setTimeout(commit, delay)
    return () => window.clearTimeout(timer)
  }, [pending, voiceOut, bcp47, still])

  /* Opening line. */
  useEffect(() => {
    deliver(greeting(getPseudonym()))
    return () => cancelSpeech()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Keep the newest line in view without stealing focus. */
  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: still ? 'auto' : 'smooth',
    })
  }, [turns, still])

  const put = (question: string, answer: Answer) => {
    cancelSpeech()
    setTurns((current) => [...current, { id: nextId(), who: 'citizen', text: question }])
    deliver(answer)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const question = draft.trim()
    if (question.length === 0) return
    setDraft('')
    put(question, ask(question, getPseudonym()))
  }

  const chip = (id: string) => put(promptFor(id), answerFor(id))

  const suggestions = followUps.length > 0 ? followUps : featuredPrompts().map((f) => f.id)

  return (
    <section className="convo" aria-label={t('home.charName')}>
      <div className="convo__stage">
        <Sarathi
          mood={mood}
          speaking={speaking}
          still={still}
          size={230}
          label={`${t('home.charName')}, ${t('home.charRole')}`}
          onPoke={() => chip('who')}
        />
        <div className="convo__intro">
          <h1 className="convo__name">{t('home.charName')}</h1>
          <p className="convo__role">{t('home.charRole')}</p>
        </div>
      </div>

      <div
        className="convo__log"
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={t('home.greeting')}
      >
        {turns.map((turn) => (
          <p
            key={turn.id}
            className={`convo__line convo__line--${turn.who}`}
          >
            <span className="convo__who">
              {turn.who === 'sarathi' ? t('home.charName') : (me ?? 'You')}
            </span>
            {turn.text}
          </p>
        ))}
        {pending.length > 0 && !still && (
          <p className="convo__typing" aria-hidden="true">
            <span /><span /><span />
          </p>
        )}
      </div>

      {goto && (
        <button
          type="button"
          className="convo__goto"
          onClick={() => navigate(goto.to)}
        >
          {goto.label} →
        </button>
      )}

      <div className="convo__chips">
        <p className="convo__chipsLabel" id="convo-suggestions">
          {t('home.suggestions')}
        </p>
        <div className="convo__chipRow" role="group" aria-labelledby="convo-suggestions">
          {suggestions.map((id) => (
            <button key={id} type="button" className="chip" onClick={() => chip(id)}>
              {promptFor(id)}
            </button>
          ))}
        </div>
      </div>

      <form className="convo__ask" onSubmit={submit}>
        <label className="sr-only" htmlFor="convo-input">
          {t('home.inputLabel')}
        </label>
        <input
          id="convo-input"
          className="convo__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('home.placeholder')}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className="convo__send">
          {t('home.send')}
        </button>
      </form>
    </section>
  )
}
