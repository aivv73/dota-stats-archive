const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    console.log("=== Турниры ===");
    db.all(`SELECT * FROM tournaments`, (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    setTimeout(() => {
        console.log("\n=== Матчи по турнирам ===");
        db.all(`
            SELECT t.name as tournament, COUNT(m.match_id) as matches
            FROM tournaments t
            LEFT JOIN matches m ON t.id = m.tournament_id
            GROUP BY t.id, t.name
        `, (err, rows) => {
            if (err) console.error(err);
            else console.table(rows);
        });
    }, 100);

    setTimeout(() => {
        console.log("\n=== Образец матчей ===");
        db.all(`
            SELECT match_id, tournament_id, start_time, duration, winner, lobby_type, league_id
            FROM matches
            ORDER BY match_id DESC
            LIMIT 10
        `, (err, rows) => {
            if (err) console.error(err);
            else console.table(rows);
        });
    }, 200);
});

setTimeout(() => db.close(), 500);
