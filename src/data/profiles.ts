import type { Profile } from '../types'

// Bundled portrait assets (downloaded locally — no runtime network needed,
// works on static hosting / GitHub Pages). Faces from pravatar.cc.
import f5 from '../assets/profiles/f5.jpg'
import f9 from '../assets/profiles/f9.jpg'
import f16 from '../assets/profiles/f16.jpg'
import f25 from '../assets/profiles/f25.jpg'
import f32 from '../assets/profiles/f32.jpg'
import f47 from '../assets/profiles/f47.jpg'
import f11 from '../assets/profiles/f11.jpg'
import f13 from '../assets/profiles/f13.jpg'
import f60 from '../assets/profiles/f60.jpg'

// Mock dating pool for the POC — all Tulsa, OK. Gradients are a fallback/accent
// behind the photo and also tint the frost overlay for the thaw mechanic.
export const PROFILES: Profile[] = [
  {
    id: 'p1',
    name: 'Maya',
    age: 27,
    location: 'Brookside · 2 mi',
    bio: 'Cartographer of good coffee — I have ranked every espresso on Cherry Street. Will absolutely judge your QT order (kindly).',
    vibes: ['Foodie', 'Traveler', 'Early bird'],
    photo: f5,
    gradient: ['#5ed3ff', '#7b8cff'],
    prompt: { question: 'My most controversial Tulsa opinion', answer: 'Burn Co > every BBQ spot, and I will defend it at Guthrie Green.' },
  },
  {
    id: 'p2',
    name: 'Theo',
    age: 30,
    location: 'Turkey Mountain · 6 mi',
    bio: 'Trail runner on Turkey Mountain, terrible at chess but I will still challenge you at a Blue Dome patio.',
    vibes: ['Adventurer', 'Gym rat', 'Night owl'],
    photo: f11,
    gradient: ['#2dd4bf', '#5ed3ff'],
    prompt: { question: 'We will get along if', answer: 'you can name three Cain\'s Ballroom shows or pretend convincingly.' },
  },
  {
    id: 'p3',
    name: 'Nia',
    age: 25,
    location: 'Greenwood · 1 mi',
    bio: 'Plant mom of eleven, reading two books at once near the Gathering Place. History nerd, Greenwood proud.',
    vibes: ['Bookworm', 'Homebody', 'Artist'],
    photo: f16,
    gradient: ['#ff8e72', '#ffb454'],
    prompt: { question: 'My simple pleasures', answer: 'sunset over the river, a closed tab, and a Mother Road Market crawl.' },
  },
  {
    id: 'p4',
    name: 'Marcus',
    age: 29,
    location: 'Kendall-Whittier · 3 mi',
    bio: 'Amateur chef, professional snack enthusiast. I make a shakshuka that could win the Tulsa State Fair.',
    vibes: ['Foodie', 'Homebody', 'Gamer'],
    photo: f13,
    gradient: ['#ff6b5e', '#ff5d8f'],
    prompt: { question: 'The way to my heart', answer: 'a well-timed meme and splitting a pie at Andolini\'s.' },
  },
  {
    id: 'p5',
    name: 'Sloane',
    age: 26,
    location: 'Tulsa Arts District · 2 mi',
    bio: 'Synth player in a band you have not heard of (yet) — catch us in the Arts District. Sunset chaser on Riverside.',
    vibes: ['Artist', 'Night owl', 'Traveler'],
    photo: f9,
    gradient: ['#a78bfa', '#ff8e72'],
    prompt: { question: 'Two truths and a lie', answer: 'I have played Cain\'s, I can juggle, I hate Tex-Mex.' },
  },
  {
    id: 'p6',
    name: 'Hana',
    age: 24,
    location: 'Pearl District · 4 mi',
    bio: 'Ceramicist with cold hands and warm opinions. Tea over coffee — fight me on a Pearl District patio.',
    vibes: ['Artist', 'Homebody', 'Bookworm'],
    photo: f25,
    gradient: ['#22d3ee', '#a78bfa'],
    prompt: { question: 'A green flag for me', answer: 'you text back and you own a Philbrook membership.' },
  },
  {
    id: 'p7',
    name: 'Hannah',
    age: 28,
    location: 'Midtown · 3 mi',
    bio: 'Foggy-morning hiker, documentary hoarder. Dog comes to Woodward Park dates — non-negotiable.',
    vibes: ['Adventurer', 'Early bird', 'Bookworm'],
    photo: f32,
    gradient: ['#34d399', '#5ed3ff'],
    prompt: { question: 'Ideal Sunday', answer: 'a loop around Woodward Park, then doing nothing with purpose at Antoinette.' },
  },
  {
    id: 'p8',
    name: 'Ivy',
    age: 27,
    location: 'Cherry Street · 2 mi',
    bio: 'Trivia-night captain at a Cherry Street pub, looking for a co-captain. Undefeated, mostly.',
    vibes: ['Gamer', 'Night owl', 'Foodie'],
    photo: f47,
    gradient: ['#fbbf24', '#ff6b5e'],
    prompt: { question: 'My winning category', answer: 'Oklahoma history and 90s one-hit wonders.' },
  },
]

/** The signed-in user (mocked for the POC — no auth yet). */
export const ME: Profile = {
  id: 'me',
  name: 'You',
  age: 28,
  location: 'Tulsa, OK',
  bio: 'Just here to break the ice. Ask me anything — preferably in trivia form.',
  vibes: ['Foodie', 'Traveler', 'Gamer'],
  photo: f60,
  gradient: ['#5ed3ff', '#ff8e72'],
  prompt: { question: 'My icebreaker style', answer: 'questions first, small talk never.' },
}
