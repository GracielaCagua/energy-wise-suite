-- Migration: create login_attempts table + helper function to check lockout
-- Run this migration against your Supabase database. It creates the table, index,
-- RLS policy to allow authenticated users to insert their own attempts, and
-- a helper function `user_locked(user uuid, window_minutes int, max_attempts int)`.

create table if not exists public.login_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  ip text,
  user_agent text,
  succeeded boolean not null default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.login_attempts enable row level security;

-- Index to speed up recent-failed-queries per user
create index if not exists login_attempts_user_created_at_idx on public.login_attempts (user_id, created_at desc);

-- Allow authenticated users to insert their own attempts (auth.uid() must match user_id)
create policy "insert_own_attempts" on public.login_attempts
  for insert
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Optionally allow users to select their own attempts (helpful for UX/debug)
create policy "select_own_attempts" on public.login_attempts
  for select
  using ( auth.uid() = user_id );

-- Helper function that returns true when user has >= max_attempts failed within window_minutes
create or replace function public.user_locked(p_user uuid, p_window_minutes int default 15, p_max_attempts int default 3)
returns boolean language sql as $$
  select (
    (select count(*) from public.login_attempts la where la.user_id = p_user and la.succeeded = false and la.created_at > now() - (p_window_minutes || ' minutes')::interval)
    >= p_max_attempts
  );
$$;

comment on function public.user_locked is 'Returns true when user had >= p_max_attempts failed attempts within p_window_minutes';
