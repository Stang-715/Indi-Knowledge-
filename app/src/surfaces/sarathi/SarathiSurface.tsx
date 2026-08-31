import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from './Stage'
import VoiceSettings from './VoiceSettings'
import ScreenState from '../../components/chowk/ScreenState'
import { useSpeechInput } from './useSpeechInput'
import { handoffFrom, stashHandoff, type Handoff } from './handoff'
import { useOnline } from './offline'
import {
  answerFor, ask, featuredPrompts, greeting, promptFor, type Answer, type Mood,
} from '../../caricature/brain'
import { cancelSpeech, speak, speechAvailable } from '../../caricature/speech'
import { useSession } from '../../core/session'
import { useI18n } from '../../i18n'
import { getPseudonym } from '../../core/identity'
import { useIsland, useSurfaceAction } from '../shell-context'
import { useContentTint } from '../../components/chowk/useContentTint'
import './sarathi.css'

interface Turn {
  id: string
  who: 'citizen' | 'sarathi'
  text: string
}

const REVEAL_MS_PER_CHAR = 13

/**
 * Surface 1 — Sarathi.
 *
 * 1.1 stage · 1.2 open talk · 1.3 suggested asks · 1.4 handoff
 * 1.5 voice and language · 1.6 offline
 *
 * He is rule-matched rather than a model call, deliberately: he runs offline on
 * a cheap handset, cannot be steered by anything typed at him, and every
 * sentence he says about privacy is one a person wrote and can be held to.
 */
