import { useCallback, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import MeshGround from '../components/chowk/MeshGround'
import IslandNav, { type NavTab, type SurfaceId } from '../components/chowk/IslandNav'
import DynamicIsland, { type Activity, type IslandState } from '../components/chowk/DynamicIsland'
import { ActionContext, IslandContext } from './shell-context'
import './shell.css'

const ICONS: Record<SurfaceId, React.ReactNode> = {
  sarathi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
    </svg>
  ),
  bharat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </svg>
  ),
  bills: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9.5 14.5l1.8 1.8 3.4-3.6" />
    </svg>
  ),
  works: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 9 4M20 20 15 4M12 6v2M12 11v2M12 16v2" />
    </svg>
  ),
}

const TABS: NavTab[] = [
  { id: 'sarathi', label: 'Sarathi', hue: '#E8991F', icon: ICONS.sarathi },
  { id: 'bharat', label: 'Bharat', hue: '#0E7C86', icon: ICONS.bharat },
  { id: 'bills', label: 'Bills', hue: '#6B4EA8', icon: ICONS.bills },
  { id: 'works', label: 'Works', hue: '#1F6B4A', icon: ICONS.works },
]

/** The second hue each surface blooms, so no two grounds read the same. */
const GROUND: Record<SurfaceId, [string, string]> = {
  sarathi: ['#E8991F', '#C25A8F'],
  bharat: ['#0E7C86', '#2E7D5B'],
  bills: ['#6B4EA8', '#3E5AA8'],
  works: ['#1F6B4A', '#7A6B22'],
}

/** What the circle on the island means here. It changes per surface. */
const ACTION: Record<SurfaceId, string> = {
  sarathi: 'Ask Sarathi something',
  bharat: 'List your store',
  bills: 'Go to an open vote',
  works: 'File a work',
}

function surfaceFromPath(path: string): SurfaceId {
  const match = /\/s\/(sarathi|bharat|bills|works)/.exec(path)
  return (match?.[1] as SurfaceId) ?? 'sarathi'
}

export default function ChowkShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = surfaceFromPath(location.pathname)

  const [activity, setActivity] = useState<Activity | null>(null)
  const [islandState, setIslandState] = useState<IslandState>('hidden')
  const [action, setAction] = useState<(() => void) | null>(null)

  const [from, to] = GROUND[active]

  const raise = useCallback((next: Activity | null, state: IslandState = 'pill') => {
    setActivity(next)
    setIslandState(next ? state : 'hidden')
  }, [])

  const island = useMemo(() => ({ raise, dismiss: () => raise(null) }), [raise])
  const actionCtx = useMemo(
    () => ({ register: (fn: (() => void) | null) => setAction(() => fn) }),
    [],
  )

  return (
    <div className="shell" data-surface={active}>
      {/* MeshGround wraps the rest of the shell rather than sitting beside it,
          because glass surfaces sample the ground through its context. */}
      <MeshGround from={from} to={to}>

      <DynamicIsland
        activity={activity}
        state={islandState}
        onStateChange={setIslandState}
      />

      <a className="shell__skip" href="#main">Skip to content</a>

      <main className="shell__main" id="main">
        <IslandContext.Provider value={island}>
          <ActionContext.Provider value={actionCtx}>
            <Outlet />
          </ActionContext.Provider>
        </IslandContext.Provider>
      </main>

      <div className="shell__dock">
        <IslandNav
          tabs={TABS}
          active={active}
          onSelect={(id) => navigate(`/s/${id}`)}
          actionLabel={ACTION[active]}
          onAction={() => action?.()}
        />
      </div>
      </MeshGround>
    </div>
  )
}
