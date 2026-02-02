const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

async function getMatchDetails(matchId) {
    console.log(`Fetching match ${matchId}...`);
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Failed to fetch match ${matchId}:`, e);
        return null;
    }
}

async function updateMatch(match) {
    return new Promise((resolve, reject) => {
        const duration = match.duration || 0;
        const winner = match.radiant_win ? 'Radiant' : 'Dire';
        const startTime = match.start_time ? new Date(match.start_time * 1000).toISOString() : null;

        db.run(`UPDATE matches SET duration = ?, winner = ?, start_time = COALESCE(?, start_time) WHERE match_id = ?`,
            [duration, winner, startTime, match.match_id],
            function(err) {
                if (err) return reject(err);
                resolve();
            }
        );
    });
}

async function insertPlayers(matchId, players) {
    return new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(`INSERT OR REPLACE INTO players (match_id, team, player_name, hero_id, kills, deaths, assists, hero_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

        for (const player of players) {
            const team = player.player_slot < 128 ? 'Radiant' : 'Dire';
            const playerName = player.personaname || player.name || 'Anonymous';
            const heroId = player.hero_id;
            const kills = player.kills;
            const deaths = player.deaths;
            const assists = player.assists;

            // We can resolve hero_name if needed, but let's query the heroes table or leave empty for now
            // We'll leave hero_name NULL for now and fix via join later or query
            // Or use a subquery/lookup if we pre-loaded heroes map. 
            // Let's just insert hero_id for now and update later if needed.
            // Wait, the players table has hero_name column.
            stmt.run(matchId, team, playerName, heroId, kills, deaths, assists, null);
        }

        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function processMatches() {
    db.all("SELECT match_id FROM matches WHERE duration IS NULL LIMIT 50", async (err, rows) => { // Batch of 50
        if (err) {
            console.error("Error fetching match IDs:", err);
            return;
        }

        console.log(`Processing ${rows.length} matches...`);

        for (const row of rows) {
            const matchId = row.match_id;
            const matchData = await getMatchDetails(matchId);
            
            if (matchData) {
                await updateMatch(matchData);
                if (matchData.players) {
                    await insertPlayers(matchId, matchData.players);
                }
                console.log(`Updated match ${matchId}`);
            } else {
                console.log(`Match ${matchId} not found or error.`);
            }

            // Delay to respect rate limits (1s)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        db.close();
    });
}

processMatches();
