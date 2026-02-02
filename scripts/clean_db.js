const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check count before
    db.get("SELECT COUNT(*) as count FROM matches", (err, row) => {
        console.log("Total matches before:", row.count);
    });

    db.get("SELECT COUNT(*) as count FROM matches WHERE lobby_type = 0", (err, row) => {
        console.log("Pub matches (lobby_type=0) to delete:", row.count);
    });

    // Delete
    db.run("DELETE FROM matches WHERE lobby_type = 0", function(err) {
        if (err) {
            console.error("Error deleting matches:", err);
            return;
        }
        console.log(`Deleted ${this.changes} matches.`);
        
        // Also cleanup players for deleted matches?
        // SQLite usually doesn't cascade unless configured. Let's check.
        // The schema had "FOREIGN KEY(match_id) REFERENCES matches(match_id)" but usually need PRAGMA foreign_keys = ON;
        // Easier to just delete orphaned players manually to be safe.
        
        db.run(`
            DELETE FROM players 
            WHERE match_id NOT IN (SELECT match_id FROM matches)
        `, function(err) {
            if (err) console.error(err);
            else console.log(`Deleted ${this.changes} orphaned player records.`);
        });
    });

    // Check count after
    db.get("SELECT COUNT(*) as count FROM matches", (err, row) => {
        console.log("Total matches after:", row.count);
    });
});

db.close();
