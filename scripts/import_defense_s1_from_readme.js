const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Match IDs extracted from tournaments/the-defense-s1/README.md
const MATCHES = {
    'Natus Vincere': [
        { match_id: 364935, stage: 'Group B', opponent: 'Natural 9', date: 'Nov 20, 16:47' },
        { match_id: 1915064, stage: 'Group B', opponent: 'Natural 9', date: 'Dec 20, 14:10' },
        { match_id: 2321241, stage: 'Group B', opponent: 'MUFC', date: 'Dec 27, 10:58' },
        { match_id: 2338165, stage: 'Group B', opponent: 'LowLandLions', date: 'Dec 27, 17:00' },
        { match_id: 2405938, stage: 'Group B', opponent: 'youBoat', date: 'Dec 28, 21:52' },
        { match_id: 3042899, stage: 'Tiebreaker', opponent: 'Natural 9', date: 'Jan 10, 13:40' },
        { match_id: 3515769, stage: 'Group 2', opponent: 'mousesports', date: 'Jan 18, 01:01' },
        { match_id: 3802383, stage: 'Group 2', opponent: 'Evil Geniuses', date: 'Jan 22, 01:06' },
        { match_id: 3965049, stage: 'Group 2', opponent: 'Problem???', date: 'Jan 24, 16:22' },
        { match_id: 4357203, stage: 'Group 2', opponent: 'Fnatic', date: 'Jan 29, 19:20' },
        { match_id: 4682046, stage: 'Group 2', opponent: 'Team Dignitas', date: 'Feb 3, 14:49' },
        { match_id: 5505097, stage: 'Playoff R1', opponent: 'Absolute Legends', date: 'Feb 16, 14:04' },
        { match_id: 5508700, stage: 'Playoff R1', opponent: 'Absolute Legends', date: 'Feb 16, 14:46' },
        { match_id: 6296735, stage: 'Upper Final', opponent: 'Evil Geniuses', date: 'Feb 26, 14:16' },
        { match_id: 6805000, stage: 'Grand Final', opponent: 'Quantic Gaming', date: 'Mar 4, 13:33' },
        { match_id: 6808924, stage: 'Grand Final', opponent: 'Quantic Gaming', date: 'Mar 4, 14:32' }
    ],
    'Evil Geniuses': [
        { match_id: 2053063, stage: 'Group D', opponent: 'Storm Games Clan', date: 'Dec 22, 18:35' },
        { match_id: 2060993, stage: 'Group D', opponent: 'mousesports', date: 'Dec 22, 20:26' },
        { match_id: 2386678, stage: 'Group D', opponent: 'Team Infused', date: 'Dec 28, 14:26' },
        { match_id: 2794677, stage: 'Group D', opponent: 'MiTH.Trust', date: 'Jan 4, 18:36' },
        { match_id: 2805835, stage: 'Group D', opponent: 'Panzer', date: 'Jan 5, 21:59' },
        { match_id: 3493933, stage: 'Group 2', opponent: 'Fnatic', date: 'Jan 17, 16:39' },
        { match_id: 3905031, stage: 'Group 2', opponent: 'mousesports', date: 'Jan 23, 15:25' },
        { match_id: 4623966, stage: 'Group 2', opponent: 'Problem???', date: 'Feb 3, 18:47' },
        { match_id: 5544990, stage: 'Playoff', opponent: 'Quantic', date: 'Feb 17, 00:59' }
    ],
    'mTw': [
        { match_id: 1844556, stage: 'Group A', opponent: 'SK Gaming', date: 'Dec 18, 23:20' },
        { match_id: 2839236, stage: 'Group A', opponent: 'Problem???', date: 'Jan 6, 15:19' },
        { match_id: 3722036, stage: 'Group 2', opponent: 'Just 4 the Tourn.', date: 'Jan 21, 01:18' },
        { match_id: 4567052, stage: 'Group 2', opponent: 'Quantic', date: 'Feb 1, 22:31' },
        { match_id: 4569485, stage: 'Group 2', opponent: 'Western Wolves', date: 'Feb 1, 23:09' },
        { match_id: 4636298, stage: 'Group 2', opponent: 'Absolute Legends', date: 'Feb 2, 22:11' }
    ]
};

async function importDefenseS1() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Ensure tournament exists
            db.run(`INSERT OR IGNORE INTO tournaments (id, name, dates) VALUES (?, ?, ?)`,
                [2, 'The Defense Season 1', 'Nov 2011 - Mar 2012'],
                function(err) {
                    if (err) return reject(err);
                    console.log('Tournament record ready');
                    
                    let inserted = 0;
                    let skipped = 0;
                    
                    // Process all matches
                    for (const [team, matches] of Object.entries(MATCHES)) {
                        for (const match of matches) {
                            db.run(
                                `INSERT OR IGNORE INTO matches (match_id, tournament_id, start_time) VALUES (?, ?, ?)`,
                                [match.match_id, 2, match.date],
                                function(err) {
                                    if (err) {
                                        console.error(`Error inserting ${match.match_id}:`, err);
                                    } else if (this.changes > 0) {
                                        inserted++;
                                        console.log(`✓ Inserted: ${match.match_id} (${team} vs ${match.opponent})`);
                                    } else {
                                        skipped++;
                                    }
                                }
                            );
                        }
                    }
                    
                    setTimeout(() => {
                        console.log(`\n=== Import Complete ===`);
                        console.log(`Inserted: ${inserted}`);
                        console.log(`Skipped (duplicates): ${skipped}`);
                        resolve();
                    }, 500);
                }
            );
        });
    });
}

importDefenseS1()
    .then(() => db.close())
    .catch(err => {
        console.error('Import failed:', err);
        db.close();
    });
