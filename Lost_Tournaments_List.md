# Lost Dota 2 Tournaments Archive

## 🕵️‍♂️ Recovery Strategy ("The Giraffe Method")

Since API data is often missing or corrupted for early tournaments (2011-2012), we use a manual reconstruction approach:

1.  **List Target Tournaments**: Identify tournaments played without tickets or on "The Internal" ticket (Source: Liquipedia).
2.  **Find VODs**: Search YouTube/archives for video recordings to identify:
    *   Specific players in the lobby.
    *   Drafts (Heroes).
    *   Dates/Times.
    *   Scoreboards (K/D/A, Networth - if visible).
3.  **Cross-Reference**: Use player match history on Dotabuff (filtering by Hero + Approx Date) to find the specific **Match ID**.
    *   *Look for "Lobby Type: Practice" matches.*
4.  **Extract & Fill**:
    *   Steal basic stats from Dotabuff.
    *   Manually fill gaps (tower status, specific timings) from VODs if possible ("from bald head" / approximate if needed).

---

## 🏆 Priority List

### Confirmed / Active Recovery Targets

#### 1. Dota 2 Star Championship
- **Date**: Dec 8-11, 2011
- **Status**: 🟢 **Recovered**.
- **Notes**: Full Playoffs (Grand Final, Semifinals, 3rd Place) + Quarterfinals recovered via Goblak/Dendi/NS history. 16+ matches found.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Dota2_Star_Championship)

#### 2. The Defense Season 1
- **Date**: Nov 2011 - Mar 2012
- **Status**: 🔴 **Reset**.
- **Notes**: Previous auto-import found only public matches. Need to restart using VODs + Player History.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/The_Defense/Season_1)

#### 3. Electronic Sports World Cup 2011 (ESWC)
- **Date**: Oct 21-25, 2011
- **Location**: Paris, France
- **Status**: 🟢 **Recoverable**. Match IDs found in Liquipedia wikicode (e.g. `91112`).
- **Ticket**: Uses "The Internal" (65000) or test tickets.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Electronic_Sports_World_Cup_2011)

#### 4. DreamHack Winter 2011
- **Date**: Nov 24-27, 2011
- **Location**: Jönköping, Sweden
- **Status**: 🟢 **Recoverable**. Match IDs found (e.g. `569246`). VODs exist.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/DreamHack_Winter_2011)

## 🤖 Stage-1 Automated Candidate List (Pre-2014, Likely Ticketless)

This section is generated from the first automated tournament inventory stage in
[`pipeline/liquipedia_pre2014_stage1/`](pipeline/liquipedia_pre2014_stage1/).

Important:
- **Liquipedia is canonical**.
- **Dota 2 Fandom is secondary** and used only for cross-checking / backfill.
- `likely_ticketless` is a **heuristic label**, not a hard proof.
- Current heuristic means:
  - no `dotatv` field on Liquipedia, and
  - tournament start date is earlier than the earliest explicitly ticketed tournament currently found in the dataset (`2012-04-13`).

### Candidate tournaments currently flagged `likely_ticketless`

| Tournament | Date | Type | Fandom cross-check | Notes |
|---|---|---|---|---|
| The International 2011 | 2011-08-17 → 2011-08-21 | Offline | matched | Very high-value archive target |
| Electronic Sports World Cup 2011 | 2011-10-23 → 2011-10-25 | Offline | matched | Already known target |
| WCG Asian Championship 2011 | 2011-11-09 → 2011-11-13 | Offline | unmatched | Needs manual validation |
| The Defense Season 1 | 2011-11-15 → 2012-03-04 | Online | matched | Already active recovery target |
| DreamHack Winter 2011 | 2011-11-24 → 2011-11-26 | Offline | unmatched | Already known target |
| Dota2 Star Championship | 2011-12-08 → 2011-12-11 | Offline | matched | Already recovered |
| Malaysia Invitational | 2011-12-17 → 2011-12-18 | Offline | matched | Good early-circuit candidate |
| BenQ Dota 2 Clash #2 | 2011-12-20 → 2011-12-21 | Online | unmatched | Title/series family worth expanding |
| The Premier League Season 1 | 2012-01-04 → 2012-03-11 | Online | matched | Major early online circuit |
| D2E Challenge | 2012-01-17 → 2012-02-02 | Online | matched | Candidate for player-history search |
| Infused Cup | 2012-01-28 → 2012-01-29 | Online | unmatched | Previously unexplored |
| JeeDota2 Championship #1 | 2012-02-04 → 2012-03-28 | Online | unmatched | Long online event |
| Dota2Replays Brawl | 2012-02-11 → 2012-03-11 | Online | matched | Likely useful for roster graph expansion |
| It's Gosu Monthly Madness Season 1 | 2012-02-27 → 2012-03-29 | Online | matched | Strong candidate series |
| RaidCall Dota 2 Cup | 2012-03-05 → 2012-03-07 | Online | unmatched | Needs title normalization follow-up |
| Razer Dota 2 Tournament | 2012-03-08 → 2012-03-11 | Offline | matched | Good VOD-era event |
| Team Dignitas Invitational | 2012-03-10 → 2012-03-11 | Online | matched | Compact event, probably easier to recover |
| StarLadder StarSeries Season 1 | 2012-03-12 → 2012-04-29 | Online & Offline | unmatched | High-priority series candidate |
| joinDOTA Masters I | 2012-03-21 → 2012-03-22 | Online | matched | Small but useful for alias graph |
| joinDOTA Masters IV | 2012-03-28 → 2012-03-29 | Online | matched | Same series family as above |

### Data files

The current generated outputs live at:
- `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.json`
- `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.csv`

These should be treated as the **working candidate inventory** for future recovery passes, not as a final audited tournament truth set.
