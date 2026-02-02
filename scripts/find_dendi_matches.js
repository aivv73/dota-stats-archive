const DENDI_ID = 70388657;
// February 2012 timestamp range
const START_TIME = 1328054400; // Feb 1 2012
const END_TIME = 1330473600;   // Feb 29 2012

// We will fetch matches for Dendi from OpenDota (since Dotabuff prevents scraping usually, but OpenDota has full history)
// https://api.opendota.com/api/players/{account_id}/matches?limit=...&date=... is not perfectly supported for date range
// But we can just fetch ALL matches and filter locally, or limit to 1000 and hope 2012 is in there.
// Actually, OpenDota /matches endpoint returns ALL matches by default (lightweight objects).

async function findMatch() {
    console.log("Fetching Dendi's match history...");
    try {
        const response = await fetch(`https://api.opendota.com/api/players/${DENDI_ID}/matches`);
        if (!response.ok) throw new Error(response.statusText);
        const matches = await response.json();
        
        console.log(`Fetched ${matches.length} matches.`);
        
        const targetMatches = matches.filter(m => 
            m.start_time >= START_TIME && m.start_time <= END_TIME
        );

        console.log(`Found ${targetMatches.length} matches in Feb 2012.`);
        
        // Output details to help us identify Na'Vi vs AL
        // We look for Lobby 1 (Practice) or Lobby 0 (if pub stomp/fake tournament lobby)
        // We can't see opponent names here easily without fetching details for each.
        
        // Let's list them all with dates and hero IDs
        // Dendi played Pudge, Invoker, Windrunner a lot then.
        
        targetMatches.forEach(m => {
            const date = new Date(m.start_time * 1000).toISOString().split('T')[0];
            console.log(`Match ${m.match_id}: Date=${date}, Hero=${m.hero_id}, KDA=${m.kills}/${m.deaths}/${m.assists}, Lobby=${m.lobby_type}, Duration=${m.duration}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

findMatch();
