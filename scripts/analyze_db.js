const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    console.log("--- Matches by Lobby Type ---");
    db.all(`
        SELECT lobby_type, COUNT(*) as count 
        FROM matches 
        GROUP BY lobby_type
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log("\n--- Matches by League ID (Top 20) ---");
    db.all(`
        SELECT league_id, COUNT(*) as count 
        FROM matches 
        GROUP BY league_id 
        ORDER BY count DESC 
        LIMIT 20
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
    
    // Check some sample rows to see if we can identify "The Internal" or pub matches
    console.log("\n--- Matches by Tournament ID and Lobby Type ---");
    db.all(`
        SELECT tournament_id, lobby_type, league_id, COUNT(*) as count 
        FROM matches 
        GROUP BY tournament_id, lobby_type, league_id
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});

// Close later to ensure queries run
setTimeout(() => db.close(), 1000);
