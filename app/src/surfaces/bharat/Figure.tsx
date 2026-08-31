import { ageDays, formatFigure, formatPeriod, isStale, type Figure } from '../../core/figures'
import { useI18n } from '../../i18n'

/**
 * The only component that prints a number.
 *
 * Surface 2's exit criterion is that every number can name its source and its
 * age, and no figure ships without both. `core/figures.ts` makes a number
 * un-constructable without them; this is where that becomes visible. Nothing
 * else on this surface formats a value, and the constraint check fails the
 * build if another file starts doing it.
 *
 * The period is printed at the same size as the label rather than tucked into a
 * tooltip, because the failure this surface is designed against is not a wrong
 * number — it is a right number from four months ago, shown as though it were
 * today's. A figure past its useful life is marked; the mark is on the figure,
 * not on the page, since a page carries figures of very different ages.
 */

interface Props {
  of: Figure
  label: string
  /** Large enough to be the point of the tile, or inline in a row. */
  size?: 'lead' | 'row'
}

export default function FigureValue({ of, label, size = 'row' }: Props) {
  const { bcp47, t } = useI18n()
  const stale = isStale(of)
  const days = ageDays(of)

  return (
    <div className={`fig fig--${size}${stale ? ' is-stale' : ''}`}>
      <span className="fig__label">{label}</span>
      <span className="fig__value">{formatFigure(of, bcp47)}</span>
      <span className="fig__period">
        {formatPeriod(of, bcp47)}
        {days > 0 && (
          <span className="fig__age">
            {' · '}
            {t('fig.age', { n: String(days) })}
          </span>
        )}
      </span>
      <a className="fig__source" href={of.sourceUrl} target="_blank" rel="noreferrer noopener">
        {of.source}
      </a>
      {of.provenance === 'sample' && (
        <span className="fig__sample">{t('fig.sample')}</span>
      )}
      {of.method && <span className="fig__method">{of.method}</span>}
      {stale && <span className="fig__stalemark">{t('fig.stale')}</span>}
    </div>
  )
}

/** A figure with no chrome, for use inside a sentence that supplies the context. */
export function Inline({ of }: { of: Figure }) {
  const { bcp47 } = useI18n()
  return <span className="fig__inline">{formatFigure(of, bcp47)}</span>
}
