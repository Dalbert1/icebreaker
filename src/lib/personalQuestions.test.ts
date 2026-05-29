import { describe, it, expect } from 'vitest'
import type { Profile } from '../types'
import { generatePersonalQuestions, PERSONAL_CATEGORY } from './personalQuestions'
import { PROFILE_QUESTIONS } from '../data/profileQuestions'

const baseProfile: Profile = {
  id: 'p1',
  name: 'Maya',
  age: 27,
  gender: 'female',
  location: 'Brookside · 2 mi',
  bio: 'bio',
  vibes: ['Foodie'],
  photo: 'x.jpg',
  gradient: ['#000', '#fff'],
  prompt: { question: 'q', answer: 'a' },
  profileAnswers: {
    favoriteFood: 'smoked brisket',
    firstDate: 'Coffee shop and a walk',
    sundayMorning: 'coffee shop with a book',
    greenFlag: 'asks follow-up questions',
    bingeGenre: 'Documentary',
    loveLanguage: 'Quality time',
    travelMustHave: 'downloaded playlists',
  },
}

describe('generatePersonalQuestions', () => {
  it('returns one question per answered profile question', () => {
    const qs = generatePersonalQuestions(baseProfile, 'p1')
    expect(qs).toHaveLength(PROFILE_QUESTIONS.length)
  })

  it('returns [] when the profile has no answers', () => {
    const noAnswers: Profile = { ...baseProfile, profileAnswers: undefined }
    expect(generatePersonalQuestions(noAnswers, 'p1')).toEqual([])
  })

  it('skips questions whose answer is missing', () => {
    const partial: Profile = {
      ...baseProfile,
      profileAnswers: { favoriteFood: 'smoked brisket', bingeGenre: 'Drama' },
    }
    expect(generatePersonalQuestions(partial, 'p1')).toHaveLength(2)
  })

  it('marks the profile answer as the correct option', () => {
    const qs = generatePersonalQuestions(baseProfile, 'p1')
    for (const q of qs) {
      expect(q.category).toBe(PERSONAL_CATEGORY)
      expect(q.options[q.correctIndex]).toBeDefined()
      expect(q.options).toHaveLength(4)
    }
    const food = qs.find((q) => q.id.endsWith('favoriteFood'))!
    expect(food.options[food.correctIndex]).toBe('smoked brisket')
  })

  it('never leaks the real answer into the distractors', () => {
    const qs = generatePersonalQuestions(baseProfile, 'p1')
    for (const q of qs) {
      const real = q.options[q.correctIndex]
      const occurrences = q.options.filter((o) => o === real).length
      expect(occurrences).toBe(1)
    }
  })

  it('is deterministic for the same match', () => {
    const a = generatePersonalQuestions(baseProfile, 'p1')
    const b = generatePersonalQuestions(baseProfile, 'p1')
    expect(a).toEqual(b)
  })

  it('produces different option sets across matches', () => {
    const a = generatePersonalQuestions(baseProfile, 'p1')
    const b = generatePersonalQuestions(baseProfile, 'p99')
    // At least one question's options differ (distractor draw is match-seeded).
    const differs = a.some((qa, i) => JSON.stringify(qa.options) !== JSON.stringify(b[i].options))
    expect(differs).toBe(true)
  })
})
