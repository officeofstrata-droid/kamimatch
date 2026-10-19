# KamiMatch completion roadmap

## Didit-only and own-photo release
- [x] Remove manual identity review and use only signed Didit approval for eligibility; legacy writes disabled and private records retained for owners
- [x] Replace preset portrait selection with members' own photo-to-anime uploads; signed-in gallery and Didit-only screens checked, 30 tests passed
- [x] Check changed flows and request publication to kamimatch.co.uk; no additional real payment test requested

## Live-use pass (18 Oct 2026)
- [x] Removed sample swipe deck from the logged-out home page; replaced with a real landing page (how it works, features, safety)
- [x] Removed sample character fallback images from discovery; members without a portrait see a neutral placeholder
- [x] Confirmed no seeded database rows; 30 tests passed, build OK, security scans clean, published to kamimatch.co.uk
- [x] Marketing research and plan saved to Project Files (marketing/research.md, marketing/plan.md)

## Phone installation and publishing
- [x] Add home-screen installation manifest, local icons and phone head settings; no offline cache or native store distribution
- [x] Set the web address before publishing — kamimatch.co.uk bought at one.com (99p), DNS A records and TXT verification confirmed at both root and www
- [x] Publish requested with the Lovable address renamed to kamimatch — deployment scheduled; domain finishing its secure-certificate setup

## Current completion pass
- [x] Finish implementable app preparation; owner-only activation and eligible-user checks remain below
- [x] Enable Stripe test payments, create Premium subscription and wire checkout; fake-card purchase confirmed through the UI
- [x] Confirm purchase rules; implement live paid activation, cancellation at period end and renewal restoration; test cancellation persisted after reload
- [x] Finish moderation report queue and stable daily soulmate selection; authorized successful flows require eligible accounts
- [x] Audit and repair account, discovery, community and media safeguards; blocked discovery, private rosters, UTC quotas and failed-conversion allowance repaired
- [x] Run 27 rule/routing tests and signed-in/public browser checks; five phone pages fit with no alerts or page errors; unsigned payment webhook rejected
- [x] Stripe live setup and provider readiness passed; an actual live purchase remains unverified
- [ ] Verify automated identity and paired dating/rooms end to end — blocked: real Didit-approved participants; no approval bypasses

## New sign-in and verification request
- [x] Replace Veriff with Didit sessions, signed decision handling and adult ID/selfie checks; free allowance confirmed
- [x] Apple sign-in enabled; sign-in button respects adult consent
- [x] Discord support checked — unavailable as a managed sign-in provider; no fake button
- [x] Activate Didit — API key, workflow ID and webhook signing secret saved; webhook URL set in Didit; live endpoint verified (rejects unsigned calls with 401 after republish)
- [ ] Complete one real identity check end to end — blocked: an owner-run Didit session on a real account

## Stage 1 — Real accounts and safety
- [x] Google and Lovable sign-in configured, session-aware navigation and sign-out implemented
- [x] Adult profile onboarding and account-saved Anime DNA implemented
- [x] Government ID and live selfie collection moved exclusively to Didit
- [x] Retired manual identity queue; eligibility enforced through Didit-only database helper
- [x] Signed-in profile/gallery, pending identity gate, persisted bingo and empty inbox checked with requesting user's account
- [ ] Successful verified matching, messages and room creation — blocked: two real Didit-approved participants; never bypass verification for testing
- [x] Trusted identity reviewer requirement retired by owner; Didit-only verification requested

## New media and plans
- [x] Anime-style conversion functions, consent-based uploads, private originals and gallery management implemented; actual conversion remains unverified
- [x] Premium-only video uploads with server-side access checks implemented; paid video flow remains unverified
- [x] Generous free plan and premium extras; live payments configured, owner explicitly waived another real £7.99 test

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
- Didit-only screen and own-photo gallery checked signed-in; old review bookmarks redirect to verification; 30 tests passed, no page errors or mobile overflow.
- Stripe test purchase and cancellation read back through the UI; test and live records are isolated, and test subscriptions never grant live feature/storage entitlements. External billing portal opened but rendered blank in the sandbox browser; in-app cancellation and renewal restoration were verified instead.
- Real Didit approval remains unverified until the owner finishes a real identity check. Actual photo remix remains unverified without an owner-provided photo and consent; no generated sample was added to their account.
- Safety-report moderation remains separate and requires an explicitly authorized moderator; removing identity reviewers does not remove human safety-report handling.
- Fresh backend scan flagged the retired identity upload policy; inspected expression is literally false (no uploads allowed), while both active upload rules enforce owner folders. No policy was weakened or finding ignored.
- Sample profiles and community counts are not real people or live rooms.
