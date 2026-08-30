import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { read, write } from '../core/storage'
import { appendAudit } from '../core/audit'
import { INSTITUTIONS } from '../data/seed'
import type { GovAccount, GovRole } from '../core/types'
import { Banner, PrincipleNote } from '../components/ui'
import { useT } from '../i18n'

/* ---------------------------- 7.0 session & roles ------------------------- */

interface GovValue {
  account: GovAccount | null
  signIn: (account: GovAccount) => void
  signOut: () => void
  can: (role: GovRole) => boolean
}

const GovContext = createContext<GovValue | null>(null)

export function GovProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<GovAccount | null>(() =>
    read<GovAccount | null>('gov', 'account', null),
  )

  const value = useMemo<GovValue>(
    () => ({
      account,
      signIn: (next) => {
        write('gov', 'account', next)
        setAccount(next)
        appendAudit({
          actorKind: 'gov',
          actor: `${next.institution.name} — ${next.name}`,
          action: 'session.signin',
          scope: next.roles.join(', '),
          detail: 'Institutional sign-in with multi-factor authentication.',
        })
      },
      signOut: () => {
        write('gov', 'account', null)
        setAccount(null)
      },
      can: (role) => account?.roles.includes(role) ?? false,
    }),
    [account],
  )

  return <GovContext.Provider value={value}>{children}</GovContext.Provider>
}

export function useGov(): GovValue {
  const ctx = useContext(GovContext)
  if (!ctx) throw new Error('useGov must be used inside GovProvider')
  return ctx
}

/* --------------------------------- 7.0 login ------------------------------ */

const DEMO_ACCOUNTS: GovAccount[] = [
  {
    id: 'g1', name: 'R. Kulkarni (Municipal Engineer)',
    institution: INSTITUTIONS[0],
    roles: ['notice-officer'],
  },
  {
    id: 'g2', name: 'S. Menon (Legislative Aide)',
    institution: INSTITUTIONS[3],
    roles: ['poll-officer', 'analyst'],
  },
  {
    id: 'g3', name: 'A. Bose (Ward Councillor)',
    institution: INSTITUTIONS[0],
    roles: ['analyst'],
  },
  {
    id: 'g4', name: 'Moderation Desk',
    institution: INSTITUTIONS[0],
    roles: ['moderator'],
  },
]

export function GovLogin() {
  const t = useT()
  const { signIn } = useGov()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<GovAccount | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    if (code.trim().length !== 6) {
      setError(true)
      return
    }
    signIn(selected)
    navigate('/gov/home', { replace: true })
  }

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="topbar__title">{t('gov.title')}</h1>
      </header>
      <main className="shell__main" id="main">
        <Banner tone="advisory" title="Separate surface">{t('gov.separate')}</Banner>

        <h2 style={{ margin: 0 }}>{t('gov.login')}</h2>

        <form className="stack" onSubmit={submit}>
          <div className="field">
            <span className="field__label" id="acctlabel">Institutional account</span>
            <div className="stack stack--tight" role="radiogroup" aria-labelledby="acctlabel">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.id}
                  type="button"
                  role="radio"
                  aria-checked={selected?.id === acct.id}
                  className="card"
                  onClick={() => setSelected(acct)}
                  style={selected?.id === acct.id ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
                >
                  <span className="card__title" style={{ marginBottom: 2 }}>{acct.name}</span>
                  <span className="tiny">{acct.institution.name}</span>
                  <span className="card__meta" style={{ marginTop: 6 }}>
                    {acct.roles.map((r) => <span key={r} className="badge">{r}</span>)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="mfa">{t('gov.mfa')}</label>
            <input
              id="mfa"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false) }}
              placeholder="6 digits"
            />
            <p className="field__hint">
              Demo build — any six digits. Multi-factor is what makes the verified-source badge
              on a citizen's notice mean something, so in production this is hardware-backed.
            </p>
          </div>

          {error && <Banner tone="danger">Enter the six-digit code from your authenticator.</Banner>}

          <button type="submit" className="btn btn--block" disabled={!selected}>
            Sign in
          </button>
        </form>

        <PrincipleNote>
          Roles are assigned by an administrator, not chosen here, and they decide which
          sections this account can even load. An account with only the moderator role cannot
          reach the dashboards, and no account on this side can post, vote or comment as a
          citizen.
        </PrincipleNote>
      </main>
      <div />
    </div>
  )
}

