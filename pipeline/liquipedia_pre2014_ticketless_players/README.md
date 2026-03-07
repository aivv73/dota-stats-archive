# Liquipedia Pre-2014 Ticketless Players

This stage turns the integrated
`pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.json`
scope into a **unique player inventory** for the pre-2014 tournaments that are
currently labeled `likely_ticketless`.

## Scope and hierarchy

- The tournament scope is inherited from the stage-1 candidate list.
- That stage keeps **Liquipedia canonical** for the ticket heuristic and uses
  **Dota 2 Fandom only as secondary tournament backfill/cross-check**.
- This player stage uses **Liquipedia only** for roster extraction and player ID
  resolution.

It does **not** re-decide whether a tournament was really ticketless. It only
collects the players that appear in that already-integrated scope.

Current stage-2 cleanup also treats these tournaments as
**supplemental-only player sources**:

- `The International 2011`
- `Dota2 Star Championship`

Players who appear **only** in those supplemental tournaments are excluded from
the final stage-2 output. Their observations are still used to enrich players
who also appear in other target tournaments.

## Liquipedia inputs

Tournament-page roster extraction:

- `action=query&prop=revisions`
- structured signals: `TeamCard.pX`, `TeamCard.pXlink`, `TeamCard.pXid`

Player-page enrichment:

- `action=query&prop=revisions`
- structured signals: `Infobox player.id`, `Infobox player.ids`,
  `Infobox player.playerid`, `Infobox player.accountid`,
  `Infobox player.steamid`, `Infobox player.steamid64`

By default the stage reuses the existing stage-1 HTTP cache to load scoped
tournament pages locally first, and only fetches live tournament pages if a
scope page is missing from that cache.

## Outputs

- JSON:
  `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json`
- CSV:
  `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.csv`

The JSON keeps:

- explicit alias buckets:
  - `observed_names`
  - `linked_page_hints`
  - `liquipedia_handles`
  - `legal_names`
  - `romanized_names`
- explicit ID provenance:
  - `account_ids[].sources`
  - `steam_ids[].sources`
  - `steam_ids[].confidence`
- resolution status / confidence:
  - `resolved_with_player_page_and_ids`
  - `resolved_with_player_page_without_ids`
  - `resolved_with_teamcard_account_id_only`
  - `unresolved_name_only`

Derived SteamID64 values are kept, but they are marked as
`confidence=derived` with source `derived_from_account_id`.

## Cleanup rules

The stage intentionally stays conservative:

- keeps numeric-looking handles when the roster evidence is otherwise plausible
  (for example `820`)
- strips clearly broken trailing comment/ref remnants from observed names before
  normalization
- groups unresolved observations by explicit `TeamCard.pXlink` hints before
  falling back to normalized observed names
- merges unresolved name-only groups into a resolved or ID-backed player only
  when the normalized observed handle points to a **single** stronger match
- does **not** auto-merge on broad alias speculation when the evidence is weak

## Run

From the repository root:

```bash
npm run stage2:ticketless-players
```

Useful variants:

```bash
npm run stage2:ticketless-players -- --refresh-cache
npm run stage2:ticketless-players -- --batch-size 10
```

Optional flags:

- `--scope /custom/path/pre2014_ticketless_candidates.json`
- `--json /custom/path/pre2014_ticketless_players.json`
- `--csv /custom/path/pre2014_ticketless_players.csv`
- `--cache-dir /custom/path/http-cache`
- `--stage1-cache-dir /custom/path/stage1-cache`
- `--refresh-cache`
- `--user-agent "custom user agent"`
