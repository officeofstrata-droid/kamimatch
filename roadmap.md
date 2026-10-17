# WaifuMatch completion roadmap

## Current completion pass
- [ ] Enable Stripe test payments, create Premium subscription and wire checkout; live payments require owner account claim
- [ ] Finish moderation report queue and daily soulmate selection
- [ ] Audit and repair account, discovery, community and media flows
- [ ] Run rule tests and signed-in/public browser checks
- [ ] Report remaining launch blockers; defer Didit account connection until app preparation is complete

## New sign-in and verification request
- [x] Replace Veriff with Didit sessions, signed decision handling and adult ID/selfie checks; free allowance confirmed
- [x] Apple sign-in enabled; sign-in button respects adult consent
- [x] Discord support checked — unavailable as a managed sign-in provider; no fake button
- [ ] Activate and test Didit — blocked: owner API key, workflow ID, webhook destination secret and public deployment required

## Stage 1 — Real accounts and safety
- [x] Google and Lovable sign-in configured, session-aware navigation and sign-out implemented
- [x] Adult profile onboarding and account-saved Anime DNA implemented
- [x] Private government ID upload and live camera selfie submission implemented
- [x] Restricted reviewer queue and meeting eligibility helper implemented (dating endpoints must enforce it in Stage 2)
- [x] Signed-in profile/gallery, pending identity gate, persisted bingo and empty inbox checked with requesting user's account
- [ ] Successful verified matching, messages, room creation and media conversion — blocked: approved participants/provider setup and premium account required; never bypass review for testing
- [ ] Enable trusted reviewer — blocked: owner must identify a reviewer account; no automatic admin assignment

## New media and plans
- [x] Anime-style conversion functions, consent-based uploads, private originals and gallery management implemented; actual conversion remains unverified
- [x] Premium-only video uploads with server-side access checks implemented; paid video flow remains unverified
- [x] Generous free plan and premium extras, honest purchase-unavailable state

## Stage 2 — Dating
- [x] Real approved-profile discovery, compatibility breakdown and blind-date display implemented
- [x] Mutual-match, realtime message, icebreaker and voice-note flows implemented; successful pair flow awaiting approved participants
- [x] Blocking/reporting server functions implemented
- [ ] Moderation report queue surface and daily soulmate pull — remain to finish

## Stage 3 — Communities and premium
- [x] Persistent clubs, watch-party rooms, seasonal and convention buddies implemented; joining/hosting awaits approved users
- [ ] Premium checkout and subscription management (requires payment setup)

## Existing
- [x] Sakura swipe UI, anime catalogue search, communities preview and Top 10 picker

## Safety and release blockers
- Didit setup screen verified signed-in on desktop and phone; existing pending ID untouched; unconfigured webhook returns 503; 17 rule tests passed and latest build OK.
- Hosted Didit session, real signed provider approval, media conversion and provider login completion remain unverified until credentials and suitable accounts exist.
- No account becomes a reviewer automatically; the owner must name the trusted reviewer account.
- Manual verification is not automated identity/liveness certification; a verification service is needed for automated checks.
- Sample profiles and community counts are not real people or live rooms.
