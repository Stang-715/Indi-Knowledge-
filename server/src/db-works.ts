import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * The works database — the fourth store, and the only public one.
 *
 * Roadworks, permits and the register of departments are public records. Unlike
 * the other three files there is nothing here to protect: no pseudonym, no
 * identity, no citizen at all. It is a separate file anyway, for the same
 * reason as the others — a store that cannot be joined to the identity layers
 * is a store nobody can be tempted to join to them, and "the works table has a
 * citizen column now" is a change that has to be impossible rather than
 * discouraged.
 *
 * What it holds:
 *   - the register of departments and their signing keys
 *   - filed works, each signed by the department that filed it
 *   - issued permits, each signed by the approving authority
 *
 * Every row here may be read by anyone. That is the point: a permit nobody
 * outside the system can verify is a number on a piece of paper.
 */

const PATH = process.env.CHOWK_WORKS_DB ?? '.data/works.db'

mkdirSync(dirname(PATH), { recursive: true })
const db = new DatabaseSync(PATH)

db.exec(`
  PRAGMA journal_mode = WAL;

  -- The register. A department exists here because the registry root signed it
  -- in, and the signature travels with the row so anybody can check that
  -- without asking this server to vouch for itself.
  CREATE TABLE IF NOT EXISTS department (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    utility       TEXT NOT NULL,
    public_key    TEXT NOT NULL,
    registered_at INTEGER NOT NULL,
    -- Whether this body may approve works and issue permits, not merely file.
    approver      INTEGER NOT NULL DEFAULT 0,
    -- The registry root's signature over this row.
    root_sig      TEXT NOT NULL,
    -- How the body came to be enrolled. 'automatic' is the demo gate and says so.
    enrolled_by   TEXT NOT NULL
  );

  -- A filed work. The signature is the department's, over the filing as sent.
  CREATE TABLE IF NOT EXISTS filing (
    id          TEXT PRIMARY KEY,
    department  TEXT NOT NULL,
    stretch     TEXT NOT NULL,
    utility     TEXT NOT NULL,
    reason      TEXT NOT NULL,
    starts_at   INTEGER NOT NULL,
    restore_by  INTEGER NOT NULL,
    closure     TEXT NOT NULL CHECK (closure IN ('full','partial','none')),
    filed_at    INTEGER NOT NULL,
    state       TEXT NOT NULL CHECK (state IN ('filed','clashed','approved','refused','withdrawn')),
    sig         TEXT NOT NULL,
    -- Set when an approver refuses, so a refusal carries a reason rather than
    -- a silence the department has to chase.
    decided_at  INTEGER,
    decided_by  TEXT,
    note        TEXT
  );

  -- An issued permit. Signed by the approving authority, verifiable by anyone
  -- holding the registry root key — which the app pins rather than fetches.
  CREATE TABLE IF NOT EXISTS permit (
    number      TEXT PRIMARY KEY,
    filing      TEXT NOT NULL,
    issued_by   TEXT NOT NULL,
    issued_at   INTEGER NOT NULL,
    sig         TEXT NOT NULL
  );

  -- A shop, listed by whoever runs it.
  --
  -- There is no pseudonym column here and there never may be. A shop has a
  -- name and a stated address; the person who listed it has a pseudonym they
  -- post and vote under. Joining the two would make every pseudonymous
  -- opinion its owner ever expressed attributable to a named business at a
  -- known address — a deanonymisation this platform would have performed on
  -- itself, for the convenience of an edit button.
  --
  -- What is stored instead is the digest of a secret the listing device holds.
  -- It proves you can edit this listing and says nothing about who you are.
  CREATE TABLE IF NOT EXISTS store (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    category     TEXT NOT NULL,
    address      TEXT NOT NULL,
    locality     TEXT NOT NULL,
    district     TEXT NOT NULL,
    state_code   TEXT NOT NULL,
    what         TEXT NOT NULL,
    hours        TEXT,
    phone        TEXT,
    at_x         REAL,
    at_y         REAL,
    listed_at    INTEGER NOT NULL,
    -- False until a human has checked it against something. The directory says
    -- so rather than implying a check nobody performed.
    verified     INTEGER NOT NULL DEFAULT 0,
    removed_at   INTEGER,
    removed_reason TEXT,
    owner_digest TEXT NOT NULL
  );

  -- Reports against listings. Auto-publish with a report route was the plan;
  -- this is the route, and it needs a human behind it from day one.
  CREATE TABLE IF NOT EXISTS store_report (
    id        TEXT PRIMARY KEY,
    store     TEXT NOT NULL,
    reason    TEXT NOT NULL,
    note      TEXT,
    at        INTEGER NOT NULL,
    status    TEXT NOT NULL CHECK (status IN ('open','upheld','dismissed'))
  );

  -- The registry root's own key, so it survives a restart. A root that changed
  -- on every deploy would invalidate every permit ever issued.
  CREATE TABLE IF NOT EXISTS root_key (
    id  INTEGER PRIMARY KEY CHECK (id = 1),
    jwk TEXT NOT NULL
  );
`)

