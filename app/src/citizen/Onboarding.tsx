import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../core/session'
import { useI18n, LANGUAGES } from '../i18n'
import { COLLECTED, NOT_COLLECTED, PRINCIPLES } from '../core/principles'
import { suggestPseudonym, validatePseudonym } from '../core/identity'
import { LOCALITY_CATALOGUE } from '../data/seed'
import type { StatedLocality } from '../core/prefs'
import type { LocaleCode } from '../core/types'
import { Banner, PrincipleNote, Switch } from '../components/ui'
import Sarathi from '../caricature/Sarathi'

type Step = 'welcome' | 'language' | 'verify' | 'locality' | 'pseudonym' | 'privacy' | 'a11y'

const ORDER: Step[] = ['welcome', 'language', 'verify', 'locality', 'pseudonym', 'privacy', 'a11y']

export default function Onboarding() {
  const { t } = useI18n()
  const session = useSession()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')

  const index = ORDER.indexOf(step)
  const next = () => setStep(ORDER[Math.min(index + 1, ORDER.length - 1)])
  const back = () => setStep(ORDER[Math.max(index - 1, 0)])

  const finish = () => {
    session.completeOnboarding()
    navigate('/app', { replace: true })
  }

  return (
    <div className="shell">
      <header className="topbar">
        {index > 0 && (
          <button type="button" className="topbar__icon" onClick={back} aria-label={t('nav.back')}>
            ←
          </button>
        )}
        <h1 className="topbar__title">{t('app.name')}</h1>
        <span className="tiny" aria-label={`Step ${index + 1} of ${ORDER.length}`}>
          {index + 1}/{ORDER.length}
        </span>
      </header>

      <main className="shell__main" id="main">
        {step === 'welcome' && <Welcome onNext={next} />}
        {step === 'language' && <Language onNext={next} />}
        {step === 'verify' && <Verify onNext={next} />}
        {step === 'locality' && <LocalityStep onNext={next} />}
        {step === 'pseudonym' && <PseudonymStep onNext={next} />}
        {step === 'privacy' && <Privacy onNext={next} />}
        {step === 'a11y' && <Accessibility onNext={finish} />}
      </main>
      <div />
    </div>
  )
}

/* ------------------------------- 1.1 Welcome ------------------------------ */

