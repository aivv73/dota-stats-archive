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

### 1. Dota 2 Star Championship
- **Date**: Dec 8-11, 2011
- **Status**: 🟢 **Recovered**.
- **Notes**: Full Playoffs (Grand Final, Semifinals, 3rd Place) + Quarterfinals recovered via Goblak/Dendi/NS history. 16+ matches found.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Dota2_Star_Championship)

### 2. The Defense Season 1
- **Date**: Nov 2011 - Mar 2012
- **Status**: 🔴 **Reset**.
- **Notes**: Previous auto-import found only public matches. Need to restart using VODs + Player History.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/The_Defense/Season_1)

### 3. Electronic Sports World Cup 2011 (ESWC)
- **Date**: Oct 21-25, 2011
- **Location**: Paris, France
- **Status**: 🟢 **Recoverable**. Match IDs found in Liquipedia wikicode (e.g. `91112`).
- **Ticket**: Uses "The Internal" (65000) or test tickets.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Electronic_Sports_World_Cup_2011)

### 4. DreamHack Winter 2011
- **Date**: Nov 24-27, 2011
- **Location**: Jönköping, Sweden
- **Status**: 🟢 **Recoverable**. Match IDs found (e.g. `569246`). VODs exist.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/DreamHack_Winter_2011)

### 5. BenQ The Clash
- **Date**: 2011/2012
- **Status**: **Unexplored**.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/BenQ_The_Clash)

### 6. Infused Cup
- **Date**: Jan 2012
- **Status**: **Unexplored**.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Infused_Cup)

### 7. Prodota 2 League Season 1
- **Date**: Apr 2012 (Start)
- **Status**: **Unexplored**.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/Prodota_2_League/Season_1)

### 8. GosuLeague Season 1
- **Date**: 2012
- **Status**: **Unexplored**.
- **Liquipedia**: [Link](https://liquipedia.net/dota2/GosuLeague/Season_1)
