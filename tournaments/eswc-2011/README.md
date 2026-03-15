# Electronic Sports World Cup 2011 (ESWC 2011) - Recovery Report

**Status**: Rebuild in progress ⚠️
**Dates**: Oct 23-25, 2011
**Location**: Paris, France
**Format**: Group Stage + 4-team single-elimination playoff
**Prize Pool**: $22,000 USD
**Organizer**: Game Solution
**GitHub repo**: <https://github.com/aivv73/dota-stats-archive>

---

**Sources**:
- Liquipedia: <https://liquipedia.net/dota2/Electronic_Sports_World_Cup/2011>
- Structured Liquipedia stage-1 inventory: `pipeline/liquipedia_pre2014_stage1/data/liquipedia_pre2014_stage1.json`
- Cached Liquipedia page content:
  `pipeline/liquipedia_pre2014_stage1/cache/http/ae4f0e23264e789e1549fd5a48d04031b2b8c7dc.json`
- Local DB: `dota_archive.db`
- Related reconstruction notes in this directory:
  - `eswc-2011-rebuild-checklist.md`
  - `eswc-2011-rosters.md`
  - `eswc-2011-audit-notes.md`
  - `eswc-2011-account-proven-lobbies.md`
  - `eswc-2011-db-report.mjs`
  - `league-65000-staging.md`

**Important note**:
ESWC 2011 should no longer be treated as a tournament that is already cleanly
recovered in the main DB. The repo does contain an older imported block under
`tournament_id=999`, but current audit work suggests that block is a **noisy,
non-canonical working dump**, not a finished tournament reconstruction.

---

## 🏆 Tournament Overview

Electronic Sports World Cup 2011 was one of the earliest offline Dota 2 LAN
events, held in Paris during Paris Games Week. Liquipedia describes the format
as:

- **Group Stage**
  - 12 teams divided into 2 groups
  - top 2 from each group advance
  - best-of-1 matches
- **Playoffs**
  - 4-team single elimination
  - semifinals best-of-1
  - grand final best-of-3

### Final Standings

| Place | Team | Prize |
|---|---|---|
| 🥇 1st | **Natus Vincere** | $12,000 |
| 🥈 2nd | **EHOME** | $6,000 |
| 🥉 3rd | **GamersLeague** | $4,000 |
| 4th | **monkeybusiness** | $0 |

---

## 🗃 Current DB State

Two tournament rows exist in `dota_archive.db`:

- `999` — **ESWC 2011 (Recovered)**
- `1000` — **ESWC 2011**

Current practical reading:

- **`tournament_id=999`** contains a large recovered/imported block and should be
  treated as a **non-canonical source of clues**, not as the finished ESWC row
- **`tournament_id=1000`** is currently empty and should not yet be treated as a
  canonical row either

Current DB snapshot for `tournament_id=999`:

- **match count:** `306`
- most rows currently fall on:
  - `2011-10-24`
  - `2011-10-25`

However, the current audit state shows that this 306-match block does **not**
resemble a clean ESWC-only tournament dataset:

- most rows do not have normalized team names
- many player rows contain `Unknown`
- hero data is missing in the local DB layer
- only a minority of direct Liquipedia ESWC IDs are currently present

So the working approach has changed:

- keep `tournament_id=999` as a clue source
- rebuild ESWC 2011 from **verified match IDs + roster/account evidence**
- use a separate staging layer for `league_id=65000` rather than treating the
  old imported block as canonical

---

## 🎯 Direct Liquipedia Match IDs in playoff bracket

These IDs are directly embedded in the Liquipedia page wikicode and are the
strongest tournament anchors we currently have.

### Semifinals

| Match | Match ID | Date (UTC) |
|---|---:|---|
| monkeybusiness vs Natus Vincere | `91026` | 2011-10-25 07:54 UTC |
| GamersLeague vs EHOME | `90992` | 2011-10-25 07:44 UTC |

### Third place match

| Match | Match ID | Date (UTC) |
|---|---:|---|
| monkeybusiness vs GamersLeague | `91105` | 2011-10-25 09:31 UTC |

### Grand Final

| Match | Match ID | Date (UTC) |
|---|---:|---|
| Natus Vincere vs EHOME — Game 1 | `91112` | 2011-10-25 09:59 UTC |
| Natus Vincere vs EHOME — Game 2 | `91151` | 2011-10-25 10:44 UTC |

---

## 🎮 Group Stage direct Liquipedia match IDs

Liquipedia also embeds direct match IDs for the group-stage matches.

### Group 1

