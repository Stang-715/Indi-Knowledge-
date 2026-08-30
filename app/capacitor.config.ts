import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor wraps the same build that serves the web app into iOS and Android
 * binaries — one codebase, three targets. Nothing in the app knows it is inside
 * a native shell.
 *
 * To produce the native projects:
 *   npm run build
 *   npx cap add ios          (macOS with Xcode)
 *   npx cap add android      (Android Studio)
 *   npx cap sync
 *
 * `ios/` and `android/` are generated and are not committed — `cap add`
 * recreates them from this config on any machine.
 */
const config: CapacitorConfig = {
  appId: 'in.chowk.app',
  appName: 'Chowk',
  webDir: 'dist',

  // Routing must be hash-based inside the native shell: the WebView serves
  // files from disk with no server to rewrite /s/sarathi back to index.html.
  // The single-file build already sets VITE_HASH_ROUTER for the same reason.
  server: { androidScheme: 'https' },

  ios: {
    contentInset: 'always',
    // The dynamic island and the floating dock both position against the safe
    // area, so the web layer must extend under the system bars.
    limitsNavigationsToAppBoundDomains: true,
  },

  android: {
    // Sarathi's mesh and glass need the GPU path; the software renderer makes
    // backdrop-filter unusable on mid-range handsets.
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    // Microphone permission for 1.2 is requested by the WebView on first use;
    // the strings live in the native manifests, added by `cap add`.
  },
}

export default config
