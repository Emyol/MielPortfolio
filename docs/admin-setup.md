# Portfolio editor setup

The source works without Supabase: the public Surface keeps its original content and `/admin` shows setup instructions. Publishing requires the following one-time account setup. No paid plan or service-role key is needed.

## Connect Supabase

1. Create a Supabase Free project and keep its database password in your password manager.
2. Open SQL Editor and run `supabase/migrations/202610120001_portfolio.sql` once. It creates the owner allowlist, draft/publication records, atomic publishing functions, private uploads bucket, and row-level security policies.
3. In Authentication → Sign In / Providers, enable GitHub. Create a GitHub OAuth app with the callback URL shown by Supabase (it ends in `/auth/v1/callback`). Put that app's client ID and secret in Supabase only.
4. In Authentication → URL Configuration set Site URL to `https://project-miel.vercel.app`. Add exactly `https://project-miel.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` as redirect URLs. Avoid wildcard production redirects.
5. Copy `.env.example` to `.env.local`. Fill in the project URL and publishable key from Supabase project settings. Keep `SITE_URL=http://localhost:3000` locally. Add those same environment variables to Vercel with `SITE_URL=https://project-miel.vercel.app`. Never place a service-role key in these variables. Redeploy after adding environment variables.
6. Open `/admin` and sign in with your GitHub account once. You will initially see an access-denied message. In Supabase Authentication → Users, verify your GitHub identity and copy its user UUID. Provision exactly your account in SQL Editor:

```sql
insert into public.admin_users(user_id) values ('YOUR-VERIFIED-USER-UUID');
```

7. Reload `/admin`. Save the initial imported content, preview it, then publish. The initial content comes from the repository and retains current records and static asset paths. Further edits do not require deployment.

New GitHub users may authenticate, but cannot read drafts, write content, upload files or publish unless explicitly added to `admin_users`. Disable new signups in Supabase after provisioning the owner if desired. To revoke access, delete that UUID from `admin_users`.

## Editing and uploads

Save updates the draft with an optimistic revision check; a second tab cannot silently overwrite a newer save. Publish copies that saved revision and its asset allowlist together in one database transaction. Public reads never select drafts. Uploaded files receive immutable names; only files referenced by published content become anonymously readable. Draft files remain private, including when their URL is guessed. Previously public assets can still exist in third-party/browser caches after unpublishing; publication is a disclosure.

Supported uploads are JPEG, PNG, WebP and PDF up to 4 MB each. Compress images locally before upload. SVG is deliberately excluded. Keep original assets under `public/` in Git; these are already public and are not duplicated in Supabase. Avoid sensitive files in any portfolio uploads.

## Backup and restore

Download the backup from `/admin` after meaningful changes. It includes `content.json` and all Supabase uploaded assets, including unused drafts. Keep a separate copy of the repository, which contains original static assets and the schema migration. Export does not include GitHub OAuth settings, credentials or owner identity records. Store the ZIP privately.

The web export is bounded to 64 MB of assets to avoid excessive server memory. For larger libraries or server execution timeouts, download objects from the `portfolio-assets` bucket through the Supabase Storage dashboard, preserving filenames, and export both `portfolio_draft` and `portfolio_published` records through the table editor. Storage files are not included in a database-only backup. Avoid editing while an export runs: record and file retrieval is sequential and not a database-wide snapshot.

To restore into a fresh project:

1. Apply the migration and configure authentication/owner access as above.
2. Upload every file in the backup's `assets/` folder into `portfolio-assets` at its original filename using the Storage dashboard. Keep the bucket private. Restore the Git repository's `public/` directory separately.
3. In SQL Editor insert `content.json`'s **published.content** as `portfolio_draft.content` at revision 1 (use a SQL JSON parameter or paste JSON using dollar quoting with a delimiter absent from the JSON). Set a temporary authenticated owner identity for the SQL transaction, then call the publication function. Replace the UUID and JSON below:

```sql
begin;
select set_config('request.jwt.claim.sub', 'YOUR-VERIFIED-USER-UUID', true);
select public.save_portfolio_draft($backup$ PASTE_PUBLISHED_CONTENT_OBJECT $backup$::jsonb, 0);
select public.publish_portfolio(1);
commit;
```

4. If the backup also has an unpublished draft, use `save_portfolio_draft` again with **draft.content**, expected revision 1, in the same owner-claim transaction; do not publish it. If no published version exists, restore only the draft using expected revision 0. Revision numbers restart in a fresh project. Never run this recipe over an existing project without exporting it first.
5. Open the editor, inspect records and files, and publish only after checking the preview. Redeploy or publish through the editor to refresh the public cache.

## Availability and free plan limits

Check the current [Supabase pricing](https://supabase.com/pricing) and [Vercel Hobby terms](https://vercel.com/docs/plans/hobby) before setup. Free quotas and availability may change. Supabase can pause inactive free projects and does not provide the same backup guarantees as paid plans. Resume a paused project in its dashboard.

Public text is cached for an hour and refreshed on publish. A failed refresh may retain a previous cached publication; a cold start falls back to the original repository content. Uploaded media still requires Supabase to be available. This is not an always-online guarantee. There is no paid scheduler or artificial keep-alive traffic.

## Verification before live use

Check signed-out and non-owner access cannot read/save drafts, upload, export or publish. Verify a newly uploaded draft URL returns 404 when signed out, becomes readable after publication, and becomes private after removing it and publishing. Test a stale second tab produces a conflict. Add one credential, preview and publish it, then export a ZIP and inspect its JSON/assets. Authentication, RLS and Storage require a real configured project for these checks.