function Welcome({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const { prefs } = useSession()
  return (
    <>
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <Sarathi
          mood="happy"
          speaking={false}
          still={prefs.a11y.reduceMotion}
          size={210}
          label={`${t('home.charName')}, ${t('home.charRole')}`}
        />
      </div>
      <h2 style={{ margin: 0 }}>{t('onboard.welcome.title')}</h2>
      <p className="prose">{t('onboard.welcome.body')}</p>
      <button type="button" className="btn btn--block" onClick={onNext}>
        {t('action.getStarted')}
      </button>
      <p className="tiny">{t('app.tagline')}</p>
    </>
  )
}

/* ------------------------------ 1.2 Language ------------------------------ */

function Language({ onNext }: { onNext: () => void }) {
  const { t, locale } = useI18n()
  const { setLocale } = useSession()

  const choose = (code: LocaleCode) => {
    setLocale(code) // applies app-wide immediately, per spec
    onNext()
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.lang.title')}</h2>
      <p className="muted">{t('onboard.lang.body')}</p>
      <div className="stack">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className="card"
            onClick={() => choose(lang.code)}
            aria-current={locale === lang.code ? 'true' : undefined}
            lang={lang.code}
          >
            <span className="card__title" style={{ marginBottom: 2 }}>{lang.endonym}</span>
            <span className="tiny">{lang.english}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ----------------------------- 1.3 Verification --------------------------- */

function Verify({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const { verify, eligibility } = useSession()
  const [value, setValue] = useState('')
  const [state, setState] = useState<'idle' | 'working' | 'failed'>('idle')
  const [why, setWhy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setState('working')
    // Stand-in for the government ID verification API. In production the raw
    // identifier never reaches this client at all — the service returns a
    // digest and an attestation, and that is all we ever hold.
    await new Promise((r) => setTimeout(r, 700))
    const plausible = value.replace(/\s/g, '').length >= 8
    if (!plausible) {
      setState('failed')
      return
    }
    await verify(value, 'National ID Verification Service')
    setState('idle')
    onNext()
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.verify.title')}</h2>
      <p className="prose">{t('onboard.verify.body')}</p>

      {eligibility?.verified && (
        <Banner tone="ok" title={t('profile.verified')}>
          Verified on {new Date(eligibility.verifiedAt).toLocaleDateString()} by{' '}
          {eligibility.attestedBy}.
        </Banner>
      )}

      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="idnum">
            Government ID number
          </label>
          <input
            id="idnum"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-describedby="idhint"
          />
          <p className="field__hint" id="idhint">
            Hashed the moment it is entered. The number itself is never stored or sent to us.
          </p>
        </div>

        {state === 'failed' && (
          <Banner tone="danger" title={t('onboard.verify.failed')}>
            {t('onboard.verify.failedBody')}
          </Banner>
        )}

        <button type="submit" className="btn btn--block" disabled={state === 'working'}>
          {state === 'working' ? '…' : t('onboard.verify.cta')}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={() => setWhy((w) => !w)}>
          {t('onboard.verify.why')}
        </button>
      </form>

      {why && (
        <PrincipleNote>
          One person should count once. That is the only reason this step exists. It happens
          now and never again — nothing you do afterwards touches your verified identity, and
          what you post or vote on is attached to a pseudonym that cannot be traced back here.
        </PrincipleNote>
      )}
    </>
  )
}

/* ------------------------------ 1.4 Locality ------------------------------ */

function LocalityStep({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const { prefs, setLocalities } = useSession()
  const [moves, setMoves] = useState(prefs.movesForWork)
  const [chosen, setChosen] = useState<StatedLocality[]>(prefs.localities)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return LOCALITY_CATALOGUE
    return LOCALITY_CATALOGUE.filter((l) =>
      `${l.label} ${l.district} ${l.state}`.toLowerCase().includes(q),
    )
  }, [query])

  const toggle = (loc: StatedLocality) => {
    setChosen((current) => {
      const has = current.some((c) => c.id === loc.id)
      if (has) return current.filter((c) => c.id !== loc.id)
      if (!moves) return [{ ...loc }]
      return [...current, { ...loc, workLocality: current.length > 0 }]
    })
  }

  const save = () => {
    setLocalities(chosen, moves)
    onNext()
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.locality.title')}</h2>
      <p className="prose">{t('onboard.locality.body')}</p>

      <Switch
        name={t('onboard.locality.moves')}
        hint={t('onboard.locality.movesHelp')}
        checked={moves}
        onChange={(v) => {
          setMoves(v)
          if (!v) setChosen((c) => c.slice(0, 1))
        }}
      />

      <div className="field">
        <label className="field__label" htmlFor="locsearch">
          Ward or district
        </label>
        <input
          id="locsearch"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a ward, district or state"
        />
      </div>

      <div className="stack stack--tight">
        {results.map((loc) => {
          const on = chosen.some((c) => c.id === loc.id)
          return (
            <button
              key={loc.id}
              type="button"
              className="card"
              onClick={() => toggle(loc)}
              aria-pressed={on}
              style={on ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
            >
              <span className="card__title" style={{ marginBottom: 2 }}>{loc.label}</span>
              <span className="tiny">{loc.district} · {loc.state}</span>
            </button>
          )
        })}
      </div>

      <button type="button" className="btn btn--block" onClick={save} disabled={chosen.length === 0}>
        {t('action.continue')}
      </button>

      <PrincipleNote>
        This is a stated field, like a postal address. The app does not read your device
        location — not now, not in the background, not at all. If you move, you change this
        yourself.
      </PrincipleNote>
    </>
  )
}

/* ----------------------------- 1.5 Pseudonym ------------------------------ */

function PseudonymStep({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const { choosePseudonym } = useSession()
  const [value, setValue] = useState(() => suggestPseudonym())
  const [touched, setTouched] = useState(false)

  const error = touched ? validatePseudonym(value) : null
  const messages: Record<string, string> = {
    tooShort: 'At least 4 characters.',
    tooLong: 'At most 24 characters.',
    badChars: 'Letters, numbers, hyphen and underscore only.',
  }

  const save = () => {
    setTouched(true)
    if (validatePseudonym(value)) return
    choosePseudonym(value.trim())
    onNext()
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.pseudonym.title')}</h2>
      <p className="prose">{t('onboard.pseudonym.body')}</p>

      <div className="field">
        <label className="field__label" htmlFor="pseud">
          {t('profile.pseudonym')}
        </label>
        <input
          id="pseud"
          type="text"
          value={value}
          autoComplete="off"
          onChange={(e) => {
            setValue(e.target.value)
            setTouched(true)
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'pseuderr' : undefined}
        />
        {error && (
          <p className="field__hint" id="pseuderr" style={{ color: 'var(--danger)' }}>
            {messages[error]}
          </p>
        )}
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={() => { setValue(suggestPseudonym()); setTouched(false) }}
      >
        {t('onboard.pseudonym.suggest')}
      </button>
      <button type="button" className="btn btn--block" onClick={save}>
        {t('action.continue')}
      </button>

      <PrincipleNote>
        Your verified identity is stored in one place and this name in another, and there is
        no code path joining them. Nobody — not a moderator, not a department, not a court
        order served on us — can turn this name back into yours, because the record that
        would allow it does not exist.
      </PrincipleNote>
    </>
  )
}

/* ------------------------- 1.6 Privacy disclosure ------------------------- */

function Privacy({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const [read, setRead] = useState(false)

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.privacy.title')}</h2>

      <ul className="tickList">
        {NOT_COLLECTED.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="section-title">{t('onboard.privacy.collected')}</h3>
      <ul className="tickList tickList--keep">
        {COLLECTED.map((row) => (
          <li key={row.field}>
            <span>
              <strong>{row.field}</strong> — {row.why}.{' '}
              <span className="tiny">
                {row.seenByGov ? 'Visible publicly under your pseudonym.' : 'Never seen by a government account.'}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="section-title">Why these cannot be changed later</h3>
      <div className="stack stack--tight">
        {PRINCIPLES.map((p) => (
          <div key={p.id} className="card">
            <p className="card__title">{p.title}</p>
            <p className="card__body">{p.statement}</p>
          </div>
        ))}
      </div>

      <div
        onScroll={() => setRead(true)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <button type="button" className="btn btn--block" onClick={onNext} onFocus={() => setRead(true)}>
        {t('action.understand')}
      </button>
      <p className="tiny">{read ? '' : ''}</p>
    </>
  )
}

/* --------------------------- 1.7 Accessibility ---------------------------- */

function Accessibility({ onNext }: { onNext: () => void }) {
  const { t } = useI18n()
  const { prefs } = useSession()
  const a11y = prefs.a11y

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('onboard.a11y.title')}</h2>
      <p className="muted">{t('onboard.a11y.body')}</p>
      <A11yControls />
      <button type="button" className="btn btn--block" onClick={onNext}>
        {t('action.continue')}
      </button>
      <p className="tiny">
        Text is currently at {Math.round(a11y.textScale * 100)}% of the standard size.
      </p>
    </>
  )
}

/** Shared by onboarding (1.7) and settings (6.x) so the two cannot drift. */
export function A11yControls() {
  const { setA11y, prefs } = useSession()
  const a11y = prefs.a11y
  const scales: (1 | 1.15 | 1.3 | 1.6)[] = [1, 1.15, 1.3, 1.6]

  return (
    <div className="stack">
      <div className="field">
        <span className="field__label" id="scalelabel">Text size</span>
        <div className="row" role="group" aria-labelledby="scalelabel">
          {scales.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={a11y.textScale === s}
              onClick={() => setA11y({ textScale: s })}
            >
              {s === 1 ? 'Standard' : `${Math.round(s * 100)}%`}
            </button>
          ))}
        </div>
      </div>

      <Switch
        name="High contrast"
        hint="Black on white, heavier borders, no shadows."
        checked={a11y.highContrast}
        onChange={(v) => setA11y({ highContrast: v })}
      />
      <Switch
        name="Reduce motion"
        hint="Stops the character's movement and all transitions."
        checked={a11y.reduceMotion}
        onChange={(v) => setA11y({ reduceMotion: v })}
      />
      <Switch
        name="Screen reader mode"
        hint="Verbose labelling, no ambient animation, no auto-scrolling."
        checked={a11y.screenReaderMode}
        onChange={(v) => setA11y({ screenReaderMode: v })}
      />
      <Switch
        name="Low bandwidth"
        hint="Drops images and attachments; notices arrive as text. Pages you have opened stay readable offline."
        checked={a11y.lowBandwidth}
        onChange={(v) => setA11y({ lowBandwidth: v })}
      />
      <Switch
        name="Read answers aloud"
        hint="Sarathi speaks his replies using your device's own voice. Off by default — a phone that talks unprompted is not always safe."
        checked={a11y.voiceOut}
        onChange={(v) => setA11y({ voiceOut: v })}
      />
    </div>
  )
}
