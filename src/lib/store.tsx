import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import type { GameSession, Match, Message, Question, TriviaCategory } from '../types'
import { PROFILES } from '../data/profiles'
import { questionProvider } from './questionProvider'
import { generatePersonalQuestions, PERSONAL_CATEGORY } from './personalQuestions'
import { thawForGames } from './thaw'
import { authRedirectTo, isSupabaseConfigured, supabase } from './supabase'

export type GenderPreference = 'male' | 'female' | 'both'
export type SessionStatus = 'checking' | 'signedOut' | 'needsProfile' | 'ready'

interface AuthState {
  status: SessionStatus
  adapter: 'local' | 'supabase'
  userId?: string
  email?: string
  message?: string
  error?: string
}

export interface State {
  /** Remaining profile ids in the discovery deck (top of stack = last item). */
  deck: string[]
  liked: string[]
  passed: string[]
  /** Reported/blocked profile ids — never resurface in the deck or matches. */
  blocked: string[]
  matches: Match[]
  games: GameSession[]
  /** Local-only chat messages, keyed implicitly by `matchId`. */
  messages: Message[]
  /** Set when a like turns into a match, so the UI can show the match modal. */
  pendingMatchId?: string
  /** Undefined means onboarding not completed yet. */
  genderPreference?: GenderPreference
  auth: AuthState
}

export type Action =
  | { type: 'LIKE'; id: string }
  | { type: 'PASS'; id: string }
  | { type: 'UNMATCH'; id: string }
  | { type: 'REPORT'; id: string }
  | { type: 'DISMISS_MATCH' }
  | { type: 'ADD_GAME'; game: GameSession }
  | { type: 'SEND_MESSAGE'; message: Message }
  | { type: 'ANSWER'; gameId: string; qIndex: number; optIndex: number }
  | { type: 'TIMEOUT'; gameId: string; qIndex: number }
  | { type: 'COMPLETE_GAME'; gameId: string }
  | { type: 'SET_PREFERENCE'; preference: GenderPreference }
  | { type: 'SET_AUTH'; auth: AuthState }
  | { type: 'SET_AUTH_MESSAGE'; message?: string; error?: string }
  | { type: 'RESET' }

const STORAGE_KEY = 'icebreaker.state.v2'

interface StoreAdapter {
  kind: AuthState['adapter']
  initialAuth: AuthState
  subscribeAuth: (dispatch: Dispatch<Action>) => () => void
  signInWithEmail: (email: string, dispatch: Dispatch<Action>) => Promise<void>
  signOut: (dispatch: Dispatch<Action>) => Promise<void>
  syncOnboardingProfile: (
    preference: GenderPreference,
    userId: string | undefined,
  ) => Promise<void>
}

const localAdapter: StoreAdapter = {
  kind: 'local',
  initialAuth: { status: 'ready', adapter: 'local' },
  subscribeAuth: () => () => {},
  signInWithEmail: async (_email, dispatch) => {
    dispatch({
      type: 'SET_AUTH_MESSAGE',
      error: 'Supabase is not configured for this build.',
    })
  },
  signOut: async () => {},
  syncOnboardingProfile: async () => {},
}

async function authForSupabaseUser(user: User): Promise<AuthState> {
  if (!supabase) return localAdapter.initialAuth

  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return {
      status: 'needsProfile',
      adapter: 'supabase',
      userId: user.id,
      email: user.email ?? undefined,
      error: error.message,
    }
  }

  return {
    status: data?.onboarding_completed_at ? 'ready' : 'needsProfile',
    adapter: 'supabase',
    userId: user.id,
    email: user.email ?? undefined,
  }
}

const supabaseAdapter: StoreAdapter = {
  kind: 'supabase',
  initialAuth: { status: 'checking', adapter: 'supabase' },
  subscribeAuth: (dispatch) => {
    if (!supabase) return () => {}

    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const user = data.session?.user
      dispatch({
        type: 'SET_AUTH',
        auth: user ? await authForSupabaseUser(user) : { status: 'signedOut', adapter: 'supabase' },
      })
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        dispatch({ type: 'SET_AUTH', auth: { status: 'signedOut', adapter: 'supabase' } })
        return
      }
      authForSupabaseUser(session.user).then((auth) => {
        if (active) dispatch({ type: 'SET_AUTH', auth })
      })
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  },
  signInWithEmail: async (email, dispatch) => {
    if (!supabase) return localAdapter.signInWithEmail(email, dispatch)

    dispatch({ type: 'SET_AUTH_MESSAGE', message: undefined, error: undefined })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: authRedirectTo() },
    })
    if (error) {
      dispatch({ type: 'SET_AUTH_MESSAGE', error: error.message })
      return
    }
    dispatch({
      type: 'SET_AUTH_MESSAGE',
      message: 'Check your email for the icebreaker sign-in link.',
    })
  },
  signOut: async (dispatch) => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) dispatch({ type: 'SET_AUTH_MESSAGE', error: error.message })
  },
  syncOnboardingProfile: async (preference, userId) => {
    if (!supabase || !userId) return
    const now = new Date().toISOString()
    const profile = {
      id: userId,
      display_name: 'You',
      bio: 'Just here to break the ice. Ask me anything — preferably in trivia form.',
      vibes: ['Foodie', 'Traveler', 'Gamer'],
      location_label: 'Tulsa, OK',
      onboarding_completed_at: now,
      updated_at: now,
    }
    const { error: profileError } = await supabase.from('profiles').upsert(profile)
    if (profileError) throw profileError

    const { error: preferenceError } = await supabase.from('profile_preferences').upsert({
      profile_id: userId,
      interested_in: preference,
      updated_at: now,
    })
    if (preferenceError) throw preferenceError
  },
}

