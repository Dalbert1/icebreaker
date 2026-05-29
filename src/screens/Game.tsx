import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useStore } from '../lib/store'
import { PROFILES } from '../data/profiles'
import { CATEGORIES } from '../data/mockQuestions'
import type { GameSession, Profile, TriviaCategory } from '../types'
import { GradientPortrait } from '../components/GradientPortrait'
import { ThawBar } from '../components/ui'

type Phase = 'category' | 'playing' | 'wantchat'
const QUESTION_SECONDS = 15

export function Game() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const { state, startGame, answer, timeout, completeGame, unmatch } = useStore()

  const profile = PROFILES.find((p) => p.id === matchId)
  const match = state.matches.find((m) => m.profileId === matchId)

  // resume an in-progress game for this match if one exists
  const existing = state.games.find((g) => g.matchId === matchId && !g.completedAt)
  const [phase, setPhase] = useState<Phase>(existing ? 'playing' : 'category')
  const [gameId, setGameId] = useState<string | null>(existing?.id ?? null)
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const game = state.games.find((g) => g.id === gameId) ?? null

  if (!profile || !match) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">🧭</div>
        <p className="text-frost/70">That match isn't available.</p>
        <Link to="/matches" className="bg-thaw rounded-full px-5 py-2.5 text-sm font-semibold text-abyss">
          Back to matches
        </Link>
      </div>
    )
  }

  async function pickCategory(category: TriviaCategory) {
    setLoading(true)
    const id = await startGame(matchId, category)
    setGameId(id)
    setQIndex(0)
    setPicked(null)
    setPhase('playing')
    setLoading(false)
  }

  // live thaw: existing thaw + progress through this round
  const answered = game ? game.userAnswers.filter((a) => a >= 0).length : 0
  const liveThaw = game
    ? Math.min(1, match.thaw + (answered / game.questions.length) * 0.5)
    : match.thaw

  return (
    <div className="flex h-full flex-col px-4">
      {phase !== 'wantchat' && (
        <header className="flex items-center gap-3 py-3">
          <button
            onClick={() => navigate(-1)}
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-frost/70"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <GradientPortrait profile={profile} thaw={liveThaw} className="h-11 w-11 rounded-xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg leading-tight text-frost">
              {liveThaw >= 0.5 ? profile.name : `${profile.name.charAt(0)}······`}
            </h2>
            <div className="mt-0.5">
              <ThawBar thaw={liveThaw} showLabel={false} />
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1 flex-col">
        {phase === 'category' && <CategoryPicker loading={loading} onPick={pickCategory} />}
        {phase === 'playing' && game && (
          <PlayRound
            key={`${game.id}-${qIndex}`}
            game={game}
            qIndex={qIndex}
            picked={picked}
            timedOut={game.timedOut?.[qIndex] ?? false}
            onPick={(opt) => {
              if (picked !== null) return
              setPicked(opt)
              answer(game.id, qIndex, opt)
            }}
            onTimeout={() => {
              setPicked(null)
              timeout(game.id, qIndex)
            }}
            onNext={() => {
              if (qIndex + 1 >= game.questions.length) {
                completeGame(game.id)
                setPhase('wantchat')
              } else {
                setQIndex((i) => i + 1)
                setPicked(null)
              }
            }}
          />
        )}
        {phase === 'wantchat' && game && profile && (
          <WantToChat
            game={game}
            profile={profile}
            thaw={liveThaw}
            onYes={() => navigate(`/chat/${matchId}`, { replace: true })}
            onReplay={() => {
              setGameId(null)
              setQIndex(0)
              setPicked(null)
              setPhase('category')
            }}
            onUnmatch={() => {
              unmatch(matchId)
              navigate('/matches', { replace: true })
            }}
          />
        )}
      </div>
    </div>
  )
}

function CategoryPicker({
  onPick,
  loading,
}: {
  onPick: (c: TriviaCategory) => void
  loading: boolean
}) {
  const icons: Record<TriviaCategory, string> = {
    'General Knowledge': '🧠',
    'Film & TV': '🎬',
    Music: '🎵',
    'Food & Drink': '🍜',
    Science: '🔬',
    Geography: '🗺️',
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="py-2 text-center">
        <h1 className="text-2xl">Pick an icebreaker</h1>
        <p className="text-sm text-frost/55">Seven questions. Every answer melts a little ice.</p>
      </div>
      <div className="flex flex-1 items-center pb-10">
        <div className="grid w-full grid-cols-2 gap-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            disabled={loading}
            onClick={() => onPick(c)}
            className="glass flex aspect-square flex-col items-center justify-center gap-2 p-3 text-center transition-all hover:border-ice/40 active:scale-95 disabled:opacity-50"
            style={{ borderRadius: '22px' }}
          >
            <span className="text-3xl">{icons[c]}</span>
            <span className="text-sm font-medium text-frost/90">{c}</span>
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}

function PlayRound({
  game,
  qIndex,
  picked,
  timedOut,
  onPick,
  onTimeout,
  onNext,
}: {
  game: GameSession
  qIndex: number
  picked: number | null
  timedOut: boolean
  onPick: (opt: number) => void
  onTimeout: () => void
  onNext: () => void
}) {
  const q = game.questions[qIndex]
  const [remaining, setRemaining] = useState(QUESTION_SECONDS)
  const revealed = picked !== null || timedOut
  const matchPick = game.matchAnswers[qIndex]
  const timerPct = remaining / QUESTION_SECONDS
  const timerTone =
    remaining <= 5 ? 'text-ember' : remaining <= 8 ? 'text-amber' : 'text-ice'

  useEffect(() => {
    if (revealed) return
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const next = Math.max(0, QUESTION_SECONDS - elapsed)
      setRemaining(next)
      if (next <= 0) {
        window.clearInterval(interval)
        onTimeout()
      }
    }, 200)
    return () => window.clearInterval(interval)
  }, [revealed, onTimeout, game.id, qIndex])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between py-1 text-xs text-frost/45">
        <span className="uppercase tracking-wider text-amber/80">{q.category}</span>
        <div className="flex items-center gap-2">
          <span className={timerTone}>{remaining}s</span>
          <span>
            {qIndex + 1} / {game.questions.length}
          </span>
        </div>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-frost/10">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            remaining <= 5 ? 'bg-ember' : remaining <= 8 ? 'bg-amber' : 'bg-thaw'
          }`}
          style={{ width: `${Math.max(0, timerPct * 100)}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          <div className="glass mt-1 p-5" style={{ borderRadius: '22px' }}>
            <h2 className="text-xl leading-snug text-frost">{q.prompt}</h2>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex
              const isPicked = i === picked
              let cls = 'border-frost/12 bg-frost/5 text-frost/90 hover:border-ice/40'
              if (revealed) {
                if (isCorrect) cls = 'border-teal/70 bg-teal/15 text-frost'
                else if (isPicked) cls = 'border-ember/70 bg-ember/15 text-frost'
                else cls = 'border-frost/8 bg-frost/3 text-frost/45'
              }
              return (
                <button
                  key={i}
                  disabled={revealed}
                  onClick={() => onPick(i)}
                  className={`relative flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm transition-all active:scale-[0.99] ${cls}`}
                >
                  <span>{opt}</span>
                  <span className="flex items-center gap-1.5">
                    {revealed && matchPick === i && (
                      <span className="rounded-full bg-frost/15 px-2 py-0.5 text-[10px] text-ice">
                        their pick
                      </span>
                    )}
                    {revealed && isCorrect && <Check />}
                  </span>
                </button>
              )
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto pt-3"
            >
              <p className="mb-2 text-center text-sm text-frost/70">
                {timedOut
                  ? 'Out of time — marked incorrect.'
                  : picked === q.correctIndex ? 'Nice — ice cracking.' : 'Not quite, but the chill is lifting.'}
                {matchPick === q.correctIndex ? ' They got it too.' : ' They missed this one.'}
              </p>
              <button
                onClick={onNext}
                className="bg-thaw w-full rounded-2xl py-3.5 font-semibold text-abyss transition-transform active:scale-[0.98]"
              >
                {qIndex + 1 >= game.questions.length ? 'See results' : 'Next question'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WantToChat({
  game,
  profile,
  thaw,
  onYes,
  onReplay,
  onUnmatch,
}: {
  game: GameSession
  profile: Profile
  thaw: number
  onYes: () => void
  onReplay: () => void
  onUnmatch: () => void
}) {
  const stats = useMemo(() => {
    const yours = game.userAnswers.filter((a, i) => a === game.questions[i].correctIndex).length
    const theirs = game.matchAnswers.filter((a, i) => a === game.questions[i].correctIndex).length
    const agreed = game.userAnswers.filter((a, i) => a === game.matchAnswers[i]).length
    return { yours, theirs, agreed, total: game.questions.length }
  }, [game])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 py-4 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-4"
      >
        <GradientPortrait
          profile={profile}
          thaw={thaw}
          className="h-32 w-32 rounded-3xl"
        />
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-ice/70">Ice broken</p>
          <h1 className="mt-1 text-4xl">
            Want to <span className="text-thaw">chat?</span>
          </h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="grid w-full max-w-xs grid-cols-3 gap-2"
      >
        <Stat label="You" value={`${stats.yours}/${stats.total}`} />
        <Stat label={profile.name} value={`${stats.theirs}/${stats.total}`} />
        <Stat label="In sync" value={`${stats.agreed}/${stats.total}`} accent />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-xs text-sm text-frost/65"
      >
        {stats.agreed >= stats.total - 1
          ? `You and ${profile.name} are dangerously in sync. 🔥`
          : stats.agreed >= stats.total / 2
            ? `Solid overlap with ${profile.name}. The conversation writes itself.`
            : `Opposites attract — plenty to talk about with ${profile.name}.`}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <button
          onClick={onYes}
          className="bg-thaw w-full rounded-2xl py-4 text-lg font-semibold text-abyss transition-transform active:scale-[0.98]"
        >
          Chat now
        </button>
        <button
          onClick={onReplay}
          className="glass w-full rounded-2xl py-3.5 text-sm font-medium text-frost/70 transition-transform active:scale-[0.98]"
        >
          Play another game
        </button>
        <button
          onClick={() => {
            if (confirm(`Unmatch with ${profile.name}?`)) onUnmatch()
          }}
          className="w-full rounded-2xl border border-frost/12 py-3 text-sm font-medium text-frost/45 transition-colors hover:border-ember/40 hover:text-ember"
        >
          Unmatch
        </button>
      </motion.div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass flex flex-col items-center gap-0.5 p-3" style={{ borderRadius: '18px' }}>
      <span className={`font-display text-2xl ${accent ? 'text-thaw' : 'text-frost'}`}>{value}</span>
      <span className="truncate text-[11px] text-frost/55">{label}</span>
    </div>
  )
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
