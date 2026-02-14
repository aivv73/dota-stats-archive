const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Матчи E Sahara vs The Retry (Dota 2 Star Championship)
const MATCHES = [
    {
        match_id: 1357441,
        date: '2011-12-10',
        duration: '38:23',
        winner: 'The Retry (Dire)',
        radiant: 'E Sahara',
        dire: 'The Retry'
    },
    {
        match_id: 1362194,
        date: '2011-12-10',
        duration: '28:55',
        winner: 'The Retry (Radiant)',
        radiant: 'The Retry',
        dire: 'E Sahara'
    }
];

console.log('📥 Добавление матчей E Sahara vs The Retry\n');

let inserted = 0;

db.serialize(() => {
    for (const match of MATCHES) {
        db.run(
            `INSERT OR IGNORE INTO matches (match_id, tournament_id, start_time, duration, winner, lobby_type) VALUES (?, 1, ?, ?, ?, 1)`,
            [match.match_id, match.date, match.duration, match.winner],
            function(err) {
                if (err) {
                    console.error(`❌ Ошибка ${match.match_id}:`, err.message);
                } else if (this.changes > 0) {
                    inserted++;
                    console.log(`✅ Добавлен: ${match.match_id} (${match.date}, ${match.duration})`);
                    console.log(`   ${match.radiant} vs ${match.dire}`);
                    console.log(`   Победитель: ${match.winner}\n`);
                } else {
                    console.log(`⏭️  Уже есть: ${match.match_id}\n`);
                }
            }
        );
    }
    
    setTimeout(() => {
        console.log(`═══════════════════════════════════`);
        console.log(`📊 Добавлено: ${inserted} матчей`);
        db.close();
    }, 500);
});
