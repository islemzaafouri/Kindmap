-- KindMap database schema (run in the Supabase SQL Editor)

-- 1. Tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 1000),
  location_name text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create index pins_user_id_idx on public.pins(user_id);

-- 2. Create the profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Row Level Security
alter table public.profiles enable row level security;
alter table public.pins enable row level security;

-- profiles: each user sees and edits only their own
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- pins: everyone can read, only the owner can write
create policy "pins are public" on public.pins
  for select using (true);
create policy "insert own pins" on public.pins
  for insert with check (auth.uid() = user_id);
create policy "update own pins" on public.pins
  for update using (auth.uid() = user_id);
create policy "delete own pins" on public.pins
  for delete using (auth.uid() = user_id);