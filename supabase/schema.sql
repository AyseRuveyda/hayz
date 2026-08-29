-- Hayz Takvimi / Supabase şema
-- Dashboard SQL Editor'de çalıştırın.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  madhhab text not null default 'HANAFI',
  habit_hayz_days integer not null default 7,
  habit_purity_days integer not null default 15,
  maliki_max_days integer default 15,
  locale text not null default 'tr',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cycle_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  start_date timestamptz not null,
  end_date timestamptz not null,
  madhhab text not null,
  status text not null,
  hayz_days numeric not null default 0,
  istihadha_days numeric not null default 0,
  purity_days numeric,
  requires_ghusl boolean not null default false,
  qada_prayers_count integer not null default 0,
  next_earliest_hayz_date timestamptz,
  summary_tr text,
  summary_en text,
  is_continuous_bleeding boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_spotting_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  discharge_type text not null,
  kursuf_state text not null,
  symptoms text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.qada_tracker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('PRAYER', 'FAST')),
  remaining integer not null default 0,
  total integer not null default 0,
  source text not null,
  related_cycle_id uuid references public.cycle_records (id) on delete set null,
  related_date date,
  note_tr text,
  note_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cycle_records_user on public.cycle_records (user_id, start_date desc);
create index if not exists idx_spotting_user_date on public.daily_spotting_logs (user_id, date desc);
create index if not exists idx_qada_user on public.qada_tracker (user_id, kind);

alter table public.profiles enable row level security;
alter table public.cycle_records enable row level security;
alter table public.daily_spotting_logs enable row level security;
alter table public.qada_tracker enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "cycles_own" on public.cycle_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "spotting_own" on public.daily_spotting_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "qada_own" on public.qada_tracker
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
