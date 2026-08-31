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
import Landing from './Landing'
import Onboarding from './citizen/Onboarding'
import CitizenShell from './citizen/CitizenShell'
import Home from './citizen/Home'
import { NoticeDetail, NoticeList } from './citizen/Notices'
import { PollDetail, PollList } from './citizen/Polls'
import { ThreadView, TopicList } from './citizen/Discussion'
import { Inbox, Search } from './citizen/InboxSearch'
import {
  AccessibilitySettings, Help, LocalitySettings, NotificationSettings,
  PrivacyCentre, ProfileIndex, PseudonymSettings,
} from './citizen/Profile'
import { GovHome, GovLogin, GovProvider, GovShell, useGov } from './gov/GovPortal'
import ChowkShell from './surfaces/ChowkShell'
import SarathiSurface from './surfaces/sarathi/SarathiSurface'
import { BharatStub } from './surfaces/stubs'
import WorksSurface from './surfaces/works/WorksSurface'
import WorkDetail from './surfaces/works/WorkDetail'
import MyStreets from './surfaces/works/MyStreets'
import WorksRecord from './surfaces/works/Record'
import BillsSurface from './surfaces/bills/BillsSurface'
import BillDetail from './surfaces/bills/BillDetail'
import Constitution from './surfaces/bills/Constitution'
import Constituency from './surfaces/bills/Constituency'
import Debate from './surfaces/bills/Debate'
import { NoticeComposer, PollComposer } from './gov/Compose'
import Dashboards from './gov/Dashboards'
import Moderation from './gov/Moderation'
import Oversight from './oversight/Oversight'
import type { GovRole } from './core/types'

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
                <Route path="bharat" element={<BharatStub />} />
                <Route path="bills" element={<BillsSurface />} />
                <Route path="bills/b/:id" element={<BillDetail />} />
                <Route path="bills/constitution" element={<Constitution />} />
                <Route path="bills/constituency" element={<Constituency />} />
                <Route path="bills/debate/:id" element={<Debate />} />
                <Route path="works" element={<WorksSurface />} />
                <Route path="works/w/:id" element={<WorkDetail />} />
                <Route path="works/mine" element={<MyStreets />} />
                <Route path="works/record" element={<WorksRecord />} />
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
          </Router>
        </GovProvider>
      </Localised>
    </SessionProvider>
  )
}
