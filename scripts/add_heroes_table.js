const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Heroes table
    db.run(`CREATE TABLE IF NOT EXISTS heroes (
        id INTEGER PRIMARY KEY,
        name TEXT,
        localized_name TEXT,
        primary_attr TEXT,
        attack_type TEXT,
        roles TEXT
    )`);
    
    console.log("Heroes table created.");
});

db.close();
