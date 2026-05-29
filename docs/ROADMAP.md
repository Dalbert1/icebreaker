# icebreaker — Roadmap

Phased plan from POC to a native app. Each phase has a **goal**, **deliverables**,
and **exit criteria** (how we know it's done). Phases are sequential but the
cross-cutting concerns (bottom of file) run throughout.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the system design behind these.
The Phase 2+ backend/auth/game-state plan lives in
[`PHASE2_BACKEND_ARCHITECTURE.md`](./PHASE2_BACKEND_ARCHITECTURE.md).

---

## Phase 0 — Foundation ✅ done

**Goal:** a runnable, well-structured repo.

- Vite + React + TS + Tailwind v4 scaffold
- Theme system ("polar dusk": glacial cold → ember warmth)
- Repo, agent guides (`CLAUDE.md`/`AGENTS.md`), Playwright verify loop
- Architecture + roadmap docs

**Exit:** `npm run dev` runs; `npm run build` is clean; `npm run shot` produces
screenshots with no console errors.

---

## Phase 1 — Static mock POC ✅ done

**Goal:** a believable end-to-end experience on real devices, no backend.

- Discover swipe deck (drag + buttons), profile cards
- Match flow + "the ice is cracking" modal
- Matches list with thaw state
- **Async trivia game** with the signature **frost → thaw** portrait mechanic
- Profile screen; localStorage persistence; demo reset
- Trivia via `MockQuestionProvider` (deterministic, offline)

**Exit:** full loop (swipe → match → play trivia → see results → matches updated)
works at 390px and on a phone over the LAN; verified via `npm run shot`.

> **You are here.** Next up is Phase 2.

---

## Phase 2 — Backend & accounts (Supabase)

**Goal:** real, persistent, multi-user data; introduce auth.

- Supabase project: `profiles` table + Storage for photos
- Auth (start with email magic-link or anonymous sessions)
- A **Supabase store adapter** behind the existing `useStore()` contract; local
  adapter stays for dev/offline
- Profile create/edit; real photo upload (replaces generated portraits, which
  remain the frost/thaw canvas overlay)
- Session state machine (`checking` / `signedOut` / `needsProfile` / `ready`)
  that keeps routing and profile onboarding explicit
- Row-Level Security on all tables

**Exit:** two real accounts on two devices can sign in and see their own data
persisted server-side. No gameplay changes required.

---

## Phase 3 — Real matching + persisted async trivia

**Goal:** swiping and trivia become real between actual users.

- `swipes` + reciprocal `matches` via DB trigger (replaces "always match")
- Async trivia persisted in `games` / `game_answers`; both players answer on
  their own time, results reconcile
- 15-second answer windows; late or missing answers are marked incorrect /
  timed out by the backend
- Cumulative match scoreboards across repeated icebreaker games
- Server-computed `thaw` and match state
- Basic chat unlock after the first icebreaker round (`messages`)

**Exit:** User A swipes, User B swipes back → match appears for both; either can
start a round, the other completes it later, both see synced results, thaw, and
their head-to-head history.

---

## Phase 4 — Live synchronous trivia (Realtime)

**Goal:** the high-engagement "play together right now" mode.

- Supabase Realtime channel per match; Presence ("both here")
- Synchronized question index + countdown; live answer reveal
- **Server-authoritative scoring** (RPC / edge function); correct answers never
  shipped to the client for live play
- Rematch / best-of flow

**Exit:** two users in a match play a live round in real time with correct,
tamper-resistant scoring.

---

## Phase 5 — Content & curated question bank

**Goal:** trivia that fits a dating context and is ours.

- Curated, themed question bank in Supabase (categories tuned for compatibility
  + fun), authored/reviewed
- `SupabaseQuestionProvider` behind the same `QuestionProvider` interface
- Optional: keep OpenTriviaDB as a volume fallback
- Light personalization (category preference, difficulty)

**Exit:** live games pull curated questions server-side; tone is on-brand;
correct answers stay server-side.

---

## Phase 6 — Mobile app

**Goal:** a native presence.

- Decision: **Capacitor** (wrap the web app — recommended first) vs **React
  Native/Expo** (rewrite UI, reuse domain logic). See ARCHITECTURE §7.
- Push notifications (new match, your turn, they're online)
- Native niceties: camera, haptics, share
- App Store / Play Store pipeline

**Exit:** installable build of the core loop on at least one platform.

---

## Cross-cutting (ongoing from Phase 2)

- **Safety & trust:** reporting, blocking, photo/age verification, content
  moderation. Non-negotiable before any public launch of a dating product.
- **Privacy & data:** location precision, data retention, deletion, consent.
- **Testing:** keep the Playwright visual walk green; add unit tests for store
  reducers and provider adapters; e2e for the backend flows.
- **Deployment:** wire a static deploy (GitHub Pages/Netlify) when there's
  something worth sharing; `base` is already parameterized.
- **Analytics & feedback:** funnel from swipe → match → first round → repeat.
- **Accessibility:** keyboard parity (already partial), reduced-motion, contrast.
