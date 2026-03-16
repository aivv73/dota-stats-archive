# DreamHack Winter 2011 - Recovery Report

**Status**: Skeleton captured ⚠️ (21/21 exact Liquipedia-linked match IDs identified; 0/21 present locally; OpenDota path unavailable)
**Dates**: Nov 24-26, 2011
**Location**: Jönköping, Sweden
**Prize Pool**: 100,000 SEK
**Organizer**: DreamHack / Corsair Vengeance
**GitHub repo**: <https://github.com/aivv73/dota-stats-archive>

---

**Sources**:
- Liquipedia: <https://liquipedia.net/dota2/DreamHack/2011/Winter>
- Structured Liquipedia stage-1 inventory: `pipeline/liquipedia_pre2014_stage1/data/liquipedia_pre2014_stage1.json`
- Ticketless candidate row: `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.csv`
- Player/teamcard context: `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.csv`
- Exact ID skeleton: `tournaments/dreamhack-winter-2011/dreamhack-winter-2011-match-ids.json`
- Rebuild checklist: `tournaments/dreamhack-winter-2011/dreamhack-winter-2011-rebuild-checklist.md`

---

## 🏆 Tournament Overview

DreamHack Winter 2011 is an early offline Dota 2 LAN tournament held at DreamHack in Jönköping, Sweden.

Liquipedia currently describes the event as:

- **8 teams total**
  - 4 invited teams
  - 4 BYOC qualifier teams
- **Group Play**
  - 2 groups of 4 teams
  - group matches played as best-of-1
  - top 2 teams from each group advance
- **Playoffs**
  - 4-team single-elimination bracket
  - playoff matches described in the overview as best-of-3

### Teams currently listed on Liquipedia

- **SK Gaming**
- **Team Shakira**
- **Fnatic**
- **BX3 eSports Club**
- **Wild Honey Badgers**
- **BlitZ**
- **Nook1e**
- **ND9 1**

---

## 🎯 Exact-ID Skeleton from Liquipedia

Liquipedia embeds direct DatDota/Dotabuff links for **21 unique match IDs**:

| Match ID |
|---:|
| `512699` |
| `513009` |
| `514622` |
| `514632` |
| `515558` |
| `516155` |
| `518885` |
| `519943` |
| `521619` |
| `521675` |
| `523128` |
| `523510` |
| `528996` |
| `531170` |
| `534692` |
| `537014` |
| `557463` |
| `559502` |
| `569246` |
| `571777` |
| `573993` |

### Why this skeleton matters

This gives us a direct tournament anchor that is much stronger than a vague page-level candidate row:

- the IDs are linked out from Liquipedia to **DatDota** and **Dotabuff**;
- the count is internally plausible for an 8-team event with groups + playoffs;
- the tournament already exists in the repo's pre-2014 ticketless inventory;
- the team/playercard pipeline already contains DreamHack Winter 2011 context.

### Caveat

We have **not yet finished stage-by-stage mapping** of these 21 IDs into:

- Group A
- Group B
- Semifinals
- Third-place match
- Grand final games
- possible qualifier/BYOC-linked rows if those are represented on the page

So the 21-match skeleton is solid, but the **canonical bracket mapping is still incomplete**.

---

## 🗃 Current Local DB State

Checked against local `dota_archive.db`:

- exact DreamHack Winter 2011 IDs present in `matches`: **0 / 21**
- dedicated `tournaments` row for this event: **not yet created**
- dedicated tournament work directory: **created** under `tournaments/dreamhack-winter-2011/`

Current practical reading:

- this tournament is **known and staged as a research target**;
- player/teamcard metadata already exists in the pipeline layer;
- the actual match rows still need to be recovered from an external source.

---

## ⚠️ OpenDota Status

All 21 exact Liquipedia-linked IDs currently return **404 Not Found** from:

- `https://api.opendota.com/api/matches/{match_id}`

This is the key difference from ESWC 2011.

### Implication

DreamHack Winter 2011 does **not currently have an ESWC-style OpenDota exact-ID recovery path**.

That means we should not assume that:

- exact Liquipedia-linked match IDs are fetchable from OpenDota;
- a simple importer similar to `import:eswc-2011:opendota` will work;
- OpenDota is the canonical recovery source for this tournament.

---

## 🧭 Current Working Hypothesis

