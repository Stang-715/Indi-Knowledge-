/**
 * Shared domain types.
 *
 * ARCHITECTURAL NOTE (design principle 2):
 * There is deliberately NO type in this file that contains both a real-identity
 * field and a pseudonym field. If you find yourself wanting to write one, that
 * is the join table the whole platform exists to not have. Don't.
 */

export type Surface = 'citizen' | 'government' | 'oversight'

export type LocaleCode = 'en' | 'hi' | 'ta' | 'bn' | 'mr'

/** A stated, manually-entered locality. Never derived from device location. */
export interface Locality {
  id: string
  ward: string
  district: string
  state: string
}

export type NoticePriority = 'routine' | 'important' | 'time-critical'

export interface Notice {
  id: string
  title: string
  body: string
  localityIds: string[]
  issuedBy: InstitutionRef
  publishedAt: number
  priority: NoticePriority
  category: string
  retracted?: { at: number; reason: string }
  attachmentLabel?: string
}

export interface InstitutionRef {
  id: string
  name: string
  department: string
  /** Set by the institutional MFA login flow (7.0), never self-asserted. */
  verified: boolean
}

export interface PollOption {
  id: string
  label: string
}

export interface Poll {
  id: string
  billTitle: string
  plainSummary: string
  fullTextUrl: string
  fullTextLabel: string
  options: PollOption[]   // max 4, enforced at creation (9.3)
  opensAt: number
  closesAt: number
  localityIds: string[] | 'all'
  issuedBy: InstitutionRef
  /** Un-removable. Present on every poll, no exceptions (design principle 3). */
  advisoryOnly: true
  editWindowMs: number
}

export interface Topic {
  id: string
  title: string
  /** Discussion always hangs off a concrete notice or poll — no free-floating forums. */
  anchor: { kind: 'notice' | 'poll'; id: string }
  createdAt: number
}

export type Stance = 'support' | 'oppose' | 'mixed' | 'question'

export interface Post {
  id: string
  topicId: string
  /** The ONLY author identifier stored anywhere on public content. */
  authorPseudonym: string
  body: string
  stance: Stance
  createdAt: number
  agree: number
  disagree: number
  removed?: { at: number; reason: string }
}

export type ReportReason =
  | 'fake-notice'
  | 'abuse'
  | 'spam'
  | 'coordinated'
  | 'misinformation'
  | 'other'

export interface Report {
  id: string
  target: { kind: 'notice' | 'post'; id: string }
  reason: ReportReason
  note: string
  createdAt: number
  status: 'open' | 'removed' | 'dismissed'
  /** Reports are counted, not attributed. No reporter identity is stored. */
}

export interface BrigadingFlag {
  id: string
  subject: string
  signal: string
  detail: string
  raisedAt: number
  /** Never auto-acted on. A human clears it (11.3). */
  status: 'awaiting-review' | 'cleared' | 'actioned'
}

export type GovRole =
  | 'notice-officer'      // 8.0
  | 'poll-officer'        // 9.0
  | 'analyst'             // 10.0
  | 'moderator'           // 11.0

export interface GovAccount {
  id: string
  name: string
  institution: InstitutionRef
  roles: GovRole[]
}
