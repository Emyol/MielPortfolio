# Security

> The security baseline for this project. Every agent and contributor applies it when writing, reviewing, or deploying code.
> **Part A** is project-specific: fill it in when the project is created and keep it current. **Part B** is the universal baseline, applied in full unless Part A records a justified exception.
> This file never contains real secrets, keys, tokens, internal URLs with credentials, or personal data.

---

# Part A: Project security profile

## A1. Assets and data classification
| Data / asset | Classification | Where stored | Who can access |
|--------------|----------------|--------------|----------------|
| Published portfolio content (text, name, contact details the owner chose to publish) | Public | `portfolio_published` (Supabase), fallback `lib/content/seed.json` | Anyone |
| Draft portfolio content | Internal | `portfolio_draft` (Supabase) | Owner only (RLS via `is_portfolio_owner()`) |
| Uploaded assets (JPEG, PNG, WebP, PDF) | Internal until published, then Public | Private Storage bucket `portfolio-assets`; allowlist in `published_assets` | Owner; anonymous only for names in `published_assets` |
| Owner allowlist | Confidential | `admin_users` (Supabase) | Each user sees only their own row; changed only through the Supabase dashboard |
| Owner session cookies | Restricted | Browser cookies set by `@supabase/ssr` | The signed-in owner |
| GitHub OAuth client secret | Restricted | Supabase Auth settings only (never in this repo or Vercel) | Supabase project admins |
| Supabase URL and publishable key | Public by design (`NEXT_PUBLIC_`) | `.env.local`, Vercel env | Anyone (ships to the browser) |
| Admin backup ZIP (`/api/admin/export`) | Internal (includes unpublished drafts and assets) | Wherever the owner saves it | Owner |

_Filled 2026-11-15 from `docs/admin-setup.md`, `supabase/migrations/`, `proxy.ts`, and the API routes. Read from code and docs; not tested against a live project by the session that wrote it._

Classes: **Public** · **Internal** · **Confidential** (PII, business data) · **Restricted** (credentials, payment data, health data, secrets).

## A2. Trust boundaries and attack surface
- Entry points: public page `/` (plus `robots`, `sitemap`); `/api/media/[name]` (anonymous asset reads); `/auth/login`, `/auth/callback`, `/auth/logout`; `/admin` and `/admin/preview`; `/api/admin/content`, `/api/admin/publish`, `/api/admin/upload` (file upload), `/api/admin/export`.
- Third parties: Supabase (Postgres, Auth, Storage), GitHub (OAuth identity provider), Vercel (hosting), Google Fonts if fonts are loaded remotely (not checked).
- Privileged paths: the admin editor and `/api/admin/*`, gated by `requireOwner()` in `lib/supabase/server.ts`; `security definer` SQL functions for saving and publishing. No service-role key is used anywhere, by design.

## A3. Threat model (STRIDE quick pass)
| Threat | Where it applies here | Mitigation | Status |
|--------|----------------------|------------|--------|
| **S**poofing | Someone signs in with their own GitHub account and tries to act as the owner | GitHub OAuth through Supabase; only UUIDs in `admin_users` pass `is_portfolio_owner()`; exact redirect URLs, no production wildcards | In place (per docs; not tested here) |
| **T**ampering | Draft or published content changed by a non-owner, or a stale tab overwriting newer work; cross-site requests to `/api/admin/*` | RLS on every table; writes only through owner-checked `security definer` functions; optimistic revision check on save; `sameOrigin()` check on admin POSTs | In place (read from code) |
| **R**epudiation | Who published what, and when | Single owner; no audit log of saves or publishes | Gap, accepted for a one-owner site |
| **I**nformation disclosure | Draft text or unpublished uploads read by guessing a URL; secrets leaking to the client | Public reads never select drafts; Storage bucket is private and anonymous reads are limited to `published_assets`; uploads get random UUID names; `Cache-Control: private, no-store` and `noindex` on admin paths (`proxy.ts`); only publishable keys are `NEXT_PUBLIC_` | In place. Publishing is a disclosure: published files may persist in caches |
| **D**enial of service | Upload abuse, large exports, anonymous traffic to `/api/media` | 4 MB upload cap and type allowlist with magic-byte checks; export bounded to 64 MB; public content cached for an hour. No app-level rate limiting; relies on Vercel and Supabase platform limits | Partial |
| **E**levation of privilege | An authenticated non-owner reaching admin functions | Deny by default: every admin route calls `requireOwner()`; SQL functions re-check ownership and set `search_path = ''` | In place (read from code) |

