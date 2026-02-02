const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Function to fetch match details from OpenDota (mocked for now, assumes DB or API)
// Since we don't have an API to "list matches by league" easily without premium OpenDota tier,
// we will scan a range of match IDs known to be around late 2011/early 2012.
// OR we can use the `explorer` query if available, but we can't.
// We will scan intelligently around known center points.

// Known centers:
// ESWC 2011: ~91112 (Oct 2011)
// DreamHack Winter 2011: ~Nov 2011 (need to find a center)
// The Defense 1: ~Dec 2011 - Feb 2012

// Let's create a script that scans specific ranges for League 65000 OR specific known players in lobbies.

async function getMatchDetails(matchId) {
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (response.status === 404) return null;
        if (response.status === 429) {
            // console.log("Rate limited, waiting...");
            await new Promise(r => setTimeout(r, 2000));
            return getMatchDetails(matchId); // Retry
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Failed to fetch match ${matchId}:`, e);
        return null;
    }
}

async function saveMatch(match) {
    return new Promise((resolve, reject) => {
        const duration = match.duration || 0;
        const winner = match.radiant_win ? 'Radiant' : 'Dire';
        const startTime = match.start_time ? new Date(match.start_time * 1000).toISOString() : null;
        
        // Insert tournament placeholder if not exists
        // We will assign tournament_id later manually or via logic
        // For now, let's just save matches to a temp table or directly to matches with tournament_id = 999 (Unknown/Internal)
        
        db.serialize(() => {
            db.run(`INSERT OR IGNORE INTO tournaments (id, name, dates) VALUES (999, 'The Internal / Unknown', '2011-2012')`);
            
            db.run(`INSERT OR REPLACE INTO matches (match_id, tournament_id, start_time, duration, winner) VALUES (?, ?, ?, ?, ?)`,
                [match.match_id, 999, startTime, duration, winner],
                (err) => {
                    if (err) console.error(err);
                }
            );

            // Insert players
            if (match.players) {
                const stmt = db.prepare(`INSERT OR REPLACE INTO players (match_id, team, player_name, hero_id, kills, deaths, assists, hero_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                for (const player of match.players) {
                    const team = player.player_slot < 128 ? 'Radiant' : 'Dire';
                    const playerName = player.personaname || player.name || 'Unknown';
                    stmt.run(match.match_id, team, playerName, player.hero_id, player.kills, player.deaths, player.assists, null); // hero_name null for now
                }
                stmt.finalize();
            }
            resolve();
        });
    });
}

async function scanRange(startId, endId, label) {
    console.log(`Scanning ${label}: ${startId} to ${endId}`);
    for (let matchId = startId; matchId <= endId; matchId++) {
        const match = await getMatchDetails(matchId);
        if (!match) continue;

        // Check for League 65000 OR known tournament dates + Lobby Type 1 (Practice) or 0 (Public) with pro players
        // ESWC 2011 dates: Oct 21-25 2011 -> 1319155200 to 1319587200
        
        const isLeague65000 = match.leagueid === 65000;
        const isESWCDate = match.start_time >= 1319155200 && match.start_time <= 1319587200;
        
        if (isLeague65000 || (isESWCDate && (match.lobby_type === 1 || match.lobby_type === 0))) {
            console.log(`[${label}] FOUND Match ${matchId}: League=${match.leagueid}, Lobby=${match.lobby_type}, Date=${new Date(match.start_time*1000).toISOString()}`);
            await saveMatch(match);
        }

        await new Promise(r => setTimeout(r, 1100)); // Respect rate limit
    }
}

// ESWC Range: 90000 to 92000 (roughly covering Oct 2011)
scanRange(90000, 92000, "ESWC_2011_Scan");
