#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const STAGE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(STAGE_ROOT, '..', '..');
const DEFAULT_DATA_DIR = path.join(STAGE_ROOT, 'data');
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, 'practice_match_history_stage3.db');
const DEFAULT_SUMMARY_PATH = path.join(
  DEFAULT_DATA_DIR,
  'practice_match_history_stage3_summary.json',
);
const DEFAULT_PLAYER_INVENTORY_PATH = path.resolve(
  __dirname,
  '../../liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.json',
);
const DEFAULT_D2SC_README_PATH = path.resolve(
  __dirname,
  '../../../tournaments/d2sc/README.md',
);
const DEFAULT_HEROES_DB_PATH = path.resolve(__dirname, '../../../dota_archive.db');
const DEFAULT_API_BASE_URL = 'https://api.opendota.com/api';
const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_CUTOFF_DATETIME_UTC = '2014-12-31T23:59:59Z';
const DEFAULT_REQUEST_DELAY_MS = 0;
const DEFAULT_USER_AGENT =
  'dota-stats-archive-stage3/2.0 (+local workspace; source=OpenDota strict practice history)';
const OPEN_DOTA_PRACTICE_LOBBY_TYPE = 1;
const OPEN_DOTA_NONE_GAME_MODE = 0;
const SCHEMA_VERSION = 2;

