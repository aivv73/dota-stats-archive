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

## Default collection window

The default cutoff is intentionally narrower than the stage-1/stage-2 scope:

- default latest accepted match datetime: `2012-09-30T23:59:59Z`

This reflects the current working assumption that the useful Dotabuff-visible
practice-lobby leakage mostly disappears after mid/late 2012, so scanning past
September 2012 is usually wasted crawl time. You can still override this with
`--cutoff-datetime` if needed.

## Current status

As of **2026-03-08**, the old committed artifact is still a **WIP / blocker**
snapshot, but the local collector logic has since been corrected and validated
against real Dotabuff rows.

What changed in the working collector:

- discovery now uses the ordinary player `matches` history, **not**
  `lobby_type=custom`
- deep-page traversal now runs **from the end backward** toward the cutoff
- strict label matching accepts both English and Russian Dotabuff labels
- match-page verification is still used when readable, but strict history-row
  labels are now admissible when a detail-page follow-up is blocked
- obviously broken timestamps (for example `1970-01-01...`) are pruned

A targeted smoke run on **Dendi / 70388657** successfully recovered strict rows,
including the known-good reference match **`1185505`** with Dotabuff-visible
labels equivalent to `Practice + None`.

So the important distinction is:

- the **committed output files may still lag** behind the latest collector logic
- the **current local collector path is now known-good in principle**

## Earlier blocker evidence (historical)

Before the reverse-scan + ordinary-history rewrite, several earlier approaches
were correctly rejected as non-canonical / blocked. In particular:

- raw HTTP + cookies still hit Cloudflare (`403`, `Just a moment...`)
- `www.dotabuff.com` and `lobby_type=custom` produced misleading or blocked
  paths for the dataset we actually want
- naive forward scans from page 1 were too slow and delayed access to the
  relevant 2011-2012 rows

Those results are still useful as historical debugging evidence, but they are
**not** the current recommended collection strategy.

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
- `--cutoff-datetime 2012-09-30T23:59:59Z`
- `--db /custom/path/practice_match_history_stage3.db`
- `--summary /custom/path/practice_match_history_stage3_summary.json`
- `--player-inventory /custom/path/pre2014_ticketless_players.json`
- `--d2sc-readme /custom/path/d2sc/README.md`
- `--max-players 25`
- `--reset`
