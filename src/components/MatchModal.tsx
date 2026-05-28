import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import type { Profile } from '../types'
import { GradientPortrait } from './GradientPortrait'
import { ME } from '../data/profiles'

/**
 * Celebration when a like becomes a match. Both portraits sit frosted —
 * the copy nudges the user to start a trivia game to break the ice.
 */
export function MatchModal({
  profile,
  onClose,
}: {
  profile: Profile
  onClose: () => void
}) {
  const navigate = useNavigate()

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-abyss/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="glass relative z-10 w-full max-w-sm overflow-hidden p-7 text-center"
        style={{ borderRadius: 'var(--radius-card)' }}
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <p className="font-display text-sm uppercase tracking-[0.3em] text-ice/70">A spark</p>
        <h2 className="mt-1 text-4xl">
          The ice is <span className="text-thaw">cracking</span>
        </h2>
        <p className="mt-2 text-sm text-frost/70">
          You and {profile.name} liked each other. Break the ice with a quick trivia round.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <GradientPortrait
            profile={ME}
            thaw={1}
            className="h-24 w-24 rounded-2xl border border-frost/15"
          />
          <motion.div
            className="text-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
            style={{ animation: 'pulse-ring 2s infinite', borderRadius: 9999 }}
          >
            <span className="bg-thaw inline-flex h-11 w-11 items-center justify-center rounded-full text-abyss">
              ❤
            </span>
          </motion.div>
          <GradientPortrait
            profile={profile}
            thaw={0.15}
            className="h-24 w-24 rounded-2xl border border-frost/15"
          />
        </div>

        <button
          onClick={() => {
            onClose()
            navigate(`/game/${profile.id}`)
          }}
          className="bg-thaw mt-7 w-full rounded-2xl py-3.5 font-semibold text-abyss transition-transform active:scale-[0.98]"
        >
          Break the ice
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl py-3 text-sm font-medium text-frost/60 hover:text-frost"
        >
          Keep swiping
        </button>
      </motion.div>
    </motion.div>
  )
}
