-- ════════════════════════════════════════════════════════════════════════
-- INNERWEAR CBC STUDY — v8 SUPABASE MIGRATION
-- Run this ENTIRE file in Supabase SQL Editor before deploying v8.
-- Safe to re-run; uses IF NOT EXISTS / IF EXISTS guards.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Create responses table if it doesn't exist ──────────────────────
create table if not exists responses (
  id uuid default gen_random_uuid() primary key,
  respondent_id text not null,
  age integer,
  choices text not null,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ─── 2. Add ALL v8 columns (safe if they already exist) ─────────────────
alter table responses add column if not exists gender text;
alter table responses add column if not exists recency text;
alter table responses add column if not exists education text;
alter table responses add column if not exists durables_count int;
alter table responses add column if not exists durables_list text;
alter table responses add column if not exists nccs text;
alter table responses add column if not exists nccs_raw text;
alter table responses add column if not exists tier text;
alter table responses add column if not exists platform text;

-- ─── 3. Enable realtime so dashboard updates live ───────────────────────
alter publication supabase_realtime add table responses;

-- ─── 4. Row-level security policies ─────────────────────────────────────
alter table responses enable row level security;
drop policy if exists "Anyone can insert" on responses;
drop policy if exists "Anyone can read"   on responses;
drop policy if exists "Anyone can delete" on responses;
create policy "Anyone can insert" on responses for insert with check (true);
create policy "Anyone can read"   on responses for select using (true);
create policy "Anyone can delete" on responses for delete using (true);

-- ─── 5. hb_results table for pooled MNL output ──────────────────────────
create table if not exists hb_results (
  id text primary key,
  n_responses integer,
  results text not null,
  computed_at timestamptz default now()
);
alter publication supabase_realtime add table hb_results;
alter table hb_results enable row level security;
drop policy if exists "Anyone can read hb_results"   on hb_results;
drop policy if exists "Service role can write hb_results" on hb_results;
create policy "Anyone can read hb_results"   on hb_results for select using (true);
create policy "Service role can write hb_results" on hb_results for all using (true);

-- ─── 6. Sanity check — show columns of responses table ──────────────────
-- After running, you should see all the v8 columns listed.
select column_name, data_type from information_schema.columns
where table_name = 'responses' order by ordinal_position;
