// Обогащение матчей D2SC данными из OpenDota API
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

const DELAY_MS = 600; // Rate limit

async function getMatchDetails(matchId) {
    try {
        const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function enrichMatches() {
    console.log('🔄 Обогащение данных Dota 2 Star Championship\n');
    
    // Получаем матчи без duration (новые)
    const matches = await new Promise((resolve, reject) => {
        db.all(
            `SELECT match_id FROM matches 
             WHERE tournament_id = 1 AND (duration IS NULL OR duration = '0')`,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
    
    console.log(`📊 Матчей для обогащения: ${matches.length}\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const { match_id } of matches) {
        process.stdout.write(`  ${match_id}... `);
        
        const data = await getMatchDetails(match_id);
        
        if (data && data.duration) {
            const duration = formatDuration(data.duration);
            const winner = data.radiant_win ? 'Radiant' : 'Dire';
            const lobbyType = data.lobby_type;
            const leagueId = data.leagueid;
            
            // Определяем команду-победителя по игрокам
            let winnerTeam = winner;
            if (data.players) {
                const radiantPlayers = data.players.filter(p => p.player_slot < 128);
                const direPlayers = data.players.filter(p => p.player_slot >= 128);
                // Здесь можно добавить логику определения команд
            }
            
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE matches SET duration = ?, lobby_type = ?, league_id = ? 
                     WHERE match_id = ?`,
                    [duration, lobbyType, leagueId, match_id],
                    function(err) {
                        if (err) {
                            console.log(`❌ ошибка БД`);
                            failed++;
                        } else {
                            console.log(`✅ ${duration}`);
                            updated++;
                        }
                        resolve();
                    }
                );
            });
        } else {
            console.log(`❌ нет данных`);
            failed++;
        }
        
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
    
    console.log(`\n═══════════════════════════════════`);
    console.log(`📊 Обновлено: ${updated}, Ошибок: ${failed}`);
    db.close();
}

enrichMatches().catch(console.error);
