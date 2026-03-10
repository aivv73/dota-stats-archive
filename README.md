# 📜 Dota 2 Historical Stats Archive

A project dedicated to recovering, preserving, and archiving lost match data from the dawn of Dota 2 esports (2011-2012). Many early tournaments were played in "Practice" lobbies or had ticket data corrupted, making them inaccessible on modern stats sites like Dotabuff or Stratz without manual intervention.

## 🎯 Mission

To reconstruct the history of tournaments like **Dota 2 Star Championship**, **ESWC 2011**, **The Defense 1**, and others by manually verifying player match histories and cross-referencing with VODs.

## 📂 Archive Status

| Tournament | Year | Status | Matches Recovered | Notes |
|---|---|---|---|---|
| **[Dota 2 Star Championship](tournaments/d2sc/)** | 2011 | 🟢 **Recovered** | 46 | Playoffs + all Liquipedia-listed group stage matches recovered. |
| **ESWC 2011** | 2011 | 🟢 **Recovered** | 300+ | Large dataset preserved in DB |
| **[The Defense Season 1](tournaments/the-defense-s1/)** | 2011 | 🟡 **In Progress** | Playoffs mapped + GS shortlist | DB-first playoff reconstruction is largely mapped, and Group Stage #1/#2 shortlist work is now documented in the tournament README. |

See **[Lost Tournaments List](Lost_Tournaments_List.md)** for the full roadmap and recovery queue.

## 🛠 Recovery Methodology

We recover "lost" matches using a manual archaeological approach:
1.  **Targeting**: Identify dates and rosters from Liquipedia/VODs.
2.  **Deep Search**: Scan Dotabuff match history of key players (e.g., Dendi, Goblak, SingSing) filtering by **"Lobby Type: Practice"** and specific dates (e.g., Dec 2011).
    - For very old matches, names are often inconsistent across sources; this repo keeps a **canonical (Liquipedia-style) player label** and tracks Dotabuff aliases in tournament notes.
3.  **Cross-Referencing**: Match hero compositions, durations, and KDA stats with VOD footage to verify the Match ID.
4.  **Archiving**: Store the confirmed Match ID and metadata in our local database.

## 💾 Data Structure

The project uses a **SQLite database** (`dota_archive.db`) as the primary storage.

## 🧱 Pipeline Stages

The first automated Liquipedia inventory stage now lives in
[`pipeline/liquipedia_pre2014_stage1/`](pipeline/liquipedia_pre2014_stage1/).
It builds a local SQLite + JSON inventory of Liquipedia Dota 2 tournament pages
with start years before 2014, using public MediaWiki API endpoints only and a
documented ticket-status heuristic.

That stage also now includes a derived candidate list for **pre-2014 tournaments
that appear ticketless by heuristic**, stored as JSON + CSV in
[`pipeline/liquipedia_pre2014_stage1/data/`](pipeline/liquipedia_pre2014_stage1/data/).
The label is intentionally conservative: it means "likely ticketless" from
Liquipedia `dotatv` absence plus date thresholding, not hard proof.

A follow-on player stage now lives in
[`pipeline/liquipedia_pre2014_ticketless_players/`](pipeline/liquipedia_pre2014_ticketless_players/).
It turns that scoped tournament set into a unique player inventory using
Liquipedia `TeamCard` roster fields plus Liquipedia player-page infobox data for
aliases and account/Steam IDs where available. Missing IDs stay explicit as
unresolved rather than guessed, and the stage now also supports a reproducible
`manual_player_overrides.json` layer for verified Dotabuff account IDs that are
not present directly in Liquipedia.

A first practice-history stage now lives in
[`pipeline/practice_match_history_stage3/`](pipeline/practice_match_history_stage3/).
It uses the cleaned stage-2 player inventory plus verified D2SC profile
mapping notes to build a local SQLite database of strict Dotabuff
`Practice + None` history rows. The refreshed reverse-scan collector is now the
main working path for extending 2011-2012 match recovery, and the committed DB
artifacts are actively used to drive the tournament-specific README and match
identification work.

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
