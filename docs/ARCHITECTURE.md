# icebreaker — Architecture

A living document describing how icebreaker is built today and where it's
headed. Pair it with [`ROADMAP.md`](./ROADMAP.md) for the phased plan.
For the next backend phase, see
[`PHASE2_BACKEND_ARCHITECTURE.md`](./PHASE2_BACKEND_ARCHITECTURE.md).

---

## 1. Product in one line

A Tinder-style dating app where matches **break the ice by playing trivia
together** before they chat. The trivia is the differentiator and the core
loop; swiping is the on-ramp.

## 2. Guiding principles

1. **Ship a believable experience before any backend.** The whole Phase 1 app
   runs on mock data in the browser so we can validate feel, layout, and the
   trivia mechanic on real devices immediately.
2. **Web first, mobile later.** A responsive web app is the POC and the first
   real product surface. A native app is a deliberate later phase — most of the
   UI and all domain logic should be portable when we get there.
3. **Isolate the things that will change.** External services (trivia, then
   auth/DB/realtime) sit behind narrow interfaces so swapping mock → real is a
   contained change, not a rewrite.
4. **Mobile-first, touch-first.** Designed at 390px wide, gesture-driven, safe-
   area aware.

## 3. Current architecture (Phase 1 — static POC)

```
┌──────────────────────────────────────────────┐
│  Browser (SPA, served statically / Vite dev)  │
│                                                │
│  React + Router                                │
│   screens/  ──────────────┐                    │
│   components/             │ read/dispatch       │
│                            ▼                    │
│   lib/store.tsx  ── reducer + localStorage      │
│        │  (matches, likes, games, thaw)         │
│        ▼                                        │
│   lib/questionProvider.ts ── QuestionProvider   │
│        ├─ MockQuestionProvider  (active)        │
│        └─ OpenTriviaProvider    (stub, later)   │
│                                                 │
│   data/  mock profiles + question bank          │
└──────────────────────────────────────────────┘
```

- **No server, no network.** Everything is local; state persists to
  `localStorage`. This is what lets us test on a phone over the LAN with zero
  infrastructure.
- **`QuestionProvider`** is the one seam to the outside world for trivia. The
  mock provider is deterministic (seeded PRNG) so games are reproducible and
  screenshot tests are stable.
- **`store.tsx`** owns all app state and is the single thing the backend phase
  will replace/extend. Components never reach past the store.
- **Portraits** are generated locally (`GradientPortrait`) — no image hosting
  needed, and they double as the "frost → thaw" canvas for the core mechanic.

### Why this also fits static hosting (e.g. GitHub Pages)

GitHub Pages only serves static files — no server code. That's fine: the SPA is
static, and when we add a backend it will be **Supabase, a hosted BaaS the
browser calls directly**. So the same static bundle (GH Pages, Netlify, S3,
anything) keeps working with a real backend — no Node server to host. `base` in
`vite.config.ts` is already parameterized for a project sub-path deploy.

## 4. Target architecture (with backend)

```
┌─────────────────────────┐         ┌────────────────────────────┐
│  Static SPA (CDN/Pages)  │  HTTPS  │  Supabase (hosted BaaS)     │
│                          │ ───────▶│   Auth   (email/anon)       │
│  lib/store  ─ adapters ─ │         │   Postgres + Row-Level Sec. │
│   ├─ local (POC)         │  WSS    │   Realtime (live trivia)    │
│   └─ supabase (later) ◀──┼─────────│   Storage (profile photos)  │
└─────────────────────────┘         └────────────────────────────┘
```

The store grows a backend adapter; the local adapter stays for offline/dev.
Components and screens are unchanged.

### Proposed data model (Phase 2+)