function parseArguments(argv) {
  const options = {
    apiBaseUrl: DEFAULT_API_BASE_URL,
    batchSize: DEFAULT_BATCH_SIZE,
    concurrency: DEFAULT_CONCURRENCY,
    cutoffDatetimeUtc: DEFAULT_CUTOFF_DATETIME_UTC,
    dbPath: DEFAULT_DB_PATH,
    d2scReadmePath: DEFAULT_D2SC_README_PATH,
    heroesDbPath: DEFAULT_HEROES_DB_PATH,
    maxPlayers: null,
    playerInventoryPath: DEFAULT_PLAYER_INVENTORY_PATH,
    refreshComplete: false,
    requestDelayMs: DEFAULT_REQUEST_DELAY_MS,
    reset: false,
    summaryPath: DEFAULT_SUMMARY_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    switch (token) {
      case '--api-base-url':
        options.apiBaseUrl = String(nextToken || '').trim();
        index += 1;
        break;
      case '--batch-size':
        options.batchSize = Number(nextToken);
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
      case '--heroes-db':
        options.heroesDbPath = path.resolve(nextToken);
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
      case '--refresh-complete':
        options.refreshComplete = true;
        break;
      case '--request-delay-ms':
        options.requestDelayMs = Number(nextToken);
        index += 1;
        break;
      case '--reset':
        options.reset = true;
        break;
      case '--summary':
        options.summaryPath = path.resolve(nextToken);
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!options.apiBaseUrl) {
    throw new Error('api-base-url must be a non-empty URL');
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error('batch-size must be a positive integer');
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

  if (!Number.isInteger(options.requestDelayMs) || options.requestDelayMs < 0) {
    throw new Error('request-delay-ms must be an integer >= 0');
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

function isoFromUnixSeconds(value) {
  if (!Number.isFinite(Number(value))) {
    return null;
  }

  return new Date(Number(value) * 1000).toISOString();
}

function getResultLabel(playerSlot, radiantWin) {
  const isRadiant = Number(playerSlot) < 128;
  const didWin = (isRadiant && Boolean(radiantWin)) || (!isRadiant && !Boolean(radiantWin));
  return didWin ? 'Win' : 'Loss';
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
        dotabuff_player_url: `https://www.dotabuff.com/players/${mapping.account_id}`,
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
    inventory,
    players: enrichedPlayers,
  };
}

function loadHeroMap(heroesDbPath) {
  const heroMap = new Map();

  if (!heroesDbPath || !fs.existsSync(heroesDbPath)) {
    return heroMap;
  }

  const database = new DatabaseSync(heroesDbPath, { readonly: true });

  try {
    const rows = database.prepare('SELECT id, localized_name, name FROM heroes').all();

    for (const row of rows) {
      heroMap.set(Number(row.id), row.localized_name || row.name || `Hero ${row.id}`);
    }
  } catch (error) {
    console.warn(`[stage3] warning: could not load heroes from ${heroesDbPath}: ${error.message}`);
  } finally {
    database.close();
  }

  return heroMap;
}

function buildOpenDotaMatchesUrl(apiBaseUrl, accountId, batchSize, offset) {
  const normalizedBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  const url = new URL(`players/${accountId}/matches`, normalizedBaseUrl);

  url.searchParams.set('game_mode', String(OPEN_DOTA_NONE_GAME_MODE));
  url.searchParams.set('limit', String(batchSize));
  url.searchParams.set('lobby_type', String(OPEN_DOTA_PRACTICE_LOBBY_TYPE));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('significant', '0');

  return url.toString();
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
        cutoff_datetime_utc TEXT NOT NULL,
        player_inventory_path TEXT NOT NULL,
        d2sc_readme_path TEXT NOT NULL,
        heroes_db_path TEXT,
        max_players INTEGER,
        batch_size INTEGER NOT NULL,
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
        next_offset INTEGER NOT NULL DEFAULT 0,
        batch_size INTEGER NOT NULL DEFAULT 100,
        requests_completed INTEGER NOT NULL DEFAULT 0,
        matches_collected_count INTEGER NOT NULL DEFAULT 0,
        last_api_match_id TEXT,
        last_match_datetime_utc TEXT,
        last_attempted_at TEXT,
        last_completed_at TEXT,
        collection_note TEXT,
        collection_source TEXT NOT NULL,
        api_endpoint TEXT NOT NULL,
        FOREIGN KEY(scope_player_id) REFERENCES scope_players(scope_player_id)
      );

      CREATE TABLE practice_matches (
        practice_match_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_player_id INTEGER NOT NULL,
        account_id TEXT NOT NULL,
        canonical_handle TEXT NOT NULL,
        match_id TEXT NOT NULL,
        hero_id INTEGER,
        hero_name TEXT NOT NULL,
        match_datetime_utc TEXT,
        start_time_unix INTEGER,
        lobby_type_id INTEGER NOT NULL,
        game_mode_id INTEGER NOT NULL,
        duration_seconds INTEGER,
        player_slot INTEGER,
        radiant_win INTEGER,
        result_label TEXT,
        kills INTEGER,
        deaths INTEGER,
        assists INTEGER,
        source_provider TEXT NOT NULL,
        source_payload_json TEXT,
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
      CREATE INDEX idx_practice_matches_account_id
        ON practice_matches(account_id);

      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
  }

  return database;
}

function shouldProcessAccount(collectionStatus, refreshComplete) {
  if (refreshComplete) {
    return true;
  }

  return !['collected', 'no_rows'].includes(collectionStatus);
}

function sleep(durationMs) {
  if (!durationMs) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function fetchOpenDotaMatchesPage(accountId, offset, options) {
  const requestUrl = buildOpenDotaMatchesUrl(
    options.apiBaseUrl,
    accountId,
    options.batchSize,
    offset,
  );

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(requestUrl, {
        headers: {
          accept: 'application/json',
          'user-agent': DEFAULT_USER_AGENT,
        },
        signal: AbortSignal.timeout(45000),
      });

      if (response.status === 429) {
        const retryAfterSeconds = Number(response.headers.get('retry-after') || 0);
        const retryDelayMs = Math.max(retryAfterSeconds * 1000, (attempt + 1) * 3000);

        if (attempt < 2) {
          await sleep(retryDelayMs);
          continue;
        }

        return {
          note: `OpenDota rate limited account ${accountId} at offset ${offset}`,
          request_url: requestUrl,
          status: 'rate_limited',
        };
      }

      if (response.status === 404) {
        return {
          note: `OpenDota returned 404 for account ${accountId}`,
          request_url: requestUrl,
          rows: [],
          status: 'ok',
        };
      }

      if (!response.ok) {
        if (response.status >= 500 && attempt < 2) {
          await sleep((attempt + 1) * 2000);
          continue;
        }

        return {
          note: `OpenDota returned HTTP ${response.status} for account ${accountId}`,
          request_url: requestUrl,
          status: 'error',
        };
      }

      const rows = await response.json();

      if (!Array.isArray(rows)) {
        return {
          note: `OpenDota returned a non-array payload for account ${accountId}`,
          request_url: requestUrl,
          status: 'error',
        };
      }

      return {
        request_url: requestUrl,
        rows,
        status: 'ok',
      };
    } catch (error) {
      if (attempt < 2) {
        await sleep((attempt + 1) * 2000);
        continue;
      }

      return {
        note: `OpenDota request failed for account ${accountId}: ${error.message}`,
        request_url: requestUrl,
        status: 'error',
      };
    }
  }

  return {
    note: `OpenDota request retries exhausted for account ${accountId}`,
    request_url: requestUrl,
    status: 'error',
  };
}

function transformOpenDotaRows(scopePlayer, accountId, rows, heroMap, cutoffTimestamp) {
  const practiceRows = [];

  for (const row of rows) {
    if (
      Number(row.lobby_type) !== OPEN_DOTA_PRACTICE_LOBBY_TYPE ||
      Number(row.game_mode) !== OPEN_DOTA_NONE_GAME_MODE
    ) {
      continue;
    }

    const startTimeUnix = Number(row.start_time);
    const matchDatetimeUtc = isoFromUnixSeconds(startTimeUnix);
    const matchTimestamp = Date.parse(matchDatetimeUtc || '');

    if (Number.isFinite(cutoffTimestamp) && Number.isFinite(matchTimestamp) && matchTimestamp > cutoffTimestamp) {
      continue;
    }

    const heroId = Number(row.hero_id);
    const heroName = Number.isFinite(heroId)
      ? heroMap.get(heroId) || `Hero ${heroId}`
      : 'Unknown Hero';

    practiceRows.push({
      account_id: accountId,
      assists: Number.isFinite(Number(row.assists)) ? Number(row.assists) : null,
      canonical_handle: scopePlayer.canonical_handle,
      deaths: Number.isFinite(Number(row.deaths)) ? Number(row.deaths) : null,
      duration_seconds: Number.isFinite(Number(row.duration)) ? Number(row.duration) : null,
      game_mode_id: OPEN_DOTA_NONE_GAME_MODE,
      hero_id: Number.isFinite(heroId) ? heroId : null,
      hero_name: heroName,
      kills: Number.isFinite(Number(row.kills)) ? Number(row.kills) : null,
      lobby_type_id: OPEN_DOTA_PRACTICE_LOBBY_TYPE,
      match_datetime_utc: matchDatetimeUtc,
      match_id: String(row.match_id),
      player_slot: Number.isFinite(Number(row.player_slot)) ? Number(row.player_slot) : null,
      radiant_win: row.radiant_win === undefined || row.radiant_win === null ? null : row.radiant_win ? 1 : 0,
      result_label: getResultLabel(row.player_slot, row.radiant_win),
      source_payload_json: JSON.stringify(row),
      start_time_unix: Number.isFinite(startTimeUnix) ? startTimeUnix : null,
    });
  }

  return practiceRows;
}

function insertCollectionRun(database, options, runId, startedAt) {
  runSql(
    database,
    `INSERT INTO collection_runs (
      run_id,
      started_at,
      completed_at,
      source_provider,
      cutoff_datetime_utc,
      player_inventory_path,
      d2sc_readme_path,
      heroes_db_path,
      max_players,
      batch_size,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      runId,
      startedAt,
      null,
      'opendota_player_matches',
      options.cutoffDatetimeUtc,
      relativeToRepo(options.playerInventoryPath),
      relativeToRepo(options.d2scReadmePath),
      fs.existsSync(options.heroesDbPath) ? relativeToRepo(options.heroesDbPath) : null,
      options.maxPlayers,
      options.batchSize,
      'Strict practice history via OpenDota player matches API with conservative D2SC auxiliary account enrichment.',
    ],
  );
}

function completeCollectionRun(database, runId, completedAt) {
  runSql(
    database,
    'UPDATE collection_runs SET completed_at = ? WHERE run_id = ?',
    [completedAt, runId],
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

function upsertPlayerAccount(database, scopePlayerId, scopePlayer, mapping, options) {
  const apiEndpoint = buildOpenDotaMatchesUrl(options.apiBaseUrl, mapping.account_id, options.batchSize, 0);
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
        next_offset,
        batch_size,
        requests_completed,
        matches_collected_count,
        last_api_match_id,
        last_match_datetime_utc,
        last_attempted_at,
        last_completed_at,
        collection_note,
        collection_source,
        api_endpoint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scopePlayerId,
        mapping.account_id,
        scopePlayer.canonical_handle,
        JSON.stringify(mapping.mapping_sources),
        mapping.mapping_confidence,
        mapping.mapping_note,
        'pending',
        0,
        options.batchSize,
        0,
        0,
        null,
        null,
        null,
        null,
        null,
        'opendota_player_matches',
        apiEndpoint,
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
         batch_size = ?,
         collection_source = ?,
         api_endpoint = ?
     WHERE account_id = ?`,
    [
      scopePlayerId,
      scopePlayer.canonical_handle,
      JSON.stringify(mapping.mapping_sources),
      mapping.mapping_confidence,
      mapping.mapping_note,
      options.batchSize,
      'opendota_player_matches',
      apiEndpoint,
      mapping.account_id,
    ],
  );
}

function insertPracticeMatches(database, scopePlayerId, scopePlayer, rows) {
  const collectedAt = new Date().toISOString();

  for (const row of rows) {
    runSql(
      database,
      `INSERT INTO practice_matches (
        scope_player_id,
        account_id,
        canonical_handle,
        match_id,
        hero_id,
        hero_name,
        match_datetime_utc,
        start_time_unix,
        lobby_type_id,
        game_mode_id,
        duration_seconds,
        player_slot,
        radiant_win,
        result_label,
        kills,
        deaths,
        assists,
        source_provider,
        source_payload_json,
        collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id, match_id) DO UPDATE SET
        scope_player_id = excluded.scope_player_id,
        canonical_handle = excluded.canonical_handle,
        hero_id = excluded.hero_id,
        hero_name = excluded.hero_name,
        match_datetime_utc = excluded.match_datetime_utc,
        start_time_unix = excluded.start_time_unix,
        lobby_type_id = excluded.lobby_type_id,
        game_mode_id = excluded.game_mode_id,
        duration_seconds = excluded.duration_seconds,
        player_slot = excluded.player_slot,
        radiant_win = excluded.radiant_win,
        result_label = excluded.result_label,
        kills = excluded.kills,
        deaths = excluded.deaths,
        assists = excluded.assists,
        source_provider = excluded.source_provider,
        source_payload_json = excluded.source_payload_json,
        collected_at = excluded.collected_at`,
      [
        scopePlayerId,
        row.account_id,
        scopePlayer.canonical_handle,
        row.match_id,
        row.hero_id,
        row.hero_name,
        row.match_datetime_utc,
        row.start_time_unix,
        row.lobby_type_id,
        row.game_mode_id,
        row.duration_seconds,
        row.player_slot,
        row.radiant_win,
        row.result_label,
        row.kills,
        row.deaths,
        row.assists,
        'opendota_player_matches',
        row.source_payload_json,
        collectedAt,
      ],
    );
  }
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
         next_offset = ?,
         requests_completed = ?,
         matches_collected_count = ?,
         last_api_match_id = ?,
         last_match_datetime_utc = ?,
         last_attempted_at = ?,
         last_completed_at = ?,
         collection_note = ?,
         api_endpoint = ?
     WHERE account_id = ?`,
    [
      fields.collection_status,
      fields.next_offset,
      fields.requests_completed,
      fields.matches_collected_count,
      fields.last_api_match_id,
      fields.last_match_datetime_utc,
      fields.last_attempted_at,
      fields.last_completed_at,
      fields.collection_note,
      fields.api_endpoint,
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
    } else if (statuses.has('rate_limited')) {
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

function selectPlayersToProcess(database, maxPlayers, refreshComplete) {
  const accountRows = allSql(
    database,
    `SELECT
       sp.scope_player_id,
       sp.scope_player_key,
       sp.canonical_handle,
       pa.account_id,
       pa.collection_status,
       pa.next_offset,
       pa.requests_completed,
       pa.matches_collected_count,
       pa.last_api_match_id,
       pa.last_match_datetime_utc,
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
    player.accounts.some((account) => shouldProcessAccount(account.collection_status, refreshComplete)),
  );

  if (maxPlayers === null) {
    return eligiblePlayers;
  }

  return eligiblePlayers.slice(0, maxPlayers);
}

