# ESWC 2011 — Clean Rebuild Checklist

**Purpose:** rebuild **Electronic Sports World Cup 2011** from a clean, verified match skeleton instead of relying on the noisy `tournament_id=999` bulk import.

**Current assessment:**
- `tournament_id=999` contains **306 matches**, but this does **not** resemble a clean tournament dataset.
- Most rows lack normalized team names.
- Player data is partial/noisy (`Unknown` is common).
- Hero data is missing.
- Only a small subset of direct Liquipedia match IDs currently appears in the local DB.

**Recommendation:** treat the existing recovered row as a **non-canonical working dump** and rebuild ESWC 2011 from verified match IDs + bracket structure.

---

## Target clean tournament skeleton

Based on the current README / Liquipedia structure, the clean tournament should contain:

- **Group Stage:** 20 matches
- **Playoffs:** 5 matches
  - 2 semifinals
  - 1 third-place match
  - 2 grand final games currently listed in the repo README

**Expected clean total:** **25 matches**

> Note: if later evidence shows the grand final had an additional game or any bracket discrepancy, update this checklist rather than expanding from the noisy DB block.

---

## Canonical rebuild workflow

For each expected match below:

1. **Verify source anchor**
   - direct Liquipedia match ID
   - listed matchup
   - listed timestamp

2. **Check local DB presence**
   - present / missing
   - if present, note current `tournament_id`
   - if present, assess whether player rows look plausible

3. **Assess quality**
   - team identity recoverable?
   - player names plausible?
   - obvious placeholders / heavy `Unknown` usage?
   - any supporting VOD / archive evidence?

4. **Assign rebuild status**
   - `confirmed`
   - `present-but-noisy`
   - `missing`
   - `needs-manual-review`

5. **Only after match-level validation**
   - assign to the new clean canonical tournament row
   - normalize team names / stage labels / ordering

---

## Match checklist

Legend:
- **DB:** `found` / `missing` / `unchecked`
- **Status:** `confirmed` / `present-but-noisy` / `missing` / `needs-manual-review`

### Playoffs

| Stage | Match | Match ID | Date (UTC) | DB | Status | Notes |
|---|---|---:|---|---|---|---|
| Semifinal | monkeybusiness vs Natus Vincere | `91026` | 2011-10-25 07:54 | found | present-but-noisy | Present in DB under `tournament_id=999`; player rows exist, but no normalized team labels. |
| Semifinal | GamersLeague vs EHOME | `90992` | 2011-10-25 07:44 | missing | missing | Important playoff anchor currently absent from local DB. |
| Third Place | monkeybusiness vs GamersLeague | `91105` | 2011-10-25 09:31 | found | present-but-noisy | Present in DB; needs team/player audit. |
| Grand Final — Game 1 | Natus Vincere vs EHOME | `91112` | 2011-10-25 09:59 | found | present-but-noisy | Present in DB; repeated stack-like players, but still noisy / partially unnamed. |
| Grand Final — Game 2 | Natus Vincere vs EHOME | `91151` | 2011-10-25 10:44 | found | present-but-noisy | Present in DB; same caveats as Game 1. |

### Group 1

| Group | Match | Match ID | Date (UTC) | DB | Status | Notes |
|---|---|---:|---|---|---|---|
| Group 1 | Moscow Five vs Storm Games Clan | `86405` | 2011-10-23 08:14 | missing | missing | |
| Group 1 | monkeybusiness vs Virus Gaming | `86443` | 2011-10-23 08:36 | missing | missing | |
| Group 1 | Storm Games Clan vs EHOME | `86532` | 2011-10-23 09:27 | missing | missing | |
| Group 1 | Virus Gaming vs Moscow Five | `86595` | 2011-10-23 09:54 | missing | missing | |
| Group 1 | EHOME vs Virus Gaming | `86722` | 2011-10-23 11:35 | missing | missing | |
| Group 1 | Moscow Five vs monkeybusiness | `86790` | 2011-10-23 11:45 | missing | missing | |
| Group 1 | Virus Gaming vs Storm Games Clan | `86922` | 2011-10-23 13:08 | missing | missing | |
| Group 1 | monkeybusiness vs EHOME | `87004` | 2011-10-23 13:41 | missing | missing | |
| Group 1 | Storm Games Clan vs monkeybusiness | `87120` | 2011-10-23 15:10 | missing | missing | |
| Group 1 | EHOME vs Moscow Five | `87161` | 2011-10-23 15:16 | missing | missing | |

