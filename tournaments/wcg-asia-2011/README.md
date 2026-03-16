# WCG Asian Championship 2011 - Recovery Report

**Status**: Partially reconstructed ⚠️
**Dates**: Nov 9-13, 2011
**Location**: Jakarta, Indonesia
**Format**: Round-robin group stage + single-elimination playoffs
**Prize Pool**: $6,000 USD
**Organizer**: World Cyber Games
**Liquipedia page**: <https://liquipedia.net/dota2/World_Cyber_Games/Asia/2011>
**Fandom page**: <https://dota2.fandom.com/wiki/WCG_Asian_Championships_2011>

---

## Current status

This tournament is still **unmatched** in the local archive pipeline, but it is no longer opaque.

What is already solid:
- the full **20-match canonical skeleton** has been recovered
- the full **12-team field** is known
- squads are captured from fandom API
- several **Dotabuff-only exact-ID candidate clusters** are already triaged

What is still incomplete:
- most exact IDs are **not yet** assigned to final canonical bracket slots with high confidence
- weaker teams remain hard to resolve because many old Dotabuff-visible accounts are missing, private, or unresolved

Important note:
- Liquipedia gave only a partial / top-8-oriented view here
- the fuller tournament structure was recovered from **dota2.fandom MediaWiki API**
- `leagueid` on Liquipedia is empty, so this is **not** a simple ticket/league sweep case

---

## Tournament skeleton

Primary current skeleton source:
- `dota2.fandom` MediaWiki API (`WCG Asian Championships 2011`)

### Format

- **Group Stage**
  - 4 groups of 3 teams
  - single round-robin
  - all matches are **Bo1**
  - top 2 from each group advance
- **Playoffs**
  - 8-team single elimination
  - all matches are **Bo1**

### Expected map count

- Group stage: **12** maps
- Playoffs: **8** maps
- **Expected total: 20 maps**

### Group stage

#### Group A
Teams:
- Mineski PowerColor
- VelocyHyper / GDGS
- Eternal Souls

Matches:
- Mineski def. VelocyHyper
- GDGS def. Eternal Souls
- Mineski def. Eternal Souls

#### Group B
Teams:
- Neolution
- Virtousity
- Team India

Matches:
- Neolution def. Virtousity
- Neolution def. Team India
- Virtousity def. Team India

#### Group C
Teams:
- MUFC
- SkyNet
- LOF

Matches:
- MUFC def. LOF
- MUFC def. SkyNet
- SkyNet def. LOF

#### Group D
Teams:
- EHOME
- Aeon
- BBJ

Matches:
- EHOME def. Aeon
- Aeon def. BBJ
- EHOME def. BBJ

### Playoffs

#### Quarterfinals
- Mineski def. Aeon
- Neolution def. SkyNet
- MUFC def. Virtousity
- EHOME def. GDGS

#### Semifinals
- Mineski def. Neolution
- MUFC def. EHOME

#### Third place
- EHOME def. Neolution

#### Grand Final
- MUFC def. Mineski

---

## Known participants and squads

### Full 12-team field
- **Mineski PowerColor** — Philippines
- **GDGS / VelocyHyper** — Indonesia
- **Eternal Souls** — Bangladesh
- **Neolution E-Sport** — Thailand
- **Virtousity** — Pakistan
- **Team India** — India
- **MUFC** — Malaysia
- **SkyNet** — Vietnam
- **LOF** — Mongolia
- **EHOME** — China
- **Aeon / AEONSports** — Singapore
- **BBJ** — South Korea

### Squad captures

#### Mineski
- wootz
- Julz
- Bimbo
- Owa
- rr

#### Velocy / GDGS
- scL
- NFR
- CK / CK~
- CJ7
- Y2K

#### Eternal Souls
- 826
- AurorA
- wOw
- Animal
- 739

#### Neolution E-Sport
- Tha-
- Tifa
- Gyu
- Mixgy
- Norrie

#### Virtousity
- athraxxx
- eon
- belalking
- thegame
- (4-player squad on fandom page)

#### Team India
- Windy
- -rK-
- Cr.M4d
- MayheM
- J <3 R

#### MUFC
- Sharky
- KYxY / kYxY
- Ling
- Net
- TooFuckingGood

#### SkyNet
- Lonely-
- Tung con
- BlackMoon
- NoLove
- Kazu

#### LOF
- Ariuka
- Shooting
- Ace_Muka
- T.M
- Incool

#### EHOME
- ARS
- 357 / QQQ
- Dai / MMY!
- PLT / LaNm
- PCT

#### BBJ
- Heen
- Potato
- Hoonji
- Lanpu
- Orange

Known account anchor:
- Hoonji — `86740201`

#### Aeon / AEONSports
- Xul-
- Bouncy
- Warnutz / NutZ
- fragniity
- d4rkw1sH

Known account anchor:
- Warnutz / NutZ — `89603649`

---

## Existing local evidence

From the pre-2014 ticketless player index, this tournament already has partial account-backed coverage for several stronger teams / players, including:

