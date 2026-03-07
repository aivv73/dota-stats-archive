# Liquipedia Pre-2014 Stage 1

This folder contains the first real stage of a larger Dota 2 archive pipeline:
build a local inventory of Liquipedia tournament pages whose start year is
before `2014`, using public Liquipedia MediaWiki API endpoints only.

## Why these endpoints

The Liquipedia Dota 2 wiki exposes public MediaWiki actions such as:

- `action=query`
- `action=parse`
- `action=dota2dbapi`
- `action=lpstatisticsapi`
- `action=getbracketid`

During API exploration, no public `cargoquery` action was exposed on the Dota 2
wiki, so this MVP does not pretend to use Cargo when the public API does not
offer it.

The stage uses:

- `action=query&list=search`
  - Candidate enumerator.
  - Query pattern: `<year> incategory:Tournaments`
  - This keeps the request set focused on pre-2014 pages without crawling all of
    `Category:Tournaments`.
- `action=query&prop=categories|revisions`
  - Fetches categories plus raw page wikitext for candidate pages.
  - The code extracts and parses the first `Infobox ...` template locally.

It deliberately avoids `action=parse` in the main pipeline because Liquipedia's
terms require a much stricter limit for parse requests.

## Liquipedia API constraints implemented here

The client follows the public Liquipedia MediaWiki API terms:

- custom `User-Agent`
- `Accept-Encoding: gzip`
- minimum `2100 ms` between network requests
- local request cache on disk so repeated runs re-use API results

Cache path:

- `pipeline/liquipedia_pre2014_stage1/cache/http/`

## What gets collected

For each candidate page, stage 1 stores:

- title and page id
- matched search years
- categories
- infobox template name
- normalized infobox fields such as `name`, `series`, `organizer`, `sdate`,
  `edate`, `prizepoolusd`, `liquipediatier`, `dotatv`, `leagueid`
- flags:
  - `is_dota2`
  - `is_subpage`
  - `is_qualifier`
  - `included_in_export`
  - `exclusion_reason`
- ticket classification fields:
  - `ticket_status`
  - `ticket_confidence`
  - `ticket_reason`

Storage outputs:

- SQLite: `pipeline/liquipedia_pre2014_stage1/data/liquipedia_pre2014_stage1.db`
- JSON export: `pipeline/liquipedia_pre2014_stage1/data/liquipedia_pre2014_stage1.json`

Derived ticketless-candidate outputs:

- JSON candidate list:
  `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.json`
- CSV candidate list:
  `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.csv`

Those derived files keep **Liquipedia as canonical** for the ticket heuristic and
use **Dota 2 Fandom only as a secondary source** for title/date backfill and
cross-checking. They do **not** upgrade the ticketless heuristic into certainty.

## Ticket classification

This stage is intentionally conservative.

Reliable:

- `ticketed`
  - Assigned only when Liquipedia page source has a non-empty `dotatv` infobox
    field.

Heuristic:

- `likely_ticketless`
  - Assigned only when:
    - `dotatv` is absent, and
    - the tournament start date is earlier than the earliest tournament in the
      collected dataset with an explicit `dotatv` field.

Unknown:

- `unknown`
  - Used for everything else.
  - This is important because missing `dotatv` on Liquipedia is not strong
    enough evidence to claim a later tournament had no ticket.

This means the pipeline does **not** claim that "no `dotatv`" always means "no
ticket".

## Run

From the repository root:

```bash
npm run stage1:liquipedia-pre2014
```

Useful variants:

```bash
npm run stage1:liquipedia-pre2014 -- --refresh-cache
npm run stage1:liquipedia-pre2014 -- --max-pages 50
```

Optional flags:

- `--from-year 2011`
- `--before-year 2014`
- `--batch-size 25`
- `--db /custom/path/output.db`
- `--json /custom/path/output.json`
- `--cache-dir /custom/path/cache`
- `--refresh-cache`

## Scope and limitations

- This is a real stage-1 inventory, not a final tournament truth table.
- Candidate enumeration depends on Liquipedia search index coverage for the year
  terms `2011`, `2012`, `2013`.
- Historical non-Dota-2 pages on the Dota 2 Liquipedia are excluded when the
  infobox explicitly sets `game=dota` or similar.
- If a page has no infobox or no useful date fields, it is kept in SQLite with
  an exclusion reason instead of being silently dropped.
