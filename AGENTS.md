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
- Keep account mutations and validation in `src/lib/account.functions.ts` and `account-rules.ts`; RLS and server validation independently enforce ownership, adult age and review privileges.
- Keep birth dates and identity documents separate from discoverable profiles; private storage uses owner-folder policies and short-lived reviewer URLs.
- Never bootstrap administrator privileges from signup order or user metadata; assign a trusted reviewer explicitly and prohibit self-review.
- SessionProvider owns the sole auth state listener; sign-out cancels and clears cached account data before navigating to `/auth`.
