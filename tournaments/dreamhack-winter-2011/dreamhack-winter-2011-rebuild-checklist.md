# DreamHack Winter 2011 - Rebuild Checklist

**Status:** Skeleton captured, recovery source unresolved ⚠️

## Confirmed baseline

- [x] Liquipedia page identified: `DreamHack/2011/Winter`
- [x] Tournament recognized in pre-2014 candidate inventory as likely ticketless
- [x] Exact 21-match skeleton captured from Liquipedia DatDota/Dotabuff links
- [x] Verified local DB presence: `0/21` exact IDs currently present in `matches`
- [x] Verified OpenDota status: all 21 exact IDs currently return `404`

## Next steps

- [ ] Split the 21 exact IDs into canonical stage structure
  - [ ] Group A Bo1 set
  - [ ] Group B Bo1 set
  - [ ] Semifinals
  - [ ] Third-place match
  - [ ] Grand final Bo3
- [ ] Record exact team-vs-team pairings for every ID from Liquipedia
- [ ] Check Dotabuff accessibility for all 21 IDs via browser/manual capture
- [ ] Check DatDota accessibility for all 21 IDs via browser/manual capture
- [ ] Determine whether any local historical dumps already contain these rows under another tournament mapping
- [ ] Create a local DB report script for DreamHack Winter 2011
- [ ] Decide recovery path
  - [ ] Browser/manual extraction
  - [ ] DatDota scrape/capture
  - [ ] Other archive source

## Current blocker

OpenDota does **not** currently provide these 21 DreamHack Winter 2011 matches by exact ID, so the ESWC-style OpenDota import flow is not available for this tournament at the moment.
