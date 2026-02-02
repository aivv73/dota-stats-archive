const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

const filePath = path.resolve(__dirname, '../tournaments/d2sc/Dota2_Star_Championship_Matches.md');

async function importData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Insert Tournament
            db.run(`INSERT OR IGNORE INTO tournaments (name, dates) VALUES (?, ?)`, 
                ['Dota 2 Star Championship', 'Dec 8 - Dec 11, 2011'], 
                function(err) {
                    if (err) return reject(err);
                    
                    db.get("SELECT id FROM tournaments WHERE name = ?", ['Dota 2 Star Championship'], (err, row) => {
                        if (err) return reject(err);
                        const tournamentId = row.id;
                        processFile(tournamentId).then(resolve).catch(reject);
                    });
                }
            );
        });
    });
}

async function processFile(tournamentId) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentMatch = null;
    let currentTeam = null;
    let inTable = false;

    for await (const line of rl) {
        const matchHeader = line.match(/^### Match (\d+)/);
        if (matchHeader) {
            // Save previous match if exists (actually we insert on fly or batch? let's insert immediately)
            // But we need to insert match first to get FK, but match_id is explicitly from MD.
            // So we can insert match when we have all metadata?
            // The metadata follows the header immediately.
            // Let's reset currentMatch object
            currentMatch = {
                id: parseInt(matchHeader[1]),
                tournament_id: tournamentId,
                start_time: null,
                duration: null,
                winner: null,
                players: []
            };
            // Insert match placeholder - we'll update it or insert later. 
            // Better to collect metadata then insert.
            continue;
        }

        if (!currentMatch) continue;

        const timeMatch = line.match(/- \*\*Time\*\*: (.*)/);
        if (timeMatch) currentMatch.start_time = timeMatch[1].trim();

        const winnerMatch = line.match(/- \*\*Winner\*\*: (.*)/);
        if (winnerMatch) currentMatch.winner = winnerMatch[1].trim();

        const durationMatch = line.match(/- \*\*Duration\*\*: (.*)/);
        if (durationMatch) {
            currentMatch.duration = durationMatch[1].trim();
            // We have enough metadata to insert match?
            // Let's insert match here.
            await insertMatch(currentMatch);
        }

        // Table parsing
        if (line.includes('| Team | Player | Hero | KDA |')) {
            inTable = true;
            currentTeam = null;
            continue;
        }
        if (line.includes('|---|---|---|---|')) continue;

        if (inTable && line.startsWith('|')) {
            if (line.trim() === '') {
                inTable = false;
                continue;
            }

            // Parse row
            // | **Radiant** | UpK | Lifestealer (54) | 7/0/3 |
            // | | BanZ | Shadow Shaman (27) | 5/3/10 |
            
            const parts = line.split('|').map(s => s.trim());
            // parts[0] is empty (before first |)
            // parts[1] is Team
            // parts[2] is Player
            // parts[3] is Hero (ID)
            // parts[4] is KDA
            // parts[5] is empty (after last |)

            if (parts.length < 5) continue;

            let teamStr = parts[1];
            if (teamStr.includes('**')) {
                currentTeam = teamStr.replace(/\*\*/g, ''); // Radiant or Dire
            }
            
            // If teamStr is empty, use currentTeam.
            
            const playerName = parts[2];
            const heroStr = parts[3]; // "Lifestealer (54)"
            const kdaStr = parts[4]; // "7/0/3"

            // Parse Hero
            const heroMatch = heroStr.match(/(.*) \((\d+)\)/);
            let heroName = heroStr;
            let heroId = null;
            if (heroMatch) {
                heroName = heroMatch[1];
                heroId = parseInt(heroMatch[2]);
            }

            // Parse KDA
            const kdaParts = kdaStr.split('/');
            let k=0, d=0, a=0;
            if (kdaParts.length === 3) {
                k = parseInt(kdaParts[0]);
                d = parseInt(kdaParts[1]);
                a = parseInt(kdaParts[2]);
            }

            if (currentTeam && playerName) {
                 await insertPlayer({
                    match_id: currentMatch.id,
                    team: currentTeam,
                    player_name: playerName,
                    hero_name: heroName,
                    hero_id: heroId,
                    kills: k,
                    deaths: d,
                    assists: a
                });
            }
        } else if (inTable && line.trim() === '') {
             inTable = false;
        }
    }
}

function insertMatch(match) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO matches (match_id, tournament_id, start_time, duration, winner) VALUES (?, ?, ?, ?, ?)`,
            [match.id, match.tournament_id, match.start_time, match.duration, match.winner],
            function(err) {
                if (err) console.error("Error inserting match " + match.id, err);
                resolve();
            }
        );
    });
}

function insertPlayer(player) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO players (match_id, team, player_name, hero_name, hero_id, kills, deaths, assists) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [player.match_id, player.team, player.player_name, player.player_name === '*Anonymous*' ? 'Anonymous' : player.player_name, player.hero_id, player.kills, player.deaths, player.assists],
             // Wait, I mapped params wrong in the VALUES list vs args?
             // SQL: match_id, team, player_name, hero_name, hero_id, k, d, a
             // Args: match_id, team, name, hero_name (missing in args list above!), hero_id, k, d, a
             // Fixing:
             // [player.match_id, player.team, player.player_name, player.hero_name, player.hero_id, player.kills, player.deaths, player.assists]
            function(err) {
                if (err) console.error("Error inserting player", err);
                resolve();
            }
        );
    });
}

// Fix insertPlayer args
function insertPlayer(player) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO players (match_id, team, player_name, hero_name, hero_id, kills, deaths, assists) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [player.match_id, player.team, player.player_name, player.hero_name, player.hero_id, player.kills, player.deaths, player.assists],
            function(err) {
                if (err) console.error("Error inserting player", err);
                resolve();
            }
        );
    });
}

importData().then(() => {
    console.log("Import finished.");
    db.close();
}).catch(err => {
    console.error("Import failed:", err);
    db.close();
});
