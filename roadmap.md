# KamiMatch completion roadmap

## Phone installation and publishing
- [x] Add home-screen installation manifest, local icons and phone head settings; no offline cache or native store distribution
- [ ] Set the web address before publishing — owner will change it first; no custom domain connected yet, still on the default lovable.app address
- [ ] Publish — phone screen, manifest and icons checked; build OK and basic security checks passed; publishing approval declined

## Current completion pass
- [x] Finish implementable app preparation; owner-only activation and eligible-user checks remain below
- [x] Enable Stripe test payments, create Premium subscription and wire checkout; fake-card purchase confirmed through the UI
- [x] Confirm purchase rules; implement live paid activation, cancellation at period end and renewal restoration; test cancellation persisted after reload
- [x] Finish moderation report queue and stable daily soulmate selection; authorized successful flows require eligible accounts
- [x] Audit and repair account, discovery, community and media safeguards; blocked discovery, private rosters, UTC quotas and failed-conversion allowance repaired
- [x] Run 27 rule/routing tests and signed-in/public browser checks; five phone pages fit with no alerts or page errors; unsigned payment webhook rejected
- [x] Stripe live setup and provider readiness passed; an actual live purchase remains unverified
- [ ] Verify automated identity, paired dating, rooms, media and authorized moderation end to end — blocked: Didit credentials, approved participants and a named trusted reviewer; no approval bypasses

## New sign-in and verification request
- [x] Replace Veriff with Didit sessions, signed decision handling and adult ID/selfie checks; free allowance confirmed
- [x] Apple sign-in enabled; sign-in button respects adult consent
- [x] Discord support checked — unavailable as a managed sign-in provider; no fake button
- [ ] Activate and test Didit — API key and workflow ID saved; blocked on webhook signing secret, published destination and an actual identity check

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
- [x] Generous free plan and premium extras; test checkout is open, live payments remain owner-dependent

## Stage 2 — Dating
- [x] Real approved-profile discovery, compatibility breakdown and blind-date display implemented
- [x] Mutual-match, realtime message, icebreaker and voice-note flows implemented; successful pair flow awaiting approved participants
- [x] Blocking/reporting server functions implemented
- [x] Moderation report queue surface and daily soulmate pull implemented; authorized success checks await eligible accounts

## Stage 3 — Communities and premium
- [x] Persistent clubs, watch-party rooms, seasonal and convention buddies implemented; joining/hosting awaits approved users
- [x] Premium embedded checkout, customer binding, signed subscription updates, cancellation and renewal management; test purchase and cancellation verified

## Existing
- [x] Sakura swipe UI, anime catalogue search, communities preview and Top 10 picker

## Safety and release blockers
- Didit setup screen verified signed-in on desktop and phone; existing pending ID untouched; unconfigured webhook returns 503; 27 rule/routing tests passed and latest build OK.
- Stripe test purchase and cancellation read back through the UI; test and live records are isolated, and test subscriptions never grant live feature/storage entitlements. External billing portal opened but rendered blank in the sandbox browser; in-app cancellation and renewal restoration were verified instead.
- Hosted Didit session, real signed provider approval, media conversion and provider login completion remain unverified until credentials and suitable accounts exist.
- No account becomes a reviewer automatically; the owner must name the trusted reviewer account.
- Manual verification is not automated identity/liveness certification; a verification service is needed for automated checks.
- Sample profiles and community counts are not real people or live rooms.
