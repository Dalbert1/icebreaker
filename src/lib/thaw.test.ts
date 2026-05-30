import { describe, it, expect } from 'vitest'
import {
  GAMES_TO_FULL_THAW,
  PRE_REVEAL_CAP,
  REVEAL_THRESHOLD,
  THAW_PER_GAME,
  crossesFullThaw,
  isThawRevealed,
  liveThaw,
  revealedName,
  thawForGames,
} from './thaw'

describe('thawForGames', () => {
  it('is 0 with no completed games', () => {
    expect(thawForGames(0)).toBe(0)
  })

  it('adds THAW_PER_GAME per completed game', () => {
    expect(thawForGames(1)).toBe(THAW_PER_GAME)
  })

  it('reaches full thaw after GAMES_TO_FULL_THAW games', () => {
    expect(thawForGames(GAMES_TO_FULL_THAW)).toBe(1)
  })

  it('clamps at 1 — extra games never overshoot', () => {
    expect(thawForGames(GAMES_TO_FULL_THAW + 5)).toBe(1)
  })

  it('clamps negatives to 0', () => {
    expect(thawForGames(-3)).toBe(0)
  })
})

describe('isThawRevealed', () => {
  it('is false below the reveal threshold', () => {
    expect(isThawRevealed(REVEAL_THRESHOLD - 0.01)).toBe(false)
  })

  it('is true exactly at the threshold', () => {
    expect(isThawRevealed(REVEAL_THRESHOLD)).toBe(true)
  })

  it('is true above the threshold', () => {
    expect(isThawRevealed(1)).toBe(true)
  })
})

describe('liveThaw', () => {
  it('returns base thaw when there are no questions', () => {
    expect(liveThaw(0.5, 0, 0)).toBe(0.5)
  })

  it('returns base thaw before any answers', () => {
    expect(liveThaw(0, 0, 7)).toBe(0)
  })

  it('interpolates progress through the round on top of base', () => {
    // Halfway through the first round (base 0): 0 + 0.5 * THAW_PER_GAME.
    expect(liveThaw(0, 7, 14)).toBeCloseTo(THAW_PER_GAME / 2)
  })

  it('caps at PRE_REVEAL_CAP during the round that will fully break the ice', () => {
    // base 0.5 + full round (0.5) = 1.0 which would reveal — held below.
    expect(liveThaw(0.5, 14, 14)).toBe(PRE_REVEAL_CAP)
  })

  it('does not cap a round that is already fully thawed (base === 1)', () => {
    expect(liveThaw(1, 14, 14)).toBe(1)
  })
})

describe('crossesFullThaw', () => {
  it('is true when finishing this game first hits full thaw', () => {
    // One game already done (thaw 0.5); finishing the 2nd reaches 1.0.
    expect(crossesFullThaw(0.5, 1)).toBe(true)
  })

  it('is true when the first game from base 0 crosses full thaw', () => {
    expect(crossesFullThaw(0, 0)).toBe(true)
  })

  it('is false when already fully thawed (no second reveal)', () => {
    expect(crossesFullThaw(1, 5)).toBe(false)
  })
})

describe('revealedName', () => {
  it('masks the name to an initial when not yet revealed', () => {
    expect(revealedName('Sasha', 0)).toBe('S······')
  })

  it('returns the real name once revealed', () => {
    expect(revealedName('Sasha', REVEAL_THRESHOLD)).toBe('Sasha')
  })
})