async function collectAccount(database, scopePlayer, accountRow, heroMap, cutoffTimestamp, options) {
  let currentOffset = Number(accountRow.next_offset || 0);

  if (
    currentOffset > 0 &&
    shouldProcessAccount(accountRow.collection_status, options.refreshComplete) &&
    !options.refreshComplete
  ) {
    currentOffset = Math.max(currentOffset - options.batchSize, 0);
  }

  let requestsCompleted = Number(accountRow.requests_completed || 0);
  let lastApiMatchId = accountRow.last_api_match_id || null;
  let lastMatchDatetimeUtc = accountRow.last_match_datetime_utc || null;

  console.log(
    `[stage3] ${scopePlayer.canonical_handle} / ${accountRow.account_id}: start offset ${currentOffset}`,
  );

  while (true) {
    const attemptedAt = new Date().toISOString();
    const fetchResult = await fetchOpenDotaMatchesPage(accountRow.account_id, currentOffset, options);

    if (fetchResult.status !== 'ok') {
      const matchCount = getAccountMatchCount(database, accountRow.account_id);

      updatePlayerAccountProgress(database, accountRow.account_id, {
        api_endpoint: fetchResult.request_url || buildOpenDotaMatchesUrl(
          options.apiBaseUrl,
          accountRow.account_id,
          options.batchSize,
          currentOffset,
        ),
        collection_note: fetchResult.note,
        collection_status: fetchResult.status,
        last_api_match_id: lastApiMatchId,
        last_attempted_at: attemptedAt,
        last_completed_at: null,
        last_match_datetime_utc: lastMatchDatetimeUtc,
        matches_collected_count: matchCount,
        next_offset: currentOffset,
        requests_completed: requestsCompleted,
      });

      return {
        account_id: accountRow.account_id,
        collection_note: fetchResult.note,
        collection_status: fetchResult.status,
        match_rows_collected: matchCount,
      };
    }

    requestsCompleted += 1;

    const pageRows = transformOpenDotaRows(
      scopePlayer,
      accountRow.account_id,
      fetchResult.rows,
      heroMap,
      cutoffTimestamp,
    );

    insertPracticeMatches(database, scopePlayer.scope_player_id, scopePlayer, pageRows);

    if (fetchResult.rows.length > 0) {
      const lastRow = fetchResult.rows[fetchResult.rows.length - 1];
      lastApiMatchId = String(lastRow.match_id);
      lastMatchDatetimeUtc = isoFromUnixSeconds(lastRow.start_time);
    }

    currentOffset += fetchResult.rows.length;
    const matchCount = getAccountMatchCount(database, accountRow.account_id);
    const hasMoreRows = fetchResult.rows.length === options.batchSize;

    if (hasMoreRows) {
      updatePlayerAccountProgress(database, accountRow.account_id, {
        api_endpoint: fetchResult.request_url,
        collection_note: `Scanned ${currentOffset} OpenDota row(s) so far`,
        collection_status: 'pending',
        last_api_match_id: lastApiMatchId,
        last_attempted_at: attemptedAt,
        last_completed_at: null,
        last_match_datetime_utc: lastMatchDatetimeUtc,
        matches_collected_count: matchCount,
        next_offset: currentOffset,
        requests_completed: requestsCompleted,
      });

      if (options.requestDelayMs > 0) {
        await sleep(options.requestDelayMs);
      }

      continue;
    }

    const finalStatus = matchCount > 0 ? 'collected' : 'no_rows';
    const finalNote =
      fetchResult.rows.length === 0 && currentOffset === 0
        ? 'OpenDota returned no strict practice rows for this account'
        : `Completed OpenDota pagination at offset ${currentOffset}`;

    updatePlayerAccountProgress(database, accountRow.account_id, {
      api_endpoint: fetchResult.request_url,
      collection_note: finalNote,
      collection_status: finalStatus,
      last_api_match_id: lastApiMatchId,
      last_attempted_at: attemptedAt,
      last_completed_at: attemptedAt,
      last_match_datetime_utc: lastMatchDatetimeUtc,
      matches_collected_count: matchCount,
      next_offset: currentOffset,
      requests_completed: requestsCompleted,
    });

    return {
      account_id: accountRow.account_id,
      collection_note: finalNote,
      collection_status: finalStatus,
      match_rows_collected: matchCount,
    };
  }
}

