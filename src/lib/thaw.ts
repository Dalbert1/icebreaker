/**
 * Single source of truth for the "break the ice" thaw mechanic.
 *
 * Thaw is a 0..1 measure of how revealed a match is. Breaking the ice is about
 * playing *together*, not being right — so each completed game thaws by a fixed
 * amount, independent of score. Tune the constants here and every screen
 * (store, Game, Chat, Matches, ThawReveal) follows.
 */

/**
 * Each completed icebreaker game thaws the portrait by this much.
 * 1.0 = one game fully reveals the match — fast enough that the
 * payoff lands on the first icebreaker rather than requiring a second.
 */
export const THAW_PER_GAME = 1.0

/** Completed games needed to fully break the ice (derived from the rate). */
export const GAMES_TO_FULL_THAW = Math.ceil(1 / THAW_PER_GAME)

/** At/above this thaw, a match's identity (name, bio, age) is revealed. */
export const REVEAL_THRESHOLD = 0.5

/**
 * During the round that will fully break the ice, live thaw is held just below
 * full so the dramatic final melt happens in <ThawReveal/> rather than creeping
 * clear in-game.
 */
export const PRE_REVEAL_CAP = 0.8

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** Persisted thaw for a match, derived from its number of completed games. */
export function thawForGames(completedGames: number): number {
  return clamp01(completedGames * THAW_PER_GAME)
}

/** Whether a thaw level is high enough to reveal identity. */
export function isThawRevealed(thaw: number): boolean {
  return thaw >= REVEAL_THRESHOLD
}

/**
 * Live thaw shown during a game: base match thaw + progress through the current
 * round. If this round will cross to full thaw, the result is capped at
 * `PRE_REVEAL_CAP` so the final clearing is saved for the reveal moment.
 */
export function liveThaw(baseThaw: number, answered: number, total: number): number {
  const raw = total > 0 ? baseThaw + (answered / total) * THAW_PER_GAME : baseThaw
  const willReveal = baseThaw < 1 && raw >= 1
  return Math.min(willReveal ? PRE_REVEAL_CAP : 1, raw)
}

/**
 * Does completing one more game cross this match into full thaw for the first
 * time (i.e. trigger the reveal)? `completedGames` is the count *before* the
 * round being finished.
 */
export function crossesFullThaw(baseThaw: number, completedGames: number): boolean {
  return baseThaw < 1 && thawForGames(completedGames + 1) >= 1
}

/** The name to show for a match: real once revealed, else a masked initial. */
export function revealedName(name: string, thaw: number): string {
  return isThawRevealed(thaw) ? name : `${name.charAt(0)}······`
}
