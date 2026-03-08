#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { chromium, firefox, webkit } = require('playwright');

const STAGE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(STAGE_ROOT, '..', '..');
const DEFAULT_DATA_DIR = path.join(STAGE_ROOT, 'data');
const DEFAULT_CACHE_DIR = path.join(STAGE_ROOT, 'cache', 'playwright');
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, 'practice_match_history_stage3.db');
const DEFAULT_SUMMARY_PATH = path.join(
  DEFAULT_DATA_DIR,
  'practice_match_history_stage3_summary.json',
);
const DEFAULT_STATE_PATH = path.join(DEFAULT_CACHE_DIR, 'dotabuff-storage-state.json');
const DEFAULT_PERSISTENT_PROFILE_DIR = path.join(DEFAULT_CACHE_DIR, 'persistent', 'chromium');
const DEFAULT_PLAYER_INVENTORY_PATH = path.resolve(
  __dirname,
  '../../liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json',
);
const DEFAULT_D2SC_README_PATH = path.resolve(
  __dirname,
  '../../../tournaments/d2sc/README.md',
);
const DOTABUFF_BASE_URL = 'https://ru.dotabuff.com';
const DOTABUFF_HOME_URL = `${DOTABUFF_BASE_URL}/`;
const DEFAULT_BROWSER_ENGINE = 'chromium';
const DEFAULT_CUTOFF_DATETIME_UTC = '2014-12-31T23:59:59Z';
const DEFAULT_PROBE_WAIT_MS = 20000;
const DEFAULT_PAGE_DELAY_MS = 1000;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';
const STRICT_LOBBY_TYPE_LABEL_KEYS = new Set(['practice', 'тренировочный']);
const STRICT_GAME_MODE_LABEL_KEYS = new Set(['none', 'нет']);
const SCHEMA_VERSION = 4;
const matchVerificationCache = new Map();

function parseArguments(argv) {
  const options = {
    browserEngine: DEFAULT_BROWSER_ENGINE,
    cacheDir: DEFAULT_CACHE_DIR,
    concurrency: 1,
    cutoffDatetimeUtc: DEFAULT_CUTOFF_DATETIME_UTC,
    dbPath: DEFAULT_DB_PATH,
    d2scReadmePath: DEFAULT_D2SC_README_PATH,
    headful: false,
    maxPlayers: null,
    pageDelayMs: DEFAULT_PAGE_DELAY_MS,
    persistentProfileDir: DEFAULT_PERSISTENT_PROFILE_DIR,
    playerInventoryPath: DEFAULT_PLAYER_INVENTORY_PATH,
    probeWaitMs: DEFAULT_PROBE_WAIT_MS,
    refreshState: false,
    reset: false,
    statePath: DEFAULT_STATE_PATH,
    summaryPath: DEFAULT_SUMMARY_PATH,
    useState: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    switch (token) {
      case '--browser':
        options.browserEngine = String(nextToken || '').trim();
        index += 1;
        break;
      case '--cache-dir':
        options.cacheDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--concurrency':
        options.concurrency = Number(nextToken);
        index += 1;
        break;
      case '--cutoff-datetime':
        options.cutoffDatetimeUtc = nextToken;
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
      case '--headful':
        options.headful = true;
        break;
      case '--max-players':
        options.maxPlayers = Number(nextToken);
        index += 1;
        break;
      case '--page-delay-ms':
        options.pageDelayMs = Number(nextToken);
        index += 1;
        break;
      case '--persistent-profile-dir':
        options.persistentProfileDir = path.resolve(nextToken);
        index += 1;
        break;
      case '--player-inventory':
        options.playerInventoryPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--probe-wait-ms':
        options.probeWaitMs = Number(nextToken);
        index += 1;
        break;
      case '--refresh-state':
        options.refreshState = true;
        break;
      case '--reset':
        options.reset = true;
        break;
      case '--state':
        options.statePath = path.resolve(nextToken);
        index += 1;
        break;
      case '--summary':
        options.summaryPath = path.resolve(nextToken);
        index += 1;
        break;
      case '--use-state':
        options.useState = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!['chromium', 'firefox', 'webkit'].includes(options.browserEngine)) {
    throw new Error('browser must be one of: chromium, firefox, webkit');
  }

  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
    throw new Error('concurrency must be a positive integer');
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

  if (!Number.isInteger(options.pageDelayMs) || options.pageDelayMs < 0) {
    throw new Error('page-delay-ms must be an integer >= 0');
  }

  if (!Number.isInteger(options.probeWaitMs) || options.probeWaitMs <= 0) {
    throw new Error('probe-wait-ms must be a positive integer');
  }

  return options;
}

function unique(values) {
  const seen = new Set();
  const results = [];

  for (const value of values) {
    if (value === null || value === undefined || value === '') {
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

function relativeToRepo(filePath) {
  return path.relative(REPO_ROOT, filePath);
}

function buildDotabuffHistoryUrl(accountId, pageNumber = 1) {
  const base = `${DOTABUFF_BASE_URL}/players/${accountId}/matches`;
  return pageNumber > 1 ? `${base}?page=${pageNumber}` : base;
}

function buildDotabuffMatchUrl(matchId) {
  return `${DOTABUFF_BASE_URL}/matches/${matchId}`;
}

function extractRayId(bodyText) {
  const match = String(bodyText || '').match(/Ray ID:\s*([A-Za-z0-9]+)/i);
  return match ? match[1] : null;
}

function summarizeText(bodyText) {
  return String(bodyText || '').replace(/\s+/g, ' ').trim().slice(0, 260);
}

function buildScopePlayerKey(player) {
  const identity = {
    account_ids: unique((player.account_mappings || []).map((mapping) => mapping.account_id)).sort(),
    aliases: unique(
      [
        player.canonical_handle,
        player.liquipedia_page_title,
        ...(player.aliases?.observed_names || []),
        ...(player.aliases?.liquipedia_handles || []),
        ...(player.aliases?.linked_page_hints || []),
        ...(player.aliases?.legal_names || []),
        ...(player.aliases?.romanized_names || []),
      ].map(normalizeKey),
    ).filter(Boolean).sort(),
    canonical_handle: player.canonical_handle || null,
    liquipedia_page_title: player.liquipedia_page_title || null,
    primary_target_tournaments: unique(player.primary_target_tournaments || []).sort(),
    resolution_status: player.resolution_status || null,
    scope_role: player.scope_role || null,
    supplemental_source_tournaments: unique(player.supplemental_source_tournaments || []).sort(),
  };

  return crypto.createHash('sha1').update(JSON.stringify(identity)).digest('hex');
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
      aliases: unique(aliases),
      canonical: canonicalWithoutParens || rawCanonical,
      source_line: line.trim(),
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
        ...(player.aliases?.linked_page_hints || []),
        ...(player.aliases?.legal_names || []),
        ...(player.aliases?.romanized_names || []),
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
      account_id: String(entry.value),
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

    const enrichedPlayer = {
      ...player,
      account_mappings: accountMappings,
      account_mapping_status: accountMappingStatus,
    };

    enrichedPlayer.scope_player_key = buildScopePlayerKey(enrichedPlayer);

    return enrichedPlayer;
  });

  return {
    d2scMappings,
    players: enrichedPlayers,
  };
}

function runSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  const result = statement.run(...params);

  return {
    changes: result.changes,
    lastID: Number(result.lastInsertRowid || 0),
  };
}

function getSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  return statement.get(...params) || null;
}

