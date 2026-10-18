<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use public routes for browsing and the integration-managed `_authenticated` layout for account screens; protected account loaders must call authenticated server functions.
- Keep account mutations and validation in `src/lib/account.functions.ts` and `account-rules.ts`; RLS and server validation independently enforce ownership and adult age.
- Keep birth dates and legacy identity documents private and separate from discoverable profiles; Didit owns new ID and live-selfie collection.
- Never bootstrap moderation privileges from signup order or user metadata; safety-report roles must be explicitly assigned and cannot approve identity.
- SessionProvider owns the sole auth state listener; sign-out cancels and clears cached account data before navigating to `/auth`.
- Keep dating, communities and media in dedicated authenticated server-function modules; database policies independently enforce verification, ownership and entitlements.
- Provider sessions bind an opaque local session ID to the provider session and workflow; only signed live full-payload decisions with passed document, liveness, face match and matching adult DOB may approve.
- Use the database is_verified result for eligibility; only the latest approved Didit session with matching adult DOB qualifies, never legacy manual submissions.
- Persist daily discovery selections in owner-readable database rows through a locked RPC, rechecking verification and blocks on every read so refreshes cannot reroll or expose an unsafe pick.
- Keep room input validation and local-time conversion in community-rules so optional scheduling behaves consistently at both input boundaries.
- Safety report review lives in an authenticated reviewer-only route and checks the trusted role again on mutation, independently of RLS.
- Keep Stripe access behind the shared gateway utility; authenticated payment functions bind customer and subscription metadata to the caller, and signed webhooks reconcile provider state through a service-only locked RPC.
- Store test and live subscriptions separately by environment; only live paid-through memberships project into the database entitlement used by feature and storage policies, so test purchases cannot grant production access.
- Use manifest-only home-screen installation with local PNG icons and root head links; do not add app-shell service workers because offline support was not requested.

- Keep legacy /review links as redirects to /verify; all new identity verification goes through Didit, so old bookmarks cannot expose retired manual-review tools.
- Use AI-converted profile_media as member portraits; omit the deprecated preset avatar field from profile input so uploads are the sole portrait source.
