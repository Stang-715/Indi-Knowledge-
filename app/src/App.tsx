import { lazy, Suspense } from 'react'
import {
  BrowserRouter, HashRouter, Navigate, Route, Routes,
} from 'react-router-dom'

/**
 * Hosting without server-side rewrites (a static artifact host, a file:// build)
 * cannot map /app/polls/:id back to index.html, so those targets use hash
 * routing. A server that can rewrite gets clean paths.
 */
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter
import { SessionProvider, useSession } from './core/session'
import { I18nProvider } from './i18n'
import { GovHome, GovLogin, GovProvider, GovShell, useGov } from './gov/GovPortal'
import ChowkShell from './surfaces/ChowkShell'
import type { GovRole } from './core/types'

/**
 * Everything but the first screen is fetched when it is first opened.
 *
 * The whole app was one 600 kB chunk. On the connections this is built for that
 * is eight seconds before anything appears, and most of it is code the person
 * opening Sarathi will never run — the almanac's tables, the works map, the
 * department portal. Splitting by route means the first paint carries the shell
 * and the surface you asked for, and nothing else.
 *
 * The four surfaces are split from each other for the same reason: they are
 * four rooms, and you enter one at a time.
 */
const Landing = lazy(() => import('./Landing'))
const Onboarding = lazy(() => import('./citizen/Onboarding'))
const CitizenShell = lazy(() => import('./citizen/CitizenShell'))
const Home = lazy(() => import('./citizen/Home'))
const NoticeDetail = lazy(() => import('./citizen/Notices').then((m) => ({ default: m.NoticeDetail })))
const NoticeList = lazy(() => import('./citizen/Notices').then((m) => ({ default: m.NoticeList })))
const PollDetail = lazy(() => import('./citizen/Polls').then((m) => ({ default: m.PollDetail })))
const PollList = lazy(() => import('./citizen/Polls').then((m) => ({ default: m.PollList })))
const ThreadView = lazy(() => import('./citizen/Discussion').then((m) => ({ default: m.ThreadView })))
const TopicList = lazy(() => import('./citizen/Discussion').then((m) => ({ default: m.TopicList })))
const Inbox = lazy(() => import('./citizen/InboxSearch').then((m) => ({ default: m.Inbox })))
const Search = lazy(() => import('./citizen/InboxSearch').then((m) => ({ default: m.Search })))
const AccessibilitySettings = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.AccessibilitySettings })))
const AssistedUse = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.AssistedUse })))
const Help = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.Help })))
const LocalitySettings = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.LocalitySettings })))
const NotificationSettings = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.NotificationSettings })))
const PrivacyCentre = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.PrivacyCentre })))
const ProfileIndex = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.ProfileIndex })))
const PseudonymSettings = lazy(() => import('./citizen/Profile').then((m) => ({ default: m.PseudonymSettings })))

const SarathiSurface = lazy(() => import('./surfaces/sarathi/SarathiSurface'))
const BharatSurface = lazy(() => import('./surfaces/bharat/BharatSurface'))
const Weather = lazy(() => import('./surfaces/bharat/Weather'))
const Trade = lazy(() => import('./surfaces/bharat/Trade'))
const Shops = lazy(() => import('./surfaces/bharat/Shops'))
const StoreProfile = lazy(() => import('./surfaces/bharat/Shops').then((m) => ({ default: m.StoreProfile })))
const PublicMap = lazy(() => import('./surfaces/bharat/PublicMap'))
const WorksSurface = lazy(() => import('./surfaces/works/WorksSurface'))
const WorkDetail = lazy(() => import('./surfaces/works/WorkDetail'))
const MyStreets = lazy(() => import('./surfaces/works/MyStreets'))
const WorksRecord = lazy(() => import('./surfaces/works/Record'))
const Permit = lazy(() => import('./surfaces/works/Permit'))
const BillsSurface = lazy(() => import('./surfaces/bills/BillsSurface'))
const BillDetail = lazy(() => import('./surfaces/bills/BillDetail'))
const Constitution = lazy(() => import('./surfaces/bills/Constitution'))
const Constituency = lazy(() => import('./surfaces/bills/Constituency'))
const Debate = lazy(() => import('./surfaces/bills/Debate'))

const NoticeComposer = lazy(() => import('./gov/Compose').then((m) => ({ default: m.NoticeComposer })))
const PollComposer = lazy(() => import('./gov/Compose').then((m) => ({ default: m.PollComposer })))
const Dashboards = lazy(() => import('./gov/Dashboards'))
const GovWorks = lazy(() => import('./gov/Works'))
const Moderation = lazy(() => import('./gov/Moderation'))
const Oversight = lazy(() => import('./oversight/Oversight'))


/**
 * Shown while a route's chunk is still arriving.
 *
 * Deliberately quiet: a spinner that appears for 80ms on a fast connection is
 * noise, and one that never appears on a slow one is a blank page. This is the
 * app's own loading state, which every screen already has a designed version
 * of.
 */
