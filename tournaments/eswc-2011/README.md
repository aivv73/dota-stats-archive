# Electronic Sports World Cup 2011 (ESWC 2011) - Recovery Report

**Status**: Recovered in DB ⚠️ (large tournament dataset is present, but the tournament README / audit layer is only now being formalized)
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
- Local DB: `dota_archive.db`

**Important note**:
ESWC 2011 is already represented in the local database, but not yet with the
same tournament-specific README / audit pass that now exists for **Dota 2 Star
Championship** and **The Defense Season 1**. So this file should be treated as a
first formalization pass over an already-imported tournament dataset.

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

- **`tournament_id=999`** is the meaningful recovered dataset row
- **`tournament_id=1000`** is currently empty and should not be treated as the
  canonical row

Current DB snapshot for `tournament_id=999`:

- **match count:** `306`
- most rows currently fall on:
  - `2011-10-24`
  - `2011-10-25`

This suggests the DB already contains a large imported ESWC block, but it still
needs a proper tournament-level audit to distinguish clean tournament matches
from any low-quality / over-broad imports.

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

## ⚠️ Current audit status / cautions

At the moment, ESWC 2011 is in a different state from The Defense Season 1:

- for **The Defense**, the repo now has a DB-first reconstruction narrative
- for **ESWC 2011**, the repo already has a **large imported DB block**, but it
  still needs a tournament-specific cleanup / validation pass

In practical terms, the next useful ESWC tasks are:

1. verify that `tournament_id=999` rows correspond cleanly to the Liquipedia
   match list above
2. inspect whether any `900xx` rows are over-imported / noisy / placeholder-like
3. create a proper playoff + groups report in the same style as `d2sc` and
   `the-defense-s1`
4. attach VOD/archive links where available

---

## 📝 Notes

This README is intentionally conservative.

It does **not** yet claim that all 306 rows in `tournament_id=999` are already
clean, final, or presentation-ready. It only establishes:

- the tournament exists in the local DB
- the recovered tournament row is `999`
- Liquipedia provides direct match IDs for all group-stage matches and the full
  playoff bracket
- ESWC 2011 is now ready for a proper tournament-specific cleanup pass
