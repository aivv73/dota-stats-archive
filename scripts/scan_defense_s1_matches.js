// const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+ (using native)

const PLAYERS = {
    'XBOCT': 89625472,
    'Dendi': 70388657,
    'Puppey': 87278757
};

// The Defense Season 1 Dates
const START_TIME = 1321315200; // 2011-11-15
const END_TIME = 1328918400;   // 2012-02-11 (Upload date + 1 day buffer)

const NAVI_HEROES = [21, 1, 66, 29, 5]; // WR, AM, Chen, Tide, CM
const AL_HEROES = [55, 53, 25, 61, 60]; // DS, NP, Lina, Brood, NS

async function getMatches(accountId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/players/${accountId}/matches`);
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error(`Failed to fetch matches for ${accountId}:`, e);
        return [];
    }
}

async function checkMatchDetails(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!res.ok) return null;
        const match = await res.json();
        
        // Collect all hero IDs in the match
        const heroes = match.players.map(p => p.hero_id);
        
        // Check if ALL Na'Vi heroes are present in the match
        const naviPresent = NAVI_HEROES.every(h => heroes.includes(h));
        
        // Check if ALL AL heroes are present
        const alPresent = AL_HEROES.every(h => heroes.includes(h));
        
        if (naviPresent && alPresent) {
            return match;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function scan() {
    console.log(`Scanning matches from ${new Date(START_TIME*1000).toISOString()} to ${new Date(END_TIME*1000).toISOString()}...`);
    
    // We'll scan XBOCT first (AM player)
    const matches = await getMatches(PLAYERS['XBOCT']);
    const targetMatches = matches.filter(m => 
        m.start_time >= START_TIME && m.start_time <= END_TIME &&
        m.hero_id === 1 // AM
    );
    
    console.log(`Found ${targetMatches.length} matches for XBOCT on Anti-Mage in range.`);
    
    for (const m of targetMatches) {
        process.stdout.write(`Checking ${m.match_id}... `);
        const fullMatch = await checkMatchDetails(m.match_id);
        
        if (fullMatch) {
            console.log(`\n\n🎉 MATCH FOUND! 🎉`);
            console.log(`Match ID: ${fullMatch.match_id}`);
            console.log(`Date: ${new Date(fullMatch.start_time * 1000).toISOString()}`);
            console.log(`Lobby: ${fullMatch.lobby_type}, League: ${fullMatch.leagueid}`);
            console.log(`Winner: ${fullMatch.radiant_win ? 'Radiant' : 'Dire'}`);
            break; // Stop after first match found (Game 1)
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 800));
    }
    console.log("\nScan complete.");
}

scan();
