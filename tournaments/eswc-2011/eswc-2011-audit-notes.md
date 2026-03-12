# ESWC 2011 — Audit Notes

This file records match-level audit observations for the ESWC 2011 rebuild.

Primary references:
- `tournaments/eswc-2011/eswc-2011-rebuild-checklist.md`
- `tournaments/eswc-2011/eswc-2011-rosters.md`
- `dota_archive.db`

---

## Playoff match audit against Liquipedia roster anchors

Liquipedia playoff structure:
- `91026` — monkeybusiness vs Natus Vincere
- `90992` — GamersLeague vs EHOME
- `91105` — monkeybusiness vs GamersLeague (3rd place)
- `91112` — Natus Vincere vs EHOME (Grand Final Game 1)
- `91151` — Natus Vincere vs EHOME (Grand Final Game 2)

### Match `90992`
**Liquipedia expectation:** GamersLeague vs EHOME (semifinal)

**DB state:**
- match row: **missing**
- player rows: **0**

**Conclusion:**
- fully missing from the current local DB snapshot
- must be recovered separately

**Status:** `missing`

---

### Match `91026`
**Liquipedia expectation:** monkeybusiness vs Natus Vincere (semifinal)

**DB row:**
- `match_id=91026`
- `tournament_id=999`
- `start_time=2011-10-25T07:54:25.000Z`
- `league_id=65000`
- winner stored as `Dire`

**Observed player names:**
- **Radiant:** `miGGel`, `Link 🍀`, `AngeL`, `Avilliva`, `CalculuS`
- **Dire:** `Unknown`, `brick by brick`, `Dondoxic`, `Unknown`, `ARS-ART`

**Roster-anchor comparison:**
- Radiant side strongly matches **monkeybusiness**:
  - `miGGel`
  - `Link`
  - `AngeL`
  - `CalculuS`
- Dire side partially matches **Natus Vincere** only via:
  - `ARS-ART`
- Dire side does **not** cleanly show the rest of expected Na`Vi core from Liquipedia:
  - no `XBOCT`
  - no `Dendi`
  - no `LighTofHeaveN`
  - no `Puppey`

**Interpretation:**
- This is a **strong monkeybusiness anchor**.
- The opposing side is plausibly intended to be **Natus Vincere**, but current player rows are only a **partial / noisy representation** of that side.

**Conclusion:**
- very likely the correct semifinal by match ID + timestamp
- one side is strongly validated by roster overlap
- the Na`Vi side remains noisy / partially unidentified

**Status:** `present-but-noisy (high confidence on match identity)`

---

### Match `91105`
**Liquipedia expectation:** monkeybusiness vs GamersLeague (3rd-place match)

**DB row:**
- `match_id=91105`
- `tournament_id=999`
- `start_time=2011-10-25T09:31:38.000Z`
- `league_id=65000`
- winner stored as `Dire`

**Observed player names:**
- **Radiant:** `miGGel`, `Link 🍀`, `AngeL`, `Avilliva`, `CalculuS`
- **Dire:** `🐸 jorgE._. 🐸`, `grizine`, `Unknown`, `Mitch--`, `Buktop`

**Roster-anchor comparison:**
- Radiant side again strongly matches **monkeybusiness**:
  - `miGGel`
  - `Link`
  - `AngeL`
  - `CalculuS`
- Dire side partially matches **GamersLeague**:
  - `grizine`
  - `Mitch` (appears as `Mitch--`)
- Missing / variant / unclear on the rest:
  - expected `BAJA-`, `g0g1`, `ANdre`, `BABARRR`
  - instead we see `🐸 jorgE._. 🐸`, `Buktop`, `Unknown`

**Interpretation:**
- This is another **strong monkeybusiness anchor**.
- The opposing side is plausibly **GamersLeague**, supported by `grizine` and `Mitch--`.
- Roster quality is noisy, but the match identity is consistent with Liquipedia.

**Conclusion:**
- likely the correct 3rd-place match
- identity confidence is fairly strong even though the roster reconstruction is incomplete

**Status:** `present-but-noisy (medium-high confidence)`

---

### Match `91112`
**Liquipedia expectation:** Natus Vincere vs EHOME (Grand Final Game 1)

**DB row:**
- `match_id=91112`
- `tournament_id=999`
- `start_time=2011-10-25T09:59:35.000Z`
- `league_id=65000`
- winner stored as `Radiant`

**Observed player names:**
- **Radiant:** `Unknown`, `brick by brick`, `Dondoxic`, `Unknown`, `ARS-ART`
- **Dire:** `66`, `疯鱼`, `Unknown`, `默苍离`, `奶德`

**Roster-anchor comparison:**
- Radiant side has only one clear **Na`Vi anchor**:
  - `ARS-ART`
- Radiant side still lacks the rest of expected Na`Vi Liquipedia roster as named entries
- Dire side does **not** match the EHOME roster listed on Liquipedia overview page:
  - expected `QQQ`, `ARS`, `NUZ`, `PCT`, `X!!`
  - observed `66`, `疯鱼`, `默苍离`, `奶德`, `Unknown`

**Interpretation:**
- Match ID + timestamp line up with the Liquipedia grand final.
- The roster layer is much noisier than in the monkeybusiness matches.
- One side may still represent Na`Vi in degraded form, but the EHOME side is not currently validated by overview-page roster anchors.

**Conclusion:**
- likely the correct grand final game by structural evidence
- weak roster-based validation
- should not be considered cleanly reconstructed yet

**Status:** `present-but-noisy (structural confidence > roster confidence)`

---

### Match `91151`
**Liquipedia expectation:** Natus Vincere vs EHOME (Grand Final Game 2)

**DB row:**
- `match_id=91151`
- `tournament_id=999`
- `start_time=2011-10-25T10:44:18.000Z`
- `league_id=65000`
- winner stored as `Dire`

**Observed player names:**
- **Radiant:** `66`, `疯鱼`, `Unknown`, `默苍离`, `奶德`
- **Dire:** `Unknown`, `Dondoxic`, `brick by brick`, `Unknown`, `ARS-ART`

**Roster-anchor comparison:**
- Dire side again has only one clear **Na`Vi anchor**:
  - `ARS-ART`
- Radiant side again does **not** match the EHOME overview roster names from Liquipedia
- The two opposing stacks are consistent with `91112`, just mirrored by side

**Interpretation:**
- Same core observation as `91112`
- structurally consistent with being the second grand-final map
- poor direct roster validation against overview-page Liquipedia entries

**Conclusion:**
- likely correct by match ID / timestamp / pairing continuity
- still noisy and incomplete as a roster reconstruction

**Status:** `present-but-noisy (structural confidence > roster confidence)`

---

## Current playoff-layer summary

### Best-supported matches
1. **`91026`** — strong monkeybusiness identification, plausible Na`Vi opponent
2. **`91105`** — strong monkeybusiness identification, partial GamersLeague identification

### Structurally likely but roster-noisy
3. **`91112`** — likely GF Game 1, but weak direct roster confirmation
4. **`91151`** — likely GF Game 2, but weak direct roster confirmation

### Missing
5. **`90992`** — semifinal missing entirely

---

## Practical takeaway

For the ESWC 2011 rebuild, the playoff layer should currently be treated like this:

- `91026` and `91105` are the strongest usable recovered anchors
- `91112` and `91151` are probably right, but need additional evidence if we want clean roster confidence
- `90992` must be recovered from another source or re-import path

This strengthens the case for rebuilding the tournament from exact Liquipedia IDs and source evidence instead of trusting the current `tournament_id=999` roster layer as canonical.
