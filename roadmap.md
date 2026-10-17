# WaifuMatch completion roadmap

## New sign-in and verification request
- [ ] Replace Veriff with Didit automated adult ID + live selfie checks; confirm current free allowance and connect owner credentials
- [ ] Apple sign-in
- [ ] Discord sign-in — check supported providers
- [ ] Persona or Veriff automated identity verification

## Stage 1 — Real accounts and safety
- [x] Google and Lovable sign-in configured, session-aware navigation and sign-out implemented
- [x] Adult profile onboarding and account-saved Anime DNA implemented
- [x] Private government ID upload and live camera selfie submission implemented
- [x] Restricted reviewer queue and meeting eligibility helper implemented (dating endpoints must enforce it in Stage 2)
- [ ] Authenticated end-to-end verification — blocked: no signed-up account exists; requesting user must sign in
- [ ] Enable trusted reviewer — blocked: owner must identify a reviewer account; no automatic admin assignment

## New media and plans
- [ ] Anime-style conversion of uploaded photos, private originals, gallery management
- [ ] Premium-only video uploads with server-side access checks
- [ ] Generous free plan and premium extras, paid checkout pending owner setup

## Stage 2 — Dating
- [ ] Real discovery, compatibility breakdown, daily pull and blind dates
- [ ] Mutual matches, realtime messages, icebreakers and voice notes
- [ ] Blocking, reporting and moderation

## Stage 3 — Communities and premium
- [ ] Persistent clubs, watch-party rooms, seasonal and convention buddies
- [ ] Premium checkout and subscription management (requires payment setup)

## Existing
- [x] Sakura swipe UI, anime catalogue search, communities preview and Top 10 picker

## Safety and release blockers
- Public browser checks passed: sign-in age checkbox, signed-out account redirect, guest favourites save/reload, phone-width layouts; eight tests passed and latest build OK.
- Signed-in profile saving, file submission, review decisions and provider login completion remain unverified until an account exists.
- Complete Stage 2 and Stage 3 after the signed-in Stage 1 checks; these are not shipped yet.
- No account becomes a reviewer automatically; the owner must name the trusted reviewer account.
- Manual verification is not automated identity/liveness certification; a verification service is needed for automated checks.
- Sample profiles and community counts are not real people or live rooms.
