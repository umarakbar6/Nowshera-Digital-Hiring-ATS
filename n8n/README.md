# Optional n8n automation

The main hiring application remains functional without n8n. One optional workflow, `nowshera-complete-automation.json`, contains three separate trigger branches for Gmail notifications, scheduled reminders, and privacy-safe AI CV summaries. Email falls back locally, and a safe offline summary engine runs by default.

## Local setup

1. Install Docker Desktop once.
2. Choose a private secret of at least 16 characters and set it in PowerShell:

   ```powershell
   $env:N8N_SHARED_SECRET = 'replace-with-a-long-private-secret'
   docker compose -f n8n/docker-compose.yml up -d
   ```

3. Open `http://127.0.0.1:5678`, complete n8n's local owner setup, and import `nowshera-complete-automation.json`.
4. Open **Send Hiring Email with Gmail** and **Send Reminder with Gmail** inside that workflow. Assign the same Gmail OAuth2 credential to both nodes. No Gmail credential or token is stored in the project files.
5. Add `GEMINI_API_KEY` to the n8n environment, then activate the single workflow. Its three triggers operate independently: **Hiring Email Webhook**, **Every 15 Minutes**, and **AI Summary Webhook**. The AI branch reports success or failure and includes a unique attempt ID, so a late result cannot overwrite a retry. Use only made-up CVs for testing.
6. Start the recruitment app with the same secret:

   ```powershell
   $env:ADMIN_EMAIL = 'admin@example.com'
   $env:ADMIN_PASSWORD = 'change-this-long-password'
   $env:N8N_SHARED_SECRET = 'replace-with-a-long-private-secret'
   $env:N8N_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook/nowshera-hiring-email'
   $env:N8N_AI_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook/nowshera-ai-cv-summary'
   node server.mjs
   ```

Create an application or schedule an interview. The execution appears in n8n, Gmail sends the real message, the admin Email outbox shows `delivered-gmail`, and the candidate also sees the notification history in **My messages**.

The Docker setup uses n8n's self-hosted Community Edition and does not require an n8n Cloud subscription. Gmail needs a Google account/OAuth, and Gemini usage follows Google's current API terms and quotas. With no AI variables, the application automatically uses the safe offline demonstration engine; it must not be represented as a live external AI service. Set `AI_PROVIDER=mock` explicitly if desired, or omit all n8n variables for fully dependency-free local email and summary automation.