const activeAdapter = supabase ? supabaseAdapter : localAdapter

function deckForPreference(preference: GenderPreference, exclude: string[]): string[] {
  const pool =
    preference === 'both'
      ? PROFILES
      : PROFILES.filter((p) => p.gender === preference)
  return pool.map((p) => p.id).filter((id) => !exclude.includes(id))
}

// eslint-disable-next-line react-refresh/only-export-components
export function initialState(): State {
  return {
    deck: [],
    liked: [],
    passed: [],
    blocked: [],
    matches: [],
    games: [],
    messages: [],
    genderPreference: undefined,
    auth: activeAdapter.initialAuth,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>
      return { ...initialState(), ...parsed, auth: initialState().auth }
    }
  } catch {
    /* ignore corrupt state */
  }
  return initialState()
}

/**
 * Derive how "thawed" a match is from completed games (0..1). The thaw rate and
 * thresholds live in `lib/thaw.ts` so the persisted thaw, the in-game live thaw,
 * and the reveal all stay consistent.
 */
function thawFor(matchId: string, games: GameSession[]): number {
  const played = games.filter((g) => g.matchId === matchId && g.completedAt)
  return thawForGames(played.length)
}

// eslint-disable-next-line react-refresh/only-export-components
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PREFERENCE': {
      const deck = deckForPreference(action.preference, [
        ...state.liked,
        ...state.passed,
        ...state.blocked,
      ])
      return { ...state, genderPreference: action.preference, deck }
    }
    case 'SET_AUTH':
      return { ...state, auth: action.auth }
    case 'SET_AUTH_MESSAGE':
      return {
        ...state,
        auth: { ...state.auth, message: action.message, error: action.error },
      }
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
    case 'UNMATCH':
      return {
        ...state,
        matches: state.matches.filter((m) => m.profileId !== action.id),
        games: state.games.filter((g) => g.matchId !== action.id),
        messages: state.messages.filter((m) => m.matchId !== action.id),
        pendingMatchId:
          state.pendingMatchId === action.id ? undefined : state.pendingMatchId,
      }
    case 'REPORT':
      // Report = block: drop the match (and its games/messages) and remember
      // the id so they never resurface in the deck or as a match again.
      return {
        ...state,
        blocked: state.blocked.includes(action.id)
          ? state.blocked
          : [...state.blocked, action.id],
        deck: state.deck.filter((id) => id !== action.id),
        matches: state.matches.filter((m) => m.profileId !== action.id),
        games: state.games.filter((g) => g.matchId !== action.id),
        messages: state.messages.filter((m) => m.matchId !== action.id),
        pendingMatchId:
          state.pendingMatchId === action.id ? undefined : state.pendingMatchId,
      }
    case 'DISMISS_MATCH':
      return { ...state, pendingMatchId: undefined }
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.game] }
    case 'SEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'ANSWER': {
      const games = state.games.map((g) => {
        if (g.id !== action.gameId) return g
        const userAnswers = [...g.userAnswers]
        const timedOut = [...(g.timedOut ?? new Array(g.questions.length).fill(false))]
        userAnswers[action.qIndex] = action.optIndex
        timedOut[action.qIndex] = false
        return { ...g, userAnswers, timedOut }
      })
      return { ...state, games }
    }
    case 'TIMEOUT': {
      const games = state.games.map((g) => {
        if (g.id !== action.gameId) return g
        const userAnswers = [...g.userAnswers]
        const timedOut = [...(g.timedOut ?? new Array(g.questions.length).fill(false))]
        userAnswers[action.qIndex] = -1
        timedOut[action.qIndex] = true
        return { ...g, userAnswers, timedOut }
      })
      return { ...state, games }
    }
    case 'COMPLETE_GAME': {
      const completedMatchId = state.games.find((g) => g.id === action.gameId)?.matchId
      const games = state.games.map((g) =>
        g.id === action.gameId ? { ...g, completedAt: Date.now() } : g,
      )
      const matches = state.matches.map((m) => ({
        ...m,
        thaw: thawFor(m.profileId, games),
        lastGameId: m.profileId === completedMatchId ? action.gameId : m.lastGameId,
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
  isSupabaseConfigured: boolean
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  like: (id: string) => void
  pass: (id: string) => void
  unmatch: (id: string) => void
  /** Report + block a profile (local-only in the POC). */
  reportProfile: (id: string) => void
  dismissMatch: () => void
  sendMessage: (matchId: string, body: string) => void
  /** Dispatch a simulated 'them' message (POC mock reply — not from a real user). */
  sendMatchMessage: (matchId: string, body: string) => void
  startGame: (matchId: string, category: TriviaCategory) => Promise<string>
  /** Start the personal "About {Name}" round, built from the match's profile. */
  startPersonalGame: (matchId: string) => Promise<string>
  answer: (gameId: string, qIndex: number, optIndex: number) => void
  timeout: (gameId: string, qIndex: number) => void
  completeGame: (gameId: string) => void
  setPreference: (preference: GenderPreference) => void
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
let messageCounter = 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    return activeAdapter.subscribeAuth(dispatch)
  }, [])

  useEffect(() => {
    try {
      const persistedState = {
        deck: state.deck,
        liked: state.liked,
        passed: state.passed,
        blocked: state.blocked,
        matches: state.matches,
        games: state.games,
        messages: state.messages,
        pendingMatchId: state.pendingMatchId,
        genderPreference: state.genderPreference,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState))
    } catch {
      /* ignore quota errors */
    }
  }, [state])

  const store = useMemo<Store>(
    () => ({
      state,
      isSupabaseConfigured,
      signInWithEmail: (email) => activeAdapter.signInWithEmail(email, dispatch),
      signOut: () => activeAdapter.signOut(dispatch),
      like: (id) => dispatch({ type: 'LIKE', id }),
      pass: (id) => dispatch({ type: 'PASS', id }),
      unmatch: (id) => dispatch({ type: 'UNMATCH', id }),
      reportProfile: (id) => {
        // TODO: when the backend lands, POST the report to a moderation queue
        // (reporter, reported id, reason, timestamp) before/after the local
        // block. Local-only for the POC so testing stays credential-free.
        dispatch({ type: 'REPORT', id })
      },
      dismissMatch: () => dispatch({ type: 'DISMISS_MATCH' }),
      sendMessage: (matchId, body) => {
        const trimmed = body.trim()
        if (!trimmed) return
        dispatch({
          type: 'SEND_MESSAGE',
          message: {
            id: `m${Date.now()}-${messageCounter++}`,
            matchId,
            sender: 'you',
            body: trimmed,
            sentAt: Date.now(),
          },
        })
      },
      sendMatchMessage: (matchId, body) => {
        const trimmed = body.trim()
        if (!trimmed) return
        dispatch({
          type: 'SEND_MESSAGE',
          message: {
            id: `m${Date.now()}-${messageCounter++}`,
            matchId,
            sender: 'them',
            body: trimmed,
            sentAt: Date.now(),
          },
        })
      },
      answer: (gameId, qIndex, optIndex) =>
        dispatch({ type: 'ANSWER', gameId, qIndex, optIndex }),
      timeout: (gameId, qIndex) => dispatch({ type: 'TIMEOUT', gameId, qIndex }),
      completeGame: (gameId) => dispatch({ type: 'COMPLETE_GAME', gameId }),
      setPreference: (preference) => {
        dispatch({ type: 'SET_PREFERENCE', preference })
        activeAdapter.syncOnboardingProfile(preference, state.auth.userId).then(() => {
          if (state.auth.adapter === 'supabase' && state.auth.userId) {
            dispatch({
              type: 'SET_AUTH',
              auth: {
                ...state.auth,
                status: 'ready',
                message: undefined,
                error: undefined,
              },
            })
          }
        }).catch((error: unknown) => {
          dispatch({
            type: 'SET_AUTH_MESSAGE',
            error: error instanceof Error ? error.message : 'Could not sync profile.',
          })
        })
      },
      reset: () => dispatch({ type: 'RESET' }),
      startGame: async (matchId, category) => {
        // Each successive game for this match rotates to a fresh window of the
        // question bank so replays don't repeat the same round.
        const variant = state.games.filter((g) => g.matchId === matchId).length
        const questions = await questionProvider.getQuestions(category, 7, variant)
        const id = `g${Date.now()}-${gameCounter++}`
        const seed = Array.from(id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
        const game: GameSession = {
          id,
          matchId,
          category,
          questions,
          userAnswers: new Array(questions.length).fill(-1),
          timedOut: new Array(questions.length).fill(false),
          matchAnswers: simulateMatchAnswers(questions, seed),
          startedAt: Date.now(),
        }
        dispatch({ type: 'ADD_GAME', game })
        return id
      },
      startPersonalGame: async (matchId) => {
        const profile = PROFILES.find((p) => p.id === matchId)
        const questions = profile ? generatePersonalQuestions(profile, matchId) : []
        const id = `g${Date.now()}-${gameCounter++}`
        const seed = Array.from(id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
        const game: GameSession = {
          id,
          matchId,
          category: PERSONAL_CATEGORY,
          aboutName: profile?.name,
          questions,
          userAnswers: new Array(questions.length).fill(-1),
          timedOut: new Array(questions.length).fill(false),
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
