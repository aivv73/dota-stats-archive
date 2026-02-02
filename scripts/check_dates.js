const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    db.get(`
        SELECT MIN(start_time) as min_date, MAX(start_time) as max_date 
        FROM matches 
        WHERE tournament_id = 999
    `, (err, row) => {
        if (err) console.error(err);
        else console.log("T999 Date Range:", row);
    });

    // Check for TI1 dates (Aug 2011)
    db.all(`
        SELECT match_id, start_time 
        FROM matches 
        WHERE tournament_id = 999 AND start_time LIKE '2011-08%'
    `, (err, rows) => {
        if (err) console.error(err);
        else console.log("TI1 Matches in T999:", rows.length);
        if (rows.length > 0) console.table(rows);
    });
});

db.close();
