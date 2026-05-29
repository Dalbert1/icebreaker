# icebreaker — TODO

Ordered, actionable backlog for the POC. This is the **no-backend "Phase 1.5"**:
everything here runs on mock/local data and needs **zero auth or credentials**,
so the Playwright verify loop (`npm run shot`) stays frictionless. See
`docs/ROADMAP.md` for the phased plan and the auth-gated Phase 2+ work that is
deliberately deferred until device testing is done.

> Sequencing note: the roadmap's Phase 2 is **auth-first**, which conflicts with
> the current goal of keeping testing sign-in-free. Do the items below first;
> pull Phase 2 (auth/login/multi-user) forward only after the POC feels right on
> real devices.

---

## ✅ In progress / done

- [x] **1. The 100% thaw reveal ("money shot").** Dramatic full-screen reveal
      when a match hits full thaw — frost shatters/melts away. The signature,
      screenshot-worthy moment. _(this change)_
- [x] **2. Bridge game → chat + make Chat functional (local-only).** Real local
      message state in the store + auto-generated conversation starters seeded
      from the just-played game's results. _(this change)_

---

## ⬜ Next up

### 3. Question variety / bank depth
Each category currently has **exactly 7** questions and a game requests 7
(`store.tsx` `startGame`), so every round in a category is the *same 7 prompts* —
"Play another game" replays identical questions. Fix by either:
- expanding `src/data/mockQuestions.ts` to well beyond 7 per category, and/or
- varying the per-game seed (currently `MockQuestionProvider` keys the shuffle on
  `seed:category` only, so it's stable across games — mix in the game id).

Also reconcile the hardcoded "Seven questions" copy in `Game.tsx` if count
changes. **Cheap, high believability ROI.**

### 4. Centralize & make the thaw model tunable
The thaw constants are scattered and duplicated:
- `0.5` per game in `thawFor` (`store.tsx`)
- the same `0.5` recomputed inline as `liveThaw` in `Game.tsx`
- the `thaw >= 0.5` reveal threshold duplicated across `Chat.tsx`, `Matches.tsx`,
  `Game.tsx`

Extract to one helper/constant module (e.g. `src/lib/thaw.ts`) so the mechanic is
consistent and easy to tune. Pairs naturally with item 1.

### 5. Unit tests for the store reducer + `thawFor` + scoring
This is **not** the "blocking testing" we're avoiding (that's auth/sign-in). These
are fast pure-function tests (Vitest) that complement Playwright and guard the
thaw/score/match-derivation logic as items 1–4 churn it. Roadmap cross-cutting
already calls for this.

### 6. Personal icebreaker / "Questions about me"
`docs/PERSONAL_ICEBREAKER.md` is already written and the mock profiles carry the
data. Profile-derived questions for the first game with a match — on-brand for a
dating context, no backend needed. Medium effort.

### 7. Frosted portrait preview on Discover cards
Tease the mechanic by showing the 0%-thaw frosted silhouette on the discover
card. **Note:** this is a genuine product decision (mystery vs. standard
dating-app photos), not just a build task — cards currently show real photos.
Lowest priority; flag for a deliberate choice.

---

## 🔒 Deferred (auth-gated — do NOT pull forward yet)

All of `docs/PHASE2_BACKEND_ARCHITECTURE.md` §2–§9: reciprocal matching, persisted
multi-user async trivia, 15s server-authoritative timer, server-computed
thaw/scoreboards, Realtime live play, and sign-in itself. The one safe prep that
can happen now is designing the Supabase **store adapter seam** on paper (the
`Store` interface in §8 sketches it) so the eventual swap stays contained — but
do not wire live auth.

> Note: auth scaffolding already partially landed in `src/lib/store.tsx`
> (`signInWithOtp`, `onAuthStateChange`, `syncOnboardingProfile`). It is dormant
> behind `isSupabaseConfigured` (no env vars → `status: 'mock'`), so it isn't
> interfering with testing. Leave it dormant until Phase 2.
