# Building Chowk as an iOS / Android app

One codebase, three targets. Capacitor wraps the same build that serves the web
app; nothing in the app knows it is inside a native shell.

```bash
npm run build          # web target  — absolute base, history routing
npm run build:native   # native target — relative base, hash routing
npm run sync:native    # build:native, then copy into the native projects

npx cap add ios        # macOS with Xcode
npx cap add android    # Android Studio
npx cap open ios       # or: npx cap open android
```

`ios/` and `android/` are generated and are not committed — `npx cap add`
recreates them from `capacitor.config.ts` on any machine.

## Why the native target differs

Two things break in a WebView and both are handled by one flag,
`VITE_HASH_ROUTER`:

- **Routing.** A WebView has no server to rewrite `/s/sarathi` back to
  `index.html`, so a cold start on a deep route 404s. The native build uses
  `HashRouter`; the web build keeps clean paths because the host rewrites them.
- **Asset paths.** An absolute base resolves against whatever origin the WebView
  serves from. The native build uses a relative base so the bundle resolves from
  wherever the page sits.

Verified: cold start on `#/s/works` mounts the right surface, the island
navigation works, and the embedded variable fonts load.

## Permissions the native projects need

Surface 1's voice input (1.2) asks the WebView for the microphone on first use.
The permission strings live in the native manifests that `cap add` generates:

- **iOS** — `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription`
  in `ios/App/App/Info.plist`.
- **Android** — `android.permission.RECORD_AUDIO` in
  `android/app/src/main/AndroidManifest.xml`.

Write them in the app's own voice: the microphone is for asking Sarathi a
question, nothing is recorded, and typing does the same job.

## One thing to watch on mid-range Android

The mesh ground and the glass surfaces rely on `backdrop-filter`. Where the
WebView falls back to software rendering it becomes very expensive. The mesh
already pauses when the app is backgrounded and respects reduced motion; if
profiling shows problems on a target handset, the honest fix is to drop the
blur on that tier rather than to lower the frame rate.
