import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionSwitch from './SectionSwitch'
import Sheet from '../../components/chowk/Sheet'
import ScreenState from '../../components/chowk/ScreenState'
import { currentState, setCurrentState } from './state-context'
import { getStore, listStates, storesFor } from '../../data/repo'
import { claimStore, listedHere } from '../../core/storeclaim'
import { apiPost } from '../../core/api'
import { pullStores } from '../../core/pull'
import { matchesStore, STORE_CATEGORIES, type StoreCategory } from '../../core/bharat'
import { useT } from '../../i18n'
import './bharat.css'

/**
 * 2.6 open a store · 2.8 store profile, and the directory between them.
 *
 * The privacy decision that shapes this whole screen: **a listing carries no
 * pseudonym.** A shop has a name, a stated address and opening hours; the
 * person who listed it has a pseudonym they post and vote under. Joining those
 * would mean every pseudonymous opinion its owner had ever expressed became
 * attributable to a named business at a known address — a deanonymisation the
 * platform would have performed on itself, in exchange for an edit button.
 *
 * So listing is not an account action. The device mints a secret, sends its
 * digest, and that digest is the only thing tying the listing to whoever made
 * it. Lose the secret and you lose the ability to edit; that is the price of
 * having no account, and a recovery flow would be an identity by another name.
 *
 * Listings publish immediately and are marked unverified. The alternative is a
 * queue nobody staffs, which is a directory with nothing in it — and the report
 * route is the other half of that bargain. It needs a person behind it from the
 * day this opens.
 */
