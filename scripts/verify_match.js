const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dota_archive.db');
const db = new sqlite3.Database(dbPath);

const MATCH_ID = 5244998;

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

async function inspectMatch() {
    const match = await getMatchDetails(MATCH_ID);
    if (match) {
        console.log(`Match ${MATCH_ID} Details:`);
        console.log(`Duration: ${match.duration}`);
        console.log(`Winner: ${match.radiant_win ? 'Radiant' : 'Dire'}`);
        
        console.log("\nRadiant Team:");
        match.players.filter(p => p.player_slot < 128).forEach(p => {
            console.log(`- ${p.personaname} (Hero ID: ${p.hero_id})`);
        });

        console.log("\nDire Team:");
        match.players.filter(p => p.player_slot >= 128).forEach(p => {
            console.log(`- ${p.personaname} (Hero ID: ${p.hero_id})`);
        });
        
        // Check for specific heroes from VOD
        // Na'Vi (Green/Dire in VOD?): WR (21), AM (1), Chen (66), Tide (29), CM (5)
        // AL (Red/Radiant?): DS (55), NP (53), Lina (25), Brood (61), NS (60)
        
        const radiantHeroes = match.players.filter(p => p.player_slot < 128).map(p => p.hero_id);
        const direHeroes = match.players.filter(p => p.player_slot >= 128).map(p => p.hero_id);
        
        console.log("\nHero IDs Check:");
        console.log("Radiant IDs:", radiantHeroes.sort((a,b)=>a-b));
        console.log("Dire IDs:", direHeroes.sort((a,b)=>a-b));
        
    } else {
        console.log("Match not found.");
    }
    db.close();
}

inspectMatch();