### Group 2

| Group | Match | Match ID | Date (UTC) | DB | Status | Notes |
|---|---|---:|---|---|---|---|
| Group 2 | Orange eSports vs BX3 eSports Club | `88792` | 2011-10-24 08:15 | missing | missing | |
| Group 2 | NEXT.kz vs GamersLeague | `88786` | 2011-10-24 08:14 | missing | missing | |
| Group 2 | BX3 eSports Club vs Natus Vincere | `88913` | 2011-10-24 09:46 | missing | missing | |
| Group 2 | GamersLeague vs Orange eSports | `88948` | 2011-10-24 09:46 | missing | missing | |
| Group 2 | Natus Vincere vs GamersLeague | `89136` | 2011-10-24 11:41 | missing | missing | |
| Group 2 | Orange eSports vs NEXT.kz | `89113` | 2011-10-24 11:35 | missing | missing | |
| Group 2 | NEXT.kz vs Natus Vincere | `89314` | 2011-10-24 13:42 | missing | missing | |
| Group 2 | GamersLeague vs BX3 eSports Club | `89343` | 2011-10-24 13:51 | missing | missing | |
| Group 2 | Natus Vincere vs Orange eSports | `89603` | 2011-10-24 16:09 | missing | missing | |
| Group 2 | BX3 eSports Club vs NEXT.kz | `89492` | 2011-10-24 14:51 | missing | missing | |

---

## Immediate rebuild priorities

### Priority 1 — Lock the skeleton
- Treat the 25 matches above as the authoritative ESWC 2011 rebuild target.
- Do **not** expand from the 306-match recovered block.

### Priority 2 — Recover the account-confirmed missing Na`Vi path first
These four Group 2 matches are still absent from `matches`, but they already
have direct account-history confirmation recorded in
`eswc-2011-account-proven-lobbies.md`:

- `88913` — BX3 eSports Club vs Natus Vincere
- `89136` — Natus Vincere vs GamersLeague
- `89314` — NEXT.kz vs Natus Vincere
- `89603` — Natus Vincere vs Orange eSports

This is currently the highest-value missing block because it is both:
- exact-ID scoped from Liquipedia
- strengthened by local account-evidence notes

### Priority 3 — Recover the missing playoff anchor
- `90992` — GamersLeague vs EHOME (semifinal)

This is still the only staged playoff match absent from `matches`, so it
remains the most important non-Na`Vi recovery target.

### Priority 4 — Keep the recovered playoff matches as structural anchors
- `91026`
- `91105`
- `91112`
- `91151`

These are already present locally and should continue to be used as
cross-check anchors while the missing matches are recovered.

### Priority 5 — Recover or re-import the remaining group-stage matches by exact ID
- after the four account-confirmed Na`Vi group-stage IDs are recovered, the
  remaining Group 1 / Group 2 staged rows should still be recovered by exact ID
- do not infer them from time windows alone

### Priority 6 — Add roster / alias notes
Create a companion reconstruction note for:
- canonical team names
- known aliases / stand-ins
- player-name variants
- confidence notes per team

---

## Local validation command

Use the committed local report to re-check DB state before changing priorities:

```bash
npm run report:eswc-2011
```

That report reads only:
- `dota_archive.db`
- `tournaments/eswc-2011/eswc-2011-account-proven-lobbies.md`

and prints:
- tournament-row coverage for `999` / `1000`
- staged vs present vs missing ESWC rows
- the current priority recovery queue, with `account-confirmed` matches surfaced
  first

---

## Suggested companion files

- `tournaments/eswc-2011/eswc-2011-rebuild-checklist.md` — this file
- `tournaments/eswc-2011/eswc-2011-rosters.md` — expected rosters / aliases / confidence
- `tournaments/eswc-2011/eswc-2011-audit-notes.md` — per-match findings and evidence

---

## Current conclusion

**ESWC 2011 should be rebuilt from verified Liquipedia match IDs, not cleaned in-place from `tournament_id=999`.**

The recovered DB row can still be useful as a source of clues, but it should not be treated as the canonical tournament representation until individual matches are re-validated.
