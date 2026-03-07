#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { chromium } = require('playwright');

const STAGE_ROOT = path.resolve(__dirname, '..');
const DEFAULT_DATA_DIR = path.join(STAGE_ROOT, 'data');
const DEFAULT_CACHE_DIR = path.join(STAGE_ROOT, 'cache', 'playwright');
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, 'practice_match_history_stage3.db');
const DEFAULT_SUMMARY_PATH = path.join(
  DEFAULT_DATA_DIR,
  'practice_match_history_stage3_summary.json',
);
const DEFAULT_STATE_PATH = path.join(DEFAULT_CACHE_DIR, 'dotabuff-storage-state.json');
const DEFAULT_PLAYER_INVENTORY_PATH = path.resolve(
  __dirname,
  '../../liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json',
);
const DEFAULT_D2SC_README_PATH = path.resolve(
  __dirname,
  '../../../tournaments/d2sc/README.md',
);
const DOTABUFF_BASE_URL = 'https://www.dotabuff.com';
const DEFAULT_CUTOFF_DATETIME_UTC = '2014-12-31T23:59:59Z';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';

function parseArguments(argv) {
  const options = {
    cacheDir: DEFAULT_CACHE_DIR,
    concurrency: 3,
    cutoffDatetimeUtc: DEFAULT_CUTOFF_DATETIME_UTC,
    dbPath: DEFAULT_DB_PATH,
    d2scReadmePath: DEFAULT_D2SC_README_PATH,
    maxPlayers: null,
    playerInventoryPath: DEFAULT_PLAYER_INVENTORY_PATH,
    refreshState: false,
    statePath: DEFAULT_STATE_PATH,
    summaryPath: DEFAULT_SUMMARY_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    switch (token) {
      case '--cache-dir':
        options.cacheDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--cutoff-datetime':
        options.cutoffDatetimeUtc = nextToken;
        index += 1;
        break;
      case '--concurrency':
        options.concurrency = Number(nextToken);
        index += 1;
        break;
      case '--db':
        options.dbPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--d2sc-readme':
        options.d2scReadmePath = path.resolve(nextToken);
        index += 1;
        break;
      case '--max-players':
        options.maxPlayers = Number(nextToken);
        index += 1;
        break;
      case '--player-inventory':
        options.playerInventoryPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--refresh-state':
        options.refreshState = true;
        break;
      case '--state':
        options.statePath = path.resolve(nextToken);
        index += 1;
        break;
      case '--summary':
        options.summaryPath = path.resolve(nextToken);
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (
    options.maxPlayers !== null &&
    (!Number.isInteger(options.maxPlayers) || options.maxPlayers <= 0)
  ) {
    throw new Error('max-players must be a positive integer');
  }

  if (!Number.isFinite(Date.parse(options.cutoffDatetimeUtc))) {
    throw new Error('cutoff-datetime must be an ISO-8601 datetime string');
  }

  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
    throw new Error('concurrency must be a positive integer');
  }

  return options;
}

function unique(values) {
  const seen = new Set();
  const results = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const key = String(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(value);
  }

  return results;
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDotabuffHistoryUrl(accountId, pageNumber = 1) {
  const base = `${DOTABUFF_BASE_URL}/players/${accountId}/matches?enhance=overview&lobby_type=practice`;
  return pageNumber > 1 ? `${base}&page=${pageNumber}` : base;
}

function runSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  const result = statement.run(...params);

  return Promise.resolve({
    changes: result.changes,
    lastID: Number(result.lastInsertRowid || 0),
  });
}

function getSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  return Promise.resolve(statement.get(...params) || null);
}

function allSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  return Promise.resolve(statement.all(...params) || []);
}

