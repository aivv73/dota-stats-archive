import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const dbPath = path.join(repoRoot, 'dota_archive.db');
const accountNotePath = path.join(__dirname, 'eswc-2011-account-proven-lobbies.md');

function loadAccountConfirmedMatches(markdownPath) {
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const confirmed = new Map();

  for (const line of markdown.split('\n')) {
    const match = line.match(/^\|\s*`(\d+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*account-confirmed\s*\|$/);
    if (!match) {
      continue;
    }

    const [, matchId, dateUtc, pairing] = match;
    confirmed.set(Number(matchId), {
      match_id: Number(matchId),
      date_utc: dateUtc.trim(),
      pairing: pairing.trim(),
    });
  }

  return confirmed;
}

function printSection(title) {
  console.log(`\n## ${title}`);
}

function printBullet(text) {
  console.log(`- ${text}`);
}

const accountConfirmed = loadAccountConfirmedMatches(accountNotePath);
const db = new DatabaseSync(dbPath, { readonly: true });

const tournamentRows = db.prepare(`
  SELECT
    t.id,
    t.name,
    t.dates,
    COUNT(m.match_id) AS match_count,
    MIN(m.start_time) AS first_match_start,
    MAX(m.start_time) AS last_match_start
  FROM tournaments t
  LEFT JOIN matches m
    ON m.tournament_id = t.id
  WHERE t.id IN (999, 1000)
  GROUP BY t.id, t.name, t.dates
  ORDER BY t.id
`).all();

const stagingSummary = db.prepare(`
  SELECT
    stage,
    COUNT(*) AS staged_rows,
    SUM(CASE WHEN present_in_matches = 1 THEN 1 ELSE 0 END) AS present_rows,
    SUM(CASE WHEN present_in_matches = 0 THEN 1 ELSE 0 END) AS missing_rows
  FROM league_match_staging
  WHERE league_id = 65000
    AND source_tournament = 'Electronic Sports World Cup 2011'
  GROUP BY stage
  ORDER BY
    CASE stage
      WHEN 'Group 1' THEN 1
      WHEN 'Group 2' THEN 2
      WHEN 'Semifinal' THEN 3
      WHEN 'Third Place' THEN 4
      WHEN 'Grand Final Game 1' THEN 5
      WHEN 'Grand Final Game 2' THEN 6
      ELSE 99
    END
`).all();

const stagedMatches = db.prepare(`
  SELECT
    l.match_id,
    l.stage,
    l.match_date_utc,
    l.team1,
    l.team2,
    l.expected_winner,
    l.best_of,
    l.present_in_matches,
    m.tournament_id,
    m.start_time,
    m.league_id,
    m.winner
  FROM league_match_staging l
  LEFT JOIN matches m
    ON m.match_id = l.match_id
  WHERE l.league_id = 65000
    AND l.source_tournament = 'Electronic Sports World Cup 2011'
  ORDER BY l.match_date_utc, l.match_id
`).all();

const presentMatches = stagedMatches.filter((row) => row.present_in_matches === 1);
const missingMatches = stagedMatches.filter((row) => row.present_in_matches === 0);

const priorityQueue = missingMatches
  .map((row) => {
    const isAccountConfirmed = accountConfirmed.has(row.match_id);
    const isPlayoff = row.stage !== 'Group 1' && row.stage !== 'Group 2';
    return {
      ...row,
      isAccountConfirmed,
      isPlayoff,
      priority_score: (isAccountConfirmed ? 100 : 0) + (isPlayoff ? 10 : 0),
    };
  })
  .sort((a, b) => {
    if (b.priority_score !== a.priority_score) {
      return b.priority_score - a.priority_score;
    }
    return a.match_id - b.match_id;
  });

console.log('# ESWC 2011 Local DB Report');
console.log(`DB: ${path.relative(repoRoot, dbPath)}`);
console.log(`Account note: ${path.relative(repoRoot, accountNotePath)}`);

printSection('Tournament rows');
for (const row of tournamentRows) {
  const matchCount = Number(row.match_count || 0);
  const dateWindow = row.first_match_start && row.last_match_start
    ? `${row.first_match_start} -> ${row.last_match_start}`
    : 'no matches linked';
  printBullet(`${row.id} | ${row.name} | dates='${row.dates}' | matches=${matchCount} | window=${dateWindow}`);
}

printSection('Staging summary');
for (const row of stagingSummary) {
  printBullet(`${row.stage}: staged=${row.staged_rows}, present=${row.present_rows}, missing=${row.missing_rows}`);
}

printSection('Present staged matches');
for (const row of presentMatches) {
  printBullet(
    `${row.match_id} | ${row.stage} | ${row.team1} vs ${row.team2} | start=${row.start_time} | tournament_id=${row.tournament_id} | league_id=${row.league_id} | winner=${row.winner}`
  );
}

printSection('Priority recovery queue');
for (const row of priorityQueue) {
  const tags = [];
  if (row.isAccountConfirmed) {
    tags.push('account-confirmed');
  }
  if (row.isPlayoff) {
    tags.push('playoff');
  }
  printBullet(
    `${row.match_id} | ${row.stage} | ${row.team1} vs ${row.team2} | ${row.match_date_utc} | ${tags.join(', ') || 'staged-only'}`
  );
}
