import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { BCP47, DICTS } from './strings'
import type { LocaleCode } from '../core/types'

export type Translate = (key: string, vars?: Record<string, string | number>) => string

interface I18nValue {
  locale: LocaleCode
  t: Translate
  bcp47: string
}

const I18nContext = createContext<I18nValue | null>(null)

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  )
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: LocaleCode
  children: ReactNode
}) {
  const t = useCallback<Translate>(
    (key, vars) => {
      const value = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key
      return interpolate(value, vars)
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, t, bcp47: BCP47[locale] ?? 'en-IN' }),
    [locale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function useT(): Translate {
  return useI18n().t
}

export { LANGUAGES } from './strings'
