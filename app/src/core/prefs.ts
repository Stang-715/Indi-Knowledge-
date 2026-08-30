/**
 * Citizen preferences: language, localities, accessibility, notifications.
 *
 * Note what is absent. There is no `locationTracking`, no `preciseLocality`,
 * no `shareUsageData`. Locality is a string the citizen typed. The device's
 * geolocation API is not referenced anywhere in this codebase.
 */

import { read, write } from './storage'
import type { LocaleCode, NoticePriority } from './types'

export interface StatedLocality {
  id: string
  label: string
  ward: string
  district: string
  state: string
  /** Set for localities added under "I move for work" (1.4). */
  workLocality?: boolean
}

export interface A11ySettings {
  textScale: 1 | 1.15 | 1.3 | 1.6
  highContrast: boolean
  reduceMotion: boolean
  lowBandwidth: boolean
  /** Turns on verbose labelling and disables the character's ambient motion. */
  screenReaderMode: boolean
  /** The caricature speaking aloud is opt-in, never automatic. */
  voiceOut: boolean
}

export interface NotificationSettings {
  minimumPriority: NoticePriority
  polls: boolean
  replies: boolean
  results: boolean
  quietHours: boolean
}

export interface Prefs {
  locale: LocaleCode
  localities: StatedLocality[]
  movesForWork: boolean
  a11y: A11ySettings
  notifications: NotificationSettings
  onboarded: boolean
  seenNoticeIds: string[]
}

export const DEFAULT_PREFS: Prefs = {
  locale: 'en',
  localities: [],
  movesForWork: false,
  a11y: {
    textScale: 1,
    highContrast: false,
    reduceMotion: false,
    lowBandwidth: false,
    screenReaderMode: false,
    voiceOut: false,
  },
  notifications: {
    // Defaults to everything important, not everything at all (edge case 10).
    minimumPriority: 'important',
    polls: true,
    replies: true,
    results: true,
    quietHours: true,
  },
  onboarded: false,
  seenNoticeIds: [],
}

const KEY = 'prefs'

export function loadPrefs(): Prefs {
  const stored = read<Partial<Prefs>>('prefs', KEY, {})
  return {
    ...DEFAULT_PREFS,
    ...stored,
    a11y: { ...DEFAULT_PREFS.a11y, ...(stored.a11y ?? {}) },
    notifications: { ...DEFAULT_PREFS.notifications, ...(stored.notifications ?? {}) },
    localities: stored.localities ?? [],
    seenNoticeIds: stored.seenNoticeIds ?? [],
  }
}

export function savePrefs(prefs: Prefs): void {
  write('prefs', KEY, prefs)
}

export const PRIORITY_RANK: Record<NoticePriority, number> = {
  routine: 0,
  important: 1,
  'time-critical': 2,
}

export function passesNotificationFilter(
  priority: NoticePriority,
  settings: NotificationSettings,
): boolean {
  return PRIORITY_RANK[priority] >= PRIORITY_RANK[settings.minimumPriority]
}
