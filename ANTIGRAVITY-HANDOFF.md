# Nowshera Digital Hiring — continuation handoff

## What this project is

This is a complete local applicant-tracking system for candidates, assigned recruiters, and administrators. The official application is the dependency-free Node.js + SQLite implementation:

- `server.mjs` — backend, REST API, security, business rules, SQLite migrations, email outbox, and AI callbacks.
- `public/` — responsive frontend used by all three roles.
- `database/schema.sql` — complete database design.
- `n8n/nowshera-complete-automation.json` — single n8n workflow with three independent trigger branches.
- `work/test.mjs` — isolated backend acceptance suite (88 checks).
- `work/submission-check.mjs` — UI and submission verification.

The React/Sites starter files under `app/`, `components/`, and related folders are not the official ATS runtime. Do not replace the `public/` frontend with that starter. Run the ATS with `node server.mjs`.

## Verified status

- 88 backend checks passed.
- Submission/UI checks passed.
- 115 submitted files were checked; none were empty.
- All 14 updated AI Skool test cases are covered by the local implementation and tests.
- The n8n Cloud workflow is published at the URL recorded in `PRIVATE-CREDENTIALS.env`.
- Gmail OAuth is selected on both Gmail nodes in n8n Cloud.
- A Gemini Header Auth credential is attached to the Gemini HTTP Request node.
- The public-tunnel integration is the only unfinished live test. Cloudflare temporary allocation timed out; Localtunnel returned HTTP 408 to n8n Cloud even though it worked locally.

## Run locally

Install Node.js 24 or newer, open a terminal in this folder, and run:

```powershell
$env:ADMIN_EMAIL = 'admin@example.com'
$env:ADMIN_PASSWORD = 'choose-a-password-of-at-least-10-characters'
node server.mjs
```

Open `http://127.0.0.1:3000`.

The database is created automatically at `data/recruitment.sqlite`. Private CVs and local email files are stored under `data/`. Runtime `data/` is intentionally excluded from the handoff package because it can contain private information. A clean database is created on first launch.

## Run the verification

```powershell
node work/test.mjs
node work/submission-check.mjs
```

Expected results:

```text
88 checks passed
Submission UI checks passed.
```

## n8n workflow layout

One workflow contains three trigger branches:

1. `Hiring Email Webhook` → validation → Gmail → delivery confirmation → webhook response.
2. `Every 15 Minutes` → claim due reminders → split items → Gmail → delivery confirmation.
3. `AI Summary Webhook` → validation → private CV context → Gemini → validate/prepare result → signed callback.

Production webhook paths:

```text
https://YOUR_N8N_HOST/webhook/nowshera-hiring-email
https://YOUR_N8N_HOST/webhook/nowshera-ai-cv-summary
```

Website callback endpoints:

```text
POST /api/automation/complete
POST /api/automation/reminders/claim
GET  /api/automation/ai/context/:applicationId
POST /api/automation/ai/success
POST /api/automation/ai/failure
```

Every callback must include `X-Automation-Secret` with exactly the same value as `N8N_SHARED_SECRET` used by the website.

## Start the website in n8n mode

Use a stable public HTTPS URL. A temporary tunnel is acceptable for a demonstration, but it must reach the same port used below.

```powershell
$env:N8N_SHARED_SECRET = 'use-the-value-from-PRIVATE-CREDENTIALS.env'
$env:N8N_WEBHOOK_URL = 'https://YOUR_N8N_HOST/webhook/nowshera-hiring-email'
$env:N8N_AI_WEBHOOK_URL = 'https://YOUR_N8N_HOST/webhook/nowshera-ai-cv-summary'
$env:AI_PROVIDER = 'n8n'
$env:PORT = '3000'
node server.mjs
```

Then replace every ATS base URL in the imported n8n workflow with the stable public HTTPS URL and publish a new workflow version.

## n8n credentials

### Gmail

Both Gmail nodes use a credential named `Gmail account`. OAuth tokens are account-bound and intentionally cannot be exported in a workflow JSON. Reconnect the user's Google account if moving to a different n8n instance.

### Gemini

`Generate Summary with Gemini` uses:

```text
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
Authentication: Generic Credential Type
Generic Auth Type: Header Auth
Header name: x-goog-api-key
Header value: stored in PRIVATE-CREDENTIALS.env
```

The API key was posted in a chat and should be rotated after migration. Never commit `PRIVATE-CREDENTIALS.env`.

## Exact next steps for Antigravity

1. Extract the handoff ZIP.
2. Read this file, `README.md`, `TEST-REPORT.md`, and `n8n/README.md`.
3. Run both verification commands before changing anything.
4. Start the ATS locally and confirm `http://127.0.0.1:3000` loads.
5. Import `n8n/nowshera-complete-automation.json` if continuing on a new n8n instance; otherwise open the existing published workflow URL.
6. Reconnect Gmail OAuth if necessary and create Gemini Header Auth using the private credential file.
7. Configure one stable HTTPS tunnel or deployment URL to the ATS. Do not point n8n at `127.0.0.1`.
8. Put the same automation secret in the website process and all n8n validation/header fields.
9. Publish the workflow.
10. Test with fictional data only: one application email, one due reminder, and one made-up PDF CV AI summary.
11. Verify the application row changes from AI `pending` to `ready`, and verify Gmail messages arrive once.
12. Rotate the Gemini key and automation secret after the handoff test.

## Known live-test history

- Cloudflare quick tunnel previously worked, then later timed out allocating a replacement.
- Localtunnel URL `https://tricky-bobcats-tie.loca.lt` reached the ATS from the local computer but n8n Cloud received HTTP 408.
- The n8n workflow is published, but do not treat either temporary tunnel URL as permanent.
- The live email and reminder execution still require a user-approved recipient address.
- The Gemini workflow reached `Get Private CV Context` but stopped at the Localtunnel HTTP 408, before sending the fictional CV to Gemini.

## Scope reminder

The updated brief explicitly excludes real WhatsApp/SMS messaging, job-board posting, video interviews, payroll, offer-letter signing, a native mobile app, and multiple companies. Do not add these as required features.
