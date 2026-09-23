-- Run this in the Supabase SQL editor.

-- Also create a Storage bucket named "media" (Storage → New bucket → Public)
-- so the admin panel can upload images/video and get back a public URL.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in (
    'marketing', 'development', 'ai', 'video', 'graphic', 'brand', 'event'
  )),
  blurb text not null,
  media_url text,
  media_urls jsonb not null default '[]'::jsonb,
  link_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- If this table already existed before `media_urls` was added, this backfills
-- it safely (no-op on a fresh table, since the column is already there).
alter table projects add column if not exists media_urls jsonb not null default '[]'::jsonb;

-- Public read access for the portfolio grid, write access stays server-side
-- (server uses the service key, so no public write policy is needed).
alter table projects enable row level security;
create policy "projects are publicly readable"
  on projects for select
  using (true);

alter table messages enable row level security;
-- no public policies on messages: only the server (service key) can insert.

-- Seed a few placeholder rows so the site isn't empty on first run.
insert into projects (title, category, blurb, sort_order) values
  ('Launch campaign — Nomad Coffee', 'marketing', 'Paid social + email funnel that took a new roaster from 0 to 4k followers in 6 weeks.', 1),
  ('Client dashboard rebuild', 'development', 'React + Node + Postgres rebuild of a booking dashboard, cut load time by 70%.', 2),
  ('Support ticket triage bot', 'ai', 'LLM-backed classifier and auto-responder wired into an existing helpdesk.', 3),
  ('Wedding highlight reel', 'video', '3-minute cut from 6 hours of raw footage, color graded and scored.', 4),
  ('Rebrand — Aden Bakery', 'brand', 'Full identity: logotype, packaging, and a 40-page brand guideline.', 5),
  ('Product launch poster series', 'graphic', 'A 6-poster series for a tech launch, print and social formats.', 6),
  ('Tech meetup — 300 attendees', 'event', 'End-to-end production: venue, run-of-show, signage, and livestream.', 7)
on conflict do nothing;
