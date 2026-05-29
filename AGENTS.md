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
npm test         # Vitest unit tests (pure logic: store reducer, thaw, scoring)
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

   **Auto-commit & push when a feature is complete.** Once a feature is finished
   and verified (build/lint clean and `npm run shot` reviewed per rule 1), commit
   the work and push it to the current branch without waiting to be asked:
   - **On `main`:** commit and `git push` directly to `main`.
   - **On a feature branch:** commit, push the branch, and open a PR for review
     (`gh pr create`) targeting `main`. Don't merge it yourself.

   "Complete" means a self-contained unit of work that passes verification — not
   every intermediate edit. If verification fails, fix it before committing.

4. **Mock over keys.** While validating the POC, never block on credentials or
   external APIs. If something needs an API key or a live service, stub it with
   mock data behind an interface and leave a `// TODO` noting the real wiring.
   Trivia already follows this: see the `QuestionProvider` seam below. Supabase
   follows the same rule: env vars enable the real client, but the local mock
   flow must continue to work without credentials.

5. **Hold off on anything blocking in terms of testing.** For example -
   We're currently holding off on things like wiring up session state, sign-up/authentication, etc. until
   we get the baseline application in place/tested and reviewed with playwright. What we're looking to avoid is 
   having to sign-up/sign-in, etc. every time we deploy or reboot the application just to test the UI.

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
- Theme is **"frozen palace"** (Elsa's-ice-palace-at-night): deep blue-violet
  sky, crystalline cyan + aurora violet magic, soft rose/amber warmth as the
  "thaw." Theme tokens only — use the palette/utilities from `src/index.css`
  (`bg-thaw`, `text-thaw`, `glass`, colors `frost/ice/glacial/teal/aurora/
  periwinkle/ember/coral/amber/blush/abyss/midnight/glacier`). The signature
  thaw gradient runs cold cyan → aurora violet → warm glow. Don't hardcode
  off-palette colors.
- Fonts: display = Fraunces, body = Hanken Grotesk (loaded in `index.html`).
- `GradientPortrait` sizing: pass size via `className` (e.g. `h-24 w-24`) or wrap
  it in a sized/positioned container — do **not** pass `absolute inset-0`
  directly (it conflicts with the component's own `relative`).


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
