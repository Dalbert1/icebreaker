# Changelog

All notable changes to **icebreaker** are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project aims to
follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

Next: **Phase 2 — Supabase backend + accounts.** Introduce a Supabase store
adapter behind the existing `useStore()` contract, real profiles + photo upload,
and auth. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

### Added

- Backend planning doc for Phase 2+ auth/session state, profile lifecycle,
  server-authoritative icebreaker games, 15-second answer deadlines, cumulative
  match scoreboards, RLS principles, and future product ideas.
- Supabase Phase 2 foundation: optional `@supabase/supabase-js` client,
  `.env.example`, email magic-link sign-in/sign-out, session restoration,
  onboarding profile/preference upsert, setup docs, and starter SQL/RLS schema.

## [0.1.0] — 2026-05-28

**Phase 1: a believable, end-to-end POC on mock data — built, polished, and
deployed to GitHub Pages.** No backend or accounts yet, by design.

### Added

- **Project foundation** — Vite + React 19 + TypeScript + Tailwind CSS v4
  scaffold; Motion (Framer Motion) for gestures/transitions; React Router.
- **"Polar dusk" theme** — design tokens in `src/index.css` (cold cyan/teal →
  warm ember/coral), the signature `text-thaw` / `bg-thaw` gradient, frosted
  `glass` surfaces, aurora `Atmosphere` backdrop, film-grain overlay; Fraunces
  (display) + Hanken Grotesk (body) type pairing.
- **Discover** — Tinder-style swipe deck with drag-to-swipe + rotation, Thaw
  (like) / Frost (pass) action buttons, and a "the ice is cracking" match modal.
- **Trivia game** — category picker, 5-question rounds, per-answer feedback
  showing the correct answer and the match's pick, and a results screen (your
  score, theirs, in-sync count).
- **Signature thaw mechanic** — a match's portrait starts frosted/blurred and
  clears as you play trivia together; thaw is reflected on the Matches list,
  the in-game header, and progressively reveals name/bio.
- **Matches** and **Profile** screens; bottom navigation; localStorage-backed
  app state (`src/lib/store.tsx`) with a demo-reset.
- **`QuestionProvider` seam** (`src/lib/questionProvider.ts`) — a deterministic,
  offline `MockQuestionProvider` (active) plus an `OpenTriviaProvider` adapter
  stubbed behind the same interface for later. UI never knows the source.
- **Tulsa, OK profiles with real photos** — 8 locals + the signed-in user, with
  real portrait photos bundled into the repo (no runtime network dependency) and
  bios referencing Brookside, Greenwood, Cherry Street, the Tulsa Arts District,
  Turkey Mountain, the Gathering Place, Cain's Ballroom, and more.
- **Mock trivia bank** — 5 questions across each of 6 categories.
- **Playwright verification loop** (`scripts/screenshot.mjs`, `npm run shot`) —
  walks the full flow (incl. a complete trivia round to the results screen) at
  phone (390×844), iPhone SE (375×667), and desktop viewports; fails on any
  console error. Plus `scripts/inspect.mjs` for debugging.
- **GitHub Pages deploy** — `.github/workflows/deploy.yml` builds under base
  `/icebreaker/`, adds a `404.html` SPA fallback, and publishes on push to
  `main`. `BrowserRouter` derives its `basename` from `import.meta.env.BASE_URL`.
  Live at <https://dalbert1.github.io/icebreaker/>.
- **Docs & agent guides** — `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, and
  `CLAUDE.md` (mirrored to `AGENTS.md`) with standing rules: verify with
  Playwright, prefer mocks over API keys, keep the guides in sync.

### Changed

- Portraits render the real profile photo as the base layer with the frost
  overlay on top (the generated gradient + initial remains a safe fallback).
- Discovery deck made height-robust — fills available space instead of a fixed
  aspect ratio, so the initial mobile viewport never overflows on shorter
  phones.
- Trivia layout — answer options sit directly under the question with the
  Next/Results button anchored to the bottom; frost overlay softened so an iced
  match still hints at a person.
- Repository made **public** (the account plan doesn't support Pages on private
  repos; content is safe — stock photos, mock data, no secrets).

### Fixed

- **Thaw consistency** — thaw now tracks *rounds played together*, not answer
  correctness, so the in-game reveal stays consistent with the Matches screen
  (previously a completed round could appear thawed in-game but still iced on
  the Matches list).
- **Portrait rendering** — resolved a CSS conflict where passing
  `absolute inset-0` collapsed the portrait SVG to its intrinsic size, leaving
  the discovery card's background showing through.
- **Production base path** — verified the `/icebreaker/` build and SPA 404
  fallback against `vite preview` and the live site; documented a Windows
  `VITE_BASE` / MSYS path-mangling gotcha (set it via PowerShell, not Git-Bash).

[Unreleased]: https://github.com/Dalbert1/icebreaker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Dalbert1/icebreaker/releases/tag/v0.1.0
