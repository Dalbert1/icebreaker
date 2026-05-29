# Personal Icebreaker — Design Doc

The first game with any match uses questions drawn from their profile answers instead
of generic trivia. This makes the icebreaker mechanic personal from the start: you're
not just doing pub quiz together, you're learning who they actually are.

---

## Concept

At sign-up every user fills out 7 short profile questions. When you match with someone,
a special **"About [Name]"** category appears at the top of the game picker. Questions
look like:

> *What is Sarah's ideal first date setting?*
>
> ○ Rooftop drinks  
> ○ **Cooking class** ← Sarah's real answer  
> ○ Farmers market browse  
> ○ Live music show  

The correct answer is always Sarah's real answer. The three distractors are drawn from a
curated pool for that question. Scoring and the thaw mechanic work exactly as they do
for regular trivia.

At the end, even wrong answers pay off: the results screen shows what their real answers
were for every question, so you always leave knowing more about the person.

---

## The 7 Profile Questions

Chosen to maximize both *emotional resonance* and *pool-ability* (the answer space must
be bounded enough to build plausible distractors).

| # | Question shown in profile form | Key in `profileAnswers` | Input style |
|---|---|---|---|
| 1 | What's your go-to dish — cook or order? | `favoriteFood` | free text, 40 chars |
| 2 | Ideal first date setting? | `firstDate` | pick from list |
| 3 | Perfect Sunday morning? | `sundayMorning` | free text, 50 chars |
| 4 | Biggest green flag in a person? | `greenFlag` | free text, 50 chars |
| 5 | What are you currently into? (show, book, podcast — one thing) | `currentlyInto` | free text, 50 chars |
| 6 | Your love language? | `loveLanguage` | pick from list |
| 7 | One thing you always travel with? | `travelMustHave` | free text, 40 chars |

**Why this mix:**
- Q1, Q3, Q5, Q7 are free text — personal, surprising, conversation-starting
- Q2 and Q6 are constrained lists — the distractor problem is trivially solved (remaining
  options in the list ARE the distractors)
- Q4 is free text but pools well (green flags are a bounded human vocabulary)

---

## Distractor Strategy

### The core problem

If the real answer is highly specific or quirky and the distractors are generic, the
correct answer stands out. Additionally, if the same 3 distractors always appear across
every match's first game, returning users recognize the pattern immediately.

### Solution: large pools + match-seeded draw + fuzzy exclusion

Each free-text question has a curated pool of **20–25 plausible human answers**. At
match time:

1. **Fuzzy-exclude** the user's real answer from the pool (lowercase + trim + partial
   match) so it never appears as a distractor.
2. **Seed** a pseudo-random draw with `hash(matchId + questionKey)` — deterministic
   within one game (replaying gives the same options) but different for every match
   (C(22,3) = 1,540 combinations per question).
3. **Draw 3** from the remaining pool.

This means:
- A user who matches with 10 people sees 10 different distractor sets for "favorite
  food" — no pattern to recognize.
- The correct answer never leaks into the wrong-answer column.

### Style divergence

The biggest risk: user writes "Slow-braised short rib with gremolata" while the pool
contains "Pizza", "Ramen", "Tacos" — the specificity mismatch is a giveaway.

