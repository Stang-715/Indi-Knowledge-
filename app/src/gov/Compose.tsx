import { useState } from 'react'
import { useGov } from './GovPortal'
import { LOCALITY_CATALOGUE } from '../data/seed'
import { listNotices, publishNotice, publishPoll, retractNotice, retractionOverlay } from '../data/repo'
import { AdvisoryBanner, Banner, PrincipleNote, Switch } from '../components/ui'
import type { Notice, NoticePriority, Poll } from '../core/types'

/* ------------------------------ 8.0 Post a notice ------------------------- */

type NoticeStep = 'compose' | 'preview' | 'done'

export function NoticeComposer() {
  const { account } = useGov()
  const [step, setStep] = useState<NoticeStep>('compose')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<NoticePriority>('routine')
  const [category, setCategory] = useState('Public Works')
  const [localityIds, setLocalityIds] = useState<string[]>([])
  const [scheduled, setScheduled] = useState(false)
  const [when, setWhen] = useState('')

  const ready = title.trim().length > 4 && body.trim().length > 20 && localityIds.length > 0

  const publish = () => {
    if (!account) return
    const notice: Notice = {
      id: `not_${Date.now().toString(36)}`,
      title: title.trim(),
      body: body.trim(),
      localityIds,
      issuedBy: account.institution,
      publishedAt: scheduled && when ? new Date(when).getTime() : Date.now(),
      priority,
      category,
    }
    publishNotice(notice)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <>
        <Banner tone="ok" title={scheduled ? 'Scheduled' : 'Published'}>
          {scheduled
            ? `Queued for ${new Date(when).toLocaleString()}. It reaches citizens in the selected localities at that time.`
            : 'Live now in the notice list of every citizen following those localities.'}
        </Banner>
        <button type="button" className="btn btn--block" onClick={() => { setStep('compose'); setTitle(''); setBody('') }}>
          Post another
        </button>
        <RetractPanel />
      </>
    )
  }

  if (step === 'preview') {
    return (
      <>
        <h2 style={{ margin: 0 }}>Preview</h2>
        <p className="tiny">This is exactly what a citizen sees.</p>

        <article className="card">
          <span className="badge badge--verified">✓ Verified source</span>
          <h3 className="card__title" style={{ marginTop: 'var(--s2)' }}>{title}</h3>
          <p className="tiny">{account?.institution.name} · {category}</p>
          <p className="prose">{body}</p>
          <p className="card__meta">
            {priority === 'time-critical' && <span className="badge badge--critical">Time-critical</span>}
            {priority === 'important' && <span className="badge badge--important">Important</span>}
            <span>{localityIds.length} localities</span>
          </p>
        </article>

        {priority === 'time-critical' && (
          <Banner tone="advisory" title="Time-critical bypasses quiet hours">
            This will notify citizens who have set their threshold to time-critical only, and
            will sound at night. Use it for water, evacuation and safety — using it for
            anything else teaches people to mute the tier that matters.
          </Banner>
        )}

        <div className="row">
          <button type="button" className="btn btn--ghost" onClick={() => setStep('compose')}>Back to edit</button>
          <button type="button" className="btn" onClick={publish}>
            {scheduled ? 'Schedule' : 'Publish now'}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>Compose a notice</h2>

      <div className="field">
        <label className="field__label" htmlFor="ntitle">Title</label>
        <input id="ntitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        <p className="field__hint">
          This is the whole notice for anyone who reads only the list. Say what happens and when.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="nbody">Body</label>
        <textarea id="nbody" value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 200 }} />
        <p className="field__hint">
          Put timings and addresses in the text itself. Attachments are dropped in
          low-bandwidth mode, and that is where a lot of your readers are.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="ncat">Category</label>
        <input id="ncat" type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <div className="field">
        <span className="field__label" id="priolab">Priority</span>
        <div className="row" role="radiogroup" aria-labelledby="priolab">
          {(['routine', 'important', 'time-critical'] as NoticePriority[]).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={priority === p} className="chip" onClick={() => setPriority(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label" id="loclab">Target localities</span>
        <div className="row" role="group" aria-labelledby="loclab">
          {LOCALITY_CATALOGUE.map((loc) => {
            const on = localityIds.includes(loc.id)
            return (
              <button
                key={loc.id}
                type="button"
                className="chip"
                aria-pressed={on}
                onClick={() =>
                  setLocalityIds((c) => (on ? c.filter((x) => x !== loc.id) : [...c, loc.id]))
                }
              >
                {loc.label}
              </button>
            )
          })}
        </div>
      </div>

      <Switch name="Schedule instead of publishing now" checked={scheduled} onChange={setScheduled} />
      {scheduled && (
        <div className="field">
          <label className="field__label" htmlFor="nwhen">Publish at</label>
          <input id="nwhen" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
      )}

      <button type="button" className="btn btn--block" disabled={!ready} onClick={() => setStep('preview')}>
        Preview
      </button>

      <PrincipleNote>
        Publishing is one step and one approval — yours. A queue of sign-offs between a
        municipal engineer and a burst water main is a queue that gets people hurt. The
        accountability comes afterwards, from retraction being public.
      </PrincipleNote>

      <RetractPanel />
    </>
  )
}

/* ------------------------------ 8.4 Edit / Retract ------------------------ */

function RetractPanel() {
  const [target, setTarget] = useState<string>('')
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const overlay = retractionOverlay()
  const notices = listNotices().filter((n) => !n.retracted && !overlay[n.id])

  return (
    <>
      <h3 className="section-title">Retract a published notice</h3>
      <div className="field">
        <label className="field__label" htmlFor="rtarget">Notice</label>
        <select id="rtarget" value={target} onChange={(e) => { setTarget(e.target.value); setDone(false) }}>
          <option value="">Select…</option>
          {notices.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="rreason">Reason (shown publicly)</label>
        <textarea id="rreason" value={reason} onChange={(e) => setReason(e.target.value)} style={{ minHeight: 80 }} />
      </div>
      <button
        type="button"
        className="btn btn--danger"
        disabled={!target || reason.trim().length < 10}
        onClick={() => { retractNotice(target, reason.trim()); setDone(true); setTarget(''); setReason('') }}
      >
        Retract
      </button>
      {done && <Banner tone="ok">Retracted. The notice stays visible with your reason attached.</Banner>}
      <PrincipleNote>
        There is no delete. A notice that vanishes overnight is indistinguishable from a
        cover-up, so the system will not do it — a retraction is a public correction, which is
        what you want your record to show.
      </PrincipleNote>
    </>
  )
}

/* ------------------------------ 9.0 Create a poll ------------------------- */

export function PollComposer() {
  const { account } = useGov()
  const [billTitle, setBillTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [days, setDays] = useState(14)
  const [acknowledged, setAcknowledged] = useState(false)
  const [done, setDone] = useState(false)

  const filled = options.map((o) => o.trim()).filter((o) => o.length > 0)
  const ready =
    billTitle.trim().length > 4 &&
    summary.trim().length > 60 &&
    url.trim().length > 4 &&
    filled.length >= 2 &&
    acknowledged

  const publish = () => {
    if (!account || !ready) return
    const poll: Poll = {
      id: `poll_${Date.now().toString(36)}`,
      billTitle: billTitle.trim(),
      plainSummary: summary.trim(),
      fullTextUrl: url.trim(),
      fullTextLabel: label.trim() || 'Full text',
      options: filled.map((o, i) => ({ id: `o${i + 1}`, label: o })),
      opensAt: Date.now(),
      closesAt: Date.now() + days * 86400000,
      localityIds: 'all',
      issuedBy: account.institution,
      advisoryOnly: true,
      editWindowMs: 86400000,
    }
    publishPoll(poll)
    setDone(true)
  }

  if (done) {
    return (
      <>
        <Banner tone="ok" title="Poll open">
          Live in the citizen poll list, closing in {days} days.
        </Banner>
        <AdvisoryBanner />
        <button type="button" className="btn btn--block" onClick={() => { setDone(false); setBillTitle(''); setSummary('') }}>
          Create another
        </button>
      </>
    )
  }

  return (
    <>
      <h2 style={{ margin: 0 }}>Create an advisory poll</h2>
      <AdvisoryBanner />

      <div className="field">
        <label className="field__label" htmlFor="btitle">Bill or proposal title</label>
        <input id="btitle" type="text" value={billTitle} onChange={(e) => setBillTitle(e.target.value)} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="bsummary">Plain-language summary</label>
        <textarea
          id="bsummary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{ minHeight: 200 }}
          aria-describedby="framinghint"
        />
        <p className="field__hint" id="framinghint">
          State what the proposal does and what its critics say it does. A summary that only
          argues one way produces a result nobody can use — including you, when you have to
          defend it. Citizens can open the full text and check, which is the point of requiring
          both.
        </p>
        <p className="tiny">{summary.trim().length} characters — minimum 60.</p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="burl">Link to the full legal text</label>
        <input id="burl" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="blabel">Link label</label>
        <input id="blabel" type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Bill No. 14, 31 pages" />
      </div>

      <div className="field">
        <span className="field__label">Options (2 to 4)</span>
        <div className="stack stack--tight">
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              aria-label={`Option ${i + 1}`}
              onChange={(e) =>
                setOptions((c) => c.map((o, j) => (j === i ? e.target.value : o)))
              }
            />
          ))}
        </div>
        <div className="row">
          <button
            type="button"
            className="chip"
            disabled={options.length >= 4}
            onClick={() => setOptions((c) => [...c, ''])}
          >
            + Add option
          </button>
          <button
            type="button"
            className="chip"
            disabled={options.length <= 2}
            onClick={() => setOptions((c) => c.slice(0, -1))}
          >
            − Remove
          </button>
        </div>
        <p className="field__hint">
          Four is the hard maximum. Beyond that people stop reading and pick the first plausible
          line, and the result measures ordering rather than opinion.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="bdays">Open for</label>
        <select id="bdays" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {[7, 14, 21, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </div>

      {/* 9.5 — mandatory, un-skippable */}
      <label className="switch tap">
        <span className="switch__text">
          <span className="switch__name">I confirm this poll is advisory only</span>
          <span className="tiny">
            It measures sentiment for policymakers. It is not a legal vote, does not elect
            anyone and does not replace the Election Commission or the EVM system. Citizens see
            this stated on every screen of this poll.
          </span>
        </span>
        <input type="checkbox" className="sr-only" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
        <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
      </label>

      <button type="button" className="btn btn--block" disabled={!ready} onClick={publish}>
        Publish poll
      </button>
      {!acknowledged && <p className="tiny">The confirmation above cannot be skipped.</p>}
    </>
  )
}
