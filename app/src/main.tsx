import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startSync } from './core/sync'
/* Order matters. The legacy civic screens' stylesheet loads first; the Chowk
   system loads after it and deliberately wins the tokens and controls the two
   share (--ink, --text-scale, .btn, .chip, .switch, body's ground). Chowk is
   the design system now, so a shared name resolving to Chowk is correct — the
   legacy screens inherit the newer shape rather than fighting it. */
import './styles/global.css'
import './design/base.css'
import './components/chowk/controls.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Offline support. Skipped for the single-file build, which ships no separate
   sw.js to register. Registration failure is otherwise not worth surfacing —
   the app works without it, it just stops working without a connection. */
const SHIPS_SERVICE_WORKER = import.meta.env.VITE_HASH_ROUTER !== 'true'

if ('serviceWorker' in navigator && import.meta.env.PROD && SHIPS_SERVICE_WORKER) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

/* The write queue. Started here rather than inside a screen so that a vote cast
   on one surface still reaches the server if the citizen navigates away, closes
   a sheet, or leaves the app on a dead connection and opens it again on a live
   one. Nothing renders from this; it only drains what is already recorded. */
startSync()
