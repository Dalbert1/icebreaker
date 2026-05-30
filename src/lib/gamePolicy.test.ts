import { describe, it, expect } from 'vitest'
import { shouldAutoStartPersonal, displayThaw } from './gamePolicy'
import { THAW_PER_GAME, PRE_REVEAL_CAP } from './thaw'
import type { GameSession, Match } from '../types'

function game(opts: Partial<GameSession> = {}): GameSession {
  return {
    id: 'g1',
    matchId: 'p1',
    category: 'General Knowledge',
    questions: Array(7).fill({ id: 'q', category: 'General Knowledge', prompt: '?', options: ['a', 'b', 'c', 'd'], correctIndex: 0 }),
    userAnswers: new Array(7).fill(-1),
    matchAnswers: new Array(7).fill(0),
    timedOut: new Array(7).fill(false),
    startedAt: 0,
    ...opts,
  }
}

const match: Match = { profileId: 'p1', matchedAt: 0, thaw: 0 }

describe('shouldAutoStartPersonal', () => {
  it('is true for a fresh match with profile answers', () => {
    expect(shouldAutoStartPersonal(0, false, true)).toBe(true)
  })

  it('is false when there is already an in-progress game', () => {
    expect(shouldAutoStartPersonal(0, true, true)).toBe(false)
  })

  it('is false when at least one game has been completed', () => {
    expect(shouldAutoStartPersonal(1, false, true)).toBe(false)
  })

  it('is false when the profile has no personal questions', () => {
    expect(shouldAutoStartPersonal(0, false, false)).toBe(false)
  })
})

describe('displayThaw', () => {
  it('returns match thaw when there is no game', () => {
    expect(displayThaw({ thaw: 0.5 }, null)).toBe(0.5)
  })

  it('returns match thaw for a completed game (no double-counting)', () => {
    const g = game({ completedAt: Date.now() })
    expect(displayThaw(match, g)).toBe(match.thaw)
  })

  it('adds live progress for an incomplete game', () => {
    const g = game({ userAnswers: [0, 0, 0, 0, -1, -1, -1] }) // 4 of 7 answered
    const expected = (4 / 7) * THAW_PER_GAME
    expect(displayThaw(match, g)).toBeCloseTo(expected)
  })

  it('caps at PRE_REVEAL_CAP during the final revealing round', () => {
    // base 0 + full 7/7 round with THAW_PER_GAME=1.0 reaches full thaw
    const g = game({ userAnswers: new Array(7).fill(0) })
    expect(displayThaw(match, g)).toBe(PRE_REVEAL_CAP)
  })
})
