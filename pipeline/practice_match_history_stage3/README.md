# Practice Match History Stage 3

This stage builds a first unified local database of **practice-match history
rows** for the cleaned stage-2 player inventory.

## Scope

- Main player scope:
  `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json`
- Auxiliary account-mapping source:
  `tournaments/d2sc/README.md`

The stage keeps the current business rules in mind:

- `The International 2011` and `Dota2 Star Championship` are supplemental-only
  player sources in the upstream player inventory.
- The collector only uses those supplemental observations when the player also
  appears in other target tournaments.
- The broader `<= 2014` tournament-scope expansion is still upstream work in
  the tournament/player stages, so this database reflects the **current**
  cleaned stage-2 inventory rather than a future-expanded scope.

## What gets collected

Guaranteed per practice-match row:

- `account_id`
- `canonical_handle`
- `match_id`
- `hero_name`
- `match_datetime_utc`

Also stored for provenance and practical extension:

- `match_date_text`
- `result_label`
- `match_type_label`
- `game_mode_label`
- `history_page`
- `match_url`
- `player_history_url`
- `collection_source`
- `row_confidence`
- `collected_at`

## Database schema

The SQLite database intentionally stays small:

- `collection_runs`
  - one row describing the run inputs and cutoff
- `scope_players`
  - one row per stage-2 player in scope, including mapping/collection status
- `player_accounts`
  - verified Dotabuff-processable accounts per scope player
- `practice_matches`
  - one row per `account_id` + `match_id`

This is meant to be extended later with fields such as lobby type, side, team,
duration, and cross-player match grouping.

## Collection method

- Dotabuff source:
  `https://www.dotabuff.com/players/<account_id>/matches?enhance=overview&lobby_type=practice`
- Playwright is used instead of raw HTTP because Dotabuff is Cloudflare-blocked
  for direct scraping.
- The current first pass collects the **first accessible practice-history page**
  per resolved account and filters rows to `<= 2014-12-31T23:59:59Z`.
- If Dotabuff reports more than one history page, the stage records that as a
  **partial / limited** result rather than pretending deeper pages were
  accessible. In this environment, page-2+ history views are currently
  Cloudflare-blocked for automated collection.
- If Dotabuff times out before even page 1 becomes readable, the scope player
  is marked `blocked` rather than `error`, because that outcome is a source
  access problem, not a parsing success claim.
- D2SC verified mappings are applied only when they point to a **single**
  stage-2 player after conservative alias matching.

## Outputs

- SQLite database:
  `pipeline/practice_match_history_stage3/data/practice_match_history_stage3.db`
- JSON run summary:
  `pipeline/practice_match_history_stage3/data/practice_match_history_stage3_summary.json`

## Run

From the repository root:

```bash
npm run stage3:practice-match-history
```

Optional flags:

- `--concurrency 10`
- `--db /custom/path/practice_match_history_stage3.db`
- `--summary /custom/path/practice_match_history_stage3_summary.json`
- `--player-inventory /custom/path/pre2014_ticketless_players.json`
- `--d2sc-readme /custom/path/d2sc/README.md`
- `--cutoff-datetime 2014-12-31T23:59:59Z`
- `--max-players 25`
- `--refresh-state`
