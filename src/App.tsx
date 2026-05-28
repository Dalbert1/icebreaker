import { Navigate, Route, Routes } from 'react-router-dom'
import { Atmosphere } from './components/Atmosphere'
import { BottomNav } from './components/BottomNav'
import { Discover } from './screens/Discover'
import { Matches } from './screens/Matches'
import { Game } from './screens/Game'
import { Profile } from './screens/Profile'

export default function App() {
  return (
    <>
      <Atmosphere />
      {/* Mobile-first device column, centered on larger screens. */}
      <div className="mx-auto flex h-[100svh] w-full max-w-[460px] flex-col overflow-hidden sm:my-4 sm:h-[calc(100svh-2rem)] sm:rounded-[36px] sm:border sm:border-frost/10 sm:shadow-2xl">
        <main className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/game/:matchId" element={<Game />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </>
  )
}
