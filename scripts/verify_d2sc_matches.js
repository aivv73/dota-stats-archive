// Проверка — турнирные ли матчи или пабы
const MATCHES = [
    1185300, 1185400, 1185500, 1185600, 1230000,
    1247500, 1282500, 1291250, 1300000, 1343750,
    1364296, 1370600, 1370800, 1371200, 1371600,
    1372400, 1373000, 1373200, 1373600
];

async function checkMatch(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('🔍 Проверка матчей D2SC — турнирные или пабы?\n');
    
    for (const id of MATCHES.slice(0, 10)) { // Проверим первые 10
        const m = await checkMatch(id);
        if (!m) {
            console.log(`${id}: ❌ нет данных`);
            continue;
        }
        
        // Проверяем признаки турнирного матча
        const hasLeague = m.leagueid !== undefined && m.leagueid !== 0;
        const isPractice = m.lobby_type === 1; // Practice lobby
        const isTournament = m.game_mode === 2; // Captain's Mode
        
        // Проверяем известных игроков
        const playerNames = m.players?.map(p => p.personaname || 'Unknown').filter(n => n !== 'Unknown');
        const hasProPlayers = playerNames?.some(name => 
            ['Dendi', 'XBOCT', 'Puppey', 'NS', 'Dread', 'Goblak', 'Mag', 'ARS-ART', 'LighTofHeaveN']
                .some(pro => name.toLowerCase().includes(pro.toLowerCase()))
        );
        
        const status = (hasLeague || isPractice || isTournament || hasProPlayers) ? '✅ ТУРНИР' : '⚠️ ВОЗМОЖНО ПАБ';
        
        console.log(`${id}: ${status}`);
        console.log(`   Lobby: ${m.lobby_type}, Game Mode: ${m.game_mode}, League: ${m.leagueid || 'none'}`);
        console.log(`   Игроки: ${playerNames?.slice(0, 5).join(', ') || 'нет данных'}...`);
        console.log();
        
        await new Promise(r => setTimeout(r, 300));
    }
}

main().catch(console.error);