| Date (UTC) | Match | Match ID |
|---|---|---:|
| 2011-10-23 08:14 | Moscow Five vs Storm Games Clan | `86405` |
| 2011-10-23 08:36 | monkeybusiness vs Virus Gaming | `86443` |
| 2011-10-23 09:27 | Storm Games Clan vs EHOME | `86532` |
| 2011-10-23 09:54 | Virus Gaming vs Moscow Five | `86595` |
| 2011-10-23 11:35 | EHOME vs Virus Gaming | `86722` |
| 2011-10-23 11:45 | Moscow Five vs monkeybusiness | `86790` |
| 2011-10-23 13:08 | Virus Gaming vs Storm Games Clan | `86922` |
| 2011-10-23 13:41 | monkeybusiness vs EHOME | `87004` |
| 2011-10-23 15:10 | Storm Games Clan vs monkeybusiness | `87120` |
| 2011-10-23 15:16 | EHOME vs Moscow Five | `87161` |

### Group 2

| Date (UTC) | Match | Match ID |
|---|---|---:|
| 2011-10-24 08:15 | Orange eSports vs BX3 eSports Club | `88792` |
| 2011-10-24 08:14 | NEXT.kz vs GamersLeague | `88786` |
| 2011-10-24 09:46 | BX3 eSports Club vs Natus Vincere | `88913` |
| 2011-10-24 09:46 | GamersLeague vs Orange eSports | `88948` |
| 2011-10-24 11:41 | Natus Vincere vs GamersLeague | `89136` |
| 2011-10-24 11:35 | Orange eSports vs NEXT.kz | `89113` |
| 2011-10-24 13:42 | NEXT.kz vs Natus Vincere | `89314` |
| 2011-10-24 13:51 | GamersLeague vs BX3 eSports Club | `89343` |
| 2011-10-24 16:09 | Natus Vincere vs Orange eSports | `89603` |
| 2011-10-24 14:51 | BX3 eSports Club vs NEXT.kz | `89492` |

---

## ✅ What is currently confirmed

### Direct Liquipedia skeleton
The tournament has a clean **25-match skeleton** from cached Liquipedia data:
- **20** group-stage matches
- **5** playoff matches

### `league_id=65000` staging layer
A dedicated staging table now exists in `dota_archive.db`:
- **`league_match_staging`**

Current ESWC 2011 staging status:
- **25** ESWC 2011 Liquipedia match IDs staged
- **4** of those are currently present in the local `matches` table
- **21** are still missing from the local `matches` table

### Account-proven Na`Vi path
Using user-provided secondary account IDs for:
- **Puppey** — `87277951`
- **LighTofHeaveN** — `85716771`

we now have account-history confirmation for these ESWC 2011 Na`Vi matches:
- `88913` — BX3 eSports Club vs Natus Vincere
- `89136` — Natus Vincere vs GamersLeague
- `89314` — NEXT.kz vs Natus Vincere
- `89603` — Natus Vincere vs Orange eSports
- `91026` — monkeybusiness vs Natus Vincere
- `91112` — Natus Vincere vs EHOME
- `91151` — Natus Vincere vs EHOME

### Account-proven EHOME grand-final maps
Using user-provided EHOME account IDs, the grand-final maps are directly
validated at the account layer:
- `91112`
- `91151`

---

## ⚠️ Current cautions

### The old recovered row is not canonical
The repo still has `tournament_id=999`, but current evidence suggests it should
be treated as a **noisy recovered dump**, not a finished tournament row.

### Missing local matches still matter
Even though some ESWC IDs are now account-confirmed through OpenDota history,
that does **not** mean they are already stored in the local `matches` table.
For example, some Na`Vi group-stage matches are account-confirmed but still
missing locally.

### Shared-ticket / shared-league problem
There is strong reason to believe `league_id=65000` (“The Internal”) is a
**shared early ticket bucket**, not an ESWC-only container. That means ESWC 2011
should be reconstructed by classification and evidence, not by blindly trusting
all matches associated with that league.

---

## 🔭 Next useful tasks

1. recover the four account-confirmed but still-missing Na`Vi Group 2 IDs: `88913`, `89136`, `89314`, `89603`
2. recover the missing semifinal `90992` (GamersLeague vs EHOME)
3. continue tagging `league_id=65000` rows through tournament classification
4. keep adding roster / account anchors for ESWC teams
5. attach VOD/archive links where available
6. only after that, build a clean canonical ESWC tournament row

### Local DB report

To re-check the live local ESWC 2011 state against the staging layer, run:

```bash
npm run report:eswc-2011
```

This reads only the local `dota_archive.db` plus the checked-in
`eswc-2011-account-proven-lobbies.md` note and prints the current staged/present
split together with the priority recovery queue.

---

## 📝 Notes

This README is intentionally conservative.

At this point it establishes:

- ESWC 2011 has a reliable Liquipedia match skeleton
- the old `tournament_id=999` block is **not** clean enough to trust as canon
- ESWC 2011 now has a dedicated `league_id=65000` staging layer in the DB
- multiple ESWC matches are strengthened by direct player-account evidence
- the correct path forward is a clean rebuild, not in-place trust of the old import
