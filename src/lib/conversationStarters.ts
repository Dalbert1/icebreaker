import type { GameSession, Profile } from '../types'

/**
 * Bridge between the game and the chat: turn what just happened in a round into
 * 1–3 ready-to-send openers, so the first message isn't a cold "hey." Purely
 * derived from the game results + profile — no network, deterministic given the
 * same game.
 *
 * Priority order (most specific / most fun first):
 *   1. A question you BOTH missed — shared failure is a great equalizer.
 *   2. A question you BOTH nailed the same way — instant "we're in sync."
 *   3. A category hook from the round you played.
 *   4. A warm generic fallback so we always return at least one.
 */
export function conversationStartersFor(
  game: GameSession,
  profile: Profile,
): string[] {
  const starters: string[] = []
  const { questions, userAnswers, matchAnswers } = game
  const name = profile.name

  // 1. Both wrong on the same question.
  const bothMissed = questions.findIndex(
    (q, i) =>
      userAnswers[i] !== q.correctIndex && matchAnswers[i] !== q.correctIndex,
  )
  if (bothMissed >= 0) {
    starters.push(
      `Okay we BOTH blanked on "${questions[bothMissed].prompt}" — I'm choosing to blame the question. 😅`,
    )
  }

  // 2. Both picked the same option (in sync), ideally a correct one.
  const inSyncRight = questions.findIndex(
    (q, i) =>
      userAnswers[i] >= 0 &&
      userAnswers[i] === matchAnswers[i] &&
      userAnswers[i] === q.correctIndex,
  )
  const inSyncAny = questions.findIndex(
    (_q, i) => userAnswers[i] >= 0 && userAnswers[i] === matchAnswers[i],
  )
  const inSync = inSyncRight >= 0 ? inSyncRight : inSyncAny
  if (inSync >= 0) {
    starters.push(
      `We answered the ${game.category} one exactly the same — clearly the start of something. 🧊`,
    )
  }

  // 3. Category hook.
  starters.push(
    `That ${game.category} round was a vibe. Rematch, or are you scared, ${name}? 😏`,
  )

  // 4. Warm fallback (only surfaces if we somehow have <1 above).
  starters.push(`The ice is officially broken, ${name}. Hi. 👋`)

  // Dedup + cap at 3.
  return [...new Set(starters)].slice(0, 3)
}
