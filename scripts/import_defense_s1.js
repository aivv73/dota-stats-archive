const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

const filePath = path.resolve(__dirname, '../tournaments/the-defense-s1/The_Defense_Season_1_ULTIMATE_REPORT.md');

async function importData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT OR IGNORE INTO tournaments (name, dates) VALUES (?, ?)`, 
                ['The Defense Season 1', 'Nov 2011 - Mar 2012'], 
                function(err) {
                    if (err) return reject(err);
                    
                    db.get("SELECT id FROM tournaments WHERE name = ?", ['The Defense Season 1'], (err, row) => {
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

    let currentSectionTeam = null;

    for await (const line of rl) {
        // Detect section header: ### 🇺🇦 Natus Vincere (Champions)
        const sectionMatch = line.match(/^### .* (.*?) \(/) || line.match(/^### .* (.*)/);
        if (sectionMatch) {
            // "Natus Vincere" or "Evil Geniuses"
            // The regex might be tricky.
            // "### 🇺🇦 Natus Vincere (Champions)" -> "Natus Vincere"
            // "### 🇺🇸 Evil Geniuses (3rd Place)" -> "Evil Geniuses"
            // "### 🇫🇷 Team Shakira / Western Wolves (Top 6)" -> "Team Shakira / Western Wolves"
            let team = line.replace(/^### /, '').trim();
            // Remove emoji if present
            team = team.replace(/[\u{1F1E6}-\u{1F1FF}]{2} /u, ''); 
            // Remove parenthesis part
            team = team.replace(/\s*\(.*\)/, '').trim();
            currentSectionTeam = team;
            continue;
        }

        if (line.includes('| Stage | Opponent | Date | Match ID |')) continue;
        if (line.includes('|---|---|---|---|')) continue;

        if (line.startsWith('|')) {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 5) continue;
            
            // parts[1] Stage
            // parts[2] Opponent
            // parts[3] Date
            // parts[4] Match ID

            const opponent = parts[2];
            const dateStr = parts[3];
            const matchIdStr = parts[4];

            if (!matchIdStr || matchIdStr === '-') continue;

            // Handle multiple IDs: "5505097, 5508700"
            const matchIds = matchIdStr.split(',').map(s => s.trim().replace('?', ''));

            for (const mid of matchIds) {
                if (!mid) continue;
                const matchId = parseInt(mid);
                if (isNaN(matchId)) continue;

                await insertMatch(matchId, tournamentId, dateStr);
                
                // We could insert players/teams if we had a table for teams.
                // But we only have players table.
                // Maybe update match description or something?
                // We don't have a column for "Team 1" / "Team 2".
                // We'll skip that for now.
            }
        }
    }
}

function insertMatch(matchId, tournamentId, dateStr) {
    return new Promise((resolve, reject) => {
        // We only have date, not full time. 
        // We use INSERT OR IGNORE to avoid duplicates from different sections
        db.run(`INSERT OR IGNORE INTO matches (match_id, tournament_id, start_time) VALUES (?, ?, ?)`,
            [matchId, tournamentId, dateStr],
            function(err) {
                if (err) console.error("Error inserting match " + matchId, err);
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
