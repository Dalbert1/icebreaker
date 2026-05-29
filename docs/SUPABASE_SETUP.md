# Supabase setup

icebreaker can still run as a local mock POC with no credentials. When these
environment variables are present, the app enables Supabase Auth and writes the
onboarding profile/preference to Supabase.

## 1. Create the project

1. Create a Supabase project.
2. Open the SQL editor.
3. Run [`supabase/schema.sql`](../supabase/schema.sql).

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the public project values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are safe to expose in the browser when Row-Level Security is enabled.
Never put a service-role key in a Vite environment variable.

## 3. Configure Auth redirects

In Supabase, go to Authentication -> URL Configuration.

Set Site URL for local development:

```text
http://localhost:5173
```

Add redirect URLs:

```text
http://localhost:5173/**
https://dalbert1.github.io/icebreaker/**
```

The app uses `signInWithOtp` with a `redirectTo` value derived from the current
origin and Vite base path.

## 4. Configure GitHub Pages

For the deployed site, add these repository variables in GitHub:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The deploy workflow passes them into `npm run build`. If they are omitted, the
GitHub Pages build still works in mock mode.

## 5. Current integration status

Implemented now:

- Supabase client bootstrapping from Vite env vars.
- Email magic-link sign-in and sign-out.
- Auth session restoration via `onAuthStateChange`.
- Profile/preference upsert when onboarding preference is selected.
- Starter SQL schema with RLS.

Still mocked until the next backend pass:

- Discover profiles come from bundled mock data.
- Swipes and reciprocal matches use local state.
- Icebreaker games, scoring, answer deadlines, and chat are local/mock.

The next implementation pass should move swipes/matches into RPCs first, then
persist games and 15-second answer windows server-side.
