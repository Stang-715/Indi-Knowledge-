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

/** What still works with no connection, for the offline sheet to state plainly. */
export const OFFLINE_CAPABILITIES = [
  { works: true, label: 'Talking to Sarathi', detail: 'He runs on your phone, not on a server' },
  { works: true, label: 'Notices you have opened', detail: 'Kept on the device once read' },
  { works: true, label: 'Your settings and language', detail: 'Never needed a connection' },
  { works: false, label: 'New notices and bills', detail: 'Arrive when you are back on' },
  { works: false, label: 'Casting a vote', detail: 'Held until there is a connection' },
]
