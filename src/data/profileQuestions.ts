import type { ProfileQuestionKey } from '../types'

/**
 * The 7 personal-profile questions behind the "About {Name}" icebreaker.
 * See docs/PERSONAL_ICEBREAKER.md for the design rationale. v1 choices:
 *   - `firstDate`, `bingeGenre`, `loveLanguage` are CONSTRAINED lists — the
 *     distractors are simply the other entries, so they're always plausible.
 *   - the rest are free-text answers; distractors are drawn (match-seeded) from
 *     a curated pool written at the same specificity level as real answers, so
 *     the correct one doesn't stand out.
 *
 * `pool` is the candidate distractor source for BOTH kinds. For list questions
 * the real answer is one of the pool entries (excluded at draw time); for text
 * questions the real answer usually isn't in the pool at all. Either way the
 * generator fuzzy-excludes the real answer before drawing.
 *
 * TODO: Phase 3+ — replace the static pools with on-the-fly, style-matched
 * distractor generation behind the QuestionProvider seam (see design doc).
 */
export interface ProfileQuestionDef {
  key: ProfileQuestionKey
  /** The question as shown in-game, given the match's name. */
  gamePrompt: (name: string) => string
  /** Short human-readable label for post-game "what you learned" panels. */
  learnedLabel: string
  kind: 'text' | 'list'
  pool: string[]
}

const FIRST_DATE = [
  'Coffee shop and a walk',
  'Rooftop drinks',
  'Dinner reservation',
  'Farmers market browse',
  'Bowling or mini golf',
  'Cooking class',
  'Art gallery or museum',
  'Live music show',
  'Escape room',
  'Hiking trail',
  'Food truck tour',
  'Bookstore browse',
]

const BINGE_GENRE = [
  'Drama',
  'Comedy',
  'Reality TV',
  'Documentary',
  'Thriller',
  'Sci-Fi',
  'True Crime',
  'Fantasy',
]

const LOVE_LANGUAGE = [
  'Words of affirmation',
  'Quality time',
  'Acts of service',
  'Physical touch',
  'Gift giving',
]

export const PROFILE_QUESTIONS: ProfileQuestionDef[] = [
  {
    key: 'favoriteFood',
    gamePrompt: (name) => `What's ${name}'s go-to dish?`,
    learnedLabel: 'Favorite food',
    kind: 'text',
    pool: [
      'spicy tuna roll', 'chicken tikka masala', 'tacos al pastor', 'shakshuka',
      'pad thai', 'birria tacos', 'spicy vodka pasta', 'pho', 'lobster roll',
      'butter chicken', 'bánh mì', 'smoked brisket', 'kimchi fried rice',
      'risotto ai funghi', 'street elote', 'grilled salmon with miso glaze',
      'lamb chops', 'clam chowder', 'cacio e pepe', 'pepperoni deep dish',
    ],
  },
  {
    key: 'firstDate',
    gamePrompt: (name) => `${name}'s idea of a perfect first date?`,
    learnedLabel: 'Dream first date',
    kind: 'list',
    pool: FIRST_DATE,
  },
  {
    key: 'sundayMorning',
    gamePrompt: (name) => `How does ${name} spend a perfect Sunday morning?`,
    learnedLabel: 'Sunday morning vibe',
    kind: 'text',
    pool: [
      'sleeping in until noon', 'solo hike before breakfast', 'coffee shop with a book',
      'long brunch with friends', 'cooking a big breakfast', 'yoga then a smoothie',
      'farmers market run', 'exploring a new neighborhood', 'reading in bed until noon',
      'long run then eggs', 'weekend yoga class', 'thrift store crawl',
      'beach walk at sunrise',
    ],
  },
  {
    key: 'greenFlag',
    gamePrompt: (name) => `${name}'s biggest green flag in a person?`,
    learnedLabel: 'Biggest green flag',
    kind: 'text',
    pool: [
      'makes me laugh at myself', 'remembers small things I mentioned',
      'has their own creative thing', 'travels solo sometimes', 'texts back like a human',
      'owns an actual bookshelf', 'asks follow-up questions', 'cooks for people',
      "early riser who's not annoying about it", 'loves animals visibly',
      'has a signature dish', 'plans ahead but stays flexible',
      'genuinely curious about everyone', 'reads actual books',
    ],
  },
  {
    key: 'bingeGenre',
    gamePrompt: (name) => `${name}'s favorite genre to binge?`,
    learnedLabel: 'Binge genre',
    kind: 'list',
    pool: BINGE_GENRE,
  },
  {
    key: 'loveLanguage',
    gamePrompt: (name) => `${name}'s love language?`,
    learnedLabel: 'Love language',
    kind: 'list',
    pool: LOVE_LANGUAGE,
  },
  {
    key: 'travelMustHave',
    gamePrompt: (name) => `One thing ${name} always travels with?`,
    learnedLabel: 'Travel must-have',
    kind: 'text',
    pool: [
      'noise-canceling headphones', 'a physical book', 'my own pillow',
      'portable espresso maker', 'a journal', 'hiking boots', 'my skincare routine',
      'downloaded playlists', 'a good camera', 'snacks from home', 'a hammock',
      'portable charger brick', 'a local SIM card', 'one nice outfit', 'my running shoes',
    ],
  },
]
