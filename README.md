# Ingredi

A five-tab competition demo: cook from your private fridge, discover sample neighbors, share extra food, and join meal swaps. The receipt → review → fridge pipeline uses the existing live backend; community activity is an interactive, clearly labeled local demo.

See [the redesigned demo walkthrough](docs/REDESIGN-DEMO.md) for the three presentation journeys, data boundaries, and verification notes.

## Run

Requires Node.js 22.21.1+ (tested on Node 24). The standalone web preview needs no package installation. The iOS demo uses pinned Capacitor and build dependencies.

```powershell
node scripts/serve.mjs
```

Open http://127.0.0.1:5173. Keep the terminal running.

```powershell
node --test tests/*.test.mjs
node scripts/build.mjs
```

`dist/` is a static frontend build. No hosting service is required for the local demo.

## Competition demo on your MacBook or iPhone

The native Xcode project is in `ios/`. Follow [the Mac/iPhone demo guide](docs/IOS-DEMO.md): install Xcode and Node, install the pinned dependencies, then run `ios:prepare` and `ios:open`. A Simulator or personal-device build is sufficient; no public release or TestFlight is needed. The guide includes the free Apple Account route.

Native receipt capture offers **Take photo**, **Choose Photos**, and **Load demo photo for live AI**. Images still require explicit consent before the existing server-side extraction. The interface is bundled on-device; it does not depend on the Windows preview server. Xcode compilation and physical-camera testing must be completed on the Mac.

For ongoing Windows/Mac development, follow [the GitHub sync workflow](docs/SYNC-WORKFLOW.md). Pull the current source on the Mac, run `ios:prepare`, then run it in Xcode. Pushing code to GitHub alone does not update an installed app or deploy a Supabase function.

## What works

- Home, Cook, Nearby, Message, and My, with phone navigation and a desktop sidebar.
- Recipe search, preference chips, random suggestions, saved recipes, ingredients/steps, and missing-ingredient searches in Nearby.
- Staged manual additions and quick-add chips, plus the existing native receipt capture and editable review flow.
- A sample neighborhood map/list, combined filters, photo posts, drafts, requests, conversations, meal-swap membership, and illustrative impact rewards.
- Community data and photo blobs persist in IndexedDB, separately for each account and the anonymous demo. Reset community activity in **My → Settings** without changing the fridge or sign-in.
- Email/password sign-up and sign-in through Supabase Auth; automatic session refresh.
- Private, per-user receipt uploads (JPEG/PNG/WebP, maximum 6 MB).
- Server-side OpenAI vision extraction with structured output, food-only filtering, ambiguous-line warnings, and validation.
- Review/edit names, quantities, units and optional best-before dates; skip uncertain items.
- Atomic confirmation, row locking and stable receipt line IDs prevent duplicate inserts when confirmation is retried.
- Supabase fridge loading, manual additions, date edits and removal.
- Six bundled demo recipes, merged with the account-loaded collection by name and matched using explicit ingredient aliases.
- A preset sample receipt uses the same deployed backend save flow when signed in.
- A separate, clearly labeled local sample mode works without Auth, AI, or network access. It stores data on this device and does not claim to be AI or Supabase persistence.

## One-time demo setup

