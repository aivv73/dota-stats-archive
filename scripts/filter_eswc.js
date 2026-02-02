const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

async function getMatchDetails(matchId) {
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

async function updateMatch(matchId, leagueId, lobbyType) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE matches SET league_id = ?, lobby_type = ? WHERE match_id = ?`,
            [leagueId, lobbyType, matchId],
            function(err) {
                if (err) return reject(err);
                resolve();
            }
        );
    });
}

// We will fetch matches that we already inserted (tournament_id=999) OR scan the known ESWC range again if needed.
// The previous script was killed, so let's check what we have.
// Better yet, let's just scan the critical range (91000-91200) and UPDATE the DB.
// This is more reliable.

async function scanAndFilter() {
    console.log("Scanning critical ESWC range (91000-91200)...");
    
    // First, let's insert placeholders for this range so we can iterate? No, just loop.
    
    const startId = 91000;
    const endId = 91200;
    
    let tournamentMatches = [];

    for (let matchId = startId; matchId <= endId; matchId++) {
        const match = await getMatchDetails(matchId);
        
        if (!match) continue;

        // Save metadata
        const leagueId = match.leagueid;
        const lobbyType = match.lobby_type;
        
        // Update DB if exists, or Insert if new (we should probably use INSERT OR REPLACE to be safe)
        // But let's just use the updateMatch function if it exists, or insert full match.
        // Actually let's use a full upsert.
        
        await new Promise((resolve, reject) => {
             const duration = match.duration || 0;
             const winner = match.radiant_win ? 'Radiant' : 'Dire';
             const startTime = match.start_time ? new Date(match.start_time * 1000).toISOString() : null;
             
             db.run(`INSERT OR REPLACE INTO matches (match_id, tournament_id, start_time, duration, winner, league_id, lobby_type) VALUES (?, 999, ?, ?, ?, ?, ?)`,
                [matchId, startTime, duration, winner, leagueId, lobbyType],
                (err) => { if (err) console.error(err); resolve(); }
             );
        });

        // Check if it's "The Internal" or a Tournament Lobby
        if (leagueId === 65000 || lobbyType === 1 || lobbyType === 2) { // 1=Practice, 2=Tournament
            console.log(`[ESWC FOUND] Match ${matchId}: League=${leagueId}, Lobby=${lobbyType}`);
            
            // Print players to confirm
            if (match.players) {
                const p1 = match.players[0]?.name || match.players[0]?.personaname || "Unknown";
                const p2 = match.players[5]?.name || match.players[5]?.personaname || "Unknown";
                console.log(`  Players: ${p1} vs ${p2}`);
            }
            tournamentMatches.push(matchId);
        }

        await new Promise(r => setTimeout(r, 800)); // Rate limit
    }

    console.log(`\nScan complete. Found ${tournamentMatches.length} potential tournament matches.`);
    db.close();
}

scanAndFilter();
