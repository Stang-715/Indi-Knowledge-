import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n, LANGUAGES } from '../i18n'
import { useSession } from '../core/session'
import {
  canChangePseudonym, inspectStoredData, pseudonymChangeAvailableAt,
  suggestPseudonym, validatePseudonym,
} from '../core/identity'
import { NOT_COLLECTED, OUT_OF_SCOPE, PRINCIPLES } from '../core/principles'
import { decisionFor, loadConsent, PURPOSES } from '../core/consent'
import RightsCentre from './consent/RightsCentre'
import { LOCALITY_CATALOGUE } from '../data/seed'
import { BackBar, Banner, Modal, PrincipleNote, Switch } from '../components/ui'
import { A11yControls } from './Onboarding'
import type { LocaleCode, NoticePriority } from '../core/types'
import type { StatedLocality } from '../core/prefs'

/* --------------------------------- 6.0 index ------------------------------ */

export function ProfileIndex() {
  const { t, locale } = useI18n()
  const { prefs, eligibility, voice, setLocale } = useSession()
  const navigate = useNavigate()

  const rows = [
    { to: '/app/profile/pseudonym', label: t('profile.pseudonym'), value: voice?.pseudonym ?? '—' },
    { to: '/app/profile/notifications', label: t('profile.notifications'), value: prefs.notifications.minimumPriority },
    { to: '/app/profile/locality', label: t('profile.locality'), value: `${prefs.localities.length} followed` },
    { to: '/app/profile/accessibility', label: 'Accessibility', value: `${Math.round(prefs.a11y.textScale * 100)}% text` },
    { to: '/app/profile/privacy', label: t('profile.privacy'), value: '' },
    { to: '/app/profile/help', label: t('profile.help'), value: '' },
  ]

  return (
    <>
      <h2 style={{ margin: 0 }}>{t('nav.profile')}</h2>

      {/* 6.1 Verification status — display only, no action. */}
      <div className="card">
        <p className="card__title">{t('profile.verification')}</p>
        {eligibility?.verified ? (
          <>
            <span className="badge badge--verified">✓ {t('profile.verified')}</span>
            <p className="card__body">
              Verified {new Date(eligibility.verifiedAt).toLocaleDateString()} by{' '}
              {eligibility.attestedBy}. Used once, at sign-up. Nothing you do here touches it again.
            </p>
          </>
        ) : (
          <>
            <span className="badge">{t('profile.unverified')}</span>
            <p className="card__body">You can read everything, but not vote in advisory polls.</p>
          </>
        )}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="lang">Language</label>
        <select
          id="lang"
          value={locale}
          onChange={(e) => setLocale(e.target.value as LocaleCode)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.endonym} — {l.english}</option>
          ))}
        </select>
      </div>

      <div className="stack stack--tight">
        {rows.map((row) => (
          <Link key={row.to} to={row.to} className="card">
            <span className="spread">
              <span className="card__title" style={{ margin: 0 }}>{row.label}</span>
              <span className="tiny">{row.value} ›</span>
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={() => navigate('/', { replace: true })}
      >
        {t('profile.logout')}
      </button>
      <p className="tiny">
        Logging out clears this session. On a shared phone, do it before you hand the phone
        over — otherwise the next person is speaking under your name.
      </p>
    </>
  )
}

/* ------------------------------ 6.2 Pseudonym ----------------------------- */

export function PseudonymSettings() {
  const { t } = useI18n()
  const { voice, choosePseudonym } = useSession()
  const [value, setValue] = useState(voice?.pseudonym ?? '')
  const [saved, setSaved] = useState(false)
  const allowed = canChangePseudonym()
  const availableAt = pseudonymChangeAvailableAt()
  const error = validatePseudonym(value)

  return (
    <>
      <BackBar title={t('profile.pseudonym')} to="/app/profile" />

      <div className="card">
        <p className="card__title">{voice?.pseudonym}</p>
        <p className="card__body">
          Chosen {voice ? new Date(voice.createdAt).toLocaleDateString() : '—'}. Everything you
          have posted or voted appears under this name and nothing else.
        </p>
      </div>

      {!allowed && availableAt && (
        <Banner title={t('profile.cooldown', { d: new Date(availableAt).toLocaleDateString() })}>
          {t('profile.cooldownWhy')}
        </Banner>
      )}

      <div className="field">
        <label className="field__label" htmlFor="newpseud">New pseudonym</label>
        <input
          id="newpseud"
          type="text"
          value={value}
          disabled={!allowed}
          onChange={(e) => { setValue(e.target.value); setSaved(false) }}
        />
      </div>

      <div className="row">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!allowed}
          onClick={() => setValue(suggestPseudonym())}
        >
          {t('onboard.pseudonym.suggest')}
        </button>
        <button
          type="button"
          className="btn"
          disabled={!allowed || !!error || value === voice?.pseudonym}
          onClick={() => { choosePseudonym(value.trim()); setSaved(true) }}
        >
          {t('action.save')}
        </button>
      </div>

      {saved && <Banner tone="ok">Saved. Your earlier posts stay under the old name.</Banner>}

      <PrincipleNote>
        Changing this does not affect your verification, and your verification does not affect
        this. They are stored separately and neither points at the other.
      </PrincipleNote>
    </>
  )
}

