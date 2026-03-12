# ESWC 2011 — Rosters and Liquipedia Reference

**Primary source:** cached Liquipedia page content for
`https://liquipedia.net/dota2/Electronic_Sports_World_Cup/2011`
from the local stage-1 cache:

- `pipeline/liquipedia_pre2014_stage1/cache/http/ae4f0e23264e789e1549fd5a48d04031b2b8c7dc.json`

This file extracts the participant / roster layer from that Liquipedia source so
ESWC 2011 can be rebuilt against expected teams and players instead of the noisy
`tournament_id=999` dump.

---

## Tournament facts from Liquipedia

- **Name:** Electronic Sports World Cup 2011
- **Ticker:** ESWC 2011
- **Dates:** 2011-10-23 → 2011-10-25
- **Location:** Paris, France
- **Format:**
  - Group Stage #1: 12 teams, 2 groups, Bo1
  - Top 2 from each group advance
  - Playoff: 4-team single elimination
  - Semifinals Bo1
  - Grand Final Bo3
- **Prize pool:** $22,000 USD
- **League ID:** `65000`

---

## Placings from Liquipedia

| Place | Team | Notes |
|---|---|---|
| 1 | Natus Vincere | defeated EHOME 2-0 in the grand final |
| 2 | EHOME | grand finalist |
| 3 | GamersLeague | beat monkeybusiness in the 3rd-place match |
| 4 | monkeybusiness | playoff team |
| 5-12 | Moscow Five / NEXT.kz / Virus Gaming / BX3 eSports Club / Storm Games Clan / Orange eSports / Lias Gaming / BLAST Gaming | group-stage exits / no-shows as listed by Liquipedia |

**Important Liquipedia note:**
- **Lias Gaming** and **BLAST Gaming** did **not attend** the event.

---

## Liquipedia participants / rosters

### Natus Vincere
- XBOCT
- Dendi
- LighTofHeaveN
- Puppey
- ARS-ART

### EHOME
- QQQ
- ARS
- NUZ
- PCT
- X!!

### Orange eSports
- xaiobai
- Mushi
- Nicxh
- XtincT
- WinteR

### NEXT.kz
- eQual
- Mantis
- BeaR
- LuCKy
- RONIN

### Moscow Five
- God
- Vigoss
- Dread
- PGG
- NS

### Virus Gaming
- Garter
- Ph0eNiiX
- Sockshka
- 7ckngMad
- Maldejambes

### Storm Games Clan
- Tulex
- Warlog
- craNich
- gollik
- son1

### monkeybusiness
- CalculuS
- AngeL
- miGGel
- Ryze
- Link

### BX3 eSports Club
- Bentzer
- Olich
- Yozup
- Vinny
- ast0n
- kekman

### GamersLeague
- BAJA-
- grizine
- g0g1
- Mitch
- ANdre
- BABARRR

### Lias Gaming
- Liquipedia roster hidden / unavailable on overview page
- Liquipedia note says the team **did not attend**

### BLAST Gaming
- Liquipedia roster hidden / unavailable on overview page
- Liquipedia note says the team **did not attend**

---

## Group assignments from Liquipedia

### Group 1
- monkeybusiness
- EHOME
- Moscow Five
- Virus Gaming
- Storm Games Clan
- Lias Gaming

### Group 2
- GamersLeague
- Natus Vincere
- NEXT.kz
- BX3 eSports Club
- Orange eSports
- BLAST Gaming

---

## Rebuild-useful identity notes

These are the most useful roster anchors for validating noisy DB matches.

### Strong anchors

**Natus Vincere**
- XBOCT
- Dendi
- LighTofHeaveN
- Puppey
- ARS-ART

**Moscow Five**
- God
- Vigoss
- Dread
- PGG
- NS

**monkeybusiness**
- CalculuS
- AngeL
- miGGel
- Ryze
- Link

**Virus Gaming**
- Sockshka
- 7ckngMad

### Caveats

- Early-Dota rosters may use aliases, alternates, nickname variants, or partial
  OCR-like corruption in recovered data.
- Some player names in the DB may appear as `Unknown`, stylized handles, or
  Unicode variants.
- BX3 and GamersLeague both have 6 listed names on Liquipedia; this may reflect
  substitutes / alternates rather than a single exact 5-player match roster.

---

## Match skeleton from the same Liquipedia source

### Playoffs
- `91026` — monkeybusiness vs Natus Vincere
- `90992` — GamersLeague vs EHOME
- `91105` — monkeybusiness vs GamersLeague (3rd place)
- `91112` — Natus Vincere vs EHOME (Grand Final Game 1)
- `91151` — Natus Vincere vs EHOME (Grand Final Game 2)

### Group 1
- `86405` — Moscow Five vs Storm Games Clan
- `86443` — monkeybusiness vs Virus Gaming
- `86532` — Storm Games Clan vs EHOME
- `86595` — Virus Gaming vs Moscow Five
- `86722` — EHOME vs Virus Gaming
- `86790` — Moscow Five vs monkeybusiness
- `86922` — Virus Gaming vs Storm Games Clan
- `87004` — monkeybusiness vs EHOME
- `87120` — Storm Games Clan vs monkeybusiness
- `87161` — EHOME vs Moscow Five

### Group 2
- `88792` — Orange eSports vs BX3 eSports Club
- `88786` — NEXT.kz vs GamersLeague
- `88913` — BX3 eSports Club vs Natus Vincere
- `88948` — GamersLeague vs Orange eSports
- `89136` — Natus Vincere vs GamersLeague
- `89113` — Orange eSports vs NEXT.kz
- `89314` — NEXT.kz vs Natus Vincere
- `89343` — GamersLeague vs BX3 eSports Club
- `89603` — Natus Vincere vs Orange eSports
- `89492` — BX3 eSports Club vs NEXT.kz

---

## Current rebuild implication

This Liquipedia roster layer makes it much easier to audit candidate matches in
`dota_archive.db`:

- if a recovered match contains a cluster like `CalculuS / AngeL / miGGel / Link`,
  it is a strong monkeybusiness candidate
- if a recovered match contains `ARS-ART` plus classic Na`Vi-era handles, it may
  be a Natus Vincere candidate
- if a recovered match contains `God / Vigoss / Dread / PGG / NS`, it is a strong
  Moscow Five anchor

These roster anchors should be used together with exact Liquipedia match IDs,
not as a substitute for them.
