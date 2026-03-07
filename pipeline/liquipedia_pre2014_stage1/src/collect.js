#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const {
  API_BASE_URL,
  DEFAULT_MIN_INTERVAL_MS,
  DEFAULT_USER_AGENT,
  LiquipediaApiClient,
} = require('./liquipedia_api');
const {
  buildTournamentRecord,
  classifyTicket,
  computeEarliestExplicitTicketDate,
  summarizeRecords,
} = require('./wikitext_parser');
const {
  openDatabase,
  upsertRun,
  upsertTournamentPage,
  writeJsonExport,
} = require('./storage');

const STAGE_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CACHE_DIR = path.join(STAGE_ROOT, 'cache', 'http');
const DEFAULT_DATA_DIR = path.join(STAGE_ROOT, 'data');
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, 'liquipedia_pre2014_stage1.db');
const DEFAULT_JSON_PATH = path.join(DEFAULT_DATA_DIR, 'liquipedia_pre2014_stage1.json');
const SEARCH_QUERY_TEMPLATE = '<year> incategory:Tournaments';

function chunk(array, size) {
  const chunks = [];

  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }

  return chunks;
}

function parseArguments(argv) {
  const options = {
    batchSize: 25,
    beforeYear: 2014,
    cacheDir: DEFAULT_CACHE_DIR,
    dbPath: DEFAULT_DB_PATH,
    fromYear: 2011,
    jsonPath: DEFAULT_JSON_PATH,
    maxPages: null,
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS,
    refreshCache: false,
    userAgent: DEFAULT_USER_AGENT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    switch (token) {
      case '--batch-size':
        options.batchSize = Number(nextToken);
        index += 1;
        break;
      case '--before-year':
        options.beforeYear = Number(nextToken);
        index += 1;
        break;
      case '--cache-dir':
        options.cacheDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--db':
        options.dbPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--from-year':
        options.fromYear = Number(nextToken);
        index += 1;
        break;
      case '--json':
        options.jsonPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--max-pages':
        options.maxPages = Number(nextToken);
        index += 1;
        break;
      case '--refresh-cache':
        options.refreshCache = true;
        break;
      case '--user-agent':
        options.userAgent = nextToken;
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!Number.isInteger(options.fromYear) || !Number.isInteger(options.beforeYear)) {
    throw new Error('from-year and before-year must be integers');
  }

  if (options.beforeYear <= options.fromYear) {
    throw new Error('before-year must be greater than from-year');
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error('batch-size must be a positive integer');
  }

  return options;
}

function buildExportPayload(options, runId, earliestExplicitTicketDate, records) {
  const includedRecords = records
    .filter((record) => record.included_in_export)
    .sort((left, right) => {
      const leftKey = left.start_date_sort || left.title;
      const rightKey = right.start_date_sort || right.title;
      return leftKey.localeCompare(rightKey);
    });

  return {
    generated_at: new Date().toISOString(),
    run_id: runId,
    api: {
      base_url: API_BASE_URL,
      endpoints_used: [
        'action=query&list=search',
        'action=query&prop=categories|revisions',
      ],
      gzip_required: true,
      rate_limit_ms: options.minIntervalMs,
      search_query_template: SEARCH_QUERY_TEMPLATE,
      user_agent: options.userAgent,
    },
    criteria: {
      before_year: options.beforeYear,
      from_year: options.fromYear,
      window_definition: `start year < ${options.beforeYear}`,
      wiki: 'Liquipedia Dota 2',
    },
    ticket_heuristic: {
      earliest_explicit_ticket_date: earliestExplicitTicketDate,
      explicit_signal: 'non-empty infobox.dotatv field',
      likely_ticketless_signal:
        'no infobox.dotatv field and tournament start date is earlier than the earliest explicit dotatv date in this dataset',
      limitation:
        'absence of infobox.dotatv is not a reliable proof of being ticketless for later tournaments; those pages remain unknown',
    },
    summary: summarizeRecords(records),
    tournaments: includedRecords,
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  fs.mkdirSync(DEFAULT_DATA_DIR, { recursive: true });

  const years = [];

  for (let year = options.fromYear; year < options.beforeYear; year += 1) {
    years.push(year);
  }

  console.log(`[stage1] years: ${years.join(', ')}`);

  const client = new LiquipediaApiClient({
    cacheDir: options.cacheDir,
    minIntervalMs: options.minIntervalMs,
    refreshCache: options.refreshCache,
    userAgent: options.userAgent,
  });

  const titleMap = new Map();

  for (const year of years) {
    const hits = await client.searchTournamentPagesByYear(year);
    console.log(`[stage1] ${year}: ${hits.length} search hits`);

    for (const hit of hits) {
      const existing = titleMap.get(hit.title) || {
        matchedYears: new Set(),
        pageId: hit.pageId,
      };

      existing.matchedYears.add(year);
      existing.pageId = hit.pageId;
      titleMap.set(hit.title, existing);
    }
  }

  let titles = [...titleMap.keys()].sort((left, right) => left.localeCompare(right));

  if (options.maxPages !== null) {
    titles = titles.slice(0, options.maxPages);
  }

  console.log(`[stage1] unique candidate titles: ${titles.length}`);

  const database = openDatabase(options.dbPath);
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const records = [];
  const batches = chunk(titles, options.batchSize);

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    console.log(`[stage1] fetching batch ${index + 1}/${batches.length} (${batch.length} pages)`);

    const pages = await client.fetchPageBatch(batch);

    for (const page of pages) {
      const match = titleMap.get(page.title);
      const matchedYears = match ? [...match.matchedYears] : [];
      records.push(buildTournamentRecord(page, matchedYears, options.beforeYear));
    }
  }

  const earliestExplicitTicketDate = computeEarliestExplicitTicketDate(records);
  const finalRecords = records.map((record) =>
    classifyTicket(record, earliestExplicitTicketDate),
  );
  const finishedAt = new Date().toISOString();

  upsertRun(database, {
    run_id: runId,
    api_base: API_BASE_URL,
    before_year: options.beforeYear,
    earliest_explicit_ticket_date: earliestExplicitTicketDate,
    finished_at: finishedAt,
    from_year: options.fromYear,
    notes:
      'Stage 1 Liquipedia pre-2014 tournament inventory. Public MediaWiki API only; no HTML scraping.',
    request_min_interval_ms: options.minIntervalMs,
    search_query_template: SEARCH_QUERY_TEMPLATE,
    started_at: startedAt,
    user_agent: options.userAgent,
  });

  for (const record of finalRecords) {
    upsertTournamentPage(database, {
      ...record,
      run_id: runId,
    });
  }

  database.close();

  const payload = buildExportPayload(
    options,
    runId,
    earliestExplicitTicketDate,
    finalRecords,
  );

  writeJsonExport(options.jsonPath, payload);

  console.log(
    `[stage1] wrote ${payload.summary.included_in_export} included records to ${options.jsonPath}`,
  );
  console.log(`[stage1] sqlite database: ${options.dbPath}`);
  console.log(
    `[stage1] earliest explicit ticket date: ${earliestExplicitTicketDate || 'not found'}`,
  );
}

main().catch((error) => {
  console.error('[stage1] failed');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