function allSql(database, sql, params = []) {
  const statement = database.prepare(sql);
  return statement.all(...params) || [];
}

function initializeDatabase(dbPath, reset = false) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);

  runSql(database, 'PRAGMA foreign_keys = ON');
  const versionRow = getSql(database, 'PRAGMA user_version');
  const currentVersion = Number(versionRow?.user_version || 0);

  if (reset || currentVersion !== SCHEMA_VERSION) {
    database.exec(`
      DROP TABLE IF EXISTS practice_matches;
      DROP TABLE IF EXISTS player_accounts;
      DROP TABLE IF EXISTS scope_players;
      DROP TABLE IF EXISTS collection_runs;

      CREATE TABLE collection_runs (
        run_id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        source_provider TEXT NOT NULL,
        dataset_status TEXT NOT NULL,
        cutoff_datetime_utc TEXT NOT NULL,
        browser_engine TEXT NOT NULL,
        headful INTEGER NOT NULL,
        state_path TEXT,
        persistent_profile_dir TEXT,
        player_inventory_path TEXT NOT NULL,
        d2sc_readme_path TEXT NOT NULL,
        blocker_report_json TEXT,
        notes TEXT
      );

      CREATE TABLE scope_players (
        scope_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_player_key TEXT NOT NULL UNIQUE,
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
        collection_note TEXT,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );

      CREATE TABLE player_accounts (
        player_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_player_id INTEGER NOT NULL,
        account_id TEXT NOT NULL UNIQUE,
        canonical_handle TEXT NOT NULL,
        mapping_sources_json TEXT NOT NULL,
        mapping_confidence TEXT NOT NULL,
        mapping_note TEXT,
        collection_status TEXT NOT NULL,
        next_history_page INTEGER NOT NULL DEFAULT 1,
        last_page_number_known INTEGER,
        history_pages_scanned INTEGER NOT NULL DEFAULT 0,
        matches_collected_count INTEGER NOT NULL DEFAULT 0,
        last_attempted_at TEXT,
        last_completed_at TEXT,
        collection_note TEXT,
        dotabuff_player_url TEXT NOT NULL,
        FOREIGN KEY(scope_player_id) REFERENCES scope_players(scope_player_id)
      );

      CREATE TABLE practice_matches (
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
      );

      CREATE INDEX idx_scope_players_collection_status
        ON scope_players(collection_status);
      CREATE INDEX idx_player_accounts_scope_player_id
        ON player_accounts(scope_player_id);
      CREATE INDEX idx_player_accounts_collection_status
        ON player_accounts(collection_status);
      CREATE INDEX idx_practice_matches_match_id
        ON practice_matches(match_id);
      CREATE INDEX idx_practice_matches_scope_player_id
        ON practice_matches(scope_player_id);

      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
  }

  return database;
}

function stripStorageStateCookies(cookies) {
  return (cookies || []).map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
  }));
}

function getBrowserType(browserEngine) {
  if (browserEngine === 'firefox') {
    return firefox;
  }

  if (browserEngine === 'webkit') {
    return webkit;
  }

  return chromium;
}

async function primeContextFromStorageState(context, statePath) {
  if (!fs.existsSync(statePath)) {
    return;
  }

  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  if (state.cookies?.length) {
    await context.addCookies(stripStorageStateCookies(state.cookies));
  }

  const dotabuffOrigin = (state.origins || []).find((origin) => origin.origin === DOTABUFF_BASE_URL);

  if (!dotabuffOrigin?.localStorage?.length) {
    return;
  }

  const page = context.pages()[0] || await context.newPage();

  try {
    await page.goto(DOTABUFF_BASE_URL, {
      timeout: 45000,
      waitUntil: 'domcontentloaded',
    });
  } catch (error) {
    // Best-effort prime only.
  }

  await page.evaluate((entries) => {
    for (const entry of entries) {
      localStorage.setItem(entry.name, entry.value);
    }
  }, dotabuffOrigin.localStorage);
}

async function createBrowserContext(options) {
  fs.mkdirSync(options.cacheDir, { recursive: true });
  fs.mkdirSync(path.dirname(options.statePath), { recursive: true });
  fs.mkdirSync(options.persistentProfileDir, { recursive: true });

  const browserType = getBrowserType(options.browserEngine);
  const launchOptions = {
    headless: !options.headful,
  };
  const contextOptions = {
    locale: 'en-US',
    timezoneId: 'UTC',
    userAgent: DEFAULT_USER_AGENT,
    viewport: {
      height: 768,
      width: 1366,
    },
  };

  const browser = await browserType.launch(launchOptions);
  const context = await browser.newContext(contextOptions);
  context.__stage3Browser = browser;

  if (options.useState && !options.refreshState) {
    await primeContextFromStorageState(context, options.statePath);
  }

  return context;
}

function analyzeDotabuffBody(title, bodyText) {
  const normalizedTitle = String(title || '').trim();
  const normalizedBody = String(bodyText || '');

  if (
    /No matches found/i.test(normalizedBody) ||
    /This profile is private/i.test(normalizedBody) ||
    /Матчи не найдены/i.test(normalizedBody) ||
    /Этот профиль является закрытым/i.test(normalizedBody)
  ) {
    return 'empty';
  }

  if (
    /Page not found/i.test(normalizedBody) ||
    /Sorry, we couldn't find that page/i.test(normalizedBody) ||
    /Страница не найдена/i.test(normalizedBody)
  ) {
    return 'missing';
  }

  if (
    /Performing security verification/i.test(normalizedBody) ||
    /Выполнение проверки безопасности/i.test(normalizedBody) ||
    /Just a moment/i.test(normalizedTitle)
  ) {
    return 'cloudflare_interstitial';
  }

  return null;
}

async function waitForDotabuffContent(page, probeWaitMs) {
  const attempts = Math.max(Math.ceil(probeWaitMs / 1000), 1);
  let lastInspection = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const rowCount = await page.locator('table tbody tr').count().catch(() => 0);
    const title = await page.title().catch(() => null);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const derivedState = analyzeDotabuffBody(title, bodyText);
    const inspection = {
      body_excerpt: summarizeText(bodyText),
      ray_id: extractRayId(bodyText),
      row_count: rowCount,
      state: derivedState,
      title,
    };

    lastInspection = inspection;

    if (rowCount > 0) {
      return {
        ...inspection,
        state: 'table',
      };
    }

    if (derivedState === 'empty' || derivedState === 'missing') {
      return inspection;
    }

    await page.waitForTimeout(1000);
  }

  if (lastInspection?.state === 'cloudflare_interstitial') {
    return lastInspection;
  }

  return {
    body_excerpt: lastInspection?.body_excerpt || null,
    ray_id: lastInspection?.ray_id || null,
    row_count: lastInspection?.row_count || 0,
    state: 'timeout',
    title: lastInspection?.title || null,
  };
}

async function gotoAndInspect(page, url, options) {
  await page.goto(url, {
    timeout: 60000,
    waitUntil: 'domcontentloaded',
  });

  return waitForDotabuffContent(page, options.probeWaitMs);
}

async function persistCurrentState(context, statePath) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  await context.storageState({ path: statePath });
}

async function probeDotabuffAccess(context, accountId, options) {
  const page = context.pages()[0] || await context.newPage();
  const home = await gotoAndInspect(page, DOTABUFF_HOME_URL, options);
  const historyUrl = buildDotabuffHistoryUrl(accountId, 1);
  const history = await gotoAndInspect(page, historyUrl, options);

  if (history.state === 'table') {
    await persistCurrentState(context, options.statePath);
  }

  return {
    blocked: history.state === 'cloudflare_interstitial' || history.state === 'timeout',
    browser_engine: options.browserEngine,
    headful: options.headful,
    home: {
      ...home,
      url: DOTABUFF_HOME_URL,
    },
    history: {
      ...history,
      url: historyUrl,
    },
    state_path: relativeToRepo(options.statePath),
  };
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

function matchesStrictPracticeLabels(lobbyTypeLabel, gameModeLabel) {
  return (
    STRICT_LOBBY_TYPE_LABEL_KEYS.has(normalizeKey(lobbyTypeLabel)) &&
    STRICT_GAME_MODE_LABEL_KEYS.has(normalizeKey(gameModeLabel))
  );
}

function isStrictHistoryRow(row) {
  return matchesStrictPracticeLabels(row.match_type_label, row.game_mode_label);
}

function parseOverviewValue(bodyText, label) {
  const lines = String(bodyText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const labelIndex = lines.findIndex((line) => line.toUpperCase() === String(label).trim().toUpperCase());

  if (labelIndex <= 0) {
    return null;
  }

  return lines[labelIndex - 1] || null;
}

async function inspectMatchDetail(page, matchId, options) {
  const cached = matchVerificationCache.get(String(matchId));

  if (cached) {
    return cached;
  }

  const matchUrl = buildDotabuffMatchUrl(matchId);
  await page.goto(matchUrl, {
    timeout: 60000,
    waitUntil: 'domcontentloaded',
  });

  const attempts = Math.max(Math.ceil(options.probeWaitMs / 1000), 1);
  let lastInspection = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const title = await page.title().catch(() => null);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const derivedState = analyzeDotabuffBody(title, bodyText);
    const lobbyTypeLabel = parseOverviewValue(bodyText, 'LOBBY TYPE');
    const gameModeLabel = parseOverviewValue(bodyText, 'GAME MODE');
    const inspection = {
      body_excerpt: summarizeText(bodyText),
      game_mode_label: gameModeLabel,
      lobby_type_label: lobbyTypeLabel,
      match_id: String(matchId),
      match_url: matchUrl,
      ray_id: extractRayId(bodyText),
      state: derivedState,
      title,
    };

    lastInspection = inspection;

    if (lobbyTypeLabel || gameModeLabel) {
      const result = {
        ...inspection,
        is_strict_practice: matchesStrictPracticeLabels(lobbyTypeLabel, gameModeLabel),
        state: 'overview',
      };
      matchVerificationCache.set(String(matchId), result);
      return result;
    }

    if (derivedState === 'empty' || derivedState === 'missing' || derivedState === 'cloudflare_interstitial') {
      matchVerificationCache.set(String(matchId), inspection);
      return inspection;
    }

    await page.waitForTimeout(1000);
  }

  const timeoutResult = {
    body_excerpt: lastInspection?.body_excerpt || null,
    game_mode_label: lastInspection?.game_mode_label || null,
    lobby_type_label: lastInspection?.lobby_type_label || null,
    match_id: String(matchId),
    match_url: matchUrl,
    ray_id: lastInspection?.ray_id || null,
    state: 'timeout',
    title: lastInspection?.title || null,
  };
  matchVerificationCache.set(String(matchId), timeoutResult);
  return timeoutResult;
}

function compareDateToCutoff(row, cutoffTimestamp) {
  const rowTimestamp = Date.parse(row.match_datetime_utc || '');

  if (!Number.isFinite(rowTimestamp)) {
    return false;
  }

  return rowTimestamp <= cutoffTimestamp;
}

function insertCollectionRun(database, options, runId, startedAt) {
  runSql(
    database,
    `INSERT INTO collection_runs (
      run_id,
      started_at,
      completed_at,
      source_provider,
      dataset_status,
      cutoff_datetime_utc,
      browser_engine,
      headful,
      state_path,
      persistent_profile_dir,
      player_inventory_path,
      d2sc_readme_path,
      blocker_report_json,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      runId,
      startedAt,
      null,
      'dotabuff_match_detail_verified',
      'pending',
      options.cutoffDatetimeUtc,
      options.browserEngine,
      options.headful ? 1 : 0,
      relativeToRepo(options.statePath),
      relativeToRepo(options.persistentProfileDir),
      relativeToRepo(options.playerInventoryPath),
      relativeToRepo(options.d2scReadmePath),
      null,
      'Dotabuff-only practice history collector. If Dotabuff remains blocked, the stage must stay non-canonical/WIP.',
    ],
  );
}