function RouteLoading() {
  return (
    <div className="route-wait" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
    </div>
  )
}

/** Onboarding is not skippable — a pseudonym is required before anything can be said. */
function RequireOnboarding({ children }: { children: React.ReactElement }) {
  const { prefs, voice } = useSession()
  if (!prefs.onboarded || !voice) return <Navigate to="/welcome" replace />
  return children
}

/** Role gating (7.0): sections outside an account's roles are not routable. */
function RequireRole({ role, children }: { role: GovRole; children: React.ReactElement }) {
  const { account, can } = useGov()
  if (!account) return <Navigate to="/gov" replace />
  if (!can(role)) return <Navigate to="/gov/home" replace />
  return children
}

function Localised({ children }: { children: React.ReactNode }) {
  const { prefs } = useSession()
  return <I18nProvider locale={prefs.locale}>{children}</I18nProvider>
}

export default function App() {
  return (
    <SessionProvider>
      <Localised>
        <GovProvider>
          <Router>
            {/* One fallback for the whole tree. A route arriving a beat late on
                a slow connection should read as the app thinking, not as a
                blank screen — and it must not shift the layout when it lands. */}
            <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* --------------------------- Chowk ---------------------------- *
               * The four surfaces. Surface 1 is built; 2, 3 and 4 state what is
               * coming and link to whatever already works. */}
              <Route
                path="/s"
                element={
                  <RequireOnboarding>
                    <ChowkShell />
                  </RequireOnboarding>
                }
              >
                <Route index element={<Navigate to="/s/sarathi" replace />} />
                <Route path="sarathi" element={<SarathiSurface />} />
                <Route path="bharat" element={<BharatSurface />} />
                <Route path="bharat/weather" element={<Weather />} />
                <Route path="bharat/trade" element={<Trade />} />
                <Route path="bharat/shops" element={<Shops />} />
                <Route path="bharat/shops/:id" element={<StoreProfile />} />
                <Route path="bharat/map" element={<PublicMap />} />
                <Route path="bills" element={<BillsSurface />} />
                <Route path="bills/b/:id" element={<BillDetail />} />
                <Route path="bills/constitution" element={<Constitution />} />
                <Route path="bills/constituency" element={<Constituency />} />
                <Route path="bills/debate/:id" element={<Debate />} />
                <Route path="works" element={<WorksSurface />} />
                <Route path="works/w/:id" element={<WorkDetail />} />
                <Route path="works/mine" element={<MyStreets />} />
                <Route path="works/record" element={<WorksRecord />} />
                <Route path="works/permit" element={<Permit />} />
              </Route>

              <Route path="/" element={<Landing />} />
              <Route path="/welcome" element={<Onboarding />} />

              {/* ---------------------------- citizen app --------------------------- */}
              <Route
                path="/app"
                element={
                  <RequireOnboarding>
                    <CitizenShell />
                  </RequireOnboarding>
                }
              >
                <Route index element={<Home />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="search" element={<Search />} />

                <Route path="works" element={<GovWorks />} />
                <Route path="notices" element={<NoticeList />} />
                <Route path="notices/archive" element={<NoticeList archive />} />
                <Route path="notices/:id" element={<NoticeDetail />} />

                <Route path="polls" element={<PollList />} />
                <Route path="polls/archive" element={<PollList archive />} />
                <Route path="polls/:id" element={<PollDetail />} />

                <Route path="discuss" element={<TopicList />} />
                <Route path="discuss/:id" element={<ThreadView />} />

                <Route path="profile" element={<ProfileIndex />} />
                <Route path="profile/pseudonym" element={<PseudonymSettings />} />
                <Route path="profile/notifications" element={<NotificationSettings />} />
                <Route path="profile/locality" element={<LocalitySettings />} />
                <Route path="profile/privacy" element={<PrivacyCentre />} />
                <Route path="profile/accessibility" element={<AccessibilitySettings />} />
                <Route path="profile/assist" element={<AssistedUse />} />
                <Route path="profile/help" element={<Help />} />
              </Route>

              {/* -------------------------- government portal ------------------------ */}
              <Route path="/gov" element={<GovLogin />} />
              <Route path="/gov" element={<GovShell />}>
                <Route path="home" element={<GovHome />} />
                <Route
                  path="notices"
                  element={<RequireRole role="notice-officer"><NoticeComposer /></RequireRole>}
                />
                <Route
                  path="polls"
                  element={<RequireRole role="poll-officer"><PollComposer /></RequireRole>}
                />
                <Route
                  path="dashboards"
                  element={<RequireRole role="analyst"><Dashboards /></RequireRole>}
                />
                <Route
                  path="moderation"
                  element={<RequireRole role="moderator"><Moderation /></RequireRole>}
                />
              </Route>

              {/* --------------------------- oversight layer ------------------------- */}
              <Route path="/oversight" element={<Oversight />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Router>
        </GovProvider>
      </Localised>
    </SessionProvider>
  )
}