async function initializeDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);

  await runSql(database, 'PRAGMA foreign_keys = ON');
  await runSql(database, 'DROP TABLE IF EXISTS practice_matches');
  await runSql(database, 'DROP TABLE IF EXISTS player_accounts');
  await runSql(database, 'DROP TABLE IF EXISTS scope_players');
  await runSql(database, 'DROP TABLE IF EXISTS collection_runs');

  await runSql(
    database,
    `CREATE TABLE collection_runs (
      run_id TEXT PRIMARY KEY,
      generated_at TEXT NOT NULL,
      cutoff_datetime_utc TEXT NOT NULL,
      player_inventory_path TEXT NOT NULL,
      d2sc_readme_path TEXT NOT NULL,
      notes TEXT
    )`,
  );

  await runSql(
    database,
    `CREATE TABLE scope_players (
      scope_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
      canonical_handle TEXT NOT NULL,
      liquipedia_page_title TEXT,
      scope_role TEXT NOT NULL,
      resolution_status TEXT NOT NULL,
      resolution_confidence TEXT NOT NULL,
      primary_target_tournaments_json TEXT NOT NULL,
      supplemental_source_tournaments_json TEXT NOT NULL,
      account_mapping_status TEXT NOT NULL,
      account_count INTEGER NOT NULL,
      processable INTEGER NOT NULL,
      collection_status TEXT NOT NULL,
      matches_collected_count INTEGER NOT NULL DEFAULT 0,
      mapping_note TEXT,
      collection_note TEXT
    )`,
  );

  await runSql(
    database,
    `CREATE TABLE player_accounts (
      player_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
      scope_player_id INTEGER NOT NULL,
      account_id TEXT NOT NULL,
      canonical_handle TEXT NOT NULL,
      mapping_sources_json TEXT NOT NULL,
      mapping_confidence TEXT NOT NULL,
      mapping_note TEXT,
      dotabuff_player_url TEXT NOT NULL,
      UNIQUE(scope_player_id, account_id),
      FOREIGN KEY(scope_player_id) REFERENCES scope_players(scope_player_id)
    )`,
  );

  await runSql(
    database,
    `CREATE TABLE practice_matches (
      practice_match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      scope_player_id INTEGER NOT NULL,
      account_id TEXT NOT NULL,
      canonical_handle TEXT NOT NULL,
      match_id TEXT NOT NULL,
      hero_name TEXT NOT NULL,
      match_datetime_utc TEXT,
      match_date_text TEXT,
      result_label TEXT,
      match_type_label TEXT,
      game_mode_label TEXT,
      history_page INTEGER NOT NULL,
      match_url TEXT NOT NULL,
      player_history_url TEXT NOT NULL,
      collection_source TEXT NOT NULL,
      row_confidence TEXT NOT NULL,
      collected_at TEXT NOT NULL,
      UNIQUE(account_id, match_id),
      FOREIGN KEY(scope_player_id) REFERENCES scope_players(scope_player_id)
    )`,
  );

  await runSql(
    database,
    'CREATE INDEX idx_practice_matches_match_id ON practice_matches(match_id)',
  );
  await runSql(
    database,
    'CREATE INDEX idx_practice_matches_scope_player_id ON practice_matches(scope_player_id)',
  );
  await runSql(
    database,
    'CREATE INDEX idx_player_accounts_scope_player_id ON player_accounts(scope_player_id)',
  );

  return database;
}

function parseD2scMappings(readmeText) {
  const mappings = [];

  for (const line of readmeText.split(/\r?\n/)) {
    const match = line.match(/^[-*]\s+\*\*(.+?)\*\*(?:\s+\((.+?)\))?.*?:\s+`(\d+)`/);

    if (!match) {
      continue;
    }

    const rawCanonical = match[1].trim();
    const inlineAliasText = match[2] ? match[2].trim() : '';
    const aliases = [];
    const canonicalWithoutParens = rawCanonical.replace(/\s*\([^)]*\)/g, '').trim();

    aliases.push(rawCanonical);

    if (canonicalWithoutParens && canonicalWithoutParens !== rawCanonical) {
      aliases.push(canonicalWithoutParens);
    }

    for (const parenMatch of rawCanonical.matchAll(/\(([^)]+)\)/g)) {
      aliases.push(parenMatch[1].trim());
    }

    if (inlineAliasText) {
      for (const alias of inlineAliasText.split(/[;,/]/)) {
        aliases.push(alias.trim());
      }
    }

    mappings.push({
      account_id: match[3],
      canonical: canonicalWithoutParens || rawCanonical,
      source_line: line.trim(),
      aliases: unique(aliases),
    });
  }

  return mappings;
}

