# Innerwear CBC Study — v8

This is the **complete, consolidated build**. Every decision from prior conversations is now in one place. Do not patch — replace your GitHub repo entirely with this folder.

---

## Deploy checklist (in this exact order)

### 1. Run the Supabase migration FIRST
Open Supabase → SQL Editor → paste and run the contents of `database/supabase_migration_v8.sql`.
This adds every column the new code expects. The final SELECT shows you what columns now exist — confirm all of these are listed:
`gender, recency, education, durables_count, durables_list, nccs, nccs_raw, tier, platform`

### 2. Confirm Vercel env vars
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_RESEARCHER_PASSWORD` *(optional — defaults to `innerwear2026`)*

### 3. Replace GitHub repo contents with this folder
Delete everything in your GitHub repo. Upload this folder's contents maintaining the structure below.

### 4. Vercel will auto-deploy
Watch Deployments tab → wait for "Ready" → hard refresh your live URL (Ctrl+Shift+R).

---

## Folder structure
```
innerwear-cbc/
├── api/
│   └── run-hb.js
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── data.js
│   ├── supabase.js
│   ├── index.js
│   └── components/
│       ├── Screener.js
│       ├── Assumptions.js
│       ├── Survey.js
│       ├── Dashboard.js
│       └── HBResults.js
├── database/
│   └── supabase_migration_v8.sql
├── package.json
└── README.md
```

---

## What changed vs. previous versions

### Study design (locked)
| Attribute | Levels |
|---|---|
| Brand | XYXX, Dixcy Scott Alpha, Jockey |
| Price (pack of 3) | ₹300, ₹450, ₹600, ₹800 |
| Rating | 3.9★, 4.2★, 4.5★ |
| Fabric | 100% Cotton, Blended Cotton, Modal |
| USP | Sweat Absorbent, Ultra Breathable, Highly Stretchable |

12 tasks · 3 options + None · Pack size constant at 3 pcs.

### Screener (full)
- Age (18–55)
- Gender → terminate if not Male
- Recency → terminate if not bought online in last 6 months
- Education of chief wage earner (6 levels)
- Durables owned — multi-select checkboxes (5 items)
- City tier (Tier 1 / Tier 2 only — Tier 3 removed)
- Platform
- NCCS classified via official MRSI grid → terminate if outside A1/A2/A3/B1

### Survey flow
`screener → assumptions screen → 12 tasks → thank you`
USP is now a standard row, not a coloured pill.

### Dashboard
- Password-protected (session-based, with Lock button)
- NCCS quota bars — **suggestive only**, not enforced
- Tab renamed: "Part-worths & WTP (Aggregate MNL)" — honest labelling
- CSV export includes all v8 fields
- Analysis tab opens with disclaimer: "Pooled MNL via MCMC — not true HB"

### Bug fixes
- HB auto-trigger now uses Supabase `count` metadata (the old code checked `data.length` which always returned 0)
- Feature vector indices in run-hb.js and HBResults — no overlapping dimensions
- Save errors now surface in the thank-you screen instead of silently failing
- Researcher password readable from env variable

### Display thresholds (raised)
- Aggregate MNL: shown at n ≥ 30 (was 5)
- NCCS segment results: shown at n ≥ 30 per cohort (was 8)
- MNL run trigger: n ≥ 50 (was 10)

---

## After deploy — first-time validation steps
1. Open the live URL in an **incognito** window
2. Complete the screener as Male, Yes (recency), Graduate (professional), tick 5 durables, Tier 1
3. Read the assumptions screen → click "I understand"
4. Complete all 12 tasks → submit
5. Go to Supabase → Table Editor → `responses` → confirm one new row appears with all fields populated
6. Switch to the Dashboard tab → enter `innerwear2026` → confirm the response count = 1

If any of those fail, open browser DevTools → Console → screenshot the red error message.
