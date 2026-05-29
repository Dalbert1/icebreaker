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
}

export type TriviaCategory =
  | 'General Knowledge'
  | 'Film & TV'
  | 'Music'
  | 'Food & Drink'
  | 'Science'
  | 'Geography'

export interface Question {
  id: string
  category: TriviaCategory
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
  category: TriviaCategory
  questions: Question[]
  /** Index into options the user picked, per question (-1 = unanswered). */
  userAnswers: number[]
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
