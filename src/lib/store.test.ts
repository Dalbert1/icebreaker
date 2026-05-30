import { describe, it, expect } from 'vitest'
import { reducer, initialState, type State } from './store'
import { THAW_PER_GAME } from './thaw'
import type { GameSession } from '../types'

/** A bare game for a match, optionally already completed. */
function gameFor(matchId: string, id: string, completed = false): GameSession {
  return {
    id,
    matchId,
    category: 'General Knowledge',
    questions: [],
    userAnswers: [-1, -1],
    matchAnswers: [0, 1],
    timedOut: [false, false],
    startedAt: 0,
    completedAt: completed ? 1 : undefined,
  }
}

/** State seeded with a single match so we don't depend on the mock profile pool. */
function withMatch(profileId = 'p1'): State {
  return {
    ...initialState(),
    deck: [profileId, 'p2'],
    matches: [{ profileId, matchedAt: 0, thaw: 0 }],
  }
}

describe('session state', () => {
  it('starts in ready local mode when Supabase is not configured', () => {
    expect(initialState().auth).toEqual({ status: 'ready', adapter: 'local' })
  })

  it('updates auth messages without changing the session state', () => {
    const next = reducer(initialState(), {
      type: 'SET_AUTH_MESSAGE',
      error: 'No credentials',
    })
    expect(next.auth).toEqual({
      status: 'ready',
      adapter: 'local',
      error: 'No credentials',
    })
  })
})

describe('LIKE', () => {
  it('always matches back (POC) and flags the pending match', () => {
    const next = reducer(initialState(), { type: 'LIKE', id: 'p1' })
    expect(next.matches.map((m) => m.profileId)).toContain('p1')
    expect(next.liked).toContain('p1')
    expect(next.pendingMatchId).toBe('p1')
  })

  it('removes the liked profile from the deck', () => {
    const start = { ...initialState(), deck: ['p1', 'p2'] }
    const next = reducer(start, { type: 'LIKE', id: 'p1' })
    expect(next.deck).toEqual(['p2'])
  })

  it('does not create a duplicate match for an already-matched profile', () => {
    const next = reducer(withMatch('p1'), { type: 'LIKE', id: 'p1' })
    expect(next.matches.filter((m) => m.profileId === 'p1')).toHaveLength(1)
  })
})

describe('PASS', () => {
  it('removes from the deck and records the pass', () => {
    const next = reducer({ ...initialState(), deck: ['p1', 'p2'] }, { type: 'PASS', id: 'p1' })
    expect(next.deck).toEqual(['p2'])
    expect(next.passed).toContain('p1')
  })
})

describe('ANSWER / TIMEOUT', () => {
  it('records the picked option and clears any timed-out flag', () => {
    const start = { ...initialState(), games: [gameFor('p1', 'g1')] }
    const next = reducer(start, { type: 'ANSWER', gameId: 'g1', qIndex: 0, optIndex: 2 })
    expect(next.games[0].userAnswers).toEqual([2, -1])
    expect(next.games[0].timedOut[0]).toBe(false)
  })

  it('marks a timeout as -1 and sets the timed-out flag', () => {
    const start = { ...initialState(), games: [gameFor('p1', 'g1')] }
    const next = reducer(start, { type: 'TIMEOUT', gameId: 'g1', qIndex: 1 })
    expect(next.games[0].userAnswers).toEqual([-1, -1])
    expect(next.games[0].timedOut[1]).toBe(true)
  })

  it('leaves other games untouched', () => {
    const start = { ...initialState(), games: [gameFor('p1', 'g1'), gameFor('p2', 'g2')] }
    const next = reducer(start, { type: 'ANSWER', gameId: 'g1', qIndex: 0, optIndex: 1 })
    expect(next.games[1]).toBe(start.games[1])
  })
})