The 21 IDs appear to be **real early Dota 2 match IDs**, because Liquipedia links them out directly to DatDota and Dotabuff.

However, these matches are **not present in OpenDota's current exact-match API coverage**.

So the likely recovery path is one of:

1. **manual/browser extraction from Dotabuff**
2. **manual/browser extraction from DatDota**
3. **alternative archive/dump source**
4. **hidden local clue-source** elsewhere in the repo or DB

---

## ✅ What is currently confirmed

### Direct exact-ID skeleton
We have a clean **21-match exact-ID skeleton** from Liquipedia-linked DatDota/Dotabuff references.

### Tournament candidate status
DreamHack Winter 2011 is already recorded in the repo's pre-2014 candidate inventory as a **likely ticketless** event.

### Player/teamcard context exists
The ticketless player/teamcard pipeline already includes DreamHack Winter 2011 entries for multiple players and observed names.

### Local DB match coverage is currently zero
None of the 21 exact IDs are currently present in the local `matches` table.

### OpenDota coverage is currently zero
All 21 IDs currently fail exact-match lookup in OpenDota with `404`.

---

## 🎥 Known Video Sources

The following video sources were found during quick initial discovery. This is not yet a complete catalog, but it already gives us external confirmation for event coverage, winner context, and at least one grand-final game.

| Type | Title | Coverage | Published | Link |
|---|---|---|---|---|
| recap | Dreamhack Winter 2011 Dota 2 Championship - A Recap by joinDOTA | General tournament recap narrated by TobiWan | 2011-12-19 | <https://www.youtube.com/watch?v=nlPTqZHA9Jg> |
| winner moment | Dreamhack Winter 2011 - Day 3 WHB wins the Dreamhack Dota 2 tournament | Wild Honey Badgers win moment / closing coverage | 2011-11-26 | <https://www.youtube.com/watch?v=13g571NxEcc> |
| grand final vod | Dreamhack Winter 2011 - DotA 2 Finals - Fnatic vs Wild Honey Badgers - Game 1 | Grand Final, Game 1 | 2011-11-27 | <https://www.youtube.com/watch?v=PBrUKRgNsu4> |
| interview | Dreamhack Winter 2011 - Day 2 Interview with syndereN | Post-match interview with syndereN | 2011-11-25 | <https://www.youtube.com/watch?v=R4J1YnylR3Y> |
| interview | Dreamhack Winter 2011 - Day 2 Interview with Kuronity & ... | Additional tournament interview / player feature | unknown in search snippet | <https://www.youtube.com/watch?v=UGTIyBhba7c> |
| playlist | DreamHack Winter 2011 | YouTube playlist for the event; likely best source for further manual VOD triage | unknown in search snippet | <https://www.youtube.com/playlist?list=PLQluqRkQTFdD_KR1fXLtWQO4QVGCqBIFP> |

### What these videos already confirm

- **Wild Honey Badgers** won the tournament.
- **Fnatic vs Wild Honey Badgers** appears as the grand final pairing.
- joinDOTA/TobiWan-era event coverage exists and may contain additional bracket/context clues.
- The playlist is a strong candidate source for future manual match-by-match reconstruction.

---

## 🔭 Next useful tasks

### 1. Complete canonical stage mapping
Map all 21 IDs to exact pairings and tournament stages directly from Liquipedia.

### 2. Test non-OpenDota recovery sources
Use browser/manual access to check:
- Dotabuff pages for all 21 IDs
- DatDota pages for all 21 IDs
- YouTube playlist coverage against known pairings and stage order

### 3. Search for hidden local clue sources
Check whether these IDs already appear in:
- older raw dumps
- cached HTML/json blobs
- historical notes
- staging or scratchpad files not yet linked into tournament-specific docs

### 4. Add a local DB report script
Create a DreamHack Winter 2011 report flow similar to ESWC reporting so future checks are reproducible.

---

## 📌 Current conclusion

DreamHack Winter 2011 is a **good reconstruction candidate** because its exact match skeleton is already known.

But unlike ESWC 2011, it is currently blocked on **source availability**, not on match identification:

- **match identification:** mostly solved at the skeleton level
- **OpenDota recovery:** unavailable
- **canonical bracket mapping:** incomplete
- **best next path:** Dotabuff/DatDota/browser-assisted recovery
