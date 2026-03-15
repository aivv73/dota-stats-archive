import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(repoRoot, 'dota_archive.db');

const SOURCE_TOURNAMENT = 'Electronic Sports World Cup 2011';
const LEAGUE_ID = 65000;
const OPEN_DOTA_BASE_URL = 'https://api.opendota.com/api';

const MATCH_SIDE_TO_TEAM = new Map([
  [86405, { Radiant: 'Moscow Five', Dire: 'Storm Games Clan' }],
  [86443, { Radiant: 'Virus Gaming', Dire: 'monkeybusiness' }],
  [86532, { Radiant: 'EHOME', Dire: 'Storm Games Clan' }],
  [86595, { Radiant: 'Virus Gaming', Dire: 'Moscow Five' }],
  [86722, { Radiant: 'EHOME', Dire: 'Virus Gaming' }],
  [86790, { Radiant: 'monkeybusiness', Dire: 'Moscow Five' }],
  [86922, { Radiant: 'Virus Gaming', Dire: 'Storm Games Clan' }],
  [87004, { Radiant: 'monkeybusiness', Dire: 'EHOME' }],
  [87120, { Radiant: 'monkeybusiness', Dire: 'Storm Games Clan' }],
  [87161, { Radiant: 'EHOME', Dire: 'Moscow Five' }],
  [88786, { Radiant: 'NEXT.kz', Dire: 'GamersLeague' }],
  [88792, { Radiant: 'Orange eSports', Dire: 'BX3 eSports Club' }],
  [88913, { Radiant: 'BX3 eSports Club', Dire: 'Natus Vincere' }],
  [88948, { Radiant: 'Orange eSports', Dire: 'GamersLeague' }],
  [89113, { Radiant: 'NEXT.kz', Dire: 'Orange eSports' }],
  [89136, { Radiant: 'Natus Vincere', Dire: 'GamersLeague' }],
  [89314, { Radiant: 'NEXT.kz', Dire: 'Natus Vincere' }],
  [89343, { Radiant: 'BX3 eSports Club', Dire: 'GamersLeague' }],
  [89492, { Radiant: 'NEXT.kz', Dire: 'BX3 eSports Club' }],
  [89603, { Radiant: 'Orange eSports', Dire: 'Natus Vincere' }],
  [90992, { Radiant: 'EHOME', Dire: 'GamersLeague' }],
  [91026, { Radiant: 'monkeybusiness', Dire: 'Natus Vincere' }],
  [91105, { Radiant: 'monkeybusiness', Dire: 'GamersLeague' }],
  [91112, { Radiant: 'Natus Vincere', Dire: 'EHOME' }],
  [91151, { Radiant: 'EHOME', Dire: 'Natus Vincere' }],
]);

const ACCOUNT_ID_TO_CANONICAL_PLAYER = new Map([
  // Natus Vincere
  [70388657, 'Dendi'],
  [89625472, 'XBOCT'],
  [89713365, 'ARS-ART'],
  [87277951, 'Puppey'],
  [85716771, 'LighTofHeaveN'],

  // EHOME
  [89399750, 'QQQ'],
  [89423756, 'LaNm'],
  [89425982, 'ARS'],
  [89427480, 'PCT'],
  [89407113, 'MMY!'],

  // NEXT.kz
  [88792641, 'eQual'],
  [69325073, 'Mantis'],
  [88704095, 'LuCKy'],
  [58017868, 'BeaR'],
  [89309501, 'RONIN'],

  // monkeybusiness
  [74432222, 'miGGel'],
  [20237599, 'Link'],
  [8517055, 'AngeL'],
  [26682464, 'Ryze'],
  [26863344, 'CalculuS'],

  // Orange eSports
  [89871557, 'Mushi'],
  [86762037, 'WinteR'],
  [89330493, 'XtiNcT'],

  // GamersLeague
  [90180366, 'Mitch'],
  [90199779, 'grizine'],
  [90211028, 'ANdre'],

  // Virus Gaming
  [86793739, 'Garter'],
  [87291311, 'Ph0eNiiX'],
  [16769223, 'Sockshka'],
  [88271237, '7ckngMad'],
  [85829253, 'Maldejambes'],

  // Moscow Five (high confidence only)
  [87565571, 'PGG'],
  [87586992, 'God'],
  [89782335, 'Dread'],

  // Storm Games Clan (high confidence only)
  [7932121, 'craNich'],
  [9230085, 'Tulex'],
]);

