import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { PROFILES } from '../data/profiles'
import { conversationStartersFor } from '../lib/conversationStarters'
import { isThawRevealed, revealedName } from '../lib/thaw'
import { GradientPortrait } from '../components/GradientPortrait'
import { ThawBar, VibePill } from '../components/ui'

export function Chat() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const { state, sendMessage } = useStore()
  const [input, setInput] = useState('')

  const profile = PROFILES.find((p) => p.id === matchId)
  const match = state.matches.find((m) => m.profileId === matchId)
  const completedGames = state.games.filter((g) => g.matchId === matchId && g.completedAt)
  const hasCompletedGame = completedGames.length > 0

  const messages = useMemo(
    () =>
      state.messages
        .filter((m) => m.matchId === matchId)
        .sort((a, b) => a.sentAt - b.sentAt),
    [state.messages, matchId],
  )

  // Conversation openers derived from the most recently completed round.
  const starters = useMemo(() => {
    if (!profile || completedGames.length === 0) return []
    const latest = completedGames.reduce((a, b) =>
      (a.completedAt ?? 0) >= (b.completedAt ?? 0) ? a : b,
    )
    return conversationStartersFor(latest, profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, completedGames.length])

  function send(body: string) {
    sendMessage(matchId, body)
    setInput('')
  }

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

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

  const revealed = isThawRevealed(match.thaw)
  const displayName = revealedName(profile.name, match.thaw)

  if (!hasCompletedGame) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <GradientPortrait profile={profile} thaw={match.thaw} className="h-28 w-28 rounded-3xl" />
        <div>
          <h1 className="text-3xl text-frost">Break the ice first</h1>
          <p className="mt-2 text-sm text-frost/60">
            Play one icebreaker before chatting with {profile.name}.
          </p>
        </div>
        <Link
          to={`/game/${matchId}`}
          className="bg-thaw rounded-2xl px-5 py-3 text-sm font-semibold text-abyss"
        >
          Start icebreaker
        </Link>
        <Link to="/matches" className="text-sm text-frost/45">
          Back to matches
        </Link>
      </div>
    )
  }

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
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">🧊</span>
            <p className="text-sm text-frost/50">
              The ice is broken with {profile.name}. Kick it off 👇
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.sender === 'you' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.sender === 'you'
                      ? 'bg-thaw rounded-br-md text-abyss'
                      : 'glass rounded-bl-md text-frost'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-frost/8 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        {/* Conversation starters from the last round (only before the first message) */}
        {messages.length === 0 && starters.length > 0 && (
          <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto pb-1">
            {starters.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="glass shrink-0 max-w-[85%] rounded-2xl px-3.5 py-2 text-left text-xs text-frost/85 transition-all hover:border-ice/40 active:scale-[0.98]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) send(input)
          }}
          className="flex items-end gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="glass min-h-[44px] flex-1 rounded-2xl px-4 py-2.5 text-sm text-frost placeholder-frost/30 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-thaw flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold text-abyss transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7Z" />
            </svg>
          </button>
        </form>

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
