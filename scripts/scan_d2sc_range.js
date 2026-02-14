// Проверка существования матчей по диапазону Match ID
// D2SC матчи были в диапазоне 1.18M - 1.45M

const BATCH_SIZE = 5; // Проверяем небольшими батчами
const DELAY_MS = 800;

// Диапазоны для проверки (пробелы между известными матчами)
const RANGES = [
    { start: 1195000, end: 1370000, desc: 'Между группой и плейофф' },
    { start: 1185000, end: 1186000, desc: 'Перед первым известным' },
    { start: 1370000, end: 1374000, desc: 'Перед Na\'Vi матчами' }
];

async function checkMatch(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`, {
            method: 'GET'
        });
        
        if (res.status === 200) {
            const data = await res.json();
            // Проверяем дату — должна быть Dec 8-11, 2011
            if (data.start_time >= 1323292800 && data.start_time <= 1323648000) {
                return {
                    found: true,
                    match_id: matchId,
                    date: new Date(data.start_time * 1000).toISOString(),
                    lobby_type: data.lobby_type,
                    leagueid: data.leagueid,
                    duration: data.duration,
                    radiant_win: data.radiant_win
                };
            }
        }
        return { found: false };
    } catch (e) {
        return { found: false, error: true };
    }
}

async function scanRange(start, end, desc) {
    console.log(`\n🔍 ${desc}: ${start} - ${end}`);
    
    const found = [];
    const step = Math.floor((end - start) / 20); // Проверяем ~20 точек
    
    for (let id = start; id < end; id += step) {
        process.stdout.write(`  ${id}... `);
        const result = await checkMatch(id);
        
        if (result.found) {
            console.log(`✅ НАЙДЕН! ${result.date.split('T')[0]}`);
            found.push(result);
        } else {
            process.stdout.write('\r');
        }
        
        await new Promise(r => setTimeout(r, 200));
    }
    
    return found;
}

async function main() {
    console.log('🏆 Поиск D2SC матчей по диапазону Match ID\n');
    
    const allFound = [];
    
    for (const range of RANGES) {
        const found = await scanRange(range.start, range.end, range.desc);
        allFound.push(...found);
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`\n📊 Всего найдено: ${allFound.length}`);
    
    if (allFound.length > 0) {
        console.table(allFound);
        
        console.log('\n📋 Match ID для добавления:');
        allFound.forEach(m => console.log(m.match_id));
    }
}

main().catch(console.error);