async function collectScopePlayer(database, scopePlayer, heroMap, cutoffTimestamp, options) {
  const accountRows = allSql(
    database,
    `SELECT
       account_id,
       collection_status,
       next_offset,
       requests_completed,
       matches_collected_count,
       last_api_match_id,
       last_match_datetime_utc,
       collection_note
     FROM player_accounts
     WHERE scope_player_id = ?
     ORDER BY account_id`,
    [scopePlayer.scope_player_id],
  );
  const processableAccounts = accountRows.filter((account) =>
    shouldProcessAccount(account.collection_status, options.refreshComplete),
  );

  for (const accountRow of processableAccounts) {
    await collectAccount(database, scopePlayer, accountRow, heroMap, cutoffTimestamp, options);
  }

  const refreshed = refreshScopePlayerCollection(database, scopePlayer.scope_player_id);

  return {
    canonical_handle: scopePlayer.canonical_handle,
    collection_note: refreshed.collection_note,
    collection_status: refreshed.collection_status,
    match_rows_collected: refreshed.matches_collected_count,
    scope_player_id: scopePlayer.scope_player_id,
  };
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

function buildSummary(database, options, runId, startedAt, completedAt, scopePlayers, d2scMappings, beforeRows, selectedPlayersCount, processedPlayersCount, heroMap) {
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
  const rowsAfter = Number(aggregateRows?.practice_match_rows || 0);

  return {
    generated_at: completedAt,
    started_at: startedAt,
    run_id: runId,
    source_provider: 'opendota_player_matches',
    input_files: {
      d2sc_readme: relativeToRepo(options.d2scReadmePath),
      heroes_db: fs.existsSync(options.heroesDbPath) ? relativeToRepo(options.heroesDbPath) : null,
      player_inventory: relativeToRepo(options.playerInventoryPath),
    },
    cutoff_datetime_utc: options.cutoffDatetimeUtc,
    config: {
      batch_size: options.batchSize,
      concurrency: options.concurrency,
      max_players: options.maxPlayers,
      refresh_complete: options.refreshComplete,
      request_delay_ms: options.requestDelayMs,
      reset: options.reset,
      strict_game_mode_id: OPEN_DOTA_NONE_GAME_MODE,
      strict_lobby_type_id: OPEN_DOTA_PRACTICE_LOBBY_TYPE,
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
      practice_match_rows_added_this_run: rowsAfter - beforeRows,
      practice_match_rows_collected: rowsAfter,
      scope_player_statuses: collectionStatuses,
    },
    caveats: [
      'The canonical stage-3 collector uses OpenDota player match history because live Dotabuff validation remained Cloudflare-blocked in this environment on 2026-03-08.',
      'Strict practice filtering is enforced numerically: lobby_type = 1 (Practice) and game_mode = 0 (None).',
      'Rows are stored per player account and match. The same match_id can appear multiple times across different players.',
      'D2SC README mappings are only applied when alias matching resolves to exactly one stage-2 player.',
      heroMap.size > 0
        ? `Hero names were resolved locally from ${relativeToRepo(options.heroesDbPath)}.`
        : 'Hero names fell back to `Hero <id>` because no local heroes table was available.',
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
    const heroMap = loadHeroMap(options.heroesDbPath);
    const seenAt = new Date().toISOString();

    for (const scopePlayer of scopePlayers) {
      const scopePlayerId = upsertScopePlayer(database, scopePlayer, seenAt);

      for (const mapping of scopePlayer.account_mappings) {
        upsertPlayerAccount(database, scopePlayerId, scopePlayer, mapping, options);
      }
    }

    refreshAllScopePlayers(database);

    const beforeRows = Number(
      getSql(database, 'SELECT COUNT(*) AS count FROM practice_matches')?.count || 0,
    );
    const playersToProcess = selectPlayersToProcess(
      database,
      options.maxPlayers,
      options.refreshComplete,
    );
    const scopePlayerRecordsById = new Map(loadScopePlayerRecords(database).map((row) => [row.scope_player_id, row]));
    const selectedScopePlayers = playersToProcess
      .map((row) => scopePlayerRecordsById.get(row.scope_player_id))
      .filter(Boolean);
    const perPlayerSummaries = [];

    if (selectedScopePlayers.length > 0) {
      let nextIndex = 0;
      const workerCount = Math.min(options.concurrency, selectedScopePlayers.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (nextIndex < selectedScopePlayers.length) {
          const scopePlayer = selectedScopePlayers[nextIndex];
          nextIndex += 1;
          const summary = await collectScopePlayer(
            database,
            scopePlayer,
            heroMap,
            cutoffTimestamp,
            options,
          );
          perPlayerSummaries.push(summary);
        }
      });

      await Promise.all(workers);
    }

    refreshAllScopePlayers(database);

    const completedAt = new Date().toISOString();
    completeCollectionRun(database, runId, completedAt);

    const summary = buildSummary(
      database,
      options,
      runId,
      startedAt,
      completedAt,
      scopePlayers,
      d2scMappings,
      beforeRows,
      selectedScopePlayers.length,
      perPlayerSummaries.length,
      heroMap,
    );

    fs.writeFileSync(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

    console.log(`[stage3] scope players: ${summary.counts.players_total}`);
    console.log(`[stage3] player accounts: ${summary.counts.accounts_total}`);
    console.log(`[stage3] players processed this run: ${summary.counts.players_processed_this_run}`);
    console.log(`[stage3] practice match rows: ${summary.counts.practice_match_rows_collected}`);
    console.log(`[stage3] rows added this run: ${summary.counts.practice_match_rows_added_this_run}`);
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
