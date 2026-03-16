# WCG Asian Championship 2011 - Candidate Triage

## Canonical skeleton reference

### Group stage
- Group A
  - Mineski > VelocyHyper
  - GDGS > Eternal Souls
  - Mineski > Eternal Souls
- Group B
  - Neolution > Virtousity
  - Neolution > Team India
  - Virtousity > Team India
- Group C
  - MUFC > LOF
  - MUFC > SkyNet
  - SkyNet > LOF
- Group D
  - EHOME > Aeon
  - Aeon > BBJ
  - EHOME > BBJ

### Playoffs
- Quarterfinals
  - Mineski > Aeon
  - Neolution > SkyNet
  - MUFC > Virtousity
  - EHOME > GDGS
- Semifinals
  - Mineski > Neolution
  - MUFC > EHOME
- Third place
  - EHOME > Neolution
- Final
  - MUFC > Mineski

---

## Dotabuff-history candidate triage

### EHOME cluster

#### Excluded
- `147183`
  - likely EHOME vs Absolute Legends
  - not part of WCG Asia 2011
- `183139`
  - ~30-second aborted / recreated game
  - canonical remake appears to be `183485`
- `185843`
  - looks like EHOME vs MVP (forev / Hoonji observed)
  - not part of WCG Asia 2011

#### Keep / stronger candidates
- `183485`
  - canonical recreation after aborted `183139`
  - still unresolved bracket slot
- `196341`
  - plausible WCG candidate
  - same opposing side as `196749`
  - possible weak link to Thailand / Neolution
- `196749`
  - paired rematch candidate with `196341`
  - EHOME win over same opposing side
- `199130`
  - weak candidate only
  - partial overlap with prior opposing side, but lineup drifts
- `200046`
  - unresolved candidate

### MUFC cluster

#### Keep / stronger candidates
- `159430`
  - strong MUFC account-overlap candidate
  - likely tournament-layer match
- `159822`
  - strong MUFC account-overlap candidate
  - likely tournament-layer match

---

## First-pass bracket assignment

### MUFC
Current strongest working assignment:
- `159430` — likely **MUFC group-stage win candidate**
- `159822` — likely **MUFC group-stage win candidate**

Reasoning:
- both occur on `2011-11-10`
- both are MUFC wins
- fandom skeleton expects exactly two MUFC group-stage wins:
  - `MUFC > LOF`
  - `MUFC > SkyNet`

Current caution:
- still not enough evidence to say which exact ID is `vs LOF` and which is `vs SkyNet`

### EHOME
Current strongest working assignment:
- `185843` — strongest current candidate for **EHOME > BBJ**
- `196341` + `196749` — strongest **paired playoff-layer candidates**
  - same visible EHOME side
  - one loss, then one win
  - currently best fit for a late-tournament EHOME path
- `183485` — valid EHOME win, likely earlier-stage candidate
- `200046` — valid EHOME win, stage unresolved
- `199130` — weak candidate only, keep tentative

Current caution:
- exact mapping of `183485 / 196341 / 196749 / 199130 / 200046` onto:
  - Group D: `EHOME > Aeon`
  - Group D: `EHOME > BBJ`
  - Quarterfinal: `EHOME > GDGS`
  - Semifinal: `MUFC > EHOME`
  - Third place: `EHOME > Neolution`
  remains unresolved

## Working matching ideas

### EHOME expected path from skeleton
Likely strongest WCG candidates should map to some combination of:
- Group D: EHOME > Aeon
- Group D: EHOME > BBJ
- Quarterfinal: EHOME > GDGS
- Semifinal: MUFC > EHOME
- Third place: EHOME > Neolution

### MUFC expected path from skeleton
Likely strongest WCG candidates should map to some combination of:
- Group C: MUFC > LOF
- Group C: MUFC > SkyNet
- Quarterfinal: MUFC > Virtousity
- Semifinal: MUFC > EHOME
- Final: MUFC > Mineski

## Additional anchors

User-provided / confirmed additional anchors:
- `Hoonji` — Dotabuff player id / account id `86740201`
- `Warnutz` / `NutZ` — Dotabuff player id / account id `89603649`

This is important because BBJ is one of the hardest teams to resolve from the current
local player index, and even a single confirmed account may help distinguish:
- `EHOME > BBJ`
- any non-WCG Korean-side false positives

Important negative result:
- a targeted stage3 run for `Warnutz / 89603649` produced **0 practice matches** in the
  WCG window `2011-11-09 .. 2011-11-13`
- so `NutZ` is a valid long-term Aeon anchor, but currently **not** a usable WCG-stage3
  evidence source for this tournament window

## Current note
Because many weaker-team profiles are private / unresolved, assignment still depends heavily on:
- observed nick fragments
- country flags
- repeated opposing lineups
- tournament chronology
- manual Dotabuff inspection by the user
ided BBJ anchor:
- `Hoonji` — Dotabuff player id / account id `86740201`

This is important because BBJ is one of the hardest teams to resolve from the current
local player index, and even a single confirmed account may help distinguish:
- `EHOME > BBJ`
- any non-WCG Korean-side false positives

## Current note
Because many weaker-team profiles are private / unresolved, assignment still depends heavily on:
- observed nick fragments
- country flags
- repeated opposing lineups
- tournament chronology
- manual Dotabuff inspection by the user
