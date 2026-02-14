const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Найденные матчи
const NEW_MATCHES = [
    { id: 1185300, date: '2011-12-08 10:35:00' },
    { id: 1185400, date: '2011-12-08 10:42:00' },
    { id: 1185500, date: '2011-12-08 10:59:00' },
    { id: 1185600, date: '2011-12-08 10:50:00' },
    { id: 1230000, date: '2011-12-08 19:11:00' },
    { id: 1247500, date: '2011-12-09 11:29:00' },
    { id: 1282500, date: '2011-12-09 15:40:00' },
    { id: 1291250, date: '2011-12-09 17:33:00' },
    { id: 1300000, date: '2011-12-09 19:20:00' },
    { id: 1343750, date: '2011-12-10 11:11:00' },
    { id: 1370600, date: '2011-12-10 17:23:00' },
    { id: 1370800, date: '2011-12-10 17:34:00' },
    { id: 1371200, date: '2011-12-10 17:46:00' },
    { id: 1371600, date: '2011-12-10 17:47:00' },
    { id: 1372400, date: '2011-12-10 18:03:00' },
    { id: 1373000, date: '2011-12-10 18:04:00' },
    { id: 1373200, date: '2011-12-10 18:39:00' },
    { id: 1373600, date: '2011-12-10 18:07:00' },
    // Матч от Dendi из истории
    { id: 1364296, date: '2011-12-10' }
];

console.log('📥 Добавление новых матчей Dota 2 Star Championship\n');

let inserted = 0;
let skipped = 0;

db.serialize(() => {
    for (const match of NEW_MATCHES) {
        db.run(
            `INSERT OR IGNORE INTO matches (match_id, tournament_id, start_time) VALUES (?, 1, ?)`,
            [match.id, match.date],
            function(err) {
                if (err) {
                    console.error(`❌ Ошибка ${match.id}:`, err.message);
                } else if (this.changes > 0) {
                    inserted++;
                    console.log(`✅ Добавлен: ${match.id} (${match.date})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Уже есть: ${match.id}`);
                }
            }
        );
    }
    
    setTimeout(() => {
        console.log(`\n═══════════════════════════════════`);
        console.log(`📊 Итог: добавлено ${inserted}, пропущено ${skipped}`);
        console.log(`📊 Всего матчей D2SC теперь: ${15 + inserted}`);
        db.close();
    }, 1000);
});
