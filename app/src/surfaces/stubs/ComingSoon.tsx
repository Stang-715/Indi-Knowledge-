import { Link } from 'react-router-dom'
import Disclosure from '../../components/chowk/Disclosure'
import './coming-soon.css'

interface Props {
  surface: string
  tagline: string
  /** The sub-pages from the agreed page map, so this reads as a plan not a gap. */
  planned: { code: string; title: string; detail: string }[]
  /** Screens already built that genuinely belong to this surface. */
  existing?: { to: string; label: string; detail: string }[]
}

/**
 * An honest placeholder.
 *
 * It names what is coming, in the order it was agreed, rather than saying
 * "coming soon" — and it links to whatever already exists rather than hiding it.
 */
export default function ComingSoon({ surface, tagline, planned, existing }: Props) {
  return (
    <div className="soon">
      <header className="soon__head">
        <p className="t-label">In development</p>
        <h1 className="t-display soon__title">{surface}</h1>
        <p className="soon__tagline">{tagline}</p>
      </header>

      {existing && existing.length > 0 && (
        <section className="soon__block">
          <p className="t-label">Already working</p>
          <div className="stack">
            {existing.map((e) => (
              <Link key={e.to} to={e.to} className="soon__link glass-dark">
                <span className="soon__link-t">{e.label}</span>
                <span className="soon__link-d">{e.detail}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="soon__block">
        <p className="t-label">Planned</p>
        <div className="stack">
          {planned.map((p) => (
            <Disclosure
              key={p.code}
              icon={<span className="soon__code">{p.code}</span>}
              title={p.title}
              meta="Not built yet"
            >
              <p>{p.detail}</p>
            </Disclosure>
          ))}
        </div>
      </section>
    </div>
  )
}
