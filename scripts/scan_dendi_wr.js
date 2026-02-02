const PLAYER_ID = 70388657; // Dendi (WR = 21)
// Looking BACK from Feb 10
const END_TIME = 1328918400;   // Feb 11 2012
const START_TIME = 1325376000; // Jan 1 2012

async function findMatch() {
    console.log("Fetching Dendi's match history (Jan-Feb 2012)...");
    try {
        const response = await fetch(`https://api.opendota.com/api/players/${PLAYER_ID}/matches`);
        if (!response.ok) throw new Error(response.statusText);
        const matches = await response.json();
        
        const targetMatches = matches.filter(m => 
            m.start_time >= START_TIME && m.start_time <= END_TIME &&
            m.hero_id === 21 // Windrunner only
        );

        console.log(`Found ${targetMatches.length} Windrunner matches.`);
        
        for (const m of targetMatches) {
            const date = new Date(m.start_time * 1000).toISOString().split('T')[0];
            // Check details for teammates (AM=1, Chen=66, Tide=29, CM=5)
            // Need detailed fetch
            await checkDetails(m.match_id, date);
            await new Promise(r => setTimeout(r, 800));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function checkDetails(matchId, date) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if(!res.ok) return;
        const match = await res.json();
        
        // Find Dendi's team
        const dendi = match.players.find(p => p.account_id === PLAYER_ID);
        if (!dendi) return;
        
        const myTeamSlot = dendi.player_slot < 128 ? 'Radiant' : 'Dire';
        const myTeamHeroes = match.players
            .filter(p => (p.player_slot < 128 ? 'Radiant' : 'Dire') === myTeamSlot)
            .map(p => p.hero_id);
            
        // Na'Vi Heroes: WR(21), AM(1), Chen(66), Tide(29), CM(5)
        const targetHeroes = [21, 1, 66, 29, 5];
        
        const intersection = myTeamHeroes.filter(h => targetHeroes.includes(h));
        
        // If we have at least 4/5 match, it's highly likely
        if (intersection.length >= 4) {
            console.log(`\n>>> POTENTIAL MATCH FOUND: ${matchId} (${date}) <<<`);
            console.log(`Heroes: ${myTeamHeroes}`);
            console.log(`Opponent Heroes: ${match.players.filter(p => (p.player_slot < 128 ? 'Radiant' : 'Dire') !== myTeamSlot).map(p => p.hero_id)}`);
        } else {
            process.stdout.write("."); // Progress dot
        }
        
    } catch(e) {}
}

findMatch();
