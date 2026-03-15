import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(repoRoot, 'dota_archive.db');

const SOURCE_TOURNAMENT = 'Electronic Sports World Cup 2011';
const LEAGUE_ID = 65000;
const DEFAULT_TOURNAMENT_ID = 1000;
const OPEN_DOTA_BASE_URL = 'https://api.opendota.com/api';

function parseArgs(argv) {
  const options = {
    apply: false,
    replaceExisting: false,
    dbPath: defaultDbPath,
    tournamentId: DEFAULT_TOURNAMENT_ID,
    matchIds: null,
    limit: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--replace-existing') {
      options.replaceExisting = true;
      continue;
    }

    if (arg === '--db') {
      options.dbPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--tournament-id') {
      options.tournamentId = Number.parseInt(argv[index + 1], 10);
      index += 1;
      continue;
    }

    if (arg === '--limit') {
      options.limit = Number.parseInt(argv[index + 1], 10);
      index += 1;
      continue;
    }

    if (arg === '--match-id') {
      const raw = argv[index + 1] ?? '';
      const ids = raw
        .split(',')
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter(Number.isInteger);
      options.matchIds = new Set([...(options.matchIds ?? []), ...ids]);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(options.tournamentId)) {
    throw new Error('--tournament-id must be an integer');
  }

  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit <= 0)) {
    throw new Error('--limit must be a positive integer');
  }

  if (options.matchIds && options.matchIds.size === 0) {
    throw new Error('--match-id requires at least one numeric value');
  }

  return options;
}

function toIsoUtc(startTimeSeconds) {
  if (!Number.isFinite(startTimeSeconds)) {
    return null;
  }

  return new Date(startTimeSeconds * 1000).toISOString();
}

function sideFromPlayerSlot(playerSlot) {
  return Number(playerSlot) < 128 ? 'Radiant' : 'Dire';
}

function normalizePlayerName(player) {
  if (typeof player.personaname === 'string' && player.personaname.trim()) {
    return player.personaname.trim();
  }

  if (typeof player.name === 'string' && player.name.trim()) {
    return player.name.trim();
  }

  return 'Unknown';
}

function normalizeInt(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function describeError(error) {
  if (!error) {
    return 'unknown error';
  }

  const parts = [];

  if (error.message) {
    parts.push(error.message);
  }

  if (error.cause?.code) {
    parts.push(`cause=${error.cause.code}`);
  }

  return parts.join(' | ') || String(error);
}

function mapMatchRow(payload, tournamentId) {
  const winner = typeof payload.radiant_win === 'boolean'
    ? (payload.radiant_win ? 'Radiant' : 'Dire')
    : null;

  return {
    match_id: Number(payload.match_id),
    tournament_id: tournamentId,
    start_time: toIsoUtc(Number(payload.start_time)),
    duration: payload.duration == null ? null : String(payload.duration),
    winner,
    league_id: normalizeInt(payload.leagueid) ?? LEAGUE_ID,
    lobby_type: normalizeInt(payload.lobby_type),
    winner_team: null,
    winner_side: null,
  };
}

function mapPlayerRows(payload) {
  const players = Array.isArray(payload.players) ? payload.players : [];

  return players.map((player) => ({
    match_id: Number(payload.match_id),
    team: sideFromPlayerSlot(player.player_slot),
    player_name: normalizePlayerName(player),
    hero_name: null,
    hero_id: normalizeInt(player.hero_id),
    kills: normalizeInt(player.kills),
    deaths: normalizeInt(player.deaths),
    assists: normalizeInt(player.assists),
  }));
}

async function fetchOpenDotaMatch(matchId) {
  const response = await fetch(`${OPEN_DOTA_BASE_URL}/matches/${matchId}`);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      payload: null,
    };
  }

  const payload = await response.json();

  if (Number(payload.match_id) !== Number(matchId)) {
    return {
      ok: false,
      status: response.status,
      statusText: `unexpected match_id ${payload.match_id}`,
      payload,
    };
  }

  return {
    ok: true,
    status: response.status,
    statusText: response.statusText,
    payload,
  };
}

