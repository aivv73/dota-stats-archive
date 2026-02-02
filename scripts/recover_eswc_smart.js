const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);
const outputPath = path.resolve(__dirname, '../tournaments/eswc_2011/ESWC_2011_Recovered.md');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Write header if new
if (!fs.existsSync(outputPath)) {
    fs.writeFileSync(outputPath, `# ESWC 2011 (Electronic Sports World Cup) - Recovered Matches\n\n**Dates**: Oct 21-25, 2011\n**League ID**: 65000 ("The Internal")\n**Status**: Recovering...\n\n| Match ID | Date | Teams | Winner | Duration | Notes |\n|---|---|---|---|---|---|\n`);
}

async function getMatchDetails(matchId) {
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (response.status === 404) return null;
        if (response.status === 429) {
            console.log(`[${matchId}] Rate limited (429). Waiting 5s...`);
            await new Promise(r => setTimeout(r, 5000));
            return getMatchDetails(matchId); // Retry
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Failed to fetch match ${matchId}:`, e);
        return null;
    }
}

async function saveMatchToDb(match) {
    return new Promise((resolve, reject) => {
        const duration = match.duration || 0;
        const winner = match.radiant_win ? 'Radiant' : 'Dire';
        const startTime = match.start_time ? new Date(match.start_time * 1000).toISOString() : null;
        
        db.serialize(() => {
            // Update or insert into matches
            // We use tournament_id=3 for ESWC (need to create it first, but let's just stick to 999 or update later)
            // Let's create tournament entry for ESWC 2011 if not exists
            db.run(`INSERT OR IGNORE INTO tournaments (name, dates) VALUES ('ESWC 2011', 'Oct 21-25, 2011')`);
            
            db.get(`SELECT id FROM tournaments WHERE name = 'ESWC 2011'`, (err, row) => {
                const tournamentId = row ? row.id : 999;
                
                db.run(`INSERT OR REPLACE INTO matches (match_id, tournament_id, start_time, duration, winner, league_id, lobby_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [match.match_id, tournamentId, startTime, duration, winner, match.leagueid, match.lobby_type],
                    (err) => {
                        if (err) console.error(err);
                        
                        // Insert players
                        if (match.players) {
                            const stmt = db.prepare(`INSERT OR REPLACE INTO players (match_id, team, player_name, hero_id, kills, deaths, assists, hero_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                            for (const player of match.players) {
                                const team = player.player_slot < 128 ? 'Radiant' : 'Dire';
                                const playerName = player.personaname || player.name || 'Unknown';
                                // We can look up hero name later
                                stmt.run(match.match_id, team, playerName, player.hero_id, player.kills, player.deaths, player.assists, null);
                            }
                            stmt.finalize();
                        }
                        resolve();
                    }
                );
            });
        });
    });
}

function appendToMarkdown(match) {
    const date = new Date(match.start_time * 1000).toISOString();
    const duration = (match.duration / 60).toFixed(1) + 'm';
    const winner = match.radiant_win ? 'Radiant' : 'Dire';
    
    // Try to guess teams from players
    let radiantPlayer = match.players && match.players[0] ? (match.players[0].personaname || match.players[0].name || "Unknown") : "Unknown";
    let direPlayer = match.players && match.players[5] ? (match.players[5].personaname || match.players[5].name || "Unknown") : "Unknown";
    
    const teams = `${radiantPlayer}'s Team vs ${direPlayer}'s Team`;
    
    const line = `| [${match.match_id}](https://www.dotabuff.com/matches/${match.match_id}) | ${date} | ${teams} | ${winner} | ${duration} | League: ${match.leagueid}, Lobby: ${match.lobby_type} |\n`;
    fs.appendFileSync(outputPath, line);
}

async function smartScan() {
    console.log("Starting Smart Scan for ESWC 2011...");
    
    // Range confirmed around 91000-91200
    const startId = 91000;
    const endId = 91200;

    for (let matchId = startId; matchId <= endId; matchId++) {
        const match = await getMatchDetails(matchId);
        
        if (!match) continue;

        const isLeague65000 = match.leagueid === 65000;
        // Strict ESWC window: Oct 21-25
        const isESWCDate = match.start_time >= 1319155200 && match.start_time <= 1319587200;
        const isPracticeLobby = match.lobby_type === 1;

        if (isLeague65000 || (isESWCDate && isPracticeLobby)) {
            console.log(`[FOUND] Match ${matchId} (L:${match.leagueid}, T:${match.lobby_type})`);
            await saveMatchToDb(match);
            appendToMarkdown(match);
        } else {
            // console.log(`[SKIP] Match ${matchId}`);
        }

        // Conservative delay
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log("Scan complete.");
    db.close();
}

smartScan();
