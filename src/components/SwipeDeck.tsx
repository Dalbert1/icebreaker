import { useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import type { Profile } from '../types'
import { ProfileCard } from './ProfileCard'

const SWIPE_THRESHOLD = 110

/**
 * A draggable card stack. The top card follows the pointer and rotates; flick
 * or drag past the threshold to like (right) / pass (left). The action buttons
 * drive the same `onChoose` so keyboard/click users get parity.
 */
export function SwipeDeck({
  profiles,
  onChoose,
}: {
  profiles: Profile[]
  onChoose: (id: string, choice: 'like' | 'pass') => void
}) {
  // Render the last few for depth; top of stack = first in this list.
  const visible = profiles.slice(0, 3)

  return (
    <div className="relative mx-auto aspect-[3/4.35] w-full max-w-sm">
      {visible.length === 0 && <EmptyDeck />}
      {visible
        .map((profile, i) => {
          const isTop = i === 0
          return (
            <DeckCard
              key={profile.id}
              profile={profile}
              depth={i}
              isTop={isTop}
              onChoose={onChoose}
            />
          )
        })
        // paint back-to-front so the top card is last in the DOM
        .reverse()}
    </div>
  )
}

function DeckCard({
  profile,
  depth,
  isTop,
  onChoose,
}: {
  profile: Profile
  depth: number
  isTop: boolean
  onChoose: (id: string, choice: 'like' | 'pass') => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-16, 16])
  const likeOpacity = useTransform(x, [40, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -40], [1, 0])
  const [gone, setGone] = useState<null | 'like' | 'pass'>(null)

  function handleEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) fly('like')
    else if (info.offset.x < -SWIPE_THRESHOLD) fly('pass')
  }

  function fly(choice: 'like' | 'pass') {
    setGone(choice)
    // let the exit animation play, then commit
    window.setTimeout(() => onChoose(profile.id, choice), 220)
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - depth,
        cursor: isTop ? 'grab' : 'default',
      }}
      drag={isTop && !gone ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleEnd}
      whileDrag={{ cursor: 'grabbing' }}
      initial={false}
      animate={
        gone
          ? { x: gone === 'like' ? 600 : -600, opacity: 0, rotate: gone === 'like' ? 24 : -24 }
          : { scale: 1 - depth * 0.04, y: depth * 14, opacity: depth > 1 ? 0.5 : 1 }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <ProfileCard profile={profile} />

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-xl border-2 border-teal px-4 py-1.5 text-xl font-bold uppercase tracking-widest text-teal"
          >
            Thaw
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-xl border-2 border-glacial px-4 py-1.5 text-xl font-bold uppercase tracking-widest text-glacial"
          >
            Frost
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function EmptyDeck() {
  return (
    <div
      className="glass flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center"
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      <div className="text-5xl">❄️</div>
      <h3 className="text-2xl text-frost">That's everyone for now</h3>
      <p className="text-sm text-frost/60">
        You've been through the whole pool. Check your matches and break some ice — new faces thaw in
        as the POC grows.
      </p>
    </div>
  )
}
