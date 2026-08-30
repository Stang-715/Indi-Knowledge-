import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

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
