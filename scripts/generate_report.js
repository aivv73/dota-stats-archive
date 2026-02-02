const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Cleanup orphaned players
    console.log("Cleaning up orphaned players...");
    db.run(`
        DELETE FROM players 
        WHERE match_id NOT IN (SELECT match_id FROM matches)
    `, function(err) {
        if (err) console.error("Error cleaning players:", err);
        else console.log(`Deleted ${this.changes} orphaned player records.`);
    });

    // 2. Generate Report
    console.log("\n--- MATCH REPORT ---");
    db.all(`
        SELECT t.name as tournament_name, t.id as tournament_id, COUNT(m.match_id) as match_count, 
               m.lobby_type, m.league_id
        FROM matches m
        LEFT JOIN tournaments t ON m.tournament_id = t.id
        GROUP BY m.tournament_id, m.lobby_type, m.league_id
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});

db.close();
