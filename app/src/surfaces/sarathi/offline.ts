import { useEffect, useState } from 'react'

/**
 * 1.6 — offline.
 *
 * Sarathi is part of the bundle rather than a service, so he keeps working with
 * no signal. That is worth saying out loud in the interface: the moment a
 * connection drops, most apps go quiet and people assume everything is broken.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return online
}

/**
 * What still works with no connection, for the offline sheet to state plainly.
 * Keys rather than text — this list is read by people whose connection is the
 * least reliable thing about their day, in whichever language they chose.
 */
export const OFFLINE_CAPABILITIES: { works: boolean; key: string }[] = [
  { works: true, key: 'sarathi' },
  { works: true, key: 'notices' },
  { works: true, key: 'settings' },
  { works: false, key: 'new' },
  { works: false, key: 'vote' },
]
