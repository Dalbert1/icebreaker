# icebreaker — Ideas & Future Directions

A scratchpad for features and experiments worth exploring later. Nothing here is
a commitment. Roughly organized by theme.

---

## The thaw reveal — the money shot

The frosted portrait gradually clearing is the signature mechanic, but the current
implementation is calm and incremental. There's an opportunity to make specific
milestones feel like *events*:

- **100% thaw reveal** — should be a dramatic moment. Full-screen overlay, the frost
  shattering or melting away in a custom animation, maybe haptics on mobile. This is
  the thing people screenshot and send to friends. Currently underplayed.
- **Milestone unlocks** — at 25%, 50%, 75% something small changes or unlocks (name
  visible at 50% already exists). Could gate chat access at a specific thaw %, rather
  than after the first game completes. Creates clearer progression stakes.
- **Thaw visible on the matches list** — the ThawBar already exists per match. Make it
  feel alive: a subtle glow pulse on matches who are close to fully thawed. Pulls you
  toward the ones with momentum.

---

## Engagement loops — keeping matches warm

The core problem in dating apps: matches go cold. No one knows how to start. The trivia
mechanic solves the first game, but what sustains the relationship between sessions?

- **Daily shared question** — one new trivia question per day, per match. Both see the
  same question; answer within 24 hours and you see how you compared. No pressure to
  start a full game. Micro-engagement that keeps a match from going stale. Push notify
  if both are active.
- **Streak mechanic** — playing together on consecutive days builds a streak counter
  on the match card (like Duolingo). Losing it creates urgency. Simple, proven.
- **"Their turn" indicator** — in async mode (Phase 3), when the match has answered
  and is waiting on you, show a subtle "waiting on you ⏳" badge on their match card.
  Flips the psychology: instead of you chasing, they're invested.
- **Trivia history as a keepsake** — if you eventually go on a date, you have a shared
  artifact: every game you played, who got what right, the funny answers. The app
  already creates this; surfacing it intentionally ("remember when you both missed that
  geography question?") builds emotional attachment.

---

## Connecting trivia to conversation

The game and the chat are currently two separate things. Bridging them is the biggest
functional improvement available:

- **Conversation starters from results** — after a round, the results screen surfaces
  1–2 auto-generated prompts based on what just happened. "You both got the Science
  question wrong — first time either of you heard of dark matter?" Not prescriptive,
  just a nudge. Makes the chat opener obvious.
- **Shared stats in chat** — a pinned header in the chat thread showing "Played 4 games
  · 68% in sync · Science nerds 🔬." Gives the conversation a frame of reference.
- **"We agreed on this" moments** — when both players pick the same answer (right or
  wrong), that answer gets a brief highlight. A micro-moment of connection. "You both
  said hiking." Simple and feels good.

---

## Trivia categories

- **Region-tailored categories** — detect (or let the user set) their city/region and
  surface locally relevant trivia. A Tulsa deck could include Gathering Place history,
  Oklahoma music venues, local food spots. Depth-of-connection and reduces generic feel.
- **"Questions about me" / personal icebreaker** — profile answers as trivia questions
  on first game with any match. Full design in `docs/PERSONAL_ICEBREAKER.md`.
- **User-created trivia** — users write their own questions that matches can choose as
  a category. Self-expression + compatibility signal.
- **Themed seasonal packs** — Summer Vibes, Holiday Edition, Awards Season, etc.
  Creates recurring marketing moments and a reason to re-open the app.
- **Category affinity badges** — track per-user what categories they perform well in.
  Show on profile as vibe pills: "Science nerd 🔬", "Film buff 🎬". Lightweight
  personality signal that costs nothing extra.

---

## Discovery & matching

- **Activity signals on cards** — "Played 3 games this week" or "Active today" on the
  discover card. Shows the person is engaged with the app, not a dormant account.
  This matters a lot for trust in dating apps.
- **Trivia-affinity hints** — "Sarah also loves Science questions" shown when a match
  with a shared category preference occurs. Small but creates an immediate talking point.
- **Limited daily swipes ("lights")** — creates intentional scarcity. Users slow down
  and actually read profiles instead of rapid-swiping. Better signal quality, higher
  match intent. Common premium model (free users get N swipes/day, premium is unlimited).
- **"Most in sync" sort on matches list** — sort by % of shared answers rather than
  recency. Surfaces the matches you're most compatible with, not just the newest ones.

---

## Trust & authenticity

Dating apps live and die on "are these real people." Critical to get right before any
public launch:

- **Photo verification** — quick video selfie that's compared to profile photos.
  Doesn't need to be AI at first; even a manual review queue is fine for a small beta.
- **Last active signal** — standard but high trust value. Even just "active this week"
  vs. showing an exact timestamp.
- **Report / flag in-game** — if a trivia question is wrong or offensive, a quick flag
  button. Also report + block reachable from the match card, not just buried in a menu.
- **"Verified" badge** — simple, but users look for it. Wire to photo verification.

---

## Social / shareability

What makes someone tell a friend?

- **The thaw reveal** is the shareable moment (see above). Make it screenshot-worthy.
- **"How we met" story** — the app naturally creates a better origin story than "we
  matched." Leaning into this in marketing copy is worth noting. Maybe a "share our
  story" export — a summary card of your match history together.
- **Referral mechanic** — invite a friend, both get a boost or extra daily swipes.
  Classic growth loop.
- **Success story prompts** — when a match goes quiet for 2 weeks and then someone
  updates their status to "in a relationship," surface a soft prompt: "Did you meet
  someone on icebreaker? 🧊❤️" Collect social proof for marketing.

---

## Monetization model (when the time comes)

Keep it simple and non-predatory — the trivia mechanic already does a lot of the
conversion work by being genuinely fun:

- **Free tier:** limited daily swipes, 3 active matches, 1 category per game
- **Premium:** unlimited swipes, see who liked you, all categories, daily question
  feature, priority in discovery, custom seasonal packs
- **Boost:** temporary visibility bump, one-time purchase

Avoid dark patterns (fake activity, paid "super likes" that feel desperate).
The trivia format self-selects for engaged users — lean into that as the brand.

---

## UI / feel improvements (small but high ROI)

- **Haptic feedback on correct answers** — a satisfying tap when you get one right.
  Zero code complexity on native; polyfill with a subtle scale animation on web.
- **Sound design** — optional ambient sounds. A cracking-ice sfx on correct answer,
  subtle tone on thaw milestone. Off by default, toggleable.
- **Transition between game phases** — the jump from category picker → first question
  is abrupt. A brief "get ready" countdown (3… 2… 1…) with the match's portrait
  frosts up dramatically. Sets the tone.
- **Portrait on the discover card** — the frosted silhouette portrait (GradientPortrait)
  should appear on the discover card itself, not just in the game. Previews the mechanic
  before a match occurs. Shows what they'll look like at 0% thaw — mysterious.

---

_Add ideas here as they come up. Nothing is a commitment._
