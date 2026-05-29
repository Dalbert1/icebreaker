import { describe, it, expect } from 'vitest'
import type { GameSession, Question } from '../types'
import { scoreGame, syncLevel } from './score'

/** Build a 4-option question whose correct answer is always index 0. */
function q(id: string): Question {
  return {
    id,
    category: 'General Knowledge',
    prompt: `Q${id}?`,
    options: ['right', 'wrong-1', 'wrong-2', 'wrong-3'],
    correctIndex: 0,
  }
}

/** Minimal game with `userAnswers`/`matchAnswers` of equal length. */
function game(userAnswers: number[], matchAnswers: number[]): GameSession {
  const questions = userAnswers.map((_, i) => q(String(i)))
  return {
    id: 'g1',
    matchId: 'p1',
    category: 'General Knowledge',
    questions,
    userAnswers,
    matchAnswers,
    timedOut: userAnswers.map(() => false),
    startedAt: 0,
  }
}

describe('scoreGame', () => {
  it('counts correct answers for each side (correctIndex === 0)', () => {
    const s = scoreGame(game([0, 0, 1, 3], [0, 1, 1, 0]))
    expect(s.yours).toBe(2) // indexes 0,1 correct
    expect(s.theirs).toBe(2) // indexes 0,3 correct
    expect(s.total).toBe(4)
  })

  it('counts agreement only when both picked the same real option', () => {
    // q0: both 0 (agree), q1: 1 vs 2 (no), q2: 2 vs 2 (agree), q3: 3 vs 0 (no)
    const s = scoreGame(game([0, 1, 2, 3], [0, 2, 2, 0]))
    expect(s.agreed).toBe(2)
  })

  it('does not count two unanswered (-1) questions as "in sync"', () => {
    const s = scoreGame(game([-1, 0], [-1, 0]))
    expect(s.agreed).toBe(1) // only the real shared pick at index 1
  })

  it('a perfect round agrees on everything', () => {
    const s = scoreGame(game([0, 0, 0], [0, 0, 0]))
    expect(s).toEqual({ yours: 3, theirs: 3, agreed: 3, total: 3 })
  })
})

describe('syncLevel', () => {
  it('is in-sync when all or all-but-one match', () => {
    expect(syncLevel({ agreed: 7, total: 7 })).toBe('in-sync')
    expect(syncLevel({ agreed: 6, total: 7 })).toBe('in-sync')
  })

  it('is overlap when at least half agree', () => {
    expect(syncLevel({ agreed: 4, total: 7 })).toBe('overlap')
  })

  it('is opposites when fewer than half agree', () => {
    expect(syncLevel({ agreed: 2, total: 7 })).toBe('opposites')
  })
})
