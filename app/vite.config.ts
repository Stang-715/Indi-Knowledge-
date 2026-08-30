import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Two targets from one source.
 *
 *   web    — absolute base, history routing, SPA rewrites handled by the host
 *   native — relative base, hash routing, no server to rewrite anything
 *
 * The native build's assets have to resolve from wherever the WebView happens
 * to serve the page, so its base is relative. Hash routing is set by the same
 * flag because a WebView has no server to map /s/sarathi back to index.html.
 */
export default defineConfig(({ mode }) => {
  const native = process.env.VITE_HASH_ROUTER === 'true'
  return {
    base: native ? './' : '/',
    plugins: [react()],
    build: {
      outDir: native ? 'dist' : 'dist',
      sourcemap: mode === 'development',
    },
  }
})
