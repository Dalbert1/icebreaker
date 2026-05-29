import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PROFILES } from '../data/profiles'
import { GradientPortrait } from '../components/GradientPortrait'
import { ThawBar, VibePill } from '../components/ui'

export function Chat() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()
  const [input, setInput] = useState('')

  const profile = PROFILES.find((p) => p.id === matchId)
  const match = state.matches.find((m) => m.profileId === matchId)

  if (!profile || !match) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-frost/70">That match isn't available.</p>
        <Link to="/matches" className="bg-thaw rounded-full px-5 py-2.5 text-sm font-semibold text-abyss">
          Back to matches
        </Link>
      </div>
    )
  }

  const revealed = match.thaw >= 0.5
  const displayName = revealed ? profile.name : `${profile.name.charAt(0)}······`

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="glass flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/matches')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-frost/70"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <GradientPortrait profile={profile} thaw={match.thaw} className="h-11 w-11 rounded-xl" />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-frost">{displayName}</h2>
          <div className="mt-0.5">
            <ThawBar thaw={match.thaw} showLabel={false} />
          </div>
        </div>

        <Link
          to={`/game/${matchId}`}
          className="shrink-0 text-xs text-frost/50 hover:text-frost/80"
        >
          Profile
        </Link>
      </header>

      {/* Profile reveal strip */}
      {revealed && (
        <div className="shrink-0 border-b border-frost/8 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-frost/60">
            <span className="font-medium text-frost">{profile.age}</span>
            <span>·</span>
            <span>{profile.location}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.vibes.map((v) => (
              <VibePill key={v} vibe={v} />
            ))}
          </div>
          <p className="mt-2 text-xs text-frost/55 italic">"{profile.prompt.answer}"</p>
        </div>
      )}

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <span className="text-4xl">🧊</span>
          <p className="text-sm text-frost/50">
            {revealed
              ? `Say hi to ${profile.name}! The ice is broken — make it count.`
              : 'Play another icebreaker to reveal more before you say hello.'}
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-frost/8 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="glass min-h-[44px] flex-1 rounded-2xl px-4 py-2.5 text-sm text-frost placeholder-frost/30 outline-none"
          />
          <button
            disabled={!input.trim()}
            className="bg-thaw flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold text-abyss transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7Z" />
            </svg>
          </button>
        </div>

        {/* Play Icebreaker */}
        <Link
          to={`/game/${matchId}`}
          className="glass mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-frost/90 transition-all hover:border-ice/40 active:scale-[0.98]"
        >
          <span>🧊</span>
          Play Icebreaker
        </Link>
      </div>
    </div>
  )
}
