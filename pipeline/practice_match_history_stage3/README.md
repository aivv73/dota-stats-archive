# Practice Match History Stage 3

This stage builds a unified local SQLite database of **strict practice match
history** for the cleaned stage-2 player inventory.

## Scope

- Main player scope:
  `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json`
- Auxiliary account-mapping source:
  `tournaments/d2sc/README.md`
- Local hero-name source:
  `dota_archive.db` (`heroes` table), when available

The player scope still inherits the cleaned stage-2 rules:

- `The International 2011` and `Dota2 Star Championship` remain
  supplemental-only upstream player sources.
- D2SC verified IDs are used here only as **auxiliary account enrichment** for
  already-scoped players, and only when alias matching resolves to exactly one
  stage-2 player.

## Strict match definition

Stage 3 only stores rows that satisfy both of these numeric filters:

- `lobby_type = 1` (`Practice`)
- `game_mode = 0` (`None`)

The canonical collector now uses the OpenDota player matches API because a live
validation run on **2026-03-08** showed Dotabuff still serving a Cloudflare
interstitial to automated Playwright sessions in this environment.

## Guaranteed fields

Every row in `practice_matches` guarantees at least:

- `account_id`
- `canonical_handle`
- `match_id`
- `hero_name`
- `match_datetime_utc`

The stage also stores:

- `hero_id`
- `start_time_unix`
- `lobby_type_id`
- `game_mode_id`
- `duration_seconds`
- `player_slot`
- `radiant_win`
- `result_label`
- `kills`
- `deaths`
- `assists`
- `source_provider`
- `source_payload_json`
- `collected_at`

## Database schema

Canonical SQLite output:

- `collection_runs`
  - one row per collector execution
- `scope_players`
  - one row per stage-2 player in scope, with mapping and collection status
- `player_accounts`
  - one row per processable account, with resumable pagination state
- `practice_matches`
  - one row per `account_id` + `match_id`

## Incremental / restartable behavior

- The database is **not** rebuilt on every run.
- Account progress is stored in `player_accounts.next_offset`.
- If a run stops mid-account, the next run resumes with a one-page overlap and
  relies on `UNIQUE(account_id, match_id)` to de-duplicate safely.
- `--max-players` only limits the **processable** player subset, not the raw
  unresolved head of the stage-2 inventory.
- `--refresh-complete` forces already completed accounts to be re-read.
- `--reset` recreates the stage-3 schema from scratch.

## Outputs

- SQLite database:
  `pipeline/practice_match_history_stage3/data/practice_match_history_stage3.db`
- JSON summary:
  `pipeline/practice_match_history_stage3/data/practice_match_history_stage3_summary.json`

## Run

From the repository root:

```bash
npm run stage3:practice-match-history
```

Useful variants:

```bash
npm run stage3:practice-match-history -- --max-players 25
npm run stage3:practice-match-history -- --refresh-complete
npm run stage3:practice-match-history -- --reset
```

Optional flags:

- `--api-base-url https://api.opendota.com/api`
- `--batch-size 100`
- `--concurrency 4`
- `--cutoff-datetime 2014-12-31T23:59:59Z`
- `--db /custom/path/practice_match_history_stage3.db`
- `--summary /custom/path/practice_match_history_stage3_summary.json`
- `--player-inventory /custom/path/pre2014_ticketless_players.json`
- `--d2sc-readme /custom/path/d2sc/README.md`
- `--heroes-db /custom/path/dota_archive.db`
- `--max-players 25`
- `--request-delay-ms 250`
- `--refresh-complete`
- `--reset`
