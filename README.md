<div align="center">

# ❄️ icebreaker

**A Tinder-style dating app where you break the ice with trivia.**

Swipe, match, then play a quick trivia round together — your match's portrait
literally *thaws* as you answer. Web POC; native app comes later.

</div>

---

## Status

**Phase 1 — static, mock-data POC.** Runs entirely in the browser (no backend,
no accounts). Built to validate the experience on real devices before any
infrastructure. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's next and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it's built.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion (Framer Motion) ·
React Router. Eventual backend: Supabase (kept compatible with static hosting).

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

### View it on your phone (same Wi-Fi / LAN)

The dev server is exposed on the LAN automatically. When it starts, Vite prints
a **Network** URL like:

```
➜  Network: http://192.168.1.37:5173/
```

Open that URL on your phone (must be on the same Wi-Fi). This is the intended
way to check the mobile layout and touch interactions. If your phone can't
reach it, allow Node/Vite through your firewall for Private networks.

## Verify changes (Playwright)

With the dev server running:

```bash
npm run shot
```

This walks the core flow at a phone viewport + desktop, writes screenshots to
`.screens/`, and **fails on any console error**. It's the project's visual
verification loop (we are not deploying to GitHub Pages yet — see
[`CLAUDE.md`](CLAUDE.md)).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (LAN-exposed) at :5173 |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run shot` | Playwright visual walk → `.screens/` |
| `npm run lint` | ESLint |

## How the core loop works

1. **Discover** — swipe (drag or tap the buttons). Right = *Thaw* (like),
   left = *Frost* (pass).
2. **Match** — a like surfaces the "the ice is cracking" modal. *(POC: likes
   always match back so the loop is reachable.)*
3. **Break the ice** — pick a trivia category and play 5 questions. Each answer
   thaws your match's frosted portrait and updates the thaw meter.
4. **Results** — see your score, theirs, and how in-sync you were. Matches keep
   their thaw state; play more rounds to fully break the ice.

## Project layout

```
src/
  components/   UI + the swipe deck, portraits, atmosphere
  screens/      Discover · Matches · Game · Profile
  lib/          store.tsx (state), questionProvider.ts (trivia seam)
  data/         mock profiles + question bank
docs/           ARCHITECTURE.md · ROADMAP.md
scripts/        screenshot.mjs (Playwright verify)
```

## Notes for contributors / agents

Read [`CLAUDE.md`](CLAUDE.md) (mirrored to `AGENTS.md`). Two standing rules:
verify UI changes with `npm run shot`, and keep those two files in sync.