function loadScopePlayers(playerInventoryPath, d2scReadmePath) {
  const inventory = JSON.parse(fs.readFileSync(playerInventoryPath, 'utf8'));
  const d2scReadme = fs.readFileSync(d2scReadmePath, 'utf8');
  const d2scMappings = parseD2scMappings(d2scReadme);
  const players = inventory.players.map((player, index) => ({
    ...player,
    inventory_index: index,
  }));
  const aliasIndex = new Map();

  for (const player of players) {
    const aliases = unique(
      [
        player.canonical_handle,
        player.liquipedia_page_title,
        ...(player.aliases?.observed_names || []),
        ...(player.aliases?.liquipedia_handles || []),
      ].filter(Boolean),
    );

    for (const alias of aliases) {
      const key = normalizeKey(alias);

      if (!key) {
        continue;
      }

      const candidates = aliasIndex.get(key) || [];

      if (!candidates.includes(player.inventory_index)) {
        candidates.push(player.inventory_index);
      }

      aliasIndex.set(key, candidates);
    }
  }

  const auxiliaryMappingsByPlayerIndex = new Map();

  for (const mapping of d2scMappings) {
    const candidateIndexes = new Set();

    for (const alias of mapping.aliases) {
      const matches = aliasIndex.get(normalizeKey(alias)) || [];

      for (const inventoryIndex of matches) {
        candidateIndexes.add(inventoryIndex);
      }
    }

    if (candidateIndexes.size !== 1) {
      continue;
    }

    const inventoryIndex = [...candidateIndexes][0];
    const existing = auxiliaryMappingsByPlayerIndex.get(inventoryIndex) || [];
    existing.push(mapping);
    auxiliaryMappingsByPlayerIndex.set(inventoryIndex, existing);
  }

  const enrichedPlayers = players.map((player) => {
    const stage2AccountMappings = (player.account_ids || []).map((entry) => ({
      account_id: entry.value,
      confidence: 'explicit',
      note: `stage2 sources: ${(entry.sources || []).join(' | ')}`,
      sources: ['stage2_player_inventory'],
    }));
    const auxiliaryMappings = (auxiliaryMappingsByPlayerIndex.get(player.inventory_index) || []).map(
      (mapping) => ({
        account_id: mapping.account_id,
        confidence: 'verified_auxiliary',
        note: mapping.source_line,
        sources: ['d2sc_verified_readme'],
      }),
    );
    const mergedByAccountId = new Map();

    for (const mapping of stage2AccountMappings.concat(auxiliaryMappings)) {
      const existing = mergedByAccountId.get(mapping.account_id);

      if (!existing) {
        mergedByAccountId.set(mapping.account_id, {
          account_id: mapping.account_id,
          confidence: mapping.confidence,
          notes: mapping.note ? [mapping.note] : [],
          sources: [...mapping.sources],
        });
        continue;
      }

      existing.sources = unique(existing.sources.concat(mapping.sources));

      if (mapping.note) {
        existing.notes = unique(existing.notes.concat([mapping.note]));
      }

      if (existing.confidence !== 'explicit' && mapping.confidence === 'explicit') {
        existing.confidence = 'explicit';
      }
    }

    const accountMappings = [...mergedByAccountId.values()]
      .sort((left, right) => left.account_id.localeCompare(right.account_id))
      .map((mapping) => ({
        account_id: mapping.account_id,
        dotabuff_player_url: `${DOTABUFF_BASE_URL}/players/${mapping.account_id}`,
        mapping_confidence: mapping.confidence,
        mapping_note: mapping.notes.join(' | ') || null,
        mapping_sources: mapping.sources,
      }));

    let accountMappingStatus = 'unresolved';

    if (accountMappings.length > 0) {
      const sourceSet = new Set(accountMappings.flatMap((mapping) => mapping.mapping_sources));

      if (sourceSet.size === 1 && sourceSet.has('stage2_player_inventory')) {
        accountMappingStatus = 'resolved_from_stage2';
      } else if (sourceSet.size === 1 && sourceSet.has('d2sc_verified_readme')) {
        accountMappingStatus = 'resolved_from_d2sc';
      } else {
        accountMappingStatus = 'resolved_from_multiple_sources';
      }
    }

    return {
      ...player,
      account_mappings: accountMappings,
      account_mapping_status: accountMappingStatus,
    };
  });

  return {
    d2scMappings,
    inventory,
    players: enrichedPlayers,
  };
}

