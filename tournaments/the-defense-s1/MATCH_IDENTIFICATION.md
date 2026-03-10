# The Defense Season 1 — Match Identification Notes

This document records point-4 style tournament match identification against the
compiled stage-3 practice-match database.

It should be treated as the current structured evidence log for manual /
semi-manual tournament linkage work. Compared with older recovery notes, this
file explicitly separates:

- DB-first shortlist generation
- evidence strength
- VOD-assisted validation
- final verdicts

See also:
- `pipeline/practice_match_history_stage3/MATCH_IDENTIFICATION_SPEC.md`
- `pipeline/practice_match_history_stage3/data/practice_match_history_stage3_summary.json`

---

## Tournament

- **Name:** The Defense Season 1
- **Dates:** 2011-11-15 → 2012-03-04
- **Reference page:** <https://liquipedia.net/dota2/The_Defense/Season_1>

---

## Evidence model used here

Verdicts used in this document:

- `confirmed`
- `probable`
- `possible`
- `reject`

Short rule of thumb:

- **confirmed** = strong DB evidence, or DB evidence upgraded by VOD evidence
- **probable** = high-confidence candidate but missing one hard anchor
- **possible** = plausible lead, not ready for canonical tournament linkage
- **reject** = contradictory or too weak

---

## Confirmed series: Lower Bracket Final

### Series metadata

- **Series:** Evil Geniuses vs Quantic Gaming
- **Date:** 2012-03-01 20:00 CET
- **Liquipedia score:** Quantic 2:0 EG
- **Direct Liquipedia anchors:**
  - `matchid1=6577972`
  - `matchid2=6581126`
- **VODs:**
  - <https://www.youtube.com/watch?v=yQLtblCGPcQ>
  - <https://www.youtube.com/watch?v=FYuTjiwpzPE>

### Game 1

- **match_id:** `6577972`
- **match_datetime_utc:** `2012-03-01T19:55:57Z`
- **verdict:** `confirmed`
- **why:** direct Liquipedia `matchid1`, exact date alignment, strong two-sided
  player overlap, hero data present in DB rows.

Observed players / heroes from DB:

- Quantic-side cluster
  - Link — Mirana
  - MaNia — Chen
  - Ryze — Crystal Maiden
  - miGGel — Nature's Prophet
- EG-side cluster
  - DeMoN — Invoker
  - Fear — Sand King
  - Lacoste — Broodmother
  - MISERY — Queen of Pain

### Game 2

- **match_id:** `6581126`
- **match_datetime_utc:** `2012-03-01T20:51:25Z`
- **verdict:** `confirmed`
- **why:** direct Liquipedia `matchid2`, exact date alignment, strong two-sided
  player overlap, hero data present in DB rows.

Observed players / heroes from DB:

- Quantic-side cluster
  - Link — Anti-Mage
  - MaNia — Earthshaker
  - Ryze — Enchantress
  - miGGel — Shadow Shaman
- EG-side cluster
  - DeMoN — Beastmaster
  - Fear — Vengeful Spirit
  - Lacoste — Windranger
  - MISERY — Faceless Void
  - Maelk — Lich

### Series verdict

- **Lower Bracket Final verdict:** `confirmed`

This is a best-case validation example because Liquipedia provides direct
`matchid` anchors and the stage-3 DB independently contains matching roster and
hero evidence.

---

## Upper Bracket Final (EG vs Na`Vi)

### Series metadata

- **Series:** Evil Geniuses vs Natus Vincere
- **Date:** 2012-02-26 19:00 CET
- **Liquipedia score:** EG 0:2 Na`Vi
- **Source note:** Liquipedia bracket confirms the series date and score, but
  does **not** expose direct `matchid` anchors here, so this section relies on
  stage-3 DB clustering and timing.

### Strong DB shortlist on 2012-02-26

The strongest same-day candidates around the scheduled match time are:

- `6311827`
- `6313249`
- `6316051`

The core recurring player set is:

- Na`Vi-side anchors: `Dendi`, `Puppey`, `XBOCT`
- EG-side anchors: `DeMoN`, `Fear`, `Maelk`
- additional EG-side support anchors when present: `Lacoste`, `MISERY`

