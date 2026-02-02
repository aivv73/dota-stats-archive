const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

// Target: Tournament 999 ("The Internal / Unknown") -> ESWC 2011 (Oct 2011)
// We will merge it with Tournament 1000 if it exists, or just rename.

db.serialize(() => {
    // 1. Rename Tournament 999 to "ESWC 2011 (Recovered)"
    // Check if ID 1000 exists first to avoid conflict if we want to merge
    
    db.run(`UPDATE tournaments SET name = 'ESWC 2011 (Recovered)', dates = 'Oct 21-25, 2011' WHERE id = 999`, (err) => {
        if (err) console.error("Update error:", err);
        else console.log("Renamed Tournament 999 to ESWC 2011 (Recovered).");
    });

    // 2. If we have matches in ID 1000 (the 4 manually added ones), let's move them to 999 and delete 1000
    db.run(`UPDATE matches SET tournament_id = 999 WHERE tournament_id = 1000`, function(err) {
        if (err) console.error("Merge error:", err);
        else if (this.changes > 0) {
            console.log(`Moved ${this.changes} matches from ID 1000 to 999.`);
            db.run(`DELETE FROM tournaments WHERE id = 1000`);
        }
    });
});

db.close();
