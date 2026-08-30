import { Link } from 'react-router-dom'
import { useSession } from './core/session'
import { useT } from './i18n'
import Sarathi from './caricature/Sarathi'

/**
 * Surface chooser.
 *
 * These are three separate systems that happen to share a stylesheet. A citizen
 * account has no route into the government portal and no government account can
 * speak as a citizen — presenting them as three doors rather than three tabs is
 * the honest rendering of that.
 */
export default function Landing() {
  const t = useT()
  const { prefs } = useSession()

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="topbar__title">{t('app.name')}</h1>
      </header>

      <main className="shell__main" id="main">
        <div style={{ display: 'grid', justifyItems: 'center' }}>
          <Sarathi
            mood="happy"
            speaking={false}
            still={prefs.a11y.reduceMotion}
            size={180}
            label={`${t('home.charName')}, ${t('home.charRole')}`}
          />
        </div>

        <h2 style={{ margin: 0, textAlign: 'center' }}>{t('app.tagline')}</h2>

        <div className="stack">
          <Link to="/app" className="card">
            <span className="card__title">Citizen app</span>
            <span className="card__body">
              Notices for your locality, bills in plain words, advisory polls and public
              discussion under a pseudonym.
            </span>
          </Link>

          <Link to="/gov" className="card">
            <span className="card__title">Government portal</span>
            <span className="card__body">
              Separate institutional sign-in for offices posting notices, running polls,
              reading aggregate dashboards and working moderation queues.
            </span>
          </Link>

          <Link to="/oversight" className="card">
            <span className="card__title">Oversight layer</span>
            <span className="card__body">
              Public transparency report and audit log, run independently of both the platform
              and the government.
            </span>
          </Link>
        </div>

        <p className="tiny">
          These are three separate surfaces, not three modes of one login. A citizen account
          has no path to posting as an office, and an institutional account cannot vote, post
          or comment as a citizen.
        </p>
      </main>
      <div />
    </div>
  )
}
