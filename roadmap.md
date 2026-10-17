# WaifuMatch roadmap

## Done
- [x] Card text legibility (stronger shade + ink shadow; all lines readable over light clothing)
- [x] Communities page (`/communities`) — watch parties, clubs, seasonal buddy, convention companion, bingo, 12 niche features
- [x] Top 10 picker (`/top10`) — Anime / Characters / Moves, live search over the full AniList catalog
- [x] Compatibility dials — filler tolerance, dub vs sub, rewatch ratio, mood ring
- [x] Tab bar on the main screen: Discover / Communities / Top 10

## Next
- [ ] Auth: email + Google, profiles, admin role
- [ ] 18+ gate, government ID + live selfie upload, manual admin approval (owner approves all)
- [ ] Onboarding: archetypes + Anime DNA (reuse the top-10 picker)
- [ ] Discover: daily soulmate pull + compatibility breakdown + Blind Date mode
- [ ] Matches, realtime chat, icebreakers
- [ ] Reporting + moderation queue
- [ ] Stripe premium, watch-party rooms (real), voice notes

## Notes
- Anime/character search runs through `/api/public/catalog-search` (AniList GraphQL). Jikan/MyAnimeList is not reachable from this environment.
- Picker choices save on-device (`wm-top10`) until accounts exist; then they move to the profile.
- Demo profiles are placeholders until real accounts exist.
