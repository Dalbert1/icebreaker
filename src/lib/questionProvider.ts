import type { Question, TriviaCategory } from '../types'
import { QUESTION_SEEDS, questionFromSeed } from '../data/mockQuestions'

/**
 * The single seam between the app and any trivia source. The rest of the app
 * only ever talks to this interface, so swapping the mock bank for the Open
 * Trivia DB API (or a curated Supabase-backed bank later) is a drop-in change
 * with zero UI churn.
 */
export interface QuestionProvider {
  readonly name: string
  /**
   * `variant` rotates the selection so each successive game for a match draws a
   * fresh, non-overlapping round (until the bank is exhausted, then it wraps).
   * Same `(category, count, variant)` always yields the same questions, so games
   * stay reproducible across reloads and in tests.
   */
  getQuestions(
    category: TriviaCategory,
    count: number,
    variant?: number,
  ): Promise<Question[]>
}

/** Small seeded PRNG (mulberry32) so games are reproducible in tests. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Default provider for the POC. Pulls from the local bank — no network, no API
 * key, fully deterministic given a seed. The `seed` lets a specific game replay
 * the same questions/order across reloads.
 */
export class MockQuestionProvider implements QuestionProvider {
  readonly name = 'mock'
  private seed: string
  constructor(seed = 'icebreaker') {
    this.seed = seed
  }

  async getQuestions(
    category: TriviaCategory,
    count: number,
    variant = 0,
  ): Promise<Question[]> {
    const pool = QUESTION_SEEDS.filter((q) => q.category === category)
    if (pool.length === 0) return []

    // Stable, category-wide shuffle = a consistent "ring" of questions.
    const ringRng = makeRng(hashSeed(`${this.seed}:${category}`))
    const ring = [...pool]
    for (let i = ring.length - 1; i > 0; i--) {
      const j = Math.floor(ringRng() * (i + 1))
      ;[ring[i], ring[j]] = [ring[j], ring[i]]
    }

    // Each variant takes the next window of the ring, so consecutive games are
    // disjoint until the bank wraps around.
    const start = ((variant * count) % ring.length + ring.length) % ring.length
    const picked = Array.from({ length: Math.min(count, ring.length) }, (_, k) =>
      ring[(start + k) % ring.length],
    )

    // Option order varies per variant so even a repeated question looks fresh.
    const optRng = makeRng(hashSeed(`${this.seed}:${category}:${variant}`))
    return picked.map((seed, i) =>
      questionFromSeed(seed, `${category}-${variant}-${i}`, optRng),
    )
  }
}

/**
 * Open Trivia DB adapter — wired behind the same interface but NOT used by
 * default in the POC (we validate with mocks first, per project decision).
 * opentdb.com is free and key-less; flip the active provider in `lib/store`
 * when we're ready to test against live data. Falls back to the mock bank on
 * any network/shape error so the UI never breaks.
 *
 * @see https://opentdb.com/api_config.php
 */
const OTDB_CATEGORY_IDS: Record<TriviaCategory, number> = {
  'General Knowledge': 9,
  'Film & TV': 11,
  Music: 12,
  'Food & Drink': 9, // OTDB has no dedicated food category; map to general.
  Science: 17,
  Geography: 22,
}

export class OpenTriviaProvider implements QuestionProvider {
  readonly name = 'opentdb'
  private fallback = new MockQuestionProvider()

  async getQuestions(
    category: TriviaCategory,
    count: number,
    variant = 0,
  ): Promise<Question[]> {
    try {
      const id = OTDB_CATEGORY_IDS[category]
      const url = `https://opentdb.com/api.php?amount=${count}&category=${id}&type=multiple`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`OTDB ${res.status}`)
      const data = (await res.json()) as {
        response_code: number
        results: {
          question: string
          correct_answer: string
          incorrect_answers: string[]
        }[]
      }
      if (data.response_code !== 0 || !data.results?.length) {
        throw new Error('OTDB empty')
      }
      return data.results.map((r, i) => {
        const decode = (s: string) =>
          new DOMParser().parseFromString(s, 'text/html').body.textContent ?? s
        const options = [r.correct_answer, ...r.incorrect_answers].map(decode)
        // shuffle
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[options[j], options[k]] = [options[k], options[j]]
        }
        return {
          id: `otdb-${category}-${i}`,
          category,
          prompt: decode(r.question),
          options,
          correctIndex: options.indexOf(decode(r.correct_answer)),
        }
      })
    } catch {
      return this.fallback.getQuestions(category, count, variant)
    }
  }
}

// The active provider for the whole app. Swap here when moving off mocks.
export const questionProvider: QuestionProvider = new MockQuestionProvider()
