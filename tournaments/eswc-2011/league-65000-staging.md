# League 65000 staging in `dota_archive.db`

A new staging table was added to `dota_archive.db`:

- **`league_match_staging`**

Purpose:
- store **source-level match skeletons** for early shared-ticket datasets such as
  `league_id=65000` (“The Internal”)
- keep them **separate from canonical tournament assignments**
- allow later classification into:
  - ESWC 2011
  - The International 2011
  - other / unknown league-65000 matches

---

## Current contents

So far, the table contains the **25 exact Liquipedia match IDs for ESWC 2011**:
- 20 group-stage matches
- 5 playoff matches

Each row stores:
- `league_id`
- `source_tournament`
- `source_page`
- `stage`
- `match_id`
- `match_date_utc`
- `team1`
- `team2`
- `expected_winner`
- `best_of`
- source metadata and notes
- whether the match is already present in the main `matches` table

---

## Current ESWC 2011 staging status

For `league_id=65000` + `source_tournament='Electronic Sports World Cup 2011'`:

- **staged rows:** `25`
- **already present in `matches`:** `4`
- **currently missing from `matches`:** `21`

The 4 already present are:
- `91026`
- `91105`
- `91112`
- `91151`

The missing playoff match is:
- `90992`

All 20 current group-stage Liquipedia IDs are still missing from the main
`matches` table.

---

## Why this matters

This avoids polluting canonical tournament rows while still letting us:
- accumulate verified match IDs from Liquipedia / research
- track what is present vs missing in the DB
- later ingest more `league_id=65000` material (for example TI1) into the same
  staging layer before classification

