# Innerwear CBC Study — Deployment Guide
## Total time: ~20 minutes

---

## STEP 1 — Set up Supabase (free database)

1. Go to https://supabase.com and click "Start your project"
2. Sign up with Google (free)
3. Click "New project" → give it a name like "innerwear-cbc" → set a password → click Create
4. Wait ~2 minutes for it to spin up
5. Go to the SQL Editor (left sidebar) → click "New query"
6. Copy the entire contents of `supabase_schema.sql` and paste it → click Run
7. You should see "Success. No rows returned"

8. Now get your keys:
   - Go to Project Settings (gear icon) → API
   - Copy "Project URL" → this is your SUPABASE_URL
   - Copy "anon public" key → this is your SUPABASE_ANON_KEY
   - Keep these handy for Step 3

---

## STEP 2 — Upload code to GitHub

1. Go to https://github.com and sign in (or create a free account)
2. Click "New repository" → name it "innerwear-cbc-study" → set to Public → click Create
3. Click "uploading an existing file"
4. Upload the entire project folder contents (all files and folders)
5. Click "Commit changes"

---

## STEP 3 — Deploy on Vercel (free hosting)

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project" → import your "innerwear-cbc-study" repo
3. Before clicking Deploy, click "Environment Variables" and add:
   - Name: REACT_APP_SUPABASE_URL  → Value: (paste your Supabase Project URL)
   - Name: REACT_APP_SUPABASE_ANON_KEY → Value: (paste your anon key)
4. Click Deploy
5. Wait ~2 minutes → Vercel gives you a URL like: https://innerwear-cbc-study.vercel.app

---

## STEP 4 — Share & collect

- **Survey link** (send to respondents): https://innerwear-cbc-study.vercel.app
- **Dashboard link** (your live view): https://innerwear-cbc-study.vercel.app?dashboard

That's it! Every submission appears in your dashboard in real time.

---

## Exporting data

Click "Export CSV" on the dashboard — downloads all responses ready for HB analysis in Python/R.

---

## Troubleshooting

- Blank page on Vercel: check environment variables are set correctly (no spaces)
- Responses not showing: go to Supabase → Table Editor → check the responses table has data
- Realtime not working: go to Supabase → Database → Replication → make sure responses table is enabled
