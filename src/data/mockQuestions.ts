import type { Question, TriviaCategory } from '../types'

// A small, hand-seeded bank used by the MockQuestionProvider. Stored with the
// correct answer first; the provider shuffles options per session so the
// correct index is randomized. Intentionally light / fun, fitting an
// icebreaker context rather than a hardcore quiz.
type Seed = { category: TriviaCategory; prompt: string; correct: string; wrong: string[] }

export const QUESTION_SEEDS: Seed[] = [
  {
    category: 'General Knowledge',
    prompt: 'What is the only food that never spoils?',
    correct: 'Honey',
    wrong: ['Rice', 'Dark chocolate', 'Canned beans'],
  },
  {
    category: 'General Knowledge',
    prompt: 'How many hearts does an octopus have?',
    correct: 'Three',
    wrong: ['One', 'Two', 'Eight'],
  },
  {
    category: 'General Knowledge',
    prompt: 'What do you call a group of flamingos?',
    correct: 'A flamboyance',
    wrong: ['A flock', 'A parade', 'A dazzle'],
  },
  {
    category: 'Film & TV',
    prompt: 'In "The Office", what is the name of Michael Scott\'s screenplay?',
    correct: 'Threat Level Midnight',
    wrong: ['Agent Michael Scarn', 'Midnight Justice', 'The Scarn Files'],
  },
  {
    category: 'Film & TV',
    prompt: 'Which film features the line "Here\'s looking at you, kid"?',
    correct: 'Casablanca',
    wrong: ['Gone with the Wind', 'Citizen Kane', 'The Maltese Falcon'],
  },
  {
    category: 'Film & TV',
    prompt: 'What animated film features a rat who dreams of becoming a chef?',
    correct: 'Ratatouille',
    wrong: ['Flushed Away', 'Chicken Run', 'Cloudy with a Chance of Meatballs'],
  },
  {
    category: 'Music',
    prompt: 'Which instrument has 88 keys?',
    correct: 'Piano',
    wrong: ['Accordion', 'Harp', 'Organ'],
  },
  {
    category: 'Music',
    prompt: 'Who is known as the "Queen of Pop"?',
    correct: 'Madonna',
    wrong: ['Cher', 'Whitney Houston', 'Mariah Carey'],
  },
  {
    category: 'Music',
    prompt: 'How many strings does a standard violin have?',
    correct: 'Four',
    wrong: ['Five', 'Six', 'Three'],
  },
  {
    category: 'Food & Drink',
    prompt: 'What spice is derived from the Crocus flower?',
    correct: 'Saffron',
    wrong: ['Turmeric', 'Cardamom', 'Paprika'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Which country invented ice cream cones at a World\'s Fair?',
    correct: 'United States',
    wrong: ['Italy', 'France', 'Japan'],
  },
  {
    category: 'Food & Drink',
    prompt: 'What is the main ingredient in traditional hummus?',
    correct: 'Chickpeas',
    wrong: ['Lentils', 'White beans', 'Edamame'],
  },
  {
    category: 'Science',
    prompt: 'What is the most abundant gas in Earth\'s atmosphere?',
    correct: 'Nitrogen',
    wrong: ['Oxygen', 'Carbon dioxide', 'Argon'],
  },
  {
    category: 'Science',
    prompt: 'At what temperature are Celsius and Fahrenheit equal?',
    correct: '-40°',
    wrong: ['0°', '-273°', '100°'],
  },
  {
    category: 'Science',
    prompt: 'What part of the cell is the "powerhouse"?',
    correct: 'Mitochondria',
    wrong: ['Nucleus', 'Ribosome', 'Golgi apparatus'],
  },
  {
    category: 'Geography',
    prompt: 'Which is the only country that is also a continent?',
    correct: 'Australia',
    wrong: ['Greenland', 'India', 'Antarctica'],
  },
  {
    category: 'Geography',
    prompt: 'What is the capital of Iceland?',
    correct: 'Reykjavík',
    wrong: ['Oslo', 'Helsinki', 'Nuuk'],
  },
  {
    category: 'Geography',
    prompt: 'Which river is the longest in the world?',
    correct: 'The Nile',
    wrong: ['The Amazon', 'The Yangtze', 'The Mississippi'],
  },
  // --- second pass: rounds out each category to 5 questions ---
  {
    category: 'General Knowledge',
    prompt: 'What is the hardest natural substance on Earth?',
    correct: 'Diamond',
    wrong: ['Quartz', 'Titanium', 'Granite'],
  },
  {
    category: 'General Knowledge',
    prompt: 'Which planet spins on its side?',
    correct: 'Uranus',
    wrong: ['Saturn', 'Neptune', 'Venus'],
  },
  {
    category: 'Film & TV',
    prompt: 'Which sitcom is set at Paddy\'s Pub in Philadelphia?',
    correct: "It's Always Sunny in Philadelphia",
    wrong: ['Cheers', 'How I Met Your Mother', 'Brooklyn Nine-Nine'],
  },
  {
    category: 'Film & TV',
    prompt: 'In Pixar\'s "Up", what is the name of the dog?',
    correct: 'Dug',
    wrong: ['Doug', 'Russell', 'Kevin'],
  },
  {
    category: 'Music',
    prompt: 'Which band released the album "Dark Side of the Moon"?',
    correct: 'Pink Floyd',
    wrong: ['Led Zeppelin', 'The Who', 'Queen'],
  },
  {
    category: 'Music',
    prompt: 'How many keys are black on a standard piano?',
    correct: '36',
    wrong: ['52', '24', '40'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Which nut is used to make traditional marzipan?',
    correct: 'Almond',
    wrong: ['Cashew', 'Walnut', 'Hazelnut'],
  },
  {
    category: 'Food & Drink',
    prompt: 'What gives wasabi and mustard their shared sharp kick?',
    correct: 'Allyl isothiocyanate',
    wrong: ['Capsaicin', 'Piperine', 'Menthol'],
  },
  {
    category: 'Science',
    prompt: 'What is the chemical symbol for gold?',
    correct: 'Au',
    wrong: ['Ag', 'Gd', 'Go'],
  },
  {
    category: 'Science',
    prompt: 'How many bones are in the adult human body?',
    correct: '206',
    wrong: ['201', '212', '198'],
  },
  {
    category: 'Geography',
    prompt: 'Which U.S. state is nicknamed the "Sooner State"?',
    correct: 'Oklahoma',
    wrong: ['Kansas', 'Texas', 'Nebraska'],
  },
  {
    category: 'Geography',
    prompt: 'What is the smallest country in the world by area?',
    correct: 'Vatican City',
    wrong: ['Monaco', 'San Marino', 'Liechtenstein'],
  },
]

/** Build a finished Question (with shuffled options) from a seed + rng. */
export function questionFromSeed(seed: Seed, id: string, rng: () => number): Question {
  const options = [seed.correct, ...seed.wrong]
  // Fisher–Yates with injected rng for deterministic tests.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return {
    id,
    category: seed.category,
    prompt: seed.prompt,
    options,
    correctIndex: options.indexOf(seed.correct),
  }
}

export const CATEGORIES: TriviaCategory[] = [
  'General Knowledge',
  'Film & TV',
  'Music',
  'Food & Drink',
  'Science',
  'Geography',
]
