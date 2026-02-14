// Поиск матчей Dota 2 Star Championship через историю игроков
// Турнир: Dec 8-11, 2011

const PLAYERS = {
    // Na'Vi
    'Dendi': 70388657,
    'XBOCT': 89625472,
    'Puppey': 87278757,
    'LighTofHeaveN': 89423756,
    'ARS-ART': 104618963,
    
    // Moscow Five
    'NS': 124993119,
    'Dread': 38122817,
    'PGG': 47795989,
    'Godhunt': 48794512,
    'MeTTpuM': 47321833,
    
    // The Retry
    'Goblak': 73415883,
    'Mag': 41272215,
    'ALWAYSWANNAFLY': 178366364,
    'Unstop': 45864971,
    'Jackal': 100083680,
    
    // SK Gaming
    'TidesofTime': 111571327,
    'Pajkatt': 57810666,
    'KyKy': 47796657,
    'ReiGN': 217924084,
    'SuperHard': 177135101
};

// D2SC даты: 8-11 декабря 2011
const START_TIME = 1323292800; // Dec 8, 2011 00:00 UTC
const END_TIME = 1323648000;   // Dec 12, 2011 00:00 UTC (буфер)

async function getMatches(accountId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/players/${accountId}/matches?significant=0`);
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error(`❌ Ошибка для ${accountId}:`, e.message);
        return [];
    }
}

async function getMatchDetails(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toISOString().split('T')[0];
}

async function scanPlayer(name, accountId) {
    console.log(`\n🔍 Сканирую ${name} (${accountId})...`);
    const matches = await getMatches(accountId);
    
    // Фильтруем по датам и lobby_type = 1 (Practice)
    const filtered = matches.filter(m => {
        return m.start_time >= START_TIME && 
               m.start_time <= END_TIME &&
               m.lobby_type === 1; // Practice lobby
    });
    
    console.log(`   Найдено Practice матчей: ${filtered.length}`);
    
    return filtered.map(m => ({
        match_id: m.match_id,
        player: name,
        hero_id: m.hero_id,
        date: formatDate(m.start_time),
        start_time: m.start_time,
        lobby_type: m.lobby_type
    }));
}

async function main() {
    console.log('🏆 Поиск матчей Dota 2 Star Championship (Dec 8-11, 2011)\n');
    console.log('═══════════════════════════════════════════════════════');
    
    const allMatches = new Map();
    
    // Сканируем ключевых игроков
    const keyPlayers = ['Dendi', 'XBOCT', 'NS', 'Dread', 'Goblak', 'Mag'];
    
    for (const name of keyPlayers) {
        const matches = await scanPlayer(name, PLAYERS[name]);
        
        for (const m of matches) {
            if (!allMatches.has(m.match_id)) {
                allMatches.set(m.match_id, m);
            }
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`\n📊 Уникальных матчей найдено: ${allMatches.size}\n`);
    
    // Сортируем по Match ID
    const sorted = Array.from(allMatches.values()).sort((a, b) => a.match_id - b.match_id);
    
    console.table(sorted);
    
    // Проверяем, каких нет в базе
    console.log('\n📋 Match ID для добавления:');
    sorted.forEach(m => {
        console.log(m.match_id);
    });
}

main().catch(console.error);
