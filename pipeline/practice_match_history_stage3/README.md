# Practice Match History Stage 3

This stage is intentionally **Dotabuff-only**.

It exists to build a unified local SQLite database of strict Dotabuff practice
history for the cleaned stage-2 player inventory. If Dotabuff cannot be read
reliably, the correct outcome is a **non-canonical / WIP** stage with an exact
blocker report, not a substitution from another data source.

## Scope

- Main player scope:
  `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json`
- Auxiliary account-mapping source:
  `tournaments/d2sc/README.md`

The player scope still inherits the cleaned stage-2 rules:

- `The International 2011` and `Dota2 Star Championship` remain
  supplemental-only upstream player sources.
- D2SC verified IDs are used here only as **auxiliary account enrichment** for
  already-scoped players, and only when alias matching resolves to exactly one
  stage-2 player.

## Strict match definition

Stage 3 only accepts Dotabuff history rows where both visible labels match:

- `Lobby Type = Practice`
- `Game Mode = None`

Rows that fail either label check are discarded, even if they came from a
practice-lobby player history page.

## Current status

As of **2026-03-08**, the committed artifact is **not canonical match data**.
The collector is Dotabuff-only, but the current environment is blocked by a
Cloudflare verification interstitial before Dotabuff history rows become
readable.

The committed SQLite DB and summary are therefore honest **WIP / blocker**
artifacts:

- scope and account provenance are present
- per-player/account collection status is present
- `practice_matches` is empty unless Dotabuff rows were actually read

## 2026-03-08 blocker evidence

The following practical Dotabuff paths were tested and all failed with the same
Cloudflare verification gate:

- Raw HTTP with all saved cookies from
  `pipeline/practice_match_history_stage3/cache/playwright/dotabuff-storage-state.json`
  - HTTP `403`
  - response title/body: `Just a moment...`
- Chromium headless with repo storage state
  - Ray ID: `9d909696df7edbab`
- Chromium persistent/headful under `xvfb-run`
  - Ray ID: `9d9096bb0fd6dc64`
- Firefox persistent/headful under `xvfb-run`
  - Ray ID: `9d9096f2dc190686`
- WebKit persistent/headful under `xvfb-run`
  - Ray ID: `9d9098b5bdbca01e`
- Chromium warmup flow (`https://www.dotabuff.com/` first, then player history)
  - home Ray ID: `9d9097e5ece0dcae`
  - history Ray ID: `9d9098446c24dcae`

The blocker is therefore not “missing Playwright”; it is a source-side
Cloudflare challenge that persists across the available local browser-state
reuse paths.

## Guaranteed fields

If Dotabuff rows are collected, every row in `practice_matches` guarantees at
least:

- `account_id`
- `canonical_handle`
- `match_id`
- `hero_name`
- `match_datetime_utc`

The stage also stores:

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

Canonical SQLite path:

- `pipeline/practice_match_history_stage3/data/practice_match_history_stage3.db`

Tables:

- `collection_runs`
  - run metadata, source status, and blocker report
- `scope_players`
  - one row per scoped stage-2 player
- `player_accounts`
  - one row per verified Dotabuff-processable account, with resumable page state
- `practice_matches`
  - one row per `account_id` + `match_id`

## Incremental / restartable behavior

- The database is **not** rebuilt on every run unless `--reset` is used.
- `player_accounts.next_history_page` stores the next Dotabuff page to try.
- `--max-players` limits the **processable** player subset, not the unresolved
  head of the inventory.
- The collector uses a persistent Playwright profile directory plus the repo’s
  saved storage state when available.

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

For the best available local Dotabuff attempt in this environment:

```bash
xvfb-run -a npm run stage3:practice-match-history -- --headful --browser chromium
```

Useful variants:

```bash
npm run stage3:practice-match-history -- --max-players 25
npm run stage3:practice-match-history -- --reset
npm run stage3:practice-match-history -- --refresh-state
```

Optional flags:

- `--browser chromium|firefox|webkit`
- `--headful`
- `--cache-dir /custom/path/playwright-cache`
- `--persistent-profile-dir /custom/path/persistent-profile`
- `--state /custom/path/dotabuff-storage-state.json`
- `--refresh-state`
- `--probe-wait-ms 20000`
- `--page-delay-ms 1000`
- `--concurrency 1`
- `--cutoff-datetime 2014-12-31T23:59:59Z`
- `--db /custom/path/practice_match_history_stage3.db`
- `--summary /custom/path/practice_match_history_stage3_summary.json`
- `--player-inventory /custom/path/pre2014_ticketless_players.json`
- `--d2sc-readme /custom/path/d2sc/README.md`
- `--max-players 25`
- `--reset`