Mitigations:
- **Character limits + example hints** in the profile form ("e.g. spicy tuna roll,
  shakshuka — keep it to one dish") narrow the register.
- **Pool entries are written at the same specificity level** — not "Pizza" but "pepperoni
  deep dish" and "spicy vodka pasta".
- **Long-term (Phase 3+):** send the real answer + question key to an LLM endpoint and
  generate 3 style-matched distractors on the fly. Stub this behind the `QuestionProvider`
  seam with a `// TODO: replace with AI distractor generation` comment.

### Constrained-list questions

Q2 (first date) and Q6 (love language) don't need pools — the distractors are simply the
other entries in the same list. Always different from the real answer by construction.

---

## Distractor Pools (draft)

### Q1 — favoriteFood

spicy tuna roll, chicken tikka masala, tacos al pastor, shakshuka, pad thai, birria
tacos, spicy vodka pasta, pho, lobster roll, butter chicken, bánh mì, smoked brisket,
kimchi fried rice, risotto ai funghi, street elote, grilled salmon with miso glaze,
lamb chops, clam chowder, cacio e pepe, pepperoni deep dish

### Q2 — firstDate (constrained list, no separate pool needed)

Coffee shop and a walk, Rooftop drinks, Dinner reservation, Farmers market browse,
Bowling or mini golf, Cooking class, Art gallery or museum, Live music show,
Escape room, Hiking trail, Food truck tour, Bookstore browse

### Q3 — sundayMorning

sleeping in until noon, solo hike before breakfast, coffee shop with a book,
long brunch with friends, cooking a big breakfast, yoga then a smoothie, farmers market
run, exploring a new neighborhood, farmers market then napping, reading in bed until
noon, long run then eggs, weekend yoga class, thrift store crawl, beach walk at sunrise

### Q4 — greenFlag

makes me laugh at myself, remembers small things I mentioned, has their own
creative thing, travels solo sometimes, texts back like a human, owns an actual
bookshelf, asks follow-up questions, cooks for people, early riser who's not
annoying about it, loves animals visibly, has a signature dish, plans ahead but
stays flexible, genuinely curious about everyone, reads actual books

### Q5 — currentlyInto

Pool is intentionally NOT used here — this answer is too free-form and ages poorly.
Instead, the game question becomes: *"Which of these is [Name] currently into?"* and
the distractors are randomly drawn from a rolling list of broadly popular shows, books,
and podcasts refreshed periodically. The real answer is still their typed entry; the
pool is the "wrong answer" menu.

Alternatively: rephrase the profile question as *"Favorite genre to binge"* with a
constrained list (Drama / Comedy / Reality TV / Documentary / Thriller / Sci-Fi /
True Crime / Fantasy). Eliminates the free-text problem entirely. **Recommended for
v1.**

### Q6 — loveLanguage (constrained list)

Words of affirmation, Quality time, Acts of service, Physical touch, Gift giving

### Q7 — travelMustHave

noise-canceling headphones, a physical book, my own pillow, portable espresso maker,
a journal, hiking boots, my skincare routine, downloaded playlists, a good camera,
snacks from home, a hammock, portable charger brick, a local SIM card, one nice
outfit, my running shoes

---

## UX Flow

### Onboarding addition

After the preference selection step ("Everyone / Women / Men"), add a **"Now, tell us
about you"** step:

- Progress indicator: step 2 of 2
- 7 questions presented one at a time (card swipe or scrollable form — TBD)
- Free-text inputs have a character counter and an example hint beneath
- Constrained inputs render as a pill/chip selector
- "Skip for now" exits to Discover but marks profile as incomplete; a soft nudge
  appears on the Profile screen

### Game picker

The "About [Name]" category appears **pinned at the top** of the category grid on the
first visit to `/game/:matchId`. After it's been played once, it moves to a normal
grid position and shows a "Played" state (can replay, but the thaw contribution is
capped on repeat plays).

Alternatively: the very first game with any new match skips the category picker
entirely and auto-launches the personal icebreaker. Category picker appears only for
subsequent games. This is cleaner UX but less discoverable.

### Results screen enhancement

After the final question, before the "Want to chat?" screen, show a **"What you
learned"** interstitial: all 7 questions with the real answers revealed, and a
checkmark on the ones the user got right. This is the payoff — even wrong guesses
become conversation starters.

---

## Implementation Plan (rough)

```
Phase 2.5 — Personal Icebreaker
├── src/types.ts
│   └── add profileAnswers: Partial<Record<ProfileQuestionKey, string>> to Profile
├── src/data/profileQuestions.ts       (new)
│   ├── PROFILE_QUESTIONS array (7 entries, each with key/prompt/inputType/pool/hint)
│   └── constrained list definitions
├── src/data/profiles.ts
│   └── add profileAnswers to all mock profiles (realistic sample data)
├── src/lib/personalQuestionProvider.ts (new, implements QuestionProvider interface)
│   ├── generatePersonalGame(profile, matchId) → TriviaQuestion[]
│   └── matchSeededDistractors(pool, realAnswer, seed) → string[3]
├── src/screens/Onboarding.tsx
│   └── add ProfileQuestionsStep (new sub-component)
├── src/screens/Game.tsx
│   └── surface "About [Name]" as pinned category; wire PersonalQuestionProvider
└── src/screens/Game.tsx WantToChat / new WhatYouLearned screen
```

The `PersonalQuestionProvider` implements the existing `QuestionProvider` interface so
the rest of the game loop is unmodified. The seeded random is a simple LCG seeded with
`parseInt(matchId.replace(/\D/g, '').slice(0, 8), 10) + questionIndex` — no external
dependency.

---

## Open Questions

1. **Skip penalty?** If a user skips the profile questions, their matches never get a
   personal icebreaker. Do we gate matching behind completing the form, or show a
   degraded experience (category picker only)?

2. **Updating answers.** After someone answers "tacos al pastor" at sign-up and then
   changes their mind, do we update the distractor pool exclusion? Probably yes — the
   profile answer is the source of truth and the pool draw re-runs on each game start.

3. **Privacy.** Once matched, is it okay that your profile answers are visible to the
   other person (they see the question and their guesses)? Yes — this is the point. But
   answers should not be visible before a match. Keep `profileAnswers` out of the public
   Discover pool.

4. **Auto-launch vs. category choice.** See UX section. Worth a quick A/B when real
   users are in the loop.

5. **Q5 (currentlyInto) resolution.** Constrained genre list (recommended for v1) vs.
   free text with a curated pop-culture pool. Decide before implementation.

6. **Replay thaw cap.** Personal icebreaker played a second time — does it still award
   full thaw progress or is it capped? Probably capped at 50% of first-play thaw, so
   replaying has diminishing returns and incentivizes moving to regular trivia.
