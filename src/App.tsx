import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Atmosphere } from './components/Atmosphere'
import { BottomNav } from './components/BottomNav'
import { Discover } from './screens/Discover'
import { Matches } from './screens/Matches'
import { Game } from './screens/Game'
import { Profile } from './screens/Profile'
import { Chat } from './screens/Chat'
import { Onboarding } from './screens/Onboarding'
import { useStore } from './lib/store'

const NO_NAV_ROUTES = ['/onboarding', '/chat']

function AppShell() {
  const { state } = useStore()
  const location = useLocation()

  const showNav = !NO_NAV_ROUTES.some((r) => location.pathname.startsWith(r))
  const needsOnboarding = !state.genderPreference

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <>
      <Atmosphere />
      <div className="mx-auto flex h-[100svh] w-full max-w-[460px] flex-col overflow-hidden sm:my-4 sm:h-[calc(100svh-2rem)] sm:rounded-[36px] sm:border sm:border-frost/10 sm:shadow-2xl">
        <main className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/game/:matchId" element={<Game />} />
            <Route path="/chat/:matchId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Routes>
        </main>
        {showNav && <BottomNav />}
      </div>
    </>
  )
}

export default function App() {
  return <AppShell />
}
