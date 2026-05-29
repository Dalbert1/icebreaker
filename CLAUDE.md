# icebreaker — agent guide

> **This file and `AGENTS.md` must stay byte-for-byte identical.** `CLAUDE.md`
> is the source of truth (used by Claude Code); `AGENTS.md` is a mirror for
> Codex / other agents. **Whenever you edit one, copy it verbatim to the other
> in the same change.** A simple way: edit `CLAUDE.md`, then
> `cp CLAUDE.md AGENTS.md` (PowerShell: `Copy-Item CLAUDE.md AGENTS.md`).

## What this is

A web POC of **icebreaker** — a Tinder-style dating app where you break the ice
with matches by playing trivia together. Mobile-first React web app; a native
mobile app is a later phase, not now. See `docs/ROADMAP.md` for the phased plan
and `docs/ARCHITECTURE.md` for system design.

Current phase: **Phase 2 — Supabase-backed auth/profile foundation.** The app
still runs as a mock-data POC by default; Supabase turns on only when
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`, theme in `src/index.css` via `@theme`)
- `motion` (Framer Motion) for swipe/gesture + transitions
- `react-router-dom` for routing
- `@supabase/supabase-js` for Phase 2 auth/profile persistence
- State: a localStorage-backed reducer in `src/lib/store.tsx`, with optional
  Supabase auth/profile sync when configured

## Commands

```bash
npm run dev      # Vite dev server, exposed on the LAN (host: true) at :5173
npm run build    # tsc typecheck + production build
npm run lint     # eslint
npm run shot     # Playwright visual walk -> writes .screens/*.png (server must be up)
```

Supabase setup:

```bash
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Run `supabase/schema.sql` in the Supabase SQL editor for the starter schema and
RLS policies. See `docs/SUPABASE_SETUP.md`.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes to Pages on every push to
`main`. The site serves from a sub-path (`/icebreaker/`):

- The workflow builds with `VITE_BASE=/icebreaker/`; `vite.config.ts` reads it.
- `BrowserRouter` uses `basename = import.meta.env.BASE_URL` (see `main.tsx`).
- It copies `dist/index.html` → `dist/404.html` so deep links / refresh resolve
  through the SPA on Pages.

To reproduce the production build locally (verify before relying on Pages):

```powershell
# PowerShell — DO NOT set VITE_BASE via the Bash tool on Windows: MSYS mangles
# a leading-slash value like /icebreaker/ into a Windows path.
$env:VITE_BASE='/icebreaker/'; npm run build; Copy-Item dist/index.html dist/404.html
$env:VITE_BASE='/icebreaker/'; npm run preview      # serves http://localhost:4173/icebreaker/
# then, in another shell:
$env:BASE_URL='http://localhost:4173/icebreaker'; npm run shot
```

## Working rules (IMPORTANT)

1. **Verify visually with Playwright between iterations.** After any UI change,
   make sure the dev server is running (`npm run dev`) and run `npm run shot`.
   It walks the core flow at a phone viewport (390×844) and a desktop size,
   writes screenshots to `.screens/`, and **fails on any console error**. Open
   the screenshots and confirm the change looks right before considering a task
   done. The walk script is `scripts/screenshot.mjs` — extend it when you add
   screens. (We are deliberately NOT deploying to GitHub Pages yet; local +
   Playshot is the verification loop.)

2. **Keep `CLAUDE.md` and `AGENTS.md` in sync** (see banner above).

3. **Git workflow.** The human may ask an agent to push directly to `main`.
   Otherwise, prefer feature branches for parallel work. Rule of thumb: check
   `git branch --show-current`; push to the branch the human asked you to use.

4. **Mock over keys.** While validating the POC, never block on credentials or
   external APIs. If something needs an API key or a live service, stub it with
   mock data behind an interface and leave a `// TODO` noting the real wiring.
   Trivia already follows this: see the `QuestionProvider` seam below. Supabase
   follows the same rule: env vars enable the real client, but the local mock
   flow must continue to work without credentials.

## Architecture seams to respect

- **Trivia source** — everything goes through `QuestionProvider` in
  `src/lib/questionProvider.ts`. The active provider is `MockQuestionProvider`
  (local bank, deterministic, offline). An `OpenTriviaProvider` adapter exists
  behind the same interface for later; swap the exported `questionProvider` to
  change sources. UI never knows the source.
- **App state** — all mutations go through the `useStore()` actions in
  `src/lib/store.tsx`. Supabase auth/profile sync is wired behind this layer;
  keep components talking only to the store.
- **Supabase** — client bootstrapping lives in `src/lib/supabase.ts`, generated/
  hand-maintained public schema types live in `src/lib/supabaseTypes.ts`, setup
  instructions live in `docs/SUPABASE_SETUP.md`, and the starter SQL lives in
  `supabase/schema.sql`.
- **Domain types** — `src/types.ts` is framework-agnostic on purpose so it can
  move into a shared package for the mobile app later.

## Signature mechanic

A match's portrait starts **frosted/blurred** and **thaws** (clears) as trivia
is answered together — the literal "break the ice." Thaw is derived in the
store (`thawFor`) and rendered by `GradientPortrait` (`thaw` prop, 0→1).
Portraits are generated locally (gradient + silhouette + initial) — **no network
images** in the POC.

## Project layout

```
src/
  components/   Atmosphere, GradientPortrait, SwipeDeck, ProfileCard,
                MatchModal, BottomNav, ui (Wordmark/VibePill/ThawBar/Glass)
  screens/      Onboarding, Discover, Matches, Chat, Game, Profile
  lib/          store.tsx (state), questionProvider.ts (trivia seam)
                supabase.ts, supabaseTypes.ts
  data/         profiles.ts (mock pool), mockQuestions.ts (mock bank)
  types.ts      domain types
scripts/        screenshot.mjs (Playwright verify), inspect.mjs (debug helper)
docs/           ARCHITECTURE.md, ROADMAP.md, SUPABASE_SETUP.md
supabase/       schema.sql
IDEAS.md        informal feature ideas scratchpad
```

## Conventions

- Mobile-first. The app renders in a centered max-w-[460px] "device" column;
  it must look right at 390px wide. Respect safe-area insets on the bottom nav.
- Theme tokens only — use the palette/utilities from `src/index.css`
  (`bg-thaw`, `text-thaw`, `glass`, colors `frost/ice/glacial/teal/ember/coral/
  amber/abyss/midnight/glacier`). Don't hardcode off-palette colors.
- Fonts: display = Fraunces, body = Hanken Grotesk (loaded in `index.html`).
- `GradientPortrait` sizing: pass size via `className` (e.g. `h-24 w-24`) or wrap
  it in a sized/positioned container — do **not** pass `absolute inset-0`
  directly (it conflicts with the component's own `relative`).
