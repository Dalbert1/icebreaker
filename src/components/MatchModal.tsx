import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import type { Profile } from '../types'
import { GradientPortrait } from './GradientPortrait'
import { ME } from '../data/profiles'
import { useStore } from '../lib/store'

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
  const { reportProfile } = useStore()
  const [confirmReport, setConfirmReport] = useState(false)

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

        {confirmReport ? (
          <div className="mt-3 rounded-2xl border border-ember/30 bg-ember/5 p-3 text-center">
            <p className="text-xs text-frost/70">
              Report &amp; block {profile.name}? They'll be removed and won't reappear.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  reportProfile(profile.id)
                  onClose()
                }}
                className="bg-ember flex-1 rounded-xl py-2 text-xs font-semibold text-abyss"
              >
                Report &amp; block
              </button>
              <button
                onClick={() => setConfirmReport(false)}
                className="flex-1 rounded-xl py-2 text-xs font-medium text-frost/60 hover:text-frost"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReport(true)}
            className="mt-3 text-xs text-frost/35 hover:text-ember"
          >
            Report {profile.name}
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