async function createBrowserContext(statePath, refreshState) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });
  const contextOptions = {
    locale: 'en-US',
    timezoneId: 'UTC',
    userAgent: DEFAULT_USER_AGENT,
    viewport: {
      height: 768,
      width: 1366,
    },
  };

  if (!refreshState && fs.existsSync(statePath)) {
    contextOptions.storageState = statePath;
  }

  const context = await browser.newContext(contextOptions);

  await context.route(/\.(?:png|jpg|jpeg|gif|webp|svg|css|woff2?|ttf)$/i, (route) =>
    route.abort(),
  );

  return {
    browser,
    context,
  };
}

async function waitForDotabuffContent(page) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0) {
      return 'table';
    }

    const bodyText = await page.locator('body').innerText();

    if (/No matches found/i.test(bodyText) || /This profile is private/i.test(bodyText)) {
      return 'empty';
    }

    if (/Page not found/i.test(bodyText) || /Sorry, we couldn't find that page/i.test(bodyText)) {
      return 'missing';
    }

    await page.waitForTimeout(1000);
  }

  return 'timeout';
}

async function gotoHistoryPage(page, url, statePath, persistState = false) {
  await page.goto(url, {
    timeout: 60000,
    waitUntil: 'domcontentloaded',
  });

  const state = await waitForDotabuffContent(page);

  if (persistState && state === 'table') {
    await page.context().storageState({ path: statePath });
  }

  return state;
}

async function getLastPageNumber(page) {
  return page.locator('.pagination').evaluate((node) => {
    const lastLink = [...node.querySelectorAll('a')].find((anchor) =>
      /Last/i.test((anchor.textContent || '').trim()),
    );

    if (!lastLink) {
      return 1;
    }

    const match = lastLink.href.match(/[?&]page=(\d+)/);
    return match ? Number(match[1]) : 1;
  }).catch(() => 1);
}

async function extractMatchRows(page, historyUrl, historyPage) {
  return page.locator('table tbody tr').evaluateAll(
    (rows, rowContext) =>
      rows
        .map((row) => {
          const cells = row.querySelectorAll('td');
          const matchLink = row.querySelector('td.cell-large a[href*="/matches/"]');
          const timeNode = row.querySelector('time');
          const matchHref = matchLink?.getAttribute('href') || null;
          const matchId = matchHref?.match(/\/matches\/(\d+)/)?.[1] || null;
          const heroName = matchLink?.textContent?.trim() || null;
          const resultLabel = cells[3]?.querySelector('a')?.textContent?.trim() || null;
          const matchTypeLabel = cells[4]?.childNodes?.[0]?.textContent?.trim() || null;
          const gameModeLabel = cells[4]?.querySelector('.subtext')?.textContent?.trim() || null;

          if (!matchId || !heroName) {
            return null;
          }

          return {
            collection_source: 'dotabuff_player_history',
            game_mode_label: gameModeLabel || null,
            hero_name: heroName,
            history_page: rowContext.historyPage,
            match_date_text: timeNode?.textContent?.trim() || null,
            match_datetime_utc: timeNode?.getAttribute('datetime') || null,
            match_id: matchId,
            match_type_label: matchTypeLabel || null,
            match_url: matchHref ? new URL(matchHref, location.origin).toString() : null,
            player_history_url: rowContext.historyUrl,
            result_label: resultLabel || null,
            row_confidence: 'scraped_history_row',
          };
        })
        .filter(Boolean),
    { historyPage, historyUrl },
  );
}

