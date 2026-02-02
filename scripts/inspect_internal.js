const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    console.log("--- Matches in Tournament 999 (The Internal) ---");
    db.all(`
        SELECT match_id, start_time, duration, winner, league_id, lobby_type 
        FROM matches 
        WHERE tournament_id = 999 
        LIMIT 20
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
    
    // Count total
    db.get("SELECT COUNT(*) as count FROM matches WHERE tournament_id = 999", (err, row) => {
        console.log("Total matches:", row.count);
    });
});

db.close();
