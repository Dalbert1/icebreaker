import { useStore } from '../lib/store'
import { ME } from '../data/profiles'
import { GradientPortrait } from '../components/GradientPortrait'
import { VibePill, Glass } from '../components/ui'

export function Profile() {
  const { state, isSupabaseConfigured, reset, signOut } = useStore()
  const roundsPlayed = state.games.filter((g) => g.completedAt).length

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto px-4 pb-4">
      <header className="py-3">
        <h1 className="text-3xl">Your profile</h1>
      </header>

      <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
        <GradientPortrait profile={ME} thaw={1} className="aspect-[4/3] w-full" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,8,17,0.9), transparent 55%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="text-2xl text-frost">
            {ME.name}, <span className="font-light text-frost/80">{ME.age}</span>
          </h2>
          <p className="text-sm text-ice/80">{ME.bio}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCard value={state.matches.length} label="Matches" />
        <StatCard value={roundsPlayed} label="Rounds" />
        <StatCard value={state.liked.length} label="Thawed" />
      </div>

      <Glass className="mt-3 p-4">
        <p className="text-[11px] uppercase tracking-wider text-amber/80">{ME.prompt.question}</p>
        <p className="mt-0.5 text-frost/90">{ME.prompt.answer}</p>
      </Glass>

      <div className="mt-3">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-frost/45">Your vibes</p>
        <div className="flex flex-wrap gap-1.5">
          {ME.vibes.map((v) => (
            <VibePill key={v} vibe={v} />
          ))}
        </div>
      </div>

      {isSupabaseConfigured && (
        <Glass className="mt-4 p-4">
          <p className="text-[11px] uppercase tracking-wider text-amber/80">Account</p>
          {state.auth.status === 'signedIn' ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-frost/90">{state.auth.email}</p>
                <p className="text-xs text-frost/45">Synced with Supabase</p>
              </div>
              <button
                onClick={signOut}
                className="shrink-0 rounded-full border border-frost/12 px-3 py-1.5 text-xs text-frost/60 hover:border-ember/40 hover:text-ember"
              >
                Sign out
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-frost/55">
              Sign in from onboarding to sync this profile.
            </p>
          )}
          {state.auth.error && <p className="mt-2 text-xs text-ember">{state.auth.error}</p>}
        </Glass>
      )}

      <div className="mt-auto pt-6">
        <button
          onClick={() => {
            if (confirm('Reset the demo? This clears matches, likes, and games.')) reset()
          }}
          className="w-full rounded-2xl border border-frost/12 py-3 text-sm font-medium text-frost/55 hover:border-ember/40 hover:text-ember"
        >
          Reset demo data
        </button>
        <p className="mt-2 text-center text-[11px] text-frost/35">
          POC · mock data · no account yet
        </p>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass flex flex-col items-center gap-0.5 py-3" style={{ borderRadius: '18px' }}>
      <span className="font-display text-2xl text-frost">{value}</span>
      <span className="text-[11px] text-frost/55">{label}</span>
    </div>
  )
}
