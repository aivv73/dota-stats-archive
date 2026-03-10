# The Defense Season 1 (2011-2012) - Ultimate Recovery Report

**Status**: Playoffs largely mapped from stage-3 DB ⚠️ (strong DB-first playoff reconstruction; some series still unresolved)
**Dates**: Nov 15, 2011 - Mar 4, 2012
**Format**: Group Stage #1 + Group Stage #2 + Double-Elimination Playoffs
**Prize Pool**: €10,000
**Organizer**: joinDOTA
**GitHub repo**: <https://github.com/aivv73/dota-stats-archive>

---

**Important note**:
This README now follows the **stage-3 DB-first reconstruction** and should be
preferred over older heuristic recovery notes. Where Liquipedia exposes direct
`matchid` anchors, those are used. Where it does not, mappings are derived from
stage-3 practice-match DB evidence only.

**Sources**:
- Liquipedia: <https://liquipedia.net/dota2/The_Defense/Season_1>
- Fandom: <https://dota2.fandom.com/wiki/The_Defense>
- Fandom squads: <https://dota2.fandom.com/wiki/The_Defense/Squads>
- Structured evidence log: [`MATCH_IDENTIFICATION.md`](MATCH_IDENTIFICATION.md)

**Team name canonicalization (Liquipedia/Fandom-style)**:
- **Natus Vincere** *(aka Na`Vi)*
- **Quantic Gaming** *(Team DD / dd.Dota signed by Quantic Gaming during the tournament; treat this as the same team / roster lineage for playoff reconstruction)*
- **Evil Geniuses** *(aka EG)*
- **Absolute Legends** *(aka AL; treat Natural 9 / later Absolute Legends as the same roster lineage in this tournament once the signing happens)*
- **mousesports** *(aka mouz)*
- **Western Wolves** *(Team Shakira lineage)*

**Liquipedia roster-lineage notes used for this tournament**:
1. **Fail Micro** renamed to **roots** in December 2011.
2. **New French Order** renamed to **Team Shakira** in December 2011.
3. The players of **The Elder Gods** left the organization and continued as **Poor Happy Guys** in December 2011.
4. **Mortal Teamwork** signed **Wild Honey Badgers** on December 5, 2011.
5. **mousesports** signed **EBIN** on December 5, 2011.
6. **LowLandLions** signed **Gods of DOTA** on December 15, 2011.
7. **It's Gosu eSports** signed **Team EZ Style** on December 19, 2011.
8. **Team Infused** signed **EmoCore** on December 21, 2011.
9. **Western Wolves** signed **Team Shakira** on December 21, 2011.
10. **Team Dignitas** signed **Poor Happy Guys** on December 23, 2011.
11. **Absolute Legends** signed **Natural 9** on January 21, 2012; for this tournament, treat early **Natural 9** and later **Absolute Legends** as the same competitive roster lineage.
12. **SK Gaming** dropped their squad, which continued as **Team DD**, on January 30, 2012.
13. **Ariana Gaming** signed **PANZER** on February 8, 2012.
14. **Quantic Gaming** signed **Team DD** on February 21, 2012.

## 🏆 Tournament Overview

The Defense Season 1 was one of the largest early Dota 2 online tournaments,
running from late 2011 into March 2012. The playoff bracket is now mostly
recoverable from the stage-3 Dotabuff-derived practice-match database, with the
best evidence concentrated in the later playoff rounds.

### Final Standings
| Place | Team | Prize |
|---|---|---|
| 🥇 1st | **Natus Vincere** | €6,000 |
| 🥈 2nd | **Quantic Gaming** | €2,500 |
| 🥉 3rd | **Evil Geniuses** | €1,500 |
| 4th | **Absolute Legends** | €0 |

---

## 📂 Recovered / Mapped Playoff Data

### 🏆 Grand Final: Natus Vincere vs Quantic Gaming (3-2)
*DB-first mapping with VOD support; Liquipedia notes Na`Vi started 1-0 as upper-bracket winner, so only 4 maps were played on stream.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6820537](https://www.dotabuff.com/matches/6820537)** | 2012-03-04 18:27:11Z | Game 1 | **Natus Vincere** | **Confirmed** | Strong roster cluster + VOD draft fit. |
| **[6828244](https://www.dotabuff.com/matches/6828244)** | 2012-03-04 20:18:57Z | Game 2 | **Quantic Gaming / played map** | **Probable (high)** | Real played map; `6825615` is the short false-start lobby before it. |
| **[6833198](https://www.dotabuff.com/matches/6833198)** | 2012-03-04 21:45:59Z | Game 3 | **Natus Vincere** | **Probable (very high)** | Excellent chronology + player-cluster fit. |
| **[6835370](https://www.dotabuff.com/matches/6835370)** | 2012-03-04 22:15:19Z | Game 4 | **Natus Vincere** | **Probable** | Best remaining late-series candidate. |

**Non-primary leftover candidates**:
- `6825615` — false-start / recreated lobby before the actual Game 2
- `6829300` — rejected as too incomplete

### 🥉 Lower Bracket Final: Evil Geniuses vs Quantic Gaming (0-2)
*Direct Liquipedia `matchid` anchors available.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6577972](https://www.dotabuff.com/matches/6577972)** | 2012-03-01 19:55:57Z | Game 1 | **Quantic Gaming** | **Confirmed** | Direct Liquipedia `matchid1`. |
| **[6581126](https://www.dotabuff.com/matches/6581126)** | 2012-03-01 20:51:25Z | Game 2 | **Quantic Gaming** | **Confirmed** | Direct Liquipedia `matchid2`. |

### 🔥 Upper Bracket Final: Evil Geniuses vs Natus Vincere (0-2)
*DB-first mapping; no direct Liquipedia `matchid` anchors exposed.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6311827](https://www.dotabuff.com/matches/6311827)** | 2012-02-26 18:47:12Z | Game 1 | **Natus Vincere** | **Probable (very high)** | Clean two-sided cluster: Dendi/Puppey/XBOCT vs DeMoN/Fear/Lacoste/MISERY/Maelk. |
| **[6316051](https://www.dotabuff.com/matches/6316051)** | 2012-02-26 19:54:25Z | Game 2 | **Natus Vincere** | **Probable (very high)** | Strong second-map timing and full roster coherence. |

**Non-primary nearby candidate**:
- `6313249` — likely false-start / recreated lobby / partial duplicate before the real Game 2

### Lower Bracket Semifinal: Quantic Gaming vs Absolute Legends (2-1)
*DB-only working mapping.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6236004](https://www.dotabuff.com/matches/6236004)** | 2012-02-25 19:52:01Z | Game 1 | **Absolute Legends** | **Probable** | Fits Quantic's single map loss in the series. |
| **[6239681](https://www.dotabuff.com/matches/6239681)** | 2012-02-25 20:43:50Z | Game 2 | **Quantic Gaming** | **Probable** | Strong second-map candidate. |
| **[6242438](https://www.dotabuff.com/matches/6242438)** | 2012-02-25 21:24:23Z | Game 3 | **Quantic Gaming** | **Probable (high)** | Clean deciding-map candidate. |

**Non-primary nearby candidates**:
- `6233532` — likely duplicate / restart-suspect of the eventual Game 1 pattern
- `6237104` — likely duplicate / restart-suspect of the eventual Game 2 pattern

### Lower Bracket Quarterfinal: Quantic Gaming vs Western Wolves (2-0)
*DB-first mapping.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6082849](https://www.dotabuff.com/matches/6082849)** | 2012-02-23 19:48:13Z | Game 1 | **Quantic Gaming** | **Probable (very high)** | Strong two-sided roster cluster. |
| **[6086876](https://www.dotabuff.com/matches/6086876)** | 2012-02-23 21:00:05Z | Game 2 | **Quantic Gaming** | **Probable (very high)** | Clean sweep continuation. |

### Lower Bracket Quarterfinal: Absolute Legends vs Dignitas (2-1)
*DB-first mapping with one earlier partial non-primary candidate.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6157981](https://www.dotabuff.com/matches/6157981)** | 2012-02-24 20:45:51Z | Game 1 | **Dignitas** | **Probable** | Earliest strong two-sided map from the confirmed 3-map cluster. |
| **[6162320](https://www.dotabuff.com/matches/6162320)** | 2012-02-24 21:48:26Z | Game 2 | **Absolute Legends** | **Probable (high)** | Clean comeback map candidate. |
| **[6166059](https://www.dotabuff.com/matches/6166059)** | 2012-02-24 22:51:30Z | Game 3 | **Absolute Legends** | **Probable (high)** | Best deciding-map candidate in the cluster. |

**Non-primary nearby candidate**:
- `6155477` — early partial same-day candidate, but not needed for the final 3-map series mapping

### Lower Bracket Round 1: Western Wolves vs mousesports (2-0)
*DB-first mapping.*

| Match ID | Time (UTC) | Game | Winner | Confidence | Note |
|---|---|---|---|---|---|
| **[6016937](https://www.dotabuff.com/matches/6016937)** | 2012-02-22 21:04:21Z | Game 1 | **Western Wolves** | **Probable (very high)** | Stable Western Wolves vs mouz cluster. |
| **[6020611](https://www.dotabuff.com/matches/6020611)** | 2012-02-22 22:05:52Z | Game 2 | **Western Wolves** | **Probable (very high)** | Strong sweep continuation. |

---

## 🚧 Unresolved / Partial Playoff Series (DB-only)

These should **not** be treated as solved yet from the current stage-3 DB alone.

### Upper Bracket Semifinal: Natus Vincere vs Absolute Legends (2-0)
- visible AL-side loss pair: `5499848`, `5501496`
- current issue: Na`Vi-side support is missing in the same DB rows
- status: **partial / unresolved**

### Upper Bracket Semifinal: Team DD vs Evil Geniuses (0-2)
- strong candidate cluster includes: `5639961`
- current issue: one real played map is visible, but the second map is not yet cleanly pinned from DB alone
- status: **partial / unresolved**

### Lower Bracket Round 1: Dignitas vs Ariana Gaming (2-1)
- visible public cross-team candidates: `5337494`, `5400314`
- current reading:
  - `5337494` — probable Ariana win map
  - `5400314` — probable Dignitas win map
- current issue: the deciding third map is still not visible in public DB coverage
- status: **partial / unresolved (2 visible maps, 1 missing)**

---

## 🎮 Group Stage #1 — Group A (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #1 / Group A match. This block is currently very
mixed in quality: a few **SK/DD** matchups are usable, but several rows remain
one-sided or weak because **roots**, **MYM**, and **Global Domination Time** do
not expose consistently complete public Dotabuff coverage.

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2011-11-16 | SK/DD vs roots | **[249896](https://www.dotabuff.com/matches/249896)** | **Probable lead** | Strong SK/DD-side cluster (`AngeL`, `Link`, `Ryze`, `miGGel`); roots side still missing. |
| 2011-11-19 | MYM vs mTw | **No confident public two-sided candidate yet** | **Unresolved** | mTw side is visible repeatedly, but MYM side is not cleanly present in the same rows. |
| 2011-11-19 | Global Domination Time vs mTw | **[331543](https://www.dotabuff.com/matches/331543)** | **Possible / probable lead** | `Waytosexy` + 4 mTw anchors. |
| 2011-11-20 | Problem??? vs Global Domination Time | **No confident public two-sided candidate yet** | **Unresolved** | Problem??? and GDT appear in the time window, but not in a convincing shared candidate. |
| 2011-12-18 | SK/DD vs mTw | **[1827094](https://www.dotabuff.com/matches/1827094)** | **Probable lead** | `AngeL`, `Ryze` + 3 mTw anchors. |
| 2011-12-18 | Global Domination Time vs roots | **No confident public two-sided candidate yet** | **Unresolved** | GDT side is visible, but roots does not appear cleanly in the same row. |
| 2011-12-21 | Problem??? vs roots | **No confident public two-sided candidate yet** | **Unresolved** | Problem??? side visible; roots remains effectively absent from the public DB slice. |
| 2011-12-21 | Global Domination Time vs MYM | **No confident public two-sided candidate yet** | **Unresolved** | GDT side is visible, but MYM is not cleanly present in the same rows. |
| 2011-12-28 | SK/DD vs MYM | **No confident public two-sided candidate yet** | **Unresolved** | SK/DD side visible, but MYM remains weak in public DB. |
| 2011-12-29 | SK/DD vs Global Domination Time | **[2457123](https://www.dotabuff.com/matches/2457123)** | **Possible / probable lead** | `Sneyking`, `Waytosexy` visible against partial DD-side coverage. |
| 2011-12-29 | Problem??? vs MYM | **No confident public two-sided candidate yet** | **Unresolved** | Problem??? side visible, but MYM remains weak in public DB coverage. |
| 2011-12-30 | Problem??? vs SK/DD | **[2511041](https://www.dotabuff.com/matches/2511041)** | **Possible / probable lead** | `Buugi`, `Lapiz`, `noertti` + `MaNia`; still partial, but best visible lead. |
| 2012-01-05 | Problem??? vs mTw | **No confident public two-sided candidate yet** | **Unresolved** | mTw is visible strongly, but Problem??? does not cleanly join the same row. |
| 2012-01-06 | MYM vs roots | **No confident public two-sided candidate yet** | **Unresolved** | MYM only weakly visible; roots effectively absent. |
| 2012-01-07 | Global Domination Time vs SK/DD | **[2903056](https://www.dotabuff.com/matches/2903056)** | **Probable** | `Sneyking`, `Waytosexy` + `AngeL`, `Link`, `Ryze`, `miGGel`. |
| 2012-01-12 | Tiebreaker: SK/DD vs Problem??? | **No playable match expected** | **Forfeit** | Liquipedia marks this tiebreaker as an FF result. |

---

## 🎮 Group Stage #1 — Group B (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #1 / Group B match. This remains the
**weakest** group-stage block overall, but it was re-checked after newer player
ID work and is now somewhat better in the **MUFC**, **J4TT**, and partial
**Natural 9** directions.

For this tournament context, keep in mind:
- **Natural 9 / later Absolute Legends** should be treated as the same roster
  lineage at the tournament-note level
- **MUFC** and **youBoat** remain especially patchy in public DB visibility
- several late-December rows around Na`Vi overlap in time and remain harder to
  disambiguate cleanly than the stronger playoff cases
- the strongest upgrades after the new ID pass are **MUFC vs J4TT**,
  **Natural 9 vs J4TT**, and parts of the **Na`Vi vs J4TT** window

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2011-11-20 | Natural 9 vs youBoat | **No confident public two-sided candidate yet** | **Unresolved** | youBoat is only weakly visible through `Fishbone`; Natural 9 side is missing in the same rows. |
| 2011-12-10 | MUFC vs Just 4 the Tournament | **[1358407](https://www.dotabuff.com/matches/1358407)** | **Probable (high)** | 4 MUFC anchors (`Net`, `Sharky`, `TooFuckingGood`, `kYxY`) + 3 J4TT anchors (`Kev-`, `moods`, `rmN-`). |
| 2011-12-18 | Just 4 the Tournament vs youBoat | **[1835155](https://www.dotabuff.com/matches/1835155)** | **Possible lead** | J4TT-side anchors visible; youBoat side still missing. |
| 2011-12-18 | LowLandLions vs Just 4 the Tournament | **[1835155](https://www.dotabuff.com/matches/1835155)** | **Possible / probable lead** | J4TT anchors visible, but LowLandLions still does not appear cleanly in the same row. |
| 2011-12-20 | Na`Vi vs Natural 9 | **[1919317](https://www.dotabuff.com/matches/1919317)** | **Probable lead** | Clear Na`Vi-side anchor set (`Dendi`, `Puppey`, `XBOCT`), but Natural 9 side is not visible in the same row. |
| 2011-12-27 | MUFC vs youBoat | **No playable match expected** | **Forfeit** | Liquipedia marks this as an FF result. |
| 2011-12-27 | Na`Vi vs MUFC | **No playable match expected** | **Forfeit** | Liquipedia marks this as an FF result. |
| 2011-12-27 | MUFC vs Natural 9 | **No playable match expected** | **Forfeit** | Liquipedia marks this as an FF result. |
| 2011-12-27 | LowLandLions vs MUFC | **No playable match expected** | **Forfeit** | Liquipedia marks this as an FF result. |
| 2011-12-27 | LowLandLions vs Na`Vi | **[2342028](https://www.dotabuff.com/matches/2342028)** | **Probable** | `Dutch_Freak` + `Dendi`, `Puppey`, `XBOCT`. |
| 2011-12-28 | Na`Vi vs youBoat | **No confident public two-sided candidate yet** | **Unresolved** | Na`Vi-side rows exist, but the youBoat side is not cleanly visible in the same candidate. |
| 2012-01-08 | LowLandLions vs youBoat | **No confident public two-sided candidate yet** | **Unresolved** | `Dutch_Freak` and `Fishbone` appear separately in the time window, but no convincing combined row is visible yet. |
| 2012-01-08 | Natural 9 vs Just 4 the Tournament | **[2954196](https://www.dotabuff.com/matches/2954196)** | **Possible / probable lead** | Natural 9-side anchors (`Net`, `Sharky`, `TooFuckingGood`) are visible more clearly after the MUFC/N9 ID pass; J4TT side is still missing in the same row. |
| 2012-01-08 | LowLandLions vs Natural 9 | **No confident public two-sided candidate yet** | **Unresolved** | Natural 9 side is visible, but LowLandLions side is not cleanly present in the same candidate. |
| 2012-01-08 | Na`Vi vs Just 4 the Tournament | **[2966518](https://www.dotabuff.com/matches/2966518)** | **Possible / probable lead** | `Dendi`, `Puppey` + `Fire`, `Kev-`, `moods`; this window now reads a bit better after the J4TT ID updates. |
| 2012-01-10 | Tiebreaker: Na`Vi vs Natural 9 | **[3046039](https://www.dotabuff.com/matches/3046039)** | **Probable lead** | Strong Na`Vi-side anchor set; Natural 9 side remains weak in public DB. |
| 2012-01-15 | Tiebreaker: youBoat vs Just 4 the Tournament | **[3384748](https://www.dotabuff.com/matches/3384748)** | **Possible lead** | Full J4TT cluster visible; youBoat side still mostly absent in the same row. |

---

## 🎮 Group Stage #1 — Group C (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #1 / Group C match. This group is trickier than
later stages because it mixes several **historical roster-lineage names**
(especially **The Elder Gods / Team Dignitas**, **Team EZ Style / It's Gosu
 eSports**, and **New French Order / Team Shakira**), and several opponents are
only weakly visible in public Dotabuff leakage.

Main result of the re-check after newer player IDs:
- **EHOME** rows now read more cleanly through `QQQ` + `PCT`
- **Team EZ Style / It's Gosu** rows remain stable and useful
- **Fnatic vs Shakira** and **Dignitas/TeG vs Fnatic/Shakira** remain the
  strongest Group C mappings
- **PAORS** still remains the weakest roster in public DB coverage

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2011-11-15 | TeG vs PAORS | **[236008](https://www.dotabuff.com/matches/236008)** | **Possible / probable lead** | Strong TeG-side cluster; PAORS is not clearly visible in the public DB slice. |
| 2011-11-15 | Team EZ Style vs New French Order | **[236375](https://www.dotabuff.com/matches/236375)** | **Probable (high)** | 3 Team EZ Style anchors + 4 New French Order/Shakira anchors. |
| 2011-11-19 | TeG vs EHOME | **[328883](https://www.dotabuff.com/matches/328883)** | **Probable (high)** | 4 TeG anchors + 2 EHOME anchors (`PCT`, `QQQ`). |
| 2011-11-20 | EHOME vs Fnatic | **[362106](https://www.dotabuff.com/matches/362106)** | **Probable (high)** | 2 EHOME anchors (`PCT`, `QQQ`) + 4 Fnatic anchors. |
| 2011-12-03 | Team EZ Style vs PAORS | **[927196](https://www.dotabuff.com/matches/927196)** | **Possible lead** | Strong Team EZ Style side; PAORS still not clearly visible in the public DB slice. |
| 2011-12-13 | Team EZ Style vs Fnatic | **[1573511](https://www.dotabuff.com/matches/1573511)** | **Probable (high)** | 3 Team EZ Style anchors + 4 Fnatic anchors. |
| 2011-12-17 | EHOME vs PAORS | **No playable match expected** | **Forfeit** | Liquipedia marks this as a forfeit result. |
| 2011-12-17 | EHOME vs New French Order / Team Shakira | **No playable match expected** | **Forfeit** | Liquipedia marks this as a forfeit result. |
| 2011-12-17 | Team EZ Style vs EHOME | **No playable match expected** | **Forfeit** | Liquipedia marks this as a forfeit result. |
| 2012-01-03 | Fnatic vs PAORS | **[2710262](https://www.dotabuff.com/matches/2710262)** | **Possible lead** | Strong Fnatic-side cluster; PAORS remains effectively invisible in public DB. |
| 2012-01-04 | Dignitas/TeG vs Shakira | **[2753030](https://www.dotabuff.com/matches/2753030)** | **Probable (high)** | 4 Dignitas/TeG anchors + 4 Shakira anchors. |
| 2012-01-04 | It's Gosu / Team EZ Style vs Dignitas/TeG | **[2756024](https://www.dotabuff.com/matches/2756024)** | **Probable (high)** | 3 Team EZ Style anchors + 4 Dignitas/TeG anchors. |
| 2012-01-05 | Dignitas/TeG vs Fnatic | **[2794233](https://www.dotabuff.com/matches/2794233)** | **Probable (high)** | 4 Dignitas/TeG anchors + 4 Fnatic anchors. |
| 2012-01-05 | Shakira vs PAORS | **[2799894](https://www.dotabuff.com/matches/2799894)** | **Possible lead** | Strong Shakira-side cluster; PAORS is still not clearly visible. |
| 2012-01-08 | Fnatic vs Shakira | **[2961123](https://www.dotabuff.com/matches/2961123)** | **Probable (high)** | 4 Fnatic anchors + 4 Shakira anchors. |

---

## 🎮 Group Stage #1 — Group D (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #1 / Group D match. Compared with the later
playoff work, coverage here is more uneven: some matchups are strong and
naturally two-sided, while others are still visible mostly through one team's
public Dotabuff leakage.

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2011-11-17 | Storm Games Clan vs mousesports | **[267402](https://www.dotabuff.com/matches/267402)** | **Possible / probable lead** | `craNich` + 4 mouz anchors. |
| 2011-11-20 | Team Infused vs Panzer | **[366309](https://www.dotabuff.com/matches/366309)** | **Probable (high)** | 4 Infused anchors + 3 Panzer anchors. |
| 2011-12-18 | Storm Games Clan vs Panzer | **[1821506](https://www.dotabuff.com/matches/1821506)** | **Probable** | `craNich` + 4 Panzer anchors. |
| 2011-12-22 | MiTH.Trust vs Panzer | **[2053488](https://www.dotabuff.com/matches/2053488)** | **Probable (high)** | 3 MiTH.Trust anchors + 4 Panzer anchors. |
| 2011-12-22 | Evil Geniuses vs Storm Games Clan | **[2058934](https://www.dotabuff.com/matches/2058934)** | **Probable** | 3 EG anchors + `craNich`. |
| 2011-12-22 | Evil Geniuses vs mousesports | **[2062467](https://www.dotabuff.com/matches/2062467)** | **Probable** | 3 EG anchors + 3 mouz anchors. |
| 2011-12-23 | mousesports vs Team Infused | **[2111635](https://www.dotabuff.com/matches/2111635)** | **Probable (high)** | 4 mouz anchors + 4 Infused anchors. |
| 2011-12-28 | Team Infused vs MiTH.Trust | **[2395891](https://www.dotabuff.com/matches/2395891)** | **Probable** | 4 Infused anchors + 2 MiTH.Trust anchors. |
| 2011-12-28 | Team Infused vs Evil Geniuses | **[2399800](https://www.dotabuff.com/matches/2399800)** | **Probable (high)** | 4 Infused anchors + 3 EG anchors. |
| 2011-12-29 | MiTH.Trust vs Storm Games Clan | **[2448812](https://www.dotabuff.com/matches/2448812)** | **Possible / probable lead** | 2 MiTH.Trust anchors + `craNich`. |
| 2012-01-04 | Evil Geniuses vs MiTH.Trust | **[2749538](https://www.dotabuff.com/matches/2749538)** | **Possible / probable lead** | 3 EG anchors + `LaKelz`. |
| 2012-01-05 | Evil Geniuses vs Panzer | **[2803289](https://www.dotabuff.com/matches/2803289)** | **Probable (high)** | 3 EG anchors + full 5-player Panzer cluster. |
| 2012-01-07 | Panzer vs mousesports | **[2899237](https://www.dotabuff.com/matches/2899237)** | **Probable (high)** | Full 5-player Panzer cluster + 4 mouz anchors. |
| 2012-01-07 | Team Infused vs Storm Games Clan | **[2907652](https://www.dotabuff.com/matches/2907652)** | **Possible / probable lead** | 4 Infused anchors + `craNich`. |
| 2012-01-08 | MiTH.Trust vs mousesports | **[2952033](https://www.dotabuff.com/matches/2952033)** | **Probable** | 3 MiTH.Trust anchors + 4 mouz anchors. |
| 2012-01-12 | Tiebreaker: Panzer vs Evil Geniuses | **[3155842](https://www.dotabuff.com/matches/3155842)** | **Probable (high)** | Full 5-player Panzer cluster + 4 EG anchors. |

---

## 🎮 Group Stage #2 — Group 1 (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #2 / Group 1 match. This is still a working
shortlist, not a fully finalized group-stage reconstruction, but it was
re-checked again after the updated stage-2/stage-3 passes with newly supplied
player IDs.

Main result of the re-check:
- the shortlist itself still holds up
- **Just 4 the Tournament** matchups became much stronger
- several rows that previously had only 2-3 visible anchors now show 4-5 player
  overlaps on each side
- the weakest rows are still the ones involving **mTw**, but even there the
  shape is now clearer than before

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2012-01-15 | Team DD vs Absolute Legends | **[3380274](https://www.dotabuff.com/matches/3380274)** | **Probable (high)** | Strong two-sided overlap: 4 DD + 4 AL anchors. |
| 2012-01-17 | mTw vs Panzer | **[3499689](https://www.dotabuff.com/matches/3499689)** | **Probable** | 4 Panzer anchors + `syndereN`; still one-sided on the mTw side. |
| 2012-01-18 | Western Wolves vs Just 4 the Tournament | **[3557757](https://www.dotabuff.com/matches/3557757)** | **Probable (very high)** | 4 Western Wolves anchors + full 5-player J4TT cluster (`Fire`, `Kebap`, `Kev-`, `moods`, `rmN-`). |
| 2012-01-21 | mTw vs Just 4 the Tournament | **[3784147](https://www.dotabuff.com/matches/3784147)** | **Probable (very high)** | 4 mTw anchors + 4 J4TT anchors (`Fire`, `Kebap`, `Kev-`, `rmN-`). |
| 2012-01-24 | Team DD vs Just 4 the Tournament | **[3977993](https://www.dotabuff.com/matches/3977993)** | **Probable (very high)** | Full 5-player DD cluster + 4 J4TT anchors (`Fire`, `Kebap`, `Kev-`, `rmN-`). |
| 2012-01-24 | Panzer vs Team DD | **[3982285](https://www.dotabuff.com/matches/3982285)** | **Probable (high)** | Strong two-sided overlap: 4 Panzer + 4 DD anchors. |
| 2012-01-29 | Panzer vs Just 4 the Tournament | **[4350955](https://www.dotabuff.com/matches/4350955)** | **Probable (very high)** | 5 Panzer anchors + 5 J4TT anchors. |
| 2012-01-31 | Western Wolves vs Panzer | **[4497897](https://www.dotabuff.com/matches/4497897)** | **Probable (very high)** | Strong two-sided overlap: 5 Western Wolves + 4 Panzer anchors. |
| 2012-02-01 | mTw vs Team DD | **[4557075](https://www.dotabuff.com/matches/4557075)** | **Probable lead** | 4 DD anchors + `syndereN`; still limited on the mTw side. |
| 2012-02-01 | mTw vs Western Wolves | **[4561283](https://www.dotabuff.com/matches/4561283)** | **Probable lead** | 4 Western Wolves anchors + `syndereN`; still limited on the mTw side. |
| 2012-02-02 | Absolute Legends vs Panzer | **[4618477](https://www.dotabuff.com/matches/4618477)** | **Probable (very high)** | Strong two-sided overlap: 5 AL + 4 Panzer anchors. |
| 2012-02-02 | mTw vs Absolute Legends | **[4621583](https://www.dotabuff.com/matches/4621583)** | **Probable lead** | 5 AL anchors + `syndereN`; still limited on the mTw side. |
| 2012-02-02 | Western Wolves vs Team DD | **[4629510](https://www.dotabuff.com/matches/4629510)** | **Probable (high)** | Strong two-sided overlap: 4 Western Wolves + 4 DD anchors. |
| 2012-02-04 | Absolute Legends vs Just 4 the Tournament | **[4758228](https://www.dotabuff.com/matches/4758228)** | **Probable (high)** | 5 AL anchors + 3 J4TT anchors (`Fire`, `Kebap`, `rmN-`). |
| 2012-02-04 | Western Wolves vs Absolute Legends | **[4762363](https://www.dotabuff.com/matches/4762363)** | **Probable (high)** | Strong two-sided overlap: 4 Western Wolves + 5 AL anchors. |

---

## 🎮 Group Stage #2 — Group 2 (DB-first shortlist)

The following table records the current **best stage-3 DB candidate** for each
Liquipedia-listed Group Stage #2 / Group 2 match. This block was also re-checked
against the refreshed stage-3 DB after the new manual account-ID pass.

Main result of the re-check:
- the shortlist itself still holds up
- **Dignitas** matchups improved the most, because `freezer` and `S0ny` now
  join `ComeWithMe` / `Zizou` in visible DB rows
- **Fnatic** rows also improved slightly because `BAJA-` is now recognized in
  the DB alongside `Mitch`, `g0g1`, and `grizine`
- the weakest rows are still the ones where one side remains only partially
  visible in public Dotabuff coverage

| Date (UTC) | Matchup | Best candidate | Confidence | Note |
|---|---|---:|---|---|
| 2012-01-16 | Team Dignitas vs Problem??? | **[3444977](https://www.dotabuff.com/matches/3444977)** | **Probable (high)** | 3 Dignitas anchors (`freezer`, `S0ny`, `Zizou`) + full 5-player Problem??? cluster. |
| 2012-01-17 | Evil Geniuses vs Fnatic | **[3503635](https://www.dotabuff.com/matches/3503635)** | **Probable (high)** | Strong two-sided overlap: 4 EG + 3 Fnatic anchors. |
| 2012-01-18 | Natus Vincere vs mousesports | **[3553764](https://www.dotabuff.com/matches/3553764)** | **Probable (high)** | 3 Na`Vi anchors + 4 mouz anchors. |
| 2012-01-20 | Fnatic vs Problem??? | **[3695875](https://www.dotabuff.com/matches/3695875)** | **Probable** | 3 Fnatic anchors + `Buugi/Lapiz`. |
| 2012-01-21 | Team Dignitas vs mousesports | **[3788916](https://www.dotabuff.com/matches/3788916)** | **Probable (high)** | 3 Dignitas anchors (`freezer`, `S0ny`, `Zizou`) + full 5-player mouz cluster. |
| 2012-01-22 | Evil Geniuses vs Natus Vincere | **[3854754](https://www.dotabuff.com/matches/3854754)** | **Probable (high)** | 4 EG anchors + 3 Na`Vi anchors. |
| 2012-01-23 | Evil Geniuses vs mousesports | **[3925215](https://www.dotabuff.com/matches/3925215)** | **Probable (high)** | Strong two-sided overlap: 4 EG + 4 mouz anchors. |
| 2012-01-24 | Problem??? vs Natus Vincere | **[3973228](https://www.dotabuff.com/matches/3973228)** | **Probable** | `Buugi/Lapiz` + 3 Na`Vi anchors. |
| 2012-01-26 | Team Dignitas vs Fnatic | **[4091042](https://www.dotabuff.com/matches/4091042)** | **Probable (high)** | 3 Dignitas anchors (`freezer`, `S0ny`, `ComeWithMe`) + 4 Fnatic anchors (`BAJA-`, `Mitch`, `g0g1`, `grizine`). |
| 2012-01-27 | Problem??? vs mousesports | **[4181631](https://www.dotabuff.com/matches/4181631)** | **Probable** | `Buugi/Lapiz` + 4 mouz anchors. |
| 2012-01-29 | Natus Vincere vs Fnatic | **[4346328](https://www.dotabuff.com/matches/4346328)** | **Probable** | 3 Na`Vi anchors + 3 Fnatic anchors. |
| 2012-01-31 | Team Dignitas vs Evil Geniuses | **[4492245](https://www.dotabuff.com/matches/4492245)** | **Probable (high)** | 3 Dignitas anchors (`freezer`, `ComeWithMe`, `Zizou`) + 4 EG anchors. |
| 2012-02-03 | Team Dignitas vs Natus Vincere | **[4693642](https://www.dotabuff.com/matches/4693642)** | **Probable (high)** | 3 Dignitas anchors (`freezer`, `ComeWithMe`, `Zizou`) + 3 Na`Vi anchors. |
| 2012-02-03 | Evil Geniuses vs Problem??? | **[4698712](https://www.dotabuff.com/matches/4698712)** | **Probable** | 4 EG anchors + `Buugi/Lapiz`. |
| 2012-02-08 | Fnatic vs mousesports | **[5056156](https://www.dotabuff.com/matches/5056156)** | **Probable (high)** | 3 Fnatic anchors + 4 mouz anchors. |

---

## 👥 Verified Player IDs (playoff-relevant teams)

> Canonical labels follow Liquipedia/Fandom-style naming where possible. A few notable Dotabuff-era aliases are preserved in parentheses.

**Natus Vincere**
- **Dendi**: `70388657`
- **XBOCT**: `89625472`
- **Puppey**: `87278757`
- **LighTofHeaveN** *(L)*: `89326318`
- **ARS-ART** *(© / canonical handle often normalized as Smile elsewhere)*: `89713365`

**Quantic Gaming** *(same competitive roster lineage as Team DD / dd.Dota after the signing during the tournament)*
- **Link**: `20237599`
- **MaNia** *(Kalderoun)*: `85783343`
- **AngeL**: `8517055`
- **Ryze**: `26682464`
- **miGGel**: `74432222`

**Evil Geniuses**
- **DeMoN**: `85805514`
- **Fear**: `87177591`
- **MISERY**: `87382579`
- **Maelk**: `59457413`
- **Lacoste**: `87264171`

**Absolute Legends**
- **B**: `29904110`
- **Godot**: `34726076`
- **Snoopy**: `87673729`
- **shatan**: `34547465`
- **xMusiCa**: `89001276`

**Western Wolves**
- **Sockshka** *(causalité)*: `16769223`
- **Funzii** *(TMTC)*: `29337472`
- **7ckngMad / Ceb**: `88271237`
- **Dhany**: `24106261` *(historical note: user reports this account is actually leaf's main account; Dhany may have played on it / used it as a stand-in account in this tournament context)*
- **Ph0eNiiX / Ph0enix**: `87291311`

**LowLandLions**
- **Evilsnear**: `86736858`
- **Muga_Riptide**: `86739254`
- **Dutch_Freak**: `86767617`

**MUFC**
- **Net**: `89249333`
- **Ling**: `89268488`
- **kYxY**: `91644707`
- **Sharky**: `89251386`
- **TooFuckingGood**: `91143798`

**Global Domination Time**
- **Sneyking**: `10366616`
- **waytosexy**: `38515149`

**Dignitas**
- **freezer**: `39226957`
- **ComeWithMe**: `85375207`
- **S0ny** *(Ro-Coco)*: `45316897`
- **Zizou** *(10kabs5kdota)*: `27005611`
- **Ly0n** *(d.intel Ly0n)*: `97170605`

**Team Infused**
- **Wagamama**: `32995405`
- **Mini**: `34128052`
- **Fishbone**: `88522876`
- **Reesion**: `40602549`
- **EGM**: `3916428`

**Storm Games Clan**
- **craNich**: `7932121`

**It's Gosu eSports / Team EZ Style**
- **1437**: `87196890`
- **BuLba**: `30237211`
- **UNiVeRsE**: `87276347`
- **inphinity**: `3246092`
- **PowerNet**: `14429114`

**EHOME**
- **MMY!**: `89407113`
- **QQQ**: `89399750`
- **PCT**: `89427480`
- **LaNm**: `89423756`
- **KingJ**: `89230834`

**PAORS**
- **Matori**: `86742226`
- **Tzar**: `32895399`

**MiTH.Trust**
- **TnK**: `45614257`
- **LaKelz**: `91191397`
- **aabBAA**: `91191651`

**Problem???**
- **Buugi**: `24009418`
- **noertti**: `54662003`
- **marge**: `47294378`
- **Lapiz**: `4330802`
- **Laged**: `41246809`

**Fnatic**
- **Baja**: `58675374`
- **grizine**: `90199779`
- **g0g1**: `43401453`
- **Mitch**: `90180366`
- **Buktop**: `90200219` *(probable stand-in / replacement account for Andre in this tournament context; keep separate from Andre unless confirmed identical)*

**Just 4 the Tournament**
- **Kev-**: `87409544`
- **rmN-** *(`01`)*: `87197791`
- **Fire**: `11603325`
- **moods** *(mds)*: `88282736`
- **Kebap** *(RainerZufall)*: `34552614`

**Mortal Teamwork**
- **Grunt**: `64048945`
- **syndereN**: `4281729`
- **Pepp3** *(pepp)*: `17374868`
- **Kuronity**: `236517`
- **Matrim** *(Pirate#2)*: `75555146`

**mousesports**
- **SingSing**: `19757254`
- **SexyBamboe**: `20321748`
- **Rexi**: `4211480`
- **DeMeNt**: `86561084`
- **Trixi** *(probable `black beatles` account; needs confirmation because this account has conflicting older attribution elsewhere)*: `90793520`

**Ariana Gaming**
- **Alex**: `37105332`
- **leaf**: `24106261` *(confirmed by user as leaf's account; if Dhany appears on this account in some historical rows, treat that as a likely stand-in / account-sharing artifact rather than the primary identity)*
- **KuroKy**: `82262664`
- **Saga** *(seen as `sezer salad`, `flankin'`)*: `83431381`
- **paS** *(`-----`)*: `31078647`

---

## 📺 Video Archive (known + discovered archive links)

> Titles below are preserved close to the uploader naming. Some older uploads are clearly relevant to The Defense Season 1 but may use slightly inaccurate round labels or legacy naming.

| Match | URL | Description |
|---|---|---|
| **Lower Bracket Final G1** | <https://www.youtube.com/watch?v=yQLtblCGPcQ> | EG vs Quantic (existing known link) |
| **Lower Bracket Final G2** | <https://www.youtube.com/watch?v=FYuTjiwpzPE> | EG vs Quantic (existing known link) |
| **Lower Bracket Final G1 (alt upload)** | <https://www.youtube.com/watch?v=ZOvox4ad228> | joinDOTA upload: "The Defense - Evil Geniuses vs Quantic Gaming - LB Playoffs - Game 1" |
| **Lower Bracket Final G2 (alt upload)** | <https://www.youtube.com/watch?v=qqLCQMi8MMw> | joinDOTA upload: "The Defense - Evil Geniuses vs Quantic Gaming - LB Playoffs - Game 2" |
| **Grand Final G1** | <https://www.youtube.com/watch?v=FAntUgZWqFk> | Na`Vi vs Quantic (existing known link) |
| **Grand Final G2** | <https://www.youtube.com/watch?v=dwwdYO289aw> | Na`Vi vs Quantic (existing known link) |
| **Grand Final G3** | <https://www.youtube.com/watch?v=pAqADjcqskM> | Na`Vi vs Quantic (existing known link) |
| **Grand Final G4** | <https://www.youtube.com/watch?v=-O_Tv3RxrRk> | Na`Vi vs Quantic (existing known link) |
| **Grand Final highlights** | <https://www.youtube.com/watch?v=TH4enJJVUXQ> | NAVI upload: "Na`Vi.DotA Highlights @ The Defense Grand Finals" |
| **Grand Final G2 (alt cast/upload)** | <https://www.youtube.com/watch?v=5fszePXnw48> | LuminousInverse upload: "Navi vs Quantic Gaming (Defense Final) 2" |
| **Grand Final G4 (alt cast/upload)** | <https://www.youtube.com/watch?v=t8z6AC1MZ6M> | LuminousInverse upload: "Navi vs Quantic Gaming (Defense Final) 4" |
| **Upper Bracket Semifinal G1?** | <https://www.youtube.com/watch?v=Qcmm76X6XeI> | cyberarenaTV upload: "DD vs EG @The Defense 1/2 WB final #1" — likely Team DD vs EG Game 1 |
| **Upper Bracket Semifinal G2** | <https://www.youtube.com/watch?v=mkRM7TCzf9E> | joinDOTA upload: "EG vs DD - The Defense Semi Final WB - Game 2" |
| **Lower Bracket Round 1 G2** | <https://www.youtube.com/watch?v=haRYaED9kPI> | cyberarenaTV upload: "WW vs Mouz @ The Defence LB Round 1 Game 2" |
| **Lower Bracket Quarterfinal AL vs Dignitas G1** | <https://www.youtube.com/watch?v=w5HKjgqbCoA> | joinDOTA upload: title says "LB Semi Final - Game 1", but matchup fits AL vs Dignitas playoff series |
| **Lower Bracket Quarterfinal AL vs Dignitas G2 / Part 2** | <https://www.youtube.com/watch?v=9QtynECXw0U> | Maelstorm One upload: "The Defence. Lbr Ro2. Dignitas vs Al.Part 2" |
| **Lower Bracket Quarterfinal AL vs Dignitas G3** | <https://www.youtube.com/watch?v=ajPZP0jfKVo> | joinDOTA upload: title says "LB Semi Final - Game 3", but matchup fits AL vs Dignitas playoff series |
| **Lower Bracket Semifinal Quantic vs AL G1** | <https://www.youtube.com/watch?v=Q987Sq1FD3s> | joinDOTA upload: title says "LB Final 1st - Game 1" |
| **Lower Bracket Semifinal Quantic vs AL G2** | <https://www.youtube.com/watch?v=l3Mx_zg30pc> | joinDOTA upload: title says "LB Final 1st - Game 2" |
| **Lower Bracket Semifinal Quantic vs AL G3** | <https://www.youtube.com/watch?v=GNuAWJOVbUE> | joinDOTA upload: title says "LB Final 1st - Game 3" |
| **GS2 Group 1 — Team DD vs Absolute Legends** | <https://www.youtube.com/watch?v=d9B1lAJEKgA> | The Defense 3 archive link surfaced by search; title says DD DOTA vs Absolute Legends Game 1 |
| **GS2 Group 1 — Team DD vs Absolute Legends (alt)** | <https://www.youtube.com/watch?v=Q4hNAjMtwVA> | The Defense 3 archive link surfaced by search; title says DD DOTA vs Absolute Legends Game 2 |
| **GS2 Group 1 — mTw vs PANZER** | <https://www.youtube.com/watch?v=mNNhqn1kF1E> | Search-discovered archive link |
| **GS2 Group 1 — mTw vs Just 4 the Tournament** | <https://www.youtube.com/watch?v=23ZKOr2bSJo> | Search-discovered archive link |
| **GS2 Group 1 — Western Wolves vs Panzer** | <https://www.youtube.com/watch?v=AzaYuD3GwZg> | Search-discovered archive link |
| **GS2 Group 1 — mTw vs Team DD** | <https://www.youtube.com/watch?v=OkBek2fVxJI> | Search-discovered archive link; title uses "DeeDee" |
| **GS2 Group 1 — mTw vs Western Wolves** | <https://www.youtube.com/watch?v=BXYcSVibW64> | Search-discovered archive link |
| **GS2 Group 1 — Western Wolves vs Team DD** | <https://www.youtube.com/watch?v=Fp-V9Cs0PFo> | Search-discovered archive link; title uses "DeeDee vs Western Wolves" |
| **GS2 Group 1 — Western Wolves vs Absolute Legends** | <https://www.youtube.com/watch?v=ImSfWku39Uc> | Search-discovered archive link |
| **GS2 Group 2 — Dignitas vs Problem???** | <https://www.youtube.com/watch?v=TmLZmcVsab0> | Search-discovered archive link: "dignitas vs Problem??? @ The Defence by CaspeRRR" |
| **GS2 Group 2 — Evil Geniuses vs Fnatic** | <https://www.youtube.com/watch?v=drX3sHo3uYI> | Search-discovered archive link |
| **GS2 Group 2 — Natus Vincere vs mousesports** | <https://www.youtube.com/watch?v=wkQpbIQX9Jg> | Search-discovered archive link: "Na`Vi vs mouz @The Defense by CaspeRRR" |
| **GS2 Group 2 — Fnatic vs Problem???** | <https://www.youtube.com/watch?v=telcvwZIHE8> | Search-discovered archive link |
| **GS2 Group 2 — Team Dignitas vs mousesports** | <https://www.youtube.com/watch?v=ngW8iENxZ08> | Search-discovered archive link; uploader labels it Game 1/3 |
| **GS2 Group 2 — Evil Geniuses vs Natus Vincere** | <https://www.youtube.com/watch?v=adte4wyxnvs> | Search-discovered archive link; uploader labels it WB Final Game 2 |
| **GS2 Group 2 — Evil Geniuses vs mousesports** | <https://www.youtube.com/watch?v=6Pdwny6hmLU> | Search-discovered archive link; explicitly labeled Group Stages |
| **GS2 Group 2 — Problem??? vs Natus Vincere** | <https://www.youtube.com/watch?v=bg0oyZ4BPI4> | Search-discovered archive link |
| **GS2 Group 2 — Team Dignitas vs Fnatic** | <https://www.youtube.com/watch?v=ZUtrDT4GjiE> | Search-discovered archive link; title says Game 2 |
| **GS2 Group 2 — Problem??? vs mousesports** | <https://www.youtube.com/watch?v=aLYyQ7tTIhg> | Search-discovered archive link |
| **GS2 Group 2 — Natus Vincere vs Fnatic** | <https://www.youtube.com/watch?v=xGK6SSg5h7I> | Search-discovered archive link; title explicitly says 2nd GS |
| **GS2 Group 2 — Team Dignitas vs Evil Geniuses G1** | <https://www.youtube.com/watch?v=SykQE2XcJpc> | Search-discovered archive link |
| **GS2 Group 2 — Team Dignitas vs Evil Geniuses G2** | <https://www.youtube.com/watch?v=t8QK0BFOx18> | Search-discovered archive link |
| **GS2 Group 2 — Team Dignitas vs Natus Vincere** | <https://www.youtube.com/watch?v=1qVl_VTJTnA> | Search-discovered archive link |
| **GS2 Group 2 — Evil Geniuses vs Problem???** | <https://www.youtube.com/watch?v=qJJqBhL0Rbk> | Search-discovered archive link |
| **GS2 Group 2 — Fnatic vs mousesports** | <https://www.youtube.com/watch?v=GpyxU2zqmcM> | Search-discovered archive link |

---

## 📝 Notes

- The current README emphasizes **playoff reconstruction**, because that is where the stage-3 DB evidence is currently strongest.
- Group stage / early-stage historical coverage should be treated as a separate reconstruction task unless independently verified.
- For candidate-by-candidate reasoning, restart-lobby handling, and more conservative verdict text, see [`MATCH_IDENTIFICATION.md`](MATCH_IDENTIFICATION.md).
