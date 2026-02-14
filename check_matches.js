async function checkMatch(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!res.ok) {
            console.log(`${matchId}: HTTP ${res.status} - ${res.statusText}`);
            return;
        }
        const m = await res.json();
        
        console.log(`\n=== Match ${matchId} ===`);
        console.log('📅 Дата:', new Date(m.start_time * 1000).toISOString());
        console.log('⏱️  Длительность:', `${Math.floor(m.duration/60)}:${(m.duration%60).toString().padStart(2,'0')}`);
        console.log('🎮 Lobby Type:', m.lobby_type, m.lobby_type === 1 ? '(Practice)' : '(Public)');
        console.log('🎯 Game Mode:', m.game_mode);
        console.log('🏆 League ID:', m.leagueid || 'none');
        console.log('👑 Победитель:', m.radiant_win ? 'Radiant' : 'Dire');
        console.log('\n👥 Игроки:');
        m.players?.forEach(p => {
            const team = p.player_slot < 128 ? '[RAD]' : '[DIRE]';
            console.log(`  ${team} ${p.personaname || 'Unknown'}`);
        });
    } catch (e) {
        console.log(`${matchId}: ❌ Ошибка - ${e.message}`);
    }
}

async function main() {
    console.log('🔍 Проверка матчей E Sahara vs The Retry\n');
    await checkMatch(1357441);
    await new Promise(r => setTimeout(r, 500));
    await checkMatch(1362194);
}

main();
