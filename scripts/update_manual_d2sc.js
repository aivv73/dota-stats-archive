const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Manual data from Dotabuff
// Match 1186004: FOS - retry -> VeRsuta TR vs FS
// Match 1194490: FOX - navi -> Na`Vi vs Fos Style
// Match 1199424: FOS - 3d -> VeRsuta Fos Style -vs- 3D

const MATCHES = [
    {
        match_id: 1186004,
        tournament_id: 1,
        start_time: '2011-12-08T00:00:00Z', // Approx date based on tournament
        duration: '0', // Need lookup if critical
        winner: 'Unknown',
        lobby_type: 1, // Practice/Lobby
        league_id: 0,   // Likely 0 or internal
        notes: 'FOS - retry -> VeRsuta TR vs FS'
    },
    {
        match_id: 1194490,
        tournament_id: 1,
        start_time: '2011-12-08T00:00:00Z',
        duration: '0',
        winner: 'Unknown',
        lobby_type: 1,
        league_id: 0,
        notes: 'FOX - navi -> Na`Vi vs Fos Style'
    },
    {
        match_id: 1199424,
        tournament_id: 1,
        start_time: '2011-12-08T00:00:00Z',
        duration: '0',
        winner: 'Unknown',
        lobby_type: 1,
        league_id: 0,
        notes: 'FOS - 3d -> VeRsuta Fos Style -vs- 3D'
    }
];

db.serialize(() => {
    const stmt = db.prepare(`
        UPDATE matches 
        SET start_time = ?, duration = ?, winner = ?, lobby_type = ?, league_id = ?
        WHERE match_id = ?
    `);

    for (const m of MATCHES) {
        stmt.run(m.start_time, m.duration, m.winner, m.lobby_type, m.league_id, m.match_id);
        console.log(`Updated manual data for match ${m.match_id}`);
    }
    stmt.finalize();
});

db.close();
