const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

const TI1_MATCH_ID = 11787;

async function getMatchDetails(matchId) {
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Failed to fetch match ${matchId}:`, e);
        return null;
    }
}

async function checkMatch() {
    const match = await getMatchDetails(TI1_MATCH_ID);
    if (match) {
        console.log(`Match ${TI1_MATCH_ID}:`);
        console.log(`  League ID: ${match.leagueid}`);
        console.log(`  Start Time: ${new Date(match.start_time * 1000).toISOString()}`);
        console.log(`  Radiant: ${match.radiant_name}`);
        console.log(`  Dire: ${match.dire_name}`);
    } else {
        console.log("Match not found.");
    }
    
    // Check if it exists in our DB
    db.get("SELECT * FROM matches WHERE match_id = ?", [TI1_MATCH_ID], (err, row) => {
        if (err) console.error(err);
        else if (row) console.log("In DB:", row);
        else console.log("Not in DB.");
        db.close();
    });
}

checkMatch();
