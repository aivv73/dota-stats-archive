# Match Identification Spec (Point 4)

This document defines how to identify and validate tournament matches against the
compiled practice-match database built in stage 3.

The design is intentionally two-layered:

1. **DB-first candidate generation** — cheap, broad, scalable
2. **Video validation** — expensive, narrow, used only for shortlisted cases

## Core principle

**DB evidence finds. Video evidence confirms.**

Video review should not be the default search method for every match. Instead,
it should be applied only after a candidate already has enough DB evidence to be
interesting.

---

## 1. Candidate admission

A DB match is allowed into consideration only if it passes a minimum relevance
bar:

- date falls in the expected tournament / series window
- at least one meaningful player or roster overlap exists
- tournament context is not obviously unrelated
- there is no immediate contradiction with known teams / rosters / timing

This does **not** mean the match is identified yet. It only means the match is
worth scoring.

---

## 2. Evidence strength classes

### Strong evidence

Enough to support **confirmed** when no serious contradictions remain.

Examples:

- exact date match
- both teams identified correctly
- strong roster overlap on both sides
- hero picks match
- strong map / series ordering context
- already-confirmed neighboring series context fits

### Moderate evidence

Enough for **probable**, but not usually enough alone for final confirmation.

Examples:

- date within a tight window
- one full side of a roster matches, second side partial
- multiple recognizable tournament-specific players match
- strong playoff / finals context match
- partial hero overlap
- adjacency to another already-confirmed match

### Weak evidence

Only enough for **possible** / lead generation.

Examples:

- one known player active near the right time
- indirect account activity around tournament dates
- loose time window with unclear team identity
- weak contextual fit without roster confirmation

---

## 3. DB scoring model

### Strong DB signals

- exact date match: **+4**
- both teams identified: **+4**
- 4+ matching players on side A: **+3**
- 3+ matching players on side B: **+3**
- hero lineup / picks match: **+3**
- series/map ordering context fits: **+2**

### Moderate DB signals

- narrow date window (same day / ±1 day): **+2**
- strong tournament-stage alignment: **+2**
- 2–3 recognizable players match: **+2**
- partial hero overlap: **+1**
- linked to already-confirmed neighboring match: **+1**

### Negative signals

- clearly wrong date: **-4**
- wrong team identity: **-4**
- roster contradiction: **-3**
- obviously unrelated practice cluster: **-2**
- hero evidence contradicts candidate: **-3**

### DB-only thresholds

- **8+** → `confirmed`
- **5–7** → `probable`
- **3–4** → `possible`
- **<=2** → `reject`

---

## 4. Video-assisted validation

If a YouTube / VOD source exists, use FFmpeg-based frame extraction only on:

- `probable` candidates
- high-value `possible` candidates
- ambiguous cases where multiple DB candidates are plausible

### Strong video signals

- draft screen confirms hero picks: **+4**
- scoreboard confirms both sides' heroes: **+4**
- overlay / team labels confirm matchup: **+2**
- player names / slots visible and align with expected side: **+2**
- timing / series progression aligns with expected match order: **+1**

### Upgrade rules

- `probable` + strong VOD hero evidence → `confirmed`
- `possible` + strong VOD hero evidence + team / roster fit → `probable` or `confirmed`
- weak VOD hint alone does not rescue a weak DB candidate
- DB `confirmed` + contradictory VOD evidence should be downgraded or rejected

---

## 5. Verdicts

Each evaluated candidate must end with one of:

- `confirmed`
- `probable`
- `possible`
- `reject`

### Meaning

- **confirmed**: good enough to attach to tournament history with high confidence
- **probable**: very likely correct, but missing one strong anchor
- **possible**: plausible lead, but not stable enough for canonical linkage
- **reject**: contradiction or insufficient evidence

---

## 6. Required per-candidate schema

Each evaluated candidate should record:

```json
{
  "candidate_match_id": "string",
  "candidate_account_ids": ["string"],
  "candidate_datetime_utc": "string|null",
  "candidate_hero_names": ["string"],
  "target_tournament": "string",
  "target_series": "string|null",
  "target_map_index": "number|null",
  "db_evidence_strength": "strong|moderate|weak",
  "video_evidence_strength": "strong|moderate|weak|none",
  "db_score": 0,
  "video_score": 0,
  "total_score": 0,
  "verdict": "confirmed|probable|possible|reject",
  "matched_signals": ["string"],
  "conflicts": ["string"],
  "video_validated": true,
  "video_source_url": "string|null",
  "video_evidence_type": [
    "draft_heroes",
    "scoreboard_heroes",
    "overlay_team_names",
    "player_name_overlay"
  ],
  "notes": "string|null"
}
```

---

## 7. Recommended workflow for The Defense Season 1

Start from the finals and work backward.

### Pass 1 — DB shortlist

For each finals / late-playoff match:

- gather Liquipedia date
- gather expected teams
- gather expected player rosters
- gather any available hero / map hints
- query the stage-3 DB for candidate rows in a tight time window

### Pass 2 — DB scoring

Assign a score and provisional verdict.

### Pass 3 — VOD branch

If a YouTube video exists:

- extract draft / scoreboard frames with FFmpeg
- compare heroes / teams / overlays against top DB candidates
- upgrade or reject accordingly

### Pass 4 — persist decision

Store verdict, evidence list, conflicts, and whether video was used.

---

## 8. Practical note

Stage 3 gives us a large searchable practice-match substrate. Point 4 should use
that substrate to prioritize **high-confidence candidate narrowing first**, then
use video only as a final validator for ambiguous or high-value matches.
