import type { Provenance, Sourced } from '../../core/legislation'
import { incomplete, lagDays } from '../../core/legislation'
import { useT } from '../../i18n'

/**
 * How a record says where it came from.
 *
 * Bill text and status come from sources that change format without notice.
 * The failure mode to design against is not a crash — it is a bill rendered
 * confidently from a half-successful parse, which is worse than no bill at all
 * because a citizen has no way to tell. So provenance is a visible part of
 * every record on this surface, and `unreadable` has a designed appearance
 * rather than an empty screen: the link to the original, and nothing else.
 */

const TONE: Record<Provenance, string> = {
  official: 'ok',
  partial: 'warn',
  unreadable: 'warn',
  sample: 'note',
}

export function ProvenanceChip({ of }: { of: Sourced }) {
  const t = useT()
  const days = lagDays(of)
  return (
    <span className={`prov prov--${TONE[of.provenance]}`}>
      <span className="prov__what">{t(`bills.prov.${of.provenance}`)}</span>
      <span className="prov__when">
        {days === 0 ? t('bills.readToday') : t('bills.readAt', { n: String(days) })}
      </span>
    </span>
  )
}

/** The link to the original. Always available, whatever else is shown. */
export function SourceLink({ of }: { of: Sourced }) {
  const t = useT()
  return (
    <a className="btn btn--glass btn--sm src__link" href={of.sourceUrl}
      target="_blank" rel="noreferrer noopener">
      {t('bills.source')}
      <span className="src__name">{of.sourceName}</span>
    </a>
  )
}

/**
 * Shown wherever content is missing or uncertain. This is the degradation path
 * the phase plan asks for: a link to the source rather than something wrong.
 */
export function SourceFallback({ of }: { of: Sourced }) {
  const t = useT()
  if (!incomplete(of) && of.provenance !== 'sample') return null
  return (
    <aside className={`srcfall srcfall--${TONE[of.provenance]}`} role="note">
      <p className="srcfall__title">{t(`bills.prov.${of.provenance}`)}</p>
      <p className="srcfall__body">{t(`bills.prov.${of.provenance}Body`)}</p>
      <SourceLink of={of} />
    </aside>
  )
}
