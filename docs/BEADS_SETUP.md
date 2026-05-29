# Beads setup & machine migration

This project tracks issues with **[bd (beads)](https://github.com/steveyegge/beads)**,
not GitHub Issues or markdown TODOs. This doc is how to get the workflow running
on a fresh machine (a new laptop, a Mac mini, a CI box) so the issue history
follows you.

## How the pieces fit

| Piece | What it is | Travels via |
|---|---|---|
| `bd` | the beads CLI (Homebrew formula `beads`) | install per-machine |
| `dolt` | the embedded version-controlled DB beads stores issues in | **auto-installed** as a dep of `beads` |
| local DB | `.beads/embeddeddolt/` — the real source of truth on this machine | rebuilt locally (gitignored) |
| `refs/dolt/data` | the issue DB history, pushed to the **git remote** | `bd dolt push` / `bd dolt pull` |
| `.beads/config.yaml` | sets `sync.remote` + `export.auto` (committed) | normal `git` |
| `.beads/issues.jsonl` | a **passive export** — readable mirror, not the source | normal `git` |
| git hooks | `core.hooksPath → .beads/hooks` (auto-run `bd prime`, sync) | **re-wired by `bd bootstrap`** (local git config isn't cloned) |

Key idea: the issue database is **not** in your working tree. It rides on a
separate git ref (`refs/dolt/data`) on the same remote. A normal `git pull`
brings the code and the passive `issues.jsonl`; it does **not** bring the live
database — `bd dolt pull` does.

## First-time setup on a new machine

```bash
# 1. Prerequisites
#    - Homebrew:  https://brew.sh
#    - Node (for the app verify loop):  brew install node   # or use nvm

# 2. Install beads — pulls dolt + icu4c automatically
brew install beads
bd version && dolt version            # sanity check

# 3. Let git push to GitHub from this machine
gh auth login                          # or a PAT / SSH key
git config --global user.name  "Dalbert1"
git config --global user.email "dylan.m.albert1@gmail.com"

# 4. Clone the repo
git clone https://github.com/Dalbert1/icebreaker.git
cd icebreaker

# 5. THE KEY STEP — rebuild the Beads DB from the remote.
#    Auto-detects sync.remote / refs/dolt/data, clones the Dolt data,
#    and wires the hooks. Non-destructive (never deletes issues).
bd bootstrap --yes

# 6. Verify
bd ready          # available work
bd stats          # issue counts — should match the other machine
```

`bd bootstrap` is the documented path for *"recovering after moving to a new
machine."* It reads the committed `sync.remote` and clones the Dolt history.
**Do not** use `bd init --force` on a clone — that can wipe issues.

## Run the app's verify loop there too

```bash
npm install
npx playwright install chromium    # the `npm run shot` walk needs the browser
npm run dev                        # one shell
npm test                           # unit tests (store reducer, thaw, scoring, personal)
npm run shot                       # another shell — screenshots to .screens/, fails on console errors
```

## Keeping multiple machines in sync

Because the DB is a separate ref, sync is two steps at each end of a session:

```bash
# Start of session
git pull origin main      # code + passive issues.jsonl
bd dolt pull              # the actual issue database

# End of session (the autonomous workflow already does this)
git push origin HEAD:main # or your branch
bd dolt push
```

## Troubleshooting

- **Hooks not firing / `bd prime` not auto-running:** `core.hooksPath` is local
  git config and isn't cloned. Re-run `bd bootstrap`, or set it manually:
  `git config core.hooksPath .beads/hooks`.
- **`bd bootstrap` can't find remote data:** fall back to `bd dolt pull`.
- **`.beads-credential-key`** is machine-local and gitignored — never copy it
  between machines; bootstrap sets up what it needs.
- **DB looks stale after a `git pull`:** you forgot `bd dolt pull` — the code
  and the live database sync separately.