/* --------------------------------- gov shell ------------------------------ */

const SECTIONS: { to: string; label: string; role: GovRole }[] = [
  { to: '/gov/notices', label: 'Notices', role: 'notice-officer' },
  { to: '/gov/polls', label: 'Polls', role: 'poll-officer' },
  { to: '/gov/dashboards', label: 'Dashboards', role: 'analyst' },
  { to: '/gov/moderation', label: 'Moderation', role: 'moderator' },
]

export function GovShell() {
  const t = useT()
  const { account, signOut, can } = useGov()
  const navigate = useNavigate()

  if (!account) {
    navigate('/gov', { replace: true })
    return null
  }

  const allowed = SECTIONS.filter((s) => can(s.role))

  return (
    <div className="shell">
      <a className="skip" href="#main">{t('nav.skipToContent')}</a>
      <header className="topbar">
        <h1 className="topbar__title">{t('gov.title')}</h1>
        <button type="button" className="topbar__icon" onClick={() => { signOut(); navigate('/gov') }} aria-label="Sign out">
          ⏻
        </button>
      </header>

      <main className="shell__main" id="main">
        <div className="card">
          <p className="card__title" style={{ marginBottom: 2 }}>{account.name}</p>
          <p className="tiny">{account.institution.name} · {account.institution.department}</p>
          <p className="card__meta" style={{ marginTop: 8 }}>
            {account.roles.map((r) => <span key={r} className="badge">{r}</span>)}
          </p>
        </div>
        <Outlet />
      </main>

      <nav className="tabbar" style={{ gridTemplateColumns: `repeat(${allowed.length + 1}, 1fr)` }} aria-label="Portal sections">
        <NavLink to="/gov/home" end className="tabbar__item">
          <span className="tabbar__glyph" aria-hidden="true">⌂</span><span>Home</span>
        </NavLink>
        {allowed.map((s) => (
          <NavLink key={s.to} to={s.to} className="tabbar__item">
            <span className="tabbar__glyph" aria-hidden="true">•</span><span>{s.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function GovHome() {
  const { account, can } = useGov()
  return (
    <>
      <h2 style={{ margin: 0 }}>What you can do here</h2>
      <div className="stack stack--tight">
        {can('notice-officer') && (
          <NavLink to="/gov/notices" className="card">
            <span className="card__title">Post a notice</span>
            <span className="card__body">
              Compose, preview, publish or schedule. Retract a published notice — it stays
              visible, marked retracted, with your reason attached.
            </span>
          </NavLink>
        )}
        {can('poll-officer') && (
          <NavLink to="/gov/polls" className="card">
            <span className="card__title">Create an advisory poll</span>
            <span className="card__body">
              Plain summary, linked full text, up to four options, a closing date. The
              advisory-only disclaimer is not optional.
            </span>
          </NavLink>
        )}
        {can('analyst') && (
          <NavLink to="/gov/dashboards" className="card">
            <span className="card__title">Dashboards</span>
            <span className="card__body">
              Aggregate results, sentiment summaries and notice reach — with coverage figures
              attached so the numbers are read honestly.
            </span>
          </NavLink>
        )}
        {can('moderator') && (
          <NavLink to="/gov/moderation" className="card">
            <span className="card__title">Moderation console</span>
            <span className="card__body">
              Reported posts, suspected fake notices and anti-brigading flags awaiting human
              review.
            </span>
          </NavLink>
        )}
      </div>

      <PrincipleNote>
        Everything you do here is written to an append-only audit trail published by an
        independent oversight body. Your account can write to that trail by acting and cannot
        read it back, edit it or delete from it.
      </PrincipleNote>

      {!account?.roles.includes('analyst') && (
        <p className="tiny">
          Sections your roles do not cover are not hidden from the menu — they are not routable
          for this account at all.
        </p>
      )}
    </>
  )
}
