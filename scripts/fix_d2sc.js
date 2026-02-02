const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

const CORRECT_MATCH_IDS = [1186004, 1194490, 1199424];
const TOURNAMENT_ID = 1;

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

db.serialize(() => {
    // 1. Delete wrong matches
    db.run("DELETE FROM matches WHERE tournament_id = ?", [TOURNAMENT_ID], function(err) {
        if (err) console.error("Error deleting old matches:", err);
        else console.log(`Deleted ${this.changes} wrong matches for tournament ${TOURNAMENT_ID}.`);
        
        // Cleanup players (again, just to be safe)
        db.run("DELETE FROM players WHERE match_id NOT IN (SELECT match_id FROM matches)");
    });

    // 2. Insert and Fetch new matches
    // We do this async outside serialize for the fetch part, or use a Promise wrapper.
    // Let's just insert placeholders first.
    const stmt = db.prepare("INSERT OR REPLACE INTO matches (match_id, tournament_id) VALUES (?, ?)");
    CORRECT_MATCH_IDS.forEach(id => {
        stmt.run(id, TOURNAMENT_ID);
        console.log(`Inserted placeholder for match ${id}`);
    });
    stmt.finalize();
});

// 3. Process the new matches
async function processCorrectMatches() {
    // Wait for DB operations to queue
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const matchId of CORRECT_MATCH_IDS) {
        const matchData = await getMatchDetails(matchId);
        if (matchData) {
            const duration = matchData.duration || 0;
            const winner = matchData.radiant_win ? 'Radiant' : 'Dire';
            const startTime = matchData.start_time ? new Date(matchData.start_time * 1000).toISOString() : null;
            const leagueId = matchData.leagueid;
            const lobbyType = matchData.lobby_type;

            db.run(`UPDATE matches SET duration = ?, winner = ?, start_time = ?, league_id = ?, lobby_type = ? WHERE match_id = ?`,
                [duration, winner, startTime, leagueId, lobbyType, matchId],
                (err) => {
                    if (err) console.error(`Error updating match ${matchId}:`, err);
                    else console.log(`Updated details for match ${matchId}`);
                }
            );

            // Insert players
             if (matchData.players) {
                db.run('BEGIN TRANSACTION');
                const pStmt = db.prepare(`INSERT OR REPLACE INTO players (match_id, team, player_name, hero_id, kills, deaths, assists) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                
                for (const player of matchData.players) {
                    const team = player.player_slot < 128 ? 'Radiant' : 'Dire';
                    const playerName = player.personaname || player.name || 'Anonymous';
                    pStmt.run(matchId, team, playerName, player.hero_id, player.kills, player.deaths, player.assists);
                }
                pStmt.finalize();
                db.run('COMMIT');
                console.log(`Inserted players for match ${matchId}`);
             }
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    db.close();
}

processCorrectMatches();