function completeCollectionRun(database, runId, datasetStatus, blockerReport) {
  runSql(
    database,
    `UPDATE collection_runs
     SET completed_at = ?, dataset_status = ?, blocker_report_json = ?
     WHERE run_id = ?`,
    [
      new Date().toISOString(),
      datasetStatus,
      blockerReport ? JSON.stringify(blockerReport) : null,
      runId,
    ],
  );
}

function upsertScopePlayer(database, scopePlayer, seenAt) {
  const mappingNote = scopePlayer.account_mappings
    .flatMap((mapping) => mapping.mapping_sources || [])
    .filter(Boolean)
    .join(' | ') || null;
  const existing = getSql(
    database,
    'SELECT scope_player_id FROM scope_players WHERE scope_player_key = ?',
    [scopePlayer.scope_player_key],
  );

  if (!existing) {
    const result = runSql(
      database,
      `INSERT INTO scope_players (
        scope_player_key,
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
        collection_note,
        first_seen_at,
        last_seen_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scopePlayer.scope_player_key,
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
        mappingNote,
        scopePlayer.account_mappings.length > 0 ? null : 'No verified account mapping available',
        seenAt,
        seenAt,
      ],
    );

    return result.lastID;
  }

  runSql(
    database,
    `UPDATE scope_players
     SET canonical_handle = ?,
         liquipedia_page_title = ?,
         scope_role = ?,
         resolution_status = ?,
         resolution_confidence = ?,
         primary_target_tournaments_json = ?,
         supplemental_source_tournaments_json = ?,
         account_mapping_status = ?,
         account_count = ?,
         processable = ?,
         mapping_note = ?,
         collection_status = CASE
           WHEN ? = 0 THEN 'unresolved'
           WHEN collection_status = 'unresolved' THEN 'pending'
           ELSE collection_status
         END,
         collection_note = CASE
           WHEN ? = 0 THEN 'No verified account mapping available'
           ELSE collection_note
         END,
         last_seen_at = ?
     WHERE scope_player_id = ?`,
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
      mappingNote,
      scopePlayer.account_mappings.length > 0 ? 1 : 0,
      scopePlayer.account_mappings.length > 0 ? 1 : 0,
      seenAt,
      existing.scope_player_id,
    ],
  );

  return existing.scope_player_id;
}

function upsertPlayerAccount(database, scopePlayerId, scopePlayer, mapping) {
  const existing = getSql(
    database,
    'SELECT player_account_id FROM player_accounts WHERE account_id = ?',
    [mapping.account_id],
  );

  if (!existing) {
    runSql(
      database,
      `INSERT INTO player_accounts (
        scope_player_id,
        account_id,
        canonical_handle,
        mapping_sources_json,
        mapping_confidence,
        mapping_note,
        collection_status,
        next_history_page,
        last_page_number_known,
        history_pages_scanned,
        matches_collected_count,
        last_attempted_at,
        last_completed_at,
        collection_note,
        dotabuff_player_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scopePlayerId,
        mapping.account_id,
        scopePlayer.canonical_handle,
        JSON.stringify(mapping.mapping_sources),
        mapping.mapping_confidence,
        mapping.mapping_note,
        'pending',
        1,
        null,
        0,
        0,
        null,
        null,
        null,
        mapping.dotabuff_player_url,
      ],
    );

    return;
  }

  runSql(
    database,
    `UPDATE player_accounts
     SET scope_player_id = ?,
         canonical_handle = ?,
         mapping_sources_json = ?,
         mapping_confidence = ?,
         mapping_note = ?,
         dotabuff_player_url = ?
     WHERE account_id = ?`,
    [
      scopePlayerId,
      scopePlayer.canonical_handle,
      JSON.stringify(mapping.mapping_sources),
      mapping.mapping_confidence,
      mapping.mapping_note,
      mapping.dotabuff_player_url,
      mapping.account_id,
    ],
  );
}