This already forms a clean two-map progression with one likely false-start /
partial duplicate candidate before the second played map.

### Game 1

- **leading candidate:** `6311827`
- **match_datetime_utc:** `2012-02-26T18:47:12Z`
- **verdict:** `probable` (very high)

Observed DB-side heroes:

- Na`Vi-side cluster
  - Dendi — Invoker
  - Puppey — Earthshaker
  - XBOCT — Vengeful Spirit
- EG-side cluster
  - DeMoN — Beastmaster
  - Fear — Lifestealer
  - Lacoste — Windranger
  - MISERY — Mirana
  - Maelk — Chen

Why this is the lead:

- timestamp lands cleanly before the scheduled 19:00 CET series start
- strong two-sided roster overlap
- full hero profile is coherent for a real played map
- clear result split in the DB rows: Na`Vi-side rows show wins, EG-side rows
  show losses

### Game 2

- **leading candidate:** `6316051`
- **match_datetime_utc:** `2012-02-26T19:54:25Z`
- **verdict:** `probable` (very high)

Observed DB-side heroes:

- Na`Vi-side cluster
  - Dendi — Sand King
  - Puppey — Chen
  - XBOCT — Night Stalker
- EG-side cluster
  - DeMoN — Shadow Shaman
  - Fear — Wraith King
  - Lacoste — Venomancer
  - MISERY — Ancient Apparition
  - Maelk — Enchantress

Why this is the lead:

- timing fits a second map after `6311827`
- strong two-sided roster overlap
- full hero profile is coherent for a real played map
- same directional result split again favors Na`Vi over EG, matching the known
  2:0 series score

### Non-primary nearby candidate

#### `6313249`

- **verdict:** `possible` / `reject as primary played map`
- **reason:** likely false-start, recreated lobby, or partial duplicate before
  the real Game 2

Evidence:

- it occurs only about **21 minutes** after `6311827`, which is too tight for a
  clean first-map finish plus draft/loading plus full second map
- its overlapping hero assignments are **identical** to `6316051` for the
  shared players:
  - DeMoN — Shadow Shaman
  - Dendi — Sand King
  - Fear — Wraith King
  - Maelk — Enchantress
  - Puppey — Chen
- compared with `6316051`, it is only a **partial** cluster and lacks the more
  complete two-sided player coverage

That makes `6313249` much more consistent with an aborted / restarted / partial
capture of the eventual second map than with a distinct played map.

### Series verdict

- **Upper Bracket Final verdict:** `probable` (very high)
- **Map-level state:**
  - Game 1 → `6311827` — `probable` (very high)
  - Game 2 → `6316051` — `probable` (very high)
- **Non-primary nearby candidate:** `6313249`

This is not as hard-anchored as the Lower Bracket Final because Liquipedia does
not expose direct match IDs here, but the DB-side timing, roster overlap, hero
coherence, and duplicate-pattern evidence make this a strong working mapping.

---

## Grand Final (Na`Vi vs Quantic)

### Series metadata

- **Series:** Natus Vincere vs Quantic Gaming
- **Date:** 2012-03-04 18:00 CET
- **Liquipedia score:** Na`Vi 3:2 Quantic
- **Important note:** Liquipedia states Na`Vi had a 1-0 lead as upper-bracket
  winner, so the public finals VOD set corresponds to **4 played maps**.
- **VODs:**
  - <https://www.youtube.com/watch?v=FAntUgZWqFk> (Game 1)
  - <https://www.youtube.com/watch?v=dwwdYO289aw> (Game 2)
  - <https://www.youtube.com/watch?v=pAqADjcqskM> (Game 3)
  - <https://www.youtube.com/watch?v=-O_Tv3RxrRk> (Game 4)

### Strong DB shortlist on 2012-03-04

The following cluster is the meaningful finals shortlist from the stage-3 DB:

- `6820537`
- `6825615`
- `6828244`
- `6829300`
- `6833198`
- `6835370`

The strongest recurring player set across the main candidates is:

