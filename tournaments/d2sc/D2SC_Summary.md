# D2SC Match Recovery - Summary

## ✅ Успешно восстановлено: 8 матчей Team Shakira

| Match ID | Date | Teams | Winner |
|----------|------|-------|--------|
| 1186729 | Dec 8, 11:44 | Shakira Mix vs ? | Dire |
| 1188242 | Dec 8, 12:06 | Shakira Mix vs ? | Dire |
| 1289398 | Dec 9, 17:11 | ? vs Team Shakira | Shakira (Dire) |
| 1362471 | Dec 10, 15:49 | Team Shakira vs ? | Shakira (Radiant) |
| 1364296 | Dec 10, 16:19 | Team Shakira vs ? | Shakira (Radiant) |
| 1424838 | Dec 11, 12:34 | ? vs Team Shakira | Shakira (Dire) |
| 1436898 | Dec 11, 16:03 | ? vs Team Shakira | Shakira (Dire) |
| 1439203 | Dec 11, 16:29 | Team Shakira vs ? | Shakira (Radiant) |

**Источник**: История матчей rek0ne (47743) и BanZ (8969983)

---

## 🔍 Grand Final: Na'Vi vs The Retry (Dec 11)

### Информация из VOD

**Game 1** (https://www.youtube.com/watch?v=AVGKqabIg1I)
- Duration: 58:48
- Radiant (The Retry): Anti-Mage, Crystal Maiden, Mirana, Puck, Tidehunter
- Dire (Na'Vi): Pudge (Dendi), Weaver (XBOCT), Ancient Apparition, +2
- Match ID: **НЕ НАЙДЕН**

**Game 2** (https://www.youtube.com/watch?v=ZeFGW7UbagI)
- Match ID: **НЕ НАЙДЕН**

**Game 3** (https://www.youtube.com/watch?v=SfLNm9HVlks)
- Match ID: **НЕ НАЙДЕН**

### Проблемы с поиском

1. **OpenDota API** не хранит историю матчей для большинства игроков 2011 года
2. **Аккаунты не привязаны** — Steam ID игроков того времени не связаны с их профилями
3. **STRATZ** блокирует API запросы
4. **Dotabuff** не имеет API для поиска по критериям

### Возможные решения

1. **Ручной поиск по match ID** — сканировать диапазон 1458000-1465000 (Dec 11, 21:00-23:00 UTC) по точному драфту героев
2. **Replay файлы** — найти оригинальные .dem файлы турнира (если существуют)
3. **Связаться с организаторами** — StarLadder могут иметь записи match ID
4. **Liquipedia редакторы** — могут иметь данные в архивах

---

## 📺 Найденные VOD

| Match | URL | Status |
|-------|-----|--------|
| GF Game 1 | AVGKqabIg1I | ✅ Есть |
| GF Game 2 | ZeFGW7UbagI | ✅ Есть |
| GF Game 3 | SfLNm9HVlks | ✅ Есть |
| Na'Vi vs Mouz G2 | Zubvblkyk-U | ✅ Есть |
| Na'Vi vs Shakira G2 | KetfllyoKQk | ✅ Есть |
| TR vs Shakira | nawIP_HhmUg | ✅ Есть |
| eSahara vs GZ | s9BQzVm2e6A | ✅ Есть |
| Na'Vi vs eSahara | CHuBWwTEWDo | ✅ Есть |

---

## 📁 Файлы в проекте

- `Dota2_Star_Championship_Matches.md` — 8 восстановленных матчей Shakira
- `Dota2_Star_Championship_Wiki.md` — данные из Liquipedia
- `D2SC_VODs.md` — список найденных видео
- `d2sc_matches.json` — сырые данные сканирования
- `d2sc_matches_detailed.json` — детали 30 матчей
- Скрипты: `scan_d2sc.js`, `fetch_d2sc_details.js`, `find_grand_final.js`

---

## Следующие шаги

1. [ ] Просканировать match ID 1458000-1465000 плотно (каждый матч)
2. [ ] Извлечь драфты из остальных VOD (GF G2, G3, Semifinals)
3. [ ] Поискать матчи M5 и Mousesports
4. [ ] Найти match ID через старые форумы/новости
