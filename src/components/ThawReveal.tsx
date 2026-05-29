import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { Profile } from '../types'
import { GradientPortrait } from './GradientPortrait'

/**
 * The "money shot": a full-screen, dramatic reveal that fires the first time a
 * match reaches full thaw. The frosted portrait melts to fully clear, ice shards
 * burst outward, and the name lands. This is the signature, screenshot-worthy
 * moment of the app — see IDEAS.md "The thaw reveal".
 *
 * Honors `prefers-reduced-motion`: skips the shard burst / flash and just shows
 * the cleared portrait + name.
 */
const SHARDS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  return { angle, dist: 120 + (i % 4) * 46, size: 10 + (i % 3) * 7, delay: (i % 5) * 0.02 }
})

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

export function ThawReveal({
  profile,
  fromThaw,
  onContinue,
}: {
  profile: Profile
  /** Thaw level just before this reveal (the portrait melts from here → 1). */
  fromThaw: number
  onContinue: () => void
}) {
  const reduced = prefersReducedMotion()
  // Start frosted at the prior level, then melt to fully clear.
  const [thaw, setThaw] = useState(reduced ? 1 : fromThaw)
  const [burst, setBurst] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    // A beat of suspense, then the ice breaks.
    const meltAt = window.setTimeout(() => {
      setThaw(1)
      setBurst(true)
      navigator.vibrate?.([12, 40, 90])
    }, 650)
    return () => window.clearTimeout(meltAt)
  }, [reduced])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden bg-abyss/92 px-8 text-center backdrop-blur-xl"
      role="dialog"
      aria-label={`${profile.name}'s portrait revealed`}
    >
      {/* radial flash at the moment of the break */}
      {burst && !reduced && (
        <motion.div
          initial={{ opacity: 0.55, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="pointer-events-none absolute h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--color-ice), transparent 65%)' }}
        />
      )}

      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="font-display text-sm uppercase tracking-[0.4em] text-ice/70"
      >
        The ice is broken
      </motion.p>

      <div className="relative flex items-center justify-center">
        {/* ice shards flying outward as the frost shatters */}
        {burst &&
          !reduced &&
          SHARDS.map((s, i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0, scale: 1 }}
              animate={{
                x: Math.cos(s.angle) * s.dist,
                y: Math.sin(s.angle) * s.dist,
                opacity: 0,
                rotate: 180,
                scale: 0.3,
              }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: s.delay }}
              className="pointer-events-none absolute"
              style={{
                width: s.size,
                height: s.size,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                background: 'linear-gradient(135deg, #e6f6ff, #a5e9ff)',
                boxShadow: '0 0 10px rgba(165,233,255,0.6)',
              }}
            />
          ))}

        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="rounded-[2rem] shadow-[0_0_60px_rgba(165,233,255,0.35)]"
        >
          <GradientPortrait
            profile={profile}
            thaw={thaw}
            className="h-56 w-56 rounded-[2rem]"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0.1 : 1.0 }}
        className="flex flex-col items-center gap-1"
      >
        <h1 className="text-5xl text-frost">{profile.name}</h1>
        <p className="text-sm text-frost/55">
          {profile.age} · {profile.location}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0.2 : 1.2 }}
        onClick={onContinue}
        className="bg-thaw mt-1 rounded-2xl px-8 py-3.5 text-base font-semibold text-abyss transition-transform active:scale-[0.98]"
      >
        Meet {profile.name}
      </motion.button>
    </motion.div>
  )
}
