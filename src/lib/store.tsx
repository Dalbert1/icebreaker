import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { GameSession, Match, Question, TriviaCategory } from '../types'
import { PROFILES } from '../data/profiles'
import { questionProvider } from './questionProvider'

interface State {
  /** Remaining profile ids in the discovery deck (top of stack = last item). */
  deck: string[]
  liked: string[]
  passed: string[]
  matches: Match[]
  games: GameSession[]
  /** Set when a like turns into a match, so the UI can show the match modal. */
  pendingMatchId?: string
}

type Action =
  | { type: 'LIKE'; id: string }
  | { type: 'PASS'; id: string }
  | { type: 'DISMISS_MATCH' }
  | { type: 'ADD_GAME'; game: GameSession }
  | { type: 'ANSWER'; gameId: string; qIndex: number; optIndex: number }
  | { type: 'COMPLETE_GAME'; gameId: string }
  | { type: 'RESET' }

const STORAGE_KEY = 'icebreaker.state.v1'

function initialState(): State {
  return {
    deck: PROFILES.map((p) => p.id),
    liked: [],
    passed: [],
    matches: [],
    games: [],
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    /* ignore corrupt state */
  }
  return initialState()
}

/**
 * Derive how "thawed" a match is from completed games (0..1). Breaking the ice
 * is about playing *together*, not being right — so each completed round thaws
 * by a fixed amount (two rounds fully break the ice). This keeps the persisted
 * thaw consistent with the in-game live thaw (which tracks questions answered).
 */
function thawFor(matchId: string, games: GameSession[]): number {
  const played = games.filter((g) => g.matchId === matchId && g.completedAt)
  return Math.min(1, played.length * 0.5)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LIKE': {
      const deck = state.deck.filter((id) => id !== action.id)
      // POC matchmaking: a like always matches back so the trivia loop is
      // reachable. Real reciprocal matching arrives with the backend phase.
      const alreadyMatched = state.matches.some((m) => m.profileId === action.id)
      const matches = alreadyMatched
        ? state.matches
        : [...state.matches, { profileId: action.id, matchedAt: Date.now(), thaw: 0 }]
      return {
        ...state,
        deck,
        liked: [...state.liked, action.id],
        matches,
        pendingMatchId: alreadyMatched ? state.pendingMatchId : action.id,
      }
    }
    case 'PASS':
      return {
        ...state,
        deck: state.deck.filter((id) => id !== action.id),
        passed: [...state.passed, action.id],
      }
    case 'DISMISS_MATCH':
      return { ...state, pendingMatchId: undefined }
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.game] }
    case 'ANSWER': {
      const games = state.games.map((g) => {
        if (g.id !== action.gameId) return g
        const userAnswers = [...g.userAnswers]
        userAnswers[action.qIndex] = action.optIndex
        return { ...g, userAnswers }
      })
      return { ...state, games }
    }
    case 'COMPLETE_GAME': {
      const games = state.games.map((g) =>
        g.id === action.gameId ? { ...g, completedAt: Date.now() } : g,
      )
      const matches = state.matches.map((m) => ({
        ...m,
        thaw: thawFor(m.profileId, games),
        lastGameId: games.find((g) => g.matchId === m.profileId)?.id ?? m.lastGameId,
      }))
      return { ...state, games, matches }
    }
    case 'RESET':
      return initialState()
    default:
      return state
  }
}

interface Store {
  state: State
  like: (id: string) => void
  pass: (id: string) => void
  dismissMatch: () => void
  startGame: (matchId: string, category: TriviaCategory) => Promise<string>
  answer: (gameId: string, qIndex: number, optIndex: number) => void
  completeGame: (gameId: string) => void
  reset: () => void
}

const StoreContext = createContext<Store | null>(null)

/** Deterministic-ish simulation of a match's answers for the POC. */
function simulateMatchAnswers(questions: Question[], seed: number): number[] {
  let a = seed >>> 0
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return questions.map((q) => {
    // 65% chance the match answers correctly, else a random wrong option.
    if (rng() < 0.65) return q.correctIndex
    const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correctIndex)
    return wrong[Math.floor(rng() * wrong.length)]
  })
}

let gameCounter = 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state])

  const store = useMemo<Store>(
    () => ({
      state,
      like: (id) => dispatch({ type: 'LIKE', id }),
      pass: (id) => dispatch({ type: 'PASS', id }),
      dismissMatch: () => dispatch({ type: 'DISMISS_MATCH' }),
      answer: (gameId, qIndex, optIndex) =>
        dispatch({ type: 'ANSWER', gameId, qIndex, optIndex }),
      completeGame: (gameId) => dispatch({ type: 'COMPLETE_GAME', gameId }),
      reset: () => dispatch({ type: 'RESET' }),
      startGame: async (matchId, category) => {
        const questions = await questionProvider.getQuestions(category, 5)
        const id = `g${Date.now()}-${gameCounter++}`
        const seed = Array.from(id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
        const game: GameSession = {
          id,
          matchId,
          category,
          questions,
          userAnswers: new Array(questions.length).fill(-1),
          matchAnswers: simulateMatchAnswers(questions, seed),
          startedAt: Date.now(),
        }
        dispatch({ type: 'ADD_GAME', game })
        return id
      },
    }),
    [state],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
