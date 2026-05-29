# icebreaker - Backend, Auth, Sessions, and Games

This document expands the Phase 2+ architecture for moving icebreaker from a
local mock-data POC to a real multi-user app. It focuses on session state,
profile management, authentication, persisted icebreaker games, answer timing,
and long-running score history between matches.

Pair this with [`ARCHITECTURE.md`](./ARCHITECTURE.md) and
[`ROADMAP.md`](./ROADMAP.md).

---

## 1. Goals

1. Keep the static SPA deployment model: the browser talks directly to
   Supabase; no custom Node server is required for the first backend phase.
2. Introduce real accounts without rewriting the current UI. Screens should
   keep reading through the store contract, with backend-backed actions added
   behind that layer.
3. Make game outcomes trustworthy. Clients can render optimistic UI, but the
   backend owns answer deadlines, correctness, scoring, thaw, and match totals.
4. Preserve the app's core emotional hook: a match becomes more visible as you
   play together, and the relationship gets a lightweight score history over
   time.

## 2. Auth And Session State

### Recommended auth path

Start with Supabase Auth using email magic links. Anonymous sessions can remain
useful for demos, but a dating product needs durable identity before real
matching, safety controls, reporting, and chat.

Session ownership should be split like this:

| Layer | Responsibility |
|---|---|
| Supabase Auth | Durable user identity, tokens, refresh, sign-in, sign-out |
| `AuthProvider` / store adapter | Current session, loading state, profile bootstrap |
| Route guards | Redirect unauthenticated users to onboarding/sign-in |
| Screens | Render only session-derived state; never inspect tokens directly |

The app should treat auth as a top-level state machine:

| State | Meaning | UI behavior |
|---|---|---|
| `checking` | Supabase session is loading/restoring | Show app shell loading state |
| `signedOut` | No active session | Show sign-in/onboarding |
| `needsProfile` | Auth exists, profile row incomplete | Show profile setup |
| `ready` | Auth and profile are usable | Show Discover/Matches/Game/Profile |

### Session persistence

Supabase manages token persistence in browser storage. The app store should not
copy access tokens into its own localStorage state. Local UI preferences can
stay local, but account data should come from Supabase once Phase 2 starts.

Local demo mode can continue as a separate adapter:

```text
Store contract
  local adapter      - current POC, screenshots, offline demos
  supabase adapter   - real auth/profile/matches/games
```

This keeps the current screenshot loop useful while backend work lands.

## 3. User Profiles

Profiles become the public dating surface attached to an auth user. The row is
owned by the signed-in user, but selected fields are visible to candidates and
matches.

Recommended profile lifecycle:

1. User signs in.
2. App checks for `profiles.id = auth.uid()`.
3. If missing or incomplete, route to onboarding/profile setup.
4. User adds required fields: display name, birth date or verified age, bio,
   location preference, at least one photo.
5. Profile becomes discoverable only after minimum safety and completeness
   checks pass.

Suggested table shape:

| Table | Key fields | Notes |
|---|---|---|
| `profiles` | `id`, `display_name`, `birth_date`, `bio`, `vibes`, `created_at`, `updated_at` | Private owner writes; public read policy should expose only allowed columns |
| `profile_photos` | `id`, `profile_id`, `storage_path`, `sort_order`, `moderation_status`, `created_at` | Store images in Supabase Storage; keep metadata in Postgres |
| `profile_preferences` | `profile_id`, `age_min`, `age_max`, `distance_miles`, `interested_in`, `category_preferences` | Separate private preferences from public profile data |
| `profile_prompts` | `id`, `profile_id`, `question`, `answer`, `sort_order` | Keeps prompts extensible without changing `profiles` |

Do not expose exact location to other users. Store coarse location or geohash
for matching; render friendly labels such as "near Brookside" or "3 mi away."

## 4. Matching And Chat Unlock

The POC's "like always matches" behavior should become real reciprocal matching:

1. User A swipes right on User B.
2. User B swipes right on User A.
3. A database trigger or RPC creates one `matches` row.
4. Either user can start the first icebreaker game.
5. Chat unlocks after both users participate in at least one game, or after the
   product decides a softer threshold is better.

Suggested tables:

| Table | Key fields | Notes |
|---|---|---|
| `swipes` | `swiper_id`, `target_id`, `direction`, `created_at` | Unique on `(swiper_id, target_id)` |
| `matches` | `id`, `user_a`, `user_b`, `status`, `created_at`, `thaw`, `chat_unlocked_at` | One canonical row per pair |
| `messages` | `id`, `match_id`, `sender_id`, `body`, `created_at` | RLS limits access to match participants |

Keep pair ordering canonical in `matches` (`least(user_a,user_b)`,
`greatest(user_a,user_b)`) so duplicate matches are impossible.

## 5. Icebreaker Games

Terminology: user-facing rounds should be called **games** or **icebreaker
games**, not "trivia sessions." A match can play many games over time.

Recommended model:

| Table | Key fields | Notes |
|---|---|---|
| `games` | `id`, `match_id`, `category`, `status`, `started_by`, `current_question_index`, `started_at`, `completed_at` | One 5-question icebreaker game |
| `game_questions` | `id`, `game_id`, `q_index`, `question_ref`, `prompt`, `options`, `correct_option`, `answer_deadline_at` | Correct option is never sent to clients before scoring |
| `game_answers` | `id`, `game_id`, `q_index`, `user_id`, `option_index`, `answered_at`, `is_correct`, `timed_out`, `points_awarded` | Unique on `(game_id, q_index, user_id)` |
| `game_results` | `game_id`, `user_a_score`, `user_b_score`, `sync_count`, `winner_user_id`, `completed_at` | Denormalized result for fast reads |