function compareDateToCutoff(row, cutoffTimestamp) {
  const rowTimestamp = Date.parse(row.match_datetime_utc || '');

  if (!Number.isFinite(rowTimestamp)) {
    return {
      isOnOrBeforeCutoff: false,
      timestamp: null,
    };
  }

  return {
    isOnOrBeforeCutoff: rowTimestamp <= cutoffTimestamp,
    timestamp: rowTimestamp,
  };
}

async function collectPracticeMatchesForAccount(page, accountMapping, cutoffTimestamp, statePath) {
  const firstPageUrl = buildDotabuffHistoryUrl(accountMapping.account_id, 1);
  let initialState = await gotoHistoryPage(page, firstPageUrl, statePath);

  if (initialState === 'timeout') {
    initialState = await gotoHistoryPage(page, firstPageUrl, statePath);
  }

  if (initialState === 'missing' || initialState === 'empty') {
    return {
      history_pages_scanned: 1,
      last_page_number: 1,
      rows: [],
      status: initialState,
    };
  }

  if (initialState !== 'table') {
    return {
      history_pages_scanned: 1,
      last_page_number: 1,
      rows: [],
      status: initialState,
    };
  }

  const lastPageNumber = await getLastPageNumber(page);
  const pageRows = await extractMatchRows(page, firstPageUrl, 1);
  const rows = [];

  for (const row of pageRows) {
    const comparison = compareDateToCutoff(row, cutoffTimestamp);

    if (comparison.isOnOrBeforeCutoff) {
      rows.push(row);
    }
  }

  return {
    history_pages_scanned: 1,
    last_page_number: lastPageNumber,
    note:
      lastPageNumber > 1
        ? `Collected only accessible page 1; Dotabuff pagination reports ${lastPageNumber} page(s), but deeper history pages are currently Cloudflare-blocked in this environment`
        : null,
    rows,
    status: 'ok',
  };
}