export default function Shops() {
  const t = useT()
  const [code, setCode] = useState(() => currentState())
  const [query, setQuery] = useState('')
  const [composing, setComposing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tick, force] = useState(0)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<StoreCategory>('grocery')
  const [address, setAddress] = useState('')
  const [locality, setLocality] = useState('')
  const [what, setWhat] = useState('')
  const [hours, setHours] = useState('')
  const [phone, setPhone] = useState('')

  const stores = useMemo(
    () => storesFor(code).filter((s) => matchesStore(s, query)),
    [code, query, tick],
  )

  const publish = async () => {
    if (!name.trim() || !address.trim()) return
    setBusy(true)
    setStatus(null)
    const id = `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    const ownerDigest = await claimStore(id)
    try {
      const res = await apiPost<{ ok?: boolean }>('/v1/stores', {
        id,
        name: name.trim(),
        category,
        address: address.trim(),
        locality: locality.trim(),
        district: '',
        stateCode: code,
        what: what.trim(),
        hours: hours.trim(),
        phone: phone.trim(),
        ownerDigest,
      })
      if (res.ok) {
        setStatus(t('shop.published'))
        setComposing(false)
        setName(''); setAddress(''); setWhat(''); setHours(''); setPhone('')
        await pullStores()
        force((n) => n + 1)
      } else {
        setStatus(t('shop.failed'))
      }
    } catch {
      setStatus(t('shop.failed'))
    }
    setBusy(false)
  }

  return (
    <div className="bh">
      <header className="bh__head">
        <h1 className="t-display bh__title">{t('shop.title')}</h1>
        <p className="bh__tagline">{t('shop.tagline')}</p>
      </header>

      <SectionSwitch active="shops" />

      <div className="field">
        <label className="field__label" htmlFor="sh-state">{t('bharat.pick')}</label>
        <select id="sh-state" value={code}
          onChange={(e) => { setCurrentState(e.target.value); setCode(e.target.value) }}>
          {listStates().map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="sh-q">{t('shop.search')}</label>
        <input id="sh-q" type="search" value={query} autoComplete="off"
          onChange={(e) => setQuery(e.target.value)} />
      </div>

      <button type="button" className="btn btn--hue btn--block" onClick={() => setComposing(true)}>
        {t('shop.open')}
      </button>

      <Link to="/s/bharat/map" className="btn btn--ghost btn--block">{t('pmap.title')}</Link>

      {status && <p className="bh__status" role="status">{status}</p>}

      <p className="bh__note">{t('shop.unverifiedBody')}</p>

      {stores.length === 0
        ? <ScreenState kind="empty" title={t('shop.none')} />
        : (
          <div className="bh__list">
            {stores.map((s) => (
              <Link key={s.id} to={`/s/bharat/shops/${s.id}`} className="sh glass glass--press">
                <span className="sh__name">{s.name}</span>
                <span className="sh__meta">
                  <span className="sh__tag">{t(`shop.category.${s.category}`)}</span>
                  <span className={`sh__tag sh__tag--${s.verified ? 'ok' : 'un'}`}>
                    {s.verified ? t('shop.verified') : t('shop.unverified')}
                  </span>
                  {listedHere(s.id) && <span className="sh__tag">{t('shop.mine')}</span>}
                </span>
                <span className="sh__what">{s.what}</span>
                <span className="sh__where">{s.address}</span>
              </Link>
            ))}
          </div>
        )}

      <Sheet open={composing} onClose={() => setComposing(false)} title={t('shop.open')}>
        <p className="bh__note">{t('shop.noAccount')}</p>

        <div className="field">
          <label className="field__label" htmlFor="sh-name">{t('shop.name')}</label>
          <input id="sh-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-cat">{t('shop.category')}</label>
          <select id="sh-cat" value={category}
            onChange={(e) => setCategory(e.target.value as StoreCategory)}>
            {STORE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`shop.category.${c}`)}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-addr">{t('shop.address')}</label>
          <input id="sh-addr" type="text" value={address}
            onChange={(e) => setAddress(e.target.value)} />
          <p className="field__hint">{t('shop.addressHint')}</p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-loc">{t('shop.locality')}</label>
          <input id="sh-loc" type="text" value={locality}
            onChange={(e) => setLocality(e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-what">{t('shop.what')}</label>
          <textarea id="sh-what" rows={3} value={what}
            onChange={(e) => setWhat(e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-hours">{t('shop.hours')}</label>
          <input id="sh-hours" type="text" value={hours}
            onChange={(e) => setHours(e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sh-phone">{t('shop.phone')}</label>
          <input id="sh-phone" type="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button type="button" className="btn btn--hue btn--block" disabled={busy}
          onClick={() => { void publish() }}>
          {busy ? t('shop.publishing') : t('shop.publish')}
        </button>
      </Sheet>
    </div>
  )
}

/** 2.8 — one shop. */
export function StoreProfile() {
  const t = useT()
  const { id = '' } = useParams()
  const [reported, setReported] = useState(false)
  const store = getStore(id)

  const report = async () => {
    try {
      await apiPost('/v1/stores/report', { store: id, reason: 'wrong-details' })
      setReported(true)
    } catch { /* offline; the listing is unchanged either way */ }
  }

  if (!store) {
    return <div className="bh"><Back /><ScreenState kind="empty" /></div>
  }

  return (
    <div className="bh">
      <Back />
      <header className="bh__head">
        <h1 className="bh__shopname">{store.name}</h1>
        <p className="bh__tagline">{t(`shop.category.${store.category}`)}</p>
        <span className={`sh__tag sh__tag--${store.verified ? 'ok' : 'un'}`}>
          {store.verified ? t('shop.verified') : t('shop.unverified')}
        </span>
      </header>

      <section className="bh__block">
        <dl className="bh__facts">
          <dt>{t('shop.what')}</dt>
          <dd>{store.what}</dd>
          <dt>{t('shop.address')}</dt>
          <dd>{store.address}{store.locality ? `, ${store.locality}` : ''}</dd>
          {store.hours && (<><dt>{t('shop.hours')}</dt><dd>{store.hours}</dd></>)}
          {store.phone && (<><dt>{t('shop.phone')}</dt><dd>{store.phone}</dd></>)}
        </dl>
      </section>

      <p className="bh__note">{t('shop.unverifiedBody')}</p>

      <button type="button" className="btn btn--ghost btn--block" disabled={reported}
        onClick={() => { void report() }}>
        {reported ? t('shop.reported') : t('shop.report')}
      </button>
    </div>
  )
}

function Back() {
  const t = useT()
  return (
    <Link to="/s/bharat/shops" className="bh__back">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      {t('shop.title')}
    </Link>
  )
}
