/**
 * Pure, testable policy helpers for game-flow decisions in the icebreaker.
 * Keeps Game.tsx as rendering + event wiring; policy lives here.
 */

import type { GameSession, Match } from '../types'
import { liveThaw } from './thaw'

/**
 * Should the first game auto-start as the personal "About {Name}" round,
 * bypassing the category picker?
 */
export function shouldAutoStartPersonal(
  completedGamesForMatch: number,
  hasInProgressGame: boolean,
  hasProfileAnswers: boolean,
): boolean {
  return !hasInProgressGame && completedGamesForMatch === 0 && hasProfileAnswers
}

/**
 * Thaw value to display. While a game is active (incomplete), live in-round
 * progress animates the portrait. Once completed, match.thaw is already
 * updated — re-adding progress would double-count it.
 */
export function displayThaw(match: Pick<Match, 'thaw'>, game: GameSession | null): number {
  if (!game || game.completedAt) return match.thaw
  const answered = game.userAnswers.filter((a) => a >= 0).length
  return liveThaw(match.thaw, answered, game.questions.length)
}