function loadStagedRows(db, options) {
  const rows = db.prepare(`
    SELECT
      l.id,
      l.match_id,
      l.stage,
      l.match_date_utc,
      l.team1,
      l.team2,
      l.present_in_matches,
      m.match_id AS existing_match_id,
      m.tournament_id AS existing_tournament_id
    FROM league_match_staging l
    LEFT JOIN matches m
      ON m.match_id = l.match_id
    WHERE l.league_id = ?
      AND l.source_tournament = ?
    ORDER BY l.match_date_utc, l.match_id
  `).all(LEAGUE_ID, SOURCE_TOURNAMENT);

  let filteredRows = rows;

  if (options.matchIds) {
    filteredRows = filteredRows.filter((row) => options.matchIds.has(Number(row.match_id)));
  }

  if (options.limit !== null) {
    filteredRows = filteredRows.slice(0, options.limit);
  }

  return filteredRows;
}

function buildWriters(db) {
  const insertMatch = db.prepare(`
    INSERT INTO matches (
      match_id,
      tournament_id,
      start_time,
      duration,
      winner,
      league_id,
      lobby_type,
      winner_team,
      winner_side
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateMatch = db.prepare(`
    UPDATE matches
    SET tournament_id = ?,
        start_time = ?,
        duration = ?,
        winner = ?,
        league_id = ?,
        lobby_type = ?,
        winner_team = ?,
        winner_side = ?
    WHERE match_id = ?
  `);

  const deletePlayers = db.prepare('DELETE FROM players WHERE match_id = ?');
  const insertPlayer = db.prepare(`
    INSERT INTO players (
      match_id,
      team,
      player_name,
      hero_name,
      hero_id,
      kills,
      deaths,
      assists
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateStaging = db.prepare(`
    UPDATE league_match_staging
    SET present_in_matches = 1
    WHERE league_id = ?
      AND source_tournament = ?
      AND match_id = ?
  `);

  const writeImportedMatch = (matchRow, playerRows, { replaceExisting = false } = {}) => {
    db.exec('BEGIN');

    try {
      if (replaceExisting) {
        updateMatch.run(
          matchRow.tournament_id,
          matchRow.start_time,
          matchRow.duration,
          matchRow.winner,
          matchRow.league_id,
          matchRow.lobby_type,
          matchRow.winner_team,
          matchRow.winner_side,
          matchRow.match_id,
        );
      } else {
        insertMatch.run(
          matchRow.match_id,
          matchRow.tournament_id,
          matchRow.start_time,
          matchRow.duration,
          matchRow.winner,
          matchRow.league_id,
          matchRow.lobby_type,
          matchRow.winner_team,
          matchRow.winner_side,
        );
      }

      deletePlayers.run(matchRow.match_id);

      for (const playerRow of playerRows) {
        insertPlayer.run(
          playerRow.match_id,
          playerRow.team,
          playerRow.player_name,
          playerRow.hero_name,
          playerRow.hero_id,
          playerRow.kills,
          playerRow.deaths,
          playerRow.assists,
        );
      }

      updateStaging.run(LEAGUE_ID, SOURCE_TOURNAMENT, matchRow.match_id);
      db.exec('COMMIT');
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {}
      throw error;
    }
  };

  const markPresent = db.prepare(`
    UPDATE league_match_staging
    SET present_in_matches = 1
    WHERE league_id = ?
      AND source_tournament = ?
      AND match_id = ?
      AND present_in_matches = 0
  `);

  return {
    writeImportedMatch,
    markPresent,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = new DatabaseSync(options.dbPath, { readonly: !options.apply });
  const stagedRows = loadStagedRows(db, options);

  if (stagedRows.length === 0) {
    console.log('No staged ESWC 2011 rows matched the current filters.');
    return;
  }

  const writers = options.apply ? buildWriters(db) : null;
  const summary = {
    stagedRows: stagedRows.length,
    alreadyPresent: 0,
    fetchable: 0,
    notFetchable: 0,
    wouldImport: 0,
    wouldRefreshExisting: 0,
    imported: 0,
    refreshedExisting: 0,
    stagingSynced: 0,
    skippedExisting: 0,
    failed: 0,
  };

  console.log(`# ESWC 2011 OpenDota exact-ID importer (${options.apply ? 'apply' : 'dry-run'})`);
  console.log(`DB: ${path.relative(repoRoot, options.dbPath)}`);
  console.log(`Source tournament: ${SOURCE_TOURNAMENT}`);
  console.log(`League ID: ${LEAGUE_ID}`);
  console.log(`Target tournament_id for new inserts: ${options.tournamentId}`);
  console.log(`Replace existing matches: ${options.replaceExisting ? 'yes' : 'no'}`);

  for (const row of stagedRows) {
    const localPresent = row.existing_match_id !== null;

    if (localPresent) {
      summary.alreadyPresent += 1;

      if (!options.replaceExisting) {
        summary.skippedExisting += 1;
        console.log(`${row.match_id}: already present locally (tournament_id=${row.existing_tournament_id ?? 'null'})`);

        if (options.apply && row.present_in_matches !== 1) {
          const result = writers.markPresent.run(LEAGUE_ID, SOURCE_TOURNAMENT, row.match_id);
          if (Number(result.changes) > 0) {
            summary.stagingSynced += 1;
            console.log(`${row.match_id}: staging flag updated to present_in_matches=1`);
          }
        }

        continue;
      }
    }

    let fetchResult;
    try {
      fetchResult = await fetchOpenDotaMatch(row.match_id);
    } catch (error) {
      summary.notFetchable += 1;
      summary.failed += 1;
      console.log(`${row.match_id}: fetch failed (${describeError(error)})`);
      continue;
    }

    if (!fetchResult.ok) {
      summary.notFetchable += 1;
      console.log(`${row.match_id}: not fetchable (HTTP ${fetchResult.status}${fetchResult.statusText ? ` ${fetchResult.statusText}` : ''})`);
      continue;
    }

    summary.fetchable += 1;

    const matchRow = mapMatchRow(fetchResult.payload, options.tournamentId);
    const playerRows = mapPlayerRows(fetchResult.payload);

    if (playerRows.length === 0) {
      summary.failed += 1;
      console.log(`${row.match_id}: fetchable but payload had no players, skipping`);
      continue;
    }

    if (!options.apply) {
      if (localPresent) {
        summary.wouldRefreshExisting += 1;
        console.log(
          `${row.match_id}: fetchable, would refresh existing ${row.team1} vs ${row.team2} | tournament_id ${row.existing_tournament_id ?? 'null'} -> ${options.tournamentId} | start=${matchRow.start_time ?? 'null'} | players=${playerRows.length}`
        );
      } else {
        summary.wouldImport += 1;
        console.log(
          `${row.match_id}: fetchable, would import ${row.team1} vs ${row.team2} | start=${matchRow.start_time ?? 'null'} | players=${playerRows.length}`
        );
      }
      continue;
    }

    try {
      writers.writeImportedMatch(matchRow, playerRows, { replaceExisting: localPresent });
      if (localPresent) {
        summary.refreshedExisting += 1;
        console.log(
          `${row.match_id}: refreshed existing ${row.team1} vs ${row.team2} | tournament_id ${row.existing_tournament_id ?? 'null'} -> ${options.tournamentId} | start=${matchRow.start_time ?? 'null'} | players=${playerRows.length}`
        );
      } else {
        summary.imported += 1;
        console.log(
          `${row.match_id}: imported ${row.team1} vs ${row.team2} | start=${matchRow.start_time ?? 'null'} | players=${playerRows.length}`
        );
      }
    } catch (error) {
      summary.failed += 1;
      console.log(`${row.match_id}: write failed (${describeError(error)})`);
    }
  }

  console.log('\nSummary');
  console.log(`- staged rows considered: ${summary.stagedRows}`);
  console.log(`- already present locally: ${summary.alreadyPresent}`);
  console.log(`- fetchable from OpenDota: ${summary.fetchable}`);
  console.log(`- not fetchable from OpenDota: ${summary.notFetchable}`);
  console.log(`- would import: ${summary.wouldImport}`);
  console.log(`- would refresh existing: ${summary.wouldRefreshExisting}`);
  console.log(`- imported: ${summary.imported}`);
  console.log(`- refreshed existing: ${summary.refreshedExisting}`);
  console.log(`- staging flags synced for existing matches: ${summary.stagingSynced}`);
  console.log(`- skipped because already present: ${summary.skippedExisting}`);
  console.log(`- failures: ${summary.failed}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
