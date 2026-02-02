const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../dota_archive.db');
const db = new sqlite3.Database(dbPath);

async function fetchHeroes() {
    try {
        console.log("Fetching heroes from OpenDota...");
        const response = await fetch('https://api.opendota.com/api/heroes');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const heroes = await response.json();
        console.log(`Fetched ${heroes.length} heroes.`);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            const stmt = db.prepare('INSERT OR REPLACE INTO heroes (id, name, localized_name, primary_attr, attack_type, roles) VALUES (?, ?, ?, ?, ?, ?)');
            
            for (const hero of heroes) {
                const roles = JSON.stringify(hero.roles);
                stmt.run(hero.id, hero.name, hero.localized_name, hero.primary_attr, hero.attack_type, roles);
            }
            
            stmt.finalize();
            db.run('COMMIT', () => {
                console.log("Heroes saved to database.");
                db.close();
            });
        });

    } catch (error) {
        console.error("Error fetching heroes:", error);
        db.close();
    }
}

fetchHeroes();