/* ---------------------------- 6.3 Notifications --------------------------- */

const PRIORITIES: { id: NoticePriority; label: string; hint: string }[] = [
  { id: 'routine', label: 'Everything', hint: 'Including routine circulars.' },
  { id: 'important', label: 'Important and above', hint: 'The usual choice.' },
  { id: 'time-critical', label: 'Time-critical only', hint: 'Water off for three days. Evacuations. Nothing else.' },
]

export function NotificationSettings() {
  const { t } = useI18n()
  const { prefs, setNotifications } = useSession()
  const n = prefs.notifications

  return (
    <>
      <BackBar title={t('profile.notifications')} to="/app/profile" />

      <div className="field">
        <span className="field__label" id="priolabel">Minimum priority</span>
        <div className="stack stack--tight" role="radiogroup" aria-labelledby="priolabel">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={n.minimumPriority === p.id}
              className="card"
              onClick={() => setNotifications({ minimumPriority: p.id })}
              style={n.minimumPriority === p.id ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
            >
              <span className="card__title" style={{ marginBottom: 2 }}>{p.label}</span>
              <span className="tiny">{p.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <Switch name="New polls" checked={n.polls} onChange={(v) => setNotifications({ polls: v })} />
      <Switch name="Replies to my posts" checked={n.replies} onChange={(v) => setNotifications({ replies: v })} />
      <Switch name="Results when a poll closes" checked={n.results} onChange={(v) => setNotifications({ results: v })} />
      <Switch
        name="Closures on streets I follow"
        hint="A road shut this morning is worth interrupting you for. The streets are matched on this device; the list never leaves it."
        checked={n.followedStreets}
        onChange={(v) => setNotifications({ followedStreets: v })}
      />
      <Switch
        name="Quiet hours"
        hint="Nothing between 22:00 and 07:00 unless it is time-critical."
        checked={n.quietHours}
        onChange={(v) => setNotifications({ quietHours: v })}
      />

      <PrincipleNote>
        Turning things off here is the responsible choice, not the lazy one. An app that pings
        you about everything teaches you to ignore it, and then you miss the notice that
        actually mattered.
      </PrincipleNote>
    </>
  )
}

/* ------------------------------- 6.4 Locality ----------------------------- */

export function LocalitySettings() {
  const { t } = useI18n()
  const { prefs, setLocalities } = useSession()
  const [moves, setMoves] = useState(prefs.movesForWork)
  const [chosen, setChosen] = useState<StatedLocality[]>(prefs.localities)
  const [saved, setSaved] = useState(false)

  const toggle = (loc: StatedLocality) => {
    setSaved(false)
    setChosen((current) => {
      const has = current.some((c) => c.id === loc.id)
      if (has) return current.filter((c) => c.id !== loc.id)
      if (!moves) return [{ ...loc }]
      return [...current, { ...loc, workLocality: current.length > 0 }]
    })
  }

  return (
    <>
      <BackBar title={t('profile.locality')} to="/app/profile" />

      <Switch
        name={t('onboard.locality.moves')}
        hint={t('onboard.locality.movesHelp')}
        checked={moves}
        onChange={(v) => { setMoves(v); setSaved(false); if (!v) setChosen((c) => c.slice(0, 1)) }}
      />

      <div className="stack stack--tight">
        {LOCALITY_CATALOGUE.map((loc) => {
          const on = chosen.some((c) => c.id === loc.id)
          return (
            <button
              key={loc.id}
              type="button"
              className="card"
              aria-pressed={on}
              onClick={() => toggle(loc)}
              style={on ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
            >
              <span className="card__title" style={{ marginBottom: 2 }}>{loc.label}</span>
              <span className="tiny">{loc.district} · {loc.state}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="btn btn--block"
        disabled={chosen.length === 0}
        onClick={() => { setLocalities(chosen, moves); setSaved(true) }}
      >
        {t('action.save')}
      </button>

      {saved && <Banner tone="ok">Saved. Notices from these localities will reach you.</Banner>}

      <PrincipleNote>
        Nothing here is verified, and nothing checks whether you actually live in these places.
        That is deliberate: a system that polices your stated address is a system that has an
        opinion about where you belong.
      </PrincipleNote>
    </>
  )
}

/* ---------------------------- 6.5 Privacy centre -------------------------- */

export function PrivacyCentre() {
  const { t } = useI18n()
  // Read at render: the table below shows the citizen's actual decisions, not a
  // description of what they might have chosen.
  const consent = loadConsent()
  const { deleteAccount } = useSession()
  const navigate = useNavigate()
  const [showRaw, setShowRaw] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const stored = inspectStoredData()

  return (
    <>
      <BackBar title={t('profile.privacy')} to="/app/profile" />

      <RightsCentre />

      <h3 className="section-title">{t('common.notCollected')}</h3>
      <ul className="tickList">
        {NOT_COLLECTED.map((item) => <li key={item}>{item}</li>)}
      </ul>

      <h3 className="section-title">{t('profile.dataOnMe')}</h3>
      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr><th>What is stored</th><th>What it is for</th><th>Your decision</th></tr>
          </thead>
          <tbody>
            {PURPOSES.map((p) => (
              <tr key={p.id}>
                <td>{t(p.dataKey)}</td>
                <td>{t(p.purposeKey)}</td>
                <td>
                  {decisionFor(consent, p.id) ?? 'not asked'}
                  {p.seenByGov ? ' · public under your pseudonym' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn btn--ghost btn--block" onClick={() => setShowRaw((s) => !s)}>
        {showRaw ? 'Hide' : 'Show'} the actual stored values
      </button>

      {showRaw && (
        <>
          <pre
            className="card"
            style={{ overflowX: 'auto', fontSize: '0.78rem', whiteSpace: 'pre-wrap' }}
          >
            {JSON.stringify(stored, null, 2)}
          </pre>
          <p className="tiny">
            This is read straight out of the store, not typed out by hand. If the table above
            ever drifted from the truth, this is where you would catch it.
          </p>
        </>
      )}

      <h3 className="section-title">Architectural constraints</h3>
      <div className="stack stack--tight">
        {PRINCIPLES.map((p) => (
          <div key={p.id} className="card">
            <p className="card__title">{p.title}</p>
            <p className="card__body">{p.statement}</p>
            <p className="tiny">Lives in: {p.enforcedIn.join(', ')}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title">Deliberately not built</h3>
      <ul className="tickList">
        {OUT_OF_SCOPE.map((item) => <li key={item}>{item}</li>)}
      </ul>

      <button type="button" className="btn btn--danger btn--block" onClick={() => setConfirming(true)}>
        {t('profile.deleteAccount')}
      </button>

      {confirming && (
        <Modal title={t('profile.deleteAccount')} onClose={() => setConfirming(false)}>
          <p className="prose">{t('profile.deleteBody')}</p>
          <Banner tone="danger">
            Irreversible. There is no recovery path, because a recovery path would mean we kept
            a copy.
          </Banner>
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => { deleteAccount(); navigate('/', { replace: true }) }}
          >
            {t('action.confirm')}
          </button>
        </Modal>
      )}
    </>
  )
}

/* --------------------------- 6.x Accessibility ---------------------------- */

export function AccessibilitySettings() {
  return (
    <>
      <BackBar title="Accessibility" to="/app/profile" />
      <A11yControls />
      <p className="tiny">
        These apply immediately and to every screen, including the government portal and the
        oversight layer.
      </p>
    </>
  )
}

/* --------------------------------- 6.6 Help ------------------------------- */

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Does my vote here change the law?',
    a: 'No. It is advisory. It measures opinion and passes the count to policymakers, who are not obliged to follow it. Nobody is elected here and no law changes because of a number on this screen.',
  },
  {
    q: 'Can anyone find out who I am from my posts?',
    a: 'Not from this system — there is no stored link between your verified identity and your pseudonym, so there is nothing to hand over. Be aware that what you write can still identify you: unusual details, or a very distinctive way of writing.',
  },
  {
    q: 'Does the app track where I am?',
    a: 'No. Your locality is typed by you and sits there until you change it. The code that would ask your phone for its position is not in this app.',
  },
  {
    q: 'Why do you need my ID at all?',
    a: 'So one person counts once. It happens once, we keep a one-way hash rather than the number, and it is never used again after sign-up.',
  },
  {
    q: 'Someone in my house uses the same phone.',
    a: 'That works — verification is tied to the person, not the handset. Log out before handing the phone over, or the next person posts under your name.',
  },
  {
    q: 'Why can I not see results before I vote?',
    a: 'Because seeing what others chose changes what people choose, and then the poll is partly measuring itself. Results open the moment you answer.',
  },
  {
    q: 'A notice was removed. Is that a cover-up?',
    a: 'Notices are never removed. If an office withdraws one it stays visible marked as retracted, with the reason. If a notice has genuinely vanished, that is worth reporting.',
  },
  {
    q: 'Who decides what gets moderated?',
    a: 'Reports go to human moderators; nothing is removed automatically. Removal counts are published on the oversight layer, which is run independently of both us and the government.',
  },
  {
    q: 'What happens if a future government changes the rules?',
    a: 'The protections are absences in the code rather than settings, so adding tracking would mean shipping a visibly different version. That buys friction and visibility. It does not buy immunity — this ultimately needs statutory backing.',
  },
]

export function Help() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <BackBar title={t('profile.help')} to="/app/profile" />
      <div className="stack stack--tight">
        {FAQ.map((item, i) => (
          <div key={item.q} className="card">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              style={{
                all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
                fontWeight: 650,
              }}
            >
              {open === i ? '−' : '+'} {item.q}
            </button>
            {open === i && <p className="card__body">{item.a}</p>}
          </div>
        ))}
      </div>
      <Link to="/app" className="btn btn--ghost btn--block tap">
        Ask Sarathi instead →
      </Link>
    </>
  )
}
