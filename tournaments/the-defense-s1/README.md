# The Defense Season 1 (2011–2012)

**Dates:** 2011-11-15 → 2012-03-04  
**Organizer:** joinDOTA  
**Prize Pool:** €10,000  
**Current status:** Grand Final identified; broader playoff reconstruction still in progress.

---

## Summary

This tournament is no longer just a generic "pending" recovery target.

The current evidence-backed conclusion is that the **Grand Final** was:

- **Natus Vincere vs Quantic Gaming**
- **2012-03-04 18:00 CET**
- **Liquipedia score:** Na`Vi 3:2 Quantic
- **Important format note:** Liquipedia states **Na`Vi started the series with a 1-0 lead as the upper-bracket winner**, so the public finals VOD set corresponds to **4 played maps, not 5**.

Detailed point-4 notes, shortlist reasoning, and candidate rejection logic live in
[`MATCH_IDENTIFICATION.md`](MATCH_IDENTIFICATION.md).

---

## Final standings

| Place | Team | Prize |
|---|---|---|
| 🥇 1st | **Natus Vincere** | €6,000 |
| 🥈 2nd | **Quantic Gaming** | €2,500 |
| 🥉 3rd | **Evil Geniuses** | €1,500 |

---

## Grand Final VOD set

- Game 1: <https://www.youtube.com/watch?v=FAntUgZWqFk>
- Game 2: <https://www.youtube.com/watch?v=dwwdYO289aw>
- Game 3: <https://www.youtube.com/watch?v=pAqADjcqskM>
- Game 4: <https://www.youtube.com/watch?v=-O_Tv3RxrRk>

These four videos align with the played-map count implied by the upper-bracket advantage note.

---

## Current map mapping

| Played map | Best DB candidate | Match time (UTC) | Confidence | Notes |
|---|---:|---|---|---|
| Game 1 | `6820537` | 2012-03-04 18:27:11Z | **Confirmed** | Strong roster cluster + VOD hero fit from extracted draft frame. |
| Game 2 | `6825615` | 2012-03-04 19:44:21Z | **Probable (high)** | Best fit for series order and recurring player cluster. |
| Game 3 | `6833198` | 2012-03-04 21:45:59Z | **Probable (very high)** | Excellent temporal fit; effectively near-confirmed. |
| Game 4 | `6835370` | 2012-03-04 22:15:19Z | **Probable** | Best remaining late-series candidate after duplicate/reject filtering. |

### Main recurring finals player anchors

- **Na`Vi side:** `Dendi`, `Puppey`, `XBOCT`
- **Quantic side:** `Link`, `MaNia`, `Ryze`, `miGGel`

That recurring cluster is stable across the meaningful same-day finals candidates and is the core reason the series mapping is accepted.

---

## Game-by-game evidence snapshot

### Game 1 → `6820537` — confirmed

Observed DB-side heroes include:

- Dendi — Leshrac
- Puppey — Enchantress
- XBOCT — Outworld Destroyer
- Link — Broodmother
- MaNia — Earthshaker
- Ryze — Windranger
- miGGel — Nature's Prophet

A frame extracted from the VOD at **22:52** shows a Captains Mode draft with clear **Na`Vi** and **Quantic** labels plus hero anchors consistent with the unknown slots of `6820537`.

### Game 2 → `6825615` — probable (high)

Observed DB-side heroes include:

- Dendi — Tiny
- Puppey — Storm Spirit
- XBOCT — Anti-Mage
- Link — Mirana
- MaNia — Windranger
- Ryze — Enchantress
- miGGel — Shadow Shaman

The closest nearby alternative is `6828244`, but it is currently treated as a likely remake / duplicate / non-primary capture rather than a distinct played finals map.

### Game 3 → `6833198` — probable (very high)

Observed DB-side heroes include:

- Dendi — Invoker
- Puppey — Enchantress
- XBOCT — Night Stalker
- Link — Mirana
- MaNia — Earthshaker
- Ryze — Vengeful Spirit
- miGGel — Nature's Prophet

This candidate fits both the chronology and the recurring finals player cluster extremely well.

### Game 4 → `6835370` — probable

Observed DB-side heroes include:

- Dendi — Windranger
- Puppey — Enchantress
- XBOCT — Riki
- Link — Anti-Mage
- MaNia — Sand King
- Ryze — Nature's Prophet
- miGGel — Leshrac

This is the best remaining late-series candidate once weaker leftovers are removed.

---

## Non-primary leftover candidates

| Match ID | Status | Why it is not the main mapping |
|---:|---|---|
| `6828244` | Possible, but rejected as primary | Near-duplicate timing and very similar player/hero profile to `6825615`; likely remake, rehost, or duplicate capture. |
| `6829300` | Rejected | Too incomplete; only partial player overlap and much weaker identity than the accepted finals cluster. |

---

## Working tournament verdict

- **Grand Final series verdict:** **confirmed**
- **Played-map count in VODs:** **4**
- **Current practical mapping:** strong enough for tournament reconstruction work
- **Remaining uncertainty:** mostly limited to conservative map-level labeling for Games 2–4, not the overall series identity

In practical terms: **the Grand Final is solved well enough to use in the archive now**.

---

## Next recovery targets

Continue backward from the finals:

1. **Upper Bracket Final** — EG vs Na`Vi — 2012-02-26
2. **Lower Bracket Semifinal** — Quantic vs Absolute Legends — 2012-02-25
3. **Lower Bracket Quarterfinals**
   - Quantic vs Western Wolves — 2012-02-23
   - Absolute Legends vs Dignitas — 2012-02-24
4. **Lower Bracket Round 1**
   - Western Wolves vs mouz — 2012-02-22
   - Dignitas vs Ariana Gaming — 2012-02-13

---

## Notes

This README is now the high-level tournament report.

For deeper evidence and candidate-by-candidate reasoning, see:

- [`MATCH_IDENTIFICATION.md`](MATCH_IDENTIFICATION.md)
- [`../../pipeline/practice_match_history_stage3/MATCH_IDENTIFICATION_SPEC.md`](../../pipeline/practice_match_history_stage3/MATCH_IDENTIFICATION_SPEC.md)
- `../../pipeline/practice_match_history_stage3/data/practice_match_history_stage3_summary.json`
