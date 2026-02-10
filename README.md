# 📜 Dota 2 Historical Stats Archive

A project dedicated to recovering, preserving, and archiving lost match data from the dawn of Dota 2 esports (2011-2012). Many early tournaments were played in "Practice" lobbies or had ticket data corrupted, making them inaccessible on modern stats sites like Dotabuff or Stratz without manual intervention.

## 🎯 Mission

To reconstruct the history of tournaments like **Dota 2 Star Championship**, **ESWC 2011**, **The Defense 1**, and others by manually verifying player match histories and cross-referencing with VODs.

## 📂 Archive Status

| Tournament | Year | Status | Matches Recovered | Notes |
|---|---|---|---|---|
| **[Dota 2 Star Championship](tournaments/d2sc/)** | 2011 | 🟢 **Recovered** | 16+ | **Playoffs Fully Restored** (Finals, Semis, 3rd Place) |
| **ESWC 2011** | 2011 | 🟢 **Recovered** | 300+ | Large dataset preserved in DB |
| **The Defense Season 1** | 2011 | 🔴 **Pending** | - | Next priority target |

See **[Lost Tournaments List](Lost_Tournaments_List.md)** for the full roadmap and recovery queue.

## 🛠 Recovery Methodology

We recover "lost" matches using a manual archaeological approach:
1.  **Targeting**: Identify dates and rosters from Liquipedia/VODs.
2.  **Deep Search**: Scan Dotabuff match history of key players (e.g., Dendi, Goblak, SingSing) filtering by **"Lobby Type: Practice"** and specific dates (e.g., Dec 2011).
3.  **Cross-Referencing**: Match hero compositions, durations, and KDA stats with VOD footage to verify the Match ID.
4.  **Archiving**: Store the confirmed Match ID and metadata in our local database.

## 💾 Data Structure

The project uses a **SQLite database** (`dota_archive.db`) as the primary storage.

### Key Tables

#### `tournaments`
- `id`: Unique internal ID
- `name`: Tournament name (e.g., "Dota 2 Star Championship")

#### `matches`
- `match_id`: Steam Match ID (Primary Key)
- `tournament_id`: Link to `tournaments`
- `start_time`: UTC Timestamp
- `duration`: Match duration
- `winner`: "Radiant" / "Dire" or Team Name
- `lobby_type`: Usually `1` (Practice) for 2011 era

## 🤖 Credits

Maintained by **Danila** with assistance from **OpenClaw AI**.