async function collectScopePlayer(database, page, scopePlayer, cutoffTimestamp, statePath) {
  console.log(
    `[stage3] ${scopePlayer.canonical_handle}: ${scopePlayer.account_mappings.length} account(s)`,
  );

  let totalRowsForPlayer = 0;
  let totalPagesScanned = 0;
  const blockingNotes = [];
  const collectionNotes = [];
  const hardErrors = [];

  for (const mapping of scopePlayer.account_mappings) {
    try {
      const result = await collectPracticeMatchesForAccount(
        page,
        mapping,
        cutoffTimestamp,
        statePath,
      );

      totalPagesScanned += result.history_pages_scanned;
      totalRowsForPlayer += result.rows.length;
      await insertPracticeMatches(
        database,
        scopePlayer.scope_player_id,
        scopePlayer,
        mapping.account_id,
        result.rows,
      );

      if (result.status !== 'ok' && result.status !== 'empty' && result.status !== 'missing') {
        const note = `Dotabuff page status for ${mapping.account_id}: ${result.status}`;

        if (result.status === 'timeout') {
          blockingNotes.push(note);
        } else {
          hardErrors.push(note);
        }
      }

      if (result.note) {
        collectionNotes.push(`${mapping.account_id}: ${result.note}`);
      }
    } catch (error) {
      hardErrors.push(`${mapping.account_id}: ${error.message}`);
      console.error(`[stage3] ${scopePlayer.canonical_handle} failed: ${error.message}`);
    }
  }

  const collectionStatus = hardErrors.length > 0
    ? totalRowsForPlayer > 0
      ? 'partial'
      : 'error'
    : blockingNotes.length > 0
      ? totalRowsForPlayer > 0
        ? 'partial'
        : 'blocked'
    : collectionNotes.length > 0
      ? totalRowsForPlayer > 0
        ? 'partial'
        : 'limited'
    : totalRowsForPlayer > 0
      ? 'collected'
      : 'no_rows';
  const combinedNote = unique(
    [...hardErrors, ...blockingNotes, ...collectionNotes].filter(Boolean),
  ).join(' | ') || null;

  await updateScopePlayerCollection(
    database,
    scopePlayer.scope_player_id,
    collectionStatus,
    totalRowsForPlayer,
    combinedNote,
  );

  return {
    canonical_handle: scopePlayer.canonical_handle,
    collection_note: combinedNote,
    collection_status: collectionStatus,
    history_pages_scanned: totalPagesScanned,
    match_rows_collected: totalRowsForPlayer,
    scope_player_id: scopePlayer.scope_player_id,
  };
}

async function insertScopePlayer(database, scopePlayer) {
  const result = await runSql(
    database,
    `INSERT INTO scope_players (
      canonical_handle,
      liquipedia_page_title,
      scope_role,
      resolution_status,
      resolution_confidence,
      primary_target_tournaments_json,
      supplemental_source_tournaments_json,
      account_mapping_status,
      account_count,
      processable,
      collection_status,
      matches_collected_count,
      mapping_note,
      collection_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scopePlayer.canonical_handle,
      scopePlayer.liquipedia_page_title || null,
      scopePlayer.scope_role,
      scopePlayer.resolution_status,
      scopePlayer.resolution_confidence,
      JSON.stringify(scopePlayer.primary_target_tournaments || []),
      JSON.stringify(scopePlayer.supplemental_source_tournaments || []),
      scopePlayer.account_mapping_status,
      scopePlayer.account_mappings.length,
      scopePlayer.account_mappings.length > 0 ? 1 : 0,
      scopePlayer.account_mappings.length > 0 ? 'pending' : 'unresolved',
      0,
      scopePlayer.account_mappings
        .flatMap((mapping) => mapping.mapping_sources)
        .filter(Boolean)
        .join(' | ') || null,
      scopePlayer.account_mappings.length > 0 ? null : 'No verified account mapping available',
    ],
  );

  return result.lastID;
}

async function insertPlayerAccounts(database, scopePlayerId, scopePlayer) {
  for (const mapping of scopePlayer.account_mappings) {
    await runSql(
      database,
      `INSERT INTO player_accounts (
        scope_player_id,
        account_id,
        canonical_handle,
        mapping_sources_json,
        mapping_confidence,
        mapping_note,
        dotabuff_player_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        scopePlayerId,
        mapping.account_id,
        scopePlayer.canonical_handle,
        JSON.stringify(mapping.mapping_sources),
        mapping.mapping_confidence,
        mapping.mapping_note,
        mapping.dotabuff_player_url,
      ],
    );
  }
}

