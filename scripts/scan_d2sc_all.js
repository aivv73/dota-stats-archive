// Поиск ВСЕХ матчей за период D2SC
const PLAYERS = {
    'Dendi': 70388657,
    'XBOCT': 89625472,
    'Puppey': 87278757,
    'NS': 124993119,
    'Dread': 38122817,
    'Goblak': 73415883,
    'Mag': 41272215
};

// D2SC даты
const START_TIME = 1323292800; // Dec 8, 2011
const END_TIME = 1323648000;   // Dec 12, 2011

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

async function scanPlayer(name, accountId) {
    console.log(`\n🔍 ${name}...`);
    const matches = await getMatches(accountId);
    
    // Фильтруем только по датам
    const filtered = matches.filter(m => {
        return m.start_time >= START_TIME && m.start_time <= END_TIME;
    });
    
    console.log(`   Матчей за период: ${filtered.length}`);
    
    if (filtered.length > 0) {
        console.table(filtered.map(m => ({
            match_id: m.match_id,
            date: new Date(m.start_time * 1000).toISOString().split('T')[0],
            lobby: m.lobby_type,
            league: m.leagueid,
            hero: m.hero_id
        })));
    }
    
    return filtered.map(m => ({
        match_id: m.match_id,
        player: name,
        date: new Date(m.start_time * 1000).toISOString().split('T')[0],
        lobby_type: m.lobby_type,
        leagueid: m.leagueid
    }));
}

async function main() {
    console.log('🏆 Dota 2 Star Championship - Все матчи за Dec 8-11, 2011\n');
    
    const allMatches = new Map();
    
    for (const [name, id] of Object.entries(PLAYERS)) {
        const matches = await scanPlayer(name, id);
        
        for (const m of matches) {
            if (!allMatches.has(m.match_id)) {
                allMatches.set(m.match_id, m);
            }
        }
        
        await new Promise(r => setTimeout(r, 200));
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`\n📊 Всего уникальных матчей: ${allMatches.size}`);
    
    const sorted = Array.from(allMatches.values()).sort((a, b) => a.match_id - b.match_id);
    
    console.log('\n📋 Match ID (все найденные):');
    sorted.forEach(m => {
        const inDb = [1186004,1194490,1199424,1374029,1378735,1384367,1388217,1392301,
                      1429793,1432784,1440121,1444054,1446677,1450273,1454446].includes(m.match_id);
        const status = inDb ? '✅ есть' : '❌ новый';
        console.log(`  ${m.match_id} ${status} (lobby: ${m.lobby_type}, ${m.date})`);
    });
}

main().catch(console.error);