- **MUFC**
  - Sharky
  - KYxY / kYxY
  - Ling
  - Net
  - TooFuckingGood
- **EHOME**
  - 357 / QQQ
  - Dai / MMY!
  - PCT
  - PLT / LaNm
  - ARS
- **Mineski**
  - Julz
  - Owa / Samael
  - rr / RR
  - Bimbo / Raging Potato
- **Aeon**
  - Warnutz / NutZ
- **BBJ**
  - Hoonji (manual account anchor)

This is enough to start real reconstruction, but not enough yet for a full clean import.

---

## Current partial canonical set

### Strong keep
These are the strongest current WCG-linked exact-ID candidates.

- `184840`
  - strongest current candidate for **Aeon > BBJ**
- `185843`
  - strongest current candidate for **EHOME > BBJ**
  - confirmed from both sides after targeted `Hoonji / 86740201` stage3 recovery
- `159430`
  - strong MUFC win candidate
  - likely one of:
    - `MUFC > LOF`
    - `MUFC > SkyNet`
- `159822`
  - strong MUFC win candidate
  - likely the other MUFC group-stage win
- `196341`
  - strong EHOME late-stage candidate
  - currently best treated as one half of a paired playoff/placement set
- `196749`
  - strong EHOME late-stage candidate
  - paired with `196341`

### Keep but unresolved
- `183485`
  - valid EHOME win after aborted `183139`
- `200046`
  - valid EHOME win, stage unresolved

### Tentative only
- `199130`
  - weak candidate only
  - do not treat as canonical yet

### Excluded
- `147183`
  - likely EHOME vs Absolute Legends, not WCG Asia 2011
- `183139`
  - aborted / recreated false start of `183485`

---

## Stage-3 Dotabuff-history candidate notes

Using `pipeline/practice_match_history_stage3/data/practice_match_history_stage3.db`, the strongest currently visible WCG-related clusters come from **EHOME**, **MUFC**, and **BBJ / Hoonji** account history.

### EHOME cluster

Observed candidate IDs in the window:
- `147183`
- `183139`
- `183485`
- `185843`
- `196341`
- `196749`
- `199130`
- `200046`

Current manual conclusions:
- `147183` — **exclude**; looks like EHOME vs **Absolute Legends**, not WCG Asia
- `183139` / `183485` — same game cluster; `183139` lasted only ~30 seconds and was likely an aborted start, so:
  - `183139` — **exclude**
  - `183485` — **keep as canonical recreation**
- `185843` — strong BBJ-linked WCG candidate, plausibly `EHOME > BBJ`

Still unresolved EHOME-side candidates:
- `196341`
- `196749`
- `199130`
- `200046`

### BBJ / Hoonji cluster

Targeted stage3 recovery for `Hoonji / 86740201` found:
- `184840` — BBJ loss
- `185843` — BBJ loss

This is a strong fit for BBJ's canonical group-stage path:
- `Aeon > BBJ`
- `EHOME > BBJ`

Current first-pass assignment:
- `184840` → strongest current candidate for **Aeon > BBJ**
- `185843` → strongest current candidate for **EHOME > BBJ**

### MUFC cluster

Observed strong MUFC account-overlap IDs in the window:
- `159430`
- `159822`

Current first-pass assignment:
- these are the best current candidates for MUFC's two group-stage wins:
  - `MUFC > LOF`
  - `MUFC > SkyNet`

### Negative results worth keeping

- `Warnutz / NutZ = 89603649`
  - valid Aeon anchor
  - but targeted stage3 run produced **0 practice matches** in the WCG window
- Mineski-side anchors (`Julz`, `Owa`, `RR`, `Raging Potato`)
  - also produced **0 rows** in the WCG window in the current shared stage3 DB

---

## Machine-readable artifacts

Current local artifacts:
- `wcg-asia-2011-skeleton.json`
- `wcg-asia-2011-candidate-triage.md`
- `.cache/fandom-wikitext.json`
- `.cache/fandom-squads-wikitext.json`
- `.cache/hoonji-stage3.db`
- `.cache/hoonji-stage3-summary.json`
- `.cache/warnutz-stage3.db`
- `.cache/warnutz-stage3-summary.json`

---

## Current cautions

- no direct `leagueid` anchor on Liquipedia
- many weaker-team old Dotabuff profiles are private, unresolved, or invisible in current stage3 evidence
- several exact IDs are still candidate-level only and should not yet be imported as final canonical rows
- the README reflects the **current working reconstruction**, not a finished import

---

## Next useful steps

1. continue manual triage of the remaining EHOME late-stage cluster:
   - `196341`
   - `196749`
   - `199130`
   - `200046`
2. try to distinguish which MUFC group win is:
   - `MUFC > LOF`
   - `MUFC > SkyNet`
3. look for any additional BBJ / Neolution / Mineski cross-confirmation that helps assign:
   - `MUFC > EHOME`
   - `EHOME > Neolution`
   - `Mineski > Neolution`
   - `MUFC > Mineski`
4. only after that, promote the strongest exact IDs into a canonical tournament import
