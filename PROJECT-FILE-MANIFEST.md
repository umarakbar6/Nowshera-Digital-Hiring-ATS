# Project file manifest

Every submitted file has a defined purpose. Runtime candidate data is intentionally not part of the submission.

## Application

| File | Purpose |
|---|---|
| `server.mjs` | Complete dependency-free backend, API, database initialization, authentication, authorization, automation, and static-file server. |
| `backend/README.md` | Backend architecture and responsibility map. |
| `database/schema.sql` | Human-readable final SQLite schema, constraints, indexes, and relationships. |
| `database/README.md` | Database lifecycle, WAL explanation, and privacy policy. |
| `public/index.html` | Browser document, metadata, stylesheets, and application entry point. |
| `public/app.js` | Candidate, recruiter, and admin frontend behavior and API integration. |
| `public/style.css` | Core responsive layout and component styling. |
| `public/theme.css` | Visual theme, dashboard, AI-summary, invitation, and mobile refinements. |
| `public/favicon.svg` | Local vector browser icon. |

## Automation

| File | Purpose |
|---|---|
| `n8n/nowshera-complete-automation.json` | Single workflow with separate hiring-email webhook, reminder schedule, and AI-summary webhook trigger branches. |
| `n8n/docker-compose.yml` | Local self-hosted n8n service configuration. |
| `n8n/README.md` | n8n, Gmail, Gemini, secrets, and activation instructions. |

## Verification and demonstration

| File | Purpose |
|---|---|
| `work/test.mjs` | Isolated automated backend acceptance suite for the updated 14-case brief. |
| `work/submission-check.mjs` | UI, workflow, privacy, schema, and packaging checks. |
| `work/demo-seed.mjs` | Creates fictional judge-ready demonstration records using environment-supplied passwords. |
| `TEST-REPORT.md` | Verified coverage and manual acceptance checklist. |
| `DEMO-WALKTHROUGH.md` | Five-minute presentation and demo-account procedure. |
| `README.md` | Primary installation, operation, architecture, privacy, and automation guide. |
| `.gitignore` | Prevents runtime databases, CVs, email files, secrets, logs, and editor files from being committed. |

## Generated runtime files—not submitted

| Path | Purpose |
|---|---|
| `data/recruitment.sqlite*` | Live SQLite database and WAL/shared-memory side files. |
| `data/cvs/` | Private uploaded CV snapshots. |
| `data/mailbox/` | Local development email delivery. |