const RAW_NAME_FALLBACKS = new Map([
  ['Link 🍀', 'Link'],
  ['Mitch--', 'Mitch'],
  ['causalité', 'Sockshka'],
  ['garter', 'Garter'],
  ['©', 'ARS-ART'],
  ['Dondoxic', 'Dendi'],
  ['brick by brick', 'XBOCT'],
  ['Mantis / refresher', 'Mantis'],
  ['WtR', 'WinteR'],
  ['紙短情長', 'XtiNcT'],
  ['PowerNet', '7ckngMad'],
  ['66', 'QQQ'],
  ['疯鱼', 'LaNm'],
  ['默苍离', 'PCT'],
  ['奶德', 'MMY!'],
  ['DR', 'craNich'],
  ['13', 'God'],
  ['HDE', 'Dread'],
  ['pleased', 'PGG'],
]);

function parseArgs(argv) {
  const options = {
    apply: false,
    dbPath: defaultDbPath,
    matchIds: null,
    limit: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--db') {
      options.dbPath = path.resolve(argv[index + 1]);
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

function normalizeInt(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function sideFromPlayerSlot(playerSlot) {
  return Number(playerSlot) < 128 ? 'Radiant' : 'Dire';
}

function normalizeRawName(player) {
  if (typeof player.personaname === 'string' && player.personaname.trim()) {
    return player.personaname.trim();
  }

  if (typeof player.name === 'string' && player.name.trim()) {
    return player.name.trim();
  }

  return 'Unknown';
}

function canonicalizePlayerName(player) {
  const accountId = normalizeInt(player.account_id);
  if (accountId !== null && ACCOUNT_ID_TO_CANONICAL_PLAYER.has(accountId)) {
    return ACCOUNT_ID_TO_CANONICAL_PLAYER.get(accountId);
  }

  const rawName = normalizeRawName(player);
  if (RAW_NAME_FALLBACKS.has(rawName)) {
    return RAW_NAME_FALLBACKS.get(rawName);
  }

  return rawName;
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

function loadRows(db, options) {
  const rows = db.prepare(`
    SELECT
      l.match_id,
      l.stage,
      l.match_date_utc,
      l.team1,
      l.team2,
      m.tournament_id,
      m.start_time,
      m.duration,
      m.winner,
      m.league_id,
      m.lobby_type,
      m.winner_team,
      m.winner_side
    FROM league_match_staging l
    JOIN matches m
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

function loadCurrentPlayers(db, matchId) {
  return db.prepare(`
    SELECT player_name, team, hero_id, kills, deaths, assists
    FROM players
    WHERE match_id = ?
  `).all(matchId);
}

function buildNormalizedMatchRow(payload, existingRow, sideToTeam) {
  const winnerSide = typeof payload.radiant_win === 'boolean'
    ? (payload.radiant_win ? 'Radiant' : 'Dire')
    : existingRow.winner;

  return {
    tournament_id: existingRow.tournament_id,
    start_time: toIsoUtc(Number(payload.start_time)) ?? existingRow.start_time,
    duration: payload.duration == null ? existingRow.duration : String(payload.duration),
    winner: winnerSide,
    league_id: normalizeInt(payload.leagueid) ?? existingRow.league_id,
    lobby_type: normalizeInt(payload.lobby_type) ?? existingRow.lobby_type,
    winner_team: winnerSide ? (sideToTeam?.[winnerSide] ?? existingRow.winner_team) : existingRow.winner_team,
    winner_side: winnerSide ?? existingRow.winner_side,
    match_id: Number(payload.match_id),
  };
}

function buildNormalizedPlayers(payload) {
  const players = Array.isArray(payload.players) ? payload.players : [];

  return players.map((player) => ({
    match_id: Number(payload.match_id),
    team: sideFromPlayerSlot(player.player_slot),
    player_name: canonicalizePlayerName(player),
    hero_name: null,
    hero_id: normalizeInt(player.hero_id),
    kills: normalizeInt(player.kills),
    deaths: normalizeInt(player.deaths),
    assists: normalizeInt(player.assists),
  }));
}

function summarizeNameChanges(currentPlayers, normalizedPlayers) {
  const currentKeys = new Set(
    currentPlayers.map((player) => [player.team, player.hero_id, player.kills, player.deaths, player.assists, player.player_name].join('|')),
  );

  const changes = [];
  for (const player of normalizedPlayers) {
    const exactKey = [player.team, player.hero_id, player.kills, player.deaths, player.assists, player.player_name].join('|');
    if (currentKeys.has(exactKey)) {
      continue;
    }

    const candidate = currentPlayers.find((currentPlayer) => (
      currentPlayer.team === player.team
      && currentPlayer.hero_id === player.hero_id
      && currentPlayer.kills === player.kills
      && currentPlayer.deaths === player.deaths
      && currentPlayer.assists === player.assists
    ));

    if (candidate && candidate.player_name !== player.player_name) {
      changes.push(`${player.team} hero=${player.hero_id}: ${candidate.player_name} -> ${player.player_name}`);
    }
  }

  return changes;
}

function buildWriters(db) {
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

  const applyNormalization = (matchRow, playerRows) => {
    db.exec('BEGIN');

    try {
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

      db.exec('COMMIT');
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {}
      throw error;
    }
  };

  return { applyNormalization };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = new DatabaseSync(options.dbPath, { readonly: !options.apply });
  const rows = loadRows(db, options);

  if (rows.length === 0) {
    console.log('No ESWC 2011 match rows matched the current filters.');
    return;
  }

  const writers = options.apply ? buildWriters(db) : null;
  const summary = {
    matchesConsidered: rows.length,
    fetchable: 0,
    normalized: 0,
    changedPlayerLabels: 0,
    changedWinnerLabels: 0,
    failed: 0,
  };

  console.log(`# ESWC 2011 identity normalizer (${options.apply ? 'apply' : 'dry-run'})`);
  console.log(`DB: ${path.relative(repoRoot, options.dbPath)}`);
  console.log(`Source tournament: ${SOURCE_TOURNAMENT}`);
  console.log(`League ID: ${LEAGUE_ID}`);

  for (const row of rows) {
    const sideToTeam = MATCH_SIDE_TO_TEAM.get(Number(row.match_id));
    if (!sideToTeam) {
      summary.failed += 1;
      console.log(`${row.match_id}: missing side->team mapping, skipping`);
      continue;
    }

    let fetchResult;
    try {
      fetchResult = await fetchOpenDotaMatch(row.match_id);
    } catch (error) {
      summary.failed += 1;
      console.log(`${row.match_id}: fetch failed (${describeError(error)})`);
      continue;
    }

    if (!fetchResult.ok) {
      summary.failed += 1;
      console.log(`${row.match_id}: not fetchable (HTTP ${fetchResult.status}${fetchResult.statusText ? ` ${fetchResult.statusText}` : ''})`);
      continue;
    }

    summary.fetchable += 1;

    const matchRow = buildNormalizedMatchRow(fetchResult.payload, row, sideToTeam);
    const playerRows = buildNormalizedPlayers(fetchResult.payload);
    const currentPlayers = loadCurrentPlayers(db, row.match_id);
    const changes = summarizeNameChanges(currentPlayers, playerRows);
    const winnerChanged = row.winner_team !== matchRow.winner_team || row.winner_side !== matchRow.winner_side;

    if (changes.length > 0) {
      summary.changedPlayerLabels += changes.length;
    }
    if (winnerChanged) {
      summary.changedWinnerLabels += 1;
    }

    console.log(`\n${row.match_id}: ${row.team1} vs ${row.team2}`);
    console.log(`  side map: Radiant=${sideToTeam.Radiant} | Dire=${sideToTeam.Dire}`);
    console.log(`  winner labels: ${row.winner_team ?? 'null'}/${row.winner_side ?? 'null'} -> ${matchRow.winner_team ?? 'null'}/${matchRow.winner_side ?? 'null'}`);
    if (changes.length === 0) {
      console.log('  player label changes: none');
    } else {
      for (const change of changes) {
        console.log(`  player label change: ${change}`);
      }
    }

    if (!options.apply) {
      continue;
    }

    try {
      writers.applyNormalization(matchRow, playerRows);
      summary.normalized += 1;
    } catch (error) {
      summary.failed += 1;
      console.log(`  apply failed: ${describeError(error)}`);
    }
  }

  console.log('\nSummary');
  console.log(`- matches considered: ${summary.matchesConsidered}`);
  console.log(`- fetchable from OpenDota: ${summary.fetchable}`);
  console.log(`- matches normalized: ${summary.normalized}`);
  console.log(`- player label changes detected: ${summary.changedPlayerLabels}`);
  console.log(`- winner/team label changes detected: ${summary.changedWinnerLabels}`);
  console.log(`- failures: ${summary.failed}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
