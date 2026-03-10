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
- **Absolute Legends** *(aka AL)*
- **mousesports** *(aka mouz)*
- **Western Wolves** *(Team Shakira lineage)*

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

**Dignitas**
- **freezer**: `39226957`
- **ComeWithMe**: `85375207`
- **S0ny** *(Ro-Coco)*: `45316897`
- **Zizou** *(10kabs5kdota)*: `27005611`
- **Ly0n** *(d.intel Ly0n)*: `97170605`

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

## 📺 Video Archive (known series VODs)

| Match | URL | Description |
|---|---|---|
| **Lower Bracket Final G1** | <https://www.youtube.com/watch?v=yQLtblCGPcQ> | EG vs Quantic |
| **Lower Bracket Final G2** | <https://www.youtube.com/watch?v=FYuTjiwpzPE> | EG vs Quantic |
| **Grand Final G1** | <https://www.youtube.com/watch?v=FAntUgZWqFk> | Na`Vi vs Quantic |
| **Grand Final G2** | <https://www.youtube.com/watch?v=dwwdYO289aw> | Na`Vi vs Quantic |
| **Grand Final G3** | <https://www.youtube.com/watch?v=pAqADjcqskM> | Na`Vi vs Quantic |
| **Grand Final G4** | <https://www.youtube.com/watch?v=-O_Tv3RxrRk> | Na`Vi vs Quantic |

---

## 📝 Notes

- The current README emphasizes **playoff reconstruction**, because that is where the stage-3 DB evidence is currently strongest.
- Group stage / early-stage historical coverage should be treated as a separate reconstruction task unless independently verified.
- For candidate-by-candidate reasoning, restart-lobby handling, and more conservative verdict text, see [`MATCH_IDENTIFICATION.md`](MATCH_IDENTIFICATION.md).
