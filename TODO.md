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
      from the just-played game's results.
- [x] **3. Question variety / bank depth.** Doubled the mock bank to 14
      questions/category and added a per-game **rotating window**
      (`getQuestions(category, count, variant)`) so consecutive games for a match
      draw a fresh, non-overlapping round (wraps once the bank is exhausted).
- [x] **4. Centralize the thaw model.** New `src/lib/thaw.ts` owns the rate
      (`THAW_PER_GAME`), thresholds (`REVEAL_THRESHOLD`, `PRE_REVEAL_CAP`) and
      helpers (`thawForGames`, `liveThaw`, `crossesFullThaw`, `isThawRevealed`,
      `revealedName`). Store/Game/Chat/Matches all route through it. _(this change)_
- [x] **"Frozen palace" theme.** Retuned the palette toward an Elsa's-ice-palace
      feel — deep blue-violet sky, aurora violet accent, snow + northern-lights
      atmosphere, cyan→violet→warm thaw gradient. Also fixed a latent bug where
      the `grain` utility's `position: relative` collapsed the fixed Atmosphere to
      height 0, muting every backdrop glow. _(this change)_

---

## ⬜ Next up

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