/* --------------------------------- the root -------------------------------- */

export function loadRootJwk(): string | null {
  const row = db.prepare('SELECT jwk FROM root_key WHERE id = 1').get() as
    { jwk: string } | undefined
  return row?.jwk ?? null
}

export function saveRootJwk(jwk: string): void {
  db.prepare('INSERT OR REPLACE INTO root_key (id, jwk) VALUES (1, ?)').run(jwk)
}

/* ------------------------------- the register ------------------------------ */

export interface DepartmentRow {
  id: string
  name: string
  utility: string
  public_key: string
  registered_at: number
  approver: number
  root_sig: string
  enrolled_by: string
}

export function enrol(row: DepartmentRow): boolean {
  const held = db.prepare('SELECT public_key FROM department WHERE id = ?').get(row.id) as
    { public_key: string } | undefined

  // Idempotent for the key that already holds the entry, and refused for any
  // other — the same rule pseudonyms follow, for the same reason.
  if (held) return held.public_key === row.public_key

  db.prepare(`
    INSERT INTO department
      (id, name, utility, public_key, registered_at, approver, root_sig, enrolled_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(row.id, row.name, row.utility, row.public_key, row.registered_at,
    row.approver, row.root_sig, row.enrolled_by)
  return true
}

export function department(id: string): DepartmentRow | undefined {
  return db.prepare('SELECT * FROM department WHERE id = ?').get(id) as
    DepartmentRow | undefined
}

export function departments(): DepartmentRow[] {
  return db.prepare('SELECT * FROM department ORDER BY name').all() as DepartmentRow[]
}

/* --------------------------------- filings --------------------------------- */

export interface FilingRow {
  id: string
  department: string
  stretch: string
  utility: string
  reason: string
  starts_at: number
  restore_by: number
  closure: string
  filed_at: number
  state: string
  sig: string
  decided_at?: number | null
  decided_by?: string | null
  note?: string | null
}

export function file(row: FilingRow): void {
  db.prepare(`
    INSERT OR IGNORE INTO filing
      (id, department, stretch, utility, reason, starts_at, restore_by, closure,
       filed_at, state, sig)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(row.id, row.department, row.stretch, row.utility, row.reason,
    row.starts_at, row.restore_by, row.closure, row.filed_at, row.state, row.sig)
}

export function filing(id: string): FilingRow | undefined {
  return db.prepare('SELECT * FROM filing WHERE id = ?').get(id) as FilingRow | undefined
}

export function filings(state?: string): FilingRow[] {
  return (state
    ? db.prepare('SELECT * FROM filing WHERE state = ? ORDER BY starts_at').all(state)
    : db.prepare('SELECT * FROM filing ORDER BY starts_at').all()) as FilingRow[]
}

export function decide(
  id: string, state: string, by: string, note: string, at = Date.now(),
): void {
  db.prepare(
    'UPDATE filing SET state = ?, decided_by = ?, decided_at = ?, note = ? WHERE id = ?',
  ).run(state, by, at, note, id)
}

/**
 * Works booked on the same stretch whose windows overlap.
 *
 * The whole point of 4.3: water booked this stretch last week, and the road
 * department is about to book it again. Resolving that before approval is the
 * difference between one dig and two, and it is a query rather than a meeting.
 *
 * Refused and withdrawn filings are excluded — a clash with something nobody is
 * going to do is not a clash. Approved ones are very much included.
 */
export function clashes(
  stretch: string, startsAt: number, restoreBy: number, exclude?: string,
): FilingRow[] {
  return db.prepare(`
    SELECT * FROM filing
    WHERE stretch = ?
      AND state IN ('filed', 'clashed', 'approved')
      AND id IS NOT ?
      AND starts_at <= ?
      AND restore_by >= ?
    ORDER BY starts_at
  `).all(stretch, exclude ?? '', restoreBy, startsAt) as FilingRow[]
}

/* --------------------------------- permits --------------------------------- */

export interface PermitRow {
  number: string
  filing: string
  issued_by: string
  issued_at: number
  sig: string
}

export function issue(row: PermitRow): void {
  db.prepare(`
    INSERT OR IGNORE INTO permit (number, filing, issued_by, issued_at, sig)
    VALUES (?, ?, ?, ?, ?)
  `).run(row.number, row.filing, row.issued_by, row.issued_at, row.sig)
}

export function permit(number: string): PermitRow | undefined {
  return db.prepare('SELECT * FROM permit WHERE number = ?').get(number) as
    PermitRow | undefined
}

export function permitForFiling(filingId: string): PermitRow | undefined {
  return db.prepare('SELECT * FROM permit WHERE filing = ?').get(filingId) as
    PermitRow | undefined
}

export function permits(): PermitRow[] {
  return db.prepare('SELECT * FROM permit ORDER BY issued_at DESC').all() as PermitRow[]
}


/* ---------------------------------- stores --------------------------------- */

export interface StoreRow {
  id: string
  name: string
  category: string
  address: string
  locality: string
  district: string
  state_code: string
  what: string
  hours?: string | null
  phone?: string | null
  at_x?: number | null
  at_y?: number | null
  listed_at: number
  verified: number
  removed_at?: number | null
  removed_reason?: string | null
  owner_digest: string
}

export function listStores(): StoreRow[] {
  return db.prepare('SELECT * FROM store ORDER BY listed_at DESC').all() as StoreRow[]
}

export function store(id: string): StoreRow | undefined {
  return db.prepare('SELECT * FROM store WHERE id = ?').get(id) as StoreRow | undefined
}

export function putStore(row: StoreRow): void {
  db.prepare(`
    INSERT OR IGNORE INTO store
      (id, name, category, address, locality, district, state_code, what, hours, phone,
       at_x, at_y, listed_at, verified, owner_digest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(row.id, row.name, row.category, row.address, row.locality, row.district,
    row.state_code, row.what, row.hours ?? null, row.phone ?? null,
    row.at_x ?? null, row.at_y ?? null, row.listed_at, row.owner_digest)
}

/** Edits are gated on the digest, which is a capability rather than an identity. */
export function editStore(id: string, digest: string, patch: Partial<StoreRow>): boolean {
  const held = store(id)
  if (!held || held.owner_digest !== digest) return false
  db.prepare(`
    UPDATE store SET name = ?, category = ?, address = ?, what = ?, hours = ?, phone = ?
    WHERE id = ?
  `).run(
    patch.name ?? held.name, patch.category ?? held.category,
    patch.address ?? held.address, patch.what ?? held.what,
    patch.hours ?? held.hours ?? null, patch.phone ?? held.phone ?? null, id,
  )
  return true
}

export function reportStore(id: string, storeId: string, reason: string, note: string): void {
  db.prepare(`
    INSERT OR IGNORE INTO store_report (id, store, reason, note, at, status)
    VALUES (?, ?, ?, ?, ?, 'open')
  `).run(id, storeId, reason, note, Date.now())
}

export function storeReports(status = 'open'): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM store_report WHERE status = ? ORDER BY at DESC')
    .all(status) as Record<string, unknown>[]
}
