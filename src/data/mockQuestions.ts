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
  // --- second pass: rounds out each category to 7 questions ---
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
    category: 'General Knowledge',
    prompt: 'How many sides does a heptagon have?',
    correct: 'Seven',
    wrong: ['Six', 'Eight', 'Nine'],
  },
  {
    category: 'General Knowledge',
    prompt: 'What color is a polar bear\'s skin under its white fur?',
    correct: 'Black',
    wrong: ['Pink', 'White', 'Grey'],
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
    category: 'Film & TV',
    prompt: 'Which actor played Iron Man in the Marvel Cinematic Universe?',
    correct: 'Robert Downey Jr.',
    wrong: ['Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
  },
  {
    category: 'Film & TV',
    prompt: 'What TV show features the fictional paper company Dunder Mifflin?',
    correct: 'The Office',
    wrong: ['Parks and Recreation', '30 Rock', 'Arrested Development'],
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
    category: 'Music',
    prompt: 'What is the name of Taylor Swift\'s debut album?',
    correct: 'Taylor Swift',
    wrong: ['Fearless', 'Speak Now', 'Red'],
  },
  {
    category: 'Music',
    prompt: 'Which band was Beyoncé in before going solo?',
    correct: 'Destiny\'s Child',
    wrong: ['TLC', 'En Vogue', 'SWV'],
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
    category: 'Food & Drink',
    prompt: 'Which country is the largest producer of coffee in the world?',
    correct: 'Brazil',
    wrong: ['Colombia', 'Vietnam', 'Ethiopia'],
  },
  {
    category: 'Food & Drink',
    prompt: 'What pasta shape translates to "little worms" in Italian?',
    correct: 'Vermicelli',
    wrong: ['Spaghetti', 'Linguine', 'Capellini'],
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
    category: 'Science',
    prompt: 'What force keeps planets in orbit around the sun?',
    correct: 'Gravity',
    wrong: ['Magnetism', 'Centrifugal force', 'Dark energy'],
  },
  {
    category: 'Science',
    prompt: 'What is the speed of light in a vacuum (approx)?',
    correct: '300,000 km/s',
    wrong: ['150,000 km/s', '500,000 km/s', '3,000 km/s'],
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
  {
    category: 'Geography',
    prompt: 'On which continent is the Sahara Desert located?',
    correct: 'Africa',
    wrong: ['Asia', 'South America', 'Australia'],
  },
  {
    category: 'Geography',
    prompt: 'What is the tallest mountain in the world?',
    correct: 'Mount Everest',
    wrong: ['K2', 'Kangchenjunga', 'Lhotse'],
  },
  // --- third pass: doubles each category to 14 so replays draw fresh rounds ---
  {
    category: 'General Knowledge',
    prompt: 'Which language has the most native speakers worldwide?',
    correct: 'Mandarin Chinese',
    wrong: ['English', 'Spanish', 'Hindi'],
  },
  {
    category: 'General Knowledge',
    prompt: 'What is the largest organ in the human body?',
    correct: 'Skin',
    wrong: ['Liver', 'Brain', 'Lungs'],
  },
  {
    category: 'General Knowledge',
    prompt: 'Which land animal famously cannot jump?',
    correct: 'Elephant',
    wrong: ['Rhino', 'Hippo', 'Giraffe'],
  },
  {
    category: 'General Knowledge',
    prompt: 'Which letter does not appear in any U.S. state name?',
    correct: 'Q',
    wrong: ['Z', 'X', 'J'],
  },
  {
    category: 'General Knowledge',
    prompt: 'What do bees collect from flowers to make honey?',
    correct: 'Nectar',
    wrong: ['Pollen', 'Sap', 'Dew'],
  },
  {
    category: 'General Knowledge',
    prompt: 'What is the smallest prime number?',
    correct: 'Two',
    wrong: ['One', 'Three', 'Zero'],
  },
  {
    category: 'General Knowledge',
    prompt: 'How many colors are in a traditional rainbow?',
    correct: 'Seven',
    wrong: ['Five', 'Six', 'Eight'],
  },
  {
    category: 'Film & TV',
    prompt: 'In "Friends", what is the name of Ross\'s pet monkey?',
    correct: 'Marcel',
    wrong: ['George', 'Coco', 'Bingo'],
  },
  {
    category: 'Film & TV',
    prompt: 'Which film won the first-ever Academy Award for Best Animated Feature?',
    correct: 'Shrek',
    wrong: ['Toy Story', 'Finding Nemo', 'Monsters, Inc.'],
  },
  {
    category: 'Film & TV',
    prompt: 'Who directed "Jurassic Park"?',
    correct: 'Steven Spielberg',
    wrong: ['George Lucas', 'James Cameron', 'Ridley Scott'],
  },
  {
    category: 'Film & TV',
    prompt: 'In "Stranger Things", what is the alternate dimension called?',
    correct: 'The Upside Down',
    wrong: ['The Void', 'The Rift', 'The Underworld'],
  },
  {
    category: 'Film & TV',
    prompt: 'Which animated movie features the song "Let It Go"?',
    correct: 'Frozen',
    wrong: ['Moana', 'Tangled', 'Encanto'],
  },
  {
    category: 'Film & TV',
    prompt: 'In "The Lion King", what is the name of Simba\'s father?',
    correct: 'Mufasa',
    wrong: ['Scar', 'Rafiki', 'Zazu'],
  },
  {
    category: 'Film & TV',
    prompt: 'Which sitcom features a coffee shop called Central Perk?',
    correct: 'Friends',
    wrong: ['Seinfeld', 'Frasier', 'Cheers'],
  },
  {
    category: 'Music',
    prompt: 'Which decade is most associated with disco?',
    correct: 'The 1970s',
    wrong: ['The 1960s', 'The 1980s', 'The 1990s'],
  },
  {
    category: 'Music',
    prompt: 'What is the best-selling album of all time?',
    correct: 'Michael Jackson — "Thriller"',
    wrong: ['Eagles — "Hotel California"', 'AC/DC — "Back in Black"', 'The Beatles — "Abbey Road"'],
  },
  {
    category: 'Music',
    prompt: 'How many members were in The Beatles?',
    correct: 'Four',
    wrong: ['Three', 'Five', 'Six'],
  },
  {
    category: 'Music',
    prompt: 'Which music genre did Bob Marley help popularize worldwide?',
    correct: 'Reggae',
    wrong: ['Ska', 'Calypso', 'Soul'],
  },
  {
    category: 'Music',
    prompt: 'Which band recorded "Bohemian Rhapsody"?',
    correct: 'Queen',
    wrong: ['The Rolling Stones', 'Led Zeppelin', 'The Who'],
  },
  {
    category: 'Music',
    prompt: 'Who is known as the "King of Rock and Roll"?',
    correct: 'Elvis Presley',
    wrong: ['Chuck Berry', 'Little Richard', 'Buddy Holly'],
  },
  {
    category: 'Music',
    prompt: 'How many lines make up a standard musical staff?',
    correct: 'Five',
    wrong: ['Four', 'Six', 'Seven'],
  },
  {
    category: 'Food & Drink',
    prompt: 'What is the main ingredient in guacamole?',
    correct: 'Avocado',
    wrong: ['Tomatillo', 'Cucumber', 'Zucchini'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Which type of tea is fully oxidized?',
    correct: 'Black tea',
    wrong: ['Green tea', 'White tea', 'Oolong'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Dried plums are also known as what?',
    correct: 'Prunes',
    wrong: ['Raisins', 'Currants', 'Dates'],
  },
  {
    category: 'Food & Drink',
    prompt: 'True Champagne can only be produced in which country?',
    correct: 'France',
    wrong: ['Italy', 'Spain', 'Belgium'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Which grain is fermented to make traditional Japanese sake?',
    correct: 'Rice',
    wrong: ['Barley', 'Wheat', 'Corn'],
  },
  {
    category: 'Food & Drink',
    prompt: 'Which fast-food chain uses the slogan "I\'m Lovin\' It"?',
    correct: "McDonald's",
    wrong: ['Burger King', "Wendy's", 'KFC'],
  },
  {
    category: 'Food & Drink',
    prompt: 'After water, what is the most consumed beverage in the world?',
    correct: 'Tea',
    wrong: ['Coffee', 'Beer', 'Soda'],
  },
  {
    category: 'Science',
    prompt: 'Which planet is known as the "Red Planet"?',
    correct: 'Mars',
    wrong: ['Venus', 'Jupiter', 'Mercury'],
  },
  {
    category: 'Science',
    prompt: 'Which gas do plants absorb from the atmosphere?',
    correct: 'Carbon dioxide',
    wrong: ['Oxygen', 'Nitrogen', 'Hydrogen'],
  },
  {
    category: 'Science',
    prompt: 'How many legs does a spider have?',
    correct: 'Eight',
    wrong: ['Six', 'Ten', 'Twelve'],
  },
  {
    category: 'Science',
    prompt: 'What is the central part of an atom called?',
    correct: 'The nucleus',
    wrong: ['The electron', 'The proton', 'The neutron'],
  },
  {
    category: 'Science',
    prompt: 'What is the largest planet in our solar system?',
    correct: 'Jupiter',
    wrong: ['Saturn', 'Neptune', 'Earth'],
  },
  {
    category: 'Science',
    prompt: 'Which blood type is the universal red-cell donor?',
    correct: 'O negative',
    wrong: ['AB positive', 'A positive', 'B negative'],
  },
  {
    category: 'Science',
    prompt: 'What is the scientific study of weather called?',
    correct: 'Meteorology',
    wrong: ['Geology', 'Astrology', 'Ecology'],
  },
  {
    category: 'Geography',
    prompt: 'How many continents are there on Earth?',
    correct: 'Seven',
    wrong: ['Five', 'Six', 'Eight'],
  },
  {
    category: 'Geography',
    prompt: 'Which is the largest ocean on Earth?',
    correct: 'The Pacific',
    wrong: ['The Atlantic', 'The Indian', 'The Arctic'],
  },
  {
    category: 'Geography',
    prompt: 'What is the capital of Australia?',
    correct: 'Canberra',
    wrong: ['Sydney', 'Melbourne', 'Perth'],
  },
  {
    category: 'Geography',
    prompt: 'Which Italian city is known as the "City of Canals"?',
    correct: 'Venice',
    wrong: ['Amsterdam', 'Bruges', 'Florence'],
  },
  {
    category: 'Geography',
    prompt: 'In which country is Mount Kilimanjaro located?',
    correct: 'Tanzania',
    wrong: ['Kenya', 'Ethiopia', 'Uganda'],
  },
  {
    category: 'Geography',
    prompt: 'What is the largest country in the world by land area?',
    correct: 'Russia',
    wrong: ['Canada', 'China', 'United States'],
  },
  {
    category: 'Geography',
    prompt: 'What is the capital of Canada?',
    correct: 'Ottawa',
    wrong: ['Toronto', 'Vancouver', 'Montreal'],
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
