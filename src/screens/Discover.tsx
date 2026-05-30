import { AnimatePresence } from 'motion/react'
import { useStore } from '../lib/store'
import { PROFILES } from '../data/profiles'
import { SwipeDeck } from '../components/SwipeDeck'
import { MatchModal } from '../components/MatchModal'
import { Wordmark } from '../components/ui'

export function Discover() {
  const { state, like, pass, dismissMatch } = useStore()

  // Deck order: store keeps ids; resolve to profiles preserving deck order.
  const byId = new Map(PROFILES.map((p) => [p.id, p]))
  const deck = state.deck.map((id) => byId.get(id)!).filter(Boolean)
  const pendingMatch = state.pendingMatchId ? byId.get(state.pendingMatchId) : undefined

  function choose(id: string, choice: 'like' | 'pass') {
    if (choice === 'like') like(id)
    else pass(id)
  }

  return (
    <div className="flex h-full flex-col px-4">
      <header className="flex items-center justify-between py-3">
        <Wordmark size="md" />
        <span className="rounded-full border border-frost/10 bg-frost/5 px-3 py-1 text-xs text-frost/50">
          {deck.length} nearby
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pb-2">
        <div className="min-h-0 flex-1">
          <SwipeDeck profiles={deck} onChoose={choose} />
        </div>

        {deck.length > 0 && (
          <div className="mx-auto mt-4 flex shrink-0 items-center gap-6">
            <ActionButton label="Pass" onClick={() => choose(deck[0].id, 'pass')} variant="pass">
              <path d="M18 6 6 18M6 6l12 12" />
            </ActionButton>
            <ActionButton label="Like" onClick={() => choose(deck[0].id, 'like')} variant="like">
              <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z" />
            </ActionButton>
          </div>
        )}
      </div>

      <AnimatePresence>
        {pendingMatch && <MatchModal profile={pendingMatch} onClose={dismissMatch} />}
      </AnimatePresence>
    </div>
  )
}

function ActionButton({
  children,
  label,
  onClick,
  variant,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  variant: 'like' | 'pass'
}) {
  const ring =
    variant === 'like'
      ? 'border-ember/50 text-ember hover:bg-ember/10'
      : 'border-glacial/40 text-glacial hover:bg-glacial/10'
  const labelColor = variant === 'like' ? 'text-ember/70' : 'text-glacial/70'
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        aria-label={label}
        className={`glass flex h-16 w-16 items-center justify-center rounded-full border-2 ${ring} transition-all active:scale-90`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </svg>
      </button>
      <span className={`text-[11px] font-medium uppercase tracking-wider ${labelColor}`}>{label}</span>
    </div>
  )
}
