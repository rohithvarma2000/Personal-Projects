-- Run once in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 100),
  email       text not null check (char_length(email) between 3 and 254),
  company     text check (char_length(company) <= 150),
  subject     text not null check (char_length(subject) between 1 and 150),
  message     text not null check (char_length(message) between 10 and 4000),
  ip_hash     text,
  user_agent  text,
  read        boolean not null default false,
  follow_up   text not null default 'none' check (follow_up in ('none','pending','replied','done')),
  notes       text check (char_length(notes) <= 4000)
);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_ip_idx on public.messages (ip_hash, created_at desc);

-- Only these emails may use the dashboard. Add YOUR Supabase Auth user's email below.
create table if not exists public.admin_emails (email text primary key);
-- insert into public.admin_emails values ('you@example.com');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_emails a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.messages enable row level security;
alter table public.admin_emails enable row level security;   -- no policies: nobody but the service role can read it

-- No INSERT policy: visitors cannot write directly. Inserts happen only in /api/contact with the service-role key.
create policy "admin can read messages"   on public.messages for select to authenticated using (public.is_admin());
create policy "admin can update messages" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete messages" on public.messages for delete to authenticated using (public.is_admin());

-- Anonymous users get nothing.
revoke all on public.messages from anon;
grant select, update, delete on public.messages to authenticated;
-- Admin may only change workflow fields, never message content.
revoke update on public.messages from authenticated;
grant update (read, follow_up, notes) on public.messages to authenticated;
