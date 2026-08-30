import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * Builds the whole app into one self-contained HTML file — every script, style
 * and icon inlined — for hosts that serve a single page and cannot rewrite
 * routes. Pairs with VITE_HASH_ROUTER=true.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-singlefile',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