1. Open the app. Choose **Sign in → Create an account**, confirm the Supabase email, then sign in. Never put passwords in source or chat.
2. If the confirmation email redirects to the wrong address, set the [Auth Site URL](https://supabase.com/dashboard/project/hdclurdjuziprukiuamq/auth/url-configuration) to `http://127.0.0.1:5173`. Return to the preview and sign in after confirming.
3. Add `OPENAI_API_KEY` in [Edge Function Secrets](https://supabase.com/dashboard/project/hdclurdjuziprukiuamq/functions/secrets). **Do not** add it to `.env`, frontend code, or Git. Optional server-only `OPENAI_MODEL` defaults to `gpt-4.1-mini`.
4. Scan a receipt, check the OpenAI transfer consent box, then choose **Read my receipt**. The [synthetic receipt](public/sample-receipt.png) is useful for practice and has no personal data.

The API key is not needed for **Use the sample receipt**. In signed-in mode that still creates a real `receipt_scans` row and confirms real `pantry_items` rows. Live failure never silently substitutes preset extraction.

## Connected infrastructure

- Project: `Ingredi` / `hdclurdjuziprukiuamq` in `us-east-2`.
- [Dashboard](https://supabase.com/dashboard/project/hdclurdjuziprukiuamq)
- [Table editor](https://supabase.com/dashboard/project/hdclurdjuziprukiuamq/editor)
- Private `receipts` bucket with owner-only INSERT/SELECT/DELETE; no overwrite policy.
- `scan-receipt` Edge Function authenticates every request using Auth `/user`, including capability probes. Gateway JWT verification is disabled to support current signing keys; **handler authentication is mandatory**. Anonymous accounts are rejected.
- Existing six tables were preserved. The original migration was recovered from Supabase history, and both new incremental migrations were applied to the connected project. Local migration versions match the recorded remote versions; no existing migration needs to be reapplied.
- Three demo recipes are seeded; the application does not award impact points.

`public/config.js` contains only the project URL and **public publishable key**. These are intentionally public and are protected by RLS and column grants. Optional overrides use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` when launching the development server. `.env.example` is documentation; launch with `node --env-file=.env scripts/serve.mjs` if you use an ignored `.env` file for public settings.

## Security and tests

- All six public tables keep RLS enabled.
- Clients can write only allowed profile fields; reward counters cannot be forged on INSERT or UPDATE.
- Scan rows and receipt linkage are server-controlled. The public confirmation RPC delegates to a private function that checks `auth.uid()`, ownership, scan status and every selected item before committing atomically.
- Unauthenticated users cannot execute confirmation. Cross-account data reads/writes and cross-account confirmation are blocked.
- Uploads enforce MIME, byte size and file signatures. The browser also checks image decoding. Live requests require explicit photo-transfer consent at the API boundary.
- No user receipt contents, provider errors, session tokens, or server credentials are logged. OpenAI requests use `store: false`.
- Files remain in the private bucket; automatic retention cleanup is outside this MVP. Do not upload receipts with personal details you do not want processed.
- Scanner has a basic 20-scan/hour check per account; it is intended for a controlled hackathon demo, not public high-traffic use.

`tests/` contains 39 automated tests: the original 25 extraction/domain/native tests plus 14 for community persistence, identity separation, filtering, drafts/photos, group capacity, message behavior, reward retries, reset boundaries, recipe discovery, and route parsing. Repository tests use a transactional storage double; browser walkthroughs exercise real IndexedDB. `supabase/tests/security.sql` contains 10 real Postgres tests, all wrapped in a transaction that rolls back its synthetic fixtures. Use the Supabase SQL editor or connected SQL tool to run it; do not copy test fixtures into production data.

OpenAI errors distinguish API quota/billing failures from temporary rate limits, overload, invalid credentials and model access. Only allowlisted error codes, HTTP status and request IDs are saved in the scan metadata; raw provider messages and keys are never saved. Billing errors require account action and are not automatically retried. Temporary rate limits display the provider's retry interval when available.

The Node Edge tests stub Auth, Storage, database and OpenAI HTTP responses. A separate signed-in browser test successfully completed a real OpenAI extraction of the synthetic receipt: 7 food candidates, 3 non-food products skipped, 6 reviewed items saved and retained after refresh. Replaying confirmation returned the same 6 saved items without duplicates. See [demo instructions and current validation](docs/DEMO.md).

The latest Supabase advisor reports one Auth setting warning: [leaked-password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The database grant/RLS and confirmation checks passed; this account setting remains a production hardening step.

## Source map

- `public/`: static browser app, styles, public config and shared domain logic.
- `public/features/`: kitchen/community views and the existing receipt/auth flows adapted to the new shell.
- `public/lib/`: navigation, shared UI/illustrations, recipe discovery, kitchen access, and the account-scoped community repository.
- `ios/`: generated Xcode demo project with the Capacitor camera plugin and permission descriptions.
- `supabase/functions/scan-receipt/`: server-only image extraction pipeline.
- `supabase/migrations/`: incremental changes applied to the existing project.
- `supabase/tests/security.sql`: disposable, rolled-back backend security tests.
- `scripts/`: zero-dependency preview/build; optional synthetic receipt generator.

If changing `public/lib/domain.mjs`, copy it to `supabase/functions/scan-receipt/domain.mjs`; a test prevents the two versions drifting. Redeploy the function after server changes using the Supabase connector or authenticated CLI. Never place an admin API key in this repository.

Implementation references: [Supabase Auth in Edge Functions](https://supabase.com/docs/guides/functions/auth-legacy-jwt), [private bucket restrictions](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [OpenAI image input](https://developers.openai.com/api/docs/guides/images-vision), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
