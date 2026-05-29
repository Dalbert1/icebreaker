-- icebreaker Phase 2 starter schema.
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'You',
  birth_date date,
  bio text not null default '',
  vibes text[] not null default '{}',
  location_label text,
  location_geohash text,
  is_discoverable boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (profile_id, sort_order),
  unique (storage_path)
);

create table if not exists public.profile_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  interested_in text not null check (interested_in in ('male', 'female', 'both')),
  age_min integer not null default 18 check (age_min >= 18),
  age_max integer not null default 99 check (age_max >= age_min),
  distance_miles integer not null default 25 check (distance_miles > 0),
  category_preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_prompts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, sort_order)
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id),
  check (swiper_id <> target_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'unmatched', 'blocked')),
  thaw numeric not null default 0 check (thaw >= 0 and thaw <= 1),
  chat_unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  category text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled')),
  started_by uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.game_answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  q_index integer not null check (q_index >= 0),
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_index integer,
  answered_at timestamptz not null default now(),
  is_correct boolean not null default false,
  timed_out boolean not null default false,
  points_awarded integer not null default 0,
  unique (game_id, q_index, user_id)
);

create table if not exists public.match_scoreboards (
  match_id uuid primary key references public.matches(id) on delete cascade,
  user_a_total integer not null default 0,
  user_b_total integer not null default 0,
  games_played integer not null default 0,
  user_a_wins integer not null default 0,
  user_b_wins integer not null default 0,
  ties integer not null default 0,
  sync_total integer not null default 0,
  current_streak_user_id uuid references public.profiles(id) on delete set null,
  current_streak_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.profile_prompts enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.games enable row level security;
alter table public.game_answers enable row level security;
alter table public.match_scoreboards enable row level security;

create or replace view public.public_profiles as
select
  id,
  display_name,
  bio,
  vibes,
  location_label,
  created_at,
  updated_at
from public.profiles
where is_discoverable = true
  and onboarding_completed_at is not null;

create or replace view public.public_profile_photos as
select
  pp.id,
  pp.profile_id,
  pp.storage_path,
  pp.sort_order,
  pp.created_at
from public.profile_photos pp
join public.profiles p on p.id = pp.profile_id
where p.is_discoverable = true
  and p.onboarding_completed_at is not null
  and pp.moderation_status = 'approved';

create or replace view public.public_profile_prompts as
select
  pr.id,
  pr.profile_id,
  pr.question,
  pr.answer,
  pr.sort_order,
  pr.created_at,
  pr.updated_at
from public.profile_prompts pr
join public.profiles p on p.id = pr.profile_id
where p.is_discoverable = true
  and p.onboarding_completed_at is not null;

grant select on public.public_profiles to authenticated;
grant select on public.public_profile_photos to authenticated;
grant select on public.public_profile_prompts to authenticated;

create policy "users read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users read own profile photos"
  on public.profile_photos for select
  to authenticated
  using (profile_id = auth.uid());

create policy "users insert pending own profile photos"
  on public.profile_photos for insert
  to authenticated
  with check (profile_id = auth.uid() and moderation_status = 'pending');

create policy "users update pending own profile photos"
  on public.profile_photos for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and moderation_status = 'pending');

create policy "users delete own profile photos"
  on public.profile_photos for delete
  to authenticated
  using (profile_id = auth.uid());

create policy "users manage own preferences"
  on public.profile_preferences for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "users manage own profile prompts"
  on public.profile_prompts for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "users manage own swipes"
  on public.swipes for all
  to authenticated
  using (swiper_id = auth.uid())
  with check (swiper_id = auth.uid());

create policy "participants read matches"
  on public.matches for select
  to authenticated
  using (auth.uid() in (user_a, user_b));

create policy "participants read games"
  on public.games for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = games.match_id
        and auth.uid() in (m.user_a, m.user_b)
    )
  );

create policy "participants read answers"
  on public.game_answers for select
  to authenticated
  using (
    exists (
      select 1
      from public.games g
      join public.matches m on m.id = g.match_id
      where g.id = game_answers.game_id
        and auth.uid() in (m.user_a, m.user_b)
    )
  );

create policy "users insert own answers"
  on public.game_answers for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "participants read scoreboards"
  on public.match_scoreboards for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_scoreboards.match_id
        and auth.uid() in (m.user_a, m.user_b)
    )
  );