async function insertPracticeMatches(database, scopePlayerId, scopePlayer, accountId, rows) {
  const collectedAt = new Date().toISOString();

  for (const row of rows) {
    await runSql(
      database,
      `INSERT OR IGNORE INTO practice_matches (
        scope_player_id,
        account_id,
        canonical_handle,
        match_id,
        hero_name,
        match_datetime_utc,
        match_date_text,
        result_label,
        match_type_label,
        game_mode_label,
        history_page,
        match_url,
        player_history_url,
        collection_source,
        row_confidence,
        collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scopePlayerId,
        accountId,
        scopePlayer.canonical_handle,
        row.match_id,
        row.hero_name,
        row.match_datetime_utc,
        row.match_date_text,
        row.result_label,
        row.match_type_label,
        row.game_mode_label,
        row.history_page,
        row.match_url,
        row.player_history_url,
        row.collection_source,
        row.row_confidence,
        collectedAt,
      ],
    );
  }
}

async function updateScopePlayerCollection(database, scopePlayerId, status, matchCount, note) {
  await runSql(
    database,
    `UPDATE scope_players
     SET collection_status = ?, matches_collected_count = ?, collection_note = ?
     WHERE scope_player_id = ?`,
    [status, matchCount, note, scopePlayerId],
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const cutoffTimestamp = Date.parse(options.cutoffDatetimeUtc);
  const runId = crypto.randomUUID();

  fs.mkdirSync(path.dirname(options.dbPath), { recursive: true });
  fs.mkdirSync(path.dirname(options.summaryPath), { recursive: true });
  fs.mkdirSync(options.cacheDir, { recursive: true });

  const database = await initializeDatabase(options.dbPath);

  await runSql(
    database,
    `INSERT INTO collection_runs (
      run_id,
      generated_at,
      cutoff_datetime_utc,
      player_inventory_path,
      d2sc_readme_path,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      runId,
      new Date().toISOString(),
      options.cutoffDatetimeUtc,
      path.relative(path.resolve(STAGE_ROOT, '..', '..'), options.playerInventoryPath),
      path.relative(path.resolve(STAGE_ROOT, '..', '..'), options.d2scReadmePath),
      'Dotabuff practice-match history collector using the cleaned stage-2 player inventory as scope.',
    ],
  );

  const { inventory, players: scopePlayers } = loadScopePlayers(
    options.playerInventoryPath,
    options.d2scReadmePath,
  );
  const playersToInsert =
    options.maxPlayers === null ? scopePlayers : scopePlayers.slice(0, options.maxPlayers);
  const scopePlayerRecords = [];

  for (const scopePlayer of playersToInsert) {
    const scopePlayerId = await insertScopePlayer(database, scopePlayer);
    await insertPlayerAccounts(database, scopePlayerId, scopePlayer);
    scopePlayerRecords.push({
      ...scopePlayer,
      scope_player_id: scopePlayerId,
    });
  }

  const { browser, context } = await createBrowserContext(options.statePath, options.refreshState);
  const perPlayerSummaries = [];

  try {
    const processablePlayers = [];

    for (const scopePlayer of scopePlayerRecords) {
      if (scopePlayer.account_mappings.length === 0) {
        perPlayerSummaries.push({
          canonical_handle: scopePlayer.canonical_handle,
          collection_status: 'unresolved',
          history_pages_scanned: 0,
          match_rows_collected: 0,
          scope_player_id: scopePlayer.scope_player_id,
        });
        continue;
      }

      processablePlayers.push(scopePlayer);
    }

    if (processablePlayers.length > 0) {
      const bootstrapPage = await context.newPage();

      try {
        const bootstrapUrl = buildDotabuffHistoryUrl(
          processablePlayers[0].account_mappings[0].account_id,
          1,
        );
        await gotoHistoryPage(bootstrapPage, bootstrapUrl, options.statePath, true);
      } finally {
        await bootstrapPage.close();
      }

      let nextProcessableIndex = 0;
      const workerCount = Math.min(options.concurrency, processablePlayers.length);
      const workers = Array.from({ length: workerCount }, async () => {
        const workerPage = await context.newPage();

        try {
          while (nextProcessableIndex < processablePlayers.length) {
            const scopePlayer = processablePlayers[nextProcessableIndex];
            nextProcessableIndex += 1;
            const summary = await collectScopePlayer(
              database,
              workerPage,
              scopePlayer,
              cutoffTimestamp,
              options.statePath,
            );
            perPlayerSummaries.push(summary);
          }
        } finally {
          await workerPage.close();
        }
      });

      await Promise.all(workers);
    }
  } finally {
    await browser.close();
  }

  const counts = {
    d2sc_verified_mappings_loaded: loadScopePlayers(
      options.playerInventoryPath,
      options.d2scReadmePath,
    ).d2scMappings.length,
    players_total: scopePlayerRecords.length,
    players_with_accounts: scopePlayerRecords.filter(
      (player) => player.account_mappings.length > 0,
    ).length,
    players_without_accounts: scopePlayerRecords.filter(
      (player) => player.account_mappings.length === 0,
    ).length,
    players_with_d2sc_auxiliary_accounts: scopePlayerRecords.filter((player) =>
      player.account_mappings.some((mapping) => mapping.mapping_sources.includes('d2sc_verified_readme')),
    ).length,
  };
  const aggregateRows = await getSql(
    database,
    `SELECT
       COUNT(*) AS practice_match_rows,
       COUNT(DISTINCT match_id) AS distinct_match_ids,
       COUNT(DISTINCT account_id) AS distinct_accounts
     FROM practice_matches`,
  );
  const collectionStatuses = await allSql(
    database,
    'SELECT collection_status, COUNT(*) AS count FROM scope_players GROUP BY collection_status',
  );
  const summary = {
    generated_at: new Date().toISOString(),
    run_id: runId,
    input_files: {
      d2sc_readme: path.relative(path.resolve(STAGE_ROOT, '..', '..'), options.d2scReadmePath),
      player_inventory: path.relative(
        path.resolve(STAGE_ROOT, '..', '..'),
        options.playerInventoryPath,
      ),
    },
    cutoff_datetime_utc: options.cutoffDatetimeUtc,
    counts: {
      ...counts,
      collection_statuses: collectionStatuses,
      distinct_accounts_collected: aggregateRows?.distinct_accounts || 0,
      distinct_match_ids_collected: aggregateRows?.distinct_match_ids || 0,
      practice_match_rows_collected: aggregateRows?.practice_match_rows || 0,
    },
    caveats: [
      'Dotabuff history pages are collected through Playwright because direct HTTP requests are Cloudflare-blocked.',
      'If Dotabuff does not expose readable page content during a run, scope players are marked blocked rather than treated as successfully collected.',
      'The current step-3 scope inherits the existing cleaned stage-2 player inventory. The broader <=2014 tournament-scope expansion still has to happen upstream in the tournament/player stages.',
      'Only players with explicit stage-2 account IDs or uniquely matched D2SC verified account IDs are processable in this first pass.',
      'Rows are one player-account to one match. The same match_id can appear multiple times across different players.',
      'The collector stores match datetime, hero, and account/player provenance. It does not yet guarantee lobby type, side, team, or duration in the database.',
    ],
    top_players_by_rows: perPlayerSummaries
      .filter((row) => row.match_rows_collected > 0)
      .sort((left, right) => right.match_rows_collected - left.match_rows_collected)
      .slice(0, 25),
  };

  fs.writeFileSync(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

  const scopeRow = await getSql(database, 'SELECT COUNT(*) AS count FROM scope_players');
  const accountRow = await getSql(database, 'SELECT COUNT(*) AS count FROM player_accounts');

  console.log(`[stage3] scope players: ${scopeRow?.count || 0}`);
  console.log(`[stage3] player accounts: ${accountRow?.count || 0}`);
  console.log(`[stage3] practice match rows: ${aggregateRows?.practice_match_rows || 0}`);
  console.log(`[stage3] distinct match ids: ${aggregateRows?.distinct_match_ids || 0}`);
  console.log(`[stage3] summary: ${options.summaryPath}`);

  database.close();
}

main().catch((error) => {
  console.error('[stage3] failed');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
