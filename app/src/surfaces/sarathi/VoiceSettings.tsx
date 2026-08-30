import Sheet from '../../components/chowk/Sheet'
import Segmented from '../../components/chowk/Segmented'
import { useSession } from '../../core/session'
import { LANGUAGES, useI18n } from '../../i18n'
import { speechAvailable } from '../../caricature/speech'
import { OFFLINE_CAPABILITIES } from './offline'
import type { LocaleCode } from '../../core/types'

interface Props {
  open: boolean
  onClose: () => void
  micAvailable: boolean
  online: boolean
}

/**
 * 1.5 — voice and language, and the honest half of 1.6.
 *
 * Both speech settings default to off. A phone that starts talking unprompted
 * is not safe in every household, and a microphone that opens without being
 * asked is worse.
 */
export default function VoiceSettings({ open, onClose, micAvailable, online }: Props) {
  const { locale } = useI18n()
  const { prefs, setLocale, setA11y } = useSession()
  const a11y = prefs.a11y
  const canSpeak = speechAvailable()

  const scales: { id: string; label: string }[] = [
    { id: '1', label: 'Standard' },
    { id: '1.15', label: '115%' },
    { id: '1.3', label: '130%' },
    { id: '1.6', label: '160%' },
  ]

  return (
    <Sheet title="Voice &amp; language" open={open} onClose={onClose}>
      <section className="stack">
        <p className="t-label">Language</p>
        <div className="field">
          <label className="sr-only" htmlFor="sar-lang">Language</label>
          <select
            id="sar-lang"
            value={locale}
            onChange={(e) => setLocale(e.target.value as LocaleCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.endonym} — {l.english}</option>
            ))}
          </select>
          <p className="field__hint">
            Sarathi speaks and listens in this language. Where a phrase has not been translated
            yet you will see the English rather than a broken placeholder.
          </p>
        </div>
      </section>

      <section className="stack">
        <p className="t-label">Speech</p>

        <label className="switch tap">
          <span className="switch__text">
            <span className="switch__name">Read answers aloud</span>
            <span className="t-tiny">
              {canSpeak
                ? 'Uses your device’s own voice. Nothing is sent anywhere.'
                : 'This device has no speech voices available.'}
            </span>
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={a11y.voiceOut}
            disabled={!canSpeak}
            onChange={(e) => setA11y({ voiceOut: e.target.checked })}
          />
          <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
        </label>

        <p className="t-tiny">
          {micAvailable
            ? 'Asking by voice uses your browser’s speech engine, which on most desktops means the audio is sent to that vendor to be transcribed. Nothing is stored by this app either way — and typing does exactly the same job.'
            : 'This device has no speech recognition, so the microphone button is hidden. Typing works exactly as well.'}
        </p>
      </section>

      <section className="stack">
        <p className="t-label">Reading</p>
        <Segmented
          label="Text size"
          value={String(a11y.textScale)}
          options={scales}
          onChange={(v) => setA11y({ textScale: Number(v) as 1 | 1.15 | 1.3 | 1.6 })}
        />

        <label className="switch tap">
          <span className="switch__text">
            <span className="switch__name">Reduce motion</span>
            <span className="t-tiny">Stops his blinking, sway and the drifting background.</span>
          </span>
          <input
            type="checkbox" className="sr-only"
            checked={a11y.reduceMotion}
            onChange={(e) => setA11y({ reduceMotion: e.target.checked })}
          />
          <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
        </label>

        <label className="switch tap">
          <span className="switch__text">
            <span className="switch__name">High contrast</span>
            <span className="t-tiny">Black on white, hard borders, no glass and no gradient.</span>
          </span>
          <input
            type="checkbox" className="sr-only"
            checked={a11y.highContrast}
            onChange={(e) => setA11y({ highContrast: e.target.checked })}
          />
          <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
        </label>
      </section>

      <section className="stack">
        <p className="t-label">{online ? 'If you go offline' : 'You are offline'}</p>
        <ul className="cap">
          {OFFLINE_CAPABILITIES.map((c) => (
            <li key={c.label} className={c.works ? 'cap--yes' : 'cap--no'}>
              <span>
                <b>{c.label}</b>
                <em>{c.detail}</em>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Sheet>
  )
}
