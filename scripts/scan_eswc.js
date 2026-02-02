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

async function scanMatches(centerId, range) {
    const startId = centerId - range;
    const endId = centerId + range;
    
    console.log(`Scanning matches from ${startId} to ${endId}...`);

    for (let matchId = startId; matchId <= endId; matchId++) {
        const match = await getMatchDetails(matchId);
        if (!match) {
            // console.log(`Match ${matchId} not found.`);
            continue;
        }

        // Filter for ESWC 2011 dates (Oct 21-25, 2011)
        // Timestamp for Oct 21, 2011: 1319155200
        // Timestamp for Oct 26, 2011: 1319587200
        const startTime = match.start_time;
        if (startTime >= 1319155200 && startTime <= 1319587200) {
            console.log(`FOUND ESWC CANDIDATE: ${matchId}`);
            console.log(`  Date: ${new Date(startTime * 1000).toISOString()}`);
            console.log(`  League ID: ${match.leagueid}`);
            console.log(`  Lobby Type: ${match.lobby_type}`);
            
            // Check teams via players if team names are missing
            const radiant = match.radiant_name || "Radiant";
            const dire = match.dire_name || "Dire";
            console.log(`  Teams: ${radiant} vs ${dire}`);
            
            // Print a player to identify team
            if (match.players && match.players.length > 0) {
                 const p1 = match.players[0].name || match.players[0].personaname || "Unknown";
                 console.log(`  Player 1: ${p1}`);
            }

            // Save to DB? Or just log for now?
            // Let's just log to identify the cluster.
        } else {
            // console.log(`Match ${matchId} outside date range: ${new Date(startTime * 1000).toISOString()}`);
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 800)); 
    }
}

// Center around 91112 (Finals?)
// We scan a bit backwards and forwards to find the whole tournament.
// 91112 was Oct 2011.
scanMatches(91112, 50); // Scan +/- 50 matches around 91112
