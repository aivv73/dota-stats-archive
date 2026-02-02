const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    console.log("--- Matches with League ID 65000 ---");
    db.all(`
        SELECT match_id, start_time, duration, winner, lobby_type 
        FROM matches 
        WHERE league_id = 65000
    `, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});

db.close();
