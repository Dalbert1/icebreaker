import type { GameSession } from '../types'

/**
 * Scoring for a completed (or in-progress) icebreaker round. Pure and derived
 * entirely from the game's answers so it can be unit-tested and reused by the
 * results screen, chat starters, etc. Unanswered/timed-out questions are stored
 * as `-1`, which never equals a `correctIndex`, so they simply don't count.
 *
 * Note the product framing: getting answers *right* isn't the point — `agreed`
 * (how in-sync the two players were) is the headline number for breaking the ice.
 */
export interface GameScore {
  /** Questions the user got right. */
  yours: number
  /** Questions the match got right. */
  theirs: number
  /** Questions where both picked the same option (the "in sync" stat). */
  agreed: number
  /** Total questions in the round. */
  total: number
}

export function scoreGame(game: GameSession): GameScore {
  const { questions, userAnswers, matchAnswers } = game
  const yours = userAnswers.filter((a, i) => a === questions[i].correctIndex).length
  const theirs = matchAnswers.filter((a, i) => a === questions[i].correctIndex).length
  // Both unanswered (-1 === -1) shouldn't read as "in sync", so require a real pick.
  const agreed = userAnswers.filter((a, i) => a >= 0 && a === matchAnswers[i]).length
  return { yours, theirs, agreed, total: questions.length }
}

export type SyncLevel = 'in-sync' | 'overlap' | 'opposites'

/**
 * How aligned the two players were, bucketed for the results-screen copy:
 * nearly every answer matched → `in-sync`; at least half → `overlap`; else
 * `opposites`.
 */
export function syncLevel({ agreed, total }: Pick<GameScore, 'agreed' | 'total'>): SyncLevel {
  if (agreed >= total - 1) return 'in-sync'
  if (agreed >= total / 2) return 'overlap'
  return 'opposites'
}
