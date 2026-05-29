import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PROFILES } from '../data/profiles'
import { GradientPortrait } from '../components/GradientPortrait'
import { ThawBar } from '../components/ui'

export function Matches() {
  const { state } = useStore()
  const byId = new Map(PROFILES.map((p) => [p.id, p]))
  const matches = [...state.matches].sort((a, b) => b.matchedAt - a.matchedAt)

  return (
    <div className="flex h-full flex-col px-4">
      <header className="py-3">
        <h1 className="text-3xl">Your matches</h1>
        <p className="text-sm text-frost/55">Break the ice to reveal who they really are.</p>
      </header>

      {matches.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="text-5xl">🧊</div>
          <h3 className="text-xl text-frost">No matches yet</h3>
          <p className="max-w-xs text-sm text-frost/55">
            Head to Discover and thaw a few profiles. Mutual likes show up here.
          </p>
          <Link
            to="/discover"
            className="bg-thaw mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-abyss"
          >
            Start discovering
          </Link>
        </div>
      ) : (
        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto pb-4">
          {matches.map((m) => {
            const p = byId.get(m.profileId)
            if (!p) return null
            const games = state.games.filter((g) => g.matchId === m.profileId && g.completedAt)
            return (
              <Link
                key={m.profileId}
                to={`/chat/${m.profileId}`}
                className="glass flex items-center gap-4 p-3 transition-transform active:scale-[0.99]"
                style={{ borderRadius: '20px' }}
              >
                <GradientPortrait
                  profile={p}
                  thaw={m.thaw}
                  className="h-20 w-16 shrink-0 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-lg text-frost">
                      {m.thaw >= 0.5 ? p.name : `${p.name.charAt(0)}······`}
                      <span className="ml-1.5 text-sm font-light text-frost/60">{p.age}</span>
                    </h3>
                    <span className="shrink-0 text-[11px] text-frost/40">
                      {games.length} {games.length === 1 ? 'round' : 'rounds'}
                    </span>
                  </div>
                  <p className="mt-0.5 mb-2 truncate text-xs text-frost/55">
                    {m.thaw >= 0.5 ? p.bio : 'Answer trivia together to reveal more…'}
                  </p>
                  <ThawBar thaw={m.thaw} showLabel={false} />
                </div>
                <span className="bg-thaw shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-abyss">
                  {games.length ? 'Chat' : 'Break ice'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
