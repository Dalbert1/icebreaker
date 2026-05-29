<div align="center">

# ❄️ icebreaker

**A Tinder-style dating app where you break the ice with trivia.**

Swipe, match, then play a quick trivia round together — your match's photo
literally *thaws* from a frosted blur into a clear face as you answer. The
trivia is the point: it gives two strangers something to *do* instead of
staring at an empty chat box.

**▶ Live demo: <https://dalbert1.github.io/icebreaker/>**

</div>

---

## The idea (intent)

Dating apps are great at the match and terrible at the moment right after it —
two people match and then nobody knows what to say. **icebreaker** replaces the
dreaded "hey" with a shared, low-stakes trivia game. Getting questions *right*
isn't the point; **playing together is** — so answering rounds is what "breaks
the ice," thaws your match's portrait, and unlocks more of their profile.

Design language is **"polar dusk"**: a dark glacial backdrop, aurora glows, and
frosted glass, with a signature gradient running from **cold cyan → warm ember**
— the visual story of ice turning to warmth as a connection forms.

Goals, in order:

1. **Web first, mobile-first.** Validate the experience as a responsive web app
   that feels right on a phone. A native app is a deliberate *later* phase.
2. **Prove the core loop with mocks first.** The app still runs on mock data in
   the browser by default so the feel can be tested on real devices with zero
   infrastructure.
3. **Keep the seams clean** so swapping mock data for a real backend (Supabase)
   and a real trivia source is a contained change, not a rewrite.

For the full design and the phase-by-phase plan, see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/ROADMAP.md`](docs/ROADMAP.md). Recent work is in
[`CHANGELOG.md`](CHANGELOG.md).

## How it works (the core loop)

1. **Discover** — swipe through nearby profiles (drag the card or tap the
   buttons). Right = *Thaw* (like), left = *Frost* (pass).
2. **Match** — a like surfaces the "the ice is cracking" celebration.
   *(POC simplification: likes always match back so the loop is reachable.)*
3. **Break the ice** — pick a trivia category and play 7 questions. Each answer
   thaws your match's frosted photo and advances the thaw meter. You see which
   answer they picked too.
4. **Results** — your score, theirs, and how *in sync* you were. Matches keep
   their thaw state; a second round fully breaks the ice and reveals them.

## Status

**Phase 2 has started.** Phase 1's static POC is complete and deployed; the app
now has an optional Supabase auth/profile foundation while swipes, games, chat,
and scoring still use local mock data. Profiles are Tulsa, OK locals with real
(bundled) photos. See the roadmap and
[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion (Framer Motion) ·
React Router · Supabase. Backend direction: **Supabase** (a hosted BaaS the
static SPA calls directly, so the app keeps working on static hosts like GitHub
Pages).

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

### Supabase auth/profile sync

The app runs without credentials. To enable Supabase Auth and onboarding profile
sync, copy `.env.example` to `.env.local`, fill in the project URL and anon key,
and run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL
editor. Details are in [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

### View it on your phone (same Wi-Fi / LAN)

The dev server is exposed on the LAN automatically. When it starts, Vite prints
a **Network** URL like `http://192.168.1.37:5173/`. Open that on your phone
(same Wi-Fi) to test the mobile layout and touch interactions. If it can't
connect, allow Node/Vite through the firewall for Private networks.

## Verify changes (Playwright)

With the dev server running:

```bash
npm run shot
```

Walks the core flow at a phone viewport (390×844), an iPhone SE (375×667), and
desktop; writes screenshots to `.screens/`; and **fails on any console error**.
This is the project's primary visual-verification loop — run it after UI
changes. (See [`CLAUDE.md`](CLAUDE.md).)

## Deploy (GitHub Pages)

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the static SPA under base `/icebreaker/`, adds a `404.html` SPA
fallback (so deep links / refresh resolve), and publishes to Pages. Live at
<https://dalbert1.github.io/icebreaker/>.

> **Windows note:** to reproduce the production build locally, set `VITE_BASE`
> via **PowerShell**, not the Git-Bash shell (MSYS mangles a leading-slash value
> into a Windows path). See the GitHub Pages section in [`CLAUDE.md`](CLAUDE.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (LAN-exposed) at :5173 |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run shot` | Playwright visual walk → `.screens/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

## Roadmap at a glance

| Phase | Focus | State |
|---|---|---|
| 0 | Foundation (scaffold, theme, tooling, docs) | ✅ |
| 1 | Static mock POC — swipe + trivia loop | ✅ deployed |
| 2 | Supabase backend + accounts | next |
| 3 | Real reciprocal matching + persisted async trivia | planned |
| 4 | Live synchronous trivia (Realtime, server-scored) | planned |
| 5 | Curated, dating-flavored question bank | planned |
| 6 | Mobile app (Capacitor or React Native) | planned |

Cross-cutting from Phase 2 on: safety/trust (reporting, blocking, verification),
privacy, testing, analytics, accessibility. Details in
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Project layout

```
src/
  components/   UI + swipe deck, frosted portraits, atmosphere, bottom nav
  screens/      Discover · Matches · Game · Profile
  lib/          store.tsx (app state), questionProvider.ts (trivia seam)
  data/         Tulsa mock profiles + trivia bank
  assets/       bundled profile photos
  types.ts      framework-agnostic domain types
docs/           ARCHITECTURE.md · ROADMAP.md
scripts/        screenshot.mjs (Playwright verify) · inspect.mjs (debug)
.github/        Pages deploy workflow
```

## Working on this with an AI agent

Read [`CLAUDE.md`](CLAUDE.md) (mirrored to `AGENTS.md` for Codex). Standing
rules: **verify UI changes with `npm run shot`**, **keep mocks instead of
blocking on API keys** while validating, and **keep those two guide files in
sync**.