**Open gap:** `next.config.mjs` sets no security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`), so Part B §B5 is not met yet. `Portfolio.jsx` uses `dangerouslySetInnerHTML` for JSON-LD with `<` escaped; a nonce-based CSP would need to allow that script.

## A4. Stack-specific controls
- **Supabase RLS:** enabled on `admin_users`, `portfolio_draft`, `portfolio_published`, `published_assets`, and on `storage.objects` for the `portfolio-assets` bucket (`supabase/migrations/202610120001_portfolio.sql`). Any new table needs RLS and explicit policies in the same migration.
- **Publishing:** one transaction copies the saved draft revision and its asset allowlist (`publish_portfolio`); `202610180001_publish_safeupdate.sql` keeps it working under Supabase's safe-update guard.
- **Keys:** only the publishable (or legacy anon) key is used. A service-role key must never be added to this project's env.
- **Next.js:** `proxy.ts` (this version's middleware) refreshes the owner session and marks `/admin` and `/api/admin` responses private and non-indexed. Admin route handlers run on the Node runtime.
- **Image optimizer:** `/_next/image` accepts only the static images under `/projects/` and `/certificates/` (no query or `?v=1` to `?v=22`) and `/hero-profile.png`, via `images.localPatterns` in `next.config.mjs`, so it cannot be pointed at arbitrary paths, uploaded media or endless query variants.
- **Uploads:** JPEG, PNG, WebP, PDF only; SVG is deliberately excluded; contents are checked against their declared type; stored under server-generated names.
- **Env files:** `.env` and `.env*.local` are git-ignored; `.env.example` holds names only.
- **Redesign note:** the planned UI redesign is front-end only. If it adds content fields (for example practice-to-Work relations), they go through `lib/content/model.ts` validation and the existing save/publish path.

## A5. Accepted exceptions
| Rule (Part B §) | Exception | Reason | Compensating control | Review by |
|-----------------|-----------|--------|----------------------|-----------|

## A6. Security contacts and incident notes
- Owner: the site owner (sole maintainer and sole admin user).
- Where to report: a private message to the owner, or a private GitHub security advisory on the repository. Do not open a public issue for a vulnerability.
- Past incidents: none recorded.

---

# Part B: Universal baseline

## B1. Secrets and credentials
- Keep secrets in environment variables or a secret manager. Commit a `.env.example` with **names only**.
- `.gitignore` covers `.env*` (except `.env.example`), key files (`*.pem`, `*.key`, `*.p12`), credential JSON, and local DB dumps, from the very first commit.
- Keep server-only secrets out of client bundles. Only intentionally public values use client prefixes (`NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`). Service-role, admin, and private API keys stay server-side.
- Before every commit, scan the diff for secrets (`gitleaks`, `git-secrets`, or `trufflehog`); add a pre-commit hook where the project allows.
- A leaked secret gets **rotated immediately**: deleting it from history does not un-leak it.
- Give each environment (dev / preview / prod) its own credentials, scoped to least privilege.

## B2. Authentication
- Use a proven auth provider or library; write no custom crypto or session schemes.
- Hash passwords with **Argon2id** (or bcrypt cost ≥ 12 / scrypt). Never store or log plaintext.
- Offer MFA for privileged accounts; support passkeys/WebAuthn where practical.
- Sessions: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict` cookies; rotate the session ID on login and privilege change; enforce idle and absolute timeouts; server-side logout invalidation.
- Tokens: short-lived access tokens, rotating refresh tokens, verify signature, `exp`, `aud`, and `iss`; reject `alg: none`.
- Rate-limit and lock out progressively on login, signup, password reset, and OTP endpoints. Use generic error messages ("invalid credentials") to prevent account enumeration.
- Reset tokens and magic links: single-use, short expiry, high entropy, stored hashed.

## B3. Authorization
- **Deny by default.** Every endpoint, server action, RPC, and query checks authorization **server-side**; client checks are UX only.
- Check object ownership on every access to prevent IDOR (`WHERE owner_id = current_user`).
- Database-level enforcement where available (e.g. Postgres/Supabase **Row Level Security enabled on every table**, with explicit policies; no table left open to `anon`).
- Least privilege for users, service accounts, API keys, CI tokens, and cloud IAM roles.
- Admin functions live behind separate role checks and are audit-logged.

## B4. Input handling and injection
- Validate all input at trust boundaries with a schema (Zod, Pydantic, Joi, etc.): type, length, format, range, allow-lists over deny-lists.
- **SQL:** parameterised queries or a safe ORM only; no string-built SQL.
- **XSS:** rely on framework auto-escaping; avoid `dangerouslySetInnerHTML` / `v-html` / `innerHTML`; sanitise with DOMPurify when HTML is unavoidable.
- **Command injection:** avoid shelling out; when necessary, pass argument arrays, never interpolated strings.
- **Path traversal:** resolve and verify paths stay inside an allowed base directory.
- **SSRF:** allow-list outbound hosts for any user-influenced URL; block private/link-local/metadata IP ranges.
- **Deserialisation:** never unpickle / `eval` / `yaml.load` untrusted data; use safe loaders.
- **Mass assignment:** map request fields explicitly onto models.
- **Open redirects:** redirect only to allow-listed or relative paths.

