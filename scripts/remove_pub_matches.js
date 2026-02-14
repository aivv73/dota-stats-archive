const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Матчи которые НЕ являются турнирными (пабы)
const PUB_MATCHES = [
    1185300, 1185400, 1185500, 1185600, 1230000,
    1247500, 1282500, 1291250, 1300000, 1343750,
    1364296, 1370600, 1370800, 1371200, 1371600,
    1372400, 1373000, 1373200, 1373600
];

console.log('🗑️ Удаление паб-матчей из D2SC\n');

let deleted = 0;

db.serialize(() => {
    for (const matchId of PUB_MATCHES) {
        db.run(
            `DELETE FROM matches WHERE match_id = ? AND tournament_id = 1`,
            [matchId],
            function(err) {
                if (err) {
                    console.error(`❌ Ошибка ${matchId}:`, err.message);
                } else if (this.changes > 0) {
                    deleted++;
                    console.log(`🗑️ Удалён: ${matchId}`);
                } else {
                    console.log(`⏭️ Не найден: ${matchId}`);
                }
            }
        );
    }
    
    setTimeout(() => {
        console.log(`\n═══════════════════════════════════`);
        console.log(`🗑️ Удалено: ${deleted} паб-матчей`);
        db.close();
    }, 1000);
});
