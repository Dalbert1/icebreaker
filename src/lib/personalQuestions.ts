import type { GameCategory, Profile, Question } from '../types'
import { PROFILE_QUESTIONS } from '../data/profileQuestions'

/** The category marker for a personal ("About {Name}") icebreaker game. */
export const PERSONAL_CATEGORY: GameCategory = 'Personal'

/** Human label for the personal category, given a match's name. */
export function personalCategoryLabel(name: string): string {
  return `About ${name}`
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32 — small, deterministic PRNG so a given match always replays the
 *  same options (and so the Playwright walk is stable). */
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

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = makeRng(seed)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Build the "About {Name}" round from a matched profile's own answers. Each
 * question's correct answer is the profile's real answer; 3 distractors are
 * drawn from the question's pool, fuzzy-excluding the real answer so it never
 * leaks into the wrong-answer column. The draw is seeded by `hash(matchId+key)`
 * so it's deterministic per match but different across matches.
 *
 * Returns [] if the profile has no `profileAnswers` (the personal category then
 * simply doesn't appear). Questions with a missing answer are skipped.
 */
export function generatePersonalQuestions(profile: Profile, matchId: string): Question[] {
  const answers = profile.profileAnswers
  if (!answers) return []

  const questions: Question[] = []
  for (const def of PROFILE_QUESTIONS) {
    const real = answers[def.key]
    if (!real) continue

    const candidates = def.pool.filter((opt) => {
      const a = norm(opt)
      const b = norm(real)
      return a !== b && !a.includes(b) && !b.includes(a)
    })
    const seed = hashSeed(`${matchId}:${def.key}`)
    const distractors = seededShuffle(candidates, seed).slice(0, 3)
    // Not enough pool entries to make a real multiple-choice question — skip.
    if (distractors.length < 3) continue

    const options = seededShuffle([real, ...distractors], seed ^ 0x9e3779b9)
    questions.push({
      id: `personal-${matchId}-${def.key}`,
      category: PERSONAL_CATEGORY,
      prompt: def.gamePrompt(profile.name),
      options,
      correctIndex: options.indexOf(real),
    })
  }
  return questions
}
