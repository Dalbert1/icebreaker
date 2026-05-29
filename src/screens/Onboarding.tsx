import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useStore, type GenderPreference } from '../lib/store'
import { Wordmark } from '../components/ui'

const options: { value: GenderPreference; label: string; emoji: string; sub: string }[] = [
  { value: 'female', label: 'Women', emoji: '✨', sub: 'Show me women' },
  { value: 'male', label: 'Men', emoji: '⚡', sub: 'Show me men' },
  { value: 'both', label: 'Everyone', emoji: '🌊', sub: 'Show me everyone' },
]

export function Onboarding() {
  const { setPreference } = useStore()
  const navigate = useNavigate()

  function choose(pref: GenderPreference) {
    setPreference(pref)
    navigate('/discover', { replace: true })
  }

  return (
    <div className="flex h-full flex-col items-center justify-between px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <Wordmark size="lg" />
        <p className="text-center text-sm text-frost/55">
          Break the ice with people you actually want to meet.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-xs"
      >
        <h2 className="mb-6 text-center text-2xl text-frost">
          Who are you interested in?
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
              onClick={() => choose(opt.value)}
              className="glass flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all hover:border-ice/40 active:scale-[0.98]"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <div className="font-semibold text-frost">{opt.label}</div>
                <div className="text-xs text-frost/50">{opt.sub}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-xs text-frost/30">
        You can change this anytime in your profile.
      </p>
    </div>
  )
}
