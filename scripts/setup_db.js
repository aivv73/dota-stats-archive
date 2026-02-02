const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Tournaments table
    db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        dates TEXT
    )`);

    // Matches table
    db.run(`CREATE TABLE IF NOT EXISTS matches (
        match_id INTEGER PRIMARY KEY,
        tournament_id INTEGER,
        start_time TEXT,
        duration TEXT,
        winner TEXT,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    )`);

    // Players table
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        team TEXT,
        player_name TEXT,
        hero_name TEXT,
        hero_id INTEGER,
        kills INTEGER,
        deaths INTEGER,
        assists INTEGER,
        FOREIGN KEY(match_id) REFERENCES matches(match_id)
    )`);
    
    console.log("Tables created successfully.");
});

db.close();
