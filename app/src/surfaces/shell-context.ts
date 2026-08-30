import { createContext, useContext } from 'react'
import type { Activity, IslandState } from '../components/chowk/DynamicIsland'

/**
 * How a surface talks to the shell.
 *
 * Kept deliberately narrow: a surface may raise a live activity and register
 * what the island's contextual action does. It cannot reach anything else in
 * the shell, which is what stops the four surfaces growing into each other.
 */

export interface IslandApi {
  raise: (activity: Activity | null, state?: IslandState) => void
  dismiss: () => void
}

export const IslandContext = createContext<IslandApi>({
  raise: () => {},
  dismiss: () => {},
})

export const ActionContext = createContext<{ register: (fn: (() => void) | null) => void }>({
  register: () => {},
})

export const useIsland = () => useContext(IslandContext)
export const useSurfaceAction = () => useContext(ActionContext)
