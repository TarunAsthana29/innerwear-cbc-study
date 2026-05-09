-- Run this in your Supabase SQL editor (one time setup)

create table responses (
  id uuid default gen_random_uuid() primary key,
  respondent_id text not null,
  age integer,
  nccs text,
  tier text,
  platform text,
  income text,
  choices text not null,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable realtime so dashboard updates live
alter publication supabase_realtime add table responses;

-- Allow anyone to insert (respondents) and read (dashboard)
alter table responses enable row level security;

create policy "Anyone can insert" on responses for insert with check (true);
create policy "Anyone can read" on responses for select using (true);
