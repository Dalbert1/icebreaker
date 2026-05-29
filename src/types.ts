// Core domain types for icebreaker. Kept framework-agnostic so they can move
// into a shared package when the mobile app arrives.

export type Vibe =
  | 'Adventurer'
  | 'Homebody'
  | 'Night owl'
  | 'Early bird'
  | 'Foodie'
  | 'Bookworm'
  | 'Gym rat'
  | 'Artist'
  | 'Gamer'
  | 'Traveler'

export interface Profile {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  /** Short city / distance line. */
  location: string
  bio: string
  vibes: Vibe[]
  /** Imported profile photo (bundled asset URL). */
  photo: string
  /** Two hex colors used as a fallback/accent behind the photo. */
  gradient: [string, string]
  /** A prompt + answer, dating-app style. */
  prompt: { question: string; answer: string }
  /**
   * Answers to the 7 personal-profile questions, used to build the "About
   * {Name}" icebreaker game. Optional so a profile can exist without them
   * (the personal category simply won't appear). Kept out of the public
   * Discover surface — only revealed through play once matched.
   */
  profileAnswers?: Partial<Record<ProfileQuestionKey, string>>
}

export type TriviaCategory =
  | 'General Knowledge'
  | 'Film & TV'
  | 'Music'
  | 'Food & Drink'
  | 'Science'
  | 'Geography'

/**
 * A game's category is either one of the generic trivia categories or the
 * per-match **personal** icebreaker ("About {Name}"), whose questions are built
 * from the matched profile's own answers. `.category` is used only as a display
 * label, so widening it here doesn't affect the trivia providers.
 */
export type GameCategory = TriviaCategory | 'Personal'

/** Keys for the 7 personal-profile answers that seed the "About {Name}" game. */
export type ProfileQuestionKey =
  | 'favoriteFood'
  | 'firstDate'
  | 'sundayMorning'
  | 'greenFlag'
  | 'bingeGenre'
  | 'loveLanguage'
  | 'travelMustHave'

export interface Question {
  id: string
  category: GameCategory
  prompt: string
  /** Shuffled answer options including the correct one. */
  options: string[]
  correctIndex: number
}

/**
 * A single icebreaker game between the user and a matched profile.
 * Async / turn-based: the user answers all questions, the match's answers are
 * simulated for the POC. Each answered question "thaws" the match's portrait.
 */
export interface GameSession {
  id: string
  matchId: string
  category: GameCategory
  /** For a personal ("About {Name}") game, the match's display name. */
  aboutName?: string
  questions: Question[]
  /** Index into options the user picked, per question (-1 = unanswered). */
  userAnswers: number[]
  /** Whether the user ran out of time on each question. */
  timedOut: boolean[]
  /** Simulated answers from the match. */
  matchAnswers: number[]
  startedAt: number
  completedAt?: number
}

export interface Match {
  profileId: string
  matchedAt: number
  /** 0..1 — how thawed this connection is, derived from games played. */
  thaw: number
  lastGameId?: string
}

/**
 * A chat message in a match thread. POC is local-only and single-sided: the
 * user's own messages are real and persisted; `'them'` is reserved for Phase 3
 * real multi-user messaging.
 */
export interface Message {
  id: string
  matchId: string
  sender: 'you' | 'them'
  body: string
  sentAt: number
}
