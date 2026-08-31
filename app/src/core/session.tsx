import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_PREFS, loadPrefs, savePrefs, type A11ySettings, type NotificationSettings, type Prefs, type StatedLocality } from './prefs'
import {
  eraseEverything, getEligibility, getVoice, recordVerification, setPseudonym,
  type AgeBand, type EligibilityRecord, type VoiceRecord,
} from './identity'
import type { LocaleCode } from './types'

interface SessionValue {
  prefs: Prefs
  eligibility: EligibilityRecord | null
  voice: VoiceRecord | null

  setLocale: (locale: LocaleCode) => void
  setA11y: (patch: Partial<A11ySettings>) => void
  setNotifications: (patch: Partial<NotificationSettings>) => void
  setLocalities: (localities: StatedLocality[], movesForWork?: boolean) => void
  completeOnboarding: () => void
  markNoticeSeen: (id: string) => void

  verify: (rawIdentifier: string, attestedBy: string, ageBand?: AgeBand) => Promise<void>
  choosePseudonym: (value: string) => void
  deleteAccount: () => void
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [eligibility, setEligibility] = useState<EligibilityRecord | null>(() => getEligibility())
  const [voice, setVoice] = useState<VoiceRecord | null>(() => getVoice())

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch }
      savePrefs(next)
      return next
    })
  }, [])

  /* Apply accessibility settings to the document itself, so they survive route
     changes and reach third-party content too. */
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--text-scale', String(prefs.a11y.textScale))
    // A custom property cannot be matched in a selector, so the scale is also an
    // attribute — components that must restructure at large text read this.
    root.dataset.text = prefs.a11y.textScale >= 1.3 ? 'large' : 'normal'
    root.dataset.contrast = prefs.a11y.highContrast ? 'high' : 'normal'
    root.dataset.motion =
      prefs.a11y.reduceMotion || prefs.a11y.screenReaderMode ? 'reduced' : 'full'
    root.dataset.bandwidth = prefs.a11y.lowBandwidth ? 'low' : 'full'
    root.lang = prefs.locale
  }, [prefs.a11y, prefs.locale])

  /* Respect the OS-level motion preference without needing to be asked. */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (mq?.matches && !prefs.a11y.reduceMotion) {
      update({ a11y: { ...prefs.a11y, reduceMotion: true } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<SessionValue>(
    () => ({
      prefs,
      eligibility,
      voice,
      setLocale: (locale) => update({ locale }),
      setA11y: (patch) => update({ a11y: { ...prefs.a11y, ...patch } }),
      setNotifications: (patch) =>
        update({ notifications: { ...prefs.notifications, ...patch } }),
      setLocalities: (localities, movesForWork) =>
        update({
          localities,
          movesForWork: movesForWork ?? prefs.movesForWork,
        }),
      completeOnboarding: () => update({ onboarded: true }),
      markNoticeSeen: (id) =>
        update({
          seenNoticeIds: prefs.seenNoticeIds.includes(id)
            ? prefs.seenNoticeIds
            : [...prefs.seenNoticeIds, id],
        }),
      verify: async (rawIdentifier, attestedBy, ageBand = 'unknown') => {
        const record = await recordVerification(rawIdentifier, attestedBy, ageBand)
        setEligibility(record)
      },
      choosePseudonym: (v) => setVoice(setPseudonym(v)),
      deleteAccount: () => {
        eraseEverything()
        setEligibility(null)
        setVoice(null)
        setPrefs(DEFAULT_PREFS)
      },
    }),
    [prefs, eligibility, voice, update],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