For Phase 3 async play, each user can answer on their own time once a game is
created. For Phase 4 live play, Realtime broadcasts the active question and
presence, but persisted database rows remain the source of truth.

## 6. Fifteen-Second Answer Timer

Each question should require an answer within 15 seconds. This discourages
looking answers up and gives the game a sharper tempo.

Server-authoritative timing should work like this:

1. Backend creates or reveals question `q_index`.
2. Backend records `answer_deadline_at = now() + interval '15 seconds'`.
3. Client displays a countdown derived from `answer_deadline_at`.
4. When the user answers, the backend accepts it only if
   `answered_at <= answer_deadline_at`.
5. If no answer arrives in time, the backend records `timed_out = true`,
   `option_index = null`, `is_correct = false`, `points_awarded = 0`.

Client clocks cannot be trusted for correctness. The client can show the timer
and disable buttons locally, but the server decides whether an answer was on
time. For live games, use Realtime to broadcast countdown state; for async games,
start the 15-second window when a user opens/reveals each question.

Recommended UX details:

- Show a visible radial or horizontal countdown that changes tone in the final
  five seconds.
- Auto-advance after timeout with a clear "Out of time" state.
- Do not penalize a player for network latency if the answer reaches the server
  just after the deadline due to transport delay. Consider a small server-side
  grace window, such as 250-500ms, while still rendering exactly 15 seconds.

## 7. Cumulative Scoring Between Matches

Games should produce durable match history, not just one-off results. This gives
users a reason to replay after the first game and creates conversational hooks.

Track both per-game results and all-time match totals:

| Table | Key fields | Notes |
|---|---|---|
| `match_scoreboards` | `match_id`, `user_a_total`, `user_b_total`, `games_played`, `user_a_wins`, `user_b_wins`, `ties`, `sync_total`, `current_streak_user_id`, `current_streak_count`, `updated_at` | One row per match |
| `game_results` | `game_id`, `user_a_score`, `user_b_score`, `winner_user_id`, `sync_count` | Immutable after completion |

Score updates should happen in a transaction when a game completes:

1. Validate both players' answers or timeouts.
2. Compute score for the game.
3. Insert/update `game_results`.
4. Update `match_scoreboards`.
5. Update `matches.thaw`.
6. Emit a Realtime event so both clients refresh.

Suggested scoring for v1:

- 1 point for each correct answer.
- 0 points for wrong or timed-out answers.
- Track "in sync" separately when both users choose the same option, even when
  the option is wrong.
- Winner is highest score for the game; ties are allowed.

Keep thaw separate from correctness. The app's current mechanic is stronger if
showing up and playing together melts ice, while the scoreboard captures
competitive performance.

## 8. Store Contract Impact

The current `useStore()` contract can evolve without exposing Supabase to
screens. A future store shape can provide:

```ts
type SessionStatus = 'checking' | 'signedOut' | 'needsProfile' | 'ready'

interface Store {
  sessionStatus: SessionStatus
  currentUserId?: string
  currentProfile?: Profile
  discoverDeck: Profile[]
  matches: Match[]
  gamesByMatch: Record<string, GameSummary[]>
  scoreboardsByMatch: Record<string, MatchScoreboard>

  signInWithEmail(email: string): Promise<void>
  signOut(): Promise<void>
  saveProfile(input: ProfileInput): Promise<void>
  like(profileId: string): Promise<void>
  pass(profileId: string): Promise<void>
  startGame(matchId: string, category: TriviaCategory): Promise<string>
  answerQuestion(gameId: string, qIndex: number, optionIndex: number): Promise<void>
}
```

The local adapter can implement the same methods with mock state. The Supabase
adapter can map each method to RPCs or table operations.

## 9. Row-Level Security Principles

RLS should be part of the schema from the start, not added later.

Minimum policy rules:

- Users can read and update their own private profile/preferences.
- Discoverable public profile fields can be read by eligible signed-in users.
- Exact location, email, auth identifiers, and moderation data are private.
- A match can be read only by its two participants.
- Games, answers, results, scoreboards, and messages can be read only by match
  participants.
- Answer inserts are limited to the authenticated user's own row.
- Correct answers are not readable by clients until the question is scored or
  the game is complete, depending on the game mode.

For any action that affects scoring, thaw, matching, or chat unlocks, prefer an
RPC or database trigger over direct client-side multi-row writes.

## 10. Product Ideas Worth Exploring

These fit the app's existing "break the ice by doing something together" angle:

- **Rivalry card on each match:** show lifetime score, games played, current
  streak, and best shared category.
- **Category chemistry:** summarize where two users overlap, such as "you both
  crush music" or "science is chaos for both of you."
- **Conversation unlock prompts:** after a game, generate a small prompt from a
  funny missed question or shared wrong answer.
- **Rematch nudges:** lightweight "best two out of three?" CTA when a game ends
  close.
- **House rules:** let a match pick quick modes later: speed round, cozy mode,
  no-score mode, or only compatibility questions.
- **Profile badges from play:** "Fast thinker," "Movie buff," "Wildcard," or
  "Clutch comeback" based on repeated games. Keep them playful, not judgmental.
- **Safety-first chat pacing:** the first message can be tied to the completed
  game, reducing cold-open pressure and making low-effort messages less common.

## 11. Open Questions

- Should the first game be required before any chat, or should users be allowed
  to send one opener after matching?
- For async games, should the 15-second timer start when the user opens the
  game or when they tap "Start question" for each prompt?
- Should scoreboards be visible immediately, or only after both players have
  completed at least one game?
- How much exact score history should remain visible if a user unmatches?
- Should "in sync" matter more than correctness for dating-mode games?