- Na`Vi-side anchors: `Dendi`, `Puppey`, `XBOCT`
- Quantic-side anchors: `Link`, `MaNia`, `Ryze`, `miGGel`

This is enough to establish a strong DB-only finals cluster even before VOD
inspection.

### Game 1

- **leading candidate:** `6820537`
- **match_datetime_utc:** `2012-03-04T18:27:11Z`
- **verdict:** `confirmed`

DB-side observed heroes:

- Dendi — Leshrac
- Puppey — Enchantress
- XBOCT — Outworld Destroyer
- Link — Broodmother
- MaNia — Earthshaker
- Ryze — Windranger
- miGGel — Nature's Prophet

VOD-side note:

A frame extracted from **Game 1 at 22:52** (`g1_22m52s.jpg`) shows the
Captains Mode draft with clear **Na`Vi** and **Quantic** team labels and hero
anchors including **Mirana** and **Warlock**. These fit the missing unknown
slots of `6820537` well and strongly reinforce it as the correct first played
map.

### Game 2

- **leading candidate:** `6828244`
- **match_datetime_utc:** `2012-03-04T20:18:57Z`
- **verdict:** `probable` (high)

Current correction:

- `6828244` is now treated as the **actual played Game 2**.
- `6825615` is now treated as the **false-start / recreated lobby** that
  happened immediately before it.
- The decisive practical signal is duration: `6825615` lasted only about
  **30 seconds**, while `6828244` lasted about **33 minutes**, which is
  consistent with a real played finals map.

This updates the earlier interpretation that had temporarily favored `6825615`
as the primary mapping.

### Game 3

- **leading candidate:** `6833198`
- **match_datetime_utc:** `2012-03-04T21:45:59Z`
- **verdict:** `probable` (very high)

DB-side observed heroes:

- Dendi — Invoker
- Puppey — Enchantress
- XBOCT — Night Stalker
- Link — Mirana
- MaNia — Earthshaker
- Ryze — Vengeful Spirit
- miGGel — Nature's Prophet

Current note:

This candidate fits the temporal sequence and repeated finals player cluster very
well. It is close to confirmed but still recorded conservatively until the VOD
branch is fully exhausted.

### Game 4

- **leading candidate:** `6835370`
- **match_datetime_utc:** `2012-03-04T22:15:19Z`
- **verdict:** `probable`

DB-side observed heroes:

- Dendi — Windranger
- Puppey — Enchantress
- XBOCT — Riki
- Link — Anti-Mage
- MaNia — Sand King
- Ryze — Nature's Prophet
- miGGel — Leshrac

This is the best remaining late-series candidate once the false-start lobby
`6825615` is demoted and `6829300` is rejected as too incomplete.

### Non-primary leftover candidates

#### `6825615`

- **verdict:** `reject as primary finals map`
- **reason:** short false-start / recreated lobby immediately before the real
  Game 2; duration only about **30 seconds**.

#### `6829300`

- **verdict:** `reject`
- **reason:** too incomplete; only partial player overlap and insufficient map
  identity compared with the stronger finals cluster.

### Grand Final series verdict

- **Series verdict:** `confirmed`
- **Map-level state:**
  - Game 1 → `6820537` — `confirmed`
  - Game 2 → `6828244` — `probable` (high)
  - Game 3 → `6833198` — `probable` (very high)
  - Game 4 → `6835370` — `probable`

This is strong enough for working tournament reconstruction, with the remaining
uncertainty concentrated mostly around conservative labeling of Games 2–4 rather
than the overall series identity. The main nearby false-positive is now
understood to be the short-lived `6825615` restart lobby.

---

## Next recommended targets in The Defense Season 1 playoffs

Continue backward from the finals:

1. Lower Bracket Semifinal — Quantic vs Absolute Legends — 2012-02-25
2. Lower Bracket Quarterfinals
   - Quantic vs Western Wolves — 2012-02-23
   - Absolute Legends vs Dignitas — 2012-02-24
3. Lower Bracket Round 1
   - Western Wolves vs mouz — 2012-02-22
   - Dignitas vs Ariana Gaming — 2012-02-13

These should be evaluated with the same DB-first shortlist + evidence scoring +
optional VOD upgrade path.
