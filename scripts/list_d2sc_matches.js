const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

console.log("=== Dota 2 Star Championship - Текущие матчи ===\n");

db.all(`
    SELECT match_id, start_time, duration, winner, lobby_type, league_id
    FROM matches
    WHERE tournament_id = 1
    ORDER BY match_id ASC
`, (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    
    console.log(`Всего матчей: ${rows.length}\n`);
    console.table(rows);
    
    // Анализируем диапазон Match ID
    if (rows.length > 0) {
        const ids = rows.map(r => r.match_id);
        const minId = Math.min(...ids);
        const maxId = Math.max(...ids);
        console.log(`\n📊 Диапазон Match ID: ${minId} - ${maxId}`);
        console.log(`📅 Даты: ${rows[0].start_time} → ${rows[rows.length-1].start_time}`);
    }
});

setTimeout(() => db.close(), 500);
