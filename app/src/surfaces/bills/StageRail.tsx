import type { Bill, Stage } from '../../core/legislation'
import { ENDED, STAGES, hasEnded, stageIndex } from '../../core/legislation'
import { useT } from '../../i18n'

/**
 * Where a bill is, as a shape rather than a word.
 *
 * The pipeline is the one thing about legislation that is genuinely simple and
 * almost never shown simply. Five steps, filled up to where the bill has
 * reached — so a reader learns the sequence by seeing it repeated on every
 * bill, and can tell at a glance that a bill in committee is nowhere near law.
 */
export default function StageRail({ bill, labelled = false }: { bill: Bill; labelled?: boolean }) {
  const t = useT()
  const ended = hasEnded(bill)
  const reached = ended ? -1 : stageIndex(bill.stage)

  return (
    <div className="rail" role="img"
      aria-label={t(`bills.stage.${bill.stage}`)}>
      {ENDED.includes(bill.stage) ? (
        <span className="rail__ended">{t(`bills.stage.${bill.stage}`)}</span>
      ) : (
        STAGES.map((stage: Stage, i) => (
          <span
            key={stage}
            className={`rail__step${i <= reached ? ' is-done' : ''}${i === reached ? ' is-here' : ''}`}
          >
            <span className="rail__dot" aria-hidden="true" />
            {labelled && <span className="rail__label">{t(`bills.stage.${stage}`)}</span>}
          </span>
        ))
      )}
    </div>
  )
}