## B5. Web and API protections
- HTTPS everywhere; HSTS (`max-age=63072000; includeSubDomains; preload`) in production.
- Security headers: `Content-Security-Policy` (nonce- or hash-based, no `unsafe-inline` scripts), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'` (or a specific allow-list).
- CORS: explicit origin allow-list; never `*` together with credentials.
- CSRF protection for cookie-authenticated state-changing requests (SameSite plus tokens or origin checks).
- Rate limiting and request size limits on all public endpoints; pagination caps on list endpoints.
- Return generic errors to clients; keep stack traces and internals in server logs.
- Webhooks: verify signatures, check timestamps to block replays, process idempotently.

## B6. File uploads
- Validate type by content (magic bytes), not just extension or `Content-Type`; enforce size limits.
- Store outside the web root or in object storage with private buckets and signed, expiring URLs.
- Rename files to random IDs; strip metadata from images where privacy matters; scan for malware where risk warrants.

## B7. Cryptography
- TLS 1.2+ in transit; AES-256-GCM (or the platform KMS) at rest for Restricted data.
- Use vetted libraries and the platform CSPRNG (`crypto.randomBytes`, `secrets`); never `Math.random()` for security.
- Keys live in a KMS/secret manager with a rotation plan.

## B8. Dependencies and supply chain
- Commit lockfiles and install with frozen lockfiles in CI (`npm ci`, `pnpm i --frozen-lockfile`, `pip install --require-hashes`).
- Before adding a package, check: maintenance activity, download count, typosquat-like names, install scripts, and licence.
- Run `npm audit` / `pip-audit` / `osv-scanner` regularly and in CI; enable Dependabot or Renovate.
- Pin GitHub Actions to commit SHAs; give workflow tokens minimal `permissions:`.
- Pin container base images by digest; run as a non-root user; use minimal images.

## B9. Data protection and privacy
- Collect the minimum data needed; define retention periods and delete on schedule.
- Mask PII in logs, analytics, and error reports; never log passwords, tokens, full card numbers, or session IDs.
- Back up databases with encryption, and test restores.
- Honour applicable regulations (e.g. GDPR, Philippine Data Privacy Act, CCPA): consent, access, and deletion requests.

## B10. Logging, monitoring, and incident response
- Log security events: logins (success and failure), permission denials, admin actions, password and MFA changes, and key usage, with timestamp, actor, IP, and request ID.
- Protect logs from tampering and from containing secrets.
- Alert on anomalies (auth-failure spikes, unusual data exports).
- Incident steps: **contain → rotate credentials → assess scope → fix root cause → notify where required → record in A6.**

## B11. AI / LLM features (when present)
- Treat all model input that includes user content, retrieved documents, web pages, or tool output as **untrusted** (prompt injection).
- Keep secrets and other users' data out of prompts; enforce authorization before retrieval, not after.
- Give model-invoked tools least privilege; require human confirmation for destructive or outward-facing actions.
- Validate and encode model output before rendering it as HTML, running it as code or SQL, or passing it to a shell.
- Cap tokens, cost, and request rate per user.

## B12. Mobile and desktop clients (when present)
- Store tokens in Keychain / Keystore / OS credential vault, not plain storage.
- Ship no secrets in the app binary: anything shipped is public.
- Use certificate pinning for high-risk apps; disable debug flags and verbose logging in release builds.

## B13. Infrastructure and deployment
- Separate dev / preview / production environments and data; preview deployments get no production secrets.
- Protect the main branch: required reviews and passing checks before merge.
- Close unused ports; require auth on admin and database consoles; disable default credentials.
- Use infrastructure as code where possible, reviewed like application code.

---

## Pre-commit / pre-deploy checklist
Run through this before every commit that touches auth, data access, input handling, dependencies, config, or deployment, and before every production deploy:

- [ ] No secrets, keys, or personal data in the diff or the client bundle
- [ ] New inputs validated with a schema at the trust boundary
- [ ] Every new endpoint/action/query has a server-side authorization check (and RLS where applicable)
- [ ] No string-built SQL, shell commands, HTML, or file paths from user input
- [ ] New dependencies vetted; lockfile updated; audit clean or exceptions recorded in A5
- [ ] Errors returned to clients are generic; sensitive data stays out of logs
- [ ] Security headers, CORS, and rate limits are intact
- [ ] Part A updated if the attack surface, data, or stack changed
- [ ] Security-relevant changes noted in `current-state.md`

## Review cadence
- Re-check Part A whenever a feature adds a new entry point, data class, or third party.
- Full pass over Part B before each production release, and at least monthly on active projects.
