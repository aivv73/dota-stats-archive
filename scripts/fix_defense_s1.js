const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

const TOURNAMENT_ID = 2; // The Defense Season 1

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

async function processMatches() {
    // 1. Get all matches for tournament 2
    const matches = await new Promise((resolve, reject) => {
        db.all("SELECT match_id FROM matches WHERE tournament_id = ?", [TOURNAMENT_ID], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    console.log(`Found ${matches.length} matches for Tournament ${TOURNAMENT_ID}. Fetching details...`);

    let updatedCount = 0;
    let deletedCount = 0;

    for (const row of matches) {
        const matchId = row.match_id;
        const matchData = await getMatchDetails(matchId);

        if (matchData) {
            const leagueId = matchData.leagueid || 0;
            const lobbyType = matchData.lobby_type;
            const duration = matchData.duration || 0;
            const winner = matchData.radiant_win ? 'Radiant' : 'Dire';
            const startTime = matchData.start_time ? new Date(matchData.start_time * 1000).toISOString() : null;

            // Update DB with fetched info
            await new Promise((resolve) => {
                db.run(`UPDATE matches SET duration = ?, winner = ?, start_time = COALESCE(?, start_time), league_id = ?, lobby_type = ? WHERE match_id = ?`,
                    [duration, winner, startTime, leagueId, lobbyType, matchId],
                    (err) => {
                        if (err) console.error(err);
                        resolve();
                    }
                );
            });
            updatedCount++;

            // Check criteria
            // KEEP IF: league_id == 65000 OR lobby_type == 1
            // User also mentioned "The Internal" ticket which is 65000.
            
            const isInternalLeague = (leagueId === 65000);
            const isPrivateLobby = (lobbyType === 1);
            
            // Note: Some old tournament matches might have lobby_type 0 (Public) but correct league_id if parsed incorrectly or very old?
            // But user said: "delete if pub". Pub is typically lobby_type=0.
            
            if (!isInternalLeague && !isPrivateLobby) {
                console.log(`Match ${matchId} (Lobby: ${lobbyType}, League: ${leagueId}) does not meet criteria. Deleting...`);
                await new Promise((resolve) => {
                    db.run("DELETE FROM matches WHERE match_id = ?", [matchId], () => resolve());
                });
                deletedCount++;
            } else {
                console.log(`Match ${matchId} VALID (Lobby: ${lobbyType}, League: ${leagueId}).`);
                
                // Optional: Insert players if valid
                 if (matchData.players) {
                    await new Promise(resolve => {
                         db.run('BEGIN TRANSACTION');
                         const pStmt = db.prepare(`INSERT OR REPLACE INTO players (match_id, team, player_name, hero_id, kills, deaths, assists) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                         for (const player of matchData.players) {
                             const team = player.player_slot < 128 ? 'Radiant' : 'Dire';
                             const playerName = player.personaname || player.name || 'Anonymous';
                             pStmt.run(matchId, team, playerName, player.hero_id, player.kills, player.deaths, player.assists);
                         }
                         pStmt.finalize();
                         db.run('COMMIT', () => resolve());
                    });
                 }
            }

        } else {
            console.log(`Match ${matchId} data not found. Keeping for manual review (or delete if you prefer?).`);
            // Keeping for now.
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nDone. Updated: ${updatedCount}, Deleted: ${deletedCount}`);
    
    // Final report for T2
    db.all(`SELECT lobby_type, league_id, COUNT(*) as count FROM matches WHERE tournament_id = ? GROUP BY lobby_type, league_id`, [TOURNAMENT_ID], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
        db.close();
    });
}

processMatches();
