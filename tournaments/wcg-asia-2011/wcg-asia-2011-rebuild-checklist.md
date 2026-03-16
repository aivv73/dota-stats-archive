# WCG Asian Championship 2011 - Rebuild Checklist

## Stage 0 - Setup
- [x] Create tournament folder
- [x] Capture Liquipedia overview / participants / playoff results
- [ ] Add machine-readable skeleton artifact

## Stage 1 - Skeleton
- [x] Enumerate all 12 group-stage matches
- [x] Enumerate all 8 playoff matches
- [x] Confirm expected total = 20 maps
- [x] Add initial machine-readable skeleton artifact
- [x] Capture full 12-team field from fandom API

## Stage 2 - Roster anchors
- [ ] Build roster/account map for EHOME
- [ ] Build roster/account map for MUFC
- [ ] Build roster/account map for Mineski
- [ ] Build roster/account map for AEON.sg
- [ ] Review weaker teams: Velocy / Neolution / Virtousity / SkyNet

## Stage 3 - Exact-ID recovery
- [ ] Search for direct Liquipedia / source match IDs
- [ ] Probe OpenDota-exact candidates around 2011-11-09..2011-11-13
- [ ] Check if playoff matches are easier to anchor first
- [ ] Determine whether group stage is realistically recoverable

## Stage 4 - Canonical import
- [ ] Create tournament row in local DB
- [ ] Import verified exact-ID matches
- [ ] Normalize winner/team labels
- [ ] Audit completeness against 20-map skeleton

## Notes
- Likely not a ticket/league-based recovery because Liquipedia infobox has empty `leagueid`
- Prefer starting from playoff anchors, then work backward into groups
