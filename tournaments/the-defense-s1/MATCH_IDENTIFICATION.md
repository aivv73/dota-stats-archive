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

- **leading candidate:** `6825615`
- **match_datetime_utc:** `2012-03-04T19:44:21Z`
- **verdict:** `probable` (high)

DB-side observed heroes:

- Dendi — Tiny
- Puppey — Storm Spirit
- XBOCT — Anti-Mage
- Link — Mirana
- MaNia — Windranger
- Ryze — Enchantress
- miGGel — Shadow Shaman

Alternative nearby candidate:

- `6828244` (`2012-03-04T20:18:57Z`)

`6828244` looks very close to `6825615` in both player composition and hero
profile and is currently treated as a likely remake / duplicate / non-primary
candidate rather than a distinct played finals map.

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

This is the best remaining late-series candidate once `6828244` is treated as a
likely duplicate/remake and `6829300` is rejected as too incomplete.

### Non-primary leftover candidates

#### `6828244`

- **verdict:** `possible` / `reject as primary finals map`
- **reason:** near-duplicate timing and very similar player / hero profile to
  `6825615`; likely remake, rehost, or duplicate capture.

#### `6829300`

- **verdict:** `reject`
- **reason:** too incomplete; only partial player overlap and insufficient map
  identity compared with the stronger finals cluster.

### Grand Final series verdict

- **Series verdict:** `confirmed`
- **Map-level state:**
  - Game 1 → `6820537` — `confirmed`
  - Game 2 → `6825615` — `probable` (high)
  - Game 3 → `6833198` — `probable` (very high)
  - Game 4 → `6835370` — `probable`

This is strong enough for working tournament reconstruction, with the remaining
uncertainty concentrated mostly around exact map-by-map disambiguation between
Games 2–4 and the handling of `6828244` as a duplicate/remake suspect.

---

## Next recommended targets in The Defense Season 1 playoffs

Continue backward from the finals:

1. Upper Bracket Final — EG vs Na`Vi — 2012-02-26
2. Lower Bracket Semifinal — Quantic vs Absolute Legends — 2012-02-25
3. Lower Bracket Quarterfinals
   - Quantic vs Western Wolves — 2012-02-23
   - Absolute Legends vs Dignitas — 2012-02-24
4. Lower Bracket Round 1
   - Western Wolves vs mouz — 2012-02-22
   - Dignitas vs Ariana Gaming — 2012-02-13

These should be evaluated with the same DB-first shortlist + evidence scoring +
optional VOD upgrade path.
