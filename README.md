# Nowshera Digital Hiring

A local, full-stack applicant tracking system for candidates, assigned recruiters, and hiring admins. It uses a dependency-free Node.js server, SQLite, private PDF storage, role-based API authorization, automatic local email delivery, and optional n8n workflows for Gmail, reminders, and AI-assisted CV summaries.

## Run locally

1. Install Node.js 24 or newer (the project uses Node's built-in `node:sqlite`).
2. In a terminal opened in this folder, set an admin email and a password of at least 10 characters, then start the server:

   **PowerShell**

   ```powershell
   $env:ADMIN_EMAIL = 'admin@example.com'
   $env:ADMIN_PASSWORD = 'change-this-long-password'
   node server.mjs
   ```

3. Open **http://127.0.0.1:3000**. The admin is created once on the first launch. Sign in, invite recruiters, create a job as Draft, assign one or more recruiters and set it to Open. Candidates can create their own accounts.

A fresh local run automatically uses the safe offline summary engine, so the complete application and retry demonstration works without a cloud account. The summary is clearly marked as AI-assisted/demo output. Configure the n8n AI workflow to demonstrate a real Gemini-generated summary.

The application stores its data in `data/recruitment.sqlite`, private CVs in `data/cvs/`, and delivered development email files in `data/mailbox/`. These are created on first run. The entire `data/` directory is ignored by Git and excluded from the submission archive. Keep it private and back it up if you need to retain records. Set `PORT` to use another port. This is a single-company local service bound to `127.0.0.1`.

For evaluator-friendly inspection, `backend/README.md` maps the backend responsibilities, `database/schema.sql` contains the complete database design, and `PROJECT-FILE-MANIFEST.md` explains the specific purpose of every submitted file. These documentation files contain no private runtime records.

## Email delivery

Every application-received, interview, hired, and rejected event is saved once and delivered automatically. With no mail settings, the built-in development mailer creates a standards-readable `.eml` file in `data/mailbox/`, marks the event `delivered-local`, and shows it in the candidate’s **My messages** screen. This makes the full notification workflow work immediately on one computer.

For delivery through an SMTP inbox such as Mailpit, set:

```powershell
$env:SMTP_HOST = '127.0.0.1'
$env:SMTP_PORT = '1025'
$env:SMTP_FROM = 'hiring@nowsheradigital.local'
node server.mjs
```

Open Mailpit's inbox (normally `http://127.0.0.1:8025`) to inspect SMTP messages. The bundled SMTP client is intended for a local plain-SMTP relay and does not implement TLS/STARTTLS. For internet delivery, place a trusted local relay in front of the app. SMTP delivery is at-least-once if the process stops precisely after the server accepts a message but before SQLite records completion; local development delivery is idempotent.

## Rules and privacy

- Candidates can read only their own applications and CVs. Recruiters can read only applications and CVs attached to their assigned jobs. Private notes and AI summaries never appear in candidate responses.
- Passwords use salted scrypt hashes; sessions use random HttpOnly, SameSite=Strict cookies. Login and registration are throttled, field sizes are bounded, expired sessions are cleaned automatically, and security headers protect every response. Set `COOKIE_SECURE=1` when serving through HTTPS.
- Applications retain their uploaded CV version. A partial unique index blocks more than one active application per candidate and job. Withdrawn applicants can apply again while the job remains open; Rejected is final and counts as inactive for the uniqueness rule.
- Stages advance one step at a time. Interview requires a future one-hour booking. The recruiter overlap check is enforced in an immediate SQLite transaction; touching endpoints are allowed.
- Hired and Rejected cannot change. A filled job closes in the hiring transaction; deadline closure is enforced on requests. Other active applications on closed jobs can only be rejected.
- Admins invite recruiters by email; each recruiter chooses their own password through a one-use, seven-day link. Local invitation messages and their setup links can be opened directly from the admin Email outbox. One or more recruiters can be assigned to a job. Recruiters with open jobs cannot be deactivated, and assigned recruiters with future interviews cannot be removed until the interviews are handled.
- Every application starts an independent AI-summary task using the exact CV snapshot and job requirements. The result has a 3–5 bullet profile, mentioned/missing requirements, and three interview questions. Server validation rejects sensitive attributes, scoring, ranking, or decision advice. Failure never blocks applying or email, and authorized reviewers can retry without creating a second email.
- Admins can inspect per-job counts including Withdrawn. AI assists reading but never screens, scores, ranks, recommends, or changes stages. There is no WhatsApp messaging, payroll, or video interview platform.

## Automated verification

Run `node work/test.mjs` and `node work/submission-check.mjs`. The first exercises the full backend in an isolated temporary database; the second checks the submitted UI surfaces, n8n workflows, and responsive assets. The current suite covers 88 backend assertions plus the submission checks, including real invitation activation, multiple recruiter assignment, AI privacy, sensitive-content filtering, failure callbacks, stale-result protection, safe retries, and email deduplication. See `TEST-REPORT.md` for the exact coverage and manual acceptance checklist.

For a judge-ready dataset and five-minute presentation path, follow `DEMO-WALKTHROUGH.md`. The seeding script takes passwords from environment variables and never stores them in source.

## Optional n8n workflows

One importable, self-hosted n8n workflow is included: `nowshera-complete-automation.json`. Its three independent trigger branches handle immediate hiring emails, scheduled 24-hour reminders, and private Gemini CV summaries. Signed success and failure callbacks update only the current AI attempt, preventing stale results from overwriting retries. Gmail OAuth and a Gemini API key are required only for real external automation. See `n8n/README.md` for setup.

## Development note

The `public/` folder contains the responsive frontend. `server.mjs` owns all authorization, validation, database writes and email events. No package installation or cloud account is needed for the local app. The unused bundled website starter files remain in this workspace but are not required to run this local project.