| Table          | Key columns                                                            | Notes |
|----------------|------------------------------------------------------------------------|-------|
| `profiles`     | `id` (=auth uid), `name`, `age`, `bio`, `vibes[]`, `photo_url`, `geo`  | RLS: read public fields, write own |
| `swipes`       | `swiper_id`, `target_id`, `direction`, `created_at`                    | unique (swiper, target) |
| `matches`      | `id`, `user_a`, `user_b`, `created_at`, `thaw`                         | created when swipes reciprocate (DB trigger) |
| `games`        | `id`, `match_id`, `category`, `questions(jsonb)`, `status`             | one trivia round |
| `game_answers` | `game_id`, `user_id`, `q_index`, `option_index`, `answered_at`         | both players' answers |
| `messages`     | `id`, `match_id`, `sender_id`, `body`, `created_at`                    | chat unlocks post-icebreaker |

Matching and thaw are computed server-side (DB triggers / RPC) so clients can't
forge results. Question integrity (correct answers) must live server-side once
games are competitive — see §6.

The expanded Phase 2+ plan adds auth/session state, profile onboarding,
15-second server-authoritative answer windows, and cumulative match scoreboards
in [`PHASE2_BACKEND_ARCHITECTURE.md`](./PHASE2_BACKEND_ARCHITECTURE.md).

## 5. Realtime trivia (Phase 4)

Async (turn-based) trivia is Phase 3 and needs no realtime — each player answers
on their own time, results reconcile on load. **Live synchronous** trivia is
Phase 4 and uses Supabase Realtime:

- A `game` channel per match; Presence shows "both here."
- Broadcast question index + a countdown; each client commits an answer.
- The server (RPC / edge function) is the source of truth for correctness and
  scoring to prevent cheating; clients render optimistic state.

## 6. Trivia content strategy

- **Now:** `MockQuestionProvider` (local, deterministic).
- **Next option:** `OpenTriviaProvider` (opentdb.com — free, key-less) already
  stubbed behind the interface; good for volume while validating.
- **Later:** a **curated, dating-flavored bank** in Supabase. Correct answers
  must never ship to the client for live/competitive play — fetch options only,
  grade server-side. (The current mock keeps answers client-side because the POC
  is single-player-feel and non-competitive.)

## 7. Path to mobile

Two viable routes when we get there (Phase 6):

- **Capacitor (recommended first):** wrap the existing React web app as a native
  shell. Maximum reuse, fastest path, good enough for swipe + trivia. Add native
  plugins (push, camera) as needed.
- **React Native / Expo:** best native feel and gestures, but a UI rewrite.
  Domain logic (`types.ts`, store contracts, provider interfaces) ports over;
  components do not.

Decision deferred until the web product is validated. Keeping domain logic
framework-agnostic now keeps both doors open.

## 8. Key decisions (ADR-lite)

| # | Decision | Why |
|---|----------|-----|
| 1 | React + Vite + TS + Tailwind v4 | Team standard stack; fast, typed, portable. |
| 2 | Mock-first, no backend in Phase 1 | Validate the experience on real devices with zero infra. |
| 3 | Supabase as the eventual backend | BaaS callable from a static SPA → keeps static hosting; gives auth + Postgres + Realtime + Storage in one. |
| 4 | `QuestionProvider` interface | Swap mock ↔ API ↔ curated bank without UI changes. |
| 5 | Local generated portraits | No image hosting/keys; doubles as the frost/thaw canvas. |
| 6 | Verify with Playwright locally, not GH Pages (yet) | Tight visual loop; deploy when there's something to share. |
| 7 | Async trivia before live | Lower complexity; proves the loop before adding Realtime. |
| 8 | Server-authoritative games | Answer deadlines, correctness, scoring, thaw, and scoreboards must be computed outside the client once games involve real users. |

## 9. Known POC simplifications (to revisit)

- A "like" always matches back (so the trivia loop is reachable). Real
  reciprocal matching arrives in Phase 2/3.
- The match's trivia answers are simulated client-side.
- Correct answers live client-side (fine for non-competitive POC; see §6).
- No auth, no real geolocation, no moderation/safety tooling yet (safety is a
  first-class concern for any real dating product — see ROADMAP cross-cutting).