function insertPracticeMatches(database, scopePlayerId, scopePlayer, accountId, rows) {
  const collectedAt = new Date().toISOString();

  for (const row of rows) {
    runSql(
      database,
      `INSERT INTO practice_matches (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id, match_id) DO UPDATE SET
        scope_player_id = excluded.scope_player_id,
        canonical_handle = excluded.canonical_handle,
        hero_name = excluded.hero_name,
        match_datetime_utc = excluded.match_datetime_utc,
        match_date_text = excluded.match_date_text,
        result_label = excluded.result_label,
        match_type_label = excluded.match_type_label,
        game_mode_label = excluded.game_mode_label,
        history_page = excluded.history_page,
        match_url = excluded.match_url,
        player_history_url = excluded.player_history_url,
        collection_source = excluded.collection_source,
        row_confidence = excluded.row_confidence,
        collected_at = excluded.collected_at`,
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

function shouldProcessAccount(collectionStatus) {
  return !['collected', 'no_rows'].includes(collectionStatus);
}

function getAccountMatchCount(database, accountId) {
  const row = getSql(
    database,
    'SELECT COUNT(*) AS count FROM practice_matches WHERE account_id = ?',
    [accountId],
  );

  return Number(row?.count || 0);
}

function updatePlayerAccountProgress(database, accountId, fields) {
  runSql(
    database,
    `UPDATE player_accounts
     SET collection_status = ?,
         next_history_page = ?,
         last_page_number_known = ?,
         history_pages_scanned = ?,
         matches_collected_count = ?,
         last_attempted_at = ?,
         last_completed_at = ?,
         collection_note = ?
     WHERE account_id = ?`,
    [
      fields.collection_status,
      fields.next_history_page,
      fields.last_page_number_known,
      fields.history_pages_scanned,
      fields.matches_collected_count,
      fields.last_attempted_at,
      fields.last_completed_at,
      fields.collection_note,
      accountId,
    ],
  );
}

function refreshScopePlayerCollection(database, scopePlayerId) {
  const matchRow = getSql(
    database,
    'SELECT COUNT(*) AS count FROM practice_matches WHERE scope_player_id = ?',
    [scopePlayerId],
  );
  const accountRows = allSql(
    database,
    `SELECT account_id, collection_status, collection_note
     FROM player_accounts
     WHERE scope_player_id = ?
     ORDER BY account_id`,
    [scopePlayerId],
  );
  const matchCount = Number(matchRow?.count || 0);

  let collectionStatus = 'unresolved';
  let collectionNote = 'No verified account mapping available';

  if (accountRows.length > 0) {
    const statuses = new Set(accountRows.map((row) => row.collection_status));
    const notes = unique(
      accountRows
        .map((row) => (row.collection_note ? `${row.account_id}: ${row.collection_note}` : null))
        .filter(Boolean),
    );

    collectionNote = notes.join(' | ') || null;

    if (statuses.has('error')) {
      collectionStatus = matchCount > 0 ? 'partial' : 'error';
    } else if (statuses.has('blocked')) {
      collectionStatus = matchCount > 0 ? 'partial' : 'blocked';
    } else if (statuses.has('pending')) {
      collectionStatus = matchCount > 0 ? 'partial' : 'pending';
    } else if ([...statuses].every((status) => status === 'no_rows')) {
      collectionStatus = 'no_rows';
    } else {
      collectionStatus = matchCount > 0 ? 'collected' : 'no_rows';
    }
  }

  runSql(
    database,
    `UPDATE scope_players
     SET collection_status = ?,
         matches_collected_count = ?,
         collection_note = ?
     WHERE scope_player_id = ?`,
    [collectionStatus, matchCount, collectionNote, scopePlayerId],
  );

  return {
    collection_note: collectionNote,
    collection_status: collectionStatus,
    matches_collected_count: matchCount,
  };
}

function refreshAllScopePlayers(database) {
  const scopeRows = allSql(
    database,
    'SELECT scope_player_id FROM scope_players ORDER BY scope_player_id',
  );

  for (const row of scopeRows) {
    refreshScopePlayerCollection(database, row.scope_player_id);
  }
}

function selectPlayersToProcess(database, maxPlayers) {
  const accountRows = allSql(
    database,
    `SELECT
       sp.scope_player_id,
       sp.scope_player_key,
       sp.canonical_handle,
       pa.account_id,
       pa.collection_status,
       pa.next_history_page,
       pa.last_page_number_known,
       pa.history_pages_scanned,
       pa.matches_collected_count,
       pa.collection_note
     FROM scope_players sp
     JOIN player_accounts pa ON pa.scope_player_id = sp.scope_player_id
     ORDER BY sp.canonical_handle COLLATE NOCASE, pa.account_id`,
  );
  const byPlayerId = new Map();

  for (const row of accountRows) {
    let playerRecord = byPlayerId.get(row.scope_player_id);

    if (!playerRecord) {
      playerRecord = {
        accounts: [],
        canonical_handle: row.canonical_handle,
        scope_player_id: row.scope_player_id,
        scope_player_key: row.scope_player_key,
      };
      byPlayerId.set(row.scope_player_id, playerRecord);
    }

    playerRecord.accounts.push(row);
  }

  const eligiblePlayers = [...byPlayerId.values()].filter((player) =>
    player.accounts.some((account) => shouldProcessAccount(account.collection_status)),
  );

  if (maxPlayers === null) {
    return eligiblePlayers;
  }

  return eligiblePlayers.slice(0, maxPlayers);
}

async function collectAccountHistory(database, page, scopePlayer, accountRow, cutoffTimestamp, options, context) {
  let currentPage = Number(accountRow.next_history_page || 1);
  let historyPagesScanned = Number(accountRow.history_pages_scanned || 0);
  let lastPageNumberKnown = Number(accountRow.last_page_number_known || 0) || null;

  console.log(
    `[stage3] ${scopePlayer.canonical_handle} / ${accountRow.account_id}: start page ${currentPage}`,
  );

  while (true) {
    const historyUrl = buildDotabuffHistoryUrl(accountRow.account_id, currentPage);
    const attemptedAt = new Date().toISOString();
    const inspection = await gotoAndInspect(page, historyUrl, options);

    if (inspection.state === 'cloudflare_interstitial' || inspection.state === 'timeout') {
      const matchCount = getAccountMatchCount(database, accountRow.account_id);
      const collectionStatus = matchCount > 0 ? 'partial' : 'blocked';
      const note =
        inspection.state === 'cloudflare_interstitial'
          ? `Dotabuff returned a Cloudflare verification interstitial on history page ${currentPage} (title=${inspection.title || 'n/a'}, ray_id=${inspection.ray_id || 'n/a'})`
          : `Dotabuff did not expose readable history content on page ${currentPage} within ${options.probeWaitMs}ms`;

      updatePlayerAccountProgress(database, accountRow.account_id, {
        collection_status: collectionStatus,
        next_history_page: currentPage,
        last_page_number_known: lastPageNumberKnown,
        history_pages_scanned: historyPagesScanned,
        matches_collected_count: matchCount,
        last_attempted_at: attemptedAt,
        last_completed_at: null,
        collection_note: note,
      });

      return {
        account_id: accountRow.account_id,
        collection_note: note,
        collection_status: collectionStatus,
        match_rows_collected: matchCount,
      };
    }

    if (inspection.state === 'missing' || inspection.state === 'empty') {
      const matchCount = getAccountMatchCount(database, accountRow.account_id);
      const finalStatus = matchCount > 0 ? 'collected' : 'no_rows';
      const note =
        inspection.state === 'empty'
          ? currentPage === 1
            ? 'Dotabuff reported no visible match history rows for this account'
            : `Dotabuff pagination ended at page ${currentPage - 1}`
          : `Dotabuff history page was missing for this account at page ${currentPage}`;

      updatePlayerAccountProgress(database, accountRow.account_id, {
        collection_status: finalStatus,
        next_history_page: currentPage,
        last_page_number_known: lastPageNumberKnown,
        history_pages_scanned: historyPagesScanned,
        matches_collected_count: matchCount,
        last_attempted_at: attemptedAt,
        last_completed_at: attemptedAt,
        collection_note: note,
      });

      return {
        account_id: accountRow.account_id,
        collection_note: note,
        collection_status: finalStatus,
        match_rows_collected: matchCount,
      };
    }

    if (inspection.state !== 'table') {
      const matchCount = getAccountMatchCount(database, accountRow.account_id);
      const note = `Unexpected Dotabuff page state ${inspection.state} on history page ${currentPage}`;

      updatePlayerAccountProgress(database, accountRow.account_id, {
        collection_status: matchCount > 0 ? 'partial' : 'error',
        next_history_page: currentPage,
        last_page_number_known: lastPageNumberKnown,
        history_pages_scanned: historyPagesScanned,
        matches_collected_count: matchCount,
        last_attempted_at: attemptedAt,
        last_completed_at: null,
        collection_note: note,
      });

      return {
        account_id: accountRow.account_id,
        collection_note: note,
        collection_status: matchCount > 0 ? 'partial' : 'error',
        match_rows_collected: matchCount,
      };
    }

    historyPagesScanned += 1;
    lastPageNumberKnown = await getLastPageNumber(page);
    const extractedRows = await extractMatchRows(page, historyUrl, currentPage);
    const candidateRows = extractedRows.filter(
      (row) => isStrictHistoryRow(row) && compareDateToCutoff(row, cutoffTimestamp),
    );
    const strictRows = [];

    for (const row of candidateRows) {
      const verification = await inspectMatchDetail(page, row.match_id, options);

      if (verification.state === 'cloudflare_interstitial' || verification.state === 'timeout') {
        const matchCount = getAccountMatchCount(database, accountRow.account_id);
        const collectionStatus = matchCount > 0 ? 'partial' : 'blocked';
        const note =
          verification.state === 'cloudflare_interstitial'
            ? `Dotabuff returned a Cloudflare verification interstitial on match ${row.match_id} (title=${verification.title || 'n/a'}, ray_id=${verification.ray_id || 'n/a'})`
            : `Dotabuff did not expose readable match detail for ${row.match_id} within ${options.probeWaitMs}ms`;

        updatePlayerAccountProgress(database, accountRow.account_id, {
          collection_status: collectionStatus,
          next_history_page: currentPage,
          last_page_number_known: lastPageNumberKnown,
          history_pages_scanned: historyPagesScanned,
          matches_collected_count: matchCount,
          last_attempted_at: attemptedAt,
          last_completed_at: null,
          collection_note: note,
        });

        return {
          account_id: accountRow.account_id,
          collection_note: note,
          collection_status: collectionStatus,
          match_rows_collected: matchCount,
        };
      }

      if (verification.is_strict_practice) {
        strictRows.push({
          ...row,
          collection_source: 'dotabuff_match_detail_verified',
          game_mode_label: verification.game_mode_label || row.game_mode_label || null,
          match_type_label: verification.lobby_type_label || row.match_type_label || null,
          match_url: verification.match_url || row.match_url,
          row_confidence: 'match_page_verified',
        });
      }
    }

    insertPracticeMatches(
      database,
      scopePlayer.scope_player_id,
      scopePlayer,
      accountRow.account_id,
      strictRows,
    );
    await persistCurrentState(context, options.statePath);

    const matchCount = getAccountMatchCount(database, accountRow.account_id);

    if (currentPage >= lastPageNumberKnown) {
      updatePlayerAccountProgress(database, accountRow.account_id, {
        collection_status: matchCount > 0 ? 'collected' : 'no_rows',
        next_history_page: currentPage + 1,
        last_page_number_known: lastPageNumberKnown,
        history_pages_scanned: historyPagesScanned,
        matches_collected_count: matchCount,
        last_attempted_at: attemptedAt,
        last_completed_at: attemptedAt,
        collection_note:
          matchCount > 0
            ? `Collected strict Dotabuff rows through history page ${currentPage} with per-match detail verification`
            : `Scanned ${historyPagesScanned} Dotabuff history page(s) with no strict Practice + None rows`,
      });

      return {
        account_id: accountRow.account_id,
        collection_note:
          matchCount > 0
            ? `Collected strict Dotabuff rows through history page ${currentPage} with per-match detail verification`
            : `Scanned ${historyPagesScanned} Dotabuff history page(s) with no strict Practice + None rows`,
        collection_status: matchCount > 0 ? 'collected' : 'no_rows',
        match_rows_collected: matchCount,
      };
    }

    currentPage += 1;

    updatePlayerAccountProgress(database, accountRow.account_id, {
      collection_status: 'pending',
      next_history_page: currentPage,
      last_page_number_known: lastPageNumberKnown,
      history_pages_scanned: historyPagesScanned,
      matches_collected_count: matchCount,
      last_attempted_at: attemptedAt,
      last_completed_at: null,
      collection_note: `Collected through Dotabuff history page ${currentPage - 1}; continuing`,
    });

    if (options.pageDelayMs > 0) {
      await page.waitForTimeout(options.pageDelayMs);
    }
  }
}

async function collectScopePlayer(database, context, scopePlayer, cutoffTimestamp, options) {
  const page = await context.newPage();

  try {
    const accountRows = allSql(
      database,
      `SELECT
         account_id,
         collection_status,
         next_history_page,
         last_page_number_known,
         history_pages_scanned,
         matches_collected_count,
         collection_note
       FROM player_accounts
       WHERE scope_player_id = ?
       ORDER BY account_id`,
      [scopePlayer.scope_player_id],
    );
    const processableAccounts = accountRows.filter((account) =>
      shouldProcessAccount(account.collection_status),
    );

    for (const accountRow of processableAccounts) {
      await collectAccountHistory(
        database,
        page,
        scopePlayer,
        accountRow,
        cutoffTimestamp,
        options,
        context,
      );
    }

    const refreshed = refreshScopePlayerCollection(database, scopePlayer.scope_player_id);

    return {
      canonical_handle: scopePlayer.canonical_handle,
      collection_note: refreshed.collection_note,
      collection_status: refreshed.collection_status,
      match_rows_collected: refreshed.matches_collected_count,
      scope_player_id: scopePlayer.scope_player_id,
    };
  } finally {
    await page.close();
  }
}

function loadScopePlayerRecords(database) {
  return allSql(
    database,
    `SELECT
       scope_player_id,
       scope_player_key,
       canonical_handle
     FROM scope_players
     ORDER BY canonical_handle COLLATE NOCASE`,
  );
}

function markSelectedPlayersBlocked(database, selectedScopePlayers, blockerReport) {
  const blockerNote =
    `Global Dotabuff source blocker: home=${blockerReport.home.state}` +
    `${blockerReport.home.ray_id ? ` ray_id=${blockerReport.home.ray_id}` : ''}; ` +
    `history=${blockerReport.history.state}` +
    `${blockerReport.history.ray_id ? ` ray_id=${blockerReport.history.ray_id}` : ''}`;

  for (const scopePlayer of selectedScopePlayers) {
    const accountRows = allSql(
      database,
      `SELECT account_id, history_pages_scanned, last_page_number_known
       FROM player_accounts
       WHERE scope_player_id = ?`,
      [scopePlayer.scope_player_id],
    );

    for (const accountRow of accountRows) {
      const matchCount = getAccountMatchCount(database, accountRow.account_id);

      updatePlayerAccountProgress(database, accountRow.account_id, {
        collection_status: matchCount > 0 ? 'partial' : 'blocked',
        next_history_page: 1,
        last_page_number_known: accountRow.last_page_number_known || null,
        history_pages_scanned: Number(accountRow.history_pages_scanned || 0),
        matches_collected_count: matchCount,
        last_attempted_at: new Date().toISOString(),
        last_completed_at: null,
        collection_note: blockerNote,
      });
    }

    refreshScopePlayerCollection(database, scopePlayer.scope_player_id);
  }
}

function buildSummary(database, options, runId, startedAt, completedAt, scopePlayers, d2scMappings, selectedPlayersCount, processedPlayersCount, blockerReport) {
  const aggregateRows = getSql(
    database,
    `SELECT
       COUNT(*) AS practice_match_rows,
       COUNT(DISTINCT match_id) AS distinct_match_ids,
       COUNT(DISTINCT account_id) AS distinct_accounts
     FROM practice_matches`,
  );
  const collectionStatuses = allSql(
    database,
    'SELECT collection_status, COUNT(*) AS count FROM scope_players GROUP BY collection_status ORDER BY count DESC, collection_status',
  );
  const accountStatuses = allSql(
    database,
    'SELECT collection_status, COUNT(*) AS count FROM player_accounts GROUP BY collection_status ORDER BY count DESC, collection_status',
  );
  const accountsTotalRow = getSql(database, 'SELECT COUNT(*) AS count FROM player_accounts');
  const topPlayersByRows = allSql(
    database,
    `SELECT canonical_handle, matches_collected_count
     FROM scope_players
     WHERE matches_collected_count > 0
     ORDER BY matches_collected_count DESC, canonical_handle COLLATE NOCASE
     LIMIT 25`,
  );
  const practiceRows = Number(aggregateRows?.practice_match_rows || 0);
  const datasetStatus = practiceRows > 0
    ? 'dotabuff_derived'
    : blockerReport
      ? 'blocked_noncanonical_wip'
      : 'dotabuff_no_rows';

  return {
    generated_at: completedAt,
    started_at: startedAt,
    run_id: runId,
    source_provider: 'dotabuff_match_detail_verified',
    dataset_status: datasetStatus,
    is_truly_dotabuff_derived: practiceRows > 0,
    input_files: {
      d2sc_readme: relativeToRepo(options.d2scReadmePath),
      persistent_profile_dir: relativeToRepo(options.persistentProfileDir),
      player_inventory: relativeToRepo(options.playerInventoryPath),
      state_path: relativeToRepo(options.statePath),
    },
    cutoff_datetime_utc: options.cutoffDatetimeUtc,
    config: {
      browser_engine: options.browserEngine,
      concurrency: options.concurrency,
      headful: options.headful,
      max_players: options.maxPlayers,
      page_delay_ms: options.pageDelayMs,
      probe_wait_ms: options.probeWaitMs,
      refresh_state: options.refreshState,
      reset: options.reset,
      strict_game_mode_label: 'None',
      strict_lobby_type_label: 'Practice',
    },
    counts: {
      accounts_total: Number(accountsTotalRow?.count || 0),
      account_statuses: accountStatuses,
      d2sc_verified_mappings_loaded: d2scMappings.length,
      distinct_accounts_collected: Number(aggregateRows?.distinct_accounts || 0),
      distinct_match_ids_collected: Number(aggregateRows?.distinct_match_ids || 0),
      players_processed_this_run: processedPlayersCount,
      players_selected_this_run: selectedPlayersCount,
      players_total: scopePlayers.length,
      players_with_accounts: scopePlayers.filter((player) => player.account_mappings.length > 0).length,
      players_with_d2sc_auxiliary_accounts: scopePlayers.filter((player) =>
        player.account_mappings.some((mapping) => mapping.mapping_sources.includes('d2sc_verified_readme')),
      ).length,
      players_without_accounts: scopePlayers.filter((player) => player.account_mappings.length === 0).length,
      practice_match_rows_collected: practiceRows,
      scope_player_statuses: collectionStatuses,
    },
    blocker_report: blockerReport || null,
    caveats: [
      'The stage is Dotabuff-only by design. No alternate provider is treated as equivalent for this dataset.',
      'Candidate rows come from the ordinary Dotabuff player matches history, not from lobby_type=custom.',
      'Rows are only inserted after a strict Practice + None history row is re-checked on the Dotabuff match page overview.',
      'Strict label matching accepts both English and Russian Dotabuff labels (Practice/None and Тренировочный/Нет).',
      'D2SC README mappings are only applied when alias matching resolves to exactly one stage-2 player.',
      practiceRows > 0
        ? 'The current artifact contains true Dotabuff-derived rows.'
        : blockerReport
          ? 'The current artifact is non-canonical/WIP because Dotabuff access was blocked before row extraction.'
          : 'The current artifact contains no verified strict Practice + None rows for the processed subset yet.',
    ],
    top_players_by_rows: topPlayersByRows,
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const cutoffTimestamp = Date.parse(options.cutoffDatetimeUtc);
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(options.dbPath), { recursive: true });
  fs.mkdirSync(path.dirname(options.summaryPath), { recursive: true });

  const database = initializeDatabase(options.dbPath, options.reset);

  try {
    insertCollectionRun(database, options, runId, startedAt);

    const { d2scMappings, players: scopePlayers } = loadScopePlayers(
      options.playerInventoryPath,
      options.d2scReadmePath,
    );
    const seenAt = new Date().toISOString();

    for (const scopePlayer of scopePlayers) {
      const scopePlayerId = upsertScopePlayer(database, scopePlayer, seenAt);

      for (const mapping of scopePlayer.account_mappings) {
        upsertPlayerAccount(database, scopePlayerId, scopePlayer, mapping);
      }
    }

    refreshAllScopePlayers(database);

    const playersToProcess = selectPlayersToProcess(database, options.maxPlayers);
    const scopePlayerRecordsById = new Map(
      loadScopePlayerRecords(database).map((row) => [row.scope_player_id, row]),
    );
    const selectedScopePlayers = playersToProcess
      .map((row) => scopePlayerRecordsById.get(row.scope_player_id))
      .filter(Boolean);
    let processedPlayersCount = 0;
    let blockerReport = null;

    if (selectedScopePlayers.length > 0) {
      const context = await createBrowserContext(options);

      try {
        let nextIndex = 0;
        const workerCount = Math.min(options.concurrency, selectedScopePlayers.length);
        const workers = Array.from({ length: workerCount }, async () => {
          while (nextIndex < selectedScopePlayers.length) {
            const scopePlayer = selectedScopePlayers[nextIndex];
            nextIndex += 1;
            await collectScopePlayer(
              database,
              context,
              scopePlayer,
              cutoffTimestamp,
              options,
            );
            processedPlayersCount += 1;
          }
        });

        await Promise.all(workers);
      } finally {
        await context.close();
        if (context.__stage3Browser) {
          await context.__stage3Browser.close();
        }
      }
    }

    refreshAllScopePlayers(database);

    const completedAt = new Date().toISOString();
    const summary = buildSummary(
      database,
      options,
      runId,
      startedAt,
      completedAt,
      scopePlayers,
      d2scMappings,
      selectedScopePlayers.length,
      processedPlayersCount,
      blockerReport,
    );

    completeCollectionRun(database, runId, summary.dataset_status, blockerReport);
    fs.writeFileSync(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

    console.log(`[stage3] dataset status: ${summary.dataset_status}`);
    console.log(`[stage3] scope players: ${summary.counts.players_total}`);
    console.log(`[stage3] player accounts: ${summary.counts.accounts_total}`);
    console.log(`[stage3] players selected this run: ${summary.counts.players_selected_this_run}`);
    console.log(`[stage3] players processed this run: ${summary.counts.players_processed_this_run}`);
    console.log(`[stage3] practice match rows: ${summary.counts.practice_match_rows_collected}`);
    console.log(`[stage3] summary: ${options.summaryPath}`);
  } finally {
    database.close();
  }
}

main().catch((error) => {
  console.error('[stage3] failed');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