export default function SarathiSurface() {
  const { t, bcp47 } = useI18n()
  const { prefs } = useSession()
  const navigate = useNavigate()
  const island = useIsland()
  const { register } = useSurfaceAction()
  const online = useOnline()

  const still = prefs.a11y.reduceMotion || prefs.a11y.screenReaderMode
  const voiceOut = prefs.a11y.voiceOut && speechAvailable()

  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState<string[]>([])
  const [mood, setMood] = useState<Mood>('happy')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [draft, setDraft] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // The log is the largest glass panel on the surface, so it is the one where
  // sampling the ground beneath is most visible as you scroll.
  const logTint = useContentTint(logRef, { strength: 0.3 })
  const seq = useRef(0)
  const nextId = () => { seq.current += 1; return `t${seq.current}` }

  /* ---------------------------- 1.2 delivery ---------------------------- */

  const deliver = useCallback((answer: Answer, question: string) => {
    setMood(answer.mood)
    setSuggestions([])
    setHandoff(null)
    // brain.ts holds structure and returns catalogue keys; the prose is resolved
    // here, so his answers translate like every other string in the app.
    setPending(answer.say.map((key) => t(key, { name: getPseudonym() ?? '' })))
    setSpeaking(true)

    // Chips and the handoff appear only once he has finished, so they do not
    // compete with the sentence still arriving.
    const settle = still
      ? 0
      : answer.say.reduce((n, k) => n + t(k).length, 0) * REVEAL_MS_PER_CHAR + 260
    window.setTimeout(() => {
      setSuggestions(answer.followUps ?? [])
      setHandoff(handoffFrom(answer, question))
    }, settle)
  }, [still, t])

  /* Drain paragraph by paragraph so he reads as talking rather than pasting. */
  useEffect(() => {
    if (pending.length === 0) { setSpeaking(false); return undefined }
    const [head, ...rest] = pending
    const commit = () => {
      setTurns((c) => [...c, { id: nextId(), who: 'sarathi', text: head }])
      setPending(rest)
    }
    if (voiceOut) {
      speak(head, bcp47, commit)
      return () => cancelSpeech()
    }
    const delay = still ? 110 : Math.min(2600, 360 + head.length * REVEAL_MS_PER_CHAR)
    const timer = window.setTimeout(commit, delay)
    return () => window.clearTimeout(timer)
  }, [pending, voiceOut, bcp47, still])

  const put = useCallback((question: string, answer: Answer) => {
    cancelSpeech()
    setTurns((c) => [...c, { id: nextId(), who: 'citizen', text: question }])
    deliver(answer, question)
  }, [deliver])

  const askText = useCallback((question: string) => {
    const text = question.trim()
    if (!text) return
    put(text, ask(text, getPseudonym()))
  }, [put])

  /* ------------------------- 1.2 voice input --------------------------- */

  const mic = useSpeechInput(bcp47, askText)

  /* ------------------------- opening greeting -------------------------- */

  useEffect(() => {
    deliver(greeting(getPseudonym()), '')
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

  /* The island's contextual action on this surface puts the cursor in the box. */
  useEffect(() => {
    register(() => inputRef.current?.focus())
    return () => register(null)
  }, [register])

  /* 1.6 — say it plainly the moment the connection drops, and say what still works. */
  useEffect(() => {
    if (online) { island.dismiss(); return }
    island.raise({
      id: 'offline',
      hue: '#E8991F',
      label: t('sar.island.offline'),
      value: t('sar.island.offlineValue'),
      eyebrow: t('sar.island.offlineEyebrow'),
      title: t('sar.island.offlineTitle'),
      actions: [
        { label: t('sar.island.whatElse'), primary: true, onSelect: () => setSettingsOpen(true) },
      ],
    }, 'pill')
  }, [online, island, t])

  const chip = (id: string) => put(t(promptFor(id)), answerFor(id))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = draft.trim()
    if (!q) return
    setDraft('')
    askText(q)
  }

  const jump = () => {
    if (!handoff) return
    stashHandoff(handoff)
    cancelSpeech()
    navigate(handoff.to)
  }

  const chips = suggestions.length > 0 ? suggestions : featuredPrompts().map((f) => f.id)

  return (
    <div className="sar">
      {/* ---------------------------- 1.1 stage --------------------------- */}
      <div className="sar__stage">
        <Stage
          mood={mood}
          speaking={speaking}
          listening={mic.state === 'listening'}
          still={still}
          size={200}
          label={`${t('home.charName')}, ${t('home.charRole')}`}
          onPoke={() => chip('who')}
        />
        <div className="sar__id">
          <h1 className="t-display sar__name">{t('home.charName')}</h1>
          <p className="sar__role">{t('home.charRole')}</p>
        </div>
        <button
          type="button"
          className="btn btn--glass btn--sm sar__settings"
          onClick={() => setSettingsOpen(true)}
        >
          {t('sar.settings')}
        </button>
      </div>

      {/* 1.6 — the stale state, said plainly. An app that goes quiet when the
          signal drops reads as an app that is broken. */}
      {!online && (
        <ScreenState
          kind="stale"
          title={t('sar.offline.title')}
          body={t('sar.offline.body')}
        />
      )}

      {/* --------------------------- 1.2 the talk ------------------------- */}
      <div
        className="sar__log glass-dark"
        ref={logRef}
        style={logTint ? ({ ['--glass-tint' as string]: logTint }) : undefined}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={t('home.greeting')}
      >
        {turns.map((turn) => (
          <p key={turn.id} className={`sar__line sar__line--${turn.who}`}>
            <span className="sar__who">
              {turn.who === 'sarathi' ? t('home.charName') : (getPseudonym() ?? 'You')}
            </span>
            {turn.text}
          </p>
        ))}

        {mic.interim && (
          <p className="sar__line sar__line--citizen sar__line--interim">
            <span className="sar__who">{t('sar.hearing')}</span>
            {mic.interim}
          </p>
        )}

        {pending.length > 0 && !still && (
          <p className="sar__typing" aria-hidden="true"><span /><span /><span /></p>
        )}
      </div>

      {/* --------------------------- 1.4 handoff -------------------------- */}
      {handoff && (
        <button type="button" className="btn btn--hue sar__jump" onClick={jump}>
          {handoff.label}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {/* ------------------------ 1.3 suggested asks ---------------------- */}
      <div className="sar__chips">
        <p className="t-label sar__chips-label" id="sar-suggest">{t('home.suggestions')}</p>
        <div className="sar__chip-row" role="group" aria-labelledby="sar-suggest">
          {chips.map((id) => (
            <button key={id} type="button" className="chip chip--glass" onClick={() => chip(id)}>
              {t(promptFor(id))}
            </button>
          ))}
        </div>
      </div>

      {/* --------------------------- ask box + mic ------------------------ */}
      <form className="sar__ask" onSubmit={submit}>
        <label className="sr-only" htmlFor="sar-input">{t('home.inputLabel')}</label>
        <input
          id="sar-input"
          ref={inputRef}
          className="sar__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('home.placeholder')}
          autoComplete="off"
          enterKeyHint="send"
        />

        {mic.state !== 'unavailable' && (
          <button
            type="button"
            className={`sar__mic${mic.state === 'listening' ? ' is-live' : ''}`}
            onClick={() => (mic.state === 'listening' ? mic.stop() : mic.start())}
            aria-label={mic.state === 'listening' ? t('sar.mic.stop') : t('sar.mic.start')}
            aria-pressed={mic.state === 'listening'}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        )}

        <button type="submit" className="sar__send">{t('home.send')}</button>
      </form>

      {mic.state === 'denied' && (
        <p className="sar__mic-note">{t('sar.mic.denied')}</p>
      )}

      <VoiceSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        micAvailable={mic.state !== 'unavailable'}
        online={online}
      />
    </div>
  )
}