describe('COMPLETE_GAME', () => {
  it('stamps completedAt and thaws the match by one game', () => {
    const start = { ...withMatch('p1'), games: [gameFor('p1', 'g1')] }
    const next = reducer(start, { type: 'COMPLETE_GAME', gameId: 'g1' })
    expect(next.games[0].completedAt).toBeTruthy()
    expect(next.matches[0].thaw).toBe(THAW_PER_GAME)
    expect(next.matches[0].lastGameId).toBe('g1')
  })

  it('reaches full thaw after the second completed game', () => {
    const start = {
      ...withMatch('p1'),
      games: [gameFor('p1', 'g1', true), gameFor('p1', 'g2')],
    }
    const next = reducer(start, { type: 'COMPLETE_GAME', gameId: 'g2' })
    expect(next.matches[0].thaw).toBe(1)
    expect(next.matches[0].lastGameId).toBe('g2')
  })

  it('keeps lastGameId on the latest completed game for each match', () => {
    const start: State = {
      ...withMatch('p1'),
      matches: [
        { profileId: 'p1', matchedAt: 0, thaw: THAW_PER_GAME, lastGameId: 'g1' },
        { profileId: 'p2', matchedAt: 0, thaw: THAW_PER_GAME, lastGameId: 'g3' },
      ],
      games: [
        { ...gameFor('p1', 'g1', true), completedAt: 10 },
        gameFor('p1', 'g2'),
        { ...gameFor('p2', 'g3', true), completedAt: 20 },
      ],
    }

    const next = reducer(start, { type: 'COMPLETE_GAME', gameId: 'g2' })

    expect(next.matches.find((m) => m.profileId === 'p1')?.lastGameId).toBe('g2')
    expect(next.matches.find((m) => m.profileId === 'p2')?.lastGameId).toBe('g3')
  })

  it('lastGameId points to the game just completed, not the first game for the match', () => {
    const start = {
      ...withMatch('p1'),
      games: [gameFor('p1', 'g1', true), gameFor('p1', 'g2')],
      matches: [{ profileId: 'p1', matchedAt: 0, thaw: THAW_PER_GAME, lastGameId: 'g1' }],
    }
    const next = reducer(start, { type: 'COMPLETE_GAME', gameId: 'g2' })
    expect(next.matches[0].lastGameId).toBe('g2')
  })

  it('does not update lastGameId for unrelated matches', () => {
    const start: State = {
      ...initialState(),
      matches: [
        { profileId: 'p1', matchedAt: 0, thaw: 0 },
        { profileId: 'p2', matchedAt: 0, thaw: 0, lastGameId: 'g0' },
      ],
      games: [gameFor('p1', 'g1')],
    }
    const next = reducer(start, { type: 'COMPLETE_GAME', gameId: 'g1' })
    expect(next.matches.find((m) => m.profileId === 'p1')?.lastGameId).toBe('g1')
    expect(next.matches.find((m) => m.profileId === 'p2')?.lastGameId).toBe('g0')
  })
})

describe('SEND_MESSAGE', () => {
  it('appends the message to the thread', () => {
    const msg = { id: 'm1', matchId: 'p1', sender: 'you' as const, body: 'hi', sentAt: 0 }
    const next = reducer(initialState(), { type: 'SEND_MESSAGE', message: msg })
    expect(next.messages).toEqual([msg])
  })
})

describe('UNMATCH', () => {
  it('removes the match plus its games and messages, and clears the pending flag', () => {
    const start: State = {
      ...withMatch('p1'),
      pendingMatchId: 'p1',
      games: [gameFor('p1', 'g1'), gameFor('p2', 'g2')],
      messages: [
        { id: 'm1', matchId: 'p1', sender: 'you', body: 'a', sentAt: 0 },
        { id: 'm2', matchId: 'p2', sender: 'you', body: 'b', sentAt: 0 },
      ],
    }
    const next = reducer(start, { type: 'UNMATCH', id: 'p1' })
    expect(next.matches.some((m) => m.profileId === 'p1')).toBe(false)
    expect(next.games.map((g) => g.matchId)).toEqual(['p2'])
    expect(next.messages.map((m) => m.matchId)).toEqual(['p2'])
    expect(next.pendingMatchId).toBeUndefined()
  })
})

describe('REPORT', () => {
  it('blocks the profile and tears down the match, games, and messages', () => {
    const start: State = {
      ...withMatch('p1'),
      pendingMatchId: 'p1',
      deck: ['p1', 'p2'],
      games: [gameFor('p1', 'g1'), gameFor('p2', 'g2')],
      messages: [
        { id: 'm1', matchId: 'p1', sender: 'you', body: 'a', sentAt: 0 },
        { id: 'm2', matchId: 'p2', sender: 'you', body: 'b', sentAt: 0 },
      ],
    }
    const next = reducer(start, { type: 'REPORT', id: 'p1' })
    expect(next.blocked).toContain('p1')
    expect(next.matches.some((m) => m.profileId === 'p1')).toBe(false)
    expect(next.games.map((g) => g.matchId)).toEqual(['p2'])
    expect(next.messages.map((m) => m.matchId)).toEqual(['p2'])
    expect(next.deck).toEqual(['p2'])
    expect(next.pendingMatchId).toBeUndefined()
  })

  it('does not duplicate an already-blocked id', () => {
    const start: State = { ...initialState(), blocked: ['p1'] }
    const next = reducer(start, { type: 'REPORT', id: 'p1' })
    expect(next.blocked).toEqual(['p1'])
  })

  it('keeps blocked profiles out of the deck on preference change', () => {
    const start: State = { ...initialState(), blocked: ['p1'] }
    const next = reducer(start, { type: 'SET_PREFERENCE', preference: 'both' })
    expect(next.deck).not.toContain('p1')
  })
})

describe('DISMISS_MATCH / RESET', () => {
  it('DISMISS_MATCH clears only the pending flag', () => {
    const next = reducer({ ...withMatch('p1'), pendingMatchId: 'p1' }, { type: 'DISMISS_MATCH' })
    expect(next.pendingMatchId).toBeUndefined()
    expect(next.matches).toHaveLength(1)
  })

  it('RESET returns a fresh initial state', () => {
    const dirty = { ...withMatch('p1'), liked: ['p1'], games: [gameFor('p1', 'g1')] }
    expect(reducer(dirty, { type: 'RESET' })).toEqual(initialState())
  })
})
