# ESWC 2011 — Account-proven lobbies

This note records ESWC 2011 match IDs that were directly surfaced via known
player account history queries, even when they are not yet present in the local
`matches` table.

Primary API used during this pass:
- OpenDota player match history endpoint
- OpenDota match endpoint for per-match account validation

---

## Na`Vi alt-account confirmed lobbies

Using the user-provided secondary accounts:

- **Puppey alt** — `87277951`
- **LighTofHeaveN alt** — `85716771`

Both accounts returned the same ESWC 2011 match cluster in OpenDota player
history, all with:
- `lobby_type = 1`
- 2011-10-24 / 2011-10-25 timestamps
- structurally matching the Liquipedia ESWC 2011 Group 2 + playoff path

### Confirmed by both Na`Vi alt accounts

| Match ID | Date (UTC) | Liquipedia pairing | Status |
|---:|---|---|---|
| `88913` | 2011-10-24 | BX3 eSports Club vs Natus Vincere | account-confirmed |
| `89136` | 2011-10-24 | Natus Vincere vs GamersLeague | account-confirmed |
| `89314` | 2011-10-24 | NEXT.kz vs Natus Vincere | account-confirmed |
| `89603` | 2011-10-24 | Natus Vincere vs Orange eSports | account-confirmed |
| `91026` | 2011-10-25 | monkeybusiness vs Natus Vincere | account-confirmed |
| `91112` | 2011-10-25 | Natus Vincere vs EHOME — Grand Final Game 1 | account-confirmed |
| `91151` | 2011-10-25 | Natus Vincere vs EHOME — Grand Final Game 2 | account-confirmed |

### Immediate implication

These seven lobbies are now stronger than pure Liquipedia-only candidates:
- they are backed by **direct account-history evidence** from two known Na`Vi alt
  accounts used during the event window.

This is especially important because four of them are currently **missing from
our local `matches` table** despite being directly visible through account
history:
- `88913`
- `89136`
- `89314`
- `89603`

---

## EHOME account confirmation

Using the user-provided EHOME account IDs:

- **QQQ** — `89399750`
- **ARS** — `89425982`
- **NUZ / LaNm** — `89423756`
- **PCT** — `89427480`
- **X!! / MMY** — `89407113`

### Direct per-match validation already observed

OpenDota match-level account data for the grand-final maps shows:

#### Match `91112`
- `89399750` — QQQ
- `89423756` — NUZ / LaNm
- `89425982` — ARS
- `89427480` — PCT
- `89407113` — X!! / MMY

#### Match `91151`
- `89399750` — QQQ
- `89423756` — NUZ / LaNm
- `89425982` — ARS
- `89427480` — PCT
- `89407113` — X!! / MMY

### Note on ARS history

The direct player-history endpoint for `89425982` did **not** surface the 2011
matches in the short returned list, but the account is explicitly present in the
match-level payloads for:
- `91112`
- `91151`

So ARS is still confirmed for those ESWC grand-final maps.

---

## Practical rebuild value

This account-level evidence upgrades the confidence of the following ESWC 2011
match IDs:

### Very strong confirmed Na`Vi-path IDs
- `88913`
- `89136`
- `89314`
- `89603`
- `91026`
- `91112`
- `91151`

### Very strong confirmed EHOME grand-final IDs
- `91112`
- `91151`

These should be treated as priority recovery targets for importing into the
local DB / canonical reconstruction workflow.
