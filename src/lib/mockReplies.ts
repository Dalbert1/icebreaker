import type { Profile } from '../types'

/**
 * Simulated match replies for the POC chat experience.
 * Replies are seeded by profile so the same match feels consistent;
 * limited to 2 per conversation so the thread doesn't loop forever.
 *
 * TODO Phase 3: replace with real realtime messages.
 */

const REPLY_POOLS: string[][] = [
  [
    "Haha ok ok — you clearly did your homework 😄",
    "Wait, how did you guess that one? I was sure that'd trip you up.",
    "That was actually really fun. We should do another round.",
    "Ok I'm a little impressed ngl 👀",
    "Alright, you got a few right about me. Feeling studied lol",
  ],
  [
    "Your turn — ask me something. Literally anything.",
    "So now that you know my love language, what's yours?",
    "What made you swipe on me? Be honest 😅",
    "Do you actually like {food} or were you just guessing?",
    "Okay real talk — what's your perfect Sunday morning?",
  ],
]

function hashProfile(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Returns a mock reply for the Nth message the match has sent (0-indexed).
 * Returns null after the first two replies so the thread goes quiet.
 */
export function getMockReply(profile: Profile, replyIndex: number): string | null {
  if (replyIndex >= REPLY_POOLS.length) return null
  const pool = REPLY_POOLS[replyIndex]
  const seed = hashProfile(profile.id) + replyIndex
  const raw = pool[seed % pool.length]
  // Personalize: swap {food} for the profile's favorite food if available
  const food = profile.profileAnswers?.favoriteFood ?? 'that'
  return raw.replace('{food}', food)
}

/** How long to wait before showing the reply (ms). Varies slightly per reply. */
export function replyDelay(replyIndex: number): number {
  return 1600 + replyIndex * 400 + Math.random() * 800
}
