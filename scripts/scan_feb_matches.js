const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Matches from Dendi's history in Feb 2012 (fetched earlier)
const DENDI_MATCHES = [
    6453776, 6450485, 6438503, 6400045, 6397554, 6376848, 6373929, 6371858, 6369886, 6367223, 
    6366092, 6363946, 6298772, 6296735, 6217817, 6214893, 6211079, 6084299, 6082138, 6076793, 
    6072275, 6069842, 6066145, 5940201, 5938066, 5935942, 5933658, 5930672, 5928352, 5926655, 
    5877413, 5873879, 5870723, 5867166, 5864713, 5861102, 5857794, 5826523, 5822354, 5819098, 
    5816344, 5812202, 5795082, 5792846, 5789037, 5786259, 5735083, 5730256, 5726877, 5665608, 
    5661910, 5659269, 5656362, 5652564, 5649854, 5642615, 5624206, 5620276, 5615467, 5546255, 
    5543618, 5518533, 5514831, 5511656, 5508700, 5505097, 5502675, 5465707, 5463756, 5354102, 
    5352382, 5350750, 5347175, 5345074, 5343748, 5341507, 5339265, 5334443, 5330709, 5283969, 
    5281231, 5257879, 5244998, 5184108, 5170922, 5122496, 5119515, 5102738, 5100540, 5097472, 
    5094485, 5091976, 5090258, 5088975, 5058214, 5055618, 5052755, 5041379, 5037312, 4953255, 
    4951293, 4950008, 4908388, 4905522, 4903486, 4901322, 4898588, 4896710, 4895080, 4842700, 
    4838757, 4836040, 4833878, 4831010, 4828515, 4794538, 4792308, 4789291, 4786731, 4782031, 
    4778312, 4775609, 4771523, 4767689, 4763797, 4760555, 4757917, 4682046, 4636298, 4623966, 
    4621570, 4522713, 4520336, 4518540, 4512144
];

const TARGET_HEROES = [
    21, // WR
    1,  // AM
    66, // Chen
    29, // Tide
    5,  // CM
    55, // DS
    53, // NP
    25, // Lina
    61, // Brood
    60  // NS
];

async function checkMatches() {
    console.log(`Checking ${DENDI_MATCHES.length} matches for hero overlap...`);
    
    for (const matchId of DENDI_MATCHES) {
        try {
            const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
            if(!res.ok) continue;
            const match = await res.json();
            
            const heroes = match.players.map(p => p.hero_id);
            const intersection = heroes.filter(h => TARGET_HEROES.includes(h));
            
            // If match has high overlap (e.g. 8+ heroes from our list)
            if (intersection.length >= 8) {
                console.log(`\n🔥🔥🔥 MATCH FOUND: ${matchId} 🔥🔥🔥`);
                console.log(`Heroes: ${heroes}`);
                console.log(`Date: ${new Date(match.start_time * 1000).toISOString()}`);
                console.log(`Lobby: ${match.lobby_type}`);
                break;
            } else if (intersection.length >= 6) {
                 console.log(`\nPotential: ${matchId} (${intersection.length} matches)`);
            }
            
            process.stdout.write(".");
            await new Promise(r => setTimeout(r, 200)); // Be nice to API
            
        } catch(e) {}
    }
}

checkMatches();
