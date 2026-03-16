# Malaysia Invitational - Recovery Report

**Status**: Skeleton captured ⚠️ (double-elimination bracket reconstructed from Liquipedia; stage 3 candidate matching started)
**Dates**: Dec 17-18, 2011
**Location**: Kuala Lumpur, Malaysia
**Prize Pool**: $10,000 USD
**Organizer**: e-Club Malaysia
**GitHub repo**: <https://github.com/aivv73/dota-stats-archive>

---

**Sources**:
- Liquipedia: <https://liquipedia.net/dota2/Malaysia_Invitational>
- Fandom: <https://dota2.fandom.com/wiki/Malaysia_Invitational>
- Structured Liquipedia stage-1 inventory: `pipeline/liquipedia_pre2014_stage1/data/liquipedia_pre2014_stage1.json`
- Ticketless candidate row: `pipeline/liquipedia_pre2014_stage1/data/pre2014_ticketless_candidates.csv`
- Player/teamcard context: `pipeline/liquipedia_pre2014_ticketless_players/data/pre2014_ticketless_players.csv`
- Stage 3 DB: `pipeline/practice_match_history_stage3/data/practice_match_history_stage3.db`

---

## 🏆 Tournament Overview

Liquipedia describes **Malaysia Invitational** as:

- **Eight invited teams**
- **Double-elimination bracket**
- **All matches until the grand final are Bo1**
- **Grand final is Bo5**

### Participants
- **Orange Esports**
- **MiTH.Trust**
- **Mineski**
- **MUFC**
- **AEONSports**
- **Meet Your Makers**
- **Neolution E-Sport**
- **RedSpade**

---

## 🎯 Canonical Liquipedia Bracket Skeleton

### Upper Bracket Quarterfinals
| Stage | Matchup | Result |
|---|---|---|
| UBQF1 | Mineski vs MUFC | **Mineski 1-0 MUFC** |
| UBQF2 | Orange Esports vs Neolution E-Sport | **Orange Esports 1-0 Neolution E-Sport** |
| UBQF3 | MiTH.Trust vs Meet Your Makers | **MiTH.Trust 1-0 Meet Your Makers** |
| UBQF4 | AEONSports vs RedSpade | **AEONSports 1-0 RedSpade** |

### Upper Bracket Semifinals
| Stage | Matchup | Result |
|---|---|---|
| UBSF1 | Mineski vs Orange Esports | **Orange Esports 1-0 Mineski** |
| UBSF2 | MiTH.Trust vs AEONSports | **MiTH.Trust 1-0 AEONSports** |

### Upper Bracket Final
| Stage | Matchup | Result |
|---|---|---|
| UBF | Orange Esports vs MiTH.Trust | **Orange Esports 1-0 MiTH.Trust** |

### Lower Bracket Round 1
| Stage | Matchup | Result |
|---|---|---|
| LBR1-1 | MUFC vs Neolution E-Sport | **MUFC 1-0 Neolution E-Sport** |
| LBR1-2 | Meet Your Makers vs RedSpade | **Meet Your Makers 1-0 RedSpade** |

### Lower Bracket Quarterfinals
| Stage | Matchup | Result |
|---|---|---|
| LBQF1 | MUFC vs AEONSports | **MUFC 1-0 AEONSports** |
| LBQF2 | Mineski vs Meet Your Makers | **Mineski 1-0 Meet Your Makers** |

### Lower Bracket Semifinal
| Stage | Matchup | Result |
|---|---|---|
| LBSF | MUFC vs Mineski | **Mineski 1-0 MUFC** |

### Lower Bracket Final
| Stage | Matchup | Result |
|---|---|---|
| LBF | MiTH.Trust vs Mineski | **MiTH.Trust 1-0 Mineski** |

### Grand Final
| Stage | Matchup | Result |
|---|---|---|
| GF | Orange Esports vs MiTH.Trust | **Orange Esports 3-2 MiTH.Trust** |

---

## 🔎 Stage 3 Candidate Matching (initial pass)

The following stage-3 practice-history clusters were found using tournament-linked player accounts inside the date window **2011-12-16 → 2011-12-19 UTC**.

### Strong candidate clusters

| Expected stage | Expected pairing | Candidate match IDs | Evidence | Confidence |
|---|---|---|---|---|
| UBQF3 | MiTH.Trust vs Meet Your Makers | `1736007`, `1737074` | MiTH core accounts + MYM accounts overlap on 2011-12-17 | medium-high |
| UBF / GF pool | Orange Esports vs MiTH.Trust | `1795395`, `1801097`, `1804505`, `1806023`, `1807227`, `1807855`, `1810240`, `1813146` | repeated Orange-vs-MiTH overlap on 2011-12-18, consistent with UBF + Bo5 GF cluster | high (cluster-level), low (exact map assignment) |
| LBQF1 | MUFC vs AEONSports | `1748690` | MUFC core overlap + AEON presence on 2011-12-17 | medium |
| UBSF2 | MiTH.Trust vs AEONSports | `1742214` | MiTH overlap + AEON presence on 2011-12-17 | low-medium |

### Ambiguous / suspicious cluster

| Candidate match ID | Observed overlap | Notes |
|---|---|---|
| `1793513` | MiTH.Trust + MUFC | does not fit the final Liquipedia bracket cleanly; may be scrim/noise or needs identity review |

---

## 🧠 Coverage Notes

The early stage-3 signal is strongest for these teams:
- **Orange Esports**
- **MiTH.Trust**
- **MUFC**
- **Meet Your Makers**
- **AEONSports**

The signal is currently weaker for:
- **Mineski**
- **Neolution E-Sport**
- **RedSpade**

Most likely reason: incomplete verified account coverage for some rosters, so exact team-vs-team overlap is harder to recover directly from stage 3.

---

## 📌 Current conclusion

Malaysia Invitational already has a **clean Liquipedia bracket skeleton**, so the main task is no longer bracket discovery.

The practical next step is to turn stage-3 overlap clusters into a **stage-by-stage candidate table** and then manually validate the strongest matches first:

1. **Orange Esports vs MiTH.Trust**
2. **MiTH.Trust vs Meet Your Makers**
3. **MUFC vs AEONSports**

This tournament looks like a good candidate for reconstruction through **player-history overlap + manual match validation**, rather than pure exact-ID scraping.
