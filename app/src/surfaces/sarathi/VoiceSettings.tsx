import Sheet from '../../components/chowk/Sheet'
import Segmented from '../../components/chowk/Segmented'
import { useSession } from '../../core/session'
import { LANGUAGES, useI18n } from '../../i18n'
import { speechAvailable } from '../../caricature/speech'
import { OFFLINE_CAPABILITIES } from './offline'
import type { LocaleCode } from '../../i18n/locales'

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
 *
 * The language list shows all twenty-two scheduled languages with their real
 * translation status attached. Listing a language and then serving English is
 * worse than admitting the gap, and under the DPDP Rules the consent notice has
 * to reach every one of them eventually — so the gap is a roadmap, not a
 * blemish to hide.
 */
export default function VoiceSettings({ open, onClose, micAvailable, online }: Props) {
  const { locale, t } = useI18n()
  const { prefs, setLocale, setA11y } = useSession()
  const a11y = prefs.a11y
  const canSpeak = speechAvailable()

  const scales = [
    { id: '1', label: t('set.scale.standard') },
    { id: '1.15', label: '115%' },
    { id: '1.3', label: '130%' },
    { id: '1.6', label: '160%' },
  ]

  const active = LANGUAGES.find((l) => l.code === locale)

  return (
    <Sheet title={t('sar.settings')} open={open} onClose={onClose}>
      <section className="stack">
        <p className="t-label">{t('set.language')}</p>
        <div className="field">
          <label className="sr-only" htmlFor="sar-lang">{t('set.language')}</label>
          <select
            id="sar-lang"
            value={locale}
            onChange={(e) => setLocale(e.target.value as LocaleCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.endonym} — {l.english}</option>
            ))}
          </select>
          {active && active.status !== 'complete' && (
            <p className="field__hint">
              {active.status === 'partial'
                ? t('set.translationPartial')
                : t('set.translationPending')}
            </p>
          )}
          <p className="field__hint">{t('set.languageHint')}</p>
        </div>
      </section>

      <section className="stack">
        <p className="t-label">{t('set.speech')}</p>

        <label className="switch tap">
          <span className="switch__text">
            <span className="switch__name">{t('set.readAloud')}</span>
            <span className="t-tiny">
              {canSpeak ? t('set.readAloudOn') : t('set.readAloudOff')}
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

        <p className="t-tiny">{micAvailable ? t('set.micNote') : t('set.micNone')}</p>
      </section>

      <section className="stack">
        <p className="t-label">{t('set.reading')}</p>
        <Segmented
          label={t('set.textSize')}
          value={String(a11y.textScale)}
          options={scales}
          onChange={(v) => setA11y({ textScale: Number(v) as 1 | 1.15 | 1.3 | 1.6 })}
        />

        <label className="switch tap">
          <span className="switch__text">
            <span className="switch__name">{t('set.reduceMotion')}</span>
            <span className="t-tiny">{t('set.reduceMotionHint')}</span>
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
            <span className="switch__name">{t('set.contrast')}</span>
            <span className="t-tiny">{t('set.contrastHint')}</span>
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
        <p className="t-label">{online ? t('set.offlineIf') : t('set.offlineNow')}</p>
        <ul className="cap">
          {OFFLINE_CAPABILITIES.map((c) => (
            <li key={c.key} className={c.works ? 'cap--yes' : 'cap--no'}>
              <span>
                <b>{t(`off.${c.key}`)}</b>
                <em>{t(`off.${c.key}Why`)}</em>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Sheet>
  )
}
